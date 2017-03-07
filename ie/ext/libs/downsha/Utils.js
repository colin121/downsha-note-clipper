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
  var names = (constructNames instanceof Array) ? 
  	constructNames : [ constructNames ];
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
    var re = new RegExp("^[^:]+:\/+([^\/" + ((includePort) ? "" : ":")
        + "]+).*$");
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

Downsha.Utils.toHyphenCase = function(str) {
	var res = str;
	if (typeof str == "string" && str.length > 0) {
		res = str.replace(/([A-Z])/g, function(initial) {
			return "-" + initial.toLowerCase();
		});
	}
	return res;
};
Downsha.Utils.toCamelCase = function(str) {
	var res = str;
	if (typeof str == "string" && str.length > 0) {
		res = str.replace(/\-(\w)/g, function(all, initial) {
			return initial.toUpperCase();
		});
	}
	return res;
};
Downsha.Utils.getPixelSize = function(ele, val, doc, force) {
	/**
	 * If size is in pt then use Dean Edwards method to convert it to px as it works.
	 * If not we fallback to some simple math which relies on the fact that 
	 * most browsers treat points the same now based on the following calculation.
	 * 1pt = 1/72nd of an inch
	 * Browsers assume 96 CSS px per inch so the calculation is 96/72 = 1.333px per pt
	 */
	var pixelSize = null;
	var valMatch = val.match(/^(\d*\.?\d*)\s*([\w%]+)$/);
	if (!valMatch) {
		return 0;
	}
	var valNum = parseFloat(valMatch[1]);
	if (isNaN(valNum) || valNum == 0) {
		return 0;
	}
	var valUnit = valMatch[2]; // get unit of measurement
	if (valUnit == "pt") {
		if (ele.currentStyle) {
			var oldLeft = ele.style.left;
			var oldRuntimeLeft = ele.runtimeStyle.left;
			
			// Put in the new values to get a computed value out
			ele.runtimeStyle.left = ele.currentStyle.left;
			ele.style.left = val || 0;
			pixelSize = ele.style.pixelLeft;
			
			ele.style.left = oldLeft;
			ele.runtimeStyle.left = oldRuntimeLeft;
		} else {
			pixelSize = Math.round(1.3333 * parseFloat(val)); 
		}
	} else {
		/*
		if (!doc) {
			doc = (node.ownerDocument) ? node.ownerDocument : node.document;
		}
		if (doc.createElement) {
			var tagName = ele.tagName.toUpperCase();
			var div = doc.createElement("div");
			div.style.position = "absolute"; 
			div.style.visibility = 'hidden'; //hide
			div.style.lineHeight = '0'; //Apparently IE adds invisible space if this is not set
			*/
			/**
			 * % and em need to be calculated in relation to the parent of the element.
			 * IMG tags also need such special handle.
			 * unless we have forced to use the current element, we should always use parent element.
			 */
			/*
			if (/(%|em)$/.test(val) || tagName === "IMG") {
				if (!force && (tagName != "BODY") && (tagName != "HTML")) {
					ele = ele.parentNode || ele;
				}
				div.style.height = val;
			} else {
				div.style.borderStyle = 'solid';
				div.style.borderBottomWidth = '0';                                   
				div.style.borderTopWidth = val;
			}
			if (ele) {
				// append hidden div to our element OR parent element if required
				ele.appendChild(div);
				// measure size in px by getting offsetHeight
				pixelSize = div.offsetHeight;
				// clean up hidden dive now
				ele.removeChild(div);
			}
		}
		*/
	}
	return pixelSize || 0;
};
Downsha.Utils.getConstructorName = function(obj) {
	// [typeof obj.constructor] IE7 returns 'undefined', IE8/9 returns 'object'
	// [typeof obj.constructor.toString] IE8 returns 'unknown', IE9 returns 'function'	
	if ((typeof obj == "object") && (obj != null) && 
		(typeof obj.constructor == "object") && (obj.constructor != null))
	{
		if (typeof obj.constructor.name != "undefined") { // IE doesn't support constructor.name
			return obj.constructor.name;
		} else if (typeof obj.constructor.toString == "function") { // IE 9 supports constructor.toString method
			var objName = obj.constructor.toString();
			if ((typeof objName == "string") && (objName.length > 0)) {
				// function Function() {\n\t[native code]\n}
				objName = objName.replace(/function\s+([\w\$]+)\s*\(\s*\)/i, "$1");
				// [object CSSStyleDeclaration]
				objName = objName.replace(/\[\s*object\s+([\w\$]+)\s*\]/i, "$1");
				return objName;
			}
		}
	}
	return null;
};

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
  var scrollX = win.pageXOffset ? 
  	win.pageXOffset : // for IE 9
  	win.document.body.scrollLeft; // for IE 6/7/8
  var scrollY = win.pageYOffset ? 
  	win.pageYOffset : // for IE 9
  	Math.max(win.document.documentElement.scrollTop, win.document.body.scrollTop); // for IE 6/7/8
  return {
    left : rect.left + scrollX,
    top : rect.top + scrollY,
    right : rect.right + scrollX,
    bottom : rect.bottom + scrollY,
    width : (typeof rect.width == "number") ? (rect.width) : (rect.right - rect.left), // compute width for ie
    height : (typeof rect.height == "number") ? (rect.height) : (rect.bottom - rect.top) // compute height for ie
  };
};
Downsha.Utils.getAbsoluteBoundingClientRect = function(node, win) {
  var ele = (node && node.nodeType == Node.TEXT_NODE) ? 
  	(node.parentElement ? node.parentElement : node.parentNode) : node;
  if (!ele) {
  	return null;
  }
  return Downsha.Utils.makeAbsoluteClientRect(ele.getBoundingClientRect(), win);
};
Downsha.Utils.getElementForNode = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    return node;
  } else if (node && node.parentElement) {
  	return node.parentElement;
  } else if (node && node.parentNode) {
  	return node.parentNode;
  } else {
  	return null;
  }
};
Downsha.Utils.addElementClass = function(element, className) {
  if (element && className) {
  	/**
  	 * In IE, attribute values are mapped to HTML DOM properties rather than literal attributes.
  	 * so many attributes can only be set using the camel-cased name they use for their DOM property equivalent. 
  	 * The most common examples of this are className for a class attribute.
  	 */
    var elementClass = element.className;
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      var found = false;
      for (var i = 0; i < parts.length; i++) {
      	if (parts[i] == className) {
      		found = true;
      		break;
      	}
      }
      if (!found) {
        parts.push(className);
      }
      className = parts.join(" ");
    }
    LOG.debug("Utils.addElementClass " + className);
    element.className = className;
  }
};
Downsha.Utils.removeElementClass = function(element, className) {
  if (element && className) {
    var elementClass = element.className;
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      var found = false;
      for (var i = 0; i < parts.length; i++) {
      	if (parts[i] == className) {
      		found = true;
      		break;
      	}
      }
      if (found) {
      	parts.splice(i, 1);
      }
      // Array.indexOf is NOT supported in IE 6/7/8/9
      /*
      var i = -1;
      if ((i = parts.indexOf(className)) >= 0) {
        parts.splice(i, 1);
      }
      */
      className = parts.join(" ");
      LOG.debug("Utils.removeElementClass " + className);
      element.className = className;
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
  for (var i = 0; i < a.length; i++) {
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
Downsha.Utils.expandRect = function(a, b) {
  a.left = (typeof a.left == "number") ? Math.min(a.left, b.left) : b.left;
  a.top = (typeof a.top == "number") ? Math.min(a.top, b.top) : b.top;
  a.right = (typeof a.right == "number") ? Math.max(a.right, b.right) : b.right;
  a.bottom = (typeof a.bottom == "number") ? Math.max(a.bottom, b.bottom) : b.bottom;
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

Downsha.Utils.MIN_ARTICLE_RATIO = 1 / 16;
Downsha.Utils.MIN_ARTICLE_AREA = 30000;
Downsha.Utils.MAX_ARTICLE_XOFFSET_RATIO = 0.6;

Downsha.Utils.isArticleSane = function(documentWidth, documentHeight, articleRect) {// decide whether article mode is sensible
  if (documentWidth && documentHeight && articleRect) {
    var pageArea = documentWidth * documentHeight;
    var articleArea = articleRect.width * articleRect.height;
    if (articleRect.top > documentHeight * Downsha.Utils.MAX_ARTICLE_XOFFSET_RATIO) { // max article top ratio is over 0.6
    	LOG.debug("Article is not sane because it lies below admissable x-offset ratio. article top: " + articleRect.top);
      return false;
    } else if (articleArea < Downsha.Utils.MIN_ARTICLE_AREA // min article area is less than 100*300
        && articleArea < (pageArea * Downsha.Utils.MIN_ARTICLE_RATIO)) { // min article area ratio is less than 1/16
			LOG.debug("Article is not sane because its area is not satisfactory. article area: " + articleArea);
      return false;
    } else {
      return true;
    }
  }
  return false;
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
  if (typeof url == 'string' // chrome extension and webstore url is forbidden
      && (url.toLowerCase().indexOf("chrome.google.com/extensions") >= 0 || 
      url.toLowerCase().indexOf("chrome.google.com/webstore") >= 0)) {
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
