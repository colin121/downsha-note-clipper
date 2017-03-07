/**
 * @author: chenmin
 * @date: 2011-09-19
 * @desc: multipart/form-data is used to send large binary data. 
 * format is as following:
 * Content-Type: multipart/form-data; boundary=DownshaFormBoundary1314452663776
 * --DownshaFormBoundary1314452663776
 * Content-Disposition: form-data; name="title"
 * Google
 * --DownshaFormBoundary1314452663776
 * Content-Disposition: form-data; name="url"
 * http://www.google.com/
 * --DownshaFormBoundary1314452663776
 * Content-Disposition: form-data; name="content"
 * ....contents of clip....
 * --DownshaFormBoundary1314452663776--
 */

Downsha.DownshaMultiPartForm = function DownshaMultiPartForm(data) {
  this.__defineGetter__("data", this.getData);
  this.__defineSetter__("data", this.setData);
  this.initialize(data);
};
Downsha.DownshaMultiPartForm.CONTENT_TYPE = "multipart/form-data";
Downsha.DownshaMultiPartForm.BOUNDARY_MARK = "--";
Downsha.DownshaMultiPartForm.BOUNDARY_PREFIX = "----DownshaFormBoundary";
Downsha.DownshaMultiPartForm.HEADER_SEPARATOR = "; ";
Downsha.DownshaMultiPartForm.HEADER_BOUNDARY = "boundary";
Downsha.DownshaMultiPartForm.CR = "\r\n";
Downsha.DownshaMultiPartForm.createBoundary = function() {
  return this.BOUNDARY_PREFIX + (new Date().getTime());
};
Downsha.DownshaMultiPartForm.prototype._data = null;
Downsha.DownshaMultiPartForm.prototype.boundary = null;
Downsha.DownshaMultiPartForm.prototype.initialize = function(data) {
  this.boundary = this.constructor.createBoundary();
  this.data = data;
};
Downsha.DownshaMultiPartForm.prototype.setData = function(data) {
  if (typeof data == 'object') {
    this._data = data;
  }
};
Downsha.DownshaMultiPartForm.prototype.getData = function() {
  return this._data;
};
Downsha.DownshaMultiPartForm.prototype.getContentTypeHeader = function() {
  return this.constructor.CONTENT_TYPE + this.constructor.HEADER_SEPARATOR
      + this.constructor.HEADER_BOUNDARY + "=" + this.boundary;
};
Downsha.DownshaMultiPartForm.prototype.toJSON = function() {
  return {
    contentType : this.getContentTypeHeader(),
    boundary : this.boundary,
    data : this.data
  };
};
Downsha.DownshaMultiPartForm.prototype.toString = function() {
  var str = "";
  if (this._data) {
    for ( var i in this._data) {
      if (this._data[i] == null || (this._data[i] + "").length == 0) {
        continue;
      }
      str += this.constructor.BOUNDARY_MARK + this.boundary
          + this.constructor.CR;
      str += (new Downsha.DownshaFormPart( {
        name : i,
        data : this._data[i]
      })).toString();
      str += this.constructor.CR;
    }
  }
  str += this.constructor.BOUNDARY_MARK + this.boundary
      + this.constructor.BOUNDARY_MARK + this.constructor.CR;
  return str;
};

Downsha.DownshaFormPart = function DownshaFormPart(obj) {
  this.__defineGetter__("name", this.getName);
  this.__defineSetter__("name", this.setName);
  this.__defineGetter__("data", this.getData);
  this.__defineSetter__("data", this.setData);
  this.initialize(obj);
};
Downsha.DownshaFormPart.HEADER_CONTENT_DISPOSITION = "Content-Disposition: ";
Downsha.DownshaFormPart.HEADER_FORM_DATA = "form-data";
Downsha.DownshaFormPart.HEADER_SEPARATOR = "; ";
Downsha.DownshaFormPart.HEADER_KEYVAL_SEPARATOR = "=";
Downsha.DownshaFormPart.HEADER_NAME = "name";
Downsha.DownshaFormPart.CR = "\r\n";
Downsha.DownshaFormPart.prototype._name = null;
Downsha.DownshaFormPart.prototype._data = null;
Downsha.DownshaFormPart.prototype.initialize = function(obj) {
  if (typeof obj == 'object' && obj != null) {
    this.name = (typeof obj["name"] != 'undefined') ? obj["name"] : null;
    this.data = (typeof obj["data"] != 'undefined') ? obj["data"] : null;
  }
};
Downsha.DownshaFormPart.prototype.getHeader = function() {
  return this.constructor.HEADER_CONTENT_DISPOSITION
      + this.constructor.HEADER_FORM_DATA + this.constructor.HEADER_SEPARATOR
      + this.constructor.HEADER_NAME + this.constructor.HEADER_KEYVAL_SEPARATOR
      + "\"" + this.name + "\"";
};
Downsha.DownshaFormPart.prototype.setName = function(name) {
  if (name == null) {
    this._name = null;
  } else {
    this._name = name + "";
  }
};
Downsha.DownshaFormPart.prototype.getName = function() {
  return this._name;
};
Downsha.DownshaFormPart.prototype.setData = function(data) {
  if (data == null) {
    this._data = null;
  } else {
    this._data = data + "";
  }
};
Downsha.DownshaFormPart.prototype.getData = function() {
  return this._data;
};
Downsha.DownshaFormPart.prototype.toJSON = function() {
  return {
    name : this.name,
    data : this.data
  };
};
Downsha.DownshaFormPart.prototype.toString = function() {
  return this.getHeader() + this.constructor.CR + this.constructor.CR + (this.data + "");
};
