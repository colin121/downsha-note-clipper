/**
 * @author: chenmin
 * @date: 2011-08-29
 * @desc: Platform provides utilities to specify running os and firefox version
 */

(function() {
  var LOG = null;
  Downsha.getPlatform = function() {
    if (Downsha._platform == null) {
      Downsha._platform = new Downsha.Platform();
    }
    return Downsha._platform;
  };
  Downsha.__defineGetter__("platform", Downsha.getPlatform);
  
	Downsha.Platform = function Platform() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
	};
	
  Downsha.Platform.prototype.os = "";
  Downsha.Platform.prototype.osMajor = 0;
  Downsha.Platform.prototype.osMinor = 0;
  Downsha.Platform.prototype.osVer = "";
  Downsha.Platform.prototype.browser = "";
  Downsha.Platform.prototype.browserVer = "";
  Downsha.Platform.prototype.userAgent = "";
  
  Downsha.Platform.prototype.initialize = function() {
		if (navigator.platform.indexOf("Win") >= 0) {
			var winVer = navigator.userAgent.match(/Windows\s*NT\s*(\d+)\.(\d+)/i); // Windows NT 6.1
			if (winVer) {
				this.osMajor = parseInt(winVer[1]);
				this.osMinor = parseInt(winVer[2]);
				this.osVer = this.osMajor + "." + this.osMinor;
			}
			if (this.osMajor == 5 && this.osMinor == 0) {
				this.os = "WIN_2K";
			} else if (this.osMajor == 5 && this.osMinor == 1) {
				this.os = "WIN_XP";
			} else if (this.osMajor == 5 && this.osMinor == 2) {
				this.os = "WIN_SERVER_2003";
			} else if (this.osMajor == 6 && this.osMinor == 0) {
				this.os = "WIN_VISTA";
			} else if (this.osMajor == 6 && this.osMinor == 1) {
				this.os = "WIN_7";
			} else if (this.osMajor == 6 && this.osMinor == 2) {
				this.os = "WIN_8";
			} else {
				this.os = "WIN";
			}
		} else if (navigator.platform.indexOf("Mac") >= 0) {
			var macVer = navigator.userAgent.match(/Mac\s*OS\s*X\s*(\d+)_(\d+)/i); // Intel Mac OS X 10_8
			if (macVer) {
				this.osMajor = parseInt(macVer[1]);
				this.osMinor = parseInt(macVer[2]);
				this.osVer = this.osMajor + "." + this.osMinor;
			}
			this.os = "MAC";
		} else if (navigator.platform.indexOf("Linux") >= 0) {
			this.os = "LINUX";
		} else if (navigator.platform.indexOf("X11") >= 0) {
			this.os = "UNIX";
		} else if (navigator.platform.indexOf("iPhone") >= 0) {
			this.os = "iPhone";
		} else if (navigator.platform.indexOf("iPad") >= 0) {
			this.os = "iPad";
		}
		
		if (navigator.userAgent.indexOf("SeaMonkey") >= 0) {
			this.browser = "SeaMonkey";
		} else if (navigator.userAgent.indexOf("Thunderbird") >= 0) {
			this.browser = "Thunderbird";
		} else if (navigator.userAgent.indexOf("Netscape") >= 0) {
			this.browser = "Netscape";
		} else {
			this.browser = "Firefox";
		}
  	var browserVer = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/i);
  	if (browserVer) {
  		this.browserVer = browserVer[1];
  	}
  	this.userAgent = navigator.userAgent;
  };
  
	Downsha.Platform.prototype.isWin32 = function () {
		return navigator.platform == "Win32" && navigator.oscpu.toLowerCase().indexOf("windows") >= 0;
	};
	
	Downsha.Platform.prototype.isMacOS = function () {
		return navigator.platform == "MacIntel" && ( navigator.oscpu.indexOf("Intel Mac OS X 10") != -1 );
	};
	
	Downsha.Platform.prototype.isLinux = function() {
		return navigator.platform.toLowerCase().indexOf("linux") >=0;
	};
	
	Downsha.Platform.prototype.isFF = function () {
		return navigator.userAgent.toLowerCase().indexOf("firefox") >= 0;
	};  
  
  Downsha.Platform.prototype.toJSON = function() {
    return {
      OS        : this.os,
      OSVer     : this.osVer,
      BrowName  : this.browser,
      BrowVer   : this.browserVer,
      UserAgent : this.userAgent
    };
  };
})();
