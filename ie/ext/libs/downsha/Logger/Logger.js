/**
 * @author: chenmin
 * @date: 2011-10-16
 * @desc: generic definition of logger, implementors derive from LoggerImpl.
 * the caller should use LoggerImplFactory to get specific implementations.
 */
(function() {
	Downsha.Logger = function Logger(logImplementor) {
	  if (typeof logImplementor != 'undefined'
	      && logImplementor instanceof Downsha.LoggerImpl) {
	    this.impl = logImplementor;
	  } else {
	    var impl = Downsha.LoggerImplFactory.getImplementationFor(navigator);
	    if (impl instanceof Array) { // array of implementors
	      this.impl = new Downsha.LoggerChainImpl(this, impl);
	    } else {
	      this.impl = new impl(this);
	    }
	  }
	};
	
	// Downsha.Logger levels.
	Downsha.Logger.LOG_LEVEL_DEBUG = 0;
	Downsha.Logger.LOG_LEVEL_INFO = 1;
	Downsha.Logger.LOG_LEVEL_WARN = 2;
	Downsha.Logger.LOG_LEVEL_ERROR = 3;
	Downsha.Logger.LOG_LEVEL_EXCEPTION = 4;
	Downsha.Logger.LOG_LEVEL_OFF = 5;
	
	Downsha.Logger.DEBUG_PREFIX = "[DEBUG] ";
	Downsha.Logger.INFO_PREFIX = "[INFO] ";
	Downsha.Logger.WARN_PREFIX = "[WARN] ";
	Downsha.Logger.ERROR_PREFIX = "[ERROR] ";
	Downsha.Logger.EXCEPTION_PREFIX = "[EXCEPTION] ";
	
	Downsha.Logger.instance = null; // logger single instance
	Downsha.Logger.getInstance = function() {
	  if (!this.instance) {
	    this.instance = new Downsha.Logger();
	  }
	  return this.instance;
	};
	Downsha.Logger.setInstance = function(logger) {
	  this.instance = logger;
	};
	Downsha.Logger.destroyInstance = function() {
	  if (this.instance) {
	  	delete this.instance;
	  }
	  this.instance = null;
	};
	
	Downsha.Logger.setLevel = function(level) {
	  if (this.instance) {
	  	this.instance.setLevel(level);
	  }
	};
	Downsha.Logger.enableImplementor = function(clazz) {
	  if (this.instance) {
	  	this.instance.enableImplementor(clazz);
	  }
	  if (clazz) {
	    clazz.protoEnabled = true;
	  }
	};
	Downsha.Logger.disableImplementor = function(clazz) {
	  if (this.instance) {
	  	this.instance.disableImplementor(clazz);
	  }
	  if (clazz) {
	    clazz.protoEnabled = false;
	  }
	};
	
	Downsha.Logger.prototype.level = 0;
	Downsha.Logger.prototype.usePrefix = true;
	Downsha.Logger.prototype.useTimestamp = true;
	Downsha.Logger.prototype.enabled = true;
	
	Downsha.Logger.prototype.getImplementor = function(clazz) {
	  if (clazz) {
	    return this.impl.answerImplementorInstance(clazz);
	  } else {
	    return this.impl;
	  }
	};
	Downsha.Logger.prototype.enableImplementor = function(clazz) {
	  if (clazz) {
	    var i = this.getImplementor(clazz);
	    if (i) {
	      i.enabled = true;
	    }
	  } else {
	    this.impl.enabled = true;
	  }
	};
	Downsha.Logger.prototype.disableImplementor = function(clazz) {
	  if (clazz) {
	    var i = this.getImplementor(clazz);
	    if (i) {
	      i.enabled = false;
	    }
	  } else {
	    this.impl.enabled = false;
	  }
	};
	
	Downsha.Logger.prototype.setLevel = function(level) {
	  this.level = parseInt(level);
	  if (isNaN(this.level)) {
	    this.level = Downsha.Logger.LOG_LEVEL_DEBUG;
	  }
	};
	
	Downsha.Logger.prototype.getLevel = function() {
	  return this.level;
	};
	
	Downsha.Logger.prototype.padNumber = function(num, len) {
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
	  // Prefix format: TimeStamp [Level]
	  var str = "";
	  if (this.useTimestamp) { // timestamp prefix
	    var today = new Date();
	    var year =  today.getFullYear();
	    var month = this.padNumber((today.getMonth() + 1), 2);
	    var day = this.padNumber(today.getDate(), 2);
	    var hour = this.padNumber(today.getHours(), 2);
	    var minute = this.padNumber(today.getMinutes(), 2);
	    var second = this.padNumber(today.getSeconds(), 2);
	    var millisecond = this.padNumber(today.getMilliseconds(), 3);
	    str += year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second
	        + "." + millisecond + " ";
	  }
	  if (this.usePrefix) { // log level prefix
	    str += pfx;
	  }
	  return str;
	};
	
	Downsha.Logger.prototype.isUsePrefix = function() {
	  return this.usePrefix;
	};
	Downsha.Logger.prototype.setUsePrefix = function(bool) {
	  this.usePrefix = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isUseTimestamp = function() {
	  return this.useTimestamp;
	};
	Downsha.Logger.prototype.setUseTimestamp = function(bool) {
	  this.useTimestamp = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isEnabled = function() {
	  return this.enabled;
	};
	Downsha.Logger.prototype.setEnabled = function(bool) {
	  this.enabled = (bool) ? true : false;
	};
	
	Downsha.Logger.prototype.isDebugEnabled = function() {
	  return (this.enabled && this.level <= Downsha.Logger.LOG_LEVEL_DEBUG);
	};
	
	// Dumps an objects properties and methods to the console.
	Downsha.Logger.prototype.dump = function(obj) {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.dir(obj);
	  }
	};
	
	// Same as dump
	Downsha.Logger.prototype.dir = function(obj) {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.dir(obj);
	  }
	};
	
	// Dumps a stacktrace to the console.
	Downsha.Logger.prototype.trace = function() {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.trace();
	  }
	};
	
	Downsha.Logger.prototype.alert = function(str) {
	  if (this.enabled && this.impl.enabled) {
	    this.impl.alert(str);
	  }
	};
	
	// Prints a debug message to the console.
	Downsha.Logger.prototype.debug = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_DEBUG) {
	    this.impl.debug(this.getPrefix(this.constructor.DEBUG_PREFIX) + str);
	  }
	};
	
	// Prints an info message to the console.
	Downsha.Logger.prototype.info = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_INFO) {
	    this.impl.info(this.getPrefix(this.constructor.INFO_PREFIX) + str);
	  }
	};
	
	// Prints a warning message to the console.
	Downsha.Logger.prototype.warn = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_WARN) {
	    this.impl.warn(this.getPrefix(this.constructor.WARN_PREFIX) + str);
	  }
	};
	
	// Prints an error message to the console.
	Downsha.Logger.prototype.error = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_ERROR) {
	    this.impl.error(this.getPrefix(this.constructor.ERROR_PREFIX) + str);
	  }
	};
	
	Downsha.Logger.prototype.exception = function(str) {
	  if (this.enabled && this.impl.enabled
	      && this.level <= Downsha.Logger.LOG_LEVEL_EXCEPTION) {
	    this.impl.exception(this.getPrefix(this.constructor.EXCEPTION_PREFIX) + str);
	  }
	};
	
	Downsha.Logger.prototype.clear = function() {
	  this.impl.clear();
	};
	
	Downsha.LoggerImpl = function LoggerImpl(logger) {
	  this.initialize(logger);
	};
	Downsha.LoggerImpl.ClassRegistry = new Array();
	Downsha.LoggerImpl.isResponsibleFor = function(navigator) {
	  return false;
	};
	Downsha.LoggerImpl.prototype.handleInheritance = function(child, parent) {
	  Downsha.LoggerImpl.ClassRegistry.push(child);
	};
	
	Downsha.LoggerImpl.prototype.logger = null;
	Downsha.LoggerImpl.prototype.enabled = false;
	
	Downsha.LoggerImpl.prototype.initialize = function(logger) {
	  this.logger = logger;
	};
	Downsha.LoggerImpl.prototype.answerImplementorInstance = function(clazz) {
	  if (this.constructor == clazz) {
	    return this;
	  }
	};
	Downsha.LoggerImpl.prototype.isEnabled = function() {
	  return this.enabled;
	};
	Downsha.LoggerImpl.prototype.setEnabled = function(bool) {
	  this.enabled = (bool) ? true : false;
	};
	Downsha.LoggerImpl.prototype.isProtoEnabled = function() {
	  return this.constructor.prototype.enabled;
	};
	Downsha.LoggerImpl.prototype.setProtoEnabled = function(bool) {
	  this.constructor.prototype.enabled = (bool) ? true : false;
	};
	Downsha.LoggerImpl.prototype.getLogger = function() {
	  return this.logger;
	};
	Downsha.LoggerImpl.prototype.setLogger = function(logger) {
	  if (logger instanceof Downsha.Logger) {
	    this.logger = logger;
	  }
	};
	Downsha.LoggerImpl.prototype.dir = function(obj) {
	};
	Downsha.LoggerImpl.prototype.trace = function() {
	};
	Downsha.LoggerImpl.prototype.debug = function(str) {
	};
	Downsha.LoggerImpl.prototype.info = function(str) {
	};
	Downsha.LoggerImpl.prototype.warn = function(str) {
	};
	Downsha.LoggerImpl.prototype.error = function(str) {
	};
	Downsha.LoggerImpl.prototype.exception = function(str) {
	};
	Downsha.LoggerImpl.prototype.alert = function(str) {
	};
	Downsha.LoggerImpl.prototype.clear = function() {
	};
	
	Downsha.LoggerChainImpl = function LoggerChainImpl(logger, impls) {
	  this.initialize(logger, impls);
	};
	Downsha.inherit(Downsha.LoggerChainImpl, Downsha.LoggerImpl, true);
	
	Downsha.LoggerChainImpl.prototype.impls = null;
	Downsha.LoggerChainImpl.prototype.enabled = true;
	
	Downsha.LoggerChainImpl.prototype.initialize = function(logger, impls) {
	  Downsha.LoggerChainImpl.parent.initialize.apply(this, [logger]);
	  var impls = [].concat(impls);
	  this.impls = [];
	  for ( var i = 0; i < impls.length; i++) {
	    var impl = impls[i];
	    this.impls.push(new impl(logger));
	  }
	};
	Downsha.LoggerChainImpl.prototype.answerImplementorInstance = function(clazz) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    var ii = this.impls[i].answerImplementorInstance(clazz);
	    if (ii) {
	      return ii;
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.dir = function(obj) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].dir(obj);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.trace = function() {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].trace(obj);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.debug = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].debug(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.info = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].info(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.warn = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].warn(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.error = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].error(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.exception = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].exception(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.alert = function(str) {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].alert(str);
	    }
	  }
	};
	Downsha.LoggerChainImpl.prototype.clear = function() {
	  for ( var i = 0; i < this.impls.length; i++) {
	    if (this.impls[i].enabled) {
	      this.impls[i].clear();
	    }
	  }
	};
	
	Downsha.LoggerImplFactory = {
	  getImplementationFor : function(navigator) {
	    var reg = Downsha.LoggerImpl.ClassRegistry;
	    var impls = [];
	    for ( var i = 0; i < reg.length; i++) {
	      if (typeof reg[i] == 'function'
	          && typeof reg[i].isResponsibleFor == 'function'
	          && reg[i].isResponsibleFor(navigator)) {
	        impls.push(reg[i]);
	      }
	    }
	    if (impls.length == 0) {
	      return Downsha.LoggerImpl;
	    } else if (impls.length == 1) {
	      return impls[0];
	    }
	    return impls;
	  }
	};
})();
