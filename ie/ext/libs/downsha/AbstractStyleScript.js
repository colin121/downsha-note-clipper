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
