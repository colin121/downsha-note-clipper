/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: Chrome specific logger implementation to be used with Chrome extensions
 */

// WebKit specific logger implementation to be used with WRT's logger
Downsha.WebKitLoggerImpl = function WebKitLoggerImpl(logger) {
  this.initialize(logger);
};
Downsha.inherit(Downsha.WebKitLoggerImpl, Downsha.LoggerImpl, true);
Downsha.WebKitLoggerImpl.isResponsibleFor = function(navigator) {
  return navigator.userAgent.toLowerCase().indexOf("AppleWebKit/") >= 0;
};
Downsha.WebKitLoggerImpl.prototype._enabled = true;

Downsha.WebKitLoggerImpl.prototype.dir = function(obj) {
  console.group(this.logger.scopeName);
  console.dir(obj);
  console.groupEnd();
};
Downsha.WebKitLoggerImpl.prototype.trace = function() {
  console.group(this.logger.scopeName);
  console.trace();
  console.groupEnd();
};
Downsha.WebKitLoggerImpl.prototype.alert = function(str) {
  alert(str);
};
Downsha.WebKitLoggerImpl.prototype.debug = function(str) {
  console.debug(str);
};
Downsha.WebKitLoggerImpl.prototype.info = function(str) {
  console.info(str);
};
Downsha.WebKitLoggerImpl.prototype.warn = function(str) {
  console.warn(str);
};
Downsha.WebKitLoggerImpl.prototype.error = function(str) {
  console.error(str);
};
Downsha.WebKitLoggerImpl.prototype.exception = function(str) {
  console.error(str);
  this.trace();
};

Downsha.ChromeExtensionLoggerImpl = function ChromeExtensionLoggerImpl(logger) {
  this.initialize(logger);
};
Downsha.inherit(Downsha.ChromeExtensionLoggerImpl, Downsha.WebKitLoggerImpl, true);

Downsha.ChromeExtensionLoggerImpl.isResponsibleFor = function(navigator) {
  return (navigator.userAgent.toLowerCase().indexOf("chrome/") >= 0);
};
Downsha.ChromeExtensionLoggerImpl.prototype._enabled = true;
