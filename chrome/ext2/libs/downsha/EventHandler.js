/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: EventHandler container stores and manages events. 
 * each event name has an array of events. 
 * each event has running scope and function. 
 */

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
      fn.apply(scope, args); // call fn under the scope object
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
