/**
 * @author: chenmin
 * @date: 2011-08-31
 * @desc: manage toolbar button states occording to notifications:
 * 1. tab selection change or removed
 * 2. number of processing note changes
 * 3. Sim Search result received
 */

(function() {
	var LOG = null;
	Downsha.getToolbarManager = function() { // return the singleton of context object
		if (Downsha._toolbarManager == null)
			Downsha._toolbarManager = new Downsha.ToolbarManager();
		return Downsha._toolbarManager;
	};
	Downsha.__defineGetter__("toolbarManager", Downsha.getToolbarManager);

	Downsha.ToolbarManager =  function ToolbarManager() {
		LOG = Downsha.Logger.getInstance();
		this.processing = false;
	};

	Downsha.ToolbarManager.BIG_LABEL_CLASS = "big";
	Downsha.ToolbarManager.SMALL_LABEL_CLASS = "small";
	Downsha.ToolbarManager.PROCESSING_LABEL_CLASS = "processing";
	
	Downsha.ToolbarManager.prototype.onTabSelect = function(tabId) {
	};
	Downsha.ToolbarManager.prototype.onTabClose = function(tabId) {
	};
	Downsha.ToolbarManager.prototype.onProcess = function(count) {
		if(count == 0) {
			this.processing = false;
			this.setTooltipText(this.getToolbarButton());
			this.clearBadge();
		} else {
			this.processing = true;
			this.setTooltipText(this.getToolbarButton());
			this.updateBadge(count);
		}
	};
	Downsha.ToolbarManager.prototype.setTooltipText = function(button) {
		var tooltipMessage = this.processing ? "BrowserActionTitlePending" : "BrowserActionTitleDefault";
		if (button) {
			button.tooltipText = Downsha.chrome.i18n.getMessage(tooltipMessage);
		}
	};
	Downsha.ToolbarManager.prototype.updateBadge = function(count) {
		this.setTooltipText(this.getToolbarButton());
		
		var value = count > 10 ? count : " " + count;
		var labels = this.getToolbarValues();
		
		for (var i in labels) {
			labels[i].value = value;
			this.removeClassName(labels[i], this.constructor.PROCESSING_LABEL_CLASS);
			if(this.processing) { // if processing, add "processing" to className
				this.addClassName(labels[i], this.constructor.PROCESSING_LABEL_CLASS);
			}
		}
		
		var iconsize = document.getElementById("nav-bar").getAttribute("iconsize");
		var elementClass;
		if (iconsize === "large") {
			elementClass = this.constructor.BIG_LABEL_CLASS; // "big"
		} else {
			elementClass = this.constructor.SMALL_LABEL_CLASS; // "small"
		}
		
		for (var i in labels) {
			if (labels[i].className && labels[i].className.indexOf(elementClass) >= 0) {
				labels[i].style.display = "block";
				break;
			}
		}
	};
	Downsha.ToolbarManager.prototype.clearBadge = function() {
		var labels = this.getToolbarValues();
		for (var i in labels) {
			if (labels[i].style) {
				labels[i].style.display = "none"; // hide badge
			}
		}
	};
	Downsha.ToolbarManager.prototype.getToolbarButton = function() {
		return document.getElementById("downsha-button");
	};
	Downsha.ToolbarManager.prototype.getToolbarValues = function() {
		return document.getElementsByClassName("downsha-toolbar-value");
	};
	Downsha.ToolbarManager.prototype.addClassName = function(element, className) {
		if (element.className) {
			element.className += " " + className;
		}
	};
	Downsha.ToolbarManager.prototype.removeClassName = function(element, className) {
		var re = new RegExp(className + "?", "g");
		if (element.className) {
			element.className = element.className.replace(re, "");
		}
	};
})();
