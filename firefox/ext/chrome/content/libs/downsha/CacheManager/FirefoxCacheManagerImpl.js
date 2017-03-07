/**
 * @author: chenmin
 * @date: 2011-09-09
 * @desc: specific implementor for firefox
 */

(function() {
	var LOG = null;
	Downsha.FirefoxCacheManagerImpl = function FirefoxCacheManagerImpl() {
		LOG = Downsha.Logger.getInstance();
		this.__defineGetter__("cacheService", this.getCacheService);
		this.initialize();
	};
	Downsha.inherit(Downsha.FirefoxCacheManagerImpl, Downsha.CacheManagerImpl, true);
	Downsha.FirefoxCacheManagerImpl.isResponsibleFor = function(navigator) {
		return navigator.userAgent.toLowerCase().indexOf("firefox") >= 0;
	};
	
	Downsha.FirefoxCacheManagerImpl.prototype.CACHE_XHR_TIMEOUT = 3000; // timeout for xhr
	Downsha.FirefoxCacheManagerImpl.prototype._caches = []; // internal cache entries
	
	Downsha.FirefoxCacheManagerImpl.prototype._useCacheService = true; // whether use firefox cache service
	Downsha.FirefoxCacheManagerImpl.prototype._cacheService = null; // firefox xpcom cache service
	//Downsha.FirefoxCacheManagerImpl.prototype._cacheEntries = []; // only for firefox cache services
	Downsha.FirefoxCacheManagerImpl.prototype._clientID = "HTTP"; // default client id
	Downsha.FirefoxCacheManagerImpl.prototype._storagePolicy = Components.interfaces.nsICache.STORE_ANYWHERE;
	Downsha.FirefoxCacheManagerImpl.prototype._streamBased = Components.interfaces.nsICache.STREAM_BASED;
	Downsha.FirefoxCacheManagerImpl.prototype._accessRequested = Components.interfaces.nsICache.ACCESS_READ;
	Downsha.FirefoxCacheManagerImpl.prototype._blockingMode = Components.interfaces.nsICache.NON_BLOCKING;
	
	Downsha.FirefoxCacheManagerImpl.prototype.initialize = function() {
	};
	Downsha.FirefoxCacheManagerImpl.prototype.startCache = function() {
		LOG.debug("startCache");
		// reset cache array
		this._caches = [];
	
		// determine which cache strategy should we use
		if (this._useCacheService) {
			if(Downsha.platform.isLinux()) { // cache service would be blocked in ubuntu firefox 3.6/6.0
				this._useCacheService = false;
			} else if (this.cacheService) { // initialize lazy-mode
				/*
				this._cacheEntries = [];
				this.cacheService.visitEntries(this); // set this as nsICacheVisitor object
				*/
			} else {
				this._useCacheService = false;
			}
		}
	};
	Downsha.FirefoxCacheManagerImpl.prototype.isComplete = function() {
		var cacheLoadings = 0;
		var cacheSuccesses = 0;
		var cacheErrors = 0;
		for (var i in this._caches) {
			if (this._caches[i].status == Downsha.Cache.CACHE_STATUS_LOADING) {
				cacheLoadings ++;
			} else if (this._caches[i].status == Downsha.Cache.CACHE_STATUS_SUCCESS) {
				cacheSuccesses ++;
			} else if (this._caches[i].status == Downsha.Cache.CACHE_STATUS_ERROR) {
				cacheErrors ++;
			}
		}
		LOG.debug("isComplete cache total: " + this._caches.length + ", loading: " + 
			cacheLoadings + ", success: " + cacheSuccesses + ", error: " + cacheErrors);
		
		if (cacheLoadings > 0) {
			return false;
		}
		return true;
	};
	Downsha.FirefoxCacheManagerImpl.prototype.getCaches = function() {
		var caches = [];
		for (var i in this._caches) {
			if (this._caches[i].status == Downsha.Cache.CACHE_STATUS_SUCCESS 
				&& this._caches[i].data && this._caches[i].data.length > 0) {
				caches.push(this._caches[i]);
			}
		}
		return caches;
	};
	Downsha.FirefoxCacheManagerImpl.prototype.getCache = function(url) {
		for (var i in this._caches) {
			if (this._caches[i] && this._caches[i].url == url) {
				if (this._caches[i].status == Downsha.Cache.CACHE_STATUS_SUCCESS 
					&& this._caches[i].data && this._caches[i].data.length > 0) {
					return this._caches[i];
				} else {
					return null;
				}
			}
		}
		return null;
	};
	Downsha.FirefoxCacheManagerImpl.prototype.addCaches = function(urls, success, error) {
	  if (urls instanceof Array) { // array of urls
	  	var _urls = [].concat(urls);
	  	for (var i in _urls) {
	  		this.addCache(_urls[i].url, _urls[i].background, success, error);
	  	}
	  } else if (typeof urls == "string") { // url string
	  	this.addCache(urls, 0, success, error);
	  }
	};
	Downsha.FirefoxCacheManagerImpl.prototype.addCache = function(url, background, success, error) {
		var self = this;
		var successCallback = function(cache) { // callback for success
			LOG.debug("addCache ok for url: " + cache.url + ", data length: " + cache.data.length);
			if (typeof cache.type != "string" || cache.type.length == 0) {
				Downsha.Cache.guessTypeByUrl(cache); // complete content-type if possible
				LOG.debug("guessTypeByUrl url: " + cache.url + ", type: " + cache.type);
			}
			cache.status = Downsha.Cache.CACHE_STATUS_SUCCESS;
			if (typeof success == 'function') {
				success(cache);
			}
		};
		var errorCallback = function(cache) { // callback for error
			LOG.debug("addCache error for url: " + cache.url);
			cache.status = Downsha.Cache.CACHE_STATUS_ERROR;
			if (typeof error == 'function') {
				error(cache);
			}
		};
		
		// validation and entry initialization
		if (typeof url != "string" || url.length == 0) {
			return ;
		}
		for (var i in self._caches) {
			if (self._caches[i] && self._caches[i].url == url) {
				LOG.debug("addCache already exists, url: " + url);
				return ;
			}
		}
		var cache = new Downsha.Cache({
			url : url,
			background : background, 
			status : Downsha.Cache.CACHE_STATUS_LOADING});
		self._caches.push(cache);
	
		setTimeout(
			function() {
				// use cache service if possible, and xhr as fallback 
				if (self._useCacheService && self.getCacheByCacheService(cache)) {
					successCallback(cache);
				} else {
					self.getCacheByXHR(cache, successCallback, errorCallback);
				}
			}, 1);
	};
	Downsha.FirefoxCacheManagerImpl.prototype.getCacheByXHR = function(cache, success, error) {
	  var self = this;
	  var ajaxOpts = {
	    url : cache.url,
	    type : "GET",
	    async : true, // asynchronous mode
	    cache : true, // local cache is encouraged
	    timeout : self.CACHE_XHR_TIMEOUT, // timeout
	    /**
	     * mimeType was added in jQuery 1.5.1 and later version.
	     * this overrides the MIME type, forcing the browser to treat it as plain text, using a user-defined character set.
	     * this also tells the browser not to parse it, and to let the bytes pass through unprocessed.
	     * https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest
	     * xhr.overrideMimeType('text/plain; charset=x-user-defined');
	     */
	    mimeType : "text/plain; charset=x-user-defined",
	    success : function(text, status, xhr) {
	      if (xhr.readyState == 4 && xhr.status == 200 && text.length > 0) {
	        LOG.debug("cache ajax ok, url: " + cache.url + ", data length: " + text.length);
	        
	        // throw away high order bytes and form binary data
	        cache.data = [];
	        cache.data.length = text.length;
	        for (var i = 0; i < cache.data.length; i++) {
	        	cache.data[i] = text.charCodeAt(i) & 0xff;
	        }
					cache.type = xhr.getResponseHeader("Content-Type");
					if (cache.type != null) {
						var typeEnd = cache.type.indexOf(";");
						if (typeEnd > 0) {
							cache.type = cache.type.substring(0, typeEnd);
						}
						
						if (cache.type.indexOf("text/plain") >= 0) {
							cache.type = null;
						}
					}
					cache.encoding = xhr.getResponseHeader("Content-Encoding");
					if (cache.encoding != null) {
						var encodingEnd = cache.encoding.indexOf(";");
						if (encodingEnd > 0) {
							cache.encoding = cache.encoding.substring(0, encodingEnd);
						}
					}
					
	        if (typeof success == 'function') {
	        	success(cache);
	        }
	      } else {
	        LOG.error("cache ajax error, url: " + cache.url + ", readyState: " + xhr.readyState 
		        	+ ", status: " + xhr.status + ", data length: " + text.length);
	        if (typeof error == 'function') {
	        	error(cache);
	        }
	      }
	    },
	    error : function(xhr, status, err) {
	      LOG.error("cache ajax error, url: " + cache.url + ", readyState: " + xhr.readyState + 
		      	", status: " + xhr.status + ", error: " + (err ? err : "unknown"));
	      if (typeof error == 'function') {
	      	error(cache);
	      }
	    }
	  };
	  LOG.debug("cache ajax sending, url: " + cache.url);
	  // DO NOT use $.ajax(ajaxOpts), cuz firefox 6.0.2 throws exception "$ is not defined"
	  Downsha.getjQuery().ajax(ajaxOpts);
	};
	
	Downsha.FirefoxCacheManagerImpl.prototype.getCacheService = function() {
		if (this._cacheService == null) {
			this._cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
				.getService(Components.interfaces.nsICacheService);
		}
		return this._cacheService;
	};
	
	// ***** nsICacheVisitor implementor *****
	/*
	Downsha.FirefoxCacheManagerImpl.prototype.visitDevice = function(deviceID, deviceInfo) {
		// This method is called to provide information about a cache device.
		// Returns true to start visiting all entries for this device, 
		// otherwise returns false to advance to the next device.
		if (deviceID == "offline") return true;
		
		var entryCount = deviceInfo.entryCount;
		var totalSize = Math.round(deviceInfo.totalSize / (1024 * 1024) * 100) / 100;
		var maximumSize = Math.round(deviceInfo.maximumSize / (1024 * 1024) * 100) / 100;
		var usageRatio = 0;
		if (deviceInfo.maximumSize > 0) {
			usageRatio = Math.round(deviceInfo.totalSize / deviceInfo.maximumSize * 100);
		}
		
		LOG.debug("cache device id: " + deviceID + ", entry count: " + entryCount);
		LOG.debug("cache total size: " + totalSize + "MB, maximum size: " + maximumSize + "MB, usage ratio: " + usageRatio + "%");
		return true;
	};
	Downsha.FirefoxCacheManagerImpl.prototype.visitEntry = function(deviceID, entryInfo) {
		// This method is called to provide information about a cache entry.
		// Returns true to visit the next entry on the current device, 
		// or if the end of the device has been reached, advance to the next device, 
		// otherwise returns false to advance to the next device.
		if (entryInfo.clientID == this._clientID) return true; // only keep those unusal clientID
		if (entryInfo.dataSize == 0) return true;
		if (entryInfo.key.indexOf("http") != 0) return true;
		
		LOG.debug("store cache url: " + entryInfo.key + ", clientID: " + entryInfo.clientID + ", dataSize: " + entryInfo.dataSize);
		this._cacheEntries.push({key : entryInfo.key, clientID : entryInfo.clientID, streamBased : entryInfo.isStreamBased() ? 1 : 0});
		return true;
	};
	*/
	// get cache data by cache service
	Downsha.FirefoxCacheManagerImpl.prototype.openCacheEntry = function(url) {
		try {
			var clientID = this._clientID;
			/*
			for (var i in this._cacheEntries) {
				if (this._cacheEntries[i] && this._cacheEntries[i].key == url) {
					clientID = this._cacheEntries[i].clientID;
					break;
				}
			}
			*/
			var cacheSession = this.cacheService.createSession(clientID, this._storagePolicy, this._streamBased);
			if (typeof cacheSession != "object" || cacheSession == null)
				return null;
			cacheSession.doomEntriesIfExpired = false;
			// cache service would be blocked in ubuntu firefox 3.6/6.0
			return cacheSession.openCacheEntry(url, this._accessRequested, this._blockingMode);
		} catch(e) {
			LOG.warn("exception occurred when creating cache session.");
			// 0x804b003d NS_ERROR_CACHE_KEY_NOT_FOUND
			// 0x804b0040 NS_ERROR_CACHE_WAIT_FOR_VALIDATION (NON-BLOCKING MODE)
			// 0x804b0044 NS_ERROR_CACHE_IN_USE
			return null;
		}
	};
	Downsha.FirefoxCacheManagerImpl.prototype.getCacheByCacheService = function(cache) {
		var cacheDescriptor = this.openCacheEntry(cache.url);
		if (typeof cacheDescriptor != "object" || cacheDescriptor == null)
			return false;
	
		try {
			// parse response-head and get cache content-type and content-encoding
			var headBegin = "";
			var headEnd = "";	
			var contentTypeHead = "Content-Type: ";
			var contentEncodingHead = "Content-Encoding: ";		
			var responseHead = cacheDescriptor.getMetaDataElement("response-head");
			if (typeof responseHead == "string" && responseHead.length > 0) {
				headBegin = responseHead.indexOf(contentTypeHead); // get content-type
				if (headBegin > 0) {
					headEnd = responseHead.indexOf("\n", headBegin + contentTypeHead.length);
					cache.type = responseHead.substring(headBegin + contentTypeHead.length, headEnd - 1);
					headEnd = cache.type.indexOf(";");
					if (headEnd > 0) cache.type = cache.type.substring(0, headEnd);
				}
				
				headBegin = responseHead.indexOf(contentEncodingHead); // get content-encoding
				if (headBegin > 0) {
					headEnd = responseHead.indexOf("\n", headBegin + contentEncodingHead.length);
					cache.encoding = responseHead.substring(headBegin + contentEncodingHead.length, headEnd - 1);
					headEnd = cache.encoding.indexOf(";");
					if (headEnd > 0) cache.encoding = cache.encoding.substring(0, headEnd);
				}
			}
		} catch(e) {
			// ignore exception here, cuz we might still get cache data without content-type and content-encoding
			LOG.warn("exception occurred when getting content-type and content-encoding.");
		}
		
		try {
			var cacheInputStream = cacheDescriptor.openInputStream(0);
			if (typeof cache.encoding == "string" && cache.encoding.length > 0) {
				//convert cache stream from deflat/zip to uncompressed
				var converterService = Components.classes["@mozilla.org/streamConverters;1"].getService(Components.interfaces.nsIStreamConverterService);
				var streamListener = converterService.asyncConvertData(cache.encoding, "uncompressed", new Downsha.StreamListener(cache), null);
				streamListener.onStartRequest(null, null);
				streamListener.onDataAvailable(null, null, cacheInputStream, 0, cacheInputStream.available());
				streamListener.onStopRequest(null, null, null);
			} else {
				// get cache data from input stream directly
				var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
				binaryInputStream.setInputStream(cacheInputStream);
				cache.data = binaryInputStream.readByteArray(binaryInputStream.available());
				binaryInputStream.close();
			}
		} catch(e) {
			LOG.warn("exception occurred when getting content-data.");
			cacheDescriptor.close();
			return false;
		}
		
		cacheDescriptor.close();
		var dataLength = (typeof cache.data != "undefined" && cache.data != null) ? cache.data.length : 0;
		LOG.debug("get cache url: " + cache.url + ", type: " + (cache.type ? cache.type : "unknown") + ", encoding: " + (cache.encoding ? cache.encoding : "unknown") + ", size: " + dataLength);
		if (dataLength <= 0) {
			return false;
		}
		return true;
	};
	
	// ***** StreamListener for Asynchronous Converter *****
	Downsha.StreamListener = function StreamListener(cache) {
		this._cache = cache;
		this._cache.data = "";
	};
	Downsha.StreamListener.prototype.onStartRequest = function(request, context) {
	};
	Downsha.StreamListener.prototype.onStopRequest = function(request, context, statusCode) {
	};
	Downsha.StreamListener.prototype.onDataAvailable = function(request, context, inputStream, offset, count) {
		var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
			.createInstance(Components.interfaces.nsIBinaryInputStream);
		binaryInputStream.setInputStream(inputStream);
		this._cache.data += binaryInputStream.readBytes(binaryInputStream.available());
		binaryInputStream.close();
	};
})();
