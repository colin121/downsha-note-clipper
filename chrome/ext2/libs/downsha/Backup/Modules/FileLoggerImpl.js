/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: File logger implementation by HTML5 local sotrage API
 */

(function() {
  var LOG = null;

  Downsha.FileLogger = function FileLogger(type, size, root, success, error) {
    this.__defineString__("root", "/");
    this.__definePositiveInteger__("maxLogSize", 2 * 1024 * 1024);
    this.initialize(type, size, root, success, error);
  };

  Downsha.mixin(Downsha.FileLogger, Downsha.DefiningMixin);

  Downsha.FileLogger.FSA_SIZE = 5 * 1024 * 1024;

  Downsha.FileLogger.prototype._fsa = null;
  Downsha.FileLogger.prototype._sema = null;
  Downsha.FileLogger.prototype._logFile = null;
  Downsha.FileLogger.prototype._logFileEntry = null;

  Downsha.FileLogger.prototype.initialize = function(type, size, root, success, error) {
    this.root = root;
    this._sema = Downsha.Semaphore.mutex();
    var self = this;
    var err = function(err) { // callback for FSA initialization error
      self._sema.signal();
      if (typeof error == 'function') {
        error();
      }
      self.onerror(err);
    };
    var ok = function() { // callback for FSA initialization ok
      if (typeof success == 'function') {
        success(self);
      }
      self._sema.signal();
    };
    var fsaSize = (typeof size == 'number') ? size : this.constructor.FSA_SIZE;
    this._sema.critical(function() {
      self._fsa = new Downsha.FSA(type, fsaSize, function() {
        self._fsa.getCreateDirectory(self.root, function(dirEntry) { // create log directory
          self._fsa.changeDirectory(dirEntry.fullPath, function(dirEntry) { // change current directory to log directory
            self._fsa.listFiles(dirEntry.fullPath, function(files) {
              Downsha.FSA.sortEntries(files, function(f, cb) { // sort log files by modification time
                f.getMetadata(function(meta) {
                  cb(meta.modificationTime.getTime(), f);
                });
              }, function(a, b) { // compare function for sorting
                if (a == b) {
                  return 0;
                } else {
                  return (a > b) ? 1 : -1;
                }
              }, function(sortedFiles) { //after sorting, pick the last modified log file as current log file
                if (sortedFiles.length > 0
                    && sortedFiles[sortedFiles.length - 1]) {
                  sortedFiles[sortedFiles.length - 1].file(function(lastFile) {
                    self._logFile = lastFile;
                    self._logFileEntry = sortedFiles[sortedFiles.length - 1];
                    ok();
                  }, err);
                } else {
                  ok();
                }
              });
            }, err);
          }, err);
        }, err);
      }, err);
    });
  };

  Downsha.FileLogger.prototype.onerror = function(err) {
      try {
          var msg = Downsha.Utils.errorDescription(err);
          console.error(msg);
      } catch(e) {
          console.error(err);
      }
  };

  Downsha.FileLogger.formatDateNumber = function(num) {
    if (num < 10) {
      return "0" + num;
    } else {
      return "" + num;
    }
  };

  Downsha.FileLogger.prototype.getNewLogFilename = function() {
    var d = new Date();
    var fname = d.getFullYear() + "_" + 
    	Downsha.FileLogger.formatDateNumber(d.getMonth() + 1) + "_" + 
    	Downsha.FileLogger.formatDateNumber(d.getDate()) + "_" + 
    	Downsha.FileLogger.formatDateNumber(d.getHours()) + "_" + 
    	Downsha.FileLogger.formatDateNumber(d.getMinutes()) + "_" + 
    	Downsha.FileLogger.formatDateNumber(d.getSeconds()) + ".log";
    return fname;
  };

  Downsha.FileLogger.prototype.getCurrentLogFilename = function() {
    return (this._logFileEntry) ? this._logFileEntry.name : null;
  };

  Downsha.FileLogger.prototype._getLogFile = function(callback) {
    var self = this;
    if (this._logFileEntry) {
      callback(this._logFileEntry);
    } else {
      this._swapLogFile(callback);
    }
  };

  Downsha.FileLogger.prototype._swapLogFile = function(callback) {
    var self = this;
    this._fsa.getCreateFile(this.getNewLogFilename(), function(fileEntry) {
      fileEntry.file(function(file) { // create new log file
        self._logFile = file;
        self._logFileEntry = fileEntry;
        self._logFileWriter = null;
        self.onLogSwap(fileEntry);
        callback(fileEntry);
      }, self.error);
    }, self.onerror);
  };

  Downsha.FileLogger.prototype._getLogFileWriter = function(callback) {
    var self = this;
    if (this._logFileEntry && this._logFileWriter) {
      callback(this._logFileWriter);
    } else {
      this._getLogFile(function(fileEntry) {
        fileEntry.createWriter(function(writer) {
          self._logFileWriter = writer;
          callback(writer);
        });
      }, this.onerror);
    }
  };

  Downsha.FileLogger.prototype.releaseLogFile = function() {
    this._logFileEntry = null;
    this._logFileWriter = null;
  };

  Downsha.FileLogger.prototype.onLogSwap = function(fileEntry) {
  };

  Downsha.FileLogger.prototype.listLogFiles = function(success, error) {
    var self = this;
    this._sema.critical(function() {
      self._fsa.listFiles(self._fsa.currentDirectory, function(files) {
        if (typeof success == 'function') {
          success(files);
        }
        self._sema.signal();
      }, function(err) {
        self.onfsaerror();
        if (typeof error == 'function') {
          error(err);
        }
        self._sema.signal();
      });
    });
  };

  Downsha.FileLogger.prototype.log = function(str) {
    var self = this;
    if (this._logFile // swap log file if reach quota
        && (this._logFile.fileSize + str.length) >= this.maxLogSize) {
      this._logFile = null;
      this._logFileEntry = null;
      this._logFileWriter = null;
    }
    this._log(str);
  };

  Downsha.FileLogger.prototype.log2 = function(str) {
    var self = this;
    if (!this._logFile // swap log file if reach quota or log file entry is null
        || (this._logFile.fileSize + str.length) >= this.maxLogSize) {
      this._swapLogFile(function() {
        self._log(str);
      });
    } else {
      this._log(str);
    }
  };

  Downsha.FileLogger.prototype._log = function(str) {
    var self = this;
    this._sema.critical(function() {
      self._getLogFileWriter(function(writer) { // write log string to the end of file
        writer.seek(writer.length);
        writer.onwriteend = function() {
          self._sema.signal();
        };
        var bb = self._fsa.createBlobBuilder();
        bb.append(str + "\n");
        writer.write(bb.getBlob());
      }, self.onerror);
    });
  };

  Downsha.FileLogger.prototype.clear = function() {
    var self = this;
    if (this._logFileEntry) {
      this._logFileEntry.truncate();
    }
  };
})();

Downsha.FileLoggerImpl = function FileLoggerImpl(logger) {
  this.__defineGetter__("fileLogger", this.getFileLogger);
  this.__defineGetter__("keepFiles", this.getKeepFiles);
  this.__defineSetter__("keepFiles", this.setKeepFiles);
  this.initialize(logger);
};
Downsha.inherit(Downsha.FileLoggerImpl, Downsha.LoggerImpl, true);

Downsha.FileLoggerImpl.prototype.handleLogRemoval = function(request, sender, sendRequest) {
  if (typeof request == 'object'
      && request.code == Downsha.Constants.RequestType.LOG_FILE_REMOVED
      && request.message) {
    this.logger.debug("Received notification about a log file being removed");
    var logName = request.message;
    var fileLogger = this.getFileLogger();
    var currentLogName = fileLogger.getCurrentLogFilename();
    this.logger.debug("Comparing removed file with local " + logName + "?=" + currentLogName);
    if (logName == currentLogName) { // release current log file
      this.logger.debug("Releasing current log file");
      fileLogger.releaseLogFile();
    }
  }
};

Downsha.FileLoggerImpl.isResponsibleFor = function(navigator) {
  return (navigator.userAgent.toLowerCase().indexOf("chrome/") > 0);
};

Downsha.FileLoggerImpl.LOG_DIRECTORY = "/logs"; // root directory for log files
Downsha.FileLoggerImpl.FILE_LOGGER_FSA_SIZE = 5 * 1024 * 1024; // size quota for total directory
Downsha.FileLoggerImpl.prototype._enabled = true; // TODO Should be switched to false before release
Downsha.FileLoggerImpl.prototype._keepFiles = 2; // only keep log files of last two days

Downsha.FileLoggerImpl.getProtoKeepFiles = function() {
  return this.prototype._keepFiles;
};
Downsha.FileLoggerImpl.setProtoKeepFiles = function(num) {
  this.prototype._keepFiles = parseInt(num);
  if (isNaN(this.prototype._keepFiles) || this.prototype._keepFiles < 0) {
    this.prototype._keepFiles = 0;
  }
};
Downsha.FileLoggerImpl.prototype.getKeepFiles = function() {
  return this._keepFiles;
};
Downsha.FileLoggerImpl.prototype.setKeepFiles = function(num) {
  this._keepFiles = parseInt(num);
  if (isNaN(this._keepFiles) || this._keepFiles < 0) {
    this._keepFiles = 0;
  }
};
Downsha.FileLoggerImpl.prototype.dump = function(obj) {
  this.dir(obj);
};
Downsha.FileLoggerImpl.prototype.dir = function(obj) {
  var str = ">" + this.logger.scopeName + "\n";
  try {
    if (typeof obj == 'object' && obj // object belong to current namesapce
        && typeof Downsha[obj.constructor.name] != 'undefined') {
      str += obj.constructor.name;
      str += JSON.stringify(obj.toLOG()); // use toLOG to dump object information
    } else if (typeof obj == 'object' && obj && typeof obj.toLOG == 'function') {
      str += JSON.stringify(obj.toLOG());
    } else {
      str += JSON.stringify(obj);
    }
  } catch (e) {
    str += obj;
  }
  str += "\n";
  str += "<" + this.logger.scopeName;
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.debug = function(str) {
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.info = function(str) {
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.warn = function(str) {
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.error = function(str) {
  this._logToFile(str);
  if (this.logger.isDebugEnabled() && str instanceof Error) {
    this._logToFile(str.stack);
  }
};
Downsha.FileLoggerImpl.prototype.exception = function(str) {
  this._logToFile(str);
  if (this.logger.isDebugEnabled() && str instanceof Error) {
    this._logToFile(str.stack);
  }
};
Downsha.FileLoggerImpl.prototype.clear = function() {
  this.fileLogger.clear();
};
Downsha.FileLoggerImpl.prototype.getFileLogger = function() {
  var self = this;
  if (!this.constructor.prototype._fileLogger) {
    this.constructor.prototype._fileLogger = new Downsha.FileLogger(
        PERSISTENT, // storage type
        this.constructor.FILE_LOGGER_FSA_SIZE, // size quota
        this.constructor.LOG_DIRECTORY, // root directory
        function(fileLogger) { // callback function for success
        	/* 
        	upon intialization of FileLogger, let's add an event listener for 
        	LOG_FILE_REMOVED message so that we can release log files from FileLogger
        	*/
        chrome.extension.onRequest
            .addListener(function(request, sender, sendRequest) {
              if (typeof request == 'object'
                  && request.code == Downsha.Constants.RequestType.LOG_FILE_REMOVED
                  && request.message) {
                self.logger.debug("Received notification about a log file being removed");
                var logName = request.message;
                var currentLogName = fileLogger.getCurrentLogFilename();
                self.logger.debug("Comparing removed file with local "
                    + logName + "?=" + currentLogName);
                if (logName == currentLogName) {
                  self.logger.debug("Releasing current log file");
                  fileLogger.releaseLogFile();
                }
              }
              try {
                  sendRequest({});
              } catch(e) {}
            });
      });
    this.constructor.prototype._fileLogger.maxLogSize = 2 * 1024 * 1024; // size quota for each log file
    this.constructor.prototype._fileLogger.onLogSwap = function(newLogFile) {
      self.constructor.prototype._fileLogger.listLogFiles(function(fileEntries) {
            var oldAge = new Date(Date.now() - (self._keepFiles * 24 * 60 * 60 * 1000));
            var chainedDeleter = function(fileArray, callback, index) {
              index = (index) ? index : 0;
              if (index >= fileArray.length) {
                if (typeof callback == 'function') {
                  callback(); // call callback() after removing all the old log files
                }
              } else {
                fileArray[index].file(function(f) {
                  LOG.debug("Checking if " + f.name + " is older than "
                      + oldAge.toString());
                  LOG.debug(f.lastModifiedDate.toString());
                  if (f.lastModifiedDate.isBefore(oldAge)
                      && f.name != newLogFile.name) {
                    LOG.debug("Removing old log file: " + f.name + " -> "
                        + fileArray[index].name);
                    fileArray[index].remove(function() {
                      chainedDeleter(fileArray, callback, ++index);
                    });
                  } else {
                    chainedDeleter(fileArray, callback, ++index);
                  }
                });
              }
            };
            chainedDeleter(fileEntries, function() {
              chrome.extension.sendRequest(new Downsha.RequestMessage(
                  Downsha.Constants.RequestType.LOG_FILE_SWAPPED));
            });
          });
    };
  }
  return this.constructor.prototype._fileLogger;
};
Downsha.FileLoggerImpl.prototype._logToFile = function(str) {
  if (this.enabled) {
    this.fileLogger.log(str);
  }
};
