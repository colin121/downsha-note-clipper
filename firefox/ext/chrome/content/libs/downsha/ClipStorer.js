/**
 * @author: chenmin
 * @date: 2011-08-30
 * @desc: store notes into local file before sending to server.
 * notes are stored in the directory of firefox running profile. 
 * C:\Users\abc\AppData\Roaming\Mozilla\Firefox\Profiles\*.dev\downshaclips\
 */

(function() {
	var LOG = null;	
	Downsha.getClipStorer = function() { // return the singleton of context object
		if (Downsha._clipStorer == null)
			Downsha._clipStorer = new Downsha.ClipStorer();
		return Downsha._clipStorer;
	};
	Downsha.__defineGetter__("clipStorer", Downsha.getClipStorer);
	
	Downsha.ClipStorer = function ClipStorer() {
		LOG = Downsha.Logger.getInstance();
	};
	
	Downsha.ClipStorer.CLIPPER_FOLDER_NAME = "downshaclips"; // application folder
	Downsha.ClipStorer.SENT_EXT = ".sent"; // file extension specifies already sent to the server
	Downsha.ClipStorer.NOTE_MATCHER = new RegExp("^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$"); // infoItem guid rule			

	Downsha.ClipStorer.prototype.init = function() {
		var dir = this.getProfileDir_();
		dir.append(this.constructor.CLIPPER_FOLDER_NAME);
		
		if (!dir.exists()) { // create application folder if not exists
			dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 511);
		}
		var self = this;
		var notes = this.loadNotes_(dir, function(name) { // load remainder files without '.sent' extension.
			return ((name.indexOf(self.constructor.SENT_EXT) == -1) && (name.match(self.constructor.NOTE_MATCHER)));
		});
		if (notes.length > 0) {
			LOG.debug("ClipStorer.init load " + notes.length + " unsent notes from path: " + dir.path);
			Downsha.queueProcessor.onStart(notes); // add notes guid list to queue processor to send to server
		}
	};
	
	Downsha.ClipStorer.prototype.getProfileDir_ = function() {
		return Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
	};	
	
	Downsha.ClipStorer.prototype.loadNotes_ = function(file, accepted) {
		var entries = file.directoryEntries;
		var array = [];
		while (entries.hasMoreElements()) {
			var entry = entries.getNext();
			entry.QueryInterface(Components.interfaces.nsIFile);
			LOG.debug("Add infoItem with guid " + entry.leafName);
			if (accepted(entry.leafName)) {
				array.push({guid : entry.leafName});
			} else {
				this.deleteNote(entry.leafName); //already sent to the server, just delete it
			}
		}
		return array;
	};
	
	Downsha.ClipStorer.prototype.deleteNote = function(guid) {
		var notePath = this.getNotePath_(guid);
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(notePath);
		if (file.exists()) {
			file.remove(false);
		} else {
			file.initWithPath(this.getNotePath_(this.getSentNoteName_(guid)));
			if (file.exists()) {
				file.remove(false);
			}
		}
	};
	
	Downsha.ClipStorer.prototype.markNoteAsSent = function(guid) { // add '.sent' suffix to mark as sent
		this.renameNoteFile_(guid, this.getSentNoteName_(guid));
	};
	
	Downsha.ClipStorer.prototype.unmarkNoteAsSent = function(guid) { // remove '.sent' suffix to mark as unsent
		this.renameNoteFile_(this.getSentNoteName_(guid), guid);
	};
	
	Downsha.ClipStorer.prototype.renameNoteFile_ = function(oldName, newName) {
		var notePath = this.getNotePath_(oldName);
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(notePath);
		if (file.exists()) {
			file.moveTo(null, newName);
		}
	};
	
	Downsha.ClipStorer.prototype.getSentNoteName_ = function(noteName) {
		return noteName + this.constructor.SENT_EXT;
	};
	
	Downsha.ClipStorer.prototype.saveNote = function(guid, infoItem) {
		var stream = this.openOutputStream_(guid);
		this.writeData_(stream, infoItem.toStorable()); // JSON.stringify
		this.closeStream_(stream);
	};
	
	Downsha.ClipStorer.prototype.loadNote = function(guid) {
		var stream = this.openInputStream_(guid);
		var infoItem = new Downsha.DownshaInfo(this.readData_(stream));
		this.closeStream_(stream);
		return infoItem;
	};
	
	Downsha.ClipStorer.prototype.getNotePath_ = function(fileName) {
		return this.getNoteDirPath() + Downsha.Constants.SLASH + fileName;
	};
	
	Downsha.ClipStorer.prototype.getNoteDirPath = function() {
		var profileDir = this.getProfileDir_().path;
		return profileDir + Downsha.Constants.SLASH  + this.constructor.CLIPPER_FOLDER_NAME;
	};
	
	Downsha.ClipStorer.prototype.openInputStream_ = function(fileName) {
		var noteFileName = this.getNotePath_(fileName);
		
		LOG.debug("Loading infoItem from file " + noteFileName);
		
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(noteFileName);
		
		var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);
		
		fiStream.init(file, -1, 0, 0);
		
		var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
		createInstance(Components.interfaces.nsIConverterInputStream);
		
		cstream.init(fiStream, "UTF-8", 0, 0);
		return cstream;
	};	
	
	Downsha.ClipStorer.prototype.openOutputStream_ = function(fileName) {
		var noteFileName = this.getNotePath_(fileName);
		
		LOG.debug("Save infoItem to file " + noteFileName);
		
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(noteFileName);
		
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
		createInstance(Components.interfaces.nsIFileOutputStream);
		
		// use 0x02 | 0x20 to open file and truncate content.
		foStream.init(file, 0x02 | 0x08 | 0x10, 438, 0);
		// write, create, truncate
		
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
		createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		return converter;
	};
	
	Downsha.ClipStorer.prototype.readData_ = function(stream) {
		var data = "";
		var str = {};
		var read = 0;
		do {
			read = stream.readString(0xffffffff, str); // read as much as we can and put it in str.value
			data += str.value;
		} while (read != 0);
		try {
			return JSON.parse(data);
		} catch(e) {
			return null;
		}
	};
	
	Downsha.ClipStorer.prototype.writeData_ = function(stream, data) {
		stream.writeString(JSON.stringify(data));
		stream.flush();
	};
	
	Downsha.ClipStorer.prototype.closeStream_ = function(stream) {
		stream.close();
	};
})();
