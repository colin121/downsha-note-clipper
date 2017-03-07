/**
 * @author: chenmin
 * @date: 2011-09-06
 * @desc: authentication result model
 */

Downsha.AuthenticationResult = function AuthenticationResult(obj) {
  this.__defineGetter__("timestamp", this.getTimestamp);

  this.__defineGetter__("user", this.getUser);
  this.__defineSetter__("user", this.setUser);

  this.__defineGetter__("expiration", this.getExpiration);
  this.__defineSetter__("expiration", this.setExpiration);

  this.__defineGetter__("currentTime", this.getCurrentTime);
  this.__defineSetter__("currentTime", this.setCurrentTime);
  this.initialize(obj);
}
Downsha.AuthenticationResult.javaClass = "com.downsha.edam.userstore.AuthenticationResult";
Downsha.inherit(Downsha.AuthenticationResult, Downsha.AppModel, true);
Downsha.AuthenticationResult.prototype._expiration = null;
Downsha.AuthenticationResult.prototype._currentTime = null;
Downsha.AuthenticationResult.prototype.authenticationToken = null;
Downsha.AuthenticationResult.prototype._user = null;
/**
 * timestamp keeps epoch time of when currentTime is set making it possible to
 * compare relative expiration time
 */
Downsha.AuthenticationResult.prototype._timestamp = null;
/**
 * critical time holds default value indicating how many milliseconds before
 * expiration time that this authentication result is considered in critical
 * condition
 */
Downsha.AuthenticationResult.prototype.criticalTime = (1000 * 60 * 6);
Downsha.AuthenticationResult.prototype.getTimestamp = function() {
  return this._timestamp;
}
Downsha.AuthenticationResult.prototype.setCurrentTime = function(num) {
  if (num == null) {
    this._currentTime = null;
  } else if (typeof num == 'number') {
    this._currentTime = parseInt(num);
  }
  this._timestamp = new Date().getTime();
};
Downsha.AuthenticationResult.prototype.getCurrentTime = function() {
  return this._currentTime;
};
Downsha.AuthenticationResult.prototype.setUser = function(user) {
  if (user == null) {
    this._user = null
  } else if (user instanceof Downsha.User) {
    this._user = user;
  }
};
Downsha.AuthenticationResult.prototype.getUser = function() {
  return this._user;
};
Downsha.AuthenticationResult.prototype.setExpiration = function(num) {
  if (num == null) {
    this._expiration = null;
  } else if (typeof num == 'number') {
    this._expiration = parseInt(num);
  }
};
Downsha.AuthenticationResult.prototype.getExpiration = function() {
  if (this._expiration && this.currentTime) {
    var delta = (this.timestamp) ? this.timestamp : 0;
    return ((this._expiration - this.currentTime) + delta);
  } else {
    return this._expiration;
  }
};
Downsha.AuthenticationResult.prototype.isExpiring = function() {
  var now = new Date().getTime();
  var critical = this.expiration - now - this.criticalTime;
  return (critical <= this.criticalTime);
};
Downsha.AuthenticationResult.prototype.isExpired = function() {
  var now = new Date().getTime();
  return (this.expiration <= now);
};
Downsha.AuthenticationResult.prototype.expire = function() {
  this.expiration = null;
  this.currentTime = null;
  this._timestamp = null;
};
Downsha.AuthenticationResult.prototype.isEmpty = function() {
  return (!(this.authenticationToken != null && this.user instanceof Downsha.User));
};
