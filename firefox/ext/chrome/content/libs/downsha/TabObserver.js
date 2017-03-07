/**
 * @author: chenmin
 * @date: 2011-08-31
 * @desc: tab event observer for firefox
 */
(function() {
	var LOG = null;
	Downsha.getTabObserver = function() { // return the singleton of context object
		if (Downsha._tabObserver == null)
			Downsha._tabObserver = new Downsha.TabObserver();
		return Downsha._tabObserver;
	};
	Downsha.__defineGetter__("tabObserver", Downsha.getTabObserver);	
	
	Downsha.TabObserver = function() {
		LOG = Downsha.Logger.getInstance();
	};
	Downsha.TabObserver.prototype.init = function() {
		var container = gBrowser.tabContainer;
		container.addEventListener("TabClose", this.onTabClose, false);
		container.addEventListener("TabSelect", this.onTabSelect, false);
	};
	Downsha.TabObserver.prototype.onTabClose = function(event) {
		var tabId = event.target.linkedPanel;
		Downsha.toolbarManager.onTabClose(tabId);
	};
	Downsha.TabObserver.prototype.onTabSelect = function(event) {
		var tabId = event.target.linkedPanel;
		Downsha.toolbarManager.onTabSelect(tabId);
	};
})();
