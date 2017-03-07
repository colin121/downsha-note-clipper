/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: LocalStore provides single interface for locally storing key-value data on
 * the client. Currently there are several implementation: 
 * 1. LocalStore.DEFAULT_IMPL - which stores data inside an object 
 * 2. LocalStore.HTML5_LOCALSTORAGE_IMPL for chrome - which utilized HTML5's localStorage feature
 * 3. LocalStore.SQLITE_IMPL for firefox - which utilized mozilla sqlite component service
 * 
 * LocalStore requires that each instance has a name to distinguish it from
 * other stores. It provides the following interface: 
 * 1. get(key) - to retrieve value associated with given key 
 * 2. put(key, value) - to store key-value association 
 * 3. remove(key) - to remove stored key-value association 
 * 4. clear() - to remove all stored key-value associations 
 * 5. getLength() - returns total number of stored associations 
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
Downsha.LocalStore.DEFAULT_IMPL.prototype._cache = null; // store data in this object
Downsha.LocalStore.DEFAULT_IMPL.prototype._countDelta = 0; // count of non-user-store members
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
