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
 * Downsha
 * Errors
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
Downsha.DownshaError = function DownshaError(errorCodeOrObj, message,
    parameter) {
  this.__defineGetter__("errorCode", this.getErrorCode);
  this.__defineSetter__("errorCode", this.setErrorCode);
  this.__defineGetter__("modelName", this.getModelName);
  this.initialize(errorCodeOrObj, message, parameter);
};
Downsha.DownshaError.CLASS_FIELD = "javaClass";
Downsha.DownshaError.ERROR_CODE_FIELD = "errorCode";
Downsha.DownshaError.MESSAGE_FIELD = "message";
Downsha.DownshaError.PARAMETER_FIELD = "parameter";
Downsha.DownshaError.javaClass = "com.downsha.web.DownshaError";
Downsha.DownshaError.prototype.handleInheritance = function(child, parent) {
  if (typeof child.prototype.constructor[Downsha.DownshaError.CLASS_FIELD] == 'string') {
    Downsha.DownshaError.Registry[child.prototype.constructor[Downsha.DownshaError.CLASS_FIELD]] = child;
  }
};
Downsha.DownshaError.prototype._errorCode = null;
Downsha.DownshaError.prototype.message = null;
Downsha.DownshaError.prototype.parameter = null;
Downsha.DownshaError.prototype.getModelName = function() {
  return this.constructor.name;
};
Downsha.DownshaError.prototype.initialize = function(errorCodeOrObj, message,
    parameter) {
  if (errorCodeOrObj && typeof errorCodeOrObj == 'object') {
    if (typeof errorCodeOrObj[Downsha.DownshaError.ERROR_CODE_FIELD] != 'undefined') {
      this.errorCode = errorCodeOrObj[Downsha.DownshaError.ERROR_CODE_FIELD];
    }
    if (typeof errorCodeOrObj[Downsha.DownshaError.MESSAGE_FIELD] != 'undefined') {
      this.message = errorCodeOrObj[Downsha.DownshaError.MESSAGE_FIELD];
    }
    if (typeof errorCodeOrObj[Downsha.DownshaError.PARAMETER_FIELD] != 'undefined') {
      this.parameter = errorCodeOrObj[Downsha.DownshaError.PARAMETER_FIELD];
    }
  } else {
    if (typeof errorCodeOrObj != 'undefined')
      this.errorCode = errorCodeOrObj;
    if (typeof message != 'undefined')
      this.message = message;
    if (typeof parameter != 'undefined')
      this.parameter = parameter;
  }
};
Downsha.DownshaError.prototype.setErrorCode = function(errorCode) {
  this._errorCode = (isNaN(parseInt(errorCode))) ? null : parseInt(errorCode);
};
Downsha.DownshaError.prototype.getErrorCode = function() {
  return this._errorCode;
};
Downsha.DownshaError.prototype.getClassName = function() {
  return (typeof this.constructor[Downsha.DownshaError.CLASS_FIELD] != 'undefined') ? this.constructor[Downsha.DownshaError.CLASS_FIELD]
      : null;
};
Downsha.DownshaError.prototype.getShortClassName = function() {
  var className = this.getClassName();
  if (typeof className == 'string') {
    var parts = className.split(".");
    className = parts[parts.length - 1];
  }
  return className;
};
Downsha.DownshaError.prototype.toJSON = function() {
  var obj = {
    errorCode : this.errorCode,
    message : this.message,
    parameter : this.parameter
  };
  if (this.constructor[Downsha.DownshaError.CLASS_FIELD]) {
    obj[Downsha.DownshaError.CLASS_FIELD] = this.constructor[Downsha.DownshaError.CLASS_FIELD];
  }
  return obj;
};
Downsha.DownshaError.prototype.toString = function() {
  var className = this.getShortClassName();
  if (className == null)
    return "Downsha.DownshaError";
  return (className + " (" + this.errorCode + ") [" + this.parameter + "]" + ((typeof this.message == 'string') ? this.message
      : ""));
};
Downsha.DownshaError.Registry = {};
Downsha.DownshaError.responsibleConstructor = function(className) {
  if (typeof Downsha.DownshaError.Registry[className] == 'function') {
    return Downsha.DownshaError.Registry[className];
  } else {
    return Downsha.DownshaError;
  }
};
Downsha.DownshaError.fromObject = function(obj) {
  if (obj instanceof Downsha.DownshaError) {
    return obj;
  } else if (typeof obj == 'object' && obj) {
    return Downsha.DownshaError.unmarshall(obj);
  } else {
    return new Downsha.DownshaError();
  }
};
Downsha.DownshaError.unmarshall = function(obj) {
  var newObj = null;
  if (typeof obj != 'object' || !obj) {
    return obj;
  }
  if (typeof obj[Downsha.DownshaError.CLASS_FIELD] == 'string'
      && typeof Downsha.DownshaError.Registry[obj[Downsha.DownshaError.CLASS_FIELD]] == 'function') {
    var constr = Downsha.DownshaError.Registry[obj[Downsha.DownshaError.CLASS_FIELD]];
    newObj = new constr();
  } else {
    newObj = new this();
  }
  if (newObj) {
    if (obj["errorCode"]) {
      newObj.errorCode = obj.errorCode;
    }
    if (obj["message"]) {
      newObj.message = obj.message;
    }
    if (obj["parameter"]) {
      newObj.parameter = obj.parameter;
    }
  }
  return newObj;
};
Downsha.DownshaError.marshall = function(data) {
  if (data instanceof Array) {
    var newArray = new Array();
    for ( var i = 0; i < data.length; i++) {
      newArray.push(Downsha.DownshaError._marshall(data[i]));
    }
    return newArray;
  } else {
    return Downsha.DownshaError._marshall(data);
  }
};
Downsha.DownshaError._marshall = function(data) {
  if (data instanceof Downsha.DownshaError) {
    return data.toJSON();
  } else {
    return data;
  }
};

/**
 * Generic Downsha.Exception
 */
Downsha.Exception = function Exception(errorCodeOrObj, message) {
  this.initialize(errorCodeOrObj, message, null);
};
Downsha.Exception.javaClass = "java.lang.Exception";
Downsha.inherit(Downsha.Exception, Downsha.DownshaError);
Downsha.Exception.prototype._errorCode = 0;

/**
 * Downsha.EDAMSystemException
 */
Downsha.EDAMSystemException = function EDAMSystemException(errorCodeOrObj,
    message) {
  this.initialize(errorCodeOrObj, message);
};
Downsha.EDAMSystemException.javaClass = "com.downsha.edam.error.EDAMSystemException";
Downsha.inherit(Downsha.EDAMSystemException, Downsha.Exception);

/**
 * Downsha.EDAMUserException
 */
Downsha.EDAMUserException = function EDAMUserException(errorCodeOrObj,
    message, parameter) {
  this.initialize(errorCodeOrObj, message, parameter);
};
Downsha.EDAMUserException.javaClass = "com.downsha.edam.error.EDAMUserException";
Downsha.inherit(Downsha.EDAMUserException, Downsha.Exception);

/**
 * Downsha.EDAMResponseException holds various errors associated with actual
 * responses from the server
 * 
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.EDAMResponseException = function EDAMResponseException(errorCodeOrObj,
    message) {
  this.initialize(errorCodeOrObj, message);
};
Downsha.EDAMResponseException.javaClass = "com.downsha.edam.error.EDAMResponseException";
Downsha.inherit(Downsha.EDAMResponseException, Downsha.DownshaError);

/**
 * Downsha.ValidationError is a base for various types of validation errors.
 * Validation errors are responses from the server indicating that there was a
 * problem validating request with its parameters.
 * 
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.ValidationError = function ValidationError(errorCodeOrObj, message,
    parameter) {
  this.initialize(errorCodeOrObj, message, parameter);
};
Downsha.ValidationError.GLOBAL_PARAMETER = "__stripes_global_error";
Downsha.ValidationError.javaClass = "net.sourceforge.stripes.validation.ValidationError";
Downsha.inherit(Downsha.ValidationError, Downsha.DownshaError);
Downsha.ValidationError.prototype.isGlobal = function() {
  return (this.parameter == null || this.parameter == Downsha.ValidationError.GLOBAL_PARAMETER);
};

/**
 * Downsha.SimpleError is a simple type of validation error. It has no error
 * codes associated with it. Just messages.
 * 
 * @param message
 * @return
 */
Downsha.SimpleError = function SimpleError(message) {
  this.initialize(null, message, null);
};
Downsha.SimpleError.javaClass = "net.sourceforge.stripes.validation.SimpleError";
Downsha.inherit(Downsha.SimpleError, Downsha.ValidationError);

/**
 * Downsha.ScopedLocalizableError is like a Downsha.SimpleError but provides
 * an error code and optionally a message and a parameter. Parameter indicates
 * which part of the request this error refers to.
 * 
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.ScopedLocalizableError = function ScopedLocalizableError(
    errorCodeOrObj, message, parameter) {
  this.initialize(errorCodeOrObj, message, parameter);
};
Downsha.ScopedLocalizableError.javaClass = "net.sourceforge.stripes.validation.ScopedLocalizableError";
Downsha.inherit(Downsha.ScopedLocalizableError, Downsha.SimpleError);

/**
 * Downsha.EDAMScopedError is like a Downsha.ScopedLocalizableError but is
 * bound to Downsha.EDAMErrorCode's. These are typically included in a response
 * when a custom validation failed.
 * 
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.EDAMScopedError = function EDAMScopedError(errorCodeOrObj, message,
    parameter) {
  this.initialize(errorCodeOrObj, message, parameter);
};
Downsha.EDAMScopedError.javaClass = "com.downsha.web.EDAMScopedError";
Downsha.inherit(Downsha.EDAMScopedError, Downsha.ScopedLocalizableError);


Downsha.DefiningMixin = function DefiningMixin() {
};

Downsha.DefiningMixin._getTargetFor = function(caller) {
  if (typeof caller == 'function' && caller == caller.prototype.constructor) {
    return caller.prototype;
  } else {
    return caller;
  }
};

Downsha.DefiningMixin.prototype.__defineBoolean__ = function(fieldName,
    defaultValue, dontIncludeGetter, dontIncludeSetter) {
  var protoFieldName = "_" + fieldName;
  var rootName = fieldName.substring(0, 1).toUpperCase()
      + fieldName.substring(1);
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  target[protoFieldName] = (defaultValue) ? true : false;
  if (!dontIncludeGetter) {
    var getterName = "is" + rootName;
    target[getterName] = function() {
      return this[protoFieldName];
    };
    this.__defineGetter__(fieldName, target[getterName]);
  }
  if (!dontIncludeSetter) {
    var setterName = "set" + rootName;
    target[setterName] = function(bool) {
      this[protoFieldName] = (bool) ? true : false;
    };
    this.__defineSetter__(fieldName, target[setterName]);
  }
};

Downsha.DefiningMixin.prototype.__defineFloat__ = function(fieldName,
    defaultValue, dontIncludeGetter, dontIncludeSetter) {
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  this._createNumericDefinition_(target, fieldName, defaultValue, false,
      parseFloat, dontIncludeGetter, dontIncludeSetter);
};

Downsha.DefiningMixin.prototype.__definePositiveFloat__ = function(fieldName,
    defaultValue, dontIncludeGetter, dontIncludeSetter) {
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  this._createNumericDefinition_(target, fieldName, defaultValue, true,
      parseFloat, dontIncludeGetter, dontIncludeSetter);
};

Downsha.DefiningMixin.prototype.__defineInteger__ = function(fieldName,
    defaultValue, dontIncludeGetter, dontIncludeSetter) {
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  this._createNumericDefinition_(target, fieldName, defaultValue, false,
      parseInt, dontIncludeGetter, dontIncludeSetter);
};

Downsha.DefiningMixin.prototype.__definePositiveInteger__ = function(
    fieldName, defaultValue, dontIncludeGetter, dontIncludeSetter) {
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  this._createNumericDefinition_(target, fieldName, defaultValue, true,
      parseInt, dontIncludeGetter, dontIncludeSetter);
};

Downsha.DefiningMixin.prototype._createNumericDefinition_ = function(target,
    fieldName, defaultValue, positiveValuesOnly, parseFn, dontIncludeGetter,
    dontIncludeSetter) {
  var rootName = fieldName.substring(0, 1).toUpperCase()
      + fieldName.substring(1);
  var protoFieldName = "_" + fieldName;
  defaultValue = (typeof defaultValue == 'number') ? defaultValue : null;
  if (!target) {
    target = this;
  }
  target[protoFieldName] = defaultValue;
  if (!dontIncludeGetter) {
    var getterName = "get" + rootName;
    target[getterName] = function() {
      return this[protoFieldName];
    };
    this.__defineGetter__(fieldName, target[getterName]);
  }
  if (!dontIncludeSetter) {
    var setterName = "set" + rootName;
    target[setterName] = (positiveValuesOnly) ? function(integer) {
      this[protoFieldName] = parseFn(integer);
      if (isNaN(this[protoFieldName]) || this[protoFieldName] < 0) {
        this[protoFieldName] = defaultValue;
      }
    } : function(integer) {
      this[protoFieldName] = parseFn(integer);
      if (isNaN(this[protoFieldName])) {
        this[protoFieldName] = defaultValue;
      }
    };
    this.__defineSetter__(fieldName, target[setterName]);
  }
};

Downsha.DefiningMixin.prototype.__defineString__ = function(fieldName,
    defaultValue, dontIncludeGetter, dontIncludeSetter) {
  defaultValue = (defaultValue) ? defaultValue : null;
  var rootName = fieldName.substring(0, 1).toUpperCase()
      + fieldName.substring(1);
  var protoFieldName = "_" + fieldName;
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  target[protoFieldName] = defaultValue;
  if (!dontIncludeGetter) {
    var getterName = "get" + rootName;
    target[getterName] = function() {
      return this[protoFieldName];
    };
    this.__defineGetter__(fieldName, target[getterName]);
  }
  if (!dontIncludeSetter) {
    var setterName = "set" + rootName;
    target[setterName] = function(string) {
      if (typeof string == 'string') {
        this[protoFieldName] = string;
      } else if (!string) {
        this[protoFieldName] = defaultValue;
      } else {
        this[protoFieldName] = "" + string;
      }
    };
    this.__defineSetter__(fieldName, target[setterName]);
  }
};

Downsha.DefiningMixin.prototype.__defineType__ = function(fieldName, type,
    defaultValue, dontIncludeGetter, dontIncludeSetter) {
  defaultValue = (defaultValue) ? defaultValue : null;
  var protoFieldName = "_" + fieldName;
  var rootName = fieldName.substring(0, 1).toUpperCase()
      + fieldName.substring(1);
  var target = Downsha.DefiningMixin._getTargetFor(arguments.callee.caller);
  target[protoFieldName] = defaultValue;
  if (!dontIncludeGetter) {
    var getterName = "get" + rootName;
    target[getterName] = function() {
      return this[protoFieldName];
    };
    this.__defineGetter__(fieldName, target[getterName]);
  }
  if (!dontIncludeSetter) {
    var setterName = "set" + rootName;
    target[setterName] = function(obj) {
      if (typeof type == 'string' && obj && obj.constructor.name == type) {
        this[protoFieldName] = obj;
      } else if (typeof type == 'function' && obj instanceof type) {
        this[protoFieldName] = obj;
      } else if (!obj) {
        this[protoFieldName] = defaultValue;
      } else {
        throw new Error("Expected "
            + ((typeof type == 'string') ? type : type.name) + " but got "
            + (typeof obj));
      }
    };
    this.__defineSetter__(fieldName, target[setterName]);
  }
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

  Downsha.FileLogger = function FileLogger(type, size, root, success, error) {
    this.__defineString__("root", "/");
    this.__definePositiveInteger__("maxLogSize", 2 * 1024 * 1024);
    this.initialize(type, size, root, success, error);
  };

  Downsha.mixin(Downsha.FileLogger, Downsha.DefiningMixin);

  Downsha.FileLogger.FSA_SIZE = 5 * 1024 * 1024;

  Downsha.FileLogger.prototype._fsa = null;
  Downsha.FileLogger.prototype._sema = null;
  Downsha.FileLogger.prototype._logFile = null;
  Downsha.FileLogger.prototype._logFileEntry = null;

  Downsha.FileLogger.prototype.initialize = function(type, size, root,
      success, error) {
    this.root = root;
    this._sema = Downsha.Semaphore.mutex();
    var self = this;
    var err = function(err) {
      self._sema.signal();
      if (typeof error == 'function') {
        error();
      }
      self.onerror(err);
    };
    var ok = function() {
      if (typeof success == 'function') {
        success(self);
      }
      self._sema.signal();
    };
    var fsaSize = (typeof size == 'number') ? size : this.constructor.FSA_SIZE;
    this._sema.critical(function() {
      self._fsa = new Downsha.FSA(type, fsaSize, function() {
        self._fsa.getCreateDirectory(self.root, function(dirEntry) {
          self._fsa.changeDirectory(dirEntry.fullPath, function(dirEntry) {
            self._fsa.listFiles(dirEntry.fullPath, function(files) {
              Downsha.FSA.sortEntries(files, function(f, cb) {
                f.getMetadata(function(meta) {
                  cb(meta.modificationTime.getTime(), f);
                });
              }, function(a, b) {
                if (a == b) {
                  return 0;
                } else {
                  return (a > b) ? 1 : -1;
                }
              }, function(sortedFiles) {
                if (sortedFiles.length > 0
                    && sortedFiles[sortedFiles.length - 1]) {
                  sortedFiles[sortedFiles.length - 1].file(function(lastFile) {
                    self._logFile = lastFile;
                    self._logFileEntry = sortedFiles[sortedFiles.length - 1];
                    ok();
                  }, err);
                } else {
                  ok();
                }
              });
            }, err);
          }, err);
        }, err);
      }, err);
    });
  };

  Downsha.FileLogger.prototype.onerror = function(err) {
      try {
          var msg = Downsha.Utils.errorDescription(err);
          console.error(msg);
      } catch(e) {
          console.error(err);
      }
  };

  Downsha.FileLogger.formatDateNumber = function(num) {
    if (num < 10) {
      return "0" + num;
    } else {
      return "" + num;
    }
  };

  Downsha.FileLogger.prototype.getNewLogFilename = function() {
    var d = new Date();
    var fname = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear()
        + "_" + Downsha.FileLogger.formatDateNumber(d.getHours()) + "_"
        + Downsha.FileLogger.formatDateNumber(d.getMinutes()) + "_"
        + Downsha.FileLogger.formatDateNumber(d.getSeconds()) + ".log";
    return fname;
  };

  Downsha.FileLogger.prototype.getCurrentLogFilename = function() {
    return (this._logFileEntry) ? this._logFileEntry.name : null;
  };

  Downsha.FileLogger.prototype._getLogFile = function(callback) {
    var self = this;
    if (this._logFileEntry) {
      callback(this._logFileEntry);
    } else {
      this._swapLogFile(callback);
    }
  };

  Downsha.FileLogger.prototype._swapLogFile = function(callback) {
    var self = this;
    // return;
    this._fsa.getCreateFile(this.getNewLogFilename(), function(fileEntry) {
      fileEntry.file(function(file) {
        self._logFile = file;
        self._logFileEntry = fileEntry;
        self._logFileWriter = null;
        self.onlogswap(fileEntry);
        callback(fileEntry);
      }, self.error);
    }, self.onerror);
  };

  Downsha.FileLogger.prototype._getLogFileWriter = function(callback) {
    var self = this;
    if (this._logFileEntry && this._logFileWriter) {
      callback(this._logFileWriter);
    } else {
      this._getLogFile(function(fileEntry) {
        fileEntry.createWriter(function(writer) {
          self._logFileWriter = writer;
          callback(writer);
        });
      }, this.onerror);
    }
  };

  Downsha.FileLogger.prototype.releaseLogFile = function() {
    this._logFileEntry = null;
    this._logFileWriter = null;
  };

  Downsha.FileLogger.prototype.onlogswap = function(fileEntry) {
  };

  Downsha.FileLogger.prototype.listLogFiles = function(success, error) {
    var self = this;
    this._sema.critical(function() {
      self._fsa.listFiles(self._fsa.currentDirectory, function(files) {
        if (typeof success == 'function') {
          success(files);
        }
        self._sema.signal();
      }, function(err) {
        self.onfsaerror();
        if (typeof error == 'function') {
          error(err);
        }
        self._sema.signal();
      });
    });
  };

  Downsha.FileLogger.prototype.log = function(str) {
    var self = this;
    if (this._logFile
        && (this._logFile.fileSize + str.length) >= this.maxLogSize) {
      this._logFile = null;
      this._logFileEntry = null;
      this._logFileWriter = null;
    }
    this._log(str);
  };

  Downsha.FileLogger.prototype.log2 = function(str) {
    var self = this;
    if (!this._logFile
        || (this._logFile.fileSize + str.length) >= this.maxLogSize) {
      this._swapLogFile(function() {
        self._log(str);
      });
    } else {
      this._log(str);
    }
  };

  Downsha.FileLogger.prototype._log = function(str) {
    var self = this;
    this._sema.critical(function() {
      self._getLogFileWriter(function(writer) {
        writer.seek(writer.length);
        writer.onwriteend = function() {
          self._sema.signal();
        };
        var bb = self._fsa.createBlobBuilder();
        bb.append(str + "\n");
        writer.write(bb.getBlob());
      }, self.onerror);
    });
  };

  Downsha.FileLogger.prototype.clear = function() {
    var self = this;
    if (this._logFileEntry) {
      this._logFileEntry.truncate();
    }
  };
})();


/**
 * Chrome specific logger implementation to be used with Chrome extensions
 * 
 * @author pasha
 */
Downsha.FileLoggerImpl = function FileLoggerImpl(logger) {
  this.__defineGetter__("fileLogger", this.getFileLogger);
  this.__defineGetter__("keepFiles", this.getKeepFiles);
  this.__defineSetter__("keepFiles", this.setKeepFiles);
  this.initialize(logger);
};
Downsha.inherit(Downsha.FileLoggerImpl, Downsha.LoggerImpl, true);

Downsha.FileLoggerImpl.prototype.handleLogRemoval = function(request, sender,
    sendRequest) {
  if (typeof request == 'object'
      && request.code == Downsha.Constants.RequestType.LOG_FILE_REMOVED
      && request.message) {
    this.logger.debug("Received notification about a log file being removed");
    var logName = request.message;
    var fileLogger = this.getFileLogger();
    var currentLogName = fileLogger.getCurrentLogFilename();
    this.logger.debug("Comparing removed file with local " + logName + "?="
        + currentLogName);
    if (logName == currentLogName) {
      this.logger.debug("Releasing current log file");
      fileLogger.releaseLogFile();
    }
  }
};

Downsha.FileLoggerImpl.isResponsibleFor = function(navigator) {
  return (navigator.userAgent.toLowerCase().indexOf("chrome/") > 0);
};

Downsha.FileLoggerImpl.LOG_DIRECTORY = "/logs";
Downsha.FileLoggerImpl.FILE_LOGGER_FSA_SIZE = 5 * 1024 * 1024;

Downsha.FileLoggerImpl.prototype._enabled = false;
Downsha.FileLoggerImpl.prototype._keepFiles = 2;

Downsha.FileLoggerImpl.getProtoKeepFiles = function() {
  return this.prototype._keepFiles;
};
Downsha.FileLoggerImpl.setProtoKeepFiles = function(num) {
  this.prototype._keepFiles = parseInt(num);
  if (isNaN(this.prototype._keepFiles) || this.prototype._keepFiles < 0) {
    this.prototype._keepFiles = 0;
  }
};
Downsha.FileLoggerImpl.prototype.getKeepFiles = function() {
  return this._keepFiles;
};
Downsha.FileLoggerImpl.prototype.setKeepFiles = function(num) {
  this._keepFiles = parseInt(num);
  if (isNaN(this._keepFiles) || this._keepFiles < 0) {
    this._keepFiles = 0;
  }
};
Downsha.FileLoggerImpl.prototype.dump = function(obj) {
  this.dir(obj);
};
Downsha.FileLoggerImpl.prototype.dir = function(obj) {
  var str = ">" + this.logger.scopeName + "\n";
  try {
    if (typeof obj == 'object' && obj
        && typeof Downsha[obj.constructor.name] != 'undefined') {
      str += obj.constructor.name;
      str += JSON.stringify(obj.toLOG());
    } else if (typeof obj == 'object' && obj && typeof obj.toLOG == 'function') {
      str += JSON.stringify(obj.toLOG());
    } else {
      str += JSON.stringify(obj);
    }
  } catch (e) {
    str += obj;
  }
  str += "\n";
  str += "<" + this.logger.scopeName;
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.debug = function(str) {
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.info = function(str) {
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.warn = function(str) {
  this._logToFile(str);
};
Downsha.FileLoggerImpl.prototype.error = function(str) {
  this._logToFile(str);
  if (this.logger.isDebugEnabled() && str instanceof Error) {
    this._logToFile(str.stack);
  }
};
Downsha.FileLoggerImpl.prototype.exception = function(str) {
  this._logToFile(str);
  if (this.logger.isDebugEnabled() && str instanceof Error) {
    this._logToFile(str.stack);
  }
};
Downsha.FileLoggerImpl.prototype.clear = function() {
  this.fileLogger.clear();
};
Downsha.FileLoggerImpl.prototype.getFileLogger = function() {
  var self = this;
  if (!this.constructor.prototype._fileLogger) {
    this.constructor.prototype._fileLogger = new Downsha.FileLogger(
        PERSISTENT, this.constructor.FILE_LOGGER_FSA_SIZE,
        this.constructor.LOG_DIRECTORY, function(fileLogger) {
          // upon intialization of FileLogger, let's add an event listener for
        // LOG_FILE_REMOVED message so that we can release log files from
        // FileLogger
        chrome.extension.onRequest
            .addListener(function(request, sender, sendRequest) {
              if (typeof request == 'object'
                  && request.code == Downsha.Constants.RequestType.LOG_FILE_REMOVED
                  && request.message) {
                self.logger
                    .debug("Received notification about a log file being removed");
                var logName = request.message;
                var currentLogName = fileLogger.getCurrentLogFilename();
                self.logger.debug("Comparing removed file with local "
                    + logName + "?=" + currentLogName);
                if (logName == currentLogName) {
                  self.logger.debug("Releasing current log file");
                  fileLogger.releaseLogFile();
                }
              }
              try {
                  sendRequest( {});
              } catch(e) {
                  // not a big deal?!
              }
            });
      });
    this.constructor.prototype._fileLogger.maxLogSize = 2 * 1024 * 1024;
    this.constructor.prototype._fileLogger.onlogswap = function(newLogFile) {
      self.constructor.prototype._fileLogger
          .listLogFiles(function(fileEntries) {
            var oldAge = new Date(Date.now()
                - (self._keepFiles * 24 * 60 * 60 * 1000));
            var chainedDeleter = function(fileArray, callback, index) {
              index = (index) ? index : 0;
              if (index >= fileArray.length) {
                if (typeof callback == 'function') {
                  callback();
                }
              } else {
                fileArray[index].file(function(f) {
                  LOG.debug("Checking if " + f.name + " is older than "
                      + oldAge.toString());
                  LOG.debug(f.lastModifiedDate.toString());
                  if (f.lastModifiedDate.isBefore(oldAge)
                      && f.name != newLogFile.name) {
                    LOG.debug("Removing old log file: " + f.name + " -> "
                        + fileArray[index].name);
                    fileArray[index].remove(function() {
                      chainedDeleter(fileArray, callback, ++index);
                    });
                  } else {
                    chainedDeleter(fileArray, callback, ++index);
                  }
                });
              }
            };
            chainedDeleter(fileEntries, function() {
              chrome.extension.sendRequest(new Downsha.RequestMessage(
                  Downsha.Constants.RequestType.LOG_FILE_SWAPPED));
            });
          });
    };
  }
  return this.constructor.prototype._fileLogger;
};
Downsha.FileLoggerImpl.prototype._logToFile = function(str) {
  if (this.enabled) {
    this.fileLogger.log(str);
  }
};

/*
 * Downsha.LocalStore
 * 
 * Created by Pavel Skaldin on 3/31/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */

/**
 * Downsha.LocalStore provides single interface for locally storing key-value data on the client.
 * Currently there are two implementation:
 *   Downsha.LocalStore.DEFAULT_IMPL - which stores data inside an object
 *   Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL - which utilized HTML5's localStorage feature
 *   
 * Downsha.LocalStore requires that each instance has a name to distinguish it from other stores.
 * It provides the following interface:
 *   get(key) - to retrieve value associated with given key
 *   put(key, value) - to store key-value association
 *   remove(key) - to remove stored key-value association
 *   clear() - to remove all stored key-value associations
 *   getLength() - returns total number of stored associations
 */
Downsha.LocalStore = function LocalStore(name, impl) {
  this.initialize(name, impl);
  this.__defineGetter__("length", this.getLength);
};
Downsha.LocalStore.prototype.initialize = function(name, impl) {
  if (typeof name == 'string')
    this.storeName = name;
  else
    this.storeName = Downsha.LocalStore.DEFAULT_STORE_NAME;
  this.impl = (impl) ? impl : new Downsha.LocalStore.DEFAULT_IMPL();
  this.impl.store = this;
};
Downsha.LocalStore.prototype.get = function(key) {
  return this.impl.get(key);
};

Downsha.LocalStore.prototype.put = function(key, value) {
  this.impl.put(key, value);
};
Downsha.LocalStore.prototype.remove = function(key) {
  this.impl.remove(key);
};
Downsha.LocalStore.prototype.clear = function() {
  this.impl.clear();
};
Downsha.LocalStore.prototype.getLength = function() {
  return this.impl.length;
};
Downsha.LocalStore.DEFAULT_STORE_NAME = "Downsha.LocalStore";

/**
 * Default object based storage implementation
 */
Downsha.LocalStore.DEFAULT_IMPL = function() {
  this.initialize();
  this.__defineGetter__("length", this.getLength);
};
Downsha.LocalStore.DEFAULT_IMPL.prototype.store = null;
Downsha.LocalStore.DEFAULT_IMPL.prototype._cache = null;
Downsha.LocalStore.DEFAULT_IMPL.prototype._countDelta = 0;
Downsha.LocalStore.DEFAULT_IMPL.prototype.initialize = function() {
  this._cache = {};
  this._countDelta = 0;
  for ( var i = 0; i < this._cache.length; i++) {
    this._countDelta++;
  }
};
Downsha.LocalStore.DEFAULT_IMPL.prototype.clear = function() {
  this.initialize();
};
Downsha.LocalStore.DEFAULT_IMPL.prototype.get = function(key) {
  return this._cache[key];
};
Downsha.LocalStore.DEFAULT_IMPL.prototype.put = function(key, value) {
  this._cache[key] = value;
};
Downsha.LocalStore.DEFAULT_IMPL.prototype.remove = function(key) {
  if (typeof this._cache[key] != 'undefined') {
    delete (this._cache[key]);
  }
};
Downsha.LocalStore.DEFAULT_IMPL.prototype.getLength = function() {
  var l = 0;
  for ( var i in this._cache) {
    l++;
  }
  return l - this._countDelta;
};

/**
 * Default storage utilizing HTML5's localStorage object. Simply pass
 * localStorage object when instantiating this implementation. This localStorage
 * object is usually available as window.localStorage.
 */
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL = function(localStorage) {
  this.initialize(localStorage);
  this.__defineGetter__("length", this.getLength);
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.store = null;
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype._cache = null;
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.initialize = function(localStorage) {
  this._cache = localStorage;
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.clear = function() {
  this._cache.clear();
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.get = function(key) {
  var value = this._cache.getItem(key);
  if (value)
    return this.unmarshall(value);
  else
    return null;
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.put = function(key, value) {
  this._cache.setItem(key, this.marshall(value));
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.remove = function(key) {
  this._cache.removeItem(key);
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.getLength = function() {
  return this._cache.length;
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.marshall = function(data) {
  return JSON.stringify(data);
};
Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL.prototype.unmarshall = function(data) {
    if (data === undefined || data === null) {
        return data;
    }
    var ret = null;
    try {
        ret = JSON.parse(data);
    } catch(e) {
        if (console && typeof console.log == 'function') {
            console.error(e);
            console.log(e.stack);
        }
    }
    return ret;
};

(function() {
  var LOG = null;
  Downsha.FSA = function FSA(type, size, successCallback, errorCallback) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(type, size, successCallback, errorCallback);
  };

  Downsha.FSA.prototype._type = null;
  Downsha.FSA.prototype._size = 0;
  Downsha.FSA.prototype._fsys = null;
  Downsha.FSA.prototype._sema = null;
  Downsha.FSA.prototype._currentDirectory = null;

  Downsha.FSA.prototype.initialize = function(type, size, successCallback,
      errorCallback) {
    var self = this;
    this.__defineGetter__("root", this.getRoot);
    this.__defineGetter__("currentDirectory", this.getCurrentDirectory);
    this._type = parseInt(type);
    if (isNaN(this._type) || this._type < 0) {
      this._type = 0;
    }
    this._size = parseInt(size);
    if (isNaN(this._size) || this._size < 0) {
      this._size = 0;
    }
    this._sema = Downsha.Semaphore.mutex();
    this._sema.critical(function() {
      self.requestFileSystem(this._type, this._size, function(fsObj) {
        LOG.debug("Successful request for FileSystem");
        self._fsys = fsObj;
        self._sema.signal();
        if (typeof successCallback == 'function') {
          successCallback(fsObj);
        }
      }, function(e) {
        LOG.error("Failed request for FileSystem: " + e.code);
        self._sema.signal();
        if (typeof errorCallback == 'function') {
          errorCallback(e);
        }
      });
    });
  };
  Downsha.FSA.prototype.requestFileSystem = function(type, size, success,
      error) {
    if (typeof window.requestFileSystem == 'function') {
      window.requestFileSystem(type, size, success, error);
    } else if (typeof window.webkitRequestFileSystem == 'function') {
      window.webkitRequestFileSystem(type, size, success, error);
    } else {
      throw new Downsha.FSAError(
          Downsha.FSAError.NO_SUITABLE_FILESYSTEM_REQUESTOR);
    }
  };
  Downsha.FSA.prototype.createBlobBuilder = function() {
    if (typeof BlobBuilder == 'function') {
      return new BlobBuilder();
    } else if (typeof WebKitBlobBuilder == 'function') {
      return new WebKitBlobBuilder();
    } else {
      throw new Downsha.FSAError(Downsha.FSAError.NO_SUITABLE_BLOB_BUILDER);
    }
  };
  Downsha.FSA.prototype.getRoot = function() {
    if (this._fsys) {
      return this._fsys.root;
    } else {
      return undefined;
    }
  };
  Downsha.FSA.prototype.dirname = function(path) {
    var parts = path.split("/");
    parts.splice(-1);
    return parts.join("/");
  };
  Downsha.FSA.prototype.getCurrentDirectory = function() {
    if (!this._currentDirectory) {
      this._currentDirectory = this.root;
    }
    return this._currentDirectory;
  };
  Downsha.FSA.prototype.changeDirectory = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.changeDirectory: " + path);
    var self = this;
    this._getDirectory(path, null, function(dir) {
      LOG.debug("Successfully changed directory to: " + dir.fullPath);
      self._currentDirectory = dir;
      if (typeof successCallback == 'function') {
        successCallback.apply(self, arguments);
      }
    }, function(e) {
      LOG.error("Error changing directory to: " + path);
      if (typeof errorCallback == 'function') {
        errorCallback.apply(self, arguments);
      }
    });
  };
  Downsha.FSA.prototype.createDirectory = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.createDirectory: " + path);
    this._getDirectory(path, {
      create : true,
      exclusive : true
    }, successCallback, errorCallback);
  };
  Downsha.FSA.prototype.getCreateDirectory = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.getCreateDirectory: " + path);
    this._getDirectory(path, {
      create : true
    }, successCallback, errorCallback);
  };
  Downsha.FSA.prototype.ensureDirectory = function(path, successCallback,
      errorCallback, startAt, curDir) {
    LOG.debug("FSA.ensureDirectory");
    var self = this;
    var parts = (path instanceof Array) ? path : path.split("/");
    var r = this.currentDirectory;
    if (!startAt || startAt < 0) {
      startAt = 0;
    }
    while (startAt <= (parts.length - 1) && !parts[startAt]) {
      r = this.root;
      startAt++;
    }
    if (startAt >= parts.length) {
      if (typeof successCallback == 'function') {
        successCallback(r);
        return;
      }
    }
    if (!curDir) {
      curDir = this.currentDirectory;
    }
    LOG.debug("Attempting to retrieve/create directory: "
        + parts.slice(startAt, startAt + 1));
    this.getCreateDirectory(parts.slice(startAt, startAt + 1), function(dir) {
      if (startAt < (parts.length - 1)) {
        self._currentDirectory = dir;
        self.ensureDirectory(parts, successCallback, errorCallback,
            (startAt + 1), curDir);
      } else {
        // TODO: properly restore orig dir
        if (typeof successCallback == 'function') {
          successCallback(dir);
        }
        self._currentDirectory = curDir;
      }
    }, function(e) {
      LOG.debug("Failed to ensure existence of directory: " + parts.join("/")
          + "(" + e.code + ")");
      self._currentDirectory = curDir;
      if (typeof errorCallback == 'function') {
        errorCallback.apply(self, arguments);
      }
    });
  };
  Downsha.FSA.prototype.getDirectory = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.getDirectory: " + path);
    this._getDirectory(path, {
      create : false
    }, successCallback, errorCallback);
  };
  Downsha.FSA.prototype._getDirectory = function(path, flags, successCallback,
      errorCallback) {
    LOG.debug("FSA._getDirectory: " + path);
    var self = this;
    this._sema.critical(function() {
      self.currentDirectory.getDirectory(path, flags, function(dir) {
        LOG.debug("Successfully obtained directory entry: " + dir.fullPath);
        self._sema.signal();
        if (typeof successCallback == 'function') {
          successCallback.apply(self, arguments);
        }
      }, function(e) {
        LOG.error("Failed to obtain directory entry for: " + path + "("
            + e.code + ")");
        self._sema.signal();
        if (typeof errorCallback == 'function') {
          errorCallback.apply(self, arguments);
        }
      });
    });
  };
  Downsha.FSA.prototype.list = function(dir, success, error) {
    LOG.debug("FSA.listDirectory");
    var self = this;
    if (typeof dir == 'string') {
      this._getDirectory(dir, null, function(dirEntry) {
        self.list(dirEntry, success, error);
      }, error);
      return;
    }
    if (!dir) {
      dir = this.currentDirectory;
    }
    var reader = dir.createReader();
    reader.readEntries(success, error);
  };
  Downsha.FSA.prototype.listFiles = function(dir, success, error) {
    LOG.debug("FSA.listFiles");
    this.list(dir, function(entries) {
      if (typeof success == 'function') {
        var files = [];
        for ( var i = 0; i < entries.length; i++) {
          if (entries[i].isFile) {
            files.push(entries[i]);
          }
        }
        success(files);
      }
    }, error);
  };
  Downsha.FSA.prototype.listDirectories = function(dir, success, error) {
    LOG.debug("FSA.listDirectories");
    this.list(dir, function(entries) {
      if (typeof success == 'function') {
        var dirs = [];
        for ( var i = 0; i < entries.length; i++) {
          if (!entries[i].isFile) {
            dirs.push(entries[i]);
          }
        }
        success(dirs);
      }
    }, error);
  };
  Downsha.FSA.prototype.createFile = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.createFile: " + path);
    var self = this;
    this.ensureDirectory(this.dirname(path), function(d) {
      self._getFile(path, {
        create : true,
        exclusive : true
      }, successCallback, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.emptyDirectory = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.emptyDirectory: " + path);
    var self = this;
    this._getDirectory(path, null, function(dir) {
      dir.removeRecursively(function() {
        self.createDirectory(path, successCallback, errorCallback);
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.removeFile = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.createFile: " + path);
    var self = this;
    this.ensureDirectory(this.dirname(path), function(d) {
      self._getFile(path, {
        create : false,
        exclusive : true
      }, function(fileEntry) {
        fileEntry.remove(successCallback, errorCallback);
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.getFile = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.getFile: " + path);
    this._getFile(path, null, successCallback, errorCallback);
  };
  Downsha.FSA.prototype.getCreateFile = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.getCreateFile: " + path);
    var self = this;
    this.ensureDirectory(this.dirname(path), function(d) {
      self._getFile(path, {
        create : true,
        exclusive : false
      }, successCallback, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype._getFile = function(path, flags, successCallback,
      errorCallback) {
    LOG.debug("FSA._getFile: " + path);
    var self = this;
    this._sema.critical(function() {
      self.currentDirectory.getFile(path, flags, function() {
        LOG.debug("Successfully retrieved file: " + path);
        self._sema.signal();
        if (typeof successCallback == 'function') {
          successCallback.apply(self, arguments);
        }
      }, function(e) {
        LOG.error("Failed to retreive file: " + path + "(" + e.code + ")");
        self._sema.signal();
        if (typeof errorCallback == 'function') {
          errorCallback.apply(self, arguments);
        }
      });
    });
  };
  Downsha.FSA.prototype.writeFile = function(path, content, successCallback,
      errorCallback) {
    LOG.debug("FSA.writeFile: " + path);
    var self = this;
    this.getCreateFile(path, function(fileEntry) {
      fileEntry.createWriter(function(writer) {
        var bb = self.createBlobBuilder();
        bb.append(content);
        var ontruncateend = function() {
          writer.onwriteend = onwriteend;
          LOG.debug("Writing blob to file [" + writer.readyState + "]");
          writer.write(bb.getBlob());
        };
        var onwriteend = function() {
          LOG.debug("Finished writing file: " + path);
          if (typeof successCallback == 'function') {
            successCallback(writer, fileEntry);
          }
        };
        writer.onwriteend = ontruncateend;
        LOG.debug("Truncating file [" + writer.readyState + "]");
        writer.truncate(0);
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.appendFile = function(path, content, successCallback,
      errorCallback) {
    LOG.debug("FSA.appendFile: " + path);
    var self = this;
    this.getCreateFile(path, function(fileEntry) {
      fileEntry.createWriter(function(writer) {
        var bb = self.createBlobBuilder();
        bb.append(content);
        writer.onwriteend = function() {
          LOG.debug("Finished writing file: " + path);
          if (typeof successCallback == 'function') {
            successCallback(writer, fileEntry);
          }
        };
        writer.seek();
        writer.write(bb.getBlob());
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.readTextFile = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.readTextFile: " + path);
    this.createFileReader(path, function(reader, file, fileEntry) {
      reader.onloadend = function() {
        LOG.debug("Finished reading file: " + path);
        if (typeof successCallback == 'function') {
          successCallback(reader, fileEntry);
        }
      };
      reader.readAsText(file);
    }, errorCallback);
  };
  Downsha.FSA.prototype.readTextFromFile = function(file, successCallback,
      errorCallback) {
    var reader = new FileReader();
    reader.onloadend = function() {
      LOG.debug("Finished reading file: " + file.name);
      if (typeof successCallback == 'function') {
        successCallback(reader, file);
      }
    };
    reader.onerror = errorCallback;
    reader.readAsText(file);
  };
  Downsha.FSA.prototype.createFileReader = function(path, successCallback,
      errorCallback) {
    LOG.debug("FSA.createFileReader: " + path);
    var self = this;
    this.getFile(path, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        if (typeof successCallback == 'function') {
          successCallback(reader, file, fileEntry);
        }
      }, errorCallback);
    }, errorCallback);
  };
  Downsha.FSA.prototype.ls = function(dir) {
    var _dir = (typeof dir == 'string') ? dir : this.currentDirectory.name;
    var err = function(e) {
      LOG.error(e);
    };
    var dateToStr = function(date) {
      return date.toString().split(" ").slice(1, 5).join(" ");
    };
    var printFileEntry = function(entry) {
      entry.file(function(f) {
        LOG.debug("f " + f.fileSize + " " + dateToStr(f.lastModifiedDate) + " "
            + f.fileName);
      });
    };
    var printDirEntry = function(entry) {
      entry.getMetadata(function(meta) {
        LOG.debug("d " + " " + dateToStr(meta.modificationTime) + " "
            + entry.name);
      });
    };
    this._getDirectory(_dir, {
      create : false,
      exclusive : false
    }, function(dir) {
      dir.createReader().readEntries(function(entries) {
        LOG.debug(_dir);
        LOG.debug("total " + entries.length);
        for ( var i = 0; i < entries.length; i++) {
          if (entries[i].isDirectory) {
            printDirEntry(entries[i]);
          } else if (entries[i].isFile) {
            printFileEntry(entries[i]);
          }
        }
      }, err);
    }, err);
  };
  /**
   * Maps given array of FileEntry's or DirectoryEntry's, or an EntryArray. The
   * keys of the map are determined by mapFn function. When mapping is complete -
   * callback is called with the map as the only arguments.
   * 
   * mapFn will be called with two arguments - first is the FileEntry or
   * DirectoryEntry, and the second is a callback that needs to be called from
   * within mapFn, passing that callback two arguments - first is the key and
   * second is the file that corresponds to that key.
   * 
   * Example mapping files by their modification time.
   * 
   * <pre>
   * fsa.listFiles(&quot;/foo&quot;, function(files) {
   *   Downsha.FSA.mapEntries(files, function(file, cb) {
   *     file.getMetadata(function(meta) {
   *       cb(meta.modificationTime.getTime(), file);
   *     });
   *   }, function(map) {
   *     console.dir(map)
   *   })
   * })
   * </pre>
   * 
   * @param entries
   * @param mapFn
   * @param callback
   * @return
   */
  Downsha.FSA.mapEntries = function(entries, mapFn, callback) {
    var sema = Downsha.Semaphore.mutex();
    var map = {};
    var x = 0;
    for ( var i = 0; i < entries.length; i++) {
      sema.critical(function() {
        var file = entries[x];
        mapFn(file, function(key, val) {
          map[key] = val;
          x++;
          sema.signal();
        });
      });
    }
    sema.critical(function() {
      callback(map);
    });
  };

  /**
   * Sorts given array of FileEntry's or DirectoryEntry's, or an EntryArray, and
   * passes the resulting array of entries to the given callback.
   * 
   * Sorting is done by first constructing a map of keys to entries using mapFn
   * function. If mapFn is not given, the default behavior will be to map
   * entries to their file names.
   * 
   * After the map is created, the given entries are sorted based on their
   * corresponsing keys in that map using sortFn function. If sortFn is not
   * supplied, the default behavior will be to sort by keys in an ascending
   * order - similarly to Array.prototype.sort.
   * 
   * Once the sorting is done, the resulting Array of entries will be passed to
   * the given callback function.
   * 
   * Example sorting entries by their modification time in reverse order.
   * 
   * <pre>
   * fsa.listFiles(&quot;/foo&quot;, function(files) {
   *   Downsha.FSA.sortEntries(files, function(f, cb) {
   *     f.getMetadata(function(meta) {
   *       cb(meta.modificationTime.getTime(), f);
   *     });
   *   }, function(a, b, fileArray, fileMap) {
   *     if (a == b) {
   *       return 0;
   *     } else if (a &gt; b) {
   *       return -1;
   *     } else {
   *       return 1;
   *     }
   *   }, function(filesArray) {
   *     console.dir(filesArray);
   *   });
   * })
   * </pre>
   * 
   * @param entries
   * @param mapFn
   * @param sortFn
   * @param callback
   * @return
   */
  Downsha.FSA.sortEntries = function(entries, mapFn, sortFn, callback) {
    var entriesArray = [];
    if (entries instanceof Array) {
      entriesArray = entries;
    } else if (entries.length > 0) {
      for ( var i = 0; i < entries.length; i++) {
        entriesArray.push(entries[i]);
      }
    }
    if (typeof mapFn != 'function') {
      mapFn = function(f, cb) {
        cb(f.name, f);
      };
    }
    if (typeof sortFn != 'function') {
      sortFn = function(a, b) {
        if (a == b) {
          return 0;
        } else {
          return (a > b) ? 1 : -1;
        }
      };
    }
    this.mapEntries(entries, mapFn, function(map) {
      entriesArray.sort(function(a, b) {
        var aKey = null;
        var bKey = null;
        for ( var i in map) {
          if (map[i] == a) {
            aKey = i;
          } else if (map[i] == b) {
            bKey = i;
          }
        }
        return sortFn(aKey, bKey, entriesArray, map);
      });
      callback(entriesArray);
    });
  };

  Downsha.FSAError = function(code) {
    this.code = parseInt(code);
    if (isNaN(this.code)) {
      this.code = Downsha.FSAError.UNKNOWN_ERROR;
    }
  };
  Downsha.inherit(Downsha.FSAError, Error);
  Downsha.FSAError.UNKNOWN_ERROR = 0;
  Downsha.FSAError.NO_SUITABLE_FILESYSTEM_REQUESTOR = 1;
  Downsha.FSAError.NO_SUITABLE_BLOB_BUILDER = 2;
  Downsha.FSAError.prototype.code = Downsha.FSAError.UNKNOWN_ERROR;
  Downsha.FSAError.prototype.valueOf = function() {
    return this.code;
  };
  Downsha.FSAError.prototype.toString = function() {
    return "Downsha.FSAError: " + this.code;
  };
})();


/*
 * Downsha
 * EDAMResponse
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */

/** ************** Server Responses *************** */
(function() {
  var LOG = null;
  Downsha.EDAMErrorCode = {
    UNKNOWN : 1,
    BAD_DATA_FORMAT : 2,
    PERMISSION_DENIED : 3,
    INTERNAL_ERROR : 4,
    DATA_REQUIRED : 5,
    LIMIT_REACHED : 6,
    QUOTA_REACHED : 7,
    INVALID_AUTH : 8,
    AUTH_EXPIRED : 9,
    DATA_CONFLICT : 10,
    ENML_VALIDATION : 11,
    SHARD_UNAVAILABLE : 12
  };

  Downsha.EDAMResponseErrorCode = {
    UNKNOWN : 1,
    INVALID_RESPONSE : 2
  };

  Downsha.EDAMResponse = function EDAMResponse(data) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(data);
  };
  Downsha.EDAMResponse.TYPE_UNKNOWN = 0;
  Downsha.EDAMResponse.TYPE_ERROR = 1;
  Downsha.EDAMResponse.TYPE_TEXT = 2;
  Downsha.EDAMResponse.TYPE_HTML = 3;
  Downsha.EDAMResponse.TYPE_OBJECT = 4;

  Downsha.EDAMResponse.fromObject = function(obj) {
    if (obj instanceof Downsha.EDAMResponse) {
      return obj;
    } else {
      return new Downsha.EDAMResponse(obj);
    }
  };

  Downsha.EDAMResponse.prototype._result = null;
  Downsha.EDAMResponse.prototype._errors = null;
  Downsha.EDAMResponse.prototype._type = Downsha.EDAMResponse.TYPE_UNKNOWN;
  Downsha.EDAMResponse.prototype.initialize = function(data) {
    this.__defineGetter__("errors", this.getErrors);
    this.__defineSetter__("errors", this.setErrors);
    this.__defineGetter__("result", this.getResult);
    this.__defineSetter__("result", this.setResult);
    this.__defineGetter__("type", this.getType);
    this.__defineSetter__("type", this.setType);
    if (typeof data == 'object'
        && typeof data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY] != 'undefined'
        && data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY]) {
      this.errors = data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY];
    }
    if (typeof data == 'object'
        && typeof data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY] != 'undefined'
        && data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY]) {
      this.result = data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY];
    }
  };
  Downsha.EDAMResponse.prototype.isEmpty = function() {
    return (this.result == null && this.errors == null);
  };
  Downsha.EDAMResponse.prototype.isError = function() {
    return (this.errors != null);
  };
  Downsha.EDAMResponse.prototype.isResult = function() {
    return (this.result != null);
  };
  Downsha.EDAMResponse.prototype.addError = function(e) {
    if (this._errors == null)
      this._errors = new Array();
    this._errors.push(e);
  };
  Downsha.EDAMResponse.prototype.setErrors = function(errors) {
    if (errors == null || typeof errors == 'undefined')
      this._errors = null;
    else
      this._errors = (errors instanceof Array) ? errors : [ errors ];
  };
  Downsha.EDAMResponse.prototype.getErrors = function() {
    return this._errors;
  };
  Downsha.EDAMResponse.prototype.hasValidationErrors = function() {
    return this.hasErrorClass(Downsha.ValidationError);
  };
  Downsha.EDAMResponse.prototype.hasExceptions = function() {
    return this.hasErrorClass(Downsha.Exception);
  };
  Downsha.EDAMResponse.prototype.hasErrorClass = function(constructor) {
    if (this.isError()) {
      for ( var i = 0; i < this.errors.length; i++) {
        if (this._errors[i] instanceof constructor)
          return true;
      }
    }
    return false;
  };
  Downsha.EDAMResponse.prototype.hasErrorCode = function(errorCode) {
    if (this.isError()) {
      for ( var i = 0; i < this._errors.length; i++) {
        if (this._errors[i].errorCode == errorCode)
          return true;
      }
    }
    return false;
  };
  Downsha.EDAMResponse.prototype.hasErrorCodeWithParameter = function(
      errorCode, parameter) {
    if (this.isError()) {
      for ( var i = 0; i < this._errors.length; i++) {
        if (this._errors[i].errorCode == errorCode
            && typeof this._errors[i].parameter != 'undefined'
            && this._errors[i].parameter == parameter) {
          return true;
        }
      }
    }
    return false;
  };
  Downsha.EDAMResponse.prototype.isMissingAuthTokenError = function() {
    return this.hasErrorCodeWithParameter(Downsha.EDAMErrorCode.DATA_REQUIRED,
        "authenticationToken");
  };
  Downsha.EDAMResponse.prototype.isPermissionDeniedError = function() {
    return this.hasErrorCode(Downsha.EDAMErrorCode.PERMISSION_DENIED);
  };
  Downsha.EDAMResponse.prototype.isAuthTokenExpired = function() {
    return this.hasErrorCode(Downsha.EDAMErrorCode.AUTH_EXPIRED);
  };
  Downsha.EDAMResponse.prototype.hasAuthenticationError = function() {
    return this.isMissingAuthTokenError() || this.isPermissionDeniedError()
        || this.isAuthTokenExpired();
  };
  Downsha.EDAMResponse.prototype.isInvalidAuthentication = function() {
    return this.hasErrorCode(Downsha.EDAMErrorCode.INVALID_AUTH);
  };
  Downsha.EDAMResponse.prototype.getErrorsByCode = function(errorCode, limit) {
    return this.getErrorsByField(Downsha.Exception.ERROR_CODE_FIELD,
        errorCode, limit);
  };
  Downsha.EDAMResponse.prototype.getErrorsByClass = function(constructor,
      limit) {
    return this.getErrorsByField(Downsha.Exception.CLASS_FIELD,
        (typeof constructor == 'string') ? constructor
            : constructor[Downsha.Exception.CLASS_FIELD], limit);
  };
  Downsha.EDAMResponse.prototype.getErrorsByField = function(fieldName,
      fieldValue, limit) {
    var found = new Array();
    if (this.isError()) {
      for ( var i = 0; i < this._errors.length; i++) {
        if (typeof this._errors[i][fieldName] != 'undefined'
            && this._errors[i][fieldName] == fieldValue) {
          found.push(this._errors[i]);
          if (typeof limit == 'number' && found.length >= limit)
            break;
        }
      }
    }
    return (found.length == 0) ? null : found;
  };
  Downsha.EDAMResponse.prototype.selectErrors = function(fn) {
    var selected = new Array();
    if (typeof fn == 'function' && this.isError()) {
      for ( var i = 0; i < this._errors.length; i++) {
        if (fn(this._errors[i]))
          selected.push(this._errors[i]);
      }
    }
    return (selected.length == 0) ? null : selected;
  };
  Downsha.EDAMResponse.prototype.getResult = function() {
    return this._result;
  };
  Downsha.EDAMResponse.prototype.setResult = function(result) {
    this._result = result;
  };
  Downsha.EDAMResponse.prototype.getType = function() {
    return this._type;
  };
  Downsha.EDAMResponse.prototype.setType = function(type) {
    this._type = parseInt(type);
  };
  Downsha.EDAMResponse.prototype.toString = function() {
    return "Downsha.EDAMResponse (" + this.type + ") "
        + ((this.isError()) ? "ERROR" : "RESULT");
  };
  Downsha.EDAMResponse.createFrom = function(data, resultTransform) {
    LOG = LOG || Downsha.chromeExtension.getLogger(Downsha.EDAMResponse);
    LOG.debug("Downsha.EDAMResponse.createFrom");
    var response = new Downsha.EDAMResponse();
    // Check for errors
    if (typeof data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY] == 'object'
        && data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY] != null) {
      var errors = (data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY] instanceof Array) ? data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY]
          : [ data[Downsha.DownshaRemote.RESPONSE_ERROR_KEY] ];
      for ( var i = 0; i < errors.length; i++) {
        if (typeof errors[i] == 'object'
            && typeof errors[i][Downsha.DownshaRemote.CLASS_IDENTIFIER] == 'string') {
          var eClass = Downsha.DownshaError
              .responsibleConstructor(errors[i][Downsha.DownshaRemote.CLASS_IDENTIFIER]);
          if (typeof eClass == 'function') {
            var e = new eClass(errors[i]);
            LOG.debug("Classifiable error: " + e.toString());
            response.addError(e);
          } else {
            LOG.debug("Generic error");
            response.addError(new Downsha.Exception(errors[i]));
          }
        } else if (typeof errors[i] == 'object') {
          LOG.debug("Non-classifiable exception");
          response.addError(new Downsha.Exception(errors[i]));
        } else if (errors[i] != null) {
          LOG.debug("Non-classifiable error");
          response.addError(new Error(errors[i]));
        }
      }
      response.type = Downsha.EDAMResponse.TYPE_ERROR;
    }
    // check for result
    else if ((typeof data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY] == 'object' && data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY] != null)
        || typeof data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY] == 'string'
        || typeof data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY] == 'number'
        || typeof data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY] == 'boolean') {
      if (typeof resultTransform == 'function') {
        LOG.debug("Transforming and setting response result");
        response.result = resultTransform(data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY]);
      } else {
        LOG.debug("Setting response result as-is");
        response.result = data[Downsha.DownshaRemote.RESPONSE_RESULT_KEY];
      }
      if (typeof response.result == 'object' && response.result != null) {
        response.type = Downsha.EDAMResponse.TYPE_OBJECT;
      } else if (typeof response.result == 'string'
          && response.result.match(/<[^>]+>/)) {
        response.type = Downsha.EDAMResponse.TYPE_HTML;
      } else if (typeof response.result != null) {
        response.type = Downsha.EDAMResponse.TYPE_TEXT;
      }
    } else {
      LOG.debug("Invalid response data");
      LOG.debug(">>> " + JSON.stringify(data));
      throw new Downsha.EDAMResponseException(
          Downsha.EDAMResponseErrorCode.INVALID_RESPONSE);
    }
    return response;
  };
})();

/*
 * Downsha
 * DownshaMultiPartForm
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
/** ************** Downsha.DownshaMultiPartForm *************** */
Downsha.DownshaMultiPartForm = function DownshaMultiPartForm(data) {
  this.__defineGetter__("data", this.getData);
  this.__defineSetter__("data", this.setData);
  this.initialize(data);
};
Downsha.DownshaMultiPartForm.CONTENT_TYPE = "multipart/form-data";
Downsha.DownshaMultiPartForm.BOUNDARY_MARK = "--";
Downsha.DownshaMultiPartForm.BOUNDARY_PREFIX = "----DownshaFormBoundary";
Downsha.DownshaMultiPartForm.HEADER_SEPARATOR = "; ";
Downsha.DownshaMultiPartForm.HEADER_BOUNDARY = "boundary";
Downsha.DownshaMultiPartForm.CR = "\r\n";
Downsha.DownshaMultiPartForm.createBoundary = function() {
  return this.BOUNDARY_PREFIX + (new Date().getTime());
};
Downsha.DownshaMultiPartForm.prototype._data = null;
Downsha.DownshaMultiPartForm.prototype.boundary = null;
Downsha.DownshaMultiPartForm.prototype.initialize = function(data) {
  this.boundary = this.constructor.createBoundary();
  this.data = data;
};
Downsha.DownshaMultiPartForm.prototype.setData = function(data) {
  if (typeof data == 'object') {
    this._data = data;
  }
};
Downsha.DownshaMultiPartForm.prototype.getData = function() {
  return this._data;
};
Downsha.DownshaMultiPartForm.prototype.getContentTypeHeader = function() {
  return this.constructor.CONTENT_TYPE + this.constructor.HEADER_SEPARATOR
      + this.constructor.HEADER_BOUNDARY + "=" + this.boundary;
};
Downsha.DownshaMultiPartForm.prototype.toJSON = function() {
  return {
    contentType : this.getContentTypeHeader(),
    boundary : this.boundary,
    data : this.data
  };
};
Downsha.DownshaMultiPartForm.prototype.toString = function() {
  var str = "";
  if (this._data) {
    for ( var i in this._data) {
      if (this._data[i] == null || (this._data[i] + "").length == 0) {
        continue;
      }
      str += this.constructor.BOUNDARY_MARK + this.boundary
          + this.constructor.CR;
      str += (new Downsha.DownshaFormPart( {
        name : i,
        data : this._data[i]
      })).toString();
      str += this.constructor.CR;
    }
  }
  str += this.constructor.BOUNDARY_MARK + this.boundary
      + this.constructor.BOUNDARY_MARK + this.constructor.CR;
  return str;
};

/** ************** Downsha.DownshaFormPart *************** */

Downsha.DownshaFormPart = function DownshaFormPart(obj) {
  this.__defineGetter__("name", this.getName);
  this.__defineSetter__("name", this.setName);
  this.__defineGetter__("data", this.getData);
  this.__defineSetter__("data", this.setData);
  this.initialize(obj);
};
Downsha.DownshaFormPart.HEADER_CONTENT_DISPOSITION = "Content-Disposition: ";
Downsha.DownshaFormPart.HEADER_FORM_DATA = "form-data";
Downsha.DownshaFormPart.HEADER_SEPARATOR = "; ";
Downsha.DownshaFormPart.HEADER_KEYVAL_SEPARATOR = "=";
Downsha.DownshaFormPart.HEADER_NAME = "name";
Downsha.DownshaFormPart.CR = "\r\n";
Downsha.DownshaFormPart.prototype._name = null;
Downsha.DownshaFormPart.prototype._data = null;
Downsha.DownshaFormPart.prototype.initialize = function(obj) {
  if (typeof obj == 'object' && obj != null) {
    this.name = (typeof obj["name"] != 'undefined') ? obj["name"] : null;
    this.data = (typeof obj["data"] != 'undefined') ? obj["data"] : null;
  }
};
Downsha.DownshaFormPart.prototype.getHeader = function() {
  return this.constructor.HEADER_CONTENT_DISPOSITION
      + this.constructor.HEADER_FORM_DATA + this.constructor.HEADER_SEPARATOR
      + this.constructor.HEADER_NAME + this.constructor.HEADER_KEYVAL_SEPARATOR
      + "\"" + this.name + "\"";
};
Downsha.DownshaFormPart.prototype.setName = function(name) {
  if (name == null) {
    this._name = null;
  } else {
    this._name = name + "";
  }
};
Downsha.DownshaFormPart.prototype.getName = function() {
  return this._name;
};
Downsha.DownshaFormPart.prototype.setData = function(data) {
  if (data == null) {
    this._data = null;
  } else {
    this._data = data + "";
  }
};
Downsha.DownshaFormPart.prototype.getData = function() {
  return this._data;
};
Downsha.DownshaFormPart.prototype.toJSON = function() {
  return {
    name : this.name,
    data : this.data
  };
};
Downsha.DownshaFormPart.prototype.toString = function() {
  return this.getHeader() + this.constructor.CR + this.constructor.CR
      + (this.data + "");
};

(function() {
  var LOG = null;

  Downsha.MutableXMLHttpRequest = function MutableXMLHttpRequest() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  Downsha.inherit(Downsha.MutableXMLHttpRequest, XMLHttpRequest, true);
  Downsha.MutableXMLHttpRequest.prototype.initialize = function() {
    var self = this;
    for ( var i in this.__proto__) {
      if (i.indexOf("on") == 0) {
        var setter = function(value) {
          var fieldName = arguments.callee._fieldName;
          self["_" + fieldName] = value;
        };
        setter._fieldName = i;
        this.__defineSetter__(i, setter);
        var getter = function() {
          var fieldName = arguments.callee._fieldName;
          return function() {
            if (typeof self["_" + fieldName] == 'function') {
              self["_" + fieldName]();
            }
            if (typeof self["_proto_" + fieldName] == 'function') {
              self["_proto_" + fieldName]();
            }
          };
        };
        getter._fieldName = i;
        this.__defineGetter__(i, getter);
        this["_proto_" + i] = this.__proto__[i];
      }
    }
  };
  Downsha.MutableXMLHttpRequest.prototype.become = function(xhr) {
    var self = this;
    if (xhr instanceof XMLHttpRequest) {
      var oldXhr = this.__proto__;
      this.__proto__ = xhr;
      this.constructor = Downsha.MutableXMLHttpRequest;
      for ( var i in this) {
        if (i.indexOf("on") == 0 && this.hasOwnProperty(i)) {
          oldXhr[i] = this["_proto_" + i];
          this["_proto_" + i] = this.__proto__[i];
          var setter = function(value) {
            var fieldName = i;
            self["_proto_" + fieldName] = value;
          };
          setter._fieldName = i;
          this.__proto__[i] = this[i];
        }
      }
      for ( var i in this.constructor.prototype) {
        if (this.constructor.prototype.hasOwnProperty(i)
            && !this.__proto__.hasOwnProperty(i)) {
          try {
            this.__proto__[i] = this.constructor.prototype[i];
          } catch (e) {
          }
        }
      }
    }
  };

})();

/*
 * Downsha
 * DownshaRemote
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
/** ************** Downsha.DownshaRemote *************** */

/**
 * Downsha.DownshaRemote is used to retrieve data from and submit data to the
 * Downsha web service.
 * 
 * @return
 */
(function() {
  var LOG = null;
  Downsha.DownshaRemote = function DownshaRemote() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  // constants
  Downsha.DownshaRemote.CLASS_IDENTIFIER = "javaClass";
  Downsha.DownshaRemote.RESPONSE_ERROR_KEY = "errors";
  Downsha.DownshaRemote.RESPONSE_RESULT_KEY = "result";
  Downsha.DownshaRemote.DEFAULT_SNIPPET_MAX_LENGTH = 200;
  Downsha.DownshaRemote.POST_TIMEOUT = 10 * 60 * 1000;
  Downsha.DownshaRemote.GET_TIMEOUT = 5 * 60 * 1000;
  Downsha.DownshaRemote.SYNC_STATE_MIN_INTERVAL = 60 * 1000;
  Downsha.DownshaRemote.DATA_CLEAN_PASSWORD_REGEX = /\"password\":\"[^\"]+\"/;
  Downsha.DownshaRemote.DATA_CLEAN_PASSWORD_REPLACEMENT = "\"password\":\"******\"";

  Downsha.DownshaRemote.prototype._debugRequestData = false;

  Downsha.DownshaRemote.prototype._dataMarshaller = function(data) {
    return Downsha.AppModel.marshall(data);
  };
  Downsha.DownshaRemote.prototype._dataUnmarshaller = function(result) {
    if (typeof result == 'object') {
      for ( var resultKey in result) {
        var model = Downsha.AppModel.unmarshall(result[resultKey]);
      }
    }
    return result;
  };

  Downsha.DownshaRemote.prototype.initialize = function() {
    this.__defineGetter__("dataMarshaller", this.getDataMarshaller);
    this.__defineSetter__("dataMarshaller", this.setDataMarshaller);
    this.__defineGetter__("dataUnmarshaller", this.getDataUnmarshaller);
    this.__defineSetter__("dataUnmarshaller", this.setDataUnmarshaller);
    this.__defineGetter__("debugRequestData", this.setDebugRequestData);
    this.__defineSetter__("debugRequestData", this.isDebugRequestData);
  };
  Downsha.DownshaRemote.prototype.getDataMarshaller = function(fn) {
    return this._dataMarshaller;
  };
  Downsha.DownshaRemote.prototype.setDataMarshaller = function(fn) {
    this._dataMarshaller = fn;
  };
  Downsha.DownshaRemote.prototype.getDataUnmarshaller = function(fn) {
    return this._dataUnmarshaller;
  };
  Downsha.DownshaRemote.prototype.setDataUnmarshaller = function(fn) {
    this._dataUnmarshaller = fn;
  };
  Downsha.DownshaRemote.prototype.isDebugRequestData = function() {
    return this._debugRequestData;
  };
  Downsha.DownshaRemote.prototype.setDebugRequestData = function(bool) {
    this._debugRequestData = (bool) ? true : false;
  };
  /**
   * Authenticates against web service. If rememberMe is <code>true</code>,
   * the session will be long-expriting (week).
   * 
   * @param username
   * @param password
   * @param rememberMe
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.authenticate = function(username, password,
      rememberMe, success, failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote.authenticate");
    rememberMe = (typeof rememberMe == 'undefined' || !(rememberMe)) ? false
        : true;
    var data = {
      username : username,
      password : password,
      rememberMe : rememberMe
    };
    return this.postJson(Downsha.getContext().getLoginUrl(), data, success,
        failure, processResponse);
  };
  /**
   * Logs out from web service. This invalidates authentication token etc.
   * 
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.logout = function(success, failure,
      processResponse) {
    LOG.debug("Downsha.DownshaRemote.logout");
    return this.getJson(Downsha.getContext().getLogoutUrl(), {}, success,
        failure, processResponse);
  };
  /**
   * Gets sync state. Use last known updateCount whenever possible as that will
   * limit the amount of data returned from the service.
   * 
   * @param updateCount
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.getSyncState = function(updateCount,
      success, failure, processResponse, force) {
    LOG.debug("Downsha.DownshaRemote.getSyncState");
    var context = Downsha.getContext(true);
    var lastSyncStateTime = context.getLastSyncStateTime();
    if (!force && (lastSyncStateTime + this.constructor.SYNC_STATE_MIN_INTERVAL) > Date.now()) {
        LOG.debug("Not fetching syncState from server because we just fetched one");
        syncState = context.getSyncState();
        var response = new Downsha.EDAMResponse();
        response.result = {};
        if (syncState) {
            response.result.syncState = syncState;
        }
        if (typeof success == 'function') {
            LOG.debug("... and re-using existing syncState...");
            setTimeout(function() {
                success(response, null, null);
            }, 1);
        }
        return;
    }
    updateCount = parseInt(updateCount);
    var data = {};
    if (updateCount > 0)
      data.updateCount = updateCount;
    try {
      LOG.debug("Get: " + Downsha.getContext().getSyncStateUrl() + "&"
          + ((data) ? JSON.stringify(data).replace(/,/g, "&") : ""));
    } catch (e) {
    }
    context.setLastSyncStateTime(Date.now());
    LOG.debug("Fetching new syncState from server");
    return this.getJson(Downsha.getContext().getSyncStateUrl(), data, success,
        failure, processResponse);
  };
  /**
   * Posts a clip to the web service, creating a note.
   * 
   * @param clipNote
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.clip = function(clipNote, success, failure,
      processResponse) {
    LOG.debug("Downsha.DownshaRemote.clip");
    var data = null;
    if (clipNote instanceof Downsha.ClipNote) {
      data = clipNote.toStorable();
    } else if (typeof clipNote == 'object' && clipNote != null) {
      LOG
          .warn("Passed object was not a Downsha.ClipNote... trying to make one");
      data = (new Downsha.ClipNote(clipNote)).toStorable();
    }
    return this.postJson(Downsha.getContext().getClipperUrl(), data, success,
        failure, processResponse, true);
  };
  /**
   * Files already created note. Basically this really just updates the note's
   * attributes such as notebook and tag association, as well as prepends or
   * appends additional text content to the note.
   * 
   * @param note
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.file = function(note, success, failure,
      processResponse) {
    LOG.debug("Downsha.DownshaRemote.fileNote");
    var data = {};
    if (note instanceof Downsha.BasicNote) {
      if (note.guid)
        data.noteGuid = note.guid;
      if (note.title)
        data.title = note.title;
      if (note.comment)
        data.comment = note.comment;
      if (note.notebookGuid) {
        data.notebookGuid = note.notebookGuid;
      }
      if (note.tagNames) {
        data.tagNames = (note.tagNames instanceof Array) ? note.tagNames
            .join(",") : note.tagNames;
      }
    }
    return this.postJson(Downsha.getContext().getFileNoteUrl(), data, success,
        failure, processResponse);
  };
  /**
   * Deletes existing note from the account.
   * 
   * @param note
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.deleteNote = function(note, success,
      failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote.deleteNote");
    var data = {};
    if (note instanceof Downsha.BasicNote) {
      if (note.guid)
        data.noteGuid = note.guid;
    }
    return this.postJson(Downsha.getContext().getDeleteNoteUrl(), data,
        success, failure, processResponse);
  };
  /**
   * Finds note based on criteria specified by {@link Downsha.NoteFilter},
   * starting with offset, returning at most maxNotes notes.
   * 
   * @param noteFilter
   * @param offset
   * @param maxNotes
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.findNotes = function(noteFilter, offset,
      maxNotes, success, failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote.findNotes");
    var data = {
      offset : parseInt(offset),
      maxNotes : parseInt(maxNotes)
    };
    return this._findNotes(noteFilter, data, success, failure, processResponse);
  };

  /**
   * Much like findNotes except expect the result to contain an array of
   * SnippetNote's rather than Note's.
   */
  Downsha.DownshaRemote.prototype.findSnippetNotes = function(noteFilter,
      offset, maxNotes, snippetMaxLength, success, failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote.findNotes");
    var data = {
      offset : parseInt(offset),
      maxNotes : parseInt(maxNotes),
      snippetMaxLength : parseInt(snippetMaxLength)
    };
    if (isNaN(data.snippetMaxLength) || data.snippetMaxLength <= 0) {
      data.snippetMaxLength = this.constructor.DEFAULT_SNIPPET_MAX_LENGTH;
    }
    return this._findNotes(noteFilter, data, success, failure, processResponse);
  };

  /**
   * Supporting method for finding notes on the server
   */
  Downsha.DownshaRemote.prototype._findNotes = function(noteFilter, data,
      success, failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote._findNotes");
    if (noteFilter instanceof Downsha.NoteFilter) {
      var storable = noteFilter.toStorable();
      for ( var i in storable) {
        if (typeof storable[i] != 'undefined' && storable[i] != null) {
          data["noteFilter." + i] = storable[i];
        }
      }
    }
    return this.postJson(Downsha.getContext().getFindNotesUrl(), data,
        success, failure, processResponse);
  };

  Downsha.DownshaRemote.prototype.findMetaNotes = function(noteFilter,
      resultSpec, offset, maxNotes, success, failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote.findMetaeNotes");
    var data = {
      offset : parseInt(offset),
      maxNotes : parseInt(maxNotes)
    };
    return this._findMetaNotes(noteFilter, resultSpec, data, success, failure,
        processResponse);
  };

  Downsha.DownshaRemote.prototype._findMetaNotes = function(noteFilter,
      resultSpec, data, success, failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote._findMetaNotes");
    if (noteFilter instanceof Downsha.NoteFilter) {
      var storable = noteFilter.toStorable();
      for ( var i in storable) {
        if (typeof storable[i] != 'undefined' && storable[i] != null) {
          data["noteFilter." + i] = storable[i];
        }
      }
    }
    if (resultSpec instanceof Downsha.NotesMetadataResultSpec) {
      var storable = resultSpec.toStorable();
      for ( var i in storable) {
        if (typeof storable[i] != 'undefined' && storable[i] != null) {
          data["resultSpec." + i] = storable[i];
        }
      }
    }
    return this.postJson(Downsha.getContext().getFindMetaNotesUrl(), data,
        success, failure, processResponse);
  };

  Downsha.DownshaRemote.prototype.countNotes = function(noteFilter, success,
      failure, processResponse) {
    LOG.debug("Downsha.DownshaRemote.countNotes");
    var data = {};
    if (noteFilter instanceof Downsha.NoteFilter) {
      var storable = noteFilter.toStorable();
      for ( var i in storable) {
        if (typeof storable[i] != 'undefined' && storable[i] != null) {
          data["noteFilter." + i] = storable[i];
        }
      }
    }
    return this.postJson(Downsha.getContext().getCountNotesUrl(), data,
        success, failure, processResponse);
  };

  Downsha.DownshaRemote.prototype.findNoteSnippets = function(noteFilter,
      offset, maxNotes, snippetLength, textOnly, success, failure,
      processResponse) {
    LOG.debug("DownshaRemote.findNoteSnippets");
    if (typeof snippetLength != 'number' || isNaN(snippetLength)) {
      snippetLength = this.constructor.DEFAULT_SNIPPET_MAX_LENGTH;
    }
    var data = {
      start : offset,
      length : maxNotes,
      snippetLength : snippetLength,
      textOnly : (textOnly) ? true : false
    };
    if (noteFilter instanceof Downsha.NoteFilter) {
      var storable = noteFilter.toStorable();
      for ( var i in storable) {
        if (typeof storable[i] != 'undefined' && storable[i] != null) {
          data["noteFilter." + i] = storable[i];
        }
      }
    }
    this.postJson(Downsha.getContext().getFindSnippetsUrl(), data, success,
        failure, processResponse);
  };

  Downsha.DownshaRemote.prototype.noteSnippets = function(guids,
      snippetLength, textOnly, success, failure, processResponse) {
    LOG.debug("DownshaRemote.noteSnippets");
    if (typeof snippetLength != 'number' || isNaN(snippetLength)) {
      snippetLength = this.constructor.DEFAULT_SNIPPET_MAX_LENGTH;
    }
    var _guids = [].concat(guids);
    var data = {
      noteGuids : _guids,
      snippetLength : snippetLength,
      textOnly : (textOnly) ? true : false
    };
    this.postJson(Downsha.getContext().getNoteSnippetsUrl(), data, success,
        failure, processResponse);
  };

  /**
   * General purpose method for posting JSON data to given url. If data is
   * large, set multipart argument to <code>true</code>.
   * 
   * @param url
   * @param data
   * @param success
   * @param failure
   * @param processResponse
   * @param multipart
   * @return
   */
  Downsha.DownshaRemote.prototype.postJson = function(url, data, success,
      failure, processResponse, multipart) {
    return this.doRequest("POST", "json", url, data, success, failure,
        processResponse, multipart);
  };
  /**
   * General purpose method for getting JSON content from given URL. Query
   * parameters should be given in data object argument.
   * 
   * @param url
   * @param data
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.getJson = function(url, data, success,
      failure, processResponse) {
    return this.doRequest("GET", "json", url, data, success, failure,
        processResponse);
  };
  /**
   * Method for executing web requests (posts and gets).
   * 
   * @param meth
   * @param dataType
   * @param url
   * @param data
   * @param success
   * @param failure
   * @param processResponse
   * @param multipart
   * @return
   */
  Downsha.DownshaRemote.prototype.doRequest = function(meth, dataType, url,
      data, success, failure, processResponse, multipart) {
    if (meth == null) {
      meth = "GET";
    }
    var self = this;
    var updateCount = null;
    var username = null;
    var syncState = Downsha.getContext().getSyncState(true);
    var user = Downsha.getContext().getUser();
    var origRequest = {
      meth : meth,
      dataType : dataType,
      url : url,
      data : data,
      success : success,
      failure : failure,
      processResponse : processResponse,
      multipart : multipart
    };
    origRequest.__defineGetter__("arguments", function() {
      return [ this.meth, this.dataType, this.url, this.data, this.success,
          this.failure, this.processResponse, this.multipart ];
    });
    if (syncState instanceof Downsha.SyncState && syncState.updateCount
        && typeof data["updateCount"] == 'undefined') {
      data["updateCount"] = syncState.updateCount;
    }
    if (user instanceof Downsha.User && typeof user.username == 'string') {
      data["username"] = user.username;
    }
    if (LOG.isDebugEnabled()) {
      var dataStr = this.debugAjaxDataObject(data);
      LOG.debug("doRequest(" + meth + ", " + dataType + ", " + url + ", "
          + dataStr + ")");
    }
    var errorHandler = function(xhr, textStatus, error) {
      LOG.debug("Downsha.DownshaRemote.doRequest failed response");
      if (processResponse) {
        try {
          self.handleHttpError(xhr, textStatus, error, origRequest);
        } catch (e) {
          LOG.error((e && e.message) ? e.message : e);
          if (e instanceof Downsha.DownshaRemoteException
              && e.code == Downsha.DownshaRemoteErrors.ABORTED_RESPONSE_HANDLING) {
            return;
          } else {
            throw e;
          }
        }
      }
      if (typeof failure == 'function') {
        failure(xhr, textStatus, error);
      }
    };
    var successHandler = function(data, textStatus, xhr) {
      // work around for jQuery folks fucking up HTTP status codes
      if (xhr.status == 0) {
        return errorHandler(xhr, textStatus, data);
      }
      LOG.debug("Downsha.DownshaRemote.doRequest successfull response");
      var response = data;
      if (processResponse) {
        try {
          response = self.handleHttpSuccess(data, textStatus, xhr, origRequest);
        } catch (e) {
          if (e instanceof Downsha.DownshaRemoteException
              && e.code == Downsha.DownshaRemoteErrors.ABORTED_RESPONSE_HANDLING) {
            return;
          } else {
            throw e;
          }
        }
      }
      if (typeof success == 'function') {
        success(response, textStatus, xhr);
      }
    };
    var ajaxOpts = {
      url : url,
      async : true,
      cache : false,
      data : data,
      dataType : dataType,
      error : errorHandler,
      success : successHandler,
      type : meth
    };
    if (multipart && meth == "POST") {
      var form = new Downsha.DownshaMultiPartForm(data);
      ajaxOpts.contentType = form.getContentTypeHeader();
      ajaxOpts.data = form.toString();
    }
    if (meth == "POST") {
      ajaxOpts.timeout = this.constructor.POST_TIMEOUT;
    } else {
      ajaxOpts.timeout = this.constructor.GET_TIMEOUT;
    }
    LOG.debug(">>> Making request for: " + ajaxOpts.url);
    return $.ajax(ajaxOpts);
  };
  Downsha.DownshaRemote.prototype.debugAjaxDataObject = function(data) {
    var dataStr = "";
    if (this._debugRequestData) {
      try {
        dataStr = JSON.stringify(data).replace(
            this.constructor.DATA_CLEAN_PASSWORD_REGEX,
            this.constructor.DATA_CLEAN_PASSWORD_REPLACEMENT);
      } catch (e) {
      }
    } else {
      var dataParams = [];
      for ( var i in data) {
        dataParams.push(i);
      }
      dataStr = "{" + dataParams.toString() + "}";
    }
    return dataStr;
  };

  /**
   * Handler of successfull HTTP requests. It gets called whenever XHR receives
   * a successful (200's HTTP Code) response.
   * 
   * @param data
   * @param textStatus
   * @param xhr
   * @return
   */
  Downsha.DownshaRemote.prototype.handleHttpSuccess = function(data,
      textStatus, xhr, origRequest) {
    LOG.debug("Downsha.DownshaRemote.handleHttpSuccess");
    var remote = this;
    try {
      var response = Downsha.EDAMResponse.createFrom(data, function(result) {
        if (result != null && typeof remote.dataUnmarshaller == 'function') {
          LOG.debug("Unmarshalling result");
          result = remote.dataUnmarshaller(result);
        } else {
          LOG.warn("Cannot unmarshall result");
        }
        return result;
      });
    } catch (e) {
      var msg = "";
      if (e instanceof Downsha.DownshaError) {
        msg = e.errorCode;
        LOG.error("Exception creating Downsha.EDAMResponse: " + msg);
        var response = new Downsha.EDAMResponse();
        response.addError(e);
      } else {
        throw e;
      }
    }
    LOG.debug("HTTP [" + xhr.status + ", " + textStatus + "] Type: "
        + response.type);
    return response;
  };
  /**
   * Handler of erroneous HTTP requests. It gets called when XHR receives an
   * erroneous (non-200 HTTP Code) response.
   * 
   * @param xhr
   * @param textStatus
   * @param error
   * @return
   */
  Downsha.DownshaRemote.prototype.handleHttpError = function(xhr, textStatus,
      error, origRequest) {
    if (xhr.readyState != 4) {
      LOG.error("HTTP [readyState: " + xhr.readyState + "]");
    } else {
      LOG.error("HTTP [readyState: " + xhr.readyState + "," + xhr.status + ","
          + textStatus + "] " + error);
    }
  };
  Downsha.DownshaRemote.prototype.validateEDAMResponse = function(data,
      textStatus) {
    LOG.debug("Downsha.DownshaRemote.validateEDAMResponse");
    if (data && typeof data == 'object') {
      return (typeof data[this.constructor.RESPONSE_RESULT_KEY] == 'object' && data[this.constructor.RESPONSE_RESULT_KEY] != null);
    } else {
      LOG.debug("Invalid response from jclipper...");
      throw new Error(Downsha.EDAMResponseErrorCode.INVALID_RESPONSE);
    }
  };

  /**
   * Exceptions generated by DownshaRemote
   */
  Downsha.DownshaRemoteException = function DownshaRemoteException(code,
      message) {
    this.__defineGetter__("code", this.getCode);
    this.__defineSetter__("code", this.setCode);
    this.initialize(code, message);
  };
  Downsha.inherit(Downsha.DownshaRemoteException, Error);
  Downsha.DownshaRemoteException.prototype._code = 0;
  Downsha.DownshaRemoteException.prototype.initialize = function(code,
      message) {
    this.code = code;
    this.message = message;
  };
  Downsha.DownshaRemoteException.prototype.setCode = function(code) {
    this._code = parseInt(code);
    if (isNaN(this._code)) {
      this._code = 0;
    }
  };
  Downsha.DownshaRemoteException.prototype.getCode = function() {
    return this._code;
  };

  /**
   * Error codes used by DownshaRemote
   */
  Downsha.DownshaRemoteErrors = {
    // indicates that handling of response was aborted
    ABORTED_RESPONSE_HANDLING : 10
  };
})();

Downsha.KonamiProto = {
  seq : [ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65 ],
  timeout : 6000,
  reset : function() {
    this.idx = 0;
  },
  clearTimeout : function() {
    if (this.timeoutProc) {
      clearTimeout(this.timeoutProc);
    }
  },
  keystrokeHandler : function(event) {
    var self = Downsha.Konami.getInstance();
    self.clearTimeout();
    if (event.keyCode == self.seq[self.idx]) {
      self.idx++;
    } else {
      self.reset();
      return;
    }
    if (self.idx == self.seq.length) {
      self.reset();
      self.onactivate.apply(self, []);
    } else {
      self.timeoutProc = setTimeout(function() {
        self.reset();
      }, self.timeout);
    }
  },
  onactivate : function() {
  },
  start : function() {
    this.window.document.addEventListener("keydown", this.keystrokeHandler,
        false);
  },
  stop : function() {
    this.window.document.removeEventListener("keydown", this.keystrokeHandler,
        false);
  },
  initialize : function(win) {
    this.window = win || window;
    this.idx = 0;
    this.timeoutProc = null;
  }
};

Downsha.Konami = function Konami(win) {
  this.initialize(win);
};
Downsha.Konami.prototype = Downsha.KonamiProto;
Downsha.Konami._instance = null;
Downsha.Konami.getInstance = function(win) {
  var w = win || window;
  if (!this._instance) {
    this._instance = new this(w);
  }
  return this._instance;
};
Downsha.Konami.start = function(fn, win) {
  var konami = Downsha.Konami.getInstance(win);
  konami.onactivate = fn;
  konami.start();
};
Downsha.Konami.stop = function() {
  Downsha.Konami.getInstance().stop();
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

Downsha.UUID = {
  generateQuad : function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  },
  generateGuid : function() {
    return (this.generateQuad() + this.generateQuad() + "-"
        + this.generateQuad() + "-" + this.generateQuad() + "-"
        + this.generateQuad() + "-" + this.generateQuad() + this.generateQuad() + this
        .generateQuad());
  }
};

/*
 * Downsha.XORCrypt
 * Downsha
 *
 * Created by Pavel Skaldin on 3/7/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * Naive implementation of XOR encryption with padding. It is not meant to be a
 * strong encryption of any kind, just an obfuscation. The algorithm uses a seed
 * string for XORing. The string to be encrypted is first XOR'd with a random
 * number to avoid recognizable patterns; the result is then padded and then
 * XOR'd with the seed string.
 * 
 * Make sure that XORCrypt.LENGTH is larger than the strings you're trying to
 * encrypt.
 * 
 * <pre>
 * Usage: 
 * var enc = Downsha.XORCrypt.encrypt(&quot;secret&quot;, &quot;seed&quot;); 
 * var dec = Downsha.XORCrypt.decrypt(enc, &quot;seed&quot;);
 * </pre>
 */
Downsha.XORCrypt = {
  DELIMIT : ":",
  LENGTH : 128,
  /**
   * Pads string to make it XORCrypt.LENGTH characters in length. Padding is
   * done by prepending the string with random chars from a range of printable
   * ascii chars.
   */
  _padString : function(str) {
    var counter = 0;
    if (str.length < 128) {
      for ( var i = str.length; i <= 128; i++) {
        str = String.fromCharCode(this._randomForChar()) + str;
        counter++;
      }
    }
    return counter + this.DELIMIT + str;
  },
  /**
   * Returns random number that would correspond to a printable ascii char.
   */
  _randomForChar : function() {
    var r = 0;
    var c = 0;
    while (r < 33 || r > 126) {
      // just a waiting... this shouldn't happen frequently
      r = parseInt(Math.random() * 150);
      c++;
    }
    return r;
  },
  /**
   * Returns random non-zero integer.
   */
  _randomNonZero : function() {
    var r = 0;
    while ((r = parseInt(Math.random() * 100)) == 0) {
      // just a waiting... this shouldn't happen frequently
    }
    return r;
  },
  /**
   * Shifts string by XOR'ing it with a number larger than 100 so as to avoid
   * non-printable characters. The resulting string will be prepended with the
   * number used to XOR followed by DELIMITER.
   */
  _shiftString : function(str) {
    var delta = this._randomNonZero() + 100;
    var shifted = [];
    for ( var i = 0; i < str.length; i++) {
      shifted.push(String.fromCharCode(str.charCodeAt(i) + delta));
    }
    return delta + this.DELIMIT + shifted.join("");
  },
  /**
   * Unshifts and returns a shifted string. The argument should be in a format
   * produced by _shitString(), i.e. begin with the shift coefficient followed
   * by DELIMITER, followed by the shifted string.
   */
  _unshiftString : function(str) {
    var delta = parseInt(str.substring(0, str.indexOf(this.DELIMIT)));
    var unshifted = [];
    if (!isNaN(delta)) {
      for ( var i = ((delta + "").length + this.DELIMIT.length); i < str.length; i++) {
        unshifted.push(String.fromCharCode(str.charCodeAt(i) - delta));
      }
    }
    return unshifted.join("");
  },
  /**
   * Encrypts string with a seed string and returns encrypted string padded to
   * be XORCrypt.LENGTH characters long.
   */
  encrypt : function(str, seed) {
    str += "";
    seed += "";
    var newStr = this._padString(this._shiftString(str));
    var enc = [];
    for ( var i = 0; i < newStr.length; i++) {
      var e = newStr.charCodeAt(i);
      for ( var j = 0; j < seed.length; j++) {
        e = seed.charCodeAt(j) ^ e;
      }
      enc.push(String.fromCharCode(e + 100));
    }
    return enc.join("");
  },
  /**
   * Decrypts string using seed string. The seed string has to be the same
   * string that was used in encrypt()ing.
   */
  decrypt : function(str, seed) {
    str += "";
    seed += "";
    var dec = [];
    for ( var i = 0; i < str.length; i++) {
      var e = str.charCodeAt(i) - 100;
      for ( var j = seed.length - 1; j >= 0; j--) {
        e = seed.charCodeAt(j) ^ e;
      }
      dec.push(String.fromCharCode(e));
    }
    var decStr = dec.join("");
    var pad = parseInt(decStr.substring(0, decStr.indexOf(this.DELIMIT)));
    if (!isNaN(pad)) {
      return this._unshiftString(decStr.substring(("" + pad).length
          + this.DELIMIT.length + pad));
    }
    return "";
  }
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

(function() {
  var LOG = null;

  Downsha.QueueProcessorStatus = {
    STOPPED : 0,
    STARTED : 1
  };

  Downsha.QueueProcessor = function QueueProcessor(interval, gracePeriod) {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("active", this.isActive);
    this.__defineGetter__("length", this.getLength);
    this.__defineType__("queue", "Array");
    this.__definePositiveInteger__("sema", 0);
    this.__definePositiveInteger__("status", 0);
    this.__definePositiveInteger__("interval", 0);
    this.__definePositiveInteger__("gracePeriod", 0);
    this.__definePositiveInteger__("lastSuccess", 0);
    this.__definePositiveInteger__("lastError", 0);
    this.__definePositiveInteger__("processTimeout", 0);
    this.initialize(interval, gracePeriod);
  };
  Downsha.mixin(Downsha.QueueProcessor, Downsha.DefiningMixin);

  Downsha.QueueProcessor.prototype._proc = null;

  Downsha.QueueProcessor.prototype.initialize = function(interval, gracePeriod) {
    this.interval = interval;
    this.gracePeriod = gracePeriod;
    this.queue = [];
  };

  Downsha.QueueProcessor.prototype.getLength = function() {
    if (this.currentItem && this.queue.indexOf(this.currentItem) >= 0) {
      LOG
          .warn("Something went wrong and currentItem ended up back in the queue while still being currentItem");
    }
    var delta = (this.currentItem) ? 1 : 0;
    return this.queue.length + delta;
  };
  Downsha.QueueProcessor.prototype.isEmpty = function() {
    return this.length == 0;
  };
  Downsha.QueueProcessor.prototype.start = function(noprocess) {
    LOG.debug("Downsha.QueueProcessor.start");
    var self = this;
    if (typeof this.processor != 'function') {
      throw new Error("No processor defined");
    }
    if (this.isStopped()) {
      this.status = Downsha.QueueProcessorStatus.STARTED;
      if (this.interval > 0) {
        this._proc = setInterval(function() {
          LOG.debug("Periodic check for processing");
          self.process();
        }, this.interval);
      }
      if (!this.isActive() && !noprocess) {
        this.process();
      }
    } else if (this.isStarted() && !noprocess) {
      LOG
          .debug("Attempt was made to start QueueProcessor, but it's already started. Kicking off the processor...");
      this.process();
    } else {
      LOG
          .error("Attempt was made to start QueueProcessor, but it's status is uknown: "
              + this.status + ". Ignoring...");
    }
  };
  Downsha.QueueProcessor.prototype.stop = function() {
    LOG.debug("Downsha.QueueProcessor.stop");
    if (this._proc) {
      clearInterval(this._proc);
      this.sema = 0;
    }
    this.status = Downsha.QueueProcessorStatus.STOPPED;
  };
  Downsha.QueueProcessor.prototype.isStopped = function() {
    return this.status == Downsha.QueueProcessorStatus.STOPPED;
  };
  Downsha.QueueProcessor.prototype.isStarted = function() {
    return this.status == Downsha.QueueProcessorStatus.STARTED;
  };
  Downsha.QueueProcessor.prototype.isActive = function() {
    return this.sema > 0;
  };
  Downsha.QueueProcessor.prototype.createPayload = function(item) {
    return new Downsha.ProcessorPayload(item);
  };
  Downsha.QueueProcessor.prototype.add = function(item) {
    this.queue.push(this.createPayload(item));
  };
  Downsha.QueueProcessor.prototype.addAll = function(items) {
    for ( var i = 0; i < items.length; i++) {
      this._add(items[i], true);
    }
  };
  Downsha.QueueProcessor.prototype.remove = function(item) {
    var removed = undefined;
    for ( var i = 0; i < this.queue.length; i++) {
      if (this.queue[i].data == item) {
        removed = this.queue.splice(i, 1).shift();
        break;
      }
    }
    if (!removed && this.currentItem && this.currentItem.data == item) {
      removed = this.currentItem;
      this.currentItem = null;
    }
    if (LOG.isDebugEnabled()) {
      LOG.debug("Removed item");
      LOG.dir(removed);
    }
    return removed;
  };
  Downsha.QueueProcessor.prototype.removePayload = function(payload) {
    var i = this.queue.indexOf(payload);
    var removed = undefined;
    if (i >= 0) {
      removed = this.queue.splice(i, 1).shift();
    } else if (this.currentItem && this.currentItem == payload) {
      removed = this.currentItem;
      this.currentItem = null;
    }
    if (LOG.isDebugEnabled()) {
      LOG.debug("Removed payload");
      LOG.dir(removed);
    }
    return removed;
  };
  Downsha.QueueProcessor.prototype.removeAll = function() {
    this.queue = [];
    this.currentItem = null;
  };
  Downsha.QueueProcessor.prototype.isPayloadProcessed = function(payload) {
    return (payload.processed) ? true : false;
  };
  Downsha.QueueProcessor.prototype.isPayloadInGrace = function(payload) {
    var now = new Date().getTime();
    if (!payload.processed && payload.lastProcessed > 0
        && (now - payload.lastProcessed) < this.gracePeriod) {
      return true;
    }
    return false;
  };
  Downsha.QueueProcessor.prototype.isPayloadProcessable = function(payload) {
    if (this.isPayloadProcessed(payload) || this.isPayloadInGrace(payload)) {
      return false;
    }
    return true;
  };
  Downsha.QueueProcessor.prototype.indexOfNext = function() {
    LOG.debug("QueueProcessor.indexOfNext");
    var now = new Date().getTime();
    for ( var i = 0; i < this.queue.length; i++) {
      var payload = this.queue[i];
      if (this.isPayloadProcessable(payload)) {
        return i;
      }
    }
    return -1;
  };
  Downsha.QueueProcessor.prototype.hasNext = function() {
    LOG.debug("QueueProcessor.hasNext");
    return (this.indexOfNext() >= 0) ? true : false;
  };
  Downsha.QueueProcessor.prototype.next = function() {
    LOG.debug("Downsha.QueueProcessor.next");
    var i = this.indexOfNext();
    if (i >= 0) {
      return this.queue.splice(i, 1).shift();
    }
    return undefined;
  };
  Downsha.QueueProcessor.prototype.peek = function() {
    LOG.debug("Downsha.QueueProcessor.peek");
    // return this.queue[0];
    var i = this.indexOfNext();
    if (i >= 0) {
      return this.queue[i];
    }
  };
  Downsha.QueueProcessor.prototype.wait = function() {
    LOG.debug("Downsha.QueueProcessor.wait");
    this.sema++;
    LOG.debug("SEMA = " + this.sema);
  };
  Downsha.QueueProcessor.prototype.signal = function() {
    LOG.debug("Downsha.QueueProcessor.signal");
    if (LOG.isDebugEnabled()) {
      LOG.dir(arguments.callee.caller);
    }
    this.sema--;
    LOG.debug("SEMA = " + this.sema);
    if (this.isStarted()) {
      LOG
          .debug("Kicking off processor cuz there's no one waiting and we're started");
      this.process();
    } else {
      LOG
          .debug("Not kicking off processor when there's nothing waiting because it hasn't been started yet...");
    }
  };
  Downsha.QueueProcessor.prototype._onprocess = function(item, processor, data) {
    LOG.debug("QueueProcessor._onprocess");
    item.processed = true;
    item.lastProcessed = new Date().getTime();
    if (typeof this.onprocess == 'function') {
      try {
        this.onprocess(item, processor, data);
      } catch (e) {
        LOG.exception("Exception handling onprocess: " + e);
      }
    }
    this.currentItem = null;
    this.lastSuccess = new Date().getTime();
    LOG.debug("Queue size: " + this.queue.length);
  };
  Downsha.QueueProcessor.prototype._onprocesserror = function(item, processor,
      data) {
    LOG.debug("QueueProcessor._onprocesserror");
    item.processed = false;
    item.lastProcessed = new Date().getTime();
    this.lastError = new Date().getTime();
    if (typeof this.onprocesserror == 'function') {
      try {
        this.onprocesserror(item, processor, data);
      } catch (e) {
        LOG.exception("Exception handling onprocesserror: " + e);
      }
    }
    this.currentItem = null;
    this.queue.push(item);
    LOG.debug("Queue size: " + this.queue.length);
  };
  Downsha.QueueProcessor.prototype._onprocesstimeout = function() {
    LOG.debug("QueueProcessor._onprocesstimeout");
    if (typeof this.onprocesstimeout == 'function') {
      try {
        this.onprocesstimeout();
      } catch (e) {
        LOG.exception("Exception handling onprocesstimeout: " + e);
      }
    }
    if (this.currentItem) {
      this.currentItem.processed = false;
      this.currentItem.lastProcessed = new Date().getTime();
      this.currentItem.lastError = new Date().getTime();
      this.queue.push(this.currentItem);
      this.currentItem = null;
      this.signal();
    }
  };
  Downsha.QueueProcessor.prototype.process = function(force) {
    LOG.debug("QueueProcessor.process");
    if (this.isStarted() && !this.isActive()) {
      var self = this;
      if (force) {
        this.refresh();
      }
      if (this.hasNext()) {
        this.wait();
        var item = this.currentItem = this.next();
        LOG.debug("About to process next item:");
        if (LOG.isDebugEnabled()) {
          LOG.dir(item);
        }
        item.attempts++;
        this.processor(item.data, function(data) {
          LOG.debug("Successfully processed item");
          self._onprocess(item, self, data);
          self.signal();
        }, function(data) {
          LOG.debug("Error processing item");
          self._onprocesserror(item, self, data);
          self.signal();
        });
      } else {
        LOG.debug("Nothing to process...");
      }
    } else if (!this.isStarted()) {
      LOG.warn("QueueProcessor hasn't been started");
    } else if (this.isActive()) {
      if (this.processTimeout > 0 && this.currentItem
          && ((Date.now() - this.currentItem.created) > this.processTimeout)) {
        LOG.debug("Payload is taking too long, let's timeout");
        this._onprocesstimeout();
      } else {
        LOG
            .warn("Attempt was made to process QueueProcessor, but it's already active. Ignoring attempt");
      }
    }
  };
  Downsha.QueueProcessor.prototype.refresh = function() {
    LOG.debug("QueueProcessor.refresh");
    for ( var i = 0; i < this.queue.length; i++) {
      var payload = this.queue[i];
      if (payload) {
        payload.refresh();
      }
    }
  };
  Downsha.QueueProcessor.prototype.toString = function() {
    var stat = "UNKNOWN";
    if (this.status == Downsha.QueueProcessorStatus.STARTED) {
      stat = "STARTED";
    } else if (this.status == Downsha.QueueProcessorStatus.STOPPED) {
      stat = "STOPPED";
    }
    var active = (this.isActive()) ? "ACTIVE" : "INACTIVE";
    return this.constructor.name + " " + stat + " " + active + " ("
        + this.queue.length + " items; " + ((this.currentItem) ? "1" : "0")
        + " pending) [int: " + this.interval + "; grace: " + this.gracePeriod
        + "; lastSuccess: " + this.lastSuccess + "; lastError: "
        + this.lastError + "]";
  };

  Downsha.ProcessorPayload = function ProcessorPayload(obj) {
    this.initialize(obj);
  };
  Downsha.ProcessorPayload.fromObject = function(obj) {
    if (obj instanceof Downsha.ProcessorPayload) {
      return obj;
    } else {
      var newObj = new Downsha.ProcessorPayload();
      if (typeof obj == 'object' && obj) {
        for ( var i in obj) {
          if (typeof obj[i] != 'function'
              && typeof newObj.__proto__[i] != 'undefined') {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    }
  };
  Downsha.ProcessorPayload.prototype.data = null;
  Downsha.ProcessorPayload.prototype.created = 0;
  Downsha.ProcessorPayload.prototype.lastProcessed = 0;
  Downsha.ProcessorPayload.prototype.processed = false;
  Downsha.ProcessorPayload.prototype.attempts = 0;
  Downsha.ProcessorPayload.prototype.initialize = function(obj) {
    this.data = obj;
    this.created = new Date().getTime();
  };
  Downsha.ProcessorPayload.prototype.refresh = function() {
    this.lastProcessed = 0;
    this.processed = false;
    // this.attempts = 0;
  };
  Downsha.ProcessorPayload.prototype.toJSON = function() {
    return {
      data : this.data,
      processed : this.processed,
      created : this.created,
      lastProcessed : this.lastProcessed,
      attempts : this.attempts
    };
  };
  Downsha.ProcessorPayload.prototype.toLOG = function() {
    return {
      "created" : this.created,
      "processed" : this.processed,
      "lastProcessed" : this.lastProcessed,
      "attempts" : this.attempts,
      "data" : (typeof this.data == 'object' && this.data && typeof this.data.toLOG == 'function') ? this.data
          .toLOG()
          : this.data
    };
  };
})();


(function() {
  var LOG = null;
  Downsha.PersistentQueueProcessor = function PersistentQueueProcessor(path,
      size, interval, gracePeriod, success, error) {
    LOG = Downsha.Logger.getInstance();
    this.__defineType__("fsa", Downsha.FSA);
    this.__defineString__("rootPath", "/");
    this.initialize(path, size, interval, gracePeriod, success, error);
  };
  Downsha.inherit(Downsha.PersistentQueueProcessor, Downsha.QueueProcessor);

  Downsha.PersistentQueueProcessor.prototype.initialize = function(path, size,
      interval, gracePeriod, success, error) {
    LOG.debug("PersistentQueueProcessor.initialize");
    var self = this;
    Downsha.PersistentQueueProcessor.parent.initialize.apply(this, [ interval,
        gracePeriod ]);
    if (path && size) {
      if (path) {
        this.rootPath = path;
      }
      this.initializeFSA(size, success, error);
    }
  };
  Downsha.PersistentQueueProcessor.prototype.initializeFSA = function(size,
      success, error) {
    LOG.debug("PersistentQueueProcessor.inializeFSA");
    var self = this;
    var errorHandler = function(e) {
      LOG.debug("Error creating FSA for PersistentQueueProcessor: " + e.code);
      self.signal();
      self.onerror(e);
      if (typeof error == 'function') {
        error(e);
      }
    };
    this.wait();
    this.fsa = new Downsha.FSA(PERSISTENT, size, function() {
      LOG.debug("Successfully created FSA, making sure we have the path");
      self.fsa.ensureDirectory(self.rootPath, function() {
        LOG.debug("Ensured and using the requested path as root path: "
            + self.rootPath);
        self.fsa.changeDirectory(self.rootPath, function() {
          self.fsa.listFiles(null, function(entries) {
            LOG.debug("Successfully read pre-existing file entries: "
                + entries.length);
            self.initializeWithEntries(entries);
            if (typeof success == 'function') {
              success();
            }
            self.signal();
          }, errorHandler);
        }, errorHandler);
      }, errorHandler);
    }, errorHandler);
  };
  Downsha.PersistentQueueProcessor.prototype.onerror = function(err) {
      try {
          var msg = Downsha.Utils.errorDescription(err);
          LOG.error(msg);
      } catch(e) {
          LOG.error(err);
      }
  };
  Downsha.PersistentQueueProcessor.prototype._pathForItem = function(item) {
    return "" + (new Date().getTime());
  };
  Downsha.PersistentQueueProcessor.prototype.initializeWithEntries = function(
      entries) {
    LOG.debug("PersistentQueueProcessor.initializeWithEntries");
    if (entries && entries.length > 0) {
      for ( var i = 0; i < entries.length; i++) {
        if (this.isInitializableFileEntry(entries[i])) {
          this.add(entries[i]);
        }
      }
    }
  };
  Downsha.PersistentQueueProcessor.prototype.isInitializableFileEntry = function(
      fileEntry) {
    return (fileEntry && fileEntry.isFile) ? true : false;
  };
  Downsha.PersistentQueueProcessor.prototype.createPayload = function(item) {
    LOG.debug("PersistentQueueProcessor.createPayload");
    var self = this;
    var payload = Downsha.PersistentProcessorPayload
        .fromObject(Downsha.PersistentQueueProcessor.parent.createPayload
            .apply(this, [ item ]));
    if (item && item.isFile) {
      LOG.debug("Creating payload for file");
      payload.path = item.name;
      payload.file = item;
      payload.data = null;
    } else {
      LOG.debug("Creating payload for data object");
      payload.path = this._pathForItem(item);
      payload.data = item;
      var content = Downsha.AppModel.serializeStorable(item);
      this.fsa
          .writeFile(
              payload.path,
              content,
              function(writer, file) {
                if (self.isPayloadProcessed(payload)) {
                  self.fsa
                      .removeFile(
                          payload.path,
                          function() {
                            LOG
                                .debug("Successfully removed just-created file, since it was already uploaded");
                          }, self._onremoveerror);
                } else {
                  LOG.debug("Associating file with payload");
                  payload.file = file;
                  if (LOG.isDebugEnabled()) {
                    LOG.dir(payload);
                  }
                }
              }, this._onwriteerror);
    }
    return payload;
  };
  Downsha.PersistentQueueProcessor.prototype.remove = function(item,
      dontRemoveFile) {
    LOG.debug("PersistentQueueProcessor.remove");
    var removed = Downsha.PersistentQueueProcessor.parent.remove.apply(this,
        [ item ]);
    if (removed && !dontRemoveFile) {
      this._removePayloadFile(removed);
    } else {
      LOG
          .debug("Not removing payload file cuz there isn't one associated with the payload");
    }
    return removed;
  };
  Downsha.PersistentQueueProcessor.prototype.removePayload = function(payload,
      dontRemoveFile) {
    LOG.debug("PersistentQueueProcessor.removePayload");
    var removed = Downsha.PersistentQueueProcessor.parent.removePayload.apply(
        this, [ payload ]);
    if (removed && !dontRemoveFile) {
      this._removePayloadFile(removed);
    } else {
      LOG
          .debug("Not removing payload file cuz there isn't one associated with the payload");
    }
  };
  Downsha.PersistentQueueProcessor.prototype._removePayloadFile = function(
      payload) {
    LOG.debug("PersistentQueueProcessor._removePayloadFile");
    if (payload && payload.file) {
      payload.file.remove(function() {
        LOG.debug("Successfully removed file: " + payload.file.fullPath);
      }, this._onremoveerror);
    }
  };
  Downsha.PersistentQueueProcessor.prototype.removeAll = function(
      dontRemoveFiles) {
    LOG.debug("PersistentQueueProcessor.removeAll");
    var self = this;
    Downsha.PersistentQueueProcessor.parent.removeAll.apply(this);
    if (!dontRemoveFiles) {
      var errorCallback = function(e) {
        LOG.error("FSA Error during PersistentQueueProcessor.removeAll: "
            + e.code);
      };
      this.fsa.emptyDirectory(this.rootPath, function() {
        LOG.debug("Successfully emptied directory: " + this.rootPath);
      }, errorCallback);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onfsaerror = function(e) {
    LOG.error("FSA Error: " + e.code);
    if (typeof this.onfsaerror == 'function') {
      this.onfsaerror(e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onwriteerror = function(e) {
    LOG.error("Failed to write to file: " + e.code);
    this._onfsaerror(e);
    if (typeof this.onwriteerror == 'function') {
      this.onwriteerror(e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onremoveerror = function(e) {
    LOG.error("Failed to remove file: " + e.code);
    if (typeof this.onremoveerror == 'function') {
      this.onremoveerror(e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype._onprocess = function(item,
      processor, data) {
    LOG.debug("PersistentQueueProcessor._onprocess");
    Downsha.PersistentQueueProcessor.parent._onprocess.apply(this, arguments);
    this._removePayloadFile(item);
  };
  Downsha.PersistentQueueProcessor.prototype._onreaderror = function(item, e) {
    LOG.debug("PersistentQueueProcessor._onreaderror");
    this.removePayload(item);
    if (typeof this.onreaderror == 'function') {
      this.onreaderror(item, e);
    }
  };
  Downsha.PersistentQueueProcessor.prototype.process = function(force) {
    LOG.debug("PersistentQueueProcessor.process");
    var self = this;
    var error = function(e) {
      LOG.error("Error retrieving contents of a file: " + e.code);
      self.signal();
    };
    if (!this.isStarted()) {
      LOG
          .warn("Attempted to processes when processor hasn't been started yet...");
      return;
    }
    var peeked = this.peek();
    if (peeked && !this.isActive() && !peeked.data && peeked.file) {
      LOG.debug("Next entry in the queue is a file, let's read it in");
      this.wait();
      peeked.file.file(function(file) {
        self.fsa.readTextFromFile(file, function(reader, file) {
          try {
            var content = Downsha.AppModel.unserializeStorable(reader.result);
            peeked.data = content;
          } catch (e) {
            LOG.warn("Error reading clip from file " + file.name + ": " + e);
            self._onreaderror(peeked, e);
          }
          self.signal();
        }, error);
      }, error);
      return;
    } else {
      LOG.debug("Next entry is not a file, let's process it...");
      Downsha.PersistentQueueProcessor.parent.process.apply(this, arguments);
    }
  };

  Downsha.PersistentProcessorPayload = function PersistentProcessorPayload(obj) {
    this.initialize(obj);
  };
  Downsha.inherit(Downsha.PersistentProcessorPayload,
      Downsha.ProcessorPayload);
  Downsha.PersistentProcessorPayload.fromObject = function(obj) {
    if (obj instanceof Downsha.PersistentProcessorPayload) {
      return obj;
    } else {
      var newObj = new Downsha.PersistentProcessorPayload();
      if (typeof obj == 'object' && obj) {
        for ( var i in obj) {
          if (typeof obj[i] != 'function'
              && typeof newObj.__proto__[i] != 'undefined') {
            newObj[i] = obj[i];
          }
        }
      }
      return newObj;
    }
  };
  Downsha.PersistentProcessorPayload.prototype.file = null;
  Downsha.PersistentProcessorPayload.prototype.path = null;
  Downsha.PersistentProcessorPayload.prototype.processResponse = null;
  Downsha.PersistentProcessorPayload.prototype.refresh = function() {
    Downsha.PersistentProcessorPayload.parent.refresh.apply(this, []);
    this.processResponse = null;
  };
  Downsha.PersistentProcessorPayload.prototype.toJSON = function() {
    var obj = Downsha.PersistentProcessorPayload.parent.toJSON.apply(this);
    obj["processResponse"] = this.processResponse;
    obj["path"] = this.path;
    return obj;
  };
  Downsha.PersistentProcessorPayload.prototype.toLOG = function() {
    var logObj = Downsha.PersistentProcessorPayload.parent.toLOG.apply(this);
    logObj["file"] = (this.file && this.file.name) ? this.file.name : null;
    logObj["path"] = this.path;
    logObj["hasProcessResponse"] = (this.processResponse) ? true : false;
    logObj["data"] = (typeof this.data == 'object' && this.data && typeof this.data["toLOG"] == 'function') ? this.data
        .toLOG()
        : this.data;
    return logObj;
  };
})();

/*
 * Downsha.AppModel
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * I represent a basic Downsha.AppModel. My subclasses are more interesting
 * than me, and I keep a Registry for them in order to provide basic object
 * un/marshalling between server and client sides
 */
Downsha.AppModel = function AppModel(obj) {
  this.__defineGetter__("modelName", this.getModelName);
  this.initialize(obj);
};
Downsha.mixin(Downsha.AppModel, Downsha.DefiningMixin);
/**
 * Using FunctionOverrides
 */
Downsha.AppModel.prototype.handleInheritance = function(child, parent) {
  if (typeof child[Downsha.AppModel.CLASS_FIELD] == 'string') {
    Downsha.AppModel.Registry[child[Downsha.AppModel.CLASS_FIELD]] = child;
  }
};
// indicates whether model was updated...
Downsha.AppModel.prototype._updated = false;

/**
 * Deferred intialization
 */
Downsha.AppModel.prototype.initialize = function(obj) {
  if (obj != null && typeof obj == 'object') {
    for ( var i in obj) {
      var methName = "set" + (i.substring(0, 1).toUpperCase()) + i.substring(1);
      if (typeof this[methName] == 'function') {
        this[methName].apply(this, [ obj[i] ]);
      } else if (typeof this[i] != 'undefined' && i != "modelName") {
        try {
          this[i] = obj[i];
        } catch (e) {
        }
      }
    }
  }
};

/**
 * Description of a model, often used by getModelName() and getLabel() to
 * represent the model on canvas
 */
Downsha.AppModel.prototype.getModelName = function() {
  return this.constructor.name;
};

Downsha.AppModel.prototype.equals = function(model) {
  return (this == model);
};

Downsha.AppModel.prototype.serialize = function() {
  return JSON.stringify(this);
};
Downsha.AppModel.prototype.properties = function() {
  var props = new Array();
  for ( var i in this) {
    if (typeof this[i] != 'function') {
      props.push(i);
    }
  }
  return props;
};
Downsha.AppModel.prototype.methods = function() {
  var meths = new Array();
  for ( var i in this) {
    if (typeof this[i] == 'function' && i != 'constructor' && i != 'prototype') {
      meths.push(i);
    }
  }
  return meths;
};

/**
 * Answers object containing "storable" data. This is used to send to remote
 * services as part of automating translation between server side objects and
 * client side objects.
 */
Downsha.AppModel.prototype.toStorable = function(prefix) {
  var storable = {};
  var params = this.getStorableProps();
  prefix = (typeof prefix == 'string') ? prefix : "";
  for ( var i = 0; i < params.length; i++) {
    if (typeof this[params[i]] != 'undefined' && this[params[i]] != null)
      storable[prefix + params[i]] = this[params[i]];
  }
  return storable;
};
/**
 * toStorable uses this to retrieve names of fields of an instance that are
 * storable.
 */
Downsha.AppModel.prototype.getStorableProps = function() {
  var params = new Array();
  for ( var i in this) {
    if (this[i] != null
        && i.indexOf("_") != 0 // private props
        && i != "modelName"
        && (typeof this[i] == 'string' || typeof this[i] == 'number' || typeof this[i] == 'boolean'))
      params.push(i);
  }
  return params;
};
Downsha.AppModel.prototype.toJSON = function() {
  return this.toStorable();
};

/**
 * Holds references to subclasses of Downsha.AppModel so as to provide quick
 * and easy way to unmarshall classifiable objects. These are often produced by
 * other languages which would e.g. produce JSON strings with a specific field
 * identifying the kind of class the struct represents. i.e. {"javaClass":
 * "java.util.List", "list": [...]} This registry holds references to subclasses
 * of Downsha.AppModel that claim responsibility for handling those
 * identifiable structs.
 */
Downsha.AppModel.Registry = {};
Downsha.AppModel.registeredClasses = function() {
  var str = new Array();
  for ( var i in Downsha.AppModel.Registry) {
    str.push(i);
  }
  return str;
};
/**
 * Name of the object's field used to identify correlation between JSON struct
 * and typeof Downsha.AppModel
 */
Downsha.AppModel.CLASS_FIELD = "javaClass";
/**
 * Returns a serialized string representing given object. This string is
 * suitable for storage (local disk, etc). To re-construct the object from that
 * string, use Downsha.AppModel.unserializeStorable(str);
 * 
 * @param obj
 * @return
 */
Downsha.AppModel.serializeStorable = function(obj) {
  var storable = this.marshall(obj);
  if (obj.constructor[this.CLASS_FIELD]) {
    storable[this.CLASS_FIELD] = obj.constructor[this.CLASS_FIELD];
  }
  return JSON.stringify(storable);
};
/**
 * Unserializes a storable object from a string, unmarshalling it to produce an
 * appropriate instance of the object represented in given string. Use
 * Downsha.AppModel.serializeStorable(obj) to produce correctly serialized
 * strings.
 * 
 * @param str
 * @return
 */
Downsha.AppModel.unserializeStorable = function(str) {
  return this.unmarshall(JSON.parse(str));
};
/**
 * Unmarshalls obnj
 */
Downsha.AppModel.unmarshall = function(obj) {
  var newObj = null;
  if (!obj) {
    return obj;
  }
  if (typeof obj[Downsha.AppModel.CLASS_FIELD] == 'string'
      && typeof Downsha.AppModel.Registry[obj[Downsha.AppModel.CLASS_FIELD]] == 'function') {
    // LOG.debug("Found a function for class " +
    // obj[Downsha.AppModel.CLASS_FIELD]);
    var constr = Downsha.AppModel.Registry[obj[Downsha.AppModel.CLASS_FIELD]];
    newObj = new constr();
  } else if (obj[Downsha.AppModel.CLASS_FIELD]
      && obj[Downsha.AppModel.CLASS_FIELD].toLowerCase().indexOf("list") > 0
      && obj["list"] instanceof Array) {
    // LOG.debug("Found a list for class " +
    // obj[Downsha.AppModel.CLASS_FIELD]);
    newObj = new Array();
  } else if (typeof obj == 'string' || typeof obj == 'number'
      || typeof obj == 'boolean') {
    // LOG.debug("Object is a basic struct");
    return obj;
  } else if (obj instanceof Array) {
    // LOG.debug("Object is an array. Recursing..");
    newObj = new Array();
    for ( var i = 0; i < obj.length; i++) {
      newObj.push(Downsha.AppModel.unmarshall(obj[i]));
    }
    return newObj;
  } else {
    // LOG.debug("Creating a dummy for object");
    // create dummy Downsha.AppModel
    newObj = new this();
  }
  if (newObj) {
    for ( var i in obj) {
      // skip setters
      if (i.indexOf("set") == 0) {
        // LOG.debug("Skipping property that's a setter: " + i);
        continue;
      }
      var setterName = "set" + i.substring(0, 1).toUpperCase() + i.substring(1);
      if (typeof obj[i] == 'string' || typeof obj[i] == 'number'
          || typeof obj[i] == 'boolean') {
        if (typeof newObj[setterName] == 'function') {
          // LOG.debug("Calling setter: " + setterName);
          newObj[setterName].apply(newObj, [ obj[i] ]);
        } else {
          // LOG.debug("Setting property: " + i);
          newObj[i] = obj[i];
        }
      } else if (typeof obj[i] == 'object' && obj[i] != null) {
        // LOG.debug("Umarshalling object and assigning it to property");
        newObj[i] = Downsha.AppModel.unmarshall(obj[i]);
      }
    }
  }
  // LOG.debug("Done unmarshalling...");
  return newObj;
};
/**
 * Marshalls instance of Downsha.AppModel into a classifiable object. Custom
 * logic is implemented by the subclass's toStorable method - which should
 * return the expected structure.
 */
Downsha.AppModel.marshall = function(data) {
  if (data instanceof Array) {
    var newArray = new Array();
    for ( var i = 0; i < data.length; i++) {
      newArray.push(Downsha.AppModel._marshall(data[i]));
    }
    return newArray;
  } else {
    return Downsha.AppModel._marshall(data);
  }
};
Downsha.AppModel._marshall = function(data) {
  if (data && typeof data["toStorable"] == 'function') {
    return data.toStorable();
  } else {
    return data;
  }
};

/*
 * Downsha.AppDataModel
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * My instances represent storable Models such as Notes, Notebooks, Tags,
 * SavedSearches etc
 * 
 * @param obj
 * @return
 */
Downsha.AppDataModel = function AppDataModel(obj) {
  this.initialize(obj);
};
Downsha.inherit(Downsha.AppDataModel, Downsha.AppModel);
Downsha.AppDataModel.prototype.guid = null;
Downsha.AppDataModel.prototype.updateSequenceNum = -1;

Downsha.AppDataModel.fromObject = function(obj) {
  if (obj.constructor == this) {
    return obj;
  } else {
    return new this(obj);
  }
};

Downsha.AppDataModel.prototype.getLabel = function() {
  if (this.modelName) {
    return this.modelName;
  } else {
    return null;
  }
};
Downsha.AppDataModel.prototype.equals = function(model) {
  return (model instanceof Downsha.AppDataModel && (this.guid == model.guid && this.updateSequenceNum == model.updateSequenceNum));
};
Downsha.AppDataModel.prototype.toString = function() {
  return '[' + this.modelName + ':' + this.guid + ']';
};
Downsha.AppDataModel.prototype.toLOG = function() {
  return this;
};
Downsha.AppDataModel.toCSV = function(models) {
  var modelNames = new Array();
  for ( var i = 0; i < models.length; i++) {
    if (models[i] instanceof Downsha.AppDataModel)
      modelNames.push(models[i].modelName);
  }
  return modelNames.join(", ");
};

Downsha.AppDataModel.fromCSV = function(modelNames) {
  var modelArray = new Array();
  var models = modelNames.split(',');

  for ( var i = 0; i < models.length; i++) {
    if (models[i] instanceof Downsha.AppDataModel) {
      var modelName = Downsha.AppDataModel.trim(models[i]);
      if (modelName.length > 0) {
        modelArray.push(modelName);
      }
    }
  }

  return modelArray;
};

Downsha.AppDataModel.trim = function(modelName) {
  return modelName.replace(/^\s*/, "").replace(/\s*$/, "");
};

Downsha.AuthenticationToken = function() {
  this.__defineString__("shardId");
  this.__definePositiveInteger__("userId");
  this.__definePositiveInteger__("expiration");
  this.__definePositiveInteger__("created");
  this.__definePositiveInteger__("permissions");
  this.__defineString__("signature");
  this.__definePositiveInteger__("sharedNotebookId");
  this.__defineString__("apiKey");
  this.initialize();
};

Downsha.AuthenticationToken.javaClass = "com.downsha.service.AuthenticationToken";
Downsha.inherit(Downsha.AuthenticationToken, Downsha.AppModel);
Downsha.mixin(Downsha.AuthenticationToken, Downsha.DefiningMixin);

Downsha.AuthenticationToken.decode = function(str) {
  // S=s1:U=1fb:E=12f07f018c4:C=12ee3e394c4:P=7f:H=2a86db035d8f165fdc5460dd2fd91885
  var authToken = new Downsha.AuthenticationToken();
  var parts = str.split(":");
  for ( var i = 0; i < parts.length; i++) {
    var kv = parts[i].split("=");
    switch (kv[0]) {
      case "S":
        authToken.shardId = kv[1];
        break;
      case "U":
        authToken.userId = parseInt(kv[1], 16);
        break;
      case "E":
        authToken.expiration = parseInt(kv[1], 16);
        break;
      case "C":
        authToken.created = parseInt(kv[1], 16);
        break;
      case "P":
        authToken.permissions = parseInt(kv[1], 16);
        break;
      case "H":
        authToken.signature = kv[1];
        break;
      case "N":
        authToken.sharedNotebookId = parseInt(kv[1], 16);
        break;
      case "A":
        authToken.apiKey = kv[1];
        break;
    }
  }
  return authToken;
};

Downsha.AuthenticationToken.initialize = function() {
  // nothing to do
};

/*
 * Downsha.AuthenticationResult
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.AuthenticationResult = function AuthenticationResult(obj) {
  this.__defineGetter__("timestamp", this.getTimestamp);

  this.__defineGetter__("user", this.getUser);
  this.__defineSetter__("user", this.setUser);

  this.__defineGetter__("expiration", this.getExpiration);
  this.__defineSetter__("expiration", this.setExpiration);

  this.__defineGetter__("currentTime", this.getCurrentTime);
  this.__defineSetter__("currentTime", this.setCurrentTime);
  this.initialize(obj);
};
Downsha.AuthenticationResult.javaClass = "com.downsha.edam.userstore.AuthenticationResult";
Downsha.inherit(Downsha.AuthenticationResult, Downsha.AppModel);
Downsha.AuthenticationResult.prototype._expiration = null;
Downsha.AuthenticationResult.prototype._currentTime = null;
Downsha.AuthenticationResult.prototype.authenticationToken = null;
Downsha.AuthenticationResult.prototype._user = null;
/**
 * timestamp keeps epoch time of when currentTime is set making it possible to
 * compare relative expiration time
 */
Downsha.AuthenticationResult.prototype._timestamp = null;
/**
 * critical time holds default value indicating how many milliseconds before
 * expiration time that this authentication result is considered in critical
 * condition
 */
Downsha.AuthenticationResult.prototype.criticalTime = (1000 * 60 * 6);
Downsha.AuthenticationResult.prototype.getTimestamp = function() {
  return this._timestamp;
};
Downsha.AuthenticationResult.prototype.setCurrentTime = function(num) {
  if (num == null) {
    this._currentTime = null;
  } else if (typeof num == 'number') {
    this._currentTime = parseInt(num);
  }
  this._timestamp = new Date().getTime();
};
Downsha.AuthenticationResult.prototype.getCurrentTime = function() {
  return this._currentTime;
};
Downsha.AuthenticationResult.prototype.setUser = function(user) {
  if (user == null) {
    this._user = null;
  } else if (user instanceof Downsha.User) {
    this._user = user;
  }
};
Downsha.AuthenticationResult.prototype.getUser = function() {
  return this._user;
};
Downsha.AuthenticationResult.prototype.setExpiration = function(num) {
  if (num == null) {
    this._expiration = null;
  } else if (typeof num == 'number') {
    this._expiration = parseInt(num);
  }
};
Downsha.AuthenticationResult.prototype.getExpiration = function() {
  if (this._expiration && this.currentTime) {
    var delta = (this.timestamp) ? this.timestamp : 0;
    return ((this._expiration - this.currentTime) + delta);
  } else {
    return this._expiration;
  }
};
Downsha.AuthenticationResult.prototype.isExpiring = function() {
  var now = new Date().getTime();
  var critical = this.expiration - now - this.criticalTime;
  return (critical <= this.criticalTime);
};
Downsha.AuthenticationResult.prototype.isExpired = function() {
  var now = new Date().getTime();
  return (this.expiration <= now);
};
Downsha.AuthenticationResult.prototype.expire = function() {
  this.expiration = null;
  this.currentTime = null;
  this._timestamp = null;
};
Downsha.AuthenticationResult.prototype.isEmpty = function() {
  return (!(this.authenticationToken != null && this.user instanceof Downsha.User));
};

Downsha.BasicNote = function BasicNote(obj) {
  this.__defineGetter__("title", this.getTitle);
  this.__defineSetter__("title", this.setTitle);
  this.__defineString__("notebookGuid");
  this.__definePositiveInteger__("created", 0);
  this.__definePositiveInteger__("updated", 0);
  this.__defineType__("tagNames", "Array");
  this.initialize(obj);
};
Downsha.BasicNote.javaClass = "com.downsha.chromeExtension.BasicNote";
Downsha.inherit(Downsha.BasicNote, Downsha.AppDataModel, true);

Downsha.BasicNote.prototype.NOTE_URL_PREFIX = "/view.jsp?";
Downsha.BasicNote.prototype.DEFAULT_LOCALE = "default";

Downsha.BasicNote.prototype.initialize = function(obj) {
  this.tagNames = [];
  this.tagGuids = [];
  Downsha.BasicNote.parent.initialize.apply(this, [ obj ]);
};

Downsha.BasicNote.prototype.cleanTitle = function(title) {
  if (typeof title == 'string') {
    return title.replace(/[\n\r\t]+/, "").replace(/^\s+/, "").replace(/\s+$/,
        "");
  }
  return title;
};

Downsha.BasicNote.prototype.getTitle = function() {
  return this._title;
};

Downsha.BasicNote.prototype.setTitle = function(title, defaultTitle) {
  var newTitle = this.cleanTitle("" + title);
  if ((newTitle == null || newTitle.length == 0) && defaultTitle)
    newTitle = this.cleanTitle("" + defaultTitle);
  this._title = newTitle;
};

Downsha.BasicNote.prototype.addTag = function(tag) {
  if (tag instanceof Downsha.Tag) {
    if (tag.name)
      this.tagNames.push(tag.name);
    if (tag.guid)
      this.tagGuids.push(tag.guid);
  }
};

Downsha.BasicNote.prototype.getThumbnailUrl = function(shardUrl, size) {
  // /shard/s1/thm/note/f67f2848-f49d-493a-b94a-0275dac7f8c6
  shardUrl = shardUrl || "";
  var url = shardUrl + "/thm/note/" + this.guid;
  if (typeof size == 'number' && size > 0) {
    url += "?size=" + size;
  }
  return url;
};

Downsha.BasicNote.prototype.getNoteUrl = function(context, searchWords, locale, includeNotebookGuid) {
    return context.getNoteViewUrl(this.guid, searchWords, locale, ((includeNotebookGuid) ? this.notebookGuid : undefined));
};

Downsha.BasicNote.prototype.getStorableProps = function() {
  return [ "title", "notebookGuid", "tagNames", "created", "updated" ];
};
Downsha.BasicNote.prototype.toLOG = function() {
  return {
    title : this.title,
    notebookGuid : this.notebookGuid,
    tagNames : this.tagNames,
    created : this.created,
    updated : this.updated
  };
};

Downsha.BasicNoteWithContent = function BasicNoteWithContent(obj) {
  this.__defineString__("content");
  this.__defineString__("comment");
  this.initialize(obj);
};
Downsha.BasicNoteWithContent.javaClass = "com.downsha.chromeExtension.BasicNoteWithContent";
Downsha.inherit(Downsha.BasicNoteWithContent, Downsha.BasicNote, true);

Downsha.BasicNoteWithContent.prototype.getStorableProps = function() {
  var props = Downsha.BasicNoteWithContent.parent.getStorableProps.apply(this,
      []);
  props.push("content");
  props.push("comment");
  return props;
};
Downsha.BasicNoteWithContent.prototype.toLOG = function() {
  var obj = Downsha.BasicNoteWithContent.parent.toLOG.apply(this, []);
  obj.contentLength = (this.content) ? this.content.length : 0;
  obj.commentLength = (this.comment) ? this.comment.length : 0;
  return obj;
};

/*
 * Downsha.Note
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * Note object as represented by the thrift model. A few convinience methods
 * were added...
 */
Downsha.Note = function Note(obj) {
  this.__defineBoolean__("active", false);
  this.__defineType__("attributes", "NoteAttributes");
  this.initialize(obj);
};

Downsha.Note.javaClass = "com.downsha.edam.type.Note";
Downsha.inherit(Downsha.Note, Downsha.BasicNoteWithContent, true);

Downsha.Note.prototype.hasLocation = function() {
  return (this.attributes != null
      && typeof this.attributes.longitude == 'number' && typeof this.attributes.latitude == 'number');
};

Downsha.Note.prototype.getStorableProps = function() {
  var basicStorable = Downsha.Note.parent.getStorableProps.apply(this);
  return basicStorable.concat( [ "active", "attributes" ]);
};
Downsha.Note.prototype.toLOG = function() {
  var logObj = Downsha.Note.parent.toLOG.apply(this);
  logObj["active"] = this.active;
  logObj["attributes"] = (this.attributes instanceof Downsha.NoteAttributes) ? this.attributes
      .toLOG()
      : this.attributes;
  return logObj;
};

Downsha.NoteMetadata = function NoteMetadata(obj) {
  this.__definePositiveInteger__("contentLength");
  this.__defineType__("attributes", "NoteAttributes");
  this.__defineString__("largestResourceMime");
  this.__definePositiveInteger__("largestResourceSize");
  this.initialize(obj);
};
Downsha.NoteMetadata.javaClass = "com.downsha.edam.notestore.NoteMetadata";
Downsha.inherit(Downsha.NoteMetadata, Downsha.BasicNote, true);

Downsha.NoteMetadata.prototype.contentLength = null;
Downsha.NoteMetadata.prototype.attributes = null;
Downsha.NoteMetadata.prototype.largestResourceMime = null;
Downsha.NoteMetadata.prototype.largestResourceSize = null;

Downsha.SnippetNote = function SnippetNote(obj) {
  this.__defineGetter__("snippet", this.getSnippet);
  this.__defineSetter__("snippet", this.setSnippet);
  this.initialize(obj);
};
Downsha.SnippetNote.javaClass = "com.downsha.web.SnippetNote";
Downsha.inherit(Downsha.SnippetNote, Downsha.Note, true);

Downsha.SnippetNote.prototype._snippet = null;

Downsha.SnippetNote.prototype.setSnippet = function(snippetText) {
  if (typeof snippetText == 'string' || snippetText == null) {
    this._snippet = snippetText;
  }
};
Downsha.SnippetNote.prototype.getSnippet = function() {
  return this._snippet;
};

Downsha.SnippetNoteMetadata = function SnippetNoteMetadata(obj) {
  this.__defineString__("snippet", "");
  this.initialize(obj);
};
Downsha.SnippetNoteMetadata.javaClass = "com.downsha.chromeExtension.SnippetNoteMetadata";
Downsha.inherit(Downsha.SnippetNoteMetadata, Downsha.NoteMetadata, true);

Downsha.SnippetNoteMetadata.prototype.contentLength = null;
Downsha.SnippetNoteMetadata.prototype.attributes = null;
Downsha.SnippetNoteMetadata.prototype.largestResourceMime = null;
Downsha.SnippetNoteMetadata.prototype.largestResourceSize = null;

/*
 * Downsha.NoteAttributes
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.NoteAttributes = function NoteAttributes(obj) {
  this.__defineGetter__("altitude", this.getAltitude);
  this.__defineSetter__("altitude", this.setAltitude);
  this.__defineGetter__("longitude", this.getLongitude);
  this.__defineSetter__("longitude", this.setLongitude);
  this.__defineGetter__("latitude", this.getLatitude);
  this.__defineSetter__("latitude", this.setLatitude);
  this.initialize(obj);
};

Downsha.NoteAttributes.WEB_CLIP = "web.clip";

Downsha.NoteAttributes.javaClass = 'com.downsha.edam.type.NoteAttributes';
Downsha.inherit(Downsha.NoteAttributes, Downsha.AppModel);
Downsha.NoteAttributes.prototype.author = null;
Downsha.NoteAttributes.prototype.sourceApplication = null;
Downsha.NoteAttributes.prototype.source = Downsha.NoteAttributes.WEB_CLIP;
Downsha.NoteAttributes.prototype.sourceURL = null;
Downsha.NoteAttributes.prototype.subjectDate = null;
Downsha.NoteAttributes.prototype._altitude = null;
Downsha.NoteAttributes.prototype._longitude = null;
Downsha.NoteAttributes.prototype._latitude = null;
Downsha.NoteAttributes.prototype.setAltitude = function(num) {
  if (typeof num == 'number' && !isNaN(num)) {
    this._altitude = num;
  } else if (num == null) {
    this._altitude = null;
  }
};
Downsha.NoteAttributes.prototype.getAltitude = function() {
  return this._altitude;
};
Downsha.NoteAttributes.prototype.setLongitude = function(num) {
  if (typeof num == 'number' && !isNaN(num)) {
    this._longitude = num;
  } else if (num == null) {
    this._longitude = null;
  }
};
Downsha.NoteAttributes.prototype.getLongitude = function() {
  this._longitude;
};
Downsha.NoteAttributes.prototype.setLatitude = function(num) {
  if (typeof num == 'number' && !isNaN(num)) {
    this._latitude = num;
  } else if (num == null) {
    this._latitude = null;
  }
};
Downsha.NoteAttributes.prototype.getLatitude = function() {
  return this._latitude;
};
Downsha.NoteAttributes.prototype.getStorableProps = function() {
  return [ "author", "sourceApplication", "source", "sourceURL", "altitude",
      "subjectDate", "longitude", "latitude" ];
};

/*
 * Downsha.Notebook
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.Notebook = function Notebook(obj) {
  this.__defineGetter__("defaultNotebook", this.isDefaultNotebook);
  this.__defineSetter__("defaultNotebook", this.setDefaultNotebook);
  this.__defineGetter__("name", this.getName);
  this.__defineSetter__("name", this.setName);
  this.__defineGetter__("publishing", this.getPublishing);
  this.__defineSetter__("publishing", this.setPublishing);
  this.initialize(obj);
};
Downsha.Notebook.javaClass = "com.downsha.edam.type.Notebook";
Downsha.inherit(Downsha.Notebook, Downsha.AppDataModel);
Downsha.Notebook.prototype._name = null;
Downsha.Notebook.prototype._defaultNotebook = false;
Downsha.Notebook.prototype._publishing = null;
Downsha.Notebook.prototype.setName = function(notebookName) {
  if (typeof notebookName == 'string')
    this._name = notebookName;
  else if (notebookName == null)
    this._name = null;
};
Downsha.Notebook.prototype.getName = function() {
  return this._name;
};
Downsha.Notebook.prototype.setDefaultNotebook = function(bool) {
  this._defaultNotebook = (bool) ? true : false;
};
Downsha.Notebook.prototype.isDefaultNotebook = function() {
  return this._defaultNotebook;
};
Downsha.Notebook.prototype.setPublishing = function(publishing) {
  // do nothing for now
};
Downsha.Notebook.prototype.getPublishing = function() {
  return this._publishing;
};
Downsha.Notebook.prototype.toString = function() {
  return '[' + this.modelName + ':' + this.guid + ':' + this.name + ']';
};

/*
 * Downsha.NoteFilter
 * Downsha
 *
 * Created by Pavel Skaldin on 3/29/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
NoteSortOrderTypes = {
  CREATED : 1,
  UPDATED : 2,
  RELEVANCE : 3,
  UPDATE_SEQUENCE_NUMBER : 4
};

/** ************** Downsha.NoteSortOrder *************** */
Downsha.NoteSortOrder = function NoteSortOrder(obj) {
  this.__defineGetter__("order", this.getOrder);
  this.__defineSetter__("order", this.setOrder);
  this.__defineGetter__("ascending", this.isAscending);
  this.__defineSetter__("ascending", this.setAscending);
  this.__defineGetter__("type", this.getType);
  this.initialize(obj);
};

Downsha.NoteSortOrder.isValidOrder = function(num) {
  if (typeof num == 'number') {
    for ( var t in NoteSortOrderTypes) {
      if (NoteSortOrderTypes[t] == num) {
        return true;
      }
    }
  }
  return false;
};
Downsha.NoteSortOrder.isValidType = function(orderType) {
  if (typeof orderType == 'string'
      && typeof NoteSortOrderTypes[orderType.toUpperCase()] == 'number') {
    return true;
  }
  return false;
};

Downsha.NoteSortOrder.prototype._order = NoteSortOrderTypes.CREATED;
Downsha.NoteSortOrder.prototype._ascending = false;
Downsha.NoteSortOrder.prototype.initialize = function(obj) {
  if (typeof obj == 'object' && obj != null) {
    for ( var i in obj) {
      if (typeof this[i] != 'undefined') {
        this[i] = obj[i];
      }
    }
  }
};
Downsha.NoteSortOrder.prototype.setOrder = function(order) {
  if (typeof order == 'number' && !isNaN(order)
      && Downsha.NoteSortOrder.isValidOrder(order)) {
    this._order = order;
  } else if (typeof order == 'string'
      && Downsha.NoteSortOrder.isValidType(order)) {
    this._order = NoteSortOrderTypes[order.toUpperCase()];
  } else {
    this._order = NoteSortOrderTypes.CREATED;
  }
};
Downsha.NoteSortOrder.prototype.getOrder = function() {
  return this._order;
};
Downsha.NoteSortOrder.prototype.getType = function() {
  if (this._order != null) {
    for ( var t in NoteSortOrderTypes) {
      if (NoteSortOrderTypes[t] == this._order) {
        return t;
      }
    }
  }
  return null;
};
Downsha.NoteSortOrder.prototype.setAscending = function(bool) {
  this._ascending = (bool) ? true : false;
};
Downsha.NoteSortOrder.prototype.isAscending = function() {
  return this._ascending;
};
Downsha.NoteSortOrder.prototype.toJSON = function() {
  return {
    order : this.order,
    ascending : this.ascending
  };
};

/** ************** Downsha.NoteFilter *************** */
Downsha.NoteFilter = function NoteFilter(obj) {
  this.__defineGetter__("order", this.getOrder);
  this.__defineSetter__("order", this.setOrder);
  this.__defineGetter__("ascending", this.isAscending);
  this.__defineSetter__("ascending", this.setAscending);
  this.__defineGetter__("words", this.getWords);
  this.__defineSetter__("words", this.setWords);
  this.__defineGetter__("notebookGuid", this.getNotebookGuid);
  this.__defineSetter__("notebookGuid", this.setNotebookGuid);
  this.__defineGetter__("tagGuids", this.getTagGuids);
  this.__defineSetter__("tagGuids", this.setTagGuids);
  this.__defineGetter__("timeZone", this.getTimeZone);
  this.__defineSetter__("timeZone", this.setTimeZone);
  this.__defineGetter__("inactive", this.isInactive);
  this.__defineSetter__("inactive", this.setInactive);
  this.__defineGetter__("fuzzy", this.isFuzzy);
  this.__defineSetter__("fuzzy", this.setFuzzy);
  this.initialize(obj);
};

Downsha.NoteFilter.javaClass = "com.downsha.edam.notestore.NoteFilter";
Downsha.inherit(Downsha.NoteFilter, Downsha.AppModel);

Downsha.NoteFilter.ENGLISH_STOP_WORDS = [ "a", "an", "and", "are", "as", "at",
    "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not",
    "of", "on", "or", "such", "that", "the", "their", "then", "there", "these",
    "they", "this", "to", "was", "will", "with" ];

Downsha.NoteFilter.prototype._order = NoteSortOrderTypes.CREATED;
Downsha.NoteFilter.prototype._ascending = false;
Downsha.NoteFilter.prototype._words = null;
Downsha.NoteFilter.prototype._notebookGuid = null;
Downsha.NoteFilter.prototype._tagGuids = null;
Downsha.NoteFilter.prototype._timeZone = null;
Downsha.NoteFilter.prototype._inactive = false;
Downsha.NoteFilter.prototype._fuzzy = false;

Downsha.NoteFilter.prototype.getOrder = function() {
  return this._order;
};
Downsha.NoteFilter.prototype.setOrder = function(order) {
  this._order = Math.max(parseInt(order), 1);
};
Downsha.NoteFilter.prototype.isAscending = function() {
  return this._ascending;
};
Downsha.NoteFilter.prototype.setAscending = function(bool) {
  this._ascending = (bool) ? true : false;
};
Downsha.NoteFilter.prototype.getWords = function() {
  return this._words;
};
Downsha.NoteFilter.prototype.setWords = function(words) {
  if (words == null) {
    this._words = null;
  } else {
    var wordArray = (words instanceof Array) ? words : Downsha.NoteFilter
        .separateWords((words + ""));
    if (wordArray instanceof Array && wordArray.length > 0) {
      if (this.fuzzy) {
        var newWords = new Array();
        for ( var i = 0; i < wordArray.length; i++) {
          newWords.push(Downsha.NoteFilter.makeWordFuzzy(wordArray[i]));
        }
        if (newWords.length > 0) {
          this._words = newWords.join(" ");
        }
      } else {
        this._words = wordArray.join(" ");
      }
    }
  }
};
Downsha.NoteFilter.prototype.getNotebookGuid = function() {
  return this._notebookGuid;
};
Downsha.NoteFilter.prototype.setNotebookGuid = function(guid) {
  if (typeof guid == 'string' && guid.length > 0)
    this._notebookGuid = guid;
  else if (guid == null)
    this._notebookGuid = null;
};
Downsha.NoteFilter.prototype.getTagGuids = function() {
  return this._tagGuids;
};
Downsha.NoteFilter.prototype.setTagGuids = function(guids) {
  if (guids instanceof Array)
    this._tagGuids = guids;
  else if (typeof guids == 'string')
    this._tagGuids = new Array(guids);
  else if (guids == null)
    this._tagGuids = null;
};
Downsha.NoteFilter.prototype.getTimeZone = function() {
  return this._timeZone;
};
Downsha.NoteFilter.prototype.setTimeZone = function(tz) {
  if (typeof tz == 'string')
    this._timeZone = tz;
  else if (tz == null)
    this._timeZone = null;
};
Downsha.NoteFilter.prototype.isInactive = function() {
  return this._inactive;
};
Downsha.NoteFilter.prototype.setInactive = function(bool) {
  this._inactive = (bool) ? true : false;
};
Downsha.NoteFilter.prototype.setFuzzy = function(bool) {
  this._fuzzy = (bool) ? true : false;
};
Downsha.NoteFilter.prototype.isFuzzy = function() {
  return this._fuzzy;
};
Downsha.NoteFilter.prototype.isEmpty = function() {
  return (this._words == null && this._notebookGuid == null
      && this._tagGuids == null && this._timeZone == null);
};
Downsha.NoteFilter.prototype.resetQuery = function() {
  this.words = null;
  this.tagGuids = null;
  this.notebookGuid = null;
  this.inactive = false;
  this.timeZone = null;
};
/**
 * Separates given string by given separator (defaults to
 * Downsha.NoteFilter.WORD_SEPARATOR). Returns array of words found. Keeps
 * quoted words together. If quote charater is not given, defaults to
 * Downsha.NoteFilter.QUOTE.
 */
Downsha.NoteFilter.WORD_SEPARATOR = " ";
Downsha.NoteFilter.QUOTE = '"';
Downsha.NoteFilter.TOKEN_SEPARATOR = ":";
Downsha.NoteFilter.FUZZY_SUFFIX = "*";
Downsha.NoteFilter.RESERVED_TOKENS = [ "any", "notebook", "tag", "intitle",
    "created", "updated", "resource", "subjectDate", "latitude", "longitude",
    "altitude", "author", "source", "sourceApplication", "recoType", "todo" ];
Downsha.NoteFilter.separateWords = function(str, separator, quote) {
  if (typeof separator == 'undefined' || separator == null) {
    separator = Downsha.NoteFilter.WORD_SEPARATOR;
  }
  if (typeof quote == 'undefined' || quote == null) {
    quote = Downsha.NoteFilter.QUOTE;
  }
  var words = new Array();
  var i = 0;
  var buffer = "";
  var quoted = false;
  function addWord(word) {
    if (word) {
      word = word.replace(/^\s+/, "").replace(/\s+$/, "");
      if (word.length > 0) {
        words.push(word);
      }
    }
  }
  str = str.replace(/^\s+/, "").replace(/\s+$/, "");
  while (i < str.length) {
    var c = str.charAt(i);
    if (c == quote) {
      buffer += c;
      quoted = !quoted;
    } else if (!quoted && c == separator) {
      addWord(buffer);
      buffer = "";
    } else {
      buffer += c;
    }
    i++;
  }
  if (buffer.length > 0)
    addWord(buffer);
  return words;
};
Downsha.NoteFilter.isWordFuzzy = function(word) {
  return (typeof word == 'string' && word.charAt(word.length - 1) == Downsha.NoteFilter.FUZZY_SUFFIX);
};
Downsha.NoteFilter.canWordBeFuzzy = function(word) {
  if (typeof word == 'string' && word.length > 0 && word.indexOf(" ") < 0
      && word.indexOf(Downsha.NoteFilter.QUOTE) < 0
      && !Downsha.NoteFilter.isWordFuzzy(word)
      && Downsha.NoteFilter.ENGLISH_STOP_WORDS.indexOf(word.toLowerCase()) < 0) {
    if (word.indexOf(Downsha.NoteFilter.TOKEN_SEPARATOR) <= 0) {
      return true;
    } else {
      var w = word.toLowerCase();
      for ( var i = 0; i < Downsha.NoteFilter.RESERVED_TOKENS.length; i++) {
        var re = new RegExp("^-?" + Downsha.NoteFilter.RESERVED_TOKENS[i]
            + Downsha.NoteFilter.TOKEN_SEPARATOR);
        if (w.match(re)) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};
Downsha.NoteFilter.makeWordFuzzy = function(word) {
  if (Downsha.NoteFilter.canWordBeFuzzy(word))
    word += Downsha.NoteFilter.FUZZY_SUFFIX;
  return word;
};
Downsha.NoteFilter.formatWord = function(str) {
  if (str.indexOf(Downsha.NoteFilter.WORD_SEPARATOR) > 0) {
    return Downsha.NoteFilter.QUOTE + str + Downsha.NoteFilter.QUOTE;
  } else {
    return str;
  }
};
Downsha.NoteFilter.isWordQuoted = function(word) {
  return (typeof word == 'string' && word.length > 2
      && word.indexOf(Downsha.NoteFilter.QUOTE) == 0 && word.indexOf(
      Downsha.NoteFilter.QUOTE, 1) == (word.length - 1));
};
Downsha.NoteFilter.unquoteWord = function(word) {
  if (Downsha.NoteFilter.isWordQuoted(word)) {
    return word.substring(1, (word.length - 1));
  } else {
    return word;
  }
};
Downsha.NoteFilter.extractTokenValue = function(token, word) {
  if (typeof word == 'string' && typeof token == 'string') {
    var x = word.indexOf(token + Downsha.NoteFilter.TOKEN_SEPARATOR);
    if (x >= 0 && x <= 1) {
      return Downsha.NoteFilter.unquoteWord(word.substring(x + token.length
          + Downsha.NoteFilter.TOKEN_SEPARATOR.length));
    }
  }
  return null;
};

Downsha.NoteFilter.prototype.getStorableProps = function() {
  return [ "order", "ascending", "words", "notebookGuid", "tagGuids",
      "timeZone", "inactive" ];
};


/*
 * Downsha.NoteList
 * Downsha
 *
 * Created by Pavel Skaldin on 3/29/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.NoteList = function NoteList(obj) {
  this.__defineGetter__("notes", this.getNotes);
  this.__defineSetter__("notes", this.setNotes);
  this.__defineGetter__("searchedWords", this.getSearchedWords);
  this.__defineSetter__("searchedWords", this.setSearchedWords);
  this.__defineGetter__("stoppedWords", this.getStoppedWords);
  this.__defineSetter__("stoppedWords", this.setStoppedWords);
  this.__defineGetter__("startIndex", this.getStartIndex);
  this.__defineSetter__("startIndex", this.setStartIndex);
  this.__defineGetter__("endIndex", this.getEndIndex);
  this.__defineGetter__("nextIndex", this.getNextIndex);
  this.__defineGetter__("remainingCount", this.getRemainingCount);
  this.__defineGetter__("totalNotes", this.getTotalNotes);
  this.__defineSetter__("totalNotes", this.setTotalNotes);
  this.initialize(obj);
};

Downsha.NoteList.javaClass = "com.downsha.edam.notestore.NoteList";
Downsha.inherit(Downsha.NoteList, Downsha.AppModel);

Downsha.NoteList.prototype._notes = null;
Downsha.NoteList.prototype._searchedWords = null;
Downsha.NoteList.prototype._stoppedWords = null;
Downsha.NoteList.prototype._startIndex = 0;
Downsha.NoteList.prototype._totalNotes = 0;

Downsha.NoteList.prototype.initialize = function(obj) {
  Downsha.NoteList.parent.initialize.apply(this, [ obj ]);
  this.initializeNotes();
  this.initializeSearchedWords();
  this.initializeStoppedWords();
}
Downsha.NoteList.prototype.initializeNotes = function() {
  this._notes = new Array();
};

Downsha.NoteList.prototype.initializeSearchedWords = function() {
  this._searchedWords = new Array();
};
Downsha.NoteList.prototype.initializeStoppedWords = function() {
  this._stoppedWords = new Array();
};

Downsha.NoteList.prototype.setNotes = function(notes) {
  if (notes instanceof Array) {
    this._notes = notes;
  } else if (notes instanceof Downsha.BasicNote) {
    this._notes = new Array(notes);
  } else if (notes == null) {
    this._notes = new Array();
  }
};
Downsha.NoteList.prototype.getNotes = function() {
  return this._notes;
};
Downsha.NoteList.prototype.setSearchedWords = function(words) {
  if (words instanceof Array) {
    this._searchedWords = words;
  } else if (words != null) {
    this._searchedWords = new Array(words + "");
  } else if (words == null) {
    this._searchedWords = new Array();
  }
};
Downsha.NoteList.prototype.getSearchedWords = function() {
  return this._searchedWords;
};
Downsha.NoteList.prototype.setStoppedWords = function(words) {
  if (words instanceof Array) {
    this._stoppedWords = words;
  } else if (words != null) {
    this._stoppedWords = new Array(words + "");
  } else if (words == null) {
    this._stoppedWords = new Array();
  }
};
Downsha.NoteList.prototype.getStoppedWords = function() {
  return this._stoppedWords;
};
Downsha.NoteList.prototype.setStartIndex = function(index) {
  this._startIndex = parseInt(index);
};
Downsha.NoteList.prototype.getStartIndex = function() {
  return this._startIndex;
};
Downsha.NoteList.prototype.getEndIndex = function() {
  return this.startIndex + this.notes.length - 1;
};
Downsha.NoteList.prototype.getNextIndex = function() {
  if (this.isAtEnd())
    return null;
  return this.startIndex + this.notes.length;
};
Downsha.NoteList.prototype.getRemainingCount = function() {
  return this.totalNotes - this.nextIndex;
};
Downsha.NoteList.prototype.setTotalNotes = function(count) {
  this._totalNotes = parseInt(count);
};
Downsha.NoteList.prototype.getTotalNotes = function() {
  return this._totalNotes;
};
Downsha.NoteList.prototype.isAtEnd = function() {
  return (this.totalNotes <= this.startIndex + this.notes.length);
};
Downsha.NoteList.prototype.isAtStart = function() {
  return (this.startIndex == 0);
};
Downsha.NoteList.prototype.getStorableProps = function() {
  return [ "notes", "searchedWords", "stoppedWords", "startIndex", "totalNotes" ];
};

Downsha.NotesMetadataList = function NotesMetadataList(obj) {
  this.initialize(obj);
};
Downsha.NotesMetadataList.javaClass = "com.downsha.edam.notestore.NotesMetadataList";
Downsha.inherit(Downsha.NotesMetadataList, Downsha.NoteList);

Downsha.NotesMetadataResultSpec = function NotesMetadataResultSpec(obj) {
  this.__defineGetter__("includeTitle", this.isIncludeTitle);
  this.__defineSetter__("includeTitle", this.setIncludeTitle);
  this.__defineGetter__("includeContentLength", this.isIncludeContentLength);
  this.__defineSetter__("includeContentLength", this.setIncludeContentLength);
  this.__defineGetter__("includeCreated", this.isIncludeCreated);
  this.__defineSetter__("includeCreated", this.setIncludeCreated);
  this.__defineGetter__("includeUpdated", this.isIncludeUpdated);
  this.__defineSetter__("includeUpdated", this.setIncludeUpdated);
  this.__defineGetter__("includeUpdateSequenceNum",
      this.isIncludeUpdateSequenceNum);
  this.__defineSetter__("includeUpdateSequenceNum",
      this.setIncludeUpdateSequenceNum);
  this.__defineGetter__("includeNotebookGuid", this.isIncludeNotebookGuid);
  this.__defineSetter__("includeNotebookGuid", this.setIncludeNotebookGuid);
  this.__defineGetter__("includeTagGuids", this.isIncludeTagGuids);
  this.__defineSetter__("includeTagGuids", this.setIncludeTagGuids);
  this.__defineGetter__("includeAttributes", this.isIncludeAttributes);
  this.__defineSetter__("includeAttributes", this.setIncludeAttributes);
  this.__defineGetter__("includeLargestResourceMime",
      this.isIncludeLargestResourceMime);
  this.__defineSetter__("includeLargestResourceMime",
      this.setIncludeLargestResourceMime);
  this.__defineGetter__("includeLargestResourceSize",
      this.isIncludeLargestResourceSize);
  this.__defineSetter__("includeLargestResourceSize",
      this.setIncludeLargestResourceSize);
  this.initialize(obj);
};
Downsha.NotesMetadataResultSpec.javaClass = "com.downsha.edam.notestore.NotesMetadataResultSpec";
Downsha.inherit(Downsha.NotesMetadataResultSpec, Downsha.AppModel);

Downsha.NotesMetadataResultSpec.prototype._includeTitle = false;
Downsha.NotesMetadataResultSpec.prototype._includeContentLength = false;
Downsha.NotesMetadataResultSpec.prototype._includeCreated = false;
Downsha.NotesMetadataResultSpec.prototype._includeUpdated = false;
Downsha.NotesMetadataResultSpec.prototype._includeUpdateSequenceNum = false;
Downsha.NotesMetadataResultSpec.prototype._includeNotebookGuid = false;
Downsha.NotesMetadataResultSpec.prototype._includeTagGuids = false;
Downsha.NotesMetadataResultSpec.prototype._includeAttributes = false;
Downsha.NotesMetadataResultSpec.prototype._includeLargestResourceMime = false;
Downsha.NotesMetadataResultSpec.prototype._includeLargestResourceSize = false;

Downsha.NotesMetadataResultSpec.prototype.isIncludeTitle = function() {
  return this._includeTitle;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeTitle = function(bool) {
  this._includeTitle = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeContentLength = function() {
  return this._includeContentLength;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeContentLength = function(
    bool) {
  this._includeContentLength = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeCreated = function() {
  return this._includeCreated;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeCreated = function(bool) {
  this._includeCreated = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeUpdated = function() {
  return this._includeUpdated;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeUpdated = function(bool) {
  this._includeUpdated = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeUpdateSequenceNum = function() {
  return this._includeUpdateSequenceNum;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeUpdateSequenceNum = function(
    bool) {
  this._includeUpdateSequenceNum = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeNotebookGuid = function() {
  return this._includeNotebookGuid;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeNotebookGuid = function(
    bool) {
  this._includeNotebookGuid = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeTagGuids = function() {
  return this._includeTagGuids;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeTagGuids = function(bool) {
  this._includeTagGuids = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeAttributes = function() {
  return this._includeAttributes;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeAttributes = function(bool) {
  this._includeAttributes = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeLargestResourceMime = function() {
  return this._includeLargestResourceMime;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeLargestResourceMime = function(
    bool) {
  this._includeLargestResourceMime = (bool) ? true : false;
};
Downsha.NotesMetadataResultSpec.prototype.isIncludeLargestResourceSize = function() {
  return this._includeLargestResourceSize;
};
Downsha.NotesMetadataResultSpec.prototype.setIncludeLargestResourceSize = function(
    bool) {
  this._includeLargestResourceSize = (bool) ? true : false;
};

Downsha.Snippet = function Snippet(obj) {
  this.initialize(obj);
};
Downsha.Snippet.javaClass = "com.downsha.web.Snippet";
Downsha.inherit(Downsha.Snippet, Downsha.AppDataModel);
Downsha.Snippet.prototype.snippet = null;

/*
 * Downsha.SavedSearch
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.SavedSearch = function SavedSearch(obj) {
  this.__defineGetter__("query", this.getQuery);
  this.__defineSetter__("query", this.setQuery);
  this.__defineGetter__("format", this.getFormat);
  this.__defineSetter__("format", this.setFormat);
  this.__defineGetter__("name", this.getName);
  this.__defineSetter__("name", this.setName);
  this.initialize(obj);
};
Downsha.SavedSearch.javaClass = "com.downsha.edam.type.SavedSearch";
Downsha.inherit(Downsha.SavedSearch, Downsha.AppDataModel);
Downsha.SavedSearch.prototype._query = null;
Downsha.SavedSearch.prototype._format = 1;
Downsha.SavedSearch.prototype._name = null;

Downsha.SavedSearch.prototype.getQuery = function() {
  return this._query;
};
Downsha.SavedSearch.prototype.setQuery = function(q) {
  if (q == null)
    this._query = null;
  else
    this._query = q + "";
};
Downsha.SavedSearch.prototype.getFormat = function() {
  return this._format;
};
Downsha.SavedSearch.prototype.setFormat = function(f) {
  this._format = Math.max(parseInt(f), 1);
};
Downsha.SavedSearch.prototype.setName = function(name) {
  if (name == null) {
    this._name = null;
  } else {
    this._name = name + "";
  }
};
Downsha.SavedSearch.prototype.getName = function() {
  return this._name;
};

QueryFormat = {
  USER : 1,
  SEXP : 2
};

/*
 * Downsha.SyncChunk
 * Downsha
 *
 * Created by Pavel Skaldin on 3/10/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * My instances represent Downsha.SyncChunk
 * 
 * @param obj
 * @return
 */
Downsha.SyncChunk = function SyncChunk(obj) {
  this.__defineGetter__("chunkHighUSN", this.getChunkHighUSN);
  this.__defineSetter__("chunkHighUSN", this.setChunkHighUSN);
  this.__defineGetter__("currentTime", this.getCurrentTime);
  this.__defineSetter__("currentTime", this.setCurrentTime);
  this.__defineGetter__("expungedNotebooks", this.getExpungedNotebooks);
  this.__defineSetter__("expungedNotebooks", this.setExpungedNotebooks);
  this.__defineGetter__("expungedNotes", this.getExpungedNotes);
  this.__defineSetter__("expungedNotes", this.setExpungedNotes);
  this.__defineGetter__("expungedSearches", this.getExpungedSearches);
  this.__defineSetter__("expungedSearches", this.setExpungedSearches);
  this.__defineGetter__("expungedTags", this.getExpungedTags);
  this.__defineSetter__("expungedTags", this.setExpungedTags);
  this.__defineGetter__("notebooks", this.getNotebooks);
  this.__defineSetter__("notebooks", this.setNotebooks);
  this.__defineGetter__("notes", this.getNotes);
  this.__defineSetter__("notes", this.setNotes);
  this.__defineGetter__("searches", this.getSearches);
  this.__defineSetter__("searches", this.setSearches);
  this.__defineGetter__("tags", this.getTags);
  this.__defineSetter__("tags", this.setTags);
  this.__defineGetter__("updateCount", this.getUpdateCount);
  this.__defineSetter__("updateCount", this.setUpdateCount);
  this.initialize(obj);
};
Downsha.SyncChunk.javaClass = "com.downsha.edam.notestore.SyncChunk";
Downsha.inherit(Downsha.SyncChunk, Downsha.AppModel);
Downsha.SyncChunk.prototype._chunkHighUSN = null;
Downsha.SyncChunk.prototype._currentTime = null;
Downsha.SyncChunk.prototype._expungedNotebooks = new Array();
Downsha.SyncChunk.prototype._expungedNotes = new Array();
Downsha.SyncChunk.prototype._expungedSearches = new Array();
Downsha.SyncChunk.prototype._expungedTags = new Array();
Downsha.SyncChunk.prototype._notebooks = new Array();
Downsha.SyncChunk.prototype._notes = new Array();
Downsha.SyncChunk.prototype._searches = new Array();
Downsha.SyncChunk.prototype._tags = new Array();
Downsha.SyncChunk.prototype._updateCount = null;

Downsha.SyncChunk.prototype.getChunkHighUSN = function() {
  return this._chunkHighUSN;
};
Downsha.SyncChunk.prototype.setChunkHighUSN = function(num) {
  this._chunkHighUSN = parseInt(num);
};
Downsha.SyncChunk.prototype.getCurrentTime = function() {
  return this._currentTime;
};
Downsha.SyncChunk.prototype.setCurrentTime = function(millis) {
  this._currentTime = parseInt(millis);
};
Downsha.SyncChunk.prototype.getExpungedNotebooks = function() {
  return this._expungedNotebooks;
};
Downsha.SyncChunk.prototype.setExpungedNotebooks = function(notebooks) {
  if (notebooks == null)
    this._expungedNotebooks = new Array();
  else
    this._expungedNotebooks = (notebooks instanceof Array) ? notebooks
        : [ notebooks ];
};
Downsha.SyncChunk.prototype.getExpungedNotes = function() {
  return this._expungedNotes;
};
Downsha.SyncChunk.prototype.setExpungedNotes = function(notes) {
  if (notes == null)
    this._expungedNotes = new Array();
  else
    this._expungedNotes = (notes instanceof Array) ? notes : [ notes ];
};
Downsha.SyncChunk.prototype.getExpungedSearches = function() {
  return this._expungedSearches;
};
Downsha.SyncChunk.prototype.setExpungedSearches = function(searches) {
  if (searches == null)
    this._expungedSearches = new Array();
  else
    this._expungedSearches = (searches instanceof Array) ? searches
        : [ searches ];
};
Downsha.SyncChunk.prototype.getExpungedTags = function() {
  return this._expungedTags;
};
Downsha.SyncChunk.prototype.setExpungedTags = function(tags) {
  if (tags == null)
    this._expungedTags = new Array();
  else
    this._expungedTags = (tags instanceof Array) ? tags : [ tags ];
};
Downsha.SyncChunk.prototype.getNotebooks = function() {
  return this._notebooks;
};
Downsha.SyncChunk.prototype.setNotebooks = function(notebooks) {
  if (notebooks == null)
    this._notebooks = new Array();
  else
    this._notebooks = (notebooks instanceof Array) ? notebooks : [ notebooks ];
};
Downsha.SyncChunk.prototype.getNotes = function() {
  return this._notes;
};
Downsha.SyncChunk.prototype.setNotes = function(notes) {
  if (notes == null)
    this._notes = new Array();
  else
    this._notes = (notes instanceof Array) ? notes : [ notes ];
};
Downsha.SyncChunk.prototype.getSearches = function() {
  return this._searches;
};
Downsha.SyncChunk.prototype.setSearches = function(searches) {
  if (searches == null)
    this._searches = new Array();
  else
    this._searches = (searches instanceof Array) ? searches : new Array();
};
Downsha.SyncChunk.prototype.getTags = function() {
  return this._tags;
};
Downsha.SyncChunk.prototype.setTags = function(tags) {
  if (tags == null)
    this._tags = new Array();
  else
    this._tags = (tags instanceof Array) ? tags : [ tags ];
};
Downsha.SyncChunk.prototype.getUpdateCount = function() {
  return this._updateCount;
};
Downsha.SyncChunk.prototype.setUpdateCount = function(num) {
  this._updateCount = parseInt(num);
};

Downsha.SyncChunk.prototype.setResources = function(resources) {
  // do nothing yet
};

Downsha.SyncChunk.prototype.toString = function() {
  return "Downsha.SyncChunk " + this.updateCount;
};

/*
 * Downsha.SyncState
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * My instances represent Downsha.SyncState
 * 
 * @param obj
 * @return
 */
Downsha.SyncState = function SyncState(obj) {
  this.__defineGetter__("currentTime", this.getCurrentTime);
  this.__defineSetter__("currentTime", this.setCurrentTime);
  this.__defineGetter__("fullSyncBefore", this.getFullSyncBefore);
  this.__defineSetter__("fullSyncBefore", this.setFullSyncBefore);
  this.__defineGetter__("updateCount", this.getUpdateCount);
  this.__defineSetter__("updateCount", this.setUpdateCount);
  this.__defineGetter__("uploaded", this.getUploaded);
  this.__defineSetter__("uploaded", this.setUploaded);
  this.__defineGetter__("clientCurrentTime", this.getClientCurrentTime);
  this.initialize(obj);
};
Downsha.SyncState.javaClass = "com.downsha.edam.notestore.SyncState";
Downsha.inherit(Downsha.SyncState, Downsha.AppModel);
Downsha.SyncState.prototype._currentTime = null;
Downsha.SyncState.prototype._fullSyncBefore = null;
Downsha.SyncState.prototype._updateCount = null;
Downsha.SyncState.prototype._uploaded = null;
Downsha.SyncState.prototype._clientCurrentTime = null;
Downsha.SyncState.prototype.initialize = function(obj) {
  Downsha.SyncState.parent.initialize.apply(this, [ obj ]);
  if (!this._clientCurrentTime) {
    this._clientCurrentTime = Date.now();
  }
};
Downsha.SyncState.prototype.getUpdateCount = function() {
  return this._updateCount;
};
Downsha.SyncState.prototype.setUpdateCount = function(num) {
  if (num == null)
    this._updateCount = null;
  else
    this._updateCount = parseInt(num);
};
Downsha.SyncState.prototype.getFullSyncBefore = function() {
  return this._fullSyncBefore;
};
Downsha.SyncState.prototype.setFullSyncBefore = function(num) {
  if (num == null)
    this._fullSyncBefore = null;
  else
    this._fullSyncBefore = parseInt(num);
};
Downsha.SyncState.prototype.getCurrentTime = function() {
  return this._currentTime;
};
Downsha.SyncState.prototype.setCurrentTime = function(num) {
  if (num == null)
    this._currentTime = null;
  else
    this._currentTime = parseInt(num);
};
Downsha.SyncState.prototype.getUploaded = function() {
  return this._uploaded;
};
Downsha.SyncState.prototype.setUploaded = function(num) {
  if (num == null)
    this._uploaded = null;
  else
    this._uploaded = parseInt(num);
};
Downsha.SyncState.prototype.isFullSyncRequired = function() {
  return (this.currentTime != null && this.fullSyncBefore != null && this.currentTime < this.fullSyncBefore);
};
Downsha.SyncState.prototype.getClientCurrentTime = function() {
  return this._clientCurrentTime;
};
Downsha.SyncState.prototype.toString = function() {
  return "Downsha.SyncState " + this.updateCount;
};


/*
 * Downsha.Tag
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.Tag = function Tag(obj) {
  this.__defineGetter__("name", this.getName);
  this.__defineSetter__("name", this.setName);
  this.initialize(obj);
};

Downsha.Tag.javaClass = "com.downsha.edam.type.Tag";
Downsha.inherit(Downsha.Tag, Downsha.AppDataModel);
Downsha.Tag.prototype._name = null;
Downsha.Tag.prototype.setName = function(tagName) {
  if (typeof tagName == 'undefined' || tagName == null) {
    this._name = null;
  } else {
    this._name = "" + tagName;
  }
};
Downsha.Tag.prototype.getName = function() {
  return this._name;
};
Downsha.Tag.prototype.toString = function() {
  return '[' + this.modelName + ':' + this.guid + ':' + this.name + ']';
};

/*
 * Downsha.User
 * Downsha
 *
 * Created by Pavel Skaldin on 2/25/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.User = function User(obj) {
  this.__defineGetter__("id", this.getId);
  this.__defineSetter__("id", this.setId);

  this.__defineGetter__("created", this.getCreated);
  this.__defineSetter__("created", this.setCreated);

  this.__defineGetter__("updated", this.getUpdated);
  this.__defineSetter__("updated", this.setUpdated);

  this.__defineGetter__("deleted", this.getDeleted);
  this.__defineSetter__("deleted", this.setDeleted);

  this.__defineGetter__("active", this.isActive);
  this.__defineSetter__("active", this.setActive);

  this.__defineGetter__("attributes", this.getAttributes);
  this.__defineSetter__("attributes", this.setAttributes);

  this.__defineGetter__("accounting", this.getAccounting);
  this.__defineSetter__("accounting", this.setAccounting);

  this.initialize(obj);
};
Downsha.User.javaClass = "com.downsha.edam.type.User";
Downsha.inherit(Downsha.User, Downsha.AppModel);
Downsha.User.prototype._id = null;
Downsha.User.prototype.username = null;
Downsha.User.prototype.email = null;
Downsha.User.prototype.name = null;
Downsha.User.prototype.timezone = null;
Downsha.User.prototype.privilege = null;
Downsha.User.prototype._created = null;
Downsha.User.prototype._updated = null;
Downsha.User.prototype._deleted = null;
Downsha.User.prototype._active = false;
Downsha.User.prototype.shardId = null;
Downsha.User.prototype._attributes = null;
Downsha.User.prototype._accounting = null;

Downsha.User.prototype.setId = function(id) {
  if (id == null) {
    this._id == null;
  } else if (typeof id == 'number') {
    this._id = parseInt(id);
  }
};
Downsha.User.prototype.getId = function() {
  return this._id;
};
Downsha.User.prototype.setActive = function(bool) {
  this._active = (bool) ? true : false;
};
Downsha.User.prototype.isActive = function() {
  return this._active;
};
Downsha.User.prototype.setCreated = function(num) {
  if (num == null) {
    this._created = null;
  } else if (typeof num == 'number') {
    this._created = parseInt(num);
  }
};
Downsha.User.prototype.getCreated = function() {
  return this._created;
};
Downsha.User.prototype.setUpdated = function(num) {
  if (num == null) {
    this._updated = null;
  } else if (typeof num == 'number') {
    this._updated = parseInt(num);
  }
};
Downsha.User.prototype.getUpdated = function() {
  return this._updated;
};
Downsha.User.prototype.setDeleted = function(num) {
  if (num == null) {
    this._deleted = null;
  } else if (typeof num == 'number') {
    this._deleted = parseInt(num);
  }
};
Downsha.User.prototype.getDeleted = function() {
  return this._deleted;
};
Downsha.User.prototype.setAccounting = function(accounting) {
  // do nothing for now
};
Downsha.User.prototype.getAccounting = function() {
  return this._accounting;
};
Downsha.User.prototype.setAttributes = function(attrs) {
  // do nothing for now
};
Downsha.User.prototype.getAttributes = function() {
  return this._attributes;
};

Downsha.Data = function Data(obj) {
  this.__definePositiveInteger__("size", 0);
  this.initialize(obj);
};
Downsha.Data.javaClass = "com.downsha.edam.type.Data";
Downsha.inherit(Downsha.Data, Downsha.AppDataModel);

Downsha.ResourceAttributes = function ResourceAttributes(obj) {
  this.__defineFloat__("altitude");
  this.__defineBoolean__("attachment", false);
  this.__defineString__("cameraMake");
  this.__defineString__("cameraModel");
  this.__defineBoolean__("clientWillIndex");
  this.__defineString__("fieldName");
  this.__defineFloat__("latitude");
  this.__defineFloat__("longitude");
  this.__defineString__("recoType");
  this.__defineString__("sourceUrl");
  this.__definePositiveInteger__("timestamp");
  this.initialize(obj);
};
Downsha.ResourceAttributes.javaClass = "com.downsha.edam.type.ResourceAttributes";
Downsha.inherit(Downsha.ResourceAttributes, Downsha.AppDataModel);

Downsha.Resource = function Resource(obj) {
  this.__defineBoolean__("active", false);
  this.__defineType__("attributes", Downsha.ResourceAttributes);
  this.__defineType__("data", "Data");
  this.__definePositiveInteger__("duration", 0);
  this.__definePositiveInteger__("height", 0);
  this.__definePositiveInteger__("width", 0);
  this.__defineString__("mime");
  this.__defineString__("noteGuid");
  this.initialize(obj);
};
Downsha.Resource.javaClass = "com.downsha.edam.type.Resource";
Downsha.inherit(Downsha.Resource, Downsha.AppDataModel);

Downsha.Resource.prototype.getThumbnailUrl = function(shardUrl, size) {
  shardUrl = shardUrl || "";
  var url = shardUrl + "/thm/res/" + this.guid;
  if (typeof size == 'number' && size > 0) {
    url += "?size=" + size;
  }
  return url;
};

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

  Downsha.ProcessLog = function ProcessLog() {
    LOG = Downsha.chromeExtension.logger;
    this.__defineGetter__("transcript", this.getTranscript);
    this.__defineSetter__("transcript", this.setTranscript);
    this.__defineGetter__("length", this.getLength);
    this.initialize();
  };
  Downsha.ProcessLog.fromObject = function(obj) {
    if (obj instanceof Downsha.ProcessLog) {
      return obj;
    } else {
      var log = new Downsha.ProcessLog();
      if (typeof obj == 'object' && obj) {
        log.transcript = obj;
      }
      return log;
    }
  };
  Downsha.ProcessLog.prototype._transcript = null;
  Downsha.ProcessLog.prototype._length = 0;
  Downsha.ProcessLog.prototype.initialize = function() {
    this._transcript = {};
  };
  Downsha.ProcessLog.prototype.getTranscript = function() {
    return this._transcript;
  };
  Downsha.ProcessLog.prototype.setTranscript = function(transcript) {
    this.removeAll();
    if (typeof transcript == 'object' && transcript) {
      for ( var i in transcript) {
        var t = parseInt(i);
        if (!isNaN(t) && t > 0) {
          var vals = [].concat(transcript[i]);
          this._length += vals.length;
          if (typeof this._transcript[i] == 'undefined') {
            this._transcript[i] = vals;
          } else {
            this._transcript[i] = this._transcript[i].concat(vals);
          }
        }
      }
    }
  };
  Downsha.ProcessLog.prototype._milsFromObject = function(milsOrDate) {
    var t = 0;
    if (milsOrDate instanceof Date) {
      t = milsOrDate.getTime();
    } else if (typeof milsOrDate == 'number' && !isNaN(milsOrDate)) {
      t = milsOrDate;
    } else if (typeof milsOrDate == 'string') {
      t = parseInt(milsOrDate);
      if (isNaN(t) || t < 0) {
        t = 0;
      }
    }
    return t;
  };
  Downsha.ProcessLog.prototype.add = function(entry) {
    var d = new Date().getTime();
    if (typeof this.transcript[d] == 'undefined') {
      this.transcript[d] = [ entry ];
      this._length++;
    } else {
      this.transcript[d] = this.transcript[d].concat(entry);
      this._length++;
    }
  };
  Downsha.ProcessLog.prototype.remove = function(entry) {
    var indexes = [];
    var x = -1;
    for ( var i in this.transcript) {
      if ((x = this._transcript[i].indexOf(entry)) >= 0) {
        indexes.push( [ i, x ]);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      var ix = indexes[i];
      delete this._transcript[ix[0]][ix[1]];
      if (this._transcript[ix[0]].length == 0) {
        delete this._transcript[ix[0]];
      }
      this._length--;
    }
  };
  Downsha.ProcessLog.prototype.removeAll = function() {
    this._transcript = {};
    this._length = 0;
  };
  Downsha.ProcessLog.prototype.get = function(entry) {
    var entries = [];
    var x = -1;
    for ( var i in this.transcript) {
      if ((x = this.transcript[i].indexOf(entry)) >= 0) {
        entries.push(this.transcript[i][x]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getAll = function() {
    var entries = [];
    for ( var i in this.transcript) {
      entries = entries.concat(this._transcript[i]);
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getBefore = function(milsOrDate) {
    var t = this._milsFromObject(milsOrDate);
    var entries = [];
    for ( var i in this.transcript) {
      if (t > parseInt(i)) {
        entries = entries.concat(this.transcript[i]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getAfter = function(milsOrDate) {
    var t = this._milsFromObject(milsOrDate);
    var entries = [];
    for ( var i in this.transcript) {
      if (t < parseInt(i)) {
        entries = entries.concat(this.transcript[i]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.removeBefore = function(milsOrDate) {
    var t = this._milsFromObject(milsOrDate);
    var indexes = [];
    for ( var i in this.transcript) {
      if (t > parseInt(i)) {
        indexes = indexes.concat(this.transcript[i]);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      this._length -= this._transcript[indexes[i]].length;
      delete this._transcript[indexes[i]];
    }
  };
  Downsha.ProcessLog.prototype.removeAfter = function(milsOrDate) {
    var t = this._milsFromObject(milsOrDate);
    var indexes = [];
    for ( var i in this.transcript) {
      if (t < parseInt(i)) {
        indexes = indexes.concat(this.transcript[i]);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      this._length -= this._transcript[indexes[i]].length;
      delete this._transcript[indexes[i]];
    }
  };
  Downsha.ProcessLog.prototype.getBetween = function(fromDate, toDate) {
    var from = this._milsFromObject(fromDate);
    var to = this._milsFromObject(toDate);
    var entries = [];
    for ( var i in this.transcript) {
      var ii = parseInt(i);
      if (from <= ii && ii <= to) {
        entries = entries.concat(this.transcript[i]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.removeBetween = function(fromDate, toDate) {
    var from = this._milsFromObject(fromDate);
    var to = this._milsFromObject(toDate);
    var indexes = [];
    for ( var i in this.transcript) {
      var ii = parseInt(i);
      if (from <= ii && ii <= to) {
        indexes = indexes.concat(i);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      this._length -= this._transcript[indexes[i]].length;
      delete this._transcript[indexes[i]];
    }
  };
  Downsha.ProcessLog.prototype.filter = function(fn) {
    var entries = [];
    for ( var i in this.transcript) {
      var ii = parseInt(i);
      for ( var x = 0; x < this._transcript[i].length; x++) {
        if (fn(ii, this._transcript[i][x])) {
          entries = entries.concat(this._transcript[i][x]);
        }
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getLength = function() {
    return this._length;
  };
  Downsha.ProcessLog.prototype.toJSON = function() {
    return this.transcript;
  };
})();

(function() {
  var LOG = null;
  Downsha.PayloadManager = function PayloadManager() {
    LOG = Downsha.chromeExtension.logger;
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
      var guid = Downsha.UUID.generateGuid();
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

Downsha.DesktopNotifier = function(url, delay, timeout, options) {
  var self = this;
  this.__defineSetter__("url", this.setUrl);
  this.__defineGetter__("url", function() {
    return self.getUrl();
  });
  this.__definePositiveInteger__("delay", null);
  this.__definePositiveInteger__("timeout", null);
  this.__defineType__("options", Object, null);
  this.initialize(url, delay, timeout, options);
};

Downsha.mixin(Downsha.DesktopNotifier, Downsha.DefiningMixin);

Downsha.DesktopNotifier.prototype._url = null;
Downsha.DesktopNotifier.prototype.count = null;
Downsha.DesktopNotifier.prototype.timer = null;

Downsha.DesktopNotifier.prototype.initialize = function(url, delay, timeout,
    options) {
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
  if (typeof this.delay == 'number' && !immediately) {
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


(function() {
    var LOG = null;
    Downsha.BasicClipProcessor = function BasicClipProcessor(path, size, interval, gracePeriod, success, error) {
        LOG = Downsha.Logger.getInstance();
        this.initialize(path, size, interval, gracePeriod, success, error);
    };
    
    Downsha.inherit(Downsha.BasicClipProcessor, Downsha.PersistentQueueProcessor);

    Downsha.BasicClipProcessorProto = {
        initialize: function(path, size, interval, gracePeriod, success, error) {
            LOG.debug("BasicClipProcessor.initialize");
            var self = this;
            var successCallback = function() {
                LOG.debug("BasicClipProcessor successfully initialized");
                if (typeof success == 'function') {
                    LOG.debug("Applying custom success handler");
                    success.apply(this, arguments);
                }
                self._updateBadge();
            };
            var errorCallback = function(err) {
                var msg = null;
                try {
                    msg = Downsha.Utils.errorDescription(err);
                } catch(e) {
                    msg = err;
                }
                LOG.error("Error initializing BasicClipProcessor: " + msg);
                if (err instanceof FileError) {
                    LOG.warn("Utilizing non-persistent queue processor due to FileError during initialization with persistent queue processor");
                    self._becomeNonPersistent();
                    var ctx = Downsha.getContext(true);
                    if (!ctx.persistenceWarningShown) {
                        if (confirm(chrome.i18n.getMessage("browserPersistenceError", msg))) {
                            ctx.persistenceWarningShown = true;
                        } else {
                            ctx.persistenceWarningShown = false;
                        }
                    }
                }
                if (typeof error == 'function') {
                    error.apply(this, arguments);
                }
            };
            Downsha.BasicClipProcessor.parent.initialize.apply(this, [path, size,
            interval, gracePeriod, successCallback, errorCallback]);
        },
        _becomeNonPersistent: function() {
            this._adoptNonPersistentProto();
            this._reinitProto();
        },
        _adoptNonPersistentProto: function() {
            Downsha.inherit(Downsha.BasicClipProcessor, Downsha.QueueProcessor);
            Downsha.extendObject(Downsha.BasicClipProcessor.prototype, Downsha.BasicClipProcessorProto);
        },
        _reinitProto: function() {
            this.__proto__ = new this.constructor;
        },
        add: function(item) {
            LOG.debug("BasicClipProcessor.add");
            if (item && item.constructor.name != 'FileEntry'
            && !(item instanceof Downsha.ClipNote)) {
                item = new Downsha.ClipNote(item);
            }
            Downsha.BasicClipProcessor.parent.add.apply(this, [item]);
            this._updateBadge();
        },
        _onprocess: function(item, processor, data) {
            LOG.debug("BasicClipProcessor._onprocess");
            item.processResponse = data;
            Downsha.BasicClipProcessor.parent._onprocess.apply(this, arguments);
            this._updateBadge();
        },
        _onprocesserror: function(item, processor, data) {
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
        _updateBadge: function() {
            LOG.debug("BasicClipProcessor._updateBadge");
            LOG.debug("Updating badge as a result of intializing BasicClipProcessor ("
            + this.queue.length + " restored clips)");
            Downsha.Utils.updateBadge(Downsha.context);
        }
    };
    
    Downsha.extendObject(Downsha.BasicClipProcessor.prototype, Downsha.BasicClipProcessorProto);
})();

(function() {
    var LOG = null;
    Downsha.ClipProcessor = function ClipProcessor(path, size, interval, gracePeriod, success, error) {
        LOG = Downsha.chromeExtension.logger;
        this.__defineType__("clipProc", XMLHttpRequest);
        this.__definePositiveInteger__("syncGracePeriod", this.constructor.DEFAULT_SYNC_GRACE_PERIOD);
        this.initialize(path, size, interval, gracePeriod, success, error);
    };

    Downsha.inherit(Downsha.ClipProcessor, Downsha.BasicClipProcessor);

    Downsha.ClipProcessor.DEFAULT_SYNC_GRACE_PERIOD = 5 * 60 * 1000;

    Downsha.ClipProcessorProto = {
        initialize: function(path, size, interval, gracePeriod, success, error) {
            Downsha.ClipProcessor.parent.initialize.apply(this, arguments);
            if (typeof gracePeriod == 'number') {
                this.HTTP_GRACE_PERIOD = gracePeriod;
                this.processTimeout = gracePeriod;
            }
        },

        stop: function() {
            LOG.debug("ClipProcessor.stop");
            if (this.clipProc && typeof this.clipProc.abort == 'function') {
                LOG.debug("Aborting clipProc...");
                this.clipProc.abort();
            }
            Downsha.ClipProcessor.parent.stop.apply(this, []);
        },

        isInitializableFileEntry: function(fileEntry) {
            LOG.debug("ClipProcessor.isInitializableFileEntry");
            if (LOG.isDebugEnabled()) {
                LOG.dir(fileEntry);
            }
            var ret = Downsha.ClipProcessor.parent.isInitializableFileEntry.apply(
            this, [fileEntry]);
            var processLog = Downsha.context.processLog;
            LOG.debug("Checking if there's an entry for " + fileEntry.name
            + " in the processLog");
            var processLogEntry = processLog.get(fileEntry.name);
            LOG.debug("ProcessLogEntry: " + processLogEntry);
            if (ret && processLogEntry) {
                LOG
                .info("Ignoring "
                + fileEntry.name
                + " because it was already processed. Let's try to remove it again...");
                fileEntry.remove();
                return false;
            }
            return ret;
        },

        HTTP_GRACE_PERIOD: 60 * 60 * 1000,
        HTTP_MAX_ATTEMPTS: 2,
        MAX_ATTEMPTS: 1,

        _testQueue: function() {
            for (var i = 0; i < this.queue.length; i++) {
                var payload = this.queue[i];
                LOG.debug(">>>> Testing clipProcessor queue: " + i);
                LOG.dir(payload);
                var processed = this.isPayloadProcessed(payload);
                LOG.debug(">>> Processed: " + processed);
                var abortable = this.isPayloadAbortable(payload);
                LOG.debug(">>> Abortable: " + abortable);
                var inGrace = this.isPayloadInGrace(payload);
                LOG.debug(">>> In Grace: " + inGrace);
                var retry = this.isPayloadRetriable(payload);
                LOG.debug(">>> Retriable: " + retry);
                var procable = this.isPayloadProcessable(payload);
                LOG.debug(">>> Proccessable: " + procable);
            }
        },

        isPayloadProcessed: function(payload) {
            LOG.debug("ClipProcessor.isPayloadProcessed");
            var ret = Downsha.ClipProcessor.parent.isPayloadProcessed.apply(this,
            [payload]);
            if (ret
            || (payload && payload.processResponse && this
            ._isResponseSuccess(payload))) {
                LOG.debug("Payload is processed");
                return true;
            } else {
                LOG.debug("Payload is not processed");
                return false;
            }
        },

        isPayloadInGrace: function(payload) {
            LOG.debug("ClipProcessor.isPayloadInGrace");
            if (!payload.processed && payload.lastProcessed > 0) {
                var now = new Date().getTime();
                if ((!payload.processResponse || this
                ._isResponseHTTPRetryError(payload.processResponse))
                && payload.attempts < this.HTTP_MAX_ATTEMPTS
                && (now - payload.lastProcessed) < this.HTTP_GRACE_PERIOD) {
                    LOG.debug("Payload is in grace period");
                    return true;
                } else if (payload.processResponse
                && this._isResponseRetryError(payload.processResponse)
                && payload.attempts < this.MAX_ATTEMPTS
                && (now - payload.lastProcessed) < this.GRACE_PERIOD) {
                    LOG.debug("Payload is in grace period");
                    return true;
                }
            }
            LOG.debug("Payload is not in grace period");
            return false;
        },

        isPayloadAbortable: function(payload) {
            LOG.debug("ClipProcessor.isPayloadAbortable");
            if (payload && payload.processResponse
            && this._isResponseAbortError(payload.processResponse)) {
                LOG
                .debug("Payload is abortable because its response contains abortable error");
                return true;
            } else if (payload && payload.processResponse) {
                if (this._isResponseHTTPRetryError(payload.processResponse)) {
                    if (payload.attempts >= this.HTTP_MAX_ATTEMPTS) {
                        LOG
                        .debug("Payload is abortable because its HTTP response indicates a retriable error, but number of allowed attempts has been exceeded");
                        return true;
                    } else {
                        LOG
                        .debug("Payload is not abortable because its HTTP response indicates a retriable error, but it hasn't exceeded allowed attempts");
                        return false;
                    }
                } else if (this._isResponseRetryError(payload.processResponse)) {
                    if (payload.attempts >= this.MAX_ATTEMPTS) {
                        LOG
                        .debug("Payload is abortable because its response indicates a retriable error, but number of allowed attempts has been exceeded");
                        return true;
                    } else {
                        LOG
                        .debug("Payload is not abortable because its response indicates a retriable error, but it hasn't exceed allowed attempts");
                        return false;
                    }
                }
            } else if (payload && !payload.processResponse
            && payload.attempts >= this.HTTP_MAX_ATTEMPTS) {
                LOG
                .debug("Payload is abortable because it has no response after max number of attempts");
                return true;
            } else {
                LOG
                .debug("Payload is not abortable because it doesn't contains a response indicating an abortable error");
                return false;
            }
        },

        isPayloadRetriable: function(payload) {
            LOG.debug("ClipProcessor.isPayloadRetriable");
            if (payload && payload.processResponse
            && this._isResponseRetryError(payload.processResponse)
            && !this.isPayloadInGrace(payload)) {
                if (this._isResponseHTTPRetryError(payload.processResponse)) {
                    if (payload.attempts >= this.HTTP_MAX_ATTEMPTS) {
                        LOG
                        .debug("Payload is not retriable despite its retriable HTTP response because it exceeded allowed attempts");
                        return false;
                    } else {
                        LOG
                        .debug("Payload is retriable because it indicates retriable HTTP error and hasn't exceeded allowed attempts");
                        return true;
                    }
                } else if (this._isResponseRetryError(payload.processResponse)) {
                    if (payload.attempts >= this.MAX_ATTEMPTS) {
                        LOG
                        .debug("Payload is not retriable despite its retriable response because it exceeded allowed attempts");
                        return false;
                    } else {
                        LOG
                        .debug("Payload is retriable because it contains a response indicating a retriable error and it's no long in grace");
                        return true;
                    }
                }
            } else if (payload && !payload.processed && payload.lastProcessed
            && !payload.processResponse
            && payload.attempts < this.HTTP_MAX_ATTEMPTS
            && !this.isPayloadInGrace(payload)) {
                LOG
                .debug("Payload is retriable because it has no processResponse although attempted before, but doesn't exceed max attempts, and it's no longer in grace");
                return true;
            } else {
                LOG
                .debug("Payload is not retriable because it doesn't contain a response indicating a retriable error or it's still gracing");
                return false;
            }
        },

        isPayloadProcessable: function(payload) {
            LOG.debug("ClipProcessor.isPayloadProcessable");
            if (this.isPayloadProcessed(payload)) {
                LOG
                .debug("Payload is not processable because it was already processed successfully");
                return false;
            } else if (payload.processResponse) {
                if (this.isPayloadAbortable(payload)) {
                    LOG.debug("Payload is not processable and to be aborted");
                    return false;
                } else if (this.isPayloadRetriable(payload)) {
                    LOG.debug("Payload is processable because it needs to be retried");
                    return true;
                }
            }
            var ret = Downsha.ClipProcessor.parent.isPayloadProcessable.apply(this,
            [payload]);
            if (ret) {
                LOG.debug("Payload is processable");
            } else {
                LOG.debug("Payload is not processable");
            }
            return ret;
        },

        _isResponseSuccess: function(response) {
            LOG.debug("ClipProcessor._isResponseSuccess");
            if (typeof response == 'object' && response
            && this._isResponseHTTPSuccess(response)
            && typeof response.response == 'object' && response.response) {
                var edamResponse = Downsha.EDAMResponse.fromObject(response.response);
                if (edamResponse.isResult()) {
                    LOG.debug("Response indicates successful result");
                    return true;
                }
            }
            LOG.debug("Response is not successful");
            return false;
        },

        _isResponseAbortError: function(response) {
            LOG.debug("ClipProcessor._isResponseAbortError");
            if (this._isResponseHTTPAbortError(response)) {
                LOG.debug("Response indicates an abortable error due to HTTP transport");
                return true;
            } else if (this._isResponseSuccess(response)) {
                LOG
                .debug("Response does not indicate abortable error because it's a successful response with a result");
                return false;
            } else if (this._isResponseRetryError(response)) {
                LOG
                .debug("Response does not indicate abortable error because it contains retriable errors");
                return false;
            }
            LOG.debug("Response indicates abortable error");
            return true;
        },

        _isResponseRetryError: function(response) {
            LOG.debug("ClipProcessor._isResponseRetryError");
            if (this._isResponseHTTPRetryError(response)) {
                LOG.debug("Response indicates a retriable error due to HTTP transport");
                return true;
            }
            LOG.debug("Response does not indicate a retriable error");
            return false;
        },

        _isResponseHTTPSuccess: function(response) {
            LOG.debug("ClipProcessor._isResponseHTTPSuccess");
            if (typeof response == 'object' && response && response.xhr
            && response.xhr.readyState == 4 && response.xhr.status != 0
            && response.textStatus == "success") {
                LOG.debug("Response is a successful HTTP response");
                return true;
            }
            LOG.debug("Response is not a successful HTTP response");
            return false;
        },

        _isResponseHTTPAbortError: function(response) {
            LOG.debug("ClipProcessor._isResponseHTTPAbortError");
            if (this._isResponseHTTPSuccess(response)
            || this._isResponseHTTPRetryError(response)) {
                LOG.debug("Response does not indicate an abortable HTTP error");
                return false;
            }
            LOG.debug("Response indicates an abortable HTTP error");
            return true;
        },

        _isResponseHTTPRetryError: function(response) {
            LOG.debug("ClipProcessor._isResponseHTTPRetryError");
            if (typeof response == 'object'
            && response
            && response.xhr
            && (response.xhr.readyState != 4 || (response.xhr.status == 0
            || response.xhr.status == 503 || response.xhr.status == 504))) {
                if (response.xhr.readyState == 4) {
                    LOG.debug("Response indicates a retriable HTTP error: "
                    + response.xhr.status);
                } else {
                    LOG
                    .debug("Response indicates a retriable HTTP error due to readyState: "
                    + response.xhr.readyState);
                }
                return true;
            }
            LOG.debug("Response does not indicate a retriable HTTP error");
            return false;
        },

        _onprocesserror: function(payload, processor, data) {
            LOG.debug("ClipProcessor._onprocesserror");
            Downsha.ClipProcessor.parent._onprocesserror.apply(this, [payload,
            processor, data]);
            if (this.isPayloadProcessable(payload) || this.isPayloadInGrace(payload)) {
                LOG
                .debug("Payload is processable or in grace period, so let's keep it...");
            } else {
                LOG.debug("Payload is not processable, let's get rid of it...");
                if (LOG.isDebugEnabled()) {
                    LOG.dir(payload);
                }
                this.removePayload(payload);
                if (payload.path) {
                    LOG.debug("Logging path of aborted payload: " + payload.path);
                    Downsha.context.processLog.add(payload.path);
                    Downsha.context.updateProcessLog();
                }
            }
            // at this point, we should have the failed payload back in the queue if
            // it's going to be reprocessed, so, if it's not - there's going to be
            // nothing to proceses, might as well stop the damn processing...
            if (this.queue.length == 0) {
                LOG.debug("Stopping ClipProcessor because the queue is empty");
                this.stop();
            }
        },

        _onprocess: function(payload, processor, data) {
            LOG.debug("ClipProcessor._onprocess");
            Downsha.ClipProcessor.parent._onprocess.apply(this, arguments);
            if (payload && payload.path) {
                LOG.debug("Logging path of successful payload: " + payload.path);
                Downsha.context.processLog.add(payload.path);
                Downsha.context.updateProcessLog();
            }
            if (this.isEmpty()) {
                LOG.debug("Stopping ClipProcessor because the queue is empty");
                this.stop();
            }
        },

        _onprocesstimeout: function() {
            LOG.debug("ClipProcessor._onprocesstimeout");
            if (this.clipProc && typeof this.clipProc.abort == 'function') {
                this.clipProc.abort();
            }
            Downsha.ClipProcessor.parent._onprocesstimeout.apply(this, []);
        },

        add: function(item) {
            LOG.debug("ClipProcessor.add");
            Downsha.ClipProcessor.parent.add.apply(this, arguments);
            if (!this.isStarted()) {
                LOG
                .debug("Starting queue processor because it was stopped and we added an item to the queue");
                this.start(true);
            }
        },

        onreadystatechange: function() {
            LOG.debug("ClipProcessor.onreadystatechange");
            if (this.clipProc && this.clipProc.readyState) {
                LOG.debug(">>>> READYSTATE: " + this.clipProc.readyState);
            }
            if (this.clipProc && this.clipProc.readyState == 2) {
                if (this.currentItem) {
                    if (this.currentItem.path) {
                        LOG.debug("Logging path of uploaded (but not processed) payload: "
                        + this.currentItem.path);
                        Downsha.context.processLog.add(this.currentItem.path);
                        Downsha.context.updateProcessLog();
                    } else {
                        LOG
                        .warn("Not recording current payload in processLog because there's no path associated with it");
                    }
                } else {
                    LOG
                    .warn("Cannot find currentItem... not doing anything about readystatechange");
                }
            }
        },

        remove: function(item, dontRemoveFile) {
            LOG.debug("ClipProcessor.remove");
            if (this.currentItem && this.currentItem.data == item) {
                if (this.clipProc && typeof this.clipProc.abort == 'function') {
                    LOG
                    .debug("Aborting current clip process because its data was asked to be removed");
                    this.clipProc.abort();
                }
            }
            Downsha.ClipProcessor.parent.remove.apply(this, [item, dontRemoveFile]);
        },

        removePayload: function(payload, dontRemoveFile) {
            LOG.debug("ClipProcessor.removePayload");
            if (this.currentItem && this.currentItem == payload) {
                if (this.clipProc && typeof this.clipProc.abort == 'function') {
                    LOG
                    .debug("Aborting current clip process because its payload was asked to be removed");
                    this.clipProc.abort();
                }
            }
            Downsha.ClipProcessor.parent.removePayload.apply(this, [payload,
            dontRemoveFile]);
        },

        removeAll: function(dontRemoveFiles) {
            LOG.debug("ClipProcessor.removeAll");
            if (this.clipProc && typeof this.clipProc.abort == 'function') {
                LOG
                .debug("Aborting current clip process because its payload was asked to be removed");
                this.clipProc.abort();
            }
            Downsha.ClipProcessor.parent.removeAll.apply(this, [dontRemoveFiles]);
        },

        processor: function(clipNote, successCallback, errorCallback) {
            LOG.debug("ClipProcessor.processor");
            if (! (clipNote instanceof Downsha.ClipNote)) {
                LOG.debug("Tried to process unexpected object, ignoring...");
                return;
            }
            var self = this;
            var notebook = (clipNote.notebookGuid) ? Downsha.context
            .getNotebookByGuid(clipNote.notebookGuid) : null;
            if (!notebook) {
                clipNote.notebookGuid = null;
            }
            this.clipProc = Downsha.context.remote.clip(clipNote,
            function(response,
            textStatus, xhr) {
                LOG.debug("ClipProcessor successfully clipped a note");
                var respData = {
                    response: response,
                    textStatus: textStatus,
                    xhr: xhr
                };
                if (xhr.readyState == 4 && xhr.status != 0 && textStatus == "success"
                && response.isResult() && typeof successCallback == 'function') {
                    LOG.debug("Executing success callback");
                    successCallback(respData);
                } else if (typeof errorCallback == 'function') {
                    LOG.debug("Executing error callback");
                    errorCallback(respData);
                }
            },
            function(xhr, textStatus, err) {
                if (xhr.readyState == 4) {
                    LOG.error("ClipProcessor encountered an error while clipping note "
                    + " [readyState: " + xhr.readyState + "; status: " + xhr.status
                    + "]");
                } else {
                    LOG.error("ClipProcessor encountered an error while clipping note "
                    + " [readyState: " + xhr.readyState + "]");
                }
                if (typeof errorCallback == 'function') {
                    errorCallback({
                        xhr: xhr,
                        textStatus: textStatus,
                        error: err
                    });
                }
            },
            true);
            this.clipProc.onreadystatechange = function() {
                LOG.debug("clipProc readyStateChange: " + self.clipProc.readyState);
                self.onreadystatechange();
            };
        },

        isSyncRequired: function() {
            var syncState = Downsha.context.getSyncState(true);
            if (syncState
            && (Date.now() - syncState.clientCurrentTime) < this.syncGracePeriod) {
                return false;
            }
            return true;
        },

        process: function(force) {
            LOG.debug("ClipProcessor.process");
            LOG.debug(this.toString());
            var self = this;
            if (this.isStarted() && !this.isActive() && this.hasNext()
            && !Downsha.chromeExtension.offline && this.isSyncRequired()) {
                LOG.debug("Need to get syncState first");
                var syncState = Downsha.context.getSyncState(true);
                Downsha.context.remote
                .getSyncState(
                ((syncState) ? syncState.updateCount: 0),
                function(response, status, xhr) {
                    if (response && response.isResult) {
                        LOG
                        .debug("Successfully obtained syncState before processing queue.");
                    } else {
                        LOG
                        .error("Got soft error in response to syncState before processing queue; gonna attempt to process the queue anyway...");
                        LOG.dir(response.errors);
                    }
                    self.process(force, true);
                },
                function(xhr, status, error) {
                    LOG
                    .debug("Failed to obtain syncState before processing queue. Not gonna even try to upload anything...");
                },
                true);
            } else {
                Downsha.ClipProcessor.parent.process.apply(this, [force]);
            }
        },
        
        _adoptNonPersistentProto: function() {
            Downsha.ClipProcessor.parent._adoptNonPersistentProto.apply(this, []);
            Downsha.inherit(Downsha.ClipProcessor, Downsha.BasicClipProcessor);
            Downsha.extendObject(Downsha.ClipProcessor.prototype, Downsha.ClipProcessorProto);
        },
    }

    Downsha.extendObject(Downsha.ClipProcessor.prototype, Downsha.ClipProcessorProto);
})();

(function() {
  var LOG = null;

  Downsha.AutosaveProcessor = function AutosaveProcessor(path, size, interval,
      gracePeriod, success, error) {
    LOG = Downsha.chromeExtension.logger;
    this.initialize(path, size, interval, gracePeriod, success, error);
  };
  Downsha.inherit(Downsha.AutosaveProcessor, Downsha.BasicClipProcessor);

  Downsha.AutosaveProcessor.prototype.initializeWithEntries = function(entries) {
    LOG.debug("AutosaveProcessor.initializeWithEntries");
    var self = this;
    if (entries && entries.length > 0) {
      for ( var i = 0; i < entries.length; i++) {
        if (entries[i].isFile) {
          LOG.debug("Initializing file: " + entries[i].fullPath);
          var r = entries[i].file(function(file) {
            self.fsa.readTextFromFile(file, function(reader, file) {
              LOG.debug("Successfully retrieved autosaved file on init");
              var clipNote = Downsha.AppModel
                  .unserializeStorable(reader.result);
              LOG.debug("Adding resulting clipNote to clipProcessor");
              if (LOG.isDebugEnabled()) {
                LOG.dir(clipNote);
              }
              Downsha.context.clipProcessor.add(clipNote);
              self.fsa.removeFile(self.rootPath + "/" + file.fileName,
                  function() {
                    LOG.debug("Successfully removed autosaved file");
                  }, self._onfsaerror);
            }, self._onfsaerror);
          });
          Downsha.context.clipProcessor.add(entries[i]);
        }
      }
    }
  };
  Downsha.AutosaveProcessor.prototype.add = function(item) {
    LOG.debug("AutosaveProcessor.add");
    this.removeAll(true);
    Downsha.AutosaveProcessor.parent.add.apply(this, [ item ]);
  };
  Downsha.AutosaveProcessor.prototype.processor = function(clipNote, success,
      error) {
    LOG.debug("AutosaveProcessor.processor");
    if (LOG.isDebugEnabled()) {
      LOG.dir(clipNote);
    }
    if (clipNote) {
      LOG.debug("Adding autosaved note to clipProcessor");
      Downsha.context.clipProcessor.add(clipNote);
      LOG.debug("Removing all previously stored versions of autosaved note");
      this.removeAll();
    }
  };
})();

Downsha.EventHandler = function EventHandler(scope) {
  this.initialize(scope);
};

Downsha.EventHandler.prototype._scope = null;
Downsha.EventHandler.prototype._map = null;
Downsha.EventHandler.prototype.initialize = function(scope) {
  this.__defineGetter__("scope", this.getScope);
  this.__defineSetter__("scope", this.setScope);
  this.__defineGetter__("defaultHandler", this.getDefaultHandler);
  this.__defineSetter__("defaultHandler", this.setDefaultHandler);
  this._map = {};
  this.scope = scope;
};
Downsha.EventHandler.prototype._defaultHandler = null;
Downsha.EventHandler.prototype.getDefaultHandler = function() {
  return this._defaultHandler;
};
Downsha.EventHandler.prototype.setDefaultHandler = function(fn) {
  if (typeof fn == 'function') {
    this._defaultHandler = fn;
  }
};
Downsha.EventHandler.prototype.getScope = function() {
  return this._scope;
};
Downsha.EventHandler.prototype.setScope = function(scope) {
  if (typeof scope == 'object') {
    this._scope = scope;
  }
};
Downsha.EventHandler.prototype.add = function(eventName, fn, scope) {
  if (!this._map[eventName]) {
    this._map[eventName] = [];
  }
  this._map[eventName].push( {
    fn : fn,
    scope : scope
  });
};
Downsha.EventHandler.prototype.addAll = function(map, scope) {
  for ( var eventName in map) {
    this.add(eventName, map[eventName], scope);
  }
};
Downsha.EventHandler.prototype.remove = function(eventName, fn) {
  if (this._map[eventName]) {
    if (fn) {
      for ( var i = 0; i < this._map[eventName].length; i++) {
        if (this._map[eventName][i].fn == fn) {
          delete this._map[eventName][i];
          break;
        }
      }
    } else {
      delete this._map[eventName];
    }
  }
};
Downsha.EventHandler.prototype.removeAll = function() {
  this._map = {};
};
Downsha.EventHandler.prototype.handleEvent = function(eventName, args) {
  if (this._map[eventName]) {
    for ( var i = 0; i < this._map[eventName].length; i++) {
      var fn = this._map[eventName][i].fn;
      var scope = this._map[eventName][i].scope || this.scope;
      fn.apply(scope, args);
    }
  } else {
    this.handleDefaultEvent(args);
  }
};
Downsha.EventHandler.prototype.handleDefaultEvent = function(args) {
  if (typeof this._defaultHandler == 'function') {
    this._defaultHandler.apply(this.scope, args);
  }
};

(function() {
  var LOG = null;
  Downsha.SnippetManager = function SnippetManager(maxSnippets, store) {
    LOG = Downsha.chromeExtension.logger;
    this.__defineGetter__("length", this.getLength);
    this.initialize(maxSnippets, store);
  };

  Downsha.SnippetManager.SNIPPET_KEY_PREFIX = "snippet_";
  Downsha.SnippetManager.SNIPPET_ENTRIES_KEY = "snippetEntries";

  Downsha.SnippetManager.prototype.store = null;
  Downsha.SnippetManager.prototype.entries = null;
  Downsha.SnippetManager.prototype.maxSnippets = 200;
  Downsha.SnippetManager.prototype._length = 0;
  Downsha.SnippetManager.prototype.initialize = function(maxSnippets, store) {
    this.store = (store) || Downsha.context.store;
    if (typeof maxSnippets == 'number' && !isNaN(maxSnippets)
        && maxSnippets > 0) {
      this.maxSnippets = maxSnippets;
    }
    this.initializeEntries();
  };
  Downsha.SnippetManager.prototype.initializeEntries = function() {
    this.entries = {};
    var snippetGuids = this.store.get(this.constructor.SNIPPET_ENTRIES_KEY);
    if (snippetGuids) {
      for ( var i = 0; i < snippetGuids.length; i++) {
        if (snippetGuids[i]) {
          this.entries[snippetGuids[i]] = null;
          this._length++;
        }
      }
    }
  };
  Downsha.SnippetManager.prototype.get = function(guid) {
    if (typeof this.entries[guid] == 'undefined') {
      return undefined;
    } else {
      if (this.entries[guid] === null) {
        var snippet = this.store
            .get(this.constructor.SNIPPET_KEY_PREFIX + guid);
        if (snippet) {
          this.entries[guid] = new Downsha.Snippet(snippet);
        }
      }
      return this.entries[guid];
    }
  };
  Downsha.SnippetManager.prototype.put = function(snippet) {
    if (snippet instanceof Downsha.Snippet && snippet.guid) {
      if (this.length >= this.maxSnippets) {
        this.truncateTo(Math.max(0, (this.maxSnippets - 1)));
      }
      this._storeSnipppet(snippet);
      this.entries[snippet.guid] = snippet;
      this._updateStoreEntries();
    }
  };
  Downsha.SnippetManager.prototype.putAll = function(snippetList) {
    if (this.length >= this.maxSnippets) {
      this.truncateTo(Math.max(0, (this.maxSnippets - snippetList.length)));
    }
    for ( var i = 0; i < snippetList.length; i++) {
      var snippet = snippetList[i];
      if (snippet) {
        this._storeSnippet(snippet);
        this.entries[snippet.guid] = snippet;
      }
    }
    this._updateStoreEntries();
  };
  Downsha.SnippetManager.prototype.remove = function(guid) {
    if (typeof this.entries[guid] != 'undefined') {
      this._removeStoredSnippet(guid);
      delete this.entries[guid];
      this._updateStoreEntries();
    }
  };
  Downsha.SnippetManager.prototype.removeAll = function(guids) {
    for ( var i = 0; i < guids.length; i++) {
      var guid = guids[i];
      this._removeStoredSnippet(guid);
      delete this.entries[guid];
    }
    this._updateStoreEntries();
  };
  Downsha.SnippetManager.prototype.removeFirst = function(num) {
    var entries = this.store.get(this.constructor.SNIPPET_ENTRIES_KEY);
    if (entries instanceof Array) {
      var toRemove = entries.slice(0, num);
      if (toRemove && toRemove.length > 0) {
        this.removeAll(toRemove);
      }
    }
  };
  Downsha.SnippetManager.prototype.removeLast = function(num) {
    var entries = this.store.get(this.constructor.SNIPPET_ENTRIES_KEY);
    if (entries instanceof Array) {
      var toRemove = entries.slice(0 - num);
      if (toRemove && toRemove.length > 0) {
        this.removeAll(toRemove);
      }
    }
  };
  Downsha.SnippetManager.prototype.clear = function() {
    for ( var guid in this.entries) {
      this.store.remove(this.constructor.SNIPPET_KEY_PREFIX + guid);
    }
    this.entries = {};
    this._updateStoreEntries();
    this._length = 0;
  };
  Downsha.SnippetManager.prototype.truncateTo = function(count) {
    if (this.length > count) {
      var delta = this.length - count;
      this.removeFirst(delta);
    }
  };
  Downsha.SnippetManager.prototype.getLength = function() {
    return this._length;
  };
  Downsha.SnippetManager.prototype._storeSnippet = function(snippet) {
    this.store.put(this.constructor.SNIPPET_KEY_PREFIX + snippet.guid, snippet);
    this._length++;
  };
  Downsha.SnippetManager.prototype._removeStoredSnippet = function(guid) {
    this.store.remove(this.constructor.SNIPPET_KEY_PREFIX + guid);
    this._length--;
  };
  Downsha.SnippetManager.prototype._updateStoreEntries = function() {
    var a = [];
    for ( var guid in this.entries) {
      a.push(guid);
    }
    this.store.put(this.constructor.SNIPPET_ENTRIES_KEY, a);
  };
})();

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

/*
 * Downsha
 * ChromeExtension
 * 
 * Created by Pavel Skaldin on 2/10/11
 * Copyright 2011 Downsha Corp. All rights reserved.
 */
(function() {
  var LOG = null;
  Downsha.getChromeExtension = function() {
    if (!Downsha._chromeExtInstance) {
      // Downsha._chromeExtInstance = new Downsha.ChromeExtension();
      var bg = chrome.extension.getBackgroundPage();
      if (window == bg) {
        Downsha._chromeExtInstance = new Downsha.ChromeExtension();
      } else {
        Downsha._chromeExtInstance = bg.Downsha.chromeExtension;
      }
    }
    return Downsha._chromeExtInstance;
  };
  Downsha.__defineGetter__("chromeExtension", Downsha.getChromeExtension);

  Downsha.ChromeExtension = function ChromeExtension() {
    this.initialize();
    // setup global LOG at the end!
    LOG = this.logger;
    this.__defineGetter__("offline", this.isOffline);
    this.__defineSetter__("offline", this.setOffline);
    this.__defineGetter__("searchHelperContentScripting",
        this.getSearchHelperContentScripting);
    this.__defineGetter__("clipperContentScripting",
        this.getClipperContentScripting);
    this.__defineGetter__("contentPreview", this.getContentPreview);
    this.__defineGetter__("snippetManager", this.getSnippetManager);
  };

  Downsha.ChromeExtension.CLIP_PROCESSOR_PATH = "/uploads";
  Downsha.ChromeExtension.CLIP_PROCESSOR_STORAGE_SIZE = Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX * 100;
  Downsha.ChromeExtension.CLIP_PROCESSOR_INTERVAL = 30 * 1000;
  Downsha.ChromeExtension.CLIP_PROCESSOR_GRACE_PERIOD = 60 * 60 * 1000;
  Downsha.ChromeExtension.CLIP_PROCESSOR_PROCESS_TIMEOUT = 10 * 60 * 1000;
  Downsha.ChromeExtension.CLIP_PROCESSOR_KICK_DELAY = 1200;
  Downsha.ChromeExtension.ERROR_NOTIFICATION_HTML_PATH = "/errornotification.html";
  Downsha.ChromeExtension.QUOTA_EXCEEDED_NOTIFICATION_HTML_PATH = "/quotareached.html";
  Downsha.ChromeExtension.UPLOAD_NOTIFICATION_HTML_PATH = "/noteupload.html";
  Downsha.ChromeExtension.UPLOAD_NOTIFICATION_PAYLOAD_GUID_PARAM = "payload";
  Downsha.ChromeExtension.DEFAULT_DESKTOP_NOTIFICATION_TIMEOUT = 6000;
  Downsha.ChromeExtension.POPUP_MONITOR_INTERVAL = 600;
  Downsha.ChromeExtension.POPUP_LOCATION = "/popup.html";
  Downsha.ChromeExtension.MAX_CACHED_SNIPPETS = 200;

  Downsha.ChromeExtension.prototype._offline = false;
  Downsha.ChromeExtension.prototype._localStore = null;
  Downsha.ChromeExtension.prototype._logger = null;
  Downsha.ChromeExtension.prototype._eventHandler = null;
  Downsha.ChromeExtension.prototype._clipProcessor = null;
  Downsha.ChromeExtension.prototype._searchHelperContentScripting = null;
  Downsha.ChromeExtension.prototype._clipperContentScripting = null;
  Downsha.ChromeExtension.prototype._contentPreview = null;
  Downsha.ChromeExtension.prototype._payloadManager = null;
  Downsha.ChromeExtension.prototype._tabSemas = null;
  Downsha.ChromeExtension.prototype._desktopNotifications = null;
  Downsha.ChromeExtension.prototype._popupMonitor = null;
  Downsha.ChromeExtension.prototype._snippetManager = null;
  Downsha.ChromeExtension.prototype._offlineSyncCheck = null;

  Downsha.ChromeExtension.prototype.initialize = function() {
    this.__defineGetter__("localStore", this.getLocalStore);
    this.__defineGetter__("logger", this.getLogger);
    this.__defineGetter__("clipProcessor", this.getClipProcessor);
    this.__defineGetter__("payloadManager", this.getPayloadManager);
    this.__defineGetter__("defaultDesktopNotificationTimeout",
        this.getDefaultDesktopNotificationTimeout);
    this._desktopNotifications = {};
    this.initTabSemas();
    this.initEventHandler();
    this.initBindings();
    this.initClipProcessor();
    this.showIntro();
    var self = this;
    setTimeout(function() {
      self.startUp();
    }, 600);
  };
  Downsha.ChromeExtension.prototype.destroy = function() {
    LOG.debug("ChromeExtension.destroy");
    LOG.info("-------- TERMINTATING --------");
    if (this._clipProcessor) {
      this._clipProcessor.stop();
    }
  };
  Downsha.ChromeExtension.prototype.isOffline = function() {
    return this._offline;
  };
  Downsha.ChromeExtension.prototype.setOffline = function(bool) {
    this._offline = (bool) ? true : false;
    this.handleOffline();
  };
  Downsha.ChromeExtension.prototype.showIntro = function() {
    if (this.localStore && !this.localStore.get("introShown")) {
      chrome.tabs.create( {
        url : chrome.i18n.getMessage("introPageUrl"),
        selected : true
      });
      this.localStore.put("introShown", "true");
    }
  };
  Downsha.ChromeExtension.prototype.startUp = function() {
    LOG.debug("ChromeExtension.startUp");
    var context = Downsha.getContext(true);
    if (!context.rememberedSession) {
        context.destroy();
    } else {
        context.removeAllAutoSavedNotes();
    }
    // get syncState straight away, this will indicate whether we are already
    // logged in, pull in all the necessary user-data and make it look like
    // we've ran before...
    var syncState = Downsha.context.getSyncState(true);
    context.remote
        .getSyncState(
            ((syncState) ? syncState.updateCount : 0),
            function(response, status, xhr) {
              LOG
                  .debug("Successfully obtained syncState during ChromeExtension initialization");
            },
            function(xhr, status, error) {
              LOG
                  .debug("Failed to obtain syncState during ChromeExtension during initialization");
            }, true);
  };
  Downsha.ChromeExtension.prototype.getLogger = function(scope) {
    var logLevel = Downsha.Logger.LOG_LEVEL_ERROR;
    if (this.localStore) {
      var opts = this.localStore.get("options");
      if (opts && typeof opts["debugLevel"] != 'undefiend') {
        logLevel = opts['debugLevel'];
      }
      if (opts && typeof opts["keepLogs"] == 'number') {
        Downsha.FileLoggerImpl.prototype._keepFiles = opts["keepLogs"];
      }
      if (opts && opts["debugEnabled"]) {
        logLevel = Downsha.Logger.LOG_LEVEL_DEBUG;
        Downsha.Logger.enableImplementor(Downsha.FileLoggerImpl);
      } else {
        Downsha.Logger.disableImplementor(Downsha.FileLoggerImpl);
      }
    }
    var logger = Downsha.Logger.getInstance(scope || arguments.callee.caller);
    logger.level = logLevel;
    return logger;
  };
  Downsha.ChromeExtension.prototype.getLocalStore = function() {
    if (!this._localStore) {
      this._localStore = new Downsha.LocalStore(null,
          new Downsha.LocalStore.HTML5_LOCALSTORAGE_IMPL(localStorage));
    }
    return this._localStore;
  };
  Downsha.ChromeExtension.prototype.getClipProcessor = function() {
    if (!this._clipProcessor) {
      var self = this;
      this._clipProcessor = new Downsha.ClipProcessor(
          this.constructor.CLIP_PROCESSOR_PATH,
          this.constructor.CLIP_PROCESSOR_STORAGE_SIZE,
          this.constructor.CLIP_PROCESSOR_INTERVAL,
          this.constructor.CLIP_PROCESSOR_GRACE_PERIOD, function() {
            LOG.debug("Successfully initialized clip processor");
            if (LOG.isDebugEnabled()) {
              LOG.debug("Clearing processLog ("
                  + Downsha.context.processLog.length + ")");
            }
            // let's clear our processLog, cuz it shouldn't be needed at this
          // point
          Downsha.context.processLog.removeAll();
          Downsha.context.updateProcessLog();
          LOG.debug("Softly starting clipProcessor");
          this.processTimeout = self.constructor.CLIP_PROCESSOR_PROCESS_TIMEOUT;
          self.startClipProcessor();
        }, function(e) {
          LOG.debug("Error initializing clip processor: " + e.code);
          self.handleClipProcessorInitError(e);
          new Downsha.RequestMessage(
              Downsha.Constants.RequestType.CLIP_PROCESSOR_INIT_ERROR, e)
              .send();
        });
      this._clipProcessor.onprocess = function(payload, processor, data) {
        LOG.debug("Handling successfully processed payload");
        var guid = self.payloadManager.add(payload);
        var opts = Downsha.context.getOptions(true);
        if (opts && opts.clipNotificationEnabled) {
            try {
          var notification = Downsha.Utils.notifyDesktopWithHTML(
              self.constructor.UPLOAD_NOTIFICATION_HTML_PATH + "?"
                  + self.constructor.UPLOAD_NOTIFICATION_PAYLOAD_GUID_PARAM
                  + "=" + guid, self.defaultDesktopNotificationTimeout);
          notification.payloadGuid = guid;
          notification.onclose = function() {
            LOG.debug("Closing upload sucess notification for guid: "
                + this.payloadGuid + ". Let's remove that payload");
            self.payloadManager.removeByGuid(this.payloadGuid);
          };
          self._desktopNotifications[guid] = notification;
            } catch(e) {
                LOG.error(e);
            }
        }
      };
      this._clipProcessor.onprocesserror = function(payload, processor, data) {
        if (this.isPayloadProcessable(payload)
            || this.isPayloadInGrace(payload)) {
          LOG
              .debug("Payload can still be processed, not notifying user about anything...");
        } else {
          LOG
              .debug("Payload is abortable, let's notify user with desktop notification about it");
          var guid = self.payloadManager.add(payload);
          var notification = Downsha.Utils
              .notifyDesktopWithHTML(self.constructor.UPLOAD_NOTIFICATION_HTML_PATH
                  + "?"
                  + self.constructor.UPLOAD_NOTIFICATION_PAYLOAD_GUID_PARAM
                  + "=" + guid);
          notification.payloadGuid = guid;
          notification.onclose = function() {
            LOG.debug("Closing upload error notification for guid: "
                + this.payloadGuid + ". Let's remove that payload");
            self.payloadManager.removeByGuid(this.payloadGuid);
          };
          self._desktopNotifications[guid] = notification;
          // DO NOT REMOVE THIS LOG.dir line below... it makes crack-smoking
          // Chrome actually execute the damn onclose handler... go figure
          if (LOG.isDebugEnabled()) {
            LOG.dir(notification);
          }
        }
        if (typeof this.__proto__.onprocesserror == 'function') {
          this.__proto__.onprocesserror.apply(this,
              [ payload, processor, data ]);
        }
      };
      this._clipProcessor.onreaderror = function(payload, error) {
        if (!self._clipProcessor.onreaderrorNotifier) {
          LOG.debug("Creating notifier");
          self._clipProcessor.onreaderrorNotifier = new Downsha.DesktopNotifier(
              self.constructor.ERROR_NOTIFICATION_HTML_PATH, 1600);
          self._clipProcessor.onreaderrorNotifier.getUrl = function() {
            var params = {
              title : chrome.i18n
                  .getMessage("desktopNotification_clipProcessorUnexpectedErrorTitle")
            };
            if (this.count > 1) {
              params.message = chrome.i18n
                  .getMessage(
                      "desktopNotification_clipProcessorUnexpectedErrorMessageWithCount",
                      [ error, this.count ]);
            } else {
              params.message = chrome.i18n.getMessage(
                  "desktopNotification_clipProcessorUnexpectedErrorMessage",
                  [ error ]);
            }
            return Downsha.Utils.appendSearchQueryToUrl(this._url, params);
          };
        }
        if (self._clipProcessor.onreaderrorNotifier.lastError
            && self._clipProcessor.onreaderrorNotifier.lastError != error
                .toString()) {
          self._clipProcessor.onreaderrorNotifier.lastError = error.toString();
          self._clipProcessor.onreaderrorNotifier.notify(true);
        } else {
          self._clipProcessor.onreaderrorNotifier.lastError = error.toString();
          self._clipProcessor.onreaderrorNotifier.notify();
        }
      };
    }
    return this._clipProcessor;
  };

  Downsha.ChromeExtension.prototype.getPayloadManager = function() {
    var self = this;
    if (!this._payloadManager) {
      this._payloadManager = new Downsha.PayloadManager();
    }
    return this._payloadManager;
  };

  Downsha.ChromeExtension.prototype.getSearchHelperContentScripting = function() {
    if (!this._searchHelperContentScripting) {
      this._searchHelperContentScripting = new Downsha.SearchHelperContentScripting();
    }
    return this._searchHelperContentScripting;
  };
  Downsha.ChromeExtension.prototype.getClipperContentScripting = function() {
    if (!this._clipperContentScripting) {
      this._clipperContentScripting = new Downsha.ClipperContentScripting();
      this._clipperContentScripting.ontimeout = function() {
        LOG.warn("clippContentScripting timed out...");
        alert(chrome.i18n.getMessage("contentScriptTimedOut"));
      };
      this._clipperContentScripting.createInstance = function() {
        var code = "Downsha.ContentClipper.destroyInstance();";
        code += "(function(){";
        code += "var inst = Downsha.ContentClipper.getInstance();";
        code += "inst.PAGE_CLIP_SUCCESS = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_SUCCESS;";
        code += "inst.PAGE_CLIP_CONTENT_TOO_BIG = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG;";
        code += "inst.PAGE_CLIP_CONTENT_SUCCESS = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_SUCCESS;";
        code += "inst.PAGE_CLIP_CONTENT_FAILURE = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_FAILURE;";
        code += "inst.PAGE_CLIP_FAILURE = Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_FAILURE;";
        code += "})();";
        return code;
      };
    }
    return this._clipperContentScripting;
  };
  Downsha.ChromeExtension.prototype.getContentPreview = function() {
    if (!this._contentPreview) {
      var self = this;
      this._contentPreview = new Downsha.ContentPreview();
      this._contentPreview.ontimeout = function(tabId) {
        var tabSema = self.getTabSemaphore(tabId);
        if (tabSema) {
          tabSema.signal();
        }
        this.__proto__.ontimeout(ontimeout(tabId));
      };
    }
    return this._contentPreview;
  };
  Downsha.ChromeExtension.prototype.getSnippetManager = function() {
    if (!this._snippetManager) {
      this._snippetManager = new Downsha.SnippetManager(
          this.constructor.MAX_CACHED_SNIPPETS, this.localStore);
    }
    return this._snippetManager;
  };

  Downsha.ChromeExtension.prototype.initTabSemas = function() {
    this._tabSemas = {};
  };

  Downsha.ChromeExtension.prototype.initEventHandler = function() {
    this._eventHandler = new Downsha.EventHandler(this);
    this._eventHandler.add(Downsha.Constants.RequestType.LOGOUT,
        this.handleLogout);
    this._eventHandler.add(Downsha.Constants.RequestType.AUTH_SUCCESS,
        this.handleAuthSuccess);
    this._eventHandler.add(Downsha.Constants.RequestType.AUTH_ERROR,
        this.handleAuthError);
    this._eventHandler.add(Downsha.Constants.RequestType.DATA_UPDATED,
        this.handleDataUpdated);
    this._eventHandler.add(Downsha.Constants.RequestType.OPTIONS_UPDATED,
        this.handleOptionsUpdate);
    this._eventHandler.add(
        Downsha.Constants.RequestType.SEARCH_HELPER_DISABLE,
        this.handleSearchHelperDisable);
    this._eventHandler.add(
        Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_SUCCESS,
        this.handlePageClipSuccess);
    this._eventHandler.add(
        Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_TOO_BIG,
        this.handlePageClipTooBig);
    this._eventHandler.add(
        Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_CONTENT_FAILURE,
        this.handlePageClipFailure);
    this._eventHandler.add(
        Downsha.Constants.RequestType.CONTEXT_PAGE_CLIP_FAILURE,
        this.handlePageClipFailure);
    this._eventHandler.add(
        Downsha.Constants.RequestType.CLIP_PROCESSOR_INIT_ERROR,
        this.handleClipProcessorInitError);
    this._eventHandler.add(Downsha.Constants.RequestType.GET_MANAGED_PAYLOAD,
        this.handleGetManagedPayload);
    this._eventHandler.add(
        Downsha.Constants.RequestType.RETRY_MANAGED_PAYLOAD,
        this.handleRetryManagedPayload);
    this._eventHandler.add(
        Downsha.Constants.RequestType.CANCEL_MANAGED_PAYLOAD,
        this.handleCancelManagedPayload);
    this._eventHandler.add(
        Downsha.Constants.RequestType.REVISIT_MANAGED_PAYLOAD,
        this.handleRevisitManagedPayload);
    this._eventHandler.add(
        Downsha.Constants.RequestType.VIEW_MANAGED_PAYLOAD_DATA,
        this.handleViewManagedPayloadData);
    this._eventHandler.add(
        Downsha.Constants.RequestType.EDIT_MANAGED_PAYLOAD_DATA,
        this.handleEditManagedPayloadData);
    this._eventHandler.add(
        Downsha.Constants.RequestType.FETCH_STYLE_SHEET_RULES,
        this.handleFetchStyleSheetRules);
    this._eventHandler.add(
        Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_SELECTION,
        this.handlePreviewClipActionSelection);
    this._eventHandler.add(
        Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_FULL_PAGE,
        this.handlePreviewClipActionFullPage);
    this._eventHandler.add(
        Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_ARTICLE,
        this.handlePreviewClipActionArticle);
    this._eventHandler.add(
        Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_URL,
        this.handlePreviewClipActionUrl);
    this._eventHandler.add(Downsha.Constants.RequestType.POPUP_STARTED,
        this.handlePopupStarted);
    this._eventHandler.add(Downsha.Constants.RequestType.POPUP_ENDED,
        this.handlePopupEnded);
    this._eventHandler.add(Downsha.Constants.RequestType.PREVIEW_NUDGE, this.handlePreviewNudge);
  };

  Downsha.ChromeExtension.prototype.initBindings = function() {
    var self = this;
    // tab updates
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      LOG.debug("chrome.extension.onUpdated: " + tabId);
      self.handleTabUpdate(tabId, changeInfo, tab);
    });
    // extension requests
    chrome.extension.onRequest.addListener(function(request, sender,
        sendResponse) {
      LOG.debug("chrome.extension.onRequest");
      self.handleRequest(request, sender, sendResponse);
    });
    // tab selection changes
    chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
      LOG.debug("chrome.tabs.onSelectionChanged: " + tabId);
      self.handleTabSelectionChange(tabId, selectInfo);
    });
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      LOG.debug("chrome.tabs.onRemoved: " + tabId);
      self.handleTabRemoval(tabId, removeInfo);
    });
  };

  Downsha.ChromeExtension.prototype.initClipProcessor = function() {
    var self = this;
    setTimeout(function() {
      if (!self._clipProcessor) {
        LOG.debug("Initializing clipProcessor");
        self.clipProcessor;
      }
    }, 3000);
  };

  Downsha.ChromeExtension.prototype.initContextMenu = function() {
    var opts = Downsha.context.getOptions(true);
    if (opts.useContextMenu) {
      this._setupContextMenus();
    } else {
      this._removeContextMenus();
    }
  };

  Downsha.ChromeExtension.prototype._removeContextMenus = function() {
    chrome.contextMenus.removeAll();
  };

  Downsha.ChromeExtension.prototype._setupContextMenus = function() {
    var self = this;
    // Clip Full Page
    chrome.contextMenus
        .create(
            {
              title : chrome.i18n.getMessage("contextMenuClipPage"),
              contexts : [ "page", "image" ],
              documentUrlPatterns : [ "http://*/*", "https://*/*" ],
              onclick : function(info, tab) {
                self
                    .doAsUser(
                        function() {
                          LOG
                              .debug("Initiating page clip from menu item contextMenuClipPage");
                          self.clipPageFromTab(tab, true);
                        },
                        function() {
                          LOG
                              .info("Cannot clip from menu item contextMenuClipPage because no user is known");
                          alert(chrome.i18n
                              .getMessage("contextMenuPleaseLogin"));
                        });
              }
            },
            function() {
              if (chrome.extension.lastError) {
                LOG.error("Error creating menu item contextMenuClipPage: "
                    + chrome.extension.lastError);
              } else {
                LOG.debug("Successfully created menu item contextMenuClipPage");
              }
            });

    chrome.contextMenus
        .create(
            {
              title : chrome.i18n.getMessage("contextMenuClipSelection"),
              contexts : [ "selection" ],
              documentUrlPatterns : [ "http://*/*", "https://*/*" ],
              onclick : function(info, tab) {
                self
                    .doAsUser(
                        function() {
                          LOG
                              .debug("Initiating selection cli from menu item contextMenuClipSelection");
                          self.clipPageFromTab(tab, false);
                        },
                        function() {
                          LOG
                              .info("Cannot clip from menu item contextMenuClipSelection because no user is known");
                          alert(chrome.i18n
                              .getMessage("contextMenuPleaseLogin"));
                        });
              }
            },
            function() {
              if (chrome.extension.lastError) {
                LOG.error("Error creating menu item contextMenuClipSelection");
              } else {
                LOG
                    .debug("Successfully created menu item contextMenuClipSelection");
              }
            });

    // Clip Image
    chrome.contextMenus
        .create(
            {
              title : chrome.i18n.getMessage("contextMenuClipImage"),
              contexts : [ "image" ],
              targetUrlPatterns : [ "http://*/*", "https://*/*" ],
              onclick : function(info, tab) {
                if (info.srcUrl) {
                  self
                      .doAsUser(
                          function() {
                            LOG
                                .debug("Initiating image clip from menu item contextMenuClipImage");
                            self.clipImage(info.srcUrl, tab);
                          },
                          function() {
                            LOG
                                .info("Cannot clip from menu item contextMenuClipImage because no user is known");
                            alert(chrome.i18n
                                .getMessage("contextMenuPleaseLogin"));
                          });
                } else {
                  LOG.debug("Could not determine image url");
                }
              }
            },
            function() {
              if (chrome.extension.lastError) {
                LOG.error("Error creating menu item contextMenuClipImage");
              } else {
                LOG
                    .debug("Successfully created menu item contextMenuClipImage");
              }
            });

    chrome.contextMenus
        .create(
            {
              title : chrome.i18n.getMessage("contextMenuClipUrl"),
              contexts : [ 'all' ],
              documentUrlPatterns : [ "http://*/*", "https://*/*" ],
              onclick : function(info, tab) {
                self
                    .doAsUser(
                        function() {
                          LOG
                              .debug("Initiating image clip from menu item contextMenuClipImage");
                          self.clipUrlFromTab(tab);
                        },
                        function() {
                          LOG
                              .info("Cannot clip from menu item contextMenuClipImage because no user is known");
                          alert(chrome.i18n
                              .getMessage("contextMenuPleaseLogin"));
                        });
              }
            }, function() {
              if (chrome.extension.lastError) {
                LOG.error("Error creating menu item contextMenuClipUrl");
              } else {
                LOG.debug("Successfully created menu item contextMenuClipUrl");
              }
            });

    // ---------------
    chrome.contextMenus.create( {
      type : 'separator',
      contexts : [ 'all' ]
    });

    // New Note
    chrome.contextMenus.create( {
      title : chrome.i18n.getMessage("contextMenuNewNote"),
      contexts : [ 'all' ],
      onclick : function(info, tab) {
        LOG.debug("Opening new note window on service side");
        self.openNoteWindow(Downsha.context.getNoteCreateUrl());
      }
    }, function() {
      if (chrome.extension.lastError) {
        LOG.error("Error creating menu item contextMenuNewNote");
      } else {
        LOG.debug("Successfully created menu item contextMenuNewNote");
      }
    });
  };

  Downsha.ChromeExtension.prototype.doAsUser = function(success, error) {
    LOG.debug("ChromeExtension.doAsUser");
    if (Downsha.context.userKnown && typeof success == 'function') {
      success();
    } else {
      var ok = function(response, status, xhr) {
        if (response.isResult() && typeof response.result.syncState != 'undefined' && response.result.syncState && typeof success == 'function') {
          success();
        } else if (typeof error == 'function') {
          error();
        }
      };
      var err = function() {
        if (typeof error == 'function') {
          error();
        }
      };
      Downsha.context.remote.getSyncState(0, ok, err, true);
    }
  };

  Downsha.ChromeExtension.prototype.openWindow = function(url) {
    var self = this;
    chrome.tabs.getSelected(null, function(tab) {
      var opts = {
        url : url
      };
      chrome.windows.create(opts);
    });
  };

  Downsha.ChromeExtension.prototype.openNoteWindow = function(noteUrl) {
    var self = this;
    chrome.tabs.getSelected(null, function(tab) {
      var opts = {
        url : noteUrl,
        width : 800,
        height : 550
      };
      if (tab) {
        opts.incognito = tab.incognito;
      }
      if (typeof opts["incognito"] != 'undefined' && opts.incognito) {
        Downsha.context.getCookie("auth", function(cookie) {
          if (typeof cookie == 'object' && cookie != null
              && typeof cookie["value"] == 'string'
              && typeof noteUrl == 'string') {
            opts.url = Downsha.context.getSetAuthTokenUrl(cookie.value,
                noteUrl.replace(/http.?:\/\/[^\/]+/i, ""));
          }
          chrome.windows.create(opts);
        }, function() {
          chrome.windows.create(opts);
        });
      } else {
        chrome.windows.create(opts);
      }
    });
  };

  Downsha.ChromeExtension.prototype.handleOffline = function() {
    LOG.debug("ChromeExtension.handleOffline");
    if (this.offline && this.clipProcessor.isStarted()) {
      LOG
          .debug("Stopping clipProcessor because we're offline and clipProcessor was running");
      this.clipProcessor.stop();
    } else if (!this.clipProcessor.isStarted()) {
      LOG
          .debug("Starting clipProcessor because we're online and clipProcessor was stopped");
      this.clipProcessor.start();
      this.clipProcessor.process(true);
    }
  };

  Downsha.ChromeExtension.prototype.handleTabUpdate = function(tabId,
      changeInfo, tab) {
    LOG.debug("ChromeExtension.handleTabUpdate: " + tabId);
    var url = (typeof changeInfo == 'object' && changeInfo != null && changeInfo.url) ? changeInfo.url
        : tab.url;
    LOG.debug("Url: " + url);
    var useSearchHelper = false;
    var sh = null;
    if (changeInfo && changeInfo.status == "loading") {
      LOG.debug("Tab contents loading");
      LOG.debug("Creating new semaphore for tab: " + tabId);
      this._tabSemas[tabId] = new Downsha.Semaphore();
      Downsha.context.removeAutoSavedNote(tabId);
      var syncState = Downsha.context.getSyncState(true);
      if (this.offline && syncState && syncState.updateCount
          && !Downsha.chromeExtension._offlineSyncCheck) {
        Downsha.chromeExtension._offlineSyncCheck = Downsha.context.remote
            .getSyncState(
                syncState.updateCount,
                function(response, status, xhr) {
                  LOG
                      .debug("Successfully obtained syncState when tried to recover from offline mode");
                  Downsha.chromeExtension._offlineSyncCheck = null;
                },
                function(xhr, status, error) {
                  LOG
                      .debug("Failed to obtain syncState when tried to recover from offline mode");
                  Downsha.chromeExtension._offlineSyncCheck = null;
                }, true);
      }
    } else if (changeInfo && changeInfo.status == "complete") {
      LOG.debug("Tab contents completed loading");
      if (this._tabSemas[tabId]) {
        LOG.debug("Signaling tab semaphore, tab: " + tabId);
        this._tabSemas[tabId].signal();
      } else {
        LOG.debug("Setting up semaphore on tab: " + tabId);
        this._tabSemas[tabId] = Downsha.Semaphore.mutex();
      }
      if (Downsha.context.getOptions(true).isUseSearchHelper()
          && !Downsha.Utils.isForbiddenUrl(tab.url)) {
        sh = Downsha.SearchHelper.createInstance(tabId, url);
        if (sh) {
          sh.onsearch = function() {
            LOG.debug("Updating badge after simsearch");
            Downsha.Utils.updateBadge(Downsha.context, tabId);
          };
          LOG.debug("Performing simsearch after page has loaded");
          sh.search(tabId, url);
        } else {
          LOG.debug("Removing searchHelper instance cuz we're not using it");
          Downsha.SearchHelper.removeInstance(tabId);
        }
      }
    }
    Downsha.Utils.updateBadge(Downsha.context, tabId);
  };
  Downsha.ChromeExtension.prototype.handleTabSelectionChange = function(tabId,
      selectInfo) {
    LOG.debug("ChromeExtension.handleTabSelectionChange: " + tabId);
    Downsha.Utils.updateBadge(Downsha.context, tabId);
  };
  Downsha.ChromeExtension.prototype.handleTabRemoval = function(tabId,
      removeInfo) {
    LOG.debug("ChromeExtension.handleTabRemoval: " + tabId);
    this.removeTabSemaphore(tabId);
    Downsha.SearchHelper.removeInstance(tabId);
    Downsha.context.removeAutoSavedNote(tabId);
  };
  Downsha.ChromeExtension.prototype.handleRequest = function(request, sender,
      sendResponse) {
    LOG.debug("ChromeExtension.handleRequest");
    if (typeof request == 'object' && request != null) {
      var requestMessage = Downsha.RequestMessage.fromObject(request);
      if (!requestMessage.isEmpty()) {
        this._eventHandler.handleEvent(requestMessage.code, [ request, sender,
            sendResponse ]);
      }
    }
  };
  Downsha.ChromeExtension.prototype.handleLogout = function(request, sender,
      sendResponse) {
    LOG.debug("ChromeExtension.handleLogout");
    var req = Downsha.RequestMessage.fromObject(request);
    Downsha.Utils.clearAllBadges();
    Downsha.SearchHelper.reset();
    Downsha.context.removeSessionCookies();
    Downsha.context.clipProcessor.removeAll();
    Downsha.context.clipProcessor.stop();
    if (req.message && request.message.resetOptions) {
      LOG.debug("Resetting options");
      var opts = Downsha.context.getOptions();
      opts.resetCredentials();
      opts.apply();
    }
    Downsha.context.destroy();
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handleAuthSuccess = function() {
    LOG.debug("ChromeExtension.handleAuthSucess");
    this.startClipProcessor(true);
  };
  Downsha.ChromeExtension.prototype.handleAuthError = function() {
    LOG.debug("ChromeExtension.handleAuthError");
    this.stopClipProcessor();
  };
  Downsha.ChromeExtension.prototype.handleDataUpdated = function() {
    LOG.debug("ChromeExtension.handleDataUpdated");
    this.startClipProcessor();
  };
  Downsha.ChromeExtension.prototype.handleOptionsUpdate = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handleOptionsUpdate");
    var opts = Downsha.context.getOptions(true);
    LOG.level = opts.debugLevel;
    var self = this;
    if (opts.debugEnabled) {
      Downsha.Logger.setLevel(Downsha.Logger.LOG_LEVEL_DEBUG);
      Downsha.Logger.enableImplementor(Downsha.FileLoggerImpl);
    } else {
      Downsha.Logger.setLevel(opts.debugLevel);
      Downsha.Logger.disableImplementor(Downsha.FileLoggerImpl);
    }
    if (opts && typeof opts.keepLogs == 'number') {
      Downsha.FileLoggerImpl.setProtoKeepFiles(opts.keepLogs);
    }
    for ( var i in Downsha.Logger._instances) {
      Downsha.Logger._instances[i].impl.fileLoggingEnabled = opts.debugEnabled;
    }
    chrome.contextMenus.removeAll(function() {
      if (opts.useContextMenu) {
        LOG.debug("Setting up context menus per updated option");
        self._setupContextMenus();
      } else {
        LOG.debug("Not setting up context menus per updated option");
      }
    });
    if (!opts.isUseSearchHelper()) {
      Downsha.Utils.updateBadge(Downsha.context);
      Downsha.SearchHelper.reset();
    }
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handleSearchHelperDisable = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleSearchHelperDisable");
    if (confirm(chrome.i18n.getMessage("searchHelperConfirmDisable"))) {
      var opts = Downsha.context.getOptions(true);
      opts.setUseSearchHelper(false);
      // Downsha.context.setOptions(opts);
      opts.apply();
      this.searchHelperContentScripting.clearContentMessages();
    }
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePageClipSuccess = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePageClipSuccess");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var clipNote = new Downsha.ClipNote(requestMessage.message);
    clipNote.created = new Date().getTime();
    if (!clipNote.notebookGuid) {
      var preferredNotebook = Downsha.context.getPreferredNotebook();
      if (preferredNotebook) {
        clipNote.notebookGuid = preferredNotebook.guid;
      }
    }
    LOG.debug("Clipped note's content length: " + clipNote.content.length);
    Downsha.chromeExtension.processClip(clipNote);
    // XXX testing...
    // var win = window.open();
    // win.document.body.innerHTML = clipNote.content;
    // XXX end testing
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePageClipTooBig = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePageClipTooBig");
    var msg = chrome.i18n.getMessage("fullPageClipTooBig");
    msg = $("<div>" + msg + "</div>").text();
    LOG.error(msg);
    alert(msg);
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePageClipFailure = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePageClipFailure");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var msg = (requestMessage.message) ? requestMessage.message : chrome.i18n
        .getMessage("fullPageClipFailure");
    msg = $("<div>" + msg + "</div>").text();
    LOG.error(msg);
    alert(msg);
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handleClipProcessorInitError = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleClipProcessorInitError");
    if (typeof sendResponse == 'function') {
      sendResponse( {});
    }
  };

  Downsha.ChromeExtension.prototype.handleGetManagedPayload = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleGetManagedUpload");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var payload = this.payloadManager.getByGuid(requestMessage.message);
    if (payload) {
      LOG.debug("Retrieved payload by guid: " + requestMessage.message);
    } else {
      LOG.debug("Could not find payload by guid: " + requestMessage.message);
    }
    Downsha.Utils.updateBadge(Downsha.context);
    sendResponse(payload);
  };
  Downsha.ChromeExtension.prototype.handleRetryManagedPayload = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleRetryManagedUpload");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var payloadGuid = requestMessage.message;
    var payload = this.payloadManager.getByGuid(payloadGuid);
    if (payload) {
      LOG.debug("Retrying payload with guid: " + payloadGuid);
      if (LOG.isDebugEnabled()) {
        LOG.dir(payload);
      }
      if (payload.path) {
        LOG.debug("Removing payload from processLog: " + payload.path);
        Downsha.context.processLog.remove(payload.path);
        Downsha.context.updateProcessLog();
      }
      this.processClip(payload.data);
    } else {
      LOG.debug("Could not find payload by guid: " + payloadGuid);
    }
    if (this._desktopNotifications[requestMessage.message]) {
      this._desktopNotifications[requestMessage.message].cancel();
      delete this._desktopNotifications[requestMessage.message];
    }
    Downsha.Utils.updateBadge(Downsha.context);
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handleCancelManagedPayload = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleCancelFailedUpload");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    LOG.debug("Removing payload witih guid: " + requestMessage.message);
    this.payloadManager.removeByGuid(requestMessage.message);
    if (this._desktopNotifications[requestMessage.message]) {
      this._desktopNotifications[requestMessage.message].cancel();
      delete this._desktopNotifications[requestMessage.message];
    }
    Downsha.Utils.updateBadge(Downsha.context);
    sendResponse( {});
  };

  Downsha.ChromeExtension.prototype.handleRevisitManagedPayload = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleRevisitManagedPayload");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var payload = this.payloadManager.getByGuid(requestMessage.message);
    if (payload && payload.data && payload.data.url) {
      Downsha.Utils.openWindow(payload.data.url);
    }
    if (this._desktopNotifications[requestMessage.message]) {
      this._desktopNotifications[requestMessage.message].cancel();
      delete this._desktopNotifications[requestMessage.message];
    }
    Downsha.Utils.updateBadge(Downsha.context);
    sendResponse( {});
  };

  Downsha.ChromeExtension.prototype.handleViewManagedPayloadData = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleViewManagedPayloadData");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var payload = this.payloadManager.removeByGuid(requestMessage.message);
    if (payload && payload.processResponse && payload.processResponse.response) {
      var resp = Downsha.EDAMResponse
          .fromObject(payload.processResponse.response);
      var noteUrl = Downsha.context.getNoteViewUrl(resp.result.note.guid);
      if (resp.isResult() && resp.result.note && resp.result.note.guid
          && noteUrl) {
        Downsha.Utils.openWindow(noteUrl);
      } else {
        Downsha.Utils.openWindow(Downsha.context.getDownshaSearchUrl());
      }
    }
    if (this._desktopNotifications[requestMessage.message]) {
      this._desktopNotifications[requestMessage.message].cancel();
      delete this._desktopNotifications[requestMessage.message];
    }
    sendResponse( {});
  };

  Downsha.ChromeExtension.prototype.handleEditManagedPayloadData = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handleEditManagedPayloadData");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var payload = this.payloadManager.removeByGuid(requestMessage.message);
    if (payload && payload.processResponse && payload.processResponse.response) {
      var resp = Downsha.EDAMResponse
          .fromObject(payload.processResponse.response);
      if (resp.isResult() && resp.result.note && resp.result.note.guid) {
        Downsha.Utils.openWindow(Downsha.context
            .getNoteEditUrl(resp.result.note.guid));
      }
    }
    if (this._desktopNotifications[requestMessage.message]) {
      this._desktopNotifications[requestMessage.message].cancel();
      delete this._desktopNotifications[requestMessage.message];
    }
    sendResponse( {});
  };

  Downsha.ChromeExtension.prototype.handleFetchStyleSheetRules = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.prototype.handleFetchStyleSheetRules");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var url = requestMessage.message;
    if (url) {
      var opts = {
        url : url,
        type : "get",
        async : false,
        success : function(text, status, xhr) {
          if (xhr.readyState == 4 && xhr.status == 200) {
            LOG.debug("Fetched css text of length: " + text.length + ".");
            sendResponse( {
              url : url,
              cssText : text
            });
          } else {
            LOG.error("Could not fetch style sheet from: " + url);
            sendResponse( {
              url : url
            });
          }
        },
        error : function(xhr, status, err) {
          LOG.error("Could not fetch style sheet from: " + url);
          sendResponse( {
            url : url
          });
        }
      };
      LOG.debug("Fetching external style sheet from " + url);
      $.ajax(opts);
    }
  };

  Downsha.ChromeExtension.prototype.handlePreviewClipActionSelection = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionSelection");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message
        && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      tabSema.critical(function() {
        self.contentPreview.previewSelection(tabId, function() {
          LOG.debug("Previewing selection of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePreviewClipActionFullPage = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionFullPage");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message
        && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      tabSema.critical(function() {
        self.contentPreview.previewFullPage(tabId, function() {
          LOG.debug("Previewing full page of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePreviewClipActionArticle = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionArticle");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message
        && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      var opts = Downsha.getContext(true).getOptions(true);
      var showHelp = (opts && opts.selectionNudging == Downsha.Options.SELECTION_NUDGING_OPTIONS.ENABLED) ? true : false;
      tabSema.critical(function() {
        self.contentPreview.previewArticle(tabId, function() {
          LOG.debug("Previewing article of a page in tab: " + tabId);
          tabSema.signal();
        }, showHelp);
      });
    }
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePreviewClipActionUrl = function(
      request, sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePreviewClipActionUrl");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message
        && typeof requestMessage.message.tabId == 'number') {
      var tabId = requestMessage.message.tabId;
      var tabSema = this.getTabSemaphore(tabId);
      tabSema.critical(function() {
        self.contentPreview.previewURL(tabId, function() {
          LOG.debug("Previewing article of a page in tab: " + tabId);
          tabSema.signal();
        });
      });
    }
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePreviewNudge = function(request, sender, sendResponse) {
      LOG.debug("ChromeExtension.handlePreviewNudge");
      var opts = Downsha.getContext(true).getOptions(true);
      if (opts && opts.selectionNudging == Downsha.Options.SELECTION_NUDGING_OPTIONS.DISABLED) {
          LOG.info("Ignoring request to nudge preview because of user preference");
          return;
      }
      var requestMessage = Downsha.RequestMessage.fromObject(request);
      var self = this;
      if (requestMessage 
          && typeof requestMessage.message.tabId == 'number' 
          && typeof requestMessage.message.direction == 'number') {
          var tabId = requestMessage.message.tabId;
          var direction = requestMessage.message.direction;
          var tabSema = this.getTabSemaphore(tabId);
          tabSema.critical(function() {
              self.contentPreview.nudgePreview(tabId, direction, function() {
                  LOG.debug("Nudging preview: " + direction);
                  tabSema.signal();
              });
          });
      }
      sendResponse({});
  };

  Downsha.ChromeExtension.prototype.handleQuotaReached = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handleQuotaReached");
    Downsha.Utils
        .notifyDesktopWithHTML(this.constructor.QUOTA_EXCEEDED_NOTIFICATION_HTML_PATH);
    if (typeof sendResponse == 'function') {
      sendResponse( {});
    }
  };
  Downsha.ChromeExtension.prototype.handlePopupStarted = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePopupStarted");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    this.startPopupMonitor();
    sendResponse( {});
  };
  Downsha.ChromeExtension.prototype.handlePopupEnded = function(request,
      sender, sendResponse) {
    LOG.debug("ChromeExtension.handlePopupEnded");
    this.stopPopupMonitor();
    this.contentPreview.clearAll();
    sendResponse( {});
  };

  Downsha.ChromeExtension.prototype.startPopupMonitor = function() {
    LOG.debug("ChromeExtension.startPopupMonitor");
    var self = this;
    this.stopPopupMonitor();
    this._popupMonitor = setInterval(function() {
      var views = chrome.extension.getViews();
      for ( var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.window.location.href
            && view.window.location.href
                .indexOf(self.constructor.POPUP_LOCATION) > 0) {
          return;
        }
      }
      var req = new Downsha.RequestMessage(
          Downsha.Constants.RequestType.POPUP_ENDED);
      self.handlePopupEnded(req, self, function() {
      });
      chrome.extension.sendRequest(req);
    }, this.constructor.POPUP_MONITOR_INTERVAL);
  };
  Downsha.ChromeExtension.prototype.stopPopupMonitor = function() {
    LOG.debug("ChromeExtension.prototype.stopPopupMonitor");
    if (this._popupMonitor) {
      clearInterval(this._popupMonitor);
      this._popupMonitor = null;
    }
  };

  Downsha.ChromeExtension.prototype.startClipProcessor = function(force) {
    LOG.debug("ChromeExtension.prototype.startClipProcessor");
    if (Downsha.context.userKnown && this._clipProcessor
        && (!this._clipProcessor.isStarted() || force)
        && !this._clipProcessor.isEmpty()) {
      LOG.debug("Starting clip processor");
      if (force) {
        this._clipProcessor.refresh();
      }
      this._clipProcessor.start();
    } else if (!this._clipProcessor) {
      LOG
          .debug("Ignoring attempt to start clipProcessor because it doesn't exist (yet?)...");
    } else if (!Downsha.context.userKnown) {
      LOG
          .debug("Ignoring attempt to start clipProcessor because user is unknown");
    } else if (this._clipProcessor.isStarted()) {
      LOG
          .debug("Ignoring attempt to start clipProcessor because it's already started");
    } else if (this._clipProcessor.isEmpty()) {
      LOG.debug("Ignoring attempt to start clipProcessor because it's empty");
    } else {
      LOG.debug("Ignoring attempt to start clipProcessor for whatever reason");
    }
  };
  Downsha.ChromeExtension.prototype.stopClipProcessor = function() {
    LOG.debug("ChromeExtension.stopClipProcessor");
    if (this._clipProcessor && this._clipProcessor.isStarted()) {
      this._clipProcessor.stop();
    }
  };

  Downsha.ChromeExtension.prototype.clipImage = function(srcUrl, tab) {
    LOG.debug("ChromeExtension.clipImage");
    var n = new Downsha.ClipNote( {
      title : tab.title,
      content : "<img src=\"" + srcUrl + "\"/>",
      created : new Date().getTime(),
      url : tab.url
    });
    var preferredNotebook = Downsha.context.getPreferredNotebook();
    if (preferredNotebook) {
      n.notebookGuid = preferredNotebook.guid;
    }
    this.processClip(n);
  };

  Downsha.ChromeExtension.prototype.clipPageFromTab = function(tab, fullPage,
      attrs) {
    LOG.debug("ChromeExtension.clipPageFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG
          .warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping content of a page in tab: " + tab.id);
      self.clipperContentScripting.perform(tab.id, fullPage, Downsha.context
          .getPreferredStylingStrategyQualifier(), {}, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipFullPageFromTab = function(tab, attrs) {
    LOG.debug("ChromeExtension.clipFullPageFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG
          .warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping content of a page in tab: " + tab.id);
      self.clipperContentScripting.clipFullPage(tab.id, Downsha.context
          .getPreferredStylingStrategyQualifier(), attrs, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipSelectionFromTab = function(tab, attrs) {
    LOG.debug("ChromeExtension.clipSelectionFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG
          .warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping selection of a page in tab: " + tab.id);
      self.clipperContentScripting.clipSelection(tab.id, Downsha.context
          .getPreferredStylingStrategyQualifier(), attrs, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipArticleFromTab = function(tab, attrs) {
    LOG.debug("ChromeExtension.clipArticleFromTab");
    if (Downsha.Utils.isForbiddenUrl(tab.url)) {
      alert(chrome.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    var self = this;
    if (!this._tabSemas[tab.id]) {
      LOG
          .warn("Looks like we don't have a semaphore for this tab... it is likely it was already open, so let's creat a mutex");
      this._tabSemas[tab.id] = Downsha.Semaphore.mutex();
    }
    this._tabSemas[tab.id].critical(function() {
      LOG.debug("Clipping selection of a page in tab: " + tab.id);
      self.clipperContentScripting.clipArticle(tab.id, Downsha.context
          .getPreferredStylingStrategyQualifier(), attrs, true);
      if (self._tabSemas[tab.id]) {
        self._tabSemas[tab.id].signal();
      }
    });
  };

  Downsha.ChromeExtension.prototype.clipUrlFromTab = function(tab, attrs) {
    LOG.debug("ChromeExtension.clipUrlFromTab");
    var self = this;
    var style = "";
    var favIcon = (tab.favIconUrl) ? tab.favIconUrl : null;
    var n = Downsha.ClipNote.createUrlNote(tab.title, tab.url, favIcon);
    this._overloadClipNote(n, attrs);
    if (!n.title) {
      n.title = chrome.i18n.getMessage("quickNote_untitledNote");
    }
    if (LOG.isDebugEnabled()) {
      LOG.debug("Clipping URL: ");
      LOG.dir(n.content);
    }
    if (!n.notebookGuid) {
      var preferredNotebook = Downsha.context.getPreferredNotebook();
      if (preferredNotebook) {
        n.notebookGuid = preferredNotebook.guid;
      }
    }
    this.processClip(n);
  };

  Downsha.ChromeExtension.prototype._overloadClipNote = function(note, attrs) {
    if (note && attrs) {
      for ( var a in attrs) {
        if (Downsha.hasOwnProperty(note, a)) {
          try {
            if (attrs[a]) {
              note[a] = attrs[a];
            }
          } catch (e) {
          }
        }
      }
    }
  };

  Downsha.ChromeExtension.prototype.processClip = function(clip) {
    LOG.debug("ChromeExtension.processClip");
    var self = this;
    this.clipProcessor.add(clip);
    setTimeout(function() {
      LOG.debug("Kicking off clipProcessor after adding new clip...");
      self.clipProcessor.process();
    }, this.constructor.CLIP_PROCESSOR_KICK_DELAY);
  };

  Downsha.ChromeExtension.prototype.getDefaultDesktopNotificationTimeout = function() {
    return this.constructor.DEFAULT_DESKTOP_NOTIFICATION_TIMEOUT;
  };

  Downsha.ChromeExtension.prototype.getCurrentTab = function(fn) {
    chrome.windows.getCurrent(function(win) {
      chrome.tabs.getSelected(win.id, fn);
    });
  };
  Downsha.ChromeExtension.prototype.executeContentScript = function(object,
      callback) {
    this.getCurrentTab(function(tab) {
      chrome.tabs.executeScript(tab.id, object, callback);
    });
  };
  Downsha.ChromeExtension.prototype.getTabSemaphore = function(tabId) {
    if (typeof tabId == 'number' && !this._tabSemas[tabId]) {
      this._tabSemas[tabId] = Downsha.Semaphore.mutex();
    }
    return this._tabSemas[tabId];
  };
  Downsha.ChromeExtension.prototype.removeTabSemaphore = function(tabId) {
    if (typeof tabId == 'number' && this._tabSemas[tabId]) {
      LOG.debug("Destroying tab semaphore for tab: " + tabId);
      this._tabSemas[tabId] = null;
      delete this._tabSemas[tabId];
    }
  };
})();


/*
 * Downsha
 * ChromeExtensionRemote
 * 
 * Created by Pavel Skaldin on 2/10/11
 * Copyright 2011 Downsha Corp. All rights reserved.
 */
(function() {
  var LOG = null;
  Downsha.ChromeExtensionRemote = function ChromeExtensionRemote() {
    LOG = Downsha.chromeExtension.logger;
    this.initialize();
  };
  Downsha.inherit(Downsha.ChromeExtensionRemote, Downsha.DownshaRemote,
      true);

  Downsha.ChromeExtensionRemote.prototype._searchSema = null;
  Downsha.ChromeExtensionRemote.prototype.initialize = function() {
    this._searchSema = Downsha.Semaphore.mutex();
    Downsha.ChromeExtensionRemote.parent.initialize.apply(this, []);
  };
  /**
   * Flag indicating whether relogin was attempted using stored credentials.
   * This is used to avoid re-processing requests that results in authentication
   * errors.
   */
  Downsha.ChromeExtensionRemote.prototype._reloginAttempted = false;

  /**
   * Overridden authenticate method. It will notify the extension of
   * authentication status.
   * 
   * @param username
   * @param password
   * @param rememberMe
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype.authenticate = function(username,
      password, rememberMe, success, failure, processResponse) {
    var successCallback = function(authResponse, authTextStatus, authXhr) {
      if (typeof success == 'function') {
        success(authResponse, authTextStatus, authXhr);
      }
      if (authResponse.hasAuthenticationError()) {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.AUTH_ERROR, authResponse));
      } else {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.AUTH_SUCCESS, authResponse));
      }
    };
    return Downsha.ChromeExtensionRemote.parent.authenticate.apply(this, [
        username, password, rememberMe, successCallback, failure,
        processResponse ]);
  };
  /**
   * Overridden getSyncState method that ensures that if there are stored
   * credentials, its operation is executed on behalf of that user
   * 
   * @param updateCount
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype.getSyncState = function(updateCount,
      success, failure, processResponse, force) {
    LOG.debug("ChromeExtensionRemote.getSyncState");
    var self = this;
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    LOG.debug("Ensuring user before fetching syncState");
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
        LOG.debug("Actually trying to fetch syncState");
      xhr.become(Downsha.ChromeExtensionRemote.parent.getSyncState.apply(self,
          args));
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype.clip = function(clipNote, success,
      failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.clip");
    var self = this;
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      xhr.become(Downsha.ChromeExtensionRemote.parent.clip.apply(self, args));
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype.file = function(note, success,
      failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.file");
    var self = this;
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      xhr.become(Downsha.ChromeExtensionRemote.parent.file.apply(self, args));
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype.deleteNote = function(note, success,
      failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.deleteNote");
    var self = this;
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      xhr.become(Downsha.ChromeExtensionRemote.parent.deleteNote.apply(self,
          args));
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype.countNotes = function(noteFilter,
      success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.countNotes");
    var self = this;
    var args = [ noteFilter ];
    var xhr = new Downsha.MutableXMLHttpRequest();
    var ok = function(data, status, xhr) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof success == 'function') {
        success(data, status, xhr);
      }
    };
    var err = function(xhr, status, error) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof failure == 'function') {
        failure(xhr, status, error);
      }
    };
    args = args.concat( [ ok, err, processResponse ]);
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      self._searchSema.critical(function() {
        LOG.debug("SearchSema: " + self._searchSema.toString());
        xhr.become(Downsha.ChromeExtensionRemote.parent.countNotes.apply(self,
            args));
      });
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype._findNotes = function(noteFilter,
      data, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote._findNotes");
    var self = this;
    var args = [ noteFilter, data ];
    var xhr = new Downsha.MutableXMLHttpRequest();
    var ok = function(data, status, xhr) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof success == 'function') {
        success(data, status, xhr);
      }
    };
    var err = function(xhr, status, error) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof failure == 'function') {
        failure(xhr, status, error);
      }
    };
    args = args.concat( [ ok, err, processResponse ]);
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      self._searchSema.critical(function() {
        LOG.debug("SearchSema: " + self._searchSema.toString());
        xhr.become(Downsha.ChromeExtensionRemote.parent._findNotes.apply(self,
            args));
      });
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype._findMetaNotes = function(
      noteFilter, resultSpec, data, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote._findMetaNotes");
    var self = this;
    var args = [ noteFilter, resultSpec, data ];
    var xhr = new Downsha.MutableXMLHttpRequest();
    var ok = function(data, status, xhr) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof success == 'function') {
        success(data, status, xhr);
      }
    };
    var err = function(xhr, status, error) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof failure == 'function') {
        failure(xhr, status, error);
      }
    };
    args = args.concat( [ ok, err, processResponse ]);
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      self._searchSema.critical(function() {
        LOG.debug("SearchSema: " + self._searchSema.toString());
        xhr.become(Downsha.ChromeExtensionRemote.parent._findMetaNotes.apply(
            self, args));
      });
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype.findNoteSnippets = function(
      noteFilter, offset, maxNotes, snippetLength, textOnly, success, failure,
      processResponse) {
    LOG.debug("ChromeExtensionRemote._findNoteSnippets");
    var self = this;
    var args = [ noteFilter, offset, maxNotes, snippetLength, textOnly ];
    var xhr = new Downsha.MutableXMLHttpRequest();
    var ok = function(data, status, xhr) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof success == 'function') {
        success(data, status, xhr);
      }
    };
    var err = function(xhr, status, error) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof failure == 'function') {
        failure(xhr, status, error);
      }
    };
    args = args.concat( [ ok, err, processResponse ]);
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      self._searchSema.critical(function() {
        LOG.debug("SearchSema: " + self._searchSema.toString());
        xhr.become(Downsha.ChromeExtensionRemote.parent.findNoteSnippets
            .apply(self, args));
      });
    });
    return xhr;
  };
  Downsha.ChromeExtensionRemote.prototype.noteSnippets = function(guids,
      snippetLength, textOnly, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.noteSnippets");
    var self = this;
    var args = [ guids, snippetLength, textOnly ];
    var xhr = new Downsha.MutableXMLHttpRequest();
    var ok = function(data, status, xhr) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof success == 'function') {
        success(data, status, xhr);
      }
    };
    var err = function(xhr, status, error) {
      LOG.debug("Signalling searchSema");
      self._searchSema.signal();
      LOG.debug("SearchSema: " + self._searchSema.toString());
      if (typeof failure == 'function') {
        failure(xhr, status, error);
      }
    };
    args = args.concat( [ ok, err, processResponse ]);
    this._ensureUser(Downsha.context.getOptions(true).username, function() {
      self._searchSema.critical(function() {
        LOG.debug("SearchSema: " + self._searchSema.toString());
        xhr.become(Downsha.ChromeExtensionRemote.parent.noteSnippets.apply(
            self, args));
      });
    });
    return xhr;
  };
  /**
   * Private method that will ensure that any operation provided by the callback
   * is executed by a user with given username if there are stored credentials.
   * 
   * This is required in order to avoid a situation where the user opts in to
   * store their credentials (expecting the extension to always operate on
   * behalf of that user), but then logs in as another user via the web,
   * replacing original session cookie and authToken. Once that happens, any
   * communication between the extension and the service will be on behalf of
   * the new user. This method will compare its current state and appropriate
   * cookies and will re-authenticate using stored credentials, if needed,
   * before executing the callback.
   * 
   * @param username
   * @param callback
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype._ensureUser = function(username,
      callback) {
    LOG.debug("ChromeExtensionRemote._ensureUser");
    if (!Downsha.context.persistentLogin) {
      callback();
    } else {
      var self = this;
      var authAndExec = function() {
        LOG
            .debug("It appears that the extension isn't operating on behalf of the persistent user, let's try to re-authenticate and re-execute remote operation");
        Downsha.context.removeCookie("auth");
        setTimeout(function() {
          callback();
        }, 100);
      };
      Downsha.context
          .getAuthenticationToken(
              function(authToken) {
                if (Downsha.context.user
                    && Downsha.context.user.username == username
                    && Downsha.context.user.id == authToken.userId) {
                  LOG
                      .debug("Looks like we're operating as the persistent user, executing remote operation");
                  callback();
                } else {
                  authAndExec();
                }
              }, function() {
                authAndExec();
              });
    }
  };
  /**
   * Private method for handling re-authentication and re-processing of requests
   * that resulted in authentication errors. This method uses stored credentials
   * to re-authenticate.
   * 
   * @param origRequest
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype._relogin = function(origRequest) {
    LOG.debug("ChromeExtensionRemote._relogin");
    var self = this;
    var opts = Downsha.context.getOptions(true);
    if (opts.username && opts.password) {
      LOG.debug("Attempting to relogin using stored credentials for: "
          + opts.username);
      this
          .authenticate(
              opts.username,
              Downsha.XORCrypt.decrypt(opts.password, opts.username),
              true,
              function(authResponse, authTextStatus, authXhr) {
                var origSuccess = origRequest.success;
                var origFailure = origRequest.failure;
                origRequest.success = function(r, t, x) {
                  self._reloginAttempted = false;
                  if (typeof origSuccess == 'function') {
                    origSuccess(r, t, x);
                  }
                };
                origRequest.failure = function(x, t, e) {
                  self._reloginAttempted = false;
                  if (typeof origFailure == 'function') {
                    origFailure(x, t, e);
                  }
                };
                if (authResponse && authResponse.isInvalidAuthentication()) {
                  LOG
                      .debug("Handling original success callback due to soft-failed authentication");
                  origRequest.success(authResponse, authTextStatus, authXhr);
                } else if (typeof origSuccess == 'function') {
                  LOG
                      .debug("Retrying original request after successful relogin");
                  self.doRequest.apply(self, origRequest.arguments);
                }
              },
              function(authXhr, authTextStatus, authError) {
                LOG
                    .debug("Failed to reauthenticate, handling original request's failure callback");
                self._reloginAttempted = false;
                if (typeof origRequest.failure == 'function') {
                  origRequest.failure(authXhr, authTextStatus, authError);
                }
              }, true);
      LOG.debug("Marking reloginAttempted");
      this._reloginAttempted = true;
      // we're throwing this to abort any kind of processing in the chain
      throw new Downsha.DownshaRemoteException(
          Downsha.DownshaRemoteErrors.ABORTED_RESPONSE_HANDLING);
    }
  };
  Downsha.ChromeExtensionRemote.prototype._dataMarshaller = function(data) {
    LOG.debug("Downsha.ChromeExtensionRemote._dataMarshaller");
    if (typeof Downsha.ChromeExtensionRemote.parent._dataMarshaller == 'function') {
      Downsha.ChromeExtensionRemote.parent._dataMarshaller.apply(this,
          [ data ]);
    }
  };
  Downsha.ChromeExtensionRemote.prototype._dataUnmarshaller = function(result) {
    LOG.debug("Downsha.ChromeExtensionRemote._dataUnmarshaller");
    if (typeof result == 'object') {
      var updated = false;
      for ( var resultKey in result) {
        LOG.debug("Unmarshalling " + resultKey);
        if (result[resultKey] != null) {
          var model = Downsha.AppModel.unmarshall(result[resultKey]);
          result[resultKey] = model;
        } else {
          var model = null;
        }
        switch (resultKey) {
          case "authenticationResult":
            LOG.debug(">>> AUTH RESULT: " + JSON.stringify(model));
            if (typeof model["user"] != "undefined") {
              LOG.debug("Remembering received user");
              Downsha.context.setUser(model["user"]);
            }
            updated = true;
            break;
          case "user":
            LOG.debug("Remembering received user");
            Downsha.context.setUser(model);
            updated = true;
            break;
          case "notebooks":
            LOG.debug("Remembering received notebooks");
            Downsha.context.setNotebooks(model);
            updated = true;
            break;
          case "tags":
            LOG.debug("Remembering received tags");
            Downsha.context.setTags(model);
            updated = true;
            break;
          case "searches":
            LOG.debug("Remembering received searches");
            Downsha.context.setSearches(model);
            updated = true;
            break;
          case "syncState":
            LOG.debug("Remembering received syncState");
            Downsha.context.setSyncState(model);
            updated = true;
            break;
          case "syncChunk":
            LOG.debug("Updating from SyncChunk");
            Downsha.context.processSyncChunk(model);
            updated = true;
            break;
          case "snippets":
            LOG.debug("Remembering received snippets");
            Downsha.context.snippetManager.putAll(model);
            break;
        }
      }
      if (updated) {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.DATA_UPDATED));
      }
    }
    return result;
  };
  Downsha.ChromeExtensionRemote.prototype._wrapSuccessMsgCallback = function(
      code, fn) {
    return function(response, textStatus, xhr) {
      LOG.debug("ChromeExtensionRemote._wrapSuccessMsgCallback");
      if (typeof fn == 'function') {
        // fn.apply(this, arguments);
        fn(response, textStatus, xhr);
      }
      new Downsha.RequestMessage(code, response).send();
    };
  };
  Downsha.ChromeExtensionRemote.prototype._wrapFailureMsgCallback = function(
      code, fn) {
    return function(xhr, textStatus, error) {
      LOG.debug("ChromeExtensionRemote._wrapFailureMsgCallback");
      if (typeof fn == 'function') {
        // fn.apply(this, arguments);
        fn(xhr, textStatus, error);
      }
      new Downsha.RequestMessage(code, xhr).send();
    };
  };
  /**
   * Overridden handleHttpSuccess handler that intercepts successful HTTP
   * responses, inspects them and if there is an authentication problem, while
   * using persistent authentication, will relogin using stored credentials and
   * reprocess original request.
   * 
   * @param data
   * @param textStatus
   * @param xhr
   * @param origRequest
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype.handleHttpSuccess = function(data,
      textStatus, xhr, origRequest) {
    Downsha.chromeExtension.offline = false;
    var response = Downsha.ChromeExtensionRemote.parent.handleHttpSuccess
        .apply(this, [ data, textStatus, xhr, origRequest ]);
    if ((response.isMissingAuthTokenError() || response
        .isPermissionDeniedError())
        && !this._reloginAttempted
        && origRequest.url != Downsha.getContext().getLoginUrl()) {
      this._relogin(origRequest);
    } else if (response.hasErrorCode(Downsha.EDAMErrorCode.QUOTA_REACHED)) {
      Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
          Downsha.Constants.RequestType.QUOTA_REACHED));
    }
    return response;
  };
  Downsha.ChromeExtensionRemote.prototype.handleHttpError = function(xhr,
      textStatus, error, origRequest) {
    var args = Array.prototype.slice.call(arguments);
    if (xhr.readyState == 4 && xhr.status == 0) {
      Downsha.chromeExtension.offline = true;
    } else {
      Downsha.chromeExtension.offline = false;
    }
    Downsha.ChromeExtensionRemote.parent.handleHttpError.apply(this, args);
  };
})();

/*
 * Downsha
 * DownshaContext
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
(function() {
  var LOG = null;
  Downsha.getContext = function() {
    if (Downsha._context == null) {
      Downsha._context = new Downsha.DownshaContext();
    }
    return Downsha._context;
  };
  Downsha.__defineGetter__("context", Downsha.getContext);
  Downsha.__defineGetter__("contextInitialized", function() {
    return (Downsha._context) ? true : false;
  });

  /** ************** Downsha.DownshaContext *************** */

  /**
   * Downsha.DownshaContext
   * 
   * @return
   */
  Downsha.DownshaContext = function DownshaContext() {
    LOG = Downsha.chromeExtension.logger;
    this.__defineGetter__("tags", this.getTags);
    this.__defineSetter__("tags", this.setTags);
    this.__defineGetter__("searches", this.getSearches);
    this.__defineSetter__("searches", this.setSearches);
    this.__defineGetter__("notebooks", this.getNotebooks);
    this.__defineSetter__("notebooks", this.setNotebooks);
    this.__defineGetter__("defaultNotebook", this.getDefaultNotebook);
    this.__defineSetter__("defaultNotebook", this.setDefaultNotebook);
    this.__defineGetter__("syncState", this.getSyncState);
    this.__defineSetter__("syncState", this.setSyncState);
    this.__defineGetter__("lastSyncStateTime", this.getLastSyncStateTime);
    this.__defineSetter__("lastSyncStateTime", this.setLastSyncStateTime);
    this.__defineGetter__("user", this.getUser);
    this.__defineSetter__("user", this.setUser);
    this.__defineGetter__("noteFilter", this.getNoteFilter);
    this.__defineSetter__("noteFilter", this.setNoteFilter);
    this.__defineGetter__("remote", this.getRemote);
    this.__defineSetter__("remote", this.setRemote);
    this.__defineGetter__("shardId", this.getShardId);
    this.__defineGetter__("shardedUrl", this.getShardedUrl);
    this.__defineGetter__("store", this.getStore);
    this.__defineSetter__("store", this.setStore);
    this.__defineGetter__("clipProcessor", this.getClipProcessor);
    this.__defineSetter__("clipProcessor", this.setClipProcessor);
    this.__defineGetter__("insecureProto", this.getInsecureProto);
    this.__defineSetter__("insecureProto", this.setInsecureProto);
    this.__defineGetter__("secureProto", this.getSecureProto);
    this.__defineSetter__("secureProto", this.setSecureProto);
    this.__defineGetter__("serviceDomain", this.getServiceDomain);
    this.__defineSetter__("serviceDomain", this.setServiceDomain);
    this.__defineGetter__("extensionId", this.getExtensionId);
    this.__defineGetter__("extensionPath", this.getExtensionPath);
    this.__defineGetter__("options", this.getOptions);
    this.__defineSetter__("options", this.setOptions);
    this.__defineGetter__("logLevel", this.getLogLevel);
    this.__defineGetter__("state", this.getState);
    this.__defineSetter__("state", this.setState);
    this.__defineGetter__("locale", this.getLocale);
    this.__defineSetter__("locale", this.setLocale);
    this.__defineGetter__("persistentLogin", this.isPersistentLogin);
    this.__defineGetter__("userKnown", this.isUserKnown);
    this.__defineGetter__("processLog", this.getProcessLog);
    this.__defineSetter__("processLog", this.setProcessLog);
    this.__defineGetter__("snippetManager", this.getSnippetManager);
    this.__defineGetter__("persistenceWarningShown", this.isPersistenceWarningShown);
    this.__defineSetter__("persistenceWarningShown", this.setPersistentWarningShown);
    this.__defineGetter__("rememberedSession", this.isRememberedSession);
    this.__defineSetter__("rememberedSession", this.setRememberedSession);
    this.initialize();
  };

  Downsha.DownshaContext.INSECURE_PROTO = "http://";
  Downsha.DownshaContext.SECURE_PROTO = "https://";
  Downsha.DownshaContext.SERVICE_DOMAIN = "www.downsha.com";
  Downsha.DownshaContext.LOGIN_PATH = "/jclip.action?login";
  Downsha.DownshaContext.LOGOUT_PATH = "/jclip.action?logout";
  Downsha.DownshaContext.CLIPPER_PATH = "/jclip.action?clip";
  Downsha.DownshaContext.SYNC_STATE_PATH = "/jclip.action?syncState";
  Downsha.DownshaContext.REGISTRATION_PATH = "/Registration.action";
  Downsha.DownshaContext.HOME_PATH = "/";
  Downsha.DownshaContext.FILE_NOTE_PATH = "/jclip.action?file";
  Downsha.DownshaContext.DELETE_NOTE_PATH = "/jclip.action?delete";
  Downsha.DownshaContext.FIND_NOTES_PATH = "/jclip.action?find";
  Downsha.DownshaContext.FIND_META_NOTES_PATH = "/jclip.action?findMeta";
  Downsha.DownshaContext.COUNT_NOTES_PATH = "/jclip.action?countNotes";
  Downsha.DownshaContext.DOWNSHA_SEARCH_PATH = "/Home.action";
  Downsha.DownshaContext.DOWNSHA_PROFILE_PATH = "/User.action";
  Downsha.DownshaContext.DOWNSHA_LOGIN_PATH = "/Login.action";
  Downsha.DownshaContext.SHARD_PATH = "/shard";
  Downsha.DownshaContext.NOTE_VIEW_PATH = "/view";
  Downsha.DownshaContext.NOTE_CREATE_PATH = "/edit?newNote";
  Downsha.DownshaContext.NOTE_EDIT_PATH = "/edit";
  Downsha.DownshaContext.SET_AUTH_TOKEN_PATH = "/SetAuthToken.action";
  Downsha.DownshaContext.FIND_SNIPPETS_PATH = "/jclip.action?findSnippets";
  Downsha.DownshaContext.NOTE_SNIPPETS_PATH = "/jclip.action?noteSnippets";
  Downsha.DownshaContext.EXTENSION_ID = null;
  Downsha.DownshaContext.REGISTRATION_CODE = "jsclipper";
  Downsha.DownshaContext.SESSION_COOKIES = [ "auth", "JSESSIONID" ];
  Downsha.DownshaContext.DEFAULT_LOCALE = "default";

  Downsha.DownshaContext.prototype._store = null;
  Downsha.DownshaContext.prototype._clipProcessor = null;
  Downsha.DownshaContext.prototype._tags = null;
  Downsha.DownshaContext.prototype._tagGuidMap = null;
  Downsha.DownshaContext.prototype._tagNameMap = null;
  Downsha.DownshaContext.prototype._notebookGuidMap = null;
  Downsha.DownshaContext.prototype._notebookNameMap = null;
  Downsha.DownshaContext.prototype._searches = null;
  Downsha.DownshaContext.prototype._notebooks = null;
  Downsha.DownshaContext.prototype._defaultNotebook = null;
  Downsha.DownshaContext.prototype._syncState = null;
  Downsha.DownshaContext.prototype._lastSyncStateTime = 0;
  Downsha.DownshaContext.prototype._user = null;
  Downsha.DownshaContext.prototype._insecureProto = null;
  Downsha.DownshaContext.prototype._secureProto = null;
  Downsha.DownshaContext.prototype._serviceDomain = null;
  Downsha.DownshaContext.prototype._noteFilter = null;
  Downsha.DownshaContext.prototype._options = null;
  Downsha.DownshaContext.prototype._locale = null;
  Downsha.DownshaContext.prototype._rememberedSession = false;

  Downsha.DownshaContext.prototype.initialize = function() {
  };
  Downsha.DownshaContext.prototype.destroy = function() {
    this.tags = null;
    this.notebooks = null;
    this.searches = null;
    this.noteFilter = null;
    this.defaultNotebook = null;
    this.syncState = null;
    this.lastSyncStateTime = 0;
    this.user = null;
    this.state = null;
    this.clipProcessor = null;
    this.removeAllAutoSavedNotes();
    this.removeAllSnippets();
    this._rememberedSession = false;
  };
  Downsha.DownshaContext.PROTO_SUFFIX = "://";
  Downsha.DownshaContext.isValidServiceProto = function(proto) {
    var re = new RegExp("^https?" + Downsha.DownshaContext.PROTO_SUFFIX + "$");
    return (typeof proto == 'string' && proto.match(re)) ? true : false;
  };
  Downsha.DownshaContext.formatServiceProto = function(proto) {
    if (typeof proto == 'string') {
      var re = new RegExp("(" + Downsha.DownshaContext.PROTO_SUFFIX + ")?$");
      return proto.replace(/^\s+/, "").replace(/\s+$/, "").replace(re,
          Downsha.DownshaContext.PROTO_SUFFIX);
    } else {
      return proto;
    }
  };
  Downsha.DownshaContext.prototype.setInsecureProto = function(proto) {
    var changed = false;
    if (typeof proto == 'string' && this._insecureProto != proto) {
      proto = Downsha.DownshaContext.formatServiceProto(proto);
      if (Downsha.DownshaContext.isValidServiceProto(proto)
          && this._insecureProto != proto) {
        this._insecureProto = proto;
        changed = true;
      }
    } else if (proto == null && this._insecureProto != null) {
      this._insecureProto = null;
      changed = true;
    }
    if (changed && this.store) {
      this.store.put("insecureProto", this._insecureProto);
    }
  };
  Downsha.DownshaContext.prototype.getInsecureProto = function() {
    if (this._insecureProto == null && this.store) {
      this._insecureProto = this.store.get("insecureProto");
    }
    return (this._insecureProto) ? this._insecureProto
        : Downsha.DownshaContext.INSECURE_PROTO;
  };
  Downsha.DownshaContext.prototype.setSecureProto = function(proto) {
    var changed = false;
    if (typeof proto == 'string' && this._secureProto != proto) {
      proto = Downsha.DownshaContext.formatServiceProto(proto);
      if (Downsha.DownshaContext.isValidServiceProto(proto)
          && this._secureProto != proto) {
        this._secureProto = proto;
        changed = true;
      }
    } else if (proto == null && this._secureProto != null) {
      this._secureProto = null;
      changed = true;
    }
    if (changed && this.store) {
      this.store.put("secureProto", this._secureProto);
    }
  };
  Downsha.DownshaContext.prototype.getSecureProto = function() {
    if (this._secureProto == null && this.store) {
      this._secureProto = this.store.get("secureProto");
    }
    return (this._secureProto != null) ? this._secureProto
        : Downsha.DownshaContext.SECURE_PROTO;
  };
  Downsha.DownshaContext.prototype.setServiceDomain = function(domain) {
    var changed = false;
    if (typeof domain == 'string' && this._serviceDomain != domain) {
      this._serviceDomain = domain;
      changed = true;
    } else if (domain == null && this._serviceDomain != null) {
      this._serviceDomain = null;
      changed = true;
    }
    if (changed && this.store) {
      this.store.put("serviceDomain", this._serviceDomain);
    }
  };
  Downsha.DownshaContext.prototype.getServiceDomain = function() {
    if (this._serviceDomain == null && this.store) {
      this._serviceDomain = this.store.get("serviceDomain");
    }
    return (this._serviceDomain != null) ? this._serviceDomain
        : Downsha.DownshaContext.SERVICE_DOMAIN;
  };
  Downsha.DownshaContext.prototype.getServiceUrl = function() {
    return this.insecureProto + this.serviceDomain;
  };
  Downsha.DownshaContext.prototype.getSecureServiceUrl = function() {
    return this.secureProto + this.serviceDomain;
  };
  Downsha.DownshaContext.prototype.getLoginUrl = function() {
    return this.getSecureServiceUrl() + Downsha.DownshaContext.LOGIN_PATH;
  };
  Downsha.DownshaContext.prototype.getLogoutUrl = function() {
    return this.getSecureServiceUrl() + Downsha.DownshaContext.LOGOUT_PATH;
  };
  Downsha.DownshaContext.prototype.getRegistrationUrl = function(code) {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.REGISTRATION_PATH + "?code="
        + Downsha.DownshaContext.REGISTRATION_CODE;
  };
  Downsha.DownshaContext.prototype.getHomeUrl = function() {
    return this.getSecureServiceUrl() + Downsha.DownshaContext.HOME_PATH;
  };
  Downsha.DownshaContext.prototype.getClipperUrl = function() {
    return this.getSecureServiceUrl() + Downsha.DownshaContext.CLIPPER_PATH;
  };
  Downsha.DownshaContext.prototype.getSyncStateUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.SYNC_STATE_PATH;
  };
  Downsha.DownshaContext.prototype.getFileNoteUrl = function() {
    return this.getSecureServiceUrl() + Downsha.DownshaContext.FILE_NOTE_PATH;
  };
  Downsha.DownshaContext.prototype.getDeleteNoteUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.DELETE_NOTE_PATH;
  };
  Downsha.DownshaContext.prototype.getFindNotesUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.FIND_NOTES_PATH;
  };
  Downsha.DownshaContext.prototype.getFindMetaNotesUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.FIND_META_NOTES_PATH;
  };
  Downsha.DownshaContext.prototype.getCountNotesUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.COUNT_NOTES_PATH;
  };
  Downsha.DownshaContext.prototype.getFindSnippetsUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.FIND_SNIPPETS_PATH;
  };
  Downsha.DownshaContext.prototype.getNoteSnippetsUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.NOTE_SNIPPETS_PATH;
  };
  Downsha.DownshaContext.prototype.getShardId = function() {
    return (this.user instanceof Downsha.User) ? this.user.shardId : null;
  };
  Downsha.DownshaContext.prototype.getShardedUrl = function() {
    if (this.shardId)
      return this.getSecureServiceUrl() + Downsha.DownshaContext.SHARD_PATH
          + "/" + this.shardId;
    else
      return null;
  };
  Downsha.DownshaContext.prototype.getNoteInNotebookUrl = function(noteGuid,
      notebookGuid, words) {
    // /Home.action#v=t&n=7deb1234-9f77-4414-859f-74eacc84e36d&b=344bba7c-ac5d-4505-9f50-70c1a096efb1&x=javascript+&z=d
    var noteUrl = this.getSecureServiceUrl()
        + Downsha.DownshaContext.DOWNSHA_SEARCH_PATH + "#v=t&n=" + noteGuid
        + "&b=" + notebookGuid;
    if (words) {
      noteUrl += "&x=" + encodeURIComponent(words);
    }
    noteUrl += "&z=d";
    return noteUrl;
  };
  Downsha.DownshaContext.prototype.getNoteViewUrl = function(noteGuid, searchWords, locale, notebookGuid) {
    // /view/8d3c87f9-6df9-4475-8ebc-45f336cf9757?locale=default&shard=s1#v=t&n=&b=0
    if (this.shardId) {
        var url = this.getSecureServiceUrl() + Downsha.DownshaContext.NOTE_VIEW_PATH + "/" + noteGuid;
        locale = (locale) ? locale : this.getLocale();
        url += "?locale=" + locale;
        var params = [];
        if (typeof searchWords == 'string' && searchWords.length > 0) {
            params.push({key: "x", value: searchWords});
        } else if (typeof notebookGuid == 'string' && notebookGuid.length > 0) {
            params.push({key: "b", value: notebookGuid});
        }
        if (params.length > 0) {
            url += "#";
            for (var p=0; p<params.length; p++) {
                var param = params[p];
                url += ((p > 0) ? "&" : "") + param["key"] + "=" + encodeURI(param["value"]);
            }
        }
        return url;
    } else {
        return null;
    }
  };
  Downsha.DownshaContext.prototype.getNoteCreateUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.NOTE_CREATE_PATH + "&locale=" + this.getLocale();
  };
  Downsha.DownshaContext.prototype.getNoteEditUrl = function(noteGuid) {
    return this.getSecureServiceUrl() + Downsha.DownshaContext.NOTE_EDIT_PATH + "/" + noteGuid;
  };
  Downsha.DownshaContext.prototype.getDownshaSearchUrl = function(words,
      isAny) {
    // /Home.action#v=t&b=0&x=javascript+examples
    var q = (typeof words == 'string') ? words.replace(/\s+/g, " ") : "";
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.DOWNSHA_SEARCH_PATH + "#v=t&b=0&o="
        + ((isAny) ? "n" : "l") + "&x=" + encodeURIComponent(q);
  };
  Downsha.DownshaContext.prototype.getDownshaLoginUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.DOWNSHA_LOGIN_PATH;
  };
  Downsha.DownshaContext.prototype.getDownshaProfileUrl = function() {
    return this.getSecureServiceUrl()
        + Downsha.DownshaContext.DOWNSHA_PROFILE_PATH;
  };
  Downsha.DownshaContext.prototype.getSetAuthTokenUrl = function(authToken,
      url) {
    var authUrl = this.getSecureServiceUrl()
        + Downsha.DownshaContext.SET_AUTH_TOKEN_PATH;
    authUrl += "?auth=" + encodeURIComponent(authToken) + "&targetUrl="
        + encodeURIComponent(url);
    return authUrl;
  };
  Downsha.DownshaContext.prototype.getLocale = function() {
    if (!this._locale) {
      this._locale = chrome.i18n.getMessage("@@ui_locale");
    }
    if (!this._locale) {
        return this.constructor.DEFAULT_LOCALE;
    }
    return this._locale;
  };
  Downsha.DownshaContext.prototype.setLocale = function(locale) {
    this._locale = (typeof locale == 'string' && locale.length > 0) ? locale
        : null;
  };
  Downsha.DownshaContext.prototype.isPersistentLogin = function() {
    var opts = this.getOptions(true);
    return (opts && opts.username && opts.password) ? true : false;
  };
  Downsha.DownshaContext.prototype.isUserKnown = function() {
    return ((this.user && this.user.username) || this.isPersistentLogin()) ? true
        : false;
  };
  Downsha.DownshaContext.prototype.getExtensionId = function() {
    return chrome.i18n.getMessage("@@extension_id");
  };
  Downsha.DownshaContext.prototype.getExtensionPath = function(path) {
    return "chrome-extension://" + this.extensionId + "/"
        + ((typeof path == 'string') ? path : "");
  };
  /**
   * This is a Google Chrome specific implementation. Pay attention!!! Required
   * arguments are 'cookieName', 'success' and 'fail'. If the cookie with
   * cookieName is found - 'success' function will be called, with found Cookie
   * as the only argument; otherwise 'fail' function will be called.
   * 
   * Optionally, you can specify 'storeId' which would indicate which
   * CookieStore will be searched for the named cookie. If it is not specified,
   * all of the CookieStore's will be searched. In which case, while iterating
   * thru every CookieStore, this function will be called with the same
   * arguments, except current storeId will be specified and 'stores' parameter
   * will contain an exhausting array of CookieStore's that haven't been
   * iterated yet.
   * 
   * In other words - use this method with three arguments if you need to search
   * all the CookieStore's; or with four parameters if you are after a specific
   * CookieStore.
   * 
   * @param cookieName
   *          Name of the cookie to retrieve - required!
   * @param success
   *          Function to call if the named cookie was found
   * @param fail
   *          Function to call if the named cookie was not found
   * @param cookieId
   *          String id of CookieStore from which to retreive cookies. If not
   *          specified, all the stores will be searched.
   * @param stores
   *          Array of CookieStore objects. This is used when iterating thru all
   *          the CookieStore's.
   */
  Downsha.DownshaContext.prototype.getCookie = function(cookieName, success,
      fail, storeId, stores) {
    var self = this;
    if (typeof chrome == 'object' && chrome != null && chrome.cookies) {
      var opts = {
        url : this.getSecureServiceUrl(),
        name : cookieName
      };
      if (storeId) {
        opts.storeId = storeId;
        chrome.cookies.get(opts, function(cookie) {
          if (typeof cookie == 'object' && cookie != null && cookie.value) {
            success(cookie);
          } else if (stores instanceof Array && stores.length > 0) {
            var store = stores.pop();
            self.getCookie(cookieName, success, fail, store.id, stores);
          } else {
            fail();
          }
        });
      } else {
        chrome.cookies.getAllCookieStores(function(stores) {
          if (stores instanceof Array && stores.length > 0) {
            var store = stores.pop();
            self.getCookie(cookieName, success, fail, store.id, stores);
          } else {
            fail();
          }
        });
      }
    } else if (typeof fail == 'function') {
      setTimeout(fail, 0);
    }
  };
  Downsha.DownshaContext.prototype.removeCookie = function(cookieName,
      storeId) {
    if (typeof chrome == 'object' && chrome != null && chrome.cookies) {
      var self = this;
      var opts = {
        url : this.getSecureServiceUrl(),
        name : cookieName
      };
      if (storeId) {
        opts.storeId = storeId;
        chrome.cookies.remove(opts);
      } else {
        chrome.cookies.getAllCookieStores(function(stores) {
          if (stores instanceof Array) {
            for ( var s = 0; s < stores.length; s++) {
              self.removeCookie(cookieName, stores[s].id);
            }
          }
        });
      }
    }
  };
  Downsha.DownshaContext.prototype.setCookie = function(cookieName,
      cookieValue, expiry, secure, storeId) {
    if (typeof chrome == 'object' && chrome != null && chrome.cookies) {
      var self = this;
      var opts = {
        url : this.getSecureServiceUrl(),
        name : cookieName,
        value : cookieValue,
        path : "/"
      };
      if (secure) {
        opts.secure = true;
      } else {
        opts.secure = false;
      }
      var expires = parseInt(expiry);
      if (!isNaN(expires)) {
        opts.expirationDate = expires;
      }
      if (storeId) {
        opts.storeId = storeId;
      }
      chrome.cookies.set(opts);
    }
  };
  Downsha.DownshaContext.prototype.removeSessionCookies = function() {
    for ( var i = 0; i < Downsha.DownshaContext.SESSION_COOKIES.length; i++) {
      this.removeCookie(Downsha.DownshaContext.SESSION_COOKIES[i]);
    }
  };
  Downsha.DownshaContext.prototype.getAuthenticationToken = function(success,
      error) {
    this.getCookie("auth", function(cookie) {
      var authToken = Downsha.AuthenticationToken.decode(cookie.value);
      if (typeof success == 'function') {
        success(authToken);
      }
    }, error);
  };
  Downsha.DownshaContext.prototype.setRemote = function(remote) {
    if (remote instanceof Downsha.DownshaRemote) {
      this._remote = remote;
    }
  };
  Downsha.DownshaContext.prototype.getRemote = function() {
    if (!this._remote) {
      this._remote = new Downsha.ChromeExtensionRemote();
    }
    return this._remote;
  };
  Downsha.DownshaContext.prototype.setStore = function(store) {
    if (store instanceof Downsha.LocalStore)
      this._store = store;
    else if (store == null)
      this._store = null;
  };
  Downsha.DownshaContext.prototype.getStore = function() {
    if (!this._store && Downsha.chromeExtension.localStore) {
      this._store = Downsha.chromeExtension.localStore;
    }
    return this._store;
  };
  Downsha.DownshaContext.prototype.setClipProcessor = function(processor) {
    if (processor instanceof Downsha.QueueProcessor || processor == null) {
      this._clipProcessor = processor;
    }
  };
  Downsha.DownshaContext.prototype.getClipProcessor = function() {
    if (!this._clipProcessor) {
      this._clipProcessor = Downsha.chromeExtension.clipProcessor;
    }
    return this._clipProcessor;
  };
  Downsha.DownshaContext.prototype.isClipProcessorStarted = function() {
    return (this._clipProcessor && this._clipProcessor.isStarted());
  };
  Downsha.DownshaContext.prototype.isInSync = function() {
    return (this.getSyncState()) ? true : false;
  };
  Downsha.DownshaContext.prototype.setUser = function(user) {
    var changed = false;
    if (user instanceof Downsha.User) {
      this._user = user;
      changed = true;
    } else if (user == null) {
      this._user = null;
      changed = true;
    }
    if (this.store && changed) {
      if (this._user != null)
        this.store.put("user", this._user);
      else
        this.store.remove("user");
    }
  };
  Downsha.DownshaContext.prototype.getUser = function(force) {
    if ((this._user == null || force) && this.store != null) {
      var user = this.store.get("user");
      if (user) {
        this._user = new Downsha.User(user);
      } else {
        this._user = null;
      }
    }
    return this._user;
  };
  Downsha.DownshaContext.prototype.getTags = function(force) {
    if ((force || this._tags == null) && this.store != null) {
      var tags = this.store.get("tags");
      if (tags && typeof tags.length == 'number') {
        this._tags = new Array();
        for ( var i = 0; i < tags.length; i++) {
          var tag = new Downsha.Tag(tags[i]);
          this._tags.push(tag);
        }
      }
    }
    return this._tags;
  };
  Downsha.DownshaContext.prototype.setTags = function(tags) {
    var changed = false;
    if (tags == null) {
      this._tags = null;
      changed = true;
    } else if (tags instanceof Downsha.Tag) {
      this._tags = [ tags ];
      changed = true;
    } else if (tags instanceof Array) {
      this._tags = tags;
      changed = true;
    }
    if (changed) {
      this._tagGuidMap = null;
      this._tagNameMap = null;
    }
    if (this.store && changed) {
      if (this._tags)
        this.store.put("tags", this._tags);
      else
        this.store.remove("tags");
    }
  };
  Downsha.DownshaContext.prototype.getTagNames = function() {
    var tags = this.getTags();
    var tagNames = new Array();
    if (tags) {
      for ( var i = 0; i < tags.length; i++) {
        tagNames.push(tags[i].name);
      }
    }
    return tagNames;
  };
  Downsha.DownshaContext.prototype.getTagByGuid = function(guid) {
    var tagMap = this.getTagGuidMap();
    if (typeof guid == 'string' && typeof tagMap[guid] != 'undefined')
      return tagMap[guid];
    return null;
  };
  Downsha.DownshaContext.prototype.getTagByName = function(name) {
    if (typeof name == 'string') {
      var tagMap = this.getTagNameMap();
      return tagMap[name.toLowerCase()];
    }
    return null;
  };
  Downsha.DownshaContext.prototype.getTagGuidMap = function() {
    if (this._tagGuidMap == null && this.tags) {
      this._tagGuidMap = {};
      for ( var i = 0; i < this._tags.length; i++) {
        this._tagGuidMap[this._tags[i].guid] = this._tags[i];
      }
    }
    return this._tagGuidMap;
  };
  Downsha.DownshaContext.prototype.getTagNameMap = function() {
    if (this._tagNameMap == null && this.tags) {
      this._tagNameMap = {};
      for ( var i = 0; i < this._tags.length; i++) {
        this._tagNameMap[this._tags[i].name.toLowerCase()] = this._tags[i];
      }
    }
    return this._tagNameMap;
  };
  Downsha.DownshaContext.prototype.getNotebooks = function(force) {
    if ((force || this._notebooks == null) && this.store != null) {
      var notebooks = this.store.get("notebooks");
      if (notebooks && typeof notebooks.length == 'number') {
        this._notebooks = new Array();
        for ( var i = 0; i < notebooks.length; i++) {
          this._notebooks.push(new Downsha.Notebook(notebooks[i]));
        }
      }
    }
    return this._notebooks;
  };
  Downsha.DownshaContext.prototype.setNotebooks = function(notebooks) {
    var changed = false;
    if (notebooks == null) {
      this._notebooks = null;
      this._defaultNotebook = null;
      changed = true;
    } else if (notebooks instanceof Downsha.Notebook) {
      this._notebooks = [ notebooks ];
      this._defaultNotebook = null;
      changed = true;
    } else if (notebooks instanceof Array) {
      this._notebooks = this._sortModelsByField(notebooks, "name");
      this._defaultNotebook = null;
      changed = true;
    }
    if (changed) {
      this._notebookGuidMap = null;
      this._notebookNameMap = null;
    }
    if (this.store && changed) {
      if (this._notebooks) {
        this.store.put("notebooks", this._notebooks);
      } else {
        this.store.remove("notebooks");
      }
    }
  };
  Downsha.DownshaContext.prototype.getNotebookNames = function() {
    var notebooks = this.getNotebooks();
    var notebookNames = new Array();
    if (notebooks) {
      for ( var i = 0; i < notebooks.length; i++) {
        notebookNames.push(notebooks[i].name);
      }
    }
    return notebookNames;
  };
  Downsha.DownshaContext.prototype.getNotebookGuidMap = function() {
    if (this._notebookGuidMap == null && this.notebooks) {
      this._notebookGuidMap = {};
      for ( var i = 0; i < this._notebooks.length; i++) {
        this._notebookGuidMap[this._notebooks[i].guid] = this._notebooks[i];
      }
    }
    return this._notebookGuidMap;
  };
  Downsha.DownshaContext.prototype.getNotebookNameMap = function() {
    if (this._notebookNameMap == null && this.notebooks) {
      this._notebookNameMap = {};
      for ( var i = 0; i < this._notebooks.length; i++) {
        this._notebookNameMap[this._notebooks[i].name] = this._notebooks[i];
      }
    }
    return this._notebookNameMap;
  };
  Downsha.DownshaContext.prototype.getNotebookByGuid = function(guid) {
    if (typeof guid == 'string') {
      var guidMap = this.getNotebookGuidMap();
      if (guidMap) {
        return guidMap[guid];
      }
    }
    return null;
  };
  Downsha.DownshaContext.prototype.getNotebookByName = function(name) {
    if (typeof name == 'string') {
      var nameMap = this.getNotebookNameMap();
      if (nameMap) {
        return nameMap[name];
      }
    }
    return null;
  };
  Downsha.DownshaContext.prototype.getDefaultNotebook = function() {
    var userNotebooks = this.notebooks;
    if (this._defaultNotebook == null && userNotebooks instanceof Array) {
      for ( var i = 0; i < userNotebooks.length; i++) {
        if (userNotebooks[i].defaultNotebook) {
          this._defaultNotebook = userNotebooks[i];
          break;
        }
      }
    }
    return this._defaultNotebook;
  };
  Downsha.DownshaContext.prototype.setDefaultNotebook = function(notebook) {
    if (notebook instanceof Downsha.Notebook)
      this._defaultNotebook = notebook;
  };
  Downsha.DownshaContext.prototype.getPreferredNotebook = function() {
    var preferredNotebook = null;
    var stateNotebookGuid = null;
    if (this.options) {
      if (this.options.clipNotebook == Downsha.Options.CLIP_NOTEBOOK_OPTIONS.SELECT
          && this.options.clipNotebookGuid
          && this.getNotebookByGuid(this.options.clipNotebookGuid)) {
        preferredNotebook = this
            .getNotebookByGuid(this.options.clipNotebookGuid);
      } else if (this.options.clipNotebook == Downsha.Options.CLIP_NOTEBOOK_OPTIONS.REMEMBER
          && (stateNotebookGuid = this.getState(true).notebookGuid)) {
        preferredNotebook = this.getNotebookByGuid(stateNotebookGuid);
      }
    }
    return (preferredNotebook) ? preferredNotebook : this.getDefaultNotebook();
  };
  Downsha.DownshaContext.prototype.setSearches = function(searches) {
    var changed = false;
    if (searches == null) {
      this._searches = null;
      changed = true;
    } else if (searches instanceof Downsha.SavedSearch) {
      this._searches = [ searches ];
      changed = true;
    } else if (searches instanceof Array) {
      this._searches = searches;
      changed = true;
    }
    if (this.store && changed) {
      if (this._searches)
        this.store.put("searches", this._searches);
      else
        this.store.remove("searches");
    }
  };
  Downsha.DownshaContext.prototype.getSearches = function(force) {
    if ((force || this._searches == null) && this.store != null) {
      var searches = this.store.get("searches");
      if (searches && typeof searches.length == 'number') {
        this._searches = new Array();
        for ( var i = 0; i < searches.length; i++) {
          var search = new Downsha.SavedSearch(searches[i]);
          this._searches.push(search);
        }
      }
    }
    return this._searches;
  };
  Downsha.DownshaContext.prototype.setNoteFilter = function(noteFilter) {
    var changed = false;
    if (noteFilter instanceof Downsha.NoteFilter) {
      this._noteFilter = noteFilter;
      changed = true;
    } else if (noteFilter == null) {
      this._noteFilter = null;
      changed = true;
    }
    if (changed && this.store) {
      if (this._noteFilter)
        this.store.put("noteFilter", this._noteFilter);
      else
        this.store.remove("noteFilter");
    }
  };
  Downsha.DownshaContext.prototype.getNoteFilter = function() {
    if (this._noteFilter == null && this.store) {
      var noteFilter = this.store.get("noteFilter");
      if (noteFilter) {
        this._noteFilter = new Downsha.NoteFilter(noteFilter);
      }
    }
    if (this._noteFilter == null) {
      this._noteFilter = new Downsha.NoteFilter();
      this._noteFilter.fuzzy = true;
    }
    var sortOrder = this.options.noteSortOrder;
    if (sortOrder) {
      this._noteFilter.order = sortOrder.order;
      this._noteFilter.ascending = sortOrder.ascending;
    }
    return this._noteFilter;
  };
  Downsha.DownshaContext.prototype.getSyncState = function(force) {
    if ((force || this._syncState == null) && this.store != null) {
      var syncState = this.store.get("syncState");
      if (syncState) {
        this._syncState = new Downsha.SyncState(syncState);
      }
    }
    return this._syncState;
  };
  Downsha.DownshaContext.prototype.setSyncState = function(syncState) {
    if (syncState instanceof Downsha.SyncState) {
      this._syncState = syncState;
      if (this.store)
        this.store.put("syncState", this._syncState);
    } else if (syncState == null) {
      this._syncState = null;
      if (this.store)
        this.store.remove("syncState");
    }
  };
  Downsha.DownshaContext.prototype.getLastSyncStateTime = function() {
      if (this.store != null) {
          var t = parseInt(this.store.get("lastSyncStateTime"));
          if (!isNaN(t)) {
              this._lastSyncStateTime = t;
          }
      }
      return this._lastSyncStateTime;
  };
  Downsha.DownshaContext.prototype.setLastSyncStateTime = function(t) {
      t = parseInt(t);
      if (isNaN(t)) {
          return;
      }
      this._lastSyncStateTime = t;
      if (this.store != null) {
          this.store.put("lastSyncStateTime", t);
      }
  };
  Downsha.DownshaContext.prototype.isRememberedSession = function() {
      if (this.store != null) {
          this._rememberedSession = (this.store.get("rememberedSession")) ? true : false;
      }
      return this._rememberedSession;
  };
  Downsha.DownshaContext.prototype.setRememberedSession = function(bool) {
      this._rememberedSession = (bool) ? true : false;
      if (this.store != null) {
          this.store.put("rememberedSession", this._rememberedSession);
      }
  };
  Downsha.DownshaContext.prototype.processSyncChunk = function(syncChunk) {
    if (syncChunk instanceof Downsha.SyncChunk) {
      if (syncChunk.expungedNotebooks.length > 0) {
        LOG.debug("Expunging " + syncChunk.expungedNotebooks.length
            + " notebooks");
        this.notebooks = this._expungeModels(this.notebooks,
            syncChunk.expungedNotebooks);
        LOG.debug("Now we have " + this.notebooks.length + " notebooks");
      }
      if (syncChunk.notebooks.length > 0) {
        LOG.debug("Merging " + syncChunk.notebooks.length + " notebooks");
        this.notebooks = this._mergeModels(this.notebooks, syncChunk.notebooks);
        LOG.debug("Now we have " + this.notebooks.length + " notebooks");
      }
      if (syncChunk.expungedTags.length > 0) {
        LOG.debug("Expunging " + syncChunk.expungedTags.length + " tags");
        this.tags = this._expungeModels(this.tags, syncChunk.expungedTags);
        LOG.debug("Now we have " + this.tags.length + " tags");
      }
      if (syncChunk.tags.length > 0) {
        LOG.debug("Merging " + syncChunk.tags.length + " tags");
        this.tags = this._mergeModels(this.tags, syncChunk.tags);
        LOG.debug("Now we have " + this.tags.length + " tags");
      }
      var syncState = this.getSyncState(true);
      if (syncChunk.chunkHighUSN > 0 && syncState) {
        syncState.updateCount = syncChunk.chunkHighUSN;
        if (syncChunk.currentTime) {
          syncState.currentTime = syncChunk.currentTime;
        }
        this.setSyncState(syncState);
      }
    }
  };
  Downsha.DownshaContext.prototype.getSnippetManager = function(force) {
    return Downsha.chromeExtension.snippetManager;
  };
  Downsha.DownshaContext.prototype.resetSyncState = function() {
    LOG.debug("Resetting syncState");
    if (this.syncState != null) {
      this.setSyncState(null);
      this.setUser(null);
      this.setTags(null);
      this.setNotebooks(null);
      this.setDefaultNotebook(null);
    }
  };
  Downsha.DownshaContext.prototype.setOptions = function(options) {
    var changed = false;
    if (options instanceof Downsha.Options) {
      this._options = options;
      changed = true;
    } else if (options == null) {
      this._options = null;
      changed = true;
    }
    if (changed && this.store) {
      if (this.options)
        this.store.put("options", this._options);
      else
        this.store.remove("options");
    }
  };
  Downsha.DownshaContext.prototype.getOptions = function(force) {
    if (this.store && (this._options == null || force)) {
      var opts = this.store.get("options");
      if (opts) {
        this._options = new Downsha.Options(this, opts);
      }
    }
    if (this._options == null) {
      this._options = new Downsha.Options(this, {
        secureProto : this.secureProto,
        insecureProto : this.insecureProto,
        serviceDomain : this.serviceDomain
      });
    }
    return this._options;
  };
  Downsha.DownshaContext.prototype.getLogLevel = function() {
    return this.options.debugLevel;
  };
  Downsha.DownshaContext.prototype.setState = function(state) {
    var changed = false;
    if (state instanceof Downsha.AppState) {
      this._state = state;
      changed = true;
    } else if (state == null) {
      this._state = null;
      changed = true;
    }
    if (changed && this.store) {
      if (this._state)
        this.store.put("state", this._state);
      else
        this.store.remove("state");
    }
  };
  Downsha.DownshaContext.prototype.getState = function(force) {
    if ((this._state == null || force) && this.store) {
      var state = this.store.get("state");
      if (state) {
        this._state = new Downsha.AppState(state);
      }
    }
    if (this._state == null) {
      this._state = new Downsha.AppState();
    }
    return this._state;
  };
  Downsha.DownshaContext.prototype.hasAutoSavedNote = function(tabId) {
    return (this.getAutoSavedNote(tabId)) ? true : false;
  };
  Downsha.DownshaContext.prototype.setAutoSavedNote = function(tabId,
      clipNote) {
    if (this.store && tabId) {
      var list = this.store.get("autoSavedNoteTabs");
      if (!list) {
        list = [];
      }
      if (clipNote instanceof Downsha.ClipNote) {
        this.store.put("autoSavedNote_" + tabId, clipNote);
        if (list.indexOf(tabId) < 0) {
          list.push(tabId);
          this.store.put("autoSavedNoteTabs", list);
        }
      } else {
        this.store.remove("autoSavedNote_" + tabId);
        var i = -1;
        if ((i = list.indexOf(tabId)) >= 0) {
          list.splice(i, 1);
          this.store.put("autoSavedNoteTabs", list);
        }
      }
    }
  };
  Downsha.DownshaContext.prototype.getAutoSavedNote = function(tabId) {
    if (this.store && tabId) {
      var clipNote = this.store.get("autoSavedNote_" + tabId);
      return clipNote;
    }
    return null;
  };
  Downsha.DownshaContext.prototype.removeAutoSavedNote = function(tabId) {
    this.setAutoSavedNote(tabId, null);
  };
  Downsha.DownshaContext.prototype.removeAllAutoSavedNotes = function() {
    if (this.store) {
      var list = this.store.get("autoSavedNoteTabs");
      if (list && list.length > 0) {
        for ( var i = 0; i < list.length; i++) {
          var tabId = list[i];
          if (tabId) {
            this.store.remove("autoSavedNote_" + tabId);
          }
        }
      }
      this.store.put("autoSavedNoteTabs", []);
    }
  };
  Downsha.DownshaContext.prototype.removeAllSnippets = function() {
    this.snippetManager.clear();
  };
  Downsha.DownshaContext.prototype.getPreferredStylingStrategyName = function() {
    var opts = this.getOptions(true);
    var ss = null;
    if (opts && opts.clipStyle == Downsha.Options.CLIP_STYLE_OPTIONS.TEXT) {
      ss = "ClipTextStylingStrategy";
    } else if (opts
        && opts.clipStyle == Downsha.Options.CLIP_STYLE_OPTIONS.FULL) {
      ss = "ClipFullStylingStrategy";
    }
    return ss;
  };
  Downsha.DownshaContext.prototype.getPreferredStylingStrategyQualifier = function() {
    var ss = this.getPreferredStylingStrategyName();
    if (ss) {
      return "Downsha." + ss;
    } else {
      return "null";
    }
  };
  Downsha.DownshaContext.prototype.getProcessLog = function(force) {
    if (this.store && (!this._processLog || force)) {
      var log = this.store.get("processLog");
      if (log) {
        this._processLog = Downsha.ProcessLog.fromObject(log);
      } else {
        this._processLog = new Downsha.ProcessLog();
      }
    } else if (!this._processLog) {
      this._processLog = new Downsha.ProcessLog();
    }
    return this._processLog;
  };
  Downsha.DownshaContext.prototype.setProcessLog = function(log) {
    var changed = false;
    if (log instanceof Downsha.ProcessLog || null) {
      this._processLog = log;
      changed = true;
    }
    if (changed) {
      this.updateProcessLog();
    }
  };
  Downsha.DownshaContext.prototype.updateProcessLog = function() {
    if (this.store) {
      if (this._processLog) {
        this.store.put("processLog", this._processLog);
      } else {
        this.store.remove("processLog");
      }
    }
  };
  Downsha.DownshaContext.prototype.isPersistenceWarningShown = function() {
      if (this.store) {
          var _val = this.store.get("persistenceWarningShown");
          return (_val) ? true : false;
      }
      return false;
  };
  Downsha.DownshaContext.prototype.setPersistentWarningShown = function(bool) {
      if (this.store) {
          this.store.put("persistenceWarningShown", (bool) ? true : false);
      }
  };

  Downsha.DownshaContext.prototype._expungeModels = function(models, guids) {
    if (models instanceof Array && guids instanceof Array) {
      var guidKeys = {};
      var result = new Array();
      for ( var i = 0; i < guids.length; i++) {
        LOG.debug("Adding guid: " + guids[i]);
        guidKeys[guids[i]] = guids[i];
      }
      for ( var i = 0; i < models.length; i++) {
        LOG.debug("Checking if we have: " + models[i].guid);
        if (typeof guidKeys[models[i].guid] == 'undefined') {
          LOG.debug("No we don't, keeping then...");
          result.push(models[i]);
        }
      }
      LOG.debug("Expunged " + (models.length - result.length) + " models");
      return result;
    }
    LOG.warn("There was nothing to expunge");
    return models;
  };
  Downsha.DownshaContext.prototype._mergeModels = function(oldModels,
      newModels) {
    if (oldModels instanceof Array && newModels instanceof Array) {
      // return oldModels.concat(newModels);
      var map = {};
      var result = new Array();
      for ( var i = 0; i < newModels.length; i++) {
        if (typeof newModels[i]["guid"] != 'undefined')
          map[newModels[i].guid] = newModels[i];
      }
      var newModelCount = 0;
      var oldModelCount = 0;
      var updatedModelCount = 0;
      for ( var i = 0; i < oldModels.length; i++) {
        if (typeof map[oldModels[i].guid] != 'undefined') {
          updatedModelCount++;
          result.push(map[oldModels[i].guid]);
          delete map[oldModels[i].guid];
        } else {
          oldModelCount++;
          result.push(oldModels[i]);
        }
      }
      for ( var i in map) {
        newModelCount++;
        result.push(map[i]);
      }
      LOG.debug("Updated " + updatedModelCount + " models; Kept "
          + oldModelCount + " models; Added: " + newModelCount);
      return result;
    } else if (newModels instanceof Array) {
      LOG.warn("There were no models to merge into");
      return newModels;
    }
    LOG.warn("There were no models to merge");
    return oldModels;
  };
  Downsha.DownshaContext.prototype._sortModelsByField = function(models,
      fieldName) {
    if (models instanceof Array) {
      return models.sort(function(a, b) {
        var aField = "";
        var bField = "";
        if (typeof a[fieldName] != 'undefined') {
          aField = a[fieldName].toLowerCase();
        }
        if (typeof b[fieldName] != 'undefined') {
          bField = b[fieldName].toLowerCase();
        }
        if (aField == bField)
          return 0;
        else if (aField < bField)
          return -1;
        else
          return 1;
      });
    }
    return models;
  };
})();

/*
 * Downsha.AppState
 * Downsha
 *
 * Created by Pavel Skaldin on 4/4/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.AppState = function AppState(obj) {
  this.__defineGetter__("fullPage", this.isFullPage);
  this.__defineSetter__("fullPage", this.setFullPage);
  this.__defineGetter__("noteList", this.isNoteList);
  this.__defineSetter__("noteList", this.setNoteList);
  this.__defineGetter__("notebookGuid", this.getNotebookGuid);
  this.__defineSetter__("notebookGuid", this.setNotebookGuid);
  this.__defineGetter__("noteListScrollTop", this.getNoteListScrollTop);
  this.__defineSetter__("noteListScrollTop", this.setNoteListScrollTop);
  this.__defineGetter__("notifyChanges", this.isNotifyChanges);
  this.__defineSetter__("notifyChanges", this.setNotifyChanges);
  this.initialize(obj);
};

Downsha.AppState.CHANGE_EVENT_NAME = "appStateChanged";
Downsha.AppState.DEFAULTS = {
  fullPage : false,
  noteList : false,
  notifyChanges : true,
  notebookGuid : null,
  noteListScrollTop : 0
};

// whether the user specified to clip entire page rather than making a link note
Downsha.AppState.prototype._fullPage = Downsha.AppState.DEFAULTS.fullPage;
// whether the user was browsing the note list rather than clipping
Downsha.AppState.prototype._noteList = Downsha.AppState.DEFAULTS.noteList;
// last selected notebook guid
Downsha.AppState.prototype._notebookGuid = Downsha.AppState.DEFAULTS.notebookGuid;
// whether to trigger event on window object when changes occur
Downsha.AppState.prototype._noteListScrollTop = Downsha.AppState.DEFAULTS.noteListScrollTop;
Downsha.AppState.prototype._notifyChanges = Downsha.AppState.DEFAULTS.notifyChanges;

Downsha.AppState.prototype.initialize = function(obj) {
  // track what the preferred setting for change notification is
  // and disable notifications while initializing... (since this method can be
  // called by other than constructor)
  var prefNotifyChanges = this.notifyChanges;
  this.notifyChanges = false;
  if (typeof obj == 'object' && obj != null) {
    for ( var i in obj) {
      if (i == "notifyChanges") {
        prefNotifyChanges = obj[i];
      } else if (typeof this[i] != 'undefined') {
        this[i] = obj[i];
      }
    }
  }
  // restore preferred setting for change notification
  this.notifyChanges = prefNotifyChanges;
};
Downsha.AppState.prototype.setFullPage = function(bool) {
  var val = (bool) ? true : false;
  if (this._fullPage != val) {
    this._fullPage = val;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.isFullPage = function() {
  return this._fullPage;
};
Downsha.AppState.prototype.setNoteList = function(bool) {
  var val = (bool) ? true : false;
  if (this._noteList != val) {
    this._noteList = val;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.isNoteList = function() {
  return this._noteList;
};
Downsha.AppState.prototype.setNotebookGuid = function(guid) {
  if (typeof guid == 'string' && guid.length > 0 && this._notebookGuid != guid) {
    this._notebookGuid = guid;
    this.notifyChange();
  } else if (guid == null && this._notebookGuid != null) {
    this._notebookGuid = null;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.getNotebookGuid = function() {
  return this._notebookGuid;
};
Downsha.AppState.prototype.setNoteListScrollTop = function(num) {
  if (typeof num == 'number' && this._noteListScrollTop != num) {
    this._noteListScrollTop = num;
    this.notifyChange();
  } else if (num == null
      && this._noteListScrollTop != Downsha.AppState.DEFAULTS.noteListScrollTop) {
    this._noteListScrollTop = Downsha.AppState.DEFAULTS.noteListScrollTop;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.getNoteListScrollTop = function() {
  return this._noteListScrollTop;
};
Downsha.AppState.prototype.setNotifyChanges = function(bool) {
  this._notifyChanges = (bool) ? true : false;
};
Downsha.AppState.prototype.isNotifyChanges = function() {
  return this._notifyChanges;
};

/** ************** Event handling *************** */
Downsha.AppState.prototype.notifyChange = function() {
  if (this.notifyChanges && window) {
    $(window).trigger(Downsha.AppState.CHANGE_EVENT_NAME, [ this ]);
  }
};

/** ************** Conversion *************** */
Downsha.AppState.prototype.toJSON = function() {
  return {
    fullPage : this.fullPage,
    noteList : this.noteList,
    notebookGuid : this.notebookGuid,
    noteListScrollTop : this.noteListScrollTop
  };
};

/*
 * Downsha.ClipNote
 * Downsha
 *
 * Created by Pavel Skaldin on 3/1/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
/**
 * ClipNote represents a note that's clipped from a web page.
 */
Downsha.ClipNote = function ClipNote(obj) {
  this.__defineString__("url");
  this.__defineGetter__("length", this.getLength);
  this.initialize(obj);
};
Downsha.ClipNote.javaClass = "com.downsha.web.ClipNote";
Downsha.inherit(Downsha.ClipNote, Downsha.BasicNoteWithContent, true);

Downsha.ClipNote.createUrlNote = function(title, url, favIcoUrl) {
  var content = Downsha.Utils.createUrlClipContent(title, url, favIcoUrl);
  var n = new Downsha.ClipNote( {
    title : title,
    content : content,
    created : new Date().getTime(),
    url : url
  });
  return n;
};

// Returns total length of the instance as it would be POSTed
Downsha.ClipNote.prototype.getLength = function() {
  var total = 0;
  var props = this.getStorableProps();
  for ( var i = 0; i < props.length; i++) {
    if (this[props[i]]) {
      total += ("" + this[props[i]]).length + props[i].length + 1;
    }
  }
  total += (props.length - 1);
  return total;
};
Downsha.ClipNote.prototype.getStorableProps = function() {
  var basicStorable = Downsha.ClipNote.parent.getStorableProps.apply(this);
  return basicStorable.concat( [ "url" ]);
};
Downsha.ClipNote.prototype.toLOG = function() {
  var logObj = Downsha.ClipNote.parent.toLOG.apply(this);
  logObj["url"] = this.url;
  logObj["length"] = this.length;
  return logObj;
};
Downsha.ClipNote.prototype.toString = function() {
  return "Downsha.ClipNote [" + this.url + "] " + this.title
      + " (notebookGuid: " + this.notebookGuid + "; tagNames: "
      + ((this.tagNames) ? this.tagNames.join(",") : "") + "; content length: "
      + ((typeof this.content == 'string') ? this.content.length : 0)
      + "; comment length: "
      + ((typeof this.comment == 'string') ? this.comment.length : 0) + ")";
};

/*
 * Downsha.Options
 * Downsha
 *
 * Created by Pavel Skaldin on 4/1/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
(function() {
  var LOG = null;
  Downsha.Options = function Options(context, opts) {
    LOG = Downsha.chromeExtension.logger;
    this.__defineGetter__("context", this.getContext);
    this.__defineSetter__("context", this.setContext);
    this.__defineGetter__("developerMode", this.isDeveloperMode);
    this.__defineSetter__("developerMode", this.setDeveloperMode);
    this.__defineGetter__("debugLevel", this.getDebugLevel);
    this.__defineSetter__("debugLevel", this.setDebugLevel);
    this.__defineGetter__("insecureProto", this.getInsecureProto);
    this.__defineSetter__("insecureProto", this.setInsecureProto);
    this.__defineGetter__("secureProto", this.getSecureProto);
    this.__defineSetter__("secureProto", this.setSecureProto);
    this.__defineGetter__("serviceDomain", this.getServiceDomain);
    this.__defineSetter__("serviceDomain", this.setServiceDomain);
    this.__defineGetter__("noteSortOrder", this.getNoteSortOrder);
    this.__defineSetter__("noteSortOrder", this.setNoteSortOrder);
    this.__defineGetter__("clipNotebook", this.getClipNotebook);
    this.__defineSetter__("clipNotebook", this.setClipNotebook);
    this.__defineGetter__("clipNotebookGuid", this.getClipNotebookGuid);
    this.__defineSetter__("clipNotebookGuid", this.setClipNotebookGuid);
    this.__defineGetter__("clipStyle", this.getClipStyle);
    this.__defineSetter__("clipStyle", this.setClipStyle);
    this.__defineGetter__("useContextMenu", this.isUseContextMenu);
    this.__defineSetter__("useContextMenu", this.setUseContextMenu);
    this.__defineGetter__("useSearchHelper", this.isUseSearchHelper);
    this.__defineSetter__("useSearchHelper", this.setUseSearchHelper);
    this.__defineGetter__("username", this.getUsername);
    this.__defineSetter__("username", this.setUsername);
    this.__defineGetter__("password", this.getPassword);
    this.__defineSetter__("password", this.setPassword);
    this.__defineGetter__("debugEnabled", this.isDebugEnabled);
    this.__defineSetter__("debugEnabled", this.setDebugEnabled);
    this.__defineGetter__("keepLogs", this.getKeepLogs);
    this.__defineSetter__("keepLogs", this.setKeepLogs);
    this.__defineGetter__("clipNotificationEnabled",
        this.isClipNotificationEnabled);
    this.__defineSetter__("clipNotificationEnabled",
        this.setClipNotificationEnabled);
    this.__defineGetter__("clipAction", this.getClipAction);
    this.__defineSetter__("clipAction", this.setClipAction);
    this.__defineGetter__("selectionNudging", this.getSelectionNudging);
    this.__defineSetter__("selectionNudging", this.setSelectionNudging);
    this.initialize(context, opts);
  };

  Downsha.Options.FULL_PAGE_OPTIONS = {
    NEVER : 0,
    ALWAYS : 1,
    REMEMBER : 2
  };
  Downsha.Options.NOTE_LIST_OPTIONS = {
    NEVER : 0,
    ALWAYS : 1,
    REMEMBER : 2
  };
  Downsha.Options.CLIP_NOTEBOOK_OPTIONS = {
    DEFAULT : 0,
    SELECT : 1,
    REMEMBER : 2
  };
  Downsha.Options.AUTO_SAVE_CLIPNOTE_OPTIONS = {
    NEVER : 0,
    ALWAYS : 1
  };
  Downsha.Options.CLIP_STYLE_OPTIONS = {
    NONE : 0,
    TEXT : 1,
    FULL : 2
  };
  Downsha.Options.CLIP_ACTION_OPTIONS = {
    ARTICLE : 0,
    FULL_PAGE : 1,
    URL : 2
  };
  Downsha.Options.SELECTION_NUDGING_OPTIONS = {
      ENABLED: 0,
      DISABLED: 1,
      ENABLED_NOHELP: 2
  };

  Downsha.Options.__defineGetter__("DEFAULTS", function() {
    return {
      debugLevel : (LOG) ? LOG.level : Downsha.chromeExtension.logger.level,
      insecureProto : Downsha.DownshaContext.INSECURE_PROTO,
      secureProto : Downsha.DownshaContext.SECURE_PROTO,
      serviceDomain : Downsha.DownshaContext.SERVICE_DOMAIN,
      noteSortOrder : new Downsha.NoteSortOrder(),
      clipNotebook : Downsha.Options.CLIP_NOTEBOOK_OPTIONS.REMEMBER,
      clipNotebookGuid : null,
      clipStyle : Downsha.Options.CLIP_STYLE_OPTIONS.FULL,
      useContextMenu : true,
      useSearchHelper : false,
      debugEnabled : false,
      keepLogs : 3,
      clipNotificationEnabled : true,
      clipAction : Downsha.Options.CLIP_ACTION_OPTIONS.ARTICLE,
      selectionNudging : Downsha.Options.SELECTION_NUDGING_OPTIONS.ENABLED
    };
  });

  Downsha.Options.isValidClipNotebookOptionValue = function(value) {
    return Downsha.Options.isValidOptionValue(value,
        Downsha.Options.CLIP_NOTEBOOK_OPTIONS);
  };

  Downsha.Options.isValidClipStyleOptionValue = function(value) {
    return Downsha.Options.isValidOptionValue(value,
        Downsha.Options.CLIP_STYLE_OPTIONS);
  };

  Downsha.Options.isValidClipActionOptionValue = function(value) {
    return Downsha.Options.isValidOptionValue(value,
        Downsha.Options.CLIP_ACTION_OPTIONS);
  };
  
  Downsha.Options.isValidSelectionNudgingValue = function(value) {
      return Downsha.Options.isValidOptionValue(value, Downsha.Options.SELECTION_NUDGING_OPTIONS);
  }

  Downsha.Options.isValidOptionValue = function(value, allOptions) {
    if (typeof allOptions == 'object' && allOptions != null) {
      for ( var i in allOptions) {
        if (value == allOptions[i]) {
          return true;
        }
      }
    }
    return false;
  };

  Downsha.Options.prototype._context = null;
  Downsha.Options.prototype._developerMode = false;
  Downsha.Options.prototype._debugLevel = Downsha.Options.DEFAULTS.debugLevel;
  Downsha.Options.prototype._insecureProto = Downsha.Options.DEFAULTS.insecureProto;
  Downsha.Options.prototype._secureProto = Downsha.Options.DEFAULTS.secureProto;
  Downsha.Options.prototype._serviceDomain = Downsha.Options.DEFAULTS.serviceDomain;
  Downsha.Options.prototype._noteSortOrder = Downsha.Options.DEFAULTS.noteSortOrder;
  Downsha.Options.prototype._clipNotebook = Downsha.Options.DEFAULTS.clipNotebook;
  Downsha.Options.prototype._clipNotebookGuid = Downsha.Options.DEFAULTS.clipNotebookGuid;
  Downsha.Options.prototype._clipStyle = Downsha.Options.DEFAULTS.clipStyle;
  Downsha.Options.prototype._useContextMenu = Downsha.Options.DEFAULTS.useContextMenu;
  Downsha.Options.prototype._useSearchHelper = Downsha.Options.DEFAULTS.useSearchHelper;
  Downsha.Options.prototype._username = null;
  Downsha.Options.prototype._password = null;
  Downsha.Options.prototype._debugEnabled = Downsha.Options.DEFAULTS.debugEnabled;
  Downsha.Options.prototype._keepLogs = Downsha.Options.DEFAULTS.keepLogs;
  Downsha.Options.prototype._clipNotificationEnabled = Downsha.Options.DEFAULTS.clipNotificationEnabled;
  Downsha.Options.prototype._clipAction = Downsha.Options.DEFAULTS.clipAction;
  Downsha.Options.prototype._selectionNudging = Downsha.Options.DEFAULTS.selectionNudging;

  Downsha.Options.prototype.initialize = function(context, options) {
    if (context instanceof Downsha.DownshaContext) {
      this.context = context;
    }
    var opts = (typeof options == 'object' && options != null) ? options
        : Downsha.Options.DEFAULTS;
    for ( var i in opts) {
      if (typeof this[i] != 'undefined') {
        this[i] = opts[i];
      }
    }
  };
  Downsha.Options.prototype.setContext = function(context) {
    if (context instanceof Downsha.DownshaContext) {
      this._context = context;
    } else if (context == null) {
      this._context = null;
    }
  };
  Downsha.Options.prototype.getContext = function() {
    return this._context;
  };
  Downsha.Options.prototype.setDeveloperMode = function(bool) {
    this._developerMode = (bool) ? true : false;
  };
  Downsha.Options.prototype.isDeveloperMode = function() {
    return this._developerMode;
  };
  Downsha.Options.prototype.setDebugLevel = function(level) {
    if (typeof level == 'number') {
      this._debugLevel = level;
    } else if (typeof level == 'string') {
      this._debugLevel = parseInt(level);
    } else if (level == null) {
      this._debugLevel = 0;
    }
  };
  Downsha.Options.prototype.getDebugLevel = function() {
    return this._debugLevel;
  };
  Downsha.Options.prototype.setInsecureProto = function(proto) {
    if (typeof proto == 'string')
      this._insecureProto = proto;
    else if (proto == null)
      this._insecureProto = null;
  };
  Downsha.Options.prototype.getInsecureProto = function() {
    return this._insecureProto;
  };
  Downsha.Options.prototype.setSecureProto = function(proto) {
    if (typeof proto == 'string')
      this._secureProto = proto;
    else if (proto == null)
      this._secureProto = null;
  };
  Downsha.Options.prototype.getSecureProto = function() {
    return this._secureProto;
  };
  Downsha.Options.prototype.setServiceDomain = function(host) {
    if (typeof host == 'string')
      this._serviceDomain = host;
    else if (host == null)
      this._serviceDomain = null;
  };
  Downsha.Options.prototype.getServiceDomain = function() {
    return this._serviceDomain;
  };
  Downsha.Options.prototype.setNoteSortOrder = function(noteSortOrder) {
    if (noteSortOrder instanceof Downsha.NoteSortOrder) {
      this._noteSortOrder = noteSortOrder;
    } else if (typeof noteSortOrder == 'object' && noteSortOrder != null) {
      this._noteSortOrder = new Downsha.NoteSortOrder(noteSortOrder);
    } else if (noteSortOrder == null) {
      this._noteSortOrder = null;
    }
  };
  Downsha.Options.prototype.getNoteSortOrder = function() {
    return this._noteSortOrder;
  };
  Downsha.Options.prototype.setClipNotebook = function(val) {
    if (Downsha.Options.isValidClipNotebookOptionValue(val)) {
      this._clipNotebook = val;
    } else if (val == null) {
      this._clipNotebook = Downsha.Options.DEFAULTS.clipNotebook;
    }
  };
  Downsha.Options.prototype.getClipNotebook = function() {
    return this._clipNotebook;
  };
  Downsha.Options.prototype.setClipNotebookGuid = function(guid) {
    if (typeof guid == 'string' && guid.length > 0) {
      this._clipNotebookGuid = guid;
    } else if (guid instanceof Downsha.Notebook) {
      this._clipNotebookGuid = guid.guid;
    } else if (guid == null) {
      this._clipNotebookGuid = null;
    }
  };
  Downsha.Options.prototype.getClipNotebookGuid = function() {
    return this._clipNotebookGuid;
  };
  Downsha.Options.prototype.setClipStyle = function(val) {
    if (Downsha.Options.isValidClipStyleOptionValue(val)) {
      this._clipStyle = val;
    } else if (val == null) {
      this._clipStyle = Downsha.Options.DEFAULTS.clipStyle;
    }
  };
  Downsha.Options.prototype.getClipStyle = function() {
    return this._clipStyle;
  };
  Downsha.Options.prototype.isUseContextMenu = function() {
    return this._useContextMenu;
  };
  Downsha.Options.prototype.setUseContextMenu = function(bool) {
    this._useContextMenu = (bool) ? true : false;
  };
  Downsha.Options.prototype.isUseSearchHelper = function() {
    return this._useSearchHelper;
  };
  Downsha.Options.prototype.setUseSearchHelper = function(bool) {
    this._useSearchHelper = (bool) ? true : false;
  };
  Downsha.Options.prototype.getUsername = function() {
    if (!this._username) {
      var user = Downsha.getContext().getUser();
      if (user) {
        this._username = user.username;
      }
    }
    return this._username;
  };
  Downsha.Options.prototype.setUsername = function(username) {
    this._username = username;
  };
  Downsha.Options.prototype.getPassword = function() {
    return this._password;
  };
  Downsha.Options.prototype.setPassword = function(password) {
    this._password = password;
  };
  Downsha.Options.prototype.isDebugEnabled = function() {
    return this._debugEnabled;
  };
  Downsha.Options.prototype.setDebugEnabled = function(bool) {
    this._debugEnabled = (bool) ? true : false;
  };
  Downsha.Options.prototype.getKeepLogs = function() {
    return this._keepLogs;
  };
  Downsha.Options.prototype.setKeepLogs = function(num) {
    this._keepLogs = parseInt(num);
    if (isNaN(this._keepLogs) || num < 0) {
      this._keepLogs = 0;
    }
  };
  Downsha.Options.prototype.isClipNotificationEnabled = function() {
    return this._clipNotificationEnabled;
  };
  Downsha.Options.prototype.setClipNotificationEnabled = function(bool) {
    this._clipNotificationEnabled = (bool) ? true : false;
  };
  Downsha.Options.prototype.getClipAction = function() {
    return this._clipAction;
  };
  Downsha.Options.prototype.setClipAction = function(val) {
    if (Downsha.Options.isValidClipActionOptionValue(val)) {
      this._clipAction = val;
    } else if (val == null) {
      this._clipAction = Downsha.Options.DEFAULTS.clipAction;
    }
  };
  Downsha.Options.prototype.getSelectionNudging = function() {
      return this._selectionNudging;
  };
  Downsha.Options.prototype.setSelectionNudging = function(val) {
      if (Downsha.Options.isValidSelectionNudgingValue(val)) {
          this._selectionNudging = val;
      } else if (val == null) {
          this._selectionNudging = Downsha.Options.DEFAULTS.selectionNudging;
      }
  };

  Downsha.Options.prototype.apply = function() {
    LOG.level = this.debugLevel;
    Downsha.Logger.setLevel(this.debugLevel);
    if (this.context) {
      this.context.setOptions(this);
      this.context.secureProto = this.secureProto;
      this.context.insecureProto = this.insecureProto;
      this.context.serviceDomain = this.serviceDomain;
    }
  };
  Downsha.Options.prototype.resetCredentials = function() {
    this.username = null;
    this.password = null;
  };
  Downsha.Options.prototype.reset = function() {
    this.initialize(this.context, null);
  };

  Downsha.Options.prototype.toJSON = function() {
    return {
      debugLevel : this.debugLevel,
      developerMode : this.developerMode,
      insecureProto : this.insecureProto,
      secureProto : this.secureProto,
      serviceDomain : this.serviceDomain,
      noteSortOrder : this.noteSortOrder,
      clipNotebook : this.clipNotebook,
      clipNotebookGuid : this.clipNotebookGuid,
      clipStyle : this.clipStyle,
      useContextMenu : this.useContextMenu,
      useSearchHelper : this.useSearchHelper,
      username : this.username,
      password : this.password,
      debugEnabled : this.debugEnabled,
      keepLogs : this.keepLogs,
      clipNotificationEnabled : this.clipNotificationEnabled,
      clipAction : this.clipAction,
      selectionNudging : this.selectionNudging
    };
  };
})();

/*
 * Downsha.MailNote
 * Downsha
 *
 * Created by Pavel Skaldin on 3/1/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.MailNote = function MailNote(obj) {
  this.__defineGetter__("mailTo", this.getMailTo);
  this.__defineSetter__("mailTo", this.setMailTo);
  this.__defineGetter__("mailComment", this.getMailComment);
  this.__defineSetter__("mailComment", this.setMailComment);
  this.initialize(obj);
};
Downsha.MailNote.javaClass = "com.downsha.web.MailNote";
Downsha.inherit(Downsha.MailNote, Downsha.Note, true);

Downsha.MailNote.prototype._mailTo = null;
Downsha.MailNote.prototype._mailComment = null;
Downsha.MailNote.prototype.getMailTo = function() {
  return this._mailTo;
};
Downsha.MailNote.prototype.setMailTo = function(str) {
  if (typeof str == 'string')
    this._mailTo = $.trim(str);
  else if (str == null)
    this._mailTo = null;
};
Downsha.MailNote.prototype.getMailComment = function() {
  return this._mailComment;
};
Downsha.MailNote.prototype.setMailComment = function(str) {
  if (typeof str == 'string')
    this._mailComment = $.trim(str);
  else if (str == null)
    this._mailComment = null;
};
Downsha.MailNote.prototype.getStorableProps = function() {
  var props = Downsha.MailNote.parent.getStorableProps.apply(this);
  props.push("mailTo");
  props.push("mailComment");
  return props;
};

/*
 * Downsha.AbstractNoteForm
 * Downsha
 *
 * Created by Pavel Skaldin on 3/5/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.AbstractNoteForm = function AbstractNoteForm() {
};

Downsha.AbstractNoteForm.TITLE = "title";
Downsha.AbstractNoteForm.NOTEBOOK_GUID = "notebookGuid";
Downsha.AbstractNoteForm.TAG_NAMES = "tagNames";
Downsha.AbstractNoteForm.CONTENT = "content";
Downsha.AbstractNoteForm.COMMENT = "comment";

Downsha.inherit(Downsha.AbstractNoteForm, jQuery);
Downsha.AbstractNoteForm.onForm = function(form, fieldNames) {
  var props = {};
  for ( var i in this.prototype) {
    props[i] = this.prototype[i];
  }
  var origForm = form.get(0);
  $.extend(true, form, props);
  form.form = $(origForm);
  form.__defineGetter__("title", form.getTitle);
  form.__defineSetter__("title", form.setTitle);
  form.__defineGetter__("notebookGuid", form.getNotebookGuid);
  form.__defineSetter__("notebookGuid", form.setNotebookGuid);
  form.__defineGetter__("tagNames", form.getTagNames);
  form.__defineSetter__("tagNames", form.setTagNames);
  form.__defineGetter__("content", form.getContent);
  form.__defineSetter__("content", form.setContent);
  form.__defineGetter__("comment", form.getComment);
  form.__defineSetter__("comment", form.setComment);
  if (typeof fieldNames == 'object' && fieldNames != null) {
    for ( var i in fieldNames) {
      if (typeof this.prototype[i + "FieldName"] == 'string')
        this[i + "FieldName"] = fieldNames[i];
    }
  }
  return form;
};

Downsha.AbstractNoteForm.prototype.titleFieldName = Downsha.AbstractNoteForm.TITLE;
Downsha.AbstractNoteForm.prototype.notebookGuidFieldName = Downsha.AbstractNoteForm.NOTEBOOK_GUID;
Downsha.AbstractNoteForm.prototype.tagNamesFieldName = Downsha.AbstractNoteForm.TAG_NAMES;
Downsha.AbstractNoteForm.prototype.contentFieldName = Downsha.AbstractNoteForm.CONTENT;
Downsha.AbstractNoteForm.prototype.commentFieldName = Downsha.AbstractNoteForm.COMMENT;

Downsha.AbstractNoteForm.prototype.getField = function(fieldName) {
  return this.form.find("*[name=" + fieldName + "]");
};
Downsha.AbstractNoteForm.prototype.getLabel = function(fieldName) {
  return this.form.find("label[for=" + fieldName + "]");
};
Downsha.AbstractNoteForm.prototype.enableField = function(fieldName) {
  var field = this.getField(fieldName);
  if (field) {
    if (field.attr("tagName").toLowerCase() == 'input') {
      field.removeAttr("disabled");
    } else {
      field.removeClass("disabled");
    }
    var label = this.getLabel(fieldName);
    if (label && label.hasClass("disabled")) {
      label.removeClass("disabled");
    }
  }
};
Downsha.AbstractNoteForm.prototype.disableField = function(fieldName) {
  var field = this.getField(fieldName);
  if (field) {
    if (field.attr("tagName").toLowerCase() == "input") {
      field.attr("disabled", "disabled");
    } else {
      field.addClass("disabled");
    }
    var label = this.getLabel(fieldName);
    if (label && !(label.hasClass("disabled"))) {
      label.addClass("disabled");
    }
  }
};
Downsha.AbstractNoteForm.prototype.isFieldEnabled = function(fieldName) {
  var field = this.getField(fieldName);
  return (field && !field.hasClass("disabled"));
};
Downsha.AbstractNoteForm.prototype.getTitle = function() {
  return this.getField(this.titleFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setTitle = function(title) {
  this.getField(this.titleFieldName).val(title);
};
Downsha.AbstractNoteForm.prototype.getNotebookGuid = function() {
  return this.getField(this.notebookGuidFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setNotebookGuid = function(notebookGuid) {
  this.getField(this.notebookGuidFieldName).val(notebookGuid);
};
Downsha.AbstractNoteForm.prototype.getTagNames = function() {
  return this.getField(this.tagNamesFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setTagNames = function(tagNames) {
  this.getField(this.tagNamesFieldName).val(tagNames);
};
Downsha.AbstractNoteForm.prototype.getContent = function() {
  return this.getField(this.contentFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setContent = function(content) {
  this.getField(this.contentFieldName).val(content);
};
Downsha.AbstractNoteForm.prototype.getComment = function() {
  return this.getField(this.commentFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setComment = function(comment) {
  this.getField(this.commentFieldName).val(comment);
};
Downsha.AbstractNoteForm.prototype.reset = function() {
  var props = this.getStorableProps();
  for ( var i = 0; i < props.length; i++) {
    this[props[i]] = null;
  }
};
Downsha.AbstractNoteForm.prototype.populateWithNote = function(context, note) {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.AbstractNoteForm.populateWithNote");
  // this.reset();
  if (note instanceof Downsha.AppModel) {
    var props = note.toStorable();
    for ( var i in props) {
      if (typeof this[i] != 'undefined' && typeof note[i] != 'undefined'
          && note[i] != null) {
        this[i] = note[i];
      }
    }
  }
};
Downsha.AbstractNoteForm.prototype.populateWith = function(options) {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.ClipNoteForm.populateWith");
  if (typeof options == 'object' && options != null) {
    for ( var opt in options) {
      if (typeof this[opt] != 'undefined' && typeof this[opt] != 'function'
          && typeof options[opt] != 'undefined' && options[opt] != null) {
        this[opt] = options[opt];
      }
    }
  }
};
Downsha.AbstractNoteForm.prototype.getStorableProps = function() {
  return [ "title", "notebookGuid", "tagNames", "content", "comment" ];
};
Downsha.AbstractNoteForm.prototype.toStorable = function() {
  var props = this.getStorableProps();
  var storable = {};
  for ( var i = 0; i < props.length; i++) {
    if (props[i] == "tagNames") {
      storable[props[i]] = (typeof this.tagNames == 'string') ? Downsha.Utils
          .separateString(this.tagNames, ",") : null;
    } else {
      storable[props[i]] = this[props[i]];
    }
  }
  return storable;
};
Downsha.AbstractNoteForm.prototype.getModelName = function() {
  return "Downsha.AbstractNoteForm";
};
Downsha.AbstractNoteForm.prototype.getStringDescription = function() {
  return "'" + this.title + "'; NotebookGuid: " + this.notebookGuid
      + "; TagNames: " + this.tagNames + "; Content length: "
      + ((typeof this.content == 'string') ? this.content.length : 0)
      + "; Comment length: "
      + ((typeof this.comment == 'string') ? this.comment.length : 0);
};
Downsha.AbstractNoteForm.prototype.toString = function() {
  return this.getModelName() + " " + this.getStringDescription();
};

/*
 * Downsha.NoteForm
 * Downsha
 *
 * Created by Pavel Skaldin on 3/5/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.NoteForm = function NoteForm(form) {
};

Downsha.NoteForm.URL = "url";
Downsha.NoteForm.THUMBNAIL_URL = "thumbnailUrl";
Downsha.NoteForm.NOTE_URL = "noteUrl";
Downsha.NoteForm.GUID = "guid";
Downsha.NoteForm.THUMBNAIL_SIZE = 150;

Downsha.inherit(Downsha.NoteForm, Downsha.AbstractNoteForm);
Downsha.NoteForm.onForm = function(form, fieldNames) {
  form = Downsha.NoteForm.parent.constructor.onForm.apply(this, [ form,
      fieldNames ]);
  form.__defineGetter__("url", form.getUrl);
  form.__defineSetter__("url", form.setUrl);
  form.__defineGetter__("thumbnailUrl", form.getThumbnailUrl);
  form.__defineSetter__("thumbnailUrl", form.setThumbnailUrl);
  form.__defineGetter__("noteUrl", form.getNoteUrl);
  form.__defineSetter__("noteUrl", form.setNoteUrl);
  form.__defineGetter__("guid", form.getGuid);
  form.__defineSetter__("guid", form.setGuid);
  return form;
};

Downsha.NoteForm.prototype.urlFieldName = Downsha.NoteForm.URL;
Downsha.NoteForm.prototype.thumbnailUrlFieldName = Downsha.NoteForm.THUMBNAIL_URL;
Downsha.NoteForm.prototype.noteUrlFieldName = Downsha.NoteForm.NOTE_URL;
Downsha.NoteForm.prototype.guidFieldName = Downsha.NoteForm.GUID;

Downsha.NoteForm.prototype.getUrl = function() {
  return this.getField(this.urlFieldName).text();
};
Downsha.NoteForm.prototype.setUrl = function(url) {
  this.getField(this.urlFieldName).text(url);
};
Downsha.NoteForm.prototype.getThumbnailUrl = function() {
  return this.getField(this.thumbnailUrlFieldName).attr("src");
};
Downsha.NoteForm.prototype.setThumbnailUrl = function(url) {
  this.getField(this.thumbnailUrlFieldName).attr("src", url);
};
Downsha.NoteForm.prototype.getNoteUrl = function() {
  return this.getField(this.noteUrlFieldName).val();
};
Downsha.NoteForm.prototype.setNoteUrl = function(url) {
  this.getField(this.noteUrlFieldName).val(url);
};
Downsha.NoteForm.prototype.setGuid = function(guid) {
  if (typeof guid == 'undefined' || guid == null)
    this.getField(this.guidFieldName).val(null);
  else
    this.getField(this.guidFieldName).val(guid);
};
Downsha.NoteForm.prototype.getGuid = function() {
  return this.getField(this.guidFieldName).val();
};
Downsha.NoteForm.prototype.getStorableProps = function() {
  var props = Downsha.NoteForm.parent.getStorableProps.apply(this);
  props.push("url");
  props.push("thumbnailUrl");
  props.push("noteUrl");
  props.push("guid");
  return props;
};
Downsha.NoteForm.prototype.populateWithNote = function(context, note) {
  if (note instanceof Downsha.BasicNote) {
    Downsha.NoteForm.parent.populateWithNote.apply(this, [ context, note ]);
    if (note.guid) {
      this.guid = note.guid;
      var noteUrl = note.getNoteUrl(context, "", context.getLocale());
      this.noteUrl = noteUrl;
      this.thumbnailUrl = note.getThumbnailUrl(context.getShardedUrl(),
          Downsha.NoteForm.THUMBNAIL_SIZE);
    }
    if (note.attributes instanceof Downsha.NoteAttributes
        && note.attributes.sourceURL) {
      this.url = note.attributes.sourceURL;
    }
  }
};
Downsha.NoteForm.prototype.asNote = function() {
  var note = new Downsha.Note();
  if (this.guid) {
    note.guid = this.guid;
  }
  if (this.title) {
    note.title = this.title;
  }
  if (this.notebookGuid) {
    note.notebookGuid = this.notebookGuid;
  }
  if (this.comment) {
    note.comment = this.comment;
  }
  var doTrim = (typeof "".trim == 'function');
  if (typeof this.tagNames == 'string' && this.tagNames.length > 0) {
    var parts = this.tagNames.split(",");
    if (parts instanceof Array && parts.length > 0) {
      for ( var i = 0; i < parts.length; i++) {
        var t = new Downsha.Tag();
        t.name = (doTrim) ? parts[i].trim() : parts[i];
        note.addTag(t);
      }
    }
  }
  if (this.url) {
    var attrs = (note.attributes instanceof Downsha.NoteAttributes) ? note.attributes
        : (new Downsha.NoteAttributes());
    attrs.sourceURL = this.url;
    note.attributes = attrs;
  }
  return note;
};
Downsha.NoteForm.prototype.getModelName = function() {
  return "Downsha.NoteForm";
};
Downsha.NoteForm.prototype.getStringDescription = function() {
  var superStr = Downsha.NoteForm.parent.getStringDescription.apply(this);
  superStr += "; URL: " + this.url + "; Guid: " + this.guid;
  return superStr;
};

/*
 * Downsha.ModelForm
 * Downsha
 *
 * Created by Pavel Skaldin on 3/7/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
(function() {
  var LOG = null;
  Downsha.ModelForm = function ModelForm() {
    LOG = Downsha.chromeExtension.logger;
  };

  Downsha.inherit(Downsha.ModelForm, jQuery);
  Downsha.ModelForm.onForm = function(form, fieldSelector) {
    LOG = LOG || Downsha.chromeExtension.getLogger(Downsha.ModelForm);
    var props = {};
    for ( var i in this.prototype) {
      props[i] = this.prototype[i];
    }
    // Extend jQuery object and make a reference to the original jQuery object
    var origForm = form.get(0);
    $.extend(true, form, props);
    form.form = $(origForm);
    form._fields = {};

    fieldSelector = (typeof fieldSelector == 'string') ? fieldSelector
        : "input, textarea, select";
    var fields = form.form.find(fieldSelector);
    if (fields) {
      for ( var i = 0; i < fields.length; i++) {
        var field = $(fields[i]);
        var fieldName = field.attr("name");
        var realFieldName = fieldName;
        if (!fieldName)
          continue;
        // deduce proper name
        var fieldNameParts = fieldName.replace(/[^a-z0-9]+/i, " ").split();
        if (fieldNameParts.length > 1) {
          for ( var n = 0; n < fieldNameParts.length; n++) {
            if (n == 0)
              fieldName = fieldNameParts[n].toLowerCase();
            else
              fieldName += fieldNameParts[n].substring(0, 1).toUperrCase()
                  + fieldNameParts[n].substring(1).toLowerCase();
          }
        }
        // skip fields that have been processed already
        if (typeof form._fields[fieldName] != 'undefined') {
          LOG.debug(">>> " + fieldName + " was already parsed");
          continue;
        }
        // add mapping of fieldName to field object
        LOG.debug(">>> FieldName: " + fieldName);
        form._fields[fieldName] = field;

        // setup accessors
        form.__defineGetter__("storableProps", form.getStorableProps);
        form.__defineSetter__("storableProps", form.setStorableProps);
        var methName = fieldName.substring(0, 1).toUpperCase()
            + fieldName.substring(1);
        if (field.attr("type") == "checkbox") {
          var t = "(function() {return function is" + methName
              + "() {return this.getField('" + realFieldName
              + "').attr('checked');}})()";
          form["is" + methName] = eval(t);
          form.__defineGetter__(fieldName, form["is" + methName]);
          t = "(function () {return function set"
              + methName
              + "(bool) {if (typeof bool != 'undefined' && bool) {this.getField('"
              + realFieldName
              + "').attr('checked', 'checked');} else {this.getField('"
              + fieldName + "').removeAttr('checked');} }})()";
          form["set" + methName] = eval(t);
          form.__defineSetter__(fieldName, form["set" + methName]);
        } else if (field.attr("type") == "radio") {
          var t = "(function() {return function is"
              + methName
              + "() {var checked = null; this.getField('"
              + realFieldName
              + "').each(function(index, element) {var $element = $(element); if ($element.attr('checked')) {checked = $element.val()}});"
              + "return checked;}})()";
          form["get" + methName] = eval(t);
          form.__defineGetter__(fieldName, form["get" + methName]);
          t = "(function () {return function set"
              + methName
              + "(val) {this.getField('"
              + realFieldName
              + "').each(function(index, element) {var $element = $(element);if ($element.val() == val) {$element.attr('checked', 'checked');} else {$element.removeAttr('checked');} });}})()";
          form["set" + methName] = eval(t);
          form.__defineSetter__(fieldName, form["set" + methName]);
        } else {
          var t = "(function() {return function get" + methName
              + "() {return this.getField('" + realFieldName + "').val();}})()";
          form["get" + methName] = eval(t);
          form.__defineGetter__(fieldName, form["get" + methName]);

          var t = "(function() {return function set" + methName
              + "(value) {this.getField('" + realFieldName
              + "').val(value);}})()";
          form["set" + methName] = eval(t);
          form.__defineSetter__(fieldName, form["set" + methName]);
        }
      }
    }
    return form;
  };

  Downsha.ModelForm.prototype._storableProps = null;

  Downsha.ModelForm.prototype.getField = function(fieldName) {
    return this.form.find("*[name=" + fieldName + "]");
  };
  Downsha.ModelForm.prototype.clear = function() {
    // TODO: clear form
  };
  Downsha.ModelForm.prototype.populateWith = function(object) {
    LOG.debug("Downsha.ModelForm.populateWith");
    if (typeof object == 'object' && object != null) {
      for ( var i in object) {
        if (typeof this._fields[i] != 'undefined') {
          this[i] = object[i];
        }
      }
    }
  };
  Downsha.ModelForm.prototype.setStorableProps = function(arrayOfPropNames) {
    var a = (arrayOfPropNames instanceof Array) ? arrayOfPropNames : new Array(
        arrayOfPropNames);
    this._storableProps = new Array();
    for ( var i = 0; i < a.length; i++) {
      if (typeof a[i] == 'string' && a[i].length > 0)
        this._storableProps.push(a[i]);
    }
  };
  Downsha.ModelForm.prototype.getStorableProps = function() {
    if (this._storableProps == null) {
      var fieldNames = new Array();
      for ( var i in this._fields) {
        fieldNames.push(i);
      }
      this._storableProps = fieldNames;
    }
    return this._storableProps;
  };
  Downsha.ModelForm.prototype.toStorable = function() {
    var props = this.storableProps;
    var storable = {};
    for ( var i = 0; i < props.length; i++) {
      storable[props[i]] = this[props[i]];
    }
    return storable;
  };
})();

/*
 * Downsha.ClipNoteForm
 * Downsha
 *
 * Created by Pavel Skaldin on 3/5/10
 * Copyright 2010 Downsha Corp. All rights reserved
 */
Downsha.ClipNoteForm = function ClipNoteForm(form) {
};

Downsha.ClipNoteForm.URL = "url";

Downsha.inherit(Downsha.ClipNoteForm, Downsha.AbstractNoteForm);
Downsha.ClipNoteForm.onForm = function(form, fieldNames) {
  form = Downsha.ClipNoteForm.parent.constructor.onForm.apply(this, [ form,
      fieldNames ]);
  form.__defineGetter__("url", form.getUrl);
  form.__defineSetter__("url", form.setUrl);
  return form;
};

Downsha.ClipNoteForm.prototype.urlFieldName = Downsha.ClipNoteForm.URL;

Downsha.ClipNoteForm.prototype.getUrl = function() {
  return this.getField(this.urlFieldName).val();
};
Downsha.ClipNoteForm.prototype.setUrl = function(url) {
  this.getField(this.urlFieldName).val(url);
};

Downsha.ClipNoteForm.prototype.getStorableProps = function() {
  var props = Downsha.ClipNoteForm.parent.getStorableProps.apply(this);
  props.push("url");
  return props;
};
Downsha.ClipNoteForm.prototype.populateWithNote = function(context, clipNote) {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.ClipNoteForm.populateWithNote");
  if (clipNote instanceof Downsha.ClipNote) {
    Downsha.ClipNoteForm.parent.populateWithNote.apply(this, [ context,
        clipNote ]);
    if (clipNote.notebookGuid) {
      this.notebookGuid = clipNote.notebookGuid;
    }
  }
};
Downsha.ClipNoteForm.prototype.asClipNote = function() {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.ClipNoteForm.asClipNote");
  var clipNote = new Downsha.ClipNote(this.toStorable());
  if (typeof LOG != 'undefined')
    LOG.debug(">>> CLIPNOTE: " + clipNote.toString());
  return clipNote;
};
Downsha.ClipNoteForm.prototype.getModelName = function() {
  return "Downsha.ClipNoteForm";
};
Downsha.ClipNoteForm.prototype.getStringDescription = function() {
  var superStr = Downsha.ClipNoteForm.parent.getStringDescription.apply(this);
  superStr += "; URL: " + this.url;
  return superStr;
};

/*
 * Downsha.ViewManager
 * Downsha
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */
(function() {
  var LOG = null;
  Downsha.ViewManager = function ViewManager() {
    this.__defineGetter__("quiet", this.isQuiet);
    this.__defineSetter__("quiet", this.setQuiet);
    LOG = Downsha.chromeExtension.logger;
  };

  Downsha.ViewManager._instance = null;
  Downsha.ViewManager.FORM_FIELD_ERROR_CLASS = "error";
  Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_CLASS = "error";
  Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_ELEMENT = "div";
  Downsha.ViewManager.PAGE_HEIGHT_DELTA = 0;

  Downsha.ViewManager.getInstance = function() {
    if (!this._instance) {
      this._instance = new Downsha.ViewManager();
    }
    return this._instance;
  };

  // instance variables
  Downsha.ViewManager.prototype.currentView = null;
  Downsha.ViewManager.prototype.globalMessage = null;
  Downsha.ViewManager.prototype.globalErrorMessage = null;
  // whether messages will be shown
  Downsha.ViewManager.prototype._quiet = false;

  Downsha.ViewManager.prototype.setQuiet = function(bool) {
    this._quiet = (bool) ? true : false;
  };
  Downsha.ViewManager.prototype.isQuiet = function() {
    return this._quiet;
  };
  Downsha.ViewManager.prototype.getEffectiveHeight = function() {
    LOG.debug("Downsha.ViewManager.getEffectiveHeight");
    var h = 0;
    $("body > div").each(
        function(i, element) {
          var e = $(element);
          if (e.css("display") != "none" && !e.hasClass("banner")
              && !e.hasClass("drawer") && !e.hasClass("drawerHandleTitle")) {
            // LOG.debug(">>> " + e.attr("tagName")
            // +
            // "#" + e.attr("id") + "." +
            // e.attr("class") + ": " + e.innerHeight());
            h += e.innerHeight();
          }
        });
    h = h - this.constructor.PAGE_HEIGHT_DELTA;
    if (h < 0)
      h = 0;
    return h;
  };
  Downsha.ViewManager.prototype.updateBodyHeight = function(height) {
    // LOG.debug("Downsha.ViewManager.updateBodyHeight");
    var h = (typeof height == 'number') ? height : this.getEffectiveHeight();
    /*
     * $("body").css( { height : h + "px" });
     */
    $("body").animate( {
      height : h + "px"
    }, 10);
    // LOG.debug(">>> BODY HEIGHT: " + h + " : " +
    // $("body").height());
  };

  Downsha.ViewManager.prototype.showBlock = function(block, dataArray) {
    block.show();
    if (dataArray instanceof Array)
      block.trigger("show", dataArray);
    else
      block.trigger("show");
    // this.updateBodyHeight();
  };
  Downsha.ViewManager.prototype.hideBlock = function(block, dataArray) {
    block.hide();
    if (dataArray instanceof Array)
      block.trigger("hide", dataArray);
    else
      block.trigger("hide");
    // this.updateBodyHeight();
  };

  Downsha.ViewManager.prototype.showView = function(viewNameOrBlock, data) {
    if (viewNameOrBlock instanceof jQuery) {
      var view = viewNameOrBlock;
    } else {
      var view = $("#" + viewNameOrBlock);
    }
    if (view.length == 0)
      return null;
    this.showBlock(view, [ data ]);
    return view;
  };

  Downsha.ViewManager.prototype.hideView = function(viewNameOrBlock) {
    if (viewNameOrBlock instanceof jQuery) {
      var view = viewNameOrBlock;
    } else {
      var view = $("#" + viewNameOrBlock);
    }
    if (view.length == 0 || view.css("display") == "none")
      return null;
    this.hideBlock(view);
    if (this.currentView && view.attr("id") == this.currentView.attr("id")) {
      this.currentView = null;
    }
    return view;
  };

  Downsha.ViewManager.prototype.switchView = function(viewName, data) {
    LOG.debug("Downsha.ViewManager.switchView");
    var visibleView = null;
    var view = (viewName instanceof jQuery) ? viewName : $("#" + viewName);
    if (this.currentView && this.currentView.attr("id") == view.attr("id")) {
      LOG.debug("Already showing...");
      return;
    }
    if (this.currentView) {
      this.hideView(this.currentView.attr("id"));
    }
    if (visibleView = this.showView(viewName, data)) {
      this.currentView = visibleView;
    }
    return visibleView;
  };

  Downsha.ViewManager.prototype.switchElements = function(a, b) {
    a.hide();
    b.show();
  };

  Downsha.ViewManager.prototype.wait = function(msg) {
    var spinnerBlock = $("#spinner");
    spinnerBlock.find("#spinnerMessage").html(msg);
    spinnerBlock.show();
  };

  Downsha.ViewManager.prototype.clearWait = function() {
    var spinnerBlock = $("#spinner");
    spinnerBlock.hide();
  };

  Downsha.ViewManager.prototype.showMessage = function(message) {
    if (this.quiet)
      return;
    if (this.globalMessage) {
      this.globalMessage.addMessage(message);
      this.globalMessage.show();
    }
  };
  Downsha.ViewManager.prototype.hideMessage = function(message) {
    if (this.globalMessage) {
      this.globalMessage.removeMessage(message);
      if (this.globalMessage.length() > 0) {
        this.globalMessage.show();
      } else {
        this.globalMessage.hide();
      }
    }
  };
  Downsha.ViewManager.prototype.hideAllMessages = function() {
    if (this.globalMessage) {
      this.globalMessage.removeAllMessages();
      this.globalMessage.hide();
    }
  };

  Downsha.ViewManager.prototype.extractErrorMessage = function(e,
      defaultMessage) {
    LOG.debug("Downsha.ViewManager.extractErrorMessage");
    var msg = (typeof defaultMessage != 'undefined') ? defaultMessage : null;
    LOG
        .debug("Error: "
            + (typeof e == 'object' && e != null && typeof e["toString"] == 'function') ? e
            .toString()
            : e);
    if (e instanceof Downsha.DownshaError
        && typeof e.errorCode == 'number'
        && typeof e.parameter == 'string'
        && this.getLocalizedMessage("EDAMError_" + e.errorCode + "_"
            + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"))) {
      LOG
          .debug("Got parameterized localized message for Downsha.DownshaError");
      msg = this.getLocalizedMessage("EDAMError_" + e.errorCode + "_"
          + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"));
    } else if (e instanceof Downsha.EDAMResponseException
        && typeof e.errorCode == 'number'
        && this.getLocalizedMessage("EDAMResponseError_" + e.errorCode)) {
      LOG.debug("Got localized message for Downsha.EDAMResponseException");
      if (typeof e.parameter == 'string') {
        msg = this.getLocalizedMessage("EDAMResponseError_" + e.errorCode,
            e.parameter);
      } else {
        msg = this.getLocalizedMessage("EDAMResponseError_" + e.errorCode);
      }
    } else if (e instanceof Downsha.DownshaError
        && typeof e.errorCode == 'number'
        && this.getLocalizedMessage("EDAMError_" + e.errorCode)) {
      LOG.debug("Got localized message for Downsha.DownshaError");
      if (typeof e.parameter == 'string') {
        msg = this.getLocalizedMessage("EDAMError_" + e.errorCode, e.parameter);
      } else {
        msg = this.getLocalizedMessage("EDAMError_" + e.errorCode);
      }
    } else if (e instanceof Downsha.DownshaError
        && typeof e.message == 'string') {
      LOG.debug("Resorting to message included in the error");
      msg = e.message;
    } else if ((e instanceof Error || e instanceof Error)
        && typeof e.message == 'string') {
      LOG.debug("Resorting to standard message");
      msg = e.message;
    } else if (typeof e == 'string') {
      LOG.debug("Error is a string, so using that...");
      msg = e;
    }
    return msg;
  };

  Downsha.ViewManager.prototype.showError = function(error) {
    LOG.debug("Downsha.ViewManager.showError");
    if (this.quiet)
      return;
    var msg = this.extractErrorMessage(error, this
        .getLocalizedMessage("UnknownError"));
    if (msg != null) {
      this.globalErrorMessage.message = msg;
      this.globalErrorMessage.show();
    }
  };
  Downsha.ViewManager.prototype.showErrors = function(errors) {
    LOG.debug("Downsha.ViewManager.showErrors");
    if (this.quiet)
      return;
    var errs = (errors instanceof Array) ? errors : [ errors ];
    if (errs.length == 1) {
      this.showError(errs[0]);
      return;
    }
    var errorTitle = this.getLocalizedMessage("multipleErrorsTitle");
    var messageList = $("<ul></ul>");
    for ( var i = 0; i < errs.length; i++) {
      var msg = this.extractErrorMessage(errors[i]);
      if (msg != null)
        messageList.append("<li>" + msg + "</li>");
    }
    if (messageList.children().length > 0) {
      var errorBlock = $("<div class='multiErrorTitle'></div>");
      errorBlock.append(errorTitle);
      errorBlock.append(messageList);
      this.globalErrorMessage.message = errorBlock;
      this.globalErrorMessage.show();
    }
  };
  Downsha.ViewManager.prototype.hideError = function() {
    this.globalErrorMessage.hide();
  };
  Downsha.ViewManager.prototype.hideErrors = function() {
    this.globalErrorMessage.hide();
  };
  Downsha.ViewManager.prototype.showHttpError = function(xhr, textStatus,
      error) {
    LOG.debug("Downsha.ViewManager.showHttpError");
    if (this.quiet)
      return;
    var msg = this.getLocalizedHttpErrorMessage(xhr, textStatus, error);
    this.showError(new Error(msg));
  };
  Downsha.ViewManager.prototype.getLocalizedHttpErrorMessage = function(xhr,
      textStatus, error) {
    LOG.debug("Downsha.ViewManager.getLocalizedHttpErrorMessage");
    var msg = this.getLocalizedMessage("Error_HTTP_Transport", [
        ("" + xhr.status), ((typeof error == 'string') ? error : "") ]);
    return msg;
  };
  Downsha.ViewManager.prototype.getLocalizedMessage = function(messageKey,
      params) {
    if (typeof chrome != 'undefined'
        && typeof chrome.i18n.getMessage == 'function') {
      return chrome.i18n.getMessage(messageKey, params);
    } else {
      return messageKey;
    }
  };
  Downsha.ViewManager.prototype.showFormErrors = function(form, errors,
      callback) {
    LOG.debug("Downsha.ViewManager.showFormErrors(" + (typeof form) + ", "
        + (typeof errors) + ")");
    if (this.quiet)
      return;
    var f = (form instanceof jQuery) ? form : $(form);
    for ( var i = 0; i < errors.length; i++) {
      var e = errors[i];
      var msg = this.extractErrorMessage(e);
      LOG.debug(e.toString() + " => " + msg);
      if (typeof callback == 'function') {
        callback(((typeof e.parameter == 'string') ? e.parameter : null), msg);
      } else {
        var field = null;
        if (typeof e.parameter == 'string' && msg != null) {
          field = f.find("[name=" + e.parameter + "]");
          if (field.length == 0) {
            field = null;
          }
        }
        if (field) {
          this.showFormFieldErrors(field, msg);
        } else {
          this.showError(msg);
        }
      }
    }
  };
  Downsha.ViewManager.prototype.showFormFieldErrors = function(field,
      errorMessage) {
    LOG.debug("Downsha.ViewManager.showFormFieldError(" + field + ", "
        + errorMessage + ")");
    if (this.quiet)
      return;
    if (typeof field == 'undefined')
      return;
    if (!(field instanceof jQuery))
      field = $(field);
    if (!field.hasClass(this.constructor.FORM_FIELD_ERROR_CLASS))
      field.addClass(this.constructor.FORM_FIELD_ERROR_CLASS);
    if (field.next("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).length == 0) {
      field.after($("<" + this.constructor.FORM_FIELD_ERROR_MESSAGE_ELEMENT
          + " class='" + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS + "'>"
          + errorMessage + "</"
          + this.constructor.FORM_FIELD_ERROR_MESSAGE_ELEMENT + ">"));
    } else {
      field.next("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).html(
          errorMessage);
    }
  };
  Downsha.ViewManager.prototype.clearFormArtifacts = function(form) {
    LOG.debug("Downsha.ViewManager.clearFormArtifacts");
    if (typeof form == 'undefined')
      return;
    if (!(form instanceof jQuery))
      form = $(form);
    LOG.debug("Removing error messages...");
    form.find("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).remove();
    LOG.debug("Removing error classes from fields");
    form.find("." + this.constructor.FORM_FIELD_ERROR_CLASS).removeClass(
        this.constructor.FORM_FIELD_ERROR_CLASS);
    LOG.debug("Done...");
  };

  /**
   * SimpleMessage
   * 
   * @param containerSelector
   */
  Downsha.ViewManager.SimpleMessage = function(containerSelector) {
    this.initialize(containerSelector);
  };
  Downsha.ViewManager.SimpleMessage.MESSAGE_CLASS = "simpleMessage";
  Downsha.ViewManager.SimpleMessage.prototype._container = null;
  Downsha.ViewManager.SimpleMessage.prototype._message = null;
  Downsha.ViewManager.SimpleMessage.prototype.initialize = function(
      containerSelector) {
    this.__defineGetter__("container", this.getContainer);
    this.__defineGetter__("message", this.getMessage);
    this.__defineSetter__("message", this.setMessage);
    if (typeof containerSelector != 'undefined' && containerSelector) {
      this._container = (containerSelector instanceof jQuery) ? containerSelector
          : $(containerSelector);
    }
  };
  Downsha.ViewManager.SimpleMessage.prototype.getContainer = function() {
    return this._container;
  };
  Downsha.ViewManager.SimpleMessage.prototype.setMessage = function(message) {
    this._message = message;
  };
  Downsha.ViewManager.SimpleMessage.prototype.getMessage = function() {
    return this._message;
  };
  Downsha.ViewManager.SimpleMessage.prototype.show = function() {
    if (this.message) {
      var msgBlock = this.createMessageBlock();
      msgBlock.append(this.message);
      this._container.empty();
      this._container.append(msgBlock);
    } else {
      this._container.empty();
    }
    this._container.show();
  };
  Downsha.ViewManager.SimpleMessage.prototype.hide = function() {
    this._container.hide();
  };
  Downsha.ViewManager.SimpleMessage.prototype.createMessageBlock = function() {
    return $("<div class='" + this.getMessageClass() + "'></div>");
  };
  Downsha.ViewManager.SimpleMessage.prototype.getMessageClass = function() {
    return Downsha.ViewManager.SimpleMessage.MESSAGE_CLASS;
  };

  /**
   * StackableMessage
   * 
   * @param containerSelector
   */
  Downsha.ViewManager.StackableMessage = function(containerSelector) {
    this.initialize(containerSelector);
  };
  Downsha.inherit(Downsha.ViewManager.StackableMessage,
      Downsha.ViewManager.SimpleMessage);
  Downsha.ViewManager.StackableMessage.MESSAGE_CLASS = "stackableMessage";
  Downsha.ViewManager.StackableMessage.prototype._messageStack = new Array();
  Downsha.ViewManager.StackableMessage.prototype.initialize = function(
      containerSelector) {
    Downsha.ViewManager.StackableMessage.parent.initialize.apply(this,
        arguments);
  };
  Downsha.ViewManager.StackableMessage.prototype.getMessage = function() {
    if (this._messageStack.length > 0)
      return this._messageStack[(this._messageStack.length - 1)];
    else
      return null;
  };
  Downsha.ViewManager.StackableMessage.prototype.setMessage = function(message) {
    this._messageStack = new Array();
    this.addMessage(message);
  };
  Downsha.ViewManager.StackableMessage.prototype.addMessage = function(msg) {
    this._messageStack.push(this._describeMessage(msg));
  };
  Downsha.ViewManager.StackableMessage.prototype.removeMessage = function(msg) {
    var msgDescription = this._describeMessage(msg);
    for ( var i = this._messageStack.length - 1; i >= 0; i--) {
      if (this._messageStack[i] == msgDescription) {
        this._messageStack.splice(i, 1);
        break;
      }
    }
  };
  Downsha.ViewManager.StackableMessage.prototype.removeAllMessages = function() {
    this._messageStack = new Array();
  };
  Downsha.ViewManager.StackableMessage.prototype.length = function() {
    return this._messageStack.length;
  };
  Downsha.ViewManager.StackableMessage.prototype._describeMessage = function(
      msg) {
    var str = "";
    if (typeof msg == 'string') {
      str = msg;
    } else if (msg instanceof jQuery) {
      msg.each(function(i, e) {
        str += this._describeMessage(e);
      });
    } else if (msg instanceof Text) {
      str += msg;
    } else if (msg instanceof HTMLElement) {
      str += msg.innerHTML;
    }
    return str;
  };
  Downsha.ViewManager.StackableMessage.prototype.getMessageClass = function() {
    return Downsha.ViewManager.StackableMessage.parent.getMessageClass
        .apply(this)
        + " " + Downsha.ViewManager.StackableMessage.MESSAGE_CLASS;
  };
})();

(function() {
  var LOG = null;
  Downsha.ChromeOptions = function ChromeOptions() {
    LOG = Downsha.chromeExtension.logger;
    this.init();
  };
  Downsha.ChromeOptions.SUBMIT_MESSAGE_TIMEOUT = 1000;
  Downsha.ChromeOptions.prototype.optionsForm = null;
  Downsha.ChromeOptions.prototype.options = null;
  Downsha.ChromeOptions.prototype.optionsValidator = null;
  Downsha.ChromeOptions.prototype.pageOptions = {};
  Downsha.ChromeOptions.prototype.init = function() {
    this.initPageOptions();
    this.initOptions();
    this.initViews();
    this.initForms();
    this.initKonami();
  };
  Downsha.ChromeOptions.prototype.initPageOptions = function() {
    var hash = document.location.search;
    function getHashValue(val) {
      if (typeof val == 'undefined' || val == null) {
        return null;
      } else if (val == "0") {
        return 0;
      } else if (parseInt(val) > 0) {
        return parseInt(val);
      } else if (val.toLowerCase() == "true") {
        return true;
      } else if (val.toLowerCase() == "false") {
        return false;
      } else {
        return val;
      }
    }
    if (typeof hash == 'string' && hash.length > 0) {
      hash = hash.substring(1);
      var parts = hash.split("&");
      for ( var i = 0; i < parts.length; i++) {
        var kv = parts[i].split("=", 2);
        this.pageOptions[kv[0]] = getHashValue(kv[1]);
      }
    }
  };
  Downsha.ChromeOptions.prototype.initOptions = function() {
    LOG.debug("Downsha.Options.initOptions");
    try {
      if (Downsha.context.store
          && Downsha.context.options instanceof Downsha.Options) {
        this.options = Downsha.context.options;
        LOG.level = options.debugLevel;
      }
    } catch (e) {
      LOG.warn("Could not retrieve options");
    }
  };

  Downsha.ChromeOptions.prototype.initForms = function() {
    LOG.debug("Downsha.Options.initForms");
    $.validator.addMethod("serviceProto",
        Downsha.DownshaContext.isValidServiceProto, chrome.i18n
            .getMessage("invalidExpression"));
    $.validator.addMethod("formatServiceProto", function(value, element) {
      $(element).val(
          Downsha.DownshaContext.formatServiceProto(value).toLowerCase());
      return true;
    }, chrome.i18n.getMessage("invalidExpression"));
    var form = $("form[name=optionsForm]");
    var self = this;
    var opts = {
      submitHandler : function(form) {
        self.submitOptionsForm();
      },
      errorClass : Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_CLASS,
      errorElement : "div",
      onkeyup : false,
      onfocusout : false,
      onsubmit : true,
      rules : {
        insecureProto : {
          required : true,
          formatServiceProto : true,
          serviceProto : true
        },
        secureProto : {
          required : true,
          formatServiceProto : true,
          serviceProto : true
        },
        serviceDomain : {
          required : true,
          minlength : Downsha.Constants.Limits.SERVICE_DOMAIN_LEN_MIN,
          maxlength : Downsha.Constants.Limits.SERVICE_DOMAIN_LEN_MAX
        }
      },
      messages : {
        insecureProto : {
          serviceProto : chrome.i18n.getMessage("invalidServiceProto")
        },
        secureProto : {
          serviceProto : chrome.i18n.getMessage("invalidServiceProto")
        },
        serviceDomain : {
          minlength : chrome.i18n.getMessage("valueTooShort", [
              chrome.i18n.getMessage("options_serviceDomain"),
              Downsha.Constants.Limits.SERVICE_DOMAIN_LEN_MIN ]),
          maxlength : chrome.i18n.getMessage("valueTooLong", [
              chrome.i18n.getMessage("options_serviceDomain"),
              Downsha.Constants.Limits.SERVICE_DOMAIN_LEN_MAX ])
        }
      }
    };
    LOG.debug("Setting up validation on login form");
    this.optionsValidator = form.validate(opts);
    LOG.debug("OPTIONSVALIDATOR: " + this.optionsValidator);
    this.form = form.observeform( {
      onSubmit : function() {
        LOG.debug(">>>>>>> "
            + (self.optionsValidator && self.optionsValidator
                .numberOfInvalids() == 0));
        return (self.optionsValidator && self.optionsValidator
            .numberOfInvalids() == 0);
      }
    });
    this.optionsForm = Downsha.ModelForm.onForm(form);
    this.populateOptionsForm();
  };

  Downsha.ChromeOptions.prototype.initKonami = function() {
    Downsha.Konami.start(function() {
      $("#developerContainer").toggle();
    }, window);
  };

  Downsha.ChromeOptions.prototype.initViews = function() {
    LOG.debug("Downsha.Options.initViews");
    if (this.isDeveloperMode()) {
      $("#developerContainer").show();
    } else {
      $("#developerContainer").hide();
    }
    if (Downsha.context.isInSync()
        && Downsha.context.notebooks instanceof Array
        && Downsha.context.notebooks.length > 0) {
      var notebooks = Downsha.context.notebooks.sort(function(a, b) {
        return a.name.toLowerCase() > b.name.toLowerCase();
      });
      var notebookGuids = $("#clipNotebookGuid");
      for ( var i = 0; i < notebooks.length; i++) {
        var n = notebooks[i];
        var nName = $("<div/>").text(n.name).html();
        notebookGuids.append($("<option value='" + n.guid + "'>" + nName
            + "</option>"));
      }
      $("#clipNotebookSelect").show();
    } else {
      $("#clipNotebookSelect").hide();
    }
  };
  Downsha.ChromeOptions.prototype.isDeveloperMode = function() {
    if (typeof this.pageOptions['developerMode'] != 'undefined') {
      return (this.pageOptions['developerMode']) ? true : false;
    } else if (this.options) {
      return this.options.developerMode;
    }
    return false;
  };
  Downsha.ChromeOptions.prototype.populateOptionsForm = function() {
    if (this.options) {
      this.optionsForm.populateWith(this.options);
      if (this.options.noteSortOrder) {
        this.optionsForm.noteSortOrder = JSON
            .stringify(this.options.noteSortOrder);
      }
      var preferredNotebook = Downsha.context.getPreferredNotebook();
      if (preferredNotebook) {
        this.optionsForm.clipNotebookGuid = preferredNotebook.guid;
      }
    }
  };
  Downsha.ChromeOptions.prototype.updateOptions = function() {
    LOG.debug("Downsha.Options.updateOptions");
    try {
      if (this.optionsForm) {
        var o = this.optionsForm.toStorable();
        o.noteSortOrder = new Downsha.NoteSortOrder(JSON
            .parse(o.noteSortOrder));
        LOG.debug(">>> optionsForm: " + JSON.stringify(o));
        this.options = new Downsha.Options(Downsha.context, o);
        LOG.debug(">>> new options: " + JSON.stringify(this.options));
        this.options.apply();
        Downsha.context.options = this.options;
        this.populateOptionsForm();
        new Downsha.RequestMessage(
            Downsha.Constants.RequestType.OPTIONS_UPDATED).send();
        return true;
      } else {
        LOG.error("Cannot find options form");
      }
    } catch (e) {
      LOG.error("Could not save options: " + e.message);
    }
    return false;
  };
  Downsha.ChromeOptions.prototype.resetOptions = function() {
    LOG.debug("Downsha.Options.resetOptions");
    this.options.reset();
    LOG.debug(">>> Clean options: " + JSON.stringify(this.options));
    this.populateOptionsForm();
    return this.updateOptions();
  };
  Downsha.ChromeOptions.prototype.showSubmitMessage = function(msg) {
    var msgBlock = $("#submitMessage");
    msgBlock.html(msg);
    msgBlock.removeClass();
    msgBlock.addClass("success");
    msgBlock.show();
    this.hideSubmitMessage();
  };
  Downsha.ChromeOptions.prototype.showSubmitError = function(msg) {
    var msgBlock = $("#submitMessage");
    msgBlock.html(msg);
    msgBlock.removeClass();
    msgBlock.addClass("error");
    msgBlock.show();
    this.hideSubmitMessage();
  };
  Downsha.ChromeOptions.prototype.hideSubmitMessage = function() {
    setTimeout(function() {
      $("#submitMessage").fadeOut(300);
    }, Downsha.ChromeOptions.SUBMIT_MESSAGE_TIMEOUT);
  };
  Downsha.ChromeOptions.prototype.submitOptionsForm = function() {
    if (this.optionsValidator.numberOfInvalids() > 0) {
      LOG.debug("Not submitting options form cuz it has errors");
      return false;
    }
    LOG.info("Submitting options form");
    if (this.updateOptions()) {
      this.showSubmitMessage(chrome.i18n.getMessage("options_formSaved"));
    } else {
      this.showSubmitError(chrome.i18n.getMessage("options_failedToSave"));
    }
    Downsha.Utils.updateBadge(Downsha.context);
    chrome.tabs.getSelected(null, function(tab) {
      Downsha.Utils.updateBadge(Downsha.context, tab.id);
    });
    // preventing actual form submit
    return false;
  };
  Downsha.ChromeOptions.prototype.resetOptionsForm = function() {
    LOG.debug("Resetting options form");
    if (this.resetOptions()) {
      this.showSubmitMessage(chrome.i18n.getMessage("options_formReset"));
    } else {
      this.showSubmitError(chrome.i18n.getMessage("options_failedToSave"));
    }
    // preventing actual form submit
    return false;
  };
  Downsha.ChromeOptions.prototype.logout = function() {
    LOG.debug("Options.logout");
    LOG.info("Logging out...");
    var self = this;
    var localLogout = function() {
      Downsha.ViewManager.clearWait();
      new Downsha.RequestMessage().send(Downsha.Constants.RequestType.LOGOUT,
          {
            resetOptions : false
          });
    };
    var logoutProc = Downsha.context.getRemote().logout(
        function(response, textStatus) {
          if (response.isResult()) {
            LOG.info("Successfully logged out");
          } else if (result.isError()) {
            LOG.warn("Soft error logging out");
          } else {
            LOG.error("Got garbage response when tried to logout");
          }
          localLogout();
        },
        function(xhr, textStatus, error) {
          if (xhr && xhr.readyState == 4) {
            LOG.error("Failed to log out due to transport errors (status: "
                + xhr.status + ")");
          } else if (xhr) {
            LOG.error("Failed to log out due to transport errors (readyState: "
                + xhr.readyState + ")");
          } else {
            LOG.error("Failed to log out due to unknown transport error");
          }
          localLogout();
        }, true);
  };
})();

/**
 * ChromePopup - used as the main UI element for the extension. All user
 * operations are done thru it.
 */
(function() {
  var LOG = null;
  Downsha.ChromePopup = function ChromePopup(window, tab) {
    LOG = Downsha.chromeExtension.logger;
    this.init(window, tab);
  };

  /** ************** Constants *************** */
  Downsha.ChromePopup.DEFAULT_TIMEOUT = 300;
  Downsha.ChromePopup.AUTO_SAVE_DELAY = 600;
  Downsha.ChromePopup.VIEW_TRANSITION_TIME = 100;
  Downsha.ChromePopup.NOTELIST_PAYLOAD_SIZE = 20;
  Downsha.ChromePopup.NOTELIST_PAGE_SIZE = 6;
  Downsha.ChromePopup.NOTELIST_ITEM_HEIGHT = 102;
  Downsha.ChromePopup.NOTELIST_FETCH_TIMEOUT = 400;
  Downsha.ChromePopup.NOTELIST_SCROLLTO_DELAY = 200;
  Downsha.ChromePopup.CLIP_PAGE_CONTENT_TIMEOUT = 10000;
  Downsha.ChromePopup.LOADING_THUMB_IMG_URL = "/images/spinner.gif";
  // Downsha.ChromePopup.SIMPLE_DATE_FORMAT = "M/d/yy HH:mm a";
  Downsha.ChromePopup.SIMPLE_DATE_FORMAT = "M/d/yy";
  Downsha.ChromePopup.THUMBNAIL_SIZE = 100;
  Downsha.ChromePopup.THUMBNAIL_MIN_SIZE = 50;
  Downsha.ChromePopup.SNIPPET_MAX_LENGTH = 150;
  Downsha.ChromePopup.ALL_NOTES_VIEW_NAME = "allNotes";
  Downsha.ChromePopup.SITE_MEMORY_VIEW_NAME = "siteMemory";
  Downsha.ChromePopup.MIN_ARTICLE_RATIO = 1 / 16;
  Downsha.ChromePopup.MIN_ARTICLE_AREA = 30000;
  Downsha.ChromePopup.MAX_ARTICLE_XOFFSET_RATIO = 0.6;
  /**
   * Indicates whether to allow multiple selection of auto-complete things when
   * typing query for note search
   */
  Downsha.ChromePopup.NOTELIST_AC_MULTIPLE = false;
  Downsha.ChromePopup.QUICK_NOTE_VIEW_DEFAULTS = {
    clipNote : null,
    fullPageEnabled : true,
    notebookGuid : null
  };
  Downsha.ChromePopup.POPUP_STATUS_CODES = {
    STARTUP : 0,
    STARTED : 1
  };
  Downsha.ChromePopup.prototype.CLIP_ACTION_MAP = {};
  Downsha.ChromePopup.prototype.CLIP_ACTION_MAP[Downsha.Options.CLIP_ACTION_OPTIONS.ARTICLE] = "CLIP_ACTION_ARTICLE";
  Downsha.ChromePopup.prototype.CLIP_ACTION_MAP[Downsha.Options.CLIP_ACTION_OPTIONS.FULL_PAGE] = "CLIP_ACTION_FULL_PAGE";
  Downsha.ChromePopup.prototype.CLIP_ACTION_MAP[Downsha.Options.CLIP_ACTION_OPTIONS.URL] = "CLIP_ACTION_URL";
  Downsha.ChromePopup.SOURCE_URL_MAX_DISPLAY_LENGTH = 32;
  Downsha.ChromePopup.SEARCH_RESULT_SPEC = new Downsha.NotesMetadataResultSpec(
      {
        includeTitle : true,
        includeCreated : true,
        includeUpdated : true,
        includeUpdateSequenceNum : true,
        includeNotebookGuid : true,
        includeAttributes : true,
        includeLargestResourceMime : true,
        includeLargestResourceSize : true
      });

  /** ************** Instance Variables *************** */
  Downsha.ChromePopup.prototype.window = null;
  Downsha.ChromePopup.prototype.tab = null;
  Downsha.ChromePopup.prototype.viewManager = null;
  Downsha.ChromePopup.prototype.aborted = false;
  Downsha.ChromePopup.prototype.options = null;
  Downsha.ChromePopup.prototype.loginValidator = null;
  Downsha.ChromePopup.prototype.quickNoteValidator = null;
  Downsha.ChromePopup.prototype.quickNoteForm = null;
  Downsha.ChromePopup.prototype.notesSearchForm = null;
  Downsha.ChromePopup.prototype.loginProc = null;
  Downsha.ChromePopup.prototype.findProc = null;
  Downsha.ChromePopup.prototype.findContextProc = null;
  Downsha.ChromePopup.prototype.noteList = null;
  Downsha.ChromePopup.prototype.searchQueryPopulated = false;
  Downsha.ChromePopup.prototype.noteListScrollTimer = null;
  Downsha.ChromePopup.prototype.quickNoteSubmitWait = null;
  Downsha.ChromePopup.prototype.notesTabbedView = null;
  Downsha.ChromePopup.prototype.noteContextFilter = null;
  Downsha.ChromePopup.prototype.searchHelper = null;
  Downsha.ChromePopup.prototype._eventHandler = null;
  Downsha.ChromePopup.prototype._notebooks = null;
  Downsha.ChromePopup.prototype._tags = null;
  Downsha.ChromePopup.prototype._searches = null;
  Downsha.ChromePopup.prototype._previewAdjustmentEnabled = false;
  Downsha.ChromePopup.prototype.popupStatus = Downsha.ChromePopup.POPUP_STATUS_CODES.STARTUP;

  /** ************** Initialization *************** */
  Downsha.ChromePopup.prototype.init = function(window, tab) {
    LOG.debug("Initializing...");
    this.window = window;
    this.tab = tab;
    this.initOptions();
    this.initEventHandler();
    this.initListeners();
    this.initViewManager();
    this.localizePopup();
    this.initSearchHelper();
    this.initForms();
    this.initViews();
    LOG.debug("Clipper initialized...");
  };
  Downsha.ChromePopup.prototype.initOptions = function() {
    LOG.debug("Popup.initOptions");
    this.options = Downsha.context.options;
    if (this.options instanceof Downsha.Options) {
      LOG.level = this.options.debugLevel;
    }
  };
  Downsha.ChromePopup.prototype.initSearchHelper = function() {
    this.searchHelper = chrome.extension.getBackgroundPage().Downsha.SearchHelper
        .getInstance(this.tab.id);
  };
  Downsha.ChromePopup.prototype.initEventHandler = function() {
    this._eventHandler = new Downsha.EventHandler(this);
    this._eventHandler.defaultHandler = function() {
        LOG.info("Popup ignores request via defaultHandler...");
    };
    this._eventHandler.add(
        Downsha.Constants.RequestType.CONTENT_SCRIPT_LOAD_TIMEOUT,
        this.handleCancelPageClipTimer);
    this._eventHandler.add(Downsha.Constants.RequestType.PAGE_INFO,
        this.handlePageInfo);
  };
  Downsha.ChromePopup.prototype.initListeners = function() {
    LOG.debug("Popup.initListeners");
    var self = this;
    // make sure we instantly save changes to state
    $(window).bind(Downsha.AppState.CHANGE_EVENT_NAME,
        function(event, newState) {
          if (newState instanceof Downsha.AppState) {
            Downsha.context.setState(newState);
          }
        });
    chrome.extension.onRequest.addListener(function(request, sender,
        sendResponse) {
      self.handleRequest(request, sender, sendResponse);
    });
  };
  Downsha.ChromePopup.prototype.initViewManager = function() {
    LOG.debug("Popup.initViewManager");
    this.viewManager = Downsha.ViewManager.getInstance();
    this.viewManager.globalErrorMessage = new Downsha.ViewManager.SimpleMessage(
        $("#globalErrorMessage"));
    this.viewManager.globalMessage = new Downsha.ViewManager.StackableMessage(
        $("#globalMessage"));
  };
  Downsha.ChromePopup.prototype.initViews = function() {
    LOG.debug("Popup.initViews");
    this.bindViews();
  };
  Downsha.ChromePopup.prototype.initForms = function() {
    LOG.debug("Popup.initForms");
    this.quickNoteForm = Downsha.ClipNoteForm
        .onForm($("form[name=quickNoteForm]"));
    this.notesSearchForm = Downsha.ModelForm
        .onForm($("form[name=notesSearchForm]"));
    this.bindForms();
  };

  /** ************** Listeners and Request Handlers *************** */
  Downsha.ChromePopup.prototype.handleRequest = function(request, sender,
      sendResponse) {
    LOG.debug("Popup.handleRequest");
    if (typeof request == 'object' && request != null) {
      var requestMessage = Downsha.RequestMessage.fromObject(request);
      if (!requestMessage.isEmpty()) {
        this._eventHandler.handleEvent(requestMessage.code, [ request, sender,
            sendResponse ]);
      }
    }
  };

  Downsha.ChromePopup.prototype.handlePageClipSuccess = function(request,
      sender, sendResponse) {
    this.viewManager.clearWait();
    LOG.info("Popup.handlePageClipSuccess");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var clipNote = new Downsha.ClipNote(requestMessage.message);
    LOG.debug("Popup received request from extension with clipNote: "
        + clipNote.toString());
    var options = Downsha.context.options;
    var self = this;
    if (clipNote.fullPage) {
      LOG.info("Prompting for filing info for full page clip");
      // clipNote.fullPage = false;
      var viewOpts = {
        clipNote : clipNote
      };
      this.viewManager.switchView("quickNoteView", viewOpts);
    } else {
      LOG.warn("Igoring request message (" + requestMessage.code
          + ") because it's not a full page clip");
    }
  };
  Downsha.ChromePopup.prototype.handlePageClipContentSuccess = function(
      request, sender, sendResponse) {
    LOG.debug("Popup.handlePageClipContentSuccess");
    var self = this;
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var clipNote = new Downsha.ClipNote(requestMessage.message);
    LOG.debug("Clip length: " + clipNote.length);
    if (clipNote.fullPage && this.quickNoteForm) {
      LOG.debug("Setting retrieved content on quickNoteForm");
      this.quickNoteForm.content = clipNote.content;
      if (this.quickNoteSubmitWait == null
          && this.quickNoteForm.form.hasClass("changed")) {
        LOG.debug("Auto-saving since form was modified");
        this.autoSaveQuickNote();
      } else if (this.quickNoteSubmitWait != null) {
        clearTimeout(this.quickNoteSubmitWait);
        this.quickNoteSubmitWait = null;
        this.submitQuickNoteForm();
      }
    } else if (!clipNote.fullPage) {
      LOG.info("Submitting partial-page clip to the server");
      var preferredNotebook = Downsha.context.getPreferredNotebook();
      if (preferredNotebook instanceof Downsha.Notebook) {
        clipNote.notebookGuid = preferredNotebook.guid;
      }
      this
          .remoteClipNote(
              clipNote,
              function(response, textStatus) {
                var note = (typeof response.result["note"] != 'undefined' && response.result.note instanceof Downsha.BasicNote) ? response.result.note
                    : null;
                if (note) {
                  LOG
                      .info("Received successful response from the server after clipping the note");
                  self.viewManager.switchView("fileView", {
                    "note" : note
                  });
                } else {
                  LOG
                      .warn("Cannot recognize a note in response after clipping the note: "
                          + note);
                  self.viewManager.showError(new Error(
                      Downsha.EDAMResponseErrorCode.INVALID_RESPONSE));
                  self.viewManager.switchView("quickNoteView", {
                    "clipNote" : clipNote
                  });
                }
              }, function(response, textStatus) {
                LOG.error("Failed to clip selection");
                if (response.errors.length > 1)
                  self.viewManager.showErrors(response.errors);
                else
                  self.viewManager.showError(response.errors[0]);
                // self.dismissPopup();
            });
    } else {
      LOG.warn("Igoring request message (" + requestMessage.code
          + ") because it doesn't represent a clip that we can deal with");
    }
  };
  Downsha.ChromePopup.prototype.handlePageClipContentTooBig = function(
      request, sender, sendResponse) {
    LOG.debug("Popup.handlePageClipContentTooBig");
    var viewManager = Downsha.ViewManager.getInstance();
    viewManager.clearWait();
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var clipNote = new Downsha.ClipNote(requestMessage.message);
    if (this.quickNoteForm.fullPage || !clipNote.fullPage) {
      viewManager.showError(chrome.i18n.getMessage("fullPageClipTooBig"));
    }
    this.recoverFromPageClipContentFailure();
  };
  Downsha.ChromePopup.prototype.handlePageClipContentFailure = function(
      request, sender, sendResponse) {
    LOG.debug("Popup.handlePageClipContentFailure");
    var viewManager = Downsha.ViewManager.getInstance();
    viewManager.clearWait();
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    viewManager.showError((requestMessage.message) ? requestMessage.message
        : chrome.i18n.getMessage("fullPageClipFailure"));
    this.recoverFromPageClipContentFailure();
  };
  Downsha.ChromePopup.prototype.recoverFromPageClipContentFailure = function() {
    if (this.quickNoteForm) {
      this.quickNoteForm.fullPage = false;
      this.quickNoteForm.disableFullPage();
    }
    // clear submit timeout
    if (this.quickNoteSubmitWait != null) {
      clearTimeout(this.quickNoteSubmitWait);
      this.quickNoteSubmitWait = null;
    }
  };
  Downsha.ChromePopup.prototype.handlePageClipFailure = function(request,
      sender, sendResponse) {
    LOG.info("Popup received request with failed page clip");
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    var viewManager = Downsha.ViewManager.getInstance();
    viewManager.clearWait();
    if (requestMessage.message) {
      viewManager.showError(requestMessage.message);
    }
    // check if we can at least capture the URL of the current tab,
    // and if so, fake a Downsha.ClipNote
    var self = this;
    if (!self.tab.url || self.tab.url.indexOf("http") != 0) {
      if (!self.tab.url) {
        LOG.info("Tried to clip page without a URL");
      } else {
        LOG.info("Tried to clip page with invalid or unsupported URL: "
            + self.tab.url);
      }
      viewManager.showError(new Downsha.DownshaError( {
        errorCode : Downsha.EDAMErrorCode.BAD_DATA_FORMAT,
        parameter : 'url'
      }));
    } else {
      LOG.info("Salvaging unclippable page");
      var clipNote = new Downsha.ClipNote( {
        url : self.tab.url,
        fullPage : false
      });
      if (self.tab.title)
        clipNote.title = self.tab.title;
      if (LOG.isDebugEnabled())
        LOG.debug("Faking Downsha.ClipNote: " + JSON.stringify(clipNote));
      viewManager.switchView("quickNoteView", {
        "clipNote" : clipNote
      });
      if (self.quickNoteForm) {
        self.quickNoteForm.disableFullPage();
      }
    }
  };
  Downsha.ChromePopup.prototype.handleCancelPageClipTimer = function(request,
      sender, sendResponse) {
    LOG.debug("Popup.handleCancelPageClipTimer");
    var self = this;
    this.viewManager.clearWait();
    this.viewManager.showError(chrome.i18n.getMessage("contentScriptTimedOut"));
    this.startUpWithQuickNote(this.tab);
  };

  Downsha.ChromePopup.prototype.dismissPopup = function(instant) {
    var self = this;
    if (typeof instant != 'undefined' && instant) {
      this.abort();
      window.close();
    } else {
      setTimeout(function() {
        self.abort();
        window.close();
      }, Downsha.ChromePopup.DEFAULT_TIMEOUT);
    }
  };
  Downsha.ChromePopup.prototype.goRegister = function() {
    chrome.tabs.create( {
      url : Downsha.context.getRegistrationUrl()
    });
    this.dismissPopup();
  };
  Downsha.ChromePopup.prototype.goHome = function() {
    if (this.quickNoteForm
        && (this.quickNoteForm.content.length > 0 || this.quickNoteForm.tagNames.length > 0)) {
      this.autoSaveQuickNote();
    }
    chrome.tabs.create( {
      url : Downsha.context.getHomeUrl()
    });
    this.dismissPopup();
  };
  Downsha.ChromePopup.prototype.openNoteWindow = function(noteUrl) {
    var self = this;
    chrome.tabs.getSelected(null, function(tab) {
      var opts = {
        url : noteUrl,
        width : 800,
        height : 550
      };
      if (tab) {
        opts.incognito = tab.incognito;
      }
      if (typeof opts["incognito"] != 'undefined' && opts.incognito) {
        Downsha.context.getCookie("auth", function(cookie) {
          if (typeof cookie == 'object' && cookie != null
              && typeof cookie["value"] == 'string'
              && typeof noteUrl == 'string') {
            opts.url = Downsha.context.getSetAuthTokenUrl(cookie.value,
                noteUrl.replace(/http.?:\/\/[^\/]+/i, ""));
          }
          chrome.windows.create(opts);
        }, function() {
          chrome.windows.create(opts);
        });
      } else {
        chrome.windows.create(opts);
      }
    });
  };

  /** ************** Utilities *************** */
  Downsha.ChromePopup.prototype.localizePopup = function() {
    LOG.debug("Popup.localizePopup");
    var allViews = $("body");
    for ( var i = 0; i < allViews.length; i++) {
      var v = $(allViews.get(i));
      Downsha.Utils.localizeBlock(v);
    }
  };

  Downsha.ChromePopup.prototype.populateNotebookSelection = function(sel) {
    LOG.debug("Popup.populateNotebookSelection");
    var notebooks = this.getNotebooks();
    if (sel instanceof jQuery && notebooks instanceof Array) {
      LOG.debug("Updating notebook selection with " + notebooks.length
          + " notebooks");
      sel.empty();
      var preferredNotebook = Downsha.context.getPreferredNotebook();
      for ( var i = 0; i < notebooks.length; i++) {
        var n = notebooks[i];
        var nName = $("<div/>").text(n.name).html();
        var opt = $("<option value='" + n.guid + "'>" + nName + "</option>");
        if (n == preferredNotebook) {
          opt.attr("selected", "selected");
        }
        sel.append(opt);
      }
      // sel.unbind("change");
      var self = this;
      sel.bind("change", function(event) {
        LOG.debug(">>> SAVING NOTEBOOKGUID STATE: " + sel.val());
        Downsha.context.state.notebookGuid = sel.val();
      });
    } else {
      LOG.debug("Nothing to update");
    }
  };

  Downsha.ChromePopup.prototype.populateTagSelection = function(sel) {
    LOG.debug("Popup.populateTagSelection");
    var tags = this.getTags();
    var self = this;
    if (tags && tags.length > 0) {
      if (sel instanceof jQuery && tags instanceof Array) {
        LOG.debug("Populating tag selection");
        sel.autocomplete(tags, {
          formatItem : function(tag) {
            return $("<div/>").text(tag.name).html();
          },
          formatResult : function(tag) {
            return tag.name;
          },
          matchContains : true,
          multiple : true,
          selectFirst : false,
          autoFill : true,
          scrollHeight : "120px"
        }).result(function(event, data, formatted) {
          self.autoSaveQuickNote();
        });
      }
    }
  };

  Downsha.ChromePopup.prototype.populateSearchQueries = function(sel) {
    LOG.debug("Popup.populateSearchQueries");
    if (sel instanceof jQuery) {
      var searches = new Array();
      if (this.getTags() instanceof Array) {
        if (LOG.isDebugEnabled())
          LOG.debug("Adding " + this.getTags().length + " tags to searches");
        searches = searches.concat(this.getTags());
      }
      if (this.getSearches() instanceof Array) {
        if (LOG.isDebugEnabled())
          LOG.debug("Adding " + this.getSearches().length
              + " saved searches to searches");
        searches = searches.concat(this.getSearches());
      }
      if (this.getNotebooks() instanceof Array) {
        if (LOG.isDebugEnabled())
          LOG.debug("Adding " + this.getNotebooks().length
              + " notebooks to searches");
        searches = searches.concat(this.getNotebooks());
      }
      LOG.debug("There are now " + searches.length + " searches");
      var noteFilter = Downsha.context.noteFilter;
      sel.autocomplete(searches, {
        formatItem : function(item, row, total) {
          var iconSrc = null;
          if (item instanceof Downsha.Tag) {
            iconSrc = "images/browse_tags_icon.png";
          } else if (item instanceof Downsha.Notebook) {
            iconSrc = "images/browse_books_icon.png";
          } else if (item instanceof Downsha.SavedSearch) {
            iconSrc = "images/browse_search_icon.png";
          }
          if (iconSrc) {
            return $("<div/>").text(item.name).html() + "<img src='" + iconSrc
                + "' class='listIcons'/>";
          } else {
            return $("<div/>").text(item.name).html();
          }
        },
        formatResult : function(item, row, total) {
          if (item instanceof Downsha.SavedSearch
              && noteFilter instanceof Downsha.NoteFilter) {
            noteFilter.fuzzy = false;
          } else if (noteFilter instanceof Downsha.NoteFilter) {
            noteFilter.fuzzy = true;
          }
          if (item instanceof Downsha.Tag) {
            return "tag:" + Downsha.NoteFilter.formatWord(item.name);
          } else if (item instanceof Downsha.Notebook) {
            return "notebook:" + Downsha.NoteFilter.formatWord(item.name);
          } else if (item instanceof Downsha.SavedSearch) {
            return item.query;
          } else {
            return Downsha.NoteFilter.formatWord(item.name);
          }
        },
        // selectFirst : (!Downsha.ChromePopup.NOTELIST_AC_MULTIPLE),
        selectFirst : false,
        multiple : Downsha.ChromePopup.NOTELIST_AC_MULTIPLE,
        multipleSeparator : Downsha.NoteFilter.WORD_SEPARATOR
      });
    }
  };

  Downsha.ChromePopup.prototype.createPlaceholderNoteListItem = function() {
    var noteItem = $("<div class='noteListItem noteListItemPlaceholder' style='width: 100%'></div>");
    var noteInfo = $("<div class='noteListItemInfo'></div>");
    noteItem.append(noteInfo);
    noteInfo.append($("<div><img src='/images/spinner.gif'/></div>"));
    return noteItem;
  };

  Downsha.ChromePopup.prototype.createNoteListItem = function(note,
      searchWords) {
    var id = "";
    var cssClass = "noteListItem";
    if (note.guid && note.guid.length > 0) {
      id = "id='noteListItem_" + note.guid + "'";
    } else {
      cssClass += " noteListItemPlaceholder";
    }
    var noteItem = $("<div " + id + " class='" + cssClass + "'></div>");
    noteItem.css( {
      width : "100%"
    });
    var thumbUrl = null;
    if (note instanceof Downsha.SnippetNote && note.resources
        && note.resourcesSize == 1 && note.resources[0].mime) {
      var res = note.resources[0];
      var mime = res.mime.toLowerCase();
      if (mime.indexOf("image") >= 0
          && (res.width >= this.constructor.THUMBNAIL_MIN_SIZE || res.height >= this.constructor.THUMBNAIL_MIN_SIZE)) {
        thumbUrl = res.getThumbnailUrl(Downsha.context.getShardedUrl(),
            this.constructor.THUMBNAIL_SIZE);
      } else if (mime.indexOf("pdf") >= 0) {
        thumbUrl = res.getThumbnailUrl(Downsha.context.getShardedUrl(),
            this.constructor.THUMBNAIL_SIZE);
      }
    } else if (note instanceof Downsha.BasicNote && note.largestResourceSize) {
      thumbUrl = note.getThumbnailUrl(Downsha.context.getShardedUrl(),
          this.constructor.THUMBNAIL_SIZE);
    }
    if (thumbUrl) {
      noteItem.append($("<div class='noteListItemThumb'><img src='" + thumbUrl
          + "' class='noteThumb' style='max-width: "
          + this.constructor.THUMBNAIL_SIZE + "; max-height: "
          + this.constructor.THUMBNAIL_SIZE + ";'/></div>"));
    }
    // note info
    var noteInfo = $("<div class='noteListItemInfo'></div>");
    noteItem.append(noteInfo);
    // note title
    var noteTitle = (note.title) ? $("<div/>").text(note.title).html() : "";
    noteInfo
        .append($("<div class='noteListItemTitle'>" + noteTitle + "</div>"));
    var sortField = Downsha.context.options.noteSortOrder.type.toLowerCase();
    // note date
    var noteDate = null;
    if (typeof note[sortField] == 'number') {
      var f = new SimpleDateFormat(Downsha.ChromePopup.SIMPLE_DATE_FORMAT);
      noteDate = f.format(new Date(note[sortField]));
    }
    var itemContent = $("<div class='noteListItemContent'></div>");
    noteInfo.append(itemContent);
    if (noteDate) {
      itemContent.append($("<div class='noteListItemDate'>" + noteDate
          + "</div>"));
    }
    if (note.attachmentFileName) {
      itemContent.append($("<div class='noteItemAttachmentFileName'>"
          + note.attachmentFileName + "</div>"));
    } else {
      var snippetContent = $("<div class='noteListItemSnippet'></div>");
      if (note.snippet) {
        snippetContent.text(note.snippet);
      }
      itemContent.append(snippetContent);
    }
    // note source url
    if (note.attributes && typeof note.attributes.sourceURL == 'string'
        && note.attributes.sourceURL.length > 0) {
      var urlStr = Downsha.Utils.shortUrl(note.attributes.sourceURL,
          Downsha.ChromePopup.SOURCE_URL_MAX_DISPLAY_LENGTH);
      var urlAnchor = $("<a href='#' title='" + note.attributes.sourceURL
          + "'>" + urlStr + "</a>");
      urlAnchor.click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        chrome.tabs.getSelected(null, function(tab) {
          chrome.tabs.create( {
            index : (tab.index + 1),
            url : note.attributes.sourceURL
          });
        });
      });
      var urlWrapper = $("<div class='noteListItemUrl'></div>");
      urlWrapper.append(urlAnchor);
      noteInfo.append(urlWrapper);
    }
    var self = this;
    if (note.guid) {
      noteItem.bind("click", {
        note : note,
        searchWords : searchWords
      }, function(event) {
        self.openNoteWindow(event.data.note.getNoteUrl(Downsha.context, event.data.searchWords, Downsha.context.getLocale(), false));
      });
    }
    return noteItem;
  };

  Downsha.ChromePopup.prototype.bindViews = function() {
    LOG.debug("Popup.bindViews");
    this.bindHeader();
    this.bindLoginView();
    this.bindQuickNoteView();
    this.bindNotesView();
  };

  Downsha.ChromePopup.prototype.bindHeader = function() {
    var self = this;
    $("#header").bind("show", function(event, data) {
      LOG.debug("#header.onShow");
      var user = Downsha.context.getUser();
      if (user) {
        $("#headerUsername").text(user.username);
        $("#headerUsername").unbind("click");
        $("#headerUsername").bind("click", function() {
          Downsha.Utils.openWindow(Downsha.context.getDownshaProfileUrl());
        });
        $("#headerUser").show();
        $("#headerNoUser").hide();
      } else {
        $("#headerUser").hide();
        $("#headerNoUser").show();
      }
    });
  };

  Downsha.ChromePopup.prototype.bindLoginView = function() {
    // Bind loginView to focus on username field
    var self = this;
    $("#loginView")
        .bind("show", function(event, data) {
          LOG.debug("#loginView.onShow");
          self.viewManager.showBlock($("#header"));
          $("#headerUser").hide();
          $("#headerNoUser").show();
          self.updateBadge();
          var view = $("#loginView");
          var loginForm = view.find("form[name=loginForm]");
          // populate with data or present clean form if no data
            if (typeof data == 'object' && data != null) {
              if (typeof data["username"] != 'undefined') {
                loginForm.find("input[name=username]").val(data["username"]);
              }
              if (typeof data["password"] != 'undefined') {
                loginForm.find("input[name=password]").val(data["password"]);
              }
            } else {
              loginForm.find("input[type=password]").val("");
            }
            // use search-helper?
            $("#useSearchHelper").attr(
                "checked",
                (Downsha.context.getOptions(true).useSearchHelper) ? true
                    : false);
            // focus and select appropriate field
            loginForm.find("input[name=username]").focus();
            self.loginValidator.focusInvalid();
          });
    $("#loginView").bind("hide", function(event) {
      LOG.debug("#loginView.onHide");
      self.viewManager.hideBlock($("#header"));
    });
  };

  Downsha.ChromePopup.prototype.bindQuickNoteView = function() {
    // Bind quickNoteView to populate forms.
    // The form will be populated first using data.clipNote, if it's present
    // and finally all of the view options will be applied.
    // Typically this view will be revealed via
    // Downsha.ViewManager.switchView("quickNoteView")
    // in which case, adding an extra argument to that call will pass that
    // argument as data to the event handler
    // For example, Downsha.ViewManager.switchView("quickNoteView", {clipNote:
    // clipNoteObj, autoSaved: true, fullPageEnabled: true});
    // will populate the form with data taken from clipNoteObj, then mark the
    // form
    // as autoSaved and disable fullPage option.
    var self = this;
    var notesView = $("#notesView");
    var view = $("#quickNoteView");
    view
        .bind(
            "show",
            function(event, data) {
              LOG.debug("#quickNoteView.onShow");
              self.viewManager.showBlock($("#header"));
              self.viewManager.showBlock($("#notesView"));

              var notebookSelect = view.find("select[name=notebookGuid]");
              self.populateNotebookSelection(notebookSelect);

              // remove non-applicable clipActions
              var clipAction = $("#clipAction");
              var sh = self.getSearchHelper();
              if (Downsha.Utils.isForbiddenUrl(self.tab.url)) {
                clipAction.find("option").each(function(i, e) {
                  var $e = $(e);
                  if ($e.val() != "CLIP_ACTION_URL") {
                    $e.remove();
                  }
                });
              } else {
                if (sh && sh.result && sh.result.totalNotes) {
                  clipAction.find("option[value=CLIP_ACTION_ARTICLE]").remove();
                }
                if (!(self.pageInfo && self.pageInfo.selection)) {
                  clipAction.find("option[value=CLIP_ACTION_SELECTION]")
                      .remove();
                }
                if (!self.isArticleSane()) {
                  clipAction.find("option[value=CLIP_ACTION_ARTICLE]").remove();
                }
                if (!(self.pageInfo && (self.pageInfo.documentLength > 0 || self.pageInfo.containsImages))) {
                  clipAction.find("option[value=CLIP_ACTION_FULL_PAGE]")
                      .remove();
                }
              }

              // update clip actions
              self.updateQuickNoteActions();
              var sh = self.getSearchHelper();
              var opts = Downsha.context.getOptions(true);
              var clipActionOpt = (opts) ? opts.clipAction : null;
              var clipAction = self.CLIP_ACTION_MAP[clipActionOpt];
              if (Downsha.Utils.isForbiddenUrl(self.tab.url)) {
                clipAction = "CLIP_ACTION_URL";
              } else if (sh && sh.result && sh.result.totalNotes
                  && !self.pageInfo.selection) {
                if (clipActionOpt
                    && clipActionOpt == Downsha.Options.CLIP_ACTION_OPTIONS.URL) {
                  clipAction = "CLIP_ACTION_URL";
                } else {
                  clipAction = "CLIP_ACTION_FULL_PAGE";
                }
              } else {
                if (self.pageInfo && self.pageInfo.selection) {
                  clipAction = "CLIP_ACTION_SELECTION";
                } else if (self.pageInfo && self.pageInfo.article
                    && self.isArticleSane() && !clipAction) {
                  clipAction = "CLIP_ACTION_ARTICLE";
                } else if (!clipAction
                    && self.pageInfo
                    && (self.pageInfo.documentLength > 0 || self.pageInfo.containsImages)) {
                  clipAction = "CLIP_ACTION_FULL_PAGE";
                }
              }
              self.selectQuickNoteAction(clipAction);
              self.previewQuickNoteAction();

              // populate tag selection
              self.populateTagSelection(view.find("input[name=tagNames]"));

              // setup view options (defaults < options)
              var viewOpts = $.extend(true, {},
                  Downsha.ChromePopup.QUICK_NOTE_VIEW_DEFAULTS);
              // default notebook
              if (Downsha.context.getPreferredNotebook()) {
                viewOpts.notebookGuid = Downsha.context.getPreferredNotebook().guid;
              }
              // populate form with default view options
              self.quickNoteForm.populateWith(viewOpts);

              // populate form with clipNote and/or specific options passed via
              // data
              if (data && typeof data == 'object') {
                LOG.debug("Overriding quick note form with passed arguments");
                if (typeof data["clipNote"] == 'object') {
                  LOG
                      .debug("Using supplied clipNote object to populate quick note form");
                  var clipNote = (data.clipNote instanceof Downsha.ClipNote) ? data.clipNote
                      : new Downsha.ClipNote(data.clipNote);
                  self.quickNoteForm.populateWithNote(Downsha.context,
                      clipNote);
                } else {
                  LOG
                      .debug("No clipNote object passed, using as a blank quick note");
                }
                var opts = $.extend(true, {}, data);
                if (typeof opts["clipNote"] != 'undefined') {
                  delete opts["clipNote"];
                }
                self.quickNoteForm.populateWith(opts);
                $.extend(true, viewOpts, data);
              } else {
                LOG
                    .debug("No options were given, will operate as quick note with default options");
              }
              // make sure we get the right notebook
              var defaultNotebook = Downsha.context
                  .getNotebookByGuid(self.quickNoteForm.notebookGuid);
              if (!defaultNotebook) {
                defaultNotebook = Downsha.context.getPreferredNotebook();
              }
              if (defaultNotebook instanceof Downsha.Notebook) {
                self.quickNoteForm.notebookGuid = defaultNotebook.guid;
              }

              // update notebook selection element
              Downsha.Utils.updateSelectElementWidth(notebookSelect, function(
                  guid) {
                var n = Downsha.context.getNotebookByGuid(guid);
                return (n) ? n.name : guid;
              });

              // set site-memory button title
              $("#siteMemoryTabButton").text(
                  Downsha.Utils.urlTopDomain(self.tab.url));

              $("#quickNoteView input[name=cancel]").val(
                  chrome.i18n.getMessage("quickNote_cancel"));
              // focus on first tab element
              $("#quickNoteView *[tabindex=1]").focus();
            });
    view.bind("hide", function(event) {
      LOG.debug("#quickNoteView.onHide");
      self.viewManager.hideBlock($("#header"));
      self.viewManager.hideBlock($("#notesView"));
    });
  };

  Downsha.ChromePopup.prototype.bindNotesView = function() {
    LOG.debug("Popup.bindNotesView");
    var self = this;
    this.notesTabbedView = $("#notesTabbedView");
    this.notesTabbedView
        .tabbedView( {
          onshowview : function(viewName, viewContainer) {
            LOG.debug("notesTabbedView.onshowview: " + viewName);
            var viewData = (viewContainer && viewContainer.data()) ? viewContainer
                .data()
                : {};
            var complete = function() {
              viewData.searchStarted = true;
              viewContainer.data(viewData);
            };
            if (!self.searchQueryPopulated) {
              self.populateSearchQueries($(".notelistSearchQuery"));
              self.searchQueryPopulated = true;
            }
            if (viewName == self.constructor.ALL_NOTES_VIEW_NAME
                && !viewData.searchStarted) {
              LOG
                  .debug("Starting all-notes search because the view is shown wihtout prior search");
              self.doNoteSearch();
              complete();
            } else if (viewName == self.constructor.SITE_MEMORY_VIEW_NAME
                && !viewData.searchStarted) {
              LOG
                  .debug("Starting site-memory search because the view is shown without prior search");
              if (self.tab.url) {
                self.doNoteContextSearch(self.tab.url);
                complete();
              } else {
                LOG.warn("Could not determine URL of selected tab");
              }
            }
          },
          onhideview : function(viewName) {
          }
        });
    var sh = chrome.extension.getBackgroundPage().Downsha.SearchHelper
        .getInstance(this.tab.id);
    if (sh && sh.result && sh.result.totalNotes && sh.query) {
      try {
        this.notesSearchForm.notesSearchQuery = sh.query;
        this.submitNotesSearchForm();
        this.notesTabbedView.getTabbedView()[0].showView("allNotes");
      } catch (e) {
        LOG.exception("Could not open siteMemory tab: " + e);
      }
    }
  };

  Downsha.ChromePopup.prototype.bindForms = function() {
    LOG.debug("Adding expression method");
    // adding regex validation method
    $.validator.addMethod("mask", $.fn.validate.methods.mask, chrome.i18n
        .getMessage("invalidMask"));

    // trim function - replaces value with trimmed value
    $.validator.addMethod("trim", $.fn.validate.methods.trim, "trim error");

    // separates value into parts and checks if total number of parts is within
    // given range
    $.validator.addMethod("totalPartsRange",
        $.fn.validate.methods.totalPartsRange, chrome.i18n
            .getMessage("totalPartsNotInRange"));

    // separates value into parts and checks whether individual parts are within
    // given range in length
    $.validator.addMethod("partLengthRange",
        $.fn.validate.methods.partLengthRange, chrome.i18n
            .getMessage("partLengthNotInRange"));

    // separates value into parts and checks whether individual parts match
    // given
    // mask
    $.validator.addMethod("partMask", $.fn.validate.methods.partMask);

    // custom callback validator. Useful for transforms...
    $.validator.addMethod("toLowerCase", $.fn.validate.methods.toLowerCase);
    
    // custom method for handling compound rules
    $.validator.addMethod("anyOf", $.fn.validate.methods.toLowerCase);

    // duck punching invalidate method
    $.validator.prototype.invalidate = function(fieldName, errorMessage) {
      var thisErr = {};
      thisErr[fieldName] = errorMessage;
      this.showErrors(thisErr);
    };

    // bind individual forms
    this.bindLoginForm();
    this.bindQuickNoteForm();
    this.bindSearchForm();
  };

  Downsha.ChromePopup.prototype.bindLoginForm = function() {
    LOG.debug("Popup.bindLoginForm");
    var form = $("form[name=loginForm]");
    var self = this;
    if (form.length == 0) {
      LOG.warn("Could not find login form");
      return;
    }
    $("#useSearchHelper").bind("change", function(event) {
      // LOG.debug(checked);
        var opts = Downsha.context.getOptions();
        opts.useSearchHelper = this.checked;
        Downsha.context.setOptions(opts);
      });
    var opts = {
      submitHandler : function(form) {
        self.submitLoginForm();
      },
      errorClass : this.viewManager.FORM_FIELD_ERROR_MESSAGE_CLASS,
      errorElement : "div",
      onkeyup : false,
      onfocusout : false,
      invalidHandler : function() {
        // self.viewManager.updateBodyHeight();
      },
      success : function() {
        // self.viewManager.updateBodyHeight();
      },
      rules : {
        username : {
          required : true,
          toLowerCase : true,
          anyOf: [{
            minlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN,
            maxlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX,
            mask : Downsha.Constants.Limits.DSTP_USER_NAME_REGEX    
          }, {
            minlength : Downsha.Constants.Limits.DSTP_USER_EMAIL_LEN_MIN,
            maxlength : Downsha.Constants.Limits.DSTP_USER_EMAIL_LEN_MAX,
            mask : Downsha.Constants.Limits.DSTP_USER_EMAIL_REGEX
          }]
          // minlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN,
          // maxlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX,
          // mask : Downsha.Constants.Limits.DSTP_USER_NAME_REGEX
        },
        password : {
          required : true,
          minlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN,
          maxlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX,
          mask : Downsha.Constants.Limits.DSTP_USER_PWD_REGEX
        }
      },
      messages : {
        username : {
          required : chrome.i18n.getMessage("valueNotPresent", chrome.i18n
              .getMessage("loginForm_username")),
          minlength : chrome.i18n.getMessage("valueTooShort", [
              chrome.i18n.getMessage("loginForm_username"),
              Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN ]),
          maxlength : chrome.i18n.getMessage("valueTooLong", [
              chrome.i18n.getMessage("loginForm_username"),
              Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX ]),
          mask : chrome.i18n.getMessage("invalidUsername")
        },
        password : {
          required : chrome.i18n.getMessage("valueNotPresent", chrome.i18n
              .getMessage("loginForm_password")),
          minlength : chrome.i18n.getMessage("valueTooShort", [
              chrome.i18n.getMessage("loginForm_password"),
              Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN ]),
          maxlength : chrome.i18n.getMessage("valueTooLong", [
              chrome.i18n.getMessage("loginForm_password"),
              Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX ]),
          mask : chrome.i18n.getMessage("invalidPassword")
        }
      }
    };
    LOG.debug("Setting up validation on login form");
    this.loginValidator = form.validate(opts);
  };

  Downsha.ChromePopup.prototype.updateQuickNoteActions = function() {
    var form = $("form[name=quickNoteForm]");
    var clipActionElement = this.getQuickNoteActionElement();
    var clipSubmit = form.find("input[type=submit]");
    var val = clipActionElement.val();
    var textVal = clipActionElement.find("option[value=" + val + "]").text();
    var textSize = Downsha.Utils.getTextSize(textVal);
    Downsha.Utils.resizeElement(clipActionElement, {
      width : textSize.width
    });
    Downsha.Utils.resizeElement(clipSubmit, {
      width : textSize.width
    }, function(el, sizeObj) {
      clipSubmit.css( {
        right : (0 - sizeObj.width) + "px"
      });
    });
    clipSubmit.val(textVal);
  };

  Downsha.ChromePopup.prototype.previewQuickNoteAction = function() {
    if (Downsha.Utils.isForbiddenUrl(this.tab.url)) {
      LOG.debug("Not previewing quickNoteAction on forbiddenUrl");
      return;
    }
    var clipAction = this.getQuickNoteAction();
    if (clipAction
        && typeof Downsha.Constants.RequestType["PREVIEW_" + clipAction] != 'undefined') {
      Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
          Downsha.Constants.RequestType["PREVIEW_" + clipAction], {
            tabId : this.tab.id
          }), function() {
        LOG.debug("Notified extension with clip action: " + clipAction);
      });
    }
    if (clipAction == "CLIP_ACTION_ARTICLE") {
        this.enablePreviewAdjustment();
    } else {
        console.log("Unbinding keypress handler");
        this.disablePreviewAdjustment();
    }
  };
  
  Downsha.ChromePopup.prototype._handlePreviewAdjustment = function(event) {
      var keyCode = (event) ? event.keyCode : null;
      var direction = null;
      switch(keyCode) {
          case 37:
            direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_PREVIOUS_SIBLING;
            break;
          case 38:
              direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_PARENT;
              break;
          case 39:
              direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_NEXT_SIBLING;
              break;
          case 40:
              direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_CHILD;
              break;
          case 13:
              if (event.data && event.data.popup) {
                  popup.submitQuickNoteForm();
              }
              return;
      }
      if (direction) {
          Downsha.Utils.notifyExtension(new Downsha.RequestMessage(Downsha.Constants.RequestType.PREVIEW_NUDGE, {
              tabId: popup.tab.id,
              direction: direction
              }), function() {
              LOG.debug("Notified extension to adjust preview: " + direction);
          });
      }
  };
  
    Downsha.ChromePopup.prototype.enablePreviewAdjustment = function() {
        LOG.debug("Popup.enablePreviewAdjustment");
        if (this._previewAdjustmentEnabled) {
            return;
        }
        var clipAction = this.getQuickNoteAction();
        var opts = Downsha.getContext(true).getOptions(true);
        if (clipAction == "CLIP_ACTION_ARTICLE" && opts && opts.selectionNudging != Downsha.Options.SELECTION_NUDGING_OPTIONS.DISABLED) {
            LOG.debug("Enabling preview adjustment");
            $("body").bind("keyup", {popup: this}, this._handlePreviewAdjustment);
            this._previewAdjustmentEnabled = true;
        }
    };
    Downsha.ChromePopup.prototype.disablePreviewAdjustment = function() {
        LOG.debug("Popup.disablePreviewAdjustment");
        if (this._previewAdjustmentEnabled) {
            LOG.debug("Disabling preview adjustment");
            $("body").unbind("keyup", this._handlePreviewAdjustment);
            this._previewAdjustmentEnabled = false;
        }
    };

  Downsha.ChromePopup.prototype.selectQuickNoteAction = function(actionName) {
    LOG.debug("ChromePopup.selectQuickNoteAction");
    if (actionName) {
      var clipActionElement = this.getQuickNoteActionElement();
      if (clipActionElement.find("option[value=" + actionName + "]").length > 0) {
        clipActionElement.val(actionName);
        this.updateQuickNoteActions();
      }
    }
  };

  Downsha.ChromePopup.prototype.getQuickNoteActionElement = function() {
    return $("form[name=quickNoteForm] #clipAction");
  };

  Downsha.ChromePopup.prototype.getQuickNoteAction = function() {
    var clipActionElement = this.getQuickNoteActionElement();
    return clipActionElement.val();
  };

  Downsha.ChromePopup.prototype.bindQuickNoteForm = function() {
    LOG.debug("Popup.bindQuickNoteForm");
    var form = $("form[name=quickNoteForm]");
    if (form.length == 0) {
      LOG.warn("Could not find quickNoteForm");
      return;
    }
    var titleField = form.find("input[name=title]");
    titleField.bind("blur", function() {
      titleField.val(titleField.val().trim());
    });
    var notebookSelect = form.find("select[name=notebookGuid]");
    if (notebookSelect.length > 0) {
      notebookSelect.bind("change", function() {
        Downsha.Utils.updateSelectElementWidth(this, function(guid) {
          var n = Downsha.context.getNotebookByGuid(guid);
          return (n) ? n.name : guid;
        });
      });
    }
    var commentField = form.find("textarea[name=comment]");
    commentField.bind("blur", function() {
      if (commentField.val().trim().length > 0) {
        commentField.addClass("focus");
      } else {
        commentField.removeClass("focus");
      }
    });
    var self = this;
    var clipAction = form.find("#clipAction");
    clipAction.bind("change", function() {
      self.updateQuickNoteActions();
      self.previewQuickNoteAction();
    });
    var opts = {
      submitHandler : function(form) {
        self.submitQuickNoteForm();
      },
      errorClass : this.viewManager.FORM_FIELD_ERROR_MESSAGE_CLASS,
      errorElement : "div",
      onkeyup : false,
      onfocusin: function() {
        self.disablePreviewAdjustment();
      },
      onfocusout : function() {
        self.enablePreviewAdjustment();
        if (self.quickNoteValidator.numberOfInvalids()) {
          self.quickNoteValidator.form();
        }
      },
      rules : {
        title : {
          trim : true,
          required : false,
          rangelength : [ Downsha.Constants.Limits.EDAM_NOTE_TITLE_LEN_MIN,
              Downsha.Constants.Limits.EDAM_NOTE_TITLE_LEN_MAX ],
          mask : Downsha.Constants.Limits.EDAM_NOTE_TITLE_REGEX
        },
        tagNames : {
          totalPartsRange : [ Downsha.Constants.Limits.EDAM_NOTE_TAGS_MIN,
              Downsha.Constants.Limits.EDAM_NOTE_TAGS_MAX ],
          partLengthRange : [ Downsha.Constants.Limits.EDAM_TAG_NAME_LEN_MIN,
              Downsha.Constants.Limits.EDAM_TAG_NAME_LEN_MAX ],
          partMask : Downsha.Constants.Limits.EDAM_TAG_NAME_REGEX
        }
      },
      messages : {
        title : {
          rangelength : chrome.i18n.getMessage("valueNotInRange", [
              chrome.i18n.getMessage("quickNote_title"),
              Downsha.Constants.Limits.EDAM_NOTE_TITLE_LEN_MIN,
              Downsha.Constants.Limits.EDAM_NOTE_TITLE_LEN_MAX ]),
          mask : chrome.i18n.getMessage("invalidTitle")
        },
        tagNames : {
          totalPartsRange : chrome.i18n.getMessage("tagNamesNotInRange", [
              Downsha.Constants.Limits.EDAM_NOTE_TAGS_MIN,
              Downsha.Constants.Limits.EDAM_NOTE_TAGS_MAX ]),
          partLengthRange : chrome.i18n.getMessage("tagNameNotInRange", [
              Downsha.Constants.Limits.EDAM_TAG_NAME_LEN_MIN,
              Downsha.Constants.Limits.EDAM_TAG_NAME_LEN_MAX ]),
          partMask : chrome.i18n.getMessage("invalidTagName")
        }
      }
    };
    LOG.debug("Setting up validation on quicknote form");
    this.quickNoteValidator = form.validate(opts);
    $("form[name=quickNoteForm]").observeform(
        {
          freezeSubmit : false,
          changeKeyboardDelay : Downsha.ChromePopup.AUTO_SAVE_DELAY,
          onChange : function(changeEvent, changeElement, changeForm,
              observeOptions) {
            var f = $("form[name=quickNoteForm]");
            f.addClass("changed");
            self.autoSaveQuickNote();
          }
        });
  };

  Downsha.ChromePopup.prototype.bindSearchForm = function() {
    // SEARCH QUERY BINDINGS
    var searchQueryField = $("#notesSearchQuery");
    var self = this;
    // make sure to set NoteFilter to fuzzy mode when first focused.
    searchQueryField.focus(function(event) {
        self.disablePreviewAdjustment();
      Downsha.context.noteFilter.fuzzy = true;
    });
    searchQueryField.blur(function(event) {
        self.enablePreviewAdjustment();
    });
    // make sure we hide autocomplete popup on ENTER
    searchQueryField.keyup(function(event) {
      if (event.keyCode == 13) {
        $(".ac_results").hide();
        if (!Downsha.ChromePopup.NOTELIST_AC_MULTIPLE) {
          self.submitNotesSearchForm();
        }
      }
    });
  };

  Downsha.ChromePopup.prototype.removeAutoSavedNote = function() {
    LOG.debug("ChromePopup.removeAutoSavedNote");
    Downsha.context.removeAutoSavedNote(this.tab.id);
    Downsha.Utils.updateBadge(Downsha.context, this.tab.id);
  };

  Downsha.ChromePopup.prototype.autoSaveQuickNote = function() {
    LOG.debug("ChromePopup.autoSaveQuickNote");
    var clipNote = this.quickNoteForm.asClipNote();
    if (clipNote instanceof Downsha.ClipNote) {
      LOG.info("Auto-saving clipNote...");
      try {
        Downsha.context.setAutoSavedNote(this.tab.id, clipNote);
        this.updateBadge();
      } catch (e) {
        LOG.error("Popup could not auto-save quick note: " + e);
      }
    } else {
      LOG.warn("Not auto-saving note because it is not a clipNote");
    }
  };

  Downsha.ChromePopup.prototype.loginWithForm = function(form) {
    LOG.debug("ChromePopup.loginWithForm");
    var self = this;
    if (typeof form == 'object') {
      this.unabort();
      var username = form.find("[name=username]").val().toLowerCase();
      var password = form.find("[name=password]").val();
      var rememberMe = form.find("[name=rememberMe]").attr("checked");
      this.viewManager.wait(chrome.i18n.getMessage("loggingIn"));
      if (Downsha.context.user && Downsha.context.user.username != username) {
        LOG.info("Logging out old user (" + Downsha.context.user.username
            + ") and logging in as new user: " + username);
        this.logout(function() {
          self._login(username, password, rememberMe);
        });
      } else {
        LOG.info("Authenticating with remote as: " + username);
        this._login(username, password, rememberMe);
      }
    }
  };

  Downsha.ChromePopup.prototype._login = function(username, password,
      rememberMe) {
    LOG.debug("ChromePopup.login");
    var self = this;
    Downsha.context.rememberedSession = rememberMe;
    var form = this.getLoginForm();
    this.viewManager.wait(chrome.i18n.getMessage("loggingIn"));
    LOG.info("Authenticating with remote as: " + username);
    this.loginProc = Downsha.context.remote
        .authenticate(
            username,
            password,
            rememberMe,
            function(response, textStatus, xhr) {
              LOG.info("Authentication response received...");
              self.viewManager.clearWait();
              if (response.isError()) {
                var userErrors = response
                    .selectErrors(function(e) {
                      if ((e instanceof Downsha.EDAMUserException || e instanceof Downsha.ValidationError)
                          && (e.errorCode == Downsha.EDAMErrorCode.INVALID_AUTH
                              || e.errorCode == Downsha.EDAMErrorCode.DATA_REQUIRED || e.errorCode == Downsha.EDAMErrorCode.BAD_DATA_FORMAT)) {
                        return true;
                      }
                    });
                if (userErrors) {
                  LOG.info("Authentication invalid");
                  self.loginValidator.resetForm();
                  self.viewManager.showFormErrors(form, userErrors, function(
                      fieldName, errorMessage) {
                    self.loginValidator.invalidate(fieldName, errorMessage);
                  });
                } else {
                  LOG.warn("Unexpected response during login");
                  self.viewManager.showErrors(response.errors);
                }
                self.viewManager.switchView("loginView", {
                  username : username,
                  password : ""
                });
              } else {
                LOG.info("Successfully logged in");
                self.viewManager.hideView("loginView");
                if (rememberMe) {
                  LOG
                      .debug("Updating stored password because user asked to remember their password");
                  var opts = Downsha.context.getOptions(true);
                  opts.username = username;
                  opts.password = Downsha.XORCrypt.encrypt(password, username);
                  opts.apply();
                  new Downsha.RequestMessage(
                      Downsha.Constants.RequestType.OPTIONS_UPDATED).send();
                }
                if (Downsha.context.getSyncState(true) != null) {
                  LOG.info("Got syncState, continuing with clipping");
                  self.startUp();
                } else {
                  LOG.info("Didn't get syncState, acquiring one...");
                  self
                      .remoteLoginState(function() {
                        LOG
                            .info("Got syncState after login, continuing with clipping...");
                        self.startUp();
                      }, null, true);
                }
              }
            },
            function(xhr, textStatus, error) {
              if (xhr && xhr.readyState == 4) {
                LOG
                    .error("Failed to authenticate due to transport problems (status: "
                        + xhr.status + ")");
              } else if (xhr) {
                LOG
                    .error("Failed to authenticate due to transport problems (readyState: "
                        + xhr.readyState + ")");
              } else {
                LOG
                    .error("Failed to authenticate due to unkonwn transport problems");
              }
              self.viewManager.clearWait();
              self.viewManager.showHttpError(xhr, textStatus, error);
            }, true);
  };

  Downsha.ChromePopup.prototype.logout = function(callback) {
    LOG.debug("ChromePopup.logout");
    this.viewManager.wait(chrome.i18n.getMessage("loggingOut"));
    LOG.info("Logging out...");
    var self = this;
    if (typeof callback != 'function') {
      callback = function() {
        self.dismissPopup(true);
        // window.close();
      };
    }
    var localLogout = function() {
      self.viewManager.clearWait();
      new Downsha.RequestMessage(Downsha.Constants.RequestType.LOGOUT, {
        resetOptions : true
      }).send();
      callback();
    };
    var logoutProc = Downsha.context.remote.logout(function(response,
        textStatus) {
      self.viewManager.clearWait();
      if (response.isResult()) {
        LOG.info("Successfully logged out");
      } else if (result.isError()) {
        LOG.warn("Soft error logging out");
      } else {
        LOG.error("Got garbage response when tried to logout");
      }
      localLogout();
    }, function(xhr, textStatus, error) {
      if (xhr && xhr.readyState == 4) {
        LOG.error("Failed to log out due to transport errors (status: "
            + xhr.status + ")");
      } else if (xhr) {
        LOG.error("Failed to log out due to transport errors (readyState: "
            + xhr.readyState + ")");
      } else {
        LOG.error("Failed to log out due to unknown transport errors");
      }
      self.viewManager.clearWait();
      localLogout();
    }, true);
  };

  Downsha.ChromePopup.prototype.unabort = function() {
    LOG.debug("ChromePopup.unabort");
    this.aborted = false;
    this.viewManager.quiet = false;
  };

  Downsha.ChromePopup.prototype.abort = function() {
    LOG.debug("ChromePopup.abort");
    this.aborted = true;
    this.viewManager.quiet = true;
    this.abortProcs();
  };

  Downsha.ChromePopup.prototype.abortProcs = function() {
    LOG.debug("ChromePopup.abortProcs");
    if (this.loginProc && typeof this.loginProc.abort == 'function') {
      this.loginProc.abort();
      this.loginProc = null;
    }
    if (this.findProc && typeof this.findProc.abort == 'function') {
      this.findProc.abort();
      this.findProc = null;
    }
    if (this.findContextProc && typeof this.findContextProc.abort == 'function') {
      this.findContextProc.abort();
      this.findContextProc = null;
    }
  };

  Downsha.ChromePopup.prototype.handleResponseError = function(response, quiet) {
    LOG.debug("ChromePopup.handleResponseError ["
        + ((quiet) ? "quiet" : "not quiet") + "]");
    if (response
        && (response.isMissingAuthTokenError() || response
            .isPermissionDeniedError())) {
      LOG
          .warn("Response indicates a problem with retaining authentication token between requests");
      if (!quiet) {
        this.viewManager.showError(chrome.i18n
            .getMessage("authPersistenceError"));
      }
      return true;
    } else if (response && response.isAuthTokenExpired()) {
      LOG.warn("Response indicates expired authentication");
      if (!quiet) {
        this.viewManager.showError(chrome.i18n.getMessage("authExpiredError"));
      }
      return true;
    } else if (response && response.isInvalidAuthentication()) {
      LOG.warn("Response indicates invalid authentication");
      var username = Downsha.context.options.username || "";
      this.viewManager.switchView("loginView", {
        username : username,
        password : ""
      });
      this.viewManager.showErrors(response.errors);
      return true;
    }
    return false;
  };

  Downsha.ChromePopup.prototype.remoteClipNote = function(clipNote, success,
      failure) {
    LOG.debug("Popup.remoteClipNote");
    if (!(clipNote instanceof Downsha.ClipNote)) {
      LOG.error("Tried to clip invalid object");
      return;
    }
    this.viewManager.wait(chrome.i18n.getMessage("clippingToDownsha"));
    LOG.info("Sending clip to the server");
    var self = this;
    var clipProc = Downsha.context.remote
        .clip(
            clipNote,
            function(response, textStatus) {
              self.viewManager.clearWait();
              LOG
                  .debug("Popup got response from the server regarding clipped note");
              if (response.isResult()) {
                LOG.info("Successfully sent clip to the server");
                if (typeof success == 'function') {
                  success(response, textStatus);
                }
              } else if (response.isError()) {
                if (!self.handleResponseError(response)) {
                  LOG.warn("Failed to send clip to the server");
                  if (typeof failure == 'function') {
                    failure(response, textStatus);
                  }
                }
              } else {
                LOG
                    .error("Unrecognized response when tried to send clip to the server");
              }
            },
            function(xhr, textStatus, error) {
              if (xhr && xhr.readyState == 4) {
                LOG
                    .error("Failed to send clip to server due to transport errors (status: "
                        + xhr.status + ")");
              } else if (xhr) {
                LOG
                    .error("Failed to send clip to server due to transport errors (readyState: "
                        + xhr.readyState + ")");
              } else {
                LOG
                    .error("Failed to send clip to server due to unknown transport errors");
              }
              self.viewManager.clearWait();
              self.viewManager.showHttpError(xhr, textStatus, error);
            }, true);
    return clipProc;
  };

  Downsha.ChromePopup.prototype.remoteFindNotes = function(filter, offset,
      maxNotes, success, failure) {
    LOG.debug("Popup.remoteFindNotes");
    if (!(filter instanceof Downsha.NoteFilter)) {
      LOG.error("Tried to find notes without valid NoteFilter");
      return;
    }
    LOG.info("Searching notes: " + JSON.stringify(filter));
    var self = this;
    var findProc = Downsha.context.remote
        .findMetaNotes(
            filter,
            self.constructor.SEARCH_RESULT_SPEC,
            offset,
            maxNotes,
            function(response, textStatus, xhr) {
              LOG
                  .debug("Popup got response from the server regarding note search");
              if (response.isResult()) {
                LOG.info("Successfully retreived note search results");
                if (typeof success == 'function') {
                  success(response, textStatus, xhr);
                }
              } else if (response.isError()) {
                if (!self.handleResponseError(response)) {
                  LOG.warn("Failed to find notes");
                  if (typeof failure == 'function') {
                    failure(response, textStatus, xhr);
                  }
                }
              } else {
                LOG
                    .error("Unrecognized response when tried to find notes on the server");
              }
            },
            function(xhr, textStatus, error) {
              if (xhr && xhr.readyState == 4) {
                LOG
                    .error("Failed to find notes due to transport errors (status: "
                        + xhr.status + ")");
              } else if (xhr) {
                LOG
                    .error("Failed to find notes due to transport errors (readyState: "
                        + xhr.readyState + ")");
              } else {
                LOG
                    .error("Failed to find notes due to unknown transport errors");
              }
              // only show http errors when we're not offline - it makes no
              // sense to annoy users with HTTP 0 errors
              if (!Downsha.chromeExtension.offline) {
                self.viewManager.showHttpError(xhr, textStatus, error);
              }
              if (typeof failure == 'function') {
                failure(error, textStatus, xhr);
              }
            }, true);
    return findProc;
  };

  Downsha.ChromePopup.prototype.remoteLoginState = function(success, failure, force) {
    LOG.debug("Popup.remoteLoginState");
    this.viewManager.wait(chrome.i18n.getMessage("synchronizing"));
    LOG.info("Asking server for sync state");
    var self = this;
    return Downsha.context.remote
        .getSyncState(
            null,
            function(response, textStatus, xhr) {
              self.viewManager.clearWait();
              if (response.isResult()) {
                LOG.info("Got successful result on sync");
                if (!Downsha.getContext(true).getSyncState(true)) {
                  LOG.warn("Somehow we're out of sync...");
                  if (typeof failure == 'function') {
                      failure(xhr, textStatus, response);
                  }
                  return;
                }
                if (typeof success == 'function') {
                  success(response, textStatus);
                }
              } else if (response.isError()) {
                LOG.debug("About to handle response error when status is: "
                    + self.popupStatus);
                var quiet = (self.popupStatus == Downsha.ChromePopup.POPUP_STATUS_CODES.STARTUP) ? true
                    : false;
                if (!self.handleResponseError(response, quiet)) {
                  LOG.warn("Unexpected error");
                  self.viewManager.showErrors(response.errors);
                }
                if (typeof failure == 'function') {
                  failure(xhr, textStatus, response);
                }
              } else {
                LOG.error("Unexpected response when syncing");
                var err = new Downsha.Exception(
                    Downsha.EDAMErrorCode.UNKNOWN, chrome.i18n
                        .getMessage("Error_" + Downsha.EDAMErrorCode.UNKNOWN));
                self.viewManager.showError(err);
                if (typeof failure == 'function') {
                  failure(xhr, textStatus, response);
                }
              }
            },
            function(xhr, textStatus, error) {
              if (xhr && xhr.readyState == 4) {
                LOG
                    .error("Failed to get SyncState due to transport errors (status: "
                        + xhr.status + ")");
              } else if (xhr) {
                LOG
                    .error("Failed to get SyncState due to transport errors (readyState: "
                        + xhr.readyState + ")");
              } else {
                LOG
                    .error("Failed to get SyncState due to unknown transport errors");
              }
              self.viewManager.clearWait();
              // only show transport errors if we're not offline - it makes no
              // sense to annoy user with HTTP 0 errors
              if (!Downsha.chromeExtension.offline) {
                self.viewManager.showHttpError(xhr, textStatus, error);
              }
              if (typeof failure == 'function') {
                failure(xhr, textStatus, error);
              }
            }, true, force);
  };

  Downsha.ChromePopup.prototype.getLoginForm = function() {
    return $("form[name=loginForm]");
  };

  Downsha.ChromePopup.prototype.submitLoginForm = function() {
    LOG.debug("Popup.submitLoginForm");
    var form = this.getLoginForm();
    this.viewManager.hideErrors();
    this.viewManager.clearFormArtifacts(form);
    this.loginWithForm(form);
  };

  Downsha.ChromePopup.prototype.submitQuickNoteForm = function() {
    LOG.debug("Popup.submitQuickNoteForm");
    var self = this;
    if (this.quickNoteForm) {
      LOG.debug("Grabbing data from form");
      this.viewManager.hideErrors();
      var clipNote = this.quickNoteForm.asClipNote();
      if (!clipNote.title) {
        clipNote.title = chrome.i18n.getMessage("quickNote_untitledNote");
      }
      delete clipNote.content;
      this.viewManager.hideView("quickNoteView");
      this.abortProcs();
      this.removeAutoSavedNote();
      Downsha.chromeExtension.contentPreview.clear(this.tab.id, function() {
        var clipAction = self.getQuickNoteAction();
        if (clipAction == "CLIP_ACTION_FULL_PAGE") {
          Downsha.chromeExtension.clipFullPageFromTab(self.tab, clipNote);
        } else if (clipAction == "CLIP_ACTION_SELECTION") {
          Downsha.chromeExtension.clipSelectionFromTab(self.tab, clipNote);
        } else if (clipAction == "CLIP_ACTION_ARTICLE") {
          Downsha.chromeExtension.clipArticleFromTab(self.tab, clipNote);
        } else if (clipAction == "CLIP_ACTION_URL") {
          Downsha.chromeExtension.clipUrlFromTab(self.tab, clipNote);
        } else {
          popup.viewManager.showError("Invalid Clip selection");
          return;
        }
        self.dismissPopup();
      });
    } else {
      LOG.debug("Nothing to clip...");
    }
  };

  Downsha.ChromePopup.prototype.cancelQuickNoteForm = function() {
    LOG.debug("Popup.cancelQuickNoteForm");
    this.resetQuickNote();
    this.dismissPopup();
  };

  Downsha.ChromePopup.prototype.resetQuickNote = function() {
    LOG.debug("ChromePopup.resetQuickNote");
    this.removeAutoSavedNote();
    this.updateBadge();
  };

  Downsha.ChromePopup.prototype.submitNotesSearchForm = function() {
    LOG.debug("Popup.submitNotesSearchForm");
    if (this.notesSearchForm) {
      var q = this.notesSearchForm.notesSearchQuery;
      var noteFilter = Downsha.context.noteFilter;
      noteFilter.resetQuery();
      noteFilter.words = q;
      Downsha.context.noteFilter = noteFilter;
      LOG.info("Searching for: " + JSON.stringify(noteFilter.toStorable()));
      $("#notesListItems").empty();
      Downsha.context.state.noteListScrollTop = null;
      this.doNoteSearch();
    } else {
      LOG.debug("No search query...");
    }
  };

  Downsha.ChromePopup.prototype.doNoteSearch = function(filter) {
    LOG.debug("Popup.doNoteSearch");
    var noteFilter = (filter instanceof Downsha.NoteFilter) ? filter
        : Downsha.context.noteFilter;
    if (noteFilter.words) {
      $("#notesSearchQuery").val(noteFilter.words);
    }
    var self = this;
    Downsha.context.state.noteListScrollTop = 0;
    $("#notesList").ascrollable(
        {
          debug : true,
          pageSize : Downsha.ChromePopup.NOTELIST_PAYLOAD_SIZE,
          pageBuffer : Downsha.ChromePopup.NOTELIST_PAGE_SIZE,
          itemHeight : Downsha.ChromePopup.NOTELIST_ITEM_HEIGHT,
          loadProcTimeout : Downsha.ChromePopup.NOTELIST_FETCH_TIMEOUT,
          debug : false,
          placeholderItem : self.createPlaceholderNoteListItem(),
          loadingContainer : $("#notesListLoadingContainer"),
          emptyContainer : $("#notesListEmptyContainer"),
          onScroll : function(event) {
            if (self.noteListScrollTimer)
              clearTimeout(self.noteListScrollTimer);
            self.noteListScrollTimer = setTimeout(function() {
              var pos = event.target.scrollTop;
              LOG.debug("Remembering scrollTop: " + pos);
              Downsha.context.state.noteListScrollTop = pos;
              self.noteListScrollTimer = null;
            }, 600);
          },
          onEmpty : function() {
            if (!noteFilter.isEmpty()) {
              $("#notesList > *").hide();
              $("#notesListEmptyContainer").show();
            } else {
              $("#notesList > *").hide();
              $("#notesList").addClass("notesListEmpty");
            }
          },
          totalItems : function() {
            return (self.noteList) ? self.noteList.totalNotes : 0;
          },
          onLoadPage : function(pageIndex, pageSize, totalPages) {
            self.findProc = self.remoteFindNotes(noteFilter,
                (pageIndex * pageSize), (pageSize * totalPages), function(
                    response, textStatus) {
                  LOG.debug("findProc success");
                  self.findProc = null;
                  self.processNoteList(response.result.noteList.notes);
                  self.noteList = response.result.noteList;
                  if (noteFilter.words) {
                    $("#myNotesTabButton").text(
                        chrome.i18n.getMessage("notes_titleWithCount",
                            [ self.noteList.totalNotes ]));
                  } else {
                    $("#myNotesTabButton").text(
                        chrome.i18n.getMessage("notes_titleAllWithCount",
                            [ self.noteList.totalNotes ]));
                  }
                  $("#notesList").trigger("afterLoadPage",
                      [ pageIndex, pageSize, totalPages ]);
                }, function(response, textStatus, xhr) {
                  LOG.debug("findProc failed");
                  self.findProc = null;
                  if (response && response.errors) {
                    if (response.errors.length == 1) {
                      self.viewManager.showError(response.errors[0]);
                    } else {
                      self.viewManager.showErrors(response.errors);
                    }
                  } else {
                    $("#notesList .notelistMessageContainer").hide();
                    var msg = null;
                    if (xhr.status != 200) {
                      var msg = self.viewManager.getLocalizedHttpErrorMessage(
                          xhr, textStatus, response);
                    }
                    if (!msg) {
                      msg = chrome.i18n.getMessage("UnknownError");
                    }
                    $("#notesListErrorContainer").text(msg).show();
                  }
                });
            return false;
          },
          onAfterLoadPage : function(pageIndex, pageSize, totalPages) {
            if (pageIndex == 0 && Downsha.context.state.noteListScrollTop) {
              setTimeout(function() {
                $("#notesList").scrollTo(
                    Downsha.context.state.noteListScrollTop);
              }, Downsha.ChromePopup.NOTELIST_SCROLLTO_DELAY);
            }
          },
          items : function() {
            var items = new Array();
            var guids = [];
            if (self.noteList) {
              for ( var i = 0; i < self.noteList.notes.length; i++) {
                items[self.noteList.startIndex + i] = (self.createNoteListItem(
                    self.noteList.notes[i], (noteFilter) ? noteFilter.words
                        : null));
              }
            }
            return items;
          }
        });
  };

  Downsha.ChromePopup.prototype.doNoteContextSearch = function(url) {
    LOG.debug("Popup.doNoteContextSearch(" + url + ")");
    var self = this;
    // update URL on the search input prefix
    var domainStr = Downsha.Utils.urlTopDomain(url);
    $("#notesContextListTitle").html(domainStr);
    // setup NoteFilter
    this.noteContextFilter = new Downsha.NoteFilter();
    if (typeof url != 'string' || url.length == 0) {
      LOG.warn("Tried to find notes relative to empty URL... Ignoring!");
      return;
    }
    this.noteContextFilter.words = Downsha.Utils.urlToSearchQuery(url,
        "sourceUrl:");
    // setup ascrollable
    $("#notesContextList").ascrollable(
        {
          debug : true,
          pageSize : Downsha.ChromePopup.NOTELIST_PAYLOAD_SIZE,
          pageBuffer : Downsha.ChromePopup.NOTELIST_PAGE_SIZE,
          itemHeight : Downsha.ChromePopup.NOTELIST_ITEM_HEIGHT,
          loadProcTimeout : Downsha.ChromePopup.NOTELIST_FETCH_TIMEOUT,
          debug : false,
          placeholderItem : self.createPlaceholderNoteListItem(),
          loadingContainer : $("#notesContextListLoadingContainer"),
          emptyContainer : $("#notesContextListEmptyContainer"),
          onScroll : function(event) {
            if (self.noteListScrollTimer)
              clearTimeout(self.noteListScrollTimer);
            self.noteListScrollTimer = setTimeout(function() {
              var pos = event.target.scrollTop;
              LOG.debug("Remembering scrollTop: " + pos);
              // TODO: this needs to be remembered as another var
                // Downsha.context.state.noteListScrollTop = pos;
                self.noteListScrollTimer = null;
              }, 600);
          },
          onEmpty : function() {
            if (!self.noteContextFilter.isEmpty()) {
              $("#notesContextList > *").hide();
              $("#notesContextListEmptyContainer").show();
            } else {
              $("#notesContextList > *").hide();
              $("#notesContextList").addClass("notesListEmpty");
            }
          },
          totalItems : function() {
            return (noteContextList) ? noteContextList.totalNotes : 0;
          },
          onLoadPage : function(pageIndex, pageSize, totalPages) {
            self.findContextProc = self.remoteFindNotes(self.noteContextFilter,
                (pageIndex * pageSize), (pageSize * totalPages), function(
                    response, textStatus) {
                  LOG.debug("findContextProc success");
                  self.findContextProc = null;
                  self.processNoteList(response.result.noteList.notes);
                  noteContextList = response.result.noteList;
                  LOG.debug("Found " + noteContextList.totalNotes
                      + " notes relative to this domain...");
                  var domainProto = Downsha.Utils.urlProto(url);
                  var tabButton = $("#siteMemoryTabButton");
                  if (domainProto && domainProto == "file") {
                    tabButton.text(chrome.i18n.getMessage(
                        "notes_titleLocalFilesAndCount",
                        [ noteContextList.totalNotes ]));
                    $("#notesContextListTitle").html(
                        chrome.i18n.getMessage("notes_titleForLocalFiles"));
                  } else {
                    var domainStr = Downsha.Utils.urlTopDomain(url);
                    tabButton.text(chrome.i18n.getMessage(
                        "notes_titleWithDomainAndCount", [ domainStr,
                            noteContextList.totalNotes ]));
                    $("#notesContextListTitle").html(
                        chrome.i18n.getMessage("notes_titleForDomain",
                            [ domainStr ]));
                  }
                  $("#notesContextList").trigger("afterLoadPage",
                      [ pageIndex, pageSize, totalPages ]);
                }, function(response, textStatus, xhr) {
                  LOG.debug("findContextProc failed");
                  self.findContextProc = null;
                  if (response && response.errors) {
                    if (response.errors.length == 1) {
                      self.viewManager.showError(response.errors[0]);
                    } else {
                      self.viewManager.showErrors(response.errors);
                    }
                  } else {
                    $("#notesContextList .notelistMessageContainer").hide();
                    var msg = null;
                    if (xhr.status != 200) {
                      var msg = self.viewManager.getLocalizedHttpErrorMessage(
                          xhr, textStatus, response);
                    }
                    if (!msg) {
                      msg = chrome.i18n.getMessage("UnknownError");
                    }
                    $("#notesContextListErrorContainer").text(msg).show();
                  }
                });
            return false;
          },
          onAfterLoadPage : function(pageIndex, pageSize, totalPages) {
            /*
             * TODO: should address a different var if (pageIndex == 0 &&
             * Downsha.context.state.noteListScrollTop) { setTimeout(function() {
             * $("#notesContextList").scrollTo(Downsha.context.state.noteListScrollTop); },
             * Downsha.ChromePopup.NOTELIST_SCROLLTO_DELAY); }
             */
          },
          items : function() {
            var items = new Array();
            if (noteContextList) {
              for ( var i = 0; i < noteContextList.notes.length; i++) {
                items[noteContextList.startIndex + i] = (self
                    .createNoteListItem(noteContextList.notes[i], null));
              }
            }
            return items;
          }
        });
  };
  Downsha.ChromePopup.prototype.processNoteList = function(notes) {
    LOG.debug("ChromePopup.processNoteList");
    var fetchGuids = [];
    var obsolete = [];
    var snippetManager = Downsha.context.snippetManager;
    for ( var i = 0; i < notes.length; i++) {
      var n = notes[i];
      if (n instanceof Downsha.BasicNote) {
        var snippet = snippetManager.get(n.guid);
        if (snippet && snippet.updateSequenceNum != n.updateSequenceNum) {
          obsolete.push(n.guid);
        } else if (snippet) {
          notes[i] = Downsha.SnippetNoteMetadata.fromObject(n);
          notes[i].snippet = snippet.snippet;
        } else {
          fetchGuids.push(n.guid);
        }
      }
    }
    snippetManager.removeAll(obsolete);
    if (fetchGuids.length > 0) {
      this.doNoteSnippetSearch(fetchGuids);
    }
  };
  Downsha.ChromePopup.prototype.doNoteSnippetSearch = function(guids) {
    LOG.debug("ChromePopup.doNoteSnippetSearch");
    var self = this;
    var _guids = [].concat(guids);
    LOG.debug("Fetching snippets for guids: [" + _guids.length + "]");
    Downsha.context.remote
        .noteSnippets(
            _guids,
            this.constructor.SNIPPET_MAX_LENGTH,
            true,
            function(response, status, xhr) {
              if (response && response.isResult()) {
                var snippets = response.result.snippets;
                LOG.info("Successfully fetched snippets: [" + snippets.length
                    + "]");
                self.populateNoteSnippets(snippets);
              } else if (response && response.isError()) {
                LOG.error("Could not retrieve snippets");
                LOG.dir(response.errors);
              }
            },
            function(xhr, status, error) {
              if (xhr && xhr.readyState == 4) {
                LOG
                    .error("Failed to fetch snippets out due to transport errors (status: "
                        + xhr.status + ")");
              } else if (xhr) {
                LOG
                    .error("Failed to fetch snippets due to transport errors (readyState: "
                        + xhr.readyState + ")");
              } else {
                LOG
                    .error("Failed to fetch snippets due to unknown transport errors");
              }
            }, true);
  };

  Downsha.ChromePopup.prototype.populateNoteSnippets = function(snippets) {
    LOG.debug("ChromePopup.populateNoteSnippets");
    var _snippets = [].concat(snippets);
    for ( var i = 0; i < _snippets.length; i++) {
      var snippet = _snippets[i];
      if (snippet instanceof Downsha.Snippet) {
        $("#noteListItem_" + snippet.guid + " .noteListItemSnippet").text(
            snippet.snippet);
      }
    }
  };

  Downsha.ChromePopup.prototype.isClippableUrl = function(url) {
    if (typeof url == 'string') {
      var u = url.toLowerCase();
      if (u.indexOf("http") == 0) {
        return true;
      }
    }
    return false;
  };

  Downsha.ChromePopup.prototype.startUpWithSavedNote = function(tab) {
    LOG.debug("Popup.startUpWithSavedNote");
    var savedNote = Downsha.context.getAutoSavedNote(tab.id);
    if (savedNote) {
      savedNote = (savedNote instanceof Downsha.ClipNote) ? savedNote
          : new Downsha.ClipNote(savedNote);
      var viewOpts = {
        clipNote : savedNote
      };
      this.viewManager.switchView("quickNoteView", viewOpts);
    } else {
      LOG.warn("There was no note saved... starting afresh");
      this.startUpWithQuickNote(tab);
    }
  };

  Downsha.ChromePopup.prototype.startUpWithQuickNote = function(tab) {
    LOG.debug("Popup.startUpWithQuickNote");
    var viewOpts = {
      clipNote : new Downsha.ClipNote(),
      fullPageEnabled : false
    };
    if (tab
        && typeof tab.title == 'string'
        && (typeof tab.url != 'string' || (typeof tab.url == 'string' && tab.title != tab.url))) {
      viewOpts.clipNote.title = tab.title;
    }
    if (tab && typeof tab.url == 'string') {
      viewOpts.clipNote.url = tab.url;
    }
    if (Downsha.context.getPreferredNotebook()) {
      viewOpts.notebookGuid = Downsha.context.getPreferredNotebook().guid;
    }
    this.viewManager.switchView("quickNoteView", viewOpts);
  };

  Downsha.ChromePopup.prototype.startUp = function() {
    LOG.debug("Popup.startUp");
    var self = this;
    chrome.extension.sendRequest(new Downsha.RequestMessage(
        Downsha.Constants.RequestType.POPUP_STARTED));
    var pageInfo = new Downsha.PageInfo();
    if (!Downsha.Utils.isForbiddenUrl(this.tab.url)) {
      pageInfo.profile(this.tab.id, function() {
        LOG.debug("Finished getting PageInfo");
      });
    } else {
      this.handlePageInfo(new Downsha.RequestMessage(
          Downsha.Constants.RequestType.PAGE_INFO, {
            pageInfo : pageInfo
          }), this, function() {
      });
    }
  };

  Downsha.ChromePopup.prototype._startUp = function() {
    LOG.debug("ChromePopup._startUp");
    this.popupStatus = Downsha.ChromePopup.POPUP_STATUS_CODES.STARTED;
    if (Downsha.context.hasAutoSavedNote(this.tab.id)) {
      this.startUpWithSavedNote(this.tab);
    } else {
      this.startUpWithQuickNote(this.tab);
    }
  };

  Downsha.ChromePopup.prototype.handlePageInfo = function(request, sender,
      sendResponse) {
    var requestMessage = Downsha.RequestMessage.fromObject(request);
    if (requestMessage.message && requestMessage.message.pageInfo) {
      this.pageInfo = requestMessage.message.pageInfo;
      this._startUp();
    }
    sendResponse( {});
  };

  Downsha.ChromePopup.prototype.updateBadge = function() {
    var self = this;
    Downsha.Utils.updateBadge(Downsha.context);
  };

  Downsha.ChromePopup.prototype.getSearchHelper = function() {
    if (!this._searchHelper) {
      this._searchHelper = chrome.extension.getBackgroundPage().Downsha.SearchHelper
          .getInstance(this.tab.id);
    }
    return this._searchHelper;
  };

  Downsha.ChromePopup.prototype.isArticleSane = function() {
    if (this.pageInfo && this.pageInfo.articleBoundingClientRect) {
      var pageArea = this.pageInfo.documentWidth * this.pageInfo.documentHeight;
      LOG.debug("PageArea: " + pageArea);
      var articleArea = this.pageInfo.articleBoundingClientRect.width
          * this.pageInfo.articleBoundingClientRect.height;
      LOG.debug("ArticleArea: " + articleArea);
      if (this.pageInfo.articleBoundingClientRect.top > this.pageInfo.documentHeight
          * this.constructor.MAX_ARTICLE_XOFFSET_RATIO) {
        LOG
            .debug("Article is not sane because it lies below admissable x-offset ratio");
        return false;
      } else if (articleArea < this.constructor.MIN_ARTICLE_AREA
          && articleArea < (pageArea * this.constructor.MIN_ARTICLE_RATIO)) {
        LOG.debug("Article is not sane because its area is not satisfactory");
        return false;
      } else {
        return true;
      }
    }
    return false;
  };

  Downsha.ChromePopup.prototype.getNotebooks = function() {
    if (this._notebooks == null) {
      this._notebooks = Downsha.context.getNotebooks(true);
    }
    return this._notebooks;
  };
  Downsha.ChromePopup.prototype.getTags = function() {
    if (this._tags == null) {
      this._tags = Downsha.context.getTags(true);
    }
    return this._tags;
  };
  Downsha.ChromePopup.prototype.getSearches = function() {
    if (this._searches == null) {
      this._searches = Downsha.context.getSearches(true);
    }
    return this._searches;
  };
})();


(function() {
  var LOG = null;

  Downsha.ChromeLogViewer = function ChromeLogViewer() {
    LOG = Downsha.chromeExtension.logger;
    this.__defineGetter__("logFiles", this.getLogFiles);
    this.__defineSetter__("logFiles", this.setLogFiles);
    this.initialize();
  };

  Downsha.ChromeLogViewer.LOG_DIR = "/logs";
  Downsha.ChromeLogViewer.MONITOR_INTERVAL = 10 * 1000;

  Downsha.ChromeLogViewer.prototype._sema = null;
  Downsha.ChromeLogViewer.prototype._fsa = null;
  Downsha.ChromeLogViewer.prototype._logFiles = null;
  Downsha.ChromeLogViewer.prototype._logViewerMonitor = null;
  Downsha.ChromeLogViewer.prototype._extensionManifest = null;

  Downsha.ChromeLogViewer.prototype.initialize = function() {
    this._sema = Downsha.Semaphore.mutex();
    this.initializeUI();
    this.initializeFSA();
    this.initBindings();
    var self = this;
    this._sema.critical(function() {
      Downsha.context.remote.getJson("/manifest.json", {}, function(manifest,
          status, xhr) {
        LOG.debug("Successfully retrieved extension manifest");
        self._extensionManifest = manifest;
        self._sema.signal();
      }, function(xhr, status, err) {
        var errStr = "";
        try {
          errStr = Downsha.Utils.extractHttpErrorMessage(xhr, status, err);
        } catch (e) {
          errStr = "UNKNOWN";
        }
        LOG.error("Error retrieving extension manifest: " + errStr);
        self._sema.signal();
      }, false);
    });
  };

  Downsha.ChromeLogViewer.prototype.initializeUI = function() {
    var self = this;
    var selector = this.getLogSelector();
    if (selector) {
      selector.bind("change", function() {
        self.handleLogSelection();
      });
    }
    var follow = this.getFollow();
    follow.bind("click", function() {
      var $this = $(this);
      if ($this.attr("checked")) {
        self.scrollToBottom();
      }
    });
    var refreshRate = this.getRefreshRate();
    refreshRate.bind("change", function() {
      self.stopLogMonitor();
      self.monitorLogViewer();
    });
    var deleter = this.getDeleter();
    deleter.bind("click", function() {
      self.deleteLogFiles();
    });
    var exporter = this.getExporter();
    exporter.bind("click", function() {
      self.exportLogFiles();
    });
    this.disableUIControls();
  };

  Downsha.ChromeLogViewer.prototype.initializeFSA = function() {
    var self = this;
    this._sema.critical(function() {
      self._fsa = new Downsha.FSA(PERSISTENT, 1024, function() {
        self._fsa.getCreateDirectory(self.constructor.LOG_DIR, function(
            dirEntry) {
          self._fsa.changeDirectory(self.constructor.LOG_DIR,
              function(dirEntry) {
                self._initializeLogFiles();
                self._sema.signal();
              }, self.onfsaerror);
        }, self.onfsaerror);
      }, function(err) {
        self._sema.signal();
        self.onfsaerror(err);
      });
    });
  };

  Downsha.ChromeLogViewer.prototype.initBindings = function() {
    var self = this;
    chrome.extension.onRequest
        .addListener(function(request, sender, sendResponse) {
          var req = Downsha.RequestMessage.fromObject(request);
          LOG.debug("Received request: " + req.code);
          if (req.code == Downsha.Constants.RequestType.LOG_FILE_SWAPPED
              && self.getFollow().attr("checked")) {
            LOG
                .debug("Re-initializing with new set of log files, cuz logs got swapped");
            self._initializeLogFiles();
          }
          sendResponse( {});
        });
  };

  Downsha.ChromeLogViewer.prototype._initializeLogFiles = function() {
    var self = this;
    this._fsa.listFiles(self.constructor.LOG_DIR, function(entries) {
      self.setUpdateLogFiles(entries);
    }, self.onfsaerror);
  };
  Downsha.ChromeLogViewer.prototype.onfsaerror = function(err) {
      var msg = Downsha.Utils.errorDescription(err);
      LOG.exception(msg);
      alert(msg);
  };
  Downsha.ChromeLogViewer.prototype.setLogFiles = function(entryArray) {
    this._logFiles = entryArray;
  };
  Downsha.ChromeLogViewer.prototype.getLogFiles = function() {
    return this._logFiles;
  };
  Downsha.ChromeLogViewer.prototype.setUpdateLogFiles = function(entryArray) {
    this.logFiles = (entryArray && entryArray.length > 0) ? entryArray : null;
    this.populateLogSelector(this.logFiles);
    if (this.logFiles && this.logFiles.length > 0) {
      this.enableUIControls();
    } else {
      this.disableUIControls();
    }
  };
  Downsha.ChromeLogViewer.prototype.populateLogSelector = function(entries) {
    var selector = this.getLogSelector();
    if (selector && entries) {
      selector.empty();
      var lastEntry = null;
      for ( var i = 0; i < entries.length; i++) {
        if (entries[i].name) {
          var entry = $("<option value='" + entries[i].name + "'>"
              + entries[i].name + "</option>");
          selector.append(entry);
          lastEntry = entries[i];
        }
      }
      if (lastEntry) {
        selector.val(lastEntry.name);
      }
      if (selector.val()) {
        this.viewLog(selector.val());
      }
    } else if (selector) {
      selector.empty();
      var emptyOpt = $("<option value=''>"
          + chrome.i18n.getMessage("log_noLogsFound") + "</option>");
      selector.append(emptyOpt);
      this.viewLog(null);
    }
  };
  Downsha.ChromeLogViewer.prototype.getLogSelection = function() {
    var selector = this.getLogSelector();
    return selector.val();
  };
  Downsha.ChromeLogViewer.prototype.handleLogSelection = function() {
    var logName = this.getLogSelection();
    if (logName) {
      this.viewLog(logName);
    }
  };
  Downsha.ChromeLogViewer.prototype.viewLog = function(logName) {
    var self = this;
    if (logName) {
      var spinner = this.getSpinner();
      spinner.show();
      this._sema.critical(function() {
        self._fsa.readTextFile(logName, function(reader) {
          var viewer = self.getLogViewer();
          viewer.data( {
            logName : logName
          });
          viewer.text(reader.result);
          if (self.isFollowing()) {
            self.scrollToBottom();
          }
          self._sema.signal();
          spinner.hide();
          self.monitorLogViewer();
        }, self.onfsaerror);
      });
    } else {
      var viewer = this.getLogViewer();
      viewer.data( {
        logName : null
      });
      viewer.text(chrome.i18n.getMessage("log_noLogSelected"));
    }
  };
  Downsha.ChromeLogViewer.prototype.deleteLogFiles = function() {
    var self = this;
    var spinner = this.getSpinner();
    var ok = function() {
      self._sema.signal();
      spinner.hide();
      self.setAllSelected(false);
      self._initializeLogFiles();
    };
    var err = function(e) {
      self._sema.signal();
      alert("Error exporting log files: " + (e && e.code) ? e.code : e);
    };
    var cancel = function() {
      self._sema.signal();
      spinner.hide();
    };
    spinner.show();
    this._sema.critical(function() {
      if (self.isAllSelected()) {
        self._fsa.listFiles(self.constructor.LOG_DIR, function(fileEntries) {
          var yn = confirm(chrome.i18n.getMessage("logs_confirmDeleteFiles",
              [ fileEntries.length ]));
          if (yn) {
            self._deleteFileArray(fileEntries, ok, err);
          } else {
            cancel();
          }
        });
      } else if (self.getLogSelection()) {
        var logName = self.getLogSelection();
        self._fsa.getFile(self.constructor.LOG_DIR + "/" + logName, function(
            fileEntry) {
          var yn = confirm(chrome.i18n.getMessage("logs_confirmDeleteFiles",
              [ 1 ]));
          if (yn) {
            self._deleteFileArray( [ fileEntry ], ok, err);
          } else {
            cancel();
          }
        }, err);
      } else {
        alert(chrome.i18n.getMessage("log_noLogSelected"));
      }
    });
  };
  Downsha.ChromeLogViewer.prototype._deleteFileArray = function(fileArray,
      success, error) {
    var ok = function() {
      if (typeof success == 'function') {
        success();
      }
    };
    var err = function(e) {
      if (typeof error == 'function') {
        error(e);
      }
    };
    var remover = function(fArray, callback, index) {
      index = (index) ? index : 0;
      if (index >= fArray.length) {
        if (typeof callback == 'function') {
          callback();
        }
        return;
      }
      fArray[index].remove(function() {
        chrome.extension.sendRequest(
            new Downsha.RequestMessage(
                Downsha.Constants.RequestType.LOG_FILE_REMOVED,
                fArray[index].name), function() {
              remover(fArray, callback, ++index);
            });
      }, err);
    };
    remover(fileArray, ok);
  };
  Downsha.ChromeLogViewer.prototype.monitorLogViewer = function() {
    var self = this;
    var refreshRate = this.getRefreshRateValue();
    if (!this._logViewerMonitor && refreshRate >= 1000) {
      this._logViewerMonitor = setInterval(function() {
        var viewer = self.getLogViewer();
        if (viewer && viewer.data() && viewer.data().logName) {
          self.viewLog(viewer.data().logName);
        }
      }, refreshRate);
    } else if (refreshRate < 1000) {
      this.stopLogMonitor();
    }
  };
  Downsha.ChromeLogViewer.prototype.stopLogMonitor = function() {
    if (this._logViewerMonitor) {
      clearInterval(this._logViewerMonitor);
      this._logViewerMonitor = null;
    }
  };
  Downsha.ChromeLogViewer.prototype.getRefreshRateValue = function() {
    var refreshRate = this.getRefreshRate();
    var val = 0;
    if (refreshRate.val()) {
      val = parseInt(refreshRate.val());
      if (isNaN(val)) {
        val = 0;
      }
    }
    return val;
  };
  Downsha.ChromeLogViewer.prototype._getExportHeader = function() {
    var str = "";
    str += "Navigator: " + navigator.userAgent + "\n";
    str += "Id: " + chrome.i18n.getMessage("@@extension_id") + "\n";
    str += "Version: "
        + ((this._extensionManifest) ? this._extensionManifest.version
            : "undefined") + "\n";
    str += "Export date: " + new Date().toString() + "\n";
    str += "\n";
    return str;
  };
  Downsha.ChromeLogViewer.prototype.exportLogFiles = function() {
    var self = this;
    var spinner = this.getSpinner();
    var ok = function() {
      self._sema.signal();
      spinner.hide();
      self.setAllSelected(false);
    };
    var err = function(e) {
      self._sema.signal();
      alert("Error exporting log files: " + (e && e.code) ? e.code : e);
    };
    spinner.show();
    this._sema.critical(function() {
      if (self.isAllSelected()) {
        self._fsa.listFiles(self.constructor.LOG_DIR, function(files) {
          Downsha.FSA.sortEntries(files, function(f, cb) {
            f.getMetadata(function(meta) {
              cb(meta.modificationTime.getTime(), f);
            });
          }, function(a, b, fileArray, fileMap) {
            if (a == b) {
              return 0;
            } else if (a > b) {
              return -1;
            } else {
              return 1;
            }
          }, function(filesArray) {
            self._exportFileArray(filesArray, ok, err);
          });
        }, err);
      } else if (self.getLogSelection()) {
        var fname = self.getLogSelection();
        self._fsa.getFile(self.constructor.LOG_DIR + "/" + fname, function(
            fileEntry) {
          self._exportFileArray( [ fileEntry ], ok, err);
        }, err);
      } else {
        alert(chrome.i18n.getMessage("log_noLogSelected"));
      }
    });
  };
  Downsha.ChromeLogViewer.prototype._exportFileArray = function(fileArray,
      success, error) {
    var self = this;
    var header = this._getExportHeader();
    var zip = new JSZip("DEFLATE");
    var ok = function() {
      if (typeof success == 'function') {
        success();
      }
    };
    var err = function(e) {
      if (typeof error == 'function') {
        error(e);
      }
    };
    var cat = function(fArray, callback, index) {
      index = (index) ? index : 0;
      if (index >= fArray.length) {
        if (typeof callback == 'function') {
          callback();
        }
      } else {
        fArray[index].file(function(file) {
          var reader = new FileReader();
          reader.onerror = err;
          reader.onloadend = function() {
            zip.add(file.name, header + reader.result);
            cat(fArray, callback, ++index);
          };
          reader.readAsText(file);
        }, err);
      }
    };
    cat(fileArray, function() {
      content = zip.generate();
      ok();
      location.href = "data:application/zip;base64," + content;
    });
  };
  Downsha.ChromeLogViewer.prototype.scrollToBottom = function() {
    window.scrollTo(0, document.body.getBoundingClientRect().height);
  };
  Downsha.ChromeLogViewer.prototype.getLogSelector = function() {
    return $("#logSelector");
  };
  Downsha.ChromeLogViewer.prototype.getLogViewer = function() {
    return $("#logViewer");
  };
  Downsha.ChromeLogViewer.prototype.getSpinner = function() {
    return $("#spinner");
  };
  Downsha.ChromeLogViewer.prototype.getFollow = function() {
    return $("#logFollow");
  };
  Downsha.ChromeLogViewer.prototype.isFollowing = function() {
    return (this.getFollow().attr("checked")) ? true : false;
  };
  Downsha.ChromeLogViewer.prototype.getRefreshRate = function() {
    return $("#logRefreshRate");
  };
  Downsha.ChromeLogViewer.prototype.getDeleter = function() {
    return $("#logDelete");
  };
  Downsha.ChromeLogViewer.prototype.getExporter = function() {
    return $("#logExport");
  };
  Downsha.ChromeLogViewer.prototype.getAllSelector = function() {
    return $("#logAll");
  };
  Downsha.ChromeLogViewer.prototype.isAllSelected = function() {
    return (this.getAllSelector().attr("checked")) ? true : false;
  };
  Downsha.ChromeLogViewer.prototype.setAllSelected = function(bool) {
    if (bool) {
      this.getAllSelector().attr("checked", "checked");
    } else {
      this.getAllSelector().removeAttr("checked");
    }
  };
  Downsha.ChromeLogViewer.prototype.enableUIControls = function() {
    $(":input").removeAttr("disabled");
  };
  Downsha.ChromeLogViewer.prototype.disableUIControls = function() {
    $(":input").attr("disabled", "disabled");
  };
})();

(function() {
  var LOG = null;
  Downsha.ChromeUploadNotifier = function ChromeUploadNotifier() {
    LOG = Downsha.chromeExtension.logger;
    this.__defineGetter__("payloadGuid", this.getPayloadGuid);
    this.initialize();
  };
  Downsha.ChromeUploadNotifier.prototype._payloadGuid = null;
  Downsha.ChromeUploadNotifier.prototype._successIconElement = null;
  Downsha.ChromeUploadNotifier.prototype._errorIconElement = null;
  Downsha.ChromeUploadNotifier.prototype.ACTION_LIST_SEPARATOR = $("<span class='separator'>-</span>");
  Downsha.ChromeUploadNotifier.prototype.initialize = function() {
    var postData = Downsha.Utils.getPostData();
    if (typeof postData == 'object' && postData && postData.payload) {
      this._payloadGuid = postData.payload;
    }
    if (this._payloadGuid) {
      this.requestPayload();
    } else {
      this.showUnknownError();
    }
  };
  Downsha.ChromeUploadNotifier.prototype.setHeadline = function(str) {
    this.getNotificationHeadline().html(str);
  };
  Downsha.ChromeUploadNotifier.prototype.setDetails = function(str) {
    this.getNotificationDetails().html(str);
  };
  Downsha.ChromeUploadNotifier.prototype.requestPayload = function() {
    var self = this;
    var req = new Downsha.RequestMessage(
        Downsha.Constants.RequestType.GET_MANAGED_PAYLOAD, this.payloadGuid);
    Downsha.Utils.notifyExtension(req, function(payload) {
      LOG.debug("Handling Response callback after requesting managed payload");
      if (payload && payload.data) {
        payload.data = new Downsha.ClipNote(payload.data);
      }
      if (payload && payload.processResponse
          && payload.processResponse.response) {
        payload.processResponse.response = Downsha.EDAMResponse
            .fromObject(payload.processResponse.response);
      }
      self.payload = payload;
      self.notifyWithPayload(payload);
    });
  };
  Downsha.ChromeUploadNotifier.prototype.notifyWithPayload = function(payload) {
    LOG.debug("ChromeUploadNotifier.notifyWithPayload");
    var clipProcessor = Downsha.chromeExtension.clipProcessor;
    var clip = (payload && payload.data) ? payload.data : null;
    var error = chrome.i18n.getMessage("EDAMResponseError_1");
    if (payload && clip) {
      if (clipProcessor.isPayloadProcessed(payload)) {
        this.showClipSuccess(clip);
        return;
      } else if (payload.processResponse && payload.processResponse.response) {
        var response = Downsha.EDAMResponse
            .fromObject(payload.processResponse.response);
        if (response.hasAuthenticationError()) {
          LOG.debug("Response has authentication error");
          this.showAuthenticationError(clip);
          return;
        } else if (response.isError()) {
          LOG.debug("Response has errors");
          var responseErrors = response.getErrors();
          if (LOG.isDebugEnabled()) {
            LOG.dir(responseErrors);
          }
          var firstError = Downsha.DownshaError.fromObject(responseErrors[0]);
          error = Downsha.Utils.extractErrorMessage(firstError, error);
          this.showClipError(clip, error);
          return;
        }
      } else if (payload && payload.data && payload.data.sizeExceeded) {
        error = chrome.i18n.getMessage("pageClipTooBig");
        this.showClipError(clip, error);
        return;
      } else if (payload.processResponse
          && (clipProcessor._isResponseHTTPAbortError(payload.processResponse) || clipProcessor
              ._isResponseHTTPRetryError(payload.processResponse))) {
        error = Downsha.Utils.extractHttpErrorMessage(
            payload.processResponse.xhr, payload.processResponse.textStatus,
            payload.processResponse.error);
        this.showClipError(clip, error);
        return;
      }
    }
    this.showUnknownError();
  };
  Downsha.ChromeUploadNotifier.prototype.showClipSuccess = function(clip) {
    this.clear();
    this.showSuccessIcon();
    var _title = (clip && clip.title) ? clip.title : "";
    this.setHeadline(chrome.i18n.getMessage("desktopNotification_clipUploaded",
        [ _title ]));
    /*
     * this.setDetails(chrome.i18n
     * .getMessage("desktopNotification_clipUploadedMessage"));
     */
    this.showSuccessActions(clip, true, true);
  };
  Downsha.ChromeUploadNotifier.prototype.showAuthenticationError = function(
      clip) {
    this.clear();
    this.showErrorIcon();
    this.setHeadline(chrome.i18n.getMessage(
        "desktopNotification_clipProcessorSignInTitle",
        [ ((clip && clip.title) ? clip.title : "") ]));
    this.setDetails(chrome.i18n
        .getMessage("desktopNotification_clipProcessorSignInMessage"));
    this.showErrorActions(clip, true, false, true);
  };
  Downsha.ChromeUploadNotifier.prototype.showUnknownError = function() {
    this.clear();
    this.showErrorIcon();
    this.setHeadline(chrome.i18n
        .getMessage("desktopNotification_unableToSaveClipUnknown"));
    this.setDetails(chrome.i18n
        .getMessage("desktopNotification_unableToSaveClipUnknownMessage"));
  };
  Downsha.ChromeUploadNotifier.prototype.showClipError = function(clip, error) {
    LOG.debug("ChromeUploadNotifier.showError");
    var self = this;
    this.clear();
    this.showErrorIcon();
    this.setHeadline(chrome.i18n.getMessage(
        "desktopNotification_unableToSaveClip",
        [ ((clip && clip.title) ? clip.title : "") ]));
    this.setDetails(error);
    this.showErrorActions(clip, true, true, true);
  };
  Downsha.ChromeUploadNotifier.prototype.showSuccessActions = function(clip,
      showView, showEdit) {
    var self = this;
    var actions = this.getNotificationActions();
    var list = [];
    if (showView) {
      var viewAction = $("<a href='javascript:'></a>");
      viewAction.text(chrome.i18n
          .getMessage("desktopNotification_viewSuccessClip"));
      viewAction.bind("click", function() {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.VIEW_MANAGED_PAYLOAD_DATA,
            self.payloadGuid));
      });
      list.push(viewAction);
    }
    if (showEdit) {
      var editAction = $("<a href='javascript:'></a>");
      editAction.text(chrome.i18n
          .getMessage("desktopNotification_editSuccessClip"));
      editAction.bind("click", function() {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.EDIT_MANAGED_PAYLOAD_DATA,
            self.payloadGuid));
      });
      list.push(editAction);
    }
    this._appendList(actions, list, this.ACTION_LIST_SEPARATOR);
  };
  Downsha.ChromeUploadNotifier.prototype.showErrorActions = function(clip,
      showView, showRetry, showCancel) {
    var self = this;
    var actions = this.getNotificationActions();
    var list = [];
    if (showView) {
      var viewAction = $("<a href='javascript:'></a>");
      viewAction.text(chrome.i18n
          .getMessage("desktopNotification_viewFailedClip"));
      viewAction.bind("click", function() {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.REVISIT_MANAGED_PAYLOAD,
            self.payloadGuid));
      });
      list.push(viewAction);
    }
    if (showRetry) {
      var retryAction = $("<a href='javascript:'></a>");
      retryAction.text(chrome.i18n
          .getMessage("desktopNotification_retryFailedClip"));
      retryAction.bind("click", function() {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.RETRY_MANAGED_PAYLOAD,
            self.payloadGuid));
      });
      list.push(retryAction);
    }
    if (showCancel) {
      var cancelAction = $("<a href='javascript:'></a>");
      cancelAction.text(chrome.i18n
          .getMessage("desktopNotification_cancelFailedClip"));
      cancelAction.bind("click", function() {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.CANCEL_MANAGED_PAYLOAD,
            self.payloadGuid));
      });
      list.push(cancelAction);
    }
    this._appendList(actions, list, this.ACTION_LIST_SEPARATOR);
  };
  Downsha.ChromeUploadNotifier.prototype._appendList = function(container,
      list, separator) {
    for ( var i = 0; i < list.length; i++) {
      container.append(list[i]);
      if (i + 1 < list.length && separator) {
        container.append(separator.clone());
      }
    }
  };
  Downsha.ChromeUploadNotifier.prototype.clear = function() {
    this.getNotificationHeadline().empty();
    this.getNotificationDetails().empty();
    this.getNotificationActions().empty();
  };
  Downsha.ChromeUploadNotifier.prototype.showSuccessIcon = function() {
    this.getErrorIcon().hide();
    this.getSuccessIcon().show();
  };
  Downsha.ChromeUploadNotifier.prototype.showErrorIcon = function() {
    this.getSuccessIcon().hide();
    this.getErrorIcon().show();
  };
  Downsha.ChromeUploadNotifier.prototype.getPayloadGuid = function() {
    return this._payloadGuid;
  };
  Downsha.ChromeUploadNotifier.prototype.getNotificationHeadline = function() {
    return $("#notificationHeadline");
  };
  Downsha.ChromeUploadNotifier.prototype.getNotificationDetails = function() {
    return $("#notificationDetails");
  };
  Downsha.ChromeUploadNotifier.prototype.getNotificationActions = function() {
    return $("#notificationActions");
  };
  Downsha.ChromeUploadNotifier.prototype.getSuccessIcon = function() {
    return $("#successIcon");
  };
  Downsha.ChromeUploadNotifier.prototype.getErrorIcon = function() {
    return $("#errorIcon");
  };
})();

(function() {
  var LOG = null;

  Downsha.ContentScriptingMixin = function ContentScriptingMixin() {
  };
  Downsha.ContentScriptingMixin.prototype.startScriptTimer = function(tabId,
      timeoutCallback, t) {
    LOG = LOG
        || Downsha.chromeExtension.getLogger(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.startScriptTimer");
    return setTimeout(function() {
      LOG.debug("Content script load/execution timed out");
      if (typeof timeoutCallback == 'function') {
        timeoutCallback(tabId);
      }
    }, t);
  };
  Downsha.ContentScriptingMixin.prototype.stopScriptTimer = function(timerId) {
    LOG = LOG
        || Downsha.chromeExtension.getLogger(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.stopScriptTimer");
    if (typeof timerId == 'number') {
      LOG.debug("Cancelling load timer");
      clearTimeout(timerId);
    }
  };
  Downsha.ContentScriptingMixin.prototype.executeScript = function(tabId,
      scriptObj, oncomplete) {
    LOG = LOG
        || Downsha.chromeExtension.getLogger(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.executeScript");
    if (typeof tabId != 'number')
      tabId = null;
    this.doExecuteScript(tabId, scriptObj, null, oncomplete);
  };
  Downsha.ContentScriptingMixin.prototype.executeTimedScript = function(tabId,
      scriptObj, timeout, oncomplete, ontimeout) {
    LOG = LOG
        || Downsha.chromeExtension.getLogger(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.executeTimedScript");
    if (typeof tabId != 'number')
      tabId = null;
    if (typeof timeout != 'number') {
      timeout = 0;
    }
    var timer = 0;
    var self = this;
    this.doExecuteScript(tabId, scriptObj, function() {
      LOG.debug("Starting page clip timer");
      timer = self.startScriptTimer(tabId, ontimeout, timeout);
    }, function() {
      self.stopScriptTimer(timer);
      if (typeof oncomplete == 'function') {
        oncomplete();
      }
    });
  };
  Downsha.ContentScriptingMixin.prototype.doExecuteScript = function(tabId,
      scriptObj, onstart, oncomplete) {
    LOG = LOG
        || Downsha.chromeExtension.getLogger(Downsha.ContentScriptingMixin);
    LOG.debug("ContentScriptingMixin.doExecuteScript");
    if (typeof tabId != 'number')
      tabId = null;
    if (typeof onstart == 'function') {
      LOG.debug("Executing onstart");
      onstart();
    }
    LOG.debug("Executing code in tab");
    chrome.tabs.executeScript(tabId, scriptObj, function() {
      if (typeof oncomplete == 'function') {
        oncomplete();
      }
    });
  };
})();

(function() {
  var LOG = null;

  /**
   * Map of various states of this controller.
   */
  var ContentScriptingStatus = {
    UNKNOWN : 0,
    LOADING : 1,
    LOADED : 2,
    EXECUTING : 3,
    FINISHED : 4,
    TIMEDOUT : 5,
    ERROR : 6
  };

  Downsha.AbstractContentScripting = function AbstractContentScripting() {
    LOG = Downsha.chromeExtension.logger;
    this.initialize();
  };

  Downsha.mixin(Downsha.AbstractContentScripting,
      Downsha.ContentScriptingMixin, {
        "executeScript" : "mixinExecuteScript",
        "executeTimedScript" : "mixinExecuteTimedScript",
        "doExecuteScript" : "mixinDoExecuteScript"
      });

  Downsha.AbstractContentScripting.prototype._status = null;
  Downsha.AbstractContentScripting.prototype._sema = null;
  Downsha.AbstractContentScripting.TIMEOUT = 10000;

  Downsha.AbstractContentScripting.prototype.initialize = function() {
    LOG.debug("AbstractContentScripting.initialize");
    this._status = {};
    this._sema = Downsha.Semaphore.mutex();
    this.initializeTabListeners();
  };

  Downsha.AbstractContentScripting.prototype.initializeTabListeners = function() {
    this.initializeTabUpdateListener();
    this.initializeTabRemoveListener();
  };

  Downsha.AbstractContentScripting.prototype.initializeTabUpdateListener = function() {
    var self = this;
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      LOG.debug("chrome.extension.onUpdated: " + tabId);
      self.handleTabUpdate(tabId, changeInfo, tab);
    });
  };
  Downsha.AbstractContentScripting.prototype.initializeTabRemoveListener = function() {
    var self = this;
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      LOG.debug("chrome.extension.onRemoved: " + tabId);
      self.handleTabRemove(tabId, removeInfo);
    });
  };

  Downsha.AbstractContentScripting.prototype.handleTabUpdate = function(tabId,
      changeInfo, tab) {
    LOG.debug("AbstractContentScripting.handleTabUpdate");
    if (changeInfo && changeInfo.status == "loading") {
      LOG.debug("Forgetting tabId: " + tabId);
      this.forgetTab(tabId);
    }
  };

  Downsha.AbstractContentScripting.prototype.handleTabRemove = function(tabId,
      removeInfo) {
    LOG.debug("AbstractContentScripting.handleTabRemove");
    this.forgetTab(tabId);
  };

  Downsha.AbstractContentScripting.prototype.getRequiredScriptNames = function() {
    return [];
  };

  Downsha.AbstractContentScripting.prototype.forgetTab = function(tabId) {
    LOG.debug("AbstractContentScripting.forgetTab: " + tabId);
    if (typeof tabId == 'number' && this._status[tabId]) {
      LOG.debug("Deleting remembered tabId: " + tabId);
      delete this._status[tabId];
    }
  };
  Downsha.AbstractContentScripting.prototype.setStatus = function(tabId,
      status) {
    LOG.debug("AbstractContentScripting.setStatus");
    if (typeof tabId == 'number') {
      LOG.debug("Setting status of tabId: " + tabId + " to " + status);
      this._status[tabId] = status;
    }
  };
  Downsha.AbstractContentScripting.prototype.getStatus = function(tabId) {
    if (typeof this._status[tabId] == 'number') {
      return this._status[tabId];
    } else {
      return 0;
    }
  };
  Downsha.AbstractContentScripting.prototype.isRequiredScriptsLoaded = function(
      tabId) {
    LOG.debug("AbstractContentScripting.isRequiredScriptsLoaded ("
        + this.getStatus(tabId) + ")");
    return (this.getRequiredScriptNames().length == 0 || this.getStatus(tabId) >= ContentScriptingStatus.LOADED);
  };
  Downsha.AbstractContentScripting.prototype.isRequiredScriptsLoading = function(
      tabId) {
    LOG.debug("AbstractContentScripting.isRquiredScriptsLoading ("
        + this.getStatus(tabId) + ")");
    return (this.getStatus(tabId) == ContentScriptingStatus.LOADING) ? true
        : false;
  };
  Downsha.AbstractContentScripting.prototype.loadRequiredScripts = function(
      tabId, callback) {
    LOG.debug("AbstractContentScripting.loadRequiredScripts");
    var self = this;
    this.setStatus(tabId, ContentScriptingStatus.LOADING);
    LOG.debug("Loading required scripts");
    self._loadRequiredScripts(tabId, function() {
      LOG.debug("Finished loading required scripts");
      self.setStatus(tabId, ContentScriptingStatus.LOADED);
      if (typeof callback == 'function') {
        LOG.debug("Executing callback after loading required scripts");
        callback();
      }
    }, self.ontimeout, self.getRequiredScriptNames());
  };
  Downsha.AbstractContentScripting.prototype._loadRequiredScripts = function(
      tabId, callback, ontimeout, scripts) {
    LOG.debug("AbstractContentScripting._loadRequiredScripts");
    var self = this;
    if (scripts && scripts.length > 0) {
      var script = scripts.shift();
      LOG.debug("Loading script: " + script + " with timeout of: "
          + this.constructor.TIMEOUT);
      this.mixinExecuteTimedScript(tabId, {
        file : script
      }, this.constructor.TIMEOUT, function() {
        LOG.debug("Loaded script: " + script);
        self._loadRequiredScripts(tabId, callback, ontimeout, scripts);
      }, function() {
        LOG.debug("Timed out after waiting for " + self.constructor.TIMEOUT
            + " ms for script to load: " + script);
        if (typeof ontimeout == 'function') {
          ontimeout(tabId);
        }
      });
    } else {
      LOG.debug("Finished loading scripts into tab: " + tabId);
      this.onload(tabId, callback);
    }
  };
  Downsha.AbstractContentScripting.prototype.getOnloadCode = function() {
    return "Downsha.Logger.setGlobalLevel(" + LOG.level + ");";
  };
  Downsha.AbstractContentScripting.prototype.onload = function(tabId, callback) {
    LOG.debug("AbstractContentScripting.onload");
    LOG.debug("Setting up Logger inside the content page");
    this.mixinDoExecuteScript(tabId, {
      code : this.getOnloadCode()
    }, null, function() {
      if (typeof callback == 'function') {
        LOG.debug("Executing callback after loading all required scripts");
        callback();
      }
    });
  };
  Downsha.AbstractContentScripting.prototype.ontimeout = function(tabId) {
    LOG.debug("AbstractContentScripting.ontimeout");
    Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
        Downsha.Constants.RequestType.CONTENT_SCRIPT_LOAD_TIMEOUT, {
          tabId : tabId
        }));
  };
  Downsha.AbstractContentScripting.prototype.ensureRequiredScripts = function(
      tabId) {
    LOG.debug("AbstractContentScripting.ensureRequiredScripts");
    if (!this.isRequiredScriptsLoaded(tabId)
        && !this.isRequiredScriptsLoading(tabId)) {
      LOG
          .debug("ContentScript wasn't injected yet, injecting it and then executing the callback (tabId: "
              + tabId + ";status: " + this.getStatus(tabId) + ")");
      try {
        this.loadRequiredScripts(tabId);
      } catch (e) {
        LOG.error(e);
      }
    }
  };
  Downsha.AbstractContentScripting.prototype.executeScript = function(tabId,
      scriptObject, oncomplete) {
    LOG.debug("AbstractContentScripting.executeScript");
    var self = this;
    this.ensureRequiredScripts(tabId);
    // this.mixinExecuteScript(tabId, scriptObject, oncomplete);
    this.doExecuteScript(tabId, scriptObject, function() {
      self.setStatus(tabId, ContentScriptingStatus.EXECUTING);
    }, function() {
      self.setStatus(tabId, ContentScriptingStatus.FINISHED);
      if (typeof oncomplete == 'function') {
        oncomplete();
      }
    });
  };
  Downsha.AbstractContentScripting.prototype.executeTimedScript = function(
      tabId, scriptObject, timeout, oncomplete, ontimeout) {
    LOG.debug("AbstractContentScripting.executeTimedScript");
    var self = this;
    this.ensureRequiredScripts(tabId);
    this.mixinExecuteTimedScript(tabId, scriptObject, timeout, function() {
      self.setStatus(tabId, ContentScriptingStatus.EXECUTING);
      if (typeof oncomplete == 'function') {
        oncomplete();
      }
    }, function() {
      self.setStatus(tabId, ContentScriptingStatus.TIMEDOUT);
      if (typeof ontimeout == 'function') {
        ontimeout(tabId);
      }
    });
  };
  Downsha.AbstractContentScripting.prototype._logTabInfo = function(tabId) {
    chrome.tabs.get(tabId, function(tab) {
      LOG.debug(tab.url);
    });
  };
  Downsha.AbstractContentScripting.prototype.doExecuteScript = function(tabId,
      scriptObject, onstart, oncomplete) {
    LOG.debug("AbstractContentScripting.doExecuteScript(" + tabId + ")");
    var self = this;
    LOG
        .debug(" > Sema: " + this._sema._excessSignals + ":"
            + this._sema.length);
    this._sema
        .critical(function() {
          try {
            if (scriptObject.file) {
              LOG.debug("Executing content script from file: "
                  + scriptObject.file);
            } else if (scriptObject.code) {
              LOG.debug("Executing content script: " + scriptObject.code);
            }
            // self.setStatus(tabId, ContentScriptingStatus.EXECUTING);
            if (LOG.isDebugEnabled()) {
              self._logTabInfo(tabId);
            }
            self.mixinDoExecuteScript(tabId, scriptObject, onstart, function() {
              // self.setStatus(tabId, ContentScriptingStatus.FINISHED);
                self._sema.signal();
                if (typeof oncomplete == 'function') {
                  oncomplete();
                }
              });
          } catch (e) {
            self.setStatus(tabId, ContentScriptingStatus.ERROR);
            LOG.error(e);
            self._sema.signal();
          }
        });
    LOG
        .debug(" < Sema: " + this._sema._excessSignals + ":"
            + this._sema.length);
  };
})();


(function() {
  var LOG = null;
  Downsha.ClipperContentScripting = function ClipperContentScripting() {
    LOG = Downsha.chromeExtension.logger;
    this.initialize();
  };

  Downsha.inherit(Downsha.ClipperContentScripting,
      Downsha.AbstractContentScripting, true);

  Downsha.ClipperContentScripting.CONTENT_SCRIPTS = [ "/libs/downsha-cr/downshaContentClipper.js" ];

  Downsha.ClipperContentScripting.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };

  Downsha.ClipperContentScripting.prototype.createInstance = function() {
    var code = "Downsha.ContentClipper.destroyInstance();";
    code += "Downsha.ContentClipper.getInstance();";
  };

  Downsha.ClipperContentScripting.prototype.clipFullPage = function(tabId,
      stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.clipFullPage");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : null;
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().clipFullPage("
        + _stylingStrategy + ", " + _attrsString + "," + _showWait + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };
  Downsha.ClipperContentScripting.prototype.clipSelection = function(tabId,
      stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.clipSelection");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : null;
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().clipSelection("
        + _stylingStrategy + ", " + _attrsString + ", " + _showWait + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };
  Downsha.ClipperContentScripting.prototype.clipArticle = function(tabId,
      stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.clipArticle");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : "null";
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().clipArticle("
        + _stylingStrategy + ", " + _attrsString + ", " + _showWait + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };

  Downsha.ClipperContentScripting.prototype.perform = function(tabId,
      fullPageOnly, stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.perform(" + tabId + ", " + fullPageOnly
        + ", " + stylingStrategy + ", " + showWait + ")");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _fullPageOnly = (fullPageOnly) ? "true" : "false";
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : null;
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().perform(" + _fullPageOnly
        + ", " + _stylingStrategy + ", " + _attrsString + ", " + _showWait
        + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };

  Downsha.ClipperContentScripting.prototype._wait = function(tabId) {
    this.executeScript(tabId, {
      code : "Downsha.ContentClipper.getInstance().wait();"
    });
  };
  Downsha.ClipperContentScripting.prototype._clearWait = function() {
    this.executeScript(tabId, {
      code : "Downsha.ContentClipper.getInstance().clearWait();"
    });
  };

})();

/*
 * Downsha
 * Downsha
 * 
 * Created by Pavel Skaldin on 2/23/10
 * Copyright 2010 Downsha Corp. All rights reserved.
 */

(function() {
  var LOG = null;

  /**
   * SearchHelperImplFactory
   */
  Downsha.SearchHelperImplFactory = {
    getImplementationFor : function(url) {
      var reg = Downsha.SearchHelperImpl.ClassRegistry;
      for ( var i = 0; i < reg.length; i++) {
        if (typeof reg[i] == 'function'
            && typeof reg[i].isResponsibleFor == 'function'
            && reg[i].isResponsibleFor(url)) {
          return reg[i];
        }
      }
      return null;
    }
  };

  /**
   * SearchHelperImpl
   */
  Downsha.SearchHelperImpl = function SearchHelperImpl(url) {
    this.__defineType__("searchHelper", Downsha.SearchHelper);
    this.initialize(url);
  };
  Downsha.mixin(Downsha.SearchHelperImpl, Downsha.DefiningMixin);
  Downsha.SearchHelperImpl.ClassRegistry = new Array();
  Downsha.SearchHelperImpl.isResponsibleFor = function(url) {
    return false;
  };
  Downsha.SearchHelperImpl.prototype.handleInheritance = function(child,
      parent) {
    Downsha.SearchHelperImpl.ClassRegistry.push(child);
  };
  Downsha.SearchHelperImpl.prototype.initialize = function(url) {
  };
  Downsha.SearchHelperImpl.prototype.getQuery = function() {
    return null;
  };
  Downsha.SearchHelperImpl.prototype.clear = function(tabId) {
  };
  Downsha.SearchHelperImpl.prototype.handleActive = function(tabId) {
  };
  Downsha.SearchHelperImpl.prototype.handleResult = function(tabId, result,
      resultUrl) {
  };
  Downsha.SearchHelperImpl.prototype.handleNoResult = function(tabId) {
  };
  Downsha.SearchHelperImpl.prototype.handleMissingAuthTokenError = function(
      tabId, loginUrl) {
  };
  Downsha.SearchHelperImpl.prototype.handleAuthenticationError = function(
      tabId, loginUrl) {
  };
  Downsha.SearchHelperImpl.prototype.handleErrors = function(tabId, errors) {
  };
  Downsha.SearchHelperImpl.prototype.handleTransportError = function(tabId,
      request) {
  };

  /**
   * SearchHelper
   */

  Downsha.SearchHelper = function SearchHelper(tabId, impl) {
    LOG = Downsha.chromeExtension.logger;
    this.initialize(tabId, impl);
  };

  Downsha.mixin(Downsha.SearchHelper, Downsha.DefiningMixin);

  Downsha.SearchHelper._instances = {};
  Downsha.SearchHelper.getInstance = function(tabId) {
    LOG = LOG || Downsha.chromeExtension.getLogger(Downsha.SearchHelper);
    LOG.debug("SearchHelper.getInstance");
    return this._instances[tabId];
  };
  Downsha.SearchHelper.createInstance = function(tabId, url) {
    LOG = LOG || Downsha.chromeExtension.getLogger(Downsha.SearchHelper);
    LOG.debug("SearchHelper.createInstance");
    if (this._instances[tabId]) {
      this._instances[tabId].abort();
    }
    var impl = Downsha.SearchHelperImplFactory.getImplementationFor(url);
    if (impl) {
      this._instances[tabId] = new Downsha.SearchHelper(tabId, new impl(url));
    } else {
      this.removeInstance(tabId);
    }
    return this._instances[tabId];
  };
  Downsha.SearchHelper.removeInstance = function(tabId) {
    LOG = LOG || Downsha.chromeExtension.getLogger(Downsha.SearchHelper);
    LOG.debug("SearchHelper.removeInstance: " + tabId);
    if (Downsha.SearchHelper._instances[tabId]) {
      delete Downsha.SearchHelper._instances[tabId];
    }
  };

  Downsha.SearchHelper._searchHelperContentScripting = null;
  Downsha.SearchHelper.getSearchHelperContentScripting = function() {
    if (!this._searchHelperContentScripting) {
      this._searchHelperContentScripting = new Downsha.SearchHelperContentScripting();
    }
    return this._searchHelperContentScripting;
  };
  Downsha.SearchHelper.__defineGetter__("searchHelperContentScripting",
      Downsha.SearchHelper.getSearchHelperContentScripting);

  Downsha.SearchHelper._searchSema = null;
  Downsha.SearchHelper.getSearchSema = function() {
    if (!this._searchSema) {
      this._searchSema = Downsha.Semaphore.mutex();
    }
    return this._searchSema;
  };
  Downsha.SearchHelper.__defineGetter__("searchSema",
      Downsha.SearchHelper.getSearchSema);

  Downsha.SearchHelper.abortAll = function() {
    for ( var i in Downsha.SearchHelper._instances) {
      var sh = Downsha.SearchHelper._instances[i];
      if (sh) {
        sh.abort();
        sh.reset();
      }
    }
  };

  Downsha.SearchHelper.reset = function() {
    Downsha.SearchHelper.abortAll();
    Downsha.SearchHelper._instances = {};
  };

  Downsha.SearchHelper.prototype._request = null;
  Downsha.SearchHelper.prototype._response = null;
  Downsha.SearchHelper.prototype._result = null;
  Downsha.SearchHelper.prototype._searchProc = null;
  Downsha.SearchHelper.prototype._query = null;

  Downsha.SearchHelper.prototype.initialize = function(tabId, impl) {
    this.__defineType__("sema", Downsha.Semaphore);
    this.__defineType__("impl", Downsha.SearchHelperImpl);
    this.__defineGetter__("query", this.getQuery);
    this.__defineSetter__("query", this.setQuery);
    this.__defineType__("noteFilter", Downsha.NoteFilter);
    this.__defineGetter__("result", this.getResult);
    this.__defineGetter__("request", this.getRequest);
    this.__defineGetter__("response", this.getResponse);
    this.__definePositiveInteger__("tabId");
    this.__defineGetter__("searchHelperContentScripting",
        this.constructor.getSearchHelperContentScripting);
    this.tabId = tabId;
    this.sema = Downsha.Semaphore.mutex();
    this.initializeImpl(impl);
    this.initializeNoteFilter();
  };

  Downsha.SearchHelper.prototype.initializeImpl = function(impl) {
    this.impl = impl;
    if (this.impl) {
      this.impl.searchHelper = this;
    }
  };

  Downsha.SearchHelper.prototype.initializeNoteFilter = function() {
    this.noteFilter = new Downsha.NoteFilter( {
      order : NoteSortOrderTypes.UPDATED,
      ascending : false,
      fuzzy : true
    });
  };

  Downsha.SearchHelper.prototype.wait = function() {
    this._sema.wait();
  };

  Downsha.SearchHelper.prototype.signal = function() {
    LOG.debug("SearchHelper.signal");
    this._sema.signal();
    LOG.debug("Semaphore excess signals: " + this._sema.excessSignals);
    // if (this._sema.hasExcessSignals()) {
    if (this.isComplete()) {
      this._onsearch();
    }
  };

  Downsha.SearchHelper.prototype.isComplete = function() {
    return (this._searchProc && this._searchProc.readyState == 4 && !this
        .isActive()) ? true : false;
  };

  Downsha.SearchHelper.prototype.isActive = function() {
    if (!this._sema.hasExcessSignals()) {
      return false;
    } else if (!this._searchProc || this._searchProc.readyState == 0
        || this._searchProc.readyState == 4) {
      return false;
    }
    return true;
  };

  Downsha.SearchHelper.prototype.getQuery = function() {
    if (!this._query) {
      this.noteFilter.words = this.impl.query;
      this._query = this.noteFilter.words;
    }
    return this._query;
  };
  Downsha.SearchHelper.prototype.setQuery = function(query) {
    this.noteFilter.setWords(query);
  };

  Downsha.SearchHelper.prototype.search = function() {
    var self = this;
    if (this.query) {
      LOG.info("Performing simsearch for: " + this.query);
      this._result = null;
      this._response = null;
      this._request = null;
      this._searchProc = null;
      // Wave all pending search calls
      this._sema.waveAll();
      this._onbeforesearch();
      // critically execute search
      this._sema.critical(function() {
        Downsha.SearchHelper.searchSema.critical(function() {
          self._searchProc = Downsha.context.remote.countNotes(
              self.noteFilter, function(response, textStatus, xhr) {
                self._request = xhr;
                self._response = response;
                if (response.isResult()
                    && typeof response.result["noteList"] == 'object') {
                  LOG.debug("Retreived search results");
                  self._result = response.result.noteList;
                } else {
                  LOG.debug("Error retreiving results: " + textStatus);
                }
                Downsha.SearchHelper.searchSema.signal();
                self.signal();
              }, function(xhr, textStatus, error) {
                self._request = xhr;
                self._response = error;
                if (xhr && xhr.readyState == 4) {
                  LOG.error("HTTP Error status: " + xhr.status);
                } else if (xhr) {
                  LOG.error("HTTP Error readyState: " + xhr.readyState);
                } else {
                  LOG.error("HTTP Error (Unknown)");
                }
                Downsha.SearchHelper.searchSema.signal();
                self.signal();
              }, true);
        });
      });
      // setTimeout(function() {
      // self._onsearch();
      // }, 600);
    } else {
      LOG.debug("Not searching cuz there is no search query...");
    }
  };
  Downsha.SearchHelper.prototype.abort = function() {
    LOG.debug("SearchHelper.abort");
    if (this._searchProc && typeof this._searchProc["abort"] == 'function') {
      this._searchProc.abort();
    }
  };
  Downsha.SearchHelper.prototype.reset = function() {
    LOG.debug("SearchHelper.reset");
    this._sema = Downsha.Semaphore.mutex();
    this.initializeNoteFilter();
  };
  Downsha.SearchHelper.prototype.clear = function() {
    LOG.debug("SearchHelper.clear");
    this.impl.clear();
  };
  Downsha.SearchHelper.prototype.getResult = function() {
    return this._result;
  };
  Downsha.SearchHelper.prototype.getResponse = function() {
    return this._response;
  };
  Downsha.SearchHelper.prototype.getRequest = function() {
    return this._request;
  };
  Downsha.SearchHelper.prototype.hasResults = function() {
    return this._result && typeof this._result["totalNotes"] == 'number'
        && this._result["totalNotes"] > 0;
  };
  Downsha.SearchHelper.prototype.hasErrors = function() {
    return this._response && this._response.isError();
  };
  Downsha.SearchHelper.prototype.isTransportError = function() {
    return (this._request && (this._request.readyState == 0 || (this._request.readyState == 4 && (this._request.status < 200 || this._request.status >= 400))));
  };
  Downsha.SearchHelper.prototype._onbeforesearch = function() {
    LOG.debug("SearchHelper._onbeforesearch");
    this._handleActive();
    if (typeof this.onbeforesearch == 'function') {
      this.onbeforesearch();
    }
  };
  Downsha.SearchHelper.prototype._onsearch = function() {
    LOG.debug("SearchHelper._onsearch");
    if (this.isActive()) {
      this._handleActive();
    } else if (this.hasResults()) {
      this._handleResult();
    } else if (this.hasErrors()) {
      if (this._response.isMissingAuthTokenError()) {
        this._handleMissingAuthTokenError();
      } else if (this._response.hasAuthenticationError()) {
        this._handleAuthenticationError();
      } else {
        this._handleErrors();
      }
    } else if (!this.isTransportError()) {
      this._handleNoResult();
    } else {
      this._handleTransportError();
    }
    if (typeof this.onsearch == 'function') {
      this.onsearch();
    }
  };
  Downsha.SearchHelper.prototype._handleActive = function() {
    LOG.debug("SearchHelper._handleActive");
    this.impl.handleActive(this.tabId);
  };
  Downsha.SearchHelper.prototype._handleResult = function() {
    LOG.debug("SearchHelper._handleResult");
    var self = this;
    Downsha.context.getCookie("auth", function(cookie) {
      var resultUrl = Downsha.context.getDownshaSearchUrl(self.query)
          .replace(/^https?:\/\/[^\/]+/, "");
      resultUrl = Downsha.context.getSetAuthTokenUrl(cookie.value, resultUrl);
      self.impl.handleResult(self.tabId, self._result, resultUrl);
    });
  };
  Downsha.SearchHelper.prototype._handleNoResult = function() {
    LOG.debug("SearchHelper._handleNoResult");
    this.impl.handleNoResult(this.tabId);
  };
  Downsha.SearchHelper.prototype._handleMissingAuthTokenError = function() {
    LOG.debug("SearchHelper._handleMissingAuthTokenError");
    this.impl.handleMissingAuthTokenError(this.tabId, Downsha.context
        .getDownshaLoginUrl());
  };
  Downsha.SearchHelper.prototype._handleAuthenticationError = function() {
    LOG.debug("SearchHelper._handleAuthenticationError");
    this.impl.handleAuthenticationError(this.tabId, Downsha.context
        .getDownshaLoginUrl());
  };
  Downsha.SearchHelper.prototype._handleErrors = function() {
    LOG.debug("SearchHelper._handleErrors");
    this.impl.handleErrors(this.tabId, this._response.errors);
  };
  Downsha.SearchHelper.prototype._handleTransportError = function() {
    LOG.debug("SearchHelper._handleTransportError");
    this.impl.handleTransportError(this.tabId, this._request);
  };
})();

/*
 * Downsha
 * Downsha
 * 
 * Created by Pavel Skaldin on 05/02/11
 * Copyright 2011 Downsha Corp. All rights reserved.
 */

(function() {
  var LOG = null;

  Downsha.GoogleSearchHelperImpl = function GoogleSearchHelperImpl(url) {
    LOG = Downsha.chromeExtension.logger;
    this.initialize(url);
  };

  Downsha.inherit(Downsha.GoogleSearchHelperImpl, Downsha.SearchHelperImpl);

  Downsha.GoogleSearchHelperImpl.isResponsibleFor = function(url) {
    var q = this.queryFromUrl(url);
    return (q) ? true : false;
  };

  Downsha.GoogleSearchHelperImpl.queryFromUrl = function(url) {
    if (typeof url == 'string') {
      var domain = Downsha.Utils.urlDomain(url);
      if (typeof domain == 'string') {
        domain = domain.toLowerCase();
        if (domain.indexOf("www.google.") == 0) {
          var u = (url.indexOf("#") > 0) ? url.replace(/(\?.*)?\#/, "?") : url;
          return Downsha.Utils.urlQueryValue("q", u);
        }
      }
    }
    return null;
  };

  Downsha.GoogleSearchHelperImpl.prototype._xhr = null;
  Downsha.GoogleSearchHelperImpl.prototype._findProc = null;
  Downsha.GoogleSearchHelperImpl.prototype._result = null;
  Downsha.GoogleSearchHelperImpl.prototype._response = null;
  Downsha.GoogleSearchHelperImpl.prototype.MESSAGE_ANCHOR_SELECTOR = "#res";

  Downsha.GoogleSearchHelperImpl.prototype.initialize = function(url) {
    this.query = this.constructor.queryFromUrl(url);
  };

  Downsha.GoogleSearchHelperImpl.prototype.clear = function(tabId) {
    LOG.debug("GoogleSearchHelperImpl.clear");
    this.searchHelper.searchHelperContentScripting.clearContentMessages(tabId);
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleActive = function(tabId) {
    LOG.debug("GoogleSearchHelperImpl.handleActive");
    this.searchHelper.searchHelperContentScripting.prependContentMessage(tabId,
        this.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
            .getMessage("searchHelperSearching"));
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleResult = function(tabId,
      result, resultUrl) {
    LOG.debug("GoogleSearchHelperImpl.handleResult");
    var msg = chrome.i18n.getMessage("searchHelperFoundNotes", [
        result.totalNotes, resultUrl ]);
    this.searchHelper.searchHelperContentScripting.prependContentMessage(tabId,
        this.MESSAGE_ANCHOR_SELECTOR, msg);
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleNoResult = function(tabId) {
    LOG.debug("GoogleSearchHelperImpl.handleNoResult");
    this.searchHelper.searchHelperContentScripting.prependContentMessage(tabId,
        this.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
            .getMessage("searchHelperNotesNotFound"));
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleMissingAuthTokenError = function(
      tabId, loginUrl) {
    LOG.debug("GoogleSearchHelperImpl.handleMissingAuthTokenError");
    this.searchHelper.searchHelperContentScripting.prependContentErrorMessage(
        tabId, this.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
            .getMessage("authPersistenceError"));
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleAuthenticationError = function(
      tabId, loginUrl) {
    LOG.debug("GoogleSearchHelperImpl.handleAuthenticationError");
    this.searchHelper.searchHelperContentScripting.prependContentErrorMessage(
        tabId, this.MESSAGE_ANCHOR_SELECTOR, chrome.i18n.getMessage(
            "searchHelperLoginMessage", [ loginUrl, "javascript:" ]));
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleErrors = function(tabId,
      errors) {
    LOG.debug("GoogleSearchHelperImpl.handleErrors");
    this.searchHelper.searchHelperContentScripting.prependContentMessage(tabId,
        this.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
            .getMessage("searchHelperNotesNotFound"));
  };
  Downsha.GoogleSearchHelperImpl.prototype.handleTransportError = function(
      tabId, request) {
    LOG.debug("GoogleSearchHelperImpl.handleTransportError");
    this.searchHelper.searchHelperContentScripting.prependContentErrorMessage(
        tabId, this.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
            .getMessage("searchHelperNoTransportError"));
  };
})();

/*
 * Downsha
 * Downsha
 * 
 * Created by Pavel Skaldin on 05/04/11
 * Copyright 2011 Downsha Corp. All rights reserved.
 */

(function() {
  var LOG = null;

  Downsha.BingSearchHelperImpl = function BingSearchHelperImpl(url) {
    LOG = Downsha.chromeExtension.logger;
    this.initialize(url);
  };

  Downsha.inherit(Downsha.BingSearchHelperImpl, Downsha.SearchHelperImpl);

  Downsha.BingSearchHelperImpl.isResponsibleFor = function(url) {
    var q = this.queryFromUrl(url);
    return (q) ? true : false;
  };

  Downsha.BingSearchHelperImpl.queryFromUrl = function(url) {
    // http://www.bing.com/search?q=SEARCH_QUERY&go=&form=QBRE&qs=n&sk=&sc=8-10
    if (typeof url == 'string') {
      var domain = Downsha.Utils.urlDomain(url);
      if (typeof domain == 'string') {
        domain = domain.toLowerCase();
        if (domain.indexOf("www.bing.") == 0) {
          var u = (url.indexOf("#") > 0) ? url.replace(/(\?.*)?\#/, "?") : url;
          return Downsha.Utils.urlQueryValue("q", url);
        }
      }
    }
    return null;
  };

  Downsha.BingSearchHelperImpl.prototype._xhr = null;
  Downsha.BingSearchHelperImpl.prototype._findProc = null;
  Downsha.BingSearchHelperImpl.prototype._result = null;
  Downsha.BingSearchHelperImpl.prototype._response = null;
  Downsha.BingSearchHelperImpl.prototype._prepared = false;
  Downsha.BingSearchHelperImpl.prototype._sema = null;
  Downsha.BingSearchHelperImpl.prototype.MESSAGE_ANCHOR_SELECTOR = "#results_area";
  Downsha.BingSearchHelperImpl.prototype.STYLE_SHEETS = [ Downsha.context
      .getExtensionPath("css/bingsearchhelper.css") ];

  Downsha.BingSearchHelperImpl.prototype.initialize = function(url) {
    this.query = this.constructor.queryFromUrl(url);
    this._sema = Downsha.Semaphore.mutex();
  };

  Downsha.BingSearchHelperImpl.prototype.prepare = function(callback) {
    LOG.debug("BingSearchHelperImpl.prepare");
    var self = this;
    if (!this._prepared) {
      LOG.debug("Preparing BingSearchHelperImpl");
      this._sema.critical(function() {
        self.searchHelper.searchHelperContentScripting.injectStyleSheets(
            self.searchHelper.tabId, [].concat(self.STYLE_SHEETS), function() {
              LOG.debug("Finished preparing BingSearchHelperImpl");
              self._sema.signal();
            });
      });
      this._prepared = true;
    }
    if (typeof callback == 'function') {
      this._sema.critical(function() {        
        callback();
        self._sema.signal();
      });
    }
  };

  Downsha.BingSearchHelperImpl.prototype.clear = function(tabId) {
    LOG.debug("BingSearchHelperImpl.clear");
    this.searchHelper.searchHelperContentScripting.clearContentMessages(tabId);
  };
  Downsha.BingSearchHelperImpl.prototype.handleActive = function(tabId) {
    LOG.debug("BingSearchHelperImpl.handleActive");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
              .getMessage("searchHelperSearching"));
    });
  };
  Downsha.BingSearchHelperImpl.prototype.handleResult = function(tabId,
      result, resultUrl) {
    LOG.debug("BingSearchHelperImpl.handleResult");
    var self = this;
    var msg = chrome.i18n.getMessage("searchHelperFoundNotes", [
        result.totalNotes, resultUrl ]);
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, msg);
    });
  };
  Downsha.BingSearchHelperImpl.prototype.handleNoResult = function(tabId) {
    LOG.debug("BingSearchHelperImpl.handleNoResult");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
              .getMessage("searchHelperNotesNotFound"));
    });
  };
  Downsha.BingSearchHelperImpl.prototype.handleMissingAuthTokenError = function(
      tabId, loginUrl) {
    LOG.debug("BingSearchHelperImpl.handleMissingAuthTokenError");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting
          .prependContentErrorMessage(tabId, self.MESSAGE_ANCHOR_SELECTOR,
              chrome.i18n.getMessage("authPersistenceError"));
    });
  };
  Downsha.BingSearchHelperImpl.prototype.handleAuthenticationError = function(
      tabId, loginUrl) {
    LOG.debug("BingSearchHelperImpl.handleAuthenticationError");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting
          .prependContentErrorMessage(tabId, self.MESSAGE_ANCHOR_SELECTOR,
              chrome.i18n.getMessage("searchHelperLoginMessage", [ loginUrl,
                  "javascript:" ]));
    });
  };
  Downsha.BingSearchHelperImpl.prototype.handleErrors = function(tabId, errors) {
    LOG.debug("BingSearchHelperImpl.handleErrors");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
              .getMessage("searchHelperNotesNotFound"));
    });
  };
  Downsha.BingSearchHelperImpl.prototype.handleTransportError = function(
      tabId, request) {
    LOG.debug("BingSearchHelperImpl.handleTransportError");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting
          .prependContentErrorMessage(tabId, self.MESSAGE_ANCHOR_SELECTOR,
              chrome.i18n.getMessage("searchHelperNoTransportError"));
    });
  };
})();

/*
 * Downsha
 * Downsha
 * 
 * Created by Pavel Skaldin on 05/04/11
 * Copyright 2011 Downsha Corp. All rights reserved.
 */

(function() {
  var LOG = null;

  Downsha.YahooSearchHelperImpl = function YahooSearchHelperImpl(url) {
    LOG = Downsha.chromeExtension.logger;
    this.initialize(url);
  };

  Downsha.inherit(Downsha.YahooSearchHelperImpl, Downsha.SearchHelperImpl);

  Downsha.YahooSearchHelperImpl.isResponsibleFor = function(url) {
    var q = this.queryFromUrl(url);
    return (q) ? true : false;
  };

  Downsha.YahooSearchHelperImpl.queryFromUrl = function(url) {
    // http://search.yahoo.com/search?ei=UTF-8&fr=crmas&p=lolz
    if (typeof url == 'string') {
      var domain = Downsha.Utils.urlDomain(url);
      var path = Downsha.Utils.urlPath(url);
      if (typeof domain == 'string' && typeof path == "string") {
        domain = domain.toLowerCase();
        path = path.toLowerCase();
        if (domain.indexOf("search.yahoo.") >= 0
            && path.indexOf("/search") == 0) {
          var u = (url.indexOf("#") > 0) ? url.replace(/(\?.*)?\#/, "?") : url;
          return Downsha.Utils.urlQueryValue("p", url);
        }
      }
    }
    return null;
  };

  Downsha.YahooSearchHelperImpl.prototype._xhr = null;
  Downsha.YahooSearchHelperImpl.prototype._findProc = null;
  Downsha.YahooSearchHelperImpl.prototype._result = null;
  Downsha.YahooSearchHelperImpl.prototype._response = null;
  Downsha.YahooSearchHelperImpl.prototype._prepared = false;
  Downsha.YahooSearchHelperImpl.prototype._sema = null;
  Downsha.YahooSearchHelperImpl.prototype.MESSAGE_ANCHOR_SELECTOR = ["#results", "#mIn"];
  Downsha.YahooSearchHelperImpl.prototype.STYLE_SHEETS = [ Downsha.context
      .getExtensionPath("css/yahoosearchhelper.css") ];

  Downsha.YahooSearchHelperImpl.prototype.initialize = function(url) {
    this.query = this.constructor.queryFromUrl(url);
    this._sema = Downsha.Semaphore.mutex();
  };

  Downsha.YahooSearchHelperImpl.prototype.prepare = function(callback) {
    LOG.debug("YahooSearchHelperImpl.prepare");
    var self = this;
    if (!this._prepared) {
      LOG.debug("Preparing YahooSearchHelperImpl");
      this._sema.critical(function() {
        self.searchHelper.searchHelperContentScripting.injectStyleSheets(
            self.searchHelper.tabId, [].concat(self.STYLE_SHEETS), function() {
              LOG.debug("Finished preparing YahooSearchHelperImpl");
              self._sema.signal();
            });
      });
      this._prepared = true;
    }
    if (typeof callback == 'function') {
      this._sema.critical(function() {
        callback();
        self._sema.signal();
      });
    }
  };

  Downsha.YahooSearchHelperImpl.prototype.clear = function(tabId) {
    LOG.debug("YahooSearchHelperImpl.clear");
    this.searchHelper.searchHelperContentScripting.clearContentMessages(tabId);
  };
  Downsha.YahooSearchHelperImpl.prototype.handleActive = function(tabId) {
    LOG.debug("YahooSearchHelperImpl.handleActive");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
              .getMessage("searchHelperSearching"));
    });
  };
  Downsha.YahooSearchHelperImpl.prototype.handleResult = function(tabId,
      result, resultUrl) {
    LOG.debug("YahooSearchHelperImpl.handleResult");
    var self = this;
    var msg = chrome.i18n.getMessage("searchHelperFoundNotes", [
        result.totalNotes, resultUrl ]);
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, msg);
    });
  };
  Downsha.YahooSearchHelperImpl.prototype.handleNoResult = function(tabId) {
    LOG.debug("YahooSearchHelperImpl.handleNoResult");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
              .getMessage("searchHelperNotesNotFound"));
    });
  };
  Downsha.YahooSearchHelperImpl.prototype.handleMissingAuthTokenError = function(
      tabId, loginUrl) {
    LOG.debug("YahooSearchHelperImpl.handleMissingAuthTokenError");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting
          .prependContentErrorMessage(tabId, self.MESSAGE_ANCHOR_SELECTOR,
              chrome.i18n.getMessage("authPersistenceError"));
    });
  };
  Downsha.YahooSearchHelperImpl.prototype.handleAuthenticationError = function(
      tabId, loginUrl) {
    LOG.debug("YahooSearchHelperImpl.handleAuthenticationError");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting
          .prependContentErrorMessage(tabId, self.MESSAGE_ANCHOR_SELECTOR,
              chrome.i18n.getMessage("searchHelperLoginMessage", [ loginUrl,
                  "javascript:" ]));
    });
  };
  Downsha.YahooSearchHelperImpl.prototype.handleErrors = function(tabId,
      errors) {
    LOG.debug("YahooSearchHelperImpl.handleErrors");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting.prependContentMessage(
          tabId, self.MESSAGE_ANCHOR_SELECTOR, chrome.i18n
              .getMessage("searchHelperNotesNotFound"));
    });
  };
  Downsha.YahooSearchHelperImpl.prototype.handleTransportError = function(
      tabId, request) {
    LOG.debug("YahooSearchHelperImpl.handleTransportError");
    var self = this;
    this.prepare(function() {
      self.searchHelper.searchHelperContentScripting
          .prependContentErrorMessage(tabId, self.MESSAGE_ANCHOR_SELECTOR,
              chrome.i18n.getMessage("searchHelperNoTransportError"));
    });
  };
})();

(function() {
  var LOG = null;
  Downsha.SearchHelperContentScripting = function SearchHelperContentScripting() {
    LOG = Downsha.chromeExtension.logger;
    this.initialize();
  };

  Downsha.inherit(Downsha.SearchHelperContentScripting,
      Downsha.AbstractContentScripting, true);

  Downsha.SearchHelperContentScripting.CONTENT_SCRIPTS = [ "/libs/downsha-cr/downshaContentSearchHelper.js" ];

  Downsha.SearchHelperContentScripting.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };

  Downsha.SearchHelperContentScripting.prototype.injectStyleSheets = function(
      tabId, urls, callback) {
    LOG.debug("SearchHelperContentScripting.injectStyleSheets");
    if (urls && urls.length > 0) {
      var self = this;
      var styleSheets = JSON.stringify(urls);
      this
          .executeScript(
              tabId,
              {
                code : "Downsha.SearchHelperContentScript.getInstance().injectStyleSheets("
                    + styleSheets + ")"
              }, function() {
                LOG.debug("Finished injecting style sheets");
                if (typeof callback == 'function') {
                  callback();
                }
              });
    }
  };

  Downsha.SearchHelperContentScripting.prototype.appendContentMessage = function(
      tabId, anchorSelector, message) {
    LOG.debug("SearchHelperContentScripting.appendContentMessage");
    var self = this;
    var anchor = JSON.stringify(anchorSelector);
    var msg = JSON.stringify(message);
    this
        .executeScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeErrorMessage(); Downsha.SearchHelperContentScript.getInstance().appendMessage("
                  + anchor + ", " + msg + ");"
            });
  };
  Downsha.SearchHelperContentScripting.prototype.prependContentMessage = function(
      tabId, anchorSelector, message) {
    LOG.debug("SearchHelperContentScripting.prependContentMessage");
    var self = this;
    var anchor = JSON.stringify(anchorSelector);
    var msg = JSON.stringify(message);
    this
        .executeScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeErrorMessage(); Downsha.SearchHelperContentScript.getInstance().prependMessage("
                  + anchor + ", " + msg + ");"
            });
  };
  Downsha.SearchHelperContentScripting.prototype.clearContentMessages = function(
      tabId) {
    LOG.debug("SearchHelperContentScripting.clearContentMessages");
    var self = this;
    this
        .executeScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeResultStats();"
            });
  };
  Downsha.SearchHelperContentScripting.prototype.appendContentErrorMessage = function(
      tabId, anchorSelector, message) {
    LOG.debug("SearchHelperContentScripting.appendContentErrorMessage");
    var self = this;
    var anchor = JSON.stringify(anchorSelector);
    var msg = JSON.stringify(message);
    this
        .executeScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeMessage(); Downsha.SearchHelperContentScript.getInstance().appendErrorMessage("
                  + anchor + ", \"" + msg + ");"
            });
  };
  Downsha.SearchHelperContentScripting.prototype.prependContentErrorMessage = function(
      tabId, anchorSelector, message) {
    LOG.debug("SearchHelperContentScripting.prependContentErrorMessage");
    var self = this;
    var anchor = JSON.stringify(anchorSelector);
    var msg = JSON.stringify(message);
    this
        .executeTimedScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeMessage(); Downsha.SearchHelperContentScript.getInstance().prependErrorMessage("
                  + anchor + ", " + msg + ");"
            });
  };
  Downsha.SearchHelperContentScripting.prototype.removeMessage = function(
      tabId) {
    LOG.debug("SearchHelperContentScripting.removeMessage");
    var self = this;
    this
        .executeTimedScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeMessage();"
            });
  };
  Downsha.SearchHelperContentScripting.prototype.removeErrorMessage = function(
      tabId) {
    LOG.debug("SearchHelperContentScripting.removeMessage");
    var self = this;
    this
        .executeTimedScript(
            tabId,
            {
              code : "Downsha.SearchHelperContentScript.getInstance().removeErrorMessage();"
            });
  };
})();


(function() {
  var LOG = null;

  Downsha.ContentPreview = function ContentPreview() {
    LOG = Downsha.chromeExtension.logger;
    this.initialize();
  };

  Downsha.inherit(Downsha.ContentPreview, Downsha.AbstractContentScripting,
      true);

  Downsha.ContentPreview.CONTENT_SCRIPTS = [ "/libs/downsha-cr/downshaContentPreview.js" ];

  Downsha.ContentPreview.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };
  Downsha.ContentPreview.prototype.previewFullPage = function(tabId, callback) {
    LOG.debug("ContentPreview.previewFullPage");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().previewFullPage()"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.previewFullPage()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.previewSelection = function(tabId, callback) {
    LOG.debug("ContentPreview.previewSelection");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().previewSelection()"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.previewSelection()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.previewArticle = function(tabId, callback, showHelp) {
    LOG.debug("ContentPreview.previewArticle");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().previewArticle("+((showHelp) ? "true" : "false")+")"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.previewArticle()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.previewURL = function(tabId, callback) {
    LOG.debug("ContentPreview.previewURL");
    var self = this;
    chrome.tabs.get(tabId, function(tab) {
      var title = JSON.stringify(tab.title);
      var url = JSON.stringify(tab.url);
      var favIconUrl = JSON.stringify(tab.favIconUrl);
      self.executeScript(tab.id, {
        code : "Downsha.ContentPreviewScript.getInstance().previewURL("
            + title + "," + url + "," + favIconUrl + ")"
      }, function() {
        LOG.debug("Finished ContentPreviewScript.previewURL()");
        if (typeof callback == 'function') {
          callback();
        }
      });
    });
  };
  Downsha.ContentPreview.prototype.nudgePreview = function(tabId, directionConstant, callback) {
      LOG.debug("ContentPreview.nudgePreview");
      var code = "Downsha.ContentPreviewScript.getInstance().nudgePreview("+directionConstant+")";
      this.executeScript(tabId, {code: code}, function() {
          LOG.debug("Finished ContentPreview.nudgePreview()");
          if (typeof callback == 'function') {
              callback();
          }
      });
  };
  Downsha.ContentPreview.prototype.clear = function(tabId, callback) {
    LOG.debug("ContentPreview.clear");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().clear()"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.clear()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.clearAll = function() {
    LOG.debug("ContentPreview.clearAll");
    for ( var tabId in this._status) {
      LOG.debug("Clearing tabId: " + tabId);
      tabId = parseInt(tabId);
      if (!isNaN(tabId)) {
        this.clear(tabId);
      }
    }
  };
})();

(function() {
  var LOG = null;

  Downsha.PageInfo = function PageInfo() {
    LOG = Downsha.chromeExtension.logger;
    this.initialize();
  };

  Downsha.inherit(Downsha.PageInfo, Downsha.AbstractContentScripting, true);

  Downsha.PageInfo.CONTENT_SCRIPTS = [ "/libs/downsha-cr/downshaPageInfo.js" ];

  Downsha.PageInfo.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };
  Downsha.PageInfo.prototype.profile = function(tabId, callback) {
    LOG.debug("PageInfo.profile");
    this.executeScript(tabId, {
      code : "Downsha.PageInfoScript.getInstance().profile()"
    }, function() {
      LOG.debug("Finished PageInfoScript.profile()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
})();

