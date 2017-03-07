/**
 * @author: chenmin
 * @date: 2011-09-28
 * @desc: encapsulate the call of content scripting for clip action.
 */

(function() {
  var LOG = null;
  Downsha.ClipperContentScripting = function ClipperContentScripting() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  Downsha.inherit(Downsha.ClipperContentScripting, Downsha.AbstractContentScripting, true);
  Downsha.ClipperContentScripting.CONTENT_SCRIPTS = [ // file list that to be injected
  	"/libs/DownshaClip.js"
  	/*
  	"/libs/downsha/Downsha.js",
  	"/libs/downsha/Logger/Logger.js",
  	"/libs/downsha/Logger/ChromeExtensionLoggerImpl.js",
  	"/libs/downsha/Utils.js",
  	"/libs/downsha/Constants.js",
  	"/libs/downsha/Extractors/ExtractContentJS.js",
  	"/libs/downsha/RequestMessage.js",
  	"/libs/downsha/ContentScripting/SelectionFinder.js",
  	"/libs/downsha/ContentScripting/ClipStyle.js",
  	"/libs/downsha/ContentScripting/Clip.js",
  	"/libs/downsha/ContentScripting/AbstractStyleScript.js",
  	"/libs/downsha/ContentScripting/ClipperScript.js"
  	*/
  	];

  Downsha.ClipperContentScripting.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };
  Downsha.ClipperContentScripting.prototype.createInstance = function() {
    var code = "Downsha.ContentClipper.destroyInstance();";
    code += "Downsha.ContentClipper.getInstance();";
  };
  Downsha.ClipperContentScripting.prototype.clipFullPage = function(tabId,
      stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.clipFullPage");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : null;
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().clipFullPage("
        + _stylingStrategy + ", " + _attrsString + "," + _showWait + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };
  Downsha.ClipperContentScripting.prototype.clipSelection = function(tabId,
      stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.clipSelection");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : null;
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().clipSelection("
        + _stylingStrategy + ", " + _attrsString + ", " + _showWait + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };
  Downsha.ClipperContentScripting.prototype.clipArticle = function(tabId,
      stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.clipArticle");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : "null";
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().clipArticle("
        + _stylingStrategy + ", " + _attrsString + ", " + _showWait + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };
  Downsha.ClipperContentScripting.prototype.perform = function(tabId,
      fullPageOnly, stylingStrategy, attrs, showWait, callback) {
    LOG.debug("ClipperContentScripting.perform(" + tabId + ", " + fullPageOnly
        + ", " + stylingStrategy + ", " + showWait + ")");
    if (!stylingStrategy) {
      stylingStrategy = "Downsha.ClipFullStylingStrategy";
    }
    var _fullPageOnly = (fullPageOnly) ? "true" : "false";
    var _stylingStrategy = (stylingStrategy) ? stylingStrategy : "null";
    var _showWait = (showWait) ? "true" : "false";
    var _attrsString = (attrs) ? JSON.stringify(attrs) : null;
    var code = this.createInstance();
    code += "Downsha.ContentClipper.getInstance().perform(" + _fullPageOnly
        + ", " + _stylingStrategy + ", " + _attrsString + ", " + _showWait
        + ");";
    LOG.debug("Executing: " + code);
    this.executeScript(tabId, {
      code : code
    }, callback);
  };
  Downsha.ClipperContentScripting.prototype._wait = function(tabId) {
    this.executeScript(tabId, {
      code : "Downsha.ContentClipper.getInstance().wait();"
    });
  };
  Downsha.ClipperContentScripting.prototype._clearWait = function() {
    this.executeScript(tabId, {
      code : "Downsha.ContentClipper.getInstance().clearWait();"
    });
  };
})();
