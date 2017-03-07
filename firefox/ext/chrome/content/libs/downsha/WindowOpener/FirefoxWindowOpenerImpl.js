/**
 * @author: chenmin
 * @date: 2011-09-02
 * @desc: window opener implementation of firefox
 */

(function() {
	Downsha.FirefoxWindowOpenerImpl = function FirefoxWindowOpenerImpl() {
	};
	Downsha.inherit(Downsha.FirefoxWindowOpenerImpl, Downsha.WindowOpenerImpl, true);
	Downsha.FirefoxWindowOpenerImpl.isResponsibleFor = function(navigator) {
	  var ua = navigator.userAgent.toLowerCase();
	  return (ua.indexOf("firefox") >= 0);
	};
	Downsha.FirefoxWindowOpenerImpl.prototype._mainWindow = null;
	Downsha.FirefoxWindowOpenerImpl.prototype.getMainWindow = function() {
	  if (this._mainWindow == null) {
	    /*
	    If your code is running in a dialog opened directly by a browser window, you can use window.opener.gBrowser
	    If window.opener doesn't work, you can get the most recent browser window
	    */
	    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	    this._mainWindow = wm.getMostRecentWindow("navigator:browser");
	  }
	  return this._mainWindow;
	};
	Downsha.FirefoxWindowOpenerImpl.prototype.openUrl = function(url, winName, winOpts) {
	  var newWin;
	  if (winOpts) {
	    newWin = this.getMainWindow().open(url, winName, winOpts);
	  } else {
	    newWin = this.getMainWindow().open(url, winName);
	  }
	  newWin.focus();
	  return newWin;
	};
})();
