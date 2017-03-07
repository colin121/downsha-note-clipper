/**
 * @author: chenmin
 * @date: 2011-11-01
 * @desc: startup code for downsha extension
 */
var LOG = Downsha.Logger.getInstance();
window.onerror = function(errorMsg, url, lineNumber) {
  LOG.exception("\n" + url + ":" + lineNumber + ": " + errorMsg + "\n");
}
var downshaLoadTimeout = 10 * 1000;
var downshaLoadInterval = 50;
var downshaLoadStart = new Date().getTime();
var downshaLoadTimer = window.setInterval(function() {
	var now = new Date().getTime();
	if (((typeof window.document.readyState != "undefined") && 
		(window.document.readyState == "complete" || 
		window.document.readyState == 'loaded' || 
		window.document.readyState == 'interactive') && 
		(window.document.body)) || ((now - downshaLoadStart) >= downshaLoadTimeout)) {
		clearInterval(downshaLoadTimer);
		try {
			var downshaExtension = Downsha.getIEExtension();
			downshaExtension.startUp();
		} catch (e) {
			LOG.warn("Startup exception, readyState: " + window.document.readyState);
			LOG.dir(e);
		}
	}
}, downshaLoadInterval);
