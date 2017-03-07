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
