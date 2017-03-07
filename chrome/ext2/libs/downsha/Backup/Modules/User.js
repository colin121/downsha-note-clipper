/**
 * @author: chenmin
 * @date: 2011-09-06
 * @desc: user model
 */

Downsha.User = function User(obj) {
  this.__defineGetter__("id", this.getId);
  this.__defineSetter__("id", this.setId);

  this.__defineGetter__("created", this.getCreated);
  this.__defineSetter__("created", this.setCreated);

  this.__defineGetter__("updated", this.getUpdated);
  this.__defineSetter__("updated", this.setUpdated);

  this.__defineGetter__("deleted", this.getDeleted);
  this.__defineSetter__("deleted", this.setDeleted);

  this.__defineGetter__("active", this.isActive);
  this.__defineSetter__("active", this.setActive);

  this.__defineGetter__("attributes", this.getAttributes);
  this.__defineSetter__("attributes", this.setAttributes);

  this.__defineGetter__("accounting", this.getAccounting);
  this.__defineSetter__("accounting", this.setAccounting);

  this.initialize(obj);
};
Downsha.User.javaClass = "com.downsha.edam.type.User";
Downsha.inherit(Downsha.User, Downsha.AppModel, true);
Downsha.User.prototype._id = null;
Downsha.User.prototype.username = null;
Downsha.User.prototype.email = null;
Downsha.User.prototype.name = null;
Downsha.User.prototype.timezone = null;
Downsha.User.prototype.privilege = null;
Downsha.User.prototype._created = null;
Downsha.User.prototype._updated = null;
Downsha.User.prototype._deleted = null;
Downsha.User.prototype._active = false;
Downsha.User.prototype._attributes = null;
Downsha.User.prototype._accounting = null;

Downsha.User.prototype.setId = function(id) {
  if (id == null) {
    this._id == null;
  } else if (typeof id == 'number') {
    this._id = parseInt(id);
  }
};
Downsha.User.prototype.getId = function() {
  return this._id;
};
Downsha.User.prototype.setActive = function(bool) {
  this._active = (bool) ? true : false;
};
Downsha.User.prototype.isActive = function() {
  return this._active;
};
Downsha.User.prototype.setCreated = function(num) {
  if (num == null) {
    this._created = null;
  } else if (typeof num == 'number') {
    this._created = parseInt(num);
  }
};
Downsha.User.prototype.getCreated = function() {
  return this._created;
};
Downsha.User.prototype.setUpdated = function(num) {
  if (num == null) {
    this._updated = null;
  } else if (typeof num == 'number') {
    this._updated = parseInt(num);
  }
};
Downsha.User.prototype.getUpdated = function() {
  return this._updated;
};
Downsha.User.prototype.setDeleted = function(num) {
  if (num == null) {
    this._deleted = null;
  } else if (typeof num == 'number') {
    this._deleted = parseInt(num);
  }
};
Downsha.User.prototype.getDeleted = function() {
  return this._deleted;
};
Downsha.User.prototype.setAccounting = function(accounting) {
  // do nothing for now
};
Downsha.User.prototype.getAccounting = function() {
  return this._accounting;
};
Downsha.User.prototype.setAttributes = function(attrs) {
  // do nothing for now
};
Downsha.User.prototype.getAttributes = function() {
  return this._attributes;
};