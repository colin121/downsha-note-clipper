/**
 * @author: chenmin
 * @date: 2011-09-29
 * @desc: encapsulate the call of content scripting for getting page information.
 */

(function() {
  var LOG = null;
  Downsha.PageInfo = function PageInfo() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  Downsha.inherit(Downsha.PageInfo, Downsha.AbstractContentScripting, true);
  Downsha.PageInfo.CONTENT_SCRIPTS = [
  	"/libs/DownshaPage.js"
  	/*
  	"/libs/downsha/Downsha.js",
  	"/libs/downsha/Logger/Logger.js",
  	"/libs/downsha/Logger/ChromeExtensionLoggerImpl.js",
  	"/libs/downsha/Utils.js",
  	"/libs/downsha/Constants.js",
  	"/libs/downsha/Extractors/ExtractContentJS.js",
  	"/libs/downsha/RequestMessage.js",
  	"/libs/downsha/ContentScripting/SelectionFinder.js",
  	"/libs/downsha/ContentScripting/AbstractStyleScript.js",
  	"/libs/downsha/ContentScripting/PageInfoScript.js"
  	*/
  	];

  Downsha.PageInfo.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };
  Downsha.PageInfo.prototype.profile = function(tabId, callback) { // get page profile(page/article/selection information)
    LOG.debug("PageInfo.profile");
    this.executeScript(tabId, {
      code : "Downsha.PageInfoScript.getInstance().profile()"
    }, function() {
      LOG.debug("Finished PageInfoScript.profile()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
})();
