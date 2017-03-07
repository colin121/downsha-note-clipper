/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: queue processor with persistent via HTML5 local file system
 */

(function() {
  var LOG = null;
  Downsha.PersistentQueueProcessor = function PersistentQueueProcessor(
  	path, size, checkInterval, retryInterval, success, error) {
    LOG = Downsha.Logger.getInstance();
    this.__defineType__("fsa", Downsha.FSA); // use FSA as persistent tool
    this.__defineString__("rootPath", "/"); // set default path as root
    this.initialize(path, size, checkInterval, retryInterval, success, error);
  };
  Downsha.inherit(Downsha.PersistentQueueProcessor, Downsha.QueueProcessor);

  Downsha.PersistentQueueProcessor.prototype.initialize = function(
  	path, size, checkInterval, retryInterval, success, error) {
    //LOG.debug("PersistentQueueProcessor.initialize");
    var self = this;
    Downsha.PersistentQueueProcessor.parent.initialize.apply(this, [checkInterval, retryInterval]); // parent init
    if (path && size) {
      if (path) {
        this.rootPath = path;
      }
      this.initializeFSA(size, success, error);
    }
  };
  Downsha.PersistentQueueProcessor.prototype.initializeFSA = function(size, success, error) {
    LOG.debug("PersistentQueueProcessor.initializeFSA");
    var self = this;
    var errorHandler = function(e) {
      LOG.debug("Error creating FSA for PersistentQueueProcessor: " + e.code);
      self.signal();
      self.onerror(e);
      if (typeof error == 'function') {
        error(e);
      }
    };
    this.wait(); // wait for signal, only increase counter
    this.fsa = new Downsha.FSA(PERSISTENT, size, function() { // callback for FSA init ok
      LOG.debug("Successfully created FSA, making sure we have the path");
      self.fsa.ensureDirectory(self.rootPath, function() { // callback for ensureDirectory ok
        LOG.debug("Ensured and using the requested path as root path: " + self.rootPath);
        self.fsa.changeDirectory(self.rootPath, function() { // callback for changeDirectory ok
          self.fsa.listFiles(null, function(entries) { // list all the pre-existing(unsent notes) files
            LOG.debug("Successfully read pre-existing file entries: " + entries.length);
            self.initializeWithEntries(entries); // initialize with all pre-existing files
            if (typeof success == 'function') {
              success();
            }
            self.signal();
          }, errorHandler);
        }, errorHandler);
      }, errorHandler);
    }, errorHandler);
  };
  Downsha.PersistentQueueProcessor.prototype.onerror = function(err) {
  	try {
  		var msg = Downsha.Utils.errorDescription(err);
  		LOG.error(msg);
  	} catch(e) {
  		LOG.error(err);
  	}
  };
  Downsha.PersistentQueueProcessor.prototype._pathForItem = function(item) { // use current timestamp as file path of item
    return "" + (new Date().getTime());
  };
  Downsha.PersistentQueueProcessor.prototype.initializeWithEntries = function(entries) { // load unsent note files
    LOG.debug("PersistentQueueProcessor.initializeWithEntries");
    if (entries && entries.length > 0) {
      for ( var i = 0; i < entries.length; i++) {
        if (this.isInitializableFileEntry(entries[i])) { // init each file entry and add to the queue
          this.add(entries[i]);
        }
      }
    }
  };
  Downsha.PersistentQueueProcessor.prototype.isInitializableFileEntry = function(fileEntry) {
    return (fileEntry && fileEntry.isFile) ? true : false; // ignore if it is not a file, such as directories, links.
  };
  Downsha.PersistentQueueProcessor.prototype.createPayload = function(item) {
    LOG.debug("PersistentQueueProcessor.createPayload");
    var self = this;
    var payload = Downsha.PersistentProcessorPayload.fromObject(
    	Downsha.PersistentQueueProcessor.parent.createPayload.apply(this, [item]));
    if (item && item.isFile) {
      LOG.debug("Creating payload for file");
      payload.path = item.name;
      payload.file = item;
      payload.data = null;
    } else {
      LOG.debug("Creating payload for data object");
      payload.path = this._pathForItem(item);
      payload.data = item;
      // TODO 2012-08-16
      var content = Downsha.DownshaModel.serializeStorable(item); //*** serialize storable properties of object to string
      this.fsa.writeFile( //write item data to local file before processing
              payload.path,
              content,
              function(writer, file) { // callback for write success
                if (self.isPayloadProcessed(payload)) {
                  self.fsa.removeFile( // remove if it was already processed(uploaded)
                          payload.path,
                          function() {
                            LOG.debug("Successfully removed just-created file, since it was already uploaded");
                          }, self._onremoveerror);
                } else {
                  LOG.debug("Associating file with payload");
                  payload.file = file; //*** save the file entry to payload.file in case we use it later
                  if (LOG.isDebugEnabled()) {
                    LOG.dir(payload);
                  }
                }
              }, this._onwriteerror);
    }
    return payload;
  };
  Downsha.PersistentQueueProcessor.prototype.remove = function(item, dontRemoveFile) {
    LOG.debug("PersistentQueueProcessor.remove");
    var removed = Downsha.PersistentQueueProcessor.parent.remove.apply(this, [item]);
    if (removed && !dontRemoveFile) {
      this._removePayloadFile(removed);
    } else {
      LOG.debug("Not removing payload file cuz there isn't one associated with the payload");
    }
    return removed;
  };
  Downsha.PersistentQueueProcessor.prototype.removePayload = function(payload, dontRemoveFile) {
    LOG.debug("PersistentQueueProcessor.removePayload");
    var removed = Downsha.PersistentQueueProcessor.parent.removePayload.apply(this, [payload]);
    if (removed && !dontRemoveFile) {
      this._removePayloadFile(removed);
    } else {
      LOG.debug("Not removing payload file cuz there isn't one associated with the payload");
    }
  };
  Downsha.PersistentQueueProcessor.prototype._removePayloadFile = function(payload) {
    LOG.debug("PersistentQueueProcessor._removePayloadFile");
    if (payload && payload.file) {
      payload.file.remove(function() {
        LOG.debug("Successfully removed file: " + payload.file.fullPath);
      }, this._onremoveerror);
    }
  };
  Downsha.PersistentQueueProcessor.prototype.removeAll = function(dontRemoveFiles) {
    LOG.debug("PersistentQueueProcessor.removeAll");
    var self = this;
    Downsha.PersistentQueueProcessor.parent.removeAll.apply(this);
    if (!dontRemoveFiles) {
      var errorCallback = function(e) {
        LOG.error("FSA Error during PersistentQueueProcessor.removeAll: " + e.code);
      };
      this.fsa.emptyDirectory(this.rootPath, function() {
        LOG.debug("Successfully emptied directory: " + this.rootPath);
      }, errorCallback);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onfsaerror = function(e) {
    LOG.error("FSA Error: " + e.code);
    if (typeof this.onfsaerror == 'function') {
      this.onfsaerror(e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onwriteerror = function(e) {
    LOG.error("Failed to write to file: " + e.code);
    this._onfsaerror(e);
    if (typeof this.onwriteerror == 'function') {
      this.onwriteerror(e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onremoveerror = function(e) {
    LOG.error("Failed to remove file: " + e.code);
    if (typeof this.onremoveerror == 'function') {
      this.onremoveerror(e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onprocess = function(item, processor, data) {
    LOG.debug("PersistentQueueProcessor._onprocess");
    Downsha.PersistentQueueProcessor.parent._onprocess.apply(this, arguments);
    this._removePayloadFile(item); // remove payload file if process ok
  };
  Downsha.PersistentQueueProcessor.prototype._onreaderror = function(item, e) {
    LOG.debug("PersistentQueueProcessor._onreaderror");
    this.removePayload(item);
    if (typeof this.onreaderror == 'function') {
      this.onreaderror(item, e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype.process = function(force) {
    LOG.debug("PersistentQueueProcessor.process");
    var self = this;
    var error = function(e) {
      LOG.error("Error retrieving contents of a file: " + e.code);
      self.signal();
    };
    if (!this.isStarted()) {
      LOG.warn("Attempted to processes when processor hasn't been started yet...");
      return;
    }
    var peeked = this.peek();
    if (peeked && !this.isActive() && !peeked.data && peeked.file) {
      LOG.debug("Next entry in the queue is a file, let's read it in");
      this.wait();
      peeked.file.file(function(file) { // open peeked file entry
        self.fsa.readTextFromFile(file, function(reader, file) {
          try {
          	// TODO 2012-08-16
            var content = Downsha.DownshaModel.unserializeStorable(reader.result); // unserialize string to object
            peeked.data = content; // load the content of file to peeked.data
          } catch (e) {
            LOG.warn("Error reading clip from file " + file.name + ": " + e);
            self._onreaderror(peeked, e);
          }
          self.signal(); // signal after file entry loaded
        }, error);
      }, error);
      return;
    } else {
      LOG.debug("Next entry is not a file, let's process it...");
      Downsha.PersistentQueueProcessor.parent.process.apply(this, arguments); // parent process
    }
  };

  Downsha.PersistentProcessorPayload = function PersistentProcessorPayload(obj) {
    this.initialize(obj);
  };
  Downsha.inherit(Downsha.PersistentProcessorPayload, Downsha.ProcessorPayload);
  Downsha.PersistentProcessorPayload.fromObject = function(obj) {
    if (obj instanceof Downsha.PersistentProcessorPayload) {
      return obj;
    } else {
      var newObj = new Downsha.PersistentProcessorPayload();
      if (typeof obj == 'object' && obj) {
        for ( var i in obj) {
          if (typeof obj[i] != 'function'
              && typeof newObj.__proto__[i] != 'undefined') {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    }
  };
  Downsha.PersistentProcessorPayload.prototype.file = null; // payload file entry
  Downsha.PersistentProcessorPayload.prototype.path = null; // payload file path (create timestamp)
  Downsha.PersistentProcessorPayload.prototype.processResponse = null;
  Downsha.PersistentProcessorPayload.prototype.refresh = function() {
    Downsha.PersistentProcessorPayload.parent.refresh.apply(this, []);
    this.processResponse = null;
  };
  Downsha.PersistentProcessorPayload.prototype.toJSON = function() {
    var obj = Downsha.PersistentProcessorPayload.parent.toJSON.apply(this);
    obj["processResponse"] = this.processResponse;
    obj["path"] = this.path;
    return obj;
  };
  Downsha.PersistentProcessorPayload.prototype.toLOG = function() {
    var logObj = Downsha.PersistentProcessorPayload.parent.toLOG.apply(this);
    logObj["file"] = (this.file && this.file.name) ? this.file.name : null;
    logObj["path"] = this.path;
    logObj["hasProcessResponse"] = (this.processResponse) ? true : false;
    logObj["data"] = (typeof this.data == 'object' && this.data && typeof this.data["toLOG"] == 'function') ? 
    	this.data.toLOG() : this.data;
    return logObj;
  };
})();
