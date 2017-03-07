/**
 * @author: chenmin
 * @date: 2011-08-30
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
(function() {
	Downsha.LocalStore = function LocalStore(name, impl) {
	  this.initialize(name, impl);
	  this.__defineGetter__("length", this.getLength);
	}
	Downsha.LocalStore.prototype.initialize = function(name, impl) {
	  if (typeof name == 'string')
	    this.storeName = name;
	  else
	    this.storeName = Downsha.LocalStore.DEFAULT_STORE_NAME; // default store name "LocalStore"
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
	Downsha.LocalStore.DEFAULT_STORE_NAME = "LocalStore";
	
	/**
	 * Default object based storage implementation
	 */
	Downsha.LocalStore.DEFAULT_IMPL = function() {
	  this.initialize();
	  this.__defineGetter__("length", this.getLength);
	};
	Downsha.LocalStore.DEFAULT_IMPL.prototype.store = null;
	Downsha.LocalStore.DEFAULT_IMPL.prototype._cache = null; // key-value pairs are stored here
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
	}
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
	  return JSON.parse(data);
	};
	
	/**
	 * nsIDOMStorage - that's what mozilla uses
	 */
	Downsha.LocalStore.SQLITE_IMPL = function(sdb) {
	  this.initialize(sdb);
	  this.__defineGetter__("length", this.getLength);
	}
	Downsha.LocalStore.SQLITE_IMPL.DEFAULT_TABLE_NAME = "local_store";
	Downsha.LocalStore.SQLITE_IMPL.prototype.store = null;
	Downsha.LocalStore.SQLITE_IMPL.prototype._cache = null;
	Downsha.LocalStore.SQLITE_IMPL.prototype._keys = null;
	Downsha.LocalStore.SQLITE_IMPL.prototype._tableName = null;
	Downsha.LocalStore.SQLITE_IMPL.prototype.initialize = function(sdb, tableName) {
	  this._cache = sdb;
	  this._tableName = (typeof tableName == 'string') ? tableName
	      : Downsha.LocalStore.SQLITE_IMPL.DEFAULT_TABLE_NAME;
	  // create table if needed
	  this._createTable();
	  this._keys = this._getKeys();
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype._getKeys = function() { // get all the data from table
	  var st = this._cache.createStatement("SELECT key FROM " + this._tableName);
	  var keys = [];
	  while (st.executeStep()) {
	    keys.push(st.row.key);
	  }
	  return keys;
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype._createTable = function(drop) {
	  if (drop) {
	    this._cache
	        .executeSimpleSQL("DROP TABLE " + this._tableName + " IF EXISTS");
	  }
	  this._cache.executeSimpleSQL("CREATE TABLE IF NOT EXISTS " + this._tableName
	      + " (key TEXT PRIMARY KEY, value BLOB)");
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype.clear = function() {
	  var st = this._cache.createStatement("DELETE FROM " + this._tableName);
	  if (st.executeStep() === false) {
	    this._keys = [];
	  }
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype.get = function(key) {
	  var st = this._cache.createStatement("SELECT * FROM " + this._tableName
	      + " where key = :row_key");
	  st.params.row_key = key;
	  var result = null;
	  if (st.executeStep()) {
	    result = this.unmarshall(st.row.value);
	  }
	  st.reset();
	  return result;
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype.put = function(key, value) {
	  var stStr = "";
	  var i = -1;
	  if ((i = this._keys.indexOf(key)) >= 0) {
	    stStr = "UPDATE " + this._tableName
	        + " set value = :row_value where key = :row_key";
	  } else {
	    stStr = "INSERT INTO " + this._tableName
	        + " (key, value) VALUES(:row_key, :row_value)";
	  }
	  var v = this.marshall(value);
	  var st = this._cache.createStatement(stStr);
	  st.params.row_key = key;
	  st.params.row_value = v;
	  if (typeof st.executeStep() != 'undefined') {
	    if (i < 0) {
	      this._keys.push(key);
	    }
	  }
	  st.reset();
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype.remove = function(key) {
	  var i = -1;
	  if ((i = this._keys.indexOf(key)) >= 0) {
	    var st = this._cache.createStatement("DELETE FROM " + this._tableName
	        + " where key = :row_key");
	    st.params.row_key = key;
	    if (typeof st.executeStep() != 'undefined') {
	      this._keys.splice(i, 1);
	    }
	    st.reset();
	  }
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype.getLength = function() {
	  return this._keys.length;
	}
	Downsha.LocalStore.SQLITE_IMPL.prototype.marshall = function(data) {
	  return JSON.stringify(data);
	};
	Downsha.LocalStore.SQLITE_IMPL.prototype.unmarshall = function(data) {
	  return JSON.parse(data);
	};
})();
