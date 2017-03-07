/**
 * @author: chenmin
 * @date: 2011-09-07
 * @desc: notification popup window manager
 */

(function() {
  var LOG = null;
  Downsha.getNotificationManager = function() {
    if (Downsha._notificationManager == null) {
      Downsha._notificationManager = new Downsha.NotificationManager();
    }
    return Downsha._notificationManager;
  };
  Downsha.__defineGetter__("notificationManager", Downsha.getNotificationManager);
  
  Downsha.NotificationManager = function NotificationManager() {
  	LOG = Downsha.Logger.getInstance();
  };
  
	Downsha.NotificationManager.DEFAULT_WAIT_TIMEOUT_BETWEEN_NOTIFICATIONS = 300;
	Downsha.NotificationManager.DEFAULT_WIDTH_FOR_MAC = 150;
	Downsha.NotificationManager.DEFAULT_WIDTH_FOR_OTHER = 300;
	Downsha.NotificationManager.DEFAULT_HEIGHT = 150;
	Downsha.NotificationManager.DEFAULT_MARGIN_BOTTOM = 45;
	Downsha.NotificationManager.DEFAULT_MARGIN_RIGHT = 5;
	
	Downsha.NotificationManager.prototype.isShowing = false;
	Downsha.NotificationManager.prototype.notifications = [];
	Downsha.NotificationManager.prototype.position = { //Prefered position - bottom-right corner
		left : (Downsha.platform.isMacOS()) ? (screen.width - this.constructor.DEFAULT_WIDTH_FOR_MAC) : (screen.width - this.constructor.DEFAULT_WIDTH_FOR_OTHER), 
		top : screen.height - this.constructor.DEFAULT_HEIGHT 
	};
	
	Downsha.NotificationManager.prototype.init = function() {
		var self = this;
		window.addEventListener("unload", function() {
			self.onFirefoxClose();
		}, false);
	};
	
	Downsha.NotificationManager.prototype.notifySucess = function(infoItem, guid) {
		this.showNotification({
			infoItem: infoItem,
			guid: guid,
			isSuccess: true
		});
	};
	
	Downsha.NotificationManager.prototype.notifyFailure = function(infoItem, guid) {
		this.showNotification({
			infoItem: infoItem,
			guid: guid,
			isSuccess: false
		});
	};
	
	Downsha.NotificationManager.prototype.showNotification = function(data) {
		if (this.isShowing) {
			LOG.debug("Notification is showing");
			this.notifications.push(data);
			return;
		}
		this.isShowing = true;
		var position = this.position;
		this.dlg = window.openDialog(
			"chrome://downsha/content/notification.xul", // window url
			"", // window name
			"chrome, popup, left=" + position.left + ", top=" + position.top + ", titlebar=no, resizable=no", // window feature
			Downsha, // window.overlay.arguments[0]
			data, // window.overlay.arguments[1]
			this // window.overlay.arguments[2]
		);
	};
	
	//move notification window then the size of message is changed
	Downsha.NotificationManager.prototype.onNotificationSizeUpdate = function() {
		if (this.dlg) {
			var messageHeight = this.dlg.document.getElementById("popupContent").style.height.replace("px", '');
			var messageWidth = this.dlg.document.getElementById("popupContent").style.width.replace("px", '');
			this.position.top = screen.height - messageHeight - this.constructor.DEFAULT_MARGIN_BOTTOM;
			this.position.left = screen.width - messageWidth - this.constructor.DEFAULT_MARGIN_RIGHT;
			this.dlg.moveTo(this.position.left, this.position.top);
		}
	};
	
	Downsha.NotificationManager.prototype.onClose = function() {
		this.isShowing = false;
		var self = this;
		setTimeout(function() {
			self.showNext();
		}, this.constructor.DEFAULT_WAIT_TIMEOUT_BETWEEN_NOTIFICATIONS);
	};
	
	Downsha.NotificationManager.prototype.showNext = function() {
		LOG.debug("Number of notifications in the queue: " + this.notifications.length);
		if (this.notifications.length > 0) {
			var data = this.notifications.splice(0, 1)[0]; //get the data and remove it from array
			this.showNotification(data);
		}
	};
	
	Downsha.NotificationManager.prototype.onFirefoxClose = function() { // close me if firefox exit
		if (this.dlg) {
			this.dlg.close();
		}
	};
})();
