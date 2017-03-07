/**
 * @author: chenmin
 * @date: 2011-09-04
 * @desc: utilities
 */

Downsha.Utils = {};
Downsha.Utils.MESSAGE_ATTR = "message";
Downsha.Utils.LOCALIZED_ATTR = "localized";
Downsha.Utils.PLACEHOLDER_ATTR = "placeholder";
Downsha.Utils.TITLE_ATTR = "title";
Downsha.Utils.MESSAGE_DATA_ATTR = "messagedata";

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
Downsha.Utils.localizeElement = function(element, force) {
	if (!force && element.attr(Downsha.Utils.LOCALIZED_ATTR)
		&& element.attr(Downsha.Utils.LOCALIZED_ATTR == "true")) {
		return;
	}
	var field = Downsha.Utils.extractLocalizationField(element);
	var placeholderField = Downsha.Utils.extractLocalizationPlaceholderField(element);
	var titleField = Downsha.Utils.extractLocalizationTitleField(element);
	var fieldData = Downsha.Utils.extractLocalizationDataField(element);
	var localized = false;
	var msg;
	if (field) {
		if (fieldData) {
			msg = Downsha.chrome.i18n.getMessage(field, fieldData);
		} else {
			msg = Downsha.chrome.i18n.getMessage(field);
		}
		if (element.prop("tagName") == "INPUT") {
			element.val(msg);
		} else {
			element.text(msg);
		}
		localized = true;
	}
	if (placeholderField && typeof placeholderField == "string") {
		msg = Downsha.chrome.i18n.getMessage(placeholderField);
		element.attr(Downsha.Utils.PLACEHOLDER_ATTR, msg);
		localized = true;
	}
	if (titleField && typeof titleField == "string") {
		msg = Downsha.chrome.i18n.getMessage(titleField);
		element.attr(Downsha.Utils.TITLE_ATTR, msg);
		localized = true;
	}
	if (localized) {
		element.attr(Downsha.Utils.LOCALIZED_ATTR, "true");
	}
};
Downsha.Utils.extractLocalizationField = function(element) { // "message"
	if (typeof element.attr == 'function' && element.attr(Downsha.Utils.MESSAGE_ATTR)) {
		return element.attr(Downsha.Utils.MESSAGE_ATTR);
	}
	else {
		return null;
	}
};
Downsha.Utils.extractLocalizationPlaceholderField = function(element) { // "placeholder"
	if (typeof element.attr == "function" && element.attr(Downsha.Utils.PLACEHOLDER_ATTR)) {
		return element.attr(Downsha.Utils.PLACEHOLDER_ATTR);
	} else {
		return null;
	}
};
Downsha.Utils.extractLocalizationTitleField = function (element) { // "title"
	if (typeof element.attr == "function" && element.attr(Downsha.Utils.TITLE_ATTR)) {
		return element.attr(Downsha.Utils.TITLE_ATTR);
	} else {
		return null;
	}
};
Downsha.Utils.extractLocalizationDataField = function (element) { // "messageData"
	if (typeof element.attr == "function" && element.attr(Downsha.Utils.MESSAGE_DATA_ATTR)) {
		var v = element.attr(Downsha.Utils.MESSAGE_DATA_ATTR);
		try {
			v = JSON.parse(v);
		} catch (e) {}
		if (!(v instanceof Array)) {
			v = [v];
		}
		return v;
	} else {
		return null;
	}
};

Downsha.Utils.getKeyFrom = function(obj, key, type, defaultValue) {
	var value = (typeof defaultValue != 'undefined') ? defaultValue : null;
	if (typeof obj == 'object') {
		if (typeof type == 'string' && typeof obj[key] == type) {
			value = obj[key];
		} else if (typeof obj[key] != 'undefined') {
			value = obj[key];
		}
	}
	return value;
};
Downsha.Utils.importRegistry = function(window, registry) {
	if (typeof registry == 'object' && registry != null) {
		for ( var i in registry) {
			Downsha.Utils._importModel(window, registry[i]);
		}
	}
};
Downsha.Utils._importModel = function(window, model) {
	if (typeof model == 'function' && typeof model["modelName"] == 'string') {
		window[model["modelName"]] = model;
		if (typeof model.prototype.parent != 'undefined' && typeof model.prototype.parent.constructor == 'function') {
		  Downsha.Utils._importModel(window, model.prototype.parent.constructor);
		}
	}
};
Downsha.Utils.importConstructs = function(fromWindow, toWindow, constructNames) {
	var names = (constructNames instanceof Array) ? constructNames : [constructNames];
	for (var i=0; i<names.length; i++) {
		if (typeof fromWindow[names[i]] != 'undefined') {
			toWindow[names[i]] = fromWindow[names[i]];
		}
	}
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
	newWidth += 30;
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
Downsha.Utils.getTextSize = function(text) {
	var el = $("<div></div>");
	el.text(text);
	el.css({
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

Downsha.Utils.separateString = function(str, separator) {
	if (typeof str != 'string') {
		return str;
	}
	if (typeof separator != 'string') {
		separator = ",";
	}
	var parts = str.split(separator);
	var returnParts = new Array();
	for (var i=0; i<parts.length; i++) {
		if (typeof parts[i] != 'string') {
			continue;
		}
		var clean = Downsha.Utils.trim(parts[i]);
		if (clean && clean.length > 0) {
			returnParts.push(clean);
		}
	}
	return returnParts;
};
Downsha.Utils.trim = function(str) {
	if (typeof str != 'string') {
		return str;
	}
	return str.replace(/^\s+/, "").replace(/\s+$/, "");
};
Downsha.Utils.isForbiddenUrl = function(url) {
	if (typeof url == 'string' // chrome extension and webstore url is forbidden
		&& (url.toLowerCase().indexOf("chrome.google.com/extensions") >= 0 || 
		url.toLowerCase().indexOf("chrome.google.com/webstore") >= 0)) {
		return true;
	}
	return typeof url == 'string' // http or https initiated
		&& !url.toLowerCase().match(/^https?:\/\//);
};

Downsha.Utils.urlTopDomain = function(url) {
	var topDomain = url;
	if (typeof url == 'string') {
		topDomain = Downsha.Utils.urlDomain(url);
		if (topDomain.toLowerCase().indexOf("www.") == 0) {
		  topDomain = topDomain.substring(4);
		}
	}
	return topDomain;
};
Downsha.Utils.urlDomain = function(url, includePort) {
	if (typeof url == 'string') {
		var re = new RegExp("^[^:]+:\/+([^\/" + ((includePort) ? "" : ":") + "]+).*$");
		return url.replace(re, "$1");
	}
	return url;
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

Downsha.Utils.urlPath = function(url) {
	if (typeof url == 'string') {
		var path = url.replace(/^[^:]+:\/+([^\/]+)/, "");
		if (path.indexOf("/") == 0) {
			return path.replace(/^(\/[^\?\#]*).*$/, "$1");
		}
	}
	return "";
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
/**
 * Starting in Gecko 6.0 (Firefox 6), document.width/height is no longer supported.
 * https://developer.mozilla.org/en/Firefox_6_for_developers#DOM
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
		top: rect.top + win.pageYOffset,
		bottom: rect.bottom + win.pageYOffset,
		left: rect.left + win.pageXOffset,
		right: rect.right + win.pageXOffset,
		width: rect.width,
		height: rect.height
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
Downsha.Utils.expandRect = function(a, b) {
  a.left = (typeof a.left == "number") ? Math.min(a.left, b.left) : b.left;
  a.top = (typeof a.top == "number") ? Math.min(a.top, b.top) : b.top;
  a.right = (typeof a.right == "number") ? Math.max(a.right, b.right) : b.right;
  a.bottom = (typeof a.bottom == "number") ? Math.max(a.bottom, b.bottom) : b.bottom;
};
Downsha.Utils.getElementForNode = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    return node;
  } else if (node.parentNode) {
    return node.parentNode;
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

Downsha.Utils.MIN_ARTICLE_RATIO = 1 / 16;
Downsha.Utils.MIN_ARTICLE_AREA = 30000;
Downsha.Utils.MAX_ARTICLE_XOFFSET_RATIO = 0.6;

Downsha.Utils.isArticleSane = function(documentWidth, documentHeight, articleRect) { // decide whether article mode is sensible
  if (documentWidth && documentHeight && articleRect) {
    var pageArea = Math.round(documentWidth * documentHeight);
    var articleArea = Math.round(articleRect.width * articleRect.height);
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
Downsha.Utils.createUrlClipElement = function(doc, title, url, favIcoUrl) {
	var setElementStyles = function(elem, styles) {
		var style = elem.style;
		for (var key in styles) {
			if (typeof styles[key] == "string") {
				style.setProperty(key, styles[key], "important");
			}
		}
	};

	title = (title) ? Downsha.Utils.escapeXML(title) : "";
	var link = doc.createElement("a");
	link.setAttribute("title", title);
	link.setAttribute("href", url);
	setElementStyles(link, {"font-size" : "12pt", "line-height" : "18px", "display" : "inline"});
	
	var text = doc.createTextNode(url);
	link.appendChild(text);
	
	var div = doc.createElement("div");
	if (typeof favIcoUrl == 'string' && favIcoUrl.length > 0 && this.BAD_FAV_ICON_URLS.indexOf(favIcoUrl.toLowerCase()) < 0) {
		var img = doc.createElement("img");
		img.setAttribute("title", title);
		img.setAttribute("src", favIcoUrl);
		setElementStyles(img, {"display" : "inline", "border" : "none", "width" : "16px", "height" : "16px", "padding" : "0px", "margin" : "0px 8px -2px 0px"});
		div.appendChild(img);
		div.appendChild(link);
	} else {
		var span = doc.createElement("span");
		span.appendChild(link);
		div.appendChild(span);
	}
	
	return div;
};

Downsha.Utils.urlSuffix = "...";
Downsha.Utils.shortUrl = function(url, maxLength) {
	var shortUrl = url;
	if (typeof url == 'string') {
		if (shortUrl.indexOf("file:") == 0) {
			shortUrl = decodeURIComponent(shortUrl.replace(/^file:.*\/([^\/]+)$/, "$1"));
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
 * Return word with length specified in param and "..." at the end.
 * If word's length is less or equal to length param, then original word is returned
 * @param word - word to shorten
 * @param length - desired length of word
 */
Downsha.Utils.shortWord = function(word, length) {
	if(word.length <= length) {
		return word;
	}
	return word.substring(0, length - 3) + Downsha.Utils.urlSuffix;
};

Downsha.Utils.isClipTooBig = function(noteLength, contentLength) {
	return (noteLength >= Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX);
};

Downsha.Utils.alert = function(win, title, text) {
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
	prompts.alert(win, title, text);
};

Downsha.Utils.generateQuad = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
Downsha.Utils.generateGuid = function() {
	return (this.generateQuad() + this.generateQuad() + "-"
		+ this.generateQuad() + "-" + this.generateQuad() + "-"
		+ this.generateQuad() + "-" + this.generateQuad() 
		+ this.generateQuad() + this.generateQuad());
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
