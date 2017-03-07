/**
 * @author: chenmin
 * @date: 2012-8-14
 * @desc: Platform provides utilities to specify running os and browser version
 * User-Agent: Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.60 Safari/537.1
 
 * navigator.platform returns a string representing the platform on which the browser is running. 
 * The platform is not the operating system, but rather the machine architecture. 
 * This information is useful in determining whether a browser is being used on a computer or a device.
 * Win32        - Windows 32-bit
 * Win64        - Windows 64-bit
 * MacPPC       - Mac on PPC
 * MacIntel     - Mac on Intel
 * Linux i686   - Linux systems
 * Linux x86_64 - Linux systems
 * X11          - Unix systems
 * iPhone       - iPhone/iPod
 * iPad         - iPad

 * The following table lists platform tokens for the last several versions of Windows.
 * Windows NT 6.2	Windows 8
 * Windows NT 6.1	Windows 7
 * Windows NT 6.0	Windows Vista
 * Windows NT 5.2	Windows Server 2003; Windows XP x64 Edition
 * Windows NT 5.1	Windows XP 
 * Windows NT 5.0	Windows 2K
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
		
		if (navigator.userAgent.indexOf("360EE") >= 0) {
			this.browser = "360chrome.exe";
		} else if (navigator.userAgent.indexOf("LBBROWSER") >= 0) {
			this.browser = "liebao.exe";
		} else {
			this.browser = "chrome.exe";
		}
  	var browserVer = navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/i);
  	if (browserVer) {
  		this.browserVer = browserVer[1];
  	}
  	this.userAgent = navigator.userAgent;
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