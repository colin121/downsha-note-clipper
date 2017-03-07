/**
 * @author: chenmin
 * @date: 2011-10-03
 * @desc: ContentVeil manages the canvas veil of clip preview.
 * we need to hide all <object> and <embed> nodes when show canvas veil, 
 * and restore all <object> and <embed> nodes when hide canvas veil.
 */

(function() {
	var LOG = null;
	Downsha.ContentVeil = function(win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	Downsha.ContentVeil.prototype.window = null;
	Downsha.ContentVeil.prototype.VEIL_ID = "downshaContentVeil"; // id name of canvas veil
	Downsha.ContentVeil.prototype.VEIL_CLASS = "downshaContentVeil"; // class name of canvas veil
	Downsha.ContentVeil.prototype.FILL_STYLE = "rgba(0, 0, 0, 0.8)"; // color: black, alpha: 0.8
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
	
	Downsha.ContentVeil.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		this.veil = this.createVeilElement();
	};
	Downsha.ContentVeil.prototype.createVeilElement = function() {
		var veilNode = document.createElement("CANVAS");
		veilNode.setAttribute("id", this.VEIL_ID);
		veilNode.setAttribute("class", this.VEIL_CLASS);
		veilNode.height = this.getBodyHeight();
		veilNode.width = this.getBodyWidth();
		for (var i in this.ELEMENT_STYLE) {
			veilNode.style[i] = this.ELEMENT_STYLE[i];
		}
		return veilNode;
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
		this._revealRect = veilRect;
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
	};
	Downsha.ContentVeil.prototype.clearRect = function(veilRect) {
		var curContext = this.getVeilContext();
		var veilLeft = veilRect.left;
		var veilTop = veilRect.top;
		var veilWidth = veilRect.right - veilRect.left;
		var veilHeight = veilRect.bottom - veilRect.top;
		curContext.clearRect(veilLeft, veilTop, veilWidth, veilHeight);
		curContext.fillStyle = this.FILL_STYLE;
		curContext.fillRect(veilLeft, veilTop, veilWidth, veilHeight);
	};
	Downsha.ContentVeil.prototype.resetVeil = function() { // reset veil to alpha 0.8
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
	Downsha.ContentVeil.prototype.getVeilElement = function() {
		if (!this._veil) {
			this._veil = this.window.document.getElementById(this.VEIL_ID);
			if (!this._veil) {
				this._veil = this.createVeilElement();
			}
		}
		return this._veil;
	};
	Downsha.ContentVeil.prototype.getVeilContext = function() {
	  if (!this._veilContext) {
	  	this._veilContext = this.getVeilElement().getContext("2d"); // canvas 2d context
	  }
	  return this._veilContext;
	};
	Downsha.ContentVeil.prototype.removeVeilElement = function() {
	  if (this._veil) {
	  	this._veil.parentElement.removeChild(this._veil);
	  }
	};
	Downsha.ContentVeil.prototype.getDefaultVeilParentElement = function() {
	  return (this.window.document.body.parentElement) ? 
	  	this.window.document.body.parentElement : this.window.document.body;
	};
	Downsha.ContentVeil.prototype.show = function() {
		this.hideEmbeds(this.window.document, true);
		var veilEle = this.getVeilElement();
		if (!veilEle.parentElement) {
			var veilParent = this.getDefaultVeilParentElement();
			if (veilParent) {
				veilParent.appendChild(veilEle);
			}
		}
		veilEle.style.display = "";
	};
	Downsha.ContentVeil.prototype.hide = function() {
		this.unhideEmbeds(this.window.document, true);
		var veilEle = this.getVeilElement();
		veilEle.style.display = "none";
	};
	Downsha.ContentVeil.prototype.clear = function() {
		this.clearEmbeds(this.window.document, true);
	};
	Downsha.ContentVeil.prototype.getBodyHeight = function() {
		return this.window.document.documentElement.scrollHeight;
	};
	Downsha.ContentVeil.prototype.getBodyWidth = function() {
		return this.window.document.documentElement.scrollWidth;
	};
	Downsha.ContentVeil.prototype.hideEmbeds = function(doc, deep) {
		var embeds = Downsha.Utils.findEmbeds(doc);
		if (embeds && embeds.length > 0) {
			LOG.debug("ContentVeil.hideEmbeds find " + embeds.length + " <object> and <embed> nodes");
			var view = (doc.defaultView) ? doc.defaultView : this.window;
			for (var i = 0; i < embeds.length; i++) {
				var embed = embeds[i];
				if (typeof embed[this.EMBED_TRANS_MARKER] != "undefined") { // if it has a marker, we hide it directly.
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
				
				if (this._revealRect) {
					var embedRect = Downsha.Utils.getAbsoluteBoundingClientRect(embed);
					if (embedRect.top >= this._revealRect.top && 
						embedRect.left >= this._revealRect.left && 
						embedRect.bottom <= this._revealRect.bottom && 
						embedRect.right <= this._revealRect.right) { // ignore if it is in reveal rectangle
						continue;
					}
				}
				
				var marker = null;
				var implementation = null;
				if (Downsha.ElementSerializerFactory) {
					implementation = Downsha.ElementSerializerFactory.getImplementationFor(embed);
				}
				if (implementation) { // show preview marker if possible
					var strategy = new Downsha.ClipFullStylingStrategy(view);
					var styles = strategy.styleForNode(embed, embed.parentElement, false);
					var serializer = new implementation(embed, styles);
					var innerHTML = serializer.serialize();
					if (innerHTML) {
						var rect = embed.getBoundingClientRect();
						marker = doc.createElement("div");
						marker[this.EMBED_TRANS_PREVIEW_MARKER] = embed;
						marker.style.cssText = "display: none; position: absolute, margin: 0px; padding: 0px;";
						if (rect) {
							marker.style.cssText += "left: " + rect.left + "px; top: " + rect.top + "px; width: " + rect.width + "px; height: " + rect.height + "px;";
						}
						marker.innerHTML = innerHTML;
						marker.setAttribute("class", this.EMBED_TRANS_PREVIEW_MARKER);
						embed.parentElement.insertBefore(marker, embed);
					}
				}
				var classes = (embed.classList) ? Array.prototype.slice.call(embed.classList, 0) : [];
				classes.push(this.EMBED_TRANS_MARKER);
				embed.setAttribute("class", classes.join(" ")); // add marker className to <object> node or <embed> node
				embed[this.EMBED_TRANS_MARKER] = marker; // remember preview marker if possible
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
		if (marker && marker.parentElement) {
			marker.parentElement.removeChild(marker);
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
		delete embed[this.EMBED_TRANS_MARKER];
	};
})();