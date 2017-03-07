/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: content preview script for FullPage/Selection/Article/URL
 * inject css files and create wrap node for highlighted fragments.
 */

(function() {
	var LOG = null;
	Downsha.ContentPreviewScript = function ContentPreviewScript(win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	Downsha.inherit(Downsha.ContentPreviewScript, Downsha.AbstractStyleScript);
	Downsha.ContentPreviewScript._instance = null;
	Downsha.ContentPreviewScript.getInstance = function() {
		if (!this._instance) {
			this._instance = new Downsha.ContentPreviewScript();
		}
		return this._instance;
	};
	Downsha.ContentPreviewScript.removeInstance = function() {
		this._instance = null;
	};
	Downsha.ContentPreviewScript.prototype.window = null;
	Downsha.ContentPreviewScript.prototype._contentVeil = null; // ContentVeil object
	Downsha.ContentPreviewScript.prototype._selectionFinder = null; // SelectionFinder object
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_ID = "downshaPreviewContainer";
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_CLASS = "downshaPreviewContainer";
	Downsha.ContentPreviewScript.prototype.PREVIEW_CONTENT_URL_CLASS = "downshaPreviewUrlContainer";
	Downsha.ContentPreviewScript.prototype.PREVIEW_ARTICLE_CLASS = "downshaPreviewArticleContainer";
	Downsha.ContentPreviewScript.prototype.TEXT_NODE_WRAP_TAG = "SPAN";
	Downsha.ContentPreviewScript.prototype.TEXT_NODE_WRAP_STYLE = "display: inline; position: relative; padding: 0px; margin: 0px; float: none; visibility: visible; float: none;";
	Downsha.ContentPreviewScript.prototype.SELECTION_CTX_ATTRS = { // float layer for selection preview
		fillStyle : "rgba(255, 255, 0, 0.3)" // fill color: yellow, alpha: 0.3
	};
	Downsha.ContentPreviewScript.prototype.PREVIEW_CTX_ATTRS = { // float layer for article preview
		fillStyle : "rgba(255, 255, 255, 0)", // fill color: white, alpha: 0
		strokeStyle : "rgba(255, 255, 0, 0.3)" // stroke color: yellow, alpha: 0.3
	};
	Downsha.ContentPreviewScript.prototype.PREVIEW_PARENT_CTX_ATTRS = { // NOT USED float layer for nudge parent preview
		fillStyle : "rgba(0, 3, 0, 0.8)", // fill color: light green(black), alpha: 0.8
		lineWidth : 4, 
		strokeStyle : "rgba(33, 133, 33, 0.4)" //stroke color: dark green, alpha: 0.4
	};
	Downsha.ContentPreviewScript.prototype.PREVIEW_NEXT_CTX_ATTRS = { // NOT USED float layer for nudge sibling preview
		fillStyle : "rgba(0, 0, 0, 0.6)", // fill color: black, alpha: 0.6
		lineWidth : 1, 
		strokeStyle : "rgba(255, 255, 255, 0.2)" // stroke color: white, alpha: 0.2
	};
	Downsha.ContentPreviewScript.prototype.PREVIEW_PREV_CTX_ATTRS = Downsha.ContentPreviewScript.prototype.PREVIEW_NEXT_CTX_ATTRS;
	Downsha.ContentPreviewScript.prototype.SELECTION_MIN_SIZE = 8;
	Downsha.ContentPreviewScript.prototype.PREVIEW_URL_DELAY_TIME = 100;
	Downsha.ContentPreviewScript.prototype.PREVIEW_SCROLL_TOTAL_TIME = 120;
	Downsha.ContentPreviewScript.prototype.PREVIEW_SCROLL_STEP_INTERVAL = 20;
	Downsha.ContentPreviewScript.prototype.DOCUMENT_PREVIEW_KEY = "DownshaPreviewNode";
	Downsha.ContentPreviewScript.prototype.rangeMarker = "_downsha_range_";
	Downsha.ContentPreviewScript.prototype._children = null; // _children and _parents store child-parent node pairs for nudge preview
	Downsha.ContentPreviewScript.prototype._parents = null; // each pair are stored at the same index of two arrays
  Downsha.ContentPreviewScript.prototype._sema = null;
  Downsha.ContentPreviewScript.prototype._articleRules = null;
	Downsha.ContentPreviewScript.prototype.initialStyleSheetUrls = ["chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/css/contentpreview.css"];
	
	Downsha.ContentPreviewScript.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		this.__defineGetter__("contentVeil", this.getContentVeil);
		this.__defineGetter__("selectionFinder", this.getSelectionFinder);
		this._children = [];
		this._parents = [];
		Downsha.ContentPreviewScript.parent.initialize.apply(this, []);
		
    this._sema = Downsha.Semaphore.mutex();
    this.fetchArticleRules();
    this.__defineGetter__("articleRules", this.getArticleRules);
	};
  Downsha.ContentPreviewScript.prototype.getArticleRules = function() {
  	return this._articleRules;
  };
  Downsha.ContentPreviewScript.prototype.fetchArticleRules = function() {
  	LOG.debug("ContentPreviewScript.fetchArticleRules");
  	var self = this;
  	if (!this._articleRules) {
  		this._sema.critical(function() {
  			chrome.extension.sendRequest( // send request to ChromeExtension which then get remote article rules by ajax
  			new Downsha.RequestMessage(Downsha.Constants.RequestType.FETCH_ARTICLE_RULES, this.window.document.location.href),
        function(response) {
        	self._articleRules = (response && response.rules) ? response.rules : {};
        	self._sema.signal();
        });
  		});
  	}
  };
	
	Downsha.ContentPreviewScript.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	
  Downsha.ContentPreviewScript.prototype._doPreview = function(fn) {
		var self = this;
		this._sema.critical(function() {
			fn();
			self._sema.signal();
		});
  };
	Downsha.ContentPreviewScript.prototype.previewFullPage = function() {
		var self = this;
    this._doPreview(function() {
      self._previewFullPage();
    });
	};
	Downsha.ContentPreviewScript.prototype.previewSelection = function() {
		var self = this;
    this._doPreview(function() {
      self._previewSelection();
    });
	};
	Downsha.ContentPreviewScript.prototype.previewArticle = function() {
		var self = this;
    this._doPreview(function() {
      self._previewArticle();
    });
	};
	Downsha.ContentPreviewScript.prototype.previewURL = function(title, url, favIconUrl) {
		var self = this;
    this._doPreview(function() {
      self._previewURL(title, url, favIconUrl);
    });
	};
  
	Downsha.ContentPreviewScript.prototype._previewFullPage = function() { // just clear all to preview full page
		LOG.debug("ContentPreviewScript._previewFullPage");
		this.clear();
	};
	Downsha.ContentPreviewScript.prototype._previewSelection = function() {
		LOG.debug("ContentPreviewScript._previewSelection");
		this.clear();
		var selectionRange = this.getSelectionRange();
		if (!selectionRange) { // preview full page if no selection found
			LOG.debug("Could not find selection");
			this.previewFullPage();
			return;
		}
		var self = this;
		this.contentVeil.resetVeil();
		var selectionAncestor = ( // get the common ancestor node for multiple selection range
			selectionRange.commonAncestorContainer == selectionRange.startContainer && 
			selectionRange.startContainer == selectionRange.endContainer) ? 
			selectionRange.commonAncestorContainer.parentNode : 
			selectionRange.commonAncestorContainer;
		var selectionRects = selectionRange.getClientRects();
		var selectionNodes = []; // *** intersected nodes with selection
		var selectionNodesRect = {}; // *** computed rectangle to contain all selection nodes
		var treeWalker = this.window.document.createTreeWalker(
			selectionAncestor, // the root of the TreeWalker's traversal
			NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT, // only filter element node and text node
			function(node) { // called by the TreeWalker to determine whether or not to accept a node
				if (node == selectionAncestor && node != selectionRange.startContainer) {
					return NodeFilter.FILTER_SKIP;
				} else {
					if (node != selectionRange.startContainer && node == selectionRange.endContainer) {
						var firstElementIndex = 0;
						if (node.nodeType == Node.ELEMENT_NODE) {
							var childNodes = node.childNodes;
							for (var i = 0; i < childNodes.length; i++) {
								if (childNodes[i] && childNodes[i].nodeType == Node.ELEMENT_NODE) {
									i++;
									break;
								}
							}
							firstElementIndex = i;
						}
						if (selectionRange.endOffset <= firstElementIndex) {
							return NodeFilter.FILTER_REJECT;
						}
					}
				}
				var nodeRange = self.window.document.createRange();
				nodeRange.selectNode(node);
				var nodeRect = nodeRange.getBoundingClientRect();
				if (node == selectionRange.startContainer || // determine whether node is intersected with selection
					node == selectionRange.endContainer || 
					(nodeRange.compareBoundaryPoints(Range.START_TO_START, selectionRange) >= 0 && 
					nodeRange.compareBoundaryPoints(Range.END_TO_END, selectionRange) <= 0)) {
					node._downsha_nodeRect = Downsha.NodeRect.fromNode(node); // remember the node rectangle to node._downsha_nodeRect
					selectionNodes.push(node);
					if (nodeRect) {
						Downsha.Utils.expandRect(selectionNodesRect, nodeRect); // get the union set of two rectangles
					}
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_SKIP;
			}, false);
		while (treeWalker.nextNode()) {} // *** TreeWalker object traverse the tree of selectionAncestor
		
		var endRect = (selectionRange.endContainer.nodeType == Node.TEXT_NODE) ? 
			selectionRange.endContainer.parentNode.getBoundingClientRect() : 
			selectionRange.endContainer.getBoundingClientRect();
		if (endRect) {
			endRect = Downsha.NodeRect.fromObject(endRect);
		}
		for (var i = 0; i < selectionRects.length; i++) { // enumerate all selection ranges
			var selectionRect = Downsha.NodeRect.fromObject(selectionRects[i]);
			if ((selectionRect.width * selectionRect.height) <= 0) {
				continue;
			}
			var intersectionRects = []; // *** intersection rectangles of nodes and selections
			for (var j = 0; j < selectionNodes.length; j++) { // enumerate all selection nodes
				var selectionNode = selectionNodes[j];
				var selectionNodeRect = selectionNode._downsha_nodeRect;
				var intersectionRect = (selectionNodeRect) ? Downsha.Utils.rectIntersection(selectionRect, selectionNodeRect) : null;
				if (!intersectionRect) {
					continue;
				} else {
					if (selectionNodeRect && Downsha.Utils.rectsEqual(selectionNodeRect, selectionRect)) {
						intersectionRects.push(selectionRect);
					} else {
						intersectionRect = Downsha.NodeRect.fromObject(intersectionRect);
						intersectionRects.push(intersectionRect);
					}
				}
			}
			if (selectionRange.endContainer.nodeType == Node.TEXT_NODE && 
				selectionRange.endOffset < selectionRange.endContainer.textContent.length &&
				Downsha.Utils.rectsEqual(selectionRect, endRect)) {
				continue;
			}
			if (intersectionRects.length > 0) {
				for (var k = 0; k < intersectionRects.length; k++) {
					var interRect = intersectionRects[k];
					if (interRect.left >= selectionNodesRect.left && interRect.top >= selectionNodesRect.top && // determine whether in selectionNodesRect
						interRect.right <= selectionNodesRect.right && interRect.bottom <= selectionNodesRect.bottom) {
						this.outlineRect(Downsha.Utils.makeAbsoluteClientRect(interRect, this.window), false, this.SELECTION_CTX_ATTRS);
					}
				}
			}
		}
	};
	Downsha.ContentPreviewScript.prototype._previewArticle = function() {
		LOG.debug("ContentPreviewScript._previewArticle");
		this.clear();
		this.contentVeil.resetVeil();
		var rememberedPreview = this.getRememberedPreview();
		if (rememberedPreview) { // if already remember the preview node, then outline it now.
			this.outlinePreviewElement(rememberedPreview, true);
		} else {
			var articleNode = Downsha.Utils.getArticleNode(this.window.document, this.articleRules);
			if (articleNode) {
				this.rememberPreview(articleNode); // remember the preview node now
				this.outlinePreviewElement(articleNode, true);
			}
		}
	};
	Downsha.ContentPreviewScript.prototype._previewURL = function(title, url, favIconUrl) {
		LOG.debug("ContentPreviewScript._previewURL");
		this.clear();
		this.contentVeil.resetVeil();
		this.contentVeil.show();
		title = (title) ? title : this.window.document.title;
		url = (url) ? url : this.window.location.href;
		favIconUrl = (favIconUrl) ? favIconUrl : null;
		var urlClipContent = Downsha.Utils.createUrlClipContent(title, url, favIconUrl);
		var contentElement = this.createContentElement(urlClipContent);
		var self = this;
		setTimeout(
			function() {
				self.showContentElement();
				var computedStyle = self.window.getComputedStyle(contentElement, "");
				var width = parseInt(computedStyle.getPropertyValue("width"));
				var height = parseInt(computedStyle.getPropertyValue("height"));
				if (width && height) { // display in the center of screen
					contentElement.style.marginLeft = (0 - width / 2) + "px";
					contentElement.style.marginTop = (0 - height / 2) + "px";
				}
			}, this.PREVIEW_URL_DELAY_TIME);
	};
	Downsha.ContentPreviewScript.prototype.getPreviousElementSibling = function(curNode) {
		var node = curNode.previousElementSibling;
		while (node) { // get nearest sibling which has texts or images
			var nodeRect = (node.textContent.trim().length > 0 || node.getElementsByTagName("IMG").length > 0) ? node.getBoundingClientRect() : null;
			var nodeArea = (nodeRect) ? (nodeRect.width * nodeRect.height) : 0;
			if (nodeArea > 0) {
				return node;
			} else {
				node = node.previousElementSibling;
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.getNextElementSibling = function(curNode) {
		var node = curNode.nextElementSibling;
		while (node) { // get nearest sibling which has texts or images
			var nodeRect = (node.textContent.trim().length > 0 || node.getElementsByTagName("IMG").length > 0) ? node.getBoundingClientRect() : null;
			var nodeArea = (nodeRect) ? (nodeRect.width * nodeRect.height) : 0;
			if (nodeArea > 0) {
				return node;
			} else {
				node = node.nextElementSibling;
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.getParentElement = function(curNode) {
		var curNodeRect = (curNode) ? curNode.getBoundingClientRect() : null;
		var curNodeArea = (curNodeRect) ? (curNodeRect.width * curNodeRect.height) : 0;
		var node = curNode.parentElement;
		while (node) { // get nearest parent which is larger than current node
			var nodeRect = node.getBoundingClientRect();
			var nodeArea = (nodeRect) ? (nodeRect.width * nodeRect.height) : 0;
			if (nodeArea > 0 && nodeArea != curNodeArea) {
				return node;
			} else {
				node = node.parentElement;
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.getChildElement = function(curNode) {
		var parentIndex = this._parents.indexOf(curNode); // check the parents-children array first
		if (parentIndex >= 0) {
			return this._children[parentIndex];
		}
		var curNodeRect = curNode.getBoundingClientRect();
		var curNodeArea = (curNodeRect) ? (curNodeRect.width * curNodeRect.height) : 0;
		if (curNode.children.length > 0) { // get nearest child which has texts or images and is smaller than current node
			var treeWalker = document.createTreeWalker(curNode, NodeFilter.SHOW_ELEMENT, null, false); // only traverse ELEMENT nodes
			var node = null;
			while (node = treeWalker.nextNode()) {
				var nodeRect = (node.textContent.trim().length > 0 || node.getElementsByTagName("IMG").length > 0) ? node.getBoundingClientRect() : null;
				var nodeArea = (nodeRect) ? (nodeRect.width * nodeRect.height) : 0;
				if (nodeArea > 0 && nodeArea != curNodeArea) {
					return node;
				}
			}
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype.nudgePreview = function(direction) {
		var oldPreview = this.getRememberedPreview();
		if (!oldPreview) {
			return; // Doesn't look like there's a preview at the moment
		}
		var newPreview = null;
		switch (direction) {
			case Downsha.Constants.RequestType.PREVIEW_NUDGE_PREVIOUS_SIBLING: 
				newPreview = this.getPreviousElementSibling(oldPreview);
				break;
			case Downsha.Constants.RequestType.PREVIEW_NUDGE_NEXT_SIBLING:
				newPreview = this.getNextElementSibling(oldPreview);
				break;
			case Downsha.Constants.RequestType.PREVIEW_NUDGE_PARENT:
				newPreview = this.getParentElement(oldPreview);
				break;
			case Downsha.Constants.RequestType.PREVIEW_NUDGE_CHILD:
				newPreview = this.getChildElement(oldPreview);
				break;
		}
		if (newPreview) {
			this.forgetPreview(oldPreview);
			this.contentVeil.resetVeil();
			this.outlinePreviewElement(newPreview, true); // outline new preview
			this.rememberPreview(newPreview);
			if (direction == Downsha.Constants.RequestType.PREVIEW_NUDGE_PARENT) {
				var parentIndex = this._parents.indexOf(newPreview);
				if (parentIndex >= 0) { // remove if already exists
					this._parents.splice(parentIndex, 1);
					this._children.splice(parentIndex, 1);
				}
				var childIndex = this._children.push(oldPreview); // store child node and return inserted index
				this._parents[childIndex - 1] = newPreview; // store parent node at the same index
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.rememberPreview = function(node) {
		this.forgetPreview();
		Downsha.Utils.addElementClass(node, this.PREVIEW_ARTICLE_CLASS);
	};
	Downsha.ContentPreviewScript.prototype.forgetPreview = function() {
		var nodes = document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
		if (nodes && nodes.length > 0) {
			for (var c = 0; c < nodes.length; c++) {
				Downsha.Utils.removeElementClass(nodes[c], this.PREVIEW_ARTICLE_CLASS);
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.getRememberedPreview = function() {
		var nodes = document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
		if (nodes && nodes.length > 0) {
			return nodes[0];
		}
	};
	Downsha.ContentPreviewScript.prototype.createContentElement = function(content) {
		LOG.debug("ContentPreviewScript.createContentElement");
		var doc = this.window.document;
		var contentNode = doc.getElementById(this.PREVIEW_CONTENT_ID);
		if (!contentNode) {
			var contentNode = doc.createElement("div");
			contentNode.setAttribute("id", this.PREVIEW_CONTENT_ID);
			contentNode.setAttribute("class", this.PREVIEW_CONTENT_CLASS + " " + this.PREVIEW_CONTENT_URL_CLASS);
			contentNode.style.display = "none";
			var docRoot = doc.body.parentElement || doc.body;
			docRoot.appendChild(contentNode);
		}
		contentNode.innerHTML = content;
		return contentNode;
	};
	Downsha.ContentPreviewScript.prototype.removeContentElement = function() {
		LOG.debug("ContentPreviewScript.removeContentElement");
		var doc = this.window.document;
		var contentNode = doc.getElementById(this.PREVIEW_CONTENT_ID);
		if (contentNode && contentNode.parentElement) {
			contentNode.parentElement.removeChild(contentNode);
		}
	};
	Downsha.ContentPreviewScript.prototype.getContentElement = function() {
		var doc = this.window.document;
		var contentNode = doc.getElementById(this.PREVIEW_CONTENT_ID);
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
		if (this._contentVeil) { // remove content veil
			this.contentVeil.hide();
			this.contentVeil.clear();
		}
		this.removeContentElement(); // remove content node
		var nodes = this.window.document.querySelectorAll("*[class~=_downshaPreviewRect]"); // nodes whose classes has _downshaPreviewRect
		if (nodes) {
			for (var i = 0; i < nodes.length; i++) {
				delete nodes[i]._downshaPreviewRect;
				nodes[i].className = nodes[i].className.replace(/\s*\b_downshaPreviewRect\b/, ""); // remove specified class
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.clearRect = function(rect) {
		LOG.debug("ContentPreviewScript.clearRect");
		if (this._contentVeil) {
			this.contentVeil.clearRect(rect);
		}
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
				if (!nodeRect) {
					continue;
				}
				
				// Skip elements that are positioned off screen.
				// If both top and bottom are in negative space, we can't see this.
				if (nodeRect.bottom < 0 && nodeRect.top < 0) {
					continue;
				}
				// Or, if both left and right are in negative space, we can't see this.
				if (nodeRect.left < 0 && nodeRect.right < 0) {
					continue;
				}
				// We skip anything with an area of one px or less. This is anything that has "display: none", or single pixel
				// images for loading ads and analytics and stuff. Most hidden items end up at 0:0 and will stretch our rectangle
				// to the top left corner of the screen if we include them. Sometimes single pixels are deliberately placed off screen.
				if (nodeRect.width * nodeRect.height <= 1) {
					continue;
				}
				// We skip elements which position is fixed or absolute
				if (getComputedStyle(node).position == "fixed" || 
					getComputedStyle(node).position == "absolute") {
					continue;
				}
				// We won't descend into hidden elements.
				if (getComputedStyle(node).display == "none") {
					continue;
				}
				//LOG.debug("current node: " + Downsha.Utils.getNodeString(node));
				//LOG.debug("node rect(" + nodeRect.left + ", " + nodeRect.top + ", " + nodeRect.right + ", " + nodeRect.bottom + ")");
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
			Downsha.Scroller.scrollTo(scrollX, scrollY, this.PREVIEW_SCROLL_TOTAL_TIME, this.PREVIEW_SCROLL_STEP_INTERVAL);
		}
	};
	Downsha.ContentPreviewScript.prototype.outlineRect = function(rect, stroke, attrs) {
		LOG.debug("ContentPreviewScript.outlineRect");
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
		if (!this._contentVeil) {
			this._contentVeil = new Downsha.ContentVeil(this.window);
		}
		return this._contentVeil;
	};
	Downsha.ContentPreviewScript.prototype.getSelectionBoundingClientRect = function() {
		var g = this.getSelectionRange();
		if (!g || !g.commonAncestorContainer) {
			LOG.debug("No selection range found");
			return null;
		}
		var f = g.commonAncestorContainer.ownerDocument.defaultView;
		var e = Downsha.Utils.makeAbsoluteClientRect(g.getBoundingClientRect(), f);
		var c = this._isolateRangeEndPoints(g);
		if (!c || c.length != 2) {
			return e;
		} else {
			if (c[0] === c[1]) {
				return Downsha.Utils.makeAbsoluteClientRect(c[0].getBoundingClientRect());
			} else {
				var d = Downsha.Utils.makeAbsoluteClientRect(this._mergeRects(c[0].getBoundingClientRect(), c[1].getBoundingClientRect()));
				this._shrinkYRect(e,d);
				return e;
			}
		}
	};
	Downsha.ContentPreviewScript.prototype.getSelectionFinder = function() {
		if (!this._selectionFinder) {
			this._selectionFinder = new Downsha.SelectionFinder(this.window.document);
		}
		return this._selectionFinder;
	};
	Downsha.ContentPreviewScript.prototype.getSelectionRange = function() {
		this.selectionFinder.find(true);
		if (this.selectionFinder.hasSelection()) {
			return this.selectionFinder.getRange();
		}
		return null;
	};
	Downsha.ContentPreviewScript.prototype._isolateRangeEndPoints = function(c) {
		var j = [];
		if (c.startContainer.parentNode === c.endContainer.parentNode) {
			var k = document.createElement(this.TEXT_NODE_WRAP_TAG);
			k.style.cssText = this.TEXT_NODE_WRAP_STYLE;
			c.surroundContents(k);
			j[0] = k;
			j[1] = k;
			c.selectNodeContents(k);
			var e = getSelection();
			e.removeAllRanges();
			e.addRange(c);
		} else {
			var j = [];
			if (c.startContainer.nodeType == Node.TEXT_NODE && c.startOffset > 0) {
				var g = document.createTextNode(c.startContainer.textContent.substring(0, c.startOffset));
				var h = document.createTextNode(c.startContainer.textContent.substring(c.startOffset));
				var f = document.createElement(this.TEXT_NODE_WRAP_TAG);
				f.style.cssText = this.TEXT_NODE_WRAP_STYLE;
				c.startContainer.parentNode.replaceChild(f, c.startContainer);
				f.appendChild(h);
				f.parentNode.insertBefore(g, f);
				j[0] = f;
				c.setStartBefore(h);
			} else {
				j[0] = (c.startContainer.nodeType == Node.TEXT_NODE) ? c.startContainer.parentNode : c.startContainer;
			}
			if (c.endContainer.nodeType == Node.TEXT_NODE && c.endOffset < c.endContainer.textContent.length) {
				var i = document.createTextNode(c.endContainer.textContent.substring(0, c.endOffset));
				var g = document.createElement(this.TEXT_NODE_WRAP_TAG);
				g.style.cssText = this.TEXT_NODE_WRAP_STYLE;
				g.appendChild(i);
				var l = document.createTextNode(c.endContainer.textContent.substring(c.endOffset));
				var f = document.createElement(this.TEXT_NODE_WRAP_TAG);
				f.style.cssText = this.TEXT_NODE_WRAP_STYLE;
				f.appendChild(l);
				c.endContainer.parentNode.replaceChild(f, c.endContainer);
				f.parentNode.insertBefore(g, f);
				j[1] = g;
				c.setEndAfter(i);
			} else {
				j[1] = c.endContainer;
				if (c.endOffset == 0) {
					var d = c.endContainer;
					while (d) {
						if (d.previousSibling) {
							d = d.previousSibling;
							break;
						} else {
							if (d.parentElement) {
								d = d.parentElement;
							}
						}
					}
					if (d) {
						j[1] = d;
					}
				}
			}
			var e = getSelection();
			e.removeAllRanges();
			e.addRange(c);
		}
		return j;
	};
	Downsha.ContentPreviewScript.prototype._mergeRects = function(d, c) {
		var e = {};
		e.top = Math.min(d.top, c.top);
		e.bottom = Math.max(d.bottom, c.bottom);
		e.left = Math.min(d.left, c.left);
		e.right = Math.max(d.right, c.right);
		e.width = e.right - e.left;
		e.height = e.bottom - e.top;
		return e;
	};
	Downsha.ContentPreviewScript.prototype._shrinkYRect = function(d, c) {
		d.top = Math.max(d.top, c.top);
		d.bottom = Math.min(d.bottom, c.bottom);
		d.height = d.bottom - d.top;
		return d;
	};
})();