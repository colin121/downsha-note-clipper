/**
 * @author: chenmin
 * @date: 2011-08-31
 * @desc: firefox overlay manager, called by overlay.xul.
 * clip work flow is as following:
 * 1. Downsha.Overlay.startUp: init modules and start up work
 * 2. Downsha.Overlay.openPopup: open popup dialog
 * 3. Downsha.ChromePopup.startUp: preparation for clip form, called by popup.html
 * 4. Downsha.ChromePopup.previewQuickNoteAction: start preview process after init
 * 5. Downsha.ContentPreviewScript.previewFullPage/previewURL/previewArticle/previewSelection
 * ...waiting for submit or cancel...
 * 6. Downsha.ChromePopup.submitQuickNoteForm: start clip process after submit
 * 7. Downsha.Clip.clipBody/clipSelection/clipArticle/clipUrl
 * 8. Downsha.Overlay.startClip: popup dialog call this function back
 * 9. Downsha.ClipStorer.saveNote: save content to local disk temporarily
 * 10. Downsha.QueueProcessor.addTask: add sending task to queue
 * 11. Downsha.ClipHandler.send: convert and send note to server
 */

(function() {
  var LOG = null;
  Downsha.getOverlay = function() {
    if (Downsha._overlay == null) {
      Downsha._overlay = new Downsha.Overlay();
    }
    return Downsha._overlay;
  };
  Downsha.__defineGetter__("overlay", Downsha.getOverlay);
  
	Downsha.Overlay = function Overlay() {
    LOG = Downsha.Logger.getInstance();
	};
	
	Downsha.Overlay.DEFAULT_POPUP_WIDTH = 446;
	Downsha.Overlay.SEND_DELAY_TIME = 10;
	
	Downsha.Overlay.prototype.popupDialog = null; // popup dialog
	Downsha.Overlay.prototype.stringBundle = null; // string table for i18n
	Downsha.Overlay.prototype.rootElement  = null; // NOT USED source element of selection or root of document
	Downsha.Overlay.prototype.rightClick   = false; // NOT USED whether right click when called.
	Downsha.Overlay.prototype.clip = null; // clip object
	
  Downsha.Overlay.prototype.initChrome = function() {
    LOG.debug("Overlay.initChrome");
    if (!Downsha.chrome) {
    	Downsha.chrome = new Downsha.Chrome();
    	Downsha.chrome.tabs = new Downsha.Chrome.Tabs();
    	Downsha.chrome.i18n = new Downsha.Chrome.I18n();
    }
    if (Downsha.chrome) {
    	// call addon manager to get version of current extension
    	Downsha.chrome.setVersion();
    	// call Downsha.chrome.setExtension to init request mechanism
      Downsha.chrome.extension = window;
      // remember current window content as selected tab
      Downsha.chrome.tabs.selected = content;
      
	    if (this.stringBundle == null) {
	    	this.stringBundle = document.getElementById("downsha_i18n");
	    }
      if (this.stringBundle) {
      	Downsha.chrome.i18n.stringBundle = this.stringBundle.stringBundle;
      }
    }
  };
  Downsha.Overlay.prototype.startUp = function(rootElement, rightClick) {
  	LOG.debug("Overlay.startUp");
  	this.rootElement = rootElement;
  	this.rightClick = rightClick;
  	this.initChrome();
  	
  	// ***important step : start queue processor at first***
  	Downsha.queueProcessor.start();
  	
    var styleStrategy = null;
    var options = Downsha.getContext().getOptions(true);
    if (options && options.clipStyle == Downsha.Options.CLIP_STYLE_OPTIONS.FULL) {
      LOG.debug("Overlay.startUp Styling Strategy: FULL");
      styleStrategy = Downsha.ClipFullStylingStrategy;
    } else if (options && options.clipStyle == Downsha.Options.CLIP_STYLE_OPTIONS.TEXT) {
      LOG.debug("Overlay.startUp Styling Strategy: TEXT");
      styleStrategy = Downsha.ClipTextStylingStrategy;
    }
    this.clip = new Downsha.Clip(content, styleStrategy); // content clip initialization
    LOG.debug("Overlay.startUp Instantiated clip: " + this.clip);
    var data = {
    	clip : this.clip
    };
    this.openPopup(data); // open popup dialog after content clip
  };
  Downsha.Overlay.prototype.openPopup = function(obj) {
    var popupPosition = this.getPopupPosition();
    var data = {
      downsha : Downsha, // pass the global object to popup dialog
      data : obj, // pass the clip object
      clipNotifier : this, // set current object as clip event receiver
      sh : null // reserved for search helper object
    };
    LOG.debug("Overlay.openPopup at left: " + popupPosition.left + ", top: " + popupPosition.top);
    this.popupDialog = window.openDialog(
    	"chrome://downsha/content/popup.xul", // url
    	"", // a string name of the window (optional)
    	/*
    	strWindowFeatures specifies a set of features to be used by dialog.
    	If 'chrome' is setted, the page is loaded as window's only content, 
    	without any of the browser's interface elements. 
    	There will be no context menu defined by default and 
    	none of the standard keyboard shortcuts will work. 
    	The page is supposed to provide a user interface of its own, 
    	usually this feature is used to open XUL documents. 
    	*/
    	"chrome,titlebar=no,left=" + popupPosition.left + ",top=" + popupPosition.top + ",resizable=no",
    	data // passed parameters, which can be accessed by window.arguments
    );
  };
  /**
   * Returns position of the popup window { left : left_value, top : top_value }.
   * Position of popup will be under toolbar button.
   * If toolbar button does not exist, than position will be at the right top corner
   */
  Downsha.Overlay.prototype.getPopupPosition = function() {
  	var popupLeft = 0;
  	var popupTop = 0;
  	var anchor = window.document.getElementById("downsha-button");
    if (!anchor || anchor.boxObject.width == 0) {
    	popupLeft = window.screenX + window.innerWidth - this.constructor.DEFAULT_POPUP_WIDTH;
    	popupTop = window.screenY;
    	var navToolbox = window.document.getElementById("navigator-toolbox");
    	if (navToolbox) {
    		popupTop = navToolbox.boxObject.screenY + navToolbox.boxObject.height;
    	}
    } else {
	    popupLeft = anchor.boxObject.screenX + anchor.boxObject.width - this.constructor.DEFAULT_POPUP_WIDTH;
			if (popupLeft < 0) {
				popupLeft = anchor.boxObject.screenX;
			}
	    popupTop = anchor.boxObject.screenY + anchor.boxObject.height;    	
    }
    
    return {
			left : popupLeft,
			top : popupTop
    };
  };  
  Downsha.Overlay.prototype.startClip = function(infoItem) {
  	var self = this;
    var clip = this.clip;
    var guid = Downsha.Utils.generateGuid();
    var contentLength = (clip.content == null) ? 0 : clip.content.length;
    LOG.debug("Clip content length " + (contentLength));
    if (Downsha.Utils.isClipTooBig(clip.length, contentLength)) {
      this.onFailedClip();
      return;
    }
    
    setTimeout(function() { // send after certain milliseconds
			// save to local disk temporarily and add to the process queue
			infoItem.content = clip.content;
			Downsha.clipStorer.saveNote(guid, infoItem);
			Downsha.queueProcessor.addTask(guid, function() {Downsha.clipHandler.send(guid);});
    }, self.constructor.SEND_DELAY_TIME);
  };
  Downsha.Overlay.prototype.onFailedClip = function() { // called by popup.js when clip fullpage/selection/article failed
    var clip = this.clip;
    var guid = Downsha.Utils.generateGuid();
    Downsha.queueProcessor.addTask(guid, function() {
      var contentLength = (clip.content == null) ? 0 : clip.content.length;
      if (Downsha.Utils.isClipTooBig(clip.length, contentLength)) {
				Downsha.Utils.alert(content, Downsha.chrome.i18n.getMessage("BrowserActionTitle"), Downsha.chrome.i18n.getMessage("quickNote_fullPageClipTooBig"));
				Downsha.queueProcessor.onCancel(guid);
      }
    });
  };
  Downsha.Overlay.prototype.onLogout = function() {
  	Downsha.toolbarManager.clearBadge();
    Downsha.context.resetUser();
    Downsha.context.destroy();
  };
})();
