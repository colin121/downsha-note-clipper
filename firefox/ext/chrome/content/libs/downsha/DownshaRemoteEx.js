/**
 * @author: chenmin
 * @date: 2012-09-27
 * @desc: DownshaRemoteEx inherits from DownshaRemote.
 * it provides user context related remote procedures.
 */

(function () {
	var LOG = null;
	Downsha.DownshaRemoteEx = function DownshaRemoteEx() {
		LOG = Downsha.Logger.getInstance();
		this.initialize();
	};
	Downsha.inherit(Downsha.DownshaRemoteEx, Downsha.DownshaRemote, true); // inherit from DownshaRemote
	
	Downsha.DownshaRemoteEx.SESS_EXPIRATION = 10 * 60 * 1000; // session expiration
	
	Downsha.DownshaRemoteEx.prototype.initialize = function () {
		this.parent.initialize.apply(this, []);
	};
	/**
	 * Flag indicating whether relogin was attempted using stored credentials.
	 * This is used to avoid re-processing requests that results in authentication
	 * errors.
	 */
	Downsha.DownshaRemoteEx.prototype._reloginAttempted = false;
	
	Downsha.DownshaRemoteEx.prototype.register = function (userName, userPass, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.register");
		return this.parent.register.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.login = function (userName, userPass, rememberMe, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.login");
		return this.parent.login.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.logout = function (success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.logout");
		return this.parent.logout.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.putInfoItem = function (infoItem, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.putInfoItem");
		return this.parent.putInfoItem.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.putFileDesc = function (fileDesc, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.putFileDesc");
		return this.parent.putFileDesc.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.putFile = function (file, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.putFile");
		return this.parent.putFile.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.genThumbnail = function (file, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.genThumbnail");
		return this.parent.genThumbnail.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.getInfoItemList = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemoteEx.getInfoItemList");
		return this.parent.getInfoItemList.apply(this, arguments);
	};
	
	Downsha.DownshaRemoteEx.prototype.assureLogin = function (success, failure) {
		LOG.debug("DownshaRemoteEx.assureLogin");
		var self = this;
		if (Downsha.context.userKnown) {
			var sessTime = Downsha.context.sessTime;
			if ((sessTime + this.constructor.SESS_EXPIRATION) > Date.now()) { // avoid frequent login
				var response = new Downsha.DSTPResponse({ Status: 0 });
				if (typeof success == 'function') {
					LOG.debug("re-using existing login session");
					setTimeout(function () {
						success(response, null, null);
					}, 1);
				}
			} else {
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
				readyState: 0,
				status: 0
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
	Downsha.DownshaRemoteEx.prototype._relogin = function (origRequest) {
		LOG.debug("DownshaRemoteEx._relogin");
		var self = this;
		if (Downsha.context.userKnown) {
			LOG.debug("Attempting to relogin using stored credentials for: " + Downsha.context.userName);
			this.login(
				Downsha.context.userName,
				Downsha.XORCrypt.decrypt(Downsha.context.userPass, Downsha.context.userName),
				true, // remember session
				function (loginResponse, loginTextStatus, loginXhr) {
					var origSuccess = origRequest.success;
					var origFailure = origRequest.failure;
					origRequest.success = function (r, t, x) {
						self._reloginAttempted = false;
						if (typeof origSuccess == 'function') {
							origSuccess(r, t, x);
						}
					};
					origRequest.failure = function (x, t, e) {
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
				function (loginXhr, loginTextStatus, authError) {
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
	Downsha.DownshaRemoteEx.prototype.handleHttpSuccess = function (data, textStatus, xhr, origRequest) {
		LOG.debug("DownshaRemoteEx.handleHttpSuccess");
		var response = this.parent.handleHttpSuccess.apply(this, [data, textStatus, xhr, origRequest]);
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
	Downsha.DownshaRemoteEx.prototype.handleHttpError = function (xhr, textStatus, error, origRequest) {
		LOG.debug("DownshaRemoteEx.handleHttpError");
		var args = Array.prototype.slice.call(arguments);
		this.parent.handleHttpError.apply(this, args);
	};
})();
