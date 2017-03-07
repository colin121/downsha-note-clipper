/**
 * @author: chenmin
 * @date: 2011-08-30
 * @desc: specific implementor for firefox
 */

(function() {
	var LOG = null;
	Downsha.FirefoxCookieManagerImpl = function FirefoxCookieManagerImpl() {
		LOG = Downsha.Logger.getInstance();
	};
	Downsha.inherit(Downsha.FirefoxCookieManagerImpl, Downsha.CookieManagerImpl, true);
	Downsha.FirefoxCookieManagerImpl.isResponsibleFor = function(navigator) {
		return navigator.userAgent.toLowerCase().indexOf("firefox") >= 0;
	};
	Downsha.FirefoxCookieManagerImpl.prototype.manager = null;
	Downsha.FirefoxCookieManagerImpl.prototype._ioSrv = null;
	Downsha.FirefoxCookieManagerImpl.prototype._cookieSrv = null;
	Downsha.FirefoxCookieManagerImpl.prototype._cookieManagerSrv = null;
	Downsha.FirefoxCookieManagerImpl.prototype.getIOService = function() {
	  if (this._ioSrv == null) {
	    this._ioSrv = Components.classes["@mozilla.org/network/io-service;1"]
	        .getService(Components.interfaces.nsIIOService);
	  }
	  return this._ioSrv;
	};
	Downsha.FirefoxCookieManagerImpl.prototype.getCookieService = function(
	    force) {
	  if (this._cookieSrv == null || force) {
	    this._cookieSrv = Components.classes["@mozilla.org/cookieService;1"]
	        .getService(Components.interfaces.nsICookieService);
	  }
	  return this._cookieSrv;
	};
	Downsha.FirefoxCookieManagerImpl.prototype.getCookieManagerService = function(
	    force) {
	  if (this._cookieManagerSrv == null || force) {
	    this._cookieManagerSrv = Components.classes["@mozilla.org/cookiemanager;1"]
	        .getService(Components.interfaces.nsICookieManager);
	  }
	  return this._cookieManagerSrv;
	};
	Downsha.FirefoxCookieManagerImpl.prototype.get = function(name, url) {
	  var uri = this.getIOService().newURI(url, null, null);
	  var cookieMgr = this.getCookieManagerService();
	  if (cookieMgr) {
	    for ( var e = cookieMgr.enumerator; e.hasMoreElements();) {
	      var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie);
	      if (cookie && cookie.host == uri.host && cookie.name == name) {
	        return new Downsha.Cookie(cookie);
	      }
	    }
	  }
	  return null;
	};
	Downsha.FirefoxCookieManagerImpl.prototype.getAll = function(url) {
	  var cookies = new Array();
	  var cookieMgr = this.getCookieManagerService();
	  var uri = (url) ? this.getIOService().newURI(url, null, null) : null;
	  if (cookieMgr) {
	    for ( var e = cookieMgr.enumerator; e.hasMoreElements();) {
	      var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie);
	      LOG.debug("Checking if " + cookie.host + " == " + uri.host);
	      if (!url || uri.host == cookie.host) { // get all the cookies under the host of url
	        cookies.push(new Downsha.Cookie(cookie));
	      }
	    }
	  }
	  return cookies;
	};
	Downsha.FirefoxCookieManagerImpl.prototype.set = function(cookie, url) {
	  var uri = (typeof url == 'string') ? this.getIOService().newURI(url, null,
	      null) : null;
	  if (cookie instanceof Downsha.Cookie && typeof cookie.name == 'string'
	      && cookie.name.length > 0) {
	    this.getCookieService().setCookieString(uri, null,
	        (cookie.name + "=" + cookie.value + ";"), null);
	  }
	};
	Downsha.FirefoxCookieManagerImpl.prototype.remove = function(name, url) {
	  var cookieMgr = this.getCookieManagerService();
	  var urlParts = url.split("://", 2);
	  var domain = (urlParts.length == 2) ? urlParts[1] : urlParts[0];
	  urlParts = domain.split("/", 2);
	  var path = (urlParts.length == 2) ? urlParts[1] : null;
	  cookieMgr.remove(domain, name, path, false);
	};
	Downsha.FirefoxCookieManagerImpl.prototype.removeAll = function(url) {
	  if (!url) {
	    this.getCookieManagerService().removeAll();
	  } else {
	    var cookies = this.getAll(url);
	    if (cookies) {
	      for ( var i = 0; i < cookies.length; i++) {
	        this.remove(cookies[i].name, url);
	      }
	    }
	  }
	};
})();
