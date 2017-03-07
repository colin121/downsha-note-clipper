/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: manage uploading clip page queue, set timer to periodically check task in queue.
 */

(function() {
  var LOG = null;

  Downsha.QueueProcessorStatus = {
    STOPPED : 0, // process stopped
    STARTED : 1  // process started
  };

  Downsha.QueueProcessor = function QueueProcessor(checkInterval, retryInterval) {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("active", this.isActive);
    this.__defineGetter__("length", this.getLength);
    this.__defineType__("queue", "Array"); // task queue
    this.__definePositiveInteger__("sema", 0);
    this.__definePositiveInteger__("status", 0);
    this.__definePositiveInteger__("checkInterval", 0);
    this.__definePositiveInteger__("retryInterval", 0);
    this.__definePositiveInteger__("lastSuccess", 0);
    this.__definePositiveInteger__("lastError", 0);
    this.__definePositiveInteger__("processTimeout", 0);
    this.initialize(checkInterval, retryInterval);
  };
  Downsha.mixin(Downsha.QueueProcessor, Downsha.DefiningMixin);

  Downsha.QueueProcessor.prototype._proc = null;

  Downsha.QueueProcessor.prototype.initialize = function(checkInterval, retryInterval) {
  	//LOG.debug("QueueProcessor.initialize");
    this.checkInterval = checkInterval; // periodic check interval
    this.retryInterval = retryInterval; // waiting time for reprocess
    this.queue = [];
  };

  Downsha.QueueProcessor.prototype.getLength = function() {
    if (this.currentItem && this.queue.indexOf(this.currentItem) >= 0) {
      LOG.warn("Something went wrong and currentItem ended up back in the queue while still being currentItem");
    }
    var delta = (this.currentItem) ? 1 : 0;
    return this.queue.length + delta;
  };
  Downsha.QueueProcessor.prototype.isEmpty = function() {
    return this.length == 0;
  };
  Downsha.QueueProcessor.prototype.start = function(noprocess) {
    LOG.debug("Downsha.QueueProcessor.start");
    var self = this;
    if (typeof this.processor != 'function') {
      throw new Error("No processor defined");
    }
    if (this.isStopped()) {
      this.status = Downsha.QueueProcessorStatus.STARTED;
      if (this.checkInterval > 0) {
        this._proc = setInterval(function() { // start timer to run periodic checking
          LOG.debug("Periodic check for processing");
          self.process(); //*** run process()
        }, this.checkInterval);
      }
      if (!this.isActive() && !noprocess) { // if no process is running(inactive), then run process now
        this.process();
      }
    } else if (this.isStarted() && !noprocess) { // already started, run process now
      LOG.debug("Attempt was made to start QueueProcessor, but it's already started. Starting up the processor...");
      this.process();
    } else {
      LOG.error("Attempt was made to start QueueProcessor, but it's status is unknown: " + this.status + ". Ignoring...");
    }
  };
  Downsha.QueueProcessor.prototype.stop = function() {
    LOG.debug("Downsha.QueueProcessor.stop");
    if (this._proc) {
      clearInterval(this._proc);
      this.sema = 0;
    }
    this.status = Downsha.QueueProcessorStatus.STOPPED;
  };
  Downsha.QueueProcessor.prototype.isStopped = function() {
    return this.status == Downsha.QueueProcessorStatus.STOPPED;
  };
  Downsha.QueueProcessor.prototype.isStarted = function() {
    return this.status == Downsha.QueueProcessorStatus.STARTED;
  };
  Downsha.QueueProcessor.prototype.isActive = function() {
    return this.sema > 0;
  };
  Downsha.QueueProcessor.prototype.createPayload = function(item) {
    return new Downsha.ProcessorPayload(item);
  };
  Downsha.QueueProcessor.prototype.add = function(item) {
    this.queue.push(this.createPayload(item));
  };
  Downsha.QueueProcessor.prototype.addAll = function(items) {
    for ( var i = 0; i < items.length; i++) {
      this._add(items[i], true);
    }
  };
  Downsha.QueueProcessor.prototype.remove = function(item) {
    var removed = undefined;
    for ( var i = 0; i < this.queue.length; i++) {
      if (this.queue[i].data == item) {
        removed = this.queue.splice(i, 1).shift();
        break;
      }
    }
    if (!removed && this.currentItem && this.currentItem.data == item) { // if item is not in the queue, then check currentItem
      removed = this.currentItem;
      this.currentItem = null; // reset currentItem if needed
    }
    if (LOG.isDebugEnabled()) {
      LOG.debug("Removed item");
      LOG.dir(removed);
    }
    return removed;
  };
  Downsha.QueueProcessor.prototype.removePayload = function(payload) {
    var i = this.queue.indexOf(payload);
    var removed = undefined;
    if (i >= 0) {
      removed = this.queue.splice(i, 1).shift();
    } else if (this.currentItem && this.currentItem == payload) {
      removed = this.currentItem;
      this.currentItem = null;
    }
    if (LOG.isDebugEnabled()) {
      LOG.debug("Removed payload");
      LOG.dir(removed);
    }
    return removed;
  };
  Downsha.QueueProcessor.prototype.removeAll = function() {
    this.queue = [];
    this.currentItem = null;
  };
  Downsha.QueueProcessor.prototype.isPayloadProcessed = function(payload) {
    return (payload.processed) ? true : false;
  };
  Downsha.QueueProcessor.prototype.isPayloadInGrace = function(payload) {
    var now = new Date().getTime();
    if (!payload.processed && payload.lastProcessed > 0 // whether payload is ready for reprocess
        && (now - payload.lastProcessed) < this.retryInterval) {
      return true;
    }
    return false;
  };
  Downsha.QueueProcessor.prototype.isPayloadProcessable = function(payload) {
    if (this.isPayloadProcessed(payload) || this.isPayloadInGrace(payload)) { // processed or not ready for process
      return false;
    }
    return true;
  };
  Downsha.QueueProcessor.prototype.indexOfNext = function() {
    LOG.debug("QueueProcessor.indexOfNext");
    var now = new Date().getTime();
    for ( var i = 0; i < this.queue.length; i++) {
      var payload = this.queue[i];
      if (this.isPayloadProcessable(payload)) {
        return i;
      }
    }
    return -1;
  };
  Downsha.QueueProcessor.prototype.hasNext = function() {
    LOG.debug("QueueProcessor.hasNext");
    return (this.indexOfNext() >= 0) ? true : false;
  };
  Downsha.QueueProcessor.prototype.next = function() { // pop next processable item
    LOG.debug("Downsha.QueueProcessor.next");
    var i = this.indexOfNext();
    if (i >= 0) {
      return this.queue.splice(i, 1).shift();
    }
    return undefined;
  };
  Downsha.QueueProcessor.prototype.peek = function() { // peek next processable item
    LOG.debug("Downsha.QueueProcessor.peek");
    var i = this.indexOfNext();
    if (i >= 0) {
      return this.queue[i];
    }
  };
  Downsha.QueueProcessor.prototype.wait = function() {
    LOG.debug("Downsha.QueueProcessor.wait");
    this.sema++;
    LOG.debug("SEMA = " + this.sema);
  };
  Downsha.QueueProcessor.prototype.signal = function() {
    LOG.debug("Downsha.QueueProcessor.signal");
    this.sema--;
    LOG.debug("SEMA = " + this.sema);
    if (this.isStarted()) {
      LOG.debug("Starting up process() cuz there's no one waiting and we're started");
      this.process();
    } else {
      LOG.debug("Not starting up process() because it hasn't been started yet...");
    }
  };
  Downsha.QueueProcessor.prototype._onprocess = function(item, processor, data) { // callback for process ok
    LOG.debug("QueueProcessor._onprocess");
    item.processed = true;
    item.lastProcessed = new Date().getTime();
    if (typeof this.onprocess == 'function') {
      try {
        this.onprocess(item, processor, data); // defined by upper caller (ChromeExtension object)
      } catch (e) {
        LOG.exception("Exception handling onprocess: " + e);
      }
    }
    this.currentItem = null;
    this.lastSuccess = new Date().getTime();
    LOG.debug("Queue size: " + this.queue.length);
  };
  Downsha.QueueProcessor.prototype._onprocesserror = function(item, processor, data) { // callback for process error
    LOG.debug("QueueProcessor._onprocesserror");
    item.processed = false;
    item.lastProcessed = new Date().getTime();
    this.lastError = new Date().getTime();
    if (typeof this.onprocesserror == 'function') {
      try {
        this.onprocesserror(item, processor, data); // defined by upper caller (ChromeExtension object)
      } catch (e) {
        LOG.exception("Exception handling onprocesserror: " + e);
      }
    }
    this.currentItem = null;
    this.queue.push(item); // put item back to the task queue
    LOG.debug("Queue size: " + this.queue.length);
  };
  Downsha.QueueProcessor.prototype._onprocesstimeout = function() { // callback for process timeout
    LOG.debug("QueueProcessor._onprocesstimeout");
    if (typeof this.onprocesstimeout == 'function') {
      try {
        this.onprocesstimeout(); // not defined by upper caller (ChromeExtension object)
      } catch (e) {
        LOG.exception("Exception handling onprocesstimeout: " + e);
      }
    }
    if (this.currentItem) {
      this.currentItem.processed = false;
      this.currentItem.lastProcessed = new Date().getTime();
      this.currentItem.lastError = new Date().getTime();
      this.queue.push(this.currentItem); // put current item back to the task queue
      this.currentItem = null;
      this.signal();
    }
  };
  Downsha.QueueProcessor.prototype.process = function(force) { //*** process pump, called in every certain time (normally 30 seconds)
    LOG.debug("QueueProcessor.process");
    if (this.isStarted() && !this.isActive()) { // process started and no task running (inactive)
      var self = this;
      if (force) {
        this.refresh();
      }
      if (this.hasNext()) {
        this.wait(); // currently only increase counter, not real wait
        var item = this.currentItem = this.next();
        LOG.debug("About to process next item:");
        if (LOG.isDebugEnabled()) {
          LOG.dir(item);
        }
        item.attempts++;
        this.processor(
        	item.data,  // item data
        	function(data) { //*** success callback, data includes response, textStatus and xhr object
        		LOG.debug("Successfully processed item");
        		self._onprocess(item, self, data);
        		self.signal();
        	},
        	function(data) { //*** error callback, data includes error, textStatus and xhr object
        		LOG.debug("Error processing item");
        		self._onprocesserror(item, self, data);
        		self.signal();
        	}
        );
      } else {
        LOG.debug("Nothing to process...");
      }
    } else if (!this.isStarted()) { // process not started
      LOG.warn("QueueProcessor hasn't been started");
    } else if (this.isActive()) { // task running (active)
      if (this.processTimeout > 0 && this.currentItem // check whether current item is running timeout
          && ((Date.now() - this.currentItem.created) > this.processTimeout)) {
        LOG.debug("Payload is taking too long, let's timeout");
        this._onprocesstimeout(); //*** timeout callback
      } else {
        LOG.warn("Attempt was made to process QueueProcessor, but it's already active. Ignoring attempt");
      }
    }
  };
  Downsha.QueueProcessor.prototype.refresh = function() {
    LOG.debug("QueueProcessor.refresh");
    for ( var i = 0; i < this.queue.length; i++) {
      var payload = this.queue[i];
      if (payload) {
        payload.refresh();
      }
    }
  };
  Downsha.QueueProcessor.prototype.toString = function() {
    var stat = "UNKNOWN";
    if (this.status == Downsha.QueueProcessorStatus.STARTED) {
      stat = "STARTED";
    } else if (this.status == Downsha.QueueProcessorStatus.STOPPED) {
      stat = "STOPPED";
    }
    var active = (this.isActive()) ? "ACTIVE" : "INACTIVE";
    return this.constructor.name + " " + stat + " " + active + " ("
        + this.queue.length + " items; " + ((this.currentItem) ? "1" : "0")
        + " pending) [int: " + this.checkInterval + "; grace: " + this.retryInterval
        + "; lastSuccess: " + this.lastSuccess + "; lastError: "
        + this.lastError + "]";
  };

  Downsha.ProcessorPayload = function ProcessorPayload(obj) {
    this.initialize(obj);
  };
  Downsha.ProcessorPayload.fromObject = function(obj) {
    if (obj instanceof Downsha.ProcessorPayload) {
      return obj;
    } else {
      var newObj = new Downsha.ProcessorPayload();
      if (typeof obj == 'object' && obj) {
        for ( var i in obj) {
          if (typeof obj[i] != 'function'
              && typeof newObj.__proto__[i] != 'undefined') {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    }
  };
  Downsha.ProcessorPayload.prototype.data = null; // payload data
  Downsha.ProcessorPayload.prototype.created = 0; // create timestamp
  Downsha.ProcessorPayload.prototype.lastProcessed = 0; // last processed timestamp
  Downsha.ProcessorPayload.prototype.processed = false; // processed flag
  Downsha.ProcessorPayload.prototype.attempts = 0; // attempt processing count
  Downsha.ProcessorPayload.prototype.initialize = function(obj) {
    this.data = obj;
    this.created = new Date().getTime();
  };
  Downsha.ProcessorPayload.prototype.refresh = function() {
    this.lastProcessed = 0;
    this.processed = false;
  };
  Downsha.ProcessorPayload.prototype.toJSON = function() {
    return {
      data : this.data,
      processed : this.processed,
      created : this.created,
      lastProcessed : this.lastProcessed,
      attempts : this.attempts
    };
  };
  Downsha.ProcessorPayload.prototype.toLOG = function() {
    return {
      "created" : this.created,
      "processed" : this.processed,
      "lastProcessed" : this.lastProcessed,
      "attempts" : this.attempts,
      "data" : (typeof this.data == 'object' && this.data && typeof this.data.toLOG == 'function') ? this.data.toLOG() : this.data
    };
  };
})();
