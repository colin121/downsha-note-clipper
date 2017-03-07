/**
 * @author: chenmin
 * @date: 2011-09-29
 * @desc: encapsulate the call of content scripting for preview action.
 */

(function() {
  var LOG = null;
  Downsha.ContentPreview = function ContentPreview() {
    LOG = Downsha.Logger.getInstance();
    this.initialize();
  };
  Downsha.inherit(Downsha.ContentPreview, Downsha.AbstractContentScripting, true);
  Downsha.ContentPreview.CONTENT_SCRIPTS = [
  	"/libs/DownshaPreview.js"
  	/*
  	"/libs/downsha/Downsha.js",
  	"/libs/downsha/Logger/Logger.js",
  	"/libs/downsha/Logger/ChromeExtensionLoggerImpl.js",
  	"/libs/downsha/Utils.js",
  	"/libs/downsha/Constants.js",
  	"/libs/downsha/Extractors/ExtractContentJS.js",
  	"/libs/downsha/RequestMessage.js",
  	"/libs/downsha/ContentScripting/SelectionFinder.js",
  	"/libs/downsha/ContentScripting/Scroller.js",
  	"/libs/downsha/ContentScripting/NodeRect.js",
  	"/libs/downsha/ContentScripting/ClipStyle.js",
  	"/libs/downsha/ContentScripting/ContentVeil.js",
  	"/libs/downsha/ContentScripting/AbstractStyleScript.js",
  	"/libs/downsha/ContentScripting/PreviewerScript.js"
  	*/
  	];

  Downsha.ContentPreview.prototype.getRequiredScriptNames = function() {
    return [].concat(this.constructor.CONTENT_SCRIPTS);
  };
  Downsha.ContentPreview.prototype.previewFullPage = function(tabId, callback) {
    LOG.debug("ContentPreview.previewFullPage");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().previewFullPage()"
    }, function() { // oncomplete
      LOG.debug("Finished ContentPreviewScript.previewFullPage()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.previewSelection = function(tabId, callback) {
    LOG.debug("ContentPreview.previewSelection");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().previewSelection()"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.previewSelection()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.previewArticle = function(tabId, callback) {
    LOG.debug("ContentPreview.previewArticle");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().previewArticle()"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.previewArticle()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.previewURL = function(tabId, callback) {
    LOG.debug("ContentPreview.previewURL");
    var self = this;
    chrome.tabs.get(tabId, function(tab) {
      var title = JSON.stringify(tab.title);
      var url = JSON.stringify(tab.url);
      var favIconUrl = JSON.stringify(tab.favIconUrl);
      self.executeScript(tab.id, {
        code : "Downsha.ContentPreviewScript.getInstance().previewURL("
            + title + "," + url + "," + favIconUrl + ")"
      }, function() {
        LOG.debug("Finished ContentPreviewScript.previewURL()");
        if (typeof callback == 'function') {
          callback();
        }
      });
    });
  };
  Downsha.ContentPreview.prototype.nudgePreview = function(tabId, direction, callback) { // nudge preview
      LOG.debug("ContentPreview.nudgePreview");
      var code = "Downsha.ContentPreviewScript.getInstance().nudgePreview(" + direction + ")";
      this.executeScript(tabId, {code: code}, function() {
          LOG.debug("Finished ContentPreview.nudgePreview()");
          if (typeof callback == 'function') {
              callback();
          }
      });
  };
  Downsha.ContentPreview.prototype.clear = function(tabId, callback) { // clear the preview of tabId
    LOG.debug("ContentPreview.clear");
    this.executeScript(tabId, {
      code : "Downsha.ContentPreviewScript.getInstance().clear()"
    }, function() {
      LOG.debug("Finished ContentPreviewScript.clear()");
      if (typeof callback == 'function') {
        callback();
      }
    });
  };
  Downsha.ContentPreview.prototype.clearAll = function() {
    LOG.debug("ContentPreview.clearAll");
    for ( var tabId in this._status) {
      LOG.debug("Clearing tabId: " + tabId);
      tabId = parseInt(tabId);
      if (!isNaN(tabId)) {
        this.clear(tabId);
      }
    }
  };
})();
