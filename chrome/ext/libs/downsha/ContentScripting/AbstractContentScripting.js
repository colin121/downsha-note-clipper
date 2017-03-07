/**
 * @author: chenmin
 * @date: 2011-09-26
 * @desc: ContentScriptingMixin is a set of utilities of content scripting execution.
 * AbstractContentScripting manages all status of tabs that running content scripting.
 */

(function() {
  var LOG = null;

  Downsha.ContentScriptingMixin = function ContentScriptingMixin() {
  };
  Downsha.ContentScriptingMixin.prototype.startScriptTimer = function(tabId, timeoutCallback, t) {
    LOG = LOG || Downsha.Logger.getInstance(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.startScriptTimer");
    return setTimeout(function() {
      LOG.debug("Content script load/execution timed out");
      if (typeof timeoutCallback == 'function') {
        timeoutCallback(tabId);
      }
    }, t);
  };
  Downsha.ContentScriptingMixin.prototype.stopScriptTimer = function(timerId) {
  	LOG = LOG || Downsha.Logger.getInstance(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.stopScriptTimer");
    if (typeof timerId == 'number') {
      clearTimeout(timerId);
    }
  };
  Downsha.ContentScriptingMixin.prototype.executeScript = function(tabId, scriptObj, oncomplete) {
  	LOG = LOG || Downsha.Logger.getInstance(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.executeScript");
    if (typeof tabId != 'number') {
      tabId = null;
    }
    this.doExecuteScript(tabId, scriptObj, null, oncomplete);
  };
  Downsha.ContentScriptingMixin.prototype.executeTimedScript = function(tabId, scriptObj, timeout, oncomplete, ontimeout) {
  	LOG = LOG || Downsha.Logger.getInstance(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.executeTimedScript");
    if (typeof tabId != 'number') {
      tabId = null;
    }
    if (typeof timeout != 'number') {
      timeout = 0;
    }
    var timer = 0;
    var self = this;
    this.doExecuteScript(tabId, scriptObj, 
    function() { // onstart event, let's start timer
      timer = self.startScriptTimer(tabId, ontimeout, timeout);
    }, 
    function() { // oncomplete event, let's stop timer
      self.stopScriptTimer(timer);
      if (typeof oncomplete == 'function') {
        oncomplete();
      }
    });
  };
  Downsha.ContentScriptingMixin.prototype.doExecuteScript = function(tabId, scriptObj, onstart, oncomplete) {
  	LOG = LOG || Downsha.Logger.getInstance(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.doExecuteScript");
    if (typeof tabId != 'number') {
      tabId = null;
    }
    if (typeof onstart == 'function') {
      LOG.debug("Executing onstart");
      onstart();
    }
    chrome.tabs.executeScript(tabId, scriptObj, function() {
      if (typeof oncomplete == 'function') {
        LOG.debug("Executing oncomplete");
        oncomplete();
      }
    });
  };
})();

(function() {
  var LOG = null;

  /**
   * Map of various states of this controller.
   */
  var ContentScriptingStatus = {
    UNKNOWN : 0,
    LOADING : 1,
    LOADED : 2,
    EXECUTING : 3,
    FINISHED : 4,
    TIMEDOUT : 5,
    ERROR : 6
  };

  Downsha.AbstractContentScripting = function AbstractContentScripting() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };

  Downsha.mixin(Downsha.AbstractContentScripting,
      Downsha.ContentScriptingMixin, { // extends the following three methods to AbstractContentScripting
        "executeScript" : "mixinExecuteScript",
        "executeTimedScript" : "mixinExecuteTimedScript",
        "doExecuteScript" : "mixinDoExecuteScript"
      });

  Downsha.AbstractContentScripting.prototype._status = null; // records status of all tabs
  Downsha.AbstractContentScripting.prototype._sema = null;
  Downsha.AbstractContentScripting.TIMEOUT = 10000; // execution timeout for each current content scripting file

  Downsha.AbstractContentScripting.prototype.initialize = function() {
    //LOG.debug("AbstractContentScripting.initialize");
    this._status = {};
    this._sema = Downsha.Semaphore.mutex();
    this.initializeTabListeners();
  };
  Downsha.AbstractContentScripting.prototype.initializeTabListeners = function() {
    this.initializeTabUpdateListener();
    this.initializeTabRemoveListener();
  };
  Downsha.AbstractContentScripting.prototype.initializeTabUpdateListener = function() {
    var self = this;
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      self.handleTabUpdate(tabId, changeInfo, tab);
    });
  };
  Downsha.AbstractContentScripting.prototype.initializeTabRemoveListener = function() {
    var self = this;
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      self.handleTabRemove(tabId, removeInfo);
    });
  };
  Downsha.AbstractContentScripting.prototype.handleTabUpdate = function(tabId, changeInfo, tab) {
    //LOG.debug("AbstractContentScripting.handleTabUpdate(tabId: " + tabId + ")");
    if (changeInfo && changeInfo.status == "loading") {
      this.forgetTab(tabId);
    }
  };
  Downsha.AbstractContentScripting.prototype.handleTabRemove = function(tabId, removeInfo) {
    //LOG.debug("AbstractContentScripting.handleTabRemove(tabId: " + tabId + ")");
    this.forgetTab(tabId);
  };
  Downsha.AbstractContentScripting.prototype.forgetTab = function(tabId) {
    if (typeof tabId == 'number' && this._status[tabId]) {
      LOG.debug("Deleting remembered tabId: " + tabId);
      delete this._status[tabId];
    }
  };
  Downsha.AbstractContentScripting.prototype.setStatus = function(tabId, status) {
    if (typeof tabId == 'number') {
      LOG.debug("Setting status of tabId: " + tabId + " to status: " + status);
      this._status[tabId] = status;
    }
  };
  Downsha.AbstractContentScripting.prototype.getStatus = function(tabId) {
    if (typeof this._status[tabId] == 'number') {
      return this._status[tabId];
    } else {
      return ContentScriptingStatus.UNKNOWN;
    }
  };
  Downsha.AbstractContentScripting.prototype.getRequiredScriptNames = function() {
    return [];
  };
  Downsha.AbstractContentScripting.prototype.isRequiredScriptsLoaded = function(tabId) {
    return (this.getRequiredScriptNames().length == 0 || this.getStatus(tabId) >= ContentScriptingStatus.LOADED);
  };
  Downsha.AbstractContentScripting.prototype.isRequiredScriptsLoading = function(tabId) {
    return (this.getStatus(tabId) == ContentScriptingStatus.LOADING) ? true : false;
  };
  Downsha.AbstractContentScripting.prototype._logTabInfo = function(tabId) {
    chrome.tabs.get(tabId, function(tab) {
      LOG.debug("tabId: " + tabId +  " url: " + tab.url);
    });
  };
  Downsha.AbstractContentScripting.prototype.loadRequiredScripts = function(tabId, callback) {
    LOG.debug("AbstractContentScripting.loadRequiredScripts");
		if (LOG.isDebugEnabled()) {
			this._logTabInfo(tabId);
		}
    var self = this;
    this.setStatus(tabId, ContentScriptingStatus.LOADING); // set status=loading
    self._loadRequiredScripts(tabId, function() { // callback for all files loaded ok
      LOG.debug("Finished loading required scripts");
      self.setStatus(tabId, ContentScriptingStatus.LOADED); // set status=loaded
      if (typeof callback == 'function') {
        LOG.debug("Executing callback after loading required scripts");
        callback();
      }
    }, self.ontimeout, self.getRequiredScriptNames());
  };
  Downsha.AbstractContentScripting.prototype._loadRequiredScripts = function(tabId, callback, ontimeout, scripts) {
    var self = this;
    if (scripts && scripts.length > 0) {
      var script = scripts.shift();
      LOG.debug("Loading script: " + script + " with timeout of: " + this.constructor.TIMEOUT);
      this.mixinExecuteTimedScript(tabId, {
        file : script
      }, this.constructor.TIMEOUT, function() { // current file is loaded ok, let's load next file
        LOG.debug("Loaded script: " + script);
        self._loadRequiredScripts(tabId, callback, ontimeout, scripts);
      }, function() {
        LOG.debug("Timed out after waiting for " + self.constructor.TIMEOUT
            + " ms for script to load: " + script);
        if (typeof ontimeout == 'function') {
          ontimeout(tabId);
        }
      });
    } else { // all files loaded ok
      LOG.debug("Finished loading scripts into tabId: " + tabId);
      this.onload(tabId, callback);
    }
  };
  Downsha.AbstractContentScripting.prototype.getOnloadCode = function() {
    return "Downsha.Logger.setGlobalLevel(" + LOG.level + ");"; // pass current log level to content scripting
  };
  Downsha.AbstractContentScripting.prototype.onload = function(tabId, callback) {
    LOG.debug("AbstractContentScripting.onload");
    LOG.debug("Setting up Logger inside the content page");
    this.mixinDoExecuteScript(tabId, {
      code : this.getOnloadCode()
    }, null, function() {
      if (typeof callback == 'function') {
        LOG.debug("Executing callback after loading all required scripts");
        callback();
      }
    });
  };
  Downsha.AbstractContentScripting.prototype.ontimeout = function(tabId) {
    LOG.debug("AbstractContentScripting.ontimeout");
    Downsha.Utils.notifyExtension(new Downsha.RequestMessage( // send message CONTENT_SCRIPT_LOAD_TIMEOUT to ChromeExtension
    	Downsha.Constants.RequestType.CONTENT_SCRIPT_LOAD_TIMEOUT, 
    	{tabId : tabId}
    ));
  };
  Downsha.AbstractContentScripting.prototype.ensureRequiredScripts = function(tabId, callback) {
    LOG.debug("AbstractContentScripting.ensureRequiredScripts");
    if (this.isRequiredScriptsLoaded(tabId)) {
      if (typeof callback == 'function') {
        callback();
      }
    } else if (!this.isRequiredScriptsLoading(tabId)) {
      LOG.debug("ContentScript wasn't injected yet, injecting it. (tabId: "
              + tabId + ";status: " + this.getStatus(tabId) + ")");
      try {
        this.loadRequiredScripts(tabId, callback);
      } catch (e) {
        LOG.error(e);
      }
    }
  };
  
  /**
   * executeScript overrides same name function of mixin, and call doExecuteScript internally.
   * executeScript uses semaphore, so currently it is used by outer callers.
   */
  Downsha.AbstractContentScripting.prototype.executeScript = function(tabId, scriptObject, oncomplete) {
    LOG.debug("AbstractContentScripting.executeScript");
    var self = this;
    this.ensureRequiredScripts(
    	tabId, 
    	function() { // callback for all required scripts loaded
    		self.doExecuteScript(
    			tabId, // current tab
    			scriptObject, //script code that needs to be run
    			function() { // onstart callback
    				self.setStatus(tabId, ContentScriptingStatus.EXECUTING);
    			},
    			function() { // oncomplete callback
    				self.setStatus(tabId, ContentScriptingStatus.FINISHED);
    				if (typeof oncomplete == 'function') {
    					oncomplete();
    				}
    			}
    		);
    	}
    );
  };
 
  /**
   * executeTimedScript overrides same name function of mixin, and call mixinExecuteTimedScript internally.
   * executeTimedScript does NOT use semaphore, so currently it is NOT used by outer callers.
   */
  Downsha.AbstractContentScripting.prototype.executeTimedScript = function(tabId, scriptObject, timeout, oncomplete, ontimeout) {
    LOG.debug("AbstractContentScripting.executeTimedScript");
    var self = this;
    this.ensureRequiredScripts(
    	tabId,
    	function() { // callback for all required scripts loaded
		    self.mixinExecuteTimedScript(
		    	tabId, // current tab
		    	scriptObject, //script code that needs to be run
		    	timeout, // timeout milliseconds
		    	function() { // oncomplete callback
		    		self.setStatus(tabId, ContentScriptingStatus.FINISHED);
		    		if (typeof oncomplete == 'function') {
		    			oncomplete();
		    		}
		    	},
		    	function() { // ontimeout callback
		    		self.setStatus(tabId, ContentScriptingStatus.TIMEDOUT);
		    		if (typeof ontimeout == 'function') {
		    			ontimeout(tabId);
		    		}
		    	}
		    );
		  }
		);
  };
  
  /**
   * doExecuteScript overrides same name function of mixin, and call mixinDoExecuteScript internally.
   * doExecuteScript uses semaphore to strictly running only one content scripting at a time.
   */
  Downsha.AbstractContentScripting.prototype.doExecuteScript = function(tabId, scriptObject, onstart, oncomplete) {
    var self = this;
    this._sema.critical(function() {
    	try {
				if (scriptObject.file) {
		      LOG.debug("Executing content script from file: " + scriptObject.file);
		    } else if (scriptObject.code) {
		      LOG.debug("Executing content script: " + scriptObject.code);
		    }
	      self.mixinDoExecuteScript(
	      	tabId,
	      	scriptObject,
	      	onstart,
	      	function() {
	      		self._sema.signal();
	      		if (typeof oncomplete == 'function') {
	      			oncomplete();
	      		}
					}
				);
	    } catch (e) {
	    	self.setStatus(tabId, ContentScriptingStatus.ERROR);
	      LOG.error(e);
	      self._sema.signal();
	    }
		});
  };
})();
