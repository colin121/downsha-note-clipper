/**
 * @author: chenmin
 * @date: 2012-8-22
 * @desc: convert clipping html to dsml
 */

(function() {
  var LOG = null;
  Downsha.ClipConverter = function ClipConverter() {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("dsInfo", this.getDsInfo);
    this.__defineSetter__("dsInfo", this.setDsInfo);
    this.__defineGetter__("cacheManager", this.getCacheManager);
    this.__definePositiveInteger__("state", 0);
    this.initialize();
  };
  Downsha.mixin(Downsha.ClipConverter, Downsha.DefiningMixin);
  
  Downsha.ClipConverter.CACHE_CHECK_INTERVAL = 300; // check interval for cache complete
  Downsha.ClipConverter.CACHE_CHECK_TIMEOUT = 3000; // check timeout for cache complete
  Downsha.ClipConverter.STATE = {
  	INIT             : 0,
  	EXTRACTING_CACHE : 1,
  	CONVERTING_HTML  : 2,
  	SUCCESS          : 3,
  	ERROR            : 4
  };
  
  Downsha.ClipConverter.prototype._dsInfo = null;
  Downsha.ClipConverter.prototype._cacheManager = null; // CacheManager object
  Downsha.ClipConverter.prototype.onConvertSuccess = null;
  Downsha.ClipConverter.prototype.onConvertError = null;
  
  Downsha.ClipConverter.prototype.initialize = function() {
  	this.state = Downsha.ClipConverter.STATE.INIT;
  	
    /**
     * following selectors should use local cache
     * document.querySelectorAll('link[href][rel="shortcut icon"], link[href][rel="apple-touch-icon"], link[href][rel="icon"]');
     * document.querySelectorAll('img[src], input[src][type="image"]');
     * document.querySelectorAll('video[poster]');
     */
		this.urlPattern = "(https?://[-a-z0-9]+(?:\\.[-a-z0-9]+)*\\.[-a-z0-9]+(?::[0-9]+)?(?:/[-a-z0-9_:\\@&?=+,.!/~*%\\$]*)?)";
		/**
		* example 1 : <IMG SRC="http://list.image.baidu.com/t/image_category/img/radio_a.png" />
		* example 2 : <IMG SRC="http://t1.baidu.com/it/u=http://img1.gtimg.com/news/pics/hv1/72/71/883/57435252.jpg&fm=32" />
		* <\s*img[^>]*src\s*=\s*['\"] --> match tag img and has src attribute, like: "<img src='"
		* (https?:\/\/[-a-z0-9]+(?:\.[-a-z0-9]+)*\.[-a-z0-9]+(?::[0-9]+)? --> match url scheme(http/https), host and port
		* (?:/[-a-z0-9_:\@&?=+,.!/~*%\$]*)?)['\"] --> match url path
		*/
		this.foreImagePattern = "<\\s*img((?:\"[^\"]*\"|'[^']*'|[^'\">])*)\\s+src\\s*=\\s*['\"]?\\s*" + this.urlPattern + "\\s*['\"]?";
		
		/**
		* example: background-image:url("http://list.image.baidu.com/t/image_category/img/radio_a.png")
		* (?:background|background-image)\s*:\s*url\s*\\\(\s*['\"]? --> match background-image 
		* (https?:\/\/[-a-z0-9]+(?:\.[-a-z0-9]+)*\.[-a-z0-9]+(?::[0-9]+)? --> match url scheme(http/https), host and port
		* (?:/[-a-z0-9_:\@&?=+,.!/~*%\$]*)?)['\"]?\s*\\\) --> match url path, be aware that '(', ')' need double escape '\'
		*/
		this.backImagePattern = "background(?:-image)?\\s*:\\s*url\\s*\\\(\\s*(?:\\\\)?['\"]?\\s*" + this.urlPattern + "\\s*(?:\\\\)?['\"]?\\s*\\\)";
  };
  
  Downsha.ClipConverter.prototype.startUp = function(obj, success, error) {
  	this.dsInfo = obj;
  	this.onConvertSuccess = function() { // callback for successfully converted
  		LOG.debug("ClipConverter successfully converted");
  		if (typeof success == 'function') {
  			success.apply(this, arguments);
  		}
  	};
  	this.onConvertError = function() { // callback for converted error
  		LOG.error("ClipConverter failed to convert");
  		if (typeof error == 'function') {
  			error.apply(this, arguments);
  		}
  	};
  	
  	this.extractCache();
  };
  
  Downsha.ClipConverter.prototype.getDsInfo = function() {
  	return this._dsInfo;
  };
  Downsha.ClipConverter.prototype.setDsInfo = function(dsInfo) {
  	if (dsInfo != null) {
  		if (dsInfo instanceof Downsha.DownshaInfo) {
  			this._dsInfo = dsInfo;	
  		} else if (typeof dsInfo == "object") {
  			this._dsInfo = new Downsha.DownshaInfo(dsInfo);
  		} else {
  			this._dsInfo = new Downsha.DownshaInfo();
  		}
  	} else {
  		this._dsInfo = new Downsha.DownshaInfo();
  	}
  };
  
  Downsha.ClipConverter.prototype.getCacheManager = function() {
    if (!this._cacheManager) {
      this._cacheManager = new Downsha.CacheManager();
    }
    return this._cacheManager;
  };
  
	Downsha.ClipConverter.prototype.getMimeFromData = function(data, size) {
		var buf = [];
		buf.length = 24;
		if (!data || size < 24)
			return null;

		// Every JPEG file starts from binary value '0xFFD8', ends by binary value '0xFFD9'.
		// ***** SOME JPEG files have comment data after '0xFFD9', e.g. /* |xGv00|6ef58316102a13c565237c66109cdcbc */
		if (data[0] == 0xFF && data[1] == 0xD8)
		{
			for (var i = 0; i < 24; i++) {
				buf[i] = data[i];
			}

			// JFIF uses APP0(0xFFE0) Marker for inserting digicam configuration data and thumbnail image.
			// Exif uses APP1(0xFFE1) Marker to avoid a conflict with JFIF format.
			// Exif format specification: http://www.media.mit.edu/pia/Research/deepview/exif.html
			if ((buf[2] == 0xFF && buf[3] == 0xE0 && buf[6] == 0x4A && buf[7] == 0x46 && buf[8] == 0x49 && buf[9] == 0x46) ||
				(buf[2] == 0xFF && buf[3] == 0xE1 && buf[6] == 0x45 && buf[7] == 0x78 && buf[8] == 0x69 && buf[9] == 0x66))
			{
				// For JPEGs, we need to read the first 12 bytes of each chunk.
				// We'll read those 12 bytes at buf+2...buf+14, i.e. overwriting the existing buf.
				var pos = 2;
				while (buf[2] == 0xFF)
				{
					if (buf[3] == 0xC0 || buf[3] == 0xC1 || buf[3] == 0xC2 || buf[3] == 0xC3 || 
						buf[3] == 0xC9 || buf[3] == 0xCA || buf[3] == 0xCB) break;
					pos += 2 + (buf[4] << 8) + buf[5];
					if (pos + 12 > size) break;
					
					for (var i = 0; i < 12; i++) {
						buf[2 + i] = data[pos + i];
					}
				}
			}
			if (buf[2] != 0xFF)
				return null;

			return "image/jpeg";
		}

		// GIF: first three bytes say "GIF", next three give version number. Then dimensions
		if (data[0] == 0x47 && data[1] == 0x49 && data[2] == 0x46)
		{
			return "image/gif";
		}

		// PNG: the first frame is by definition an IHDR frame, which gives dimensions
		if (data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 && 
			data[4] == 0x0D && data[5] == 0x0A && data[6] == 0x1A && data[7] == 0x0A && 
			data[12] == 0x49 && data[13] == 0x48 && data[14] == 0x44 && data[15] == 0x52)
		{
			return "image/png";
		}

		return null;
	};
  
	Downsha.ClipConverter.prototype.getDimensionFromData = function(data, size) {
		// Strategy:
		// reading GIF dimensions requires the first 10 bytes of the file
		// reading PNG dimensions requires the first 24 bytes of the file
		// reading JPEG dimensions requires scanning through JPEG chunks
		// In all formats, the file is at least 24 bytes big.
		var buf = [];
		buf.length = 24;
		if (!data || size < 24)
			return null;

		// Every JPEG file starts from binary value '0xFFD8', ends by binary value '0xFFD9'.
		// ***** SOME JPEG files have comment data after '0xFFD9', e.g. /* |xGv00|6ef58316102a13c565237c66109cdcbc */
		if (data[0] == 0xFF && data[1] == 0xD8)
		{
			for (var i = 0; i < 24; i++) {
				buf[i] = data[i];
			}

			// JFIF uses APP0(0xFFE0) Marker for inserting digicam configuration data and thumbnail image.
			// Exif uses APP1(0xFFE1) Marker to avoid a conflict with JFIF format.
			// Exif format specification: http://www.media.mit.edu/pia/Research/deepview/exif.html
			if ((buf[2] == 0xFF && buf[3] == 0xE0 && buf[6] == 0x4A && buf[7] == 0x46 && buf[8] == 0x49 && buf[9] == 0x46) ||
				(buf[2] == 0xFF && buf[3] == 0xE1 && buf[6] == 0x45 && buf[7] == 0x78 && buf[8] == 0x69 && buf[9] == 0x66))
			{
				// For JPEGs, we need to read the first 12 bytes of each chunk.
				// We'll read those 12 bytes at buf+2...buf+14, i.e. overwriting the existing buf.
				var pos = 2;
				while (buf[2] == 0xFF)
				{
					if (buf[3] == 0xC0 || buf[3] == 0xC1 || buf[3] == 0xC2 || buf[3] == 0xC3 || 
						buf[3] == 0xC9 || buf[3] == 0xCA || buf[3] == 0xCB) break;
					pos += 2 + (buf[4] << 8) + buf[5];
					if (pos + 12 > size) break;
					
					for (var i = 0; i < 12; i++) {
						buf[2 + i] = data[pos + i];
					}
				}
			}
			if (buf[2] != 0xFF)
				return null;

			return {
				width : (buf[9] << 8) + buf[10],
				height : (buf[7] << 8) + buf[8]
			};
		}

		// GIF: first three bytes say "GIF", next three give version number. Then dimensions
		if (data[0] == 0x47 && data[1] == 0x49 && data[2] == 0x46)
		{
			return {
				width : data[6] + (data[7] << 8),
				height : data[8] + (data[9] << 8)
			};
		}

		// PNG: the first frame is by definition an IHDR frame, which gives dimensions
		if (data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47 && 
			data[4] == 0x0D && data[5] == 0x0A && data[6] == 0x1A && data[7] == 0x0A && 
			data[12] == 0x49 && data[13] == 0x48 && data[14] == 0x44 && data[15] == 0x52)
		{
			return {
				width : (data[16] << 24) + (data[17] << 16) + (data[18] << 8) + (data[19] << 0),
				height : (data[20] << 24) + (data[21] << 16) + (data[22] << 8) + (data[23] << 0)
			};
		}

		return null;
	};
 
  Downsha.ClipConverter.prototype.extractCache = function() {
		var self = this;
		var cacheUrls = [];
		var cacheRepeated = 0;
		var startStamp = 0;
		var endStamp = 0;
		
		var addCacheUrl = function(url, background) {
    	var urlRepeated = false;
    	for (var i in cacheUrls) {
    		if (cacheUrls[i].url == url) {
    			urlRepeated = true;
    			break;
    		}
    	}
    	if (!urlRepeated) {
    		LOG.debug("add cache url: " + url);
    		cacheUrls.push({
    			url : url,
    			background : background
    		});
    	} else {
    		cacheRepeated ++;
    	}
		};
		
    startStamp = new Date().getTime();
    var foreImageRes = null;
    var foreImageReg = new RegExp(this.foreImagePattern, "ig");
    while ((foreImageRes = foreImageReg.exec(this.dsInfo.content)) != null) {
    	addCacheUrl(foreImageRes[2], 0);
    }
    
    var backImageRes = null;
    var backImageReg = new RegExp(this.backImagePattern, "ig");
    while ((backImageRes = backImageReg.exec(this.dsInfo.content)) != null) {
    	addCacheUrl(backImageRes[1], 1);
    }
    endStamp = new Date().getTime();
    LOG.debug("RegExp search in " + (endStamp - startStamp) + " milliseconds, unique url: " + cacheUrls.length + ", repeated count: " + cacheRepeated);
    
    if (cacheUrls.length > 0) {
			self.cacheManager.startCache();
    	self.cacheManager.addCaches(cacheUrls);
			var cacheStartTime = new Date().getTime(); // timestamp of start cache
			
	    var cacheTimer = setInterval(function() {
	    	if (self.cacheManager.isComplete() || // wait until cache complete or timeout
	    	(cacheStartTime + self.constructor.CACHE_CHECK_TIMEOUT < (new Date().getTime()))) {
	    		clearInterval(cacheTimer);
	    		cacheTimer = null;
	    		
	    		// let's process all cache data
	    		var caches = self.cacheManager.getCaches();
	    		for (var i in caches) {
	    			if (caches[i].data == null || caches[i].data.length == 0) {
	    				LOG.debug("cache " + i + " data invalid");
	    				continue;
	    			}
	    			
	    			var mid = 0;
	    			var mime = caches[i].type;
	    			if (mime) {
	    				mid = Downsha.DownshaMime.getMimeId(mime);
	    			}
	    			if (mid == 0) {
	    				mime = self.getMimeFromData(caches[i].data, caches[i].data.length);
	    				if (mime) {
	    					mid = Downsha.DownshaMime.getMimeId(mime);
	    				}
	    				if (mid == 0) {
	    					LOG.debug("cache " + i + " mime invalid");
	    					continue;
	    				}
	    			}
	    			
	    			var dataSize = caches[i].data.length;
	    			var fid = faultylabs.MD5(caches[i].data);
	    			caches[i].data.length = dataSize;
	    			if (typeof fid != "string" || fid == "") {
	    				LOG.debug("cache " + i + " md5 error");
	    				continue;
	    			}
	    			if (self.dsInfo.findFileByFID(fid)) {
	    				LOG.debug("cache " + i + " file already exist");
	    				continue;
	    			}	    			
	    			
	    			var now = parseInt(Date.now() / 1000);
	    			var dsFile = new Downsha.DownshaFile({
	    				fid        : fid,
	    				data       : caches[i].data,
	    				dataSize   : caches[i].data.length,
	    				mime       : mime,
	    				mid        : mid,
	    				background : caches[i].background, 
	    				url        : caches[i].url,
	    				createDate : now, 
	    				updateDate : now
	    			});
	    			
	    			if (dsFile.mid > 0) {
	    				var obj = self.getDimensionFromData(dsFile.data, dsFile.dataSize);
	    				if (obj != null) {
	    					dsFile.width = obj.width;
	    					dsFile.height = obj.height;
	    				}
	    			}
	    			
	    			LOG.debug("add file md5: " + dsFile.fid + ", size: " + dsFile.dataSize + ", mime: " + dsFile.mime + ", width: " + dsFile.width + ", height: " + dsFile.height + ", url: " + dsFile.url);
	    			self.dsInfo.addFile(dsFile);
	    		}
	    		
	    		return self.convertHtmlToDsml();
	    	}
	    }, self.constructor.CACHE_CHECK_INTERVAL);
    } else {
    	return self.convertHtmlToDsml();
    }
  };
	
	Downsha.ClipConverter.prototype.convertUnicodeStringToUtf8Bytes = function(unicodeString) {
	  var utf8Bytes = [];
	  var charCode = 0;
	  for (var i = 0; i < unicodeString.length; ++i) {
	    charCode = unicodeString.charCodeAt(i);
		  if (charCode < 0x80) {  // 1-byte
		    utf8Bytes.push(charCode);
		  } else if (charCode < (1 << 11)) {  // 2-byte
		    utf8Bytes.push((charCode >>> 6) | 0xC0);
		    utf8Bytes.push((charCode & 0x3F) | 0x80);
		  } else if (charCode < (1 << 16)) {  // 3-byte
		    utf8Bytes.push((charCode >>> 12) | 0xE0);
		    utf8Bytes.push(((charCode >> 6) & 0x3f) | 0x80);
		    utf8Bytes.push((charCode & 0x3F) | 0x80);
		  } else if (charCode < (1 << 21)) {  // 4-byte
		    utf8Bytes.push((charCode >>> 18) | 0xF0);
		    utf8Bytes.push(((charCode >> 12) & 0x3F) | 0x80);
		    utf8Bytes.push(((charCode >> 6) & 0x3F) | 0x80);
		    utf8Bytes.push((charCode & 0x3F) | 0x80);
		  }	    
	  }
	  return utf8Bytes;
	};
  
  Downsha.ClipConverter.prototype.convertHtmlToDsml = function() {
  	var self = this;
  	if (this.dsInfo.content == "" || this.dsInfo.content.length == 0) {
  		LOG.debug("content empty");
  		return ;
	  }
	  
	  // Remove remaining tags like <a>, links, images, etc - anything thats enclosed inside < >
	  var fullText = this.dsInfo.content.replace(new RegExp("<(?:\"[^\"]*\"|'[^']*'|[^'\">])*>", "ig"), " ");
	  // Replace decimal character codes: "&#(\\d{1,5});"
	  fullText = fullText.replace(new RegExp("&#(\\d{1,5});", "ig"), function(para0, para1) {
	  	return String.fromCharCode(parseInt(para1));
	  });
	  // Remove repeating spaces because browsers ignore them 
	  fullText = fullText.replace(new RegExp("\\s+", "ig"), " ");
	  this.dsInfo.wordCount = fullText.length;
	  this.dsInfo.absText = fullText.substr(0, 512);
	  
		// Replace foreground images and background images
		// be careful to url with special characters. following url causes exception: invalid quantifier.
		// http://pic1.kaixin001.com.cn/pic/app/22/25/1018_132222535_records-home**rotate4.jpeg
		var startStamp = new Date().getTime();
	  this.dsInfo.content = this.dsInfo.content.replace(
	  	new RegExp(this.foreImagePattern, "ig"), 
	  	function(para0, para1, para2) {
		  	if (typeof para2 == "string" && para2 != "") {
		  		var dsFile = self.dsInfo.findFileByURL(para2);
		  		if (dsFile != null) {
		  			return "<ds-file" + para1 + " hash=\"" + dsFile.fid + "\" type=\"" + dsFile.mime + "\"";
		  		}
		  	}
		  	return para0;
	  });
	  this.dsInfo.content = this.dsInfo.content.replace(
	  	new RegExp(this.backImagePattern, "ig"), 
	  	function(para0, para1) {
		  	if (typeof para1 == "string" && para1 != "") {
		  		var dsFile = self.dsInfo.findFileByURL(para1);
		  		if (dsFile != null) {
		  			return "background-image:url(" + dsFile.fid + ")";
		  		}
		  	}
		  	return para0;
	  });
	  var endStamp = new Date().getTime();
    LOG.debug("RegExp replace in " + (endStamp - startStamp) + " milliseconds");
	  
	  this.dsInfo.content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + 
	  	"<!DOCTYPE ds-info SYSTEM \"http://xml.yunzhai.cn/dsml.dtd\">" + 
	  	"<ds-info>" + this.dsInfo.content + "</ds-info>";
	  
	  var data = this.convertUnicodeStringToUtf8Bytes(this.dsInfo.content);
	  var dataSize = data.length;
		var fid = faultylabs.MD5(data);
		data.length = dataSize;
		if (typeof fid != "string" || fid == "") {
			LOG.debug("content md5 error");
			return ;
		}
		
		var now = parseInt(Date.now() / 1000);
		this.dsInfo.mainFID = fid;
		var mainMime = "application/dsml";
		this.dsInfo.mainMID = Downsha.DownshaMime.getMimeId(mainMime);
		this.dsInfo.mainSize = dataSize;
		this.dsInfo.srcType = Downsha.DownshaInfo.SRC_TYPE.WEB_CLIP;
		this.dsInfo.srcDesc = navigator.userAgent;
		this.dsInfo.shareType = 1;
		this.dsInfo.shareDate = now;
		this.dsInfo.createDate = now;
		this.dsInfo.updateDate = now;
		
		var dsFile = new Downsha.DownshaFile({
			cindex     : 1, 
			fid        : fid,
			data       : data,
			dataSize   : dataSize,
			mid        : this.dsInfo.mainMID,
			mime       : mainMime,
			wordCount  : this.dsInfo.wordCount, 
			createDate : this.dsInfo.createDate,
			updateDate : this.dsInfo.updateDate
		});
		LOG.debug("main file md5: " + dsFile.fid + ", size: " + dsFile.dataSize + ", word count: " + dsFile.wordCount);
		this.dsInfo.addFile(dsFile);
		
		if (typeof this.onConvertSuccess == "function") {
			this.onConvertSuccess();
		}
  };
})();
