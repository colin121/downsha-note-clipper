/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: map management of payloads by guid
 */

(function() {
  var LOG = null;
  Downsha.PayloadManager = function PayloadManager() {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("pool", this.getPool);
    this.__defineGetter__("length", this.getLength);
    this.initialize();
  };
  Downsha.PayloadManager.prototype._pool = null;
  Downsha.PayloadManager.prototype._eventHandler = null;
  Downsha.PayloadManager.prototype._length = 0;
  Downsha.PayloadManager.prototype.initialize = function() {
    this._pool = {};
  };
  Downsha.PayloadManager.prototype.getPool = function() {
    return this._pool;
  };
  Downsha.PayloadManager.prototype.getLength = function() {
    return this._length;
  };
  Downsha.PayloadManager.prototype.add = function(payload) {
    if (payload) {
      var guid = Downsha.UUID.generateGuid(); //random guid
      this._pool[guid] = payload;
      this._length++;
      LOG.debug("Added payload under guid: " + guid);
      return guid;
    }
    return undefined;
  };
  Downsha.PayloadManager.prototype.remove = function(payload) {
    var ret = null;
    if (payload) {
      for ( var i in this._pool) {
        if (this._pool[i] == payload) {
          ret = this._pool[i];
          delete this._pool[i];
          this._length--;
        }
      }
    }
    return ret;
  };
  Downsha.PayloadManager.prototype.removeByGuid = function(guid) {
    var ret = null;
    if (typeof this._pool[guid] != 'undefined') {
      ret = this._pool[guid];
      delete this._pool[guid];
      this._length--;
    }
    return ret;
  };
  Downsha.PayloadManager.prototype.get = function(payload) {
    if (payload) {
      for ( var i in this._pool) {
        if (this._pool[i] == payload) {
          return this._pool[i];
        }
      }
    }
    return undefined;
  };
  Downsha.PayloadManager.prototype.getByGuid = function(guid) {
    return this._pool[guid];
  };
})();
