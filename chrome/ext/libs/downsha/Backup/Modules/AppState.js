/**
 * @author: chenmin
 * @date: 2011-09-24
 * @desc: app state
 */

Downsha.AppState = function AppState(obj) {
  this.__defineGetter__("fullPage", this.isFullPage);
  this.__defineSetter__("fullPage", this.setFullPage);
  this.__defineGetter__("noteList", this.isNoteList);
  this.__defineSetter__("noteList", this.setNoteList);
  this.__defineGetter__("notebookGuid", this.getNotebookGuid);
  this.__defineSetter__("notebookGuid", this.setNotebookGuid);
  this.__defineGetter__("noteListScrollTop", this.getNoteListScrollTop);
  this.__defineSetter__("noteListScrollTop", this.setNoteListScrollTop);
  this.__defineGetter__("notifyChanges", this.isNotifyChanges);
  this.__defineSetter__("notifyChanges", this.setNotifyChanges);
  this.initialize(obj);
};

Downsha.AppState.CHANGE_EVENT_NAME = "appStateChanged";
Downsha.AppState.DEFAULTS = {
  fullPage : false,
  noteList : false,
  notifyChanges : true,
  notebookGuid : null,
  noteListScrollTop : 0
};

// whether the user specified to clip entire page rather than making a link note
Downsha.AppState.prototype._fullPage = Downsha.AppState.DEFAULTS.fullPage;
// whether the user was browsing the note list rather than clipping
Downsha.AppState.prototype._noteList = Downsha.AppState.DEFAULTS.noteList;
// last selected notebook guid
Downsha.AppState.prototype._notebookGuid = Downsha.AppState.DEFAULTS.notebookGuid;
// whether to trigger event on window object when changes occur
Downsha.AppState.prototype._noteListScrollTop = Downsha.AppState.DEFAULTS.noteListScrollTop;
Downsha.AppState.prototype._notifyChanges = Downsha.AppState.DEFAULTS.notifyChanges;

Downsha.AppState.prototype.initialize = function(obj) {
  // track what the preferred setting for change notification is
  // and disable notifications while initializing... (since this method can be
  // called by other than constructor)
  var prefNotifyChanges = this.notifyChanges;
  this.notifyChanges = false;
  if (typeof obj == 'object' && obj != null) {
    for ( var i in obj) {
      if (i == "notifyChanges") {
        prefNotifyChanges = obj[i];
      } else if (typeof this[i] != 'undefined') {
        this[i] = obj[i];
      }
    }
  }
  // restore preferred setting for change notification
  this.notifyChanges = prefNotifyChanges;
};
Downsha.AppState.prototype.setFullPage = function(bool) {
  var val = (bool) ? true : false;
  if (this._fullPage != val) {
    this._fullPage = val;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.isFullPage = function() {
  return this._fullPage;
};
Downsha.AppState.prototype.setNoteList = function(bool) {
  var val = (bool) ? true : false;
  if (this._noteList != val) {
    this._noteList = val;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.isNoteList = function() {
  return this._noteList;
};
Downsha.AppState.prototype.setNotebookGuid = function(guid) {
  if (typeof guid == 'string' && guid.length > 0 && this._notebookGuid != guid) {
    this._notebookGuid = guid;
    this.notifyChange();
  } else if (guid == null && this._notebookGuid != null) {
    this._notebookGuid = null;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.getNotebookGuid = function() {
  return this._notebookGuid;
};
Downsha.AppState.prototype.setNoteListScrollTop = function(num) {
  if (typeof num == 'number' && this._noteListScrollTop != num) {
    this._noteListScrollTop = num;
    this.notifyChange();
  } else if (num == null
      && this._noteListScrollTop != Downsha.AppState.DEFAULTS.noteListScrollTop) {
    this._noteListScrollTop = Downsha.AppState.DEFAULTS.noteListScrollTop;
    this.notifyChange();
  }
};
Downsha.AppState.prototype.getNoteListScrollTop = function() {
  return this._noteListScrollTop;
};
Downsha.AppState.prototype.setNotifyChanges = function(bool) {
  this._notifyChanges = (bool) ? true : false;
};
Downsha.AppState.prototype.isNotifyChanges = function() {
  return this._notifyChanges;
};

/** ************** Event handling *************** */
Downsha.AppState.prototype.notifyChange = function() {
  if (this.notifyChanges && window) {
    // TODO ChromePopup.initListeners call $(window)
    $(window).trigger(Downsha.AppState.CHANGE_EVENT_NAME, [ this ]);
  }
};

/** ************** Conversion *************** */
Downsha.AppState.prototype.toJSON = function() {
  return {
    fullPage : this.fullPage,
    noteList : this.noteList,
    notebookGuid : this.notebookGuid,
    noteListScrollTop : this.noteListScrollTop
  };
};
