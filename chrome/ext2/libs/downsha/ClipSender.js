/**
 * @author: chenmin
 * @date: 2012-8-25
 * @desc: send clip page to remote server
 */

(function() {
  var LOG = null;

  Downsha.ClipSender = function ClipSender() {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("dsInfo", this.getDsInfo);
    this.__defineSetter__("dsInfo", this.setDsInfo);
    this.__definePositiveInteger__("state", 0);
    this.initialize();
  };
  Downsha.mixin(Downsha.ClipSender, Downsha.DefiningMixin);
  
  Downsha.ClipSender.STATE = {
  	INIT              : 0,
  	SENDING_INFO_ITEM : 1,
  	SENDING_FILE_DESC : 2,
  	SENDING_FILE      : 3,
  	SUCCESS           : 4, 
  	ERROR             : 5
  };
  
  Downsha.ClipSender.prototype._dsInfo = null;
  Downsha.ClipSender.prototype.onSendSuccess = null;
  Downsha.ClipSender.prototype.onSendError = null;
  
  Downsha.ClipSender.prototype.initialize = function() {
  	this.state = Downsha.ClipSender.STATE.INIT;
  };
  
  Downsha.ClipSender.prototype.startUp = function(obj, success, error) {
  	this.dsInfo = obj;
  	if (!(this.dsInfo instanceof Downsha.DownshaInfo)) {
  		LOG.error("Tried to send invalid object");
  		return;
  	}
  	
  	this.onSendSuccess = function() { // callback for successfully converted
  		LOG.debug("ClipSender successfully sent");
  		if (typeof success == 'function') {
  			success.apply(this, arguments);
  		}
  	};
  	this.onSendError = function() { // callback for converted error
  		LOG.error("ClipSender failed to send");
  		if (typeof error == 'function') {
  			error.apply(this, arguments);
  		}
  	};
  	
  	this.putInfoItem();
  };
  
  Downsha.ClipSender.prototype.getDsInfo = function() {
  	return this._dsInfo;
  };
  Downsha.ClipSender.prototype.setDsInfo = function(dsInfo) {
  	if (dsInfo != null) {
  		if (dsInfo instanceof Downsha.DownshaInfo) {
  			this._dsInfo = dsInfo;	
  		} else if (typeof dsInfo == "object") {
  			this._dsInfo = new Downsha.DownshaInfo(dsInfo);
  		} else {
  			this._dsInfo = new Downsha.DownshaInfo();
  		}
  	} else {
  		this._dsInfo = new Downsha.DownshaInfo();
  	}
  };
 
  Downsha.ClipSender.prototype.putInfoItem = function() {
  	LOG.debug("ClipSender.putInfoItem");
		var self = this;
		Downsha.context.remote.putInfoItem(this.dsInfo.getInfoItem(), 
		function(response, textStatus, xhr) { // xhr response ok
			LOG.debug("ClipSender successfully putted info item");
			if (xhr.readyState == 4 && xhr.status != 0 && textStatus == "success" && response.isSuccess()) {
				LOG.debug("Executing success callback");
				self.handlePutInfoItemSuccess(response, textStatus, xhr);
			} else {
				LOG.debug("Executing error callback");
				self.handlePutInfoItemError(xhr, textStatus, null);
			}
		},
		function(xhr, textStatus, err) { // xhr response error
			if (xhr.readyState == 4) {
				LOG.error("ClipSender encountered an error while putting info item " + 
					" [readyState: " + xhr.readyState + "; status: " + xhr.status + "]");
			} else {
				LOG.error("ClipSender encountered an error while putting info item " + 
					" [readyState: " + xhr.readyState + "]");
			}
			self.handlePutInfoItemError(xhr, textStatus, err);
		},
		true);
  };
  
  Downsha.ClipSender.prototype.handlePutInfoItemSuccess = function(response, textStatus, xhr) {
  	LOG.debug("ClipSender.handlePutInfoItemSuccess");
  	this.dsInfo.cid = response.data.CID;
  	LOG.debug("cid: " + this.dsInfo.cid);
  	var self = this;
    setTimeout(function() {
      self.putFileDesc();
    }, 0);
  };
  
  Downsha.ClipSender.prototype.handlePutInfoItemError = function(xhr, textStatus, err) {
  	LOG.debug("ClipSender.handlePutInfoItemError");
  	var self = this;
    setTimeout(function() {
      self.onSendError();
    }, 0);
  };
  
  Downsha.ClipSender.prototype.putFileDesc = function() {
  	LOG.debug("ClipSender.putFileDesc");
		var self = this;
		Downsha.context.remote.putFileDesc(this.dsInfo.getFileDesc(), 
		function(response, textStatus, xhr) { // xhr response ok
			LOG.debug("ClipSender successfully putted file desc");
			if (xhr.readyState == 4 && xhr.status != 0 && textStatus == "success" && response.isSuccess()) {
				LOG.debug("Executing success callback");
				self.handlePutFileDescSuccess(response, textStatus, xhr);
			} else {
				LOG.debug("Executing error callback");
				self.handlePutFileDescError(xhr, textStatus, null);
			}
		},
		function(xhr, textStatus, err) { // xhr response error
			if (xhr.readyState == 4) {
				LOG.error("ClipSender encountered an error while putting file desc " + 
					" [readyState: " + xhr.readyState + "; status: " + xhr.status + "]");
			} else {
				LOG.error("ClipSender encountered an error while putting file desc " + 
					" [readyState: " + xhr.readyState + "]");
			}
			self.handlePutFileDescError(xhr, textStatus, err);
		},
		true);
  };
  
  Downsha.ClipSender.prototype.handlePutFileDescSuccess = function(response, textStatus, xhr) {
  	LOG.debug("ClipSender.handlePutFileDescSuccess");
  	var fileNum = response.data.FileNum;
  	var fileList = response.data.FileList;
  	LOG.debug("file num: " + fileNum);
  	
  	if (fileNum > 1) {
	  	for (var i = 0; i < fileNum; i ++) {
	  		var fid = fileList[i].FID;
	  		if (typeof fid == "string" && fid != "") {
		  		var dsFile = this.dsInfo.findFileByFID(fid);
		  		if (dsFile != null) {
			  		dsFile.cid = fileList[i].CID;
			  		dsFile.cindex = fileList[i].CIndex;
			  		dsFile.putState = fileList[i].PutState;
			  		LOG.debug("file: " + dsFile.fid + " cid: " + dsFile.cid + " cindex: " + dsFile.cindex + " put_state: " + dsFile.putState);
			  	}
	  		}
	  	}
	  } else if (fileNum == 1) {
	  	var fid = fileList.FID;
  		if (typeof fid == "string" && fid != "") {
  			var dsFile = this.dsInfo.findFileByFID(fid);
  			if (dsFile != null) {
  				dsFile.cid = fileList.CID;
  				dsFile.cindex = fileList.CIndex;
  				dsFile.putState = fileList.PutState;
  				LOG.debug("file: " + dsFile.fid + " cid: " + dsFile.cid + " cindex: " + dsFile.cindex + " put_state: " + dsFile.putState);
  			}
  		}
	  }
	  
  	var self = this;
    setTimeout(function() {
    	self.onSendSuccess(); // notify success to user now
      self.putFile();
    }, 0);
  };
  
  Downsha.ClipSender.prototype.handlePutFileDescError = function(xhr, textStatus, err) {
  	LOG.debug("ClipSender.handlePutFileDescError");
  	var self = this;
    setTimeout(function() {
      self.onSendError();
    }, 0);
  };
  
  Downsha.ClipSender.prototype.putFile = function() {
  	LOG.debug("ClipSender.putFile");
  	var dsFile = this.dsInfo.getNextUnputFile();
  	if (dsFile == null) {
  		return this.genThumbnail();
  	}
  	
		var self = this;
		Downsha.context.remote.putFile(dsFile.getFileData(), 
		function(response, textStatus, xhr) { // xhr response ok
			LOG.debug("ClipSender successfully putted file");
			if (xhr.readyState == 4 && xhr.status != 0 && textStatus == "success" && response.isSuccess()) {
				LOG.debug("Executing success callback");
				self.handlePutFileSuccess(response, textStatus, xhr);
			} else {
				LOG.debug("Executing error callback");
				self.handlePutFileError(xhr, textStatus, null);
			}
		},
		function(xhr, textStatus, err) { // xhr response error
			if (xhr.readyState == 4) {
				LOG.error("ClipSender encountered an error while putting file " + 
					" [readyState: " + xhr.readyState + "; status: " + xhr.status + "]");
			} else {
				LOG.error("ClipSender encountered an error while putting file " + 
					" [readyState: " + xhr.readyState + "]");
			}
			self.handlePutFileError(xhr, textStatus, err);
		},
		true);
  };
  
  Downsha.ClipSender.prototype.handlePutFileSuccess = function(response, textStatus, xhr) {
  	LOG.debug("ClipSender.handlePutFileSuccess");
  	var fid = response.data.FID;
		if (typeof fid != "string" || fid == "") {
			LOG.debug("put file error. response fid invalid");
			return this.onSendError();
		}
		var dsFile = this.dsInfo.findFileByFID(fid);
		if (dsFile == null) {
			LOG.debug("put file error. response fid invalid. fid: " + fid);
			return this.onSendError();
		}
		dsFile.putState = Downsha.DownshaFile.PUT_STATE.EXIST;
		LOG.debug("put file ok. fid: " + dsFile.fid);
		
  	var self = this;
    setTimeout(function() {
      self.putFile();
    }, 0);
  };
  
  Downsha.ClipSender.prototype.handlePutFileError = function(xhr, textStatus, err) {
  	LOG.debug("ClipSender.handlePutFileError");
  	var self = this;
    setTimeout(function() {
      self.onSendError();
    }, 0);
  };
  
  Downsha.ClipSender.prototype.genThumbnail = function() {
  	LOG.debug("ClipSender.genThumbnail");
  	var dsFile = this.dsInfo.getThumbnailFile();
  	if (dsFile == null) {
  		LOG.debug("Stop generating thumbnail, no proper source image");
  		return ;
  		//return this.onSendSuccess();
  	}
  	
		var self = this;
		Downsha.context.remote.genThumbnail(dsFile.getFileAbstract(), 
		function(response, textStatus, xhr) { // xhr response ok
			LOG.debug("ClipSender successfully generated thumbnail");
			if (xhr.readyState == 4 && xhr.status != 0 && textStatus == "success" && response.isSuccess()) {
				LOG.debug("Executing success callback");
				self.handleGenThumbnailSuccess(response, textStatus, xhr);
			} else {
				LOG.debug("Executing error callback");
				self.handleGenThumbnailError(xhr, textStatus, null);
			}
		},
		function(xhr, textStatus, err) { // xhr response error
			if (xhr.readyState == 4) {
				LOG.error("ClipSender encountered an error while generating thumbnail " + 
					" [readyState: " + xhr.readyState + "; status: " + xhr.status + "]");
			} else {
				LOG.error("ClipSender encountered an error while generating thumbnail " + 
					" [readyState: " + xhr.readyState + "]");
			}
			self.handleGenThumbnailError(xhr, textStatus, err);
		},
		true);
  };
  
  Downsha.ClipSender.prototype.handleGenThumbnailSuccess = function(response, textStatus, xhr) {
  	LOG.debug("ClipSender.handleGenThumbnailSuccess");
  	/*
  	var self = this;
    setTimeout(function() {
      self.onSendSuccess();
    }, 0);
    */
  };
  
  Downsha.ClipSender.prototype.handleGenThumbnailError = function(xhr, textStatus, err) {
  	LOG.debug("ClipSender.handleGenThumbnailError");
  	var self = this;
    setTimeout(function() {
      self.onSendError();
    }, 0);
  };
  
})();
