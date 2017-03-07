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
