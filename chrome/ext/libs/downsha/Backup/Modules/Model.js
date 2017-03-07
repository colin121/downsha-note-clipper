/**
 * @author: chenmin
 * @date: 2011-09-06
 * @desc: abstract definition of common model classes
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
