/**
 * @author: chenmin
 * @date: 2011-10-16
 * @desc: IE specific logger implementation
 * Be careful when using console for debugging in IE 8/9.
 * If you leave a call to the console object in your code when you move to production 
 * and you do not have the developer tools displayed,  
 * you will get an error message telling you console is undefined. 
 * To avoid the error message, you need to add a check 'typeof'
 * to make sure console exists before calling any methods. 
 */
(function() {
	Downsha.IEExtensionLoggerImpl = function IEExtensionLoggerImpl(logger) {
	  this.initialize(logger);
	};
	Downsha.inherit(Downsha.IEExtensionLoggerImpl, Downsha.LoggerImpl, true);
	Downsha.IEExtensionLoggerImpl.isResponsibleFor = function(navigator) {
	  return navigator.userAgent.toUpperCase().indexOf("MSIE") >= 0;
	};
	Downsha.IEExtensionLoggerImpl.prototype.enabled = false; // TODO 2012-07-03 set true if debugging
	
	Downsha.IEExtensionLoggerImpl.prototype.dir = function(obj) {
	  if (typeof console != "undefined" && typeof console.dir != "undefined") {
	  	console.dir(obj);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.trace = function() {
	  if (typeof console != "undefined" && typeof console.trace != "undefined") {
	  	console.trace();
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.alert = function(str) {
	  alert(str);
	};
	Downsha.IEExtensionLoggerImpl.prototype.debug = function(str) {
	  if (typeof console != "undefined" && typeof console.log != "undefined") {
	  	console.log(str);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.info = function(str) {
	  if (typeof console != "undefined" && typeof console.info != "undefined") {
	  	console.info(str);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.warn = function(str) {
	  if (typeof console != "undefined" && typeof console.warn != "undefined") {
	  	console.warn(str);
	  }
	};
	Downsha.IEExtensionLoggerImpl.prototype.error = function(str) {
	  if (typeof console != "undefined" && typeof console.error != "undefined") {
	  	console.error(str);
	  }
	  //this.alert(str);
	};
	Downsha.IEExtensionLoggerImpl.prototype.exception = function(str) {
	  this.error(str);
	};
})();
