/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: clip processor inherits from basic clip processor.
 * it calls functions of context.remote object (ChromeExtensionRemote) to upload clip.
 */

(function() {
    var LOG = null;
    Downsha.ClipProcessor = function ClipProcessor(path, size, checkInterval, retryInterval, success, error) {
        LOG = Downsha.Logger.getInstance();
        this.__defineType__("clipProc", XMLHttpRequest);
        this.initialize(path, size, checkInterval, retryInterval, success, error);
    };
    Downsha.inherit(Downsha.ClipProcessor, Downsha.BasicClipProcessor);
    Downsha.ClipProcessor.DEFAULT_LOGIN_INTERVAL = 10 * 60 * 1000; // login interval before clip

    Downsha.ClipProcessorProto = {
        HTTP_GRACE_PERIOD: 60 * 60 * 1000, // http upload retry interval
        HTTP_MAX_ATTEMPTS: 2, // http upload retry max attempts
        MAX_ATTEMPTS: 1, // total upload retry max attempts
        initialize: function(path, size, checkInterval, retryInterval, success, error) {
        	  //LOG.debug("ClipProcessor.initialize");
            Downsha.ClipProcessor.parent.initialize.apply(this, arguments);
            if (typeof retryInterval == 'number') {
                this.HTTP_GRACE_PERIOD = retryInterval; // set retry interval as http upload retry interval also.
                this.processTimeout = retryInterval; // set retry interval as maximum running time for single task also.
            }
        },
        stop: function() {
            LOG.debug("ClipProcessor.stop");
            if (this.clipProc && typeof this.clipProc.abort == 'function') { // abort xhr process
                LOG.debug("Aborting clipProc...");
                this.clipProc.abort();
            }
            Downsha.ClipProcessor.parent.stop.apply(this, []);
        },
        isInitializableFileEntry: function(fileEntry) {
            LOG.debug("ClipProcessor.isInitializableFileEntry");
            if (LOG.isDebugEnabled()) {
                LOG.dir(fileEntry);
            }
            return Downsha.ClipProcessor.parent.isInitializableFileEntry.apply(this, [fileEntry]);
        },
        _testQueue: function() {
            for (var i = 0; i < this.queue.length; i++) {
                var payload = this.queue[i];
                LOG.debug(">>>> Testing clipProcessor queue: " + i);
                LOG.dir(payload);
                var processed = this.isPayloadProcessed(payload);
                LOG.debug(">>> Processed: " + processed);
                var abortable = this.isPayloadAbortable(payload);
                LOG.debug(">>> Abortable: " + abortable);
                var inGrace = this.isPayloadInGrace(payload);
                LOG.debug(">>> In Grace: " + inGrace);
                var retry = this.isPayloadRetriable(payload);
                LOG.debug(">>> Retriable: " + retry);
                var procable = this.isPayloadProcessable(payload);
                LOG.debug(">>> Proccessable: " + procable);
            }
        },
        isPayloadProcessed: function(payload) { // determine whether processed
            LOG.debug("ClipProcessor.isPayloadProcessed");
            var ret = Downsha.ClipProcessor.parent.isPayloadProcessed.apply(this, [payload]);
            if (ret || (payload && payload.processResponse && this._isResponseSuccess(payload))) {
                LOG.debug("Payload is processed");
                return true;
            } else {
                LOG.debug("Payload is not processed");
                return false;
            }
        },
        isPayloadInGrace: function(payload) { // determine whether be rest before next retry.
            LOG.debug("ClipProcessor.isPayloadInGrace");
            if (!payload.processed && payload.lastProcessed > 0) {
                var now = new Date().getTime();
                if ((!payload.processResponse || this._isResponseHTTPRetryError(payload.processResponse)) // http error
                && payload.attempts < this.HTTP_MAX_ATTEMPTS && (now - payload.lastProcessed) < this.HTTP_GRACE_PERIOD) {
                    LOG.debug("Payload is in grace period");
                    return true;
                } else if (payload.processResponse && this._isResponseRetryError(payload.processResponse) // other error
                && payload.attempts < this.MAX_ATTEMPTS && (now - payload.lastProcessed) < this.GRACE_PERIOD) {
                    LOG.debug("Payload is in grace period");
                    return true;
                }
            }
            LOG.debug("Payload is not in grace period");
            return false;
        },
        isPayloadAbortable: function(payload) {
            LOG.debug("ClipProcessor.isPayloadAbortable");
            if (payload && payload.processResponse
            && this._isResponseAbortError(payload.processResponse)) { // server response contains abortable error
                LOG.debug("Payload is abortable because its response contains abortable error");
                return true;
            } else if (payload && payload.processResponse) {
                if (this._isResponseHTTPRetryError(payload.processResponse)) { // http error occurs
                    if (payload.attempts >= this.HTTP_MAX_ATTEMPTS) { // reach http max attempts, so abort it
                        LOG.debug("Payload is abortable because its HTTP response indicates a retriable error, but number of allowed attempts has been exceeded");
                        return true;
                    } else {
                        LOG.debug("Payload is not abortable because its HTTP response indicates a retriable error, but it hasn't exceeded allowed attempts");
                        return false;
                    }
                } else if (this._isResponseRetryError(payload.processResponse)) { // other error occurs
                    if (payload.attempts >= this.MAX_ATTEMPTS) { // reach total max attempts, so abort it
                        LOG.debug("Payload is abortable because its response indicates a retriable error, but number of allowed attempts has been exceeded");
                        return true;
                    } else {
                        LOG.debug("Payload is not abortable because its response indicates a retriable error, but it hasn't exceed allowed attempts");
                        return false;
                    }
                }
            } else if (payload && !payload.processResponse // no http response
            && payload.attempts >= this.HTTP_MAX_ATTEMPTS) { // reach http max attempts, so abort it
                LOG.debug("Payload is abortable because it has no response after max number of attempts");
                return true;
            } else {
                LOG.debug("Payload is not abortable because it doesn't contain a response indicating an abortable error");
                return false;
            }
        },
        isPayloadRetriable: function(payload) { // determine whether can retry right now.
            LOG.debug("ClipProcessor.isPayloadRetriable");
            if (payload && payload.processResponse
            && this._isResponseRetryError(payload.processResponse) // response error occurs
            && !this.isPayloadInGrace(payload)) {
                if (this._isResponseHTTPRetryError(payload.processResponse)) {
                    if (payload.attempts >= this.HTTP_MAX_ATTEMPTS) { // reach http max attempts, not retriable
                        LOG.debug("Payload is not retriable despite its retriable HTTP response because it exceeded allowed attempts");
                        return false;
                    } else {
                        LOG.debug("Payload is retriable because it indicates retriable HTTP error and hasn't exceeded allowed attempts");
                        return true;
                    }
                } else if (this._isResponseRetryError(payload.processResponse)) {
                    if (payload.attempts >= this.MAX_ATTEMPTS) { // reach total max attempts, not retriable
                        LOG.debug("Payload is not retriable despite its retriable response because it exceeded allowed attempts");
                        return false;
                    } else {
                        LOG.debug("Payload is retriable because it contains a response indicating a retriable error and it's no long in grace");
                        return true;
                    }
                }
            } else if (payload && !payload.processed && payload.lastProcessed
            && !payload.processResponse // no http response
            && payload.attempts < this.HTTP_MAX_ATTEMPTS
            && !this.isPayloadInGrace(payload)) {
                LOG.debug("Payload is retriable because it has no processResponse although attempted before, but doesn't exceed max attempts, and it's no longer in grace");
                return true;
            } else {
                LOG.debug("Payload is not retriable because it doesn't contain a response indicating a retriable error or it's still gracing");
                return false;
            }
        },
        isPayloadProcessable: function(payload) {
            LOG.debug("ClipProcessor.isPayloadProcessable");
            if (this.isPayloadProcessed(payload)) { // processed
                LOG.debug("Payload is not processable because it was already processed successfully");
                return false;
            } else if (payload.processResponse) { // has response
                if (this.isPayloadAbortable(payload)) { // abortable
                    LOG.debug("Payload is not processable and to be aborted");
                    return false;
                } else if (this.isPayloadRetriable(payload)) { // retriable
                    LOG.debug("Payload is processable because it needs to be retried");
                    return true;
                }
            }
            var ret = Downsha.ClipProcessor.parent.isPayloadProcessable.apply(this, [payload]);
            if (ret) {
                LOG.debug("Payload is processable");
            } else {
                LOG.debug("Payload is not processable");
            }
            return ret;
        },
        _isResponseSuccess: function(response) {
            LOG.debug("ClipProcessor._isResponseSuccess");
            if (typeof response == 'object' && response
            && this._isResponseHTTPSuccess(response)
            && typeof response.response == 'object' && response.response) {
                var dstpResponse = Downsha.DSTPResponse.fromObject(response.response);
                if (dstpResponse.isSuccess()) {
                    LOG.debug("Response indicates successful result");
                    return true;
                }
            }
            LOG.debug("Response is not successful");
            return false;
        },
        _isResponseAbortError: function(response) {
            LOG.debug("ClipProcessor._isResponseAbortError");
            if (this._isResponseHTTPAbortError(response)) {
                LOG.debug("Response indicates an abortable error due to HTTP transport");
                return true;
            } else if (this._isResponseSuccess(response)) {
                LOG.debug("Response does not indicate abortable error because it's a successful response with a result");
                return false;
            } else if (this._isResponseRetryError(response)) {
                LOG.debug("Response does not indicate abortable error because it contains retriable errors");
                return false;
            }
            LOG.debug("Response indicates abortable error");
            return true;
        },
        _isResponseRetryError: function(response) {
            LOG.debug("ClipProcessor._isResponseRetryError");
            if (this._isResponseHTTPRetryError(response)) {
                LOG.debug("Response indicates a retriable error due to HTTP transport");
                return true;
            }
            LOG.debug("Response does not indicate a retriable error");
            return false;
        },
        _isResponseHTTPSuccess: function(response) {
            LOG.debug("ClipProcessor._isResponseHTTPSuccess");
            if (typeof response == 'object' && response && response.xhr
            && response.xhr.readyState == 4 && response.xhr.status != 0
            && response.textStatus == "success") {
                LOG.debug("Response is a successful HTTP response");
                return true;
            }
            LOG.debug("Response is not a successful HTTP response");
            return false;
        },
        _isResponseHTTPAbortError: function(response) {
            LOG.debug("ClipProcessor._isResponseHTTPAbortError");
            if (this._isResponseHTTPSuccess(response)
            || this._isResponseHTTPRetryError(response)) {
                LOG.debug("Response does not indicate an abortable HTTP error");
                return false;
            }
            LOG.debug("Response indicates an abortable HTTP error");
            return true;
        },
        _isResponseHTTPRetryError: function(response) {
            LOG.debug("ClipProcessor._isResponseHTTPRetryError");
            if (typeof response == 'object' && response && response.xhr
            && (response.xhr.readyState != 4 || // ready state is not complete
            (response.xhr.status == 0 || // cross-domain request denied
            response.xhr.status == 503 ||  // Service unavailable
            response.xhr.status == 504))) { // Gateway timeout
                if (response.xhr.readyState == 4) {
                    LOG.debug("Response indicates a retriable HTTP error: " + response.xhr.status);
                } else {
                    LOG.debug("Response indicates a retriable HTTP error due to readyState: " + response.xhr.readyState);
                }
                return true;
            }
            LOG.debug("Response does not indicate a retriable HTTP error");
            return false;
        },
        _onprocesserror: function(payload, processor, data) { // process error
            LOG.debug("ClipProcessor._onprocesserror");
            Downsha.ClipProcessor.parent._onprocesserror.apply(this, [payload, processor, data]);
            if (this.isPayloadProcessable(payload) || this.isPayloadInGrace(payload)) {
                LOG.debug("Payload is processable or in grace period, so let's keep it...");
            } else {
                LOG.debug("Payload is not processable, let's get rid of it...");
                if (LOG.isDebugEnabled()) {
                    LOG.dir(payload);
                }
                this.removePayload(payload);
            }
            // at this point, we should have the failed payload back in the queue if
            // it's going to be reprocessed, so, if it's not - there's going to be
            // nothing to proceses, might as well stop the damn processing...
            if (this.queue.length == 0) {
                LOG.debug("Stopping ClipProcessor because the queue is empty");
                this.stop();
            }
        },
        _onprocess: function(payload, processor, data) { // process ok
            LOG.debug("ClipProcessor._onprocess");
            Downsha.ClipProcessor.parent._onprocess.apply(this, arguments);
            if (this.isEmpty()) {
                LOG.debug("Stopping ClipProcessor because the queue is empty");
                this.stop();
            }
        },
        _onprocesstimeout: function() { // process timeout
            LOG.debug("ClipProcessor._onprocesstimeout");
            if (this.clipProc && typeof this.clipProc.abort == 'function') { // abort xhr send()
                this.clipProc.abort();
            }
            Downsha.ClipProcessor.parent._onprocesstimeout.apply(this, []);
        },
        add: function(item) {
            LOG.debug("ClipProcessor.add");
            Downsha.ClipProcessor.parent.add.apply(this, arguments);
            if (!this.isStarted()) {
                LOG.debug("Starting queue processor because it was stopped and we added an item to the queue");
                this.start(true);
            }
        },
        remove: function(item, dontRemoveFile) {
            LOG.debug("ClipProcessor.remove");
            if (this.currentItem && this.currentItem.data == item) {
                if (this.clipProc && typeof this.clipProc.abort == 'function') {
                    LOG.debug("Aborting current clip process because its data was asked to be removed");
                    this.clipProc.abort(); // abort uploading
                }
            }
            Downsha.ClipProcessor.parent.remove.apply(this, [item, dontRemoveFile]);
        },
        removePayload: function(payload, dontRemoveFile) {
            LOG.debug("ClipProcessor.removePayload");
            if (this.currentItem && this.currentItem == payload) {
                if (this.clipProc && typeof this.clipProc.abort == 'function') {
                    LOG.debug("Aborting current clip process because its payload was asked to be removed");
                    this.clipProc.abort();
                }
            }
            Downsha.ClipProcessor.parent.removePayload.apply(this, [payload, dontRemoveFile]);
        },
        removeAll: function(dontRemoveFiles) {
            LOG.debug("ClipProcessor.removeAll");
            if (this.clipProc && typeof this.clipProc.abort == 'function') {
                LOG.debug("Aborting current clip process because its payload was asked to be removed");
                this.clipProc.abort();
            }
            Downsha.ClipProcessor.parent.removeAll.apply(this, [dontRemoveFiles]);
        },
        onreadystatechange: function() {
            LOG.debug("ClipProcessor.onreadystatechange");
            if (this.clipProc && this.clipProc.readyState) {
                LOG.debug(">>>> READYSTATE: " + this.clipProc.readyState);
            }
            /**
             * readyState == 2(Loaded), the send( ) method has completed, 
             * entire response received (not parsed).
             * the status and headers are not yet available.
             */
            if (this.clipProc && this.clipProc.readyState == 2) {
                if (this.currentItem) {
                } else {
                    LOG.warn("Cannot find currentItem... not doing anything about readystatechange");
                }
            }
        }, 
        processor: function(infoItem, successCallback, errorCallback) {
            LOG.debug("ClipProcessor.processor");
            if (!(infoItem instanceof Downsha.DownshaInfo)) {
                LOG.debug("Tried to process unexpected object, ignoring...");
                return;
            }
            /*
            var notebook = (infoItem.notebookGuid) ? 
            	Downsha.context.getNotebookByGuid(infoItem.notebookGuid) : null;
            if (!notebook) {
                infoItem.notebookGuid = null;
            }
            */
                        
            // TEST: call success directly and avoid uploading process
            // return successCallback(null);
            
            var self = this;
            this.clipProc = Downsha.context.remote.clip(infoItem, 
            function(response, textStatus, xhr) { // xhr response ok
                LOG.debug("ClipProcessor successfully clipped a note");
                var respData = {
                    response: response,
                    textStatus: textStatus,
                    xhr: xhr
                };
                if (xhr.readyState == 4 && xhr.status != 0 && textStatus == "success"
                && response.isResult() && typeof successCallback == 'function') {
                    LOG.debug("Executing success callback");
                    successCallback(respData);
                } else if (typeof errorCallback == 'function') {
                    LOG.debug("Executing error callback");
                    errorCallback(respData);
                }
            },
            function(xhr, textStatus, err) { // xhr response error
                if (xhr.readyState == 4) {
                    LOG.error("ClipProcessor encountered an error while clipping note "
                    + " [readyState: " + xhr.readyState + "; status: " + xhr.status
                    + "]");
                } else {
                    LOG.error("ClipProcessor encountered an error while clipping note "
                    + " [readyState: " + xhr.readyState + "]");
                }
                if (typeof errorCallback == 'function') {
                    errorCallback({
                        xhr: xhr,
                        textStatus: textStatus,
                        error: err
                    });
                }
            },
            true);
            this.clipProc.onreadystatechange = function() { // xhr onreadystatechange event
                LOG.debug("clipProc readyStateChange: " + self.clipProc.readyState);
                self.onreadystatechange();
            };
        },
        isLoginRequired: function() { // login required if exceed certain time (e.g. 5 minutes)
            var sessTime = Downsha.context.sessTime;
            if (sessTime && (Date.now() - sessTime) < this.constructor.DEFAULT_LOGIN_INTERVAL) {
                return false;
            }
            return true;
        },
        process: function(force) {
            LOG.debug("ClipProcessor.process");
            LOG.debug(this.toString());
            // TEST: start up processing without getting login session
            //Downsha.ClipProcessor.parent.process.apply(this, [force]); // parent process
            
            var self = this;
            if (this.isStarted() && !this.isActive() && this.hasNext() && 
            	!Downsha.chromeExtension.offline && Downsha.context.userKnown && this.isLoginRequired()) {
                LOG.debug("Need to login first");
                Downsha.context.remote.persistentLogin(
                	function(response, status, xhr) { // persistent login ok
                    if (response && response.isSuccess()) {
                        LOG.debug("Successfully obtained session before processing queue.");
                    } else {
                        LOG.error("Got soft error in response to login before processing queue; gonna attempt to process the queue anyway...");
                        LOG.dir(response.errors);
                    }
                    self.process(force, true);
                	},
                	function(xhr, status, error) { // sync state error
                    LOG.debug("Failed to obtain syncState before processing queue. Not gonna even try to upload anything...");
                	},
                	true);
            } else {
                Downsha.ClipProcessor.parent.process.apply(this, [force]); // parent process
            }
        },
        _adoptNonPersistentProto: function() { // switch to non-persistent mode
            Downsha.ClipProcessor.parent._adoptNonPersistentProto.apply(this, []);
            Downsha.inherit(Downsha.ClipProcessor, Downsha.BasicClipProcessor); // inherit again
            Downsha.extendObject(Downsha.ClipProcessor.prototype, Downsha.ClipProcessorProto);
        },
    }
    Downsha.extendObject(Downsha.ClipProcessor.prototype, Downsha.ClipProcessorProto);
})();
