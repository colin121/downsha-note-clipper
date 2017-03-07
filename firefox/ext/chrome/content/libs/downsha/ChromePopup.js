/**
 * @author: chenmin
 * @date: 2011-09-05
 * @desc: popup dialog manager, core parts are as following:
 * 1. bind login/quicknote form to events and set input validators
 * 2. call content preview and clip procedures
 * 3. interacts with Downsha.overlay via notifier
 */
 
(function() {
	var LOG = null;
	var popup = null; // ChromePopup object

	$(document).ready(function () {
		LOG = Downsha.Logger.getInstance();
		window.onerror = function(errorMsg, url, lineNumber) {
			LOG.exception("\n" + url + ":" + lineNumber + ": " + errorMsg + "\n");
		}
		window.onblur = function () { // dialog exit if lose focus
			window.setTimeout(
				function () {
					// workaround to avoid embedded iframe getting focus
					if (document.activeElement && document.activeElement.id == "platformFrame") {
						var submitElement = document.querySelector("#quickNoteView input[type=submit]");
						if (submitElement) {
							submitElement.focus();
						}
						return;
					}
					if (popup) {
						popup.dismissPopup(true);
					}
				}, 100);
		}
		window.focus();
		waitForOverlayReady();
		LOG.debug("-------- POPUP STARTING ------------");
	});
	
	function waitForOverlayReady() {
		var waitProc = null;
		var waitInterval = 100; // overlay init check interval
		var waitTimeout = 3000; // maximum time for overlay loading
		var waitStartTime = 0;
		
		waitStartTime = new Date().getTime();
		waitProc = setInterval(function() { // wait until window.overlay is ready
			if (typeof window.overlay != 'undefined') {
				clearInterval(waitProc);
				waitProc = null;
				init(); // now it's ok to call initialization
			} else if (waitStartTime + waitTimeout < (new Date().getTime())) { // timeout is 3 seconds
				LOG.warn("Clearing init timer, cuz we timed out waiting for overlay");
				clearInterval(waitProc);
				waitProc = null;
			}
		}, waitInterval);
	};

	function init() {
		popup = new Downsha.ChromePopup();
		popup.viewManager.wait(Downsha.chrome.i18n.getMessage("loading"));

		// startup with setTimeout for better UX
		setTimeout(function(){
			var tab = Downsha.chrome.tabs.getSelected();
			var match = tab.document.location.href.match(/^(.*?):/);
			var scheme = match[1].toLowerCase();
			if (scheme != "http" && scheme != "https") {
				popup.viewManager.clearWait();
				popup.viewManager.showBlock($("#header"));
				popup.viewManager.showError(Downsha.chrome.i18n.getMessage("unsupportedScheme"));
				return ;
			}
			
			if (!Downsha.context.userKnown) {
				popup.viewManager.clearWait();
				popup.viewManager.switchView("loginView");
			} else {
				popup.persistentLogin(
				function(response) { // success callback
					popup.startUp();
				}, 
				function(xhr, textStatus, response) { // failure callback
					popup.popupStatus = Downsha.ChromePopup.POPUP_STATUS_CODES.STARTED;
					if (response instanceof Downsha.DSTPResponse && response.hasAuthenticationError()) {
						LOG.info("Present login screen due to authentication error on initial login");
						popup.viewManager.switchView("loginView");
					} else if (response instanceof Downsha.DSTPResponse && response.isError()) {
						popup.viewManager.showBlock($("#header"));
						popup.viewManager.showErrors([ response.error ]);
					} else if (Downsha.chromeExtension.offline) {
						popup.viewManager.showBlock($("#header"));
						popup.viewManager.showHttpError(xhr, textStatus, response);
					} else {
						popup.viewManager.showBlock($("#header"));
						popup.viewManager.showError(Downsha.chrome.i18n.getMessage("UnknownError"));
					}
				}
				);
			}
		}, 300);
	};
})();

(function() {
	var LOG = null;
	Downsha.ChromePopup = function ChromePopup() {
		LOG = Downsha.Logger.getInstance();
		this.initialize();
	};
	
	Downsha.ChromePopup.POPUP_DISMISS_TIMEOUT = 300;
	Downsha.ChromePopup.VIEW_UPDATE_TIMEOUT = 50;
	
	Downsha.ChromePopup.QUICK_NOTE_VIEW_DEFAULTS = {
		infoItem : null,
		fullPageEnabled : true,
		notebookGuid : null
	};
	Downsha.ChromePopup.POPUP_STATUS_CODES = {
		STARTUP : 0,
		STARTED : 1
	};
	
	Downsha.ChromePopup.prototype.overlay = null; // window overlay object
	Downsha.ChromePopup.prototype.notifier = null; // clip event notifier object (Downsha.Overlay object)
	Downsha.ChromePopup.prototype.viewManager = null; // ViewManager object
	Downsha.ChromePopup.prototype.pageInfo = null; // PageInfo object
	Downsha.ChromePopup.prototype.contentPreviewer = null; // ContentPreviewer object
	Downsha.ChromePopup.prototype.tab = null; // current tab object
	Downsha.ChromePopup.prototype.requestListener = null; // listener function for event
	Downsha.ChromePopup.prototype.loginValidator = null;
	Downsha.ChromePopup.prototype.registerValidator = null;
	Downsha.ChromePopup.prototype.quickNoteValidator = null;
	Downsha.ChromePopup.prototype.quickNoteForm = null; // ClipNoteForm object
	Downsha.ChromePopup.prototype.loginProc = null;
	
	Downsha.ChromePopup.prototype._previewAdjustmentEnabled = false;
	Downsha.ChromePopup.prototype.popupStatus = Downsha.ChromePopup.POPUP_STATUS_CODES.STARTUP;
	
	Downsha.ChromePopup.prototype.initialize = function() {
		LOG.debug("ChromePopup initializing...");
		this.initViewManager();
		this.initOverlay();
		this.initChrome();
		this.tab = Downsha.chrome.tabs.getSelected();
		this.initListeners();
		this.pageInfo = new Downsha.PageInfo(this.tab);
		this.localizePopup();
		this.initForms();
		this.initViews();
		LOG.debug("ChromePopup initialized");
	};
	Downsha.ChromePopup.prototype.initViewManager = function() {
		LOG.debug("ChromePopup.initViewManager");
    this.viewManager = Downsha.ViewManager.getInstance();
    this.viewManager.globalErrorMessage = new Downsha.ViewManager.SimpleMessage($("#globalErrorMessage"));
    this.viewManager.globalMessage = new Downsha.ViewManager.StackableMessage($("#globalMessage"));
	};
	Downsha.ChromePopup.prototype.initOverlay = function() {
		LOG.debug("ChromePopup.initOverlay");
		this.overlay = (typeof window.overlay != 'undefined') ? window.overlay : null;
		if (window.overlayContentContainer) {
			LOG.debug(">>> Adding callback for view resizing...");
			this.viewManager.containerResizeCallback = function(h) {
				LOG.debug("Updating iframe's height to: " + h);
				var frame = window.overlay.document.getElementById("popupContent");
				if (frame) { // adjust popup height and width after resize
					frame.style.height = (h + 10) + "px";
				}
				window.sizeToContent();
				window.overlay.sizeToContent();
			}
		}
	};
	Downsha.ChromePopup.prototype.initChrome = function() {
		LOG.debug("ChromePopup.initChrome");
		try {
			var data = this.overlay.arguments[0]; // arguments are passed by openDialog
			var E = data.downsha; //Downsha global object created in outter overlay
			Downsha.chrome = E.chrome;
			this.clip = data.data.clip; // DownshaInfo object shared by Overlay and ChromePopup
			this.notifier = data.clipNotifier; // remember notifier(Downsha.Overlay object)
		} catch(e) {
			LOG.error("Could not intialize chrome: " + e);
		}
	};
	Downsha.ChromePopup.prototype.initListeners = function() {
		LOG.debug("ChromePopup.initListeners");
		var popup = this;
		Downsha.chrome.extension.onRequest.addListener(function() {popup.requestListener.apply(popup, arguments);});
	};
	Downsha.ChromePopup.prototype.localizePopup = function() {
		LOG.debug("ChromePopup.localizePopup");
		var allViews = $("body"); // localize popup dialog
		for (var i = 0; i < allViews.length; i++) {
			var v = $(allViews.get(i));
			Downsha.Utils.localizeBlock(v);
		}
	};
	Downsha.ChromePopup.prototype.initViews = function() { // bind view elements to event script
		LOG.debug("ChromePopup.initViews");
		this.bindViews();
	};
	Downsha.ChromePopup.prototype.initForms = function() {
	  LOG.debug("ChromePopup.initForms");
	  this.quickNoteForm = Downsha.ClipNoteForm.onForm($("form[name=quickNoteForm]"));
	  this.bindForms();
	};
	Downsha.ChromePopup.prototype.setTab = function(tab) {
		this.tab = tab;
	};
	Downsha.ChromePopup.prototype.setClip = function(clip) {
		this.clip = clip;
	};	
	Downsha.ChromePopup.prototype.requestListener = function(request, sender, sendResponse) {
		LOG.debug("ChromePopup.requestListener");
		LOG.debug("Request: " + JSON.stringify(request));
		var requestType = Downsha.Utils.getKeyFrom(request, Downsha.Constants.REQUEST_TYPE, 'number', Downsha.Constants.RequestType.UNKNOWN);
		if (requestType == Downsha.Constants.RequestType.PAGE_CLIP_SUCCESS) {
			this.handlePageClipSuccess(request, sender, sendResponse); // handle page clip success
		} else {
			LOG.info("Popup ignores request: " + requestType);
		}
	};
	Downsha.ChromePopup.prototype.handlePageClipSuccess = function(request, sender, sendResponse) {
		this.viewManager.clearWait();
		LOG.info("Popup.handlePageClipSuccess");
		var infoItem = new Downsha.DownshaInfo(request);
		LOG.debug("Popup received request from extension with infoItem: " + infoItem.toString());
		var options = Downsha.context.options;
		var self = this;
		LOG.debug("Has selection " + this.clip.hasSelection());
		LOG.info("Prompting for filing info for full page clip");
		var viewOpts = {
			infoItem : infoItem
		};
		this.viewManager.switchView("quickNoteView", viewOpts);
	};
	Downsha.ChromePopup.prototype.startUp = function() {
		var o = this.clip.toDataObject();
		o[Downsha.Constants.REQUEST_TYPE] = Downsha.Constants.RequestType.PAGE_CLIP_SUCCESS;
		LOG.debug("Notifying extension with clip: " + JSON.stringify(o));
		Downsha.chrome.extension.sendRequest(o);
	};
	
	Downsha.ChromePopup.prototype.bindViews = function() {
	  LOG.debug("Popup.bindViews");
	  this.bindHeader();
	  this.bindLoginView();
	  this.bindRegisterView();
	  this.bindQuickNoteView();
	};
	
	Downsha.ChromePopup.prototype.bindHeader = function() {
	  var self = this;
	  $("#header").bind("show", function(event, data) {
	    LOG.debug("#header.onShow");
	    $("#headerLogoHome").unbind("click");
	    $("#headerLogoHome").bind("click", function() {
	    	self.goHome();
	    });
	  });
	};
	
  Downsha.ChromePopup.prototype.bindPlatform = function() {
  	var self = this;
		$(".platform_desktop").unbind("click");
		$(".platform_desktop").bind("click", function() {
			self.goDesktop();
		});
		$(".platform_mobile").unbind("click");
		$(".platform_mobile").bind("click", function() {
			self.goMobile();
		});
		$(".platform_windows8").unbind("click");
		$(".platform_windows8").bind("click", function() {
			self.goWindows8();
		});
		$(".platform_chrome").unbind("click");
		$(".platform_chrome").bind("click", function() {
			self.goChrome();
		});
		$(".platform_firefox").unbind("click");
		$(".platform_firefox").bind("click", function() {
			self.goFirefox();
		});
		$(".platform_ie").unbind("click");
		$(".platform_ie").bind("click", function() {
			self.goDesktop();
		});
  };
	
	Downsha.ChromePopup.prototype.bindLoginView = function() {
	  var self = this;
	  $("#loginView").bind("show", function(event, data) {
			LOG.debug("#loginView.onShow");
			self.viewManager.showBlock($("#header"));
			$("#headerUser").hide();
			$("#headerNoUserLogin").hide();
			$("#headerNoUserRegister").show();
			$("#headerRegister").unbind("click");
			$("#headerRegister").bind("click", function() {
				self.goRegister();
			});
			self.bindPlatform();
			
			var view = $("#loginView");
			var loginForm = view.find("form[name=loginForm]");
			// populate with data or present clean form if no data
			if (typeof data == 'object' && data != null) {
				if (typeof data["username"] != 'undefined') {
					loginForm.find("input[name=username]").val(data["username"]);
				}
				if (typeof data["password"] != 'undefined') {
					loginForm.find("input[name=password]").val(data["password"]);
				}
			} else {
				loginForm.find("input[type=password]").val("");
			}
			
			// focus and select appropriate field
			loginForm.find("input[name=username]").focus();
			self.loginValidator.focusInvalid();
		});
	  $("#loginView").bind("hide", function(event) {
	    LOG.debug("#loginView.onHide");
	    self.viewManager.hideBlock($("#header"));
	  });
	};
	
	Downsha.ChromePopup.prototype.bindRegisterView = function() {
	  var self = this;
	  $("#registerView").bind("show", function(event, data) {
			LOG.debug("#registerView.onShow");
			self.viewManager.showBlock($("#header"));
			$("#headerUser").hide();
			$("#headerNoUserRegister").hide();
			$("#headerNoUserLogin").show();
			$("#headerLogin").unbind("click");
			$("#headerLogin").bind("click", function() {
				self.goLogin();
			});
			self.bindPlatform();
			
			var view = $("#registerView");
			var registerForm = view.find("form[name=registerForm]");
			
			// populate with data or present clean form if no data
			if (typeof data == 'object' && data != null) {
				if (typeof data["username"] != 'undefined') {
					registerForm.find("input[name=username]").val(data["username"]);
				}
			}
			registerForm.find("input[type=password]").val("");
			
			// focus and select appropriate field
			registerForm.find("input[name=username]").focus();
			self.registerValidator.focusInvalid();
		});
	  $("#registerView").bind("hide", function(event) {
	    LOG.debug("#registerView.onHide");
	    self.viewManager.hideBlock($("#header"));
	  });
	};  
	
	Downsha.ChromePopup.prototype.bindQuickNoteView = function() {
	  var self = this;
	  var view = $("#quickNoteView");
	  view.bind(
			"show",
			function(event, data) {
				LOG.debug("#quickNoteView.onShow");
				self.viewManager.showBlock($("#header"));
				var userName = Downsha.context.userName;
				if (userName) {
					$("#headerUsername").text(userName);
					$("#headerSignout").unbind("click");
					$("#headerSignout").bind("click", function() {
						self.logout();
					});
					$("#headerNoUserRegister").hide();
					$("#headerNoUserLogin").hide();
					$("#headerUser").show();
				}
				self.bindPlatform();
				$("#platformFrame").attr("src", Downsha.context.getNoteListUrl());
				
				/*
				var notebookSelect = view.find("select[name=notebookGuid]");
				self.populateNotebookSelection(notebookSelect);
				*/
				
				// remove non-applicable clipActions
				var clipActionElement = self.getQuickNoteActionElement();
				if (Downsha.Utils.isForbiddenUrl(self.tab.document.location.href)) { // only show clip_url for forbidden url
					clipActionElement.find("input").each(function(i, e) {
						var $e = $(e);
						if ($e.val() != "CLIP_ACTION_URL") {
							$e.remove();
						}
					});
					clipActionElement.find("label").each(function(i, e) {
						var $e = $(e);
						if ($e.attr("for") != "CLIP_ACTION_URL") {
							$e.remove();
						}
					});
				} else {
					// remove clip_selection if no selected content
					if (!(self.pageInfo && self.pageInfo.selection)) {
						clipActionElement.find("input[value=CLIP_ACTION_SELECTION]").remove();
						clipActionElement.find("label[for=CLIP_ACTION_SELECTION]").remove();
					}
					// remove clip_article if article is not sane
					if (!self.isArticleSane()) {
						clipActionElement.find("input[value=CLIP_ACTION_ARTICLE]").remove();
						clipActionElement.find("label[for=CLIP_ACTION_ARTICLE]").remove();
					}
					// remove clip_full if no text or image
					if (!(self.pageInfo && (self.pageInfo.documentLength > 0 || self.pageInfo.containsImages))) {
						clipActionElement.find("input[value=CLIP_ACTION_FULL_PAGE]").remove();
						clipActionElement.find("label[for=CLIP_ACTION_FULL_PAGE]").remove();
					}
				}
				
				var opts = Downsha.context.getOptions(true);
				var clipActionOpt = (opts && opts.clipAction) ? opts.clipAction : Downsha.Options.CLIP_ACTION_OPTIONS.ARTICLE;
				var clipAction = null;
				if (Downsha.Utils.isForbiddenUrl(self.tab.document.location.href)) { // forbidden url: only clip url
					clipAction = "CLIP_ACTION_URL";
				} else if (self.pageInfo && self.pageInfo.selection) { // first priority: selection
					clipAction = "CLIP_ACTION_SELECTION";
				} else if (self.pageInfo && self.pageInfo.article && self.isArticleSane() 
				&& (clipActionOpt == Downsha.Options.CLIP_ACTION_OPTIONS.ARTICLE)) { // second priority: article
					clipAction = "CLIP_ACTION_ARTICLE";
				} else if (self.pageInfo && (self.pageInfo.documentLength > 0 || self.pageInfo.containsImages)
				&& (clipActionOpt == Downsha.Options.CLIP_ACTION_OPTIONS.ARTICLE ||
				clipActionOpt == Downsha.Options.CLIP_ACTION_OPTIONS.FULL_PAGE)) { // third priority: full page
					clipAction = "CLIP_ACTION_FULL_PAGE";
				} else { // last priority: url
					clipAction = "CLIP_ACTION_URL";
				}
				self.selectQuickNoteAction(clipAction);
				self.previewQuickNoteAction();
				
				// setup view options (defaults < options)
				var viewOpts = $.extend(true, {}, Downsha.ChromePopup.QUICK_NOTE_VIEW_DEFAULTS);
				// populate form with default view options
				self.quickNoteForm.populateWith(viewOpts);
				
				// populate form with infoItem and/or specific options passed via data
				if (data && typeof data == 'object') {
					LOG.debug("Overriding quick note form with passed arguments");
					if (typeof data["infoItem"] == 'object') {
						LOG.debug("Using supplied infoItem object to populate quick note form");
						var infoItem = (data.infoItem instanceof Downsha.DownshaInfo) ? data.infoItem : new Downsha.DownshaInfo(data.infoItem);
						self.quickNoteForm.populateWithNote(Downsha.context, infoItem);
					} else {
						LOG.debug("No infoItem object passed, using as a blank quick note");
					}
					$.extend(true, viewOpts, data);
				} else {
					LOG.debug("No options were given, will operate as quick note with default options");
				}
				/*
				// make sure we get the right notebook
				var defaultNotebook = Downsha.context
				.getNotebookByGuid(self.quickNoteForm.notebookGuid);
				if (!defaultNotebook) {
				defaultNotebook = Downsha.context.getPreferredNotebook();
				}
				if (defaultNotebook instanceof Downsha.Notebook) {
				self.quickNoteForm.notebookGuid = defaultNotebook.guid;
				}
				
				// update notebook selection element
				Downsha.Utils.updateSelectElementWidth(notebookSelect, function(
				guid) {
				var n = Downsha.context.getNotebookByGuid(guid);
				return (n) ? n.name : guid;
				});
				*/
				
				// focus on first tab element
				$("#quickNoteView input[type=submit]").focus();
		});
	  view.bind("hide", function(event) {
	    LOG.debug("#quickNoteView.onHide");
	    self.viewManager.hideBlock($("#header"));
	  });
	};
	
	Downsha.ChromePopup.prototype.bindForms = function() {
	  LOG.debug("Adding expression method");
	  // adding regex validation method
	  $.validator.addMethod("mask", $.fn.validate.methods.mask, Downsha.chrome.i18n.getMessage("invalidMask"));
	
	  // trim function - replaces value with trimmed value
	  $.validator.addMethod("trim", $.fn.validate.methods.trim, "trim error");
	
	  // separates value into parts and checks if total number of parts is within given range
	  $.validator.addMethod("totalPartsRange", $.fn.validate.methods.totalPartsRange, Downsha.chrome.i18n.getMessage("totalPartsNotInRange"));
	
	  // separates value into parts and checks whether individual parts are within given range in length
	  $.validator.addMethod("partLengthRange", $.fn.validate.methods.partLengthRange, Downsha.chrome.i18n.getMessage("partLengthNotInRange"));
	
	  // separates value into parts and checks whether individual parts match given mask
	  $.validator.addMethod("partMask", $.fn.validate.methods.partMask);
	
	  // custom callback validator. Useful for transforms...
	  $.validator.addMethod("toLowerCase", $.fn.validate.methods.toLowerCase);
	  
	  // custom method for handling compound rules
	  $.validator.addMethod("anyOf", $.fn.validate.methods.toLowerCase);
	
	  // duck punching invalidate method
	  $.validator.prototype.invalidate = function(fieldName, errorMessage) {
	    var thisErr = {};
	    thisErr[fieldName] = errorMessage;
	    this.showErrors(thisErr);
	  };
	
	  // bind individual forms
	  this.bindLoginForm();
	  this.bindRegisterForm();
	  this.bindQuickNoteForm();
	};
	
	Downsha.ChromePopup.prototype.bindLoginForm = function() {
	  LOG.debug("Popup.bindLoginForm");
	  var form = $("form[name=loginForm]");
	  var self = this;
	  if (form.length == 0) {
	    LOG.warn("Could not find login form");
	    return;
	  }
	  
	  var opts = {
	    submitHandler : function(form) {
	      self.submitLoginForm();
	    },
	    errorClass : this.viewManager.FORM_FIELD_ERROR_MESSAGE_CLASS,
	    errorElement : "div",
	    onkeyup : false,
	    onfocusout : false,
	    invalidHandler : function() {
	    	setTimeout(
	    		function() {
	    			self.viewManager.updateBodyHeight();
	    		}, self.constructor.VIEW_UPDATE_TIMEOUT);
	    },
	    success : function() {
	    	self.viewManager.updateBodyHeight();
	    },
	    rules : {
	      username : {
	        required : true,
	        minlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN,
	        maxlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX,
	        mask : Downsha.Constants.Limits.DSTP_USER_NAME_REGEX
	      },
	      password : {
	        required : true,
	        minlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN,
	        maxlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX,
	        mask : Downsha.Constants.Limits.DSTP_USER_PWD_REGEX
	      }
	    },
	    messages : {
	      username : {
	        required : Downsha.chrome.i18n.getMessage("valueNotPresent", Downsha.chrome.i18n
	            .getMessage("loginForm_username")),
	        minlength : Downsha.chrome.i18n.getMessage("valueTooShort", [
	            Downsha.chrome.i18n.getMessage("loginForm_username"),
	            Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN ]),
	        maxlength : Downsha.chrome.i18n.getMessage("valueTooLong", [
	            Downsha.chrome.i18n.getMessage("loginForm_username"),
	            Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX ]),
	        mask : Downsha.chrome.i18n.getMessage("invalidUsername")
	      },
	      password : {
	        required : Downsha.chrome.i18n.getMessage("valueNotPresent", Downsha.chrome.i18n
	            .getMessage("loginForm_password")),
	        minlength : Downsha.chrome.i18n.getMessage("valueTooShort", [
	            Downsha.chrome.i18n.getMessage("loginForm_password"),
	            Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN ]),
	        maxlength : Downsha.chrome.i18n.getMessage("valueTooLong", [
	            Downsha.chrome.i18n.getMessage("loginForm_password"),
	            Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX ]),
	        mask : Downsha.chrome.i18n.getMessage("invalidPassword")
	      }
	    }
	  };
	  LOG.debug("Setting up validation on login form");
	  this.loginValidator = form.validate(opts);
	};
	
	Downsha.ChromePopup.prototype.bindRegisterForm = function() {
	  LOG.debug("Popup.bindRegisterForm");
	  var form = $("form[name=registerForm]");
	  var self = this;
	  if (form.length == 0) {
	    LOG.warn("Could not find register form");
	    return;
	  }
	  
	  var opts = {
	    submitHandler : function(form) {
	      self.submitRegisterForm();
	    },
	    errorClass : this.viewManager.FORM_FIELD_ERROR_MESSAGE_CLASS,
	    errorElement : "div",
	    onkeyup : false,
	    onfocusout : false,
	    invalidHandler : function() {
	    	setTimeout(
	    		function() {
	    			self.viewManager.updateBodyHeight();
	    		}, self.constructor.VIEW_UPDATE_TIMEOUT);
	    },
	    success : function() {
	    	self.viewManager.updateBodyHeight();
	    },
	    rules : {
	      username : {
	        required : true,
	        minlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN,
	        maxlength : Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX,
	        mask : Downsha.Constants.Limits.DSTP_USER_NAME_REGEX
	      },
	      password : {
	        required : true,
	        minlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN,
	        maxlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX,
	        mask : Downsha.Constants.Limits.DSTP_USER_PWD_REGEX
	      },
	      password2 : {
	        required : true,
	        equalTo : "#registerPassword",
	        minlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN,
	        maxlength : Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX,
	        mask : Downsha.Constants.Limits.DSTP_USER_PWD_REGEX
	      }
	    },
	    messages : {
	      username : {
	        required : Downsha.chrome.i18n.getMessage("valueNotPresent", Downsha.chrome.i18n
	            .getMessage("registerForm_username")),
	        minlength : Downsha.chrome.i18n.getMessage("valueTooShort", [
	            Downsha.chrome.i18n.getMessage("registerForm_username"),
	            Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MIN ]),
	        maxlength : Downsha.chrome.i18n.getMessage("valueTooLong", [
	            Downsha.chrome.i18n.getMessage("registerForm_username"),
	            Downsha.Constants.Limits.DSTP_USER_NAME_LEN_MAX ]),
	        mask : Downsha.chrome.i18n.getMessage("invalidUsername")
	      },
	      password : {
	        required : Downsha.chrome.i18n.getMessage("valueNotPresent", Downsha.chrome.i18n
	            .getMessage("registerForm_password")),
	        minlength : Downsha.chrome.i18n.getMessage("valueTooShort", [
	            Downsha.chrome.i18n.getMessage("registerForm_password"),
	            Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN ]),
	        maxlength : Downsha.chrome.i18n.getMessage("valueTooLong", [
	            Downsha.chrome.i18n.getMessage("registerForm_password"),
	            Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX ]),
	        mask : Downsha.chrome.i18n.getMessage("invalidPassword")
	      },
	      password2 : {
	        required : Downsha.chrome.i18n.getMessage("valueNotPresent", Downsha.chrome.i18n
	            .getMessage("registerForm_password")),
	        equalTo : Downsha.chrome.i18n.getMessage("valueNotEqualTo", Downsha.chrome.i18n
	            .getMessage("registerForm_password")),
	        minlength : Downsha.chrome.i18n.getMessage("valueTooShort", [
	            Downsha.chrome.i18n.getMessage("registerForm_password"),
	            Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MIN ]),
	        maxlength : Downsha.chrome.i18n.getMessage("valueTooLong", [
	            Downsha.chrome.i18n.getMessage("registerForm_password"),
	            Downsha.Constants.Limits.DSTP_USER_PWD_LEN_MAX ]),
	        mask : Downsha.chrome.i18n.getMessage("invalidPassword")
	      }
	    }
	  };
	  LOG.debug("Setting up validation on register form");
	  this.registerValidator = form.validate(opts);
	};
	
	Downsha.ChromePopup.prototype.bindQuickNoteForm = function() {
	  LOG.debug("Popup.bindQuickNoteForm");
	  var form = $("form[name=quickNoteForm]");
	  if (form.length == 0) {
	    LOG.warn("Could not find quickNoteForm");
	    return;
	  }
	  var titleField = form.find("input[name=title]");
	  titleField.bind("blur", function() { // title onblur event
	    titleField.val(titleField.val().trim());
	  });
	  /*
	  var notebookSelect = form.find("select[name=notebookGuid]");
	  if (notebookSelect.length > 0) {
	    notebookSelect.bind("change", function() {
	      Downsha.Utils.updateSelectElementWidth(this, function(guid) {
	        var n = Downsha.context.getNotebookByGuid(guid);
	        return (n) ? n.name : guid;
	      });
	    });
	  }
	  */
	  var self = this;
	  var clipActionElement = this.getQuickNoteActionElement();
	  clipActionElement.find("input").each(function(i, e) {
	  	var $e = $(e);
	  	$e.bind("click", function() {
	  		self.previewQuickNoteAction();
	  	});
	  });
	  
	  var opts = {
	    submitHandler : function(form) {
	      self.submitQuickNoteForm();
	    },
	    errorClass : this.viewManager.FORM_FIELD_ERROR_MESSAGE_CLASS,
	    errorElement : "div",
	    onkeyup : false,
	    onfocusin: function() {
	      self.disablePreviewAdjustment();
	    },
	    onfocusout : function() {
	      self.enablePreviewAdjustment();
	      if (self.quickNoteValidator.numberOfInvalids()) {
	        self.quickNoteValidator.form();
	      }
	    },
	    rules : {
	      title : {
	        trim : true,
	        required : false,
	        rangelength : [ Downsha.Constants.Limits.DSTP_NOTE_TITLE_LEN_MIN, Downsha.Constants.Limits.DSTP_NOTE_TITLE_LEN_MAX ],
	        mask : Downsha.Constants.Limits.DSTP_NOTE_TITLE_REGEX
	      },
	      tagNames : {
	        totalPartsRange : [ Downsha.Constants.Limits.DSTP_NOTE_TAGS_MIN, Downsha.Constants.Limits.DSTP_NOTE_TAGS_MAX ],
	        partLengthRange : [ Downsha.Constants.Limits.DSTP_TAG_NAME_LEN_MIN, Downsha.Constants.Limits.DSTP_TAG_NAME_LEN_MAX ],
	        partMask : Downsha.Constants.Limits.DSTP_TAG_NAME_REGEX
	      }
	    },
	    messages : {
	      title : {
	        rangelength : Downsha.chrome.i18n.getMessage("valueNotInRange", [
	            Downsha.chrome.i18n.getMessage("quickNote_title"),
	            Downsha.Constants.Limits.DSTP_NOTE_TITLE_LEN_MIN,
	            Downsha.Constants.Limits.DSTP_NOTE_TITLE_LEN_MAX ]),
	        mask : Downsha.chrome.i18n.getMessage("invalidTitle")
	      },
	      tagNames : {
	        totalPartsRange : Downsha.chrome.i18n.getMessage("tagNamesNotInRange", [
	            Downsha.Constants.Limits.DSTP_NOTE_TAGS_MIN,
	            Downsha.Constants.Limits.DSTP_NOTE_TAGS_MAX ]),
	        partLengthRange : Downsha.chrome.i18n.getMessage("tagNameNotInRange", [
	            Downsha.Constants.Limits.DSTP_TAG_NAME_LEN_MIN,
	            Downsha.Constants.Limits.DSTP_TAG_NAME_LEN_MAX ]),
	        partMask : Downsha.chrome.i18n.getMessage("invalidTagName")
	      }
	    }
	  };
	  LOG.debug("Setting up validation on quicknote form");
	  this.quickNoteValidator = form.validate(opts);
	};
	
  Downsha.ChromePopup.prototype.submitLoginForm = function() {
    LOG.debug("Popup.submitLoginForm");
    var form = this.getLoginForm();
    this.viewManager.hideErrors();
    this.viewManager.clearFormArtifacts(form);
    this.loginWithForm(form);
  };
  Downsha.ChromePopup.prototype.getLoginForm = function() {
    return $("form[name=loginForm]");
  };  
  Downsha.ChromePopup.prototype.loginWithForm = function(form) {
    LOG.debug("ChromePopup.loginWithForm");
    var self = this;
    if (typeof form == 'object') {
      this.unabort();
      var username = form.find("[name=username]").val();
      var password = form.find("[name=password]").val();
      var rememberMe = true;
      this.viewManager.wait(Downsha.chrome.i18n.getMessage("loggingIn"));
      LOG.info("login as: " + username);
      this._login(username, password, rememberMe);
    }
  };

  Downsha.ChromePopup.prototype._login = function(username, password, rememberMe) {
    LOG.debug("ChromePopup._login");
    var self = this;
    Downsha.context.rememberedSession = rememberMe;
    var form = this.getLoginForm();
    this.viewManager.wait(Downsha.chrome.i18n.getMessage("loggingIn"));
    this.loginProc = Downsha.context.remote.login(
			username, password, rememberMe,
			function(response, textStatus, xhr) { // ajax success callback
			  LOG.info("login response received...");
			  self.viewManager.clearWait();
			  if (response.isSuccess()) {
			    LOG.info("Successfully logged in");
			    self.viewManager.hideView("loginView");
			    
			    LOG.debug("Updating stored username and password.");
			    Downsha.context.userId = response.data.UID;
			    Downsha.context.userName = username;
			    Downsha.context.userPass = Downsha.XORCrypt.encrypt(password, username);
			    Downsha.context.termId = response.data.TID;
			
			    if (parseInt(response.data.ResyncTerm) != 1) {
			    	self.startUp();
			    } else {
			      LOG.info("notify terminal information...");
			      Downsha.context.remote.notifyTermInfo(
			      	Downsha.platform.toJSON(), 
			      	function() {
			      		LOG.info("notify terminal ok");
			      		self.startUp();
			      	}, 
			      	function() {
			      		LOG.info("notify terminal failed");
			      		self.startUp();
			      	}, true);                	
			    }
			  } else if (response.isError()) {
			    if (response.error) {
			      LOG.info("login invalid");
			      self.loginValidator.resetForm();
			      self.viewManager.showFormErrors(form, [ response.error ], null);
			    } else {
			      LOG.warn("Unexpected response during login");
			      self.viewManager.showErrors(response.error);
			    }
			    
			    self.viewManager.switchView("loginView", {
			      username : username,
			      password : ""
			    });
			  } else {
			  }
			},
			function(xhr, textStatus, error) { // ajax error callback
			  if (xhr && xhr.readyState == 4) {
			    LOG.error("Failed to login due to transport problems (status: " + xhr.status + ")");
			  } else if (xhr) {
			    LOG.error("Failed to login due to transport problems (readyState: " + xhr.readyState + ")");
			  } else {
			    LOG.error("Failed to login due to unkonwn transport problems");
			  }
			  self.viewManager.clearWait();
			  self.viewManager.showHttpError(xhr, textStatus, error);
			}, true);
  };
  
  Downsha.ChromePopup.prototype.submitRegisterForm = function() {
    LOG.debug("Popup.submitRegisterForm");
    var form = this.getRegisterForm();
    this.viewManager.hideErrors();
    this.viewManager.clearFormArtifacts(form);
    this.registerWithForm(form);
  };
  Downsha.ChromePopup.prototype.getRegisterForm = function() {
    return $("form[name=registerForm]");
  };
  Downsha.ChromePopup.prototype.registerWithForm = function(form) {
    LOG.debug("ChromePopup.registerWithForm");
    var self = this;
    if (typeof form == 'object') {
      this.unabort();
      var username = form.find("[name=username]").val();
      var password = form.find("[name=password]").val();
      this.viewManager.wait(Downsha.chrome.i18n.getMessage("registering"));
      LOG.info("register as: " + username);
      this._register(username, password);
    }
  };
  Downsha.ChromePopup.prototype._register = function(username, password) {
    LOG.debug("ChromePopup._register");
    var self = this;
    var form = this.getRegisterForm();
    this.viewManager.wait(Downsha.chrome.i18n.getMessage("registering"));
    this.registerProc = Downsha.context.remote.register(
			username, password,
			function(response, textStatus, xhr) { // ajax success callback
			  LOG.info("register response received...");
			  self.viewManager.clearWait();
			  if (response.isSuccess()) {
			    LOG.info("Successfully registered");
			    self.viewManager.hideView("registerView");
			    
			    LOG.debug("Updating stored username and password.");
			    Downsha.context.userId = response.data.UID;
			    Downsha.context.userName = username;
			    Downsha.context.userPass = Downsha.XORCrypt.encrypt(password, username);
			    Downsha.context.termId = response.data.TID;
			
			    if (parseInt(response.data.ResyncTerm) != 1) {
			    	self.startUp();
			    } else {
			      LOG.info("notify terminal information...");
			      Downsha.context.remote.notifyTermInfo(
			      	Downsha.platform.toJSON(), 
			      	function() {
			      		LOG.info("notify terminal ok");
			      		self.startUp();
			      	}, 
			      	function() {
			      		LOG.info("notify terminal failed");
			      		self.startUp();
			      	}, true);                	
			    }
			  } else if (response.isError()) {
			    if (response.error) {
			      LOG.info("register invalid");
			      self.registerValidator.resetForm();
			      self.viewManager.showFormErrors(form, [ response.error ], null);
			    } else {
			      LOG.warn("Unexpected response during register");
			      self.viewManager.showErrors(response.error);
			    }
			    self.viewManager.switchView("registerView", {
			      username : username,
			      password : ""
			    });
			  } else {
			  }
			},
			function(xhr, textStatus, error) { // ajax error callback
			  if (xhr && xhr.readyState == 4) {
			    LOG.error("Failed to register due to transport problems (status: " + xhr.status + ")");
			  } else if (xhr) {
			    LOG.error("Failed to register due to transport problems (readyState: " + xhr.readyState + ")");
			  } else {
			    LOG.error("Failed to register due to unkonwn transport problems");
			  }
			  self.viewManager.clearWait();
			  self.viewManager.showHttpError(xhr, textStatus, error);
			}, true);
  };

  Downsha.ChromePopup.prototype.logout = function(callback) {
    LOG.debug("ChromePopup.logout");
    this.viewManager.wait(Downsha.chrome.i18n.getMessage("loggingOut"));
    LOG.info("Logging out...");
    var self = this;
    if (typeof callback != 'function') {
      callback = function() {
      	self.viewManager.clearWait();
      	self.viewManager.switchView("loginView");
      };
    }
    var localLogout = function() {
      self.viewManager.clearWait();
      self.notifier.onLogout();
      callback();
    };
    var logoutProc = Downsha.context.remote.logout(
    function(response, textStatus) { // ajax success callback
      self.viewManager.clearWait();
      if (response instanceof Downsha.DSTPResponse && response.isSuccess()) {
        LOG.info("Successfully logged out");
      } else {
        LOG.error("Got garbage response when tried to logout");
      }
      localLogout();
    }, function(xhr, textStatus, error) { // ajax error callback
      if (xhr && xhr.readyState == 4) {
        LOG.error("Failed to log out due to transport errors (status: " + xhr.status + ")");
      } else if (xhr) {
        LOG.error("Failed to log out due to transport errors (readyState: " + xhr.readyState + ")");
      } else {
        LOG.error("Failed to log out due to unknown transport errors");
      }
      self.viewManager.clearWait();
      localLogout();
    }, true);
  };

  Downsha.ChromePopup.prototype.persistentLogin = function(success, failure) {
    LOG.debug("Popup.persistentLogin");
    this.viewManager.wait(Downsha.chrome.i18n.getMessage("loggingIn"));
    var self = this;
    return Downsha.context.remote.assureLogin(
			function(response, textStatus, xhr) { // ajax success callback
			  self.viewManager.clearWait();
			  if (response instanceof Downsha.DSTPResponse && response.isSuccess()) {
			    LOG.info("Got successful result on login");
			    if (typeof success == 'function') {
			      success(response, textStatus);
			    }
			  } else {
			  	LOG.info("Got error result on login");
			    if (typeof failure == 'function') {
			      failure(xhr, textStatus, response);
			    }
			  }
			},
			function(xhr, textStatus, error) { // ajax error callback
			  if (xhr && xhr.readyState == 4) {
			    LOG.error("Failed to login due to transport errors (status: " + xhr.status + ")");
			  } else if (xhr) {
			    LOG.error("Failed to login due to transport errors (readyState: " + xhr.readyState + ")");
			  } else {
			    LOG.error("Failed to login due to unknown transport errors");
			  }
			  self.viewManager.clearWait();
			  if (typeof failure == 'function') {
			    failure(xhr, textStatus, error);
			  }
			});
  };
  
	Downsha.ChromePopup.prototype.submitQuickNoteForm = function() {
		LOG.debug("Popup.submitQuickNoteForm");
		var self = this;
		if (this.quickNoteForm) {
			LOG.debug("Grabbing data from form");
			this.viewManager.hideErrors();
			var infoItem = this.quickNoteForm.asClipNote();
			if (!infoItem.title) {
				infoItem.title = Downsha.chrome.i18n.getMessage("quickNote_untitledNote");
			}
			delete infoItem.content;
			this.viewManager.hideView("quickNoteView");
			this.abortProcs();
			
			var clipAction = this.getQuickNoteAction();
			LOG.debug("Submit quick note form with action " + clipAction);
			setTimeout(function() { // set timer to execute so we don't block dismissPopup()
				if (clipAction == "CLIP_ACTION_FULL_PAGE") {
					if(self.clip.clipBody()) {
						self.clip.fullPage = true;
						self.notifier.startClip(infoItem);
					}
					else {
						self.notifier.onFailedClip();
					}
				} else if (clipAction == "CLIP_ACTION_SELECTION") {
					if(self.clip.clipSelection()) {
						self.notifier.startClip(infoItem);
					}
					else {
						self.notifier.onFailedClip();
					}
				} else if (clipAction == "CLIP_ACTION_ARTICLE") {
					if(self.clip.clipArticle()) {
						self.notifier.startClip(infoItem);
					}
					else {
						self.notifier.onFailedClip();
					}
				} else if (clipAction == "CLIP_ACTION_URL") {
				  if(self.clip.clipUrl()) {
				  	self.notifier.startClip(infoItem);
				  }
				} else {
					self.viewManager.showError("Invalid Clip selection");
					return;
				}
			}, 1);
			this.dismissPopup();
		} else {
			LOG.debug("Nothing to clip...");
		}
	};
	Downsha.ChromePopup.prototype.getQuickNoteActionElement = function() {
	    return $("form[name=quickNoteForm] #clipAction");
	};	
	Downsha.ChromePopup.prototype.getQuickNoteAction = function() {
    var clipActionElement = this.getQuickNoteActionElement();
    return clipActionElement.find("input:checked").first().attr("id");
	};
	Downsha.ChromePopup.prototype.selectQuickNoteAction = function(actionName) {
		LOG.debug("ChromePopup.selectQuickNoteAction");
		if (actionName) {
			var clipActionElement = this.getQuickNoteActionElement();
			clipActionElement.find("input[value=" + actionName + "]").attr("checked", "checked");
		}
	};
	Downsha.ChromePopup.prototype.resetQuickNote = function() {
	};
	Downsha.ChromePopup.prototype.previewQuickNoteAction = function() {
		LOG.debug("Popup.previewQuickNoteAction");
		if (Downsha.Utils.isForbiddenUrl(this.tab.document.location.href)) {
			LOG.debug("Not previewing quickNoteAction on forbiddenUrl");
			return;
		}
		var clipAction = this.getQuickNoteAction();
		LOG.debug(clipAction);
		if (clipAction && typeof Downsha.Constants.RequestType["PREVIEW_" + clipAction] != 'undefined') {
			if (!this.contentPreviewer) {
				this.contentPreviewer = new Downsha.ContentPreviewScript(this.tab);
			}
			if(Downsha.Constants.RequestType["PREVIEW_" + clipAction] == Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_FULL_PAGE) {
				LOG.debug("Preview full page");
				this.contentPreviewer.previewFullPage();
			}
			else if (Downsha.Constants.RequestType["PREVIEW_" + clipAction] == Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_URL) {
				LOG.debug("Preview url");
				this.contentPreviewer.previewURL();
			}
			else if (Downsha.Constants.RequestType["PREVIEW_" + clipAction] == Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_ARTICLE) {
				LOG.debug("Preview article");
				this.contentPreviewer.previewArticle();
			}
			else if (Downsha.Constants.RequestType["PREVIEW_" + clipAction] == Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_SELECTION) {
				LOG.debug("Preview selection");
				this.contentPreviewer.previewSelection();
			}
			if (Downsha.Constants.RequestType["PREVIEW_" + clipAction] == Downsha.Constants.RequestType.PREVIEW_CLIP_ACTION_ARTICLE) {
				this.enablePreviewAdjustment(); // enable preview nudge (bind keyboard event) in article clip mode
			} else {
				this.disablePreviewAdjustment(); // disable preview nudge (unbind keyboard event) in other clip mode
			}
		}
	};
	Downsha.ChromePopup.prototype.enablePreviewAdjustment = function() {
	  LOG.debug("Popup.enablePreviewAdjustment");
	  if (this._previewAdjustmentEnabled) {
	  	return;
	  }
		$("body").bind("keyup", {popup: this}, this._handlePreviewAdjustment); // bind keyup event
		this._previewAdjustmentEnabled = true;
	};
	Downsha.ChromePopup.prototype.disablePreviewAdjustment = function() {
		LOG.debug("Popup.disablePreviewAdjustment");
		if (this._previewAdjustmentEnabled) {
			$("body").unbind("keyup", this._handlePreviewAdjustment); // unbind keyup event
			this._previewAdjustmentEnabled = false;
		}
	};
	Downsha.ChromePopup.prototype._handlePreviewAdjustment = function(event) {
		LOG.debug("Popup._handlePreviewAdjustment");
		var self = (event.data && event.data.popup) ? event.data.popup : null;
		if (!self) {
			return;
		}
		var keyCode = (event) ? event.keyCode : null;
		var direction = null;
		switch(keyCode) {
			case 37: // left arrow
				direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_PREVIOUS_SIBLING;
				break;
			case 38: // up arrow
				direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_PARENT;
				break;
			case 39: // right arrow
				direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_NEXT_SIBLING;
				break;
			case 40: // down arrow
				direction = Downsha.Constants.RequestType.PREVIEW_NUDGE_CHILD;
				break;
			case 13: // Enter key
				self.submitQuickNoteForm(); // submit note now
				return;
		}
		if (direction) { // send nudge request to ChromeExtension which then call ContentPreview.nudgePreview
			if (!self.contentPreviewer) {
				self.contentPreviewer = new Downsha.ContentPreviewScript(self.tab);
			}
			self.contentPreviewer.previewNudge(direction);
		}
	};
	Downsha.ChromePopup.prototype.dismissPopup = function(instant) {
		LOG.debug("ChromePopup.dismissPopup");
		var self = this;
    var callback = function() {
			try {
				self.abort(); // abort processing
				if (self.contentPreviewer) {
					self.contentPreviewer.clear();
					self.contentPreviewer = null;
				}
			} finally {
				window.close();
			}
    };
    
    if (typeof instant != 'undefined' && instant) {
    	callback();
    } else {
    	setTimeout(callback, this.constructor.POPUP_DISMISS_TIMEOUT);
    }
	};
	Downsha.ChromePopup.prototype.unabort = function() {
		LOG.debug("ChromePopup.unabort");
		this.aborted = false;
		this.viewManager.quiet = false;
	};
	Downsha.ChromePopup.prototype.abort = function() {
		LOG.debug("ChromePopup.abort");
		this.aborted = true;
		this.viewManager.quiet = true;
		this.abortProcs();
	};
	Downsha.ChromePopup.prototype.abortProcs = function() {
		LOG.debug("ChromePopup.abortProcs");
		if (this.loginProc && typeof this.loginProc.abort == 'function') {
			this.loginProc.abort();
			this.loginProc = null;
		}
	};
	Downsha.ChromePopup.prototype.goHome = function() {
	  Downsha.chrome.tabs.create({
	  	url : Downsha.context.getHomeUrl()
	  });
	  this.dismissPopup();
	};
	Downsha.ChromePopup.prototype.goDesktop = function() {
	  Downsha.chrome.tabs.create({
	    url : Downsha.context.getDesktopUrl()
	  });
	  this.dismissPopup();
	};
	Downsha.ChromePopup.prototype.goMobile = function() {
	  Downsha.chrome.tabs.create({
	    url : Downsha.context.getMobileUrl()
	  });
	  this.dismissPopup();
	};
  Downsha.ChromePopup.prototype.goWindows8 = function() {
    Downsha.chrome.tabs.create({
      url : Downsha.context.getWindows8Url()
    });
    this.dismissPopup();
  };
  Downsha.ChromePopup.prototype.goChrome = function() {
    Downsha.chrome.tabs.create({
      url : Downsha.context.getChromeUrl()
    });
    this.dismissPopup();
  };
  Downsha.ChromePopup.prototype.goFirefox = function() {
    Downsha.chrome.tabs.create({
      url : Downsha.context.getFirefoxUrl()
    });
    this.dismissPopup();
  };
	Downsha.ChromePopup.prototype.goRegister = function() {
		this.viewManager.switchView("registerView", {});
	};
	Downsha.ChromePopup.prototype.goLogin = function() {
		this.viewManager.switchView("loginView", {});
	};
  Downsha.ChromePopup.prototype.isArticleSane = function() {
    if (this.pageInfo && this.pageInfo.articleBoundingClientRect) {
	    var pageArea = Math.round(this.pageInfo.documentWidth * this.pageInfo.documentHeight);
	    var articleArea = Math.round(this.pageInfo.articleBoundingClientRect.width * 
	    	this.pageInfo.articleBoundingClientRect.height);
	    var articleRatio = Math.round((pageArea > 0) ? (articleArea * 100 / pageArea) : 0);
	    LOG.debug("isArticleSane() PageArea: " + pageArea + " ArticleArea: " + articleArea + " Ratio: " + articleRatio + "%");
    	return Downsha.Utils.isArticleSane(
    		this.pageInfo.documentWidth, 
    		this.pageInfo.documentHeight, 
    		this.pageInfo.articleBoundingClientRect);
    }
    return false;
  };
})();
