/**
 * @author: chenmin
 * @date: 2011-09-02
 * @desc: manage uploading note queue, set timer(1 second) to periodically check task in queue.
 */

(function() {
	var LOG = null;
  Downsha.getQueueProcessor = function() {
    if (Downsha._queueProcessor == null) {
      Downsha._queueProcessor = new Downsha.QueueProcessor();
    }
    return Downsha._queueProcessor;
  };
  Downsha.__defineGetter__("queueProcessor", Downsha.getQueueProcessor);
  
  Downsha.QueueProcessor = function QueueProcessor () {
  	LOG = Downsha.Logger.getInstance();
  };
  
  Downsha.QueueProcessor.WAIT_BETWEEN_TASK_PROCESSING = 3000; // wait milliseconds between tasks
  
	Downsha.QueueProcessor.prototype.tasks = {};
	Downsha.QueueProcessor.prototype.intervalID = null;
	Downsha.QueueProcessor.prototype.isStarted = false;
  
	Downsha.QueueProcessor.prototype.addTask = function(guid, action) {
		LOG.debug("Adding task to queue processor");
		this.tasks[guid] = {
			guid : guid, // note guid
			action : action, // action is a function to execute
			processed : false // flag to specify whether processed
		};
		LOG.debug("Task successfully added to processor. Number of task in the queue : " + this.getTaskCount());
		LOG.debug("Internal state : " + this.tasks.toSource());
		this.updateProcess();
	};
	Downsha.QueueProcessor.prototype.onStart = function(notes) {
		LOG.debug("Add notes to process " + notes.length);
		for (var i in notes) {
			var guid = notes[i].guid;
			LOG.debug("Add note with guid = " + guid +  " to process");
			this.addTask(guid, this.defaultAction(guid));
		}
		this.start();
	};
	Downsha.QueueProcessor.prototype.defaultAction = function(guid) {
		return function() {
			LOG.debug("Start processing note with guid = " + guid);
			Downsha.clipHandler.send(guid);
		};
	};
	Downsha.QueueProcessor.prototype.start = function() {
		if (this.isStarted) {
			return;
		}
		
		this.isStarted = true;
		var self = this;
		/*
		The setInterval() method will continue calling the function 
		until clearInterval() is called, or the window is closed.
		*/
		this.intervalID = setInterval(function() {
			//Process first non-processed task in the queue
			for (var i in self.tasks) {
				var task = self.tasks[i];
				if (task && !task.processed) {
					task.action();
					task.processed = true;
					LOG.debug("End processing task");
					break;
				}
			}
		}, this.constructor.WAIT_BETWEEN_TASK_PROCESSING);
	};
	Downsha.QueueProcessor.prototype.stop = function() {
		if (this.intervalID != null) {
			clearInterval(this.intervalID);
		}
	};
	Downsha.QueueProcessor.prototype.onSuccess = function(guid) {
		delete this.tasks[guid];
		Downsha.clipStorer.deleteNote(guid);
		this.updateProcess();
	};
	Downsha.QueueProcessor.prototype.onCancel = function(guid) {
		this.onSuccess(guid);
	};
	Downsha.QueueProcessor.prototype.onRetry = function(guid) {
		if (this.tasks[guid]) {
			Downsha.clipStorer.unmarkNoteAsSent(guid);
			this.tasks[guid].processed = false;
		} else {
			this.onCancel(guid);
		}
	};
	Downsha.QueueProcessor.prototype.updateProcess = function() {
		Downsha.toolbarManager.onProcess(this.getTaskCount()); // update unsent count on Toolbar badge
	};
	Downsha.QueueProcessor.prototype.getTaskCount = function() {
		if (Object.keys) {
			return Object.keys(this.tasks).length;
		}
		
		var counter = 0;
		for (var i in this.tasks) {
			counter++;
		}
		return counter;
	};
})();
