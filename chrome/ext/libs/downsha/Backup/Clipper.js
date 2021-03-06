/*
 * Downsha
 * core.js - Core definition and name space of the Downsha client side framework.
 * 
 * Created by Pavel Skaldin on 2/24/11
 * Copyright 2011 Downsha Corp. All rights reserved.
 */

/**
 * Base name-space
 */
var Downsha = Downsha || {};

/**
 * Class-like inheritance.
 */
Downsha.inherit = function(childClass, parentClassOrObject, includeConstructorDefs) {
    if (typeof parentClassOrObject.constructor == 'function') {
        // Normal Inheritance
        childClass.prototype = new parentClassOrObject;
        childClass.prototype.constructor = childClass;
        childClass.parent = parentClassOrObject.prototype;
        // childClass.prototype.constructor.parent = parentClassOrObject;
    } else {
        // Pure Virtual Inheritance
        childClass.prototype = parentClassOrObject;
        childClass.prototype.constructor = childClass;
        childClass.parent = parentClassOrObject;
        // childClass.constructor.parent = parentClassOrObject;
    }
    if (includeConstructorDefs) {
        for (var i in parentClassOrObject.prototype.constructor) {
            if (i != "parent"
            && i != "prototype"
            && i != "javaClass"
            && parentClassOrObject.constructor[i] != parentClassOrObject.prototype.constructor[i]) {
                childClass.prototype.constructor[i] = parentClassOrObject.prototype.constructor[i];
            }
        }
    }
    if (typeof childClass.prototype.handleInheritance == 'function') {
        childClass.prototype.handleInheritance.apply(childClass, [childClass,
        parentClassOrObject, includeConstructorDefs]);
    }
    // return childClass;
};

/**
 * Tests whether childClass inherits from parentClass in a class-like manner
 * (see Downsha.inherit())
 */
Downsha.inherits = function(childClass, parentClass) {
    var cur = childClass;
    while (cur && typeof cur.parent != 'undefined') {
        if (cur.parent.constructor == parentClass) {
            return true;
        } else {
            cur = cur.parent.constructor;
        }
    }
    return false;
    // return (typeof childClass.parent != 'undefined' &&
    // childClass.parent.constructor == parentClass);
};

Downsha.mixin = function(classOrObject, mixin, map) {
    var target = (typeof classOrObject == 'function') ? classOrObject.prototype
    : classOrObject;
    for (var i in mixin.prototype) {
        var from = to = i;
        if (typeof map == 'object' && map && typeof map[i] != 'undefined') {
            to = map[i];
        }
        target[to] = mixin.prototype[from];
    }
};

Downsha.extendObject = function(obj, extObj, deep) {
    if (typeof extObj == 'object' && extObj != null) {
        for (var i in extObj) {
            if (deep && typeof extObj[i] == 'object' && extObj[i] != null
            && typeof obj[i] == 'object' && obj[i] != null) {
                Downsha.extendObject(obj[i], extObj[i], deep);
            } else {
                try {
                    obj[i] = extObj[i];
                } catch(e){
                    // do nothing... there could have been a getter/setter lookup issue, which dont' care about
                }
            }
        }
    }
};

Downsha.hasOwnProperty = function(obj, propName) {
    if (typeof obj == 'object') {
        if (obj.hasOwnProperty(propName)) {
            return true;
        }
        var proto = null;
        var o = obj;
        while (proto = o.__proto__) {
            if (proto.hasOwnProperty(propName)) {
                return true;
            } else {
                o = proto;
            }
        }
    }
    return false;
};

/*
 * Downsha.Logger
 * Downsha
 * 
 * Created by Pavel Skaldin on 8/4/09
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
/**
 * Generic Downsha.Logger. Uses various specific implementations. See
 * Downsha.LoggerImpl for details on implementing specific implementations. Use
 * Downsha.LoggerImplFactory to get specific implementations...
 * 
 * @param level
 * @param logImplementor
 * @return
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
  this.scope = scope || arguments.callee.caller;
  this.level = level;
  if (typeof logImplementor != 'undefined'
      && logImplementor instanceof Downsha.LoggerImpl) {
    this.impl = logImplementor;
  } else {
    var _impl = Downsha.LoggerImplFactory.getImplementationFor(navigator);
    if (_impl instanceof Array) {
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
Downsha.Logger.GLOBAL_LEVEL = Downsha.Logger.LOG_LEVEL_ERROR;

Downsha.Logger.DEBUG_PREFIX = "[DEBUG] ";
Downsha.Logger.INFO_PREFIX = "[INFO] ";
Downsha.Logger.WARN_PREFIX = "[WARN] ";
Downsha.Logger.ERROR_PREFIX = "[ERROR] ";
Downsha.Logger.EXCEPTION_PREFIX = "[EXCEPTION] ";

Downsha.Logger._instances = {};

Downsha.Logger.getInstance = function(scope) {
  scope = scope || arguments.callee.caller;
  var scopeName = (typeof scope == 'function') ? scope.name
      : scope.constructor.name;
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
  var scopeName = (typeof scope == 'function') ? scope.name
      : scope.constructor.name;
  delete this._instances[scopeName];
  // Downsha.Logger._instance = null;
};
Downsha.Logger.setGlobalLevel = function(level) {
  var l = parseInt(level);
  if (isNaN(l)) {
    return;
  }
  Downsha.Logger.GLOBAL_LEVEL = l;
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(l);
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
  var str = "";
  if (this.useTimestamp) {
    var d = new Date();
    var mo = this._padNumber((d.getMonth() + 1), 2);
    var dd = this._padNumber(d.getDate(), 2);
    var h = this._padNumber(d.getHours(), 2);
    var m = this._padNumber(d.getMinutes(), 2);
    var s = this._padNumber(d.getSeconds(), 2);
    var tz = this._padNumber((0 - (d.getTimezoneOffset() / 60) * 100), 4);
    str += mo + "/" + dd + "/" + d.getFullYear() + " " + h + ":" + m + ":" + s
        + "." + d.getMilliseconds() + " " + tz + " ";
  }
  if (this.usePrefix) {
    str += pfx;
  }
  str += this.scopeNameAsPrefix;
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

// Dumps a stracktrace to the console.
Downsha.Logger.prototype.trace = function() {
  if (this.enabled && this.impl.enabled) {
    this.impl.trace();
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
    this.impl
        .exception(this.getPrefix(this.constructor.EXCEPTION_PREFIX) + str);
  }
};

Downsha.Logger.prototype.alert = function(str) {
  if (this.enabled && this.impl.enabled) {
    this.impl.alert(str);
  }
};

Downsha.Logger.prototype.clear = function() {
  this.impl.clear();
};

/**
 * Abstract for variuos logger implementations
 * 
 * @author pasha
 */
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

/**
 * Simple Chain implementation
 * 
 * @param logger
 * @param impls
 */
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

/**
 * Factory of Logger implementations
 * 
 * @author pasha
 */
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

/**
 * WebKit specific logger implementation to be used with WRT's logger
 * 
 * @author pasha
 */
Downsha.WebKitLoggerImpl = function WebKitLoggerImpl(logger) {
  this.initialize(logger);
};
Downsha.inherit(Downsha.WebKitLoggerImpl, Downsha.LoggerImpl, true);
Downsha.WebKitLoggerImpl.isResponsibleFor = function(navigator) {
  return navigator.userAgent.toLowerCase().indexOf("AppleWebKit/") > 0;
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
Downsha.WebKitLoggerImpl.prototype.alert = function(str) {
  alert(str);
};


Downsha.Semaphore = function(signals) {
  this.__defineGetter__("excessSignals", this.getExcessSignals);
  this.initialize(signals);
};

Downsha.inherit(Downsha.Semaphore, Array);

Downsha.Semaphore.mutex = function() {
  var sema = new Downsha.Semaphore();
  sema.signal();
  return sema;
};

Downsha.Semaphore.prototype._excessSignals = 0;
Downsha.Semaphore.prototype.initialize = function(signals) {
  this._excessSignals = parseInt(signals);
  if (isNaN(this._excessSignals)) {
    this._excessSignals = 0;
  }
};
Downsha.Semaphore.prototype.getExcessSignals = function() {
  return this._excessSignals;
};
Downsha.Semaphore.prototype.hasExcessSignals = function() {
  return (this._excessSignals > 0) ? true : false;
};
Downsha.Semaphore.prototype.signal = function() {
  if (this.length == 0) {
    this._excessSignals++;
  } else {
    this._processNext();
  }
};
Downsha.Semaphore.prototype.wait = function() {
  if (this._excessSignals > 0) {
    this._excessSignals--;
    this._processNext();
  }
};
Downsha.Semaphore.prototype.critical = function(fn) {
  var self = this;
  var f = function() {
    try {
      fn();
    } catch (e) {
      self.signal();
      throw (e);
    }
  };
  f._semaOrigFn = fn;
  this.push(f);
  this.wait();
};
Downsha.Semaphore.prototype.wave = function() {
  if (this.length > 0) {
    this.shift();
  }
};
Downsha.Semaphore.prototype.waveAll = function() {
  if (this.length > 0) {
    this.splice(0, this.length);
  }
};
Downsha.Semaphore.prototype.waveEach = function(fn) {
  var i = 0;
  while (i < this.length) {
    if (fn(this[i]._semaOrigFn)) {
      this.splice(i, 1);
    } else {
      i++;
    }
  }
};
Downsha.Semaphore.prototype._processNext = function() {
  if (this.length > 0) {
    var fn = this.shift();
    if (typeof fn == 'function') {
      fn();
    }
  }
};
Downsha.Semaphore.prototype.toString = function() {
  return this._excessSignals + ":[" + this.join(",") + "]";
};

/*
 * Downsha.Utils
 * Downsha
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
Downsha.Utils = new function Utils() {
};

/**
 * Expands object a with properties of object b
 */
Downsha.Utils.extendObject = function(a, b, deep, overwrite) {
  if (typeof a == 'object' && a != null && typeof b == 'object' && b != null) {
    for ( var i in b) {
      if (typeof a[i] == 'undefined' || overwrite) {
        a[i] = b[i];
      } else if (deep) {
        arguments.callee.apply(this, [ a[i], b[i], deep, overwrite ]);
      }
    }
  }
};
Downsha.Utils.importConstructs = function(fromWindow, toWindow, constructNames) {
  var names = (constructNames instanceof Array) ? constructNames
      : [ constructNames ];
  for ( var i = 0; i < names.length; i++) {
    var nameParts = names[i].split(".");
    var toAnchor = toWindow;
    var fromAnchor = fromWindow;
    for ( var p = 0; p < nameParts.length; p++) {
      if (p == nameParts.length - 1) {
        if (typeof toAnchor[nameParts[p]] == 'undefined') {
          toAnchor[nameParts[p]] = fromAnchor[nameParts[p]];
        } else {
          Downsha.Utils.extendObject(toAnchor[nameParts[p]],
              fromAnchor[nameParts[p]], true);
        }
      } else {
        fromAnchor = fromAnchor[nameParts[p]];
        if (typeof toAnchor[nameParts[p]] == 'undefined') {
          toAnchor[nameParts[p]] = {};
        }
        toAnchor = toAnchor[nameParts[p]];
      }
    }
  }
};

Downsha.Utils.separateString = function(str, separator) {
  if (typeof str != 'string')
    return str;
  if (typeof separator != 'string')
    separator = ",";
  var parts = str.split(separator);
  var returnParts = new Array();
  for ( var i = 0; i < parts.length; i++) {
    if (typeof parts[i] != 'string')
      continue;
    var clean = Downsha.Utils.trim(parts[i]);
    if (clean && clean.length > 0)
      returnParts.push(clean);
  }
  return returnParts;
};

Downsha.Utils.trim = function(str) {
  if (typeof str != 'string')
    return str;
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
};

Downsha.Utils.shortenString = function(str, len, suffix) {
  var s = str + "";
  if (s.length > len) {
    s = s.substring(0, Math.max(0, len
        - ((typeof suffix == 'string') ? suffix.length : 0)));
    if (typeof suffix == 'string')
      s += suffix;
  }
  return s;
};

Downsha.Utils.htmlEntities = function(anything) {
  return $("<div/>").text(anything).html();
};
Downsha.Utils.urlPath = function(url) {
  if (typeof url == 'string') {
    var path = url.replace(/^[^:]+:\/+([^\/]+)/, "");
    if (path.indexOf("/") == 0) {
      return path.replace(/^(\/[^\?\#]*).*$/, "$1");
    }
  }
  return "";
};
Downsha.Utils.urlDomain = function(url, includePort) {
  if (typeof url == 'string') {
    var re = new RegExp("^[^:]+:\/+([^\/" + ((includePort) ? "" : ":")
        + "]+).*$");
    return url.replace(re, "$1");
  }
  return url;
};
Downsha.Utils.urlTopDomain = function(url) {
  var topDomain = url;
  if (typeof url == 'string') {
    var topDomain = Downsha.Utils.urlDomain(url);
    if (topDomain.toLowerCase().indexOf("www.") == 0) {
      topDomain = topDomain.substring(4);
    }
  }
  return topDomain;
};
Downsha.Utils.urlPath = function(url) {
  if (typeof url == 'string') {
    var re = new RegExp("^[^:]+:\/\/[^\/]+([^\&\?]*).*$");
    return url.replace(re, "$1");
  }
  return "";
};
Downsha.Utils.urlQueryValue = function(key, url) {
  if (typeof url == 'string' && typeof key == 'string' && url.indexOf("?") >= 0) {
    var queries = url.split(/[\?\#\&]+/).slice(1);
    var k = key.toLowerCase();
    var results = new Array();
    for ( var i = 0; i < queries.length; i++) {
      var kv = queries[i].split("=", 2);
      if (kv[0].toLowerCase() == k) {
        var r = (kv[1]) ? kv[1].replace(/\+/g, " ") : kv[1];
        results.push(decodeURIComponent(r));
      }
    }
    if (results.length > 0) {
      return results[results.length - 1];
    }
  }
  return null;
};
Downsha.Utils.urlProto = function(url) {
  if (typeof url == 'string') {
    var x = -1;
    if ((x = url.indexOf(":/")) > 0) {
      return url.substring(0, x).toLowerCase();
    }
  }
  return null;
};
Downsha.Utils.absoluteUrl = function(url, base) {
	if (url.indexOf("//") == 0) {
		url = base.replace(/^([^:]+):.*$/, "$1") + ":" + url;
	} else if (url.indexOf("/") == 0) {
   		url = base.replace(/^(.*:\/\/[^\/]+).*$/, "$1") + url;
   	} else if (url.match(/^\.+\//)) {
   		url = base.replace(/^(.*:\/\/[^\/]+).*$/, "$1") + "/" + url;
	} else {
   		url = (base.charAt(base.length - 1) == "/") ? base + url : base + "/" + url;
   	}
	return url;
};
Downsha.Utils.urlToSearchQuery = function(url, searchPrefix) {
  // determine protocol
  var proto = Downsha.Utils.urlProto(url);
  if (proto && proto.indexOf("http") == 0) {
    return Downsha.Utils.httpUrlToSearchQuery(url, searchPrefix);
  } else if (proto && proto == "file") {
    return Downsha.Utils.fileUrlToSearchQuery(url, searchPrefix);
  } else if (proto) {
    return Downsha.Utils.anyProtoUrlToSearchQuery(url, searchPrefix);
  } else {
    return Downsha.Utils.anyUrlToSearchQuery(url, searchPrefix);
  }
};
Downsha.Utils.httpUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  // actual FQDN
  var domain = Downsha.Utils.urlDomain((url + "").toLowerCase());
  var allUrls = [ (pfx + "http://" + domain + "*"),
      (pfx + "https://" + domain + "*") ];
  if (domain.match(/[^0-9\.]/)) {
    var secondaryDomain = (domain.indexOf("www.") == 0) ? domain.substring(4)
        : ("www." + domain);
    // query parameters based on actual FQDN
    allUrls = allUrls.concat( [ (pfx + "http://" + secondaryDomain + "*"),
        (pfx + "https://" + secondaryDomain + "*") ]);
  }
  var q = "any: " + allUrls.join(" ");
  return q;
};
Downsha.Utils.fileUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  var q = pfx + "file:*";
  return q;
};
Downsha.Utils.anyProtoUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  var proto = Downsha.Utils.urlProto(url);
  var secProto = proto + "s";
  if (proto.indexOf("s") == (proto.length - 1)) {
    proto = proto.substring(0, (proto.length - 1));
    secProto = proto + "s";
  }
  var domain = Downsha.Utils.urlDomain(url);
  var allUrls = [ (pfx + proto + "://" + domain + "*"),
      (pfx + secProto + "://" + domain + "*") ];
  var q = "any: " + allUrls.join(" ");
  return q;
};
Downsha.Utils.anyUrlToSearchQuery = function(url, searchPrefix) {
  // determine query prefix
  var pfx = (typeof searchPrefix == 'string') ? searchPrefix : "";
  var q = pfx + url + "*";
  return q;
};
Downsha.Utils.urlSuffix = "...";
Downsha.Utils.shortUrl = function(url, maxLength) {
  var shortUrl = url;
  if (typeof url == 'string') {
    if (shortUrl.indexOf("file:") == 0) {
      shortUrl = decodeURIComponent(shortUrl.replace(/^file:.*\/([^\/]+)$/,
          "$1"));
      if (typeof maxLength == 'number' && !isNaN(maxLength)
          && shortUrl.length > maxLength) {
        shortUrl = shortUrl.substring(0, maxLength);
        shortUrl += "" + Downsha.Utils.urlSuffix;
      }
    } else {
      shortUrl = shortUrl.replace(/^([a-zA-Z]+:\/+)?([^\/]+).*$/, "$2");
      if (typeof maxLength == 'number' && !isNaN(maxLength)
          && shortUrl.length > maxLength) {
        shortUrl = shortUrl.substring(0, maxLength);
        shortUrl += "" + Downsha.Utils.urlSuffix;
      } else if (url.substring(url.indexOf(shortUrl) + shortUrl.length).length > 2) {
        shortUrl += "/" + Downsha.Utils.urlSuffix;
      }
    }
  }
  return shortUrl;
};
Downsha.Utils.appendSearchQueryToUrl = function(url, params) {
  var _url = url + "";
  _url += (_url.indexOf("?") >= 0) ? "&" : "?";
  if (typeof params == 'string') {
    _url += params;
  } else if (typeof params == 'object' && params) {
    for ( var i in params) {
      _url += encodeURIComponent(i) + "=" + encodeURIComponent(params[i]) + "&";
    }
  }
  if (_url.charAt(_url.length - 1) == "&") {
    _url = _url.substring(0, _url.length - 1);
  }
  return _url;
};
Downsha.Utils.makeAbsoluteClientRect = function(rect, win) {
  if (!win) {
    win = window;
  }
  var _rect = {
    top : rect.top + win.pageYOffset,
    bottom : rect.bottom + win.pageYOffset,
    left : rect.left + win.pageXOffset,
    right : rect.right + win.pageXOffset,
    width : rect.width,
    height : rect.height
  };
  return _rect;
};
Downsha.Utils.getAbsoluteBoundingClientRect = function(element) {
  var el = (element.nodeType == Node.TEXT_NODE) ? element.parentElement
      : element;
  var _rect = el.getBoundingClientRect();
  var win = (element instanceof Range) ? win = element.commonAncestorContainer.ownerDocument.defaultView
      : win = element.ownerDocument.defaultView;
  return Downsha.Utils.makeAbsoluteClientRect(_rect, win);
};
Downsha.Utils.marginalizeBoundingClientRect = function(rect, computedStyle) {
  var _rect = {
    top : rect.top,
    right : rect.right,
    bottom : rect.bottom,
    left : rect.left,
    width : rect.width,
    height : rect.height
  };
  var mt = parseInt(computedStyle.getPropertyValue("margin-top"));
  if (!isNaN(mt)) {
    _rect.top -= mt;
  }
  var mb = parseInt(computedStyle.getPropertyValue("margin-bottom"));
  if (!isNaN(mb)) {
    _rect.bottom += mb;
  }
  var ml = parseInt(computedStyle.getPropertyValue("margin-left"));
  if (!isNaN(ml)) {
    _rect.left -= ml;
  }
  var mr = parseInt(computedStyle.getPropertyValue("margin-right"));
  if (!isNaN(mr)) {
    _rect.right += mr;
  }
  _rect.width = _rect.right - _rect.left;
  _rect.height = _rect.bottom - _rect.top;
  return _rect;
};
Downsha.Utils.demarginalizeBoundingClientRect = function(rect, computedStyle) {
  var _rect = {
    top : rect.top,
    right : rect.right,
    bottom : rect.bottom,
    left : rect.left,
    width : rect.width,
    height : rect.height
  };
  var mt = parseInt(computedStyle.getPropertyValue("margin-top"));
  if (!isNaN(mt)) {
    _rect.top += mt;
  }
  var mb = parseInt(computedStyle.getPropertyValue("margin-bottom"));
  if (!isNaN(mb)) {
    _rect.bottom -= mb;
  }
  var ml = parseInt(computedStyle.getPropertyValue("margin-left"));
  if (!isNaN(ml)) {
    _rect.left += ml;
  }
  var mr = parseInt(computedStyle.getPropertyValue("margin-right"));
  if (!isNaN(mr)) {
    _rect.right -= mr;
  }
  _rect.width = _rect.right - _rect.left;
  _rect.height = _rect.bottom - _rect.top;
  return _rect;
};
Downsha.Utils.depadRect = function(rect, computedStyle) {
  var _rect = {
    top : rect.top,
    right : rect.right,
    bottom : rect.bottom,
    left : rect.left,
    width : rect.width,
    height : rect.height
  };
  var mt = parseInt(computedStyle.getPropertyValue("padding-top"));
  if (!isNaN(mt)) {
    _rect.top += mt;
  }
  var mb = parseInt(computedStyle.getPropertyValue("padding-bottom"));
  if (!isNaN(mb)) {
    _rect.bottom -= mb;
  }
  var ml = parseInt(computedStyle.getPropertyValue("padding-left"));
  if (!isNaN(ml)) {
    _rect.left += ml;
  }
  var mr = parseInt(computedStyle.getPropertyValue("padding-right"));
  if (!isNaN(mr)) {
    _rect.right -= mr;
  }
  _rect.width = _rect.right - _rect.left;
  _rect.height = _rect.bottom - _rect.top;
  return _rect;
};
Downsha.Utils.getElementForNode = function(node) {
  if (node && node.nodeType == Node.ELEMENT_NODE) {
    return node;
  } else if (node.parentElement) {
    return node.parentElement;
  } else {
    return null;
  }
};
Downsha.Utils.addElementClass = function(element, className) {
  if (element && className) {
    var elementClass = element.getAttribute("class");
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      if (parts.indexOf(className) < 0) {
        parts.push(className);
      }
      element.setAttribute("class", parts.join(" "));
    } else {
      element.setAttribute("class", className);
    }
  }
};
Downsha.Utils.removeElementClass = function(element, className) {
  if (className) {
    var elementClass = element.getAttribute("class");
    if (elementClass) {
      var parts = elementClass.split(/\s+/);
      var i = -1;
      if ((i = parts.indexOf(className)) >= 0) {
        parts.splice(i, 1);
      }
      element.setAttribute("class", parts.join(" "));
    }
  }
};
Downsha.Utils.XML_ESCAPE_CHAR_MAP = {
  "&" : "&amp;",
  "<" : "&lt;",
  ">" : "&gt;",
  "\"" : "&quot;",
  "'" : "&apos;"
};
Downsha.Utils.escapeXML = function(str) {
  var a = str.split("");
  for ( var i = 0; i < a.length; i++) {
    if (Downsha.Utils.XML_ESCAPE_CHAR_MAP[a[i]]) {
      a[i] = Downsha.Utils.XML_ESCAPE_CHAR_MAP[a[i]];
    }
  }
  return a.join("");
};
Downsha.Utils.rectIntersectPoint = function(a, b) {
  var pt = {
    x : NaN,
    y : NaN
  };
  if (a.right > b.left) {
    pt.x = b.left + ((a.right - b.left) / 2);
  } else {
    pt.x = a.left + ((b.right - a.left) / 2);
  }
  if (a.bottom > b.top) {
    pt.y = b.top + ((a.bottom - b.top) / 2);
  } else {
    pt.y = a.top + ((b.bottom - a.top) / 2);
  }
  if (!isNaN(pt.x) && !isNaN(pt.y)
      && (pt.x > a.left && pt.x < a.right && pt.y > a.top && pt.y < a.bottom)
      || (pt.x > b.left && pt.x < b.right && pt.y > b.top && pt.y < b.bottom)) {
    return pt;
  }
  return undefined;
};
Downsha.Utils.rectIntersection = function(a, b) {
  if (!(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top)) {
    var aRect = {
      left : Math.max(a.left, b.left),
      top : Math.max(a.top, b.top),
      right : Math.min(a.right, b.right),
      bottom : Math.min(a.bottom, b.bottom)
    };
    aRect.width = aRect.right - aRect.left;
    aRect.height = aRect.bottom - aRect.top;
    return aRect;
  }
  return undefined;
};
Downsha.Utils.rectsEqual = function(a, b) {
  if (a.left == b.left && a.right == b.right && a.top == b.top
      && a.bottom == b.bottom) {
    return true;
  } else {
    return false;
  }
};
Downsha.Utils.expandRect = function(a, b) {
  a.left = (a.left) ? Math.min(a.left, b.left) : b.left;
  a.top = (a.top) ? Math.min(a.top, b.top) : b.top;
  a.right = (a.right) ? Math.max(a.right, b.right) : b.right;
  a.bottom = (a.bottom) ? Math.max(a.bottom, b.bottom) : b.bottom;
};
Downsha.Utils.errorDescription = function(err) {
    var msg = null;
    if (err instanceof FileError) {
        var errName = null;
        var errCode = err.code;
        if (typeof errCode == 'number') {
            for (var prop in FileError) {
                if (prop.toLowerCase().indexOf("_err") > 0 && FileError[prop] == err.code) {
                    msg = "FileError: " + errCode + " ("+prop+")";
                    break;
                }
            }
        } else {
            msg = "FileError: " + errCode;
        }
    } else if (err.message) {
        msg = err.message;
    } else if (typeof err.code != 'undefined') {
        var constructorName = (err.constructor && err.constructor.name) ? err.constructor.name : (""+err);
        msg = constructorName + " code: " + err.code;
    }
    return msg;
};

/**
 * Chrome specific logger implementation to be used with Chrome extensions
 * 
 * @author pasha
 */
Downsha.ChromeExtensionLoggerImpl = function ChromeExtensionLoggerImpl(logger) {
  this.initialize(logger);
};
Downsha.inherit(Downsha.ChromeExtensionLoggerImpl, Downsha.WebKitLoggerImpl,
    true);

Downsha.ChromeExtensionLoggerImpl.isResponsibleFor = function(navigator) {
  return (navigator.userAgent.toLowerCase().indexOf("chrome/") > 0);
};

Downsha.ChromeExtensionLoggerImpl.prototype._enabled = true;

(function() {
  var LOG = null;
  var logEnabled = false;
  Downsha.Clip = function Clip(aWindow, stylingStrategy, maxSize) {
    LOG = Downsha.Logger.getInstance();
    if (LOG.level == Downsha.Logger.LOG_LEVEL_DEBUG) {
      logEnabled = true;
    }
    this.__defineGetter__("fullPage", this.isFullPage);
    this.__defineGetter__("length", this.getLength);
    this.__defineGetter__("stylingStrategy", this.getStylingStrategy);
    this.__defineSetter__("stylingStrategy", this.setStylingStrategy);
    this.__defineGetter__("documentBase", this.getDocumentBase);
    this.__defineSetter__("documentBase", this.setDocumentBase);
    this.__defineGetter__("maxSize", this.getMaxSize);
    this.__defineSetter__("maxSize", this.setMaxSize);
    this.__defineGetter__("sizeExceeded", this.isSizeExceeded);
    this.__defineSetter__("sizeExceeded", this.setSizeExceeded);
    this.__defineGetter__("url", this.getUrl);
    this.__defineSetter__("url", this.setUrl);
    this.initialize(aWindow, stylingStrategy, maxSize);
  };

  Downsha.Clip.NOKEEP_NODE_ATTRIBUTES = {
    "style" : null,
    "tabindex" : null,
    "class" : null,
    "id" : null
  };
  Downsha.Clip.CONDITIONAL_NODES = {
    "IFRAME" : null,
    "EMBED" : null,
    "OBJECT" : null
  };
  Downsha.Clip.NODE_NAME_TRANSLATIONS = {
    "HTML" : "DIV",
    "BODY" : "DIV",
    "FORM" : "DIV",
    "CANVAS" : "DIV",
    "CUFON" : "DIV",
    "EMBED" : "IMG",
    "*" : "DIV"
  };
  Downsha.Clip.SUPPORTED_NODES = {
    "A" : null,
    "ABBR" : null,
    "ACRONYM" : null,
    "ADDRESS" : null,
    "AREA" : null,
    "B" : null,
    "BASE" : null,
    "BASEFONT" : null,
    "BDO" : null,
    "BIG" : null,
    "BLOCKQUOTE" : null,
    "BR" : null,
    "BUTTON" : null,
    "CAPTION" : null,
    "CENTER" : null,
    "CITE" : null,
    "CODE" : null,
    "COL" : null,
    "COLGROUP" : null,
    "DD" : null,
    "DEL" : null,
    "DFN" : null,
    "DIR" : null,
    "DIV" : null,
    "DL" : null,
    "DT" : null,
    "EM" : null,
    "FIELDSET" : null,
    "FONT" : null,
    "FORM" : null,
    "FRAME" : null,
    "FRAMESET" : null,
    "H1" : null,
    "H2" : null,
    "H3" : null,
    "H4" : null,
    "H5" : null,
    "H6" : null,
    "HEAD" : null,
    "HR" : null,
    "HTML" : null,
    "I" : null,
    "IFRAME" : null,
    "IMG" : null,
    "INPUT" : null,
    "INS" : null,
    "KBD" : null,
    "LABEL" : null,
    "LEGEND" : null,
    "LI" : null,
    "LINK" : null,
    "MAP" : null,
    "MENU" : null,
    "META" : null,
    "NOBR" : null,
    "NOFRAMES" : null,
    "NOSCRIPT" : null,
    "OBJECT" : null,
    "OL" : null,
    "OPTGROUP" : null,
    "OPTION" : null,
    "P" : null,
    "PARAM" : null,
    "PRE" : null,
    "Q" : null,
    "QUOTE" : null,
    "S" : null,
    "SAMP" : null,
    "SCRIPT" : null,
    "SELECT" : null,
    "SMALL" : null,
    "SPAN" : null,
    "STRIKE" : null,
    "STRONG" : null,
    "STYLE" : null,
    "SUB" : null,
    "SUP" : null,
    "TABLE" : null,
    "TBODY" : null,
    "TD" : null,
    "TEXTAREA" : null,
    "TFOOT" : null,
    "TH" : null,
    "THEAD" : null,
    "TITLE" : null,
    "TR" : null,
    "TT" : null,
    "U" : null,
    "UL" : null,
    "VAR" : null
  };
  Downsha.Clip.REJECT_NODES = {
    "SCRIPT" : null,
    "STYLE" : null,
    "FRAME" : null,
    "FRAMESET" : null,
    "IFRAME" : null,
    "INPUT" : null,
    "SELECT" : null,
    "OPTION" : null,
    "OPTGROUP" : null,
    "TEXTAREA" : null,
    "NOSCRIPT" : null,
    "OBJECT" : null,
    "PARAM" : null,
    "HEAD" : null,
    "DOWNSHADIV" : null,
    "CUFONTEXT" : null,
    "EMBED" : null,
    "NOEMBED" : null
  };
  Downsha.Clip.NON_ANCESTOR_NODES = {
    "OL" : null,
    "UL" : null,
    "LI" : null
  };
  Downsha.Clip.SELF_CLOSING_NODES = {
    "IMG" : null,
    "INPUT" : null,
    "BR" : null
  };

  Downsha.Clip.HTMLEncode = function(str) {
    var result = "";
    for ( var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      var aChar = str[i];
      if (charcode > 0x7f) {
        result += "&#" + charcode + ";";
      } else if (aChar == '>') {
        result += "&gt;";
      } else if (aChar == '<') {
        result += "&lt;";
      } else if (aChar == '&') {
        result += "&amp;";
      } else {
        result += str[i];
      }
    }
    return result;
  };

  // Downsha.Clip.prototype.fullPage = false;
  Downsha.Clip.prototype.title = null;
  Downsha.Clip.prototype.location = null;
  Downsha.Clip.prototype.window = null;
  Downsha.Clip.prototype.selectionFinder = null;
  Downsha.Clip.prototype.deep = true;
  Downsha.Clip.prototype._stylingStrategy = null;
  Downsha.Clip.prototype._documentBase = null;
  Downsha.Clip.prototype._maxSize = 0;
  Downsha.Clip.prototype._sizeExceeded = false;
  Downsha.Clip.prototype.notebookGuid = false;
  Downsha.Clip.prototype.tagNames = false;
  Downsha.Clip.prototype.comment = false;
  Downsha.Clip.prototype._includeFontFaceDescriptions = false;

  // Declares the content and source of a web clip
  Downsha.Clip.prototype.initialize = function(aWindow, stylingStrategy,
      maxSize) {
    this.title = aWindow.document.title;
    this.location = aWindow.location;
    this.window = aWindow;
    this.selectionFinder = new Downsha.SelectionFinder(aWindow.document);
    this.range = null;
    if (stylingStrategy) {
      this.stylingStrategy = stylingStrategy;
    }
    this.maxSize = maxSize;
  };

  /**
   * Override with a function to have that function called when the clip's
   * serialized string exceeds maxSize property.
   */
  Downsha.Clip.prototype.onsizeexceed = null;

  Downsha.Clip.prototype.isFullPage = function() {
    return !this.hasSelection();
  };

  Downsha.Clip.prototype.hasSelection = function() {
    if (this.selectionFinder.hasSelection()) {
      return true;
    } else {
      this.findSelection();
      return this.selectionFinder.hasSelection();
    }
  };
  Downsha.Clip.prototype.findSelection = function() {
    this.selectionFinder.find(this.deep);
  };
  Downsha.Clip.prototype.getSelection = function() {
    if (this.hasSelection()) {
      return this.selectionFinder.selection;
    }
    return null;
  };
  Downsha.Clip.prototype.getRange = function() {
    if (this.hasSelection()) {
      return this.selectionFinder.getRange();
    }
    return null;
  };
  Downsha.Clip.prototype.hasBody = function() {
    return (this.window && this.window.document && this.window.document.body && this.window.document.body.tagName
        .toLowerCase() == "body");
  };
  Downsha.Clip.prototype.hasContentToClip = function() {
    return (this.hasBody() || this.hasSelection());
  };
  Downsha.Clip.prototype.getDocumentBase = function() {
    if (this._documentBase == null) {
      var baseTags = this.window.document.getElementsByTagName("base");
      if (baseTags.length > 0) {
        for ( var i = 0; i < baseTags.length; i++) {
          this.setDocumentBase(baseTags[i].href);
          if (this._documentBase) {
            break;
          }
        }
      }
      if (!this._documentBase) {
        this._documentBase = this.location.origin
            + this.location.pathname.replace(/[^\/]+$/, "");
      }
    }
    return this._documentBase;
  };
  Downsha.Clip.prototype.setDocumentBase = function(url) {
    if (typeof url == 'string' && url.indexOf("http") == 0) {
      this._documentBase = url;
    } else {
      this._documentBase = null;
    }
  };
  Downsha.Clip.prototype.getMaxSize = function() {
    return this._maxSize;
  };
  Downsha.Clip.prototype.setMaxSize = function(num) {
    this._maxSize = parseInt(num);
    if (isNaN(this._maxSize) || num < 0) {
      this._maxSize = 0;
    }
  };
  Downsha.Clip.prototype.isSizeExceeded = function() {
    return this._sizeExceeded;
  };
  Downsha.Clip.prototype.setSizeExceeded = function(bool) {
    this._sizeExceeded = (bool) ? true : false;
  };
  Downsha.Clip.prototype.getUrl = function() {
    if (!this._url) {
      this._url = this.location.href;
    }
    return this._url;
  };
  Downsha.Clip.prototype.setUrl = function(url) {
    if (typeof url == 'string' || url == null) {
      this._url = url;
    }
  };

  /**
   * Captures all the content of the document
   */
  Downsha.Clip.prototype.clipBody = function() {
    if (!this.hasBody()) {
      if (logEnabled)
        LOG.debug("Document has no body...");
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var s = 0;
    var e = 0;
    if (logEnabled) {
      LOG.debug("Getting body text: " + this);
      s = new Date().getTime();
    }
    this.content = this.serializeDOMNode(
        this.window.document.body.parentElement || this.window.document.body,
        true);
    if (logEnabled) {
      e = new Date().getTime();
      LOG.debug("Clipped body in " + (e - s) + " milliseconds");
    }
    if (typeof this.content != 'string') {
      return false;
    }
    return true;
  };

  Downsha.Clip.prototype.clipElement = function(element) {
    if (element) {
      if (this.stylingStrategy) {
        this.stylingStrategy.cleanUp();
      }
      var s = 0;
      var e = 0;
      if (logEnabled) {
        LOG.debug("Getting element text: " + this);
        s = new Date().getTime();
      }
      this.content = this.serializeDOMNode(element, true);
      if (logEnabled) {
        e = new Date().getTime();
        LOG.debug("Clipped element's content in " + (e - s) + " milliseconds");
      }
      if (typeof this.content == 'string') {
        return true;
      }
    }
    LOG.debug("Cannot clip because no valid element was specified");
    return false;
  };

  /**
   * Captures selection in the document
   */
  Downsha.Clip.prototype.clipSelection = function() {
    if (!this.hasSelection()) {
      if (logEnabled)
        LOG.debug("No selection to clip");
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var s = 0;
    var e = 0;
    this.range = this.getRange();
    if (this.range) {
      if (logEnabled)
        var s = new Date().getTime();
      var ancestor = (this.stylingStrategy
          && this.range.commonAncestorContainer.nodeType == Node.TEXT_NODE && this.range.commonAncestorContainer.parentNode) ? this.range.commonAncestorContainer.parentNode
          : this.range.commonAncestorContainer;
      while (typeof Downsha.Clip.NON_ANCESTOR_NODES[ancestor.nodeName] != 'undefined'
          && ancestor.parentNode) {
        if (ancestor.nodeName == "BODY") {
          break;
        }
        ancestor = ancestor.parentNode;
      }
      this.content = this.serializeDOMNode(ancestor, false);
      if (logEnabled) {
        var e = new Date().getTime();
      }
      this.range = null;
      if (logEnabled) {
        LOG.debug("Success...");
        LOG.debug("Clipped selection in " + (e - s) + " seconds");
      }
      return true;
    }
    this.range = null;
    if (logEnabled)
      LOG.debug("Failure");
    return false;
  };

  Downsha.Clip.prototype.serializeDOMNode = function(root, fullPage) {
    var str = "";
    // oh yeah, if we ever decide to keep <style> crap, setting
    // _includeFontFaceDescriptions
    // will allow to include font face descriptions inside <style> tags =)
    if (this._includeFontFaceDescriptions && this.stylingStrategy) {
      var ffRules = this.stylingStrategy.getFontFaceRules();
      if (ffRules) {
        str += "<style>\n";
        for ( var ffrx = 0; ffrx < ffRules.length; ffrx++) {
          str += ffRules[ffrx].cssText + "\n";
        }
        str += "</style>\n";
      }
    }
    var node = root;
    
    try {
        while (node) {
          if (this.maxSize > 0 && str.length > this.maxSize) {
            LOG.debug("Length of serialized content exceeds " + this.maxSize);
            this.sizeExceeded = true;
            if (typeof this.onsizeexceed == 'function') {
              this.onsizeexceed();
            }
            break;
          }
          var inRange = (!this.range || this.range.intersectsNode(node)) ? true
              : false;
          if (inRange && node.nodeType == Node.TEXT_NODE) {
            if (this.range) {
              if (this.range.startContainer == node
                  && this.range.startContainer == this.range.endContainer) {
                str += this.constructor.HTMLEncode(node.nodeValue.substring(
                    this.range.startOffset, this.range.endOffset));
              } else if (this.range.startContainer == node) {
                str += this.constructor.HTMLEncode(node.nodeValue
                    .substring(this.range.startOffset));
              } else if (this.range.endContainer == node) {
                str += this.constructor.HTMLEncode(node.nodeValue.substring(0,
                    this.range.endOffset));
              } else if (this.range.commonAncestorContainer != node) {
                str += this.constructor.HTMLEncode(node.nodeValue);
              }
            } else {
              str += this.constructor.HTMLEncode(node.nodeValue);
            }
          } else if (inRange
              && node.nodeType == Node.ELEMENT_NODE
              && typeof Downsha.Clip.CONDITIONAL_NODES[node.nodeName] != 'undefined') {
            if (this.isNodeVisible(node)) {
              var nodeStyle = null;
              if (this.stylingStrategy) {
                nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage);
              }
              var _str = this.serializeConditionalElement(node, nodeStyle);
              if (typeof _str == 'string' && _str) {
                str += _str;
              }
            }
          } else if (inRange && node.nodeType == Node.ELEMENT_NODE
              && typeof Downsha.Clip.REJECT_NODES[node.nodeName] == 'undefined') {
            if (this.isNodeVisible(node)) {
              var attrs = node.attributes;
              var attrStr = "";
              for ( var i = 0; i < attrs.length; i++) {
                if (typeof Downsha.Clip.NOKEEP_NODE_ATTRIBUTES[attrs[i].name] == 'undefined'
                    && attrs[i].name.substring(0, 2).toLowerCase() != "on"
                    && !(attrs[i].name == "href" && attrs[i].value.substring(0, 11) == "javascript:")) {
                  var v = (attrs[i].value) ? Downsha.Utils
                      .escapeXML(attrs[i].value) : "";
                  if ((attrs[i].name == "src" || attrs[i].name == "href")
                      && v.toLowerCase().indexOf("http") != 0) {
    				v = Downsha.Utils.absoluteUrl(v, this.getDocumentBase());
                  }
                  if (v) {
                    attrStr += " " + attrs[i].name + "=\"" + v + "\"";
                  } else {
                    attrStr += " " + attrs[i].name;
                  }
                }
              }
              if (this.stylingStrategy) {
                var nodeStyle = this.stylingStrategy.styleForNode(node, root,
                    fullPage);
                if (nodeStyle instanceof Downsha.ClipStyle && nodeStyle.length > 0) {
                  if (nodeStyle["float"] && nodeStyle["float"] != "none"
                      && node.parentElement) {
                    node.parentElement._downsha_float_ = true;
                  }
                  attrStr += " style=\""
                      + nodeStyle.toString().replace(/\"/g, "\\\"") + "\"";
                } else if (typeof nodeStyle == 'string') {
                  attrStr += " style=\"" + nodeStyle.replace(/\"/g, "\\\"") + "\"";
                }
              }
              var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName]
                  || node.nodeName;
              nodeName = (typeof Downsha.Clip.SUPPORTED_NODES[nodeName] != 'undefined') ? nodeName
                  : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
              str += "<" + nodeName + attrStr;
              var s = window.getComputedStyle(node, '');
              var sVisibility = s.getPropertyValue("visibility");
              if (sVisibility != "hidden" && node.hasChildNodes()) {
                str += ">";
                node = node.childNodes[0];
                continue;
              } else if (typeof Downsha.Clip.SELF_CLOSING_NODES[nodeName] == 'undefined') {
                // The standards are great when no one follows them...
                // in the case of a BUTTON tag, make sure we fucking close it since
                // it's not a self-closing tag
                // and having a self-closing button will often result in the
                // siblings becoming its children
                // e.g. <button/><div>...</div> would become
                // <button><div>...</div></button>
                str += ">" + "</" + nodeName + ">";
              } else {
                str += "/>";
              }
            }
          }
          if (node.nextSibling) {
            node = node.nextSibling;
          } else if (node != root) {
            if (node.parentElement && node.parentElement._downsha_float_) {
              var floatClearingStr = this
                  .getFloatClearingElementString(node.parentElement);
              str += floatClearingStr;
              delete node.parentElement._downsha_float_;
            }
            while (node.parentNode) {
              node = node.parentNode;
              var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName]
                  || node.nodeName;
              nodeName = (typeof Downsha.Clip.SUPPORTED_NODES[nodeName] != 'undefined') ? nodeName
                  : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
              // if the current node is the root node, let's append a terminal
              // element to compensate for any floating children
              if (node == root) {
                str += "<div style='clear: both'></div>";
              }
              str += "</" + nodeName + ">";
              if (node == root) {
                break;
              } else if (node.nextSibling) {
                node = node.nextSibling;
                break;
              } else if (node.parentElement && node.parentElement._downsha_float_) {
                var floatClearingStr = this
                    .getFloatClearingElementString(node.parentElement);
                str += floatClearingStr;
                delete node.parentElement._downsha_float_;
              }
            }
            if (node == root) {
              break;
            }
          } else {
            break;
          }
        }
    } catch(e) {
        var nodeStr = null; 
        if (node.nodeType == Node.TEXT_NODE) {
            nodeStr = node.textContent;
        } else if (node.nodeType == Node.ELEMENT_NODE) {
            nodeStr = "<" + node.nodeName;
            for (var attr in node.attributes) {
                nodeStr += " " + attr.name + "=\"" + attr.value + "\"";
            }
            nodeStr += ">";
        }
        if (e instanceof DOMException && e.code == DOMException.SECURITY_ERR) {
            LOG.debug("Ignoring DOMException.SECURITY_ERR for node: " + nodeStr);
        } else {
            LOG.error("Error serializing node: " + nodeStr);
            throw e;
        }
    }
    return str;
  };

  Downsha.Clip.prototype.getFloatClearingElementString = function(node) {
    var str = "";
    if (node && this.stylingStrategy) {
      var style = this.stylingStrategy.styleForFloatClearingNode(node);
      if (style && style.length > 0) {
        var nodeName = "div";
        if (node.nodeName == "UL" || node.nodeName == "OL") {
          nodeName = "li";
        } else if (node.nodeName == "DL") {
          nodeName = "dd";
        }
        str = "<" + nodeName + " style=\"" + style.toString() + "\"></"
            + nodeName + ">";
      }
    }
    return str;
  };

  Downsha.Clip.prototype.isNodeVisible = function(node) {
    var s = window.getComputedStyle(node);
    var sDisplay = s.getPropertyValue("display");
    var sVisibility = s.getPropertyValue("visibility");
    var sPosition = s.getPropertyValue("position");
    if (sDisplay != "none"
        && !(sVisibility == "hidden" && sPosition == "absolute")) {
      return true;
    }
    return false;
  };

  Downsha.Clip.prototype.serializeConditionalElement = function(node,
      nodeStyle) {
    var impl = Downsha.ElementSerializerFactory.getImplementationFor(node);
    if (typeof impl == 'function') {
      var serializer = new impl(node, nodeStyle);
      return serializer.serialize();
    }
    return null;
  };

  Downsha.Clip.prototype.setStylingStrategy = function(strategy) {
    if (typeof strategy == 'function'
        && Downsha.inherits(strategy, Downsha.ClipStylingStrategy)) {
      this._stylingStrategy = new strategy(this.window);
    } else if (strategy instanceof Downsha.ClipStylingStrategy) {
      this._stylingStrategy = strategy;
    } else if (strategy == null) {
      this._stylingStrategy = null;
    }
  };
  Downsha.Clip.prototype.getStylingStrategy = function() {
    return this._stylingStrategy;
  };

  Downsha.Clip.prototype.toString = function() {
    return "Downsha.Clip[" + this.location + "] ("
        + ((this.content) ? this.content.length : 0) + ") " + this.title;
  };

  // return POSTable length of this Downsha.Clip
  Downsha.Clip.prototype.getLength = function() {
    var total = 0;
    var o = this.toDataObject();
    for ( var i in o) {
      total += ("" + o[i]).length + i.length + 2;
    }
    total -= 1;
    return total;
  };

  Downsha.Clip.prototype.toDataObject = function() {
    return {
      "content" : this.content,
      "title" : this.title,
      "url" : this.url,
      "fullPage" : this.fullPage,
      "sizeExceeded" : this.sizeExceeded,
      "notebookGuid" : this.notebookGuid,
      "tagNames" : this.tagNames,
      "comment" : this.comment
    };
  };

  Downsha.Clip.prototype.toLOG = function() {
    return {
      title : this.title,
      url : this.url,
      fullPage : this.fullPage,
      sizeExceeded : this.sizeExceeded,
      contentLength : this.content.length
    };
  };
})();


/** ************** Downsha.ClipStyle *************** */
/**
 * Downsha.ClipStyle is a container for CSS styles. It is able to add and
 * remove CSSStyleRules (and parse CSSRuleList's for rules), as well as
 * CSSStyleDeclaration's and instances of itself.
 * 
 * Downsha.ClipStyle provides a mechanism to serialize itself via toString(),
 * and reports its length via length property. It also provides a method to
 * clone itself and expects to be manipulated via addStyle and removeStyle.
 */
Downsha.ClipStyle = function ClipStyle(css, filter) {
  this.__defineGetter__("styleFilter", this.getFilter);
  this.__defineSetter__("styleFilter", this.setFilter);
  this.initialize(css, filter);
};
Downsha.ClipStyle.stylePrefix = function(style) {
  if (typeof style == 'string') {
    var i = 0;
    if ((i = style.indexOf("-")) > 0) {
      return style.substring(0, i);
    }
  }
  return style;
};
Downsha.ClipStyle.findFontFaceRules = function(doc) {
  var d = doc || document;
  var sheets = d.styleSheets;
  var fontFaceRules = [];
  for ( var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    if (sheet.cssRules) {
      for ( var r = 0; r < sheet.cssRules.length; r++) {
        var rule = sheet.cssRules[r];
        if (rule instanceof CSSFontFaceRule) {
          fontFaceRules.push(rule);
        }
      }
    }
  }
  return fontFaceRules;
};
Downsha.ClipStyle.PERIMETERS = [ "top", "right", "bottom", "left" ];
Downsha.ClipStyle.PERIMETER_PROPS = {
  "margin" : null,
  "padding" : null
};
Downsha.ClipStyle.PERIMETER_EXTRA_PROPS = {
  "border" : [ "width", "style", "color" ],
  "border-top" : [ "width", "style", "color" ],
  "border-right" : [ "width", "style", "color" ],
  "border-bottom" : [ "width", "style", "color" ],
  "border-left" : [ "width", "style", "color" ],
  "outline" : [ "width", "style", "color" ]
};
Downsha.ClipStyle.prototype.length = 0;
Downsha.ClipStyle.prototype._filter = null;
Downsha.ClipStyle.prototype.initialize = function(css, filter) {
  this.styleFilter = filter;
  if (css instanceof CSSRuleList || css instanceof Array) {
    if (css.length > 0) {
      for ( var i = 0; i < css.length; i++) {
        this.addStyle(css[i].style);
      }
    }
  } else if (css instanceof CSSStyleRule) {
    this.addStyle(css.style);
  } else if (css instanceof CSSStyleDeclaration) {
    this.addStyle(css);
  } else if (typeof css == 'object' && css != null) {
    this.addStyle(css);
  }
};
Downsha.ClipStyle.prototype._addPerimeterStyle = function(prop, val) {
  var valParts = val.replace(/\s+/, " ").split(" ");
  if (valParts.length == 1) {
    valParts = valParts.concat(valParts, valParts, valParts);
  } else if (valParts.length == 2) {
    valParts = valParts.concat(valParts[0], valParts[1]);
  } else if (valParts.length == 3) {
    valParts = valParts.concat(valParts[1]);
  } else if (valParts.length == 0) {
    valParts = [ "auto", "auto", "auto", "auto" ];
  }
  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
    var p = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
    this._addSimpleStyle(p, valParts[i]);
  }
};
Downsha.ClipStyle.prototype._addPerimeterExtraStyle = function(prop, val) {
  var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
  if (extras instanceof Array) {
    var valParts = val.replace(/\s+/g, " ").split(" ");
    var re = new RegExp(Downsha.ClipStyle.PERIMETERS.join("|"), "i");
    var perimetered = (prop.match(re)) ? true : false;
    for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
      for ( var e = 0; e < extras.length; e++) {
        var p = prop
            + ((perimetered) ? "" : "-" + Downsha.ClipStyle.PERIMETERS[i])
            + "-" + extras[e];
        if (valParts[e]) {
          this._addSimpleStyle(p, valParts[e]);
        }
      }
      if (perimetered) {
        break;
      }
    }
  }
};
Downsha.ClipStyle.prototype._addSimpleStyle = function(prop, val) {
  if (typeof this[prop] == 'undefined') {
    this.length++;
  }
  this[prop] = val;
};
Downsha.ClipStyle.prototype.addStyle = function(style) {
  if (style instanceof CSSStyleDeclaration && style.length > 0) {
    for ( var i = 0; i < style.length; i++) {
      var prop = style[i];
      if (this.styleFilter
          && !this.styleFilter(prop, style.getPropertyValue(prop))) {
        continue;
      }
      var val = style.getPropertyValue(prop);
      if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
        this._addPerimeterStyle(prop, val);
      } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
        this._addPerimeterExtraStyle(prop, val);
      } else {
        this._addSimpleStyle(prop, val);
      }
    }
  } else if (style instanceof Downsha.ClipStyle) {
    for ( var prop in style) {
      if (typeof this.constructor.prototype[prop] == 'undefined') {
        if (this.styleFilter && !this.styleFilter(prop, style[prop])) {
          continue;
        }
        var val = style[prop];
        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
          this._addPerimeterStyle(prop, val);
        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
          this._addPerimeterExtraStyle(prop, val);
        } else {
          this._addSimpleStyle(prop, val);
        }
      }
    }
  } else if (typeof style == 'object' && style != null) {
    for ( var prop in style) {
      if (this.styleFilter && !this.styleFilter(prop, style[prop])) {
        continue;
      }
      if (typeof style[prop] != 'function'
          && typeof this.constructor.prototype[prop] == 'undefined') {
        var val = style[prop];
        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
          this._addPerimeterStyle(prop, val);
        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
          this._addPerimeterExtraStyle(prop, val);
        } else {
          this._addSimpleStyle(prop, val);
        }
      }
    }
  }
};
Downsha.ClipStyle.prototype.removeStyle = function(style, fn) {
  var self = this;
  function rem(prop, value) {
    if (typeof self[prop] != 'undefined'
        && typeof self.constructor.prototype[prop] == 'undefined'
        && (typeof fn == 'function' || self[prop] == value)) {
      if (typeof fn != 'function'
          || (typeof fn == 'function' && fn(prop, self[prop], value))) {
        if (delete (self[prop]))
          self.length--;
      }
    }
  }
  if (style instanceof CSSStyleDeclaration && style.length > 0) {
    for ( var i = 0; i < style.length; i++) {
      var prop = style[i];
      rem(prop, style.getPropertyValue(prop));
    }
  } else if (style instanceof Downsha.ClipStyle && style.length > 0) {
    for ( var prop in style) {
      rem(prop, style[prop]);
    }
  } else if (style instanceof Array) {
    for ( var i = 0; i < style.length; i++) {
      rem(style[i], this[style[i]]);
    }
  } else if (typeof style == 'string') {
    rem(style, this[style]);
  }
};
Downsha.ClipStyle.prototype.removeStyleIgnoreValue = function(style) {
  this.removeStyle(style, function(prop, propValue, value) {
    return true;
  });
};
Downsha.ClipStyle.styleInArray = function(style, styleArray) {
  if (typeof style != 'string' || !(styleArray instanceof Array))
    return false;
  var i = -1;
  var style = style.toLowerCase();
  var styleType = ((i = style.indexOf("-")) > 0) ? style.substring(0, i)
      .toLowerCase() : style.toLowerCase();
  for ( var i = 0; i < styleArray.length; i++) {
    if (styleArray[i] == style || styleArray[i] == styleType)
      return true;
  }
  return false;
};
/**
 * Derives to smaller set of style attributes by comparing differences with
 * given style and makes sure that style attributes in matchSyle are preserved.
 * This is useful for removing style attributes that are present in the parent
 * node. In that case, the instance will contain combined style attributes, and
 * the first argument to this function will be combined style attributes of the
 * parent node. The second argument will contain matched style attributes. The
 * result will contain only attributes that are free of duplicates while
 * preserving uniqueness of the style represented by this instance.
 */
Downsha.ClipStyle.prototype.deriveStyle = function(style, matchStyle,
    keepArray) {
  this.removeStyle(style, function(prop, propValue, value) {
    if (keepArray instanceof Array
        && Downsha.ClipStyle.styleInArray(prop, keepArray))
      return false;
    return (typeof matchStyle[prop] == 'undefined' && propValue == value);
  });
};
Downsha.ClipStyle.prototype.setFilter = function(filter) {
  if (typeof filter == 'function') {
    this._filter = filter;
  } else if (filter == null) {
    this._filter = null;
  }
};
Downsha.ClipStyle.prototype.getFilter = function() {
  return this._filter;
};
Downsha.ClipStyle.prototype.mergeStyle = function(style, override) {
  if (style instanceof Downsha.ClipStyle && style.length > 0) {
    var undef = true;
    for ( var i in style) {
      if (typeof this.constructor.prototype[i] != 'undefined'
          || typeof this.__lookupSetter__(i) != 'undefined') {
        continue;
      }
      if ((undef = (typeof this[i] == 'undefined')) || override) {
        this[i] = style[i];
        if (undef) {
          this.length++;
        }
      }
    }
  }
};
Downsha.ClipStyle.prototype.clone = function() {
  var clone = new Downsha.ClipStyle();
  for ( var prop in this) {
    if (typeof this.constructor.prototype[prop] == 'undefined') {
      clone[prop] = this[prop];
    }
  }
  clone.length = this.length;
  return clone;
};
Downsha.ClipStyle.prototype.toString_background = function(skipObj) {
  var str = "";
  if (typeof this["background-color"] != 'undefined'
      && this["background-color"] != "rgba(0, 0, 0, 0)") {
    str += "background: " + this["background-color"];
  }
  if (typeof this["background-image"] != 'undefined') {
    if (this["background-image"] != "none") {
      str += " " + this["background-image"];
      if (typeof this["background-position"] != 'undefined') {
        str += " " + this["background-position"];
      }
      if (typeof this["background-repeat"] != 'undefined') {
        str += " " + this["background-repeat"];
      }
    }
  }
  if (skipObj) {
    skipObj["background-color"] = null;
    skipObj["background-image"] = null;
    skipObj["background-position"] = null;
    skipObj["background-repeat"] = null;
  }
  if (str.length == 0) {
    str += "background:none;";
  } else if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_outline = function(skipObj) {
  var str = this._toPerimeterExtraString("outline");
  if (skipObj) {
    skipObj["outline-style"] = null;
    skipObj["outline-width"] = null;
    skipObj["outline-color"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  } else if (str.length == 0) {
    str = "outline:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_margin = function(skipObj) {
  var str = this._toPerimeterString("margin");
  if (skipObj) {
    skipObj["margin-top"] = null;
    skipObj["margin-right"] = null;
    skipObj["margin-bottom"] = null;
    skipObj["margin-left"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  } else if (str.length == 0) {
    str = "margin:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_padding = function(skipObj) {
  var str = this._toPerimeterString("padding");
  if (skipObj) {
    skipObj["padding-top"] = null;
    skipObj["padding-right"] = null;
    skipObj["padding-bottom"] = null;
    skipObj["padding-left"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  } else if (str.length == 0) {
    str = "padding:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_border = function(skipObj) {
  var str = this._toPerimeterExtraString("border");
  if (skipObj) {
    skipObj["border-top-width"] = null;
    skipObj["border-top-style"] = null;
    skipObj["border-top-color"] = null;
    skipObj["border-right-width"] = null;
    skipObj["border-right-style"] = null;
    skipObj["border-right-color"] = null;
    skipObj["border-bottom-width"] = null;
    skipObj["border-bottom-style"] = null;
    skipObj["border-bottom-color"] = null;
    skipObj["border-left-width"] = null;
    skipObj["border-left-style"] = null;
    skipObj["border-left-color"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  }
  if (str.length == 0 || str.indexOf("none") >= 0) {
    str = "border:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString = function(shorten) {
  var str = "";
  var skip = {};
  if (shorten) {
    str += this.toString_background(skip);
    str += this.toString_border(skip);
    str += this.toString_margin(skip);
    str += this.toString_outline(skip);
    str += this.toString_padding(skip);
  } else {
    if (this["background-image"]) {
      str += "background-image:" + this["background-image"] + ";";
      skip["background-image"] = true;
    }
    var _rx = (this["background-repeat-x"]) ? this["background-repeat-x"]
        : "initial";
    var _ry = (this["background-repeat-y"]) ? this["background-repeat-y"]
        : "initial";
    str += "background-repeat: " + _rx + " " + _ry + ";";
    skip["background-repeat-x"] = true;
    skip["background-repeat-y"] = true;
    skip["background-repeat"] = true;
  }
  if (this.length > 0) {
    for ( var i in this) {
      if (typeof this[i] != 'string'
          || typeof this.constructor.prototype[i] != 'undefined'
          || this[i].length == 0 || typeof skip[i] != 'undefined') {
        continue;
      }
      str += i + ":" + this[i] + ";";
    }
  }
  return str;
};
Downsha.ClipStyle.prototype._toPerimeterString = function(prop) {
  var valParts = [];
  var allEqual = true;
  var missing = false;
  var str = "";
  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
    valParts[i] = this[prop + "-" + Downsha.ClipStyle.PERIMETERS[i]];
    if (valParts[i]) {
      str += prop + "-" + Downsha.ClipStyle.PERIMETERS[i] + ":" + valParts[i]
          + ";";
    } else {
      missing = true;
    }
    if (i > 0 && allEqual && valParts[i] != valParts[i - 1]) {
      allEqual = false;
    }
  }
  if (missing) {
    return str;
  } else if (allEqual) {
    valParts = [ valParts[0] ];
  } else if (valParts[0] == valParts[2] && valParts[1] == valParts[3]) {
    valParts = [ valParts[0], valParts[1] ];
  }
  return prop + ":" + valParts.join(" ") + ";";
};
Downsha.ClipStyle.prototype._toPerimeterExtraString = function(prop) {
  var perimParts = [];
  var allEqual = true;
  var str = "";
  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
    var pPrefix = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
    var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[pPrefix]
        || Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
    if (extras instanceof Array) {
      var part = "";
      var partStr = "";
      var missing = false;
      for ( var e = 0; e < extras.length; e++) {
        var fullProp = pPrefix + "-" + extras[e];
        if (this[fullProp]) {
          part += this[fullProp] + ((e == extras.length - 1) ? "" : " ");
          partStr += fullProp + ":" + this[fullProp] + ";";
        } else {
          missing = true;
          allEqual = false;
        }
      }
      if (!missing) {
        perimParts[i] = part;
        str += pPrefix + ":" + part + ";";
      } else {
        str += partStr;
      }
    }
    if (i > 0 && allEqual
        && (!perimParts[i] || perimParts[i] != perimParts[i - 1])) {
      allEqual = false;
    }
  }
  if (allEqual) {
    return prop + ":" + perimParts[0] + ";";
  } else {
    return str;
  }
};
Downsha.ClipStyle.prototype.toJSON = function() {
  var obj = {};
  if (this.length > 0) {
    for ( var i in this) {
      if (typeof this[i] != 'string'
          || typeof this.constructor.prototype[i] != 'undefined'
          || this[i].length == 0)
        continue;
      obj[i] = this[i];
    }
  }
  return obj;
};

/** ************** Downsha.SelectionFinder *************** */
/**
 * Downsha.SelectionFinder provides mechanism for finding selection on the page
 * via find(). It is able to traverse frames in order to find a selection. It
 * will report whether there's a selection via hasSelection(). After doing
 * find(), the selection is stored in the selection property, and the document
 * property will contain the document in which the selection was found. Find
 * method will only recurse documents if it was invoked as find(true),
 * specifying to do recursive search. You can use reset() to undo find().
 */
(function() {
  var LOG = null;
  var logEnabled = false;

  Downsha.SelectionFinder = function SelectionFinder(document) {
    this.initDocument = document;
    this.document = document;
    LOG = Downsha.Logger.getInstance();
    if (LOG.level == Downsha.Logger.LOG_LEVEL_DEBUG) {
      logEnabled = true;
    }
  };
  Downsha.SelectionFinder.prototype.initDocument = null;
  Downsha.SelectionFinder.prototype.document = null;
  Downsha.SelectionFinder.prototype.selection = null;

  Downsha.SelectionFinder.prototype.findNestedDocuments = function(doc) {
    var documents = new Array();
    var frames = doc.getElementsByTagName("frame");
    if (frames.length > 0) {
      for ( var i = 0; i < frames.length; i++) {
        documents.push(frames[i].contentDocument);
      }
    }
    var iframes = doc.getElementsByTagName("iframe");
    try {
      if (iframes.length > 0) {
        for ( var i = 0; i < iframes.length; i++) {
          var doc = iframes[i].contentDocument;
          if (doc) {
            documents.push(doc);
          }
        }
      }
    } catch (e) {
    }
    return documents;
  };
  Downsha.SelectionFinder.prototype.reset = function() {
    this.document = this.initDocument;
    this.selection = null;
  };
  Downsha.SelectionFinder.prototype.hasSelection = function() {
    var range = this.getRange();
    if (range
        && (range.startContainer != range.endContainer || (range.startContainer == range.endContainer && range.startOffset != range.endOffset))) {
      return true;
    }
    return false;
  };
  Downsha.SelectionFinder.prototype.find = function(deep) {
    var sel = this._findSelectionInDocument(this.document, deep);
    this.document = sel.document;
    this.selection = sel.selection;
  };
  Downsha.SelectionFinder.prototype.getRange = function() {
    if (!this.selection || this.selection.rangeCount == 0) {
      return null;
    }
    if (typeof this.selection.getRangeAt == 'function') {
      return this.selection.getRangeAt(0);
    } else {
      var range = this.document.createRange();
      range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
      range.setEnd(this.selection.focusNode, this.selection.focusOffset);
      return range;
    }
    return null;
  };
  Downsha.SelectionFinder.prototype.getCommonAncestorContainer = function() {
    var range = this.getRange();
    if (range && range.commonAncestorContainer) {
      var p = range.commonAncestorContainer;
      while (p && p.nodeType != Node.ELEMENT_NODE) {
        p = p.parentElement;
      }
      return p;
    }
    return null;
  };
  Downsha.SelectionFinder.prototype._findSelectionInDocument = function(doc,
      deep) {
    var sel = null;
    if (typeof doc.getSelection == 'function') {
      sel = doc.getSelection();
    } else if (doc.selection && typeof doc.selection.createRange == 'function') {
      sel = doc.selection.createRange();
    }
    if (sel && sel.rangeCount == 0 && deep) {
      if (logEnabled)
        LOG.debug("Empty range, trying frames");
      var nestedDocs = this.findNestedDocuments(doc);
      if (logEnabled)
        LOG.debug("# of nested docs: " + nestedDocs.length);
      if (nestedDocs.length > 0) {
        for ( var i = 0; i < nestedDocs.length; i++) {
          if (nestedDocs[i]) {
            if (logEnabled)
              LOG.debug("Trying nested doc: " + nestedDocs[i]);
            var framedSel = this._findSelectionInDocument(nestedDocs[i], deep);
            if (framedSel.selection.rangeCount > 0) {
              return framedSel;
            }
          }
        }
      }
    }
    return {
      document : doc,
      selection : sel
    };
  };
})();

Downsha.ClipStylingStrategy = function ClipStylingStrategy(window) {
  this.initialize(window);
};
Downsha.ClipStylingStrategy.DEFAULT_FILTER = function(prop, val) {
  return (val && prop != "orphans" && prop != "widows" && prop != "speak"
      && prop.indexOf("page-break") != 0 && prop.indexOf("pointer-events") != 0);
};
Downsha.ClipStylingStrategy.prototype.initialize = function(window) {
  this.window = window;
};
Downsha.ClipStylingStrategy.prototype.styleForNode = function(node, root,
    fullPage) {
  return null;
};
Downsha.ClipStylingStrategy.prototype.getNodeView = function(node) {
  var doc = node.ownerDocument;
  var view = (doc.defaultView) ? doc.defaultView : this.window;
  return view;
};
Downsha.ClipStylingStrategy.prototype.getNodeStyle = function(node, computed,
    filter) {
  var thisFilter = (typeof filter == 'function') ? filter
      : Downsha.ClipStylingStrategy.DEFAULT_FILTER;
  if (node && typeof node.nodeType == 'number' && node.nodeType == 1) {
    var view = this.getNodeView(node);
    var matchedRulesDefined = (typeof view["getMatchedCSSRules"] == 'function') ? true
        : false;
    if (computed) {
      return style = new Downsha.ClipStyle(view.getComputedStyle(node, ''),
          thisFilter);
    } else if (matchedRulesDefined) {
      return style = new Downsha.ClipStyle(view.getMatchedCSSRules(node, ''),
          thisFilter);
    }
  }
  var s = new Downsha.ClipStyle();
  s.setFilter(thisFilter);
  return s;
};
Downsha.ClipStylingStrategy.prototype.getFontFaceRules = function() {
  return Downsha.ClipStyle.findFontFaceRules();
};
Downsha.ClipStylingStrategy.prototype.cleanUp = function() {
  return true;
};
Downsha.ClipStylingStrategy.prototype.styleForFloatClearingNode = function(node) {
	return null;
}


Downsha.ClipTextStylingStrategy = function ClipTextStylingStrategy(window) {
    this.initialize(window);
};
Downsha.inherit(Downsha.ClipTextStylingStrategy, Downsha.ClipStylingStrategy);
Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES = {
    "b": null,
    "big": null,
    "em": null,
    "i": null,
    "small": null,
    "strong": null,
    "sub": null,
    "sup": null,
    "ins": null,
    "del": null,
    "s": null,
    "strike": null,
    "u": null,
    "code": null,
    "kbd": null,
    "samp": null,
    "tt": null,
    "var": null,
    "pre": null,
    "listing": null,
    "plaintext": null,
    "xmp": null,
    "abbr": null,
    "acronym": null,
    "address": null,
    "bdo": null,
    "blockquote": null,
    "q": null,
    "cite": null,
    "dfn": null
};
Downsha.ClipTextStylingStrategy.STYLE_ATTRS = {
    "font": null,
    "text": null,
    "color": null
};
Downsha.ClipTextStylingStrategy.COLOR_THRESH = 50;
Downsha.ClipTextStylingStrategy.prototype.isFormatNode = function(node) {
    return (node && node.nodeType == 1 && typeof Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES[node.nodeName
    .toLowerCase()] != 'undefined');
};
Downsha.ClipTextStylingStrategy.prototype.hasTextNodes = function(node) {
    if (node && node.nodeType == 1 && node.childNodes.length > 0) {
        for (var i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].nodeType == 3) {
                return true;
            }
        }
    }
    return false;
};
Downsha.ClipTextStylingStrategy.prototype.styleFilter = function(style) {
    var s = Downsha.ClipStyle.stylePrefix(style.toLowerCase());
    if (typeof Downsha.ClipTextStylingStrategy.STYLE_ATTRS[s] != 'undefined') {
        return true;
    }
};
Downsha.ClipTextStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
    var nodeStyle = null;
    if (this.isFormatNode(node) || this.hasTextNodes(node)) {
        nodeStyle = this.getNodeStyle(node, true, this.styleFilter);
    }
    if (nodeStyle && nodeStyle["color"]){
      var color = nodeStyle["color"];
      var a = "";
      var colorParts = color.replace(/[^0-9,\s]+/g, "").replace(/[,\s]+/g, " ").split(/\s+/);
      var r = parseInt(colorParts[0]);
      r = (isNaN(r)) ? 0 : r;
      var g = parseInt(colorParts[1]);
      g = (isNaN(g)) ? 0 : r;
      var b = parseInt(colorParts[2]);
      b = (isNaN(b)) ? 0 : b;
      if ((r + g + b) > (255 - Downsha.ClipTextStylingStrategy.COLOR_THRESH)*3) {
        r = Math.max(0, r - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
        g = Math.max(0, g - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
        b = Math.max(0, b - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
      }
      nodeStyle["color"] = (colorParts.length == 4) ? "rgba("+[r, g, b, 1].join(", ")+")" : "rgb("+[r, g, b].join(", ")+")";
    }
    // preserve direction
    if (nodeStyle && !nodeStyle["direction"]) {
        var computedStyle = this.getNodeStyle(node, true);
        if (computedStyle && computedStyle["direction"] && computedStyle["direction"] != "ltr") {
            nodeStyle._addSimpleStyle("direction", computedStyle["direction"]);
        }
    }
    return nodeStyle;
};

(function() {
  var LOG = null;
  Downsha.ClipFullStylingStrategy = function ClipFullStylingStrategy(window) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(window);
  };
  Downsha.inherit(Downsha.ClipFullStylingStrategy,
      Downsha.ClipStylingStrategy);
  Downsha.ClipFullStylingStrategy.SKIP_UNDEFINED_PROPS = {
    "widows" : null,
    "orphans" : null,
    "pointer-events" : null,
    "speak" : null
  };
  Downsha.ClipFullStylingStrategy.SKIP_NONINHERENT_AUTO_PROPS = {
    "left" : "auto",
    "right" : "auto",
    "float" : "auto",
    "clear" : "auto",
    "image-rendering" : "auto",
    "z-index" : "auto",
    "color-rendering" : "auto",
    "shapre-rendering" : "auto",
    "page-break-before" : "auto",
    "page-break-after" : "auto",
    "page-break-inside" : "auto"
  };
  Downsha.ClipFullStylingStrategy.LIST_NODES = {
    "UL" : null,
    "OL" : null,
    "LI" : null
  };
  Downsha.ClipFullStylingStrategy.NODE_PROPS = {
    "BR" : [ "clear", "padding", "margin", "line-height", "border",
        "white-space" ]
  };
  Downsha.ClipFullStylingStrategy.TEXT_NODES = {
    "A" : null,
    "B" : null,
    "BIG" : null,
    "EM" : null,
    "I" : null,
    "SMALL" : null,
    "STRONG" : null,
    "SUB" : null,
    "SUP" : null,
    "INS" : null,
    "DEL" : null,
    "S" : null,
    "STRIKE" : null,
    "U" : null,
    "CODE" : null,
    "KBD" : null,
    "SAMP" : null,
    "TT" : null,
    "VAR" : null,
    "PRE" : null,
    "LISTING" : null,
    "PLAINTEXT" : null,
    "XMP" : null,
    "ABBR" : null,
    "ACRONYM" : null,
    "ADDRESS" : null,
    "BDO" : null,
    "BLOCKQUOTE" : null,
    "Q" : null,
    "CITE" : null,
    "DFN" : null
  };
  Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node,
      root, fullPage) {
    var matchedStyle = this.getNodeStyle(node, false);
    var origHeight = matchedStyle["height"];
    var computedStyle = this.getNodeStyle(node, true);
    var inlineStyle = node.style;
    var isRoot = (node == root) ? true : false;
    // special handling of root element
    if (isRoot) {
      // LOG.debug("Handling extra styles for root element: ");
      // LOG.debug(node);
      // remove unnecessary margin from root element
      if (computedStyle["font-size"]) {
        matchedStyle._addSimpleStyle("font-size", computedStyle["font-size"]);
      }
      if (computedStyle["font-family"]) {
        matchedStyle._addSimpleStyle("font-family",
            computedStyle["font-family"]);
      }
      matchedStyle._addSimpleStyle("margin", "0px");
      if (matchedStyle["position"]) {
        matchedStyle["position"] = "relative";
      } else {
        matchedStyle._addSimpleStyle("position", "relative");
      }
      if (!fullPage) {
        // deduce background properties on root element if not fullPage
        var bgStyle = this._inhBackgroundForNode(node, true);
        if (bgStyle.length > 0) {
          matchedStyle.mergeStyle(bgStyle, false);
        }
        // deduce font properties on root element if not fullPage
        var fontStyle = this._inhFontForNode(node, true);
        if (fontStyle.length > 0) {
          matchedStyle.mergeStyle(fontStyle, false);
        }
        // fix width on root element with background-image if not fullPage
        if (node.nodeName != "HTML" && node.nodeName != "BODY"
            && bgStyle["background-image"]) {
          LOG
              .debug("Setting fixed width because it's not a top-level tag and has background-image");
          if (computedStyle["width"] && computedStyle["width"] != "0px") {
            matchedStyle._addSimpleStyle("width", computedStyle["width"]);
          }
          if (origHeight && computedStyle["height"] && computedStyle["height"] != "0px") {
            matchedStyle._addSimpleStyle("height", computedStyle["height"]);
          }
        }
        // remove floating on root element if not fullPage
        if (matchedStyle["float"]) {
          matchedStyle.removeStyle("float");
        }
      }
    }
    // for elements that contain nothing but text nodes, ensure preservation of
    // computed font-size if not fullPage
    if (!fullPage && node.childElementCount != node.childNodes.length) {
      var _textNodeFound = false;
      for ( var _c = 0; _c < node.childNodes.length; _c++) {
        if (node.childNodes[_c].nodeType == Node.TEXT_NODE) {
          _textNodeFound = true;
          break;
        }
      }
      if (_textNodeFound) {
        if (computedStyle["font-size"]) {
          LOG.debug("Adding font-size to text node without font-size spec");
          matchedStyle._addSimpleStyle("font-size", computedStyle["font-size"]);
        }
      }
    }
    // because canvas elements do not preserve their drawn state, we preserve it
    // via background-image property
    if (node.nodeName == "CANVAS" && typeof node.toDataURL == 'function') {
      // matchedStyle["background-image"] = "url(" + node.toDataURL() + ")";
      matchedStyle._addSimpleStyle("background-image", "url("
          + node.toDataURL() + ")");
    } else if (node.nodeName == "OBJECT" || node.nodeName == "EMBED") {
      matchedStyle._addSimpleStyle("width", computedStyle["width"]);
      matchedStyle._addSimpleStyle("min-width", computedStyle["width"]);
      matchedStyle._addSimpleStyle("max-width", computedStyle["width"]);
      matchedStyle._addSimpleStyle("height", computedStyle["height"]);
      matchedStyle._addSimpleStyle("min-height", computedStyle["height"]);
      matchedStyle._addSimpleStyle("max-height", computedStyle["height"]);
      matchedStyle._addSimpleStyle("display", computedStyle["display"]);
      matchedStyle._addSimpleStyle("overflow", computedStyle["hidden"]);
    }
    // adjust absolute positioning on root and its immediate children when not
    // fullPage
    if (!fullPage && (isRoot || node.parentElement == root)) {
      if (matchedStyle["position"] == "absolute") {
        var rect = node.getBoundingClientRect();
        var ml = parseInt(computedStyle["margin-left"]);
        var mt = parseInt(computedStyle["margin-top"]);
        var xDelta = rect.left - ((isNaN(ml)) ? 0 : ml);
        var yDelta = rect.top - ((isNaN(mt)) ? 0 : mt);
        if (typeof root._downsha_absolute_xOffset == 'number'
            && typeof root._downsha_absolute_yOffset == 'number') {
          var xDelta = Math.max(0, xDelta - root._downsha_absolute_xOffset);
          var yDelta = Math.max(0, yDelta - root._downsha_absolute_yOffset);
          matchedStyle._addSimpleStyle("left", xDelta + "px");
          matchedStyle._addSimpleStyle("top", yDelta + "px");
        } else {
          root._downsha_absolute_xOffset = xDelta;
          root._downsha_absolute_yOffset = yDelta;
          matchedStyle._addSimpleStyle("top", "0px");
          matchedStyle._addSimpleStyle("left", "0px");
        }
        matchedStyle.removeStyle("right");
        matchedStyle.removeStyle("bottom");
      }
    }
    // preserve height in pixels when there are non-text child elements or
    // nothing
    // at all
    /*
     * pasha: temporarily disabled in favor of height attr on every element if
     * (this._hasTextOnlyChildren(node) && computedStyle["height"]) {
     * matchedStyle._addSimpleStyle("height", computedStyle["height"]); }
     */
    // add inline style attributes
    for ( var i = 0; i < inlineStyle.length; i++) {
      matchedStyle._addSimpleStyle(inlineStyle[i], inlineStyle
          .getPropertyValue(inlineStyle[i]));
    }
    if (origHeight && matchedStyle["height"] && computedStyle["height"]) {
      // matchedStyle._addSimpleStyle("height", computedStyle["height"]);
      matchedStyle["height"] = computedStyle["height"];
    }
    // preserve direction
    if (!matchedStyle["direction"] && computedStyle["direction"] && computedStyle["direction"] != "ltr") {
        matchedStyle._addSimpleStyle("direction", computedStyle["direction"]);
    }
    return matchedStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._hasTextOnlyChildren = function(
      node) {
    if (node) {
      if (node.childElementCount == 0) {
        return true;
      } else {
        var totalChildren = node.childElementCount;
        for ( var i = 0; i < totalChildren; i++) {
          if (typeof this.constructor.TEXT_NODES[node.children[i]] == 'undefined') {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  };
  Downsha.ClipFullStylingStrategy.prototype._mergeBoundingRects = function(a,
      b) {
    a.left = Math.min(a.left, b.left);
    a.right = Math.max(a.right, b.right);
    a.top = Math.min(a.top, b.top);
    a.bottom = Math.max(a.bottom, b.bottom);
    a.width = a.right - a.left;
    a.height = a.bottom - a.top;
  };
  Downsha.ClipFullStylingStrategy.prototype._inhBackgroundForNode = function(
      node, recur) {
    LOG.debug("ClipFullStylingStrategy._inhBackgroundForNode");
    var parent = node.parentNode;
    var styles = [];
    var nodes = [];
    var bgExtraAttrs = [ "background-repeat-x", "background-repeat-y",
        "background-position-x", "background-position-y", "background-origin",
        "background-size" ];
    // walk up the DOM and grab parnet elements that contain background
    // specifics
    var topElement = (this.window.document.body.parentElement) ? this.window.document.body.parentElement
        : this.window.document.body;
    while (parent) {
      LOG.debug(parent);
      nodes.push(parent);
      styles.push(this.getNodeStyle(parent, true, function(p, v) {
        if ((p == "background-color")
            || (p == "background-image" && v != "none")
            || (bgExtraAttrs.indexOf(p) >= 0) || p == "opacity"
            || p == "filter") {
          return true;
        }
        return false;
      }));
      if (!recur || parent == topElement) {
        break;
      } else {
        parent = parent.parentElement;
      }
    }
    LOG.debug("Retracted " + styles.length + " styles");
    // walk thru all the collected styles (same order as traversing up the tree)
    // and gather background specifics
    var bgStyle = new Downsha.ClipStyle();
    var _bgColorSet = 0;
    for ( var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var n = nodes[i];
      LOG.dir(s);
      // set background-color - it's the most important one...
      if (s["background-color"]
          && s["background-color"] != "transparent"
          && !s["background-color"]
              .match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/)
          && !bgStyle["background-color"]) {
        LOG.debug("Setting background-color: " + s["background-color"]);
        _bgColorSet = i;
        bgStyle._addSimpleStyle("background-color", s["background-color"]);
      }
      // set background image only if it hasn't been set already and the bg
      // color
      // wasn't set previously; also determine repetition and positioning
      if (s["background-image"] && !bgStyle["background-image"]
          && (i == _bgColorSet || !bgStyle["background-color"])) {
        LOG.debug("Adding background-image: " + s["background-image"]);
        bgStyle._addSimpleStyle("background-image", s["background-image"]);
        for ( var x = 0; x < bgExtraAttrs.length; x++) {
          var bgAttr = bgExtraAttrs[x];
          if (s[bgAttr] && bgAttr.indexOf("background-repeat") < 0) {
            LOG.debug("Adding " + bgAttr);
            bgStyle._addSimpleStyle(bgAttr, s[bgAttr]);
          }
        }
        var _rx = (s["background-repeat-x"] && s["background-repeat-x"] != "initial") ? s["background-repeat-x"]
            : "no-repeat";
        var _ry = (s["background-repeat-y"] && s["background-repeat=y"] != "initial") ? s["background-repeat-y"]
            : "no-repeat";
        // bgStyle._addSimpleStyle("background-repeat", _rx + " " + _ry);
        bgStyle._addSimpleStyle("background-repeat-x", _rx);
        bgStyle._addSimpleStyle("background-repeat-y", _rx);
        bgStyle._addSimpleStyle("background-repeat", _rx + " " + _ry);
        if (n) {
          LOG.debug("Dettermining background image offset");
          var bgNodeStyle = s;
          var bgNodeRect = n.getBoundingClientRect();
          LOG.debug("bgNodeRect left: " + bgNodeRect.left + "; top: "
              + bgNodeRect.top);
          var nodeRect = node.getBoundingClientRect();
          LOG.debug("nodeRect left: " + nodeRect.left + "; top: "
              + nodeRect.top);
          var yDelta = nodeRect.top - bgNodeRect.top;
          var xDelta = nodeRect.left - bgNodeRect.left;
          LOG.debug("xDelta: " + xDelta + "; yDelta: " + yDelta);
          var view = this.getNodeView(n);
          var bgNodeComputedStyle = view.getComputedStyle(n);
          var bgNodeBgPosX = bgNodeComputedStyle
              .getPropertyValue("background-position-x");
          var bgNodeBgPosY = bgNodeComputedStyle
              .getPropertyValue("background-position-y");
          LOG.debug("bg position: " + bgNodeBgPosX + " " + bgNodeBgPosY);
          var origPosX = 0;
          var origPosY = 0;
          if (bgNodeBgPosX.indexOf("%") > 0) {
            origPosX = bgNodeRect.width * (parseInt(bgNodeBgPosX) / 100);
          } else {
            origPosX = parseInt(bgNodeBgPosX);
          }
          if (bgNodeBgPosY.indexOf("%") > 0) {
            origPosY = bgNodeRect.height * (parseInt(bgNodeBgPosY) / 100);
          } else {
            origPosY = parseInt(bgNodeBgPosY);
          }
          if (isNaN(origPosX)) {
            origPosX = 0;
          }
          if (isNaN(origPosY)) {
            origPosY = 0;
          }
          LOG.debug("origPosX: " + origPosX + "; origPosY: " + origPosY);
          var xOffset = 0 - xDelta + origPosX;
          var yOffset = 0 - yDelta + origPosY;
          LOG.debug("xOffset: " + xOffset + "; yOffset: " + yOffset);
          bgStyle._addSimpleStyle("background-position", xOffset + "px "
              + yOffset + "px");
        }
      }
      if (s["opacity"]
          && !bgStyle["opacity"]
          && !isNaN(parseFloat(s["opacity"]))
          && (typeof bgStyle["opacity"] == 'undefined' || parseFloat(s["opacity"]) < parseFloat(bgStyle["opacity"]))) {
        bgStyle._addSimpleStyle("opacity", s["opacity"]);
      }
      if (s["filter"]
          && !bgStyle["filter"]
          && (typeof bgStyle["filter"] == 'undefined' || parseFloat(s["filter"]
              .replace(/[^0-9]+/g, "")) < parseFloat(bgStyle["filter"].replace(
              /[^0-9]+/g, "")))) {
        bgStyle._addSimpleStyle("filter", s["filter"]);
      }
    }
    return bgStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._inhFontForNode = function(node,
      recur) {
    var parent = node.parentNode;
    var styles = [];
    var nodes = [];
    var attrs = [ "font-family", "color", "line-height" ];
    // walk up the DOM and grab parnet elements that contain background
    // specifics
    while (parent) {
      nodes.push(parent);
      styles.push(this.getNodeStyle(parent, true, function(p, v) {
        if (attrs.indexOf(p) >= 0) {
          return true;
        }
        return false;
      }));
      if (!recur || parent == this.window.document.body) {
        break;
      } else {
        parent = parent.parentElement;
      }
    }
    // walk thru all the collected styles (same order as traversing up the tree)
    // and gather background specifics
    var bgStyle = new Downsha.ClipStyle();
    for ( var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var n = nodes[i];
      for ( var a = 0; a < attrs.length; a++) {
        if (!bgStyle[attrs[a]] && s[attrs[a]]) {
          LOG.debug("Adding " + attrs[a] + ": " + s[attrs[a]]);
          bgStyle._addSimpleStyle(attrs[a], s[attrs[a]]);
        }
      }
    }
    return bgStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype.cleanUp = function() {
    if (this._dirty) {
      var els = this.window.document.getElementsByTagName("*");
      for ( var i = 0; i < els.length; i++) {
        delete els[i][this.constructor.COMPUTED_STYLE_KEY];
      }
    }
    return true;
  };
  Downsha.ClipFullStylingStrategy.prototype.styleForFloatClearingNode = function(
      node) {
    if (node) {
      var style = new Downsha.ClipStyle();
      style._addSimpleStyle("clear", "both");
      style._addSimpleStyle("width", "0px");
      style._addSimpleStyle("height", "0px");
      return style;
    }
    return null;
  };
})();


Downsha.ElementSerializerFactory = {
  getImplementationFor : function(node) {
    for ( var i = 0; i < Downsha.ElementSerializerFactory.ClassRegistry.length; i++) {
      if (Downsha.ElementSerializerFactory.ClassRegistry[i]
          .isResponsibleFor(node)) {
        return Downsha.ElementSerializerFactory.ClassRegistry[i];
      }
    }
    return null;
  }
};
Downsha.ElementSerializerFactory.ClassRegistry = [];

Downsha.AbstractElementSerializer = function AbstractElementSerializer(node,
    nodeStyle) {
  this.initialize(node, nodeStyle);
};
Downsha.AbstractElementSerializer.isResponsibleFor = function(navigator) {
  return false;
};
Downsha.AbstractElementSerializer.prototype.node = null;
Downsha.AbstractElementSerializer.prototype.nodeStyle = null;
Downsha.AbstractElementSerializer.prototype.handleInheritance = function(
    child, parent) {
  Downsha.ElementSerializerFactory.ClassRegistry.push(child);
};

Downsha.AbstractElementSerializer.prototype.initialize = function(node,
    nodeStyle) {
  this.node = node;
  this.nodeStyle = nodeStyle;
};
Downsha.AbstractElementSerializer.prototype.serialize = function() {
  return "";
};

(function() {
  var LOG = null;
  /**
   * Serializes DOM element into an img pointing to the thumbnail of the video
   * 
   * Video ids are used for obtaining thumbnails via
   * https://i2.ytimg.com/vi/cAcxHQalWOw/hqdefault.jpg. These ids can be
   * obtained from:
   * 
   * <pre>
   *   - the URL of the document containing EMBED
   *   - iframe's src attribute that embeds the video via an iframe
   *   - src attribute of the embed object (though on actualy youtube.com it's not possible)
   * </pre>
   * 
   * Sample URLs are:
   * 
   * <pre>
   * http: //www.youtube.com/embed/IWJJBwKhvp4?wmode=opaque&amp;rel=0
   * http: //www.youtube.com/v/YZEbBZ2IrXE?version=3&amp;rel=1&amp;fs=1&amp;showsearch=0&amp;showinfo=1&amp;iv_load_policy=1
   * http: //www.youtube.com/v/J3mjFSTsKiM&amp;hl=en&amp;fs=1
   * http://www.youtube.com/watch?v=cAcxHQalWOw
   * </pre>
   */

  Downsha.YoutubeElementSerializer = function YoutubeElementSerializer(node,
      nodeStyle) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(node, nodeStyle);
  };
  Downsha.inherit(Downsha.YoutubeElementSerializer,
      Downsha.AbstractElementSerializer);

  Downsha.YoutubeElementSerializer.WATCH_URL_REGEX = /^https?:\/\/www\.youtube\.com\/watch\?.*v=([^&]+)/i;
  Downsha.YoutubeElementSerializer.EMBED_URL_REGEX = /^https?:\/\/www\.youtube\.com\/embed\/([^\/\?\&]+)/i;
  Downsha.YoutubeElementSerializer.VIDEO_URL_REGEX = /^https?:\/\/www\.youtube\.com\/v\/([^\/\?\&]+)/i;
  Downsha.YoutubeElementSerializer.POSSIBLE_CONTAINER_NODES = [ "OBJECT" ];
  Downsha.YoutubeElementSerializer.VIDEO_NODES = [ "EMBED", "IFRAME" ];
  Downsha.YoutubeElementSerializer.WATCH_URL = "http://www.youtube.com/watch?v=$videoId$";
  Downsha.YoutubeElementSerializer.DEFAULT_THUMB_URL = "https://i2.ytimg.com/vi/$videoId$/default.jpg";
  Downsha.YoutubeElementSerializer.HQ_THUMB_URL = "https://i2.ytimg.com/vi/$videoId$/hqdefault.jpg";
  Downsha.YoutubeElementSerializer.HQ_THUMB_WIDTH = 480;
  Downsha.YoutubeElementSerializer.HQ_THUMB_HEIGHT = 360;
  Downsha.YoutubeElementSerializer.DEFAULT_THUMB_WIDTH = 120;
  Downsha.YoutubeElementSerializer.DEFAULT_THUMB_HEIGHT = 90;
  Downsha.YoutubeElementSerializer.isResponsibleFor = function(node) {
    var videoId = this.extractVideoIdFromNode(node);
    return (videoId) ? true : false;
  };
  Downsha.YoutubeElementSerializer.extractVideoIdFromNode = function(node) {
    if (node && node.nodeType == Node.ELEMENT_NODE) {
      var view = window;
      try {
        view = node.ownerDocument.defaultView;
      } catch (e) {
      }
      var matches = null;
      if (view && node.nodeName == "EMBED" && view.location
          && (matches = view.location.href.match(this.WATCH_URL_REGEX))
          && matches[1]) {
        return matches[1];
      } else {
        var videoNode = this.findVideoNode(node);
        if (videoNode) {
          var src = videoNode.getAttribute("src");
          if (src && (matches = src.match(this.EMBED_URL_REGEX)) && matches[1]) {
            return matches[1];
          } else if (src && (matches = src.match(this.VIDEO_URL_REGEX))
              && matches[1]) {
            return matches[1];
          }
        }
      }
    }
  };
  Downsha.YoutubeElementSerializer.findVideoNode = function(node) {
    if (node && node.nodeType == Node.ELEMENT_NODE) {
      if (this.VIDEO_NODES.indexOf(node.nodeName) >= 0) {
        return node;
      } else if (this.POSSIBLE_CONTAINER_NODES.indexOf(node.nodeName) >= 0) {
        var i = node.ownerDocument.createNodeIterator(node,
            NodeFilter.SHOW_ELEMENT, null, false);
        var n = null;
        while (n = i.nextNode()) {
          if (this.VIDEO_NODES.indexOf(node.nodeName) >= 0) {
            return n;
          }
        }
      }
    }
    return null;
  };

  Downsha.YoutubeElementSerializer.prototype.serialize = function() {
    LOG.debug("YoutubeElementSerializer.serialize");
    var videoId = this.constructor.extractVideoIdFromNode(this.node);
    LOG.debug("videoId: " + videoId);
    if (videoId) {
      var thumbUrl = null;
      var w = 0;
      var h = 0;
      var isHQ = false;
      if (this.nodeStyle
          && (this.nodeStyle["width"] || this.nodeStyle["height"])) {
        w = parseInt(this.nodeStyle["width"]);
        w = (isNaN(w)) ? 0 : w;
        h = parseInt(this.nodeStyle["height"]);
        h = (isNaN(h)) ? 0 : h;
        if (w < this.constructor.DEFAULT_THUMB_WIDTH
            || h < this.constructor.DEFAULT_THUMB_HEIGHT) {
          thumbUrl = this.getDefaultThumbnailUrl(videoId);
        } else {
          thumbUrl = this.getHQThumbnailUrl(videoId);
          isHQ = true;
        }
      } else {
        thumbUrl = this.getDefaultThumbnailUrl(videoId);
      }
      if (thumbUrl) {
        var styleStr = (this.nodeStyle instanceof Downsha.ClipStyle) ? "style=\""
            + this.nodeStyle.toString() + "\""
            : "";
        var attrs = this.node.attributes;
        var attrStr = "";
        for ( var a = 0; a < attrs.length; a++) {
          var attr = attrs[a];
          attrStr += attr.name;
          if (attr.value) {
            attrStr += "=" + attr.value;
          }
          attrStr += " ";
        }
        var href = this.getWatchUrl(videoId);
        var imgDim = {};
        var maxW = (isHQ) ? this.constructor.HQ_THUMB_WIDTH
            : this.constructor.DEFAULT_THUMB_WIDTH;
        var maxH = (isHQ) ? this.constructor.HQ_THUMB_HEIGHT
            : this.constructor.DEFAULT_THUMB_HEIGHT;
        var imgAttrStr = "";
        if (w && h) {
          var k = w / h;
          if (k > (this.constructor.DEFAULT_THUMB_WIDTH / this.constructor.DEFAULT_THUMB_HEIGHT)) {
            // scale by height
            imgAttrStr += "height=\"" + h + "\"";
          } else {
            // scale by width
            imgAttrStr += "width=\"" + w + "\"";
          }
        }
        var str = "<a " + styleStr + " " + attrStr + " href=\"" + href
            + "\"><img src=\"" + thumbUrl + "\" " + imgAttrStr + "/></a>";
        return str;
      }
    }
  };

  Downsha.YoutubeElementSerializer.prototype.getDefaultThumbnailUrl = function(
      videoId) {
    return this.constructor.DEFAULT_THUMB_URL.replace(/\$videoId\$/, videoId);
  };
  Downsha.YoutubeElementSerializer.prototype.getHQThumbnailUrl = function(
      videoId) {
    return this.constructor.HQ_THUMB_URL.replace(/\$videoId\$/, videoId);
  };
  Downsha.YoutubeElementSerializer.prototype.getWatchUrl = function(videoId) {
    return this.constructor.WATCH_URL.replace(/\$videoId\$/, videoId);
  };
})();

(function() {
  var LOG = null;
  /**
   * Serializes DOM element into an img pointing to the thumbnail of the video.
   * 
   */

  Downsha.FlickrElementSerializer = function FlickrElementSerializer(node,
      nodeStyle) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(node, nodeStyle);
  };
  Downsha.inherit(Downsha.FlickrElementSerializer,
      Downsha.AbstractElementSerializer);

  Downsha.FlickrElementSerializer.WATCH_URL_REGEX = /^https?:\/\/www\.flickr\.com\/photos\/([^\/]+)\/([^\/\?\&]+)/i;
  Downsha.FlickrElementSerializer.POSSIBLE_CONTAINER_NODES = [ "OBJECT" ];
  Downsha.FlickrElementSerializer.VIDEO_NODES = [ "EMBED", "IFRAME" ];
  Downsha.FlickrElementSerializer.WATCH_URL = "http://www.flickr.com/photos/$userId$/$videoId$/";
  Downsha.FlickrElementSerializer.HQ_THUMB_WIDTH = 500;
  Downsha.FlickrElementSerializer.HQ_THUMB_HEIGHT = 375;
  Downsha.FlickrElementSerializer.DEFAULT_THUMB_WIDTH = 240;
  Downsha.FlickrElementSerializer.DEFAULT_THUMB_HEIGHT = 180;
  Downsha.FlickrElementSerializer.isResponsibleFor = function(node) {
    var thumbUrl = null;
    if (this.isWatchUrl(node)) {
      thumbUrl = this.extractThumbnailUrl(node);
    }
    return (thumbUrl) ? true : false;
  };
  Downsha.FlickrElementSerializer.isWatchUrl = function(node) {
    var doc = (node && node.ownerDocument) ? node.ownerDocument : document;
    if (doc && doc.location && doc.location.href) {
      var matches = doc.location.href.toLowerCase().match(this.WATCH_URL_REGEX);
      return (matches && matches.length > 0) ? true : false;
    }
    return false;
  };
  Downsha.FlickrElementSerializer.extractThumbnailUrl = function(node) {
    var doc = (node && node.ownerDocument) ? node.ownerDocument : document;
    if (doc) {
      // <link rel="image_src"
      // href="http://farm4.static.flickr.com/serverId/photoId_photoSecret_m.jpg">
      var links = doc.getElementsByTagName("link");
      if (!links) {
        return null;
      }
      for ( var i = 0; i < links.length; i++) {
        var link = links[i];
        var rel = link.getAttribute("rel");
        if (rel == "image_src") {
          var href = link.getAttribute("href");
          return href;
        }
      }
    }
    return null;
  };

  Downsha.FlickrElementSerializer.prototype.serialize = function() {
    LOG.debug("FlickrElementSerializer.serialize");
    var thumbUrl = this.constructor.extractThumbnailUrl(this.node);
    LOG.debug("thumbUrl: " + thumbUrl);
    var doc = (this.node.ownerDocument) ? this.node.ownerDocument : document;
    var href = (doc && doc.location && doc.location.href) ? doc.location.href
        : null;
    LOG.debug("href: " + href);
    if (thumbUrl) {
      var w = 0;
      var h = 0;
      var isHQ = false;
      if (this.nodeStyle
          && (this.nodeStyle["width"] || this.nodeStyle["height"])) {
        w = parseInt(this.nodeStyle["width"]);
        w = (isNaN(w)) ? 0 : w;
        h = parseInt(this.nodeStyle["height"]);
        h = (isNaN(h)) ? 0 : h;
        if (w < this.constructor.DEFAULT_THUMB_WIDTH
            || h < this.constructor.DEFAULT_THUMB_HEIGHT) {
          thumbUrl = this.getDefaultThumbnailUrl(thumbUrl);
        } else {
          thumbUrl = this.getHQThumbnailUrl(thumbUrl);
          isHQ = true;
        }
      } else {
        thumbUrl = this.getDefaultThumbnailUrl(thumbUrl);
      }
      if (thumbUrl) {
        if (!this.nodeStyle instanceof Downsha.ClipStyle) {
          this.nodeStyle = new Downsha.ClipStyle();
        }
        this.nodeStyle._addSimpleStyle("display", "block");
        var styleStr = "style=\"" + this.nodeStyle.toString() + "\"";
        var imgDim = {};
        var maxW = (isHQ) ? this.constructor.HQ_THUMB_WIDTH
            : this.constructor.DEFAULT_THUMB_WIDTH;
        var maxH = (isHQ) ? this.constructor.HQ_THUMB_HEIGHT
            : this.constructor.DEFAULT_THUMB_HEIGHT;
        var imgStyleStr = "";
        if (this.nodeStyle && this.nodeStyle["width"] && this.nodeStyle["height"]) {
          imgStyleStr = "width:" + this.nodeStyle["width"] + ";height:" + this.nodeStyle["height"];
        }
        imgStyleStr = "style=\"" + imgStyleStr + "\"";
        var str = "<a " + styleStr + " href=\"" + href + "\"><img src=\""
            + thumbUrl + "\" " + imgStyleStr + "/></a>";
        LOG.debug("Serialized: " + str);
        return str;
      }
    }
  };

  Downsha.FlickrElementSerializer.prototype.getDefaultThumbnailUrl = function(
      thumbUrl) {
    return thumbUrl;
  };
  Downsha.FlickrElementSerializer.prototype.getHQThumbnailUrl = function(
      thumbUrl) {
    return thumbUrl.replace(/_m(\.[a-z]+)$/, "$1");
  };
})();

/*
 * Constants
 * Downsha
 * 
 * Created by Pavel Skaldin on 3/1/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
Downsha.Constants = Downsha.Constants || {};

/**
 * Lists typeof of requests the extension makes. Lower codes (below 100) are
 * strictly for basic functionality of the extension. Higher codes are for
 * particular applications of the extension - such as content clipping,
 * simSearch etc. It is customary for higher codes to utilize odd numbers for
 * error codes and even numbers otherwise.
 */

Downsha.Constants.RequestType = {
  UNKNOWN : 0,
  // used to signal logout
  LOGOUT : 1,
  // used to signal login
  LOGIN : 2,
  // used to signal authentication error
  AUTH_ERROR : 3,
  // used to signal successful authentication
  AUTH_SUCCESS : 4,
  // used to signal when the client was updated with user-data
  DATA_UPDATED : 6,
  // used to signal that user has reached his quota
  QUOTA_REACHED : 7,
  // used to signal background process that popup has started
  POPUP_STARTED : 8,
  // used to signal that popup's existence has ended (i.e. it was inadvertently
  // dismissed)
  POPUP_ENDED : 9,
  // used to indicate that there was a problem allocating clipProcessor
  CLIP_PROCESSOR_INIT_ERROR : 11,
  // used to request failed payloads from clipProcessor
  GET_MANAGED_PAYLOAD : 14,
  // used to request a re-trial of a failed payload
  RETRY_MANAGED_PAYLOAD : 15,
  // used to request cancellation of a failed payload
  CANCEL_MANAGED_PAYLOAD : 16,
  // used to request reivisting of failed payload
  REVISIT_MANAGED_PAYLOAD : 17,
  // used to request viewing of processed payload's clip
  VIEW_MANAGED_PAYLOAD_DATA : 18,
  // used to request editing of processed payload's clip
  EDIT_MANAGED_PAYLOAD_DATA : 19,
  // used to signal when the client receives new data from the server
  SYNC_DATA : 20,
  // used to signal client's failure to process data during sync
  SYNC_DATA_FAILURE : 21,
  // used to signal upon removal of log files
  LOG_FILE_REMOVED : 30,
  // used to signal swapping of log file
  LOG_FILE_SWAPPED : 32,
  // indicates that a clip was made from a page
  PAGE_CLIP_SUCCESS : 100,
  // indicates that a clip failed to be created from a page
  PAGE_CLIP_FAILURE : 101,
  // indicates that a clip with content was made from a page
  PAGE_CLIP_CONTENT_SUCCESS : 102,
  // indicates that a clip with content failed to be created from a page
  PAGE_CLIP_CONTENT_FAILURE : 103,
  // indicates that a clip is too big in size
  PAGE_CLIP_CONTENT_TOO_BIG : 105,
  // indicates that clip was synchronized with the server
  CLIP_SUCCESS : 110,
  // indicates that clip failed to synchronize with the server
  CLIP_FAILURE : 111,
  // indicates that there was an HTTP transport error while syncing page clip
  // to the server
  CLIP_HTTP_FAILURE : 113,
  // indicates that clip was filed on the server
  CLIP_FILE_SUCCESS : 120,
  // indicates that clip failed to fil on the server
  CLIP_FILE_FAILURE : 121,
  // indicates that there was an HTTP transport error while filing a note on the
  // server
  CLIP_FILE_HTTP_FAILURE : 123,
  // used to signal listener to cancel a timer that's waiting on page clip
  CANCEL_PAGE_CLIP_TIMER : 200,
  AUTOSAVE : 212,
  // used to signal that options have been updated
  OPTIONS_UPDATED : 320,
  // used to signal that search-helper needs to be disabled
  SEARCH_HELPER_DISABLE : 340,
  // used to signal that a timeout waiting for the content script to be loaded
  // needs to be cancelled
  CONTENT_SCRIPT_LOAD_TIMEOUT_CANCEL : 400,
  // used to signal that content script loading timed out
  CONTENT_SCRIPT_LOAD_TIMEOUT : 401,
  // indicates that a clip was made from a page
  CONTEXT_PAGE_CLIP_SUCCESS : 2100,
  // indicates that a clip failed to be created from a page
  CONTEXT_PAGE_CLIP_FAILURE : 2101,
  // indicates that a clip with content was made from a page
  CONTEXT_PAGE_CLIP_CONTENT_SUCCESS : 2102,
  // indicates that a clip with content failed to be created from a page
  CONTEXT_PAGE_CLIP_CONTENT_FAILURE : 2103,
  // indicates that a clip is too big in size
  CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG : 2105,
  // used to ask background process to fetch external style sheets and return
  // parsed cssText
  FETCH_STYLE_SHEET_RULES : 3001,
  // indicates user-preference for clipping full page
  CLIP_ACTION_FULL_PAGE : 4001,
  // indicates user-preference for clipping article portion of the page
  CLIP_ACTION_ARTICLE : 4002,
  // indicates user-preference for clipping user-selected portion of the page
  CLIP_ACTION_SELECTION : 4003,
  // indicates user-preference for clipping just the URL to the page
  CLIP_ACTION_URL : 4004,
  // used to clear clip preview
  PREVIEW_CLIP_ACTION_CLEAR : 4010,
  // indicates user-preference for previewing full page
  PREVIEW_CLIP_ACTION_FULL_PAGE : 4011,
  // indicates user-preference for previewing article portion of the page
  PREVIEW_CLIP_ACTION_ARTICLE : 4012,
  // indicates user-preference for previewing user-selected portion of the page
  PREVIEW_CLIP_ACTION_SELECTION : 4013,
  // indicates user-preference for previewing just the URL to the page
  PREVIEW_CLIP_ACTION_URL : 4014,
  // used to notify with PageInfo object
  PAGE_INFO : 5000,
  // used to nudge preview in some direction
  PREVIEW_NUDGE: 6010,
  // used to notify nudge preview to previous sibling
  PREVIEW_NUDGE_PREVIOUS_SIBLING: 6011,
  // used to notify nudge preview to next sibling
  PREVIEW_NUDGE_NEXT_SIBLING: 6012,
  // used to notify nudge preview to the parent of current root element
  PREVIEW_NUDGE_PARENT: 6013,
  // used to notify nudge preview to the next sibling of the parent of the current root element
  PREVIEW_NUDGE_CHILD: 6014
};

Downsha.Constants.Limits = {
  DSTP_USER_NAME_LEN_MIN : 1,
  DSTP_USER_NAME_LEN_MAX : 64,
  DSTP_USER_NAME_REGEX : "^[a-z0-9]([a-z0-9_-]{0,62}[a-z0-9])?$",
  
  DSTP_USER_EMAIL_LEN_MIN : 6,
  DSTP_USER_EMAIL_LEN_MAX : 255,
  DSTP_USER_EMAIL_REGEX : "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.([A-Za-z]{2,})$",

  DSTP_USER_PWD_LEN_MIN : 6,
  DSTP_USER_PWD_LEN_MAX : 64,
  DSTP_USER_PWD_REGEX : "^[A-Za-z0-9!#$%&'()*+,./:;<=>?@^_`{|}~\\[\\]\\\\-]{6,64}$",

  EDAM_NOTE_TITLE_LEN_MIN : 0,
  EDAM_NOTE_TITLE_LEN_MAX : 255,
  EDAM_NOTE_TITLE_REGEX : "^$|^[^\\s\\r\\n\\t]([^\\n\\r\\t]{0,253}[^\\s\\r\\n\\t])?$",

  EDAM_TAG_NAME_LEN_MIN : 1,
  EDAM_TAG_NAME_LEN_MAX : 100,
  EDAM_TAG_NAME_REGEX : "^[^,\\s\\r\\n\\t]([^,\\n\\r\\t]{0,98}[^,\\s\\r\\n\\t])?$",

  EDAM_NOTE_TAGS_MIN : 0,
  EDAM_NOTE_TAGS_MAX : 100,

  SERVICE_DOMAIN_LEN_MIN : 1,
  SERVICE_DOMAIN_LEN_MAX : 256,

  CLIP_NOTE_CONTENT_LEN_MAX : 5242880,

  EDAM_USER_RECENT_MAILED_ADDRESSES_MAX : 10,
  DSTP_USER_EMAIL_LEN_MIN : 6,
  DSTP_USER_EMAIL_LEN_MAX : 255,
  DSTP_USER_EMAIL_REGEX : "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.([A-Za-z]{2,})$"
};

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
Downsha.RequestMessage.prototype.send = function() {
  chrome.extension.sendRequest( {
    code : this.code,
    message : this.message
  });
};
Downsha.RequestMessage.prototype.isEmpty = function() {
  return (this.code) ? false : true;
};

Downsha.Utils = Downsha.Utils || new function Utils() {
};

Downsha.Utils.MESSAGE_ATTR = "message";
Downsha.Utils.PLACEHOLDER_ATTR = "placeholder";
Downsha.Utils.TITLE_ATTR = "title";
Downsha.Utils.MESSAGE_DATA_ATTR = "messagedata";
Downsha.Utils.LOCALIZED_ATTR = "localized";
Downsha.Utils.BADGE_NORMAL_COLOR = [ 255, 0, 0, 255 ];
Downsha.Utils.BADGE_UPLOADING_COLOR = [ 255, 255, 0, 255 ];

Downsha.Utils.updateBadge = function(context, tabId) {
  var LOG = Downsha.chromeExtension.logger;
  LOG.debug("Utils.updateBadge");
  var sh = null;
  if (context) {
    if (context.clipProcessor.length > 0) {
      Downsha.Utils.setBadgeBackgroundColor(
          Downsha.Utils.BADGE_UPLOADING_COLOR, tabId);
      LOG.debug("Badge indicates pending notes: "
          + context.clipProcessor.length);
      Downsha.Utils.setBadgeText(context.clipProcessor.length, tabId);
      Downsha.Utils.setBadgeTitle(chrome.i18n
          .getMessage("BrowserActionTitlePending"), tabId);
    } else if (typeof tabId == 'number'
        && chrome.extension
        && typeof chrome.extension.getBackgroundPage().Downsha.SearchHelper != 'undefined'
        && (sh = chrome.extension.getBackgroundPage().Downsha.SearchHelper
            .getInstance(tabId)) && sh && sh.hasResults()) {
      Downsha.Utils.setBadgeBackgroundColor(Downsha.Utils.BADGE_NORMAL_COLOR,
          tabId);
      LOG.debug("Badge indicates simsearch results: " + sh.result.totalNotes);
      Downsha.Utils.setBadgeText(sh.result.totalNotes, tabId);
      Downsha.Utils.setBadgeTitle(
          chrome.i18n.getMessage("BrowserActionTitle"), tabId);
    } else {
      LOG.debug("Clearing badge for there's nothing interesting to show");
      Downsha.Utils.clearBadge(tabId);
      Downsha.Utils.setBadgeTitle(
          chrome.i18n.getMessage("BrowserActionTitle"), tabId);
    }
  }
};

Downsha.Utils.clearBadge = function(tabId) {
  var o = {
    text : ""
  };
  if (typeof tabId == 'number') {
    o["tabId"] = tabId;
    chrome.browserAction.setBadgeText(o);
  } else {
    this.clearAllBadges();
  }
};

Downsha.Utils.clearAllBadges = function() {
  this.doInEveryNormalTab(function(tab) {
    chrome.browserAction.setBadgeText( {
      tabId : tab.id,
      text : ""
    });
  }, true);
};

Downsha.Utils.setBadgeBackgroundColor = function(color, tabId) {
  var o = {
    color : color
  };
  if (typeof tabId == 'number') {
    o["tabId"] = tabId;
    chrome.browserAction.setBadgeBackgroundColor(o);
  } else {
    this.doInEveryNormalTab(function(tab) {
      o.tabId = tab.id;
      chrome.browserAction.setBadgeBackgroundColor(o);
    }, true);
  }
};

Downsha.Utils.setBadgeText = function(txt, tabId) {
  if (txt) {
    var o = {
      text : "" + txt
    };
    if (typeof tabId == 'number') {
      o["tabId"] = tabId;
      chrome.browserAction.setBadgeText(o);
    } else {
      this.doInEveryNormalTab(function(tab) {
        o.tabId = tab.id;
        chrome.browserAction.setBadgeText(o);
      }, true);
    }
  } else if (txt == null) {
    Downsha.Utils.clearBadge(tabId);
  }
};

Downsha.Utils.setBadgeTitle = function(title, tabId) {
  if (title) {
    var o = {
      title : "" + title
    };
    if (typeof tabId == 'number') {
      o["tabId"] = tabId;
      chrome.browserAction.setTitle(o);
    } else {
      this.doInEveryNormalTab(function(tab) {
        o.tabId = tab.id;
        chrome.browserAction.setTitle(o);
      }, true);
    }
  } else if (title == null) {
    Downsha.Utils.clearBadgeTitle(tabId);
  }
};

Downsha.Utils.clearBadgeTitle = function(tabId) {
  var o = {
    title : ""
  };
  if (typeof tabId == 'number') {
    o["tabId"] = tabId;
    chrome.browserAction.setTitle(o);
  } else {
    this.doInEveryNormalTab(function(tab) {
      o.tabId = tab.id;
      chrome.browserAction.setTitle(o);
    }, true);
  }
};

Downsha.Utils.doInEveryNormalTab = function(callback, onlySelected) {
  chrome.windows.getAll( {
    populate : true
  }, function(wins) {
    for ( var w = 0; w < wins.length; w++) {
      if (wins[w].type == "normal") {
        for ( var t = 0; t < wins[w].tabs.length; t++) {
          if (!onlySelected || wins[w].tabs[t].selected) {
            callback(wins[w].tabs[t], wins[w]);
          }
        }
      }
    }
  });
};

Downsha.Utils.localizeBlock = function(block) {
  if (block.attr(Downsha.Utils.MESSAGE_ATTR))
    Downsha.Utils.localizeElement(block);
  var siblings = block.find("[" + Downsha.Utils.MESSAGE_ATTR + "], ["
      + Downsha.Utils.PLACEHOLDER_ATTR + "], [" + Downsha.Utils.TITLE_ATTR
      + "]");
  for ( var i = 0; i < siblings.length; i++) {
    var sibling = $(siblings.get(i));
    Downsha.Utils.localizeElement(sibling);
  }
};

Downsha.Utils.extractLocalizationField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.MESSAGE_ATTR))
    return element.attr(Downsha.Utils.MESSAGE_ATTR);
  else
    return null;
};
Downsha.Utils.extractLocalizationDataField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.MESSAGE_DATA_ATTR)) {
    var v = element.attr(Downsha.Utils.MESSAGE_DATA_ATTR);
    try {
      v = eval(v);
    } catch (e) {
    }
    if (!(v instanceof Array))
      v = [ v ];
    return v;
  } else {
    return null;
  }
};
Downsha.Utils.extractLocalizationPlaceholderField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.PLACEHOLDER_ATTR)) {
    return element.attr(Downsha.Utils.PLACEHOLDER_ATTR);
  } else {
    return null;
  }
};
Downsha.Utils.extractLocalizationTitleField = function(element) {
  if (typeof element.attr == 'function'
      && element.attr(Downsha.Utils.TITLE_ATTR)) {
    return element.attr(Downsha.Utils.TITLE_ATTR);
  } else {
    return null;
  }
};

Downsha.Utils.localizeElement = function(element, force) {
  if (!force && element.attr(Downsha.Utils.LOCALIZED_ATTR)
      && element.attr(Downsha.Utils.LOCALIZED_ATTR == "true")) {
    return;
  }
  var field = Downsha.Utils.extractLocalizationField(element);
  var placeholderField = Downsha.Utils
      .extractLocalizationPlaceholderField(element);
  var titleField = Downsha.Utils.extractLocalizationTitleField(element);
  var fieldData = Downsha.Utils.extractLocalizationDataField(element);
  var localized = false;
  if (field) {
    if (fieldData) {
      var msg = chrome.i18n.getMessage(field, fieldData);
    } else {
      var msg = chrome.i18n.getMessage(field);
    }
    if (element.attr("tagName") == "INPUT") {
      element.val(msg);
    } else {
      element.html(msg);
    }
    localized = true;
  }
  if (placeholderField) {
    var msg = chrome.i18n.getMessage(placeholderField);
    element.attr(Downsha.Utils.PLACEHOLDER_ATTR, msg);
    localized = true;
  }
  if (titleField) {
    var msg = chrome.i18n.getMessage(titleField);
    element.attr(Downsha.Utils.TITLE_ATTR, msg);
    localized = true;
  }
  if (localized) {
    element.attr(Downsha.Utils.LOCALIZED_ATTR, "true");
  }
};

Downsha.Utils.notifyExtension = function(requestMessage, callback) {
  chrome.windows.getCurrent(function(win) {
    chrome.tabs.getSelected(win.id, function(tab) {
      var o = {
        tab : tab,
        id : chrome.i18n.getMessage("@@extension_id")
      };
      var cb = callback || function() {
      };
      chrome.extension.onRequest.dispatch(requestMessage, o, cb);
      chrome.extension.sendRequest(requestMessage, cb);
    });
  });
};

Downsha.Utils._setDesktopNotificationAttributes = function(notification, attrs) {
  if (notification && typeof attrs == 'object' && attrs) {
    for ( var i in attrs) {
      notification[i] = attrs[i];
    }
  }
};
Downsha.Utils.notifyDesktop = function(title, message, timeout, attrs) {
  var notification = webkitNotifications.createNotification(
      'images/en_app_icon-48.png', title, message);
  this._setDesktopNotificationAttributes(notification, attrs);
  notification.show();
  if (typeof timeout == 'number') {
    setTimeout(function() {
      notification.cancel();
    }, timeout);
  }
  return notification;
};
Downsha.Utils.notifyDesktopWithHTML = function(filePath, timeout, attrs) {
  var notification = webkitNotifications.createHTMLNotification(filePath);
  this._setDesktopNotificationAttributes(notification, attrs);
  notification.show();
  if (typeof timeout == 'number') {
    setTimeout(function() {
      notification.cancel();
    }, timeout);
  }
  return notification;
};
Downsha.Utils.openWindow = function(url) {
  var bg = chrome.extension.getBackgroundPage();
  bg.Downsha.chromeExtension.openWindow(url);
};
Downsha.Utils.getPostData = function(queryString) {
  if (typeof queryString == 'undefined') {
    queryString = window.location.search.replace(/^\?/, "");
  }
  var result = {};
  if (queryString) {
    var parts = queryString.split("&");
    for ( var i = 0; i < parts.length; i++) {
      var kv = parts[i].split("=");
      var k = unescape(kv[0]);
      var v = (kv[1]) ? unescape(kv[1]) : null;
      if (v) {
        try {
          result[k] = JSON.parse(v);
        } catch (e) {
          result[k] = v;
        }
      } else {
        result[k] = v;
      }
    }
  }
  return result;
};
Downsha.Utils.getLocalizedMessage = function(messageKey, params) {
  if (typeof chrome != 'undefined'
      && typeof chrome.i18n.getMessage == 'function') {
    return chrome.i18n.getMessage(messageKey, params);
  } else {
    return messageKey;
  }
};
Downsha.Utils.extractHttpErrorMessage = function(xhr, textStatus, error) {
  if (this.quiet)
    return;
  if (xhr.readyState == 4) {
    var msg = this.getLocalizedMessage("Error_HTTP_Transport", [
        ("" + xhr.status), ((typeof error == 'string') ? error : "") ]);
  } else {
    var msg = this.getLocalizedMessage("Error_HTTP_Transport", [
        ("readyState: " + xhr.readyState), "" ]);
  }
  return msg;
};
Downsha.Utils.extractErrorMessage = function(e, defaultMessage) {
  var msg = (typeof defaultMessage != 'undefined') ? defaultMessage : null;
  if (e instanceof Downsha.DownshaError
      && typeof e.errorCode == 'number'
      && typeof e.parameter == 'string'
      && this.getLocalizedMessage("EDAMError_" + e.errorCode + "_"
          + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"))) {
    msg = this.getLocalizedMessage("EDAMError_" + e.errorCode + "_"
        + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"));
  } else if (e instanceof Downsha.EDAMResponseException
      && typeof e.errorCode == 'number'
      && this.getLocalizedMessage("EDAMResponseError_" + e.errorCode)) {
    if (typeof e.parameter == 'string') {
      msg = this.getLocalizedMessage("EDAMResponseError_" + e.errorCode,
          e.parameter);
    } else {
      msg = this.getLocalizedMessage("EDAMResponseError_" + e.errorCode);
    }
  } else if (e instanceof Downsha.DownshaError
      && typeof e.errorCode == 'number'
      && this.getLocalizedMessage("EDAMError_" + e.errorCode)) {
    if (typeof e.parameter == 'string') {
      msg = this.getLocalizedMessage("EDAMError_" + e.errorCode, e.parameter);
    } else {
      msg = this.getLocalizedMessage("EDAMError_" + e.errorCode);
    }
  } else if (e instanceof Downsha.DownshaError
      && typeof e.message == 'string') {
    msg = e.message;
  } else if ((e instanceof Error || e instanceof Error)
      && typeof e.message == 'string') {
    msg = e.message;
  } else if (typeof e == 'string') {
    msg = e;
  }
  return msg;
};

Downsha.Utils.isForbiddenUrl = function(url) {
  if (typeof url == 'string'
      && (url.toLowerCase().indexOf("chrome.google.com/extensions") >= 0 || url
          .toLowerCase().indexOf("chrome.google.com/webstore") >= 0)) {
    return true;
  }
  if (typeof url == 'string' && !url.toLowerCase().match(/^https?:\/\//)) {
    return true;
  }
  return false;
};

Downsha.Utils.getTextSize = function(text) {
  var el = $("<div></div>");
  el.text(text);
  el.css( {
    position : "absolute",
    top : "0px",
    left : "0px",
    padding : "0px",
    margin : "0px",
    display : "block",
    zIndex : "0",
    color : "rgba(0, 0, 0, 0)",
    background : "rgba(0, 0, 0, 0)"
  });
  $("body").append(el);
  var size = {
    width : el.width(),
    height : el.height()
  };
  el.remove();
  return size;
};

Downsha.Utils.updateSelectElementWidth = function(el, textCallback) {
  var $el = (el instanceof jQuery) ? el : $(el);
  var val = $el.val();
  if (typeof textCallback == 'function') {
    val = textCallback(val);
  }
  var ld = parseInt($el.css("paddingLeft"));
  var rd = parseInt($el.css("paddingRight"));
  var delta = ((!isNaN(ld)) ? ld : 0) + ((!isNaN(rd)) ? rd : 0);
  var w = Downsha.Utils.getTextSize(val).width;
  w = (w) ? w : 0;
  var newWidth = w + delta;
  // adjust by another 10 pixels - mainly for Windows platform
  newWidth += 10;
  $el.css( {
    minWidth : newWidth + "px",
    width : newWidth + "px"
  });
};

Downsha.Utils.resizeElement = function(el, size, handler) {
  var $el = (el instanceof jQuery) ? el : $(el);
  var cssObj = {};
  var sizeObj = {};
  if (size && typeof size.width == 'number') {
    var ld = parseInt($el.css("paddingLeft"));
    var rd = parseInt($el.css("paddingRight"));
    var delta = ((!isNaN(ld)) ? ld : 0) + ((!isNaN(rd)) ? rd : 0);
    sizeObj.width = (size.width + delta);
    cssObj.minWidth = sizeObj.width + "px";
    cssObj.width = sizeObj.width + "px";
  }
  if (size && typeof size.height == 'number') {
    var td = parseInt($el.css("paddingTop"));
    var bd = parseInt($el.css("paddingBottom"));
    var delta = ((!isNaN(td)) ? td : 0) + ((!isNaN(bd)) ? bd : 0);
    sizeObj.height = size.height + delta;
    cssObj.minHeight = sizeObj.height + "px";
    css.height = sizeObj.height + "px";
  }
  $el.css(cssObj);
  if (typeof handler == 'function') {
    handler($el, sizeObj);
  }
};

Downsha.Utils.BAD_FAV_ICON_URLS = [ "http://localhost/favicon.ico" ];
Downsha.Utils.createUrlClipContent = function(title, url, favIcoUrl) {
  var titleAttr = (title) ? Downsha.Utils.escapeXML(title) : "";
  var style = "font-size: 12pt; line-height: 18px; display: inline;";
  var content = "<a title=\"" + titleAttr + "\" style=\"" + style
      + "\" href=\"" + url + "\">" + url + "</a>";
  if (typeof favIcoUrl == 'string' && favIcoUrl.length > 0
      && Downsha.Utils.BAD_FAV_ICON_URLS.indexOf(favIcoUrl.toLowerCase()) < 0) {
    var imgStyle = "display:inline;border: none; width: 16px; height: 16px; padding: 0px; margin: 0px 8px -2px 0px;";
    content = "<span><img title=\"" + titleAttr + "\" style=\"" + imgStyle
        + "\" src=\"" + favIcoUrl + "\"/>" + content + "</span>"
  } else {
    content = "<span>" + content + "</span>";
  }
  return content;
};

(function() {
  var LOG = null;
  var logEnabled = false;

  Downsha.ContentClipper = function ContentClipper() {
    LOG = Downsha.Logger.getInstance();
    LOG.level = Downsha.ContentClipper.LOG_LEVEL;
    if (LOG.level == Downsha.Logger.LOG_LEVEL_DEBUG) {
      logEnabled = true;
    }
    this.initialize();
  };

  Downsha.ContentClipper._instance = null;
  Downsha.ContentClipper.getInstance = function() {
    if (!this._instance) {
      this._instance = new Downsha.ContentClipper();
    }
    return this._instance;
  };
  Downsha.ContentClipper.destroyInstance = function() {
    this._instance = null;
  };

  Downsha.ContentClipper.LOG_LEVEL = 0;
  Downsha.ContentClipper.LOCALIZED_STYLE_TAG_ID = "downshaChromeExtensionLocalizedStyleSheet";
  Downsha.ContentClipper.prototype.PREVIEW_ARTICLE_CLASS = "downshaPreviewArticleContainer";

  Downsha.ContentClipper.prototype.clip = null;
  Downsha.ContentClipper.prototype._localizedStyleSheets = null;
  Downsha.ContentClipper.prototype._localizedStyleSheetCount = 0;
  Downsha.ContentClipper.prototype._localizedStyleSheetsInjected = false;
  Downsha.ContentClipper.prototype._sema = null;
  Downsha.ContentClipper.prototype._article = null;

  Downsha.ContentClipper.prototype.initialize = function() {
    this._sema = Downsha.Semaphore.mutex();
    this.initSupportStyles();
    if (!this.isLocalizedStyleSheetsInjected()) {
      this.localizeStyleSheets();
    }
    this.__defineGetter__("article", this.getArticle);
  };

  Downsha.ContentClipper.prototype.initSupportStyles = function() {
    try {
      var style = document.createElement("link");
      style.setAttribute("rel", "stylesheet");
      style.setAttribute("type", "text/css");
      style.setAttribute("href", "chrome-extension://"
          + chrome.i18n.getMessage("@@extension_id")
          + "/css/contentclipper.css");
      if (document.head) {
        document.head.appendChild(style);
      } else if (document.body && document.body.parentNode) {
        document.body.parentNode.appendChild(style);
      }
    } catch (e) {
      LOG
          .warn("Could not inject our own style sheets... Could be that we're dealing with a file view and not a web page");
    }
  };

  Downsha.ContentClipper.prototype.PAGE_CLIP_SUCCESS = Downsha.Constants.RequestType.PAGE_CLIP_SUCCESS;
  Downsha.ContentClipper.prototype.PAGE_CLIP_CONTENT_TOO_BIG = Downsha.Constants.RequestType.PAGE_CLIP_CONTENT_TOO_BIG;
  Downsha.ContentClipper.prototype.PAGE_CLIP_CONTENT_SUCCESS = Downsha.Constants.RequestType.PAGE_CLIP_CONTENT_SUCCESS;
  Downsha.ContentClipper.prototype.PAGE_CLIP_CONTENT_FAILURE = Downsha.Constants.RequestType.PAGE_CLIP_CONTENT_FAILURE;
  Downsha.ContentClipper.prototype.PAGE_CLIP_FAILURE = Downsha.Constants.RequestType.PAGE_CLIP_FAILURE;
  Downsha.ContentClipper.prototype.WAIT_CONTAINER_ID = "downshaContentClipperWait";

  Downsha.ContentClipper.prototype.onClip = function(clip) {
    new Downsha.RequestMessage(this.PAGE_CLIP_SUCCESS, clip.toDataObject())
        .send();
  };
  Downsha.ContentClipper.prototype.onClipContent = function(clip) {
    new Downsha.RequestMessage(this.PAGE_CLIP_CONTENT_SUCCESS, clip
        .toDataObject()).send();
  };
  Downsha.ContentClipper.prototype.onClipFailure = function(error) {
    new Downsha.RequestMessage(this.PAGE_CLIP_FAILURE, error).send();
  };
  Downsha.ContentClipper.prototype.onClipContentFailure = function(error) {
    new Downsha.RequestMessage(this.PAGE_CLIP_CONTENT_FAILURE, error).send();
  };
  Downsha.ContentClipper.prototype.onClipContentTooBig = function(clip) {
    new Downsha.RequestMessage(this.PAGE_CLIP_CONTENT_TOO_BIG, clip
        .toDataObject()).send();
  };

  Downsha.ContentClipper.prototype.localizeStyleSheets = function() {
    var self = this;
    this._localizedStyleSheets = [];
    this._localizedStyleSheets.count = 0;
    this._localizedStyleSheetCount = 0;
    var fetchCount = 0;
    var complete = function() {
      if (fetchCount == 0) {
        LOG.debug("Not injecting localized styles cuz there were none fetched");
        self._sema.signal();
        return;
      }
      if (!self.isLocalizedStyleSheetsInjected()
          && self._localizedStyleSheets.count == self._localizedStyleSheetCount) {
        LOG.debug("Injecting " + self._localizedStyleSheetCount
            + " localized style sheets");
        self._importExternalStyles(function() {
          self._injectLocalizedStyles();
          setTimeout(function() {
            self._sema.signal();
          }, 300);
        });
      }
    };
    this._sema
        .critical(function() {
          for ( var i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
              LOG.debug("Skipping disabled sheet");
              continue;
            } else if (document.styleSheets[i].media
                && document.styleSheets[i].media.length > 0
                && document.styleSheets[i].media.mediaText
                && document.styleSheets[i].media.mediaText.toLowerCase()
                    .indexOf("screen") < 0
                && document.styleSheets[i].media.mediaText.toLowerCase()
                    .indexOf("all") < 0) {
              LOG.debug("Skipping style sheet cuz it's not for screen");
              continue;
            } else if (document.styleSheets[i].rules) {
              LOG.debug("Adding local rules");
              self._localizedStyleSheets[self._localizedStyleSheetCount++] = self
                  .serializeStyleRules(document.styleSheets[i].rules);
              self._localizedStyleSheets.count++;
            } else if (document.styleSheets[i].href
                && document.styleSheets[i].href.toLowerCase().indexOf("http") == 0) {
              LOG.debug("Fetching remote style sheet: "
                  + document.styleSheets[i].href);
              var fetchProcess = function(cssResponse) {
                var cssText = (cssResponse && cssResponse.cssText) ? cssResponse.cssText
                    : "";
                var _count = arguments.callee._count;
                var _url = arguments.callee._url;
                self._localizedStyleSheets[_count] = "/* " + _url + "*/\n"
                    + cssText;
                self._localizedStyleSheets.count++;
                complete();
              };
              fetchProcess._count = self._localizedStyleSheetCount++;
              fetchProcess._url = document.styleSheets[i].href;
              self.fetchStyleSheet(document.styleSheets[i].href, fetchProcess);
              fetchCount++;
            } else {
              LOG.warn('Skipping style sheet not knowing what to do');
              LOG.dir(document.styleSheets[i]);
            }
          }
        });
    complete();
  };

  Downsha.ContentClipper.prototype.fetchStyleSheet = function(href, callback) {
    var self = this;
    chrome.extension.sendRequest(new Downsha.RequestMessage(
        Downsha.Constants.RequestType.FETCH_STYLE_SHEET_RULES, href),
        function(cssResponse) {
          if (typeof callback == 'function') {
            callback(cssResponse);
          }
        });
  };

  Downsha.ContentClipper.prototype.serializeStyleRules = function(rulesList) {
    var cssText = "";
    for ( var i = 0; i < rulesList.length; i++) {
      cssText += rulesList[i].cssText + "\n";
    }
    return cssText;
  };

  Downsha.ContentClipper.prototype.isLocalizedStyleSheets = function() {
    return (this._localizedStyleSheets) ? true : false;
  };

  Downsha.ContentClipper.prototype.getDocBase = function() {
    var docBase = document.location.protocol + "//"
        + document.location.hostname;
    docBase = docBase.toLowerCase();
    return docBase;
  };

  Downsha.ContentClipper.prototype._importExternalStyles = function(callback) {
    LOG.debug("ContentClipper._importExternalStyles");
    var self = this;
    var cssText = this._localizedStyleSheets.join("").replace(/\n+/, "");
    this._importExternalStylesFromString(cssText, callback);
  };

  Downsha.ContentClipper.prototype._importExternalStylesFromString = function(
      cssText, callback) {
    LOG.debug("ContentClipper._importExternalStylesFromString");
    var self = this;
    var selfArgs = arguments;
    if (cssText) {
      var re = /@import\s+url\(\s*[\'\"]?([^\'\"\)]+)[\'\"]?\s*\)\s*;?/ig;
      var match = null;
      var docBase = this.getDocBase();
      var fetchCount = 0;
      var complete = function() {
        if (fetchCount == 0 && typeof callback == 'function') {
          callback();
        }
      };
      while (match = re.exec(cssText)) {
        var url = match[1];
        if (url.toLowerCase().indexOf("http") < 0) {
          if (url.charAt(0) == "/") {
            url = docBase + url;
          } else {
            url = document.location.href.replace(/\/[^\/]*$/, "/" + url);
          }
        }
        if (url && url.toLowerCase().indexOf(docBase) < 0) {
          LOG.debug("Fetching import: " + url);
          // fetch imported style sheet
          var fetchProc = function(cssResponse) {
            var _cssText = (cssResponse && cssResponse.cssText) ? cssResponse.cssText
                : "";
            _cssText = (_cssText) ? _cssText : "";
            var _pattern = arguments.callee._pattern;
            LOG.debug("Replacing: " + _pattern + " with css text of length: "
                + _cssText.length);
            if (_pattern) {
              for ( var i = 0; i < self._localizedStyleSheets.length; i++) {
                self._localizedStyleSheets[i] = self._localizedStyleSheets[i]
                    .replace(_pattern, _cssText);
              }
            }
            fetchCount--;
            if (re.test(_cssText.replace(/[\n\r]+/g, ""))) {
              self._importExternalStylesFromString(_cssText, function() {
                complete();
              });
            } else {
              complete();
            }
          };
          fetchProc._pattern = match[0];
          this.fetchStyleSheet(url, fetchProc);
          fetchCount++;
        } else if (!url) {
          LOG.warn("Could not determine URL of import: " + match[0]);
        } else if (url.toLowerCase().indexOf(docBase) == 0) {
          LOG.debug("Skipping same-origin import: " + url);
        }
      }
      complete();
    }
  };

  Downsha.ContentClipper.prototype._injectLocalizedStyles = function() {
    LOG.debug("ContentClipper._injectLocalizedStyles");
    var cssText = this._localizedStyleSheets.join("\n");
    if (cssText) {
      var old = document
          .getElementById(this.constructor.LOCALIZED_STYLE_TAG_ID);
      if (old) {
        old.parentElement.removeChild(old);
      }
      var styleTag = document.createElement("style");
      styleTag.setAttribute("id", this.constructor.LOCALIZED_STYLE_TAG_ID);
      var text = document.createTextNode();
      text.textContent = cssText;
      styleTag.appendChild(text);
      document.head.appendChild(styleTag);
    }
  };

  Downsha.ContentClipper.prototype.isLocalizedStyleSheetsInjected = function() {
    var s = document.getElementById(this.constructor.LOCALIZED_STYLE_TAG_ID);
    return (s) ? true : false;
  };

  Downsha.ContentClipper.prototype._doClip = function(fn, showWait) {
    var self = this;
    if (showWait) {
      this.wait();
      setTimeout(function() {
        self._sema.critical(function() {
          fn();
          self._sema.signal();
          self.clearWait();
        });
      }, 300);
    } else {
      this._sema.critical(function() {
        fn();
        self._sema.signal();
      });
    }
  };

  Downsha.ContentClipper.prototype.perform = function(fullPageOnly,
      stylingStrategy, showWait) {
    var self = this;
    this._doClip(function() {
      self._perform(fullPageOnly, stylingStrategy);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipSelection = function(stylingStrategy,
      attrs, showWait) {
    LOG.debug("ContentClipper.clipSelection");
    var self = this;
    this._doClip(function() {
      self._clipSelection(stylingStrategy, attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipFullPage = function(stylingStrategy,
      attrs, showWait) {
    LOG.debug("ContentClipper.clipFullPage");
    var self = this;
    this._doClip(function() {
      self._clipFullPage(stylingStrategy, attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipArticle = function(stylingStrategy,
      attrs, showWait) {
    LOG.debug("ContentClipper.clipArticle");
    var self = this;
    this._doClip(function() {
      self._clipArticle(stylingStrategy, attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.getArticleElement = function() {
    var el = window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS)[0];
    if (el) {
        return el;
    } else if (this.article) {
        var resNode = this.article.content.asNode();
        if (resNode) {
          Downsha.Utils.addElementClass(resNode, this.PREVIEW_ARTICLE_CLASS);
          return resNode;
        }
    }
    return null;
  };

  Downsha.ContentClipper.prototype.getArticle = function() {
    if (!this._article) {
      var ex = new ExtractContentJS.LayeredExtractor();
      ex.addHandler(ex.factory.getHandler('Heuristics'));
      var res = ex.extract(window.document);
      if (res.isSuccess) {
        this._article = res;
      }
    }
    return this._article;
  };

  Downsha.ContentClipper.prototype._clipSelection = function(stylingStrategy,
      attrs) {
    LOG.debug("ContentClipper._clipSelection");
    this._perform(false, stylingStrategy, attrs);
  };

  Downsha.ContentClipper.prototype._clipFullPage = function(stylingStrategy,
      attrs) {
    LOG.debug("ContentClipper._clipFullPage");
    this._perform(true, stylingStrategy, attrs);
  };

  Downsha.ContentClipper.prototype._clipArticle = function(stylingStrategy,
      attrs) {
    LOG.debug("ContentClipper._clipArticle");
    this.createClipObject(stylingStrategy);
    var el = this.getArticleElement();
    LOG.debug("Article element: ");
    LOG.debug(el);
    try {
      if (el && this.clip.clipElement(el)) {
        this._overloadClipNote(this.clip, attrs);
        if (logEnabled) {
          LOG.debug("Successful clip of element's contents: "
              + this.clip.toString());
          LOG.dir(this.clip.toDataObject());
        }
        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
          if (logEnabled)
            LOG.debug("Notifying full page clip failure");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else {
        if (logEnabled)
          LOG.debug("Failed to clip contents of given element");
        this.onClipFailure(chrome.i18n.getMessage("articleClipFailure"));
      }
    } catch (e) {
      if (logEnabled)
        LOG.exception("Exception clipping page or its selection"
            + ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
  };

  Downsha.ContentClipper.prototype._overloadClipNote = function(note, attrs) {
    if (note && attrs) {
      if (logEnabled) {
        LOG.debug("Overloading attrs: ");
        LOG.dir(attrs);
      }
      for ( var a in attrs) {
        if (attrs[a] && Downsha.hasOwnProperty(note, a)) {
          try {
            note[a] = attrs[a];
          } catch (e) {
          }
        }
      }
    }
  };

  Downsha.ContentClipper.prototype.createClipObject = function(stylingStrategy) {
    var self = this;
    this.clip = new Downsha.Clip(window, stylingStrategy,
        Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX);
    this.clip.onsizeexceed = function() {
      LOG.debug("Content size exceeded during serialization");
      self.onClipContentTooBig(self.clip);
    };
    return this.clip;
  };

  Downsha.ContentClipper.prototype._perform = function(fullPageOnly,
      stylingStrategy, attrs) {
    if (logEnabled)
      LOG.debug("Contentscript clipping...");

    // construct Downsha.Clip
    var self = this;
    this.createClipObject(stylingStrategy);
    if (logEnabled)
      LOG.debug("CLIP: " + this.clip.toString());

    try {
      if (!fullPageOnly && this.clip.hasSelection()
          && this.clip.clipSelection()) {
        this._overloadClipNote(this.clip, attrs);
        if (logEnabled)
          LOG.debug("Successful clip of selection: " + this.clip.toString());
        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
          if (logEnabled)
            LOG.debug("Notifying full page clip failure");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (this.clip.hasBody()) {
        this._overloadClipNote(this.clip, attrs);
        this.onClip(this.clip);
        if (logEnabled) {
          LOG.debug("Successful clip of full page: " + this.clip.toString());
        }
        if (this.clip.clipBody()) {
          if (this.clip.sizeExceeded
              || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
            if (logEnabled)
              LOG.debug("Notifying full page clip failure");
            this.onClipContentTooBig(this.clip);
          } else {
            if (logEnabled)
              LOG.debug("Notifying full page clip success");
            this.onClipContent(this.clip);
          }
        } else {
          this.onClipContentFailure(chrome.i18n
              .getMessage("fullPageClipFailure"));
        }
      } else {
        if (logEnabled)
          LOG.debug("Failed to clip full page");
        this.onClipFailure(chrome.i18n.getMessage("fullPageClipFailure"));
      }
    } catch (e) {
      // Can't construct a clip -- usually because the body is a frame
      if (logEnabled)
        LOG.debug("Exception clipping page or its selection"
            + ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
    if (logEnabled)
      LOG.debug("Done clipping...");
  };

  Downsha.ContentClipper.prototype.getWaitContainer = function() {
    var container = document.getElementById(this.WAIT_CONTAINER_ID);
    if (!container) {
      container = document.createElement("downshadiv");
      container.id = this.WAIT_CONTAINER_ID;
      var content = document.createElement("div");
      content.id = this.WAIT_CONTAINER_ID + "Content";
      container.appendChild(content);
      var center = document.createElement("center");
      content.appendChild(center);
      var spinner = document.createElement("img");
      spinner.setAttribute("src", "chrome-extension://"
          + chrome.i18n.getMessage("@@extension_id")
          + "/images/icon_scissors.png");
      center.appendChild(spinner);
      var text = document.createElement("span");
      text.id = this.WAIT_CONTAINER_ID + "Text";
      center.appendChild(text);
      container._waitMsgBlock = text;
      container.setMessage = function(msg) {
        this._waitMsgBlock.innerHTML = msg;
      };
    }
    return container;
  };

  Downsha.ContentClipper.prototype.wait = function() {
    var wait = this.getWaitContainer();
    wait.style.opacity = "1";
    wait.setMessage(chrome.i18n.getMessage("contentclipper_clipping"));
    document.body.appendChild(wait);
  };
  Downsha.ContentClipper.prototype.clearWait = function() {
    var wait = document.getElementById(this.WAIT_CONTAINER_ID);
    if (wait) {
      wait.style.opacity = "0";
      setTimeout(function() {
        wait.parentNode.removeChild(wait);
      }, 1000);
    }
  };

})();

