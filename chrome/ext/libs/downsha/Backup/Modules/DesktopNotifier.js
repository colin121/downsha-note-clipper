/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: desktop notifier via chrome api
 */

Downsha.DesktopNotifier = function(url, delay, timeout, options) {
  this.__defineSetter__("url", this.setUrl);
  this.__defineGetter__("url", this.getUrl);
  this.__definePositiveInteger__("delay", null);
  this.__definePositiveInteger__("timeout", null);
  this.__defineType__("options", Object, null);
  this.initialize(url, delay, timeout, options);
};

Downsha.mixin(Downsha.DesktopNotifier, Downsha.DefiningMixin);

Downsha.DesktopNotifier.prototype._url = null;
Downsha.DesktopNotifier.prototype.count = null;
Downsha.DesktopNotifier.prototype.timer = null;

Downsha.DesktopNotifier.prototype.initialize = function(url, delay, timeout, options) {
  this.url = url;
  this.delay = delay;
  this.timeout = timeout;
  this.options = options;
};
Downsha.DesktopNotifier.prototype.setUrl = function(url) {
  this._url = url;
};
Downsha.DesktopNotifier.prototype.getUrl = function() {
  return this._url;
};
Downsha.DesktopNotifier.prototype.clearTimer = function() {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  this.timer = null;
};
Downsha.DesktopNotifier.prototype.notify = function(immediately) {
  var self = this;
  this.count++;
  if (typeof this.delay == 'number' && !immediately) { //show it later (after certain time)
    this.clearTimer();
    this.timer = setTimeout(function() {
      self._notify();
      self.count = 0;
    }, this.delay);
  } else {
    this._notify();
  }
};
Downsha.DesktopNotifier.prototype._notify = function() {
  Downsha.Utils.notifyDesktopWithHTML(this.url, this.timeout, this.options);
};
