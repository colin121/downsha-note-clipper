/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: record all the processed entries in array and can be persisted via context.
 */

(function() {
  var LOG = null;

  Downsha.ProcessLog = function ProcessLog() {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("transcript", this.getTranscript);
    this.__defineSetter__("transcript", this.setTranscript);
    this.__defineGetter__("length", this.getLength);
    this.initialize();
  };
  Downsha.ProcessLog.fromObject = function(obj) {
    if (obj instanceof Downsha.ProcessLog) {
      return obj;
    } else {
      var log = new Downsha.ProcessLog();
      if (typeof obj == 'object' && obj) {
        log.transcript = obj;
      }
      return log;
    }
  };
  Downsha.ProcessLog.prototype._transcript = null;
  Downsha.ProcessLog.prototype._length = 0;
  Downsha.ProcessLog.prototype.initialize = function() {
    this._transcript = {};
  };
  Downsha.ProcessLog.prototype.getTranscript = function() {
    return this._transcript;
  };
  Downsha.ProcessLog.prototype.setTranscript = function(transcript) {
    this.removeAll();
    if (typeof transcript == 'object' && transcript) {
      for ( var i in transcript) {
        var t = parseInt(i);
        if (!isNaN(t) && t > 0) {
          var vals = [].concat(transcript[i]);
          this._length += vals.length;
          if (typeof this._transcript[i] == 'undefined') {
            this._transcript[i] = vals;
          } else {
            this._transcript[i] = this._transcript[i].concat(vals);
          }
        }
      }
    }
  };
  Downsha.ProcessLog.prototype._milsFromObject = function(milsOrDate) { // get milliseconds from passed parameter
    var t = 0;
    if (milsOrDate instanceof Date) {
      t = milsOrDate.getTime();
    } else if (typeof milsOrDate == 'number' && !isNaN(milsOrDate)) {
      t = milsOrDate;
    } else if (typeof milsOrDate == 'string') {
      t = parseInt(milsOrDate);
      if (isNaN(t) || t < 0) {
        t = 0;
      }
    }
    return t;
  };
  Downsha.ProcessLog.prototype.add = function(entry) {
    var d = new Date().getTime();
    if (typeof this.transcript[d] == 'undefined') { // stored key is current timestamp (milliseconds)
      this.transcript[d] = [ entry ];
      this._length++;
    } else {
      this.transcript[d] = this.transcript[d].concat(entry);
      this._length++;
    }
  };
  Downsha.ProcessLog.prototype.remove = function(entry) {
    var indexes = [];
    var x = -1;
    for ( var i in this.transcript) {
      if ((x = this._transcript[i].indexOf(entry)) >= 0) {
        indexes.push( [ i, x ]);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      var ix = indexes[i];
      delete this._transcript[ix[0]][ix[1]];
      if (this._transcript[ix[0]].length == 0) {
        delete this._transcript[ix[0]];
      }
      this._length--;
    }
  };
  Downsha.ProcessLog.prototype.removeAll = function() {
    this._transcript = {};
    this._length = 0;
  };
  Downsha.ProcessLog.prototype.get = function(entry) {
    var entries = [];
    var x = -1;
    for ( var i in this.transcript) {
      if ((x = this.transcript[i].indexOf(entry)) >= 0) {
        entries.push(this.transcript[i][x]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getAll = function() {
    var entries = [];
    for ( var i in this.transcript) {
      entries = entries.concat(this._transcript[i]);
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getBefore = function(milsOrDate) { // get all entries which were created before specified time
    var t = this._milsFromObject(milsOrDate);
    var entries = [];
    for ( var i in this.transcript) {
      if (t > parseInt(i)) {
        entries = entries.concat(this.transcript[i]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getAfter = function(milsOrDate) { // get all entries which were created after specified time
    var t = this._milsFromObject(milsOrDate);
    var entries = [];
    for ( var i in this.transcript) {
      if (t < parseInt(i)) {
        entries = entries.concat(this.transcript[i]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.removeBefore = function(milsOrDate) { // remove all entries which were created before specified time
    var t = this._milsFromObject(milsOrDate);
    var indexes = [];
    for ( var i in this.transcript) {
      if (t > parseInt(i)) {
        indexes = indexes.concat(this.transcript[i]);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      this._length -= this._transcript[indexes[i]].length;
      delete this._transcript[indexes[i]];
    }
  };
  Downsha.ProcessLog.prototype.removeAfter = function(milsOrDate) { // remove all entries which were created after specified time
    var t = this._milsFromObject(milsOrDate);
    var indexes = [];
    for ( var i in this.transcript) {
      if (t < parseInt(i)) {
        indexes = indexes.concat(this.transcript[i]);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      this._length -= this._transcript[indexes[i]].length;
      delete this._transcript[indexes[i]];
    }
  };
  Downsha.ProcessLog.prototype.getBetween = function(fromDate, toDate) { // get all entries which were created between specified time
    var from = this._milsFromObject(fromDate);
    var to = this._milsFromObject(toDate);
    var entries = [];
    for ( var i in this.transcript) {
      var ii = parseInt(i);
      if (from <= ii && ii <= to) {
        entries = entries.concat(this.transcript[i]);
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.removeBetween = function(fromDate, toDate) { // remove all entries which were created between specified time
    var from = this._milsFromObject(fromDate);
    var to = this._milsFromObject(toDate);
    var indexes = [];
    for ( var i in this.transcript) {
      var ii = parseInt(i);
      if (from <= ii && ii <= to) {
        indexes = indexes.concat(i);
      }
    }
    for ( var i = 0; i < indexes.length; i++) {
      this._length -= this._transcript[indexes[i]].length;
      delete this._transcript[indexes[i]];
    }
  };
  Downsha.ProcessLog.prototype.filter = function(fn) { // get entries which are choosen by filter function: fn
    var entries = [];
    for ( var i in this.transcript) {
      var ii = parseInt(i);
      for ( var x = 0; x < this._transcript[i].length; x++) {
        if (fn(ii, this._transcript[i][x])) {
          entries = entries.concat(this._transcript[i][x]);
        }
      }
    }
    return (entries.length > 0) ? entries : null;
  };
  Downsha.ProcessLog.prototype.getLength = function() {
    return this._length;
  };
  Downsha.ProcessLog.prototype.toJSON = function() {
    return this.transcript;
  };
})();
