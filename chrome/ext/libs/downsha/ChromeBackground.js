/**
 * @author: chenmin
 * @date: 2012-09-10
 * @desc: bootstrap of background page.
 */

(function() {
	var LOG = null;
	$(document).ready(function backgroundHtml() {
		Downsha.Logger.setGlobalLevel(Downsha.chromeExtension.logger.level);
		Downsha.Utils.updateBadge(Downsha.getContext()); // update browser icon badge
		Downsha.chromeExtension.initContextMenu(); // update context menu
		LOG = Downsha.Logger.getInstance(); // create logger for current environment
		window.onerror = function(errorMsg, url, lineNumber) {
			LOG.exception("\n" + url + ":" + lineNumber + ": " + errorMsg + "\n");
		}
		LOG.info("-------- BACKGROUND STARTING ------------");
	});
})();
