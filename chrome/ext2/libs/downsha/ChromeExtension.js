/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: chrome extension manager is the core module of the extension.
 * 1. handles all the events defined by the chrome extension api
 * 2. handles all the events defined by internal program
 * 3. creates and removes context menus
 * 4. provides utilities of clipper and previewer, including nudge preview.
 */

(function() {
  var LOG = null;
  Downsha.getChromeExtension = function() { // make Downsha.chromeExtension object single and global
    if (!Downsha._chromeExtInstance) {
      var bg = chrome.extension.getBackgroundPage();
      if (window == bg) {
        /** we're running from background page, so create it at first time */
        Downsha._chromeExtInstance = new Downsha.ChromeExtension();
      } else {
      	/** we're running from other pages(popup,option,etc), so get it from background page */
        Downsha._chromeExtInstance = bg.Downsha.chromeExtension;
      }
    }
    return Downsha._chromeExtInstance;
  };
  Downsha.__defineGetter__("chromeExtension", Downsha.getChromeExtension);

  Downsha.ChromeExtension = function ChromeExtension() {
    this.initialize();
  };
  
  Downsha.ChromeExtension.INTRODUCTION_PAGE_DELAY = 2000; // introduction page delay time
  Downsha.ChromeExtension.DESKTOP_NOTIFICATION_TIMEOUT = 6000; // desktop notifier show time
  Downsha.ChromeExtension.POPUP_MONITOR_INTERVAL = 600; // interval time to check if popup dialog closed
  Downsha.ChromeExtension.POPUP_LOCATION = "/popup.html"; // popup dialog html path
  Downsha.ChromeExtension.ARTICLE_XHR_TIMEOUT = 3000; // timeout for xhr to fetch article rules

  Downsha.ChromeExtension.prototype._offline = false; // offline mode
  Downsha.ChromeExtension.prototype._localStore = null; // LocalStore object
  Downsha.ChromeExtension.prototype._logger = null; // Logger object
  Downsha.ChromeExtension.prototype._eventHandler = null; // EventHandler object
  Downsha.ChromeExtension.prototype._clipperContentScripting = null; // ClipperContentScripting object
  Downsha.ChromeExtension.prototype._contentPreview = null; // PreviewerContentScripting object
  Downsha.ChromeExtension.prototype._tabSemas = null; // tab semaphore array
  Downsha.ChromeExtension.prototype._popupMonitor = null; // timer to monitor whether popup dialog closed
  Downsha.ChromeExtension.prototype._articleRulesMap = {}; // map of url and article rules

  Downsha.ChromeExtension.prototype.initialize = function() {
    this.__defineGetter__("offline", this.isOffline);
    this.__defineSetter__("offline", this.setOffline);
    this.__defineGetter__("clipperContentScripting", this.getClipperContentScripting);
    this.__defineGetter__("contentPreview", this.getContentPreview);
    this.__defineGetter__("localStore", this.getLocalStore);
    this.__defineGetter__("logger", this.getLogger);
    this.initTabSemas();
    this.initEventHandler();
    this.initBindings();
    
    this.showIntro(); // show introduction page at first run time    
    LOG = this.logger; // setup global LOG at the end!
  };
  Downsha.ChromeExtension.prototype.destroy = function() {
  };
  Downsha.ChromeExtension.prototype.isOffline = function() {
    return this._offline;
  };
  Downsha.ChromeExtension.prototype.setOffline = function(bool) {
    this._offline = (bool) ? true : false;
    this.handleOffline();
  };
  Downsha.ChromeExtension.prototype.showIntro = function() { // show introduction page only at the first run time
    if (this.localStore && !this.localStore.get("introShown")) {
    	setTimeout(function(){ // delay introduction page
    		chrome.tabs.create({
    			url : chrome.i18n.getMessage("introPageUrl"),
    			selected : true
    		});
    	}, this.constructor.INTRODUCTION_PAGE_DELAY);
      this.localStore.put("introShown", "true");
    }
  };
  Downsha.ChromeExtension.prototype.getLogger = function(scope) { // general factory for logger
    var logLevel = Downsha.Logger.LOG_LEVEL_ERROR; // TODO
    if (this.localStore) {
      var opts = this.localStore.get("options");
      if (opts && typeof opts["debugLevel"] != 'undefiend') {
        logLevel = opts['debugLevel'];
      }
    }
    var logger = Downsha.Logger.getInstance(scope || arguments.callee.caller); // get scope specific logger
    logger.level = logLevel;
    return logger;
  };
  Downsha.ChromeExtension.prototype.getLocalStore = function() {
    if (!this._localStore) {
      this._localStore = new Downsha.LocalStore(null, // HTML5 local storage
      	new Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL(localStorage));
    }
    return this._localStore;
  };
  Downsha.ChromeExtension.prototype.getClipperContentScripting = function() {
    if (!this._clipperContentScripting) {
      this._clipperContentScripting = new Downsha.ClipperContentScripting();
      this._clipperContentScripting.ontimeout = function() {
        LOG.warn("ClipperContentScripting timed out...");
        alert(chrome.i18n.getMessage("contentScriptTimedOut"));
      };
      this._clipperContentScripting.createInstance = function() { //generate code for creating ClipperScript object
        var code = "Downsha.ContentClipper.destroyInstance();";
        code += "(function(){";
        code += "var inst = Downsha.ContentClipper.getInstance();";
        code += "inst.PAGE_CLIP_SUCCESS = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_SUCCESS;";
        code += "inst.PAGE_CLIP_CONTENT_TOO_BIG = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG;";
        code += "inst.PAGE_CLIP_CONTENT_SUCCESS = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_SUCCESS;";
        code += "inst.PAGE_CLIP_CONTENT_FAILURE = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_FAILURE;";
        code += "inst.PAGE_CLIP_FAILURE = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_FAILURE;";
        code += "})();";
        return code;
      };
    }
    return this._clipperContentScripting;
  };
  Downsha.ChromeExtension.prototype.getContentPreview = function() {
    if (!this._contentPreview) {
      var self = this;
      this._contentPreview = new Downsha.ContentPreview();
      this._contentPreview.ontimeout = function(tabId) {
      	LOG.warn("ContentPreview timed out...");
        var tabSema = self.getTabSemaphore(tabId);
        if (tabSema) {
          tabSema.signal();
        }
        this.__proto__.ontimeout(tabId);
      };
    }
    return this._contentPreview;
  };

  Downsha.ChromeExtension.prototype.initTabSemas = function() {
    this._tabSemas = {}; // store Semaphore objects for each existing tab
  };

  Downsha.ChromeExtension.prototype.initEventHandler = function() { // fill the container with all event handlers
    if (!this._eventHandler) {
	    this._eventHandler = new Downsha.EventHandler(this);
	    // user
	    this._eventHandler.add(Downsha.Constants.RequestType.LOGIN_SUCCESS, this.handleLoginSuccess);
	    this._eventHandler.add(Downsha.Constants.RequestType.LOGIN_ERROR, this.handleLoginError);
	    this._eventHandler.add(Downsha.Constants.RequestType.LOGOUT, this.handleLogout);
	    // clip
	    this._eventHandler.add(Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_SUCCESS, this.handlePageClipSuccess);
	    this._eventHandler.add(Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG, this.handlePageClipTooBig);
	    this._eventHandler.add(Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_FAILURE, this.handlePageClipFailure);
	    this._eventHandler.add(Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_FAILURE, this.handlePageClipFailure);
	    // preview
	    this._eventHandler.add(Downsha.Constants.RequestType.FETCH_STYLE_SHEET_RULES, this.handleFetchStyleSheetRules);
	    this._eventHandler.add(Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_SELECTION, this.handlePreviewClipActionSelection);
	    this._eventHandler.add(Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_FULL_PAGE, this.handlePreviewClipActionFullPage);
	    this._eventHandler.add(Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_ARTICLE, this.handlePreviewClipActionArticle);
	    this._eventHandler.add(Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_URL, this.handlePreviewClipActionUrl);
	    this._eventHandler.add(Downsha.Constants.RequestType.PREVIEW_NUDGE, this.handlePreviewNudge);
	    // popup
	    this._eventHandler.add(Downsha.Constants.RequestType.POPUP_STARTED, this.handlePopupStarted);
	    this._eventHandler.add(Downsha.Constants.RequestType.POPUP_ENDED, this.handlePopupEnded);
	    // article
	    this._eventHandler.add(Downsha.Constants.RequestType.FETCH_ARTICLE_RULES, this.handleFetchArticleRules);
  	}
  };

  Downsha.ChromeExtension.prototype.initBindings = function() {
    var self = this;
    // tab updates
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      self.handleTabUpdate(tabId, changeInfo, tab);
    });
    // tab selection changes
    chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
      self.handleTabSelectionChange(tabId, selectInfo);
    });
    // tab removed
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      self.handleTabRemoval(tabId, removeInfo);
    });
    // extension requests
    // Important! add listener function to handle RequestMessage sent by chrome.extension.sendRequest
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
      self.handleRequest(request, sender, sendResponse);
    });
  };

  Downsha.ChromeExtension.prototype.initContextMenu = function() {
    var opts = Downsha.context.getOptions(true);
    if (opts.useContextMenu) {
      this._setupContextMenus();
    } else {
      this._removeContextMenus();
    }
  };

  Downsha.ChromeExtension.prototype._removeContextMenus = function() {
    chrome.contextMenus.removeAll();
  };

  Downsha.ChromeExtension.prototype._setupContextMenus = function() {
    var self = this;
    chrome.contextMenus.create( // clip full page
			{
				title : chrome.i18n.getMessage("contextMenuClipAll"),
				contexts : [ "page", "image", "selection" ], // 'all'
				documentUrlPatterns : [ "http://*/*", "https://*/*" ], // all http and https pages
				onclick : function(info, tab) {
					self.doAsUser(
						function() { // user already login, start clip
							LOG.debug("Initiating page clip from menu item contextMenuClipPage");
							self.clipPageFromTab(tab, false);
						},
						function() { // user unknown, need to login first
							LOG.info("Cannot clip from menu item contextMenuClipPage because no user is known");
							alert(chrome.i18n.getMessage("contextMenuPleaseLogin"));
						});
				}
			},
			function() { // callback for menu creation
				if (chrome.extension.lastError) { // create error
					LOG.error("Error creating menu item contextMenuClipAll: " + chrome.extension.lastError);
				} else { // create ok
					LOG.debug("Successfully created menu item contextMenuClipAll");
				}
			});
  };

  Downsha.ChromeExtension.prototype.doAsUser = function(success, error) {
    LOG.debug("ChromeExtension.doAsUser");
    if (!Downsha.context.userKnown && typeof error == 'function') {
      error();
    } else {
    	// if user known, then login first
      var ok = function(response, status, xhr) {
        if (response.isSuccess() && typeof success == 'function') {
          success();
        } else if (typeof error == 'function') {
          error();
        }
      };
      var err = function() {
        if (typeof error == 'function') {
          error();
        }
      };
      Downsha.context.remote.assureLogin(ok, err);
    }
  };

  Downsha.ChromeExtension.prototype.openWindow = function(url) {
    var self = this;
    chrome.tabs.getSelected(null, function(tab) {
      var opts = {
        url : url
      };
      chrome.windows.create(opts);
    });
  };

  Downsha.ChromeExtension.prototype.handleOffline = function() {
    LOG.debug("ChromeExtension.handleOffline status: " + (this.offline ? "offline" : "online"));
  };

  Downsha.ChromeExtension.prototype.handleTabUpdate = function(tabId, changeInfo, tab) {
    var url = (typeof changeInfo == 'object' && changeInfo != null && changeInfo.url) ? changeInfo.url : tab.url;
    //LOG.debug("Url: " + url);
    
    if (changeInfo && changeInfo.status == "loading") {
      // Creating new semaphore for tab
      this._tabSemas[tabId] = new Downsha.Semaphore();
    } else if (changeInfo && changeInfo.status == "complete") {
      if (this._tabSemas[tabId]) {
        // Signaling tab semaphore
        this._tabSemas[tabId].signal();
      } else {
        // Setting up semaphore on tab
        this._tabSemas[tabId] = Downsha.Semaphore.mutex();
      }
    }
    Downsha.Utils.updateBadge(Downsha.context, tabId);
  };
  Downsha.ChromeExtension.prototype.handleTabSelectionChange = function(tabId, selectInfo) {
    Downsha.Utils.updateBadge(Downsha.context, tabId);
  };
  Downsha.ChromeExtension.prototype.handleTabRemoval = function(tabId, removeInfo) {
    this.removeTabSemaphore(tabId);
  };
  Downsha.ChromeExtension.prototype.handleRequest = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleRequest");
    if (typeof request == 'object' && request != null) {
      var requestMessage = Downsha.RequestMessage.fromObject(request);
      if (!requestMessage.isEmpty()) {
        this._eventHandler.handleEvent(
        	requestMessage.code, // message code
        	[ request, sender, sendResponse ] // pass as running arguments
        );
      }
    }
  };
  Downsha.ChromeExtension.prototype.handleLogout = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleLogout");
    Downsha.Utils.clearAllBadges();
    Downsha.context.resetUser();
    Downsha.context.destroy();
    sendResponse({}); // run callback sendResponse
  };
  Downsha.ChromeExtension.prototype.handleLoginSuccess = function() {
    LOG.debug("ChromeExtension.handleLoginSuccess");
  };
  Downsha.ChromeExtension.prototype.handleLoginError = function() {
    LOG.debug("ChromeExtension.handleLoginError");
  };

  Downsha.ChromeExtension.prototype.handlePageClipSuccess = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePageClipSuccess");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var dsInfo = new Downsha.DownshaInfo(requestMessage.message);
    var contentLength = (dsInfo && dsInfo.content) ? dsInfo.content.length : 0;
    LOG.debug("Clipped note's content length: " + contentLength);
    
    // now, it's time to process clip note
    Downsha.chromeExtension.processClip(dsInfo);
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePageClipTooBig = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePageClipTooBig");
    var msg = chrome.i18n.getMessage("fullPageClipTooBig");
    msg = $("<div>" + msg + "</div>").text();
    LOG.error(msg);
    alert(msg);
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePageClipFailure = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePageClipFailure");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var msg = (requestMessage.message) ? requestMessage.message : chrome.i18n.getMessage("fullPageClipFailure");
    msg = $("<div>" + msg + "</div>").text();
    LOG.error(msg);
    alert(msg);
    sendResponse({});
  };

  Downsha.ChromeExtension.prototype.handleFetchStyleSheetRules = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleFetchStyleSheetRules");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var url = requestMessage.message;
    if (url) {
      var opts = {
        url : url,
        type : "get",
        async : false, // synchronous mode to get remote css file
        success : function(text, status, xhr) {
          if (xhr.readyState == 4 && xhr.status == 200) {
            LOG.debug("Fetched css text of length: " + text.length + ".");
            sendResponse( {
              url : url,
              cssText : text // save css content to cssText and call sendResponse
            });
          } else {
            LOG.error("Could not fetch style sheet from: " + url);
            sendResponse( {
              url : url
            });
          }
        },
        error : function(xhr, status, err) {
          LOG.error("Could not fetch style sheet from: " + url);
          sendResponse( {
            url : url
          });
        }
      };
      LOG.debug("Fetching external style sheet from " + url);
      $.ajax(opts);
    }
  };

  Downsha.ChromeExtension.prototype.handlePreviewClipActionSelection = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionSelection");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      tabSema.critical(function() { // make sure only one action at a time
        self.contentPreview.previewSelection(tabId, function() {
          LOG.debug("Previewing selection of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePreviewClipActionFullPage = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionFullPage");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      tabSema.critical(function() {
        self.contentPreview.previewFullPage(tabId, function() {
          LOG.debug("Previewing full page of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePreviewClipActionArticle = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionArticle");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      var opts = Downsha.getContext(true).getOptions(true);
      tabSema.critical(function() {
        self.contentPreview.previewArticle(tabId, function() {
          LOG.debug("Previewing article of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePreviewClipActionUrl = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionUrl");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      tabSema.critical(function() {
        self.contentPreview.previewURL(tabId, function() {
          LOG.debug("Previewing article of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePreviewNudge = function(request, sender, sendResponse) {
      LOG.debug("ChromeExtension.handlePreviewNudge");
      var requestMessage = Downsha.RequestMessage.fromObject(request);
      var self = this;
      if (requestMessage 
          && typeof requestMessage.message.tabId == 'number' 
          && typeof requestMessage.message.direction == 'number') {
          var tabId = requestMessage.message.tabId;
          var direction = requestMessage.message.direction; // nudge direction: expand/shrink/previous/next
          var tabSema = this.getTabSemaphore(tabId);
          tabSema.critical(function() {
              self.contentPreview.nudgePreview(tabId, direction, function() {
                  LOG.debug("Nudging preview: " + direction);
                  tabSema.signal();
              });
          });
      }
      sendResponse({});
  };
  
  Downsha.ChromeExtension.prototype.handlePopupStarted = function(request, sender, sendResponse) { // popup started
    LOG.debug("ChromeExtension.handlePopupStarted");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    this.startPopupMonitor(); // start popup monitor
    sendResponse({});
  };
  Downsha.ChromeExtension.prototype.handlePopupEnded = function(request, sender, sendResponse) { // popup ended
    LOG.debug("ChromeExtension.handlePopupEnded");
    this.stopPopupMonitor(); // stop popup monitor
    this.contentPreview.clearAll(); // clear content preview
    sendResponse({});
  };

  Downsha.ChromeExtension.prototype.startPopupMonitor = function() {
    LOG.debug("ChromeExtension.startPopupMonitor");
    var self = this;
    this.stopPopupMonitor();
    this._popupMonitor = setInterval(function() {
      var views = chrome.extension.getViews();
      for ( var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.window.location.href // if popup.html exists, then do nothing.
            && view.window.location.href.indexOf(self.constructor.POPUP_LOCATION) > 0) {
          return;
        }
      }
      
      // if popup.html not exists, then send POPUP_ENDED request.
      var req = new Downsha.RequestMessage(Downsha.Constants.RequestType.POPUP_ENDED);
      self.handlePopupEnded(req, self, function() {});
      chrome.extension.sendRequest(req);
    }, this.constructor.POPUP_MONITOR_INTERVAL);
  };
  Downsha.ChromeExtension.prototype.stopPopupMonitor = function() {
    LOG.debug("ChromeExtension.stopPopupMonitor");
    if (this._popupMonitor) {
      clearInterval(this._popupMonitor);
      this._popupMonitor = null;
    }
  };
  
  Downsha.ChromeExtension.prototype.handleFetchArticleRules = function(request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleFetchArticleRules");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var url = requestMessage.message;
    if (url) {
    	if (typeof this._articleRulesMap[url] != 'undefined') {
    		LOG.debug("Cached article rules for: " + url);
    		sendResponse({rules : this._articleRulesMap[url]});
    	} else {
	      var opts = {
	        url : Downsha.getContext().getArticpatUrl(),
	        type : "POST",
	        dataType : "json",
	        async : true,
	        cache : true, // local cache is encouraged
	        timeout : this.constructor.ARTICLE_XHR_TIMEOUT, // timeout
	        data : {url : url},
	        success : function(data, status, xhr) {
	          if (xhr.readyState == 4 && xhr.status == 200) {
	            LOG.debug("Fetched article rules for: " + url);
	            self._articleRulesMap[url] = data;
	            sendResponse({rules : data});
	          } else {
	            LOG.error("Could not fetch article rules for: " + url);
	            sendResponse({});
	          }
	        },
	        error : function(xhr, status, err) {
	          LOG.error("Could not fetch article rules for: " + url);
	          sendResponse({});
	        }
	      };
	      LOG.debug("Fetching article rules for: " + url);
	      $.ajax(opts);
	    }
    } else {
    	sendResponse({});
    }
  };

  Downsha.ChromeExtension.prototype.clipPageFromTab = function(tab, fullPage, attrs) { // for conext menu - clip selection/article/page
    LOG.debug("ChromeExtension.clipPageFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) { // ignore forbidden url like chrome.google.com/extensions
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG.warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping content of a page in tab: " + tab.id);
      self.clipperContentScripting.perform(tab.id, fullPage, 
      	Downsha.context.getPreferredStylingStrategyQualifier(), {}, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipFullPageFromTab = function(tab, attrs) { // for browser icon - clip full page
    LOG.debug("ChromeExtension.clipFullPageFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG.warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping body of a page in tab: " + tab.id);
      self.clipperContentScripting.clipFullPage(tab.id, 
      	Downsha.context.getPreferredStylingStrategyQualifier(), attrs, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipSelectionFromTab = function(tab, attrs) { // for context menu and browser icon - clip selection
    LOG.debug("ChromeExtension.clipSelectionFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG.warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping selection of a page in tab: " + tab.id);
      self.clipperContentScripting.clipSelection(tab.id, 
      	Downsha.context.getPreferredStylingStrategyQualifier(), attrs, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipArticleFromTab = function(tab, attrs) { // for browser icon - clip article
    LOG.debug("ChromeExtension.clipArticleFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG.warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping article of a page in tab: " + tab.id);
      self.clipperContentScripting.clipArticle(tab.id, 
      	Downsha.context.getPreferredStylingStrategyQualifier(), attrs, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };  

  Downsha.ChromeExtension.prototype.clipUrlFromTab = function(tab, attrs) { // for context menu and browser icon - clip url
    LOG.debug("ChromeExtension.clipUrlFromTab");
    var self = this;
    var style = "";
    var favIcon = (tab.favIconUrl) ? tab.favIconUrl : null;
    var dsInfo = Downsha.DownshaInfo.createUrlNote(tab.title, tab.url, favIcon);
    this._overloadClipNote(dsInfo, attrs);
    if (!dsInfo.title) {
      dsInfo.title = chrome.i18n.getMessage("quickNote_untitledNote");
    }
    if (LOG.isDebugEnabled()) {
      LOG.debug("Clipping URL: ");
      LOG.dir(dsInfo.content);
    }
    this.processClip(dsInfo);
  };

  Downsha.ChromeExtension.prototype._overloadClipNote = function(note, attrs) {
    if (note && attrs) {
      for ( var a in attrs) {
        if (Downsha.hasOwnProperty(note, a)) {
          try {
            if (attrs[a]) {
              note[a] = attrs[a];
            }
          } catch (e) {
          }
        }
      }
    }
  };

  Downsha.ChromeExtension.prototype.processClip = function(dsInfo) {
    LOG.debug("ChromeExtension.processClip");
    
    // show clip content in a new window
    //var contentWindow = window.open();
    //contentWindow.document.body.innerHTML = dsInfo.content;
    
		var self = this;
		var clipConverter = new Downsha.ClipConverter();
		var clipSender = new Downsha.ClipSender();
    clipConverter.startUp(dsInfo, 
    	function() {
    		clipSender.startUp(dsInfo, 
    			function() {
    				self.notifyProcessSuccess(dsInfo);
    			},
    			function() {
    				self.notifyProcessError(dsInfo);
    		});
    	},
    	function() {
    		self.notifyProcessError(dsInfo);
    });
  };
  Downsha.ChromeExtension.prototype.notifyProcessSuccess = function(dsInfo) {
  	LOG.debug("ChromeExtension.notifyProcessSuccess");
    var opts = Downsha.context.getOptions(true);
    if (opts && opts.clipNotificationEnabled) { // show notifier dialog now
    	try {
    		// use simple desktop notifier to show notification.
    		var title = (dsInfo && dsInfo.title) ? dsInfo.title : "";
    		title = chrome.i18n.getMessage("desktopNotification_clipUploaded", [title]);
    		var message = chrome.i18n.getMessage("desktopNotification_clipUploadedMessage");
    		var timeout = this.constructor.DESKTOP_NOTIFICATION_TIMEOUT;
    		Downsha.Utils.notifyDesktop(title, message, timeout);
    	} catch(e) {
    		LOG.error(e);
    	}
    }
  };
  Downsha.ChromeExtension.prototype.notifyProcessError = function(dsInfo) {
  	LOG.debug("ChromeExtension.notifyProcessError");
		// use simple desktop notifier to show unexpected error.
		var title = (dsInfo && dsInfo.title) ? dsInfo.title : "";
		title = chrome.i18n.getMessage("desktopNotification_unableToSaveClip", [title]);
		var message = chrome.i18n.getMessage("desktopNotification_unableToSaveClipUnknownMessage");
		Downsha.Utils.notifyDesktop(title, message);
  };

  Downsha.ChromeExtension.prototype.getCurrentTab = function(fn) {
    chrome.windows.getCurrent(function(win) {
      chrome.tabs.getSelected(win.id, fn);
    });
  };
  Downsha.ChromeExtension.prototype.executeContentScript = function(object, callback) {
    this.getCurrentTab(function(tab) {
      chrome.tabs.executeScript(tab.id, object, callback);
    });
  };
  Downsha.ChromeExtension.prototype.getTabSemaphore = function(tabId) {
    if (typeof tabId == 'number' && !this._tabSemas[tabId]) {
      this._tabSemas[tabId] = Downsha.Semaphore.mutex();
    }
    return this._tabSemas[tabId];
  };
  Downsha.ChromeExtension.prototype.removeTabSemaphore = function(tabId) {
    if (typeof tabId == 'number' && this._tabSemas[tabId]) {
      // Destroying tab semaphore
      this._tabSemas[tabId] = null;
      delete this._tabSemas[tabId];
    }
  };
})();

