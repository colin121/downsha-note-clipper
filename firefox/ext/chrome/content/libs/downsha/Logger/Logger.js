/**
 * @author: chenmin
 * @date: 2011-08-29
 * @desc: generic definition of logger, implementors derive from LoggerImpl.
 *       the caller should use LoggerImplFactory to get specific implementations.
 */
(function() {
	Downsha.Logger = function Logger(scope, level, logImplementor) {
	  this.__defineGetter__("level", this.getLevel);
	  this.__defineSetter__("level", this.setLevel);
	  this.__defineGetter__("scope", this.getScope);
	  this.__defineSetter__("scope", this.setScope);
	  this.__defineGetter__("scopeName", this.getScopeName);
	  this.__defineGetter__("scopeNameAsPrefix", this.getScopeNameAsPrefix);
	  this.__defineGetter__("useTimestamp", this.isUseTimestamp);
	  this.__defineSetter__("useTimestamp", this.setUseTimestamp);
	  this.__defineGetter__("usePrefix", this.isUsePrefix);
	  this.__defineSetter__("usePrefix", this.setUsePrefix);
	  this.scope = scope || arguments.callee.caller; // get scope object from caller
	  this.level = level;
	  if (typeof logImplementor != 'undefined' && logImplementor instanceof Downsha.LoggerImpl) {
	    this.impl = logImplementor;
	  } else {
	    this.impl = Downsha.LoggerImplFactory.getImplementationFor(navigator);
	  }
	  this.enabled = this.impl.enabled;
	};
	
	// Downsha.Logger levels.
	Downsha.Logger.LOG_LEVEL_DEBUG = 0;
	Downsha.Logger.LOG_LEVEL_INFO = 1;
	Downsha.Logger.LOG_LEVEL_WARN = 2;
	Downsha.Logger.LOG_LEVEL_ERROR = 3;
	Downsha.Logger.LOG_LEVEL_EXCEPTION = 4;
	Downsha.Logger.LOG_LEVEL_OFF = 5;
	Downsha.Logger.GLOBAL_LEVEL = Downsha.Logger.LOG_LEVEL_ERROR; // TODO Should be switched to ERROR before release
	
	Downsha.Logger.DEBUG_PREFIX = "[DEBUG] ";
	Downsha.Logger.INFO_PREFIX = "[INFO] ";
	Downsha.Logger.WARN_PREFIX = "[WARN] ";
	Downsha.Logger.ERROR_PREFIX = "[ERROR] ";
	Downsha.Logger.EXCEPTION_PREFIX = "[EXCEPTION] ";
	
	Downsha.Logger._instances = {}; // logger instances for each scope object
	
	Downsha.Logger.getInstance = function(scope) {
	  scope = scope || arguments.callee.caller;
	  var scopeName = (typeof scope == 'function') ? scope.name : scope.constructor.name;
	  if (typeof this._instances[scopeName] == 'undefined') {
	    this._instances[scopeName] = new Downsha.Logger(scope);
	  }
	  return this._instances[scopeName];
	};
	Downsha.Logger.destroyInstance = function(scope) {
	  scope = scope || arguments.callee.caller;
	  var scopeName = (typeof scope == 'function') ? scope.name : scope.constructor.name;
	  delete this._instances[scopeName];
	};
	
	Downsha.Logger.prototype._level = null;
	Downsha.Logger.prototype._scope = null;
	Downsha.Logger.prototype._usePrefix = true;
	Downsha.Logger.prototype._useTimestamp = true;
	
	Downsha.Logger.prototype.setLevel = function(level) {
	  this._level = parseInt(level);
	  if (isNaN(this._level)) {
	    this._level = Downsha.Logger.GLOBAL_LEVEL;
	  }
	};
	
	Downsha.Logger.prototype.getLevel = function() {
	  return this._level;
	};
	
	Downsha.Logger.prototype.setScope = function(fnOrObj) {
	  if (typeof fnOrObj == 'function') {
	    this._scope = fnOrObj;
	  } else if (typeof fnOrObj == 'object' && fnOrObj != null) {
	    this._scope = fnOrObj.constructor;
	  }
	};
	
	Downsha.Logger.prototype.getScope = function() {
	  return this._scope;
	};
	
	Downsha.Logger.prototype.getScopeName = function() {
	  if (this.scope) {
	    return this.scope.name;
	  } else {
	    return "";
	  }
	};
	
	Downsha.Logger.prototype.getScopeNameAsPrefix = function() {
	  var scopeName = this.scopeName;
	  return (scopeName) ? "[" + scopeName + "] " : "";
	};
	
	Downsha.Logger.prototype._padNumber = function(num, len) {
	  var padStr = "0";
	  num = parseInt(num);
	  if (isNaN(num)) {
	    num = 0;
	  }
	  var isPositive = (num >= 0) ? true : false;
	  var numStr = "" + Math.abs(num);
	  while (numStr.length < len) {
	    numStr = padStr + numStr;
	  }
	  if (!isPositive) {
	    numStr = "-" + numStr;
	  }
	  return numStr;
	};
	
	Downsha.Logger.prototype.getPrefix = function(pfx) {
	  // Prefix format: TimeStamp [Level] [ScopeName]
	  var str = "";
	  if (this.useTimestamp) { // timestamp prefix
	    var today = new Date();
	    var year =  today.getFullYear();
	    var month = this._padNumber((today.getMonth() + 1), 2);
	    var day = this._padNumber(today.getDate(), 2);
	    var hour = this._padNumber(today.getHours(), 2);
	    var minute = this._padNumber(today.getMinutes(), 2);
	    var second = this._padNumber(today.getSeconds(), 2);
	    var millisecond = this._padNumber(today.getMilliseconds(), 3);
	    str += year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second
	        + "." + millisecond + " ";
	  }
	  if (this.usePrefix) { // log level prefix
	    str += pfx;
	  }
	  str += this.scopeNameAsPrefix; // scope name prefix
	  return str;
	};
	
	Downsha.Logger.prototype.isUsePrefix = function() {
	  return this._usePrefix;
	};
	Downsha.Logger.prototype.setUsePrefix = function(bool) {
	  this._usePrefix = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isUseTimestamp = function() {
	  return this._useTimestamp;
	};
	Downsha.Logger.prototype.setUseTimestamp = function(bool) {
	  this._useTimestamp = (bool) ? true : false;
	};
	
	// Disable logging on other browsers except Firefox.
	Downsha.Logger.prototype.isEnabled = function() {
	  return this.impl.enabled;
	}
	
	// Dumps an objects properties and methods to the console.
	Downsha.Logger.prototype.dir = function(obj) {
	  if (this.enabled) {
	    this.impl.dir(obj);
	  }
	}
	
	// Dumps a stracktrace to the console.
	Downsha.Logger.prototype.trace = function() {
	  if (this.enabled) {
	    this.impl.trace();
	  }
	}
	
	// Prints a debug message to the console.
	Downsha.Logger.prototype.debug = function(str) {
	  if (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_DEBUG) {
	    this.impl.debug(this.getPrefix(this.constructor.DEBUG_PREFIX) + str);
	  }
	}
	
	// Prints an info message to the console.
	Downsha.Logger.prototype.info = function(str) {
	  if (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_INFO) {
	    this.impl.info(this.getPrefix(this.constructor.INFO_PREFIX) + str);
	  }
	}
	
	// Prints a warning message to the console.
	Downsha.Logger.prototype.warn = function(str) {
	  if (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_WARN) {
	    this.impl.warn(this.getPrefix(this.constructor.WARN_PREFIX) + str);
	  }
	}
	
	// Prints an error message to the console.
	Downsha.Logger.prototype.error = function(str) {
	  if (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_ERROR) {
	    this.impl.error(this.getPrefix(this.constructor.ERROR_PREFIX) + str);
	  }
	}
	
	Downsha.Logger.prototype.exception = function(str) {
	  if (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_EXCEPTION) {
	    this.impl.exception(this.getPrefix(this.constructor.EXCEPTION_PREFIX) + str);
	  }
	}
	
	Downsha.Logger.prototype.alert = function(str) {
	  if (this.enabled) {
	    this.impl.alert(str);
	  }
	}
	
	Downsha.Logger.prototype.clear = function() {
	  this.impl.clear();
	}
	
	Downsha.Logger.prototype.enableAlerts = function(level) {
	  if (!level)
	    level = this.level;
	  this.impl.enableAlerts(level);
	}
	
	Downsha.Logger.prototype.disableAlerts = function() {
	  this.impl.disableAlerts();
	}
	
	Downsha.Logger.prototype.isDebugEnabled = function() {
	  return (this.level == Downsha.Logger.LOG_LEVEL_DEBUG);
	}
	
	/**
	 * Abstract for variuos logger implementations
	 */
	Downsha.LoggerImpl = function LoggerImpl() {
	}
	
	Downsha.LoggerImpl.prototype.enabled = false;
	Downsha.LoggerImpl.prototype.dir = function(obj) {
	}
	Downsha.LoggerImpl.prototype.trace = function() {
	}
	Downsha.LoggerImpl.prototype.debug = function(str) {
	}
	Downsha.LoggerImpl.prototype.info = function(str) {
	}
	Downsha.LoggerImpl.prototype.warn = function(str) {
	}
	Downsha.LoggerImpl.prototype.error = function(str) {
	}
	Downsha.LoggerImpl.prototype.exception = function(str) {
	}
	Downsha.LoggerImpl.prototype.alert = function(str) {
	}
	Downsha.LoggerImpl.prototype.enableAlerts = function(level) {
	}
	Downsha.LoggerImpl.prototype.disableAlerts = function() {
	}
	Downsha.LoggerImpl.prototype.clear = function() {
	}
	
	Downsha.LoggerImplFactory = {
	  getImplementationFor : function(navigator) {
			if (typeof navigator == "object" && navigator != null && navigator.userAgent.match(/Firefox/i)) {
				return new Downsha.FirefoxExtensionLoggerImpl();
			} else if (typeof navigator == "object" && navigator != null && navigator.userAgent.match(/(Safari)|(WebKit)/i)) {
				return new Downsha.WebKitLoggerImpl();
			} else {
				return new Downsha.LoggerImpl();
			}
	  }
	};
})();
