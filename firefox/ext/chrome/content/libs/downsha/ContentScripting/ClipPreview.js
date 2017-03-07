/**
 * @author: chenmin
 * @date: 2011-09-02
 * @desc: content preview script for FullPage/Selection/Article/URL
 * inject css files and create wrap node for highlighted fragments.
 * we need to hide all <object> and <embed> nodes when show canvas veil, 
 * and restore all <object> and <embed> nodes when hide canvas veil.
 */

(function() {
	var LOG = null;
	Downsha.AbstractStyleScript = function() {
		LOG = Downsha.Logger.getInstance();
		this.initialize();
	};
	Downsha.AbstractStyleScript.prototype.initialize = function(doc) {
		var styles = this.getInitialStyleSheetUrls();
		if (styles && styles.length > 0) {
			this.injectStyleSheets(styles, doc);
		}
	};
	Downsha.AbstractStyleScript.prototype.getInitialStyleSheetUrls = function() {
		return [];
	};
	Downsha.AbstractStyleScript.prototype.injectStyleSheets = function(styles, doc) {
		var documentHead = Downsha.Utils.getDocumentHead(doc);
		for (var i = 0; i < styles.length; i++) {
			var src = styles[i];
			var style = doc.createElement("link");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("type", "text/css");
			style.setAttribute("href", src);
			if (documentHead) {
				documentHead.appendChild(style);
			}
		}
	};
})();

(function() {

  var LOG = null;
	Downsha.ContentPreviewScript = function ContentPreviewScript(win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	Downsha.inherit(Downsha.ContentPreviewScript, Downsha.AbstractStyleScript);
	Downsha.ContentPreviewScript._instance = null;
	Downsha.ContentPreviewScript.getInstance = function () {
		if (!this._instance) {
			this._instance = new Downsha.ContentPreviewScript();
		}
		return this._instance;
	};
	Downsha.ContentPreviewScript.removeInstance = function () {
		this._instance = null;
	};
	Downsha.ContentPreviewScript.prototype.window = null;
	Downsha.ContentPreviewScript.prototype._contentVeil = null;
	Downsha.ContentPreviewScript.prototype._selectionFinder = null;
	Downsha.ContentPreviewScript.prototype.SELECTION_CTX_ATTRS = { // float layer for selection preview
		fillStyle: "rgba(255, 255, 0, 0.3)" // color: yellow, alpha: 0.3
	};
	Downsha.ContentPreviewScript.prototype.PREVIEW_CTX_ATTRS = { // float layer for article preview
		fillStyle : "rgba(255, 255, 255, 0)", // fill color: white, alpha: 0
		strokeStyle : "rgba(255, 255, 0, 0.3)" // stroke color: yellow, alpha: 0.3
	};
	Downsha.ContentPreviewScript.prototype.URL_MAX_LENGTH = 100; // maximum url lenght for preview url
	Downsha.ContentPreviewScript.prototype.PREVIEW_SCROLL_TOTAL_TIME = 120;
	Downsha.ContentPreviewScript.prototype.PREVIEW_SCROLL_STEP_INTERVAL = 20;
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_ID = "downshaPreviewContainerID"; // content id
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_CLASS = "downshaPreviewContainer"; // content class
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_URL_CLASS = "downshaPreviewUrlContainer"; // url content class
	Downsha.ContentPreviewScript.prototype.PREVIEW_ARTICLE_CLASS = "downshaPreviewArticleContainer"; // article content class
	Downsha.ContentPreviewScript.prototype._children = null; // _children and _parents store child-parent node pairs for nudge preview
	Downsha.ContentPreviewScript.prototype._parents = null; // each pair are stored at the same index of two arrays
	Downsha.ContentPreviewScript.prototype.initialStyleSheetUrls = [
		"resource://downsha-styles/contentpreview.css", 
		"resource://downsha-styles/contentclipper.css", 
		"resource://downsha-styles/contentveil.css"];
	Downsha.ContentPreviewScript.prototype.initialize = function (win) {
		this.window = (win) ? win : window;
		this.__defineGetter__("contentVeil", this.getContentVeil);
		this.__defineGetter__("selectionFinder", this.getSelectionFinder);
		// call parent initialization to inject css files to content
		Downsha.ContentPreviewScript.prototype.parent.initialize.apply(this, [this.window.document]);
		
		this._children = [];
		this._parents = [];
	};
	Downsha.ContentPreviewScript.prototype.getInitialStyleSheetUrls = function () {
		return this.initialStyleSheetUrls;
	};
	Downsha.ContentPreviewScript.prototype.previewFullPage = function () {
		LOG.debug("ContentPreviewScript.previewFullPage");
		this.clear(); //hide veil and remove content element
	};
	Downsha.ContentPreviewScript.prototype.previewSelection = function () {
		LOG.debug("ContentPreviewScript.previewSelection");
		this.clear();
		var selectionRange = this.getSelectionRange();
		if (!selectionRange) {
			LOG.debug("Could not find selection");
			this.previewFullPage();
			return;
		}
		this.contentVeil.resetVeil(); // reset entire veil to alpha 0.7
		try {
			/*
			getClientRects retrieves a TextRectangles collection that contains TextRectangle objects.
			Every TextRectangle object represents a line of text that belongs to the TextRange object.
			*/
			// Firefox3.6 throw exception
			// TypeError: selectionRange.getClientRects is not a function
			var clientRects = selectionRange.getClientRects();
			for (var i in clientRects) {
				if (clientRects[i] && (clientRects[i].right > clientRects[i].left) && (clientRects[i].bottom > clientRects[i].top)) {
					LOG.debug("selection client rect: (" + clientRects[i].left + ","  + clientRects[i].top + ") * (" + clientRects[i].right + "," + clientRects[i].bottom  + ")");
					clientRects[i].width = clientRects[i].right - clientRects[i].left;
					clientRects[i].height = clientRects[i].top - clientRects[i].bottom;
					this.outlineRect(Downsha.Utils.makeAbsoluteClientRect(clientRects[i], this.window), false, this.SELECTION_CTX_ATTRS); //revel rect and show veil
				}
			}
		} catch(e) {}
	};
	Downsha.ContentPreviewScript.prototype.previewArticle = function () {
		LOG.debug("ContentPreviewScript.previewArticle");
		this.clear();
		this.contentVeil.resetVeil();
		var rememberedPreview = this.getRememberedPreview();
		if (rememberedPreview) { // if already remember the preview node, then outline it now.
			this.outlinePreviewElement(rememberedPreview, true);
		} else {
			var extractor = new ExtractContentJS.LayeredExtractor(); // hatena content extract
			extractor.addHandler(extractor.factory.getHandler("Heuristics"));
			var extractRes = extractor.extract(this.window.document);
			LOG.debug("extractRes.isSuccess " + extractRes.isSuccess);
			if (extractRes.isSuccess) {
		    var articleNode = extractRes.content.asNode(); // get the root node of article fragment
		    LOG.debug("articleNode.nodeType == Node.ELEMENT_NODE : " + (articleNode.nodeType == Node.ELEMENT_NODE));
		    articleNode = Downsha.Utils.getElementForNode(articleNode);
		    this.rememberPreview(articleNode); // remember the preview node now
		    this.outlinePreviewElement(articleNode, true);
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.previewURL = function(title, url, favIconUrl) {
		LOG.debug("ContentPreviewScript.previewURL");
		this.clear();
		this.contentVeil.resetVeil();
		this.contentVeil.show();
		title = (title) ? title : this.window.document.title;
		url = (url) ? url : this.window.location.href;
		favIconUrl = (favIconUrl) ? favIconUrl : "http://www.google.com/s2/favicons?domain=" + Downsha.Utils.urlDomain(url).toLowerCase();
		var urlClipElement = Downsha.Utils.createUrlClipElement(this.window.document, title, Downsha.Utils.shortWord(url, this.URL_MAX_LENGTH), favIconUrl);
		var contentElement = this.createContentElement(urlClipElement);
		var self = this;
		this.window.setTimeout(
			function() {
				self.showContentElement();
				var computedStyle = self.window.getComputedStyle(contentElement, "");
				var width = parseInt(computedStyle.getPropertyValue("width"));
				var height = parseInt(computedStyle.getPropertyValue("height"));
				if (width && height) { // display in the center of screen
					contentElement.style.marginLeft = (0 - width / 2) + "px";
					contentElement.style.marginTop = (0 - height / 2) + "px";
					//Position element to the center of the screen (including scroll position)
					contentElement.style.setProperty("top", ( parseInt(computedStyle.getPropertyValue("top")) + self.window.document.documentElement.scrollTop ) + "px", "important");
				}
			}, 100);
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
				(node.textContent.trim().length > 0 || // has texts
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
				(node.textContent.trim().length > 0 || // has texts
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
				(node.textContent.trim().length > 0 || // has texts
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
					(node.textContent.trim().length > 0 || // has texts
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
		if (direction == Downsha.Constants.RequestType.PREVIEW_NUDGE_PREVIOUS_SIBLING) {
			newPreview = this.getPreviousElementSibling(oldPreview);
		} else if (direction == Downsha.Constants.RequestType.PREVIEW_NUDGE_NEXT_SIBLING) {
			newPreview = this.getNextElementSibling(oldPreview);
		} else if (direction == Downsha.Constants.RequestType.PREVIEW_NUDGE_PARENT) {
			newPreview = this.getParentElement(oldPreview);
		} else if (direction == Downsha.Constants.RequestType.PREVIEW_NUDGE_CHILD) {
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
		Downsha.Utils.addElementClass(node, this.PREVIEW_ARTICLE_CLASS);
	};
	Downsha.ContentPreviewScript.prototype.forgetPreview = function() {
		var nodes = this.window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
		if (nodes && nodes.length > 0) {
			for (var i = 0; i < nodes.length; i++) {
				Downsha.Utils.removeElementClass(nodes[i], this.PREVIEW_ARTICLE_CLASS);
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.getRememberedPreview = function() {
		var nodes = this.window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
		if (nodes && nodes.length > 0) {
			return nodes[0];
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.createContentElement = function (content) {
		LOG.debug("ContentPreviewScript.createContentElement");
		var doc = this.window.document;
		var contentNode = doc.getElementById(this.PREVIEW_CONTENT_ID); // "downshaPreviewContainerID"
		if (!contentNode) {
			var contentNode = doc.createElement("div");
			contentNode.setAttribute("id", this.PREVIEW_CONTENT_ID);
			contentNode.setAttribute("class", this.PREVIEW_CONTENT_CLASS + " " + this.PREVIEW_CONTENT_URL_CLASS);
			contentNode.style.display = "none"; // hide at first
			contentNode.style.position = "absolute";
			var docRoot = doc.body.parentNode || doc.body;
			docRoot.appendChild(contentNode);
		}
		contentNode.appendChild(content);
		return contentNode;
	};
	
	Downsha.ContentPreviewScript.prototype.removeContentElement = function () {
		LOG.debug("ContentPreviewScript.removeContentElement");
		var doc = this.window.document;
		var contentNode = doc.getElementById(this.PREVIEW_CONTENT_ID);
		if (contentNode && contentNode.parentNode) {
			contentNode.parentNode.removeChild(contentNode);
		}
	};
	Downsha.ContentPreviewScript.prototype.getContentElement = function () {
		var doc = this.window.document;
		var contentNode = doc.getElementById(this.PREVIEW_CONTENT_ID);
		return contentNode;
	};
	Downsha.ContentPreviewScript.prototype.showContentElement = function () {
		LOG.debug("ContentPreviewScript.showContentElement");
		var contentNode = this.getContentElement();
		if (contentNode) {
			contentNode.style.display = "";
		}
	};
	Downsha.ContentPreviewScript.prototype.hideContentElement = function () {
		LOG.debug("ContentPreviewScript.hideContentElement");
		var contentNode = this.getContentElement();
		if (contentNode) {
			contentNode.style.display = "none";
		}
	};
	Downsha.ContentPreviewScript.prototype.clear = function () { //hide veil and remove content element
	  LOG.debug("ContentPreviewScript.clear");
	  if (this._contentVeil) {
	  	this.contentVeil.hide();
	  	this.contentVeil.clear();
	  }
	  this.removeContentElement();
	};
	Downsha.ContentPreviewScript.prototype.getContentVeil = function () {
	  if (!this._contentVeil) {
	  	this._contentVeil = new Downsha.ContentVeil(this.window);
	  }
	  return this._contentVeil;
	};
	Downsha.ContentPreviewScript.prototype.outlinePreviewElement = function(previewNode, screenCenter) {
		var previewRect = previewNode._downshaPreviewRect;
		if (!previewRect) { // compute the rectangle of preview node
			previewRect = Downsha.Utils.getAbsoluteBoundingClientRect(previewNode);
			var nodes = previewNode.getElementsByTagName("*");
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var nodeRect = node._downshaPreviewRect;
				if (!nodeRect) {
					nodeRect = Downsha.Utils.getAbsoluteBoundingClientRect(node);
					if (node.childElementCount == 0) {
						node._downshaPreviewRect = nodeRect;
					}
				}
				if (!nodeRect || (nodeRect.width * nodeRect.height == 0)) {
					continue;
				}
				Downsha.Utils.expandRect(previewRect, nodeRect); // get the union set of two rectangles
			}
			previewRect.width = previewRect.right - previewRect.left;
			previewRect.height = previewRect.bottom - previewRect.top;
			previewNode._downshaPreviewRect = previewRect;
			previewNode.className += " _downshaPreviewRect";
		}
		this.outlineRect(previewRect, true, this.PREVIEW_CTX_ATTRS);
		if (screenCenter && previewRect) {
			var scrollX = previewRect.left - (this.window.innerWidth / 2);
			var scrollY = previewRect.top - (this.window.innerHeight / 2);
			LOG.debug("ContentPreviewScript.outlinePreviewElement scroll x: " + scrollX + " y: " + scrollY);
			Downsha.Scroller.scrollTo(this.window, scrollX, scrollY, this.PREVIEW_SCROLL_TOTAL_TIME, this.PREVIEW_SCROLL_STEP_INTERVAL);
		}
	};
	Downsha.ContentPreviewScript.prototype.outlineRect = function (rect, stroke, attrs) {
	  LOG.debug("ContentPreviewScript.outlineRect");
	  if (attrs) {
	    this.contentVeil.revealRect(rect, stroke, attrs);
	    this.contentVeil.show();
	  }
	};
	Downsha.ContentPreviewScript.prototype.getSelectionFinder = function () {
	  if (!this._selectionFinder) {
	  	this._selectionFinder = new Downsha.SelectionFinder(this.window.document);
	  }
	  return this._selectionFinder;
	};
	Downsha.ContentPreviewScript.prototype.getSelectionRange = function () {
	  this.selectionFinder.find(true);
	  if (this.selectionFinder.hasSelection()) {
	  	return this.selectionFinder.getRange();
	  }
	  return null;
	};
})();

/**
 * @author: chenmin
 * @date: 2011-10-21
 * @desc: set animated document scroll from window.pageXOffset/pageYOffset to specified endX/endY
 */	
(function() {

  var LOG = null;
	Downsha.Scroller = function Scroller(win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	
	Downsha.Scroller.scrollTo = function(win, endX, endY, scrollTotalTime, scrollInterval) {
		if (!scrollTotalTime) {
			scrollTotalTime = 300;
		}
		if (!scrollInterval) {
			scrollInterval = 10;
		}
		if (this._instance) {
			this._instance.abort();
		}
		this._instance = new Downsha.Scroller(win);
		this._instance.scrollTo({x : endX, y : endY}, scrollTotalTime, scrollInterval);
	};
	
	Downsha.Scroller.prototype.window = null;
	Downsha.Scroller.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		/**
		 * pageXOffset and pageYOffset are the amount of pixels the entire pages has been scrolled.
		 * IE doesn't support it until version 9.
		 * IE equivalents are "document.body.scrollLeft" and "document.body.scrollTop".
		 */
		this.initialPoint = {
			x : this.window.pageXOffset ? this.window.pageXOffset : this.window.document.body.scrollLeft, 
			y : this.window.pageYOffset ? this.window.pageYOffset : this.window.document.body.scrollTop
		};
	};
	Downsha.Scroller.prototype.scrollTo = function(endPoint, scrollTotalTime, scrollInterval) {
		this.endPoint = endPoint;
		this.step = 0;
		this.calculatePath(scrollTotalTime, scrollInterval);
		var self = this;
		this.proc = this.window.setInterval(
			function() {
				if (!self.doScroll()) {
					self.abort();
				}
			},
			scrollInterval
		);
	};
	Downsha.Scroller.prototype.calculatePath = function(scrollTotalTime, scrollInterval) {
		this.path = [];
		var initialX = this.initialPoint.x;
		var initialY = this.initialPoint.y;
		var endX = this.endPoint.x;
		var endY = this.endPoint.y;
		var deltaAngle = (Math.PI * scrollInterval) / scrollTotalTime;
		for (var e = -(Math.PI/2); e < (Math.PI / 2); e += deltaAngle) {
			var deltaDist = ((1 + Math.sin(e)) / 2);
			this.path.push({x : (initialX + deltaDist * (endX - initialX)), y : (initialY + deltaDist * (endY - initialY))});
		}
	};
	Downsha.Scroller.prototype.doScroll = function() {
		var scrollPoint = this.path[++this.step];
		if (!scrollPoint) {
			return false;
		}
		this.window.scrollTo(scrollPoint.x, scrollPoint.y);
		return true;
	};
	Downsha.Scroller.prototype.abort = function() {
		if (this.proc) {
			clearInterval(this.proc);
			this.proc = null;
		}
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

  var LOG = null;	
	Downsha.ContentVeil = function (win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	Downsha.ContentVeil.prototype.window = null;
	Downsha.ContentVeil.prototype.VEIL_ID = "downshaContentVeil";
	Downsha.ContentVeil.prototype.VEIL_CLASS = "downshaContentVeil";
	Downsha.ContentVeil.prototype.FILL_STYLE = "rgba(0, 0, 0, 0.7)"; // color: black, alpha: 0.7
	Downsha.ContentVeil.prototype.FILL_HIGHLIGHT_STYLE = "rgba(255, 255, 255, 0.3)"; // color: white, alpha: 0.3
	Downsha.ContentVeil.prototype.STROKE_STYLE = "rgba(255, 255, 255, 0.9)"; // default stroke style
	Downsha.ContentVeil.prototype.STROKE_WIDTH = 6; // default stroke width
	Downsha.ContentVeil.prototype.STROKE_CAP = "round"; // default stroke cap
	Downsha.ContentVeil.prototype.STROKE_JOIN = "round"; // dfault stroke join
	Downsha.ContentVeil.prototype.ELEMENT_STYLE = { // veil style array
	  position: "absolute",
	  top: "0px",
	  left: "0px",
	  zIndex: "9999999999999990"
	};
	Downsha.ContentVeil.prototype.EMBED_TRANS_MARKER = "downshaTransparent";
	Downsha.ContentVeil.prototype.EMBED_TRANS_PREVIEW_MARKER = "downshaEmbedTransparent";
	
	Downsha.ContentVeil.prototype.initialize = function (win) {
	  this.window = (win) ? win : window;
	  this.veil = this.createVeilElement();
	};
	Downsha.ContentVeil.prototype.createVeilElement = function () {
		var veilNode = this.window.document.createElement("CANVAS");
		veilNode.setAttribute("id", this.VEIL_ID);
		veilNode.setAttribute("class", this.VEIL_CLASS);
		veilNode.height = this.getBodyHeight();
		veilNode.width = this.getBodyWidth();
		for (var i in this.ELEMENT_STYLE) {
			veilNode.style[i] = this.ELEMENT_STYLE[i];
		}
		return veilNode;
	};
	Downsha.ContentVeil.prototype.revealElement = function (ele) {
	  var rect = Downsha.Utils.getAbsoluteBoundingClientRect(ele);
	  this.revealRect(rect);
	};
	Downsha.ContentVeil.prototype.revealRect = function (veilRect, veilStroke, veilContext) {
	  var curContext = this.getVeilContext();
	  var lineWidth = 0;
	  if (veilStroke) { // calculate stroke line width
	    lineWidth = Math.max(2, (Math.min((veilRect.bottom - veilRect.top), (veilRect.right - veilRect.left)) / 8));
	    lineWidth = Math.min((veilContext && veilContext.lineWidth) ? veilContext.lineWidth : this.STROKE_WIDTH, lineWidth);
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
	};
	Downsha.ContentVeil.prototype.resetVeil = function () { // reset veil to alpha 0.7
	  var curContext = this.getVeilContext();
	  curContext.clearRect(0, 0, this.getBodyWidth(), this.getBodyHeight());
	  curContext.fillStyle = this.FILL_STYLE;
	  curContext.lineWidth = 0;
	  curContext.moveTo(0, 0);
	  curContext.beginPath();
	  curContext.lineTo(this.getBodyWidth(), 0);
	  curContext.lineTo(this.getBodyWidth(), this.getBodyHeight());
	  curContext.lineTo(0, this.getBodyHeight());
	  curContext.lineTo(0, 0);
	  curContext.closePath();
	  curContext.fill();
	};
	Downsha.ContentVeil.prototype.getVeilElement = function () {
		if (!this._veil) {
			this._veil = this.window.document.getElementById(this.VEIL_ID);
			if (!this._veil) {
				this._veil = this.createVeilElement();
			}
		}
		return this._veil;
	};
	Downsha.ContentVeil.prototype.getVeilContext = function () {
	  if (!this._veilContext) {
	  	this._veilContext = this.getVeilElement().getContext("2d"); // canvas 2d context
	  }
	  return this._veilContext;
	};
	Downsha.ContentVeil.prototype.removeVeilElement = function () {
	  if (this._veil && this._veil.parentNode) {
	  	this._veil.parentNode.removeChild(this._veil);
	  }
	};
	Downsha.ContentVeil.prototype.getDefaultVeilParentElement = function () {
	  return (this.window.document.body.parentNode) ? 
	  	this.window.document.body.parentNode : this.window.document.body;
	};
	Downsha.ContentVeil.prototype.show = function () {
		this.hideEmbeds(this.window.document, true);
		var veilNode = this.getVeilElement();
		if (!veilNode.parentNode) {
			var veilParent = this.getDefaultVeilParentElement();
			if (veilParent) {
				veilParent.appendChild(veilNode);
			}
		}
		veilNode.style.display = "";
	};
	Downsha.ContentVeil.prototype.hide = function () {
	  this.unhideEmbeds(this.window.document, true);
	  var veilNode = this.getVeilElement();
	  veilNode.style.display = "none";
	};
	Downsha.ContentVeil.prototype.clear = function() {
		this.clearEmbeds(this.window.document, true);
	};
	Downsha.ContentVeil.prototype.getBodyHeight = function() {
		return Math.max(this.window.document.body.parentNode.scrollHeight, this.window.document.body.scrollHeight);
	};
	Downsha.ContentVeil.prototype.getBodyWidth = function() {
		return this.window.document.body.parentNode.scrollWidth;
	};
	Downsha.ContentVeil.prototype.hideEmbeds = function(doc, deep) {
		var embeds = Downsha.Utils.findEmbeds(doc);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.hideEmbeds find " + embeds.length + " <object> and <embed> nodes");
			var view = (doc.defaultView) ? doc.defaultView : this.window;
			for (var i = 0; i < embeds.length; i++) {
				var embed = embeds[i];
				if(typeof embed[this.EMBED_TRANS_MARKER] != "undefined") { // if it has a marker, we hide it directly.
					this._hideEmbed(embed);
					continue;
				}
				var style = view.getComputedStyle(embed, "");
				var display = style.getPropertyValue("display");
				var visibility = style.getPropertyValue("visibility");
				var show = (display == "none" || visibility == "hidden") ? false : true;
				if (!show) { // ignore if it is already hidden
					continue;
				}
				var marker = null;
				var classes = (embed.classList) ? Array.prototype.slice.call(embed.classList, 0) : [];
				classes.push(this.EMBED_TRANS_MARKER);
				embed.setAttribute("class", classes.join(" ")); // add marker className to <object> node or <embed> node
				embed[this.EMBED_TRANS_MARKER] = marker;
				this._hideEmbed(embed);
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
		var embeds = doc.getElementsByClassName(this.EMBED_TRANS_MARKER);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.unhideEmbeds find " + embeds.length + " <object> and <embed> nodes");
			for(var i = 0; i < embeds.length; i++) {
				if (embeds[i]) {
					this._unhideEmbed(embeds[i]);
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
		var embeds = doc.getElementsByClassName(this.EMBED_TRANS_MARKER);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.clearEmbeds find " + embeds.length + " <object> and <embed> nodes");
			for (var i = 0; i < embeds.length; i++) {
				if (embeds[i]) {
					this._clearEmbed(embeds[i]);
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
	Downsha.ContentVeil.prototype._hideEmbed = function(embed) {
		var marker = embed[this.EMBED_TRANS_MARKER];
		if (marker) {
			marker.style.display = "block";
		}
		embed.style.visibility = "hidden";
	};
	Downsha.ContentVeil.prototype._unhideEmbed = function(embed) {
		var marker = embed[this.EMBED_TRANS_MARKER];
		if (marker) {
			marker.style.display = "none";
		}
		embed.style.visibility = "visible";
	};
	Downsha.ContentVeil.prototype._clearEmbed = function(embed) {
		var marker = embed[this.EMBED_TRANS_MARKER];
		if (marker && marker.parentNode) {
			marker.parentNode.removeChild(marker);
		}
		embed.style.visibility = "visible";
		var classes = (embed.classList) ? Array.prototype.slice.call(embed.classList, 0) : [];
		var i = -1;
		if (i = classes.indexOf(this.EMBED_TRANS_MARKER) >= 0) { // remove marker className
			classes.splice(i, 1);
		}
		if (classes.length > 0) {
			embed.setAttribute("class", classes.join(" "));
		} else {
			embed.removeAttribute("class");
		}
		try {
			// Firefox3.6 throw exception while delete 
			// uncaught exception: [Exception... "Security Manager vetoed action"  nsresult: "0x80570027 (NS_ERROR_XPC_SECURITY_MANAGER_VETO)"  
			// location: "JS frame :: chrome://downsha/content/libs/downsha/ClipPreview.js :: anonymous :: line 420"  data: no]
			delete embed[this.EMBED_TRANS_MARKER];
		} catch(e){}
	};
})();
