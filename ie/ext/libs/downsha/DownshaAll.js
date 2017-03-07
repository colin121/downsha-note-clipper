/**
 * @author: chenmin
 * @date: 2011-09-16
 * @desc: define global namespace and prototype based inheritance
 */

/**
 * Base name-space
 */
var Downsha = Downsha || {};

/**
 * Class-like inheritance.
 */
Downsha.inherit = function(childClass, parentClassOrObject, includeConstructorDefs) {
    if (typeof parentClassOrObject.constructor == 'function') {
        // Normal Inheritance
        childClass.prototype = new parentClassOrObject;
        childClass.prototype.constructor = childClass;
        childClass.parent = parentClassOrObject.prototype;
        // childClass.prototype.constructor.parent = parentClassOrObject;
    } else {
        // Pure Virtual Inheritance
        childClass.prototype = parentClassOrObject;
        childClass.prototype.constructor = childClass;
        childClass.parent = parentClassOrObject;
        // childClass.constructor.parent = parentClassOrObject;
    }
    if (includeConstructorDefs) {
        for (var i in parentClassOrObject.prototype.constructor) {
            if (i != "parent"
            && i != "prototype"
            && i != "javaClass"
            && parentClassOrObject.constructor[i] != parentClassOrObject.prototype.constructor[i]) {
                childClass.prototype.constructor[i] = parentClassOrObject.prototype.constructor[i];
            }
        }
    }
    if (typeof childClass.prototype.handleInheritance == 'function') {
        childClass.prototype.handleInheritance.apply(childClass, [childClass,
        parentClassOrObject, includeConstructorDefs]);
    }
    // return childClass;
};

/**
 * Tests whether childClass inherits from parentClass in a class-like manner
 * (see Downsha.inherit())
 */
Downsha.inherits = function(childClass, parentClass) {
    var cur = childClass;
    while (cur && typeof cur.parent != 'undefined') {
        if (cur.parent.constructor == parentClass) {
            return true;
        } else {
            cur = cur.parent.constructor;
        }
    }
    return false;
    // return (typeof childClass.parent != 'undefined' &&
    // childClass.parent.constructor == parentClass);
};

Downsha.mixin = function(classOrObject, mixin, map) {
    var target = (typeof classOrObject == 'function') ? classOrObject.prototype
    : classOrObject;
    for (var i in mixin.prototype) {
        var from = to = i;
        if (typeof map == 'object' && map && typeof map[i] != 'undefined') {
            to = map[i];
        }
        target[to] = mixin.prototype[from];
    }
};

Downsha.extendObject = function(obj, extObj, deep) {
    if (typeof extObj == 'object' && extObj != null) {
        for (var i in extObj) {
            if (deep && typeof extObj[i] == 'object' && extObj[i] != null
            && typeof obj[i] == 'object' && obj[i] != null) {
                Downsha.extendObject(obj[i], extObj[i], deep);
            } else {
                try {
                    obj[i] = extObj[i];
                } catch(e){
                    // do nothing... there could have been a getter/setter lookup issue, which dont' care about
                }
            }
        }
    }
};

Downsha.hasOwnProperty = function(obj, propName) {
    if (typeof obj == 'object') {
        if (obj.hasOwnProperty(propName)) {
            return true;
        }
        var proto = null;
        var o = obj;
        while (proto = o.__proto__) {
            if (proto.hasOwnProperty(propName)) {
                return true;
            } else {
                o = proto;
            }
        }
    }
    return false;
};
/**
 * @author: chenmin
 * @date: 2011-10-16
 * @desc: Platform provides utilities to specify running os and browser version
 * User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)

 * The following table lists the version tokens used in recent versions of Internet Explorer.
 * MSIE 10	Internet Explorer 10
 * MSIE 9.0	Internet Explorer 9
 * MSIE 8.0	Internet Explorer 8 or IE8 Compatibility View/Browser Mode
 * MSIE 7.0	Internet Explorer 7 or IE7 Compatibility View/Browser Mode
 * MSIE 6.0	Microsoft Internet Explorer 6

 * The following table lists Internet Explorer platform tokens for the last several versions of Windows.
 * Windows NT 6.2	Windows 8
 * Windows NT 6.1	Windows 7
 * Windows NT 6.0	Windows Vista
 * Windows NT 5.2	Windows Server 2003; Windows XP x64 Edition
 * Windows NT 5.1	Windows XP 
 * Windows NT 5.0	Windows 2K
 */

Downsha.Platform = {
	getUserAgent : function () {
		return navigator.userAgent;
	},
	isIE6 : function () {
		return navigator.userAgent.indexOf("MSIE 6.0") >= 0;
	},
	isIE7 : function () {
		return navigator.userAgent.indexOf("MSIE 7.0") >= 0;
	},
	isIE8 : function () {
		return navigator.userAgent.indexOf("MSIE 8.0") >= 0;
	},
	isIE9 : function () {
		return navigator.userAgent.indexOf("MSIE 9.0") >= 0;
	},
	isIE10 : function () {
		return navigator.userAgent.indexOf("MSIE 10") >= 0;
	},
	getIEVersion : function() {
		if (!this.ieVersion) {
			var matchRes = navigator.userAgent.match(/MSIE\s*(\d+)\.\d+/i);
			if (matchRes) {
				this.ieVersion = parseInt(matchRes[1]);
			}
		}
		return this.ieVersion;
	},
	isQuirksMode : function(doc) {
		if (!doc) {
			doc = document;
		}
		/**
		 * IE will return 9, 8 or 7 for standards mode and 5 for quirks mode.
		 * other browsers should return a value for compatMode
		 */
		return (doc.documentMode) ? 
			((doc.documentMode == 5) ? true : false) : 
			((doc.compatMode == "CSS1Compat") ? false : true);
	},
	isWin2K : function () {
		return navigator.userAgent.indexOf("Windows NT 5.0") >= 0;
	},
	isWinXP : function () {
		return navigator.userAgent.indexOf("Windows NT 5.1") >= 0;
	},
	isWin2003 : function () {
		return navigator.userAgent.indexOf("Windows NT 5.2") >= 0;
	},
	isWinVista : function () {
		return navigator.userAgent.indexOf("Windows NT 6.0") >= 0;
	},
	isWin7 : function () {
		return navigator.userAgent.indexOf("Windows NT 6.1") >= 0;
	},
	isWin8 : function () {
		return navigator.userAgent.indexOf("Windows NT 6.2") >= 0;
	},
	getOSVersion : function() {
		if (!this.osVersion) {
			var matchRes = navigator.userAgent.match(/Windows\s*NT\s*(\d+\.\d+)/i);
			if (matchRes) {
				this.osVersion = parseFloat(matchRes[1]);
			}
		}
		return this.osVersion;
	},
	isWin32 : function () {
		return navigator.platform == "Win32";
	},
	isWin64 : function () {
		return navigator.platform == "Win64";
	},
	isSupportedVersion : function () {
		return ((this.isIE6() || this.isIE7() || this.isIE8() || this.isIE9() || this.isIE10()) && 
			(this.isWin2K() || this.isWinXP() || this.isWin2003() || this.isWinVista() || this.isWin7() || this.isWin8()));
	}
};
/**
 * @author: chenmin
 * @date: 2011-10-18
 * @desc: internationalization and localization
 */
(function() {
	Downsha.i18n = {
		getUTF16String : function(str) {
			var parts = str.split("\\u");
			parts.shift();
			var unescaped = "";
			var maxCode = Math.pow(2, 16);
			for (var i = 0; i < parts.length; ++i) {
				var code = parseInt(parts[i], 16);
				if (code > 0 && code < maxCode) {
					unescaped += String.fromCharCode(code);
				}
			}
			return unescaped;
		},
		getMessage : function(key, params) { // get localized message for specified key
			try {
				var localCode = "zh-cn";
				
				// The browserLanguage property reflects the language of the operating system 
				// regardless of the installed language version of Internet Explorer.
				if (navigator.browserLanguage) { // get local code from navigator object
					localCode = navigator.browserLanguage.toLowerCase();
				} else if (navigator.systemLanguage) {
					localCode = navigator.systemLanguage.toLowerCase();
				} else if (navigator.userLanguage) {
					localCode = navigator.userLanguage.toLowerCase();
				}
				if (typeof Downsha.i18n.LOCALE_MESSAGE[localCode] == "undefined") {
					localCode = "zh-cn";
				}
				
				if (typeof Downsha.i18n.LOCALE_MESSAGE[localCode] != "undefined" && 
					typeof Downsha.i18n.LOCALE_MESSAGE[localCode][key] != "undefined") {
					var localMessage = Downsha.i18n.LOCALE_MESSAGE[localCode][key];
					if (typeof params != 'undefined') {
						var p = [].concat(params);
						for (var i = 0; i < p.length; i++) {
							localMessage = localMessage.replace(new RegExp("\$" + (i + 1), "ig"), p[i]);
						}
					}
					
					return Downsha.i18n.getUTF16String(localMessage);
				}
			} catch (e) {
				LOG.warn("Downsha.i18n.getMessage failed to get local string for key: " + key + ", locale:" + localCode);
				return key;
			}
			return key;
		}
	};
	
	// http://0xcc.net/jsescape/
	// Text Escaping and Unescaping in JavaScript
	Downsha.i18n.LOCALE_MESSAGE = {
		"zh-cn" : {
			//"摘录中..."
			"clipper_clipping" : "\\u6458\\u5F55\\u4E2D\\u002E\\u002E\\u002E",
			//"摘录成功"
			"clipper_clipped" : "\\u6458\\u5F55\\u6210\\u529F", 
			
			//"最好用的网页剪报"
			"popup_header_message" : "\\u6700\\u597D\\u7528\\u7684\\u7F51\\u9875\\u526A\\u62A5",
			//"标题"
			"popup_title" : "\\u6807\\u9898",
			//"请输入标题"
			"popup_untitledNote" : "\\u8BF7\\u8F93\\u5165\\u6807\\u9898",
			//"内容"
			"popup_content" : "\\u5185\\u5BB9",
			//"选中部分"
			"CLIP_ACTION_SELECTION" : "\\u9009\\u4E2D\\u90E8\\u5206",	
			//"正文部分"
			"CLIP_ACTION_ARTICLE" : "\\u6B63\\u6587\\u90E8\\u5206",	
			//"整个网页"
			"CLIP_ACTION_FULL_PAGE" : "\\u6574\\u4E2A\\u7F51\\u9875",	
			//"仅标题和网址"
			"CLIP_ACTION_URL" : "\\u4EC5\\u6807\\u9898\\u548C\\u7F51\\u5740",	
			//"关闭"
			"popup_close" : "\\u5173\\u95ED",
			//"保存"
			"popup_action" : "\\u4FDD\\u5B58",
			
			//"网页剪报支持IE 6/7/8/9/10，以及360，搜狗等国内浏览器"
			"popup_tip_default" : "\\u7F51\\u9875\\u526A\\u62A5\\u652F\\u6301\\u0049\\u0045\\u0020\\u0036\\u002F\\u0037\\u002F\\u0038\\u002F\\u0039\\u002F\\u0031\\u0030\\uFF0C\\u4EE5\\u53CA\\u0033\\u0036\\u0030\\uFF0C\\u641C\\u72D7\\u7B49\\u56FD\\u5185\\u6D4F\\u89C8\\u5668", 
			//"您还可以手工调整正文区域"
			"popup_tip_article" : "\\u60A8\\u8FD8\\u53EF\\u4EE5\\u624B\\u5DE5\\u8C03\\u6574\\u6B63\\u6587\\u533A\\u57DF", 
			//"插件被禁用啦，请先使用IE“管理加载项”启用插件再重新剪辑！"
			"popup_tip_forbidden" : "\\u63D2\\u4EF6\\u88AB\\u7981\\u7528\\u5566\\uFF0C\\u8BF7\\u5148\\u4F7F\\u7528\\u0049\\u0045\\u201C\\u7BA1\\u7406\\u52A0\\u8F7D\\u9879\\u201D\\u542F\\u7528\\u63D2\\u4EF6\\u518D\\u91CD\\u65B0\\u526A\\u8F91\\uFF01", 
			//"放大正文区域"
			"popup_expand" : "\\u653E\\u5927\\u6B63\\u6587\\u533A\\u57DF",
			//"缩小正文区域"
			"popup_shrink" : "\\u7F29\\u5C0F\\u6B63\\u6587\\u533A\\u57DF",
			//"选择上一段作为正文"
			"popup_prev" : "\\u9009\\u62E9\\u4E0A\\u4E00\\u6BB5\\u4F5C\\u4E3A\\u6B63\\u6587",
			//"选择下一段作为正文"
			"popup_next" : "\\u9009\\u62E9\\u4E0B\\u4E00\\u6BB5\\u4F5C\\u4E3A\\u6B63\\u6587",
			
			//"对不起，网页内容太大，无法摘取！请尝试选中部分内容再摘取，或者使用正文模式。"
			"fullPageClipTooBig" : "\\u5BF9\\u4E0D\\u8D77\\uFF0C\\u7F51\\u9875\\u5185\\u5BB9\\u592A\\u5927\\uFF0C\\u65E0\\u6CD5\\u6458\\u53D6\\uFF01\\u8BF7\\u5C1D\\u8BD5\\u9009\\u4E2D\\u90E8\\u5206\\u5185\\u5BB9\\u518D\\u6458\\u53D6\\uFF0C\\u6216\\u8005\\u4F7F\\u7528\\u6B63\\u6587\\u6A21\\u5F0F\\u3002",
			//"无法抓取当前网页内容！请尝试剪辑其它网址，建议使用IE8或IE9浏览器。"
			"fullPageClipEmpty" : "\\u65E0\\u6CD5\\u6293\\u53D6\\u5F53\\u524D\\u7F51\\u9875\\u5185\\u5BB9\\uFF01\\u8BF7\\u5C1D\\u8BD5\\u526A\\u8F91\\u5176\\u5B83\\u7F51\\u5740\\uFF0C\\u5EFA\\u8BAE\\u4F7F\\u7528\\u0049\\u0045\\u0038\\u6216\\u0049\\u0045\\u0039\\u6D4F\\u89C8\\u5668\\u3002",
			//"对不起，网页摘取失败！请等待网页全部下载完成后再尝试摘取。"
			"fullPageClipFailure" : "\\u5BF9\\u4E0D\\u8D77\\uFF0C\\u7F51\\u9875\\u6458\\u53D6\\u5931\\u8D25\\uFF01\\u8BF7\\u7B49\\u5F85\\u7F51\\u9875\\u5168\\u90E8\\u4E0B\\u8F7D\\u5B8C\\u6210\\u540E\\u518D\\u5C1D\\u8BD5\\u6458\\u53D6\\u3002",
			//"当前地址不是有效的网页地址，无法摘取。"
			"illegalUrlClipFailure" : "\\u5F53\\u524D\\u5730\\u5740\\u4E0D\\u662F\\u6709\\u6548\\u7684\\u7F51\\u9875\\u5730\\u5740\\uFF0C\\u65E0\\u6CD5\\u6458\\u53D6\\u3002",
			//"对不起，正文摘取失败！请尝试选中部分内容再摘取。"
			"articleClipFailure" : "\\u5BF9\\u4E0D\\u8D77\\uFF0C\\u6B63\\u6587\\u6458\\u53D6\\u5931\\u8D25\\uFF01\\u8BF7\\u5C1D\\u8BD5\\u9009\\u4E2D\\u90E8\\u5206\\u5185\\u5BB9\\u518D\\u6458\\u53D6\\u3002"
		},
		"en-us" : {
			//"Clipping"
			"clipper_clipping" : "\\u0043\\u006C\\u0069\\u0070\\u0070\\u0069\\u006E\\u0067",
			//"Clip OK"
			"clipper_clipped" : "\\u0043\\u006C\\u0069\\u0070\\u0020\\u004F\\u004B", 
			
			//"The Best Web Clipper"
			"popup_header_message" : "\\u0054\\u0068\\u0065\\u0020\\u0042\\u0065\\u0073\\u0074\\u0020\\u0057\\u0065\\u0062\\u0020\\u0043\\u006C\\u0069\\u0070\\u0070\\u0065\\u0072",
			//"Title"
			"popup_title" : "\\u0054\\u0069\\u0074\\u006C\\u0065",
			//"Type title here"
			"popup_untitledNote" : "\\u0054\\u0079\\u0070\\u0065\\u0020\\u0074\\u0069\\u0074\\u006C\\u0065\\u0020\\u0068\\u0065\\u0072\\u0065",
			//"Content"
			"popup_content" : "\\u0043\\u006F\\u006E\\u0074\\u0065\\u006E\\u0074",
			//"Selected"
			"CLIP_ACTION_SELECTION" : "\\u0053\\u0065\\u006C\\u0065\\u0063\\u0074\\u0065\\u0064",	
			//"Article"
			"CLIP_ACTION_ARTICLE" : "\\u0041\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065",	
			//"Entire"
			"CLIP_ACTION_FULL_PAGE" : "\\u0045\\u006E\\u0074\\u0069\\u0072\\u0065",	
			//"Title and URL"
			"CLIP_ACTION_URL" : "\\u0054\\u0069\\u0074\\u006C\\u0065\\u0020\\u0061\\u006E\\u0064\\u0020\\u0055\\u0052\\u004C",	
			//"Close"
			"popup_close" : "\\u0043\\u006C\\u006F\\u0073\\u0065",
			//"Save"
			"popup_action" : "\\u0053\\u0061\\u0076\\u0065",
			
			//"Clipper supports IE 6/7/8/9/10, and 360, Sogou Explorer."
			"popup_tip_default" : "\\u0043\\u006C\\u0069\\u0070\\u0070\\u0065\\u0072\\u0020\\u0073\\u0075\\u0070\\u0070\\u006F\\u0072\\u0074\\u0073\\u0020\\u0049\\u0045\\u0020\\u0036\\u002F\\u0037\\u002F\\u0038\\u002F\\u0039\\u002F\\u0031\\u0030\\u002C\\u0020\\u0061\\u006E\\u0064\\u0020\\u0033\\u0036\\u0030\\u002C\\u0020\\u0053\\u006F\\u0067\\u006F\\u0075\\u0020\\u0045\\u0078\\u0070\\u006C\\u006F\\u0072\\u0065\\u0072\\u002E", 
			//"You can adjust article area here"
			"popup_tip_article" : "\\u0059\\u006F\\u0075\\u0020\\u0063\\u0061\\u006E\\u0020\\u0061\\u0064\\u006A\\u0075\\u0073\\u0074\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065\\u0020\\u0061\\u0072\\u0065\\u0061\\u0020\\u0068\\u0065\\u0072\\u0065", 
			//"Clipper has been disabled, Use IE AddOn Manager to enable."
			"popup_tip_forbidden" : "\\u0043\\u006C\\u0069\\u0070\\u0070\\u0065\\u0072\\u0020\\u0068\\u0061\\u0073\\u0020\\u0062\\u0065\\u0065\\u006E\\u0020\\u0064\\u0069\\u0073\\u0061\\u0062\\u006C\\u0065\\u0064\\u002C\\u0020\\u0055\\u0073\\u0065\\u0020\\u0049\\u0045\\u0020\\u0041\\u0064\\u0064\\u004F\\u006E\\u0020\\u004D\\u0061\\u006E\\u0061\\u0067\\u0065\\u0072\\u0020\\u0074\\u006F\\u0020\\u0065\\u006E\\u0061\\u0062\\u006C\\u0065\\u002E", 
			//"Expand article area"
			"popup_expand" : "\\u0045\\u0078\\u0070\\u0061\\u006E\\u0064\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065\\u0020\\u0061\\u0072\\u0065\\u0061",
			//"Shrink article area"
			"popup_shrink" : "\\u0053\\u0068\\u0072\\u0069\\u006E\\u006B\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065\\u0020\\u0061\\u0072\\u0065\\u0061",
			//"Select previous as article"
			"popup_prev" : "\\u0053\\u0065\\u006C\\u0065\\u0063\\u0074\\u0020\\u0070\\u0072\\u0065\\u0076\\u0069\\u006F\\u0075\\u0073\\u0020\\u0061\\u0073\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065",
			//"Select next as article"
			"popup_next" : "\\u0053\\u0065\\u006C\\u0065\\u0063\\u0074\\u0020\\u006E\\u0065\\u0078\\u0074\\u0020\\u0061\\u0073\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065",
			
			//"Sorry, Web page is too big to clip! You may choose selected mode or article mode."
			"fullPageClipTooBig" : "\\u0053\\u006F\\u0072\\u0072\\u0079\\u002C\\u0020\\u0057\\u0065\\u0062\\u0020\\u0070\\u0061\\u0067\\u0065\\u0020\\u0069\\u0073\\u0020\\u0074\\u006F\\u006F\\u0020\\u0062\\u0069\\u0067\\u0020\\u0074\\u006F\\u0020\\u0063\\u006C\\u0069\\u0070\\u0021\\u0020\\u0059\\u006F\\u0075\\u0020\\u006D\\u0061\\u0079\\u0020\\u0063\\u0068\\u006F\\u006F\\u0073\\u0065\\u0020\\u0073\\u0065\\u006C\\u0065\\u0063\\u0074\\u0065\\u0064\\u0020\\u006D\\u006F\\u0064\\u0065\\u0020\\u006F\\u0072\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065\\u0020\\u006D\\u006F\\u0064\\u0065\\u002E",
			//"Failed to clip current page! Please try another page, or use IE 8/9 to clip."
			"fullPageClipEmpty" : "\\u0046\\u0061\\u0069\\u006C\\u0065\\u0064\\u0020\\u0074\\u006F\\u0020\\u0063\\u006C\\u0069\\u0070\\u0020\\u0063\\u0075\\u0072\\u0072\\u0065\\u006E\\u0074\\u0020\\u0070\\u0061\\u0067\\u0065\\u0021\\u0020\\u0050\\u006C\\u0065\\u0061\\u0073\\u0065\\u0020\\u0074\\u0072\\u0079\\u0020\\u0061\\u006E\\u006F\\u0074\\u0068\\u0065\\u0072\\u0020\\u0070\\u0061\\u0067\\u0065\\u002C\\u0020\\u006F\\u0072\\u0020\\u0075\\u0073\\u0065\\u0020\\u0049\\u0045\\u0020\\u0038\\u002F\\u0039\\u0020\\u0074\\u006F\\u0020\\u0063\\u006C\\u0069\\u0070\\u002E",
			//"Failed to clip current page! Please try again after entire page is loaded."
			"fullPageClipFailure" : "\\u0046\\u0061\\u0069\\u006C\\u0065\\u0064\\u0020\\u0074\\u006F\\u0020\\u0063\\u006C\\u0069\\u0070\\u0020\\u0063\\u0075\\u0072\\u0072\\u0065\\u006E\\u0074\\u0020\\u0070\\u0061\\u0067\\u0065\\u0021\\u0020\\u0050\\u006C\\u0065\\u0061\\u0073\\u0065\\u0020\\u0074\\u0072\\u0079\\u0020\\u0061\\u0067\\u0061\\u0069\\u006E\\u0020\\u0061\\u0066\\u0074\\u0065\\u0072\\u0020\\u0065\\u006E\\u0074\\u0069\\u0072\\u0065\\u0020\\u0070\\u0061\\u0067\\u0065\\u0020\\u0069\\u0073\\u0020\\u006C\\u006F\\u0061\\u0064\\u0065\\u0064\\u002E",
			//"Current URL is not a valid web page address."
			"illegalUrlClipFailure" : "\\u0043\\u0075\\u0072\\u0072\\u0065\\u006E\\u0074\\u0020\\u0055\\u0052\\u004C\\u0020\\u0069\\u0073\\u0020\\u006E\\u006F\\u0074\\u0020\\u0061\\u0020\\u0076\\u0061\\u006C\\u0069\\u0064\\u0020\\u0077\\u0065\\u0062\\u0020\\u0070\\u0061\\u0067\\u0065\\u0020\\u0061\\u0064\\u0064\\u0072\\u0065\\u0073\\u0073\\u002E",
			//"Failed to clip article area! please try selected mode." 
			"articleClipFailure" : "\\u0046\\u0061\\u0069\\u006C\\u0065\\u0064\\u0020\\u0074\\u006F\\u0020\\u0063\\u006C\\u0069\\u0070\\u0020\\u0061\\u0072\\u0074\\u0069\\u0063\\u006C\\u0065\\u0020\\u0061\\u0072\\u0065\\u0061\\u0021\\u0020\\u0070\\u006C\\u0065\\u0061\\u0073\\u0065\\u0020\\u0074\\u0072\\u0079\\u0020\\u0073\\u0065\\u006C\\u0065\\u0063\\u0074\\u0065\\u0064\\u0020\\u006D\\u006F\\u0064\\u0065\\u002E"	
		}
	};
})();
/**
 * @author: chenmin
 * @date: 2011-10-16
 * @desc: generic definition of logger, implementors derive from LoggerImpl.
 * the caller should use LoggerImplFactory to get specific implementations.
 */
(function() {
	Downsha.Logger = function Logger(logImplementor) {
	  if (typeof logImplementor != 'undefined'
	      && logImplementor instanceof Downsha.LoggerImpl) {
	    this.impl = logImplementor;
	  } else {
	    var impl = Downsha.LoggerImplFactory.getImplementationFor(navigator);
	    if (impl instanceof Array) { // array of implementors
	      this.impl = new Downsha.LoggerChainImpl(this, impl);
	    } else {
	      this.impl = new impl(this);
	    }
	  }
	};
	
	// Downsha.Logger levels.
	Downsha.Logger.LOG_LEVEL_DEBUG = 0;
	Downsha.Logger.LOG_LEVEL_INFO = 1;
	Downsha.Logger.LOG_LEVEL_WARN = 2;
	Downsha.Logger.LOG_LEVEL_ERROR = 3;
	Downsha.Logger.LOG_LEVEL_EXCEPTION = 4;
	Downsha.Logger.LOG_LEVEL_OFF = 5;
	
	Downsha.Logger.DEBUG_PREFIX = "[DEBUG] ";
	Downsha.Logger.INFO_PREFIX = "[INFO] ";
	Downsha.Logger.WARN_PREFIX = "[WARN] ";
	Downsha.Logger.ERROR_PREFIX = "[ERROR] ";
	Downsha.Logger.EXCEPTION_PREFIX = "[EXCEPTION] ";
	
	Downsha.Logger.instance = null; // logger single instance
	Downsha.Logger.getInstance = function() {
	  if (!this.instance) {
	    this.instance = new Downsha.Logger();
	  }
	  return this.instance;
	};
	Downsha.Logger.setInstance = function(logger) {
	  this.instance = logger;
	};
	Downsha.Logger.destroyInstance = function() {
	  if (this.instance) {
	  	delete this.instance;
	  }
	  this.instance = null;
	};
	
	Downsha.Logger.setLevel = function(level) {
	  if (this.instance) {
	  	this.instance.setLevel(level);
	  }
	};
	Downsha.Logger.enableImplementor = function(clazz) {
	  if (this.instance) {
	  	this.instance.enableImplementor(clazz);
	  }
	  if (clazz) {
	    clazz.protoEnabled = true;
	  }
	};
	Downsha.Logger.disableImplementor = function(clazz) {
	  if (this.instance) {
	  	this.instance.disableImplementor(clazz);
	  }
	  if (clazz) {
	    clazz.protoEnabled = false;
	  }
	};
	
	Downsha.Logger.prototype.level = 0;
	Downsha.Logger.prototype.usePrefix = true;
	Downsha.Logger.prototype.useTimestamp = true;
	Downsha.Logger.prototype.enabled = true;
	
	Downsha.Logger.prototype.getImplementor = function(clazz) {
	  if (clazz) {
	    return this.impl.answerImplementorInstance(clazz);
	  } else {
	    return this.impl;
	  }
	};
	Downsha.Logger.prototype.enableImplementor = function(clazz) {
	  if (clazz) {
	    var i = this.getImplementor(clazz);
	    if (i) {
	      i.enabled = true;
	    }
	  } else {
	    this.impl.enabled = true;
	  }
	};
	Downsha.Logger.prototype.disableImplementor = function(clazz) {
	  if (clazz) {
	    var i = this.getImplementor(clazz);
	    if (i) {
	      i.enabled = false;
	    }
	  } else {
	    this.impl.enabled = false;
	  }
	};
	
	Downsha.Logger.prototype.setLevel = function(level) {
	  this.level = parseInt(level);
	  if (isNaN(this.level)) {
	    this.level = Downsha.Logger.LOG_LEVEL_DEBUG;
	  }
	};
	
	Downsha.Logger.prototype.getLevel = function() {
	  return this.level;
	};
	
	Downsha.Logger.prototype.padNumber = function(num, len) {
	  var padStr = "0";
	  num = parseInt(num);
	  if (isNaN(num)) {
	    num = 0;
	  }
	  var isPositive = (num >= 0) ? true : false;
	  var numStr = "" + Math.abs(num);
	  while (numStr.length < len) {
	    numStr = padStr + numStr;
	  }
	  if (!isPositive) {
	    numStr = "-" + numStr;
	  }
	  return numStr;
	};
	
	Downsha.Logger.prototype.getPrefix = function(pfx) {
	  // Prefix format: TimeStamp [Level]
	  var str = "";
	  if (this.useTimestamp) { // timestamp prefix
	    var today = new Date();
	    var year =  today.getFullYear();
	    var month = this.padNumber((today.getMonth() + 1), 2);
	    var day = this.padNumber(today.getDate(), 2);
	    var hour = this.padNumber(today.getHours(), 2);
	    var minute = this.padNumber(today.getMinutes(), 2);
	    var second = this.padNumber(today.getSeconds(), 2);
	    var millisecond = this.padNumber(today.getMilliseconds(), 3);
	    str += year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second
	        + "." + millisecond + " ";
	  }
	  if (this.usePrefix) { // log level prefix
	    str += pfx;
	  }
	  return str;
	};
	
	Downsha.Logger.prototype.isUsePrefix = function() {
	  return this.usePrefix;
	};
	Downsha.Logger.prototype.setUsePrefix = function(bool) {
	  this.usePrefix = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isUseTimestamp = function() {
	  return this.useTimestamp;
	};
	Downsha.Logger.prototype.setUseTimestamp = function(bool) {
	  this.useTimestamp = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isEnabled = function() {
	  return this.enabled;
	};
	Downsha.Logger.prototype.setEnabled = function(bool) {
	  this.enabled = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isDebugEnabled = function() {
	  return (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_DEBUG);
	};
	
	// Dumps an objects properties and methods to the console.
	Downsha.Logger.prototype.dump = function(obj) {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.dir(obj);
	  }
	};
	
	// Same as dump
	Downsha.Logger.prototype.dir = function(obj) {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.dir(obj);
	  }
	};
	
	// Dumps a stacktrace to the console.
	Downsha.Logger.prototype.trace = function() {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.trace();
	  }
	};
	
	Downsha.Logger.prototype.alert = function(str) {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.alert(str);
	  }
	};
	
	// Prints a debug message to the console.
	Downsha.Logger.prototype.debug = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_DEBUG) {
	    this.impl.debug(this.getPrefix(this.constructor.DEBUG_PREFIX) + str);
	  }
	};
	
	// Prints an info message to the console.
	Downsha.Logger.prototype.info = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_INFO) {
	    this.impl.info(this.getPrefix(this.constructor.INFO_PREFIX) + str);
	  }
	};
	
	// Prints a warning message to the console.
	Downsha.Logger.prototype.warn = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_WARN) {
	    this.impl.warn(this.getPrefix(this.constructor.WARN_PREFIX) + str);
	  }
	};
	
	// Prints an error message to the console.
	Downsha.Logger.prototype.error = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_ERROR) {
	    this.impl.error(this.getPrefix(this.constructor.ERROR_PREFIX) + str);
	  }
	};
	
	Downsha.Logger.prototype.exception = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_EXCEPTION) {
	    this.impl.exception(this.getPrefix(this.constructor.EXCEPTION_PREFIX) + str);
	  }
	};
	
	Downsha.Logger.prototype.clear = function() {
	  this.impl.clear();
	};
	
	Downsha.LoggerImpl = function LoggerImpl(logger) {
	  this.initialize(logger);
	};
	Downsha.LoggerImpl.ClassRegistry = new Array();
	Downsha.LoggerImpl.isResponsibleFor = function(navigator) {
	  return false;
	};
	Downsha.LoggerImpl.prototype.handleInheritance = function(child, parent) {
	  Downsha.LoggerImpl.ClassRegistry.push(child);
	};
	
	Downsha.LoggerImpl.prototype.logger = null;
	Downsha.LoggerImpl.prototype.enabled = false;
	
	Downsha.LoggerImpl.prototype.initialize = function(logger) {
	  this.logger = logger;
	};
	Downsha.LoggerImpl.prototype.answerImplementorInstance = function(clazz) {
	  if (this.constructor == clazz) {
	    return this;
	  }
	};
	Downsha.LoggerImpl.prototype.isEnabled = function() {
	  return this.enabled;
	};
	Downsha.LoggerImpl.prototype.setEnabled = function(bool) {
	  this.enabled = (bool) ? true : false;
	};
	Downsha.LoggerImpl.prototype.isProtoEnabled = function() {
	  return this.constructor.prototype.enabled;
	};
	Downsha.LoggerImpl.prototype.setProtoEnabled = function(bool) {
	  this.constructor.prototype.enabled = (bool) ? true : false;
	};
	Downsha.LoggerImpl.prototype.getLogger = function() {
	  return this.logger;
	};
	Downsha.LoggerImpl.prototype.setLogger = function(logger) {
	  if (logger instanceof Downsha.Logger) {
	    this.logger = logger;
	  }
	};
	Downsha.LoggerImpl.prototype.dir = function(obj) {
	};
	Downsha.LoggerImpl.prototype.trace = function() {
	};
	Downsha.LoggerImpl.prototype.debug = function(str) {
	};
	Downsha.LoggerImpl.prototype.info = function(str) {
	};
	Downsha.LoggerImpl.prototype.warn = function(str) {
	};
	Downsha.LoggerImpl.prototype.error = function(str) {
	};
	Downsha.LoggerImpl.prototype.exception = function(str) {
	};
	Downsha.LoggerImpl.prototype.alert = function(str) {
	};
	Downsha.LoggerImpl.prototype.clear = function() {
	};
	
	Downsha.LoggerChainImpl = function LoggerChainImpl(logger, impls) {
	  this.initialize(logger, impls);
	};
	Downsha.inherit(Downsha.LoggerChainImpl, Downsha.LoggerImpl, true);
	
	Downsha.LoggerChainImpl.prototype.impls = null;
	Downsha.LoggerChainImpl.prototype.enabled = true;
	
	Downsha.LoggerChainImpl.prototype.initialize = function(logger, impls) {
	  Downsha.LoggerChainImpl.parent.initialize.apply(this, [logger]);
	  var impls = [].concat(impls);
	  this.impls = [];
	  for ( var i = 0; i < impls.length; i++) {
	    var impl = impls[i];
	    this.impls.push(new impl(logger));
	  }
	};
	Downsha.LoggerChainImpl.prototype.answerImplementorInstance = function(clazz) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    var ii = this.impls[i].answerImplementorInstance(clazz);
	    if (ii) {
	      return ii;
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.dir = function(obj) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].dir(obj);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.trace = function() {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].trace(obj);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.debug = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].debug(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.info = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].info(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.warn = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].warn(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.error = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].error(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.exception = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].exception(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.alert = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].alert(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.clear = function() {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].clear();
	    }
	  }
	};
	
	Downsha.LoggerImplFactory = {
	  getImplementationFor : function(navigator) {
	    var reg = Downsha.LoggerImpl.ClassRegistry;
	    var impls = [];
	    for ( var i = 0; i < reg.length; i++) {
	      if (typeof reg[i] == 'function'
	          && typeof reg[i].isResponsibleFor == 'function'
	          && reg[i].isResponsibleFor(navigator)) {
	        impls.push(reg[i]);
	      }
	    }
	    if (impls.length == 0) {
	      return Downsha.LoggerImpl;
	    } else if (impls.length == 1) {
	      return impls[0];
	    }
	    return impls;
	  }
	};
})();
/**
 * @author: chenmin
 * @date: 2011-10-16
 * @desc: IE specific logger implementation
 * Be careful when using console for debugging in IE 8/9.
 * If you leave a call to the console object in your code when you move to production 
 * and you do not have the developer tools displayed,  
 * you will get an error message telling you console is undefined. 
 * To avoid the error message, you need to add a check 'typeof'
 * to make sure console exists before calling any methods. 
 */
(function() {
	Downsha.IEExtensionLoggerImpl = function IEExtensionLoggerImpl(logger) {
	  this.initialize(logger);
	};
	Downsha.inherit(Downsha.IEExtensionLoggerImpl, Downsha.LoggerImpl, true);
	Downsha.IEExtensionLoggerImpl.isResponsibleFor = function(navigator) {
	  return navigator.userAgent.toUpperCase().indexOf("MSIE") >= 0;
	};
	Downsha.IEExtensionLoggerImpl.prototype.enabled = false; // TODO 2012-07-03 set true if debugging
	
	Downsha.IEExtensionLoggerImpl.prototype.dir = function(obj) {
	  if (typeof console != "undefined" && typeof console.dir != "undefined") {
	  	console.dir(obj);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.trace = function() {
	  if (typeof console != "undefined" && typeof console.trace != "undefined") {
	  	console.trace();
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.alert = function(str) {
	  alert(str);
	};
	Downsha.IEExtensionLoggerImpl.prototype.debug = function(str) {
	  if (typeof console != "undefined" && typeof console.log != "undefined") {
	  	console.log(str);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.info = function(str) {
	  if (typeof console != "undefined" && typeof console.info != "undefined") {
	  	console.info(str);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.warn = function(str) {
	  if (typeof console != "undefined" && typeof console.warn != "undefined") {
	  	console.warn(str);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.error = function(str) {
	  if (typeof console != "undefined" && typeof console.error != "undefined") {
	  	console.error(str);
	  }
	  //this.alert(str);
	};
	Downsha.IEExtensionLoggerImpl.prototype.exception = function(str) {
	  this.error(str);
	};
})();
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
/**
 * @author: chenmin
 * @date: 2011-11-02
 * @desc: constants definition: request type, data limitations
 */

Downsha.Constants = {
  CLIP_ACTION_FULL_PAGE : "CLIP_ACTION_FULL_PAGE",
  CLIP_ACTION_ARTICLE : "CLIP_ACTION_ARTICLE",
  CLIP_ACTION_SELECTION : "CLIP_ACTION_SELECTION",
  CLIP_ACTION_URL : "CLIP_ACTION_URL",
  
  PREVIEW_NUDGE_PREVIOUS_SIBLING : "PREVIEW_NUDGE_PREVIOUS_SIBLING",
  PREVIEW_NUDGE_NEXT_SIBLING : "PREVIEW_NUDGE_NEXT_SIBLING",
  PREVIEW_NUDGE_PARENT : "PREVIEW_NUDGE_PARENT",
  PREVIEW_NUDGE_CHILD : "PREVIEW_NUDGE_CHILD",
  
  SERVICE_PATH : "http://ysync.downsha.com/clipper/",  //"http://localhost/"
  
  CLIP_NOTE_CONTENT_LEN_MAX : 10 * 1048576 // 10MB
};
/**
 * @author: chenmin
 * @date: 2011-10-18
 * @desc: ie extension manager is the core module of the extension.
 * 1. handles all the events defined by the ie extension api
 * 2. handles all the events defined by internal program
 * 3. provides utilities of clipper and previewer.
 */

(function() {
  Downsha.getIEExtension = function(win) { // make Downsha.ieExtension object single and global
    if (!Downsha.ieExtension) {
        Downsha.ieExtension = new Downsha.IEExtension(win);
    }
    return Downsha.ieExtension;
  };

  Downsha.IEExtension = function IEExtension(win) {
    this.initialize(win);
  };
	
	Downsha.IEExtension.prototype.START_UP_DELAY_TIME = 50; // interval between context initialization and clip startup
	Downsha.IEExtension.prototype.CLIP_PROCESS_DELAY_TIME = 50; // interval between clip completion and submit to plugin
	Downsha.IEExtension.prototype.pluginVersion = 0; // plugin version
	Downsha.IEExtension.prototype.window = null; // window object
	Downsha.IEExtension.prototype.title = null; // document title
	Downsha.IEExtension.prototype.url = null; // document url
	Downsha.IEExtension.prototype.clipAction = null; // clip action
	Downsha.IEExtension.prototype.clipOptions = null; // clip options
	Downsha.IEExtension.prototype.supportCanvas = true; // determine whether support html5 canvas
  Downsha.IEExtension.prototype.pageinfo = null; // pageinfo object
  Downsha.IEExtension.prototype.previewer = null; // previewer object
  Downsha.IEExtension.prototype.clipper = null; // clipper object
  Downsha.IEExtension.prototype.selectionFinder = null; // SelectionFinder object
  Downsha.IEExtension.prototype.selectionContent = null; // selection content
  Downsha.IEExtension.prototype.popup = null; // popup object

  Downsha.IEExtension.prototype.initialize = function(win) {
  	LOG.debug("-------- DOWNSHA STARTING ------------");
  	LOG.debug("IEExtension.initialize");
  	this.window = (win) ? win : window;
  	this.title = this.window.document.title;
  	this.url = (this.window.document.URL) ? this.window.document.URL : this.window.document.location.href;
  	this.initContext();
  	//var self = this;
  	//this.window.setTimeout(function() {self.startUp();}, this.START_UP_DELAY_TIME);
  };
  Downsha.IEExtension.prototype.initContext = function() {
  	LOG.debug("IEExtension.initContext");
		/**
		 * Since IE does not define the Node interface constants, 
		 * which let you easily identify the type of node, one of the first things 
		 * to do in a DOM script for the Web is to make sure you define one yourself, if it's missing.
		 */
		if (!window['Node']) {
		  window.Node = new Object();
		}
		if (!Node.ELEMENT_NODE)                Node.ELEMENT_NODE                = 1;
		if (!Node.ATTRIBUTE_NODE)              Node.ATTRIBUTE_NODE              = 2;
		if (!Node.TEXT_NODE)                   Node.TEXT_NODE                   = 3;
		if (!Node.CDATA_SECTION_NODE)          Node.CDATA_SECTION_NODE          = 4;
		if (!Node.ENTITY_REFERENCE_NODE)       Node.ENTITY_REFERENCE_NODE       = 5;
		if (!Node.ENTITY_NODE)                 Node.ENTITY_NODE                 = 6;
		if (!Node.PROCESSING_INSTRUCTION_NODE) Node.PROCESSING_INSTRUCTION_NODE = 7;
		if (!Node.COMMENT_NODE)                Node.COMMENT_NODE                = 8;
		if (!Node.DOCUMENT_NODE)               Node.DOCUMENT_NODE               = 9;
		if (!Node.DOCUMENT_TYPE_NODE)          Node.DOCUMENT_TYPE_NODE          = 10;
		if (!Node.DOCUMENT_FRAGMENT_NODE)      Node.DOCUMENT_FRAGMENT_NODE      = 11;
		if (!Node.NOTATION_NODE)               Node.NOTATION_NODE               = 12;
		
		/**
		 * Since IE doesn't support indexOf method to the Array natively.
		 * we need to implement it at the beginning.
		 */
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(elt /*, from*/) {
				var len = this.length;
				var from = Number(arguments[1]) || 0;
				from = (from < 0) ? Math.ceil(from) : Math.floor(from);
				if (from < 0) {
					from += len;
				}
				
				for (; from < len; from++) {
					if (from in this && this[from] === elt) {
						return from;
					}
				}
				return -1;
			};
		}
		
		/**
		 * IE doesn't support trim method of String object until version 9.
		 * we need to implement it at the beginning.
		 */
		if (!String.prototype.trim) {
			String.prototype.trim = function() {
				return this.replace(/^[\s]+/, '').replace(/[\s]+$/, '');
			};
		}
		
		// feature detect: html5 canvas, theorectically IE 9 will pass this test.
		var canvas = this.window.document.createElement("CANVAS");
		if (canvas && canvas.getContext) {
			this.supportCanvas = true;
			LOG.debug("IEExtension.initContext html5 canvas support");
		} else {
			this.supportCanvas = false;
			LOG.debug("IEExtension.initContext html5 canvas not support");
		}
  };
  Downsha.IEExtension.prototype.destroy = function() {
    LOG.debug("IEExtension.destroy");
    LOG.debug("-------- DOWNSHA TERMINTATING --------");
  };
  Downsha.IEExtension.prototype.startUp = function() {
    LOG.debug("IEExtension.startUp title: " + this.title + " url: " + this.url);
    
    /**
     * let's detect plugin version at first
     */    
    this.getPluginVersion();
    /**
     * let's detect page information here so we can decide clip options.
     */
		this.clipOptions = [];
		this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_URL);
		this.clipAction = Downsha.Constants.CLIP_ACTION_URL;
		if (!Downsha.Utils.isForbiddenUrl(this.url)) {
			this.getPageInfo().profile();
			if (this.getPageInfo().documentLength > 0 || this.getPageInfo().containsImages) {
				this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_FULL_PAGE);
				this.clipAction = Downsha.Constants.CLIP_ACTION_FULL_PAGE;
			}
			if (this.getPageInfo().article && this.isArticleSane()) {
				this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_ARTICLE);
				this.clipAction = Downsha.Constants.CLIP_ACTION_ARTICLE;
			}
			if (this.getPageInfo().selection && this.isSelectionSane()) {
				this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_SELECTION);
				this.clipAction = Downsha.Constants.CLIP_ACTION_SELECTION;
			}
		}
    /**
     * let's show popup dialog for user interactive here.
     */
		var obj = {
			pluginVersion : this.pluginVersion,
			title : this.title,
			url : this.url,
			clipAction : this.clipAction,
			clipOptions : this.clipOptions
		};
		this.getPopup().openPopup(obj);
  };
  Downsha.IEExtension.prototype.isSelectionSane = function() {
  	var clip = new Downsha.Clip(this.window, this.stylingStrategy, Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX);
  	if (clip.clipSelection()) this.selectionContent = clip.content; // preseve selection content at first
  	if (!this.selectionContent || this.selectionContent.length == 0) return false;
  	return true;
  };
  Downsha.IEExtension.prototype.isArticleSane = function() {
    if (this.getPageInfo().articleBoundingClientRect) {
	    var pageArea = Math.round(this.getPageInfo().documentWidth * this.getPageInfo().documentHeight);
	    var articleArea = Math.round(this.getPageInfo().articleBoundingClientRect.width * 
	    	this.getPageInfo().articleBoundingClientRect.height);
	    var articleRatio = Math.round((pageArea > 0) ? (articleArea * 100 / pageArea) : 0);
	    LOG.debug("IEExtension.isArticleSane PageArea: " + pageArea + " ArticleArea: " + articleArea + " Ratio: " + articleRatio + "%");
    	return Downsha.Utils.isArticleSane(
    		this.getPageInfo().documentWidth, 
    		this.getPageInfo().documentHeight, 
    		this.getPageInfo().articleBoundingClientRect);
    }
    return false;
  };
  Downsha.IEExtension.prototype.getClipper = function() {
  	if (!this.clipper) {
  		this.clipper = new Downsha.ContentClipper(this.window, this);
  	}
  	return this.clipper;
  };
  Downsha.IEExtension.prototype.getPreviewer = function() {
  	if (!this.previewer) {
  		this.previewer = new Downsha.ContentPreviewScript(this.window, this.supportCanvas);
  	}
  	return this.previewer;
  };
  Downsha.IEExtension.prototype.getPageInfo = function() {
  	if (!this.pageinfo) {
  		this.pageinfo = new Downsha.PageInfoScript(this.window);
  	}
  	return this.pageinfo;
  };
  Downsha.IEExtension.prototype.getSelectionFinder = function() {
  	if (!this.selectionFinder) {
  		this.selectionFinder = new Downsha.SelectionFinder(this.window.document);
  	}
  	return this.selectionFinder;
  };  
  Downsha.IEExtension.prototype.getPopup = function() {
  	if (!this.popup) {
  		this.popup = new Downsha.Popup(this.window);
  	}
  	return this.popup;
  };
  Downsha.IEExtension.prototype.handlePageClipSuccess = function(clip) {
    LOG.debug("IEExtension.handlePageClipSuccess");
    var self = Downsha.getIEExtension();
    var clipNote = clip;
    clipNote.created = new Date().getTime();

    var contentLength = (clipNote && clipNote.content) ? clipNote.content.length : 0;
    LOG.debug("Clipped note's content length: " + contentLength);
    if (contentLength == 0) {
    	var msg = Downsha.i18n.getMessage("fullPageClipEmpty");
    	alert(msg);
    } else {
	    self.window.setTimeout(function() {
		    // *** send clip note to process
		    self.processClip(clipNote);
		    
		    // TODO show clip content in a new window
		    //self.window.document.body.innerHTML = clipNote.content;
		  }, self.CLIP_PROCESS_DELAY_TIME);    	
    }
  };
  Downsha.IEExtension.prototype.handlePageClipTooBig = function(clip) {
    LOG.debug("IEExtension.handlePageClipTooBig");
    var msg = Downsha.i18n.getMessage("fullPageClipTooBig");
    alert(msg);
  };
  Downsha.IEExtension.prototype.handlePageClipFailure = function(error) {
    LOG.debug("IEExtension.handlePageClipFailure");
    if (typeof error == "string" && error.length > 0) {
    	var msg = error;
    } else {
    	var msg = Downsha.i18n.getMessage("fullPageClipFailure");
    }
    alert(msg);
  };
  Downsha.IEExtension.prototype.previewSelection = function() {
    LOG.debug("IEExtension.previewSelection");
    this.getPreviewer().previewSelection();
  };
  Downsha.IEExtension.prototype.previewFullPage = function() {
    LOG.debug("IEExtension.previewFullPage");
    this.getPreviewer().previewFullPage();
  };
  Downsha.IEExtension.prototype.previewArticle = function() {
    LOG.debug("IEExtension.previewArticle");
    this.getPreviewer().previewArticle(false);
  };
  Downsha.IEExtension.prototype.previewUrl = function() {
    LOG.debug("IEExtension.previewUrl");
    this.getPreviewer().previewUrl(this.title, this.url, null);
  };
  Downsha.IEExtension.prototype.previewNudge = function(direction) {
    LOG.debug("IEExtension.previewNudge");
    this.getPreviewer().previewNudge(direction); // nudge direction: expand/shrink/previous/next
  };
  Downsha.IEExtension.prototype.previewClear = function() {
    LOG.debug("IEExtension.previewClear");
    this.getPreviewer().clear();
  };
  Downsha.IEExtension.prototype.clipPage = function(fullPage, attrs) { // for conext menu - clip selection/article/page
    LOG.debug("IEExtension.clipPage");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().perform(fullPage, {}, true);
  };
  Downsha.IEExtension.prototype.clipFullPage = function(attrs) { // for browser icon - clip full page
    LOG.debug("IEExtension.clipFullPage");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().clipFullPage(attrs, true);
  };
  Downsha.IEExtension.prototype.clipSelection = function(attrs) { // for context menu and browser icon - clip selection
    LOG.debug("IEExtension.clipSelection");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().clipSelection(attrs, true);
  };
  Downsha.IEExtension.prototype.clipArticle = function(attrs) {
    LOG.debug("IEExtension.clipArticle");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().clipArticle(attrs, true);
  };
  Downsha.IEExtension.prototype.clipUrl = function(attrs) {
    LOG.debug("IEExtension.clipUrl");
    this.getClipper().clipUrl(attrs, true);
    /*
    var clip = {
    	url : this.url,
    	title : this.title,
    	content : Downsha.Utils.createUrlClipContent(this.title, this.url)
    };
    this.handlePageClipSuccess(clip);
    */
  };
  Downsha.IEExtension.prototype.processClip = function(clip) {
    LOG.debug("IEExtension.processClip");
    if ((typeof clip == "object") && (clip != null)) {
	    /**
	     * since we have arrived here, now we should hand over clip data to
	     * ActiveX object. ActiveX object will get cache data for inner images 
	     * from local file system. after cache, ActiveX object should send clip 
	     * data to remote servers and notify result to our scripts.
	     */
			try {
				if (!downshaClipper) {
					var downshaClipper = new ActiveXObject("DownshaIE.Clipper.1");
				}
				if (downshaClipper) {
					downshaClipper.AddClip(
					(clip.content) ? clip.content : "", 
					(clip.title) ? clip.title : "", 
					(clip.url) ? clip.url : "", 
					Downsha.Platform.getUserAgent());
				}
			} catch (e) {
				LOG.warn("IEExtension.processClip exception");
				LOG.dir(e);
			}
		}
  };
  Downsha.IEExtension.prototype.getPluginVersion = function() {
    /**
     * we're tring to get version from our plugin API.
     * If failed, we should notify users to activate our plugin at first use.
     */
		try {
			if (!downshaClipper) {
				var downshaClipper = new ActiveXObject("DownshaIE.Clipper.1");
			}
			if (downshaClipper) {
				this.pluginVersion = downshaClipper.GetVersion();
			}
		} catch (e) {
			this.pluginVersion = 0;
			LOG.warn("IEExtension.getVersion exception");
			LOG.dir(e);
		}
		LOG.debug("IEExtension.getPluginVersion " + this.pluginVersion);
  };
})();
/**
 * @author: INA Lintaro
 * @copyright (C) 2009 INA Lintaro / Hatena. All rights reserved.
 * @copyright (C) 2007/2008 Nakatani Shuyo / Cybozu Labs Inc. All rights reserved.
 * @desc: hatena content extract algorithm
 */

if (typeof ExtractContentJS == "undefined") {
    var ExtractContentJS = {};
}
if (typeof ExtractContentJS.Lib == "undefined") {
    ExtractContentJS.Lib = {};
}
ExtractContentJS.Lib.Util = (function () {
    var a = {};
    a.BenchmarkTimer = function () {
        var c = function () {
                var f = new Date();
                var e = 0;
                e = f.getHours();
                e = e * 60 + f.getMinutes();
                e = e * 60 + f.getSeconds();
                e = e * 1000 + f.getMilliseconds();
                return e;
            };
        var d = function () {
                var e = {
                    elapsed: 0
                };
                e.reset = function () {
                    e.elapsed = 0;
                    return e;
                };
                e.start = function () {
                    e.msec = c();
                    return e;
                };
                e.stop = function () {
                    e.elapsed += c() - e.msec;
                    return e;
                };
                return e.start();
            };
        var b = {
            timers: {}
        };
        b.get = function (e) {
            if (!b.timers[e]) {
                b.timers[e] = new d();
            }
            return b.timers[e];
        };
        b.reset = function (e) {
            return b.get(e).reset();
        };
        b.start = function (e) {
            return b.get(e).start();
        };
        b.stop = function (e) {
            return b.get(e).stop();
        };
        return b;
    };
    a.Token = function (e) {
        var d = {
            hiragana: /[\u3042-\u3093\u304C-\u307C\u3041-\u3087\u308E\u3063\u30FC]/,
            katakana: /[\u30A2-\u30F3\u30AC-\u30DC\u30A1-\u30E7\u30EE\u30C3\u30FC]/,
            kanji: {
                test: function (f) {
                    return "\u4E00" <= f && f <= "\u9FA0" || f === "\u3005";
                }
            },
            alphabet: /[a-zA-Z]/,
            digit: /[0-9]/
        };
        var c = function (f) {
                var g = {};
                for (var h in d) {
                    if (d[h].test(f)) {
                        g[h] = d[h];
                    }
                }
                return g;
            };
        var b = {
            first: c(e.charAt(0)),
            last: c(e.charAt(e.length - 1))
        };
        b.isTokenized = function (h, g) {
            var i = h.length ? h.charAt(h.length - 1) : "";
            var j = g.length ? g.charAt(0) : "";
            var f = function (k, m) {
                    if (k.length) {
                        for (var l in m) {
                            if (m[l].test(k)) {
                                return false;
                            }
                        }
                    }
                    return true;
                };
            return f(i, b.first) && f(j, b.last);
        };
        return b;
    };
    a.inherit = function (e, b) {
        var c = e || {};
        for (var d in b) {
            if (typeof c[d] == "undefined") {
                c[d] = b[d];
            }
        }
        return c;
    };
    a.countMatch = function (c, b) {
        return c.split(b).length - 1;
    };
    a.countMatchTokenized = function (j, h) {
        var f = 0;
        var e = null;
        var c = new a.Token(h);
        var g = j.split(h);
        var b = g.length;
        for (var d = 0; d < b; d++) {
            if (e && c.isTokenized(e, g[d])) {
                f++;
            }
            e = g[d];
        }
        return f;
    };
    a.indexOfTokenized = function (f, e) {
        var c = f.indexOf(e);
        if (c >= 0) {
            var b = new a.Token(e);
            var d = c > 1 ? f.substr(c - 1, 1) : "";
            var g = f.substr(c + e.length, 1);
            if (b.isTokenized(d, g)) {
                return c;
            }
        }
        return -1;
    };
    a.dump = function (c) {
        if (typeof c == "undefined") {
            return "undefined";
        }
        if (typeof c == "string") {
            return '"' + c + '"';
        }
        if (typeof c != "object") {
            return "" + c;
        }
        if (c === null) {
            return "null";
        }
        if (c instanceof Array) {
            return "[" + c.map(function (e) {
                return "obj"
            }).join(",") + "]";
        } else {
            var b = [];
            for (var d in c) {
                b.push(d + ":obj");
            }
            return "{" + b.join(",") + "}";
        }
    };
    return a;
})();
ExtractContentJS.Lib.A = (function () {
    var a = {};
    a.indexOf = Array.indexOf ||
    function (d, e) {
        var c = 2;
        var b = d.length;
        var f = Number(arguments[c++]) || 0;
        f = (f < 0) ? Math.ceil(f) : Math.floor(f);
        if (f < 0) {
            f += b;
        }
        for (; f < b; f++) {
            if (f in d && d[f] === e) {
                return f;
            }
        }
        return -1;
    };
    a.filter = Array.filter ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.filter: not a function");
        }
        var j = new Array();
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e) {
                var h = e[f];
                if (c.call(g, h, f, e)) {
                    j.push(h);
                }
            }
        }
        return j;
    };
    a.forEach = Array.forEach ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.forEach: not a function");
        }
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e) {
                c.call(g, e[f], f, e);
            }
        }
    };
    a.every = Array.every ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.every: not a function");
        }
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e && !c.call(g, e[f], f, e)) {
                return false;
            }
        }
        return true;
    };
    a.map = Array.map ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.map: not a function");
        }
        var h = new Array(b);
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e) {
                h[f] = c.call(g, e[f], f, e);
            }
        }
        return h;
    };
    a.some = Array.some ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw new TypeError("A.some: not a function");
        }
        var g = arguments[d++];
        for (var f = 0; f < b; f++) {
            if (f in e && c.call(g, e[f], f, e)) {
                return true;
            }
        }
        return false;
    };
    a.reduce = Array.reduce ||
    function (e, c) {
        var d = 2;
        var b = e.length;
        if (typeof c != "function") {
            throw TypeError("A.reduce: not a function ");
        }
        var f = 0;
        if (arguments.length > d) {
            var h = arguments[d++];
        } else {
            do {
                if (f in e) {
                    h = e[f++];
                    break;
                }
                if (++f >= b) {
                    throw new TypeError("A.reduce: empty array");
                }
            } while (true)
        }
        for (; f < b; f++) {
            if (f in e) {
                h = c.call(null, h, e[f], f, e);
            }
        }
        return h;
    };
    a.zip = function (d) {
        if (d[0] instanceof Array) {
            var c = d[0].length;
            var b = d.length;
            var g = new Array(c);
            for (var f = 0; f < c; f++) {
                g[f] = [];
                for (var e = 0; e < b; e++) {
                    g[f].push(d[e][f]);
                }
            }
            return g;
        }
        return [];
    };
    a.first = function (b) {
        return b ? b[0] : null;
    };
    a.last = function (b) {
        return b ? b[b.length - 1] : null;
    };
    a.push = function (c, b) {
        return Array.prototype.push.apply(c, b);
    };
    return a;
})();
ExtractContentJS.Lib.DOM = (function () {
    var a = ExtractContentJS.Lib.A;
    var b = {};
    b.getElementStyle = function (g, i) {
        var d = (g && g.style) ? g.style[i] : null;
        if (!d) {
            var c = g.ownerDocument.defaultView;
            if (c && c.getComputedStyle) {
                try {
                    var f = c.getComputedStyle(g, null);
                } catch (h) {
                    return null;
                }
                i = i.replace(/([A-Z])/g, "-$1").toLowerCase();
                d = f ? f.getPropertyValue(i) : null;
            } else {
                if (g.currentStyle) {
                    d = g.currentStyle[i];
                }
            }
        }
        return d;
    };
    b.text = function (c) {
        if (typeof c.textContent != "undefined") {
            return c.textContent;
        } else {
            if (c.nodeName == "#text") {
                return c.nodeValue;
            } else {
                if (typeof c.innerText != "undefined") {
                    return c.innerText;
                }
            }
        }
        return null;
    };
    b.ancestors = function (g) {
        var c = g.ownerDocument.body;
        var f = [];
        var d = g;
        while (d != c) {
            f.push(d);
            d = d.parentNode;
        }
        f.push(c);
        return f;
    };
    b.commonAncestor = function (h, g) {
        var d = b.ancestors(h).reverse();
        var c = b.ancestors(g).reverse();
        var f = null;
        for (var e = 0; d[e] && c[e] && d[e] == c[e]; e++) {
            f = d[e];
        }
        return f;
    };
    b.countMatchTagAttr = function (e, l, j, g) {
        var k = function (i) {
                return i.test(e[j]);
            };
        if ((e.tagName || "").toLowerCase() == l && a.some(g, k)) {
            return 1;
        }
        var d = 0;
        var c = e.childNodes;
        for (var f = 0, h = c.length; f < h; f++) {
            d += b.countMatchTagAttr(c[f], l, j, g);
        }
        return d;
    };
    b.matchTag = function (d, c) {
        return a.some(c, function (e) {
            if (typeof e == "string") {
                return e == ((d && d.tagName) || "").toLowerCase();
            } else {
                if (e instanceof Array) {
                    return e[0] == ((d && d.tagName) || "").toLowerCase() && b.matchAttr(d, e[1]);
                } else {
                    return false;
                }
            }
        })
    };
    b.matchAttr = function (f, e) {
        var h = function (i, j) {
                if (typeof i == "string") {
                    return i == j;
                } else {
                    if (i instanceof RegExp) {
                        return i.test(j);
                    } else {
                        if (i instanceof Array) {
                            return a.some(i, function (m) {
                                return h(m, j);
                            })
                        } else {
                            if (i instanceof Object) {
                                for (var l in i) {
                                    var k = f[l];
                                    if (k && b.matchAttr(k, i[l])) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            };
        for (var g in e) {
            var c = f[g];
            var d = e[g];
            if (c) {
                return h(d, c);
            }
        }
        return false;
    };
    b.matchStyle = function (d, c) {
        var f = function (g, h) {
                if (typeof g == "string") {
                    return g == h;
                } else {
                    if (g instanceof RegExp) {
                        return g.test(h);
                    } else {
                        if (g instanceof Array) {
                            return a.some(g, function (i) {
                                return f(i, h);
                            });
                        }
                    }
                }
                return false;
            };
        for (var e in c) {
            if (f(c[e], b.getElementStyle(d, e))) {
                return true;
            }
        }
        return false;
    };
    return b;
})();
if (typeof ExtractContentJS == "undefined") {
    var ExtractContentJS = {};
}(function (d) {
    var g = d.Lib.Util;
    var a = d.Lib.A;
    var e = d.Lib.DOM;
    var f = g.inherit(function (k) {
        var l = arguments[1] || 0;
        var h = arguments[2] || {};
        var j = arguments[3] || 1048576;
        var i = {
            node: k,
            depth: l,
            inside: h
        };
        i.statistics = function () {
            var n = (e.text(k) || "").replace(/\s+/g, " ");
            var m = n.length;
            return {
                text: n.substr(0, j),
                noLinkText: (h.link || h.form) ? "" : n,
                listTextLength: h.list ? m : 0,
                noListTextLength: h.list ? 0 : m,
                linkCount: h.link ? 1 : 0,
                listCount: h.li ? 1 : 0,
                linkListCount: (h.li && h.link) ? 1 : 0
            }
        };
        return i;
    }, {
        commonAncestor: function () {
            var h = a.map(arguments, function (i) {
                return i.node;
            });
            if (h.length < 2) {
                return h[0];
            }
            return a.reduce(h, function (i, j) {
                return e.commonAncestor(i, j);
            })
        },
        mergeStatistics: function (i, h) {
            var j = {};
            for (var k in i) {
                j[k] = i[k] + h[k];
            }
            return j;
        }
    });
    var c = function (i) {
            i = a.filter(i, function (j) {
                var k = e.text(j.node) || "";
                k = k.replace(/\s+/g, "");
                return k.length != 0
            });
            var h = {
                score: 0,
                leaves: i
            };
            h.commonAncestor = function () {
                return f.commonAncestor.apply(null, h.leaves);
            };
            return h;
        };
    var b = function (i) {
            var h = {
                _content: i
            };
            h.asLeaves = function () {
                return h._content;
            };
            h.asNode = function () {
                if (h._node) {
                    return h._node;
                }
                h._node = f.commonAncestor.apply(null, h._content);
                return h._node;
            };
            h.asTextFragment = function () {
                if (h._textFragment) {
                    return h._textFragment;
                }
                if (h._content.length < 1) {
                    return "";
                }
                h._textFragment = a.reduce(h._content, function (k, l) {
                    var j = e.text(l.node);
                    j = j.replace(/^\s+/g, "").replace(/\s+$/g, "");
                    j = j.replace(/\s+/g, " ");
                    return k + j;
                }, "");
                return h._textFragment;
            };
            h.asText = function () {
                if (h._text) {
                    return h._text;
                }
                var j = h.asNode();
                h._text = j ? e.text(j) : "";
                return h._text;
            };
            h.toString = function () {
                return h.asTextFragment();
            };
            return h;
        };
    d.LayeredExtractor = function () {
        var h = {
            handler: arguments[0] || [],
            filter: arguments[1] || {}
        };
        h.factory = {
            getHandler: function (i) {
                if (typeof d.LayeredExtractor.Handler != "undefined") {
                    return new d.LayeredExtractor.Handler[i];
                }
                return null;
            }
        };
        h.addHandler = function (i) {
            if (typeof i != "undefined") {
                h.handler.push(i);
            }
            return h;
        };
        h.filterFor = function (i) {};
        h.extract = function (p) {
            var k = (p.URL) ? p.URL : p.location.href;
            var m = {
                title: p.title,
                url: (p.URL) ? p.URL : p.location.href
            };
            var j = h.handler.length;
            for (var l = 0; l < j; l++) {
                var n = h.handler[l].extract(p, k, m);
                if (!n) {
                    continue;
                }
                var o = h.filterFor(k);
                if (o) {
                    n = o.filter(n);
                }
                n = new b(n);
                if (!n.toString().length) {
                    continue;
                }
                m.content = n;
                m.isSuccess = true;
                m.engine = m.engine || h.handler[l];
                break;
            }
            return m;
        };
        return h;
    };
    d.LayeredExtractor.Handler = {};
    d.LayeredExtractor.Handler.Heuristics = function () {
        var h = {
            name: "Heuristics",
            content: [],
            opt: g.inherit(arguments[0], {
                threshold: 60,
                minLength: 30,
                factor: {
                    decay: 0.75,
                    noBody: 0.72,
                    continuous: 1.16
                },
                punctuationWeight: 10,
                minNoLink: 8,
                noListRatio: 0.2,
                limit: {
                    leaves: 800,
                    recursion: 20,
                    text: 1048576
                },
                debug: false
            }),
            pat: g.inherit(arguments[1], {
                sep: ["div", "center", "td", "h1", "h2"],
                waste: [/Copyright|All\s*Rights?\s*Reserved?/i],
                affiliate: [/amazon[a-z0-9\.\/\-\?&]+-22/i],
                list: ["ul", "dl", "ol"],
                li: ["li", "dd"],
                a: ["a"],
                form: ["form"],
                noContent: ["frameset"],
                ignore: ["iframe", "img", "script", "style", "select", "noscript", ["div",
                {
                    id: [/more/, /menu/, /side/, /navi/],
                    className: [/more/, /menu/, /side/, /navi/]
                }]],
                ignoreStyle: {
                    display: "none",
                    visibility: "hidden"
                },
                punctuations: /[\u3002\u3001\uFF0E\uFF0C\uFF01\uFF1F]|\.[^A-Za-z0-9]|,[^0-9]|!|\?/
            })
        };
        var i = g.inherit(function (k) {
            var j = new c(k);
            j.eliminateLinks = function () {
                var n = a.map(j.leaves, function (r) {
                    return r.statistics();
                });
                if (!n.length) {
                    return "";
                }
                if (n.length == 1) {
                    n = n[0];
                } else {
                    n = a.reduce(n, function (r, s) {
                        return f.mergeStatistics(r, s);
                    })
                }
                var q = n.noLinkText.length;
                var m = n.linkCount;
                var p = n.listTextLength;
                if (q < h.opt.minNoLink * m) {
                    return "";
                }
                var o = n.linkListCount / (n.listCount || 1);
                o *= o;
                var l = h.opt.noListRatio * o * p;
                if (q < l) {
                    return "";
                }
                return n.noLinkText;
            };
            j.noBodyRate = function () {
                var l = 0;
                if (j.leaves.length > 0) {
                    l += a.reduce(j.leaves, function (m, n) {
                        return m + e.countMatchTagAttr(n.node, "a", "href", h.pat.affiliate)
                    }, 0);
                }
                l /= 2;
                l += a.reduce(h.pat.waste, function (m, n) {
                    return m + g.countMatch(j._nolink, n);
                }, 0);
                return l;
            };
            j.calcScore = function (l, m) {
                j._nolink = j.eliminateLinks();
                if (j._nolink.length < h.opt.minLength) {
                    return 0;
                }
                var o = g.countMatch(j._nolink, h.pat.punctuations);
                o *= h.opt.punctuationWeight;
                o += j._nolink.length;
                o *= l;
                var n = j.noBodyRate();
                o *= Math.pow(h.opt.factor.noBody, n);
                j._c = j.score = o;
                j._c1 = o * m;
                return o;
            };
            j.isAccepted = function () {
                return j._c > h.opt.threshold;
            };
            j.isContinuous = function () {
                return j._c1 > h.opt.threshold;
            };
            j.merge = function (l) {
                j.score += l._c1;
                j.depth = Math.min(j.depth, l.depth);
                a.push(j.leaves, l.leaves);
                return j;
            };
            return j;
        }, {
            split: function (n) {
                var m = [];
                var l = [];
                var p = 0;
                var k = h.opt.limit.text;
                var j = function (q) {
                        if (q && l.length) {
                            m.push(new i(l));
                            l = [];
                        }
                    };
                var o = function (s, u, t) {
                        if (p >= h.opt.limit.leaves) {
                            return m;
                        }
                        if (u >= h.opt.limit.recursion) {
                            return m;
                        }
                        if (s && s.nodeName == "#comment") {
                            return m;
                        }
                        if (e.matchTag(s, h.pat.ignore)) {
                            return m;
                        }
                        if (e.matchStyle(s, h.pat.ignoreStyle)) {
                            return m;
                        }
                        var q = s.childNodes;
                        var z = h.pat.sep;
                        var x = q.length;
                        var r = {
                            form: t.form || e.matchTag(s, h.pat.form),
                            link: t.link || e.matchTag(s, h.pat.a),
                            list: t.list || e.matchTag(s, h.pat.list),
                            li: t.li || e.matchTag(s, h.pat.li)
                        };
                        for (var v = 0; v < x; v++) {
                            var y = q[v];
                            var w = e.matchTag(y, z);
                            j(w);
                            o(y, u + 1, r);
                            j(w);
                        }
                        if (!x) {
                            p++;
                            l.push(new f(s, u, r, k));
                        }
                        return m;
                    };
                o(n, 0, {});
                j(true);
                return m;
            }
        });
        h.extract = function (q) {
            var u = function (w) {
                    return q.getElementsByTagName(w).length != 0;
                };
            if (a.some(h.pat.noContent, u)) {
                return h;
            }
            var s = 1;
            var o = 1;
            var r = [];
            var j = i.split(q.body);
            var t;
            var p = j.length;
            for (var n = 0; n < p; n++) {
                var m = j[n];
                if (t) {
                    o /= h.opt.factor.continuous;
                }
                if (!m.calcScore(s, o)) {
                    continue;
                }
                s *= h.opt.factor.decay;
                if (m.isAccepted()) {
                    if (m.isContinuous() && t) {
                        t.merge(m);
                    } else {
                        t = m;
                        r.push(m);
                    }
                    o = h.opt.factor.continuous;
                } else {
                    if (!t) {
                        s = 1;
                    }
                }
            }
            h.blocks = r.sort(function (w, v) {
                return v.score - w.score;
            });
            var l = a.first(h.blocks);
            if (l) {
                h.content = l.leaves;
            }
            return h.content;
        };
        return h;
    };
    d.LayeredExtractor.Handler.GoogleAdSection = function () {
        var h = {
            name: "GoogleAdSection",
            content: [],
            state: [],
            opt: g.inherit(arguments[0], {
                limit: {
                    leaves: 800,
                    recursion: 20
                },
                debug: false
            })
        };
        var i = {
            ignore: /google_ad_section_start\(weight=ignore\)/i,
            section: /google_ad_section_start/i,
            end: /google_ad_section_end/i
        };
        var k = 1;
        var j = 2;
        h.inSection = function () {
            return a.last(h.state) == j;
        };
        h.ignore = function () {
            h.state.push(k);
        };
        h.section = function () {
            h.state.push(j);
        };
        h.end = function () {
            if (h.state.length) {
                h.state.pop();
            }
        };
        h.parse = function (o) {
            var p = arguments[1] || 0;
            if (o.nodeName == "#comment") {
                if (i.ignore.test(o.nodeValue)) {
                    h.ignore();
                } else {
                    if (i.section.test(o.nodeValue)) {
                        h.section();
                    } else {
                        if (i.end.test(o.nodeValue)) {
                            h.end();
                        }
                    }
                }
                return;
            }
            if (h.content.length >= h.opt.limit.leaves) {
                return;
            }
            if (p >= h.opt.limit.recursion) {
                return;
            }
            var n = o.childNodes;
            var l = n.length;
            for (var m = 0; m < l; m++) {
                var q = n[m];
                h.parse(q, p + 1);
            }
            if (!l && h.inSection()) {
                h.content.push(new f(o, p));
            }
        };
        h.extract = function (l) {
            h.parse(l);
            h.blocks = [new c(h.content)];
            return h.content;
        };
        return h;
    };
})(ExtractContentJS);
/**
 * @author: chenmin
 * @date: 2011-10-17
 * @desc: Downsha.SelectionFinder
 * Downsha.SelectionFinder provides mechanism for finding selection on the page
 * via find(). It is able to traverse frames in order to find a selection. It
 * will report whether there's a selection via hasSelection(). After doing
 * find(), the selection is stored in the selection property, and the document
 * property will contain the document in which the selection was found. Find
 * method will only recurse documents if it was invoked as find(true),
 * specifying to do recursive search. You can use reset() to undo find().
 */
(function() {
  Downsha.SelectionFinder = function SelectionFinder(document) {
    this.initDocument = document;
    this.document = document;
  };
  Downsha.SelectionFinder.prototype.initDocument = null;
  Downsha.SelectionFinder.prototype.document = null;
  Downsha.SelectionFinder.prototype.selection = null;
  Downsha.SelectionFinder.prototype.text = null;

  Downsha.SelectionFinder.prototype.reset = function() {
    this.document = this.initDocument;
    this.selection = null;
    this.text = null;
  };
  Downsha.SelectionFinder.prototype.hasSelection = function() {
    var range = this.getRange();
    if (range && typeof range.startContainer != "undefined" && typeof range.endContainer != "undefined") {
    	if ((range.startContainer != range.endContainer) || 
    		(range.startContainer == range.endContainer && range.startOffset != range.endOffset)) {
    		return true;
    	} else {
    		return false;
    	}
    } else if (range) {
	    /**
	     * In IE 6/7/8, you cannot retrieve the elements and offsets 
	     * that define the start and end points of a TextRange object. 
	     * Instead, you can get the coordinates of the TextRange object's 
	     * start point with the offsetLeft and offsetTop properties.
	     */
      return true;
    }
    return false;
  };
  Downsha.SelectionFinder.prototype.find = function(deep) { // deep means recursive search in inner frames
    var sel = this._findSelectionInDocument(this.document, deep);
    this.document = sel.document;
    this.selection = sel.selection;
    this.text = sel.text;
  };
  Downsha.SelectionFinder.prototype.getRange = function() {
    if (!this.selection || !this.text || this.text.length == 0) {
      return null;
    }
    
    if (typeof this.selection.rangeCount != "undefined" && // for IE 9 
    	this.selection.rangeCount > 0) {
    	/**
    	 * Range object used by IE 9/Firefox/Chrome
			 * {
			 *   collapsed : false,
			 *   commonAncestorContainer : [object HTMLParagraphElement],
			 *   endContainer : [object HTMLParagraphElement],
			 *   endOffset : 15,
			 *   startContainer : [object HTMLParagraphElement],
			 *   startOffset : 0,
			 *   cloneContents :  function cloneContents() {     [native code] } ,
			 *   cloneRange :  function cloneRange() {     [native code] } ,
			 *   collapse :  function collapse() {     [native code] } ,
			 *   compareBoundaryPoints :  function compareBoundaryPoints() {     [native code] } ,
			 *   deleteContents :  function deleteContents() {     [native code] } ,
			 *   detach :  function detach() {     [native code] } ,
			 *   extractContents :  function extractContents() {     [native code] } ,
			 *   getBoundingClientRect :  function getBoundingClientRect() {     [native code] } ,
			 *   getClientRects :  function getClientRects() {     [native code] } ,
			 *   insertNode :  function insertNode() {     [native code] } ,
			 *   selectNode :  function selectNode() {     [native code] } ,
			 *   selectNodeContents :  function selectNodeContents() {     [native code] } ,
			 *   setEnd :  function setEnd() {     [native code] } ,
			 *   setEndAfter :  function setEndAfter() {     [native code] } ,
			 *   setEndBefore :  function setEndBefore() {     [native code] } ,
			 *   setStart :  function setStart() {     [native code] } ,
			 *   setStartAfter :  function setStartAfter() {     [native code] } ,
			 *   setStartBefore :  function setStartBefore() {     [native code] } ,
			 *   surroundContents :  function surroundContents() {     [native code] } ,
			 *   toString :  function toString() {     [native code] } ,
			 *   END_TO_END : 2,
			 *   END_TO_START : 3,
			 *   START_TO_END : 1,
			 *   START_TO_START : 0
			 * }
			 */    		
	    if (typeof this.selection.getRangeAt != "undefined") {
	    	return this.selection.getRangeAt(0); // returns Range object
	    } else {
	      var range = this.document.createRange();
	      range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
	      range.setEnd(this.selection.focusNode, this.selection.focusOffset);
	      return range; // returns Range object
	    }
	  } else { // for IE 6/7/8, manually compute start container and end container for text range
			if (this.selection && 
				(typeof this.selection.startContainer == "undefined" || 
				typeof this.selection.endContainer == "undefined")) {
				var startRange = this.selection.duplicate();
				startRange.collapse(true);
				var startInfo = this.getTextRangeContainer(startRange);
				if (startInfo && startInfo['container']) {
					this.selection.startContainer = startInfo['container'];
					this.selection.startOffset  = startInfo['offset'];
					LOG.debug("range start container: " + this.selection.startContainer + ", offset: " + this.selection.startOffset);
				}
				var endRange = this.selection.duplicate();
				endRange.collapse(false);
				var endInfo = this.getTextRangeContainer(endRange);
				if (endInfo && endInfo['container']) {
					this.selection.endContainer = endInfo['container'];
					this.selection.endOffset = endInfo['offset'];
					LOG.debug("range end container: " + this.selection.endContainer + ", offset: " + this.selection.endOffset);
				}
			}
	  	return this.selection; // returns TextRange object
	  }
  };
	Downsha.SelectionFinder.prototype.getTextRangeContainer = function(textRange) {
		var rangeContainer = textRange.parentElement();
		if (!rangeContainer) {
			return null;
		}
		var forward = true;
		var node = rangeContainer.firstChild;
		var newRange = rangeContainer.ownerDocument.body.createTextRange();
		newRange.moveToElementText(rangeContainer);
		newRange.setEndPoint("EndToStart", textRange);
		var rangeLength = newRange.text.length;
		if (rangeLength >= rangeContainer.innerText.length / 2) {
			forward = false;
			node = rangeContainer.lastChild;
			newRange.moveToElementText(rangeContainer);
			newRange.setEndPoint("StartToStart", textRange);
			rangeLength = newRange.text.length;
		}
		
		while (node) {
			switch(node.nodeType) {
			case Node.TEXT_NODE:
				nodeLength = node.data.length;
				if (nodeLength < rangeLength) {
					var difference = rangeLength - nodeLength;
					if (forward) {
						newRange.moveStart("character", difference);
					} else {
						newRange.moveEnd("character", -difference);
					}
					rangeLength = difference;
				} else {
					if (forward) {
						return {'container': node, 'offset': rangeLength};
					} else {
						return {'container': node, 'offset': nodeLength - rangeLength};
					}
				}
				break;
			case Node.ELEMENT_NODE:
				nodeLength = node.innerText.length;
				if (forward) {
					newRange.moveStart("character", nodeLength);
				} else {
					newRange.moveEnd("character", -nodeLength);
				}
				rangeLength = rangeLength - nodeLength;
				break;
			}
			if(forward) {
				node = node.nextSibling;
			} else {
				node = node.previousSibling;
			}
		}
		return {'container': rangeContainer, 'offset': 0};
	};
  Downsha.SelectionFinder.prototype.getCommonAncestorContainer = function() {
    var ancestorElement = null;
    var range = this.getRange();
    /**
     * The Range object and its commonAncestorContainer property are supported in Internet Explorer from version 9.
     * In Internet Explorer before version 9 (and in newer ones as well), the TextRange object provides functionality 
     * similar to the Range object. To get the container element of a TextRange object, use the parentElement method.
     */
  	if (range && range.commonAncestorContainer) { // for IE 9 standard mode
  		ancestorElement = range.commonAncestorContainer;
  	}
    else if (range && (typeof range.parentElement != "undefined")) { // for IE 6/7/8
	    /**
	     * In IE 6/7/8, if you need the deepest element in the DOM hierarchy 
	     * that contains the entire TextRange object, use the parentElement method. 
	     * NOT the commonAncestorContainer property which is used by firefox, chrome and IE 9.
	     */
    	ancestorElement = range.parentElement();
    }
    while (ancestorElement && ancestorElement.nodeType != Node.ELEMENT_NODE) {
      ancestorElement = (ancestorElement.parentElement) ? ancestorElement.parentElement : ancestorElement.parentNode;
    }
    return ancestorElement;
  };
  Downsha.SelectionFinder.prototype._findSelectionInDocument = function(doc, deep) {
    var text = null;
    var sel = null;
    if (typeof doc.getSelection != "undefined") { // for IE 9
    	/**
    	 * selectionRange object (W3C standard, used by IE9/Chrome/Firefox)
    	 * {
    	 *   anchorNode : [object Text],
    	 *   anchorOffset : 1,
    	 *   focusNode : [object Text],
    	 *   focusOffset : 1,
    	 *   isCollapsed : true,
    	 *   rangeCount : 1,
    	 *   addRange :  function addRange() {     [native code] } ,
    	 *   collapse :  function collapse() {     [native code] } ,
    	 *   collapseToEnd :  function collapseToEnd() {     [native code] } ,
    	 *   collapseToStart :  function collapseToStart() {     [native code] } ,
    	 *   deleteFromDocument :  function deleteFromDocument() {     [native code] } ,
    	 *   getRangeAt :  function getRangeAt() {     [native code] } ,
    	 *   removeAllRanges :  function removeAllRanges() {     [native code] } ,
    	 *   removeRange :  function removeRange() {     [native code] } ,
    	 *   selectAllChildren :  function selectAllChildren() {     [native code] } ,
    	 *   toString :  function toString() {     [native code] } 
    	 * } 
    	 */
      sel = doc.getSelection();
      if (sel && typeof sel.toString != "undefined") {
      	text = sel.toString();
      }
    } else if (doc.selection && typeof doc.selection.createRange != "undefined") { // for IE 6/7/8
    	/**
    	 * TextRange object (IE only)
    	 * {
    	 *   text : "",
    	 *   boundingWidth : 0,
    	 *   offsetLeft : 190,
    	 *   boundingLeft : 190,
    	 *   htmlText : "",
    	 *   boundingTop : 2,
    	 *   offsetTop : 2,
    	 *   boundingHeight : 53
    	 * }
    	 */
    	 
    	// type == 'None' means no selection or the selected content is not available.
    	if (doc.selection.type != "None") {
    		sel = doc.selection.createRange();
	      if (sel && sel.text) {
	      	text = sel.text;
	      }
	    }
    } else {
    	LOG.warn("SelectionFinder._findSelectionInDocument can't get selection");
	    return {
	      document : doc,
	      selection : sel,
	      text : text
	    };
    }
    
    if ((!text || text.length == 0) && deep) {
      var documents = Downsha.Utils.findDocuments(doc);
      if (documents.length > 0) {
      	LOG.debug("find selection range empty, trying frames, count: " + documents.length);
        for ( var i = 0; i < documents.length; i++) {
          if (documents[i]) {
            var framedSel = this._findSelectionInDocument(documents[i], deep);
            if (framedSel.selection && framedSel.text && framedSel.text.length > 0) {
              return framedSel;
            }
          }
        }
      }
    }
    return {
      document : doc,
      selection : sel,
      text : text
    };
  };
})();
/**
 * @author: chenmin
 * @date: 2011-10-19
 * @desc: ContentVeil manages the canvas veil of clip preview.
 * we need to hide all <object> and <embed> nodes when show canvas veil, 
 * and restore all <object> and <embed> nodes when hide canvas veil.
 */
(function() {
	Downsha.ContentVeil = function(win, supportCanvas) {
		this.initialize(win, supportCanvas);
	};
	Downsha.ContentVeil.prototype.window = null; // window object
	Downsha.ContentVeil.prototype.supportCanvas = null;
	Downsha.ContentVeil.prototype.veilContext = null; // canvas context
	Downsha.ContentVeil.prototype.veil = null; // canvas layer or whole div layer
	Downsha.ContentVeil.prototype.veilLeft = null; // left div layer
	Downsha.ContentVeil.prototype.veilRight = null; // right div layer
	Downsha.ContentVeil.prototype.veilTop = null; // top div layer
	Downsha.ContentVeil.prototype.veilBottom = null; // bottom div layer
	Downsha.ContentVeil.prototype.veilTopLeft = null; // top-left div layer
	Downsha.ContentVeil.prototype.veilTopRight = null; // top-right div layer
	Downsha.ContentVeil.prototype.veilBottomLeft = null; // bottom-left div layer
	Downsha.ContentVeil.prototype.veilBottomRight = null; // bottom-right div layer
	Downsha.ContentVeil.prototype.VEIL_ID = "downshaContentVeil"; // id name of canvas veil
	Downsha.ContentVeil.prototype.FILL_STYLE = "rgba(0, 0, 0, 0.8)"; // color: black, alpha: 0.8
	Downsha.ContentVeil.prototype.FILL_HIGHLIGHT_STYLE = "rgba(255, 255, 255, 0.3)"; // color: white, alpha: 0.3
	Downsha.ContentVeil.prototype.STROKE_STYLE = "rgba(255, 255, 255, 0.9)"; // default stroke style
	Downsha.ContentVeil.prototype.STROKE_BORDER = "6px solid #5cb8e5"; // default stroke border (#5cb8e5)
	Downsha.ContentVeil.prototype.STROKE_WIDTH = 6; // default stroke width
	Downsha.ContentVeil.prototype.STROKE_CAP = "round"; // default stroke cap
	Downsha.ContentVeil.prototype.STROKE_JOIN = "round"; // dfault stroke join
	Downsha.ContentVeil.prototype.VEIL_CANVAS_ELEMENT_STYLE = { // veil canvas style array, for IE 9+
		position : "absolute",
		zIndex : "2147483640", // IE 10 doesn't allow z-index of canvas greater than 2147483647
		top : "0px",
		left : "0px"
	};
	Downsha.ContentVeil.prototype.VEIL_DIV_ELEMENT_STYLE = { // veil div style array, for IE 6/7/8
		position : "absolute",
		zIndex : "2147483640",
		top : "0px",
		left : "0px",
		background : "#000000",
		filter : "alpha(opacity=80)"
		//filter : "progid:DXImageTransform.Microsoft.gradient(startColorstr=#CC000000,endColorstr=#CC000000);"
	};
	Downsha.ContentVeil.prototype.EMBED_MARKER_ATTR_NAME = "downshaEmbedMarkerName";
	Downsha.ContentVeil.prototype.EMBED_MARKER_ATTR_VALUE = "downshaEmbedMarkerValue";
	
	Downsha.ContentVeil.prototype.initialize = function(win, supportCanvas) {
		LOG.debug("ContentVeil.initialize");
		this.window = (win) ? win : window;
		this.supportCanvas = supportCanvas;
		this.veil = this.createVeilElement();
	};
	Downsha.ContentVeil.prototype.createVeilElement = function() {
		var veilNode = null;
		if (this.supportCanvas) { // cavas available in IE 9 standard mode
			veilNode = this.window.document.createElement("CANVAS");
			veilNode.width = Downsha.Utils.getDocumentWidth(this.window.document);
			veilNode.height = Downsha.Utils.getDocumentHeight(this.window.document);
			for (var i in this.VEIL_CANVAS_ELEMENT_STYLE) {
				veilNode.style[i] = this.VEIL_CANVAS_ELEMENT_STYLE[i];
			}
		} else { // otherwise, create div layer as emulation in IE 6/7/8
			veilNode = this.window.document.createElement("DIV");
			veilNode.style.width = Downsha.Utils.getDocumentWidth(this.window.document);
			veilNode.style.height = Downsha.Utils.getDocumentHeight(this.window.document);
			for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
				veilNode.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
			}
		}
		veilNode.id = this.VEIL_ID;
		return veilNode;
	};
	Downsha.ContentVeil.prototype.getVeilElement = function() {
		if (!this.veil) {
			this.veil = this.window.document.getElementById(this.VEIL_ID);
			if (!this.veil) {
				this.veil = this.createVeilElement();
			}
		}
		return this.veil;
	};
	Downsha.ContentVeil.prototype.removeVeilElement = function() {
	  // main veil
	  if (this.veil && this.veil.parentNode) {
	  	this.veil.parentNode.removeChild(this.veil);
	  }
	  this.veil = null;
	  
	  if (!this.supportCanvas) {
		  // left veil
		  if (this.veilLeft && this.veilLeft.parentNode) {
		  	this.veilLeft.parentNode.removeChild(this.veilLeft);
		  }
		  this.veilLeft = null;
		  // right veil
		  if (this.veilRight && this.veilRight.parentNode) {
		  	this.veilRight.parentNode.removeChild(this.veilRight);
		  }
		  this.veilRight = null;
		  // top veil
		  if (this.veilTop && this.veilTop.parentNode) {
		  	this.veilTop.parentNode.removeChild(this.veilTop);
		  }
		  this.veilTop = null;
		  // bottom veil
		  if (this.veilBottom && this.veilBottom.parentNode) {
		  	this.veilBottom.parentNode.removeChild(this.veilBottom);
		  }
		  this.veilBottom = null;
		  // top-left veil
		  if (this.veilTopLeft && this.veilTopLeft.parentNode) {
		  	this.veilTopLeft.parentNode.removeChild(this.veilTopLeft);
		  }
		  this.veilTopLeft = null;
		  // top-right veil
		  if (this.veilTopRight && this.veilTopRight.parentNode) {
		  	this.veilTopRight.parentNode.removeChild(this.veilTopRight);
		  }
		  this.veilTopRight = null;
		  // bottom-left veil
		  if (this.veilBottomLeft && this.veilBottomLeft.parentNode) {
		  	this.veilBottomLeft.parentNode.removeChild(this.veilBottomLeft);
		  }
		  this.veilBottomLeft = null;
		  // bottom-right veil
		  if (this.veilBottomRight && this.veilBottomRight.parentNode) {
		  	this.veilBottomRight.parentNode.removeChild(this.veilBottomRight);
		  }
		  this.veilBottomRight = null;
		}
	};
	Downsha.ContentVeil.prototype.getVeilContext = function() {
		if (this.supportCanvas) {
		  if (!this.veilContext) {
		  	this.veilContext = this.getVeilElement().getContext("2d"); // canvas 2d context
		  }
		  return this.veilContext;
		} else {
			return nulll;
		}
	};
	Downsha.ContentVeil.prototype.getDefaultVeilParentElement = function() {
	  return this.window.document.body;
	};
	Downsha.ContentVeil.prototype.show = function() {
		LOG.debug("ContentVeil.show");
		this.hideEmbeds(this.window.document, true);
		if (this.supportCanvas) {
			var veilEle = this.getVeilElement();
			if (veilEle && !veilEle.parentElement) {
				var veilParent = this.getDefaultVeilParentElement();
				if (veilParent) {
					veilParent.appendChild(veilEle);
				}
			}
			veilEle.style.display = "";
		}
	};
	Downsha.ContentVeil.prototype.hide = function() {
		LOG.debug("ContentVeil.hide");
		this.unhideEmbeds(this.window.document, true);
		if (this.supportCanvas) {
			var veilEle = this.getVeilElement();
			veilEle.style.display = "none";
		} else {
			this.removeVeilElement();
		}
	};
	Downsha.ContentVeil.prototype.clear = function() {
		LOG.debug("ContentVeil.clear");
		this.clearEmbeds(this.window.document, true);
		if (!this.supportCanvas) {
			this.removeVeilElement();
		}
	};
	Downsha.ContentVeil.prototype.revealElement = function(ele) {
		var rect = Downsha.Utils.getAbsoluteBoundingClientRect(ele);
		this.revealRect(rect);
	};
	Downsha.ContentVeil.prototype.getStrokeWidthForRect = function(veilRect, veilContext) {
		var strokeWidth = Math.max(2, (Math.min((veilRect.bottom - veilRect.top), (veilRect.right - veilRect.left)) / 8));
		strokeWidth = Math.min((veilContext && veilContext.lineWidth) ? veilContext.lineWidth : this.STROKE_WIDTH, strokeWidth);
		return strokeWidth;
	};
	Downsha.ContentVeil.prototype.revealRect = function(veilRect, veilStroke, veilContext) {
		LOG.debug("ContentVeil.revealRect");
		if (this.supportCanvas) { // canvas reveal
			var curContext = this.getVeilContext();
			var lineWidth = 0;
			if (veilStroke) {
				if (veilContext && typeof veilContext.lineWidth == "number") {
					lineWidth = veilContext.lineWidth;
				} else {
					lineWidth = this.getStrokeWidthForRect(veilRect, veilContext);
				}
			}
			var veilLeft = veilRect.left - lineWidth;
			var veilTop = veilRect.top - lineWidth;
			var veilWidth = (veilRect.right - veilRect.left) + (lineWidth * 2);
			var veilHeight = (veilRect.bottom - veilRect.top) + (lineWidth * 2);
			curContext.clearRect(veilLeft, veilTop, veilWidth, veilHeight);
			curContext.fillStyle = (veilContext && veilContext.fillStyle) ? veilContext.fillStyle : this.FILL_HIGHLIGHT_STYLE;
			curContext.fillRect(veilLeft, veilTop, veilWidth, veilHeight); // fill rectangle with specified style
			if (veilStroke) { // draw stroke line
				curContext.lineWidth = lineWidth;
				curContext.strokeStyle = (veilContext && veilContext.strokeStyle) ? veilContext.strokeStyle : this.STROKE_STYLE;
				curContext.lineCap = (veilContext && veilContext.lineCap) ? veilContext.lineCap : this.STROKE_CAP;
				curContext.lineJoin = (veilContext && veilContext.lineJoin) ? veilContext.lineJoin : this.STROKE_JOIN;
				curContext.strokeRect(veilLeft, veilTop, veilWidth, veilHeight);
			}
		} else { // div reveal
			this.removeVeilElement(); // remove all old div layers
			var veilParent = this.getDefaultVeilParentElement();
			var docWidth = Downsha.Utils.getDocumentWidth(this.window.document);
			var docHeight = Downsha.Utils.getDocumentHeight(this.window.document);
			
			if (veilRect.left > 0) { // left-center
				this.veilLeft = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilLeft.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilLeft.style.borderRight = this.STROKE_BORDER;
				this.veilLeft.style.left = 0;
				this.veilLeft.style.top = veilRect.top;
				this.veilLeft.style.width = veilRect.left;
				this.veilLeft.style.height = veilRect.bottom - veilRect.top;
				veilParent.appendChild(this.veilLeft);
			}			
			if (veilRect.top > 0) { // top-center
				this.veilTop = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilTop.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilTop.style.borderBottom = this.STROKE_BORDER;
				this.veilTop.style.left = veilRect.left;
				this.veilTop.style.top = 0;
				this.veilTop.style.width = veilRect.right - veilRect.left;
				this.veilTop.style.height = veilRect.top;
				veilParent.appendChild(this.veilTop);
			}
			if (veilRect.right < docWidth) { // right-center
				this.veilRight = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilRight.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilRight.style.borderLeft = this.STROKE_BORDER;
				if (Downsha.Platform.isQuirksMode(this.window.document)) {
					this.veilRight.style.left = veilRect.right;
				} else {
					this.veilRight.style.left = veilRect.right - this.STROKE_WIDTH;
				}
				this.veilRight.style.top = veilRect.top;
				this.veilRight.style.width = docWidth - veilRect.right;
				this.veilRight.style.height = veilRect.bottom - veilRect.top;
				veilParent.appendChild(this.veilRight);
			}
			if (veilRect.bottom < docHeight) { // bottom-center
				this.veilBottom = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilBottom.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilBottom.style.borderTop = this.STROKE_BORDER;
				this.veilBottom.style.left = veilRect.left;
				if (Downsha.Platform.isQuirksMode(this.window.document)) {
					this.veilBottom.style.top = veilRect.bottom;
				} else {
					this.veilBottom.style.top = veilRect.bottom - this.STROKE_WIDTH;
				}
				this.veilBottom.style.width = veilRect.right - veilRect.left;
				this.veilBottom.style.height = docHeight - veilRect.bottom;
				veilParent.appendChild(this.veilBottom);
			}
			if (veilRect.left > 0 && veilRect.top > 0) { // top-left
				this.veilTopLeft = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilTopLeft.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilTopLeft.style.left = 0;
				this.veilTopLeft.style.top = 0;
				this.veilTopLeft.style.width = veilRect.left;
				this.veilTopLeft.style.height = veilRect.top;
				veilParent.appendChild(this.veilTopLeft);
			}
			if (veilRect.right < docWidth && veilRect.top > 0) { // top-right
				this.veilTopRight = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilTopRight.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilTopRight.style.left = veilRect.right;
				this.veilTopRight.style.top = 0;
				this.veilTopRight.style.width = docWidth - veilRect.right;
				this.veilTopRight.style.height = veilRect.top;
				veilParent.appendChild(this.veilTopRight);
			}
			if (veilRect.left > 0 && veilRect.bottom < docHeight) { // bottom-left
				this.veilBottomLeft = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilBottomLeft.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilBottomLeft.style.left = 0;
				this.veilBottomLeft.style.top = veilRect.bottom;
				this.veilBottomLeft.style.width = veilRect.left;
				this.veilBottomLeft.style.height = docHeight - veilRect.bottom;
				veilParent.appendChild(this.veilBottomLeft);
			}
			if (veilRect.right < docWidth && veilRect.bottom < docHeight) { // bottom-right
				this.veilBottomRight = this.window.document.createElement("DIV");
				for (var i in this.VEIL_DIV_ELEMENT_STYLE) {
					this.veilBottomRight.style[i] = this.VEIL_DIV_ELEMENT_STYLE[i];
				}
				this.veilBottomRight.style.left = veilRect.right;
				this.veilBottomRight.style.top = veilRect.bottom;
				this.veilBottomRight.style.width = docWidth - veilRect.right;
				this.veilBottomRight.style.height = docHeight - veilRect.bottom;
				veilParent.appendChild(this.veilBottomRight);
			}
		}
	};
	Downsha.ContentVeil.prototype.clearRect = function(veilRect) { // reset rect to alpha 0.8
		if (this.supportCanvas) {
			var curContext = this.getVeilContext();
			var veilLeft = veilRect.left;
			var veilTop = veilRect.top;
			var veilWidth = veilRect.right - veilRect.left;
			var veilHeight = veilRect.bottom - veilRect.top;
			curContext.clearRect(veilLeft, veilTop, veilWidth, veilHeight);
			curContext.fillStyle = this.FILL_STYLE;
			curContext.fillRect(veilLeft, veilTop, veilWidth, veilHeight);
		} else {
		}
	};
	Downsha.ContentVeil.prototype.resetVeil = function() { // reset veil to alpha 0.8
		if (this.supportCanvas) {
			var curContext = this.getVeilContext();
			curContext.clearRect(0, 0, Downsha.Utils.getDocumentWidth(this.window.document), Downsha.Utils.getDocumentHeight(this.window.document));
			curContext.fillStyle = this.FILL_STYLE;
			curContext.lineWidth = 0;
			curContext.moveTo(0, 0);
			curContext.beginPath();
			curContext.lineTo(Downsha.Utils.getDocumentWidth(this.window.document), 0);
			curContext.lineTo(Downsha.Utils.getDocumentWidth(this.window.document), Downsha.Utils.getDocumentHeight(this.window.document));
			curContext.lineTo(0, Downsha.Utils.getDocumentHeight(this.window.document));
			curContext.lineTo(0, 0);
			curContext.closePath();
			curContext.fill();
		} else {
		}
	};
	Downsha.ContentVeil.prototype.hideEmbeds = function(doc, deep) {
		var embeds = Downsha.Utils.findEmbeds(doc);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.hideEmbeds find " + embeds.length + " <object> and <embed> nodes");
			var view = (doc.defaultView) ? doc.defaultView : this.window;
			for (var i = 0; i < embeds.length; i++) {
				var embed = embeds[i];
				if (embed) {
					if (view && (typeof view.getComputedStyle != "undefined")) { // getComputedStyle works for IE9 standard mode
						var style = view.getComputedStyle(embed, "");
						var display = style.getPropertyValue("display");
						var visibility = style.getPropertyValue("visibility");
					} else { // currentStyle works for IE 5.5 - IE 9
						var display = embed.currentStyle.display;
						var visibility = embed.currentStyle.visibility;
					}
					var show = (display == "none" || visibility == "hidden") ? false : true;
					if (!show) { // ignore if it is already hidden
						continue;
					}
					embed._downshaEmbedMarker = true; // add marker attribute to <object> or <embed> node
					embed.style.visibility = "hidden"; // hide embed and keep the space
				}
			}
		}
		if (deep) {
			var documents = Downsha.Utils.findDocuments(doc);
			if (documents && documents.length > 0) {
				LOG.debug("ContentVeil.hideEmbeds find " + documents.length + " <frame> and <iframe> nodes");
				for (var i = 0; i < documents.length; i++) {
					if (documents[i]) {
						this.hideEmbeds(documents[i], deep);
					}
				}
			}
		}		
	};
	Downsha.ContentVeil.prototype.unhideEmbeds = function(doc, deep) {
		var embeds = Downsha.Utils.findEmbeds(doc);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.unhideEmbeds find " + embeds.length + " <object> and <embed> nodes");
			for (var i = 0; i < embeds.length; i++) {
				var embed = embeds[i];
				if (embed && embed._downshaEmbedMarker) {
					embed.style.visibility = "visible"; // show embed again
				}
			}
		}
		if (deep) {
			var documents = Downsha.Utils.findDocuments(doc);
			if (documents && documents.length > 0) {
				LOG.debug("ContentVeil.unhideEmbeds find " + documents.length + " <frame> and <iframe> nodes");
				for (var i = 0; i < documents.length; i++) {
					if (documents[i]) {
						this.unhideEmbeds(documents[i], deep);
					}
				}
			}
		}
	};
	Downsha.ContentVeil.prototype.clearEmbeds = function(doc, deep) {
		var embeds = Downsha.Utils.findEmbeds(doc);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.clearEmbeds find " + embeds.length + " <object> and <embed> nodes");
			for (var i = 0; i < embeds.length; i++) {
				var embed = embeds[i];
				if (embed && embed._downshaEmbedMarker) {
					embed.style.visibility = "visible"; // show embed again
					embed.removeAttribute("_downshaEmbedMarker");
				}
			}
		}
		if (deep) {
			var documents = Downsha.Utils.findDocuments(doc);
			if (documents && documents.length > 0) {
				LOG.debug("ContentVeil.clearEmbeds find " + documents.length + " <frame> and <iframe> nodes");
				for (var i = 0; i < documents.length; i++) {
					if (documents[i]) {
						this.clearEmbeds(documents[i], deep);
					}
				}
			}
		}
	};
})();
/**
 * @author: chenmin
 * @date: 2011-10-19
 * @desc: encapsulate the call of content scripting for injecting css files.
 */

(function() {
	Downsha.AbstractStyleScript = function(win) {
		this.initialize(win);
	};
	
	Downsha.AbstractStyleScript.prototype.window = null;
	Downsha.AbstractStyleScript.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		var styles = this.getInitialStyleSheetUrls();
		if(styles && styles.length > 0) {
			this.injectStyleSheets(styles);
		}
	};
	Downsha.AbstractStyleScript.prototype.getInitialStyleSheetUrls = function() {
		return [];
	};
	Downsha.AbstractStyleScript.prototype.injectStyleSheets = function(styles) {
		var documentHead = Downsha.Utils.getDocumentHead(this.window.document);
		for (var i = 0; i < styles.length; i++) {
			var styleObject = styles[i];
			if (!styleObject) {
				continue; // ignore if object is invalid
			}
			if (styleObject.id && this.window.document.getElementById(styleObject.id)) {
				continue; // ignore if already exists
			}
			
			if (styleObject.file) { // injecting css file, including url
				var styleNode = this.window.document.createElement("link");
				if (styleObject.id) {
					styleNode.id = styleObject.id;
				}
				styleNode.rel = "stylesheet";
				styleNode.type = "text/css";
				styleNode.href = styleObject.file;
				if (documentHead) {
					styleNode = documentHead.appendChild(styleNode);
					LOG.debug("AbstractStyleScript.injectStyleSheets node: " + styleNode);
				}
			} else if (styleObject.code) { // injecting css code
	      var styleNode = this.window.document.createElement("style");
				if (styleObject.id) {
					styleNode.id = styleObject.id;
				}
				styleNode.type = "text/css";
				if (typeof this.window.document.styleSheets != "undefined") {
					if (documentHead) {
						styleNode = documentHead.appendChild(styleNode);
						/**
						 * IE 6/7 doesn't always put style node at the tail of styleSheets.
						 */
						//var styleSheet = this.window.document.styleSheets[this.window.document.styleSheets.length - 1];
						//styleSheet.cssText = styleObject.code;
						for (var j =0; j < this.window.document.styleSheets.length; j++) {
							var styleSheet = this.window.document.styleSheets[j];
							if (styleSheet.id == styleObject.id) {
								styleSheet.cssText = styleObject.code;
								break;
							}
						}
						LOG.debug("AbstractStyleScript.injectStyleSheets node: " + styleNode);
					}
				} else {
		      /**
		       * appendChild throws exception in IE 6/7/8, "unexpected call to method or property access".
		       * following code only works in Chrome/Firefox/IE 9.
		       */
	      	var textNode = this.window.document.createTextNode(styleObject.code);
		      styleNode.appendChild(textNode);
					if (documentHead) {
						styleNode = documentHead.appendChild(styleNode);
						LOG.debug("AbstractStyleScript.injectStyleSheets node: " + styleNode);
					}
				}
			}
		}
	};
})();
/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: profile web page document (page/selection/article)
 */

(function() {
	Downsha.PageInfoScript = function PageInfoScript(win) {
		this.initialize(win);
	};
	Downsha.inherit(Downsha.PageInfoScript, Downsha.AbstractStyleScript);

	Downsha.PageInfoScript.prototype.window = null;
	Downsha.PageInfoScript.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		Downsha.PageInfoScript.parent.initialize.apply(this, [win]);
	};
	Downsha.PageInfoScript.prototype.profile = function() {
		LOG.debug("PageInfoScript.profile");
		this.profilePage();
		this.profileSelection();
		this.profileArticle();
		LOG.debug(this.toString());
	};
	Downsha.PageInfoScript.prototype.profilePage = function() {
		LOG.debug("PageInfoScript.profilePage");
		this.documentWidth = Downsha.Utils.getDocumentWidth(this.window.document);
		this.documentHeight = Downsha.Utils.getDocumentHeight(this.window.document);
		
		this.documentLength = 0;
		try {
			this.documentLength = this.window.document.body.innerText.length; // use document.body.innerText, NOT textContent
		} catch(e) {
			LOG.warn("Could not determine document's text length");
		}
		this.containsImages = false;
		try {
			var imageTags = this.window.document.getElementsByTagName("IMG"); // determine whether there is image in document
			if (imageTags && imageTags.length > 0) {
				this.containsImages = true;
			}
		} catch(e) {
			LOG.warn("Could not determine whether document contains images");
		}
	};
	Downsha.PageInfoScript.prototype.profileSelection = function() {
		LOG.debug("PageInfoScript.profileSelection");
		try {
			var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
			selectionFinder.find(true); // only check one time at initial state
			this.selection = (selectionFinder.hasSelection()) ? true : false; // determine whether there is selection in document
		} catch(e) {
			LOG.warn("Could not determine whether document contains selection");
			this.selection = false;
		}
	};
	Downsha.PageInfoScript.prototype.profileArticle = function() {
		LOG.debug("PageInfoScript.profileArticle");
		try {
			var extractor = new ExtractContentJS.LayeredExtractor();
			extractor.addHandler(extractor.factory.getHandler("Heuristics"));
			var extractRes = extractor.extract(this.window.document);
			if (extractRes.isSuccess) {
				this.article = extractRes.content.asText(); // get content text of article
				this.articleNode = extractRes.content.asNode();
				if (this.articleNode) {
					var articleBoundingClientRect = Downsha.Utils.getAbsoluteBoundingClientRect(this.articleNode, this.window);
					if (articleBoundingClientRect) {
						this.articleBoundingClientRect = articleBoundingClientRect; // get bounding rectangle of article
					}
				}
			}
		} catch(e) {
			LOG.warn("Could not determine whether document contains article");
		}
	};
	Downsha.PageInfoScript.prototype.toJSON = function() {
		return {
			documentWidth : this.documentWidth,
			documentHeight : this.documentHeight,
			documentLength : this.documentLength,
			containsImages : this.containsImages,
			selection : this.selection,
			article : this.article,
			articleBoundingClientRect : this.articleBoundingClientRect
		};
	};
	Downsha.PageInfoScript.prototype.toString = function() {
	  return "PageInfoScript [document] " + this.documentWidth + "*" + this.documentHeight + 
	  	" length: " + this.documentLength + " contain image: " + this.containsImages + 
	  	" [selection] " + (this.selection ? "yes" : "no") + 
	  	" [article] " + (this.articleBoundingClientRect ? this.articleBoundingClientRect.width + "*" + this.articleBoundingClientRect.height : "no");
	};
})();
/**
 * @author: chenmin
 * @date: 2011-10-19
 * @desc: content preview script for FullPage/Selection/Article/URL
 * inject css files and create wrap node for highlighted fragments.
 */

(function() {
	Downsha.ContentPreviewScript = function ContentPreviewScript(win, supportCanvas) {
		this.initialize(win, supportCanvas);
	};
	Downsha.inherit(Downsha.ContentPreviewScript, Downsha.AbstractStyleScript);

	Downsha.ContentPreviewScript.prototype.window = null;
	Downsha.ContentPreviewScript.prototype.supportCanvas = null;
	Downsha.ContentPreviewScript.prototype.contentVeil = null; // ContentVeil object
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_ID = "downshaPreviewContainer";
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_CLASS = "downshaPreviewContainer";
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_URL_CLASS = "downshaPreviewUrlContainer";
	Downsha.ContentPreviewScript.prototype.PREVIEW_ARTICLE_CLASS = "downshaPreviewArticleContainer"; // class name to remember article node for IE 9
	Downsha.ContentPreviewScript.prototype.TEXT_NODE_WRAP_TAG = "SPAN";
	Downsha.ContentPreviewScript.prototype.TEXT_NODE_WRAP_STYLE = "display: inline; position: relative; padding: 0px; margin: 0px; float: none; visibility: visible; float: none;";
	Downsha.ContentPreviewScript.prototype.SELECTION_CTX_ATTRS = { // float layer for selection preview
		fillStyle : "rgba(255, 255, 0, 0.3)" // fill color: yellow, alpha: 0.3
	};
	Downsha.ContentPreviewScript.prototype.PREVIEW_CTX_ATTRS = { // float layer for article preview
		fillStyle : "rgba(255, 255, 255, 0)", // fill color: white, alpha: 0
		strokeStyle : "rgba(255, 255, 0, 0.3)" // stroke color: yellow, alpha: 0.3
	};
	
	Downsha.ContentPreviewScript.prototype.LEGEND_ID = "downshaPreviewLegend";
	Downsha.ContentPreviewScript.prototype._children = null; // _children and _parents store child-parent node pairs for nudge preview
	Downsha.ContentPreviewScript.prototype._parents = null; // each pair are stored at the same index of two arrays
	Downsha.ContentPreviewScript.prototype.articleNode = null; // remember article node for IE 6/7/8
	Downsha.ContentPreviewScript.prototype.initialStyleSheetUrls = [{
		id : "downshaPreviewerCSSCode",
		code : "/* css code for downsha previewer */" + 
			".downshaPreviewContainer {" + 
			((Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) ? 
			"  position: absolute;" : // for IE 6 and quirks mode, cuz IE 6 and quirks mode doesn't recognize fixed
			"	 position: fixed;") + // for IE 7/8/9+, fixed position relative to screen
			((Downsha.Platform.getIEVersion() <= 9) ? 
			"	 z-index: 2147483646;" : // for IE 6/7/8, cuz the max z-index value is 2147483647
			"	 z-index: 9999999999999998;") + // for IE 9+ 
			"	 padding: 10px;" + 
			"  font-family: Simsun, Arial Narrow, HELVETICA;" + // general font
			"	 font-size: 18px;" + 
			"	 font-weight: normal;" + 
			"	 color: #696969;" + 
			"}" + 
			".downshaPreviewUrlContainer {" + 
			"	 padding: 20px;" + 
			"	 top: 50%;" + 
			"	 left: 50%;" + 
			"	 max-width: 50%;" + 
			"	 white-space: nowrap;" + 
			"	 overflow: hidden;" + 
			"	 text-overflow: ellipsis;" + 
			"	 overflow: hidden;" + 
			"	 color: #7ebe40;" + 
			"	 border-radius: 4px;" + // round corner for IE 9+
			"	 padding: 8px;" + 
			"	 background: white;" + 
			"}" + 
			".downshaPreviewUrlContainer a," + 
			".downshaPreviewUrlContainer a:active," + 
			".downshaPreviewUrlContainer a:hover," + 
			".downshaPreviewUrlContainer a:visited {" + 
			"	 color: #7ebe40;" + 
			"	 text-decoration: none;" + 
			"	 white-space: nowrap;" + 
			"	 overflow: hidden;" + 
			"	 text-overflow: ellipsis;" + 
			"}" + 
			".downshaPreviewUrlContainer span {" + 
			"	 display: inline;" + 
			"}" + 
			"#downshaPreviewLegend {" + 
			((Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) ? 
			"  position: absolute;" : // for IE 6 and quirks mode, cuz IE 6 and quirks mode doesn't recognize fixed
			"	 position: fixed;") + // for IE 7/8/9+, fixed position relative to screen
			((Downsha.Platform.getIEVersion() <= 9) ? 
			"	 z-index: 2147483647;" : 
			"	 z-index: 9999999999999999;") + 
			((Downsha.Platform.getIEVersion() <= 8) ? 
			"	 filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000,endColorstr=#99000000);" : // for IE 6/7/8, cuz it doesn't support rgba attribute
			"	 background: rgba(0,0,0,0.6);") + // for IE 9+
			"	 padding: 12px;" + 
			"	 left: 10px;" + 
			"	 top: 10px;" + 
			"	 height: 135px;" + 
			"	 color: white;" + 
			"	 font-family: Helvetica,Arial,sans-serif!important;" + 
			"	 font-size: 12px!important;" + 
			"	 text-decoration: none!important;" + 
			"	 text-align: left;" + 
			"	 margin: 0;" + 
			"	 border-radius: 4px;" + 
			"	 box-sizing: border-box;" + 
			"}" + 
			"#downshaPreviewLegend ul {" + 
			"	 display: block!important;" + 
			"	 margin: 0!important;" + 
			"	 padding: 0!important;" + 
			"	 list-style: none!important;" + 
			"}" + 
			"#downshaPreviewLegend ul li {" + 
			"	 margin: 0 0 5px 0!important;" + 
			"}" + 
			"#downshaPreviewLegend ul li: last-of-type {" + 
			"	 margin-top: 10px!important;" + 
			"}" + 
			"#downshaPreviewLegend .keyIcon {" + 
			"	 display: inline-block!important;" + 
			"	 text-align: right!important;" + 
			"	 vertical-align: middle!important;" + 
			"	 width: 49px!important;" + 
			"	 height: 22px!important;" + 
			"	 padding: 0!important;" + 
			"	 border: none!important;" + 
			"	 margin-right: 6px!important;" + 
			"}" + 
			"#downshaPreviewLegend .keyIcon img {" + 
			"	 display: inline-block!important;" + 
			"	 margin: 0!important;" + 
			"	 padding: 0!important;" + 
			"	 float: none!important;" + 
			"}"
	}];
	Downsha.ContentPreviewScript.prototype.initialize = function(win, supportCanvas) {
		LOG.debug("ContentPreviewScript.initialize");
		this.window = (win) ? win : window;
		this.supportCanvas = supportCanvas;
		Downsha.ContentPreviewScript.parent.initialize.apply(this, [win]);
		
		this._children = [];
		this._parents = [];
		this.getContentVeil();
	};
	Downsha.ContentPreviewScript.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	Downsha.ContentPreviewScript.prototype.previewFullPage = function() { // just clear all to preview full page
		LOG.debug("ContentPreviewScript.previewFullPage");
		this.clear();
	};
	Downsha.ContentPreviewScript.prototype.previewSelection = function() {
		LOG.debug("ContentPreviewScript.previewSelection");
		this.clear();
		var selectionRange = null;
		var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
		if (selectionFinder.hasSelection()) {
			selectionRange = selectionFinder.getRange();
		}
		
		if (!selectionRange) { // preview full page if no selection found
			LOG.debug("Could not find selection");
			this.previewFullPage();
			return;
		}
		
		if (this.supportCanvas) { // only outline selection rectangles when browser support canvas
			this.contentVeil.resetVeil();
			var selectionRects = selectionRange.getClientRects();
			LOG.debug("ContentPreviewScript.previewSelection find " + selectionRects.length + " client rectangles");
			for (var i = 0; i < selectionRects.length; i++) {
				var selectionRect = Downsha.Utils.makeAbsoluteClientRect(selectionRects[i], this.window);
				this.outlineRect(selectionRect, false, this.SELECTION_CTX_ATTRS);
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.previewArticle = function(showHelp) {
		LOG.debug("ContentPreviewScript.previewArticle");
		this.clear();
		
		this.contentVeil.resetVeil();
		var rememberedPreview = this.getRememberedPreview();
		if (rememberedPreview) { // if already remember the preview node, then outline it now.
			this.outlinePreviewElement(rememberedPreview, true);
		} else {
			var extractor = new ExtractContentJS.LayeredExtractor();
			extractor.addHandler(extractor.factory.getHandler("Heuristics"));
			var extractRes = extractor.extract(this.window.document);
			if (extractRes.isSuccess) {
				var articleNode = extractRes.content.asNode();
				LOG.debug("extract article node: " + articleNode);
				articleNode = Downsha.Utils.getElementForNode(articleNode);
				LOG.debug("extract article element: " + articleNode);
				this.rememberPreview(articleNode); // remember the preview node now
				this.outlinePreviewElement(articleNode, true);
			}
		}
		if (showHelp) { // show nudge help if needed
			this.showPreviewLegend();
		}
	};
	Downsha.ContentPreviewScript.prototype.previewUrl = function(title, url, favIconUrl) {
		LOG.debug("ContentPreviewScript.previewUrl");
		this.clear();
		
		if (this.supportCanvas) { // only show url rectangles when browser support canvas
			this.contentVeil.resetVeil();
			this.contentVeil.show();
			
			var urlClipContent = Downsha.Utils.createUrlClipContent(title, url, favIconUrl);
			LOG.debug("ContentPreviewScript.previewUrl content:\n" + urlClipContent);
			var contentElement = this.createContentElement(urlClipContent);
			LOG.debug("content element: " + contentElement);
			this.showContentElement();
			
			if (typeof this.window.getComputedStyle != "undefined") { // getComputedStyle works for IE9 standard mode
				var computedStyle = this.window.getComputedStyle(contentElement, "");
				var nodeWidth = parseInt(computedStyle.getPropertyValue("width"));
				var nodeHeight = parseInt(computedStyle.getPropertyValue("height"));
			} else { // currentStyle works for IE 5.5 - IE 9
				var nodeWidth = contentElement.currentStyle.width;
				var nodeHeight = contentElement.currentStyle.height;
			}
			LOG.debug("ContentPreviewScript.previewUrl width: " + nodeWidth + ", height: " + nodeHeight);
			if (nodeWidth && nodeHeight) { // display in the center of screen
				contentElement.style.marginLeft = (0 - nodeWidth / 2) + "px";
				contentElement.style.marginTop = (0 - nodeHeight / 2) + "px";
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.showPreviewLegend = function() {
		LOG.debug("ContentPreviewScript.showPreviewLegend");
		var previewLegend = this.window.document.getElementById(this.LEGEND_ID);
		if (!previewLegend) {
			previewLegend = this.window.document.createElement("DIV");
			previewLegend.id = this.LEGEND_ID;
			/**
			 * data uri schema is NOT supported in IE 6/7, and IE 8 has 32 KB limit.
			 */
			var innerHTML = "<ul>";
			innerHTML += "<li onclick='Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_PARENT);'><div class='keyIcon'>";
			if (Downsha.Platform.getIEVersion() <= 7) {
				innerHTML += "<img src='" + Downsha.Constants.SERVICE_PATH + "nudge-icon-arrow-up.png' />";
			} else {
				innerHTML += "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKtJREFUeNpi+P//PwMdsT0Qn/xPPQAyy56Bzp54DsThVDQPZNZzRhCHjgBkGSO1zWRiGAZg1BOjnhgBnmgH4hZiFQ/G0skAiM9A2SZAfGGolU7MQDwZSsPYQy45pQGxDRIfxE4YSslJCIhvQ2lk8A6IVaH0oE9OpVg8APNc5lDL2KPNjlFPjHpi1BOjniALPAViPyqaBzLrKb3rCQ8gng/EElQy7wUQJwIEGADuMmCcXTqyJwAAAABJRU5ErkJggg==' />";
			}
			innerHTML += "</div> " + Downsha.i18n.getMessage("contentpreview_expand") + "</li>";
			innerHTML += "<li onclick='Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_CHILD);'><div class='keyIcon'>";
			if (Downsha.Platform.getIEVersion() <= 7) {
				innerHTML += "<img src='" + Downsha.Constants.SERVICE_PATH + "nudge-icon-arrow-down.png' />";
			} else {
				innerHTML += "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALNJREFUeNpi+P//PwMdsT0Qn/xPPQAyy56Bzp54DsThVDQPZNZzRhCHjgBkGSO1zRz1xKgnRj0x6onB6QkmhsEDKqCexIZz8GkcTDEhBMS3oTQyeAfEqlAau5l0rrH/E5DPxNK0SCBk5mDLE8xAfBiILaH8I0BsOxQztgEQn4GyTYD4wlAtnbqgdNloPTHqiVFPjDY76AKeArEfFc0DmfWU3jHhAcTzgViCSua9AOJEgAADABNzOwGsw0oOAAAAAElFTkSuQmCC' />";
			}
			innerHTML += "</div> " + Downsha.i18n.getMessage("contentpreview_shrink") + "</li>";
			/*
			innerHTML += "<li><div class='keyIcon'>";
			if (Downsha.Platform.getIEVersion() <= 7) {
				innerHTML += "<img src='" + Downsha.Constants.SERVICE_PATH + "nudge-icon-arrow-lr.png' />";
			} else {
				innerHTML += "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAPNJREFUeNrslkEKgzAQRUdzgIDH6CW67cqt0FXv0ZXQgwmuPEjJygN0NZ3QEWyJbdLOKJR8eBuN//tJTARE3BMDymlgTwigkuWNHdEshH5Dw56heypZha8DAAXIaslTJSuXyCVyiWfPMvEBS5wJAzoy7G/TajwUs50deYv0sh/GYuL1CctjHOfFvFeU8Y7oXg4Z7RKTOs7/qURL3AIn5VolkPPbd1ll5DrdUkbim/DT2W80E73EcppzIsaVSoycJ/Zhz6mIC2GUShj2rxLeKZ/YuUQu8a8/gFeiFjSt2TMknSyaiMPsx05Cjj1D26FK1l2AAQC1uATmecOFqAAAAABJRU5ErkJggg==' />";
			}
			innerHTML += "</div> " + Downsha.i18n.getMessage("contentpreview_move") + "</li>";
			*/
			innerHTML += "<li><div class='keyIcon'>";
			if (Downsha.Platform.getIEVersion() <= 7) {
				innerHTML += "<img src='" + Downsha.Constants.SERVICE_PATH + "nudge-icon-return.png' />";
			} else {
				innerHTML += "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAWCAYAAABpNXSSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALVJREFUeNpi+P//PwMdsT0Qn/xPPQAyy56Bzp54DsThVDQPZNZzRhCHjgBkGSO1zRz1xKgnRj0x6okB88ReKO08FDzhDcQtQGyIRR8DDr2DxhNyQDwBiANxOHbQe6IIiBuBmIcI/Vg9wcQw8IAfiNmIUNeK02eDJDmpA/E0IHbCE+JDpnQKB+I6INYerSdGPTHqiRHuCXrXE0+B2I+K5oHMekrvmPAA4vlALEEl814AcSJAgAEAPE6ge5QswsUAAAAASUVORK5CYII=' />";
			}
			innerHTML += "</div> " + Downsha.i18n.getMessage("contentpreview_clip") + "</li>";
			innerHTML += "</ul>";
			
			previewLegend.innerHTML = innerHTML;
			this.window.document.body.appendChild(previewLegend);
		}
	};
	Downsha.ContentPreviewScript.prototype.removePreviewLegend = function() {
		LOG.debug("ContentPreviewScript.removePreviewLegend");
		var previewLegend = this.window.document.getElementById(this.LEGEND_ID);
		if (previewLegend && previewLegend.parentNode) {
			previewLegend.parentNode.removeChild(previewLegend);
		}
	};
	Downsha.ContentPreviewScript.prototype.getPreviousElementSibling = function(curNode) {
		LOG.debug("ContentPreviewScript.getPreviousElementSibling");
		/**
		 * IE doesn't support previousElementSibling/nextElementSibling until version 9.
		 * You'll need to use the standard previousSibling instead and 
		 * if you have possible text nodes between your elements 
		 * you'll need to loop over it to find the next element.
		 
		 * The previous sibling node and the previous sibling element can be different. 
		 * A node is an element node if it's nodeType is 1 (Node.ELEMENT_NODE). 
		 * Text nodes and comment nodes are not element nodes. 
		 * If you need the previous sibling node of an element, use the previousSibling property.
		 */
		var node = (curNode && curNode.previousElementSibling) ? (curNode.previousElementSibling) : (curNode.previousSibling);
		while (node) { // get nearest sibling which has texts or images
			var nodeRect = ((node.nodeType == Node.ELEMENT_NODE) && // element node
				(node.innerText.trim().length > 0 || // has texts
				node.getElementsByTagName("IMG").length > 0)) ? // has images
				node.getBoundingClientRect() : null;
			var nodeArea = 0;
			if (nodeRect) {
				if (typeof nodeRect.width != "undefined" && 
					typeof nodeRect.height != "undefined") {
					nodeArea = nodeRect.width * nodeRect.height;
				} else {
					nodeArea = (nodeRect.right - nodeRect.left) * (nodeRect.bottom - nodeRect.top);
				}
			}
			if (nodeArea > 0) {
				return node;
			} else {
				node = (node && node.previousElementSibling) ? (node.previousElementSibling) : (node.previousSibling);
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.getNextElementSibling = function(curNode) {
		LOG.debug("ContentPreviewScript.getNextElementSibling");
		var node = (curNode && curNode.nextElementSibling) ? (curNode.nextElementSibling) : (curNode.nextSibling);
		while (node) { // get nearest sibling which has texts or images
			var nodeRect = ((node.nodeType == Node.ELEMENT_NODE) && // element node
				(node.innerText.trim().length > 0 || // has texts
				node.getElementsByTagName("IMG").length > 0)) ? // has images
				node.getBoundingClientRect() : null;
			var nodeArea = 0;
			if (nodeRect) {
				if (typeof nodeRect.width != "undefined" && 
					typeof nodeRect.height != "undefined") {
					nodeArea = nodeRect.width * nodeRect.height;
				} else {
					nodeArea = (nodeRect.right - nodeRect.left) * (nodeRect.bottom - nodeRect.top);
				}
			}
			if (nodeArea > 0) {
				return node;
			} else {
				node = (node && node.nextElementSibling) ? (node.nextElementSibling) : (node.nextSibling);
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.getParentElement = function(curNode) {
		LOG.debug("ContentPreviewScript.getParentElement");
		var curNodeRect = (curNode) ? curNode.getBoundingClientRect() : null;
		var curNodeArea = 0;
		if (curNodeRect) {
			if (typeof curNodeRect.width != "undefined" && 
				typeof curNodeRect.height != "undefined") {
				curNodeArea = curNodeRect.width * curNodeRect.height;
			} else {
				curNodeArea = (curNodeRect.right - curNodeRect.left) * (curNodeRect.bottom - curNodeRect.top);
			}
		}
		/**
		 * parentElement is defined in IE and Chrome only, NOT defined in Firefox
		 * parentNode is for all browsers, including IE. 
		 * developers should use parentNode to make cross-browser code.
		 */
		var node = (curNode && curNode.parentElement) ? (curNode.parentElement) : (curNode.parentNode);
		while (node) { // get nearest parent which is larger than current node
			var nodeRect = ((node.nodeType == Node.ELEMENT_NODE) && // element node
				(node.innerText.trim().length > 0 || // has texts
				node.getElementsByTagName("IMG").length > 0)) ? // has images
				node.getBoundingClientRect() : null;
			var nodeArea = 0;
			if (nodeRect) {
				if (typeof nodeRect.width != "undefined" && 
					typeof nodeRect.height != "undefined") {
					nodeArea = nodeRect.width * nodeRect.height;
				} else {
					nodeArea = (nodeRect.right - nodeRect.left) * (nodeRect.bottom - nodeRect.top);
				}
			}
			if ((nodeArea > 0) && (nodeArea > curNodeArea)) {
				// store pair of child-parent in case we use next time
				var parentIndex = this._parents.indexOf(node);
				if (parentIndex >= 0) { // remove if already exists
					this._parents.splice(parentIndex, 1);
					this._children.splice(parentIndex, 1);
				}
				var childIndex = this._children.push(curNode); // store child node and return inserted index
				this._parents[childIndex - 1] = node; // store parent node at the same index
				return node;
			} else {
				node = (node && node.parentElement) ? (node.parentElement) : (node.parentNode);
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.getChildElement = function(curNode) {
		LOG.debug("ContentPreviewScript.getChildElement");
		var parentIndex = this._parents.indexOf(curNode); // check the parents-children array first
		if (parentIndex >= 0) {
			return this._children[parentIndex];
		}
		
		var curNodeRect = (curNode) ? curNode.getBoundingClientRect() : null;
		var curNodeArea = 0;
		if (curNodeRect) {
			if (typeof curNodeRect.width != "undefined" && 
				typeof curNodeRect.height != "undefined") {
				curNodeArea = curNodeRect.width * curNodeRect.height;
			} else {
				curNodeArea = (curNodeRect.right - curNodeRect.left) * (curNodeRect.bottom - curNodeRect.top);
			}
		}
		
		/**
		 * Where childNodes holds all child nodes, children only holds those that are element nodes (HTML tags).
		 * IE up to 8 incorrectly counts comment nodes, too.
		 */
		if (curNode.children.length > 0) { // get nearest child which has texts or images and is smaller than current node
			for (var i = 0; i < curNode.children.length; i++) {
				var node = curNode.children[i];
				var nodeRect = ((node.nodeType == Node.ELEMENT_NODE) && // element node
					(node.innerText.trim().length > 0 || // has texts
					node.getElementsByTagName("IMG").length > 0)) ? // has images
					node.getBoundingClientRect() : null;
				var nodeArea = 0;
				if (nodeRect) {
					if (typeof nodeRect.width != "undefined" && 
						typeof nodeRect.height != "undefined") {
						nodeArea = nodeRect.width * nodeRect.height;
					} else {
						nodeArea = (nodeRect.right - nodeRect.left) * (nodeRect.bottom - nodeRect.top);
					}
				}
				if ((nodeArea > 0) && (nodeArea < curNodeArea)) {
					return node;
				}
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.previewNudge = function(direction) {
		LOG.debug("ContentPreviewScript.previewNudge direction: " + direction);
		var oldPreview = this.getRememberedPreview();
		if (!oldPreview) {
			return; // Doesn't look like there's a preview at the moment
		}
		var newPreview = null;
		if (direction == Downsha.Constants.PREVIEW_NUDGE_PREVIOUS_SIBLING) {
			newPreview = this.getPreviousElementSibling(oldPreview);
		} else if (direction == Downsha.Constants.PREVIEW_NUDGE_NEXT_SIBLING) {
			newPreview = this.getNextElementSibling(oldPreview);
		} else if (direction == Downsha.Constants.PREVIEW_NUDGE_PARENT) {
			newPreview = this.getParentElement(oldPreview);
		} else if (direction == Downsha.Constants.PREVIEW_NUDGE_CHILD) {
			newPreview = this.getChildElement(oldPreview);
		}
		if (newPreview) {
			this.forgetPreview(oldPreview);
			this.contentVeil.resetVeil();
			this.outlinePreviewElement(newPreview, true); // outline new preview
			this.rememberPreview(newPreview);
		}
	};
	Downsha.ContentPreviewScript.prototype.rememberPreview = function(node) {
		this.forgetPreview();
		// IE doesn't support getElementsByClassName until version 9.
		if (typeof this.window.document.getElementsByClassName != "undefined") {
			Downsha.Utils.addElementClass(node, this.PREVIEW_ARTICLE_CLASS);
		} else {
			this.articleNode = node;
		}
	};
	Downsha.ContentPreviewScript.prototype.forgetPreview = function() {
		// IE doesn't support getElementsByClassName until version 9.
		if (typeof this.window.document.getElementsByClassName != "undefined") {
			var nodes = this.window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
			if (nodes && nodes.length > 0) {
				for (var i = 0; i < nodes.length; i++) {
					Downsha.Utils.removeElementClass(nodes[i], this.PREVIEW_ARTICLE_CLASS);
				}
			}
		} else {
			this.articleNode = null;
		}
	};
	Downsha.ContentPreviewScript.prototype.getRememberedPreview = function() {
		// IE doesn't support getElementsByClassName until version 9.
		if (typeof this.window.document.getElementsByClassName != "undefined") {
			var nodes = this.window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
			if (nodes && nodes.length > 0) {
				return nodes[0];
			}
		} else {
			return this.articleNode;
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.createContentElement = function(content) {
		LOG.debug("ContentPreviewScript.createContentElement");
		var contentNode = this.window.document.getElementById(this.PREVIEW_CONTENT_ID);
		if (!contentNode) {
			var contentNode = this.window.document.createElement("div");
			contentNode.id = this.PREVIEW_CONTENT_ID;
			contentNode.className = this.PREVIEW_CONTENT_CLASS + " " + this.PREVIEW_CONTENT_URL_CLASS;
			contentNode.style.display = "none";
			this.window.document.body.appendChild(contentNode);
		}
		contentNode.innerHTML = content;
		return contentNode;
	};
	Downsha.ContentPreviewScript.prototype.removeContentElement = function() {
		LOG.debug("ContentPreviewScript.removeContentElement");
		var contentNode = this.window.document.getElementById(this.PREVIEW_CONTENT_ID);
		if (contentNode && contentNode.parentNode) {
			contentNode.parentNode.removeChild(contentNode);
		}
	};
	Downsha.ContentPreviewScript.prototype.getContentElement = function() {
		var contentNode = this.window.document.getElementById(this.PREVIEW_CONTENT_ID);
		return contentNode;
	};
	Downsha.ContentPreviewScript.prototype.showContentElement = function() {
		LOG.debug("ContentPreviewScript.showContentElement");
		var contentNode = this.getContentElement();
		if (contentNode) {
			contentNode.style.display = "";
		}
	};
	Downsha.ContentPreviewScript.prototype.hideContentElement = function() {
		LOG.debug("ContentPreviewScript.hideContentElement");
		var contentNode = this.getContentElement();
		if (contentNode) {
			contentNode.style.display = "none";
		}
	};
	Downsha.ContentPreviewScript.prototype.clear = function() {
		LOG.debug("ContentPreviewScript.clear");
		if (this.contentVeil) { // remove content veil
			this.contentVeil.hide();
			this.contentVeil.clear();
		}
		this.removeContentElement(); // remove content node
		this.removePreviewLegend(); // remove preview legend
		
		// IE doesn't support querySelectorAll until version 8.
		if (typeof this.window.document.querySelectorAll != "undefined") {
			var nodes = this.window.document.querySelectorAll("*[class~=_downshaPreviewRect]"); // nodes whose classes has _downshaPreviewRect
			if (nodes) {
				for (var i = 0; i < nodes.length; i++) {
					nodes[i].removeAttribute("_downshaPreviewRect"); // remove custom attribute
					nodes[i].className = nodes[i].className.replace(/\s*\b_downshaPreviewRect\b/, ""); // remove specified class
				}
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.clearRect = function(rect) {
		LOG.debug("ContentPreviewScript.clearRect");
		if (this.contentVeil) {
			this.contentVeil.clearRect(rect);
		}
	};
	Downsha.ContentPreviewScript.prototype.outlinePreviewElement = function(previewNode, screenCenter) {
		LOG.debug("ContentPreviewScript.outlinePreviewElement");
		var previewRect = previewNode._downshaPreviewRect; // check if already remembered the rectangle
		if (!previewRect) { // compute the rectangle of preview node
			previewRect = Downsha.Utils.getAbsoluteBoundingClientRect(previewNode, this.window);
			LOG.debug("initial preview rect: (" + previewRect.left + "," + previewRect.top + ")*(" + previewRect.right + "," + previewRect.bottom + ")");
			
			// TODO IE8 incorrect getAbsoluteBoundingClientRect for a <CENTER> element
			// http://news.cnwest.com/content/2011-10/27/content_5431612.htm
			/*
			// The * argument, which ought to select all elements in the document, doesn't work in IE 5.5.
			// Gets all elements that are descendants of node previewNode.			
			var nodes = previewNode.getElementsByTagName("*");
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var nodeRect = node._downshaPreviewRect; // check if already remembered the rectangle
				if (!nodeRect) {
					nodeRect = Downsha.Utils.getAbsoluteBoundingClientRect(node, this.window);
					// IE doesn't support childElementCount until version 9.
					if ((typeof node.childElementCount != "undefined" && node.childElementCount == 0) || 
						(node.children.length == 0)) {
						node._downshaPreviewRect = nodeRect;
					}
				}
				if (!nodeRect || (nodeRect.width * nodeRect.height == 0)) {
					continue;
				}
				Downsha.Utils.expandRect(previewRect, nodeRect); // get the union set of two rectangles
			}
			*/
			LOG.debug("final preview rect: (" + previewRect.left + "," + previewRect.top + ")*(" + previewRect.right + "," + previewRect.bottom + ")");
			previewRect.width = previewRect.right - previewRect.left;
			previewRect.height = previewRect.bottom - previewRect.top;
			previewNode._downshaPreviewRect = previewRect;
			previewNode.className += " _downshaPreviewRect";
		}
		this.outlineRect(previewRect, true, this.PREVIEW_CTX_ATTRS);
		
		if (screenCenter && previewRect && // IE 6 and quirks mode should NOT scroll to make popup visible
			!(Downsha.Platform.getIEVersion() <= 6 || Downsha.Platform.isQuirksMode(this.window.document))) {
			/**
			 * innerWidth and innerHeight are the dimensions of the viewport (interior of the browser window)
			 * IE doesn't support innerWidth/innerHeight until version 9.
			 * IE supports clientWidth/clientHeight for all version.
			 * window.document.documentElement.clientHeight refers to the height of window.
			 * window.document.documentElement.clientWidth refers to the width of window.
			 * window.document.body.clientHeight refers to the height of document.
			 * window.document.body.clientWidth refers to the width of document.
			 */
			var windowWidth = this.window.innerWidth || this.window.document.documentElement.clientWidth;
			var windowHeight = this.window.innerHeight || this.window.document.documentElement.clientHeight;
			if (!isNaN(windowWidth) && !isNaN(windowHeight)) {
				var scrollX = previewRect.left - (windowWidth / 2);
				var scrollY = previewRect.top - (windowHeight / 2);
				LOG.debug("ContentPreviewScript.outlinePreviewElement scroll x: " + scrollX + " y: " + scrollY);
				this.window.scrollTo(scrollX, scrollY);
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.outlineRect = function(rect, stroke, attrs) {
		LOG.debug("ContentPreviewScript.outlineRect(" + rect.left + "," + rect.top + "," + rect.right + "," + rect.bottom + ")");
		if (rect) {
			var strokeRect = {
				left : rect.left, 
				top : rect.top, 
				right : rect.right, 
				bottom : rect.bottom, 
				width : rect.width, 
				height : rect.height
			};
			if (stroke) {
				var strokeWidth = (attrs && typeof attrs.lineWidth == "number") ? 
					attrs.lineWidth : this.contentVeil.getStrokeWidthForRect(strokeRect, attrs);
				LOG.debug("stroke width: " + strokeWidth);
				if (typeof strokeWidth == "number") { // add stroke width to rectangle
					strokeRect.left -= strokeWidth;
					strokeRect.right += strokeWidth;
					strokeRect.top -= strokeWidth;
					strokeRect.bottom += strokeWidth;
					strokeRect.width = strokeRect.right - strokeRect.left;
					strokeRect.height = strokeRect.bottom - strokeRect.top;
				}
			}
			this.contentVeil.clearRect(strokeRect);
			this.contentVeil.revealRect(rect, stroke, attrs);
			this.contentVeil.show();
		}
	};
	Downsha.ContentPreviewScript.prototype.getContentVeil = function() {
		if (!this.contentVeil) {
			this.contentVeil = new Downsha.ContentVeil(this.window, this.supportCanvas);
		}
		return this.contentVeil;
	};
})();
/**
 * @author: chenmin
 * @date: 2011-10-23
 * @desc: clip action
 */

(function() {
  Downsha.Clip = function Clip(win, stylingStrategy, maxSize) {
    this.initialize(win, stylingStrategy, maxSize);
  };

  Downsha.Clip.NOKEEP_NODE_ATTRIBUTES = { // skip following attributes
    "style" : null,
    "tabindex" : null,
    "class" : null,
    "id" : null,
    "className" : null, 
    "_downshaPreviewRect" : null,
    "_downshaEmbedMarker" : null
  };
  Downsha.Clip.CONDITIONAL_NODES = { // only clip when visible and use special serializer
    /*
    "IFRAME" : null,
    "EMBED" : null,
    "OBJECT" : null
    */
  };
  Downsha.Clip.NODE_NAME_TRANSLATIONS = {
    "HTML" : "DIV",
    "BODY" : "DIV",
    "FORM" : "DIV",
    "LABEL" : "SPAN",
    "FIELDSET" : "DIV",
    "LEGEND" : "SPAN",
    "SECTION" : "DIV",
    "CANVAS" : "DIV",
    "CUFON" : "DIV",
    "*" : "DIV"
  };
  Downsha.Clip.SUPPORTED_NODES = { // some nodes, like input, textarea, both belong to support list and reject list.
    "A" : null,
    "ABBR" : null,
    "ACRONYM" : null,
    "ADDRESS" : null,
    "AREA" : null,
    "B" : null,
    "BASE" : null,
    "BASEFONT" : null,
    "BDO" : null,
    "BIG" : null,
    "BLOCKQUOTE" : null,
    "BR" : null,
    "BUTTON" : null,
    "CAPTION" : null,
    "CENTER" : null,
    "CITE" : null,
    "CODE" : null,
    "COL" : null,
    "COLGROUP" : null,
    "DD" : null,
    "DEL" : null,
    "DFN" : null,
    "DIR" : null,
    "DIV" : null,
    "DL" : null,
    "DT" : null,
    "EM" : null,
    "EMBED" : null,
    "FIELDSET" : null,
    "FONT" : null,
    "FORM" : null,
    "FRAME" : null,
    "FRAMESET" : null,
    "H1" : null,
    "H2" : null,
    "H3" : null,
    "H4" : null,
    "H5" : null,
    "H6" : null,
    "HEAD" : null,
    "HR" : null,
    "HTML" : null,
    "I" : null,
    "IFRAME" : null,
    "IMG" : null,
    "INPUT" : null,
    "INS" : null,
    "KBD" : null,
    "LABEL" : null,
    "LEGEND" : null,
    "LI" : null,
    "LINK" : null,
    "MAP" : null,
    "MENU" : null,
    "META" : null,
    "NOBR" : null,
    "NOFRAMES" : null,
    "NOSCRIPT" : null,
    "OBJECT" : null,
    "OL" : null,
    "OPTGROUP" : null,
    "OPTION" : null,
    "P" : null,
    "PARAM" : null,
    "PRE" : null,
    "Q" : null,
    "QUOTE" : null,
    "S" : null,
    "SAMP" : null,
    "SCRIPT" : null,
    "SELECT" : null,
    "SMALL" : null,
    "SPAN" : null,
    "STRIKE" : null,
    "STRONG" : null,
    "STYLE" : null,
    "SUB" : null,
    "SUP" : null,
    "TABLE" : null,
    "TBODY" : null,
    "TD" : null,
    "TEXTAREA" : null,
    "TFOOT" : null,
    "TH" : null,
    "THEAD" : null,
    "TITLE" : null,
    "TR" : null,
    "TT" : null,
    "U" : null,
    "UL" : null,
    "VAR" : null
  };
  Downsha.Clip.REJECT_NODES = {
    "SCRIPT" : null,
    "STYLE" : null,
    "INPUT" : null,
    "SELECT" : null,
    "OPTION" : null,
    "OPTGROUP" : null,
    "TEXTAREA" : null,
    "NOSCRIPT" : null,
    "HEAD" : null,
    "DOWNSHADIV" : null,
    "CUFONTEXT" : null,
    "NOEMBED" : null
  };
  Downsha.Clip.NON_ANCESTOR_NODES = { // selection traversal should trace to the ancestors of following nodes
    "OL" : null,
    "UL" : null,
    "LI" : null
  };
  Downsha.Clip.SELF_CLOSING_NODES = { // <img />, <input />, <br />
    "IMG" : null,
    "INPUT" : null,
    "BR" : null
  };

  Downsha.Clip.HTMLEncode = function(str) {
    var result = "";
    for ( var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      /**
       * Direct index access of String object is NOT supported in IE.
       * We should use charAt method instead.
       */
      var aChar = str.charAt(i);
      if (charcode > 0x7f) { // greater than 127, show hex value
        result += "&#" + charcode + ";";
      } else if (aChar == '>') { // '>' -> "&gt;"
        result += "&gt;";
      } else if (aChar == '<') { // '<' -> "&lt;"
        result += "&lt;";
      } else if (aChar == '&') { // '&' -> "&amp;"
        result += "&amp;";
      } else {
        result += aChar;
      }
    }
    return result;
  };

  Downsha.Clip.prototype.window = null;
  Downsha.Clip.prototype.title = null;
  Downsha.Clip.prototype.url = null;
  Downsha.Clip.prototype.deep = true; // recursive traverse
  Downsha.Clip.prototype.stylingStrategy = null;
  Downsha.Clip.prototype.documentBase = null;
  Downsha.Clip.prototype.maxSize = 0;
  Downsha.Clip.prototype.sizeExceeded = false;
  Downsha.Clip.prototype.notebookGuid = false; // clip owner
  Downsha.Clip.prototype.tagNames = false; // tags
  Downsha.Clip.prototype.comment = false; // additional text
  Downsha.Clip.prototype.includeFontFaceDescriptions = false; // indicates whether includes css FontFace rules

  // Declares the content and source of a web clip
  Downsha.Clip.prototype.initialize = function(win, stylingStrategy, maxSize) {
  	this.window = (win) ? win : window;
  	this.title = this.window.document.title;
  	this.url = (this.window.document.URL) ? this.window.document.URL : this.window.document.location.href;
    this.range = null;
    if (stylingStrategy) {
    	this.setStylingStrategy(stylingStrategy);
    }
    this.setMaxSize(maxSize);
  };

  /**
   * Override with a function to have that function called when the clip's
   * serialized string exceeds maxSize property.
   */
  Downsha.Clip.prototype.onsizeexceed = null;

  Downsha.Clip.prototype.isFullPage = function() { // clip full page if no selection
    return !this.hasSelection();
  };

  Downsha.Clip.prototype.hasSelection = function() {
  	var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
  	return selectionFinder.hasSelection();
  };
  Downsha.Clip.prototype.getRange = function() {
  	var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
    if (selectionFinder.hasSelection()) {
      return selectionFinder.getRange();
    }
    return null;
  };
  Downsha.Clip.prototype.getRangeAncestor = function() {
  	var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
    if (selectionFinder.hasSelection()) {
      return selectionFinder.getCommonAncestorContainer();
    }
    return null;
  };
  Downsha.Clip.prototype.hasBody = function() { // determine whether page has body
    return (this.window && this.window.document && this.window.document.body && 
    	this.window.document.body.tagName.toLowerCase() == "body");
  };
  Downsha.Clip.prototype.hasContentToClip = function() {
    return (this.hasBody() || this.hasSelection());
  };
  Downsha.Clip.prototype.getDocumentBase = function() {
    if (this.documentBase == null) {
      var baseTags = this.window.document.getElementsByTagName("base");
      if (baseTags.length > 0) {
        for ( var i = 0; i < baseTags.length; i++) {
          this.setDocumentBase(baseTags[i].href);
          if (this.documentBase) {
            break;
          }
        }
      }
      if (!this.documentBase) {
				/**
				 * Say the URL is http://www.sitename.com/article/2009/09/14/this-is-an-article/, 
				 * then window.location.origin would be http://www.sitename.com without tailing slash.
				 * However, window.location.origin only works fine in Chrome, not in firefox/IE.
				 */
				this.documentBase = this.url.replace(/[^\/]+$/, ""); // trim end part of pathname
      }
    }
    return this.documentBase;
  };
  Downsha.Clip.prototype.setDocumentBase = function(url) {
    if (typeof url == 'string' && url.indexOf("http") == 0) {
      this.documentBase = url;
    } else {
      this.documentBase = null;
    }
  };
  Downsha.Clip.prototype.getMaxSize = function() {
    return this.maxSize;
  };
  Downsha.Clip.prototype.setMaxSize = function(num) {
    this.maxSize = parseInt(num);
    if (isNaN(this.maxSize) || num < 0) {
      this.maxSize = 0;
    }
  };
  Downsha.Clip.prototype.isSizeExceeded = function() {
    return this.sizeExceeded;
  };
  Downsha.Clip.prototype.setSizeExceeded = function(bool) {
    this.sizeExceeded = (bool) ? true : false;
  };
  Downsha.Clip.prototype.getUrl = function() {
    return this.url;
  };
  Downsha.Clip.prototype.setUrl = function(url) {
    if (typeof url == 'string' || url == null) {
      this.url = url;
    }
  };

  /**
   * Captures all the content of the document
   */
  Downsha.Clip.prototype.clipBody = function() {
  	LOG.debug("Clip.clipBody");
    if (!this.hasBody()) {
    	LOG.debug("Document has no body...");
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var startStamp = 0; // start stamp
    var endStamp = 0; // end stamp
    startStamp = new Date().getTime();
    this.content = this.serializeDOMNode(this.window.document.body, true); // serialize entire body
		endStamp = new Date().getTime();
		LOG.debug("Clipped body in " + (endStamp - startStamp) + " milliseconds");
    if (typeof this.content != 'string') {
      return false;
    }
    return true;
  };

  Downsha.Clip.prototype.clipElement = function(element) {
  	LOG.debug("Clip.clipElement");
    if (element) {
      if (this.stylingStrategy) {
        this.stylingStrategy.cleanUp();
      }
      var startStamp = 0;
      var endStamp = 0;
      startStamp = new Date().getTime();
      this.content = this.serializeDOMNode(element, true); // serialize specified element
			endStamp = new Date().getTime();
			LOG.debug("Clipped element's content in " + (endStamp - startStamp) + " milliseconds");
      if (typeof this.content == 'string') {
        return true;
      }
    }
    LOG.debug("Cannot clip because no valid element was specified");
    return false;
  };
  
  Downsha.Clip.prototype.clipUrl = function() {
  	LOG.debug("Clip.clipUrl");
  	this.content = Downsha.Utils.createUrlClipContent(this.title, this.url);
    return true;
  };

  /**
   * Captures selection in the document
   */
  Downsha.Clip.prototype.clipSelection = function() {
  	LOG.debug("Clip.clipSelection");
    if (!this.hasSelection()) {
    	LOG.debug("Document has no selection...");
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var startStamp = 0;
    var endStamp = 0;
    this.range = this.getRange();
    if (this.range) {
    	var startStamp = new Date().getTime();
      var ancestor = this.getRangeAncestor();
      if (!ancestor) {
      	LOG.debug("No selection range ancestor");
				this.range = null;
				return false;
      }
      // TODO fix bug of rangeIntersectsNode
      /*
      while (typeof Downsha.Clip.NON_ANCESTOR_NODES[ancestor.nodeName] != 'undefined' && ancestor.parentNode) {
        if (ancestor.nodeName == "BODY") {
          break;
        }
        ancestor = ancestor.parentNode;
      }
      */
      ancestor = this.window.document.body;
      LOG.debug("selection ancestor node: " + Downsha.Utils.getNodeString(ancestor));
      // TODO fix bug of selection in IE 6/7/8
      /*
      if (this.range.htmlText) { for IE 6/7/8
      	this.content = this.constructor.HTMLEncode(this.range.htmlText);
      } else { // for IE 9
      	this.content = this.serializeDOMNode(ancestor, false); // serialize selection ancestor element
      }
      */
      this.content = this.serializeDOMNode(ancestor, false); // serialize selection ancestor element
			var endStamp = new Date().getTime();
			LOG.debug("Clipped selection in " + (endStamp - startStamp) + " milliseconds");      
    	this.range = null;
      return true;
    }
    this.range = null;
    return false;
  };
  
	Downsha.Clip.prototype.rangeIntersectsNode = function(node) {
	  if (node && this.range) {
	  	// ownerDocument was introduced in Microsoft Internet Explorer 6.
	  	var doc = (node.ownerDocument) ? node.ownerDocument : node.document;
	  	if (doc && doc.createRange) { // for IE 9
		    var nodeRange = doc.createRange();
		    if (nodeRange) {
			    try {
			      nodeRange.selectNode(node);
			    } catch (e) {
			      nodeRange.selectNodeContents(node);
			    }
			    /**
			     * Note: IE 9 doesn't support for the intersectsNode method of Range object.
			     * Use the compareBoundaryPoints method to emulate range intersects node.
			     * see http://help.dottoro.com/ljsuotfs.php
			     */
			    return ((this.range.compareBoundaryPoints(this.range.START_TO_END, nodeRange) == 1) 
			      && (this.range.compareBoundaryPoints(this.range.END_TO_START, nodeRange) == -1));
		    }
	  	} else if (doc && doc.body && doc.body.createTextRange) { // for IE 6/7/8
	  		/**
	  		 * If you want to align the boundary points of a TextRange object to the contents of an element 
	  		 * that supports the createTextRange method, use the createTextRange method on the required element. 
	  		 * For other elements, create a TextRange object with the body.createTextRange method and 
	  		 * use the moveToElementText method with the required element.
	  		 * moveToElementText only supports element node as input parameter.
	  		 */
	  		if (node.nodeType != Node.ELEMENT_NODE) {
	  			return true;
	  		}
	  		var nodeRange = doc.body.createTextRange();
	  		if (nodeRange) {
	  			/**
	  			 * IE throws "invalid argument" error for some cases.
	  			 * There are a number of properties and methods on DOM nodes that cannot be safely accessed 
	  			 * in IE until the node has been properly inserted and rendered in the "actual" DOM.
	  			 * http://media.china.com.cn/cmdf/cszx/zjsy/2011/1104/65498.html
	  			 * <A href="/news/mn/2011/1009/58675.html" target=_blank>
	  			 * 		<IMG border=0 src="/uploads/allimg/111009/18-111009102H30-L.jpg" width=125 height=95>
	  			 * </A>
	  			 */
	  			try {
	  				nodeRange.moveToElementText(node);
			  		/**
			  		 * In IE 6/7/8, the compareEndPoints method of TextRange object provides similar functionality 
			  		 * of compareBoundaryPoints of Range object in IE 9/Firefox/Chrome.
			  		 * see http://help.dottoro.com/ljllaprb.php#supByObj
			  		 */
				    return ((this.range.compareEndPoints("EndToStart", nodeRange) == 1) 
				      && (this.range.compareEndPoints("StartToEnd", nodeRange) == -1));	  				
	  			} catch (e) {
	  			}
		    }
	  	}
	  }
	  return false;
	};

  Downsha.Clip.prototype.serializeDOMNode = function(root, fullPage) {
  	LOG.debug("Clip.serializeDOMNode root: " + root + ", fullPage: " + fullPage);
    var str = "";
    // oh yeah, if we ever decide to keep <style> crap, setting includeFontFaceDescriptions
    // will allow to include font face descriptions inside <style> tags =)
		/**
		 * font-face example
		 * <style type="text/css">
		 * @font-face { 
		 *   font-family:comic; 
		 *   src:url(http://valid_url/some_font_file.eot);
		 * }
		 * </style>
		 */
    if (this.includeFontFaceDescriptions && this.stylingStrategy) {
      var ffRules = this.stylingStrategy.getFontFaceRules();
      if (ffRules) {
        str += "<style>\n";
        for ( var ffrx = 0; ffrx < ffRules.length; ffrx++) {
          str += ffRules[ffrx].cssText + "\n";
        }
        str += "</style>\n";
      }
    }
    var node = root;
    
    // performance test: http://www.qq.com IE7
    // total cost: 7s, text node: 1.5s, styles: 2.3s, attrs: 2.8s, basic: 0.3s
    try {
			while (node) {
			  //LOG.debug("current node: " + node.nodeName + ", current length: " + str.length);
			  //LOG.debug("current node: " + Downsha.Utils.getNodeString(node));
			  if (this.maxSize > 0 && str.length > this.maxSize) { // whether content size exceeds
			    LOG.debug("Length of serialized content exceeds " + this.maxSize);
			    this.sizeExceeded = true;
			    if (typeof this.onsizeexceed == 'function') {
			      this.onsizeexceed();
			    }
			    break;
			  }
			  // if there is selection, we need to check whether current node intersects with selection range
			  // TODO only check intersection when NOT in fullPage mode.
			  var inRange = (fullPage || !this.range || this.rangeIntersectsNode(node)) ? true : false;
			  if (inRange && node.nodeType == Node.TEXT_NODE) { // text node
			    if (this.range) { // there is selection, get selected text content from nodeValue
			    	if (typeof this.range.startContainer != "undefined" && 
			    		typeof this.range.endContainer != "undefined") { // for IE 9
			        if (this.range.startContainer == node
			            && this.range.startContainer == this.range.endContainer) {
			          str += this.constructor.HTMLEncode(node.nodeValue.substring(
			              this.range.startOffset, this.range.endOffset));
			        } else if (this.range.startContainer == node) {
			          str += this.constructor.HTMLEncode(node.nodeValue
			              .substring(this.range.startOffset));
			        } else if (this.range.endContainer == node) {
			          str += this.constructor.HTMLEncode(node.nodeValue.substring(0,
			              this.range.endOffset));
			        } else if (this.range.commonAncestorContainer != node) {
			          str += this.constructor.HTMLEncode(node.nodeValue);
			        }
			      } else { // for IE 6/7/8
					    // In IE 6/7/8, you cannot retrieve the elements and offsets 
					    // that define the start and end points of a TextRange object. 
					    // Instead, you can get the coordinates of the TextRange object's 
					    // start point with the offsetLeft and offsetTop properties.
					    str += this.constructor.HTMLEncode(node.nodeValue);
			      }
			    } else { // no selection, get entire text content from nodeValue
			      str += this.constructor.HTMLEncode(node.nodeValue);
			    }
			  } else if (inRange && node.nodeType == Node.ELEMENT_NODE // CONDITIONAL element nodes, like <iframe>, <embed>, <object>
			      && typeof Downsha.Clip.CONDITIONAL_NODES[node.nodeName] != 'undefined') {
			    if (this.isNodeVisible(node)) { // only process visible nodes
			      var nodeStyle = null;
			      if (this.stylingStrategy) {
			      	nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage);
			      }
			      var _str = this.serializeConditionalElement(node, nodeStyle);
			      if (typeof _str == 'string' && _str) {
			        str += _str;
			      }
			    }
			  } else if (inRange && node.nodeType == Node.ELEMENT_NODE // NOT REJECT element nodes
			      && typeof Downsha.Clip.REJECT_NODES[node.nodeName] == 'undefined') {
			    if (this.isNodeVisible(node)) { // only process visible nodes
			      var attrs = node.attributes;
			      var attrStr = "";
			      for ( var i = 0; i < attrs.length; i++) { // enumerate all attributes of node
			      	// IE 5-7 takes the second possible attribute of node x, whether it's defined or not. 
			      	// Therefore it consists of all attributes that can possibly be defined on the node (84 in all).
			      	// By using the object's specified property, it returns a boolean value indicating 
			      	// whether the attribute in question is user defined or not.
			        if (!attrs[i] || !attrs[i].name || !attrs[i].specified) {
			        	continue;
			        }
			        
			        var n = attrs[i].name;
			        if ((typeof Downsha.Clip.NOKEEP_NODE_ATTRIBUTES[n] == 'undefined') // skip NO KEEP attributes, like id, class, style, etc.
			        	&& (n.substring(0, 2).toLowerCase() != "on") // skip event attributes, like onclick, onmousedown, etc.
			        	&& !(n == "href" && attrs[i].value.substring(0, 11).toLowerCase() == "javascript:")) { // skip event anchor, like href="javascript:void(0);"
			          var v = (attrs[i].value) ? attrs[i].value : "";
			          if (n == "src" || n == "href") {
									// following code call Utils.absoluteUrl to make "src", "href" absolute. (add document base url)
									// suppose document base url is : "http://www.host.com/path", 
									// 1. url starts with "//", like: "//www.host.com/index.php", then change to: "http://www.host.com/index.php"
									// 2. url starts with "/", like: "/index.php", then change to: "http://www.host.com/index.php"
									// 3. url starts with "./", "../", like: "./index.php", then change to: "http://www.host.com/./index.php"
									// 4. url starts with other, like: "index.php", then change to: "http://www.host.com/path/index.php"
			          	if ((typeof v == "string") && (v.length > 0) && 
			          		(v.substring(0, 4).toLowerCase().indexOf("http") != 0) && 
			          		(v.substring(0, 11).toLowerCase().indexOf("data:image/") != 0)) {
			          		v = Downsha.Utils.absoluteUrl(v, this.getDocumentBase());
			          	}
			          	if (v.substring(0, 4).toLowerCase().indexOf("http") == 0) {
			          		v = Downsha.Utils.escapeURL(v);
			          	}
			          } else {
			          	// escapeXML makes url ugly, e.g. http://t2.baidu.com/it/u=482339445,646192924&amp;fm=0&amp;gp=0.jpg
			          	v = Downsha.Utils.escapeXML(v);
			          }
			          
			          if (v) { // serialize current attribute name and value to the string
			            attrStr += " " + n + "=\"" + v + "\"";
			          } else {
			            attrStr += " " + n;
			          }
			        }
			      }
			      
			      /**
			       * following code get style of node by current styling strategy
			       * the result is an instance of ClipStyle or string
			       */
			      if (this.stylingStrategy) {
			        var nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage);
			        
			        if (nodeStyle instanceof Downsha.ClipStyle && nodeStyle.length > 0) {
			          if (nodeStyle["float"] && nodeStyle["float"] != "none" && node.parentElement) {
			            node.parentElement._downsha_float_ = true;
			          }
			          // serialize css text to the string, replace Double Quotes(") with Space( )
			          attrStr += " style=\"" + nodeStyle.toString().replace(/\"/g, "") + "\"";
			          //attrStr += " style=\"" + nodeStyle.toString().replace(/\"/g, "\\\"") + "\"";
			        } else if (typeof nodeStyle == 'string') {
			        	// serialize css text to the string, replace Double Quotes(") with Space( )
			          attrStr += " style=\"" + nodeStyle.replace(/\"/g, "") + "\"";
			          //attrStr += " style=\"" + nodeStyle.replace(/\"/g, "\\\"") + "\"";
			        }
			      }
			      
			      /**
			       * if node name is in NODE_NAME_TRANSLATIONS, then translate it to corresponding name.
			       * if node name is NOT in SUPPORTED_NODES, then translate it to div.
			       */
			      var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName] || node.nodeName;
			      nodeName = (typeof Downsha.Clip.SUPPORTED_NODES[nodeName] != 'undefined') ? 
			      	nodeName : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
			      str += "<" + nodeName + attrStr;
			      
			      if (typeof this.window.getComputedStyle != "undefined") {
			        var computedStyle = this.window.getComputedStyle(node, '');
			        var visValue = computedStyle.getPropertyValue("visibility");
			      } else {
			      	var visValue = node.currentStyle.visibility;
			      }
			      if (visValue != "hidden" && node.hasChildNodes()) { // node visibility is NOT hidden 
			        str += ">";
			        /**
			         * The childNodes nodeList consists of all child nodes of the element, 
			         * including text nodes and comment nodes. IE up to 8 does not count empty text nodes. 
			         * Since this is the desired behaviour as far as I'm concerned, it still gets a Yes.
			         */
			        node = node.childNodes[0]; // *** depth-first traversal, first process children, then siblings.
			        continue;
			      } else if (typeof Downsha.Clip.SELF_CLOSING_NODES[nodeName] == 'undefined') {
			        // The standards are great when no one follows them...
			        // in the case of a BUTTON tag, make sure we fucking close it since
			        // it's not a self-closing tag
			        // and having a self-closing button will often result in the
			        // siblings becoming its children
			        // e.g. <button/><div>...</div> would become
			        // <button><div>...</div></button>
			        str += ">" + "</" + nodeName + ">";
			      } else { // self-closing node
			        str += "/>";
			      }
			    }
			  }
			
			  if (node.nextSibling) { // *** traverse to siblings
			    node = node.nextSibling;
			  } else if (node != root) { // otherwise, no siblings, no children, trace BACK to parent node
			    if (node.parentElement && node.parentElement._downsha_float_) {
			      var floatClearingStr = this.getFloatClearingElementString(node.parentElement);
			      str += floatClearingStr;
			      node.parentElement.removeAttribute("_downsha_float_");
			    }
			    while (node.parentNode) {
			      node = node.parentNode;
			      // if the current node is the root node, let's append a terminal
			      // element to compensate for any floating children
			      if (node == root) {
			        str += "<div style='clear: both'></div>";
			      }
			      
			      // add close tag for parent node
			      var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName] || node.nodeName;
			      nodeName = (typeof Downsha.Clip.SUPPORTED_NODES[nodeName] != 'undefined') ? 
			      	nodeName : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
			      str += "</" + nodeName + ">";
			      
			      if (node == root) {
			        break;
			      } else if (node.nextSibling) { // *** traverse to uncles
			        node = node.nextSibling;
			        break;
			      } else if (node.parentElement && node.parentElement._downsha_float_) {
			        var floatClearingStr = this.getFloatClearingElementString(node.parentElement);
			        str += floatClearingStr;
			        node.parentElement.removeAttribute("_downsha_float_");
			      } else {
			      }
			    } // end while
			    if (node == root) { // reach the root of serialize range
			      break;
			    } else if ((node.nodeName == "#document") || // reach the root of entire document
			    	(node.nodeType == Node.DOCUMENT_NODE)) {
			    	break;
			    }
			  } else {
			    break;
			  }
			}
    } catch(e) {
			// The DOMException object is supported in Internet Explorer from version 9.
			if ((typeof DOMException != "undefined") && 
				(e instanceof DOMException) && 
				(e.code == DOMException.SECURITY_ERR)) {
				LOG.debug("Ignoring DOMException.SECURITY_ERR for node: " + Downsha.Utils.getNodeString(node));
			} else {
				LOG.warn("Error serializing node: " + Downsha.Utils.getNodeString(node));
				LOG.dir(e);
				// TODO throw out exception again or hide it ?
				//throw e;
			}
    }
    return str;
  };
  
  Downsha.Clip.prototype.getFloatClearingElementString = function(node) {
    var str = "";
    if (node && this.stylingStrategy) {
      var style = this.stylingStrategy.styleForFloatClearingNode(node);
      if (style && style.length > 0) {
        var nodeName = "div";
        if (node.nodeName == "UL" || node.nodeName == "OL") {
          nodeName = "li";
        } else if (node.nodeName == "DL") {
          nodeName = "dd";
        }
        str = "<" + nodeName + " style=\"" + style.toString() + "\"></" + nodeName + ">";
      }
    }
    return str;
  };

  Downsha.Clip.prototype.isNodeVisible = function(node) {
    if (typeof this.window.getComputedStyle != "undefined") {
		  var computedStyle = this.window.getComputedStyle(node);
		  var disValue = computedStyle.getPropertyValue("display");
		  var visValue = computedStyle.getPropertyValue("visibility");
		  var posValue = computedStyle.getPropertyValue("position");
		} else {
			var disValue = node.currentStyle.display;
			var visValue = node.currentStyle.visibility;
			var posValue = node.currentStyle.position;
		}
    if (disValue != "none" && !(visValue == "hidden" && posValue == "absolute")) {
      return true;
    }
    return false;
  };

  Downsha.Clip.prototype.serializeConditionalElement = function(node, nodeStyle) { // serialize conditional element by ElementSerializerFactory
    if (Downsha.ElementSerializerFactory) {
	    var impl = Downsha.ElementSerializerFactory.getImplementationFor(node);
	    if (typeof impl == 'function') {
	      var serializer = new impl(node, nodeStyle);
	      return serializer.serialize();
	    }
  	}
    return null;
  };

  Downsha.Clip.prototype.setStylingStrategy = function(strategy) {
    if (typeof strategy == 'function'
        && Downsha.inherits(strategy, Downsha.ClipStylingStrategy)) {
      this.stylingStrategy = new strategy(this.window);
    } else if (strategy instanceof Downsha.ClipStylingStrategy) {
      this.stylingStrategy = strategy;
    } else if (strategy == null) {
      this.stylingStrategy = null;
    }
  };
  Downsha.Clip.prototype.getStylingStrategy = function() {
    return this.stylingStrategy;
  };

  Downsha.Clip.prototype.toString = function() {
    return "Downsha.Clip[" + this.url + "] ("
        + ((this.content) ? this.content.length : 0) + ") " + this.title;
  };

  // return POSTable length of this Downsha.Clip
  Downsha.Clip.prototype.getLength = function() {
    var total = 0;
    var o = this.toDataObject();
    for (var i in o) {
      total += ("" + o[i]).length + i.length + 2;
    }
    total -= 1;
    return total;
  };

  Downsha.Clip.prototype.toDataObject = function() {
    return {
      "content" : this.content,
      "title" : this.title,
      "url" : this.url,
      "fullPage" : this.isFullPage(),
      "sizeExceeded" : this.sizeExceeded,
      "notebookGuid" : this.notebookGuid,
      "tagNames" : this.tagNames,
      "comment" : this.comment
    };
  };

  Downsha.Clip.prototype.toLOG = function() {
    return {
      title : this.title,
      url : this.url,
      fullPage : this.isFullPage(),
      sizeExceeded : this.sizeExceeded,
      contentLength : this.content.length
    };
  };
})();
/**
 * @author: chenmin
 * @date: 2011-10-24
 * @desc: Downsha.ClipStyle
 * Downsha.ClipStyle is a container for CSS styles. It is able to add and
 * remove CSSStyleRules (and parse CSSRuleList's for rules), as well as
 * CSSStyleDeclaration's and instances of itself.
 * 
 * Downsha.ClipStyle provides a mechanism to serialize itself via toString(),
 * and reports its length via length property. It also provides a method to
 * clone itself and expects to be manipulated via addStyle and removeStyle.
 */

(function() {
	Downsha.ClipStyle = function ClipStyle(css, filter) {
	  this.initialize(css, filter);
	};
	Downsha.ClipStyle.stylePrefix = function(style) {
	  if (typeof style == 'string') {
	    var i = 0;
	    if ((i = style.indexOf("-")) > 0) {
	      return style.substring(0, i);
	    }
	  }
	  return style;
	};
	Downsha.ClipStyle.findFontFaceRules = function(doc) {
	  var d = doc || document;
	  var sheets = d.styleSheets;
	  var fontFaceRules = [];
	  for ( var i = 0; i < sheets.length; i++) {
	    var sheet = sheets[i];
	    if (sheet.cssRules) {
	      for ( var i = 0; i < sheet.cssRules.length; i++) {
	        var rule = sheet.cssRules[i];
	        if ((typeof CSSFontFaceRule != "undefined") && (rule instanceof CSSFontFaceRule)) {
	          fontFaceRules.push(rule);
	        }
	      }
	    }
	  }
	  return fontFaceRules;
	};
	Downsha.ClipStyle.PERIMETERS = [ "top", "right", "bottom", "left" ];
	Downsha.ClipStyle.CORNOR_PERIMETERS = [ "top-left", "top-right", "bottom-right", "bottom-left" ];
	Downsha.ClipStyle.PERIMETER_PROPS = {
	  "margin" : null,
	  "padding" : null
	};
	Downsha.ClipStyle.PERIMETER_EXTRA_PROPS = {
	  "border" : [ "width", "style", "color" ],
	  "border-top" : [ "width", "style", "color" ],
	  "border-right" : [ "width", "style", "color" ],
	  "border-bottom" : [ "width", "style", "color" ],
	  "border-left" : [ "width", "style", "color" ],
	  "outline" : [ "width", "style", "color" ]
	};
	Downsha.ClipStyle.STYLES = [ // for IE9 currently keep 89 elements
    "background-attachment", "background-clip", "background-color", "background-image", "background-origin", "background-position",
    "background-repeat", "background-size", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius",
    "border-bottom-style", "border-bottom-width", "border-collapse", "border-left-color", "border-left-style", "border-left-width",
    "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-top-color", "border-top-left-radius",
    "border-top-right-radius", "border-top-style", "border-top-width", "bottom", "box-shadow", "caption-side", "clear", "clip",
    "color", "content", "counter-increment", "counter-reset", "cursor", "direction", "display", "empty-cells", "float",
    "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "height",
    /*"ime-mode", */"left", "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type",
    "margin-bottom", "margin-left", "margin-right", "margin-top", /*"marker-offset", */"max-height", "max-width", "min-height",
    "min-width", "opacity", "outline-color", /*"outline-offset", */"outline-style", "outline-width", "overflow", "overflow-x",
    "overflow-y", "padding-bottom", "padding-left", "padding-right", "padding-top", /*"page-break-after", "page-break-before",
    "pointer-events", */"position", /*"resize", */"right", "table-layout", "text-align", "text-anchor", "text-decoration", "text-indent",
    "text-overflow", /*"text-shadow", */"text-transform", "top", "vertical-align", "visibility", "white-space", "width",
    "word-spacing", /*"word-wrap", */"z-index"
	];
	
	// http://msdn.microsoft.com/en-us/library/ms535231(v=VS.85).aspx
	// http://www.hbcms.com/main/dhtml/objects/currentstyle.html
	Downsha.ClipStyle.STYLE_TRANSLATIONS = { // for IE 6/7/8 currently keep 78 elements
		//"accelerator"               : "-ms-accelerator", 
		//"background"                : "background", 
    "backgroundAttachment"        : "background-attachment", 
    //"backgroundClip"            : "background-clip",            // N/A in IE7
    "backgroundColor"             : "background-color", 
    "backgroundImage"             : "background-image", 
    //"backgroundOrigin"          : "background-origin",          // N/A in IE7
    //"backgroundPosition"        : "background-position",        // N/A in IE7, use backgroundPositionX/Y
    "backgroundPositionX"         : "background-position-x", 
    "backgroundPositionY"         : "background-position-y", 
    "backgroundRepeat"            : "background-repeat", 
    //"backgroundSize"            : "background-size",            // N/A in IE7
    
    "borderBottomColor"           : "border-bottom-color", 
    //"borderBottomLeftRadius"    : "border-bottom-left-radius",  // N/A in IE7
    //"borderBottomRightRadius"   : "border-bottom-right-radius", // N/A in IE7
    "borderBottomStyle"           : "border-bottom-style", 
    "borderBottomWidth"           : "border-bottom-width", 
    "borderCollapse"              : "border-collapse", 
    "borderLeftColor"             : "border-left-color", 
    "borderLeftStyle"             : "border-left-style", 
    "borderLeftWidth"             : "border-left-width",
    "borderRightColor"            : "border-right-color", 
    "borderRightStyle"            : "border-right-style", 
    "borderRightWidth"            : "border-right-width", 
    "borderSpacing"               : "border-spacing", 
    "borderTopColor"              : "border-top-color", 
    //"borderTopLeftRadius"       : "border-top-left-radius",     // N/A in IE7
    //"borderTopRightRadius"      : "border-top-right-radius",    // N/A in IE7
    "borderTopStyle"              : "border-top-style", 
    "borderTopWidth"              : "border-top-width", 
    
    "bottom"                      : "bottom", 
    //"boxShadow"                 : "box-shadow",                 // N/A in IE7
    "captionSide"                 : "caption-side", 
    "clear"                       : "clear", 
    "clip"                        : "clip",
    "color"                       : "color", 
    "content"                     : "content", 
    //"counterIncrement"          : "counter-increment", 
    //"counterReset"              : "counter-reset", 
    "cursor"                      : "cursor", 
    "direction"                   : "direction", 
    "display"                     : "display", 
    "emptyCells"                  : "empty-cells", 
    "styleFloat"                  : "float",
    "fontFamily"                  : "font-family", 
    "fontSize"                    : "font-size", 
    //"fontSizeAdjust"            : "font-size-adjust",           // N/A in IE7
    //"fontStretch"               : "font-stretch",               // N/A in IE7
    "fontStyle"                   : "font-style", 
    "fontVariant"                 : "font-variant", 
    "fontWeight"                  : "font-weight", 
    "height"                      : "height",
    //"imeMode"                   : "ime-mode",                   // [-ms-ime-mode] Gets the state of an Input Method Editor (IME).
    "left"                        : "left", 
    "letterSpacing"               : "letter-spacing", 
    "lineHeight"                  : "line-height", 
    "listStyleImage"              : "list-style-image", 
    "listStylePosition"           : "list-style-position", 
    "listStyleType"               : "list-style-type",
    "marginBottom"                : "margin-bottom", 
    "marginLeft"                  : "margin-left", 
    "marginRight"                 : "margin-right", 
    "marginTop"                   : "margin-top", 
    //""                          : "marker-offset", 
    "maxHeight"                   : "max-height", 
    "maxWidth"                    : "max-width", 
    "minHeight"                   : "min-height", 
    "minWidth"                    : "min-width", 
    "opacity"                     : "opacity", 
    "outlineColor"                : "outline-color", 
    //""                          : "outline-offset", 
    "outlineStyle"                : "outline-style", 
    "outlineWidth"                : "outline-width", 
    "overflow"                    : "overflow", 
    "overflowX"                   : "overflow-x", 
    "overflowY"                   : "overflow-y", 
    "paddingBottom"               : "padding-bottom", 
    "paddingLeft"                 : "padding-left", 
    "paddingRight"                : "padding-right", 
    "paddingTop"                  : "padding-top", 
    /*
    "pageBreakAfter"              : "page-break-after",  // [for Print] Gets a value indicating whether a page break occurs after the object.
    "pageBreakBefore"             : "page-break-before", // [for Print] Gets a string indicating whether a page break occurs before the object.
    "pointerEvents"               : "pointer-events",    // Gets or sets a value that specifies under what circumstances a given graphics element can be the target element for a pointer event in SVG.
    */
    "position"                    : "position", 
    //""                          : "resize", 
    "right"                       : "right", 
    "tableLayout"                 : "table-layout", 
    "textAlign"                   : "text-align", 
    "textAnchor"                  : "text-anchor", 
    "textDecoration"              : "text-decoration", 
    "textIndent"                  : "text-indent", 
    "textOverflow"                : "text-overflow", 
    //""                          : "text-shadow", 
    "textTransform"               : "text-transform", 
    "top"                         : "top", 
    "verticalAlign"               : "vertical-align", 
    "visibility"                  : "visibility", 
    "whiteSpace"                  : "white-space", 
    "width"                       : "width",
    "wordSpacing"                 : "word-spacing", 
    //"wordWrap"                  : "word-wrap",         // [-ms-word-wrap] Gets whether to break words when the content exceeds the boundaries of its container.
    "zIndex"                      : "z-index"
  };

	Downsha.ClipStyle.prototype.length = 0;
	Downsha.ClipStyle.prototype.styleFilter = null;
	Downsha.ClipStyle.prototype.initialize = function(css, filter) {
	  this.setFilter(filter);
	  var constructorName = Downsha.Utils.getConstructorName(css);
	  if ((constructorName == "CSSRuleList") || 
	  	((typeof CSSRuleList != "undefined") && (typeof css == 'object' && css instanceof CSSRuleList)) || 
	  	(typeof css == 'object' && css instanceof Array)) {
		  /**
		   * CSSRuleList includes a list of CSSRule objects, which may be following 7 kind of instances.
		   * CSSCharsetRule, CSSFontFaceRule, CSSImportRule, CSSMediaRule, CSSPageRule, CSSStyleRule, CSSUnknownRule.
		   * window.getMatchedCSSRules() returns a CSSRuleList object of specified node.
		   * document.styleSheets[x].cssRules (IE 9/Firefox/Chrome) also returns a CSSRuleList in the style sheet.
		   * document.styleSheets[x].rules (IE 6/7/8/9) is similar as cssRules, 
		   * except that rules does not contain @import declarations.
		   */
	    if (css.length > 0) {
	      for ( var i = 0; i < css.length; i++) {
	        this.addStyle(css[i].style);
	      }
	    }
	  } else if ((constructorName == "CSSStyleRule") || 
	  	((typeof CSSStyleRule != "undefined") && (typeof css == 'object' && css instanceof CSSStyleRule))) {
	    this.addStyle(css.style);
	  } else if ((constructorName == "CSSStyleDeclaration") || // for IE 9
	  	((typeof CSSStyleDeclaration != "undefined") && (typeof css == 'object' && css instanceof CSSStyleDeclaration))) {
	  	/**
	  	 * window.getComputedStyle() returns a CSSStyleDeclaration object of specified node.
	  	 * CSSStyleRule.getStyle() also returns a CSSStyleDeclaration object.
	  	 */
	    this.addStyle(css);
	  } else if (typeof css == "object" && css != null) { // for IE 6/7/8
	    this.addStyle(css);
	  }
	};
	Downsha.ClipStyle.prototype._addPerimeterStyle = function(prop, val) {
	  var valParts = val.replace(/\s+/, " ").split(" ");
	  if (valParts.length == 1) {
	    valParts = valParts.concat(valParts, valParts, valParts);
	  } else if (valParts.length == 2) {
	    valParts = valParts.concat(valParts[0], valParts[1]);
	  } else if (valParts.length == 3) {
	    valParts = valParts.concat(valParts[1]);
	  } else if (valParts.length == 0) {
	    valParts = [ "auto", "auto", "auto", "auto" ];
	  }
	  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	    var p = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
	    this._addSimpleStyle(p, valParts[i]);
	  }
	};
	Downsha.ClipStyle.prototype._addPerimeterExtraStyle = function(prop, val) {
	  var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
	  if (extras instanceof Array) {
	    var valParts = val.replace(/\s+/g, " ").split(" ");
	    var re = new RegExp(Downsha.ClipStyle.PERIMETERS.join("|"), "i");
	    var perimetered = (prop.match(re)) ? true : false;
	    for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	      for ( var e = 0; e < extras.length; e++) {
	        var p = prop
	            + ((perimetered) ? "" : "-" + Downsha.ClipStyle.PERIMETERS[i])
	            + "-" + extras[e];
	        if (valParts[e]) {
	          this._addSimpleStyle(p, valParts[e]);
	        }
	      }
	      if (perimetered) {
	        break;
	      }
	    }
	  }
	};
	Downsha.ClipStyle.prototype._addSimpleStyle = function(prop, val) {
	  if (typeof this[prop] == 'undefined') {
	    this.length++;
	  }
	  this[prop] = val;
	};
	Downsha.ClipStyle.prototype.addStyle = function(style) {
		var constructorName = Downsha.Utils.getConstructorName(style);
	  if (((constructorName == "CSSStyleDeclaration") || // for IE 9 CSSStyleDeclaration object
	  	((typeof CSSStyleDeclaration != "undefined") && (typeof style == 'object' && style instanceof CSSStyleDeclaration))) && 
	  	(style.length > 0)) {
	  	// enumerate fixed style array rather than all styles
	    //for (var i = 0; i < style.length; i++) {
	    //	var prop = style[i];
	    for (var i = 0; i < Downsha.ClipStyle.STYLES.length; i++) {
	    	var prop = Downsha.ClipStyle.STYLES[i];
	      var val = style.getPropertyValue(prop); // getPropertyValue is NOT supported in IE 6/7/8
	      if (this.styleFilter && !this.styleFilter(prop, val)) {
	        continue;
	      }
	      if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
	        this._addPerimeterStyle(prop, val);
	      } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
	        this._addPerimeterExtraStyle(prop, val);
	      } else {
	        this._addSimpleStyle(prop, val);
	      }
	    }
	  } else if (typeof style == 'object' && style instanceof Downsha.ClipStyle) {
	    for ( var prop in style) {
	      if (typeof this.constructor.prototype[prop] == 'undefined') {
	        var val = style[prop];
	        if (this.styleFilter && !this.styleFilter(prop, val)) {
	          continue;
	        }
	        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
	          this._addPerimeterStyle(prop, val);
	        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
	          this._addPerimeterExtraStyle(prop, val);
	        } else {
	          this._addSimpleStyle(prop, val);
	        }
	      }
	    }
	  } else if (typeof style == 'object' && style != null) { // for IE 6/7/8  currentStyle object
	    for (var i in Downsha.ClipStyle.STYLE_TRANSLATIONS) {
	    	var prop = Downsha.ClipStyle.STYLE_TRANSLATIONS[i];
	    	var val = style.getAttribute(i); // style[i]
	      if (this.styleFilter && !this.styleFilter(prop, val)) {
	        continue;
	      }
        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
          this._addPerimeterStyle(prop, val);
        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
          this._addPerimeterExtraStyle(prop, val);
        } else {
          this._addSimpleStyle(prop, val);
        }
      }
	    /*
	    for (var prop in style) {
	      if (typeof style[prop] != 'function'
	          && typeof this.constructor.prototype[prop] == 'undefined') {
	        var val = style[prop];
		      if (this.styleFilter && !this.styleFilter(prop, val)) {
		        continue;
		      }
	        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
	          this._addPerimeterStyle(prop, val);
	        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
	          this._addPerimeterExtraStyle(prop, val);
	        } else {
	          this._addSimpleStyle(prop, val);
	        }
	      }
	    }
	    */
	  }
	};
	Downsha.ClipStyle.prototype.removeStyle = function(style, fn) {
		var constructorName = Downsha.Utils.getConstructorName(style);
	  var self = this;
	  function rem(prop, value) {
	    if (typeof self[prop] != 'undefined' // make sure we have this property
	        && typeof self.constructor.prototype[prop] == 'undefined' // this property is not inherited from prototype
	        && (typeof fn == 'function' || self[prop] == value)) {
	      // we will delete this property either value is equal or the filter function returns true.
	      if (typeof fn != 'function' || (typeof fn == 'function' && fn(prop, self[prop], value))) {
	        if (delete (self[prop]))
	          self.length--;
	      }
	    }
	  }
	  if (((constructorName == "CSSStyleDeclaration") || 
	  	((typeof CSSStyleDeclaration != "undefined") && (typeof style == 'object' && style instanceof CSSStyleDeclaration))) && 
	  	(style.length > 0)) {
	    for ( var i = 0; i < style.length; i++) {
	      var prop = style[i];
	      var val = style.getPropertyValue(prop);
	      rem(prop, val);
	    }
	  } else if (typeof style == 'object' && style instanceof Downsha.ClipStyle && style.length > 0) {
	    for ( var prop in style) {
	      rem(prop, style[prop]);
	    }
	  } else if (typeof style == 'object' && style instanceof Array) {
	    for ( var i = 0; i < style.length; i++) {
	      rem(style[i], this[style[i]]);
	    }
	  } else if (typeof style == 'string') {
	    rem(style, this[style]);
	  } else {
	  }
	};
	Downsha.ClipStyle.prototype.removeStyleIgnoreValue = function(style) {
	  this.removeStyle(style, function(prop, propValue, value) {
	    return true;
	  });
	};
	Downsha.ClipStyle.styleInArray = function(style, styleArray) {
	  if (typeof style != 'string' || !(styleArray instanceof Array)) {
	    return false;
	  }
	  var i = -1;
	  var styleFull = style.toLowerCase();
	  // chenmin 2012-07-09 ##### fast speed for IE only #####
	  // IE style array only contains specific styles, e.g. font-family, font-size, not just font.
	  for (var i = 0; i < styleArray.length; i++) {
	    if (styleArray[i] == styleFull)
	      return true;
	  }
	  /*
	  var styleType = ((i = styleFull.indexOf("-")) > 0) ? styleFull.substring(0, i) : styleFull;
	  for (var i = 0; i < styleArray.length; i++) {
	    if (styleArray[i] == styleFull || styleArray[i] == styleType)
	      return true;
	  }
	  */
	  return false;
	};
	/**
	 * Derives to smaller set of style attributes by comparing differences with
	 * given style and makes sure that style attributes in matchStyle are preserved.
	 * This is useful for removing style attributes that are present in the parent
	 * node. In that case, the instance will contain combined style attributes, and
	 * the first argument to this function will be combined style attributes of the
	 * parent node. The second argument will contain matched style attributes. The
	 * result will contain only attributes that are free of duplicates while
	 * preserving uniqueness of the style represented by this instance.
	 */
	Downsha.ClipStyle.prototype.deriveStyle = function(style, matchStyle, keepArray) {
	  this.removeStyle(style, function(prop, propValue, value) { // property will be removed only if this function returns true
	    if (keepArray instanceof Array && Downsha.ClipStyle.styleInArray(prop, keepArray))
	      return false;
	    
	    // chenmin 2012-07-06  ##### bug fixes: remove property only if it exists in matchStyle ##### 
	    //return ((!matchStyle || (typeof matchStyle[prop] == 'undefined')) && propValue == value);
	    return (typeof matchStyle[prop] != 'undefined' && propValue == value);
	  });
	};
	Downsha.ClipStyle.prototype.setFilter = function(filter) {
	  if (typeof filter == 'function') {
	    this.styleFilter = filter;
	  } else if (filter == null) {
	    this.styleFilter = null;
	  }
	};
	Downsha.ClipStyle.prototype.getFilter = function() {
	  return this.styleFilter;
	};
	Downsha.ClipStyle.prototype.mergeStyle = function(style, override) {
	  if (style instanceof Downsha.ClipStyle && style.length > 0) {
	    var undef = true;
	    for ( var i in style) {
	      if (typeof this.constructor.prototype[i] != 'undefined'
	          || (typeof this.__lookupSetter__ != 'undefined' 
	          	&& typeof this.__lookupSetter__(i) != 'undefined')) {
	        continue;
	      }
	      if ((undef = (typeof this[i] == 'undefined')) || override) {
	        this[i] = style[i];
	        if (undef) {
	          this.length++;
	        }
	      }
	    }
	  }
	};
	Downsha.ClipStyle.prototype.clone = function() {
	  var clone = new Downsha.ClipStyle();
	  for ( var prop in this) {
	    if (typeof this.constructor.prototype[prop] == 'undefined') {
	      clone[prop] = this[prop];
	    }
	  }
	  clone.length = this.length;
	  return clone;
	};
	Downsha.ClipStyle.prototype.toString_background = function(skipObj) { // special handle of background styles
	  var str = "";
	  if (this["background-color"] && 
	  	this["background-color"] != "transparent" && 
	  	this["background-color"] != "rgba(0, 0, 0, 0)") {
	    str += "background-color:" + this["background-color"] + ";";
	  }
	  
	  // The background-clip property specifies the painting area of the background.
	  if (this["background-clip"] && 
	  	this["background-clip"] != "border-box") {
	    str += "background-clip:" + this["background-clip"] + ";";
	  }
	  
		if (this["background-image"] && this["background-image"] != "none") {
			str += "background-image:" + this["background-image"] + ";";
			
			// The background-position property sets the starting position of a background image.
			if (this["background-position"]) {
				str += "background-position:" + this["background-position"] + ";";
			} else if (this["background-position-x"] || this["background-position-y"]) {
				var _px = (this["background-position-x"]) ? this["background-position-x"] : "0%";
				var _py = (this["background-position-y"]) ? this["background-position-y"] : "0%";
				str += "background-position:" + _px + " " + _py + ";";
			}
			
			// The background-origin property specifies what the background-position property should be relative to.
			if (this["background-origin"]) {
				str += "background-origin:" + this["background-origin"] + ";";
			}
			
			// The background-repeat property sets if/how a background image will be repeated.
			if (this["background-repeat"]) {
				str += "background-repeat:" + this["background-repeat"] + ";";
			} else if (this["background-repeat-x"] || this["background-repeat-y"]) {
				var _rx = (this["background-repeat-x"]) ? this["background-repeat-x"] : "initial";
				var _ry = (this["background-repeat-y"]) ? this["background-repeat-y"] : "initial";
				if (_rx != "initial" || _ry != "initial") {
					str += "background-repeat:" + _rx + " " + _ry + ";";
				}
			}
			
			// The background-attachment property sets whether a background image is fixed or scrolls with the rest of the page.
			if (this["background-attachment"]) {
				str += "background-attachment:" + this["background-attachment"] + ";";
			}
			
			// The background-size property specifies the size of the background images.
			if (this["background-size"]) {
				str += "background-size:" + this["background-size"] + ";";
			}
		}
		
	  if (skipObj) {
	  	skipObj["background"]            = null;
	    skipObj["background-color"]      = null;
	    skipObj["background-clip"]       = null;
	    skipObj["background-image"]      = null;
	    skipObj["background-position"]   = null;
	    skipObj["background-position-x"] = null;
	    skipObj["background-position-y"] = null;
	    skipObj["background-origin"]     = null;
	    skipObj["background-repeat"]     = null;
	    skipObj["background-repeat-x"]   = null;
	    skipObj["background-repeat-y"]   = null;
	    skipObj["background-attachment"] = null;
	    skipObj["background-size"]       = null;
	  }
	  
	  if (str.length == 0) {
	    str += "background:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_margin = function(skipObj) { // special handle of margin styles
		var str = "";
		if (this["margin"]) {
			str = "margin:" + this["margin"] + ";";
		} else {
			str = this._toPerimeterString("margin");
		}
	  
	  if (skipObj) {
	  	skipObj["margin"]        = null;
	    skipObj["margin-top"]    = null;
	    skipObj["margin-right"]  = null;
	    skipObj["margin-bottom"] = null;
	    skipObj["margin-left"]   = null;
	  }
	  
	  if (str.length == 0) {
	    str = "margin:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_padding = function(skipObj) { // special handle of padding styles
		var str = "";
		if (this["padding"]) {
			str = "padding:" + this["padding"] + ";";
		} else {
			str = this._toPerimeterString("padding");
		}
	  
	  if (skipObj) {
	  	skipObj["padding"]        = null;
	    skipObj["padding-top"]    = null;
	    skipObj["padding-right"]  = null;
	    skipObj["padding-bottom"] = null;
	    skipObj["padding-left"]   = null;
	  }
	  
	  if (str.length == 0) {
	    str = "padding:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_border = function(skipObj) { // special handle of border styles
	  //var str = this._toPerimeterExtraString("border");
	  var str = "";
	  var borderStyleProp = "";
	  var borderWidthProp = "";
	  var borderColorProp = "";
	  for (var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	  	borderStyleProp = "border-" + Downsha.ClipStyle.PERIMETERS[i] + "-style";
	  	borderWidthProp = "border-" + Downsha.ClipStyle.PERIMETERS[i] + "-width";
	  	borderColorProp = "border-" + Downsha.ClipStyle.PERIMETERS[i] + "-color";
			if (this[borderStyleProp] && this[borderStyleProp] != "none" &&
					this[borderWidthProp] && this[borderWidthProp] != "0px") {
			  /**
			   * The border property is a shorthand for the following individual border properties:
			   * border-width, border-style (required), border-color
			   * Example: "border:5px solid red";
			  */
				str += "border-" + Downsha.ClipStyle.PERIMETERS[i] + ":";
				if (this[borderWidthProp]) {
					str += this[borderWidthProp] + " ";
				}
				str += this[borderStyleProp];
				if (this[borderColorProp]) {
					str += " " + this[borderColorProp];
				}
				str += ";";
			}
	  }
	  
	  if (skipObj) {
	  	skipObj["border"]              = null;
	    skipObj["border-top-width"]    = null;
	    skipObj["border-top-style"]    = null;
	    skipObj["border-top-color"]    = null;
	    skipObj["border-right-width"]  = null;
	    skipObj["border-right-style"]  = null;
	    skipObj["border-right-color"]  = null;
	    skipObj["border-bottom-width"] = null;
	    skipObj["border-bottom-style"] = null;
	    skipObj["border-bottom-color"] = null;
	    skipObj["border-left-width"]   = null;
	    skipObj["border-left-style"]   = null;
	    skipObj["border-left-color"]   = null;
	  }
	  
	  if (str.length == 0) {
	    str = "border:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_border_radius = function(skipObj) { // special handle of border radius styles
	  var valParts = [];
	  var missing = false;
	  var str = "";
	  
	  for (var i = 0; i < Downsha.ClipStyle.CORNOR_PERIMETERS.length; i++) {
	    valParts[i] = this["border-" + Downsha.ClipStyle.CORNOR_PERIMETERS[i] + "-radius"];
	    if (!valParts[i]) {
	      missing = true;
	      break;
	    }
	  }
	  
	  /**
	   * The four values for each radius are given in the order top-left, top-right, bottom-right, bottom-left. 
	   * If bottom-left is omitted it is the same as top-right. 
	   * If bottom-right is omitted it is the same as top-left. 
	   * If top-right is omitted it is the same as top-left.
	  */
	  if (missing) {
	  } else if (valParts[0] == valParts[1] && valParts[1] == valParts[2] && valParts[2] == valParts[3]) {
	    str = "border-radius:" + valParts[0] + ";";
	  } else {
	    str = "border-radius:" + valParts.join(" ") + ";";
	  }
	  
	  if (skipObj) {
	  	skipObj["border-radius"]              = null;
	    skipObj["border-top-left-radius"]     = null;
	    skipObj["border-top-right-radius"]    = null;
	    skipObj["border-bottom-left-radius"]  = null;
	    skipObj["border-bottom-right-radius"] = null;
	  }

	  return str;
	};
	Downsha.ClipStyle.prototype.toString_outline = function(skipObj) {
		//var str = this._toPerimeterExtraString("outline");
		var str = "";
		if (this["outline-style"] && this["outline-style"] != "none") {
		/**
		 * The outline shorthand property sets all the outline properties in one declaration.
		 * The properties that can be set, are (in order): outline-color, outline-style, outline-width.
		 * If one of the values above are missing, e.g. "outline:solid #ff0000;", 
		 * the default value for the missing property will be inserted, if any.
		 */			
			str += "outline:";
			if (this["outline-color"]) {
				str += this["outline-color"] + " ";
			}
			str += this["outline-style"];
			if (this["outline-width"]) {
				str += " " + this["outline-width"];
			}
			str += ";";
		}
	  
	  if (skipObj) {
	  	skipObj["outline"]       = null;
	    skipObj["outline-style"] = null;
	    skipObj["outline-width"] = null;
	    skipObj["outline-color"] = null;
	  }
	  
	  return str;
	};
	Downsha.ClipStyle.prototype._toPerimeterString = function(prop) {
	  var valParts = [];
	  var allEqual = true;
	  var missing = false;
	  var str = "";
	  
	  for (var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	    valParts[i] = this[prop + "-" + Downsha.ClipStyle.PERIMETERS[i]];
	    if (valParts[i]) {
	    	// chenmin 2012-07-09 ##### fast speed for IE only #####
	    	// IE style array only contains specific styles, e.g. margin-top, margin-right, not just margin.
	      //str += prop + "-" + Downsha.ClipStyle.PERIMETERS[i] + ":" + valParts[i] + ";";
	    } else {
	      missing = true;
	    }
	    if (i > 0 && allEqual && valParts[i] != valParts[i - 1]) {
	      allEqual = false;
	    }
	  }
	  
	  if (missing) {
	    return str;
	  } else if (allEqual) {
	    valParts = [valParts[0]];
	  } else if (valParts[0] == valParts[2] && valParts[1] == valParts[3]) {
	    valParts = [valParts[0], valParts[1]];
	  }
	  return prop + ":" + valParts.join(" ") + ";";
	};
	Downsha.ClipStyle.prototype._toPerimeterExtraString = function(prop) {
	  var perimParts = [];
	  var allEqual = true;
	  var str = "";
	  
	  for (var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	    var propPrefix = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
	    var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[propPrefix] || Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
	    if (extras instanceof Array) {
	      var part = "";
	      var partStr = "";
	      var missing = false;
	      
	      for ( var e = 0; e < extras.length; e++) {
	        var fullProp = propPrefix + "-" + extras[e];
	        if (this[fullProp]) {
	          part += this[fullProp] + ((e == extras.length - 1) ? "" : " ");
	          partStr += fullProp + ":" + this[fullProp] + ";";
	        } else {
	          missing = true;
	          allEqual = false;
	        }
	      }
	      
	      if (!missing) {
	        perimParts[i] = part;
	        str += propPrefix + ":" + part + ";";
	      } else {
	        str += partStr;
	      }
	    }
	    
	    if (i > 0 && allEqual && (!perimParts[i] || perimParts[i] != perimParts[i - 1])) {
	      allEqual = false;
	    }
	  }
	  
	  if (allEqual) {
	    return prop + ":" + perimParts[0] + ";";
	  } else {
	    return str;
	  }
	};
	Downsha.ClipStyle.prototype.toString = function() {
	  var str = "";
	  var skip = {};

		str += this.toString_background(skip);
		str += this.toString_margin(skip);
		str += this.toString_padding(skip);
		str += this.toString_border(skip);
		str += this.toString_border_radius(skip);
		str += this.toString_outline(skip);
	  
	  if (this.length > 0) {
	    for (var i in this) {
	      if (typeof this[i] != 'string'
	          || typeof this.constructor.prototype[i] != 'undefined'
	          || this[i].length == 0 || typeof skip[i] != 'undefined') {
	        continue;
	      }
	      str += i + ":" + this[i] + ";";
	    }
	  }
	  
	  return str;
	};	
	Downsha.ClipStyle.prototype.toJSON = function() {
	  var obj = {};
	  if (this.length > 0) {
	    for ( var i in this) {
	      if (typeof this[i] != 'string'
	          || typeof this.constructor.prototype[i] != 'undefined'
	          || this[i].length == 0)
	        continue;
	      obj[i] = this[i];
	    }
	  }
	  return obj;
	};
})();

(function() {
	Downsha.ClipStylingStrategy = function ClipStylingStrategy(win) {
	  this.initialize(win);
	};
	Downsha.ClipStylingStrategy.DEFAULT_FILTER = function(prop, val) {
	  // skip following styles: orphans, widows, speak, page-break, pointer-events
	  return (val && prop != "orphans" && prop != "widows" && prop != "speak"
	      && prop.indexOf("page-break") != 0 && prop.indexOf("pointer-events") != 0);
	};
	Downsha.ClipStylingStrategy.prototype.initialize = function(win) {
	  this.window = (win) ? win : window;
	};
	Downsha.ClipStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
	  return null;
	};
	Downsha.ClipStylingStrategy.prototype.getNodeView = function(node) {
	  var doc = (node.ownerDocument) ? node.ownerDocument : node.document;
	  var view = (doc.defaultView) ? doc.defaultView : this.window;
	  return view;
	};
	Downsha.ClipStylingStrategy.prototype.getNodeStyle = function(node, computed, filter) {
	  var thisFilter = (typeof filter == 'function') ? filter : Downsha.ClipStylingStrategy.DEFAULT_FILTER;
	  if (node && typeof node.nodeType == 'number' && node.nodeType == 1) { // element node
	    var view = this.getNodeView(node);
	    var computedStyleDefined = (typeof view["getComputedStyle"] == 'function') ? true : false;
	    var matchedRulesDefined = (typeof view["getMatchedCSSRules"] == 'function') ? true : false;
	    if (computed) { // getComputedStyle return current style of the element, however this style is set.
	      if (computedStyleDefined) { // for IE 9
		      return new Downsha.ClipStyle(view.getComputedStyle(node, ''), thisFilter);
		    } else if (node.currentStyle) { // for IE 6/7/8
		    	return new Downsha.ClipStyle(node.currentStyle, thisFilter);
		    	/*
		    	var currentStyle = {};
			    for (var prop in node.currentStyle) {
			    	// IE 6 returns 'unknown' for typeof node.currentStyle['rubyOverhang']
			      if ((typeof node.currentStyle[prop] == "string") ||
			       (typeof node.currentStyle[prop] == "number")) {
			        // if the css value is a unit we can try to compute, then try to convert it.
			        // currently, we only convert 4 kinds: em, ex, pt and percentage.
			        var val = node.currentStyle[prop];
			        // /^\d*\.?\d*\s*(em|ex|pt|%)$/i.test(val)
			        if ((typeof val == "string") && (val.length > 0) && (/^\d*\.?\d*\s*pt$/i.test(val))) {
			        	val = Math.round(Downsha.Utils.getPixelSize(node, val)) + "px";
			        }
			        // while window.getComputedStyle() in IE9/Firefox/Chrome refers style properties as hyphen cases.
			        // IE 6/7/8/9 style/currentStyle/runtimeStyle all refers style properties as camel case.
			        // now we need to transfer to hyphen case if it's a style/currentStyle/runtimeStyle object.
			        var hyphenProp = Downsha.Utils.toHyphenCase(prop);
			        currentStyle[hyphenProp] = val;
			      }
			    }
		    	return new Downsha.ClipStyle(currentStyle, thisFilter);
		    	*/
		    }
	    } else if (matchedRulesDefined) { // getMatchedCSSRules is only for webkit
	      return new Downsha.ClipStyle(view.getMatchedCSSRules(node, ''), thisFilter);
	    }
	  }
	  var clipStyle = new Downsha.ClipStyle();
	  clipStyle.setFilter(thisFilter);
	  return clipStyle;
	};
	Downsha.ClipStylingStrategy.prototype.getFontFaceRules = function() {
	  return Downsha.ClipStyle.findFontFaceRules(this.window.document);
	};
	Downsha.ClipStylingStrategy.prototype.cleanUp = function() {
	  return true;
	};
	Downsha.ClipStylingStrategy.prototype.styleForFloatClearingNode = function(node) {
		return null;
	};
})();


(function() {
	Downsha.ClipTextStylingStrategy = function ClipTextStylingStrategy(win) {
		this.initialize(win);
	};
	Downsha.inherit(Downsha.ClipTextStylingStrategy, Downsha.ClipStylingStrategy);
	Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES = {
		"b": null,
		"big": null,
		"em": null,
		"i": null,
		"small": null,
		"strong": null,
		"sub": null,
		"sup": null,
		"ins": null,
		"del": null,
		"s": null,
		"strike": null,
		"u": null,
		"code": null,
		"kbd": null,
		"samp": null,
		"tt": null,
		"var": null,
		"pre": null,
		"listing": null,
		"plaintext": null,
		"xmp": null,
		"abbr": null,
		"acronym": null,
		"address": null,
		"bdo": null,
		"blockquote": null,
		"q": null,
		"cite": null,
		"dfn": null
	};
	Downsha.ClipTextStylingStrategy.STYLE_ATTRS = {
		"font": null,
		"text": null,
		"color": null
	};
	Downsha.ClipTextStylingStrategy.COLOR_THRESH = 50; // maximum color value for human reading
	Downsha.ClipTextStylingStrategy.prototype.isFormatNode = function(node) {
		return (node && node.nodeType == 1 && // element node and in FORMAT_NODE_NAMES list
			typeof Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES[node.nodeName.toLowerCase()] != 'undefined');
	};
	Downsha.ClipTextStylingStrategy.prototype.hasTextNodes = function(node) {
		if (node && node.nodeType == 1 && node.childNodes.length > 0) { // whether parent is element node
			for (var i = 0; i < node.childNodes.length; i++) {
				if (node.childNodes[i].nodeType == 3) { // whether child is text node
					return true;
				}
			}
		}
		return false;
	};
	Downsha.ClipTextStylingStrategy.prototype.styleFilter = function(style) {
		var stylePrefix = Downsha.ClipStyle.stylePrefix(style.toLowerCase()); // *** only preserve styles prefix with color, font, text
		if (typeof Downsha.ClipTextStylingStrategy.STYLE_ATTRS[stylePrefix] != 'undefined') {
			return true;
		}
	};
	Downsha.ClipTextStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
		var nodeStyle = null;
		if (this.isFormatNode(node) || this.hasTextNodes(node)) {
			nodeStyle = this.getNodeStyle( // parent method, return a ClipStyle instance
				node, // only format nodes or nodes has text child.
				true, // use getComputedStyle
				this.styleFilter // only preserve styles prefix with color, font, text
			);
		}
		/**
		* adjust text color for better reading experience. (not too white)
		* suppose origin value: rgba(255,255,255,1), then changes to rgba(205,205,205,1)
		*/
		if (nodeStyle && nodeStyle["color"]){
			var color = nodeStyle["color"];
			var a = "";
			var colorParts = color.replace(/[^0-9,\s]+/g, "").replace(/[,\s]+/g, " ").split(/\s+/);
			var r = parseInt(colorParts[0]);
			r = (isNaN(r)) ? 0 : r;
			var g = parseInt(colorParts[1]);
			g = (isNaN(g)) ? 0 : r;
			var b = parseInt(colorParts[2]);
			b = (isNaN(b)) ? 0 : b;
			if ((r + g + b) > (255 - Downsha.ClipTextStylingStrategy.COLOR_THRESH)*3) {
				r = Math.max(0, r - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
				g = Math.max(0, g - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
				b = Math.max(0, b - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
			}
			nodeStyle["color"] = (colorParts.length == 4) ? 
				"rgba(" + [r, g, b, 1].join(", ") + ")" : 
				"rgb(" + [r, g, b].join(", ") + ")";
		}
		// preserve direction, if it's not ltr(left-to-right), then add direction style
		if (nodeStyle && !nodeStyle["direction"]) {
			var computedStyle = this.getNodeStyle(node, true);
			if (computedStyle && computedStyle["direction"] && computedStyle["direction"] != "ltr") {
				nodeStyle._addSimpleStyle("direction", computedStyle["direction"]);
			}
		}
		return nodeStyle;
	};
})();


(function() {
  Downsha.ClipFullStylingStrategy = function ClipFullStylingStrategy(win) {
    this.initialize(win);
  };
  Downsha.inherit(Downsha.ClipFullStylingStrategy, Downsha.ClipStylingStrategy);
  /*
  Downsha.ClipFullStylingStrategy.SKIP_UNDEFINED_PROPS = { // [NOT USED] skip following undefined properties
    "widows" : null,
    "orphans" : null,
    "pointer-events" : null,
    "speak" : null
  };
  */
  /*
  Downsha.ClipFullStylingStrategy.SKIP_DEFAULT_PROPS = { // skip following key-value pair
  	"width"                      : "auto",        // Inherited: no
    "height"                     : "auto",        // Inherited: no
    "left"                       : "auto",        // Inherited: no
    "right"                      : "auto",        // Inherited: no
    "top"                        : "auto",        // Inherited: no
    "bottom"                     : "auto",        // Inherited: no
    
    "background-image"           : "none",        // Inherited: no
    "background-position"        : "0% 0%",       // Inherited: no
    "background-repeat"          : "repeat",      // Inherited: no
    "background-attachment"      : "scroll",      // Inherited: no
    "background-clip"            : "border-box",  // Inherited: no
    "background-color"           : "transparent", // Inherited: no
    "background-origin"          : "padding-box", // Inherited: no
    "background-size"            : "auto",        // Inherited: no
    
    "border-bottom-color"        : "transparent", // Inherited: no [not specified]
    "border-bottom-left-radius"  : "0px",         // Inherited: no
    "border-bottom-right-radius" : "0px",         // Inherited: no
    "border-bottom-style"        : "none",        // Inherited: no [not specified]
    "border-bottom-width"        : "0px",         // Inherited: no [medium]
    
    "border-top-color"           : "transparent", // Inherited: no [not specified]
    "border-top-left-radius"     : "0px",         // Inherited: no 
    "border-top-right-radius"    : "0px",         // Inherited: no 
    "border-top-style"           : "none",        // Inherited: no [not specified]
    "border-top-width"           : "0px",         // Inherited: no [medium]
    
    "border-left-color"          : "transparent", // Inherited: no [not specified] 
    "border-left-style"          : "none",        // Inherited: no [not specified] 
    "border-left-width"          : "0px",         // Inherited: no [medium]
    
    "border-right-color"         : "transparent", // Inherited: no [not specified] 
    "border-right-style"         : "none",        // Inherited: no [not specified] 
    "border-right-width"         : "0px",         // Inherited: no [medium]
    
    "border-collapse"            : "separate",    // Inherited: yes
    "border-spacing"             : "0px 0px",     // Inherited: yes [not specified] 
    
    "box-shadow"                 : "none",        // Inherited: no
    "caption-side"               : "top",         // Inherited: yes
    "clear"                      : "none",        // Inherited: no [auto]
    "clip"                       : "auto",        // Inherited: no
    //"color"                    : "",            // Inherited: yes [not specified] 
    "content"                    : "normal",      // Inherited: no
    "counter-increment"          : "none",        // Inherited: no
    "counter-reset"              : "none",        // Inherited: no
    "cursor"                     : "auto",        // Inherited: yes    
    "direction"                  : "ltr",         // Inherited: yes
    //"display"                  : "inline",      // Inherited: no
    "empty-cells"                : "show",        // Inherited: yes
    "float"                      : "none",        // Inherited: no [auto]
    
    //"font-family"              : "",            // Inherited: yes [not specified] 
    //"font-size"                : "medium",      // Inherited: yes
    "font-size-adjust"           : "none",        // Inherited: yes
    "font-stretch"               : "normal",      // Inherited: yes
    "font-style"                 : "normal",      // Inherited: yes
    "font-variant"               : "normal",      // Inherited: yes
    "font-weight"                : "normal",      // Inherited: yes
    
    "letter-spacing"             : "normal",      // Inherited: yes
    "list-style-image"           : "none",        // Inherited: yes
    "list-style-position"        : "outside",     // Inherited: yes
    "list-style-type"            : "none",        // Inherited: yes ["disc" for <ul> and "decimal" for <ol>]
    
    "margin-bottom"              : "0px",         // Inherited: no
    "margin-left"                : "0px",         // Inherited: no
    "margin-right"               : "0px",         // Inherited: no
    "margin-top"                 : "0px",         // Inherited: no
    
    "max-height"                 : "none",        // Inherited: no
    "max-width"                  : "none",        // Inherited: no
    "min-height"                 : "0px",         // Inherited: no
    "min-width"                  : "0px",         // Inherited: no
    
    "opacity"                    : "1",           // Inherited: no
    "outline-color"              : "transparent", // Inherited: no [invert]
    "outline-style"              : "none",        // Inherited: no
    "outline-width"              : "0px",         // Inherited: no [medium]
    
    "overflow"                   : "visible",     // Inherited: no
    "overflow-x"                 : "visible",     // Inherited: no
    "overflow-y"                 : "visible",     // Inherited: no
    
    "padding-bottom"             : "0px",         // Inherited: no
    "padding-left"               : "0px",         // Inherited: no
    "padding-right"              : "0px",         // Inherited: no
    "padding-top"                : "0px",         // Inherited: no
    
    //"position"                 : "static",      // Inherited: no
    
    "table-layout"               : "auto",        // Inherited: no
    "text-align"                 : "left",        // Inherited: yes [left if direction is ltr, and right if direction is rtl]
    "text-anchor"                : "start",
    "text-decoration"            : "none",        // Inherited: no
    "text-indent"                : "0px",         // Inherited: yes
    "text-overflow"              : "clip",        // Inherited: no
    "text-transform"             : "none",        // Inherited: yes
    
    "vertical-align"             : "baseline",    // Inherited: no
    //"visibility"               : "visible",     // Inherited: yes
    "word-spacing"               : "0px",         // Inherited: yes [normal]
    "z-index"                    : "auto"         // Inherited: no
  };
  */
	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP = { // no inherited styles. currently keep 48 elements
		"*": [
			"width", "height", "bottom", "left", "right", "top", 
			/*"font", */"font-size", "font-style", "font-variant", "font-weight", "color", 
			/*"background", */"background-image", "background-color", "background-position", "background-repeat", 
			/*"border-bottom", */"border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", 
			/*"border-left", */"border-left-color", "border-left-style", "border-left-width", 
			/*"border-right", */"border-right-color", "border-right-style", "border-right-width", 
			/*"border-top", */"border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
			"border-collapse", "border-spacing", 
			/*"margin", */"margin-bottom", "margin-left", "margin-right", "margin-top", 
			/*"padding", */"padding-bottom", "padding-left", "padding-right", "padding-top", 
			"clear", "display", "float", 
			/*"list-style", */"list-style-type", "position", "text-decoration"], 
		"img": ["width", "height"]
	};
	/*
  Downsha.ClipFullStylingStrategy.LIST_NODES = { // [NOT USED]
    "UL" : null,
    "OL" : null,
    "LI" : null
  };
  Downsha.ClipFullStylingStrategy.NODE_PROPS = { // [NOT USED]
    "BR" : [ "clear", "padding", "margin", "line-height", "border", "white-space" ]
  };
  Downsha.ClipFullStylingStrategy.TEXT_NODES = { // [NOT USED]
    "A" : null,
    "B" : null,
    "BIG" : null,
    "EM" : null,
    "I" : null,
    "SMALL" : null,
    "STRONG" : null,
    "SUB" : null,
    "SUP" : null,
    "INS" : null,
    "DEL" : null,
    "S" : null,
    "STRIKE" : null,
    "U" : null,
    "CODE" : null,
    "KBD" : null,
    "SAMP" : null,
    "TT" : null,
    "VAR" : null,
    "PRE" : null,
    "LISTING" : null,
    "PLAINTEXT" : null,
    "XMP" : null,
    "ABBR" : null,
    "ACRONYM" : null,
    "ADDRESS" : null,
    "BDO" : null,
    "BLOCKQUOTE" : null,
    "Q" : null,
    "CITE" : null,
    "DFN" : null
  };
  */
  /*
	Downsha.ClipFullStylingStrategy.prototype.styleFilter = function(prop, val) {
		if (typeof Downsha.ClipFullStylingStrategy.SKIP_DEFAULT_PROPS[prop] != 'undefined' && 
			Downsha.ClipFullStylingStrategy.SKIP_DEFAULT_PROPS[prop] == val) {
			return false;
		}
		
		return true;
	};
	*/
	Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
    
    var matchedStyle = this.getNodeStyle(node, true, null);
    var parentStyle = null;
    if (node.parentNode) {
    	parentStyle = this.getNodeStyle(node.parentNode, true, null);
    }
    
    var isRoot = (node == root || node.nodeName == "BODY") ? true : false;
    if (!isRoot) {
    	var keepers = Downsha.ClipFullStylingStrategy.ALWAYS_KEEP["*"];
    	matchedStyle.deriveStyle(parentStyle, matchedStyle, keepers);
    }

    if (fullPage) {
    	this.evaluateWidth(root, node, matchedStyle, parentStyle);
    }
    
    if (isRoot) { // special handling of root element
			// remove unnecessary margin from root element
			matchedStyle._addSimpleStyle("padding", "0px");
			matchedStyle._addSimpleStyle("margin", "0px");
			
			if (matchedStyle["position"]) {
				matchedStyle["position"] = "relative";
			} else {
				matchedStyle._addSimpleStyle("position", "relative");
			}
			
			if (!fullPage) {
				this.processRootNodeStyles(node, matchedStyle, false);
			}
    }

    // adjust absolute positioning on root and its immediate children when not fullPage
    if (!fullPage) {
	    var rect = this.getOffsetRect(root);
	    root._downsha_absolute_xOffset = rect.left;
	    root._downsha_absolute_yOffset = rect.top;    	
    	if (matchedStyle["position"] == "absolute") {
    		this.evaluateAbsolutePosition(root, node, matchedStyle);
    	}
    }

    // add inline style attributes
    if (typeof node.style != "undefined") {
			var inlineStyle = node.style;
			
			// the getPropertyValue() method works for IE 9/Firefox/Chrome.
			// the getAttribute() method provides similar functionality in IE all versions.
			if (inlineStyle.getPropertyValue) { // for IE 9
				// [typeof node.style.length] IE 6/7/8 returns undefined
				for (var i = 0; i < inlineStyle.length; i++) {
					matchedStyle._addSimpleStyle(inlineStyle[i], inlineStyle.getPropertyValue(inlineStyle[i]));
				}
			} else { // for IE 6/7/8
				// TODO style.cssText: "POSITION: relative; WIDTH: 100%; HEIGHT: 24px"
				// "Z-INDEX: 2147483647; BORDER-BOTTOM: 0px; POSITION: fixed; TEXT-ALIGN: left !important; 
				// BORDER-LEFT: 0px; PADDING-BOTTOM: 0px !important; PADDING-LEFT: 0px !important; WIDTH: 0px; 
				// PADDING-RIGHT: 0px !important; HEIGHT: 0px; VISIBILITY: visible; MARGIN-LEFT: 0px; FONT-SIZE: 0px; 
				//OVERFLOW: hidden; BORDER-TOP: 0px; BORDER-RIGHT: 0px; PADDING-TOP: 0px !important; TOP: 0px; LEFT: 0px"
				// LOG.debug("inlineStyle cssText: " + inlineStyle.cssText);
				/*
				for (var i in inlineStyle) {
					if (typeof inlineStyle[i] != 'function') {
						//LOG.debug("inlineStyle prop: " + i + " val: " + inlineStyle.getAttribute(i));
					}
				}
				*/
			}
    }
    
    // 2012-07-06 following code call Utils.absoluteUrl to make "background-image" url absolute. (add document base url)
		// suppose document base url is : "http://www.host.com/path", 
		// 1. url starts with "//", like: "//www.host.com/index.php", then change to: "http://www.host.com/index.php"
		// 2. url starts with "/", like: "/index.php", then change to: "http://www.host.com/index.php"
		// 3. url starts with "./", "../", like: "./index.php", then change to: "http://www.host.com/./index.php"
		// 4. url starts with other, like: "index.php", then change to: "http://www.host.com/path/index.php"
		var backgroundImage = matchedStyle["background-image"];
    if ((typeof backgroundImage == "string") && (backgroundImage.length > 0) && 
    (backgroundImage.substring(0, 3).toLowerCase().indexOf("url") == 0)) {
    	
    	var backgroundParts = backgroundImage.match(/url\s*\(\s*(?:\\)?['"]?\s*([-a-z0-9_:\\@&?=+,.!/~*%\\$]+)\s*(?:\\)?['"]?\s*\)/i);
    	if (backgroundParts && backgroundParts[1]) {
    		var imageUrl = backgroundParts[1];
				if ((typeof imageUrl == "string") && (imageUrl.length > 0) && 
					(imageUrl.substring(0, 4).toLowerCase().indexOf("http") != 0) && 
					(imageUrl.substring(0, 11).toLowerCase().indexOf("data:image/") != 0)) {
					
					var doc = (node.ownerDocument) ? node.ownerDocument : node.document;
					if (doc) {
						var docUrl = (doc.URL) ? doc.URL : doc.location.href;
						if (docUrl) {
							var baseUrl = docUrl.replace(/[^\/]+$/, ""); // trim end part of pathname
							if (baseUrl) {
								imageUrl = Downsha.Utils.absoluteUrl(imageUrl, baseUrl);
							}
						}
					}
				}
				if (imageUrl.substring(0, 4).toLowerCase().indexOf("http") == 0) {
					imageUrl = Downsha.Utils.escapeURL(imageUrl);
					matchedStyle["background-image"] = "url('" + imageUrl + "')";
				}
    	}
    }
    
    // 2012-07-06 "quotes" is NOT in style array of IE 6/7/8/9
    //matchedStyle.removeStyle("quotes");
    
    return matchedStyle;
  };

	Downsha.ClipFullStylingStrategy.prototype.evaluateWidth = function(root, node, styles, parentStyle) {
		if ((parseInt(styles["margin-left"]) == 0 && parseInt(styles["margin-right"]) == 0)
			&& ((parseInt(parentStyle.width) - parseInt(node.offsetWidth )) / 2 == parseInt(node.offsetLeft))) {
			styles._addSimpleStyle("margin-left", "auto");
			styles._addSimpleStyle("margin-right", "auto");
		}
	};

	Downsha.ClipFullStylingStrategy.prototype.processRootNodeStyles = function(rootNode, matchedStyle, isBgStylesInherit) {
		matchedStyle._addSimpleStyle("padding", "0px");
		matchedStyle._addSimpleStyle("margin", "0px");
		matchedStyle._addSimpleStyle("position", "relative");
		
		if (isBgStylesInherit) {
			var bgStyle = this._inhBackgroundForNode(rootNode, true);
			
			if (matchedStyle["background-image"] == "none") {
				matchedStyle.removeStyle( "background-image" );
				matchedStyle.removeStyle( "background-repeat" );
				matchedStyle.removeStyle( "background-position" );
			}
			
			if (matchedStyle["background-color"] == "transparent") {
				matchedStyle.removeStyle("background-color");
			}
			
			if (bgStyle.length > 0) {
				matchedStyle.mergeStyle(bgStyle, false);
			}
			
			// deduce font properties on root element if not fullPage
			var fontStyle = this._inhFontForNode(rootNode, true);
			if (fontStyle.length > 0) {
				matchedStyle.mergeStyle(fontStyle, false);
			}
			
			// remove floating on root element if not fullPage
			if (matchedStyle["float"]) {
				matchedStyle.removeStyle("float");
			}
		}
	};
	
	Downsha.ClipFullStylingStrategy.prototype.evaluateAbsolutePosition = function(rootNode, relativeNode, relativeNodeStyles) {
		if (!relativeNodeStyles) {
			relativeNodeStyles = this.getNodeStyle(relativeNode, null);
		}
		
		var rect = this.getOffsetRect(relativeNode);
		var xDelta = rect.left;
		var yDelta = rect.top;
		
		if (typeof rootNode._downsha_absolute_xOffset == 'number' && typeof rootNode._downsha_absolute_yOffset == 'number' ) {
			xDelta = Math.max(0, xDelta - rootNode._downsha_absolute_xOffset);
			yDelta = Math.max(0, yDelta - rootNode._downsha_absolute_yOffset);
			
			relativeNodeStyles._addSimpleStyle("left", xDelta + "px");
			relativeNodeStyles._addSimpleStyle("top", yDelta + "px");
		}
		else {
			rootNode._downsha_absolute_xOffset = xDelta;
			rootNode._downsha_absolute_yOffset = yDelta;
			
			relativeNodeStyles._addSimpleStyle("top", "0px");
			relativeNodeStyles._addSimpleStyle("left", "0px");
		}
		
		relativeNodeStyles.removeStyle("right");
		relativeNodeStyles.removeStyle("bottom");
	};
	
	Downsha.ClipFullStylingStrategy.prototype.getOffsetRect = function(elem) {
		var box = elem.getBoundingClientRect();
		var body = elem.ownerDocument.body;
		var docElem = elem.ownerDocument.documentElement;
		
		// pageXOffset/pageYOffset is NOT supported in IE 6/7/8
		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		
		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;
		
		return {top: Math.round(top), left: Math.round(left)};
	};
	/*
	Downsha.ClipFullStylingStrategy.prototype.styleFilter = function(style) {
		if (typeof Downsha.ClipFullStylingStrategy.SKIP_UNDEFINED_PROPS[style] != 'undefined') {
			return false;
		}
		return true;
	};
  Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
    var computedStyle = this.getNodeStyle(node, true, this.styleFilter); // getComputedStyle/currentStyle return list
    var isRoot = (node == root) ? true : false;
    
    if (isRoot) { // special handling of root element
      // remove unnecessary margin from root element
      // margin: 0px; position: relative
      computedStyle._addSimpleStyle("margin", "0px");
      if (computedStyle["position"]) {
        computedStyle["position"] = "relative";
      } else {
        computedStyle._addSimpleStyle("position", "relative");
      }
      if (!fullPage) {
        // deduce background properties on root element if not fullPage
        var bgStyle = this._inhBackgroundForNode(node, true);
        if (bgStyle.length > 0) {
          computedStyle.mergeStyle(bgStyle, false);
        }
        // deduce font properties on root element if not fullPage
        var fontStyle = this._inhFontForNode(node, true);
        if (fontStyle.length > 0) {
          computedStyle.mergeStyle(fontStyle, false);
        }
        // remove floating on root element if not fullPage
        if (computedStyle["float"]) {
          computedStyle.removeStyle("float");
        }
      }
    } else {
    	var parentNode = (node.parentNode) ? node.parentNode : node.parentElement;
    	if (parentNode) {
	    	var parentStyle = this.getNodeStyle(parentNode, true, this.styleFilter); //*** parent computed styles
	    	if (parentStyle) {
		      var keepers = (typeof Downsha.ClipFullStylingStrategy.ALWAYS_KEEP[node.nodeName.toLowerCase()] != 'undefined') ? 
		      	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP[node.nodeName.toLowerCase()] : 
		      	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP["*"];
		      // remove styles which already exists in parent node, 
		      // except those defined in nodeMatchedStyle (empty) and keepers (font,text,color,margin,padding,etc).
		      computedStyle.deriveStyle(parentStyle, null, keepers); // derive some styles from parent and matched
		    }
    	}
    }
    
    // because canvas elements do not preserve their drawn state, 
    // we preserve it via background-image property
    if (node.nodeName == "CANVAS" && typeof node.toDataURL == 'function') {
      computedStyle._addSimpleStyle("background-image", "url(" + node.toDataURL() + ")");
    } else if (node.nodeName == "OBJECT" || node.nodeName == "EMBED") {
      computedStyle._addSimpleStyle("width", computedStyle["width"]);
      computedStyle._addSimpleStyle("min-width", computedStyle["width"]);
      computedStyle._addSimpleStyle("max-width", computedStyle["width"]);
      computedStyle._addSimpleStyle("height", computedStyle["height"]);
      computedStyle._addSimpleStyle("min-height", computedStyle["height"]);
      computedStyle._addSimpleStyle("max-height", computedStyle["height"]);
      computedStyle._addSimpleStyle("display", computedStyle["display"]);
      computedStyle._addSimpleStyle("overflow", computedStyle["hidden"]);
    }
    
    // adjust absolute positioning on root and its immediate children when not fullPage
    // if position is absolute, then left -= margin-left, top -= margin-top
    if (!fullPage && (isRoot || node.parentElement == root)) {
      if (computedStyle["position"] == "absolute") {
        var rect = node.getBoundingClientRect();
        var ml = parseInt(computedStyle["margin-left"]);
        var mt = parseInt(computedStyle["margin-top"]);
        var xDelta = rect.left - ((isNaN(ml)) ? 0 : ml);
        var yDelta = rect.top - ((isNaN(mt)) ? 0 : mt);
        if (typeof root._downsha_absolute_xOffset == 'number'
            && typeof root._downsha_absolute_yOffset == 'number') {
          var xDelta = Math.max(0, xDelta - root._downsha_absolute_xOffset);
          var yDelta = Math.max(0, yDelta - root._downsha_absolute_yOffset);
          computedStyle._addSimpleStyle("left", xDelta + "px");
          computedStyle._addSimpleStyle("top", yDelta + "px");
        } else {
          root._downsha_absolute_xOffset = xDelta;
          root._downsha_absolute_yOffset = yDelta;
          computedStyle._addSimpleStyle("top", "0px");
          computedStyle._addSimpleStyle("left", "0px");
        }
        computedStyle.removeStyle("right");
        computedStyle.removeStyle("bottom");
      }
    }
    return computedStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._hasTextOnlyChildren = function(node) { // all children are text nodes
    if (node) {
    	var totalChildren = (node.childElementCount) ? node.childElementCount : node.children.length;
      if (totalChildren == 0) {
        return true;
      } else {
        for ( var i = 0; i < totalChildren; i++) {
          if (typeof this.constructor.TEXT_NODES[node.children[i]] == 'undefined') {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  };
  Downsha.ClipFullStylingStrategy.prototype._mergeBoundingRects = function(a, b) { //union set of two rects
    a.left = Math.min(a.left, b.left);
    a.right = Math.max(a.right, b.right);
    a.top = Math.min(a.top, b.top);
    a.bottom = Math.max(a.bottom, b.bottom);
    a.width = a.right - a.left;
    a.height = a.bottom - a.top;
  };
  */
  Downsha.ClipFullStylingStrategy.prototype._inhBackgroundForNode = function(node, recur) {
    LOG.debug("ClipFullStylingStrategy._inhBackgroundForNode");
    var parent = node.parentNode;
    var styles = []; // ancestor styles
    var nodes = []; // ancestor nodes
    var bgExtraAttrs = [
    	"background-repeat-x",
    	"background-repeat-y",
    	"background-position-x",
    	"background-position-y",
    	"background-origin",
    	"background-size" ];

    // walk up the DOM and grab parent elements that contain background specifics
    var topElement = (this.window.document.body.parentElement) ? 
    	this.window.document.body.parentElement : this.window.document.body;
    while (parent) {
      nodes.push(parent);
      styles.push(this.getNodeStyle(parent, true, function(p, v) { // filter function
        if ((p == "background-color")
            || (p == "background-image" && v != "none")
            || (bgExtraAttrs.indexOf(p) >= 0) || p == "opacity"
            || p == "filter") {
          return true;
        }
        return false;
      }));
      if (!recur || parent == topElement) {
        break;
      } else {
        parent = parent.parentElement;
      }
    }
    LOG.debug("Retracted " + styles.length + " styles");
    // walk thru all the collected styles (same order as traversing up the tree)
    // and gather background specifics
    var bgStyle = new Downsha.ClipStyle();
    var _bgColorSet = 0;
    for ( var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var n = nodes[i];
      // set background-color - it's the most important one...
      if (s["background-color"]
          && s["background-color"] != "transparent" // not transparent
          && !s["background-color"].match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/) // alpha != 0
          && !bgStyle["background-color"]) {
        LOG.debug("Setting background-color: " + s["background-color"]);
        _bgColorSet = i;
        bgStyle._addSimpleStyle("background-color", s["background-color"]);
      } // end background-color
      
      // set background image only if it hasn't been set already and the bg color
      // wasn't set previously; also determine repetition and positioning
      if (s["background-image"] && !bgStyle["background-image"]
          && (i == _bgColorSet || !bgStyle["background-color"])) {
        LOG.debug("Adding background-image: " + s["background-image"]);
        bgStyle._addSimpleStyle("background-image", s["background-image"]);
        for ( var x = 0; x < bgExtraAttrs.length; x++) {
          var bgAttr = bgExtraAttrs[x];
          if (s[bgAttr] && bgAttr.indexOf("background-repeat") < 0) { // skip repeat-x/y of background image
            LOG.debug("Adding " + bgAttr);
            bgStyle._addSimpleStyle(bgAttr, s[bgAttr]);
          }
        }
        // process repeat-x/y of background image now
        var _rx = (s["background-repeat-x"] && s["background-repeat-x"] != "initial") ? 
        	s["background-repeat-x"] : "no-repeat";
        var _ry = (s["background-repeat-y"] && s["background-repeat=y"] != "initial") ? 
        	s["background-repeat-y"] : "no-repeat";
        bgStyle._addSimpleStyle("background-repeat-x", _rx);
        bgStyle._addSimpleStyle("background-repeat-y", _rx);
        bgStyle._addSimpleStyle("background-repeat", _rx + " " + _ry);
        
        // compute exact position of background image
        if (n) {
          // get offset between ancstor node and current node
          LOG.debug("Dettermining background image offset");
          var bgNodeStyle = s;
          var bgNodeRect = n.getBoundingClientRect(); // ancestor node rect
          LOG.debug("bgNodeRect left: " + bgNodeRect.left + "; top: " + bgNodeRect.top);
          var nodeRect = node.getBoundingClientRect(); // current node rect
          LOG.debug("nodeRect left: " + nodeRect.left + "; top: " + nodeRect.top);
          var yDelta = nodeRect.top - bgNodeRect.top;
          var xDelta = nodeRect.left - bgNodeRect.left;
          LOG.debug("xDelta: " + xDelta + "; yDelta: " + yDelta);
          
          // get origin position of background image
          var view = this.getNodeView(n);
          if (typeof view.getComputedStyle != "undefined") {
	          var bgNodeComputedStyle = view.getComputedStyle(n);
	          var bgNodeBgPosX = bgNodeComputedStyle.getPropertyValue("background-position-x");
	          var bgNodeBgPosY = bgNodeComputedStyle.getPropertyValue("background-position-y");
	        } else if (n.currentStyle) {
	        	var bgNodeBgPosX = n.currentStyle.backgroundPositionX;
	        	var bgNodeBgPosY = n.currentStyle.backgroundPositionY;
	        }
          LOG.debug("bg position: " + bgNodeBgPosX + " " + bgNodeBgPosY);
          var origPosX = 0;
          var origPosY = 0;
          if (bgNodeBgPosX.indexOf("%") > 0) {
            origPosX = bgNodeRect.width * (parseInt(bgNodeBgPosX) / 100);
          } else {
            origPosX = parseInt(bgNodeBgPosX);
          }
          if (bgNodeBgPosY.indexOf("%") > 0) {
            origPosY = bgNodeRect.height * (parseInt(bgNodeBgPosY) / 100);
          } else {
            origPosY = parseInt(bgNodeBgPosY);
          }
          if (isNaN(origPosX)) {
            origPosX = 0;
          }
          if (isNaN(origPosY)) {
            origPosY = 0;
          }
          LOG.debug("origPosX: " + origPosX + "; origPosY: " + origPosY);
          
          // compute new position of background image
          var xOffset = 0 - xDelta + origPosX;
          var yOffset = 0 - yDelta + origPosY;
          LOG.debug("xOffset: " + xOffset + "; yOffset: " + yOffset);
          bgStyle._addSimpleStyle("background-position", xOffset + "px " + yOffset + "px");
        }
      } // end background-image
      
      if (s["opacity"]
          && !bgStyle["opacity"]
          && !isNaN(parseFloat(s["opacity"]))
          && (typeof bgStyle["opacity"] == 'undefined' || parseFloat(s["opacity"]) < parseFloat(bgStyle["opacity"]))) {
        bgStyle._addSimpleStyle("opacity", s["opacity"]);
      } // end opacity
      
      if (s["filter"]
          && !bgStyle["filter"]
          && (typeof bgStyle["filter"] == 'undefined' || parseFloat(s["filter"]
              .replace(/[^0-9]+/g, "")) < parseFloat(bgStyle["filter"].replace(
              /[^0-9]+/g, "")))) {
        bgStyle._addSimpleStyle("filter", s["filter"]);
      } // end filter
    }
    return bgStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._inhFontForNode = function(node, recur) {
    var parent = node.parentNode;
    var styles = [];
    var nodes = [];
    var attrs = [ "font-family", "color", "line-height" ]; // only need these styles
    
    // walk up the DOM and grab parnet elements that contain background specifics
    while (parent) {
      nodes.push(parent);
      styles.push(this.getNodeStyle(parent, true, function(p, v) {
        if (attrs.indexOf(p) >= 0) {
          return true;
        }
        return false;
      }));
      if (!recur || parent == this.window.document.body) {
        break;
      } else {
        parent = parent.parentElement;
      }
    }
    
    // walk thru all the collected styles (same order as traversing up the tree)
    // and gather background specifics
    var bgStyle = new Downsha.ClipStyle();
    for ( var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var n = nodes[i];
      for ( var a = 0; a < attrs.length; a++) {
        if (!bgStyle[attrs[a]] && s[attrs[a]]) {
          LOG.debug("Adding " + attrs[a] + ": " + s[attrs[a]]);
          bgStyle._addSimpleStyle(attrs[a], s[attrs[a]]);
        }
      }
    }
    return bgStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype.cleanUp = function() {
    /*
    if (this._dirty) {
      var els = this.window.document.getElementsByTagName("*");
      for ( var i = 0; i < els.length; i++) {
        delete els[i][this.constructor.COMPUTED_STYLE_KEY];
      }
    }
    */
    return true;
  };
  Downsha.ClipFullStylingStrategy.prototype.styleForFloatClearingNode = function(node) {
    if (node) {
      var style = new Downsha.ClipStyle();
      style._addSimpleStyle("clear", "both");
      style._addSimpleStyle("width", "0px");
      style._addSimpleStyle("height", "0px");
      return style;
    }
    return null;
  };
})();
/**
 * @author: chenmin
 * @date: 2011-10-23
 * @desc: content clip script for FullPage/Selection/Article/URL
 * ContentClipper call Clip ojbect to perform clip action
 * ContentClipper also shows clipping wait icon and text while start clipping
 */

(function() {
  Downsha.ContentClipper = function ContentClipper(win, notifier, stylingStrategy) {
    this.initialize(win, notifier, stylingStrategy);
  };
  Downsha.inherit(Downsha.ContentClipper, Downsha.AbstractStyleScript);

  Downsha.ContentClipper.prototype.window = null;
  Downsha.ContentClipper.prototype.notifier = null;
  Downsha.ContentClipper.prototype.stylingStrategy = null;
  Downsha.ContentClipper.prototype.WAIT_CONTAINER_ID = "downshaContentClipperWait"; // show clipping status
	Downsha.ContentClipper.prototype.CLIP_WAIT_DELAY_TIME = 50;
	Downsha.ContentClipper.prototype.CLIP_SUCCESS_DELAY_TIME = 2000;
  Downsha.ContentClipper.prototype.clip = null; // Downsha.Clip object
  Downsha.ContentClipper.prototype.article = null;
  Downsha.ContentClipper.prototype.initialStyleSheetUrls = [{
  	id : "downshaClipperCSSCode",
		code : "/* css code for downsha clipper */" +	
			"#downshaContentClipperWait{" + 
			((Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) ? 
			"  position: absolute;" : // for IE 6 and quirks mode, cuz IE 6 and quirks mode doesn't recognize fixed
			"	 position: fixed;") + // for IE 7/8/9, fixed position relative to screen
			((Downsha.Platform.getIEVersion() <= 9) ? // at the top of all layers
			"	 z-index: 2147483647;" : 
			"	 z-index: 9999999999999999;") + 
			"	 padding: 0;" + 
			"	 margin: 0;" + 
			"	 left: 50%;" +  // horizontal center
			"	 top: 50%;" +  // vertical center
			"  width: 120px;" + // TODO IE 6/7 doesn't show div until specify width and height
			"  height: 40px;" + 
			"  filter: alpha(opacity=70)" + // transparent value
			"	 display: block;" + 
			"  font-family: Simsun, Arial Narrow, HELVETICA;" + // general font
			"}" + 
			"#downshaContentClipperWait *{" + 
			"	 display: block!important;" + 
			"}" + 
			"#downshaContentClipperWaitContent{" + 
			"	 background: black;" + 
			"	 color: white;" +  // content text color
			"  width: 120px;" + 
			"  height: 20px;" + 
			"	 padding: 10px 5px;" + 
			"	 border-radius: 5px;" + // border-radius works for IE 9
			"	 font-size: 16px;" + // content font size
			"}" + 
			"#downshaContentClipperWaitText{" + 
			"	 margin: 0;" + 
			"	 padding: 0;" + 
			"	 float: none;" + 
			"	 display: inline;" + 
			"	 letter-spacing: 1pt;" + 
			"	 line-height: 18px;" + 
			"  white-space: nowrap;" + 
			"  text-overflow: ellipsis;" + 
			"  text-align: center;" + 			
			"}" + 
			"#downshaContentClipperWait img{" + 
			"	 display: inline;" + 
			"	 float: left;" + 
			"	 margin: 0 0 0 4px;" + 
			"	 padding: 0;" + 
			"	 border: none;" + 
			"}"
  }];

  Downsha.ContentClipper.prototype.initialize = function(win, notifier, stylingStrategy) {
  	LOG.debug("ContentClipper.initialize");
    this.window = (win) ? win : window;
    this.notifier = (notifier) ? notifier : null;
    this.stylingStrategy = (stylingStrategy) ? stylingStrategy : Downsha.ClipFullStylingStrategy;
    Downsha.ContentClipper.parent.initialize.apply(this, [win]);
  };
	Downsha.ContentClipper.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	
  Downsha.ContentClipper.prototype.onClip = function(clip) {
  };
  Downsha.ContentClipper.prototype.onClipContent = function(clip) {
  	if (this.notifier) {
  		this.notifier.handlePageClipSuccess(clip.toDataObject());
  	}
  };
  Downsha.ContentClipper.prototype.onClipFailure = function(error) {
  	if (this.notifier) {
  		this.notifier.handlePageClipFailure(error);
  	}
  };
  Downsha.ContentClipper.prototype.onClipContentFailure = function(error) {
  	if (this.notifier) {
  		this.notifier.handlePageClipFailure(error);
  	}
  };
  Downsha.ContentClipper.prototype.onClipContentTooBig = function(clip) {
  	if (this.notifier) {
  		this.notifier.handlePageClipTooBig(clip.toDataObject());
  	}
  };
  
  Downsha.ContentClipper.prototype.doClip = function(fn, showWait) {
    var self = this;
    if (showWait) {
      this.showWaiter();
      this.window.setTimeout(function() {
      	fn();
      	self.showSuccess();
      }, self.CLIP_WAIT_DELAY_TIME);
    } else {
    	fn();
    }
  };

  Downsha.ContentClipper.prototype.perform = function(fullPageOnly, showWait) {
    var self = this;
    this.doClip(function() {
      self._perform(fullPageOnly);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipSelection = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipSelection");
    var self = this;
    this.doClip(function() {
      self._clipSelection(attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipFullPage = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipFullPage");
    var self = this;
    this.doClip(function() {
      self._clipFullPage(attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipArticle = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipArticle");
    var self = this;
    this.doClip(function() {
      self._clipArticle(attrs);
    }, showWait);
  };
  
  Downsha.ContentClipper.prototype.clipUrl = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipUrl");
    var self = this;
    this.doClip(function() {
      self._clipUrl(attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.getArticleElement = function() {
  	// check if article was remembered
  	var articleNode = Downsha.getIEExtension().getPreviewer().getRememberedPreview();
  	if (articleNode) {
  		return articleNode;
  	}
	  
    // check if article can be extracted now
    if (this.getArticle()) {
    	var resNode = this.getArticle().content.asNode();
    	if (resNode) {
    		Downsha.getIEExtension().getPreviewer().rememberPreview(resNode);
    		return resNode;
    	}
    }
    return null;
  };

  Downsha.ContentClipper.prototype.getArticle = function() {
    if (!this.article) {
      var ex = new ExtractContentJS.LayeredExtractor();
      ex.addHandler(ex.factory.getHandler('Heuristics'));
      var res = ex.extract(this.window.document);
      if (res.isSuccess) {
        this.article = res;
      }
    }
    return this.article;
  };

  Downsha.ContentClipper.prototype._clipSelection = function(attrs) {
    LOG.debug("ContentClipper._clipSelection");
    this._perform(false, attrs);
  };

  Downsha.ContentClipper.prototype._clipFullPage = function(attrs) {
    LOG.debug("ContentClipper._clipFullPage");
    this._perform(true, attrs);
  };

  Downsha.ContentClipper.prototype._clipArticle = function(attrs) {
    LOG.debug("ContentClipper._clipArticle");
    this.createClipObject(); // construct Downsha.Clip
    var el = this.getArticleElement();
    LOG.debug("Article element: " + el);

    try {
      if (el && this.clip.clipElement(el)) { // clip article element
        this._overloadClipNote(this.clip, attrs);
        LOG.debug("Successful clip of element's contents: " + this.clip.toString());
        LOG.dir(this.clip.toDataObject());

        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
          LOG.debug("ContentClipper._clipArticle clip content too big");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else {
        LOG.debug("ContentClipper._clipArticle clip failure");
        this.onClipFailure(Downsha.i18n.getMessage("articleClipFailure"));
      }
    } catch (e) {
    	LOG.warn("ContentClipper._clipArticle clip exception" 
    		+ ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
  };
  
  Downsha.ContentClipper.prototype._clipUrl = function(attrs) {
    LOG.debug("ContentClipper._clipUrl");
    this.createClipObject(); // construct Downsha.Clip
    this.clip.clipUrl();
    this._overloadClipNote(this.clip, attrs);
    this.onClipContent(this.clip);
  };

  Downsha.ContentClipper.prototype._overloadClipNote = function(note, attrs) {
    if (note && attrs) {
      for ( var a in attrs) {
        if (attrs[a] && Downsha.hasOwnProperty(note, a)) {
          try {
            note[a] = attrs[a];
          } catch (e) {
          }
        }
      }
    }
  };

  Downsha.ContentClipper.prototype.createClipObject = function() {
    var self = this;
    this.clip = new Downsha.Clip(this.window, this.stylingStrategy,
    	Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX);
    // comment following code to avoid double call to onClipContentTooBig
    /*
    this.clip.onsizeexceed = function() {
      LOG.debug("Content size exceeded during serialization");
      self.onClipContentTooBig(self.clip);
    };
    */
    return this.clip;
  };

  Downsha.ContentClipper.prototype._perform = function(fullPageOnly, attrs) {
  	LOG.debug("ContentClipper._perform");
    var self = this;
    var articleEle = null;
    this.createClipObject(); // construct Downsha.Clip

    try {
      if (!fullPageOnly && this.clip.hasSelection() //*** clip selection if anything selected
      	//&& this.clip.clipSelection()) { // TODO
      	&& Downsha.getIEExtension().selectionContent) { // get selection content from preseved
      	this.clip.content = Downsha.getIEExtension().selectionContent;
        this._overloadClipNote(this.clip, attrs);
        LOG.debug("Successful clip of selection: " + this.clip.toString());
        
        if (this.clip.sizeExceeded || this.clip.getLength() >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
          LOG.debug("ContentClipper._perform clip content too big");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (!fullPageOnly && this.getArticle() //*** clip article if found
      	&& (articleEle = this.getArticle().content.asNode())
      	&& Downsha.Utils.isArticleSane( //*** call isArticleSane to determine whethe article makes sense
    		Downsha.Utils.getDocumentWidth(this.window.document), // these data have been collected by page info scripts
    		Downsha.Utils.getDocumentHeight(this.window.document), 
    		Downsha.Utils.getAbsoluteBoundingClientRect(articleEle))
    		// TODO article clip without preview might cause error!
    		// http://www.chinanews.com/gn/2011/10-12/3384268.shtml
    		// http://pic.news.sohu.com/group-295904.shtml#0
    		&& this.clip.clipElement(articleEle)) {
       this._overloadClipNote(this.clip, attrs);
       LOG.debug("Successful clip of element's contents: " + this.clip.toString());
       LOG.dir(this.clip.toDataObject());
        if (this.clip.sizeExceeded || this.clip.getLength() >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
          LOG.debug("ContentClipper._perform clip content too big");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (this.clip.hasBody()) { //*** otherwise, clip body part
        this._overloadClipNote(this.clip, attrs);
        this.onClip(this.clip);
        LOG.debug("Successful clip of full page: " + this.clip.toString());
        if (this.clip.clipBody()) { // clip body
          if (this.clip.sizeExceeded || this.clip.getLength() >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
            LOG.debug("ContentClipper._perform clip content too big");
            this.onClipContentTooBig(this.clip);
          } else {
            this.onClipContent(this.clip);
          }
        } else {
          this.onClipContentFailure(Downsha.i18n.getMessage("fullPageClipFailure"));
        }
      } else {
        LOG.debug("ContentClipper._perform clip failure");
        this.onClipFailure(Downsha.i18n.getMessage("fullPageClipFailure"));
      }
    } catch (e) {
      // Can't construct a clip -- usually because the body is a frame
    	LOG.warn("ContentClipper._perform clip exception" 
    		+ ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
  };
  Downsha.ContentClipper.prototype.showWaiter = function() {
    var waiter = this.window.document.getElementById(this.WAIT_CONTAINER_ID);
    if (!waiter) {
      waiter = this.window.document.createElement("DOWNSHADIV");
      waiter.id = this.WAIT_CONTAINER_ID;
      
      var content = this.window.document.createElement("DIV");
      content.id = this.WAIT_CONTAINER_ID + "Content";
      waiter.appendChild(content);
      
      var spinner = this.window.document.createElement("IMG");
      if (Downsha.Platform.getIEVersion() <= 7) {
      	spinner.src = Downsha.Constants.SERVICE_PATH + "popup_scissors.png";
      } else {
      	spinner.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAASCAYAAABb0P4QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDQzQxMTI5NjBCMjA2ODExOTJCMDlEMzVEQTgyNzdBQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozRDYwMkQ1QzUwQjkxMUUwODE3NjkwQkEzNEM0QTBCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozRDYwMkQ1QjUwQjkxMUUwODE3NjkwQkEzNEM0QTBCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkNDNDExMjk2MEIyMDY4MTE5MkIwOUQzNURBODI3N0FCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkNDNDExMjk2MEIyMDY4MTE5MkIwOUQzNURBODI3N0FCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+FZ9gRgAAAaVJREFUeNqc1EsoBVEcx/HjlldIFsgjskDJSpHcBXksbpZ2lELqpuysFBvJhoVigbCgpLxioZCyQ8mjbLzqJhRlJe+M78l/cppmLt1Tn6mZOed3zsz/dJRlWbHoxSnOMYcCqEjoy6CE1aMM07hAfiSBUVwulVINOFK/bRUPaFN/t0oEUIITnXqFQsdMzQghLsxqirGEL+unHaJCyT/bRKbReVQ61bkEJaEbj9ZvG0aC/Q/TJfAMi9gxOm4gxQjTE+wb7+/R4iyK5kMAQ1jAMl5kUIVMOoJ3I+wApW5V9tKJJvmfN0aQDh13rPxfgXZxLtEnYbeo+mvbeG2HFBwiEXtIQydi5P7NdZTHTD5jVXpbjKEIM/JsBVnhPjkejZiSim/jGa8ISp9Subeb3hU1boHZ2JWqTcpmtduIY0A5toz3T+hyBuotMo9k48WADPC7fJY+TDpwbQTPItUO1FXMcQxqlE+KDlPRXEzgTUL1BNU+6vKJDEetWrGOjzCHQgjt8KMH+8jTM/XIOahXVYs1HHtV8T/HVxTJQTQhVvZYP+5UBO1bgAEAm6y67c0PYd4AAAAASUVORK5CYII=";
      }
      content.appendChild(spinner);
      
      var text = this.window.document.createElement("SPAN");
      text.id = this.WAIT_CONTAINER_ID + "Text";
      text.innerHTML = Downsha.i18n.getMessage("clipper_clipping");
      content.appendChild(text);
      this.window.document.body.appendChild(waiter);
    }
  };
  Downsha.ContentClipper.prototype.showSuccess = function() {
  	var self = this;
    var waiter = this.window.document.getElementById(this.WAIT_CONTAINER_ID);
    if (waiter) {
    	var text = this.window.document.getElementById(this.WAIT_CONTAINER_ID + "Text");
    	if (text) {
    		text.innerHTML = Downsha.i18n.getMessage("clipper_clipped");
    	}
    }
    this.window.setTimeout(function() {
      	self.clearWaiter();
      }, self.CLIP_SUCCESS_DELAY_TIME);    
  };  
  Downsha.ContentClipper.prototype.clearWaiter = function() {
    var waiter = this.window.document.getElementById(this.WAIT_CONTAINER_ID);
    if (waiter && waiter.parentNode) {
    	waiter.parentNode.removeChild(waiter);
    }
  };
})();
/**
 * @author: chenmin
 * @date: 2011-10-29
 * @desc: popup dialog management
 */

(function() {
	Downsha.Popup = function Popup(win) {
		this.initialize(win);
	};
	Downsha.inherit(Downsha.Popup, Downsha.AbstractStyleScript);
	
	Downsha.Popup.prototype.CLIP_SUBMIT_DELAY_TIME = 50;
  Downsha.Popup.prototype.DEFAULT_POPUP_WIDTH = 400;
  Downsha.Popup.prototype.DEFAULT_POPUP_HEIGHT = 170;
  Downsha.Popup.prototype.DEFAULT_POPUP_LEFT_MARGIN = 5;
  Downsha.Popup.prototype.DEFAULT_POPUP_TOP_MARGIN = 5;
  Downsha.Popup.prototype.DEFAULT_POPUP_RIGHT_MARGIN = 30;
  Downsha.Popup.prototype.pluginVersion = 0; // plugin version
	Downsha.Popup.prototype.window = null; // window object
	Downsha.Popup.prototype.title = null; // clip title
	Downsha.Popup.prototype.url = null; // clip url
	Downsha.Popup.prototype.clipAction = null; // clip action
	Downsha.Popup.prototype.clipOptions = null; // clip options
	Downsha.Popup.prototype.keyupEnabled = false; // determine whether keyboard event enabled
	Downsha.Popup.prototype.POPUP_ID = "downshaPopupContainer";
  Downsha.Popup.prototype.initialStyleSheetUrls = [{
  	id : "downshaPopupCSSCode",
		code : "/* css code for popup dialog */" +	
			"#downshaPopupContainer {" + // popup container
			((Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) ? 
			"  position: absolute;" : // for IE 6 and quirks mode, cuz IE 6 and quirks mode doesn't recognize fixed
			"	 position: fixed;") + // for IE 7/8/9, fixed position relative to screen 
			((Downsha.Platform.getIEVersion() <= 9) ? // at the top of all layers
			"	 z-index: 2147483647;" : 
			"	 z-index: 9999999999999999;") + 
			"  background: #f2f5f6;" + // background color
			"  min-width: 400px;" + 
			"  padding: 8px;" + 
			"  margin: 0px;" + 
			"  border: 5px solid #5cb8e5;" + 
			"  border-radius: 0px;" + // for IE 9+
			"  box-shadow: 0 0 8px #333333;" + // for IE 9+
			"  overflow: hidden;" + 
			"  width: auto;" + 
			"  font-family: Simsun, Arial Narrow, HELVETICA;" + // general font family
			"  font-size: 12px;" + // general font size
			"  color: black;" + // general font color
			/**
			 * -webkit-user-select/-moz-user-select specifies whether the text of the element can be selected.
			 * In Internet Explorer and Opera, use the unSelectable attribute for similar functionality.
			 * "-webkit-user-select: none;"
			 */
			"}" + 
			"#downshaPopupContainer div {" + 
			//"  border: 0px;" + 
			"  border-radius: 0px;" + // for IE 9+
			"  min-width: none;" + 
			"  max-width: none;" + 
			"  cursor: auto;" + 
			"}" + 
			"#downshaPopupContainer img {" + 
			"  border: 0px;" + 
			"}" + 
			"#downshaPopupContainer a {" + 
			"  border: 0px;" + 
			"}" + 
			"#downshaPopupHeader {" + 
			"  height: 40px;" + 
			"}" + 
			"#downshaPopupHeaderLogo {" + // logo div
			"  width: auto;" + 
			"  height: 32px;" + 
			"  float: left;" + 
			"}" + 
			"#downshaPopupHeaderLogo img {" + 
			"  width: 125px;" + 
			"  height: 32px;" + 
			"}" + 
			"#downshaPopupHeaderMessage {" + // message span
			"  vertical-align: top;" + 
			"  padding: 6px 10px 2px 10px;" + 
			"  font-size: 14px;" + 
			"  white-space: nowrap;" + 
			"  text-overflow: ellipsis;" + 
			"}" + 
			"#downshaPopupHeaderClose {" + // close button
			"  width: 16px;" + 
			"  height: 16px;" + 
			"  line-height: 16px;" + 
			"  display: inline-block;" + 
			"  vertical-align: top;" + 
			"  float: right;" + 
			"  cursor: pointer;" + 
			"}" + 
			"#downshaPopupHeaderClose img {" + 
			"  width: 16px;" + 
			"  height: 16px;" + 
			"  cursor: pointer;" + 
			"}" + 
			"#downshaPopupView {" + // view div
			"  width: auto;" + 
			"  overflow: hidden;" + 
			"}" + 
			"#downshaPopupForm {" + // form
			"  width: auto;" + 
			"  margin: 0px;" + 
			"}" + 
			"#downshaPopupForm .downshaPopupRow {" + // form row
			"  width: auto;" + 
			"  text-align: left;" + 
			"  margin: 0px;" + 
			"  padding: 4px;" + 
			"  border-style: solid;" + 
			"  border-width: 0px 1px 1px 1px;" + 
			"  border-color: #d9d9d9;" + 
			"  background-color: white;" + 
			"}" + 
			"#downshaPopupForm .downshaPopupRow.downshaPopupRowPadded {" + // padded form row
			"  padding: 4px 4px 4px 24px;" + 
			"}" + 
			"#downshaPopupForm .downshaPopupRow.downshaPopupFirstRow {" + // first row
			"  border-top-width: 1px;" + 
			"  border-top-left-radius: 4px;" + // for IE 9+
			"  border-top-right-radius: 4px;" + // for IE 9+
			"}" + 
			"#downshaPopupForm .downshaPopupRow.downshaPopupLastRow {" + // last row
			"  border-bottom-left-radius: 4px;" + // for IE 9+
			"  border-bottom-right-radius: 4px;" + // for IE 9+
			"}" + 
			"#downshaPopupForm .downshaPopupField {" + // form row field
			"  margin-right: 5px;" + 
			"  padding-right: 5px;" + 
			"  border-right: 1px solid #b2c0a6;" + 
			"}" + 
			"#downshaPopupForm input[type=text]," + // text input
			"#downshaPopupForm textarea {" + 
			"  margin: 0px;" + 
			"  padding: 0px;" + 
			"  border: 0px none;" + 
			"  width: 85%;" + 
			"  box-sizing: border-box;" + 
			"  text-overflow: ellipsis;" + 
			"}" + 
			"#downshaPopupForm textarea {" + 
			"  -ms-transform: translate(0px,2px);" + // for IE 9+
			"}" + 
			"#downshaPopupForm input[type=radio] {" + // radio button
			"  display: inline;" + 
			"  width: auto;" + 
			"  height: auto;" + 
			"  border: 0px none;" + 
			"  vertical-align: middle;" + 
			"}" + 
			"#downshaPopupForm label {" + 
			"  display: inline;" + 
			"  margin-right: 8px;" + 
			"}" + 
			"#downshaPopupOptions {" + 
			"}" + 
			"#downshaPopupActions {" + 
			"  text-align: right;" + 
			"  padding: 8px 0;" + 
			"}" + 
			"#downshaPopupAction {" + // submit button style
			"  width: auto;" + 
			"  height: auto;" + 
			"  color: #ffffff;" + 
			"  background: #4886d0;" + 
			"  font-weight: bold;" + 
			"  margin-right: 10px;" + 
			"  padding: 6px 10px;" + 
			"  border: 1px solid #265c9d;" + 
			"  position: relative;" + 
			"  box-sizing: content-box;" + 
			"  overflow: hidden;" + 
			"  text-overflow: ellipsis;" + 
			"  border-radius: 4px;" + // for IE 9+
			"  cursor: pointer;" + 
			"}" + 
			"#downshaPopupAction[disabled] {" + // :disabled not supported in < IE9
			"  color: #ACA899;" + 
			"  background: #F5F5F5;" + 
			"  border: 1px solid #ffffff;" + 
			"  cursor: default;" + 
			"}" + 
			"#downshaPopupAction:hover {" + 
			"  box-shadow: 0 0 4px #666666;" + // for IE 9+
			"}" + 
			"#downshaPopupAction:focus {" + 
			"}" + 
			"#downshaPopupFooter {" + 
			"  display: block;" + 
			"  text-align: left;" + 
			"  vertical-align: middle;" + 
			"  border-top: dashed 1px gray;" + 
			"  padding-top: 4px;" + 
			"  height: 20px;" + 
			"  color: gray;" + 
			"}" + 
			"#downshaPopupFooter img {" + 
			"  vertical-align: middle;" + 
			"  width: 16px;" + 
			"  height: 16px;" + 
			"  line-height: 16px;" + 
			"  padding: 2px;" + 
			"  border: 0px;" + 
			"}" + 
			"#downshaPopupFooter .buttons {" + 
			"  cursor: pointer;" + 
			"  border: 1px solid #f2f5f6;" + 
			"}" + 
			"#downshaPopupFooter .buttons:hover {" + 
			"  border: 1px solid #e0e0e0;" + 
			"}" + 
			"#downshaPopupTips {" + 
			"  color: gray;" + 
			"}" + 
			"#downshaPopupTips[level=warning] {" + 
			"  color: red;" + 
			"}"	
  }];

	Downsha.Popup.prototype.initialize = function(win) {
		//LOG.debug("Popup.initialize");
		this.window = (win) ? win : window;
		Downsha.Popup.parent.initialize.apply(this, [win]);
	};
	Downsha.Popup.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	Downsha.Popup.prototype.openPopup = function(obj) {
		//LOG.debug("Popup.openPopup");
		this.initData(obj);
		this.showPopup();
		this.updateClipAction(true);
	};
	Downsha.Popup.prototype.initData = function(obj) {
		//LOG.debug("Popup.initData");
		this.pluginVersion = 0;
		if (obj && obj.pluginVersion) {
			this.pluginVersion = obj.pluginVersion;
		}
		
		this.title = "";
		if (obj && obj.title) {
			this.title = obj.title;
		}
		
		this.url = "";
		if (obj && obj.url) {
			this.url = obj.url;
		}
		
		this.clipAction = Downsha.Constants.CLIP_ACTION_URL;
		if (obj && obj.clipAction) {
			this.clipAction = obj.clipAction;
		}
		
		this.clipOptions = [
			Downsha.Constants.CLIP_ACTION_FULL_PAGE, 
			Downsha.Constants.CLIP_ACTION_SELECTION, 
			Downsha.Constants.CLIP_ACTION_ARTICLE, 
			Downsha.Constants.CLIP_ACTION_URL
		];
		if (obj && obj.clipOptions) {
			this.clipOptions = obj.clipOptions;
		}
	};
	Downsha.Popup.prototype.showPopup = function() {
		//LOG.debug("Popup.showPopup");
		var popup = this.window.document.getElementById(this.POPUP_ID);
		if (!popup) {
			popup = this.window.document.createElement("DIV");
			popup.id = this.POPUP_ID;
			//popup.unselectable = "on";
			//popup.attachEvent("onselectstart", function() {return false;}); // forbid selection
			popup.attachEvent("oncontextmenu", function() {return false;}); // forbid context menu
			popup.innerHTML = "<!-- popup dialog inner html -->" + 
				"<!-- header bar for home/logout/register -->" + 
				"<div id=\"downshaPopupHeader\">" + 
				"<div id=\"downshaPopupHeaderLogo\">" + 
				"<a target=\"_blank\" href=\"http://www.downsha.com/\" tabindex=\"-1\">" + 
				((Downsha.Platform.getIEVersion() <= 7) ? 
				"<img src=\"" + Downsha.Constants.SERVICE_PATH + "popup_logo.png\"/>" : 
				"<img src=\"data:image/png;base64,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\"/>") + 
				"</a>" + 
				"<span id=\"downshaPopupHeaderMessage\">" + 
				Downsha.i18n.getMessage("popup_header_message") + 
				"</span>" + 
				"</div>" + // id=\"downshaPopupHeaderLogo\"
				"<div id=\"downshaPopupHeaderClose\">" + 
				((Downsha.Platform.getIEVersion() <= 7) ? 
				"<img title=\"" + Downsha.i18n.getMessage("popup_close") + "\" src=\"" + Downsha.Constants.SERVICE_PATH + "popup_close.png\"/>" : 
				"<img title=\"" + Downsha.i18n.getMessage("popup_close") + "\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAAWdEVYdENyZWF0aW9uIFRpbWUAMTIvMDEvMDmEiCkWAAAAgElEQVQ4jc1SQQ6AIAwrfnR46jPAZ+ykvBQvOyCOBGNMbEICY3RdR6i14g2WV6//SUCykjyceCR5M8xTsAKQlsT2u91dELwpkMwAEoBiIQGwqWqeImiqih2LqkYv75spNNWLLfGMdQmsf4HJNulDEk9BQtdzS9InD02cxQ+/8lOcoJg6TaDFVqMAAAAASUVORK5CYII=\"/>") + 
				"</div>" + // id=\"downshaPopupHeaderClose\"
				"</div>" + // id=\"downshaPopupHeader\"
				"<!-- body part -->" + 
				"<div id=\"downshaPopupView\">" + 
				"<form id=\"downshaPopupForm\" action=\"#\">" + 
				"<div class=\"downshaPopupRow downshaPopupFirstRow\">" + 
				"<span class=\"downshaPopupField\">" + 
				Downsha.i18n.getMessage("popup_title") + 
				"</span>" + 
				"<input type=\"text\" id=\"downshaPopupTitle\" title=\"" + Downsha.i18n.getMessage("popup_title") + "\" maxlength=\"255\" size=\"45\" tabindex=\"3\" value=\"\"/>" + 
				"</div>" +  // class=\"downshaPopupRow downshaPopupFirstRow\"
				"<div class=\"downshaPopupRow downshaPopupLastRow\">" + 
				"<span class=\"downshaPopupField\">" + 
				Downsha.i18n.getMessage("popup_content") + 
				"</span>" + 
				"<span id=\"downshaPopupOptions\">" + 
				"</span>" + 
				"</div>" +  // class=\"downshaPopupRow downshaPopupLastRow\"
				"<div id=\"downshaPopupActions\">" + 
				"<input type=\"button\" id=\"downshaPopupAction\" value=\"" + Downsha.i18n.getMessage("popup_action") + "\" tabindex=\"1\"/>" + 
				"</div>" +  // id=\"downshaPopupActions\"
				"</form>" + // id=\"downshaPopupForm\"
				"</div>" + // id=\"downshaPopupView\"
				"<!-- footer bar for tips and help -->" + 
				"<div id=\"downshaPopupFooter\">" + 
				((Downsha.Platform.getIEVersion() <= 7) ? 
				"<img src=\"" + Downsha.Constants.SERVICE_PATH + "popup_tips.png\"/>" : 
				"<img src=\"data:image/png;base64,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\"/>") + 
				"<span id=\"downshaPopupTips\"></span>" + 
				"</div>"; // id=\"downshaPopupFooter\"
			var popupLeft = this.DEFAULT_POPUP_LEFT_MARGIN;
			var windowWidth = Math.max(this.window.document.body.clientWidth, this.window.document.documentElement.clientWidth);
			if (!isNaN(windowWidth)) {
				popupLeft = windowWidth - this.DEFAULT_POPUP_WIDTH - this.DEFAULT_POPUP_RIGHT_MARGIN;
				if (popupLeft < this.DEFAULT_POPUP_LEFT_MARGIN) {
					popupLeft = this.DEFAULT_POPUP_LEFT_MARGIN;
				}
			}
			var popupTop = this.DEFAULT_POPUP_TOP_MARGIN;
			popup.style.left = popupLeft + "px";
			popup.style.top = popupTop + "px";
			popup.style.width = this.DEFAULT_POPUP_WIDTH + "px";
			popup.style.height = this.DEFAULT_POPUP_HEIGHT + "px";
			//LOG.debug("popup left: " + popup.style.left + ", top: " + popup.style.top + ", width: " + popup.style.width + ", height: " + popup.style.height);
			this.window.document.body.appendChild(popup);
			// make visible when display is not fixed to screen. (for IE 6 and quirks mode)
			if (Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) {
				window.scrollTo(0, 0);
			}
			// bind events to elements
			this.bindPopup();
		}
	};
	Downsha.Popup.prototype.hidePopup = function() {
		//LOG.debug("Popup.hidePopup");
		var popup = this.window.document.getElementById(this.POPUP_ID);
		if (popup && popup.parentNode) {
			popup.parentNode.removeChild(popup);
		}
	};	
	Downsha.Popup.prototype.bindPopup = function() {
		//LOG.debug("Popup.bindPopup");
		var self = this;
		self.enableKeyup(); // enable keyboard event
		var clipClose = this.window.document.getElementById("downshaPopupHeaderClose");
		if (clipClose) {
			clipClose.attachEvent("onclick", function() {
				Downsha.getIEExtension().previewClear();
				self.hidePopup();
			});
		}
		
		var clipTitle = this.window.document.getElementById("downshaPopupTitle");
		if (clipTitle) {
			if (this.title) {
				clipTitle.value = this.title;
			} else {
				clipTitle.value = Downsha.i18n.getMessage("popup_untitledNote");
			}
			clipTitle.attachEvent("onfocus", function() {
				if (clipTitle.value == Downsha.i18n.getMessage("popup_untitledNote")) {
					clipTitle.value = "";
				}
			});
			clipTitle.attachEvent("onblur", function() {
				clipTitle.value = clipTitle.value.trim();
				if (clipTitle.value == "") {
					clipTitle.value = Downsha.i18n.getMessage("popup_untitledNote");
				}
			});
		}
		
		var clipOptions = this.window.document.getElementById("downshaPopupOptions");
		if (clipOptions) {
			for (var i = 0; i < this.clipOptions.length; i++) {
				var clipRadio = this.window.document.createElement("input");
				clipRadio.setAttribute("type", "radio");
				clipRadio.setAttribute("id", this.clipOptions[i]);
				clipRadio.setAttribute("name", "downshaPopupOption");
				clipRadio.setAttribute("value", this.clipOptions[i]);
				if (this.clipOptions[i] == this.clipAction) {
					clipRadio.setAttribute("defaultChecked", true); // for IE 6/7
					clipRadio.setAttribute('checked', 'checked'); // for IE 8+
				}
				clipRadio.attachEvent("onclick", function() {
					self.updateClipAction(false);
				});
				clipOptions.appendChild(clipRadio);
				
				var clipLabel = this.window.document.createElement("label");
				clipLabel.setAttribute("for", this.clipOptions[i]);
				clipLabel.innerHTML = Downsha.i18n.getMessage(this.clipOptions[i]);
				clipOptions.appendChild(clipLabel);
			}
		}
		var clipAction = this.window.document.getElementById("downshaPopupAction");
		if (clipAction) {
			if (Downsha.getIEExtension().pluginVersion == 0) {
				clipAction.setAttribute('disabled','disabled');
			} else {
				clipAction.focus(); // set focus to submit button
				clipAction.attachEvent("onclick", function() {
					self.submitClipAction();
				});
			}
		}
	};
	Downsha.Popup.prototype.updateClipAction = function(force) {
		//LOG.debug("Popup.updateClipAction");
		var self = Downsha.getIEExtension().getPopup();
		var changed = false;
		var clipOptions = this.window.document.getElementById("downshaPopupOptions");
		for (var i = 0; i < clipOptions.children.length; i++) {
			if (clipOptions.children[i].checked) {
				var selectedOption = clipOptions.children[i].value;
				if (self.clipAction != selectedOption) {
					self.clipAction = selectedOption;
					changed = true;
				}
				break;
			}
		}
		
		if (force || changed) {
			if (self.clipAction == Downsha.Constants.CLIP_ACTION_SELECTION) {
				Downsha.getIEExtension().previewSelection();
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_ARTICLE) {
				Downsha.getIEExtension().previewArticle();
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_FULL_PAGE) {
				Downsha.getIEExtension().previewFullPage();
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_URL) {
				Downsha.getIEExtension().previewUrl();
			}
			
			var clipTips = this.window.document.getElementById("downshaPopupTips");
			if (Downsha.getIEExtension().pluginVersion == 0) {
				clipTips.setAttribute('level', 'warning');
				clipTips.innerHTML = Downsha.i18n.getMessage("popup_tip_forbidden");
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_ARTICLE) {
				if (Downsha.Platform.getIEVersion() <= 7) {
					var popupPrevUrl = Downsha.Constants.SERVICE_PATH + "popup_prev.png";
					var popupNextUrl = Downsha.Constants.SERVICE_PATH + "popup_next.png";
					var popupShrinkUrl = Downsha.Constants.SERVICE_PATH + "popup_shrink.png";
					var popupExpandUrl = Downsha.Constants.SERVICE_PATH + "popup_expand.png";
				} else {
					// http://www.websemantics.co.uk/online_tools/image_to_data_uri_convertor/
					var popupPrevUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAChElEQVR42o2TXUhTYRjH/2ebx87mdHNNJ6WszD7WBzNjpiO60UgrSCjoZhXUTeJVNwp1EyTWRd4kRZEQBUFQdBHWhSFhQVP8KF3mRx8y+3LTXHPnnH2cbT1n6tiaFz7w53nf9zzP7zzPy/sw+M8K66/ZyJ0lVZGsJJH0ntRDujv7osWdGs+kJHLk7hQa8x2WMjNMBQYYDTpI0Si88z58/+nBu0GXDGslSGsaYDn5tXVnmc1u25344BeiCEZiUCgALksBzToleEHEwIcJuMa/dhLkfCrgwZ4dpY6qil3w8RJCUhyrmZZTQs0q8KZ/BGOT3xoJcpuRe6ZS+44dsi8l019l62zai3MdQxkQfY4KfIDHs5e9f2i7WQbcqiy3XNhaWozfC+FE0MOLtoR3tPeDZVWJdTgsJSEmPYu+4TFMfplplAFTR2urt0hxFcRwDI+b7cnAlQoCvJhWhUGbhV+zdKkDHx/JgFBD3QHW44vg6eWDWIudufEWorCIXudIjwwQ6msqOS8Bnl+pXRPgVFsPgiIP5+BYtwwYrt5nscYVLBYFCa+uH0kG1jR3rQooys+mFubhmpjulAFtpeaiFvPGQsx4l3rtbT+eAQhHIsl1sZHD6Pg0PHO+kzKghM6mKsu3sSGJgS+wFOjsOIH9TU+Qo+HSLrKkgMPcgp/egfszbbevPKRLJqPu6qYSUyLI7REyylYwDIopOcAHMfJpOkpHdfSQulNn4WaeVt1UsF4HXa6GSo5hUZSgUjLIVWeB8jE754P7R6JP+RXeTxumZchhcvcMeu0GjTobai4bsVgcYjAMf0DAX7/QT99PU/JExjSmQPLINSyPc4XcPmmU1E3qouRoavw/OVIC70TzgsIAAAAASUVORK5CYII=";
					var popupNextUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACdklEQVR42o2TS0wTURSG/+ljcFoKhVooUUgV8VEfATEgEHUDRlAXLIxuUBPdSFi5kUQ3JhJkoRuNRiOJceFKo4lBFzWNQY1AeGjBSsFHU3xRitTSzpR2Sj13BNJSFpzkz7l35v7fvefmXA7LIr/hagWl06QqUilJIr0nOUh3J5+3epPXc0lGgdKdfHNuk63ECkueCWaTEXI8jqnpAL7/9OHdwAiDtRGkLQWwYH5Vur2koqZip/IjKMYRic1DpQIErQr6NWqERQn9H9wYGf3aSZCzyYAHu7YVN1WV70AgLGNOTmClMAhq6HgVXvc54Rr71kyQ2xyrmY7ae/RgzX8z7bo8Olt248zNQWWck6lBOBTGkxfdf2i6kQFuVZbZzm0uLsTvmWiamec1CoBF0/U+JVtyePQOuTD2ZaKZAcaP1FVvkhMaSNHU3TP1wtIJFuN4x1uYDFr8mqRL7f/4kAHmGuv38b5ADI8vHcBq4tS1N5DEWXT3OB0MIDbUVgpTBHh2uW5VgBPtDkSkMHoGXHYGGKreYytNqHjMivKKhpcdh5fGtRe6UJCbQSVMY8Tt6WSA9mJrQat1fT4mpqTUC9RqUwD7zz9VcqFZwPCoBz5/4BgDFNG38cqyLfyczCEQiqVdJAPsbXmkzIvyBPhngtQH3s803brYSBctZuOVDUUWZZHXJ6aVoeI4FJI5FI7A+ckTp0/11Ej25LdwI9uga8lba4QxS48oNdSsJEOj5pCl04L8mPQH4P2h1Mm68H7KY1qAHKJ0z5RjWKfXZUAnZGB+PgEpEkUwJOJvUGSddJLM7rTXmATJptS48JzLSSHSMMlO6iJzPHn9P6Lq9uCZ3H4YAAAAAElFTkSuQmCC";
					var popupShrinkUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACX0lEQVR42o2Ty08TURTGv+ljcFoKhVpaom1QxEd9BIJpA8TEhRJpdMHCJcaFG4l/AIlhhUT3JhqNJMaFW1ZiYhNCcCEQCFpqpeCjKb7agoylM1PamdYztTZTaxpP8uXc1/nde+69h8Ff5vDf8ZK7SuohdZIk0mvSNOlhfGokpl3PaAI5cg8c9uYhT0cbnC022G1WyIqC5BaPz18TeLUUUmHjBBmvAJSCZzqPd3j7vCeLEylRQSaXh04HcEYdzHv0EEQJi28iCK1+nCDINS3gyalj7UM93SfACzJ25QL+ZRZODxOrw8uFIMJrn4YJcp9Rc6ajzl/q7/sdTLvWsqZ6A4S0gMnnsz+oe1AF3PN1ea4fbnfh+3a2KoBlDUWfzcrlMWcTi/nlMNY+bAyrgPWL53sPyQUDpGzl7vVmrujTglQxbrMY8S1Ol7r49qkK2B0cOMMm+BzyhQImR8/WTGFwbAYNJtpM3MHsXHBaBYj+cz4uSQAlX8DUWH9NgH/0RRGQkQTMLYUDKmC597Sns6BjsSPK+B9rba6jFLYQikQnVMDt9rbWkbb9DmwkK3NljcZyO5vLldsuO4eV1SgSm/xlFeCmsXVf1xF2V2bAp3M1L9LdwmFzO0X/IPaeukf/fKSbTrv11gG3s7golhCrjq1jGLgoOC1kEHwXVWhogD5SQFsLdxstphste62wNpjpyHnsSDIMeoYuzQiKR3yTR+xLMU/1Fz6uKKYS5AK5R7Ymyz6zqQ4mrg55ehkpk0UqLeJnSlyg+SsUHKmqRg2kUX3uUjl3q+mTVkgB0jMKVrTrfwHUe/bgdRe9TAAAAABJRU5ErkJggg==";
					var popupExpandUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACgUlEQVR42n2TXUhTYRjH/+eoszObTtfcpByW2Yd9MDM2VIIuTFILEoqujKBuEq+6UQivTMqbbpKiaBAFQVdeaZAhYkQqmqXL/OhjzL7cZq65c87czs56zlHXToYv/Hl4n/d5fu/7vO/7MPhnWOpuOshcJFWQ7CSR9JbUT7q/0NvqTY1nUhI5Mvcs5rzG0pIiWPNNMJuMkOJx+BeD+Prdh9djbgXWQZAODWAtecB+oMRR5TikLoSEOCIxGSwLcBkssrakgRdEjL6bgXv6s4sgl1MBjw7vL26sKD+IIC9hRUrgf8PApUGvY/FyZAJTs1+aCHKXUWqmow6frqlaTaZd14er+YhqL3W9Sfpyt6aDD/Pofjb4i6a7FMAdZ1nplT3Fhfi5FNXs+PiqIwmIRqWk35qrw/D4FGY/zTcpgLlTJyp3S4l0iFFZA3jaUqXa852vNH6TIQM/FuhSR98/UQArDbXHdL5gDHIige6249hsNLQPIFtPmwnLGBya6FcAQl21k/MTIC4n0Ntesymgru25CoiIPIbGpvoUwHjl0VJ7gtVhWZA0wS8661Vb3dKj8RfkZVIJi3DPeFwK4EZxUUFr0Q4L5v2iJnDw1pkkIBqLJf2FZg6T0x74AsFzCsBGvjln2V7disQgGP4bONR1NgkI86twWz6HwFKI/oH3I033rX+ka1az8fpOm1UN8vqEDbWzDINCSg7zEUx88MTJVUsfqS+1F27nGPTN+duMMGZn0ZFlLIsS0tMYurQMUD4WAkF4v6l1Kr/woaaZ1iAnyTww5Rq2Z+kzoecyIdPLiJEoQmEBv0PCCK1foOSZDd2YAslRnnutnctJYdIkqY/UQ8nx1Pg/GwUF7/QGKH4AAAAASUVORK5CYII=";
				}
				clipTips.innerHTML = Downsha.i18n.getMessage("popup_tip_article") + 
				"<img class=\"buttons\" id=\"downshaPopupPrev\" title=\"" + Downsha.i18n.getMessage("popup_prev") + "\" src=\"" + popupPrevUrl + "\"/>" + 
				"<img class=\"buttons\" id=\"downshaPopupNext\" title=\"" + Downsha.i18n.getMessage("popup_next") + "\" src=\"" + popupNextUrl + "\"/>" + 
				"<img class=\"buttons\" id=\"downshaPopupShrink\" title=\"" + Downsha.i18n.getMessage("popup_shrink") + "\" src=\"" + popupShrinkUrl + "\"/>" + 
				"<img class=\"buttons\" id=\"downshaPopupExpand\" title=\"" + Downsha.i18n.getMessage("popup_expand") + "\" src=\"" + popupExpandUrl + "\"/>";

				var clipExpand = this.window.document.getElementById("downshaPopupExpand");
				if (clipExpand) {
					clipExpand.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_PARENT);
					});
				}
				var clipShrink = this.window.document.getElementById("downshaPopupShrink");
				if (clipShrink) {
					clipShrink.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_CHILD);
					});
				}
				var clipPrev = this.window.document.getElementById("downshaPopupPrev");
				if (clipPrev) {
					clipPrev.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_PREVIOUS_SIBLING);
					});					
				}				
				var clipNext = this.window.document.getElementById("downshaPopupNext");
				if (clipNext) {
					clipNext.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_NEXT_SIBLING);
					});					
				}
			} else {
				clipTips.innerHTML = Downsha.i18n.getMessage("popup_tip_default");
			}
	  }
	};
  Downsha.Popup.prototype.enableKeyup = function() {
		//LOG.debug("Popup.enableKeyup");
		if (this.keyupEnabled) {
			return;
		}
		try {
			var popup = this.window.document.getElementById(this.POPUP_ID);
			if (popup) {
				popup.attachEvent("onkeyup", this.handleKeyup); // bind keyup event
			}
		} catch(e) {
			LOG.warn("IEExtension.enableKeyup attachEvent exception");
			LOG.dir(e);
		}
		this.keyupEnabled = true;
  };
  Downsha.Popup.prototype.disableKeyup = function() {
		//LOG.debug("Popup.disableKeyup");
		if (this.keyupEnabled) {
			try {
				var popup = this.window.document.getElementById(this.POPUP_ID);
				if (popup) {
					popup.detachEvent("onkeyup", this.handleKeyup); // unbind keyup event
				}
			} catch(e) {
				LOG.warn("IEExtension.disableKeyup detachEvent exception");
				LOG.dir(e);
			}
			this.keyupEnabled = false;
		}
  };
  Downsha.Popup.prototype.handleKeyup = function() {
  	//LOG.debug("Popup.handleKeyup");
  	var self = Downsha.getIEExtension().getPopup();
		var keyCode = (event) ? event.keyCode : this.window.event.keyCode;
		var direction = null;
		switch (keyCode) {
			/*
			case 37: // left arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_PREVIOUS_SIBLING;
			}
			break;
			case 38: // up arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_PARENT;
			}
			break;
			case 39: // right arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_NEXT_SIBLING;
			}
			break;
			case 40: // down arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_CHILD;
			}
			break;
			*/
			case 13: // Enter key
			{
				return self.submitClipAction();
			}
		}
		if (direction) {
			Downsha.getIEExtension().previewNudge(direction);
		}
  };
	Downsha.Popup.prototype.submitClipAction = function() {
		//LOG.debug("Popup.submitClipAction");
		var self = Downsha.getIEExtension().getPopup();
		
		// get attributes from user input, such as title, directory, tags, comment, etc.
		var attrs = {};
		var clipTitle = this.window.document.getElementById("downshaPopupTitle");
		if (clipTitle) {
			if (clipTitle.value != Downsha.i18n.getMessage("popup_untitledNote")) {
				attrs.title = clipTitle.value;
			}
		}
		
		Downsha.getIEExtension().previewClear();
		self.hidePopup();
		
		self.window.setTimeout(function() {
			if (self.clipAction == Downsha.Constants.CLIP_ACTION_SELECTION) {
				Downsha.getIEExtension().clipSelection(attrs);
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_ARTICLE) {
				Downsha.getIEExtension().clipArticle(attrs);
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_FULL_PAGE) {
				Downsha.getIEExtension().clipFullPage(attrs);
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_URL) {
				Downsha.getIEExtension().clipUrl(attrs);
			}
		}, self.CLIP_SUBMIT_DELAY_TIME);
	};
})();
/**
 * @author: chenmin
 * @date: 2011-11-01
 * @desc: startup code for downsha extension
 */
var LOG = Downsha.Logger.getInstance();
window.onerror = function(errorMsg, url, lineNumber) {
  LOG.exception("\n" + url + ":" + lineNumber + ": " + errorMsg + "\n");
}
var downshaLoadTimeout = 10 * 1000;
var downshaLoadInterval = 50;
var downshaLoadStart = new Date().getTime();
var downshaLoadTimer = window.setInterval(function() {
	var now = new Date().getTime();
	if (((typeof window.document.readyState != "undefined") && 
		(window.document.readyState == "complete" || 
		window.document.readyState == 'loaded' || 
		window.document.readyState == 'interactive') && 
		(window.document.body)) || ((now - downshaLoadStart) >= downshaLoadTimeout)) {
		clearInterval(downshaLoadTimer);
		try {
			var downshaExtension = Downsha.getIEExtension();
			downshaExtension.startUp();
		} catch (e) {
			LOG.warn("Startup exception, readyState: " + window.document.readyState);
			LOG.dir(e);
		}
	}
}, downshaLoadInterval);
