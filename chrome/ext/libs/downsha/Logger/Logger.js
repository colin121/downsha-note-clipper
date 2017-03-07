/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: generic definition of logger, implementors derive from LoggerImpl.
 * the caller should use LoggerImplFactory to get specific implementations.
 */

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
  this.__defineGetter__("enabled", this.isEnabled);
  this.__defineSetter__("enabled", this.setEnabled);
  this.scope = scope || arguments.callee.caller; // get scope object from caller
  this.level = level;
  if (typeof logImplementor != 'undefined' && logImplementor instanceof Downsha.LoggerImpl) {
    this.impl = logImplementor;
  } else {
    var _impl = Downsha.LoggerImplFactory.getImplementationFor(navigator);
    if (_impl instanceof Array) { // array of implementors
      this.impl = new Downsha.LoggerChainImpl(this, _impl);
    } else {
      this.impl = new _impl(this);
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
Downsha.Logger.setInstance = function(logger) {
  this._instance = logger;
};
Downsha.Logger.destroyInstance = function(scope) {
  scope = scope || arguments.callee.caller;
  var scopeName = (typeof scope == 'function') ? scope.name : scope.constructor.name;
  delete this._instances[scopeName];
};
Downsha.Logger.setGlobalLevel = function(level) {
  var lev = parseInt(level);
  if (isNaN(lev)) {
    return;
  }
  Downsha.Logger.GLOBAL_LEVEL = lev;
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(lev);
    }
  }
};
Downsha.Logger.setLevel = function(level) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(level);
    }
  }
};
Downsha.Logger.enableImplementor = function(clazz) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].enableImplementor(clazz);
    }
  }
  if (clazz) {
    clazz.protoEnabled = true;
  }
};
Downsha.Logger.disableImplementor = function(clazz) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].disableImplementor(clazz);
    }
  }
  if (clazz) {
    clazz.protoEnabled = false;
  }
};

Downsha.Logger.prototype._level = 0;
Downsha.Logger.prototype._scope = null;
Downsha.Logger.prototype._usePrefix = true;
Downsha.Logger.prototype._useTimestamp = true;
Downsha.Logger.prototype._enabled = true;

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

Downsha.Logger.prototype.isEnabled = function() {
  return this._enabled;
};
Downsha.Logger.prototype.setEnabled = function(bool) {
  this._enabled = (bool) ? true : false;
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
  this.__defineGetter__("logger", this.getLogger);
  this.__defineSetter__("logger", this.setLogger);
  this.__defineGetter__("enabled", this.isEnabled);
  this.__defineSetter__("enabled", this.setEnabled);
  this.__defineGetter__("protoEnabled", this.isProtoEnabled);
  this.__defineSetter__("protoEnabled", this.setProtoEnabled);
  this.initialize(logger);
};
Downsha.LoggerImpl.ClassRegistry = new Array();
Downsha.LoggerImpl.isResponsibleFor = function(navigator) {
  return false;
};

Downsha.LoggerImpl.prototype.handleInheritance = function(child, parent) {
  Downsha.LoggerImpl.ClassRegistry.push(child);
};

Downsha.LoggerImpl.prototype._logger = null;
Downsha.LoggerImpl.prototype._enabled = false;

Downsha.LoggerImpl.prototype.initialize = function(logger) {
  this.logger = logger;
};
Downsha.LoggerImpl.prototype.answerImplementorInstance = function(clazz) {
  if (this.constructor == clazz) {
    return this;
  }
};
Downsha.LoggerImpl.prototype.isEnabled = function() {
  return this._enabled;
};
Downsha.LoggerImpl.prototype.setEnabled = function(bool) {
  this._enabled = (bool) ? true : false;
};
Downsha.LoggerImpl.prototype.isProtoEnabled = function() {
  return this.constructor.prototype._enabled;
};
Downsha.LoggerImpl.prototype.setProtoEnabled = function(bool) {
  this.constructor.prototype._enabled = (bool) ? true : false;
};
Downsha.LoggerImpl.prototype.getLogger = function() {
  return this._logger;
};
Downsha.LoggerImpl.prototype.setLogger = function(logger) {
  if (logger instanceof Downsha.Logger) {
    this._logger = logger;
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

Downsha.LoggerChainImpl.prototype._impls = null;
Downsha.LoggerChainImpl.prototype._enabled = true;

Downsha.LoggerChainImpl.prototype.initialize = function(logger, impls) {
  Downsha.LoggerChainImpl.parent.initialize.apply(this, [ logger ]);
  var _impls = [].concat(impls);
  this._impls = [];
  for ( var i = 0; i < _impls.length; i++) {
    var _i = _impls[i];
    this._impls.push(new _i(logger));
  }
};
Downsha.LoggerChainImpl.prototype.answerImplementorInstance = function(clazz) {
  for ( var i = 0; i < this._impls.length; i++) {
    var ii = this._impls[i].answerImplementorInstance(clazz);
    if (ii) {
      return ii;
    }
  }
};
Downsha.LoggerChainImpl.prototype.dir = function(obj) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].dir(obj);
    }
  }
};
Downsha.LoggerChainImpl.prototype.trace = function() {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].trace(obj);
    }
  }
};
Downsha.LoggerChainImpl.prototype.debug = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].debug(str);
    }
  }
};
Downsha.LoggerChainImpl.prototype.info = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].info(str);
    }
  }
};
Downsha.LoggerChainImpl.prototype.warn = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].warn(str);
    }
  }
};
Downsha.LoggerChainImpl.prototype.error = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].error(str);
    }
  }
};
Downsha.LoggerChainImpl.prototype.exception = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].exception(str);
    }
  }
};
Downsha.LoggerChainImpl.prototype.alert = function(str) {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].alert(str);
    }
  }
};
Downsha.LoggerChainImpl.prototype.clear = function() {
  for ( var i = 0; i < this._impls.length; i++) {
    if (this._impls[i].enabled) {
      this._impls[i].clear();
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
