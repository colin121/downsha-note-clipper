/**
 * @author: chenmin
 * @date: 2011-09-07
 * @desc: Represents object that could send note to Downsha server by it's id.
 * The note should be saved to the disk (note's name = id ) before calling send.
 * ClipHandler also shows clipping wait icon and text while start sending.
 */

(function() {
	var LOG = null;
	Downsha.getClipHandler = function() { // return the singleton of context object
		if (Downsha._clipHandler == null)
			Downsha._clipHandler = new Downsha.ClipHandler();
		return Downsha._clipHandler;
	};
	Downsha.__defineGetter__("clipHandler", Downsha.getClipHandler);
	
	Downsha.ClipHandler = function ClipHandler() {
		LOG = Downsha.Logger.getInstance();
	};
	
	Downsha.ClipHandler.WAIT_CONTAINER_ID = "downshaContentClipperWait";
	Downsha.ClipHandler.WAIT_SHOW_TIME = 1000;
	Downsha.ClipHandler.WAIT_FADE_TIME = 1000;
	
	Downsha.ClipHandler.prototype.waitFlag = false;
	Downsha.ClipHandler.prototype.actionsQueue = [];

	Downsha.ClipHandler.prototype.send = function(guid) {
		var infoItem = Downsha.clipStorer.loadNote(guid);
		if (infoItem) {
			this.wait();
			
	    var self = this;
	    var clipConverter = new Downsha.ClipConverter();
	    var clipSender = new Downsha.ClipSender();
	    clipConverter.startUp(infoItem, 
	    	function() {
	    		clipSender.startUp(infoItem, 
	    			function() {
	    				Downsha.queueProcessor.onSuccess(guid);
	    				self.onWaitClear(self.createSuccessTask(infoItem, guid));
	    			},
	    			function() {
	    				Downsha.queueProcessor.onCancel(guid);
	    				self.onWaitClear(self.createFailureTask(infoItem, guid));
	    			});
	    	},
	    	function() {
	    		Downsha.queueProcessor.onCancel(guid);
	    		self.onWaitClear(self.createFailureTask(infoItem, guid));
	    });
		}
	};
	
	Downsha.ClipHandler.prototype.createFailureTask = function(infoItem, guid) {
		return function() {
			LOG.debug("Submit failure notification for infoItem with guid " + guid);
			Downsha.notificationManager.notifyFailure(infoItem, guid);
		}
	};
	
	Downsha.ClipHandler.prototype.createSuccessTask = function(infoItem, guid) {
		return function() {
			if (Downsha.context.getOptions().clipNotificationEnabled) {
				LOG.debug("Submit success notification for infoItem with guid " + guid);
				Downsha.notificationManager.notifySucess(infoItem, guid);
			}
		}
	};
	
	Downsha.ClipHandler.prototype.getWaitContainer = function() {
		var container = content.document.getElementById(this.constructor.WAIT_CONTAINER_ID);
		if (!container) {
			container = content.document.createElement("downshadiv");
			container.id = this.constructor.WAIT_CONTAINER_ID;
			var wait = content.document.createElement("div");
			wait.id = this.constructor.WAIT_CONTAINER_ID + "Content";
			container.appendChild(wait);
			var center = content.document.createElement("center");
			wait.appendChild(center);
			var spinner = content.document.createElement("img");
			spinner.setAttribute("src", "resource://downsha-images/icon_scissors.png");
			center.appendChild(spinner);
			var text = content.document.createElement("span");
			text.id = this.constructor.WAIT_CONTAINER_ID + "Text";
			center.appendChild(text);
			container._waitMsgBlock = text;
			container.setMessage = function(msg) {
				this._waitMsgBlock.textContent = msg;
			};
		}
		return container;
	};
	
	Downsha.ClipHandler.prototype.wait = function() {
		var wait = this.getWaitContainer();
		wait.style.opacity = "1";
		wait.setMessage(Downsha.chrome.i18n.getMessage("quickNote_clipping"));
		content.document.body.appendChild(wait);
		var self = this;
		setTimeout(function() {
			self.clearWait();
		}, this.constructor.WAIT_SHOW_TIME);
		this.waitFlag = true;
	};
	
	Downsha.ClipHandler.prototype.clearWait = function() {
		var wait = content.document.getElementById(this.constructor.WAIT_CONTAINER_ID);
		
		if (wait) {
			wait.style.opacity = "0";
			setTimeout(function() {
				if (wait.parentNode != null) {
					wait.parentNode.removeChild(wait);
				}
			}, this.constructor.WAIT_FADE_TIME);
		}
		this.waitFlag = false;
		for (var i in this.actionsQueue) {
			this.actionsQueue[i]();
			delete this.actionsQueue[i];
		}
	};
	
	Downsha.ClipHandler.prototype.onWaitClear = function(action) {
		if(this.waitFlag) {
			this.actionsQueue.push(action);
		} else {
			action();
		}
	};
})();
