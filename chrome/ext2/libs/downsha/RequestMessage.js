/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: request message
 */

Downsha.RequestMessage = function RequestMessage(code, message) {
  this.initialize(code, message);
};
Downsha.RequestMessage.fromObject = function(obj) {
  var msg = new Downsha.RequestMessage();
  if (typeof obj == 'object' && obj != null) {
    if (typeof obj["code"] != 'undefined') {
      msg.code = obj.code;
    }
    if (typeof obj["message"] != 'undefined') {
      msg.message = obj.message;
    }
  }
  return msg;
};
Downsha.RequestMessage.prototype._code = 0;
Downsha.RequestMessage.prototype._message = null;
Downsha.RequestMessage.prototype._callback = null;
Downsha.RequestMessage.prototype.initialize = function(code, message, fn) {
  this.__defineGetter__("code", this.getCode);
  this.__defineSetter__("code", this.setCode);
  this.__defineGetter__("message", this.getMessage);
  this.__defineSetter__("message", this.setMessage);
  this.__defineGetter__("callback", this.getCallback);
  this.__defineSetter__("callback", this.setCallback);
  this.code = code;
  this.message = message;
};
Downsha.RequestMessage.prototype.getCode = function() {
  return this._code;
};
Downsha.RequestMessage.prototype.setCode = function(code) {
  this._code = parseInt(code);
  if (isNaN(this._code)) {
    this._code = 0;
  }
};
Downsha.RequestMessage.prototype.getMessage = function() {
  return this._message;
};
Downsha.RequestMessage.prototype.setMessage = function(message) {
  this._message = message;
};
Downsha.RequestMessage.prototype.getCallback = function() {
  return this._callback;
};
Downsha.RequestMessage.prototype.setCallback = function(fn) {
  if (typeof fn == 'function' || fn == null) {
    this._callback = fn;
  }
};
Downsha.RequestMessage.prototype.send = function() { // use chrome.extension.sendMessage for Chrome 20+
  chrome.extension.sendRequest({ // send object by chrome.extension.sendRequest
    code : this.code,
    message : this.message
  });
};
Downsha.RequestMessage.prototype.isEmpty = function() {
  return (this.code) ? false : true;
};
