/**
 * @author: chenmin
 * @date: 2011-09-18
 * @desc: define error and exception classes
 */

Downsha.DownshaError = function DownshaError(errorCodeOrObj, message, parameter) {
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
Downsha.DownshaError.prototype._modelName = null;
Downsha.DownshaError.prototype._errorCode = null;
Downsha.DownshaError.prototype.message = null;
Downsha.DownshaError.prototype.parameter = null;
Downsha.DownshaError.prototype.handleInheritance = function() {
    if (typeof this.prototype.constructor[Downsha.DownshaError.CLASS_FIELD] == 'string') {
        Downsha.DownshaError.Registry[this.prototype.constructor[Downsha.DownshaError.CLASS_FIELD]] = this;
    }
    this.prototype.constructor["modelName"] = this.prototype.constructor
            .toString().replace(/\n/g, "").replace(/^.*function\s+([^\(]+).*$/, "$1");
};
Downsha.DownshaError.prototype.getModelName = function() {
    return this.constructor.toString().replace(/\n/g, "").replace(
            /^.*function\s+([^\(]+).*$/, "$1");
};
Downsha.DownshaError.prototype.initialize = function(errorCodeOrObj, message, parameter) {
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
    this.constructor["modelName"] = this.modelName;
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
 * Downsha.DSTPSystemException
 */
Downsha.DSTPSystemException = function DSTPSystemException(errorCodeOrObj, message) {
    this.initialize(errorCodeOrObj, message);
};
Downsha.DSTPSystemException.javaClass = "com.downsha.edam.error.DSTPSystemException";
Downsha.inherit(Downsha.DSTPSystemException, Downsha.Exception);

/**
 * Downsha.DSTPUserException
 */
Downsha.DSTPUserException = function DSTPUserException(errorCodeOrObj, message, parameter) {
    this.initialize(errorCodeOrObj, message, parameter);
};
Downsha.DSTPUserException.javaClass = "com.downsha.edam.error.DSTPUserException";
Downsha.inherit(Downsha.DSTPUserException, Downsha.Exception);

/**
 * Downsha.DSTPResponseException holds various errors associated with actual responses
 * from the server
 *
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.DSTPResponseException = function DSTPResponseException(errorCodeOrObj, message) {
    this.initialize(errorCodeOrObj, message);
}
Downsha.DSTPResponseException.javaClass = "com.downsha.edam.error.DSTPResponseException";
Downsha.inherit(Downsha.DSTPResponseException, Downsha.DownshaError);

/**
 * Downsha.ValidationError is a base for various types of validation errors. Validation
 * errors are responses from the server indicating that there was a problem
 * validating request with its parameters.
 *
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.ValidationError = function ValidationError(errorCodeOrObj, message, parameter) {
    this.initialize(errorCodeOrObj, message, parameter);
}
Downsha.ValidationError.GLOBAL_PARAMETER = "__stripes_global_error";
Downsha.ValidationError.javaClass = "net.sourceforge.stripes.validation.ValidationError";
Downsha.inherit(Downsha.ValidationError, Downsha.DownshaError);
Downsha.ValidationError.prototype.isGlobal = function() {
    return (this.parameter == null || this.parameter == Downsha.ValidationError.GLOBAL_PARAMETER);
};

/**
 * Downsha.SimpleError is a simple type of validation error. It has no error codes
 * associated with it. Just messages.
 *
 * @param message
 * @return
 */
Downsha.SimpleError = function SimpleError(message) {
    this.initialize(null, message, null);
}
Downsha.SimpleError.javaClass = "net.sourceforge.stripes.validation.SimpleError";
Downsha.inherit(Downsha.SimpleError, Downsha.ValidationError);

/**
 * Downsha.ScopedLocalizableError is like a Downsha.SimpleError but provides an error code and
 * optionally a message and a parameter. Parameter indicates which part of the
 * request this error refers to.
 *
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.ScopedLocalizableError = function ScopedLocalizableError(errorCodeOrObj, message, parameter) {
    this.initialize(errorCodeOrObj, message, parameter);
}
Downsha.ScopedLocalizableError.javaClass = "net.sourceforge.stripes.validation.ScopedLocalizableError";
Downsha.inherit(Downsha.ScopedLocalizableError, Downsha.SimpleError);

/**
 * Downsha.DSTPScopedError is like a Downsha.ScopedLocalizableError but is bound to
 * Downsha.DSTPErrorCode's. These are typically included in a response when a custom
 * validation failed.
 *
 * @param errorCodeOrObj
 * @param message
 * @param parameter
 * @return
 */
Downsha.DSTPScopedError = function DSTPScopedError(errorCodeOrObj, message, parameter) {
    this.initialize(errorCodeOrObj, message, parameter);
}
Downsha.DSTPScopedError.javaClass = "com.downsha.web.Downsha.DSTPScopedError";
Downsha.inherit(Downsha.DSTPScopedError, Downsha.ScopedLocalizableError);
