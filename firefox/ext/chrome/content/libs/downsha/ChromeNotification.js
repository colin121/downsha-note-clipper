/**
 * @author: chenmin
 * @date: 2011-09-07
 * @desc: notification xul manager
 */

(function() {
	var LOG = null;
	var notification = null;
	
	$(document).ready(function () {
		LOG = Downsha.Logger.getInstance();
		window.onerror = function(errorMsg, url, lineNumber) {
			LOG.exception("\n" + url + ":" + lineNumber + ": " + errorMsg + "\n");
		}
		waitForOverlayReady();
		LOG.debug("-------- NOTIFICATION STARTING ------------");
	});
	
	function waitForOverlayReady() {
		var waitProc = null;
		var waitInterval = 100; // overlay init check interval
		var waitTimeout = 3000; // maximum time for overlay loading
		var waitStartTime = 0;
		
		waitStartTime = new Date().getTime();
		waitProc = setInterval(function() { // wait until window.overlay is ready
			if (typeof window.overlay != 'undefined') {
				clearInterval(waitProc);
				waitProc = null;
				init(); // now it's ok to call initialization
			} else if (waitStartTime + waitTimeout < (new Date().getTime())) { // timeout is 3 seconds
				LOG.warn("Clearing init timer, cuz we timed out waiting for overlay");
				clearInterval(waitProc);
				waitProc = null;
			}
		}, waitInterval);
	};
	
	function init() {
		notification = new Downsha.ChromeNotification();
		notification.notify();
	};
})();

(function() {
  var LOG = null;
  
	Downsha.ChromeNotification = function () {
		LOG = Downsha.Logger.getInstance();
		this.initialize();
	};
	
	Downsha.ChromeNotification.DEFAULT_CLOSE_TIMEOUT = 6000;
	
	Downsha.ChromeNotification.prototype._successIconElement = null;
	Downsha.ChromeNotification.prototype._errorIconElement = null;
	
	Downsha.ChromeNotification.prototype.initialize = function() {
		LOG.debug("ChromeNotification initializing...");
		this.initViewManager();
		this.initOverlay();
		this.initChrome();
		this.initBindings();
		LOG.debug("ChromeNotification initialized");
	};
	Downsha.ChromeNotification.prototype.initViewManager = function() {
		LOG.debug("ChromeNotification.initViewManager");
    this.viewManager = Downsha.ViewManager.getInstance();
    this.viewManager.globalErrorMessage = new Downsha.ViewManager.SimpleMessage($("#globalErrorMessage"));
    this.viewManager.globalMessage = new Downsha.ViewManager.StackableMessage($("#globalMessage"));
	};
	Downsha.ChromeNotification.prototype.initOverlay = function() {
		LOG.debug("ChromeNotification.initOverlay");
		this.overlay = (typeof window.overlay != 'undefined') ? window.overlay : null;
		var self = this;
		if (window.overlayContentContainer) {
			LOG.debug(">>> Adding callback for view resizing...");
			this.viewManager.containerResizeCallback = function(h) {
				LOG.debug("Updating iframe's height to: " + h);
				var frame = window.overlay.document.getElementById("popupContent");
				if (frame) { // adjust popup height and width after resize
					frame.style.height = (h + 2) + "px";
				}
				window.sizeToContent();
				window.overlay.sizeToContent();
				self.manager.onNotificationSizeUpdate();
			}
		}
	};
	Downsha.ChromeNotification.prototype.initChrome = function() {
		LOG.debug("ChromeNotification.initChrome");
		try {
			Downsha.chrome = this.overlay.arguments[0].chrome;
			this.queueProcessor = this.overlay.arguments[0].QueueProcesor;
			this.infoItem = this.overlay.arguments[1].infoItem; // DownshaInfo object
			this.guid = this.overlay.arguments[1].guid;
			this.isSuccess = this.overlay.arguments[1].isSuccess;
			this.manager = this.overlay.arguments[2]; // NotificationManager object
		} catch(e) {
			LOG.error("Could not intialize chrome: " + e);
		}
	};
	Downsha.ChromeNotification.prototype.initBindings = function() {
		LOG.debug("ChromeNotification.initBindings");
		var self = this;
		$("#close-image").click(function() {
			self.close();
		});
	};	
	Downsha.ChromeNotification.prototype.notify = function() {
		LOG.debug("ChromeNotification.notify");
		$(".title").text(Downsha.chrome.i18n.getMessage("BrowserActionTitle"));
		if (this.infoItem) {
			if (this.isSuccess) {
				this.showClipSuccess(this.infoItem);
			} else {
				this.showClipError(this.infoItem);
			}
		}
	};
	Downsha.ChromeNotification.prototype.showClipSuccess = function(infoItem) {
		LOG.debug("ChromeNotification.showClipSuccess");
		this.clear();
		this.showSuccessIcon();
		var _title = (infoItem && infoItem.title) ? infoItem.title : "";
		this.setHeadline(Downsha.chrome.i18n.getMessage("desktopNotification_clipUploaded", [ _title ]));
		this.setDetails(Downsha.chrome.i18n.getMessage("desktopNotification_clipUploadedMessage"));
		this.viewManager.updateBodyHeight(this.viewManager.getWindowHeight());
		
		var self = this;
		setTimeout(function() {
		  self.close();
		}, this.constructor.DEFAULT_CLOSE_TIMEOUT);
	};
	Downsha.ChromeNotification.prototype.showClipError = function(infoItem) {
		LOG.debug("ChromeNotification.showError");
		this.clear();
		this.showErrorIcon();
		var _title = (infoItem && infoItem.title) ? infoItem.title : "";
		this.setHeadline(Downsha.chrome.i18n.getMessage("desktopNotification_unableToSaveClip", [ _title ]));
		this.setDetails(Downsha.chrome.i18n.getMessage("desktopNotification_unableToSaveClipUnknownMessage"));
		this.viewManager.updateBodyHeight(this.viewManager.getWindowHeight());
	};
	Downsha.ChromeNotification.prototype.clear = function() {
		this.getNotificationHeadline().empty();
		this.getNotificationDetails().empty();
	};
	Downsha.ChromeNotification.prototype.setHeadline = function(str) {
		this.getNotificationHeadline().text(str);
	};
	Downsha.ChromeNotification.prototype.setDetails = function(str) {
		this.getNotificationDetails().text(str);
	};	
	Downsha.ChromeNotification.prototype.showSuccessIcon = function() {
		this.getErrorIcon().hide();
		this.getSuccessIcon().show();
	};
	Downsha.ChromeNotification.prototype.showErrorIcon = function() {
		this.getSuccessIcon().hide();
		this.getErrorIcon().show();
	};
	Downsha.ChromeNotification.prototype.getNotificationHeadline = function() {
		return $("#notificationHeadline");
	};
	Downsha.ChromeNotification.prototype.getNotificationDetails = function() {
		return $("#notificationDetails");
	};
	Downsha.ChromeNotification.prototype.getSuccessIcon = function() {
		return $("#successIcon");
	};
	Downsha.ChromeNotification.prototype.getErrorIcon = function() {
		return $("#errorIcon");
	};
	
	Downsha.ChromeNotification.prototype.close = function() {
		try {
			this.manager.onClose();
		} catch (e) {
			LOG.debug("Failed to send onclose to manager " + e);
		} finally {
			window.close();
		}
	};
})();
