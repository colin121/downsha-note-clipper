(function() {
  var LOG = null;
  Downsha.FSA = function FSA(type, size, successCallback, errorCallback) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(type, size, successCallback, errorCallback);
  };

  Downsha.FSA.prototype._type = null;
  Downsha.FSA.prototype._size = 0;
  Downsha.FSA.prototype._fsys = null;
  Downsha.FSA.prototype._sema = null;
  Downsha.FSA.prototype._currentDirectory = null;

  Downsha.FSA.prototype.initialize = function(type, size, successCallback, errorCallback) {
    var self = this;
    this.__defineGetter__("root", this.getRoot);
    this.__defineGetter__("currentDirectory", this.getCurrentDirectory);
    this._type = parseInt(type);
    if (isNaN(this._type) || this._type < 0) {
      this._type = 0;
    }
    this._size = parseInt(size);
    if (isNaN(this._size) || this._size < 0) {
      this._size = 0;
    }
    this._sema = Downsha.Semaphore.mutex();
    this._sema.critical(function() {
      self.requestFileSystem(this._type, this._size, function(fsObj) {
        LOG.debug("Successful request for FileSystem");
        self._fsys = fsObj;
        self._sema.signal();
        if (typeof successCallback == 'function') {
          successCallback(fsObj);
        }
      }, function(e) {
        LOG.error("Failed request for FileSystem: " + e.code);
        self._sema.signal();
        if (typeof errorCallback == 'function') {
          errorCallback(e);
        }
      });
    });
  };
  Downsha.FSA.prototype.requestFileSystem = function(type, size, success, error) {
    // Note: The file system has been prefixed as of Google Chrome 12
    if (typeof window.requestFileSystem == 'function') {
      window.requestFileSystem(type, size, success, error);
    } else if (typeof window.webkitRequestFileSystem == 'function') {
      window.webkitRequestFileSystem(type, size, success, error);
    } else {
      throw new Downsha.FSAError(Downsha.FSAError.NO_SUITABLE_FILESYSTEM_REQUESTOR);
    }
  };
  Downsha.FSA.prototype.createBlobBuilder = function() {
    if (typeof BlobBuilder == 'function') {
      return new BlobBuilder();
    } else if (typeof WebKitBlobBuilder == 'function') {
      return new WebKitBlobBuilder();
    } else {
      throw new Downsha.FSAError(Downsha.FSAError.NO_SUITABLE_BLOB_BUILDER);
    }
  };
  Downsha.FSA.prototype.getRoot = function() {
    if (this._fsys) {
      return this._fsys.root;
    } else {
      return undefined;
    }
  };
  Downsha.FSA.prototype.dirname = function(path) {
    var parts = path.split("/");
    parts.splice(-1);
    return parts.join("/");
  };
  Downsha.FSA.prototype.getCurrentDirectory = function() {
    if (!this._currentDirectory) {
      this._currentDirectory = this.root;
    }
    return this._currentDirectory;
  };
  Downsha.FSA.prototype.changeDirectory = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.changeDirectory: " + path);
    var self = this;
    this._getDirectory(path, null, function(dir) {
      LOG.debug("Successfully changed directory to: " + dir.fullPath);
      self._currentDirectory = dir;
      if (typeof successCallback == 'function') {
        successCallback.apply(self, arguments);
      }
    }, function(e) {
      LOG.error("Error changing directory to: " + path);
      if (typeof errorCallback == 'function') {
        errorCallback.apply(self, arguments);
      }
    });
  };
  Downsha.FSA.prototype.createDirectory = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.createDirectory: " + path);
    this._getDirectory(path, {
      create : true,
      exclusive : true
    }, successCallback, errorCallback);
  };
  Downsha.FSA.prototype.getCreateDirectory = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.getCreateDirectory: " + path);
    this._getDirectory(path, {
      create : true
    }, successCallback, errorCallback);
  };
  Downsha.FSA.prototype.ensureDirectory = function(path, successCallback, errorCallback, startAt, curDir) {
    LOG.debug("FSA.ensureDirectory");
    var self = this;
    var parts = (path instanceof Array) ? path : path.split("/");
    var r = this.currentDirectory;
    if (!startAt || startAt < 0) {
      startAt = 0;
    }
    while (startAt <= (parts.length - 1) && !parts[startAt]) {
      r = this.root;
      startAt++;
    }
    if (startAt >= parts.length) {
      if (typeof successCallback == 'function') {
        successCallback(r);
        return;
      }
    }
    if (!curDir) {
      curDir = this.currentDirectory;
    }
    LOG.debug("Attempting to retrieve/create directory: " + parts.slice(startAt, startAt + 1));
    this.getCreateDirectory(parts.slice(startAt, startAt + 1), function(dir) {
      if (startAt < (parts.length - 1)) {
        self._currentDirectory = dir;
        self.ensureDirectory(parts, successCallback, errorCallback, (startAt + 1), curDir);
      } else {
        if (typeof successCallback == 'function') {
          successCallback(dir);
        }
        self._currentDirectory = curDir;
      }
    }, function(e) {
      LOG.debug("Failed to ensure existence of directory: " + parts.join("/") + "(" + e.code + ")");
      self._currentDirectory = curDir;
      if (typeof errorCallback == 'function') {
        errorCallback.apply(self, arguments);
      }
    });
  };
  Downsha.FSA.prototype.getDirectory = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.getDirectory: " + path);
    this._getDirectory(path, {
      create : false
    }, successCallback, errorCallback);
  };
  Downsha.FSA.prototype._getDirectory = function(path, flags, successCallback, errorCallback) {
    LOG.debug("FSA._getDirectory: " + path);
    var self = this;
    this._sema.critical(function() {
      self.currentDirectory.getDirectory(path, flags, function(dir) {
        LOG.debug("Successfully obtained directory entry: " + dir.fullPath);
        self._sema.signal();
        if (typeof successCallback == 'function') {
          successCallback.apply(self, arguments);
        }
      }, function(e) {
        LOG.error("Failed to obtain directory entry for: " + path + "("
            + e.code + ")");
        self._sema.signal();
        if (typeof errorCallback == 'function') {
          errorCallback.apply(self, arguments);
        }
      });
    });
  };
  Downsha.FSA.prototype.list = function(dir, success, error) {
    LOG.debug("FSA.listDirectory");
    var self = this;
    if (typeof dir == 'string') {
      this._getDirectory(dir, null, function(dirEntry) {
        self.list(dirEntry, success, error); // recursive traversal
      }, error);
      return;
    }
    if (!dir) {
      dir = this.currentDirectory;
    }
    var reader = dir.createReader();
    reader.readEntries(success, error);
  };
  Downsha.FSA.prototype.listFiles = function(dir, success, error) {
    LOG.debug("FSA.listFiles");
    this.list(dir, function(entries) {
      if (typeof success == 'function') {
        var files = [];
        for ( var i = 0; i < entries.length; i++) {
          if (entries[i].isFile) {
            files.push(entries[i]);
          }
        }
        success(files);
      }
    }, error);
  };
  Downsha.FSA.prototype.listDirectories = function(dir, success, error) {
    LOG.debug("FSA.listDirectories");
    this.list(dir, function(entries) {
      if (typeof success == 'function') {
        var dirs = [];
        for ( var i = 0; i < entries.length; i++) {
          if (!entries[i].isFile) {
            dirs.push(entries[i]);
          }
        }
        success(dirs);
      }
    }, error);
  };
  Downsha.FSA.prototype.createFile = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.createFile: " + path);
    var self = this;
    this.ensureDirectory(this.dirname(path), function(d) {
      self._getFile(path, {
        create : true,
        exclusive : true
      }, successCallback, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.emptyDirectory = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.emptyDirectory: " + path);
    var self = this;
    this._getDirectory(path, null, function(dir) {
      dir.removeRecursively(function() {
        self.createDirectory(path, successCallback, errorCallback);
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.removeFile = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.createFile: " + path);
    var self = this;
    this.ensureDirectory(this.dirname(path), function(d) {
      self._getFile(path, {
        create : false,
        exclusive : true
      }, function(fileEntry) {
        fileEntry.remove(successCallback, errorCallback);
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.getFile = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.getFile: " + path);
    this._getFile(path, null, successCallback, errorCallback);
  };
  Downsha.FSA.prototype.getCreateFile = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.getCreateFile: " + path);
    var self = this;
    this.ensureDirectory(this.dirname(path), function(d) {
      self._getFile(path, {
        create : true,
        exclusive : false
      }, successCallback, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype._getFile = function(path, flags, successCallback, errorCallback) {
    LOG.debug("FSA._getFile: " + path);
    var self = this;
    this._sema.critical(function() {
      self.currentDirectory.getFile(path, flags, function() {
        LOG.debug("Successfully retrieved file: " + path);
        self._sema.signal();
        if (typeof successCallback == 'function') {
          successCallback.apply(self, arguments);
        }
      }, function(e) {
        LOG.error("Failed to retreive file: " + path + "(" + e.code + ")");
        self._sema.signal();
        if (typeof errorCallback == 'function') {
          errorCallback.apply(self, arguments);
        }
      });
    });
  };
  Downsha.FSA.prototype.writeFile = function(path, content, successCallback, errorCallback) {
    LOG.debug("FSA.writeFile: " + path);
    var self = this;
    this.getCreateFile(path, function(fileEntry) {
      fileEntry.createWriter(function(writer) {
        var bb = self.createBlobBuilder();
        bb.append(content);
        var ontruncateend = function() {
          writer.onwriteend = onwriteend;
          LOG.debug("Writing blob to file [" + writer.readyState + "]");
          writer.write(bb.getBlob());
        };
        var onwriteend = function() {
          LOG.debug("Finished writing file: " + path);
          if (typeof successCallback == 'function') {
            successCallback(writer, fileEntry);
          }
        };
        writer.onwriteend = ontruncateend;
        LOG.debug("Truncating file [" + writer.readyState + "]");
        writer.truncate(0); // truncate old content to zero byte before writing new content
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.appendFile = function(path, content, successCallback, errorCallback) {
    LOG.debug("FSA.appendFile: " + path);
    var self = this;
    this.getCreateFile(path, function(fileEntry) {
      fileEntry.createWriter(function(writer) {
        var bb = self.createBlobBuilder();
        bb.append(content);
        writer.onwriteend = function() {
          LOG.debug("Finished writing file: " + path);
          if (typeof successCallback == 'function') {
            successCallback(writer, fileEntry);
          }
        };
        writer.seek(); // seek to the end of old content before writing new content
        writer.write(bb.getBlob());
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.readTextFile = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.readTextFile: " + path);
    this.createFileReader(path, function(reader, file, fileEntry) {
      reader.onloadend = function() {
        LOG.debug("Finished reading file: " + path);
        if (typeof successCallback == 'function') {
          successCallback(reader, fileEntry);
        }
      };
      reader.readAsText(file);
    }, errorCallback);
  };
  Downsha.FSA.prototype.readTextFromFile = function(file, successCallback, errorCallback) {
    var reader = new FileReader();
    reader.onloadend = function() {
      LOG.debug("Finished reading file: " + file.name);
      if (typeof successCallback == 'function') {
        successCallback(reader, file);
      }
    };
    reader.onerror = errorCallback;
    reader.readAsText(file);
  };
  Downsha.FSA.prototype.createFileReader = function(path, successCallback, errorCallback) {
    LOG.debug("FSA.createFileReader: " + path);
    var self = this;
    this.getFile(path, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        if (typeof successCallback == 'function') {
          successCallback(reader, file, fileEntry);
        }
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.ls = function(dir) {
    var _dir = (typeof dir == 'string') ? dir : this.currentDirectory.name;
    var err = function(e) {
      LOG.error(e);
    };
    var dateToStr = function(date) {
      return date.toString().split(" ").slice(1, 5).join(" ");
    };
    var printFileEntry = function(entry) {
      entry.file(function(f) {
        LOG.debug("f " + f.fileSize + " " + dateToStr(f.lastModifiedDate) + " "
            + f.fileName);
      });
    };
    var printDirEntry = function(entry) {
      entry.getMetadata(function(meta) {
        LOG.debug("d " + " " + dateToStr(meta.modificationTime) + " "
            + entry.name);
      });
    };
    this._getDirectory(_dir, {
      create : false,
      exclusive : false
    }, function(dir) {
      dir.createReader().readEntries(function(entries) {
        LOG.debug(_dir);
        LOG.debug("total " + entries.length);
        for ( var i = 0; i < entries.length; i++) {
          if (entries[i].isDirectory) {
            printDirEntry(entries[i]);
          } else if (entries[i].isFile) {
            printFileEntry(entries[i]);
          }
        }
      }, err);
    }, err);
  };
  /**
   * Maps given array of FileEntry's or DirectoryEntry's, or an EntryArray. The
   * keys of the map are determined by mapFn function. When mapping is complete -
   * callback is called with the map as the only arguments.
   * 
   * mapFn will be called with two arguments - first is the FileEntry or
   * DirectoryEntry, and the second is a callback that needs to be called from
   * within mapFn, passing that callback two arguments - first is the key and
   * second is the file that corresponds to that key.
   * 
   * Example mapping files by their modification time.
   * 
   * <pre>
   * fsa.listFiles(&quot;/foo&quot;, function(files) {
   *   Downsha.FSA.mapEntries(files, function(file, cb) {
   *     file.getMetadata(function(meta) {
   *       cb(meta.modificationTime.getTime(), file);
   *     });
   *   }, function(map) {
   *     console.dir(map)
   *   })
   * })
   * </pre>
   * 
   * @param entries
   * @param mapFn
   * @param callback
   * @return
   */
  Downsha.FSA.mapEntries = function(entries, mapFn, callback) {
    var sema = Downsha.Semaphore.mutex();
    var map = {};
    var x = 0;
    for ( var i = 0; i < entries.length; i++) {
      sema.critical(function() {
        var file = entries[x];
        mapFn(file, function(key, val) {
          map[key] = val;
          x++;
          sema.signal();
        });
      });
    }
    sema.critical(function() {
      callback(map);
    });
  };

  /**
   * Sorts given array of FileEntry's or DirectoryEntry's, or an EntryArray, and
   * passes the resulting array of entries to the given callback.
   * 
   * Sorting is done by first constructing a map of keys to entries using mapFn
   * function. If mapFn is not given, the default behavior will be to map
   * entries to their file names.
   * 
   * After the map is created, the given entries are sorted based on their
   * corresponsing keys in that map using sortFn function. If sortFn is not
   * supplied, the default behavior will be to sort by keys in an ascending
   * order - similarly to Array.prototype.sort.
   * 
   * Once the sorting is done, the resulting Array of entries will be passed to
   * the given callback function.
   * 
   * Example sorting entries by their modification time in reverse order.
   * 
   * <pre>
   * fsa.listFiles(&quot;/foo&quot;, function(files) {
   *   Downsha.FSA.sortEntries(files, function(f, cb) {
   *     f.getMetadata(function(meta) {
   *       cb(meta.modificationTime.getTime(), f);
   *     });
   *   }, function(a, b, fileArray, fileMap) {
   *     if (a == b) {
   *       return 0;
   *     } else if (a &gt; b) {
   *       return -1;
   *     } else {
   *       return 1;
   *     }
   *   }, function(filesArray) {
   *     console.dir(filesArray);
   *   });
   * })
   * </pre>
   * 
   * @param entries
   * @param mapFn
   * @param sortFn
   * @param callback
   * @return
   */
  Downsha.FSA.sortEntries = function(entries, mapFn, sortFn, callback) {
    var entriesArray = [];
    if (entries instanceof Array) {
      entriesArray = entries;
    } else if (entries.length > 0) {
      for ( var i = 0; i < entries.length; i++) {
        entriesArray.push(entries[i]);
      }
    }
    if (typeof mapFn != 'function') {
      mapFn = function(f, cb) {
        cb(f.name, f);
      };
    }
    if (typeof sortFn != 'function') {
      sortFn = function(a, b) {
        if (a == b) {
          return 0;
        } else {
          return (a > b) ? 1 : -1;
        }
      };
    }
    this.mapEntries(entries, mapFn, function(map) {
      entriesArray.sort(function(a, b) {
        var aKey = null;
        var bKey = null;
        for ( var i in map) {
          if (map[i] == a) {
            aKey = i;
          } else if (map[i] == b) {
            bKey = i;
          }
        }
        return sortFn(aKey, bKey, entriesArray, map);
      });
      callback(entriesArray);
    });
  };

  Downsha.FSAError = function(code) {
    this.code = parseInt(code);
    if (isNaN(this.code)) {
      this.code = Downsha.FSAError.UNKNOWN_ERROR;
    }
  };
  Downsha.inherit(Downsha.FSAError, Error);
  Downsha.FSAError.UNKNOWN_ERROR = 0;
  Downsha.FSAError.NO_SUITABLE_FILESYSTEM_REQUESTOR = 1;
  Downsha.FSAError.NO_SUITABLE_BLOB_BUILDER = 2;
  Downsha.FSAError.prototype.code = Downsha.FSAError.UNKNOWN_ERROR;
  Downsha.FSAError.prototype.valueOf = function() {
    return this.code;
  };
  Downsha.FSAError.prototype.toString = function() {
    return "Downsha.FSAError: " + this.code;
  };
})();
