/**
 * @author: chenmin
 * @date: 2011-08-29
 * @desc: firefox specific logger implementation to be used with firefox extensions.
 */

(function() {
	Downsha.FirefoxExtensionLoggerImpl = function FirefoxExtensionLoggerImpl() {
		this.initialize();
	};
	
	Downsha.FirefoxExtensionLoggerImpl.prototype = new Downsha.LoggerImpl();
	Downsha.FirefoxExtensionLoggerImpl.prototype.LOG_FILE_NAME = "downsha_webclipper.log";
	Downsha.FirefoxExtensionLoggerImpl.prototype.isLogToFileEnabled = false; // ****should be off before release****
	Downsha.FirefoxExtensionLoggerImpl.prototype.fileLogger = null;
	Downsha.FirefoxExtensionLoggerImpl.prototype.enabled = (navigator.userAgent.match(/Firefox/i)) ? true : false;
	Downsha.FirefoxExtensionLoggerImpl.prototype.alertsEnabled = false;
	Downsha.FirefoxExtensionLoggerImpl.prototype.alertLevel = Downsha.Logger.LOG_LEVEL_OFF;
	Downsha.FirefoxExtensionLoggerImpl.prototype.service = null;
	
	Downsha.FirefoxExtensionLoggerImpl.prototype.initialize = function() {
		this.service = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		if (this.isLogToFileEnabled) this.fileLogger = new Downsha.FileLogger(this.LOG_FILE_NAME);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.dir = function(obj) {
		this._log(obj);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.trace = function() {
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.debug = function(str) {
		this._log(str);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.info = function(str) {
		this._log(str);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.warn = function(str) {
		this._log(str);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.error = function(str) {
		this._log(str);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.exception = function(str) {
		this._log(str);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.alert = function(str) {
		alert(str);
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype._log = function(str) {
		this.service.logStringMessage(str);
		if (this.alertsEnabled) {
			this.alert(str);
		}
		if (this.isLogToFileEnabled && ( this.fileLogger != null) ) {
			this.fileLogger.writeStr(str);
		}
	}
	Downsha.FirefoxExtensionLoggerImpl.prototype.enableAlerts = function(level) {
		this.alertLevel = level;
		this.alertsEnabled = true;
	};
	
	Downsha.FileLogger = function FileLogger(fileName) {
		this.init(fileName);
	};
	
	Downsha.FileLogger.prototype.logFile = null;
	
	Downsha.FileLogger.prototype.init = function(fileName) {
		this.initOutStrem(fileName);
	};
	
	Downsha.FileLogger.prototype.initOutStrem = function(fileName) {
		var profile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile).path;
		
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(profile + Downsha.Constants.SLASH + fileName);
		
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		
		// use 0x02 | 0x20 to open file and truncate content.
		foStream.init(file, 0x02 | 0x08 | 0x10, 438, 0);
		// write, create, truncate
		
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
		createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		this.logFile = converter;
	};
	
	Downsha.FileLogger.prototype.writeStr = function(str) {
		var msg = [ str, "\r\n" ].join("");
		this.logFile.writeString(msg);
		this.logFile.flush();
	};
})();
