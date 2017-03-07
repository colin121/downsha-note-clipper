/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: utilities
 */

Downsha.Utils = new function Utils() {};

/**
 * Expands object a with properties of object b
 */
Downsha.Utils.extendObject = function(a, b, deep, overwrite) {
  if (typeof a == 'object' && a != null && typeof b == 'object' && b != null) {
    for ( var i in b) {
      if (typeof a[i] == 'undefined' || overwrite) {
        a[i] = b[i];
      } else if (deep) {
        arguments.callee.apply(this, [ a[i], b[i], deep, overwrite ]);
      }
    }
  }
};
Downsha.Utils.importConstructs = function(fromWindow, toWindow, constructNames) {
  var names = (constructNames instanceof Array) ? constructNames
      : [ constructNames ];
  for ( var i = 0; i < names.length; i++) {
    var nameParts = names[i].split(".");
    var toAnchor = toWindow;
    var fromAnchor = fromWindow;
    for ( var p = 0; p < nameParts.length; p++) {
      if (p == nameParts.length - 1) {
        if (typeof toAnchor[nameParts[p]] == 'undefined') {
          toAnchor[nameParts[p]] = fromAnchor[nameParts[p]];
        } else {
          Downsha.Utils.extendObject(toAnchor[nameParts[p]],
              fromAnchor[nameParts[p]], true);
        }
      } else {
        fromAnchor = fromAnchor[nameParts[p]];
        if (typeof toAnchor[nameParts[p]] == 'undefined') {
          toAnchor[nameParts[p]] = {};
        }
        toAnchor = toAnchor[nameParts[p]];
      }
    }
  }
};

Downsha.Utils.separateString = function(str, separator) {
  if (typeof str != 'string')
    return str;
  if (typeof separator != 'string')
    separator = ",";
  var parts = str.split(separator);
  var returnParts = new Array();
  for ( var i = 0; i < parts.length; i++) {
    if (typeof parts[i] != 'string')
      continue;
    var clean = Downsha.Utils.trim(parts[i]);
    if (clean && clean.length > 0)
      returnParts.push(clean);
  }
  return returnParts;
};
Downsha.Utils.trim = function(str) {
  if (typeof str != 'string')
    return str;
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
};
Downsha.Utils.shortenString = function(str, len, suffix) {
  var s = str + "";
  if (s.length > len) {
    s = s.substring(0, Math.max(0, len
        - ((typeof suffix == 'string') ? suffix.length : 0)));
    if (typeof suffix == 'string')
      s += suffix;
  }
  return s;
};
Downsha.Utils.htmlEntities = function(anything) {
  return $("<div/>").text(anything).html();
};
Downsha.Utils.urlPath = function(url) {
  if (typeof url == 'string') {
    var path = url.replace(/^[^:]+:\/+([^\/]+)/, "");
    if (path.indexOf("/") == 0) {
      return path.replace(/^(\/[^\?\#]*).*$/, "$1");
    }
  }
  return "";
};
Downsha.Utils.urlDomain = function(url, includePort) {
  if (typeof url == 'string') {
    var re = new RegExp("^[^:]+:\/+([^\/" + ((includePort) ? "" : ":") + "]+).*$");
    return url.replace(re, "$1");
  }
  return url;
};
Downsha.Utils.urlTopDomain = function(url) {
  var topDomain = url;
  if (typeof url == 'string') {
    var topDomain = Downsha.Utils.urlDomain(url);
    if (topDomain.toLowerCase().indexOf("www.") == 0) {
      topDomain = topDomain.substring(4);
    }
  }
  return topDomain;
};
Downsha.Utils.urlPath = function(url) {
  if (typeof url == 'string') {
    var re = new RegExp("^[^:]+:\/\/[^\/]+([^\&\?]*).*$");
    return url.replace(re, "$1");
  }
  return "";
};
Downsha.Utils.urlQueryValue = function(key, url) {
  if (typeof url == 'string' && typeof key == 'string' && url.indexOf("?") >= 0) {
    var queries = url.split(/[\?\#\&]+/).slice(1);
    var k = key.toLowerCase();
    var results = new Array();
    for ( var i = 0; i < queries.length; i++) {
      var kv = queries[i].split("=", 2);
      if (kv[0].toLowerCase() == k) {
        var r = (kv[1]) ? kv[1].replace(/\+/g, " ") : kv[1];
        results.push(decodeURIComponent(r));
      }
    }
    if (results.length > 0) {
      return results[results.length - 1];
    }
  }
  return null;
};
Downsha.Utils.urlProto = function(url) {
  if (typeof url == 'string') {
    var x = -1;
    if ((x = url.indexOf(":/")) > 0) {
      return url.substring(0, x).toLowerCase();
    }
  }
  return null;
};
Downsha.Utils.absoluteUrl = function(url, base) {
	if (url.indexOf("//") == 0) {
		url = base.replace(/^([^:]+):.*$/, "$1") + ":" + url;
	} else if (url.indexOf("/") == 0) {
 		url = base.replace(/^(.*:\/\/[^\/]+).*$/, "$1") + url;
 	} else if (url.match(/^\.+\//)) {
 		url = (base.charAt(base.length - 1) == "/") ? (base + url) : (base + "/" + url);
	} else {
		url = (base.charAt(base.length - 1) == "/") ? (base + url) : (base + "/" + url);
	}
	return url;
};
Downsha.Utils.urlSuffix = "...";
Downsha.Utils.shortUrl = function(url, maxLength) {
  var shortUrl = url;
  if (typeof url == 'string') {
    if (shortUrl.indexOf("file:") == 0) {
      shortUrl = decodeURIComponent(shortUrl.replace(/^file:.*\/([^\/]+)$/,
          "$1"));
      if (typeof maxLength == 'number' && !isNaN(maxLength)
          && shortUrl.length > maxLength) {
        shortUrl = shortUrl.substring(0, maxLength);
        shortUrl += "" + Downsha.Utils.urlSuffix;
      }
    } else {
      shortUrl = shortUrl.replace(/^([a-zA-Z]+:\/+)?([^\/]+).*$/, "$2");
      if (typeof maxLength == 'number' && !isNaN(maxLength)
          && shortUrl.length > maxLength) {
        shortUrl = shortUrl.substring(0, maxLength);
        shortUrl += "" + Downsha.Utils.urlSuffix;
      } else if (url.substring(url.indexOf(shortUrl) + shortUrl.length).length > 2) {
        shortUrl += "/" + Downsha.Utils.urlSuffix;
      }
    }
  }
  return shortUrl;
};
/**
 * http://stackoverflow.com/questions/9301659/is-window-document-height-deprecated-in-chrome-17
 * window.document.width/height is no longer a valid property since Chrome 17.
 * document.width/height isn't a standard property and WebKit was the only vendor maintaining support for it (until now.) 
 * Both MDN and WebKit now list the properties as deprecated and 
 * suggest using document.body.clientHeight or document.body.clientWidth instead of document.width or document.height.
 */
Downsha.Utils.getDocumentWidth = function(doc) { // get document actual width
	if (!doc) {
		doc = document;
	}
	if (doc.width) {
		return doc.width;
	} else if (doc.body && doc.documentElement && doc.documentElement.scrollWidth) {
		return doc.documentElement.scrollWidth;
	} else if (doc.body && doc.body.scrollWidth) {
		return doc.body.scrollWidth;
	} else {
		return 0;
	}
};
Downsha.Utils.getDocumentHeight = function(doc) { // get document actual height
	if (!doc) {
		doc = document;
	}
	if (doc.height) {
		return doc.height;
	} else if (doc.body && doc.body.scrollHeight &&
		doc.documentElement && doc.documentElement.scrollHeight) {
		return Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
	} else if (doc.body && doc.body.scrollHeight) {
		return doc.body.scrollHeight;
	} else {
		return 0;
	}
};
/**
 * findEmbeds returns all <object> nodes and <embed> nodes of current document
 * especially for embeded flash/windows media player/real player objects. 
 */
Downsha.Utils.findEmbeds = function(doc) {
	var embedsArray = new Array();
  try {
		var objects = doc.getElementsByTagName("object");
		if (objects && objects.length > 0) {
			for (var i = 0; i < objects.length; i ++) {
				embedsArray.push(objects[i]);
			}
		}
		var embeds = doc.getElementsByTagName("embed");
		if (embeds && embeds.length > 0) {
			for (var i = 0; i < embeds.length; i++) {
				embedsArray.push(embeds[i]);
			}
		}
  } catch (e) {
  }
	return embedsArray;
};
/**
 * findDocuments returns all <frame> nodes and <iframe> nodes of current document
 * Note: Because of security reasons, the contents of a document can be accessed 
 * from another document only if the two documents are located in the same domain.
 * Note: Internet Explorer 8 (and higher) supports the contentDocument property 
 * only if a !DOCTYPE is specified. For earlier versions of IE, use the contentWindow property.
 * Note: Safari/Chrome doesn't understand contentWindow, but does have contentDocument.
 */
Downsha.Utils.findDocuments = function(doc) {
  var documentsArray = new Array();
  try {
	  var frames = doc.getElementsByTagName("frame");
	  if (frames && frames.length > 0) {
	    for (var i = 0; i < frames.length; i++) {
	    	if (frames[i].contentDocument) {
	    		documentsArray.push(frames[i].contentDocument);
	    	} else if (frames[i].contentWindow && frames[i].contentWindow.document) {
	    		documentsArray.push(frames[i].contentWindow.document);
	    	} else if (frames[i].document) {
	    		documentsArray.push(frames[i].document);
	    	}
	    }
	  }
	  var iframes = doc.getElementsByTagName("iframe");
	  if (iframes && iframes.length > 0) {
	    for (var i = 0; i < iframes.length; i++) {
	    	if (iframes[i].contentDocument) {
	    		documentsArray.push(iframes[i].contentDocument);
	    	} else if (iframes[i].contentWindow && iframes[i].contentWindow.document) {
	    		documentsArray.push(iframes[i].contentWindow.document);
	    	} else if (iframes[i].document) {
	    		documentsArray.push(iframes[i].document);
	    	}
	    }
	  }
  } catch (e) {
  }
  return documentsArray;
};
Downsha.Utils.getDocumentHead = function(doc) {
	if (doc.head) {
		return doc.head;
	} else if (doc.getElementsByTagName("head")) {
		return doc.getElementsByTagName("head")[0];
	} else if (doc.documentElement) {
		return doc.documentElement;
	} else if (doc.body && doc.body.parentNode) {
		return doc.body.parentNode;
	} else {
		return null;
	}
};
Downsha.Utils.makeAbsoluteClientRect = function(rect, win) {
  if (!win) {
    win = window;
  }
	/*
	The pageXOffset and pageYOffset properties returns the pixels the current document 
	has been scrolled from the upper left corner of the window, horizontally and vertically.
	The pageXOffset and pageYOffset properties are supported in all major browsers, except Internet Explorer.
	Note: IE equivalents are "document.body.scrollLeft" and "document.body.scrollTop".
	*/  
  return {
    top : rect.top + win.pageYOffset,
    bottom : rect.bottom + win.pageYOffset,
    left : rect.left + win.pageXOffset,
    right : rect.right + win.pageXOffset,
    width : rect.width,
    height : rect.height
  };
};
Downsha.Utils.getAbsoluteBoundingClientRect = function(node) {
  var ele = (node && node.nodeType == Node.TEXT_NODE) ? 
  	(node.parentElement ? node.parentElement : node.parentNode) : node;
  if (!ele) {
  	return null;
  }
  var win = (node instanceof Range) ? 
  	(node.commonAncestorContainer.ownerDocument.defaultView) : 
  	(node.ownerDocument.defaultView);
  return Downsha.Utils.makeAbsoluteClientRect(ele.getBoundingClientRect(), win);
};
Downsha.Utils.getElementForNode = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    return node;
  } else if (node.parentElement) {
    return node.parentElement;
  } else {
    return null;
  }
};
Downsha.Utils.addElementClass = function(element, className) {
  if (element && className) {
    var elementClass = element.getAttribute("class");
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      if (parts.indexOf(className) < 0) {
        parts.push(className);
      }
      element.setAttribute("class", parts.join(" "));
    } else {
      element.setAttribute("class", className);
    }
  }
};
Downsha.Utils.removeElementClass = function(element, className) {
  if (className) {
    var elementClass = element.getAttribute("class");
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      var i = -1;
      if ((i = parts.indexOf(className)) >= 0) {
        parts.splice(i, 1);
      }
      element.setAttribute("class", parts.join(" "));
    }
  }
};
Downsha.Utils.XML_ESCAPE_CHAR_MAP = {
  "&" : "&amp;",
  "<" : "&lt;",
  ">" : "&gt;",
  "\"" : "&quot;",
  "'" : "&apos;"
};
Downsha.Utils.escapeXML = function(str) {
  var a = str.split("");
  for ( var i = 0; i < a.length; i++) {
    if (Downsha.Utils.XML_ESCAPE_CHAR_MAP[a[i]]) {
      a[i] = Downsha.Utils.XML_ESCAPE_CHAR_MAP[a[i]];
    }
  }
  return a.join("");
};
Downsha.Utils.escapeURL = function(str) {
  var result = "";
  // escapeURL is like encodeURI() except that it keeps ALL ascii characters intact.
  for (var i = 0; i < str.length; i++) {
  	// Unicode value range: [0-65535]
    var unicode = str.charCodeAt(i);
    if (unicode < 0x80) {
    	result += String.fromCharCode(unicode);
    } else if (unicode < 0x800) {
    	var utf0 = (unicode >> 6) | 0xc0;
    	var utf1 = (unicode & 0x3f) | 0x80;
    	result += "%" + utf0.toString(16).toUpperCase();
    	result += "%" + utf1.toString(16).toUpperCase();
    } else if (unicode < 0x10000) {
    	var utf0 = (unicode >> 12) | 0xe0;
    	var utf1 = ((unicode >> 6) & 0x3f) | 0x80;
    	var utf2 = (unicode & 0x3f) | 0x80;
    	result += "%" + utf0.toString(16).toUpperCase();
    	result += "%" + utf1.toString(16).toUpperCase();
    	result += "%" + utf2.toString(16).toUpperCase();
    }
  }
  return result;
};
Downsha.Utils.rectIntersection = function(a, b) {
  if (!(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top)) {
    var aRect = {
      left : Math.max(a.left, b.left),
      top : Math.max(a.top, b.top),
      right : Math.min(a.right, b.right),
      bottom : Math.min(a.bottom, b.bottom)
    };
    aRect.width = aRect.right - aRect.left;
    aRect.height = aRect.bottom - aRect.top;
    return aRect;
  }
  return undefined;
};
Downsha.Utils.rectsEqual = function(a, b) {
  if (a.left == b.left && a.right == b.right && a.top == b.top
      && a.bottom == b.bottom) {
    return true;
  } else {
    return false;
  }
};
Downsha.Utils.expandRect = function(a, b) {
  a.left = (typeof a.left == "number") ? Math.min(a.left, b.left) : b.left;
  a.top = (typeof a.top == "number") ? Math.min(a.top, b.top) : b.top;
  a.right = (typeof a.right == "number") ? Math.max(a.right, b.right) : b.right;
  a.bottom = (typeof a.bottom == "number") ? Math.max(a.bottom, b.bottom) : b.bottom;
};
Downsha.Utils.errorDescription = function(err) {
	var msg = null;
	if (err instanceof FileError) {
		var errName = null;
		var errCode = err.code;
		if (typeof errCode == 'number') {
			for (var prop in FileError) {
				if (prop.toLowerCase().indexOf("_err") > 0 && FileError[prop] == err.code) {
					msg = "FileError: " + errCode + " ("+prop+")";
					break;
				}
			}
		} else {
			msg = "FileError: " + errCode;
		}
	} else if (err.message) {
		msg = err.message;
	} else if (typeof err.code != 'undefined') {
		var constructorName = (err.constructor && err.constructor.name) ? err.constructor.name : ("" + err);
		msg = constructorName + " code: " + err.code;
	}
	return msg;
};

Downsha.UUID = {
	generateQuad : function() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	},
	generateGuid : function() {
		return (this.generateQuad() + this.generateQuad() + "-"
			+ this.generateQuad() + "-" + this.generateQuad() + "-"
			+ this.generateQuad() + "-" + this.generateQuad() 
			+ this.generateQuad() + this.generateQuad());
	}
};

Downsha.Utils = Downsha.Utils || new function Utils() {
};

/*
// This is a map of hostnames to CSS selectors. When we try and locate an article in a page, we'll see if we
// can find the doamin for the page in this list, and if so, we'll try and find an element that matches the given
// selector. If no element is returned, we'll fall back to the heuristic approach.
Downsha.Utils.HOST_ARTICLE_TABLE = {
	//"abc.example.com": { // template of item
	//	"a": ["s1", "s2", "s3"], // selectors of article
	//	"d": ["s1", "s2", "s3"], // selectors of description
	//	"t": [ // patterns of thumbnail
	//	{
	//		"b": "relative", // [optional] base element
	//		"s": ["s1", "s2", "s3"], // selectors of thumbnail source
	//		"d": "textContent", // data field of thumbnail source
	//		"p": "", // [optional] regex of pattern
	//		"m": "", // [optional] regex of match
	//		"r": ""  // [optional] regex of replace 
	//	},
	//	{
	//		"b": "relative", // [optional] base element
	//		"s": ["s1", "s2", "s3"], // selectors of thumbnail source
	//		"d": "textContent", // data field of thumbnail source
	//		"p": "", // [optional] regex of pattern
	//		"m": "", // [optional] regex of match
	//		"r": ""  // [optional] regex of replace			
	//	}
	//	]
	//}
	
	// search and answer
	"www.baidu.com": {
		"a": ["div#container"]
	},
	"tieba.baidu.com": {
		"a": ["div#container"]
	},
	"baike.baidu.com": {
		"a": ["div#content"]
	},
	"wenku.baidu.com": {
		"a": ["div#doc_reader", "div.main"]
	},
	"zhidao.baidu.com": {
		"a": ["div.l-main-wrap"]
	},
	"www.soso.com": {
		"a": ["div#result"]
	},
	"wenwen.soso.com": {
		"a": ["div.solved_wrap", "div.pending_wrap", "div#result"]
	},
	"ishare.iask.sina.com.cn": {
		"a": ["div#flashContent_parent", "div.wrap_left"]
	},
	"iask.sina.com.cn": {
		"a": ["div#cont_left"]
	},
	"wenda.tianya.cn": {
		"a": ["div#main_area"]
	},
	"zhihu.com": {
		"a": ["div.xbp"]
	},
	"quora.com": {
		"a": ["div.main_col"]
	},
	"stackoverflow.com": {
		"a": ["div#mainbar"]
	},
	"docin.com": {
		"a": ["div#DocinViewer"],
		"d": ["div#documentinfo"]
	},
	
	// shopping and life
	"item.taobao.com": {
		"a": ["div#detail"]
	},
	"trip.taobao.com": {
		"a": ["div#detail"]
	},
	"detail.tmall.com": {
		"a": ["div#detail"]
	},
	"ju.taobao.com": {
		"a": ["div.info-box"]
	},
	"juhuasuan.com": {
		"a": ["div.info-box"]
	},
	"hitao.com": {
		"a": ["div#detail-top"]
	},
	"auction.360buy.com": {
		"a": ["div.main"]
	},
	"tuan.360buy.com": {
		"a": ["div#deal-intro"]
	},
	"360buy.com": {
		"a": ["div#product-intro"]
	},
	"360top.com": {
		"a": ["div#detail"]
	},
	"product.dangdang.com": {
		"a": ["div.dp_wrap"]
	},
	"tuan.dangdang.com": {
		"a": ["div.tuan_box"]
	},
	"amazon.cn": {
		"a": ["form#handleBuy"]
	},
	"gome.com.cn": {
		"a": ["div.detailMain"]
	},
	"suning.com": {
		"a": ["div.product_content", "div.contenter"]
	},
	"coo8.com": {
		"a": ["div.mProd"]
	},
	"newegg.com.cn": {
		"a": ["div#proMainInfo"]
	},
	"item.51buy.com": {
		"a": ["div.id_detail"]
	},
	"item.buy.qq.com": {
		"a": ["div.prod_detail"]
	},
	"item.vancl.com": {
		"a": ["div.danpinBox"]
	},
	"yihaodian.com": {
		"a": ["div.produce"]
	},
	"nuomi.com": {
		"a": ["div.content"]
	},
	"meituan.com": {
		"a": ["div#content"]
	},
	"lashou.com": {
		"a": ["div.content"]
	},	
	"t.dianping.com": {
		"a": ["div.content"]
	},
	"dianping.com": {
		"a": ["div.main"]
	},
	"hotels.ctrip.com": {
		"a": ["div.detail_info"]
	},
	"vacations.ctrip.com": {
		"a": ["div.pkg-detail-m"]
	},
	"tuan.ctrip.com": {
		"a": ["div.main_rec_box"]
	},
	"hotel.qunar.com": {
		"a": ["div.qn_page"]
	},
	"package.qunar.com": {
		"a": ["div.qn_page"]
	},
	"tuan.qunar.com": {
		"a": ["section.head"]
	},
	"ganji.com": {
		"a": ["div#content"]
	},
	"58.com": {
		"a": ["section#main"]
	},
	
	// books and blogs
	"qidian.com": {
		"a": ["div#content"]
	},
	"vip.book.sina.com.cn": {
		"a": ["div#contTxt"]
	},
	"diandian.com": {
		"a": ["div.post div.rich-content", "div.post div.content", "article.post section.rich-content"]
	},
	"qing.weibo.com": {
		"a": ["div.content div.feedText"]
	},
	"zhan.renren.com": {
		"a": ["article.post div.content", "article.post div.post-content", "div.post div.post-content"]
	},
	"renren.com": {
		"a": [
			"div.text-article", // http://blog.renren.com/blog/246423684/874551745
			"div#photoContainer", // http://photo.renren.com/photo/239718867/photo-738580920#/239718867/photo-738580920
			"div.photo-list",
			"div.share-home", 
			"div.blog-home", 
			"div.album-home", // http://photo.renren.com/photo/243419125/album-237139539?frommyphoto
			"div.dis-home", // http://page.renren.com/699153758/group/334691114
			"div.cols", // common page
			"div#newsfeed-module-box" // news feed
			]
	},
	"huati.weibo.com": {
		"a": ["div.W8_main_bg"]
	},
	"topic.weibo.com": {
		"a": ["div.W_main_bg"]
	},
	"movie.mtime.com": {
		"a": ["div#movie_wrap"]
	},
	"theater.mtime.com": {
		"a": ["div.c_content"]
	},
	"twitter.com": {
		"a": [".permalink", "div.content-main"]
	},
	
	// videos 
	"youku.com": {
		// http://v.youku.com/v_show/id_XNDYxMTYxNTUy.html?f=18369995
		"a": ["div#playBox", "div#player"],
		"d": ["div#vpofficialinfo li.show_intro", "div#vpvideoinfo div.info", "div#vpfolderinfo div.info"],
		"t": [{
			// http://hz.youku.com/red/click.php?tp=1&amp;cp=4001569&amp;cpp=1000208&amp;
			// url=http%3A//profile.live.com/badge/%3Furl%3Dhttp%3A//v.youku.com/v_show/id_XNDYxNDYyNjky.html%26
			// Title%3D%255B%25E6%258B%258D%25E5%25AE%25A2%255D%25E6%259D%25AD%26
			// swfurl%3Dhttp%3A//player.youku.com/player.php/sid/XNDYxNDYyNjky/v.swf%26
			// screenshot%3Dhttp%3A//g2.ykimg.com/0100641F4650797115DB8B0591B0D82E582A02-90AA-A554-4E1F-CE8D5ABBCD4F
			"s": ["#s_msn1", "#s_msn2", "#s_baidu", "#s_baidu1"],
			"d": "href",
			"p": "(?:pic|screenshot)=(https?://[-a-zA-Z0-9_:\\@?=+,.!/~*%\\$]+)(?:&|$)"
		}]
	},
	"tudou.com": {
		// http://www.tudou.com/programs/view/g4ixfefPfmA/
		// http://www.tudou.com/listplay/WG6NNGdL3Ps.html
		// http://www.tudou.com/albumplay/tu2_3AhegUY/FLdPaIwMwgo.html		
		"a": ["div#player"],
		"d": ["div#albumInfo", "div#videoInfo"],
		"t": [{
			// pic:"http://i1.tdimg.com/154/453/460/p.jpg"
			"s": ["script:nth-child(2)"],
			"d": "textContent",
			"p": "pic\\s*:\\s*['\"]\\s*(https?://[-a-zA-Z0-9_:\\@&?=+,.!/~*%\\$]+)\\s*['\"]"
		}]
	},
	"iqiyi.com": {
		// http://www.iqiyi.com/dianshiju/20121011/3c15ab11c1c20f56.html
		"a": ["div#flashbox"],
		"d": ["p#j-descAll", "p#j-album-desc", "div.fx_box div.name_list"]
	},
	"v.qq.com": {
		// http://v.qq.com/cover/w/w56tusim76zvcxv.html?vid=f0106dthu2r
		"a": ["div#mod_player"],
		"d": ["div#mod_desc", "div#mod_videoinfo", "div.mod_info", "div.mod_album_tit"],
		"t": [{
			// flashvars="vid=f0106dthu2r&amp;autoplay=1&amp;list=2&amp;duration=70&amp;adplay=1&amp;cid=w56tusim76zvcxv&amp;
			// showcfg=1&amp;tpid=105&amp;share=1&amp;shownext=1&amp;title=%9C%E4%BA%BA%E5&amp;ptag="
			// http://vpic.video.qq.com/kvj1v1v69qctkab/c00118rydbm_1.jpg
			"b": "relative",
			"s": [":root"],	
			"d": "flashvars",
			"m": "(?:.*)vid=([-_a-zA-Z0-9]+)(?:.*)cid=([-_a-zA-Z0-9]+)(?:.*)",
			"r": "http://vpic.video.qq.com/$2/$1_1.jpg"
		}]
	},
	"tv.sohu.com": {
		// http://my.tv.sohu.com/u/vw/32567452
		"a": ["div#video"],
		"d": ["span.video-intro", "div#introID > p", "div.vIntro > p"],
		"t": [{
			// flashvars="&amp;skinNum=1&amp;pad=http://images.sohu.com/bill/s2011/yule/moren/pause/350250.swf&amp;domain=inner&amp;
			// cover=http://photocdn.sohu.com/20121012/d9449703-85d2-4ce9-8592-01b1a4e6481a_641548_830986_S_b.jpg&amp;
			// pageurl=http://tv.sohu.com/20121012/n354741088.shtml&amp;
			// vid=830986&amp;nid=354741088&amp;pid=314605859&amp;lightBtn=1&amp;sid=1209300942277234&amp;jump=0&amp;
			// autoplay=true&amp;cmscat=251366993;314605859;354741088&amp;
			// tagKey=%u8BFA%u8D1D%u5C14%u83B7%u5956%u534E%u4EBA%20%u9999%u6E2F%u4E2D%u5927%u6821%u957F%20%u9AD8%u951F%20%u8BFA%u8D1D%u5C14%u7269%u7406%u5B66%u5956&amp;
			// downloadBtn=1&amp;shareBtn=1&amp;onPlayed=_onVideoPlayed&amp;ua=http://tv.&amp;api_key=&amp;tlogoad=http://tv.sohu.com/upload/swf/empty.swf|http://tv.sohu.com/upload/swf/time.swf&amp;topBarFull=1"
			"b": "relative",
			"s": [":root"],
			"d": "flashvars",
			"p": "cover=(https?://[-a-zA-Z0-9_:\\@?=+,.!/~*%\\$]+)(&|$)" 
		}]
	},
	"v.163.com": {
		// http://v.163.com/zongyi/V8CC8A297/V8CM533T5.html
		"a": ["div#js_Movie", "div.playerArea-flashArea", "object#FPlayer"],
		"d": ["p.m-info", "div.movie-info", "div.video-pl6", "p.introduceArea-description", "div.introduceArea-note", "div.colR1 p.ptext"],
		"t": [{
			"b": "relative",
			"s": ["param[name=flashvars]"],
			"d": "value",
			"p": "coverpic=(https?://[-a-zA-Z0-9_:\\@?=+,.!/~*%\\$]+)(&|$)"
		},
		{
			"s": ["img.introduceArea-img", "div.picText img"],
			"d": "src"
		}]
	},
	"video.sina.com.cn": {
		"a": ["div#myflashBox", "embed#myMovie"],
		"d": ["table#contentBox", "table#conTable"]
	},
	"letv.com": {
		// http://www.letv.com/ptv/pplay/82163/35.html
		"a": ["div#fla_box"],
		"d": ["p#j-descript", "div.info"],
		"t": [{
			"s": ["script:first-child"],
			"d": "textContent",
			// pic:"http://img1.c0.letv.com/mms/thumb/2012/09/29/fc266607b09de17290b24a5e03b216c7/fc266607b09de17290b24a5e03b216c7_2.jpg"
			"p": "pic\\s*:\\s*['\"]\\s*(https?://[-a-zA-Z0-9_:\\@&?=+,.!/~*%\\$]+)\\s*['\"]"
		}]
	},
	"vod.kankan.com": {
		// http://vod.kankan.com/v/64/64690.shtml
		"a": ["div#_player"],
		"d": ["p#movie_intro_content_movieinfo", "p#movie_intro_content_scenarios", "p#movie_info_intro_l", "div.movieDetail"],
		"t": [
		// poster:'http://images.movie.xunlei.com/100x140/793/793fb0b357be230b8422286b7c9ca5ea.jpg'
		{
			"s": ["script:nth-child(2)"],
			"d": "textContent",
			"p": "poster\\s*:\\s*['\"]\\s*(https?://[-a-zA-Z0-9_:\\@&?=+,.!/~*%\\$]+)\\s*['\"]"
		},
		{
			"s": ["script:nth-child(11)"],
			"d": "textContent",
			"p": "poster\\s*:\\s*['\"]\\s*(https?://[-a-zA-Z0-9_:\\@&?=+,.!/~*%\\$]+)\\s*['\"]"
		}]
	},
	"v.pptv.com": {
		// http://v.pptv.com/show/AWg3tR2D8zGwLpY.html
		"a": ["div#pptv_playpage_box"],
		"d": ["div.showinfo"],
		"t": [{
			"s": ["ul#share_links a.share_tianya"],
			"d": "href",
			"p": "picUrl=(https?://[-a-zA-Z0-9_:\\@?=+,.!/~*%\\$]+)(&|$)"
			}]
	},
	"v.pps.tv": {
		// http://v.pps.tv/play_332GFJ.html#from_www
		"a": ["div#p-players", "div.flash-player"],
		"d": ["li.mct-item.js", "ul.video-info"],
		"t": [{
			"s": ["ul.p-list > li.p-item.select img", "ul.v-list > li.v-item.select img"],
			"d": "src"
		}]
	},
	"56.com": {
		// http://www.56.com/u36/v_NzU0NTg0NDE.html
		"a": ["div#player"],
		"d": ["div.info_detail > p", "div#video_info", "div.video_info"]
	},
	"v.ku6.com": {
		// http://v.ku6.com/special/show_5778585/6ag76b7wPdvrVvCmPUwWcg...html
		"a": ["div.player-wrap", "object#ku6player"],
		"d": ["dl.infoList"],
		"t": [{
			"s": ["script:nth-child(10)"],
			"d": "textContent",
			// cover : "http://vi2.ku6img.com/data1/p5/ku6video/2012/10/16/4/1355427614907_32713442_32713442/5.jpg"
			"p": "cover\\s*:\\s*['\"]\\s*(https?://[-a-zA-Z0-9_:\\@&?=+,.!/~*%\\$]+)\\s*['\"]"
			}]
	}
};
*/
Downsha.Utils.MIN_ARTICLE_RATIO = 1 / 16;
Downsha.Utils.MIN_ARTICLE_AREA = 30000;
Downsha.Utils.MAX_ARTICLE_XOFFSET_RATIO = 0.6;

Downsha.Utils.querySelectors = function(selectors, base) {
	var node = null;
  if (!selectors) {
  	return node;
  }
  
  base = base || document;
  for (var i = 0; i < selectors.length; i++) {
  	var selector = selectors[i];
  	if (selector === ":root") {
  		return base;
  	}
  	var node = base.querySelector(selector);
  	if (node) {
  		break;
  	}
  }
  
  return node;
};

Downsha.Utils.getArticleNode = function(doc, rules) {
	doc = doc || document;
	if (!doc) {
		return null;
	}
	var articleNode = null;
	var url = (doc.URL) ? doc.URL : doc.location.href;
	
	// See if we should special-case this.
	/*
	var host = null;
	var match = url.match(/^https?:\/\/([-a-z0-9]+(?:\.[-a-z0-9]+)*\.[-a-z0-9]+)(?::[0-9]+)?(\/|$)/i);
	if (match) {
		host = match[1].toLowerCase();
	}
	if (host && Downsha.Utils.HOST_ARTICLE_TABLE) {
		for (var prop in Downsha.Utils.HOST_ARTICLE_TABLE) {
			if (host.indexOf(prop) >= 0 && Downsha.Utils.HOST_ARTICLE_TABLE[prop]) {
				var candidateNode = Downsha.Utils.querySelectors(Downsha.Utils.HOST_ARTICLE_TABLE[prop].a, doc);
				if (candidateNode) {
					articleNode = candidateNode;
					break;
				}
			}
		}
	}
	*/
	
	if (rules && rules.a) {
		var candidateNode = Downsha.Utils.querySelectors(rules.a, doc);
		if (candidateNode) {
			articleNode = candidateNode;
		}
	}
	
	// If it's not a special case, see if it's a single image.
	if (!articleNode) {
		var imageTypes = ['jpeg', 'jpg', 'gif', 'png'];
		var urlExtension = doc.location.href.replace(/^.*\.(\w+)$/, "$1");
		if (urlExtension && (imageTypes.indexOf(urlExtension) != -1)) {
			var candidateNode = doc.querySelector("body > img");
			if (candidateNode) {
				articleNode = candidateNode;
			}
		}
	}
	
	// If we still didn't find an article, let's see if maybe it's in a frame.
	if (!articleNode) {
		if (doc.body.nodeName.toLowerCase() == "frameset") {
			// Find the biggest iframe as article node
			var docFrames = doc.getElementsByTagName("frame");
			var candidateNode = null;
			var curArea = 0;
			var maxArea = 0;
			for (var i = 0; i < docFrames.length; i++) {
				if (docFrames[i].width && docFrames[i].height) {
					curArea = docFrames[i].width * docFrames[i].height;
					if (curArea > maxArea) {
						candidateNode = docFrames[i];
						maxArea = curArea;
					}
				}
			}
			if (candidateNode && candidateNode.contentDocument && candidateNode.contentDocument.documentElement) {
				articleNode = candidateNode.contentDocument.documentElement;
			}
		}
	}
	
	// If we didn't use any of our special case handling, we'll fall back to the heuristic approach.
	if (!articleNode) {
		var extractor = new ExtractContentJS.LayeredExtractor();
		extractor.addHandler(extractor.factory.getHandler("Heuristics"));
		var extractRes = extractor.extract(doc);
		if (extractRes.isSuccess) {
			var candidateNode = extractRes.content.asNode();
			articleNode = Downsha.Utils.getElementForNode(candidateNode);
		}
	}
	
	return articleNode;
};

Downsha.Utils.isArticleSane = function(documentWidth, documentHeight, articleRect) {// decide whether article mode is sensible
  if (documentWidth && documentHeight && articleRect) {
    var pageArea = documentWidth * documentHeight;
    var articleArea = articleRect.width * articleRect.height;
    if (articleRect.top > documentHeight * Downsha.Utils.MAX_ARTICLE_XOFFSET_RATIO) { // max article top ratio is over 0.6
      return false;
    } else if (articleArea < Downsha.Utils.MIN_ARTICLE_AREA // min article area is less than 100*300
        && articleArea < (pageArea * Downsha.Utils.MIN_ARTICLE_RATIO)) { // min article area ratio is less than 1/16
      return false;
    } else {
      return true;
    }
  }
  return false;
};

Downsha.Utils.MESSAGE_ATTR = "message";
Downsha.Utils.PLACEHOLDER_ATTR = "placeholder";
Downsha.Utils.TITLE_ATTR = "title";
Downsha.Utils.MESSAGE_DATA_ATTR = "messagedata";
Downsha.Utils.LOCALIZED_ATTR = "localized";
Downsha.Utils.BADGE_NORMAL_COLOR = [ 255, 0, 0, 255 ]; // normal badge color: red
Downsha.Utils.BADGE_UPLOADING_COLOR = [ 255, 255, 0, 255 ]; // uploading badge color: yellow

Downsha.Utils.updateBadge = function(context, tabId) {
  Downsha.Utils.clearBadge(tabId);
  Downsha.Utils.setBadgeTitle(chrome.i18n.getMessage("BrowserActionTitle"), tabId);
};
Downsha.Utils.clearBadge = function(tabId) {
  var o = {
    text : ""
  };
  if (typeof tabId == 'number') {
  	this.doInSpecifiedTab(tabId, function(tab) {
    	o["tabId"] = tabId;
    	chrome.browserAction.setBadgeText(o);
    });
  } else {
    this.clearAllBadges();
  }
};
Downsha.Utils.clearAllBadges = function() {
  this.doInEveryNormalTab(function(tab) {
    chrome.browserAction.setBadgeText( {
      tabId : tab.id,
      text : ""
    });
  }, true);
};
Downsha.Utils.setBadgeBackgroundColor = function(color, tabId) {
  var o = {
    color : color
  };
  if (typeof tabId == 'number') {
  	this.doInSpecifiedTab(tabId, function(tab) {
    	o["tabId"] = tabId;
    	chrome.browserAction.setBadgeBackgroundColor(o);
    });
  } else {
    this.doInEveryNormalTab(function(tab) {
      o.tabId = tab.id;
      chrome.browserAction.setBadgeBackgroundColor(o);
    }, true);
  }
};
Downsha.Utils.setBadgeText = function(txt, tabId) {
  if (txt) {
    var o = {
      text : "" + txt
    };
    if (typeof tabId == 'number') {
    	this.doInSpecifiedTab(tabId, function(tab) {
      	o["tabId"] = tabId;
      	chrome.browserAction.setBadgeText(o);
      });
    } else {
      this.doInEveryNormalTab(function(tab) {
        o.tabId = tab.id;
        chrome.browserAction.setBadgeText(o);
      }, true);
    }
  } else if (txt == null) {
    Downsha.Utils.clearBadge(tabId);
  }
};
Downsha.Utils.setBadgeTitle = function(title, tabId) {
  if (title) {
    var o = {
      title : "" + title
    };
    if (typeof tabId == 'number') {
    	this.doInSpecifiedTab(tabId, function(tab) {
      	o["tabId"] = tabId;
      	chrome.browserAction.setTitle(o);
      });
    } else {
      this.doInEveryNormalTab(function(tab) { // set title of selected tab
        o.tabId = tab.id;
        chrome.browserAction.setTitle(o);
      }, true);
    }
  } else if (title == null) {
    Downsha.Utils.clearBadgeTitle(tabId);
  }
};
Downsha.Utils.clearBadgeTitle = function(tabId) {
  var o = {
    title : ""
  };
  if (typeof tabId == 'number') {
  	this.doInSpecifiedTab(tabId, function(tab) {
  		o["tabId"] = tabId;
  		chrome.browserAction.setTitle(o);
  	});
  } else {
    this.doInEveryNormalTab(function(tab) { // clear title of selected tab
      o.tabId = tab.id;
      chrome.browserAction.setTitle(o);
    }, true);
  }
};

Downsha.Utils.doInSpecifiedTab = function(tabId, callback) {
  if (typeof tabId == 'number') {
  	chrome.tabs.get(tabId, function(tab) {
  		if (typeof tab != "undefined" && tab != null) {
  			callback();
  		}
  	});
  }
}

Downsha.Utils.doInEveryNormalTab = function(callback, onlySelected) {
  chrome.windows.getAll({
    populate : true
  }, function(wins) {
    for ( var w = 0; w < wins.length; w++) {
      if (wins[w].type == "normal") {
        for ( var t = 0; t < wins[w].tabs.length; t++) {
          if (!onlySelected || wins[w].tabs[t].selected) {
            callback(wins[w].tabs[t], wins[w]);
          }
        }
      }
    }
  });
};

Downsha.Utils.localizeBlock = function(block) {
  if (block.attr(Downsha.Utils.MESSAGE_ATTR)) {
  	Downsha.Utils.localizeElement(block);
  }
  // use jquery to find siblings with attribute 'message', 'placeholder', 'title'
  var siblings = block.find("[" + Downsha.Utils.MESSAGE_ATTR + "], ["
  	+ Downsha.Utils.PLACEHOLDER_ATTR + "], [" + Downsha.Utils.TITLE_ATTR + "]");
  for ( var i = 0; i < siblings.length; i++) {
    var sibling = $(siblings.get(i));
    Downsha.Utils.localizeElement(sibling);
  }
};
Downsha.Utils.extractLocalizationField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.MESSAGE_ATTR))
    return element.attr(Downsha.Utils.MESSAGE_ATTR);
  else
    return null;
};
Downsha.Utils.extractLocalizationDataField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.MESSAGE_DATA_ATTR)) {
    var v = element.attr(Downsha.Utils.MESSAGE_DATA_ATTR);
    try {
      v = eval(v);
    } catch (e) {
    }
    if (!(v instanceof Array))
      v = [ v ];
    return v;
  } else {
    return null;
  }
};
Downsha.Utils.extractLocalizationPlaceholderField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.PLACEHOLDER_ATTR)) {
    return element.attr(Downsha.Utils.PLACEHOLDER_ATTR);
  } else {
    return null;
  }
};
Downsha.Utils.extractLocalizationTitleField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.TITLE_ATTR)) {
    return element.attr(Downsha.Utils.TITLE_ATTR);
  } else {
    return null;
  }
};
Downsha.Utils.localizeElement = function(element, force) {
  if (!force && element.attr(Downsha.Utils.LOCALIZED_ATTR)
      && element.attr(Downsha.Utils.LOCALIZED_ATTR) == "true") {
    return;
  }
  var field = Downsha.Utils.extractLocalizationField(element);
  var placeholderField = Downsha.Utils.extractLocalizationPlaceholderField(element);
  var titleField = Downsha.Utils.extractLocalizationTitleField(element);
  var fieldData = Downsha.Utils.extractLocalizationDataField(element);
  var localized = false;
  if (typeof field == "string" && field != "") {
    if (fieldData) {
      var msg = chrome.i18n.getMessage(field, fieldData);
    } else {
      var msg = chrome.i18n.getMessage(field);
    }
    if (element.prop("tagName") == "INPUT") {
      element.val(msg);
    } else {
      element.html(msg);
    }
    localized = true;
  }
  if (typeof placeholderField == "string" && placeholderField != "") {
    var msg = chrome.i18n.getMessage(placeholderField);
    element.attr(Downsha.Utils.PLACEHOLDER_ATTR, msg);
    localized = true;
  }
  if (typeof titleField == "string" && titleField != "") {
    var msg = chrome.i18n.getMessage(titleField);
    element.attr(Downsha.Utils.TITLE_ATTR, msg);
    localized = true;
  }
  if (localized) {
    element.attr(Downsha.Utils.LOCALIZED_ATTR, "true");
  }
};

Downsha.Utils.notifyExtension = function(requestMessage, callback) {
  chrome.windows.getCurrent(function(win) {
    chrome.tabs.getSelected(win.id, function(tab) {
      var o = {
        tab : tab,
        id : chrome.i18n.getMessage("@@extension_id")
      };
      var cb = callback || function() {
      };
      chrome.extension.onRequest.dispatch(requestMessage, o, cb);
      chrome.extension.sendRequest(requestMessage, cb);
    });
  });
};
Downsha.Utils._setDesktopNotificationAttributes = function(notification, attrs) {
  if (notification && typeof attrs == 'object' && attrs) {
    for ( var i in attrs) {
      notification[i] = attrs[i];
    }
  }
};
Downsha.Utils.notifyDesktop = function(title, message, timeout, attrs) {
  var notification = webkitNotifications.createNotification('images/downsha48.png', title, message);
  this._setDesktopNotificationAttributes(notification, attrs);
  notification.show();
  if (typeof timeout == 'number') {
    setTimeout(function() {
      notification.cancel();
    }, timeout);
  }
  return notification;
};
Downsha.Utils.notifyDesktopWithHTML = function(filePath, timeout, attrs) {
  var notification = webkitNotifications.createHTMLNotification(filePath);
  this._setDesktopNotificationAttributes(notification, attrs);
  notification.show();
  if (typeof timeout == 'number') {
    setTimeout(function() {
      notification.cancel();
    }, timeout);
  }
  return notification;
};
Downsha.Utils.openWindow = function(url) {
  var bg = chrome.extension.getBackgroundPage();
  bg.Downsha.chromeExtension.openWindow(url);
};
Downsha.Utils.getPostData = function(queryString) {
  if (typeof queryString == 'undefined') {
    queryString = window.location.search.replace(/^\?/, "");
  }
  var result = {};
  if (queryString) {
    var parts = queryString.split("&");
    for ( var i = 0; i < parts.length; i++) {
      var kv = parts[i].split("=");
      var k = unescape(kv[0]);
      var v = (kv[1]) ? unescape(kv[1]) : null;
      if (v) {
        try {
          result[k] = JSON.parse(v);
        } catch (e) {
          result[k] = v;
        }
      } else {
        result[k] = v;
      }
    }
  }
  return result;
};
Downsha.Utils.isForbiddenUrl = function(url) {
	// chrome extension and webstore url is forbidden.
	// The extension gallery can not be scripted.
  if (typeof url == 'string' && 
  	(url.toLowerCase().indexOf("chrome.google.com/extensions") >= 0 || 
  	url.toLowerCase().indexOf("chrome.google.com/webstore") >= 0 ||
  	url.toLowerCase().indexOf("ext.chrome.360.cn") >= 0)) {
    return true;
  }
  if (typeof url == 'string' && // http or https initiated
  	!url.toLowerCase().match(/^https?:\/\//)) {
    return true;
  }
  return false;
};

Downsha.Utils.getTextSize = function(text) {
	var el = $("<div></div>");
	el.text(text);
	el.css( {
		position : "absolute",
		top : "0px",
		left : "0px",
		padding : "0px",
		margin : "0px",
		display : "block",
		zIndex : "0",
		color : "rgba(0, 0, 0, 0)",
		background : "rgba(0, 0, 0, 0)"
	});
	$("body").append(el);
	var size = {
		width : el.width(),
		height : el.height()
	};
	el.remove();
	return size;
};

Downsha.Utils.updateSelectElementWidth = function(el, textCallback) {
  var $el = (el instanceof jQuery) ? el : $(el);
  var val = $el.val();
  if (typeof textCallback == 'function') {
    val = textCallback(val);
  }
  var ld = parseInt($el.css("paddingLeft"));
  var rd = parseInt($el.css("paddingRight"));
  var delta = ((!isNaN(ld)) ? ld : 0) + ((!isNaN(rd)) ? rd : 0);
  var w = Downsha.Utils.getTextSize(val).width;
  w = (w) ? w : 0;
  var newWidth = w + delta;
  // adjust by another 10 pixels - mainly for Windows platform
  newWidth += 10;
  $el.css( {
    minWidth : newWidth + "px",
    width : newWidth + "px"
  });
};

Downsha.Utils.resizeElement = function(el, size, handler) {
  var $el = (el instanceof jQuery) ? el : $(el);
  var cssObj = {};
  var sizeObj = {};
  if (size && typeof size.width == 'number') {
    var ld = parseInt($el.css("paddingLeft"));
    var rd = parseInt($el.css("paddingRight"));
    var delta = ((!isNaN(ld)) ? ld : 0) + ((!isNaN(rd)) ? rd : 0);
    sizeObj.width = (size.width + delta);
    cssObj.minWidth = sizeObj.width + "px";
    cssObj.width = sizeObj.width + "px";
  }
  if (size && typeof size.height == 'number') {
    var td = parseInt($el.css("paddingTop"));
    var bd = parseInt($el.css("paddingBottom"));
    var delta = ((!isNaN(td)) ? td : 0) + ((!isNaN(bd)) ? bd : 0);
    sizeObj.height = size.height + delta;
    cssObj.minHeight = sizeObj.height + "px";
    css.height = sizeObj.height + "px";
  }
  $el.css(cssObj);
  if (typeof handler == 'function') {
    handler($el, sizeObj);
  }
};

Downsha.Utils.BAD_FAV_ICON_URLS = [ "http://localhost/favicon.ico" ];
Downsha.Utils.createUrlClipContent = function(title, url, favIcoUrl) {
  var titleAttr = (title) ? Downsha.Utils.escapeXML(title) : "";
  var style = "font-size: 12pt; line-height: 18px; display: inline;";
  var content = "<a title=\"" + titleAttr + "\" style=\"" + style
      + "\" href=\"" + url + "\">" + url + "</a>";
  if (typeof favIcoUrl == 'string' && favIcoUrl.length > 0
      && Downsha.Utils.BAD_FAV_ICON_URLS.indexOf(favIcoUrl.toLowerCase()) < 0) {
    var imgStyle = "display:inline;border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;";
    content = "<span><img title=\"" + titleAttr + "\" style=\"" + imgStyle
        + "\" src=\"" + favIcoUrl + "\"/>" + content + "</span>"
  } else {
    content = "<span>" + content + "</span>";
  }
  return content;
};

Downsha.Utils.getNodeString = function(node) {
	var nodeStr = null;
	if (typeof node != "object" || node == null) {
		nodeStr = "[null]";
	} else if (node && node.nodeType == Node.TEXT_NODE) {
		if (typeof node.nodeValue == "string" && node.nodeValue.length > 0) {
			nodeStr = node.nodeName + " " + node.nodeValue;
		} else {
			nodeStr = node.nodeName + " [empty]";
		}
	} else if (node && node.nodeType == Node.ELEMENT_NODE) {
		nodeStr = "<" + node.nodeName;
		var attrs = node.attributes;
		for (var i = 0; i < attrs.length; i++) {
      if (!attrs[i] || !attrs[i].name || !attrs[i].specified) {
      	continue;
      }
      if (attrs[i].value) {
      	nodeStr += " " + attrs[i].name + "=\"" + attrs[i].value + "\"";
      } else {
      	nodeStr += " " + attrs[i].name;
      }
		}
		nodeStr += ">";
	} else {
		nodeStr = "node";
		if (typeof node.nodeName == "string" && node.nodeName.length > 0) {
			nodeStr += " name: " + node.nodeName;
		}
		if (typeof node.nodeType == "number") {
			nodeStr += " type: " + node.nodeType;
		}
		if (typeof node.nodeValue == "string" && node.nodeValue.length > 0) {
			nodeStr += " value: " + node.nodeValue;
		}
	}
	return nodeStr;
};

Downsha.Semaphore = function(signals) {
  this.__defineGetter__("excessSignals", this.getExcessSignals);
  this.initialize(signals);
};
Downsha.inherit(Downsha.Semaphore, Array);

Downsha.Semaphore.mutex = function() {
  var sema = new Downsha.Semaphore();
  sema.signal();
  return sema;
};

Downsha.Semaphore.prototype._excessSignals = 0;
Downsha.Semaphore.prototype.initialize = function(signals) {
  this._excessSignals = parseInt(signals);
  if (isNaN(this._excessSignals)) {
    this._excessSignals = 0;
  }
};
Downsha.Semaphore.prototype.getExcessSignals = function() {
  return this._excessSignals;
};
Downsha.Semaphore.prototype.hasExcessSignals = function() {
  return (this._excessSignals > 0) ? true : false;
};
Downsha.Semaphore.prototype.signal = function() {
  if (this.length == 0) {
    this._excessSignals++;
  } else {
    this._processNext();
  }
};
Downsha.Semaphore.prototype.wait = function() {
  if (this._excessSignals > 0) {
    this._excessSignals--;
    this._processNext();
  }
};
Downsha.Semaphore.prototype.critical = function(fn) {
  var self = this;
  var f = function() {
    try {
      fn();
    } catch (e) {
      self.signal();
      throw (e);
    }
  };
  f._semaOrigFn = fn;
  this.push(f);
  this.wait();
};
Downsha.Semaphore.prototype.wave = function() {
  if (this.length > 0) {
    this.shift();
  }
};
Downsha.Semaphore.prototype.waveAll = function() {
  if (this.length > 0) {
    this.splice(0, this.length);
  }
};
Downsha.Semaphore.prototype.waveEach = function(fn) {
  var i = 0;
  while (i < this.length) {
    if (fn(this[i]._semaOrigFn)) {
      this.splice(i, 1);
    } else {
      i++;
    }
  }
};
Downsha.Semaphore.prototype._processNext = function() {
  if (this.length > 0) {
    var fn = this.shift();
    if (typeof fn == 'function') {
      fn();
    }
  }
};
Downsha.Semaphore.prototype.toString = function() {
  return this._excessSignals + ":[" + this.join(",") + "]";
};

/**
 * Naive implementation of XOR encryption with padding. It is not meant to be a
 * strong encryption of any kind, just an obfuscation. The algorithm uses a seed
 * string for XORing. The string to be encrypted is first XOR'd with a random
 * number to avoid recognizable patterns; the result is then padded and then
 * XOR'd with the seed string.
 * 
 * Make sure that XORCrypt.LENGTH is larger than the strings you're trying to
 * encrypt.
 * 
 * <pre>
 * Usage: 
 * var enc = Downsha.XORCrypt.encrypt(&quot;secret&quot;, &quot;seed&quot;); 
 * var dec = Downsha.XORCrypt.decrypt(enc, &quot;seed&quot;);
 * </pre>
 */
Downsha.XORCrypt = {
  DELIMIT : ":",
  LENGTH : 128,
  /**
   * Pads string to make it XORCrypt.LENGTH characters in length. Padding is
   * done by prepending the string with random chars from a range of printable
   * ascii chars.
   */
  _padString : function(str) {
    var counter = 0;
    if (str.length < 128) {
      for ( var i = str.length; i <= 128; i++) {
        str = String.fromCharCode(this._randomForChar()) + str;
        counter++;
      }
    }
    return counter + this.DELIMIT + str;
  },
  /**
   * Returns random number that would correspond to a printable ascii char.
   */
  _randomForChar : function() {
    var r = 0;
    var c = 0;
    while (r < 33 || r > 126) {
      // just a waiting... this shouldn't happen frequently
      r = parseInt(Math.random() * 150);
      c++;
    }
    return r;
  },
  /**
   * Returns random non-zero integer.
   */
  _randomNonZero : function() {
    var r = 0;
    while ((r = parseInt(Math.random() * 100)) == 0) {
      // just a waiting... this shouldn't happen frequently
    }
    return r;
  },
  /**
   * Shifts string by XOR'ing it with a number larger than 100 so as to avoid
   * non-printable characters. The resulting string will be prepended with the
   * number used to XOR followed by DELIMITER.
   */
  _shiftString : function(str) {
    var delta = this._randomNonZero() + 100;
    var shifted = [];
    for ( var i = 0; i < str.length; i++) {
      shifted.push(String.fromCharCode(str.charCodeAt(i) + delta));
    }
    return delta + this.DELIMIT + shifted.join("");
  },
  /**
   * Unshifts and returns a shifted string. The argument should be in a format
   * produced by _shitString(), i.e. begin with the shift coefficient followed
   * by DELIMITER, followed by the shifted string.
   */
  _unshiftString : function(str) {
    var delta = parseInt(str.substring(0, str.indexOf(this.DELIMIT)));
    var unshifted = [];
    if (!isNaN(delta)) {
      for ( var i = ((delta + "").length + this.DELIMIT.length); i < str.length; i++) {
        unshifted.push(String.fromCharCode(str.charCodeAt(i) - delta));
      }
    }
    return unshifted.join("");
  },
  /**
   * Encrypts string with a seed string and returns encrypted string padded to
   * be XORCrypt.LENGTH characters long.
   */
  encrypt : function(str, seed) {
    str += "";
    seed += "";
    var newStr = this._padString(this._shiftString(str));
    var enc = [];
    for ( var i = 0; i < newStr.length; i++) {
      var e = newStr.charCodeAt(i);
      for ( var j = 0; j < seed.length; j++) {
        e = seed.charCodeAt(j) ^ e;
      }
      enc.push(String.fromCharCode(e + 100));
    }
    return enc.join("");
  },
  /**
   * Decrypts string using seed string. The seed string has to be the same
   * string that was used in encrypt()ing.
   */
  decrypt : function(str, seed) {
    str += "";
    seed += "";
    var dec = [];
    for ( var i = 0; i < str.length; i++) {
      var e = str.charCodeAt(i) - 100;
      for ( var j = seed.length - 1; j >= 0; j--) {
        e = seed.charCodeAt(j) ^ e;
      }
      dec.push(String.fromCharCode(e));
    }
    var decStr = dec.join("");
    var pad = parseInt(decStr.substring(0, decStr.indexOf(this.DELIMIT)));
    if (!isNaN(pad)) {
      return this._unshiftString(decStr.substring(("" + pad).length
          + this.DELIMIT.length + pad));
    }
    return "";
  }
};
