/**
 * @author: chenmin
 * @date: 2012-08-17
 * @desc: data model 
 */
 
Downsha.DownshaModel = function DownshaModel(obj) {
  this.initialize(obj);
};
Downsha.mixin(Downsha.DownshaModel, Downsha.DefiningMixin);

/**
 * Deferred intialization
 */
Downsha.DownshaModel.prototype.initialize = function(obj) {
  if (obj != null && typeof obj == 'object') {
    for ( var i in obj) {
      var methName = "set" + (i.substring(0, 1).toUpperCase()) + i.substring(1);
      if (typeof this[methName] == 'function') {
        this[methName].apply(this, [ obj[i] ]);
      } else if (typeof this[i] != 'undefined') {
        try {
          this[i] = obj[i];
        } catch (e) {
        }
      }
    }
  }
};

/**
 * Answers object containing "storable" data.
 */
Downsha.DownshaModel.prototype.toStorable = function(prefix) {
  var storable = {};
  var params = this.getStorableProps();
  prefix = (typeof prefix == 'string') ? prefix : "";
  for ( var i = 0; i < params.length; i++) {
    if (typeof this[params[i]] != 'undefined' && this[params[i]] != null)
      storable[prefix + params[i]] = this[params[i]];
  }
  return storable;
};
/**
 * toStorable uses this to retrieve names of fields of an instance that are
 * storable.
 */
Downsha.DownshaModel.prototype.getStorableProps = function() {
  var params = new Array();
  for ( var i in this) {
    if (this[i] != null
        && i.indexOf("_") != 0 // avoid private props
        && i != "modelName"
        && (typeof this[i] == 'string' || typeof this[i] == 'number' || typeof this[i] == 'boolean'))
      params.push(i);
  }
  return params;
};
Downsha.DownshaModel.prototype.toJSON = function() {
  return this.toStorable();
};

Downsha.DownshaMime = {
	getMimeId : function(mime) {
		if (typeof mime == "string" && mime != "" && typeof Downsha.DownshaMime.TABLE[mime] != "undefined") {
			return Downsha.DownshaMime.TABLE[mime];
		}
		return 0;
	}
};

Downsha.DownshaMime.TABLE = {
	"application/dsml"              : 5002,
	"image/gif"                     : 2000,
	"image/jpeg"                    : 2010,
	"image/pjpeg"                   : 2015,
	"image/jpg"                     : 2016,
	"image/png"                     : 2020,
	"image/x-png"                   : 2022,
	"image/bmp"                     : 2030,
	"image/x-bmp"                   : 2031, 
	"image/icon"                    : 2070,
	"image/x-icon"                  : 2071,
	"image/tiff"                    : 2090,
	"application/x-shockwave-flash" : 4440
};

Downsha.DownshaTerm = function DownshaTerm(obj) {
  this.__defineSetter__("osName", this.setOSName);
  this.__defineGetter__("osName", this.getOSName);
  this.__defineSetter__("osVersion", this.setOSVersion);
  this.__defineGetter__("osVersion", this.getOSVersion);
  this.__defineSetter__("browserName", this.setBrowserName);
  this.__defineGetter__("browserName", this.getBrowserName);
  this.__defineSetter__("browserVersion", this.setBrowserVersion);
  this.__defineGetter__("browserVersion", this.getBrowserVersion);
  this.__defineSetter__("browserUserAgent", this.setBrowserUserAgent);
  this.__defineGetter__("browserUserAgent", this.getBrowserUserAgent);
};

Downsha.inherit(Downsha.DownshaTerm, Downsha.DownshaModel);

Downsha.DownshaTerm.TERM_CLASS = {
	UNKNOWN : 0,
	PC      : 1,
	PLUGIN  : 2,
	WEB     : 3,
	MOBILE  : 4, 
	PAD     : 5, 
	TV      : 6
};

Downsha.DownshaTerm.TERM_TYPE = {
	IE      : 20000,
	FIREFOX : 21000,
	CHROME  : 22000,
	SAFARI  : 23000,
	OPERA   : 24000,
	SE360   : 25000,
	SOGOU   : 25100,
	EE360   : 25200, 
	AOYOU   : 25300, 
	QQ      : 25400, 
	LIEBAO  : 25500
};

Downsha.DownshaTerm.prototype._osName = null;
Downsha.DownshaTerm.prototype._osVersion = null;
Downsha.DownshaTerm.prototype._browserName = null;
Downsha.DownshaTerm.prototype._browserVersion = null;
Downsha.DownshaTerm.prototype._browserUserAgent = null;

Downsha.DownshaTerm.prototype.getOSName = function() {
	return this._osName;
};
Downsha.DownshaTerm.prototype.setOSName = function(osName) {
	this._osName = osName;
};
Downsha.DownshaTerm.prototype.getOSVersion = function() {
	return this._osVersion;
};
Downsha.DownshaTerm.prototype.setOSVersion = function(osVersion) {
	this._osVersion = osVersion;
};
Downsha.DownshaTerm.prototype.getBrowserName = function() {
	return this._browserName;
};
Downsha.DownshaTerm.prototype.setBrowserName = function(browserName) {
	this._browserName = browserName;
};
Downsha.DownshaTerm.prototype.getBrowserVersion = function() {
	return this._browserVersion;
};
Downsha.DownshaTerm.prototype.setBrowserVersion = function(browserVersion) {
	this._browserVersion = browserVersion;
};
Downsha.DownshaTerm.prototype.getBrowserUserAgent = function() {
	return this._browserUserAgent;
};
Downsha.DownshaTerm.prototype.setBrowserUserAgent = function(browserUserAgent) {
	this._browserUserAgent = browserUserAgent;
};

Downsha.DownshaFile = function DownshaFile(obj) {
  this.__defineSetter__("putState", this.setPutState);
  this.__defineGetter__("putState", this.getPutState);
  this.__defineSetter__("data", this.setData);
  this.__defineGetter__("data", this.getData);
  
  this.__defineSetter__("cid", this.setCID);
  this.__defineGetter__("cid", this.getCID);
  this.__defineSetter__("cindex", this.setCIndex);
  this.__defineGetter__("cindex", this.getCIndex);
  this.__defineSetter__("syncNo", this.setSyncNo);
  this.__defineGetter__("syncNo", this.getSyncNo);
  this.__defineSetter__("fid", this.setFID);
  this.__defineGetter__("fid", this.getFID);  
  this.__defineSetter__("mid", this.setMID);
  this.__defineGetter__("mid", this.getMID);
  this.__defineSetter__("mime", this.setMime);
  this.__defineGetter__("mime", this.getMime);
  this.__defineSetter__("dataSize", this.setDataSize);
  this.__defineGetter__("dataSize", this.getDataSize);
  this.__defineSetter__("wordCount", this.setWordCount);
  this.__defineGetter__("wordCount", this.getWordCount); 
  this.__defineSetter__("fileTitle", this.setFileTitle);
  this.__defineGetter__("fileTitle", this.getFileTitle);
  this.__defineSetter__("fileName", this.setFileName);
  this.__defineGetter__("fileName", this.getFileName);
  this.__defineSetter__("url", this.setUrl);
  this.__defineGetter__("url", this.getUrl);
  this.__defineSetter__("creator", this.setCreator);
  this.__defineGetter__("creator", this.getCreator);
  this.__defineSetter__("attachFlag", this.setAttachFlag);
  this.__defineGetter__("attachFlag", this.getAttachFlag);
  this.__defineSetter__("width", this.setWidth);
  this.__defineGetter__("width", this.getWidth);
  this.__defineSetter__("height", this.setHeight);
  this.__defineGetter__("height", this.getHeight);
  this.__defineSetter__("background", this.setBackground);
  this.__defineGetter__("background", this.getBackground);
  this.__defineSetter__("createDate", this.setCreateDate);
  this.__defineGetter__("createDate", this.getCreateDate);
  this.__defineSetter__("updateDate", this.setUpdateDate);
  this.__defineGetter__("updateDate", this.getUpdateDate);
  this.initialize(obj);
};

Downsha.inherit(Downsha.DownshaFile, Downsha.DownshaModel);

Downsha.DownshaFile.PUT_STATE = {
	NOT_EXIST : 0,
	EXIST     : 1,
	PARTIAL   : 2,
	FAILED    : 129
};

Downsha.DownshaFile.prototype._putState = Downsha.DownshaFile.PUT_STATE.NOT_EXIST;
Downsha.DownshaFile.prototype._data = null;
Downsha.DownshaFile.prototype._cid = 0;
Downsha.DownshaFile.prototype._cindex = 0;
Downsha.DownshaFile.prototype._syncNo = 0;
Downsha.DownshaFile.prototype._fid = "";
Downsha.DownshaFile.prototype._mid = 0;
Downsha.DownshaFile.prototype._mime = "";
Downsha.DownshaFile.prototype._dataSize = 0;
Downsha.DownshaFile.prototype._fileTitle = "";
Downsha.DownshaFile.prototype._fileName = "";
Downsha.DownshaFile.prototype._url = "";
Downsha.DownshaFile.prototype._creator = "";
Downsha.DownshaFile.prototype._attachFlag = 0;
Downsha.DownshaFile.prototype._wordCount = 0;
Downsha.DownshaFile.prototype._width = 0;
Downsha.DownshaFile.prototype._height = 0;
Downsha.DownshaFile.prototype._background = 0;
Downsha.DownshaFile.prototype._createDate = 0;
Downsha.DownshaFile.prototype._updateDate = 0;

Downsha.DownshaFile.prototype.getPutState = function() {
	return this._putState;
};
Downsha.DownshaFile.prototype.setPutState = function(putState) {
	this._putState = putState;
};
Downsha.DownshaFile.prototype.getData = function() {
	return this._data;
};
Downsha.DownshaFile.prototype.setData = function(data) {
	this._data = data;
};
Downsha.DownshaFile.prototype.getCID = function() {
	return this._cid;
};
Downsha.DownshaFile.prototype.setCID = function(cid) {
	this._cid = cid;
};
Downsha.DownshaFile.prototype.getCIndex = function() {
	return this._cindex;
};
Downsha.DownshaFile.prototype.setCIndex = function(cindex) {
	this._cindex = cindex;
};
Downsha.DownshaFile.prototype.getSyncNo = function() {
	return this._syncNo;
};
Downsha.DownshaFile.prototype.setSyncNo = function(syncNo) {
	this._syncNo = syncNo;
};
Downsha.DownshaFile.prototype.getFID = function() {
	return this._fid;
};
Downsha.DownshaFile.prototype.setFID = function(fid) {
	this._fid = fid;
};
Downsha.DownshaFile.prototype.getMID = function() {
	return this._mid;
};
Downsha.DownshaFile.prototype.setMID = function(mid) {
	this._mid = mid;
};
Downsha.DownshaFile.prototype.getMime = function() {
	return this._mime;
};
Downsha.DownshaFile.prototype.setMime = function(mime) {
	this._mime = mime;
};
Downsha.DownshaFile.prototype.getDataSize = function() {
	return this._dataSize;
};
Downsha.DownshaFile.prototype.setDataSize = function(dataSize) {
	this._dataSize = dataSize;
};
Downsha.DownshaFile.prototype.getFileTitle = function() {
	return this._fileTitle;
};
Downsha.DownshaFile.prototype.setFileTitle = function(fileTitle) {
	this._fileTitle = fileTitle;
};
Downsha.DownshaFile.prototype.getFileName = function() {
	return this._fileName;
};
Downsha.DownshaFile.prototype.setFileName = function(fileName) {
	this._fileName = fileName;
};
Downsha.DownshaFile.prototype.getUrl = function() {
	return this._url;
};
Downsha.DownshaFile.prototype.setUrl = function(url) {
	this._url = url;
};
Downsha.DownshaFile.prototype.getCreator = function() {
	return this._creator;
};
Downsha.DownshaFile.prototype.setCreator = function(creator) {
	this._creator = creator;
};
Downsha.DownshaFile.prototype.getAttachFlag = function() {
	return this._attachFlag;
};
Downsha.DownshaFile.prototype.setAttachFlag = function(attachFlag) {
	this._attachFlag = attachFlag;
};
Downsha.DownshaFile.prototype.getWordCount = function() {
	return this._wordCount;
};
Downsha.DownshaFile.prototype.setWordCount = function(wordCount) {
	wordCount = parseInt(wordCount);
	if (isNaN(wordCount))
		return ;
	
	this._wordCount = wordCount;
};
Downsha.DownshaFile.prototype.getWidth = function() {
	return this._width;
};
Downsha.DownshaFile.prototype.setWidth = function(width) {
	width = parseInt(width);
	if (isNaN(width))
		return ;
		
	this._width = width;
};
Downsha.DownshaFile.prototype.getHeight = function() {
	return this._height;
};
Downsha.DownshaFile.prototype.setHeight = function(height) {
	height = parseInt(height);
	if (isNaN(height))
		return ;
	
	this._height = height;
};
Downsha.DownshaFile.prototype.getBackground = function() {
	return this._background;
};
Downsha.DownshaFile.prototype.setBackground = function(background) {
	background = parseInt(background);
	if (isNaN(background))
		return ;
	
	this._background = background;
};
Downsha.DownshaFile.prototype.getCreateDate = function() {
	return this._createDate;
};
Downsha.DownshaFile.prototype.setCreateDate = function(createDate) {
	this._createDate = createDate;
};
Downsha.DownshaFile.prototype.getUpdateDate = function() {
	return this._updateDate;
};
Downsha.DownshaFile.prototype.setUpdateDate = function(updateDate) {
	this._updateDate = updateDate;
};

Downsha.DownshaFile.prototype.getFileAbstract = function() {
	return {
		CID        : this.cid,
		CIndex     : this.cindex,
		FID        : this.fid,
		MimeID     : this.mid,
		Mime       : this.mime
	};
};

Downsha.DownshaFile.prototype.getFileDesc = function() {
	return {
		CID        : this.cid,
		CIndex     : this.cindex,
		FileSyncNo : this.syncNo,
		FID        : this.fid,
		MimeID     : this.mid,
		Mime       : this.mime, 
		FileSize   : this.dataSize,
		WordCount  : this.wordCount,
		FileTitle  : this.fileTitle,
		FileName   : this.fileName,
		SrcURL     : this.url,
		Creator    : this.creator,
		AttachFlag : this.attachFlag,
		CTime      : this.createDate,
		MTime      : this.updateDate,
		MediaAttr  : 1,
		Width      : this.width,
		Height     : this.height
	};
};

Downsha.DownshaFile.prototype.getFileData = function() {
	return {
		CID      : this.cid,
		CIndex   : this.cindex,
		FID      : this.fid,
		FileData : this.data
	};
};

Downsha.DownshaInfo = function DownshaInfo(obj) {
  this.__defineGetter__("cid", this.getCID);
  this.__defineSetter__("cid", this.setCID);
  this.__defineGetter__("dirId", this.getDirId);
  this.__defineSetter__("dirId", this.setDirId);	
  this.__defineGetter__("title", this.getTitle);
  this.__defineSetter__("title", this.setTitle);
  this.__defineGetter__("content", this.getContent);
  this.__defineSetter__("content", this.setContent);
  this.__defineGetter__("author", this.getAuthor);
  this.__defineSetter__("author", this.setAuthor);
  this.__defineGetter__("absText", this.getAbsText);
  this.__defineSetter__("absText", this.setAbsText);
  this.__defineGetter__("thumbnail", this.getThumbnail);
  this.__defineSetter__("thumbnail", this.setThumbnail);
  this.__defineGetter__("url", this.getUrl);
  this.__defineSetter__("url", this.setUrl);
  this.__defineGetter__("srcType", this.getSrcType);
  this.__defineSetter__("srcType", this.setSrcType);
  this.__defineGetter__("srcDesc", this.getSrcDesc);
  this.__defineSetter__("srcDesc", this.setSrcDesc);
  this.__defineGetter__("shareType", this.getShareType);
  this.__defineSetter__("shareType", this.setShareType);
  this.__defineGetter__("shareDate", this.getShareDate);
  this.__defineSetter__("shareDate", this.setShareDate);
  this.__defineGetter__("fileCount", this.getFileCount);
  this.__defineGetter__("totalSize", this.getTotalSize);
  this.__defineGetter__("mainFID", this.getMainFID);
  this.__defineSetter__("mainFID", this.setMainFID);
  this.__defineGetter__("mainMID", this.getMainMID);
  this.__defineSetter__("mainMID", this.setMainMID);
  this.__defineGetter__("mainSize", this.getMainSize);
  this.__defineSetter__("mainSize", this.setMainSize);
  this.__defineGetter__("wordCount", this.getWordCount);
  this.__defineSetter__("wordCount", this.setWordCount);
  this.__defineGetter__("createDate", this.getCreateDate);
  this.__defineSetter__("createDate", this.setCreateDate);
  this.__defineGetter__("updateDate", this.getUpdateDate);
  this.__defineSetter__("updateDate", this.setUpdateDate);
  this.__defineType__("files", "Array");
  this.__defineGetter__("length", this.getLength);
  
  this.files = [];
  this.initialize(obj);
};

Downsha.inherit(Downsha.DownshaInfo, Downsha.DownshaModel);

Downsha.DownshaInfo.SRC_TYPE = {
	ORIGINAL     : 10000, // create by original
	WEB_CLIP     : 10100, // create by web clip
	LOCAL_FILE   : 10200  // create by local file
};

Downsha.DownshaInfo.prototype._cid = 0;
Downsha.DownshaInfo.prototype._dirId = 0;
Downsha.DownshaInfo.prototype._title = "";
Downsha.DownshaInfo.prototype._content = "";
Downsha.DownshaInfo.prototype._author = "";
Downsha.DownshaInfo.prototype._absText = "";
Downsha.DownshaInfo.prototype._thumbnail = "";
Downsha.DownshaInfo.prototype._url = "";
Downsha.DownshaInfo.prototype._srcType = 0;
Downsha.DownshaInfo.prototype._srcDesc = "";
Downsha.DownshaInfo.prototype._shareType = 0;
Downsha.DownshaInfo.prototype._shareDate = 0;
Downsha.DownshaInfo.prototype._fileCount = 0;
Downsha.DownshaInfo.prototype._totalSize = 0;
Downsha.DownshaInfo.prototype._mainFID = "";
Downsha.DownshaInfo.prototype._mainMID = 0;
Downsha.DownshaInfo.prototype._mainSize = 0;
Downsha.DownshaInfo.prototype._wordCount = 0;
Downsha.DownshaInfo.prototype._createDate = 0;
Downsha.DownshaInfo.prototype._updateDate = 0;

Downsha.DownshaInfo.createUrlNote = function(title, url, favIcoUrl) {
  var content = Downsha.Utils.createUrlClipContent(title, url, favIcoUrl);
  var dsInfo = new Downsha.DownshaInfo({
    title : title,
    content : content,
    url : url
  });
  return dsInfo;
};

Downsha.DownshaInfo.prototype.getCID = function() {
  return (this._cid != null) ? this._cid : 0;
};

Downsha.DownshaInfo.prototype.setCID = function(cid) {
	cid = parseInt(cid);
	if (isNaN(cid))
		return ;
	
	this._cid = cid;
  for (var i in this.files) { // set cid of associated files
  	this.files[i].cid = cid;
  }
};

Downsha.DownshaInfo.prototype.getDirId = function() {
  return (this._dirId != null) ? this._dirId : 0;
};

Downsha.DownshaInfo.prototype.setDirId = function(dirId) {
	dirId = parseInt(dirId);
	if (isNaN(dirId))
		return ;
	this._dirId = dirId;
};

Downsha.DownshaInfo.prototype.cleanTitle = function(title) {
  if (typeof title == 'string') {
    return title.replace(/[\n\r\t]+/, "").replace(/^\s+/, "").replace(/\s+$/, ""); // trim white spaces
  }
  return title;
};

Downsha.DownshaInfo.prototype.getTitle = function() {
  return this._title;
};

Downsha.DownshaInfo.prototype.setTitle = function(title, defaultTitle) {
  var newTitle = this.cleanTitle("" + title);
  if ((newTitle == null || newTitle.length == 0) && defaultTitle)
    newTitle = this.cleanTitle("" + defaultTitle);
  this._title = newTitle;
};

Downsha.DownshaInfo.prototype.getContent = function() {
	return this._content;
};

Downsha.DownshaInfo.prototype.setContent = function(content) {
	this._content = content;
};

Downsha.DownshaInfo.prototype.getAuthor = function() {
	return this._author;
};

Downsha.DownshaInfo.prototype.setAuthor = function(author) {
	this._author = author;
};

Downsha.DownshaInfo.prototype.getAbsText = function() {
	return this._absText;
};

Downsha.DownshaInfo.prototype.setAbsText = function(absText) {
	this._absText = absText;
};

Downsha.DownshaInfo.prototype.getThumbnail = function() {
	return this._thumbnail;
};

Downsha.DownshaInfo.prototype.setThumbnail = function(thumbnail) {
	this._thumbnail = thumbnail;
};

Downsha.DownshaInfo.prototype.getUrl = function() {
	return this._url;
};

Downsha.DownshaInfo.prototype.setUrl = function(url) {
	this._url = url;
};

Downsha.DownshaInfo.prototype.getSrcType = function() {
	return this._srcType;
};

Downsha.DownshaInfo.prototype.setSrcType = function(srcType) {
	srcType = parseInt(srcType);
	if (isNaN(srcType))
		return ;
	this._srcType = srcType;
};

Downsha.DownshaInfo.prototype.getSrcDesc = function() {
	return this._srcDesc;
};

Downsha.DownshaInfo.prototype.setSrcDesc = function(srcDesc) {
	this._srcDesc = srcDesc;
};

Downsha.DownshaInfo.prototype.getShareType = function() {
	return this._shareType;
};
Downsha.DownshaInfo.prototype.setShareType = function(shareType) {
	shareType = parseInt(shareType);
	if (isNaN(shareType))
		return ;
	this._shareType = shareType;
};

Downsha.DownshaInfo.prototype.getShareDate = function() {
	return this._shareDate;
};
Downsha.DownshaInfo.prototype.setShareDate = function(shareDate) {
	shareDate = parseInt(shareDate);
	if (isNaN(shareDate))
		return ;
	this._shareDate = shareDate;
};

Downsha.DownshaInfo.prototype.getFileCount = function() {
	return this.files.length;
};

Downsha.DownshaInfo.prototype.getTotalSize = function() {
	var totalSize = 0;
	for (var i in this.files) {
		totalSize += this.files[i].dataSize;
	}
	return totalSize;
};

Downsha.DownshaInfo.prototype.getMainFID = function() {
	return this._mainFID;
};

Downsha.DownshaInfo.prototype.setMainFID = function(mainFID) {
	this._mainFID = mainFID;
};

Downsha.DownshaInfo.prototype.getMainMID = function() {
	return (this._mainMID != null) ? this._mainMID : 0;
};

Downsha.DownshaInfo.prototype.setMainMID = function(mainMID) {
	mainMID = parseInt(mainMID);
	if (isNaN(mainMID))
		return ;
	this._mainMID = mainMID;
};

Downsha.DownshaInfo.prototype.getMainSize = function() {
	return (this._mainSize != null) ? this._mainSize : 0;
};

Downsha.DownshaInfo.prototype.setMainSize = function(mainSize) {
	mainSize = parseInt(mainSize);
	if (isNaN(mainSize))
		return ;
	this._mainSize = mainSize;
};

Downsha.DownshaInfo.prototype.getWordCount = function() {
	return (this._wordCount != null) ? this._wordCount : 0;
};

Downsha.DownshaInfo.prototype.setWordCount = function(wordCount) {
	wordCount = parseInt(wordCount);
	if (isNaN(wordCount))
		return ;
	this._wordCount = wordCount;
};

Downsha.DownshaInfo.prototype.getCreateDate = function() {
	return this._createDate;
};

Downsha.DownshaInfo.prototype.setCreateDate = function(createDate) {
	createDate = parseInt(createDate);
	if (isNaN(createDate))
		return ;
	this._createDate = createDate;
};

Downsha.DownshaInfo.prototype.getUpdateDate = function() {
	return this._updateDate;
};

Downsha.DownshaInfo.prototype.setUpdateDate = function(updateDate) {
	updateDate = parseInt(updateDate);
	if (isNaN(updateDate))
		return ;
	this._updateDate = updateDate;
};

Downsha.DownshaInfo.prototype.findFileByFID = function(fid) {
	if (typeof fid == "string" && fid != "" && typeof this.files[fid] != "undefined") {
		return this.files[fid];
	}
	return null;
};

Downsha.DownshaInfo.prototype.findFileByURL = function(url) {
	for (var i in this.files) {
		if (this.files[i] && this.files[i].url == url) {
			return this.files[i];
		}
	}
	return null;
};

Downsha.DownshaInfo.prototype.addFile = function(file) {
	if (file != null) {
		if (file instanceof Downsha.DownshaFile) {
			this.files[file.fid] = file;
			this.files.length ++;
		} else if (typeof file == "object" && typeof file.fid != "undefined") {
			this.files[file.fid] = new Downsha.DownshaFile(file);
			this.files.length ++;
		}
	}
};

Downsha.DownshaInfo.prototype.getNextUnputFile = function() {
	var unputFile = null;
	var unputIndex = 0;
	for (var i in this.files) {
		if (this.files[i] && this.files[i].putState != Downsha.DownshaFile.PUT_STATE.EXIST &&
		(unputIndex == 0 || this.files[i].cindex < unputIndex)) {
			unputFile = this.files[i];
			unputIndex = this.files[i].cindex;
		}
	}
	return unputFile;
};

Downsha.DownshaInfo.prototype.getThumbnailFile = function() {
	var tbFile = null;
	var curFile = null;
	var curIndex = 0;
	var curBackground = 0;
	var curWidth = 0;
	var curHeight = 0;
	var curArea = 0;
	var MaxArea = 0;
	
	for (var i in this.files) {
		curFile = this.files[i];
		
		curIndex = parseInt(curFile.cindex);
		if (isNaN(curIndex) || curIndex < 100)
			continue;
		curBackground = parseInt(curFile.background);
		if (!isNaN(curBackground) && curBackground != 0)
			continue;
		currentMID = parseInt(curFile.mid);
		if (isNaN(currentMID) || currentMID < 2000)
			continue;
		curWidth = parseInt(curFile.width);
		if (isNaN(curWidth) || curWidth < 80)
			continue;
		curHeight = parseInt(curFile.height);
		if (isNaN(curHeight) || curHeight < 80)
			continue;
		if ((curWidth * 100 / curHeight) > 300 ||
			(curHeight * 100 / curWidth) > 300)
			continue;
		
		curArea = curWidth * curHeight;
		if (curArea > MaxArea) {
			tbFile = curFile;
			MaxArea = curArea;
		}
	}
	return tbFile;
};

// Returns total length of the instance as it would be POSTed
Downsha.DownshaInfo.prototype.getLength = function() {
  var total = 0;
  var props = this.getStorableProps();
  for ( var i = 0; i < props.length; i++) {
    if (this[props[i]]) {
      total += ("" + this[props[i]]).length + props[i].length + 1;
    }
  }
  total += (props.length - 1);
  return total;
};
Downsha.DownshaInfo.prototype.getStorableProps = function() {
	return [ "dirId", "title", "content", "author", "absText", "thumbnail", 
	"url", "srcType", "srcDesc", "shareType", "shareDate", "fileCount", "totalSize", 
	"mainFID", "mainMID", "mainSize", "wordCount", "createDate", "updateDate"];
};

Downsha.DownshaInfo.prototype.getInfoItem = function() {
  return {
  	DirID        : this.dirId,
  	Title        : this.title,
  	Author       : this.author,
  	Abstract     : this.absText, 
  	InfoIconFID  : this.thumbnail, 
  	SrcURL       : this.url,
  	SrcType      : this.srcType,
  	SrcDesc      : this.srcDesc,
  	ShareType    : this.shareType,
  	ShareTime    : this.shareDate,
  	CTime        : this.createDate,
  	MTime        : this.updateDate, 
  	FileListNum  : this.fileCount,
  	TotalSize    : this.totalSize,
  	MainFID      : this.mainFID,
  	MainMimeID   : this.mainMID,
  	MainFileSize : this.mainSize,
  	WordCount    : this.wordCount
  };
};

Downsha.DownshaInfo.prototype.getFileDesc = function() {
  var fileDesc = {
  	FileNum : this.fileCount
  };
  var fileCount = 0;
  fileDesc.FileList = [];
  for (var i in this.files) {
  	fileDesc.FileList[fileCount++] = this.files[i].getFileDesc();
  }
  return fileDesc;
};

Downsha.DownshaInfo.prototype.toLOG = function() {
  return {
    title      : this.title,
    url        : this.url,
    length     : this.length,
    createDate : this.createDate,
    updateDate : this.updateDate
  };
};
Downsha.DownshaInfo.prototype.toString = function() {
  return "Downsha.DownshaInfo [" + this.url + "] " + this.title + 
  	"; content length: " + ((typeof this.content == 'string') ? this.content.length : 0) + ")";
};
