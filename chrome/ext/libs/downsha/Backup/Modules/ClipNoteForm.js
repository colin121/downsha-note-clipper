/**
 * @author: chenmin
 * @date: 2011-09-06
 * @desc: abstract definition of note form
 */

Downsha.AbstractNoteForm = function AbstractNoteForm() {
};

Downsha.AbstractNoteForm.TITLE = "title";
//Downsha.AbstractNoteForm.NOTEBOOK_GUID = "notebookGuid";
//Downsha.AbstractNoteForm.TAG_NAMES = "tagNames";
Downsha.AbstractNoteForm.CONTENT = "content";
Downsha.AbstractNoteForm.COMMENT = "comment";

Downsha.inherit(Downsha.AbstractNoteForm, jQuery);
Downsha.AbstractNoteForm.onForm = function(form, fieldNames) {
  var props = {};
  for ( var i in this.prototype) {
    props[i] = this.prototype[i];
  }
  var origForm = form.get(0);
  /*
  	jquery extend method merge (copy and overwrite) props(jQuery object methods) 
  	to form object in recursive mode (deep copy)
  */
  $.extend(true, form, props);
  form.form = $(origForm);
  form.__defineGetter__("title", form.getTitle);
  form.__defineSetter__("title", form.setTitle);
  /*
  form.__defineGetter__("notebookGuid", form.getNotebookGuid);
  form.__defineSetter__("notebookGuid", form.setNotebookGuid);
  form.__defineGetter__("tagNames", form.getTagNames);
  form.__defineSetter__("tagNames", form.setTagNames);
  */
  form.__defineGetter__("content", form.getContent);
  form.__defineSetter__("content", form.setContent);
  form.__defineGetter__("comment", form.getComment);
  form.__defineSetter__("comment", form.setComment);
  if (typeof fieldNames == 'object' && fieldNames != null) {
    for ( var i in fieldNames) {
      if (typeof this.prototype[i + "FieldName"] == 'string')
        this[i + "FieldName"] = fieldNames[i];
    }
  }
  return form;
};

Downsha.AbstractNoteForm.prototype.titleFieldName = Downsha.AbstractNoteForm.TITLE;
//Downsha.AbstractNoteForm.prototype.notebookGuidFieldName = Downsha.AbstractNoteForm.NOTEBOOK_GUID;
//Downsha.AbstractNoteForm.prototype.tagNamesFieldName = Downsha.AbstractNoteForm.TAG_NAMES;
Downsha.AbstractNoteForm.prototype.contentFieldName = Downsha.AbstractNoteForm.CONTENT;
Downsha.AbstractNoteForm.prototype.commentFieldName = Downsha.AbstractNoteForm.COMMENT;

Downsha.AbstractNoteForm.prototype.getField = function(fieldName) {
  return this.form.find("*[name=" + fieldName + "]");
};
Downsha.AbstractNoteForm.prototype.getLabel = function(fieldName) {
  return this.form.find("label[for="+fieldName+"]");
};
Downsha.AbstractNoteForm.prototype.enableField = function(fieldName) {
  var field = this.getField(fieldName);
  if (field) {
    if (field.attr("tagName").toLowerCase() == 'input') {
      field.removeAttr("disabled");
    } else {
      field.removeClass("disabled");
    }
    var label = this.getLabel(fieldName);
    if (label && label.hasClass("disabled")) {
      label.removeClass("disabled");
    }
  }
};
Downsha.AbstractNoteForm.prototype.disableField = function(fieldName) {
  var field = this.getField(fieldName);
  if (field) {
    if (field.attr("tagName").toLowerCase() == "input") {
      field.attr("disabled", "disabled");
    } else {
      field.addClass("disabled");
    }
    var label = this.getLabel(fieldName);
    if (label && !(label.hasClass("disabled"))) {
      label.addClass("disabled");
    }
  }
};
Downsha.AbstractNoteForm.prototype.isFieldEnabled = function(fieldName) {
  var field = this.getField(fieldName);
  return (field && !field.hasClass("disabled"));
};
Downsha.AbstractNoteForm.prototype.getTitle = function() {
  return this.getField(this.titleFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setTitle = function(title) {
  this.getField(this.titleFieldName).val(title);
};
/*
Downsha.AbstractNoteForm.prototype.getNotebookGuid = function() {
  return this.getField(this.notebookGuidFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setNotebookGuid = function(notebookGuid) {
  this.getField(this.notebookGuidFieldName).val(notebookGuid);
};
Downsha.AbstractNoteForm.prototype.getTagNames = function() {
  return this.getField(this.tagNamesFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setTagNames = function(tagNames) {
  this.getField(this.tagNamesFieldName).val(tagNames);
};
 */
Downsha.AbstractNoteForm.prototype.getContent = function() {
  return this.getField(this.contentFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setContent = function(content) {
  this.getField(this.contentFieldName).val(content);
};
Downsha.AbstractNoteForm.prototype.getComment = function() {
  return this.getField(this.commentFieldName).val();
};
Downsha.AbstractNoteForm.prototype.setComment = function(comment) {
  this.getField(this.commentFieldName).val(comment);
};
Downsha.AbstractNoteForm.prototype.reset = function() {
  var props = this.getStorableProps();
  for ( var i = 0; i < props.length; i++) {
    this[props[i]] = null;
  }
};
Downsha.AbstractNoteForm.prototype.populateWithNote = function(context, note) {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.AbstractNoteForm.populateWithNote");
  if (note instanceof Downsha.AppModel) {
    var props = note.toStorable();
    for ( var i in props) {
      if (typeof this[i] != 'undefined' && typeof note[i] != 'undefined'
          && note[i] != null) {
        this[i] = note[i];
      }
    }
  }
};
Downsha.AbstractNoteForm.prototype.populateWith = function(note) {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.ClipNoteForm.populateWith");
  this.reset();
  if (note instanceof Downsha.AppModel) {
    var props = note.toStorable();
    for (var i in props) {
      if (typeof this[i] != 'undefined') {
        this[i] = note[i];
      }
    }
  }
};
Downsha.AbstractNoteForm.prototype.getStorableProps = function() {
  return [ "title", /*"notebookGuid", "tagNames", */"content", "comment" ];
};
Downsha.AbstractNoteForm.prototype.toStorable = function() {
  var props = this.getStorableProps();
  var storable = {};
  for ( var i = 0; i < props.length; i++) {
    storable[props[i]] = this[props[i]];
  }
  return storable;
};
Downsha.AbstractNoteForm.prototype.getModelName = function() {
  return "Downsha.AbstractNoteForm";
};
Downsha.AbstractNoteForm.prototype.getStringDescription = function() {
  return "'" + this.title + "'"/* "'; NotebookGuid: "
  + this.notebookGuid + "; TagNames: " + this.tagNames */
  + "; Content length: "
  + ((typeof this.content == 'string') ? this.content.length : 0)
  + "; Comment length: "
  + ((typeof this.comment == 'string') ? this.comment.length : 0);
};
Downsha.AbstractNoteForm.prototype.toString = function() {
  return this.getModelName() + " " + this.getStringDescription();
};

Downsha.ClipNoteForm = function ClipNoteForm(form) {
};

Downsha.ClipNoteForm.URL = "url";

Downsha.inherit(Downsha.ClipNoteForm, Downsha.AbstractNoteForm);
Downsha.ClipNoteForm.onForm = function(form, fieldNames) {
  form = Downsha.ClipNoteForm.parent.constructor.onForm.apply(this, [ form,
      fieldNames ]);
  form.__defineGetter__("url", form.getUrl);
  form.__defineSetter__("url", form.setUrl);
  return form;
};

Downsha.ClipNoteForm.prototype.urlFieldName = Downsha.ClipNoteForm.URL;

Downsha.ClipNoteForm.prototype.getUrl = function() {
  return this.getField(this.urlFieldName).val();
};
Downsha.ClipNoteForm.prototype.setUrl = function(url) {
  this.getField(this.urlFieldName).val(url);
};

Downsha.ClipNoteForm.prototype.getStorableProps = function() {
  var props = Downsha.ClipNoteForm.parent.getStorableProps.apply(this);
  props.push("url");
  return props;
};
Downsha.ClipNoteForm.prototype.populateWithNote = function(context, clipNote) {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.ClipNoteForm.populateWithNote");
  if (clipNote instanceof Downsha.ClipNote) {
    Downsha.ClipNoteForm.parent.populateWithNote.apply(this, [context, clipNote]);
    /*
    if (clipNote.notebookGuid) {
      this.notebookGuid = clipNote.notebookGuid;
    }
    */
  }
};
Downsha.ClipNoteForm.prototype.asClipNote = function() {
  if (typeof LOG != 'undefined')
    LOG.debug("Downsha.ClipNoteForm.asClipNote");
  var clipNote = new Downsha.ClipNote(this.toStorable());
  if (typeof LOG != 'undefined')
    LOG.debug(">>> CLIPNOTE: " + clipNote.toString());
  return clipNote;
};
Downsha.ClipNoteForm.prototype.getModelName = function() {
  return "Downsha.ClipNoteForm";
};
Downsha.ClipNoteForm.prototype.getStringDescription = function() {
  var superStr = Downsha.ClipNoteForm.parent.getStringDescription.apply(this);
  superStr += "; URL: " + this.url;
  return superStr;
};
