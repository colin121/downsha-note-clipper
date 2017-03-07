/**
 * @author: chenmin
 * @date: 2011-09-24
 * @desc: ChromeExtensionRemote inherits from DownshaRemote.
 * it provides user context related remote procedures.
 */

(function() {
  var LOG = null;
  Downsha.ChromeExtensionRemote = function ChromeExtensionRemote() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  Downsha.inherit(Downsha.ChromeExtensionRemote, Downsha.DownshaRemote, true); // inherit from DownshaRemote
  
  Downsha.ChromeExtensionRemote.SESS_EXPIRATION = 10 * 60 * 1000; // session expiration

  Downsha.ChromeExtensionRemote.prototype.initialize = function() {
    Downsha.ChromeExtensionRemote.parent.initialize.apply(this, []);
  };
  /**
   * Flag indicating whether relogin was attempted using stored credentials.
   * This is used to avoid re-processing requests that results in authentication
   * errors.
   */
  Downsha.ChromeExtensionRemote.prototype._reloginAttempted = false;
  
  Downsha.ChromeExtensionRemote.prototype.register = function(userName, userPass, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.register");
    var args = arguments;
    return Downsha.ChromeExtensionRemote.parent.register.apply(this, args);
  };
  
  Downsha.ChromeExtensionRemote.prototype.login = function(userName, userPass, rememberMe, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.login");
    var successCallback = function(loginResponse, loginTextStatus, loginXhr) {
      if (typeof success == 'function') {
        success(loginResponse, loginTextStatus, loginXhr);
      }
      
      // notify to Downsha.ChromeExtension
      if (loginResponse.hasAuthenticationError()) {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.AUTH_ERROR, loginResponse));
      } else {
        Downsha.Utils.notifyExtension(new Downsha.RequestMessage(
            Downsha.Constants.RequestType.AUTH_SUCCESS, loginResponse));
      }
    };
    return Downsha.ChromeExtensionRemote.parent.login.apply(this, 
    	[ userName, userPass, rememberMe, successCallback, failure, processResponse ]);
  };
  
  Downsha.ChromeExtensionRemote.prototype.logout = function(success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.logout");
    var args = arguments;
    return Downsha.ChromeExtensionRemote.parent.logout.apply(this, args);
  };
  
  Downsha.ChromeExtensionRemote.prototype.notifyTermInfo = function(termInfo, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.notifyTermInfo");
    var args = arguments;
    return Downsha.ChromeExtensionRemote.parent.notifyTermInfo.apply(this, args);
  };
  
  Downsha.ChromeExtensionRemote.prototype.putInfoItem = function(infoItem, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.putInfoItem");
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    xhr.become(Downsha.ChromeExtensionRemote.parent.putInfoItem.apply(this, args));
    return xhr;
  };
  
  Downsha.ChromeExtensionRemote.prototype.putFileDesc = function(fileDesc, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.putFileDesc");
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    xhr.become(Downsha.ChromeExtensionRemote.parent.putFileDesc.apply(this, args));
    return xhr;
  };
  
  Downsha.ChromeExtensionRemote.prototype.putFile = function(file, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.putFile");
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    xhr.become(Downsha.ChromeExtensionRemote.parent.putFile.apply(this, args));
    return xhr;
  };
  
  Downsha.ChromeExtensionRemote.prototype.genThumbnail = function(file, success, failure, processResponse) {
    LOG.debug("ChromeExtensionRemote.genThumbnail");
    var args = arguments;
    var xhr = new Downsha.MutableXMLHttpRequest();
    xhr.become(Downsha.ChromeExtensionRemote.parent.genThumbnail.apply(this, args));
    return xhr;
  };  
  
  Downsha.ChromeExtensionRemote.prototype.assureLogin = function(success, failure) {
    LOG.debug("ChromeExtensionRemote.assureLogin");
    var self = this;
    if (Downsha.context.userKnown) {
			var sessTime = Downsha.context.sessTime;
			if ((sessTime + this.constructor.SESS_EXPIRATION) > Date.now()) { // avoid frequent login
				var response = new Downsha.DSTPResponse({Status : 0});
				if (typeof success == 'function') {
					LOG.debug("re-using existing login session");
					setTimeout(function() {
						success(response, null, null);
					}, 1);
				}
			}	else {
				LOG.debug("Attempting to login using stored credentials for: " + Downsha.context.userName);
				return this.login(
					Downsha.context.userName,
					Downsha.XORCrypt.decrypt(Downsha.context.userPass, Downsha.context.userName),
					true, // remember session
					success,
					failure,
					true);
			}
    } else {
    	if (typeof failure == 'function') {
    		var xhr = {
    			readyState : 0,
    			status : 0
    		};
    		failure(xhr, null, null);
    	}
    }
  };

  /**
   * Private method for handling re-login and re-processing of requests
   * that resulted in login errors. This method uses stored credentials
   * to re-login.
   * 
   * @param origRequest
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype._relogin = function(origRequest) {
    LOG.debug("ChromeExtensionRemote._relogin");
    var self = this;
    if (Downsha.context.userKnown) {
      LOG.debug("Attempting to relogin using stored credentials for: " + Downsha.context.userName);
      this.login(
              Downsha.context.userName,
              Downsha.XORCrypt.decrypt(Downsha.context.userPass, Downsha.context.userName),
              true, // remember session
              function(loginResponse, loginTextStatus, loginXhr) {
                var origSuccess = origRequest.success;
                var origFailure = origRequest.failure;
                origRequest.success = function(r, t, x) {
                  self._reloginAttempted = false;
                  if (typeof origSuccess == 'function') {
                    origSuccess(r, t, x);
                  }
                };
                origRequest.failure = function(x, t, e) {
                  self._reloginAttempted = false;
                  if (typeof origFailure == 'function') {
                    origFailure(x, t, e);
                  }
                };
                if (loginResponse instanceof Downsha.DSTPResponse && loginResponse.hasAuthenticationError()) {
                  LOG.debug("Handling original success callback due to soft-failed authentication");
                  origRequest.success(loginResponse, loginTextStatus, loginXhr);
                } else if (typeof origSuccess == 'function') {
                  LOG.debug("Retrying original request after successful relogin");
                  self.doRequest.apply(self, origRequest.arguments);
                }
              },
              function(loginXhr, loginTextStatus, authError) {
                LOG.debug("Failed to relogin, handling original request's failure callback");
                self._reloginAttempted = false;
                if (typeof origRequest.failure == 'function') {
                  origRequest.failure(loginXhr, loginTextStatus, authError);
                }
              }, true);
      
      LOG.debug("Making reloginAttempted");
      this._reloginAttempted = true;
    }
  };
  
  /**
   * Overridden handleHttpSuccess handler that intercepts successful HTTP
   * responses, inspects them and if there is an authentication problem, while
   * using persistent authentication, will relogin using stored credentials and
   * reprocess original request.
   * 
   * @param data
   * @param textStatus
   * @param xhr
   * @param origRequest
   * @return
   */
  Downsha.ChromeExtensionRemote.prototype.handleHttpSuccess = function(data, textStatus, xhr, origRequest) {
    LOG.debug("ChromeExtensionRemote.handleHttpSuccess");
    Downsha.chromeExtension.offline = false;
    var response = Downsha.ChromeExtensionRemote.parent.handleHttpSuccess.apply(this, [ data, textStatus, xhr, origRequest ]);
    if ((response.isSessionNotExistError() || // attempt to login again whenever session is invalid
    	response.isSessionCreateFailedError()) && 
    	(!this._reloginAttempted) && 
    	(origRequest.data.Cmdid != Downsha.DownshaRemote.Command.USER_LOGIN &&
    	origRequest.data.Cmdid != Downsha.DownshaRemote.Command.USER_REGISTER &&
    	origRequest.data.Cmdid != Downsha.DownshaRemote.Command.USER_LOGOUT)) {
      this._relogin(origRequest);
    } else if (response.isSuccess() && // remember session whenever login or register
    	(origRequest.data.Cmdid == Downsha.DownshaRemote.Command.USER_LOGIN || 
    	origRequest.data.Cmdid == Downsha.DownshaRemote.Command.USER_REGISTER)) {
    	Downsha.context.sessId = data.SessID;
    	Downsha.context.sessTime = Date.now();
    }
    return response;
  };
  Downsha.ChromeExtensionRemote.prototype.handleHttpError = function(xhr, textStatus, error, origRequest) {
    LOG.debug("ChromeExtensionRemote.handleHttpError");
    var args = Array.prototype.slice.call(arguments);
    if (xhr.readyState == 0 || (xhr.readyState == 4 && xhr.status == 0)) {
      Downsha.chromeExtension.offline = true;
    } else {
      Downsha.chromeExtension.offline = false;
    }
    Downsha.ChromeExtensionRemote.parent.handleHttpError.apply(this, args);
  };
})();
