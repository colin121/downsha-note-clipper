/**
 * @author: chenmin
 * @date: 2011-10-15
 * @desc: specific implementor for chrome
 */
(function() {
	var LOG = null;
	Downsha.ChromeCacheManagerImpl = function ChromeCacheManagerImpl() {
		LOG = Downsha.Logger.getInstance();
		this.initialize();
	};
	Downsha.inherit(Downsha.ChromeCacheManagerImpl, Downsha.CacheManagerImpl, true);
	Downsha.ChromeCacheManagerImpl.isResponsibleFor = function(navigator) {
		return navigator.userAgent.toLowerCase().indexOf("chrome/") >= 0;
	};
	
	Downsha.ChromeCacheManagerImpl.prototype.CACHE_XHR_TIMEOUT = 3000; // timeout for xhr
	Downsha.ChromeCacheManagerImpl.prototype._caches = []; // internal cache entries
	
	Downsha.ChromeCacheManagerImpl.prototype.initialize = function() {
	};
	Downsha.ChromeCacheManagerImpl.prototype.startCache = function() {
		LOG.debug("startCache");
		// reset cache array
		this._caches = [];
	};
	Downsha.ChromeCacheManagerImpl.prototype.isComplete = function() {
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
	Downsha.ChromeCacheManagerImpl.prototype.getCaches = function() {
		var caches = [];
		for (var i in this._caches) {
			if (this._caches[i].status == Downsha.Cache.CACHE_STATUS_SUCCESS 
				&& this._caches[i].data && this._caches[i].data.length > 0) {
				caches.push(this._caches[i]);
			}
		}
		return caches;
	};
	Downsha.ChromeCacheManagerImpl.prototype.getCache = function(url) {
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
	Downsha.ChromeCacheManagerImpl.prototype.addCaches = function(urls, success, error) {
	  if (urls instanceof Array) { // array of urls
	  	var _urls = [].concat(urls);
	  	for (var i in _urls) {
	  		this.addCache(_urls[i].url, _urls[i].background, success, error);
	  	}
	  } else if (typeof urls == "string") { // url string
	  	this.addCache(urls, 0, success, error);
	  }
	};
	Downsha.ChromeCacheManagerImpl.prototype.addCache = function(url, background, success, error) {
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
				self.getCacheByXHR(cache, successCallback, errorCallback);
			}, 1);
	};
	Downsha.ChromeCacheManagerImpl.prototype.getCacheByXHR = function(cache, success, error) {
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
	  $.ajax(ajaxOpts);
	};
})();
