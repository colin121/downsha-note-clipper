/**
 * @author: chenmin
 * @date: 2011-09-02
 * @desc: abstract definition of window opener
 */

(function() {
	Downsha.WindowOpener = function WindowOpener(win, impl) {
	  this.__defineGetter__("impl", this.getImplementation);
	  this.__defineSetter__("impl", this.setImplementation);
	  this.initialize(win, impl);
	};
	Downsha.WindowOpener.prototype._impl = null;
	Downsha.WindowOpener.prototype.window = null;
	Downsha.WindowOpener.prototype.initialize = function(win, impl) {
	  if (win) {
	    this.window = win;
	  } else if (window) {
	    this.window = window;
	  }
	  if (typeof impl == 'undefined' && typeof navigator == 'object' && navigator != null) {
	    var implClass = Downsha.WindowOpenerImplFactory.getImplementationFor(navigator);
	    if (implClass) {
	      impl = new implClass();
	    }
	  }
	  this.setImplementation(impl);
	};
	Downsha.WindowOpener.prototype.setImplementation = function(impl) {
	  if (impl instanceof Downsha.WindowOpenerImpl) {
	    this._impl = impl;
	    this._impl.opener = this;
	  } else if (impl == null) {
	    this._impl = null;
	  }
	};
	Downsha.WindowOpener.prototype.getImplementation = function() {
	  return this._impl;
	};
	Downsha.WindowOpener.prototype.openUrl = function(url, winName, winOptions) {
	  return this.impl.openUrl(url, winName, winOptions);
	};
	
	Downsha.WindowOpenerImplFactory = {
	  getImplementationFor : function(navigator) {
	    var reg = Downsha.WindowOpenerImpl.ClassRegistry;
	    for ( var i = 0; i < reg.length; i++) {
	      if (typeof reg[i] == 'function'
	          && typeof reg[i].isResponsibleFor == 'function'
	          && reg[i].isResponsibleFor(navigator)) {
	        return reg[i];
	      }
	    }
	    return null;
	  }
	};
	
	Downsha.WindowOpenerImpl = function WindowOpenerImpl() {
	};
	Downsha.WindowOpenerImpl.ClassRegistry = new Array();
	Downsha.WindowOpenerImpl.handleInheritance = function(child, parent) {
	  Downsha.WindowOpenerImpl.ClassRegistry.push(child);
	};
	Downsha.WindowOpenerImpl.isResponsibleFor = function(navigator) {
	  return false;
	};
	Downsha.WindowOpenerImpl.prototype.opener = null;
	Downsha.WindowOpenerImpl.prototype.openUrl = function(url) {
	  throw new Error("Must subclass Downsha.WindowOpenerImpl.openUrl");
	};
})();
