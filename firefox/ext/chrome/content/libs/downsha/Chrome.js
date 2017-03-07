/**
 * @author: chenmin
 * @date: 2011-09-01
 * @desc: firefox chrome manager, simulate google chrome extension api.
 * chrome.extension: provides request handler mechanism.
 * chrome.tab: provides information of current tab.
 * chrome.i18n: getMessage provides localized message for specified key.
 */

(function() {
	var LOG = null;
	Downsha.Chrome = function Chrome() {
		LOG = Downsha.Logger.getInstance();
		this.__defineGetter__("version", this.getVersion);
		this.__defineSetter__("version", this.setVersion);
		this.__defineGetter__("extension", this.getExtension);
		this.__defineSetter__("extension", this.setExtension);
	};
	
	Downsha.Chrome.REQUEST_EVENT_DATA_KEY = "chromeRequest";
  Downsha.Chrome.EXTENSION_ID = "web_clipper_firefox@downsha.com";	
	
	Downsha.Chrome.prototype._version = null;
	Downsha.Chrome.prototype._extension = null;
	Downsha.Chrome.prototype.tabs = null;
	Downsha.Chrome.prototype.i18n = null;
	
  Downsha.Chrome.prototype.setVersion = function() {
  	if (this._version) return;
		var self = this;
		var callback = function (version) {
			if (typeof version == 'string' && version != '') {
				var n = version.split(".");
				if (n) {
					self._version = parseInt(n[0]) * 281474976710656 + parseInt(n[1]) * 4294967296 + parseInt(n[2]) * 65536 + parseInt(n[3]);
				}
			}
		};
		
		try {
			// Firefox 4 and later; Mozilla 2 and later
			AddonManager.getAddonByID(this.constructor.EXTENSION_ID, function(addon) {
				if (addon && addon.version) {
					callback(addon.version);
				}
			});
		} catch (e) {
		}
  };
  
  Downsha.Chrome.prototype.getVersion = function() {
  	return this._version;
  };
  
	Downsha.Chrome.prototype.setExtension = function(winObj) { // save extension object to global window
		if (typeof winObj["Downsha"] == 'undefined') {
			winObj["Downsha"] = {};
		}
		if (typeof winObj["Downsha"]["_extension"] == 'undefined') {
			winObj["Downsha"]["_extension"] = {};
		}
		this._extension = winObj["Downsha"]["_extension"];
		
		var self = this;
		if (this._extension) {
			this._extension.onRequest = function(obj) {
				LOG.debug("chrome.extension.onRequest");
				arguments.callee._listeners.forEach(function(fn) {
					try {
						fn(obj); // call each function of listener array
					} catch(e) {
						LOG.error("On request for listener failed: " + JSON.stringify(e));
					}
				});
			};
			this._extension.onRequest._listeners = []; // listener function array
			this._extension.onRequest.addListener = function(listenerFn) {
				LOG.debug("chrome.extension.addListener");
				self._extension.onRequest._listeners.push(listenerFn);
			};
			this._extension.onRequest.removeListener = function(listenerFn) {
				self._extension.onRequest._listeners.forEach(function(f, i, a) {
					if (f == listenerFn) {
						a.splice(i, 1);
					}
				});
			};
			this._extension.sendRequest = function(obj) { // send request, the obj should have request type
				LOG.debug("chrome.extension.sendRequest");
				self._extension.onRequest(obj); // synchronous! exit after all listener functions have been run
			};
			this._extension.requestEventHandler = function(event) { // not used now, preserved for future
				if (event && typeof event[self.constructor.REQUEST_EVENT_DATA_KEY] != 'undefined') { // "chromeRequest"
					self._extension.sendRequest(event[self.constructor.REQUEST_EVENT_DATA_KEY]);
				}
			};
		}
	};
	Downsha.Chrome.prototype.getExtension = function() {
		return this._extension;
	};
	Downsha.Chrome.prototype.getTabIdForHttpChannel = function(httpChannel) {
		try {
			if (httpChannel.notificationCallbacks) {
				var interfaceRequestor = httpChannel.notificationCallbacks.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
				var targetDoc = interfaceRequestor.getInterface(Components.interfaces.nsIDOMWindow).document;
				// gBrowser is only accessible from the scope of the browser window (browser.xul)
				var targetBrowserIndex = gBrowser.getBrowserIndexForDocument(targetDoc);
				
				// handle the case where there was no tab associated with the request (rss, etc)
				if (targetBrowserIndex != -1) {
					return gBrowser.tabContainer.childNodes[targetBrowserIndex].linkedPanel;
				}
			}
		} catch (e) {
		}
		
		return null;
	};
})();

(function() {
	var LOG = null;
	Downsha.Chrome.Tabs = function Tabs() {
		LOG = Downsha.Logger.getInstance();
		this.selected = null;
	};
	Downsha.Chrome.Tabs.prototype.getSelected = function(tabid, callback) {
		if (callback != undefined) {
			callback(this.selected);
		} else {
			return this.selected;
		}
	};
	Downsha.Chrome.Tabs.prototype.create = function(param) {
		var browser = top.document.getElementById("content"); // browser equals to gBrowser in browser.xul
		browser.selectedTab = browser.addTab(param.url);
	};
	
	Downsha.Chrome.Tabs.prototype.getSelectedTabId = function() {
		return window.top.getBrowser().selectedTab.linkedPanel;
	};
})();

(function() {
	var LOG = null;
	Downsha.Chrome.I18n = function I18n() {
		LOG = Downsha.Logger.getInstance();
		this.stringBundle = null;
	};
	Downsha.Chrome.I18n.prototype.getMessage = function(key, params) { // get localized message for specified key
		if (this.stringBundle) {
			try {
				if (typeof params != 'undefined') {
					var p = [].concat(params);
					return this.stringBundle.formatStringFromName(key, p, p.length);
				} else {
					return this.stringBundle.GetStringFromName(key);
				}
			} catch (e) {
				LOG.error("Failed to get string our of stringbundle: " + e + " for key = " + key);
				return undefined;
			}
		}
		return key;
	};
})();
