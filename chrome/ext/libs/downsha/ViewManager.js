/**
 * @author: chenmin
 * @date: 2011-09-24
 * @desc: view switch manager
 */

(function() {
  var LOG = null;
  Downsha.ViewManager = function ViewManager() {
  	LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("quiet", this.isQuiet);
    this.__defineSetter__("quiet", this.setQuiet);
  };

  Downsha.ViewManager._instance = null;
  Downsha.ViewManager.FORM_FIELD_ERROR_CLASS = "error";
  Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_CLASS = "error";
  Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_ELEMENT = "div";
  Downsha.ViewManager.PAGE_HEIGHT_DELTA = 0;

  Downsha.ViewManager.getInstance = function() {
    if (!this._instance) {
      this._instance = new Downsha.ViewManager();
    }
    return this._instance;
  };

  // instance variables
  Downsha.ViewManager.prototype.currentView = null;
  Downsha.ViewManager.prototype.globalMessage = null;
  Downsha.ViewManager.prototype.globalErrorMessage = null;
  Downsha.ViewManager.prototype._quiet = false; // set true to hide error messages

  Downsha.ViewManager.prototype.setQuiet = function(bool) {
    this._quiet = (bool) ? true : false;
  };
  Downsha.ViewManager.prototype.isQuiet = function() {
    return this._quiet;
  };
  Downsha.ViewManager.prototype.getEffectiveHeight = function() {
    LOG.debug("Downsha.ViewManager.getEffectiveHeight");
    var h = 0;
    $("body > div").each( // add the height of all div under body
        function(i, element) {
          var e = $(element);
          if (e.css("display") != "none" && !e.hasClass("banner") // except class="banner" and style="display:none;"
              && !e.hasClass("drawer") && !e.hasClass("drawerHandleTitle")) { // except class="drawer" and class="drawerHandleTitle"
            h += e.innerHeight();
          }
        });
    h = h - this.constructor.PAGE_HEIGHT_DELTA;
    if (h < 0)
      h = 0;
    return h;
  };
  Downsha.ViewManager.prototype.updateBodyHeight = function(height) {
    LOG.debug("Downsha.ViewManager.updateBodyHeight");
    var h = (typeof height == 'number') ? height : this.getEffectiveHeight();
    $("body").animate({
      height : h + "px"
    }, 10);
  };

  Downsha.ViewManager.prototype.showBlock = function(block, dataArray) {
    block.show(); // show and hide are functions provided by jQuery
    if (dataArray instanceof Array)
      block.trigger("show", dataArray);
    else
      block.trigger("show");
  };
  Downsha.ViewManager.prototype.hideBlock = function(block, dataArray) {
    block.hide();
    if (dataArray instanceof Array)
      block.trigger("hide", dataArray);
    else
      block.trigger("hide");
  };

  Downsha.ViewManager.prototype.showView = function(viewNameOrBlock, data) {
    if (viewNameOrBlock instanceof jQuery) { // jQuery node object
      var view = viewNameOrBlock;
    } else {
      var view = $("#" + viewNameOrBlock);
    }
    if (view.length == 0)
      return null;
    this.showBlock(view, [ data ]);
    return view;
  };

  Downsha.ViewManager.prototype.hideView = function(viewNameOrBlock) {
    if (viewNameOrBlock instanceof jQuery) {
      var view = viewNameOrBlock;
    } else {
      var view = $("#" + viewNameOrBlock);
    }
    if (view.length == 0 || view.css("display") == "none")
      return null;
    this.hideBlock(view);
    if (this.currentView && view.attr("id") == this.currentView.attr("id")) {
      this.currentView = null;
    }
    return view;
  };

  Downsha.ViewManager.prototype.switchView = function(viewName, data) {
    LOG.debug("Downsha.ViewManager.switchView");
    var visibleView = null;
    var view = (viewName instanceof jQuery) ? viewName : $("#" + viewName);
    if (this.currentView && this.currentView.attr("id") == view.attr("id")) {
      LOG.debug("Already showing...");
      return;
    }
    if (this.currentView) { // hide current view
      this.hideView(this.currentView.attr("id"));
    }
    if (visibleView = this.showView(viewName, data)) { // show new view
      this.currentView = visibleView;
    }
    return visibleView;
  };

  Downsha.ViewManager.prototype.switchElements = function(a, b) {
    a.hide();
    b.show();
  };

  Downsha.ViewManager.prototype.wait = function(msg) { // show spinner
    var spinnerBlock = $("#spinner");
    spinnerBlock.find("#spinnerMessage").html(msg);
    spinnerBlock.show();
  };

  Downsha.ViewManager.prototype.clearWait = function() { // hide spinner
    var spinnerBlock = $("#spinner");
    spinnerBlock.hide();
  };

  Downsha.ViewManager.prototype.showMessage = function(message) {
    if (this.quiet)
      return;
    if (this.globalMessage) {
      this.globalMessage.addMessage(message);
      this.globalMessage.show();
    }
  };
  Downsha.ViewManager.prototype.hideMessage = function(message) {
    if (this.globalMessage) {
      this.globalMessage.removeMessage(message);
      if (this.globalMessage.length() > 0) {
        this.globalMessage.show();
      } else {
        this.globalMessage.hide();
      }
    }
  };
  Downsha.ViewManager.prototype.hideAllMessages = function() {
    if (this.globalMessage) {
      this.globalMessage.removeAllMessages();
      this.globalMessage.hide();
    }
  };

  Downsha.ViewManager.prototype.extractErrorMessage = function(e, defaultMessage) {
    LOG.debug("Downsha.ViewManager.extractErrorMessage");
    var msg = (typeof defaultMessage != 'undefined') ? defaultMessage : null;
    LOG.debug("Error: " + e);
    //LOG.debug("Error: " + (typeof e == 'object' && e != null && typeof e["toString"] == 'function') ? e.toString() : e);
    if (e instanceof Downsha.DownshaError
        && typeof e.errorCode == 'number'
        && typeof e.parameter == 'string'
        && this.getLocalizedMessage("DSTPError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode) + "_" + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"))) {
      LOG.debug("Got parameterized localized message for Downsha.DownshaError");
      msg = this.getLocalizedMessage("DSTPError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode) + "_" + e.parameter.replace(/[^a-zA-Z0-9_]+/g, "_"));
    } else if (e instanceof Downsha.DSTPResponseException
        && typeof e.errorCode == 'number'
        && this.getLocalizedMessage("DSTPResponseError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode))) {
      LOG.debug("Got localized message for Downsha.DSTPResponseException");
      if (typeof e.parameter == 'string') {
        msg = this.getLocalizedMessage("DSTPResponseError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode), e.parameter);
      } else {
        msg = this.getLocalizedMessage("DSTPResponseError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode));
      }
    } else if (e instanceof Downsha.DownshaError
        && typeof e.errorCode == 'number'
        && this.getLocalizedMessage("DSTPError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode))) {
      LOG.debug("Got localized message for Downsha.DownshaError");
      if (typeof e.parameter == 'string') {
        msg = this.getLocalizedMessage("DSTPError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode), e.parameter);
      } else {
        msg = this.getLocalizedMessage("DSTPError_" + ((e.errorCode < 0) ? -e.errorCode : e.errorCode));
      }
    } else if (e instanceof Downsha.DownshaError
        && typeof e.message == 'string') {
      LOG.debug("Resorting to message included in the error");
      msg = e.message;
    } else if ((e instanceof Error || e instanceof Error)
        && typeof e.message == 'string') {
      LOG.debug("Resorting to standard message");
      msg = e.message;
    } else if (typeof e == 'string') {
      LOG.debug("Error is a string, so using that...");
      msg = e;
    }
    return msg;
  };

  Downsha.ViewManager.prototype.showError = function(error) { // show single error
    LOG.debug("Downsha.ViewManager.showError");
    if (this.quiet)
      return;
    var msg = this.extractErrorMessage(error, this.getLocalizedMessage("UnknownError"));
    if (msg != null) {
      this.globalErrorMessage.message = msg;
      this.globalErrorMessage.show();
    }
  };
  Downsha.ViewManager.prototype.showErrors = function(errors) { // show multiple errors 
    LOG.debug("Downsha.ViewManager.showErrors");
    if (this.quiet)
      return;
    var errs = (errors instanceof Array) ? errors : [ errors ];
    if (errs.length == 1) {
      this.showError(errs[0]);
      return;
    }
    var errorTitle = this.getLocalizedMessage("multipleErrorsTitle");
    var messageList = $("<ul></ul>");
    for ( var i = 0; i < errs.length; i++) { // form the errors list
      var msg = this.extractErrorMessage(errors[i]);
      if (msg != null)
        messageList.append("<li>" + msg + "</li>");
    }
    if (messageList.children().length > 0) {
      var errorBlock = $("<div class='multiErrorTitle'></div>");
      errorBlock.append(errorTitle);
      errorBlock.append(messageList);
      this.globalErrorMessage.message = errorBlock;
      this.globalErrorMessage.show();
    }
  };
  Downsha.ViewManager.prototype.hideError = function() {
    this.globalErrorMessage.hide();
  };
  Downsha.ViewManager.prototype.hideErrors = function() {
    this.globalErrorMessage.hide();
  };
  Downsha.ViewManager.prototype.showHttpError = function(xhr, textStatus, error) {
    LOG.debug("Downsha.ViewManager.showHttpError");
    if (this.quiet)
      return;
    var msg = this.getLocalizedHttpErrorMessage(xhr, textStatus, error);
    this.showError(new Error(msg));
  };
  Downsha.ViewManager.prototype.getLocalizedHttpErrorMessage = function(xhr, textStatus, error) {
    LOG.debug("Downsha.ViewManager.getLocalizedHttpErrorMessage");
    if (xhr.readyState == 4) {
    	var msg = this.getLocalizedMessage("Error_HTTP_Transport", 
    	[ ("" + xhr.status), ((typeof error == 'string') ? error : "") ]);
    } else {
    	var msg = this.getLocalizedMessage("Error_HTTP_Transport", 
    	[ ("readyState: " + xhr.readyState), "" ]);
    }
    return msg;
  };
  Downsha.ViewManager.prototype.getLocalizedMessage = function(messageKey, params) {
    if (typeof chrome != 'undefined'
        && typeof chrome.i18n.getMessage == 'function') {
      return chrome.i18n.getMessage(messageKey, params);
    } else {
      return messageKey;
    }
  };
  Downsha.ViewManager.prototype.showFormErrors = function(form, errors, callback) {
    LOG.debug("Downsha.ViewManager.showFormErrors(" + (typeof form) + ", " + (typeof errors) + ")");
    if (this.quiet)
      return;
    var f = (form instanceof jQuery) ? form : $(form);
    for ( var i = 0; i < errors.length; i++) {
      var e = errors[i];
      var msg = this.extractErrorMessage(e);
      LOG.debug(e.toString() + " => " + msg);
      if (typeof callback == 'function') {
        callback(((typeof e.parameter == 'string') ? e.parameter : null), msg);
      } else {
        var field = null;
        if (typeof e.parameter == 'string' && msg != null) {
          field = f.find("[name=" + e.parameter + "]");
          if (field.length == 0) {
            field = null;
          }
        }
        if (field) {
          this.showFormFieldErrors(field, msg);
        } else {
          this.showError(msg);
        }
      }
    }
  };
  Downsha.ViewManager.prototype.showFormFieldErrors = function(field, errorMessage) {
    LOG.debug("Downsha.ViewManager.showFormFieldError(" + field + ", " + errorMessage + ")");
    if (this.quiet)
      return;
    if (typeof field == 'undefined')
      return;
    if (!(field instanceof jQuery))
      field = $(field);
    if (!field.hasClass(this.constructor.FORM_FIELD_ERROR_CLASS))
      field.addClass(this.constructor.FORM_FIELD_ERROR_CLASS);
    if (field.next("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).length == 0) {
      field.after($("<" + this.constructor.FORM_FIELD_ERROR_MESSAGE_ELEMENT
          + " class='" + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS + "'>"
          + errorMessage + "</"
          + this.constructor.FORM_FIELD_ERROR_MESSAGE_ELEMENT + ">"));
    } else {
      field.next("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).html(errorMessage);
    }
  };
  Downsha.ViewManager.prototype.clearFormArtifacts = function(form) {
    LOG.debug("Downsha.ViewManager.clearFormArtifacts");
    if (typeof form == 'undefined')
      return;
    if (!(form instanceof jQuery))
      form = $(form);
    LOG.debug("Removing error messages...");
    form.find("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).remove();
    LOG.debug("Removing error classes from fields");
    form.find("." + this.constructor.FORM_FIELD_ERROR_CLASS).removeClass(this.constructor.FORM_FIELD_ERROR_CLASS);
    LOG.debug("Done...");
  };

  /**
   * SimpleMessage
   * 
   * @param containerSelector
   */
  Downsha.ViewManager.SimpleMessage = function(containerSelector) {
    this.initialize(containerSelector);
  };
  Downsha.ViewManager.SimpleMessage.MESSAGE_CLASS = "simpleMessage";
  Downsha.ViewManager.SimpleMessage.prototype._container = null;
  Downsha.ViewManager.SimpleMessage.prototype._message = null;
  Downsha.ViewManager.SimpleMessage.prototype.initialize = function(containerSelector) {
    this.__defineGetter__("container", this.getContainer);
    this.__defineGetter__("message", this.getMessage);
    this.__defineSetter__("message", this.setMessage);
    if (typeof containerSelector != 'undefined' && containerSelector) {
      this._container = (containerSelector instanceof jQuery) ? containerSelector
          : $(containerSelector);
    }
  };
  Downsha.ViewManager.SimpleMessage.prototype.getContainer = function() {
    return this._container;
  };
  Downsha.ViewManager.SimpleMessage.prototype.setMessage = function(message) {
    this._message = message;
  };
  Downsha.ViewManager.SimpleMessage.prototype.getMessage = function() {
    return this._message;
  };
  Downsha.ViewManager.SimpleMessage.prototype.show = function() {
    if (this.message) {
      var msgBlock = this.createMessageBlock();
      msgBlock.append(this.message);
      this._container.empty();
      this._container.append(msgBlock);
    } else {
      this._container.empty();
    }
    this._container.show();
  };
  Downsha.ViewManager.SimpleMessage.prototype.hide = function() {
    this._container.hide();
  };
  Downsha.ViewManager.SimpleMessage.prototype.createMessageBlock = function() {
    return $("<div class='" + this.getMessageClass() + "'></div>");
  };
  Downsha.ViewManager.SimpleMessage.prototype.getMessageClass = function() {
    return Downsha.ViewManager.SimpleMessage.MESSAGE_CLASS;
  };

  /**
   * StackableMessage
   * 
   * @param containerSelector
   */
  Downsha.ViewManager.StackableMessage = function(containerSelector) {
    this.initialize(containerSelector);
  };
  Downsha.inherit(Downsha.ViewManager.StackableMessage,
      Downsha.ViewManager.SimpleMessage);
  Downsha.ViewManager.StackableMessage.MESSAGE_CLASS = "stackableMessage";
  Downsha.ViewManager.StackableMessage.prototype._messageStack = new Array();
  Downsha.ViewManager.StackableMessage.prototype.initialize = function(
      containerSelector) {
    Downsha.ViewManager.StackableMessage.parent.initialize.apply(this,
        arguments);
  };
  Downsha.ViewManager.StackableMessage.prototype.getMessage = function() {
    if (this._messageStack.length > 0)
      return this._messageStack[(this._messageStack.length - 1)];
    else
      return null;
  };
  Downsha.ViewManager.StackableMessage.prototype.setMessage = function(message) {
    this._messageStack = new Array();
    this.addMessage(message);
  };
  Downsha.ViewManager.StackableMessage.prototype.addMessage = function(msg) {
    this._messageStack.push(this._describeMessage(msg));
  };
  Downsha.ViewManager.StackableMessage.prototype.removeMessage = function(msg) {
    var msgDescription = this._describeMessage(msg);
    for ( var i = this._messageStack.length - 1; i >= 0; i--) {
      if (this._messageStack[i] == msgDescription) {
        this._messageStack.splice(i, 1);
        break;
      }
    }
  };
  Downsha.ViewManager.StackableMessage.prototype.removeAllMessages = function() {
    this._messageStack = new Array();
  };
  Downsha.ViewManager.StackableMessage.prototype.length = function() {
    return this._messageStack.length;
  };
  Downsha.ViewManager.StackableMessage.prototype._describeMessage = function(
      msg) {
    var str = "";
    if (typeof msg == 'string') {
      str = msg;
    } else if (msg instanceof jQuery) {
      msg.each(function(i, e) {
        str += this._describeMessage(e);
      });
    } else if (msg instanceof Text) {
      str += msg;
    } else if (msg instanceof HTMLElement) {
      str += msg.innerHTML;
    }
    return str;
  };
  Downsha.ViewManager.StackableMessage.prototype.getMessageClass = function() {
    return Downsha.ViewManager.StackableMessage.parent.getMessageClass.apply(this)
        + " " + Downsha.ViewManager.StackableMessage.MESSAGE_CLASS;
  };
})();
