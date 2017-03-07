/**
 * @author: chenmin
 * @date: 2011-09-01
 * @desc: retrieve data from and submit data to the web service.
 * ajax get/post operation is also encapsulated here.
 * multipart/form-data is used to send large binary data. format is as following:
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

(function() {
  var LOG = null;
  Downsha.DownshaRemote = function DownshaRemote() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  
	Downsha.DownshaRemote.PROTO_VERSION = 0x0001;
	Downsha.DownshaRemote.Command = {
		USER_REGISTER           : 0x00000001,
		USER_REGISTER_RES       : 0x80000001,
		USER_LOGIN              : 0x00000002,
		USER_LOGIN_RES          : 0x80000002,
		USER_KEEP_ALIVE         : 0x00000003,
		USER_KEEP_ALIVE_RES     : 0x80000003,
		USER_LOGOUT             : 0x00000004,
		USER_LOGOUT_RES         : 0x80000004, 
		USER_PASS_MODIFY        : 0x00000005,
		USER_PASS_MODIFY_RES    : 0x80000005,
		USER_PROFILE_MODIFY     : 0x00000006,
		USER_PROFILE_MODIFY_RES : 0x80000006,
		USER_ACCOUNT_CHECK      : 0x00000007,
		USER_ACCOUNT_CHECK_RES  : 0x80000007,
		
		TERM_INFO_NOTIFY        : 0x00000010,
		TERM_INFO_NOTIFY_RES    : 0x80000010,
		TERM_APP_NOTIFY         : 0x00000011,
		TERM_APP_NOTIFY_RES     : 0x80000011,
		
		GET_SYNC_NO             : 0x00000080,
		GET_SYNC_NO_RES         : 0x80000080,
		PUSH_SYNC_NO            : 0x80000081,
		PUT_SYNC_NO             : 0x00000082,
		PUT_SYNC_NO_RES         : 0x80000082,
		
		GET_DIR_LIST            : 0x00000100,
		GET_DIR_LIST_RES        : 0x80000100,
		GET_INFO_ITEM_LIST      : 0x00000110,
		GET_INFO_ITEM_LIST_RES  : 0x80000110,		
		GET_TAG_LIST            : 0x00000120,
		GET_TAG_LIST_RES        : 0x80000120,
		
		PUT_INFO_ITEM           : 0x00000140,
		PUT_INFO_ITEM_RES       : 0x80000140,
		PUT_FILE_DESC           : 0x00000141,
		PUT_FILE_DESC_RES       : 0x80000141,
		PUT_FILE                : 0x00000142,
		PUT_FILE_RES            : 0x80000142,
		GEN_THUMBNAIL           : 0x00000147,
		GEN_THUMBNAIL_RES       : 0x80000147,
		COPY_INFO_ITEM          : 0x00000148,
		COPY_INFO_ITEM_RES      : 0x80000148,
		
		GET_CHANNEL_LIST        : 0x00001001,
		GET_CHANNEL_LIST_RES    : 0x80001001,
		GET_CHANNEL_ITEM_LIST   : 0x00001002,
		GET_CHANNEL_ITEM_LIST_RES : 0x80001002
	};
  Downsha.DownshaRemote.Error = {
  	OK                          : 0,
  	INVALID_USER_ACCOUNT        : -100,
  	USER_ACCOUNT_EXIST          : -101, 
  	USER_ACCOUNT_NOT_EXIST      : -102, 
  	USER_ACCOUNT_OPEN_FAILED    : -103, 
  	USER_PASSWORD_INCORRECT     : -104, 
  	TERM_INFO_OPEN_FAILED       : -105, 
  	TERM_INFO_CREATE_FAILED     : -106, 
  	SESSION_NOT_EXIST           : -110, 
  	SESSION_CREATE_FAILED       : -111,
  	
  	PARA_INVALID                : -200, 
  	DIR_NAME_EXIST              : -210, 
  	DIRID_NOT_EXIST             : -211, 
  	PARENT_DIRID_NOT_EXIST      : -212, 
  	INFO_ITEM_CID_NOT_EXIST     : -220, 
  	INFO_FILE_NOT_EXIST         : -221, 
  	TAG_NAME_EXIST              : -240, 
  	TAGID_NOT_EXIST             : -241, 
  	
  	FILE_CONTENT_NOT_ENOUGH     : -300, 
  	FILE_CONTENT_NOT_CONSISTENT : -301, 
  	RESOURCE_ALLOC_FAILED       : -500, 
  	CDN_OPEN_FAILED             : -501
  };
	
	Downsha.DownshaRemote.CONTENT_TYPE_JSON = "application/json"; // content type
  Downsha.DownshaRemote.POST_TIMEOUT = 3 * 60 * 1000; // timeout for ajax post
  Downsha.DownshaRemote.GET_TIMEOUT = 30 * 1000; // timeout for ajax get

  Downsha.DownshaRemote.prototype._debugRequestData = false;

  Downsha.DownshaRemote.prototype.initialize = function() {
    this.__defineGetter__("debugRequestData", this.setDebugRequestData);
    this.__defineSetter__("debugRequestData", this.isDebugRequestData);
  };
  Downsha.DownshaRemote.prototype.isDebugRequestData = function() {
    return this._debugRequestData;
  };
  Downsha.DownshaRemote.prototype.setDebugRequestData = function(bool) {
    this._debugRequestData = (bool) ? true : false;
  };
  
  Downsha.DownshaRemote.prototype.register = function(userName, userPass, success, failure, processResponse) {
  	LOG.debug("DownshaRemote.register");
  	var obj = {
  		UserName: userName,
  		UserPass: userPass
  	};
  	return this.postCommand(this.constructor.Command.USER_REGISTER, obj, success, failure, processResponse);
  };
  
  Downsha.DownshaRemote.prototype.login = function(userName, userPass, rememberMe, success, failure, processResponse) {
		LOG.debug("DownshaRemote.login");
		rememberMe = (typeof rememberMe == 'undefined' || !(rememberMe)) ? false : true;
		var obj = {
			LoginType: 1,
			UserName: userName,
			UserPass: userPass
		};
		return this.postCommand(this.constructor.Command.USER_LOGIN, obj, success, failure, processResponse);
  };
  
	Downsha.DownshaRemote.prototype.logout = function (success, failure, processResponse) {
		LOG.debug("DownshaRemote.logout");
		var obj = {};
		return this.postCommand(this.constructor.Command.USER_LOGOUT, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.notifyTermInfo = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.notifyTermInfo");
		return this.postCommand(this.constructor.Command.TERM_INFO_NOTIFY, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.putInfoItem = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.putInfoItem");
		return this.postCommand(this.constructor.Command.PUT_INFO_ITEM, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.putFileDesc = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.putFileDesc");
		return this.postCommand(this.constructor.Command.PUT_FILE_DESC, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.putFile = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.putFile");
		return this.postCommand(this.constructor.Command.PUT_FILE, obj, success, failure, processResponse, true);
	};
	
	Downsha.DownshaRemote.prototype.genThumbnail = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.genThumbnail");
		return this.postCommand(this.constructor.Command.GEN_THUMBNAIL, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.copyInfoItem = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.copyInfoItem");
		return this.postCommand(this.constructor.Command.COPY_INFO_ITEM, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.getChannelList = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.getChannelList");
		return this.postCommand(this.constructor.Command.GET_CHANNEL_LIST, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.getChannelItemList = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.getChannelItemList");
		return this.postCommand(this.constructor.Command.GET_CHANNEL_ITEM_LIST, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.getInfoItemList = function (obj, success, failure, processResponse) {
		LOG.debug("DownshaRemote.getInfoItemList");
		return this.postCommand(this.constructor.Command.GET_INFO_ITEM_LIST, obj, success, failure, processResponse);
	};
	
	Downsha.DownshaRemote.prototype.postCommand = function (cmd, obj, success, failure, processResponse, multipart) {
		var request = new Downsha.DSTPRequest(cmd);
		var data = request.toJSON();
		Downsha.extendObject(data, obj);
		
		return this.postJson(Downsha.getContext().getYunzhaiUrl(cmd), data, success, failure, processResponse, multipart);
	};

  /**
   * General purpose method for posting JSON data to given url. If data is
   * large, set multipart argument to <code>true</code>.
   * 
   * @param url
   * @param data
   * @param success
   * @param failure
   * @param processResponse
   * @param multipart
   * @return
   */
  Downsha.DownshaRemote.prototype.postJson = function(url, data, success,
      failure, processResponse, multipart) {
    return this.doRequest("POST", "json", url, data, success, failure,
        processResponse, multipart);
  };
  /**
   * General purpose method for getting JSON content from given URL. Query
   * parameters should be given in data object argument.
   * 
   * @param url
   * @param data
   * @param success
   * @param failure
   * @param processResponse
   * @return
   */
  Downsha.DownshaRemote.prototype.getJson = function(url, data, success,
      failure, processResponse) {
    return this.doRequest("GET", "json", url, data, success, failure,
        processResponse);
  };
  /**
   * Method for executing web requests (posts and gets).
   * 
   * @param meth
   * @param dataType
   * @param url
   * @param data
   * @param success
   * @param failure
   * @param processResponse
   * @param multipart
   * @return
   */
  Downsha.DownshaRemote.prototype.doRequest = function(meth, dataType, url,
      data, success, failure, processResponse, multipart) {
    if (meth == null) {
      meth = "GET";
    }
    var self = this;
    var origRequest = {
      meth : meth,
      dataType : dataType,
      url : url,
      data : data,
      success : success,
      failure : failure,
      processResponse : processResponse,
      multipart : multipart
    };
    origRequest.__defineGetter__("arguments", function() {
      return [ this.meth, this.dataType, this.url, this.data, this.success,
          this.failure, this.processResponse, this.multipart ];
    });
    if (LOG.isDebugEnabled()) { // dump ajax parameters
      var dataStr = this.debugAjaxDataObject(data);
      LOG.debug("doRequest(" + meth + ", " + dataType + ", " + url + ", " + dataStr + ")");
    }
    var errorHandler = function(xhr, textStatus, error) {
      LOG.debug("Downsha.DownshaRemote.doRequest failed response");
      if (processResponse) {
        try {
          self.handleHttpError(xhr, textStatus, error, origRequest);
        } catch (e) {
          LOG.error((e && e.message) ? e.message : e);
          throw e;
        }
      }
      if (typeof failure == 'function') {
        failure(xhr, textStatus, error);
      }
    };
    var successHandler = function(data, textStatus, xhr) {
      // work around for jQuery folks fucking up HTTP status codes
      // a status of 0 occurs when either doing cross-site scripting (where access is denied) 
      // or requesting a URL that is unreachable (typo, DNS issues, etc).
      if (xhr.status == 0) {
        return errorHandler(xhr, textStatus, data);
      }
      LOG.debug("Downsha.DownshaRemote.doRequest successfull response");
      LOG.debug("response data: " + JSON.stringify(data));
      var response = data;
      if (processResponse) {
        try {
          response = self.handleHttpSuccess(data, textStatus, xhr, origRequest);
        } catch (e) {
        	throw e;
        }
      }
      if (typeof success == 'function') {
        success(response, textStatus, xhr);
      }
    };
    var ajaxOpts = {
      url : url,
      async : true,
      cache : false, // Setting cache to false also appends a query string parameter, "_=[TIMESTAMP]", to the URL.
      dataType : dataType,
      error : errorHandler,
      success : successHandler,
      processData : false, // tell jQuery not to process the data
      type : meth
    };
    if (multipart && meth == "POST") {
      // FormData is supported in Chrome 7+, Firefox 4.0+, IE 10+
      var formData = new FormData();
      for (var i in data) {
      	if (typeof data[i] == "object" && data[i] instanceof Array) {
					var uint8Array = new Uint8Array(data[i]);
      		var blob = null;
      		try {
      			// BlobBuilder is Deprecated, but widely implemented, supported in Chrome 8+, FireFox 6+, IE 10+
      			window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
      			var blobBuilder = new BlobBuilder();
      			blobBuilder.append(uint8Array.buffer);
      			blob = blobBuilder.getBlob();
      		} catch(e) {
      			// The proposed API Blob() constructor is supported in Chrome 20+, Firefox 13+, IE 10+
      			blob = new Blob([ uint8Array.buffer ]);
      		}
      		if (blob) {
      			formData.append(i, blob);	
      		}
      	} else {
      		formData.append(i, data[i]);
      	}
      }
      ajaxOpts.contentType = false; // tell jQuery not to set contentType
      ajaxOpts.data = formData;
    } else {
    	ajaxOpts.contentType = Downsha.DownshaRemote.CONTENT_TYPE_JSON;
    	ajaxOpts.data = JSON.stringify(data);
    }
    if (meth == "POST") { // set ajax timeout
      ajaxOpts.timeout = this.constructor.POST_TIMEOUT;
    } else {
      ajaxOpts.timeout = this.constructor.GET_TIMEOUT;
    }
    LOG.debug(">>> Making request for: " + ajaxOpts.url);
    return Downsha.jQuery ? Downsha.jQuery.ajax(ajaxOpts) : $.ajax(ajaxOpts);
  };
  Downsha.DownshaRemote.prototype.debugAjaxDataObject = function(data) {
    var dataStr = "";
    if (this._debugRequestData) {
      try {
      	var dataObj = {};
      	for (var i in data) {
      		if (typeof data[i] == "object" && data[i] instanceof Array) {
      			dataObj[i] = data[i].length;
      		} else {
      			dataObj[i] = data[i];
      		}
      	}
        dataStr = JSON.stringify(dataObj);
      } catch (e) {
      }
    } else {
      var dataParams = [];
      for (var i in data) {
        dataParams.push(i);
      }
      dataStr = "{" + dataParams.toString() + "}";
    }
    return dataStr;
  };

  /**
   * Handler of successful HTTP requests. It gets called whenever XHR receives
   * a successful (200's HTTP Code) response.
   * 
   * @param data
   * @param textStatus
   * @param xhr
   * @return
   */
  Downsha.DownshaRemote.prototype.handleHttpSuccess = function(data, textStatus, xhr, origRequest) {
    LOG.debug("Downsha.DownshaRemote.handleHttpSuccess");
    var remote = this;
    try {
    	var response = Downsha.DSTPResponse.createFrom(data);
    } catch (e) {
      var msg = "";
      if (e instanceof Downsha.DownshaError) {
        msg = e.errorCode;
        LOG.error("Exception creating Downsha.DSTPResponse: " + msg);
      } else {
        throw e;
      }
    }
    LOG.debug("HTTP [" + xhr.status + ", " + textStatus + "] Status: " + response.Status);
    return response;
  };
  /**
   * Handler of erroneous HTTP requests. It gets called when XHR receives an
   * erroneous (non-200 HTTP Code) response.
   * 
   * @param xhr
   * @param textStatus
   * @param error
   * @return
   */
  Downsha.DownshaRemote.prototype.handleHttpError = function(xhr, textStatus, error, origRequest) {
    if (xhr.readyState != 4) {
      LOG.error("HTTP [readyState: " + xhr.readyState + "]");
    } else {
      LOG.error("HTTP [readyState: " + xhr.readyState + ", status: " + xhr.status + ", textStatus: " + textStatus + "] error: " + error);
    }
  };
})();

(function() {
  var LOG = null;
  Downsha.MutableXMLHttpRequest = function MutableXMLHttpRequest() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  Downsha.inherit(Downsha.MutableXMLHttpRequest, XMLHttpRequest, true);
  Downsha.MutableXMLHttpRequest.prototype.initialize = function() {
    var self = this;
    for ( var i in this.__proto__) {
      if (i.indexOf("on") == 0) {
        var setter = function(value) {
          var fieldName = arguments.callee._fieldName;
          self["_" + fieldName] = value;
        };
        setter._fieldName = i;
        this.__defineSetter__(i, setter);
        var getter = function() {
          var fieldName = arguments.callee._fieldName;
          return function() {
            if (typeof self["_" + fieldName] == 'function') {
              self["_" + fieldName]();
            }
            if (typeof self["_proto_" + fieldName] == 'function') {
              self["_proto_" + fieldName]();
            }
          };
        };
        getter._fieldName = i;
        this.__defineGetter__(i, getter);
        this["_proto_" + i] = this.__proto__[i];
      }
    }
  };
  Downsha.MutableXMLHttpRequest.prototype.become = function(xhr) {
    var self = this;
    if (xhr instanceof XMLHttpRequest) {
      var oldXhr = this.__proto__;
      this.__proto__ = xhr;
      this.constructor = Downsha.MutableXMLHttpRequest;
      for ( var i in this) {
        if (i.indexOf("on") == 0 && this.hasOwnProperty(i)) {
          oldXhr[i] = this["_proto_" + i];
          this["_proto_" + i] = this.__proto__[i];
          var setter = function(value) {
            var fieldName = i;
            self["_proto_" + fieldName] = value;
          };
          setter._fieldName = i;
          this.__proto__[i] = this[i];
        }
      }
      for ( var i in this.constructor.prototype) {
        if (this.constructor.prototype.hasOwnProperty(i)
            && !this.__proto__.hasOwnProperty(i)) {
          try {
            this.__proto__[i] = this.constructor.prototype[i];
          } catch (e) {
          }
        }
      }
    }
  };
})();

(function() {
  var LOG = null;
  Downsha.DSTPRequest = function DSTPRequest(cmdid) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(cmdid);
  };
  
  Downsha.DSTPRequest.prototype.Cmdid = null;
  Downsha.DSTPRequest.prototype.Seqid = null;
  Downsha.DSTPRequest.prototype.Protover = null;
  Downsha.DSTPRequest.prototype.UID = null;
  Downsha.DSTPRequest.prototype.SessID = null;
  Downsha.DSTPRequest.prototype.HID = null;
  Downsha.DSTPRequest.prototype.TID = null;
  Downsha.DSTPRequest.prototype.TermClass = null;
  Downsha.DSTPRequest.prototype.TermType = null;
  Downsha.DSTPRequest.prototype.YzVer = null;
  
  Downsha.DSTPRequest.prototype.initialize = function(cmdid) {
  	this.Cmdid     = cmdid;
  	this.Seqid     = Math.floor((Math.random()*0x10000));
  	this.Protover  = Downsha.DownshaRemote.PROTO_VERSION;
  	this.UID       = Downsha.context.userId;
  	this.SessID    = Downsha.context.sessId;
  	this.HID       = Downsha.context.hardId;
  	this.TID       = Downsha.context.termId;
  	this.TermClass = Downsha.context.termClass;
  	this.TermType  = Downsha.context.termType;
  	this.YzVer     = Downsha.context.version;
  };
  Downsha.DSTPRequest.prototype.toJSON = function() {
    return {
      Cmdid     : this.Cmdid,
      Seqid     : this.Seqid,
      Protover  : this.Protover,
      UID       : this.UID,
      SessID    : this.SessID,
      HID       : this.HID,
      TID       : this.TID,
      TermClass : this.TermClass,
      TermType  : this.TermType,
      YzVer     : this.YzVer
    };
  };
})();

(function() {
  var LOG = null;
  Downsha.DSTPResponse = function DSTPResponse(data) {
  	LOG = Downsha.Logger.getInstance();
  	this.__defineGetter__("data", this.getData);
  	this.__defineSetter__("data", this.setData);
  	this.__defineGetter__("error", this.getError);
  	this.__defineSetter__("error", this.setError);  	
    this.initialize(data);
  };
  Downsha.DSTPResponse.fromObject = function(obj) {
    if (obj instanceof Downsha.DSTPResponse) {
      return obj;
    } else {
      return new Downsha.DSTPResponse(obj);
    }
  };
  
  Downsha.DSTPResponse.prototype.Cmdid    = null;
  Downsha.DSTPResponse.prototype.Seqid    = null;
  Downsha.DSTPResponse.prototype.Protover = null;
  Downsha.DSTPResponse.prototype.SessID   = null;
  Downsha.DSTPResponse.prototype.NatIP    = null;
  Downsha.DSTPResponse.prototype.SyncNo   = null;
  Downsha.DSTPResponse.prototype.Status   = null;
  Downsha.DSTPResponse.prototype._data    = null;
  Downsha.DSTPResponse.prototype._error   = null;

  Downsha.DSTPResponse.prototype.initialize = function(data) {
    if (typeof data == 'object') {
    	if (typeof data["Cmdid"] != 'undefined') {
    		this.Cmdid = data["Cmdid"];
    	}
    	if (typeof data["Seqid"] != 'undefined') {
    		this.Seqid = data["Seqid"];
    	}
    	if (typeof data["Protover"] != 'undefined') {
    		this.Protover = data["Protover"];
    	}
    	if (typeof data["SessID"] != 'undefined') {
    		this.SessID = data["SessID"];
    	}
    	if (typeof data["NatIP"] != 'undefined') {
    		this.NatIP = data["NatIP"];
    	}
    	if (typeof data["SyncNo"] != 'undefined') {
    		this.SyncNo = data["SyncNo"];
    	}
    	if (typeof data["Status"] != 'undefined') {
    		this.Status = data["Status"];
    	}
    	
    	this.data = data;
    	if (this.Status != null && this.Status < 0) {
    		this.error = new Downsha.DownshaError(this.Status);
    	}
    }
  };
  Downsha.DSTPResponse.prototype.isError = function() {
    return (this.Status == null || this.Status < 0);
  };
  Downsha.DSTPResponse.prototype.isSuccess = function() {
    return (this.Status != null && this.Status >= 0);
  };
  Downsha.DSTPResponse.prototype.isErrorCode = function(errorCode) {
    return (this.Status != null && this.Status == errorCode);
  };
  Downsha.DSTPResponse.prototype.isInvalidUserAccountError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.INVALID_USER_ACCOUNT);
  };
  Downsha.DSTPResponse.prototype.isUserAccountExistError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.USER_ACCOUNT_EXIST);
  };
  Downsha.DSTPResponse.prototype.isUserAccountNotExistError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.USER_ACCOUNT_NOT_EXIST);
  };
  Downsha.DSTPResponse.prototype.isUserAccountOpenFailedError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.USER_ACCOUNT_OPEN_FAILED);
  };
  Downsha.DSTPResponse.prototype.isUserPasswordIncorrectError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.USER_PASSWORD_INCORRECT);
  };
  Downsha.DSTPResponse.prototype.isTermInfoOpenFailedError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.TERM_INFO_OPEN_FAILED);
  };
  Downsha.DSTPResponse.prototype.isTermInfoCreateFailedError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.TERM_INFO_CREATE_FAILED);
  };
  Downsha.DSTPResponse.prototype.isSessionNotExistError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.SESSION_NOT_EXIST);
  };
  Downsha.DSTPResponse.prototype.isSessionCreateFailedError = function() {
    return this.isErrorCode(Downsha.DownshaRemote.Error.SESSION_CREATE_FAILED);
  };
  Downsha.DSTPResponse.prototype.hasAuthenticationError = function() {
    return this.isInvalidUserAccountError() || 
    	this.isUserAccountExistError() || 
    	this.isUserAccountNotExistError() || 
    	this.isUserAccountOpenFailedError() || 
    	this.isUserPasswordIncorrectError() || 
    	this.isTermInfoOpenFailedError() || 
    	this.isTermInfoCreateFailedError() || 
    	this.isSessionNotExistError() || 
    	this.isSessionCreateFailedError();
  };
  Downsha.DSTPResponse.prototype.getData = function() {
    return this._data;
  };
  Downsha.DSTPResponse.prototype.setData = function(data) {
    this._data = data;
  };
  Downsha.DSTPResponse.prototype.getError = function() {
    return this._error;
  };
  Downsha.DSTPResponse.prototype.setError = function(error) {
    this._error = error;
  };
  
  Downsha.DSTPResponse.createFrom = function(data) {
    LOG = LOG || Downsha.Logger.getInstance(Downsha.DSTPResponse);
    LOG.debug("Downsha.DSTPResponse.createFrom");
    return new Downsha.DSTPResponse(data);
  };
})();
