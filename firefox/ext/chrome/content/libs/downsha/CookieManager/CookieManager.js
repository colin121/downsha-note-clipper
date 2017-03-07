/**
 * @author: chenmin
 * @date: 2011-08-30
 * @desc: abstract definition of cookie manipulation
 */
(function() {
	Downsha.CookieManager = function CookieManager(doc, impl) {
	  this.__defineGetter__("impl", this.getImplementation);
	  this.__defineSetter__("impl", this.setImplementation);
	  this.initialize(doc, impl);
	};
	Downsha.CookieManager.prototype._impl = null;
	Downsha.CookieManager.prototype.document = null;
	Downsha.CookieManager.prototype.initialize = function(doc, impl) {
	  if (doc) {
	    this.document = doc;
	  } else if (document) { // use current document
	    this.document = document;
	  }
	  if (typeof impl == 'undefined' && typeof navigator == 'object'
	      && navigator != null) {
	    var implClass = Downsha.CookieManagerImplFactory
	        .getImplementationFor(navigator); // get specific implementation based on user agent
	    if (implClass) {
	      impl = new implClass();
	    }
	  }
	  this.setImplementation(impl);
	};
	Downsha.CookieManager.prototype.setImplementation = function(impl) {
	  if (impl instanceof Downsha.CookieManagerImpl) {
	    this._impl = impl;
	    this._impl.manager = this;
	  } else if (impl == null) {
	    this._impl = null;
	  }
	};
	Downsha.CookieManager.prototype.getImplementation = function() {
	  return this._impl;
	};
	Downsha.CookieManager.prototype.get = function(url, name) {
	  return this._impl.get(url, name);
	};
	Downsha.CookieManager.prototype.set = function(url, name, value) {
	  this._impl.set(url, name, value);
	};
	Downsha.CookieManager.prototype.getAll = function(url) { // get all the cookies for the given url
	  return this._impl.getAll(url);
	};
	Downsha.CookieManager.prototype.remove = function(url, name) {
	  this._impl.remove(url, name);
	};
	Downsha.CookieManager.prototype.removeAll = function(url) { // remove all the cookies for the given url
	  this._impl.removeAll(url);
	};
	
	Downsha.CookieManagerImplFactory = {
	  getImplementationFor : function(navigator) {
	    var reg = Downsha.CookieManagerImpl.ClassRegistry; // enumerate all the registered implementors
	    for ( var i = 0; i < reg.length; i++) {
	      if (typeof reg[i] == 'function'
	          && typeof reg[i].isResponsibleFor == 'function'
	          && reg[i].isResponsibleFor(navigator)) { // return the first matched implementor
	        return reg[i];
	      }
	    }
	    return null;
	  }
	};
	
	Downsha.CookieManagerImpl = function CookieManagerImpl() {
	};
	Downsha.CookieManagerImpl.ClassRegistry = new Array();
	Downsha.CookieManagerImpl.handleInheritance = function(child, parent) {
	  Downsha.CookieManagerImpl.ClassRegistry.push(child);
	};
	Downsha.CookieManagerImpl.isResponsibleFor = function(navigator) {
	  return false;
	};
	Downsha.CookieManagerImpl.prototype.manager = null;
	Downsha.CookieManagerImpl.prototype.get = function(name, url) {
	  throw new Error("Must subclass Downsha.CookieManagerImpl.get");
	};
	Downsha.CookieManagerImpl.prototype.getAll = function(url) {
	  throw new Error("Must subclass Downsha.CookieManagerImpl.getAll");
	};
	Downsha.CookieManagerImpl.prototype.set = function(cookie, url) {
	  throw new Error("Must subclass Downsha.CookieManagerImpl.set");
	};
	Downsha.CookieManagerImpl.prototype.remove = function(name, url) {
	  throw new Error("Must subclass Downsha.CookieManagerImpl.remove");
	};
	Downsha.CookieManagerImpl.prototype.removeAll = function(url) {
	  throw new Error("Must subclass Downsha.CookieManagerImpl.removeAll");
	};
	
	Downsha.CookieURI = function CookieURI(obj) {
	  this.initialize(obj);
	};
	Downsha.CookieURI.SCHEME_SEPARATOR = "://";
	Downsha.CookieURI.PATH_SEPARATOR = "/";
	Downsha.CookieURI.PORT_SEPARATOR = ":";
	Downsha.CookieURI.fromUrl = function(url) { // parse entire url and get scheme, host, port, path
	  var u = new Downsha.CookieURI();
	  if (typeof url == 'string') {
	    var parts = url.split(Downsha.CookieURI.SCHEME_SEPARATOR);
	    var domainPath = null;
	    var x = -1;
	    if (parts.length == 2) {
	      u.scheme = parts[0];
	      domainPath = parts[1];
	    } else {
	      domainPath = parts[0];
	    }
	    parts = domainPath.split(Downsha.CookieURI.PATH_SEPARATOR);
	    u.host = parts[0];
	    if (parts.length > 1) {
	      u.path = parts.slice(1).join(Downsha.CookieURI.PATH_SEPARATOR);
	      if ((x = u.path.indexOf("?")) >= 0) { // trim parameters after question mark
	        u.path = u.path.substring(0, x);
	      }
	    }
	    if ((x = u.host.indexOf(Downsha.CookieURI.PORT_SEPARATOR)) > 0) {
	      u.port = parseInt(u.host.substring(x+1));
	      if (isNaN(u.port)) {
	        u.port = 0;
	      }
	      u.host = u.host.substring(0, x);
	    }
	  }
	  return u;
	};
	Downsha.CookieURI.prototype.scheme = null;
	Downsha.CookieURI.prototype.host = null;
	Downsha.CookieURI.prototype.port = 0;
	Downsha.CookieURI.prototype.path = null;
	Downsha.CookieURI.prototype.initialize = function(obj) { // copy constructor
	  if (typeof obj == 'object' && obj != null) {
	    for ( var i in this) {
	      if (typeof this[i] != 'function' && typeof obj[i] != 'undefined') {
	        this[i] = obj[i];
	      }
	    }
	  }
	};
	Downsha.CookieURI.prototype.toString = function() { // assemble all parts to url
	  var str = (this.scheme) ? (this.scheme + Downsha.CookieURI.SCHEME_SEPARATOR)
	      : "";
	  str += this.host;
	  if (this.port > 0) {
	    str += Downsha.CookieURI.PORT_SEPARATOR + this.port;
	  }
	  if (this.path) {
	    str += Downsha.CookieURI.PATH_SEPARATOR + this.path;
	  }
	  return str;
	};
	
	Downsha.Cookie = function Cookie(obj) {
	  this.initialize(obj);
	};
	Downsha.Cookie.prototype.name = null; // cookie name
	Downsha.Cookie.prototype.value = null; // cookie data
	Downsha.Cookie.prototype.host = null; // cookie owner
	Downsha.Cookie.prototype.path = null; //cookie path
	Downsha.Cookie.prototype.secure = null; //secure or not
	Downsha.Cookie.prototype.expires = null; //expiration timestamp
	Downsha.Cookie.prototype.initialize = function(obj) {
	  if (typeof obj == 'object' && obj != null) {
	    for ( var i in this) {
	      if (typeof this[i] != 'function' && typeof obj[i] != 'undefined') {
	        this[i] = obj[i];
	      }
	    }
	  }
	};
})();
