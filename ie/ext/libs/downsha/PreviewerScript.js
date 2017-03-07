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
