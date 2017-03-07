/**
 * @author: chenmin
 * @date: 2011-10-16
 * @desc: Platform provides utilities to specify running os and browser version
 * User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)

 * The following table lists the version tokens used in recent versions of Internet Explorer.
 * MSIE 10	Internet Explorer 10
 * MSIE 9.0	Internet Explorer 9
 * MSIE 8.0	Internet Explorer 8 or IE8 Compatibility View/Browser Mode
 * MSIE 7.0	Internet Explorer 7 or IE7 Compatibility View/Browser Mode
 * MSIE 6.0	Microsoft Internet Explorer 6

 * The following table lists Internet Explorer platform tokens for the last several versions of Windows.
 * Windows NT 6.2	Windows 8
 * Windows NT 6.1	Windows 7
 * Windows NT 6.0	Windows Vista
 * Windows NT 5.2	Windows Server 2003; Windows XP x64 Edition
 * Windows NT 5.1	Windows XP 
 * Windows NT 5.0	Windows 2K
 */

Downsha.Platform = {
	getUserAgent : function () {
		return navigator.userAgent;
	},
	isIE6 : function () {
		return navigator.userAgent.indexOf("MSIE 6.0") >= 0;
	},
	isIE7 : function () {
		return navigator.userAgent.indexOf("MSIE 7.0") >= 0;
	},
	isIE8 : function () {
		return navigator.userAgent.indexOf("MSIE 8.0") >= 0;
	},
	isIE9 : function () {
		return navigator.userAgent.indexOf("MSIE 9.0") >= 0;
	},
	isIE10 : function () {
		return navigator.userAgent.indexOf("MSIE 10") >= 0;
	},
	getIEVersion : function() {
		if (!this.ieVersion) {
			var matchRes = navigator.userAgent.match(/MSIE\s*(\d+)\.\d+/i);
			if (matchRes) {
				this.ieVersion = parseInt(matchRes[1]);
			}
		}
		return this.ieVersion;
	},
	isQuirksMode : function(doc) {
		if (!doc) {
			doc = document;
		}
		/**
		 * IE will return 9, 8 or 7 for standards mode and 5 for quirks mode.
		 * other browsers should return a value for compatMode
		 */
		return (doc.documentMode) ? 
			((doc.documentMode == 5) ? true : false) : 
			((doc.compatMode == "CSS1Compat") ? false : true);
	},
	isWin2K : function () {
		return navigator.userAgent.indexOf("Windows NT 5.0") >= 0;
	},
	isWinXP : function () {
		return navigator.userAgent.indexOf("Windows NT 5.1") >= 0;
	},
	isWin2003 : function () {
		return navigator.userAgent.indexOf("Windows NT 5.2") >= 0;
	},
	isWinVista : function () {
		return navigator.userAgent.indexOf("Windows NT 6.0") >= 0;
	},
	isWin7 : function () {
		return navigator.userAgent.indexOf("Windows NT 6.1") >= 0;
	},
	isWin8 : function () {
		return navigator.userAgent.indexOf("Windows NT 6.2") >= 0;
	},
	getOSVersion : function() {
		if (!this.osVersion) {
			var matchRes = navigator.userAgent.match(/Windows\s*NT\s*(\d+\.\d+)/i);
			if (matchRes) {
				this.osVersion = parseFloat(matchRes[1]);
			}
		}
		return this.osVersion;
	},
	isWin32 : function () {
		return navigator.platform == "Win32";
	},
	isWin64 : function () {
		return navigator.platform == "Win64";
	},
	isSupportedVersion : function () {
		return ((this.isIE6() || this.isIE7() || this.isIE8() || this.isIE9() || this.isIE10()) && 
			(this.isWin2K() || this.isWinXP() || this.isWin2003() || this.isWinVista() || this.isWin7() || this.isWin8()));
	}
};
