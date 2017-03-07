/**
 * @author: chenmin
 * @date: 2011-09-10
 * @desc: view switch manager
 */
(function() {
  var LOG = null;
  Downsha.ViewManager = function ViewManager() {
  	LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("containerResizeCallback", this.getContainerResizeCallback);
    this.__defineSetter__("containerResizeCallback", this.setContainerResizeCallback);
    this.__defineGetter__("globalMessage", this.getGlobalMessage);
    this.__defineSetter__("globalMessage", this.setGlobalMessage);
    this.__defineGetter__("globalErrorMessage", this.getGlobalErrorMessage);
    this.__defineSetter__("globalErrorMessage", this.setGlobalErrorMessage);
    this.__defineGetter__("quiet", this.getQuiet);
  };
	
	Downsha.ViewManager._instance = null;
	Downsha.ViewManager.FORM_FIELD_ERROR_CLASS = "error";
	Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_CLASS = "error";
	Downsha.ViewManager.FORM_FIELD_ERROR_MESSAGE_ELEMENT = "div";
	Downsha.ViewManager.CONTAINER_MIN_SIZE = 38;
	
  Downsha.ViewManager.getInstance = function() {
    if (!this._instance) {
      this._instance = new Downsha.ViewManager();
    }
    return this._instance;
  };
  
	Downsha.ViewManager.prototype._containerResizeCallback = null;
	Downsha.ViewManager.prototype._globalMessage = null;
	Downsha.ViewManager.prototype._globalErrorMessage = null;
	Downsha.ViewManager.prototype._quiet = false;
	Downsha.ViewManager.prototype._animateContainerResizing = true;
	Downsha.ViewManager.prototype._currentView = null;
	
	Downsha.ViewManager.prototype.getContainerResizeCallback = function() {
		return this._containerResizeCallback;
	};
	Downsha.ViewManager.prototype.setContainerResizeCallback = function(fn) {
		if (typeof fn == "function") {
			this._containerResizeCallback = fn;
		}
	};
	Downsha.ViewManager.prototype.getGlobalMessage = function() {
		return this._globalMessage;
	};
	Downsha.ViewManager.prototype.setGlobalMessage = function(msg) {
		this._globalMessage = msg;
	};
	Downsha.ViewManager.prototype.getGlobalErrorMessage = function() {
		return this._globalErrorMessage;
	};
	Downsha.ViewManager.prototype.setGlobalErrorMessage = function(msg) {
		this._globalErrorMessage = msg;
	};
	Downsha.ViewManager.prototype.getQuiet = function() {
		return this._quiet;
	};
	
	Downsha.ViewManager.prototype.getEffectiveHeight = function() {
		LOG.debug("ViewManager.getEffectiveHeight");
	  var h = 0;
	  $("body > div").each( // add the height of all div under body
		  function(i, element) {
		    var e = $(element);
		    if (e.css("display") != "none" && !e.hasClass("banner") && 
		    	!e.hasClass("drawer") && !e.hasClass("drawerHandleTitle")) {
		      h += e.innerHeight();
		    }
		  });
		
	  var waitBlock = $("#spinner"); // add wait block height
	  if (waitBlock && waitBlock.css("display") != "none") {
	    h += waitBlock.height();
	  }
	  if (this.globalErrorMessage && // add error message block height
	  	this.globalErrorMessage.container.css("display") != "none") {
	    h += (this.globalErrorMessage.container.height() + 18);
	  }
	  // total height must be greater than specified value
	  if (h < this.constructor.CONTAINER_MIN_SIZE) {
	  	h = this.constructor.CONTAINER_MIN_SIZE;
	  }
	  return h;
	};
	
	Downsha.ViewManager.prototype.getWindowHeight = function() {
		LOG.debug("ViewManager.getWindowHeight");
	  var h = 0;
	  $("body > div").each(function(i, element) {
	    var e = $(element);
	    if (e.css("display") != "none" && !e.hasClass("banner") && 
	    	!e.hasClass("drawer") && !e.hasClass("drawerHandleTitle")) {
				if(e.css("float") != "none") { // special handle for float
					h = Math.max(h, e.innerHeight());
				} else {
					h += e.innerHeight();
				}
	    }
	  });
	  var waitBlock = $("#spinner");
	  if (waitBlock && waitBlock.css("display") != "none") {
	    h += waitBlock.height();
	  }
	  if (this.globalErrorMessage && 
	  	this.globalErrorMessage.container.css("display") != "none") {
	    h += this.globalErrorMessage.container.height();
	  }
	  // total height must be greater than specified value
	  if (h < this.constructor.CONTAINER_MIN_SIZE) {
	  	h = this.constructor.CONTAINER_MIN_SIZE;
	  }
	  return h;
	};
	
	Downsha.ViewManager.prototype.updateBodyHeight = function(height) {
	  var h = (typeof height == 'number') ? height : this.getEffectiveHeight();
	  if (this._animateContainerResizing) { // update container(body) height
	    $("body").animate({height: h+"px"}, 10);
	  } else {
	    $("body").css({height: h+"px"});
	  }
    if (typeof this._containerResizeCallback == 'function') {
    	this._containerResizeCallback(h);
    }
	};
	
	Downsha.ViewManager.prototype.showBlock = function(block, dataArray) {
	  block.show();
	  if (dataArray instanceof Array)
	    block.trigger("show", dataArray);
	  else
	    block.trigger("show");
	  this.updateBodyHeight();
	};
	Downsha.ViewManager.prototype.hideBlock = function(block, dataArray) {
	  block.hide();
	  if (dataArray instanceof Array)
	    block.trigger("hide", dataArray);
	  else
	    block.trigger("hide");
	  this.updateBodyHeight();
	};
	
	Downsha.ViewManager.prototype.showView = function(viewNameOrBlock, data) {
	  if (viewNameOrBlock instanceof jQuery) {
	    var view = viewNameOrBlock;
	  } else {
	    var view = $("#" + viewNameOrBlock);
	  }
	  if (view.length == 0)
	    return null;
	  this.showBlock(view, [ data ]);
	  this._currentView = view;
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
	  if (this._currentView && view.attr("id") == this._currentView.attr("id")) {
	    this._currentView = null;
	  }
	  return view;
	};
	
	Downsha.ViewManager.prototype.switchView = function(viewName, data) {
		LOG.debug("ViewManager.switchView");
	  var view = (viewName instanceof jQuery) ? viewName : $("#" + viewName);
	  if (this._currentView && this._currentView.attr("id") == view.attr("id")) {
	  	LOG.debug("Already showing...");
	    return;
	  }
	  if (this._currentView) { // hide existing view
	    this.hideView(this._currentView.attr("id"));
	  }
	  return this.showView(viewName, data);
	};
	
	Downsha.ViewManager.prototype.switchElements = function(a, b) {
	    a.hide();
	    b.show();
	};
	
	Downsha.ViewManager.prototype.wait = function(msg) {
	  var spinnerBlock = $("#spinner");
	  spinnerBlock.find("#spinnerMessage").text(msg); // set msg to spinnerMessage div
	  spinnerBlock.show();
	  this.updateBodyHeight();
	};
	
	Downsha.ViewManager.prototype.clearWait = function() {
	  var spinnerBlock = $("#spinner");
	  spinnerBlock.hide();
	  this.updateBodyHeight();
	};
	
	Downsha.ViewManager.prototype.showMessage = function(message) {
	  if (this.globalMessage) {
	    this.globalMessage.addMessage(message);
	    this.globalMessage.show();
	  }
	};
	Downsha.ViewManager.prototype.hideMessage = function(message) {
	  if (this.globalMessage) {
	    this.globalMessage.removeMessage(message);
	    if (this.globalMessage.length() > 0) {
	      this.globalMessage.show(); // show next message automatically
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
	
	Downsha.ViewManager.prototype.extractErrorMessage = function(e, defaultMessage) { // get localized error message by error type
		LOG.debug("ViewManager.extractErrorMessage");
	  var msg = (typeof defaultMessage != 'undefined') ? defaultMessage : null;
	  LOG.debug("Error: " + e);
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
	
	Downsha.ViewManager.prototype.showError = function(error) {
		LOG.debug("ViewManager.showError");
	  var msg = this.extractErrorMessage(error, this.getLocalizedMessage("UnknownError"));
	  if (msg != null) {
	    this.globalErrorMessage.message = msg;
	    this.globalErrorMessage.show();
	    this.updateBodyHeight();
	  }
	};
	Downsha.ViewManager.prototype.showErrors = function(errors) {
		LOG.debug("ViewManager.showErrors");
		if (this.quiet) {
			return;
		}
		var errs = (errors instanceof Array) ? errors : [ errors ];
		if (errs.length == 1) {
			this.showError(errs[0]);
			return;
		}
		var errorTitle = this.getLocalizedMessage("multipleErrorsTitle");
		var messageList = $("<ul>");
		for ( var i = 0; i < errs.length; i++) {
			var msg = this.extractErrorMessage(errors[i]);
			if (msg != null) {
				messageList.append($("<li>", {text : msg}));
			}
		}
		if (messageList.children().length > 0) {
			var errorBlock = $("<div>", {className : "multiErrorTitle"});
			errorBlock.append(errorTitle);
			errorBlock.append(messageList);
			this.globalErrorMessage.message = errorBlock;
			this.globalErrorMessage.show();
		}
		this.updateBodyHeight();
	};
	Downsha.ViewManager.prototype.hideError = function() {
	  this.globalErrorMessage.hide();
	  this.updateBodyHeight();
	};
	Downsha.ViewManager.prototype.hideErrors = function() {
	  this.globalErrorMessage.hide();
	  this.updateBodyHeight();
	};
	Downsha.ViewManager.prototype.showHttpError = function(xhr, textStatus, error) {
		LOG.debug("ViewManager.showHttpError");
	  this.showError(new Error(this.getLocalizedHttpErrorMessage(xhr, textStatus, error)));
	};
	Downsha.ViewManager.prototype.getLocalizedHttpErrorMessage = function(xhr, textStatus, error) {
	    LOG.debug("ViewManager.getLocalizedHttpErrorMessage");
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
	  if (typeof Downsha.chrome != 'undefined'
	      && typeof Downsha.chrome.i18n.getMessage == 'function') {
	    return Downsha.chrome.i18n.getMessage(messageKey, params);
	  } else {
	    return messageKey;
	  }
	};
	Downsha.ViewManager.prototype.showFormErrors = function(form, errors, callback) {
		LOG.debug("ViewManager.showFormErrors(" + (typeof form) + ", " + (typeof errors) + ")");
	    if (this.quiet) {
	    	return;
	    }
	    var f = (form instanceof jQuery) ? form : $(form);
	    for (var i = 0; i < errors.length; i++) {
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
	    this.updateBodyHeight();
	};
	
	Downsha.ViewManager.prototype.showFormFieldErrors = function(field, errorMessage) {
		LOG.debug("ViewManager.showFormFieldError(" + field + ", " + errorMessage + ")");
		if (this.quiet || typeof field == 'undefined') {
			return;
		}
		if (!(field instanceof jQuery)) {
			field = $(field);
		}
		if (!field.hasClass(this.constructor.FORM_FIELD_ERROR_CLASS)) {
			field.addClass(this.constructor.FORM_FIELD_ERROR_CLASS);
		}
		if (field.next("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).length == 0) {
			field.after($("<" + this.constructor.FORM_FIELD_ERROR_MESSAGE_ELEMENT 
				+ " class='" + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS + "'>" + 
				errorMessage + "</" + 
				this.constructor.FORM_FIELD_ERROR_MESSAGE_ELEMENT + ">"));
		} else {
			field.next("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).text(errorMessage);
		}
	};
	Downsha.ViewManager.prototype.clearFormArtifacts = function(form) {
		LOG.debug("ViewManager.clearFormArtifacts");
	  if (typeof form == 'undefined') {
	    return;
	  }
	  if (!(form instanceof jQuery)) {
	    form = $(form);
	  }
		
		LOG.debug("Removing error messages...");
	  form.find("." + this.constructor.FORM_FIELD_ERROR_MESSAGE_CLASS).remove();
	  LOG.debug("Removing error classes from fields");
	  form.find("." + this.constructor.FORM_FIELD_ERROR_CLASS).removeClass(this.constructor.FORM_FIELD_ERROR_CLASS);
	  this.updateBodyHeight();
	};
})();
	
(function() {
  var LOG = null;
	Downsha.ViewManager.SimpleMessage = function(containerSelector) {
		LOG = Downsha.Logger.getInstance();
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
	    // containerSelector is a jquery selector object: $("#globalErrorMessage")
	    this._container = (containerSelector instanceof jQuery) ? containerSelector : $(containerSelector);
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
	  	// append message node to the container block
	    var msgBlock = this.createMessageBlock();
	    if (typeof this.message == 'string') {
	    	msgBlock.text(this.message);
	    } else if (this.message instanceof jQuery) {
	    	msgBlock.append(this.message);
	    }
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
	Downsha.ViewManager.SimpleMessage.prototype.createMessageBlock = function() { // create message container block
	  return $("<div>", {className : this.getMessageClass()});
	};
	Downsha.ViewManager.SimpleMessage.prototype.getMessageClass = function() {
	  return this.constructor.MESSAGE_CLASS;
	};
})();
	
(function() {
  var LOG = null;
	Downsha.ViewManager.StackableMessage = function(containerSelector) {
		LOG = Downsha.Logger.getInstance();
	  this.initialize(containerSelector);
	}
	Downsha.inherit(Downsha.ViewManager.StackableMessage, Downsha.ViewManager.SimpleMessage);
	
	Downsha.ViewManager.StackableMessage.MESSAGE_CLASS = "stackableMessage";
	
	Downsha.ViewManager.StackableMessage.prototype._messageStack = new Array(); // message stack
	
	Downsha.ViewManager.StackableMessage.prototype.initialize = function(containerSelector) {
	  this.parent.initialize.apply(this, arguments);
	};
	Downsha.ViewManager.StackableMessage.prototype.getMessage = function() {
	  if (this._messageStack.length > 0) {
	  	return this._messageStack[(this._messageStack.length - 1)];
	  } else {
	  	return null;
	  }
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
	  for (var i = this._messageStack.length - 1; i >= 0; i--) {
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
	Downsha.ViewManager.StackableMessage.prototype._describeMessage = function(msg) { // get message content
	  var str = "";
	  if (typeof msg == 'string') {
	    str = msg;
	  } else if (msg instanceof jQuery) {
	    msg.each(function(i, e) {
	      str += this._describeMessage(e);
	    })
	  }
	  return str;
	};
	Downsha.ViewManager.StackableMessage.prototype.getMessageClass = function() {
	  return this.parent.getMessageClass() + " " + this.constructor.MESSAGE_CLASS;
	};
})();
