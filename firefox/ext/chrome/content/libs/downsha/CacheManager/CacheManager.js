/**
 * @author: chenmin
 * @date: 2011-09-09
 * @desc: abstract definition of local cache (disk or memory) manipulation
 */

(function() {
	Downsha.CacheManager = function CacheManager(impl) {
	  this.__defineGetter__("impl", this.getImplementation);
	  this.__defineSetter__("impl", this.setImplementation);
	  this.initialize(impl);
	};
	Downsha.CacheManager.prototype._impl = null;
	Downsha.CacheManager.prototype.initialize = function(impl) {
	  if (typeof impl == 'undefined' && typeof navigator == 'object'
	      && navigator != null) {
	    var implClass = Downsha.CacheManagerImplFactory
	        .getImplementationFor(navigator); // get specific implementation based on user agent
	    if (implClass) {
	      impl = new implClass();
	    }
	  }
	  this.setImplementation(impl);
	};
	Downsha.CacheManager.prototype.setImplementation = function(impl) {
	  if (impl instanceof Downsha.CacheManagerImpl) {
	    this._impl = impl;
	  } else if (impl == null) {
	    this._impl = null;
	  }
	};
	Downsha.CacheManager.prototype.getImplementation = function() {
	  return this._impl;
	};
	Downsha.CacheManager.prototype.startCache = function() {
		return this._impl.startCache();
	};
	Downsha.CacheManager.prototype.isComplete = function() {
		return this._impl.isComplete();
	};
	Downsha.CacheManager.prototype.getCaches = function() {
		return this._impl.getCaches();
	};
	Downsha.CacheManager.prototype.getCache = function(url) {
		return this._impl.getCache(url);
	};
	Downsha.CacheManager.prototype.addCaches = function(urls, success, error) {
	  return this._impl.addCaches(urls, success, error);
	};
	Downsha.CacheManager.prototype.addCache = function(url, success, error) {
	  return this._impl.addCache(url, success, error);
	};
	
	Downsha.CacheManagerImplFactory = {
	  getImplementationFor : function(navigator) {
	    var reg = Downsha.CacheManagerImpl.ClassRegistry; // enumerate all the registered implementors
	    for ( var i = 0; i < reg.length; i++) {
	      if (typeof reg[i] == 'function'
	          && typeof reg[i].isResponsibleFor == 'function'
	          && reg[i].isResponsibleFor(navigator)) { // return the first matched implementor
	        return reg[i];
	      }
	    }
	    return null;
	  }
	};
	
	Downsha.CacheManagerImpl = function CacheManagerImpl() {
	};
	Downsha.CacheManagerImpl.ClassRegistry = new Array();
	Downsha.CacheManagerImpl.handleInheritance = function(child, parent) {
	  Downsha.CacheManagerImpl.ClassRegistry.push(child);
	};
	Downsha.CacheManagerImpl.isResponsibleFor = function(navigator) {
	  return false;
	};
	Downsha.CacheManagerImpl.prototype.startCache = function() {
		throw new Error("Must subclass Downsha.CacheManagerImpl.startCache");
	};
	Downsha.CacheManagerImpl.prototype.isComplete = function() {
		throw new Error("Must subclass Downsha.CacheManagerImpl.isComplete");
	};
	Downsha.CacheManagerImpl.prototype.getCaches = function() {
		throw new Error("Must subclass Downsha.CacheManagerImpl.getCaches");
	};
	Downsha.CacheManagerImpl.prototype.getCache = function(url) {
		throw new Error("Must subclass Downsha.CacheManagerImpl.getCache");
	};
	Downsha.CacheManagerImpl.prototype.addCaches = function(urls, success, error) {
	  throw new Error("Must subclass Downsha.CacheManagerImpl.addCache");
	};
	Downsha.CacheManagerImpl.prototype.addCache = function(url, success, error) {
	  throw new Error("Must subclass Downsha.CacheManagerImpl.addCache");
	};
	
	Downsha.Cache = function Cache(obj) {
	  this.initialize(obj);
	};
	Downsha.Cache.CACHE_STATUS_LOADING = 0; // status: loading
	Downsha.Cache.CACHE_STATUS_SUCCESS = 1; // status: success
	Downsha.Cache.CACHE_STATUS_ERROR = 2; // status: error
	Downsha.Cache.MIME_TRANSLATIONS = {
		// image
		"jpg" : "image/jpeg",
		"jpeg" : "image/jpeg",
		"gif" : "image/gif",
		"png" : "image/png",
		"tif" : "image/tiff",
		"tiff" : "image/tiff",
		"wbmp" : "image/vnd.wap.wbmp",
		"ico" : "image/x-icon",
		"jng" : "image/x-jng",
		"bmp" : "image/x-ms-bmp",
		"svg" : "image/svg+xml",
		"swf" : "application/x-shockwave-flash"
		// text
		/*
		"html" : "text/html",
		"htm" : "text/html",
		"shtml" : "text/html",
		"css" : "text/css",
		"xml" : "text/xml",
		"mml" : "text/mathml",
		"txt" : "text/plain",
		"jad" : "text/vnd.sun.j2me.app-descriptor",
		"wml" : "text/vnd.wap.wml",
		"htc" : "text/x-component",
		*/
		// audio
		/*
		"mp3" : "audio/mpeg",
		"mid" : "audio/midi",
		"midi" : "audio/midi",
		"kar" : "audio/midi",
		"ra" : "audio/x-realaudio",
		*/
		// video
		/*
		"3gp" : "video/3gpp",
		"3gpp" : "video/3gpp",
		"mpeg" : "video/mpeg",
		"mpg" : "video/mpeg",
		"mov" : "video/quicktime",
		"flv" : "video/x-flv",
		"mng" : "video/x-mng",
		"asf" : "video/x-ms-asf",
		"asx" : "video/x-ms-asf",
		"wmv" : "video/x-ms-wmv",
		"avi" : "video/x-msvideo",
		*/
		// application
		/*
		"swf" : "application/x-shockwave-flash",
		"js" : "application/x-javascript",
		"zip" : "application/zip",
		"7z" : "application/x-7z-compressed",
		"xpi" : "application/x-xpinstall",
		"atom" : "application/atom+xml",
		"rss" : "application/rss+xml",
		"jar" : "application/java-archive",
		"war" : "application/java-archive",
		"ear" : "application/java-archive",
		"hqx" : "application/mac-binhex40",
		"doc" : "application/msword",
		"pdf" : "application/pdf",
		"ps" : "application/postscript",
		"eps" : "application/postscript",
		"ai" : "application/postscript",
		"rtf" : "application/rtf",
		"xls" : "application/vnd.ms-excel",
		"ppt" : "application/vnd.ms-powerpoint",
		"wmlc" : "application/vnd.wap.wmlc",
		"xhtml" : "application/vnd.wap.xhtml+xml",
		"kml" : "application/vnd.google-earth.kml+xml",
		"kmz" : "application/vnd.google-earth.kmz",
		"cco" : "application/x-cocoa",
		"jardiff" : "application/x-java-archive-diff",
		"jnlp" : "application/x-java-jnlp-file",
		"run" : "application/x-makeself",
		"pl" : "application/x-perl",
		"pm" : "application/x-perl",
		"prc" : "application/x-pilot",
		"pdb" : "application/x-pilot",
		"rar" : "application/x-rar-compressed",
		"rpm" : "application/x-redhat-package-manager",
		"sea" : "application/x-sea",
		"sit" : "application/x-stuffit",
		"tcl" : "application/x-tcl",
		"tk" : "application/x-tcl",
		"der" : "application/x-x509-ca-cert",
		"pem" : "application/x-x509-ca-cert",
		"crt" : "application/x-x509-ca-cert",
		*/
		//octect
		/*
		"bin" : "application/octet-stream",
		"exe" : "application/octet-stream",
		"dll" : "application/octet-stream",
		"iso" : "application/octet-stream",
		"img" : "application/octet-stream",
		"deb" : "application/octet-stream",
		"dmg" : "application/octet-stream",
		"eot" : "application/octet-stream",
		"msi" : "application/octet-stream",
		"msp" : "application/octet-stream",
		"msm" : "application/octet-stream"
		*/
	};
	Downsha.Cache.guessTypeByUrl = function(cache) {
		if (!cache || !cache.url || cache.url.length == 0) {
			return ;
		}
		var extIndex = cache.url.lastIndexOf(".");
		if (extIndex < 0) {
			return ;
		}
		var fileExtName = cache.url.substr(extIndex + 1);
		if (typeof fileExtName != "string" || fileExtName.length == 0) {
			return ;
		}
		fileExtName = fileExtName.toLowerCase();
	  if (typeof Downsha.Cache.MIME_TRANSLATIONS[fileExtName] != 'undefined') {
	  	cache.type = Downsha.Cache.MIME_TRANSLATIONS[fileExtName];
	  }
	};
	
	Downsha.Cache.prototype.url = null; // cache url
	Downsha.Cache.prototype.status = Downsha.Cache.CACHE_STATUS_LOADING; // cache status
	Downsha.Cache.prototype.type = null; // cache content-type
	Downsha.Cache.prototype.encoding = null; // cache content-encoding
	Downsha.Cache.prototype.data = null; //cache data
	Downsha.Cache.prototype.background = null; //whether background image
	Downsha.Cache.prototype.initialize = function(obj) {
	  if (typeof obj == 'object' && obj != null) {
	    for ( var i in this) {
	      if (typeof this[i] != 'function' && typeof obj[i] != 'undefined') {
	        this[i] = obj[i];
	      }
	    }
	  }
	};
})();
