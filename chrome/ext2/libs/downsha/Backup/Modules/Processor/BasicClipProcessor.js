/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: basic clip processor
 * 1. serialize and unserialize clip note.
 * 2. switch to non-persistent mode if FSA init error.
 * 3. update browser icon badge when process state changed.
 */

(function() {
    var LOG = null;
    Downsha.BasicClipProcessor = function BasicClipProcessor(
    	path, size, checkInterval, retryInterval, success, error) {
        LOG = Downsha.Logger.getInstance();
        this.initialize(path, size, checkInterval, retryInterval, success, error);
    };
    Downsha.inherit(Downsha.BasicClipProcessor, Downsha.PersistentQueueProcessor);

    Downsha.BasicClipProcessorProto = {
        initialize: function(path, size, checkInterval, retryInterval, success, error) {
            //LOG.debug("BasicClipProcessor.initialize");
            var self = this;
            var successCallback = function() { // callback for successfully initialized
                LOG.debug("BasicClipProcessor successfully initialized");
                if (typeof success == 'function') {
                    LOG.debug("Applying custom success handler");
                    success.apply(this, arguments);
                }
                self._updateBadge();
            };
            var errorCallback = function(err) { // callback for initialized error
                var msg = null;
                try {
                    msg = Downsha.Utils.errorDescription(err);
                } catch(e) {
                    msg = err;
                }
                LOG.error("Error initializing BasicClipProcessor: " + msg);
                if (err instanceof FileError) {
                    LOG.warn("Utilizing non-persistent queue processor due to FileError during initialization with persistent queue processor");
                    self._becomeNonPersistent(); // switch to non-persistent mode
                }
                if (typeof error == 'function') {
                    error.apply(this, arguments);
                }
            };
            Downsha.BasicClipProcessor.parent.initialize.apply(this, [path, size,
            checkInterval, retryInterval, successCallback, errorCallback]); // parent initialization
        },
        _becomeNonPersistent: function() { // switch to non-persistent mode
            this._adoptNonPersistentProto();
            this._reinitProto();
        },
        _adoptNonPersistentProto: function() {
            /** Important! inherit from QueueProcessor directly to avoid persistent */
            Downsha.inherit(Downsha.BasicClipProcessor, Downsha.QueueProcessor);
            /** re-add BasicClipProcessorProto as member of this prototype */
            Downsha.extendObject(Downsha.BasicClipProcessor.prototype, Downsha.BasicClipProcessorProto);
        },
        _reinitProto: function() {
            this.__proto__ = new this.constructor;
        },
        add: function(item) {
            LOG.debug("BasicClipProcessor.add");
            if (item && item.constructor.name != 'FileEntry' // item is not a file entry
            && !(item instanceof Downsha.DownshaInfo)) { // item is not a DownshaInfo object
                item = new Downsha.DownshaInfo(item); // try to create one
            }
            Downsha.BasicClipProcessor.parent.add.apply(this, [item]);
            this._updateBadge();
        },
        _onprocess: function(item, processor, data) { // process success
            LOG.debug("BasicClipProcessor._onprocess");
            item.processResponse = data;
            Downsha.BasicClipProcessor.parent._onprocess.apply(this, arguments);
            this._updateBadge();
        },
        _onprocesserror: function(item, processor, data) { // process error
            LOG.debug("BasicClipProcessor._onprocesserror");
            item.processResponse = data;
            Downsha.BasicClipProcessor.parent._onprocesserror.apply(this, arguments);
            this._updateBadge();
        },
        _onreaderror: function(item, error) {
            LOG.debug("BasicClipProcessor._onreaderror");
            Downsha.BasicClipProcessor.parent._onreaderror.apply(this, arguments);
            this._updateBadge();
        },
        _updateBadge: function() { // update badge number of browser icon
            LOG.debug("BasicClipProcessor._updateBadge");
            LOG.debug("Updating badge as a result of BasicClipProcessor ("
            + this.queue.length + " queued clips)");
            Downsha.Utils.updateBadge(Downsha.context);
        }
    };
    Downsha.extendObject(Downsha.BasicClipProcessor.prototype, Downsha.BasicClipProcessorProto);
})();
