/**
 * @author: chenmin
 * @date: 2011-08-31
 * @desc: define getter and setter of context data.
 * context data are also stored in local file via sqlite service.
 * C:\Users\abc\AppData\Roaming\Mozilla\Firefox\Profiles\*.dev\downsha_webclipper.sqlite
 */

(function() {
	var LOG = null;
	Downsha.getContext = function() { // return the singleton of context object
		if (Downsha._context == null)
			Downsha._context = new Downsha.DownshaContext();
		return Downsha._context;
	};
	Downsha.__defineGetter__("context", Downsha.getContext);
	
	Downsha.DownshaContext = function DownshaContext() {
		LOG = Downsha.Logger.getInstance();
		
    this.__defineGetter__("userId", this.getUserId);
    this.__defineSetter__("userId", this.setUserId);
    this.__defineGetter__("userName", this.getUserName);
    this.__defineSetter__("userName", this.setUserName);
    this.__defineGetter__("userPass", this.getUserPass);
    this.__defineSetter__("userPass", this.setUserPass);
    this.__defineGetter__("sessTime", this.getSessTime);
    this.__defineSetter__("sessTime", this.setSessTime);
    this.__defineGetter__("sessId", this.getSessId);
    this.__defineSetter__("sessId", this.setSessId);
    this.__defineGetter__("hardId", this.getHardId);
    this.__defineSetter__("hardId", this.setHardId);
    this.__defineGetter__("termId", this.getTermId);
    this.__defineSetter__("termId", this.setTermId);
    this.__defineGetter__("termClass", this.getTermClass);
    this.__defineSetter__("termClass", this.setTermClass);
    this.__defineGetter__("termType", this.getTermType);
    this.__defineSetter__("termType", this.setTermType);
    this.__defineGetter__("version", this.getVersion);
    this.__defineSetter__("version", this.setVersion);
    
    this.__defineGetter__("remote", this.getRemote);
    this.__defineSetter__("remote", this.setRemote);
    this.__defineGetter__("store", this.getStore);
    this.__defineSetter__("store", this.setStore);
    this.__defineGetter__("serviceProto", this.getServiceProto);
    this.__defineSetter__("serviceProto", this.setServiceProto);
    this.__defineGetter__("serviceDomain", this.getServiceDomain);
    this.__defineSetter__("serviceDomain", this.setServiceDomain);
    this.__defineGetter__("extensionId", this.getExtensionId);
    this.__defineGetter__("extensionPath", this.getExtensionPath);
    this.__defineGetter__("options", this.getOptions);
    this.__defineSetter__("options", this.setOptions);
    this.__defineGetter__("logLevel", this.getLogLevel);
    this.__defineGetter__("locale", this.getLocale);
    this.__defineGetter__("userKnown", this.isUserKnown);
    this.__defineGetter__("rememberedSession", this.isRememberedSession);
    this.__defineSetter__("rememberedSession", this.setRememberedSession);
    
    this.initialize();
	};
	
  Downsha.DownshaContext.HOME_PATH = "http://www.downsha.com/";
  Downsha.DownshaContext.DESKTOP_PATH = "http://www.downsha.com/version/YunZhaiSetup.exe";
  Downsha.DownshaContext.MOBILE_PATH = "http://www.downsha.com/version/yunzhai_android.apk";
  Downsha.DownshaContext.WINDOWS8_PATH = "http://apps.microsoft.com/webpdp/zh-CN/app/a6605203-4a28-46ec-8e79-abb872475d20";
  Downsha.DownshaContext.CHROME_PATH = "https://chrome.google.com/webstore/detail/%E5%BD%93%E4%B8%8B%E4%BA%91%E6%91%98/fjfgeonblbdcofcokojamlcnomcdliap";
  Downsha.DownshaContext.FIREFOX_PATH = "https://addons.mozilla.org/zh-CN/firefox/addon/yunzhai/";
  Downsha.DownshaContext.SERVICE_PROTO = "http://";
  Downsha.DownshaContext.SERVICE_DOMAIN = "ysync.downsha.com";
  Downsha.DownshaContext.YUNZHAI_PATH = "/yunzhai.so";
  Downsha.DownshaContext.VIEW_PATH = "/view";
  Downsha.DownshaContext.SESS_ID = "0";
  Downsha.DownshaContext.USER_ID = 0;
  Downsha.DownshaContext.TERM_ID = 0;
  Downsha.DownshaContext.DEFAULT_LOCALE = "default";
  Downsha.DownshaContext.LOCAL_STORE_FILENAME = "downsha_webclipper.sqlite";
  
  Downsha.DownshaContext.prototype._userId = null;
  Downsha.DownshaContext.prototype._userName = null;
  Downsha.DownshaContext.prototype._userPass = null;
  Downsha.DownshaContext.prototype._sessTime = null;
  Downsha.DownshaContext.prototype._sessId = null;
  Downsha.DownshaContext.prototype._hardId = null;
  Downsha.DownshaContext.prototype._termId = null;
  Downsha.DownshaContext.prototype._termClass = null;
  Downsha.DownshaContext.prototype._termType = null;
  Downsha.DownshaContext.prototype._version = null;

  Downsha.DownshaContext.prototype._store = null;
  Downsha.DownshaContext.prototype._serviceProto = null;
  Downsha.DownshaContext.prototype._serviceDomain = null;
  Downsha.DownshaContext.prototype._options = null;
  Downsha.DownshaContext.prototype._locale = null;
  Downsha.DownshaContext.prototype._rememberedSession = true;
  Downsha.DownshaContext.prototype._remote = null;
	Downsha.DownshaContext.prototype._extensionId = null;
	Downsha.DownshaContext.prototype.RELEASED = true;
	
  Downsha.DownshaContext.prototype.initialize = function() {
  };
  Downsha.DownshaContext.prototype.destroy = function() {
  };
  Downsha.DownshaContext.prototype.setServiceProto = function(proto) {
    var changed = false;
    if (typeof proto == 'string' && this._serviceProto != proto) {
      this._serviceProto = proto;
      changed = true;
    } else if (proto == null && this._serviceProto != null) {
      this._serviceProto = null;
      changed = true;
    }
    if (changed && this.store) {
      this.store.put("serviceProto", this._serviceProto);
    }
  };
  Downsha.DownshaContext.prototype.getServiceProto = function() {
    if (this._serviceProto == null && this.store) {
      this._serviceProto = this.store.get("serviceProto");
    }
    return (this._serviceProto != null) ? this._serviceProto
        : Downsha.DownshaContext.SERVICE_PROTO;
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
    return this.serviceProto + this.serviceDomain;
  };
  Downsha.DownshaContext.prototype.getHomeUrl = function() {
    return Downsha.DownshaContext.HOME_PATH;
  };
  Downsha.DownshaContext.prototype.getDesktopUrl = function() {
    return Downsha.DownshaContext.DESKTOP_PATH;
  };
  Downsha.DownshaContext.prototype.getMobileUrl = function() {
    return Downsha.DownshaContext.MOBILE_PATH;
  };
  Downsha.DownshaContext.prototype.getWindows8Url = function() {
    return Downsha.DownshaContext.WINDOWS8_PATH;
  };
  Downsha.DownshaContext.prototype.getChromeUrl = function() {
    return Downsha.DownshaContext.CHROME_PATH;
  };
  Downsha.DownshaContext.prototype.getFirefoxUrl = function() {
    return Downsha.DownshaContext.FIREFOX_PATH;
  };
  Downsha.DownshaContext.prototype.getNoteListUrl = function() {
    return this.getServiceUrl() + Downsha.DownshaContext.VIEW_PATH + "?uid=" + this.userId + "&border=0&perpage=3&topbar=0&bottombar=1&bartype=1";
  };
  Downsha.DownshaContext.prototype.getYunzhaiUrl = function(cmdid) {
  	if (typeof cmdid != 'undefined') {
  		return this.getServiceUrl() + Downsha.DownshaContext.YUNZHAI_PATH + "?cmdid=" + cmdid;
  	} else {
  		return this.getServiceUrl() + Downsha.DownshaContext.YUNZHAI_PATH;
  	}
  };
  
	Downsha.DownshaContext.prototype.getLocale = function() {
	    return navigator.language;
	};
  Downsha.DownshaContext.prototype.isUserKnown = function() {
  	return ((this.userId || this.userName) && this.userPass) ? true: false;
  };	
	Downsha.DownshaContext.prototype.getExtensionId = function() {
	  if (this._extensionId == null) {
	    var bgUrl = Downsha.chrome.extension.getBackgroundPage().location.href;
	    if (bgUrl) {
	    	// get extension id from background page url
	      var extensionId = bgUrl.replace(/^chrome-extension:\/\/([^\/]+).*$/, "$1");
	      if (extensionId != null && typeof extensionId != 'undefined') {
	        this._extensionId = extensionId;
	      }
	    }
	  }
	  return this._extensionId;
	};
	Downsha.DownshaContext.prototype.getExtensionPath = function() {
	  return "chrome-extension://" + this.extensionId + "/";
	};
	Downsha.DownshaContext.prototype.isExtensionReleased = function() {
	  return this.RELEASED;
	};
	
  Downsha.DownshaContext.prototype.setRemote = function(remote) {
    if (remote instanceof Downsha.DownshaRemoteEx) {
      this._remote = remote;
    }
  };
  Downsha.DownshaContext.prototype.getRemote = function() {
    if (!this._remote) {
      this._remote = new Downsha.DownshaRemoteEx();
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
    if (!this._store) {
      this._store = this.getLocalStoreInstance();
    }
    return this._store;
  };
	Downsha.DownshaContext.prototype.getLocalStoreInstance = function() { // get sqlite storage
		try {
		  var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		  file.append(Downsha.DownshaContext.LOCAL_STORE_FILENAME);
		  var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
		  var mDBConn = storageService.openDatabase(file);
		  return new Downsha.LocalStore(null, new Downsha.LocalStore.SQLITE_IMPL(mDBConn));			
		} catch (e) {
		}
		return null;
	};
	
  Downsha.DownshaContext.prototype.resetUser = function() {
    this.userId = null;
    this.userName = null;
    this.userPass = null;
    this.sessTime = null;
    this.sessId = null;
  };
  Downsha.DownshaContext.prototype.getUserId = function() {
    if (this._userId == null && this.store != null) {
    	var userId = parseInt(this.store.get("userId"));
  		if (!isNaN(userId)) {
  			this._userId = userId;
  		}
    }
    return (this._userId != null) ? this._userId : Downsha.DownshaContext.USER_ID;
  };
  Downsha.DownshaContext.prototype.setUserId = function(userId) {
  	if (userId != null) {
	  	userId = parseInt(userId);
	  	if (isNaN(userId)) {
	  		return ;
	  	}
	  	this._userId = userId;
	  	if (this.store != null) {
	  		this.store.put("userId", this._userId);
	  	}
	  } else {
	  	this._userId = null;
	  	if (this.store != null) {
	  		this.store.remove("userId");
	  	}	  	
	  }
  };
  Downsha.DownshaContext.prototype.getUserName = function() {
    if (this._userName == null && this.store != null) {
    	this._userName = this.store.get("userName");
    }
    return this._userName;
  };
  Downsha.DownshaContext.prototype.setUserName = function(userName) {
    if (userName != null) {
	    this._userName = userName;
	  	if (this.store != null) {
	  		this.store.put("userName", this._userName);
	  	}
	  } else {
	  	this._userName = null;
	  	if (this.store != null) {
	  		this.store.remove("userName");
	  	}
	  }
  };
  Downsha.DownshaContext.prototype.getUserPass = function() {
    if (this._userPass == null && this.store != null) {
    	this._userPass = this.store.get("userPass");
    }
    return this._userPass;
  };
  Downsha.DownshaContext.prototype.setUserPass = function(userPass) {
  	if (userPass != null) {
	    this._userPass = userPass;
	  	if (this.store != null) {
	  		this.store.put("userPass", this._userPass);
	  	}
	  } else {
	  	this._userPass = null;
	  	if (this.store != null) {
	  		this.store.remove("userPass");
	  	}
	  }
  };
  Downsha.DownshaContext.prototype.getSessId = function() {
    if (this._sessId == null && this.store != null) {
  			this._sessId = this.store.get("sessId");
    }
    return (this._sessId != null) ? this._sessId : Downsha.DownshaContext.SESS_ID;
  };
  Downsha.DownshaContext.prototype.setSessId = function(sessId) {
  	if (sessId != null) {
	  	this._sessId = sessId;
	  	if (this.store != null) {
	  		this.store.put("sessId", this._sessId);
	  	}
	  } else {
	  	this._sessId = null;
	  	if (this.store != null) {
	  		this.store.remove("sessId");
	  	}
	  }
  };
  Downsha.DownshaContext.prototype.getSessTime = function() {
  	if (this._sessTime == null && this.store != null) {
  		var sessTime = parseInt(this.store.get("sessTime"));
  		if (!isNaN(sessTime)) {
  			this._sessTime = sessTime;
  		}
  	}
  	return this._sessTime;
  };
  Downsha.DownshaContext.prototype.setSessTime = function(sessTime) {
  	if (sessTime != null) {
	  	sessTime = parseInt(sessTime);
	  	if (isNaN(sessTime)) {
	  		return;
	  	}
	  	this._sessTime = sessTime;
	  	if (this.store != null) {
	  		this.store.put("sessTime", this._sessTime);
	  	}
	  } else {
	  	this._sessTime = null;
	  	if (this.store != null) {
	  		this.store.remove("sessTime");
	  	}
	  }
  };
  Downsha.DownshaContext.prototype.generateHardId = function() {
  	var hardId = "";
  	for (var i = 0; i < 32; i ++) {
  		var charCode = Math.floor((Math.random()*16));
  		if (charCode < 10) {
  			charCode += 48;
  		} else {
  			charCode += 55;
  		}
  		hardId += String.fromCharCode(charCode);
  	}
  	return hardId;
  };
  Downsha.DownshaContext.prototype.getHardId = function() {
    if (this._hardId == null && this.store != null) {
    	this._hardId = this.store.get("hardId");
    }
    if (this._hardId == null) {
    	this.hardId = this.generateHardId();
    }
    return this._hardId;
  };
  Downsha.DownshaContext.prototype.setHardId = function(hardId) {
  	if (hardId != null) {
	  	this._hardId = hardId;
	  	if (this.store != null) {
	  		this.store.put("hardId", this._hardId);
	  	}
	  } else {
	  	this._hardId = null;
	  	if (this.store != null) {
	  		this.store.remove("hardId");
	  	}
	  }
  };
  Downsha.DownshaContext.prototype.getTermId = function() {
    if (this._termId == null && this.store != null) {
      var termId = parseInt(this.store.get("termId"));
      if (!isNaN(termId)) {
  			this._termId = termId;
  		}
    }
    return (this._termId != null) ? this._termId : Downsha.DownshaContext.TERM_ID;
  };
  Downsha.DownshaContext.prototype.setTermId = function(termId) {
  	if (termId != null) {
	  	termId = parseInt(termId);
	  	if (isNaN(termId)) {
	  		return;
	  	}
	  	this._termId = termId;
	  	if (this.store != null) {
	  		this.store.put("termId", this._termId);
	  	}
	  } else {
	  	this._termId = null;
	  	if (this.store != null) {
	  		this.store.remove("termId");
	  	}
	  }
  };
  Downsha.DownshaContext.prototype.getTermClass = function() {
  	if (this._termClass == null) {
  		this._termClass = Downsha.DownshaTerm.TERM_CLASS.PLUGIN;
  	}
  	return this._termClass;
  };
  Downsha.DownshaContext.prototype.setTermClass = function(termClass) {
  	this._termClass = termClass;
  };
  Downsha.DownshaContext.prototype.getTermType = function() {
  	if (this._termType == null) {
  		this._termType = Downsha.DownshaTerm.TERM_TYPE.FIREFOX;
  	}
  	return this._termType;
  };
  Downsha.DownshaContext.prototype.setTermType = function(termType) {
  	this._termType = termType;
  };
  Downsha.DownshaContext.prototype.getVersion = function() {
  	if (this._version == null) {
  		this._version = Downsha.chrome.version;
  	}
  	return this._version;
  };
  Downsha.DownshaContext.prototype.setVersion = function(version) {
  	this._version = version;
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
        serviceProto : this.serviceProto,
        serviceDomain : this.serviceDomain
      });
    }
    return this._options;
  };
  Downsha.DownshaContext.prototype.getLogLevel = function() {
    return this.options.debugLevel;
  };
  Downsha.DownshaContext.prototype.getPreferredStylingStrategyName = function() {
    var opts = this.getOptions(true);
    var ss = null;
    if (opts && opts.clipStyle == Downsha.Options.CLIP_STYLE_OPTIONS.TEXT) {
      ss = "ClipTextStylingStrategy";
    } else if (opts && opts.clipStyle == Downsha.Options.CLIP_STYLE_OPTIONS.FULL) {
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

	Downsha.DownshaContext.prototype.getCookie = function(cookieName, success, fail, storeId, stores) {
		var self = this;
		var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
		var cookies = cookieManager.enumerator;
		while (cookies.hasMoreElements()) {
			var cookie = cookies.getNext().QueryInterface(Ci.nsICookie);
			if(cookie.name == cookieName) {
				success(cookie);
				return;
			}
		}
		if (typeof Downsha.chrome == 'object' && Downsha.chrome != null && Downsha.chrome.cookies) {
			var opts = {
				url : this.getSecureServiceUrl(),
				name : cookieName
			};
			if (storeId) {
				opts.storeId = storeId;
				Downsha.chrome.cookies.get(opts, function(cookie) {
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
				Downsha.chrome.cookies.getAllCookieStores(function(stores) {
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
})();
