/**
 * @author: chenmin
 * @date: 2011-09-29
 * @desc: encapsulate the call of content scripting for injecting css files.
 */

(function() {
	var LOG = null;
	Downsha.AbstractStyleScript = function() {
		LOG = Downsha.Logger.getInstance();
		this.initialize()
	};
	
	Downsha.AbstractStyleScript.prototype.initialize = function() {
		var styles = this.getInitialStyleSheetUrls();
		if(styles && styles.length > 0) {
			this.injectStyleSheets(styles);
		}
	};
	Downsha.AbstractStyleScript.prototype.getInitialStyleSheetUrls = function() {
		return[];
	};
	Downsha.AbstractStyleScript.prototype.injectStyleSheets = function(styles) {
		var documentHead = Downsha.Utils.getDocumentHead(document);
		for(var i = 0; i < styles.length; i++) {
			var src = styles[i];
			var style = document.createElement("link");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("type", "text/css");
			style.setAttribute("href", src);
			if (documentHead) {
				documentHead.appendChild(style);
			}
		}
	};
})();
