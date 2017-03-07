/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: define global namespace and prototype based inheritance
 */

var Downsha = Downsha || {};

Downsha.inherit = function(childConstructor, parentClassOrObject,
                            includeConstructorDefs) {
    if (parentClassOrObject.constructor == Function) {
        // Normal Inheritance
        childConstructor.prototype = new parentClassOrObject;
        childConstructor.prototype.constructor = childConstructor;
        childConstructor.prototype.parent = parentClassOrObject.prototype;
        childConstructor.constructor.parent = parentClassOrObject;
    } else {
        // Pure Virtual Inheritance
        childConstructor.prototype = parentClassOrObject;
        childConstructor.prototype.constructor = childConstructor;
        childConstructor.prototype.parent = parentClassOrObject;
        childConstructor.constructor.parent = parentClassOrObject;
    }
    if (includeConstructorDefs) {
        for ( var i in parentClassOrObject.prototype.constructor) {
            if (i != "parent"
                    && i != "prototype"
                    && parentClassOrObject.constructor[i] != parentClassOrObject.prototype.constructor[i]
                    && typeof childConstructor.prototype.constructor[i] == 'undefined') {
                childConstructor.prototype.constructor[i] = parentClassOrObject.prototype.constructor[i];
            }
        }
    }
    if (typeof childConstructor.handleInheritance == 'function') {
        childConstructor.handleInheritance.apply(childConstructor, arguments);
    }
    if(typeof childConstructor.prototype.handleInheritance == 'function') {
        childConstructor.prototype.handleInheritance.apply(childConstructor, arguments);
    }
    //return childConstructor;
};

Downsha.inherits = function(childConstructor, parentClass) { // return whether childConstructor inherits parentClass or not
    return (typeof childConstructor.prototype.parent != 'undefined' && childConstructor.prototype.parent.constructor == parentClass);
};

Downsha.mixin = function(classOrObject, mixin, map) { // copy members of mixin to classOrObject, map is optional
  var target = (typeof classOrObject == 'function') ? classOrObject.prototype : classOrObject;
  for ( var i in mixin.prototype) {
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

/**
	DefiningMixin provides utilities to define variables with getter and setter.
	variables are stored in internal array with underline prefix. 
 */
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
                        + (typeof obj) + " " + obj.toSource());
            }
        };
        this.__defineSetter__(fieldName, target[setterName]);
    }
};
