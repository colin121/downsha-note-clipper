/**
 * @author: chenmin
 * @date: 2011-10-09
 * @desc: content clip script for FullPage/Selection/Article/URL
 * ContentClipper call Clip ojbect to perform clip action
 * ContentClipper also shows clipping wait icon and text while start clipping
 * ContentClipper get all style texts from external css files and inject a single style tag to document.
 * by importing all external css files, we can directly use inline styles (node.style) as whole styles.
 * There are 3 kinds of css definitions: inline, internal and external.
 * 1. Inline : <textarea style="display: none;"></textarea>
 * 2. Internal: <style>body {background: white;}</style>
 * 3. External: linked: <link rel="stylesheet" type="text/css" href="style.css" /> or imported: @import url("style.css");
 *
 * CSS: The interesting portion of how this whole things works is how it goes about inlining stylesheets. The core of
 * this is built on an API called getMatchedCSSRules (webkit-only, for other browsers, there is another implementation
 * in here built around matchesSelector, which is both much slower and probably not kept in sync with the primary
 * version). 
 * 
 * Calling getMatchedCSSRules will give you a list of all the CSS rules that apply to your element, but with some
 * caveats: noticeably, you wont get back rules from stylesheets that you wouldn't normally be able to load yourself
 * due to the same-origin policy. These are just silently omitted. To get around this, we start our serialization
 * process by iterating across all the stylesheets attached to the document, and if they are link elements with 'href'
 * properties, we'll pass a message to the extension page asking it to request that URL on our behalf (because the
 * background page in an extension is not subject to the same origin policy). We don't need to bother for styles in
 * "style" tags because they can't have same-origin policy issues. We also run through each rule in each stylesheet and
 * if it's an @import rule, we'll send off a request for that stylesheet as well. We keep a list of stylesheets
 * requested and wont request duplicates, and will give up at a max of 100 total stylesheets (fun fact: @import rules
 * can be circular).
 * 
 * The background page will return us a message with the result from each requested stylesheet. We create a "style"
 * tag, and then insert the text from the request in there, and append the new style element to the page. We then fire
 * off a polling function that waits for a new item to show up in document.styleSheets that references the style tag we
 * just added. When that shows up, we'll run the newly attached styleSheet object through our @import check again to
 * see if we need to grab any more stylesheets from there.
 *  
 */

(function() {
  var LOG = null;
  var logEnabled = false;

  Downsha.ContentClipper = function ContentClipper(win) {
    LOG = Downsha.Logger.getInstance();
    LOG.level = Downsha.ContentClipper.LOG_LEVEL;
    if (LOG.level == Downsha.Logger.LOG_LEVEL_DEBUG) {
      logEnabled = true;
    }
    this.initialize(win);
  };
  Downsha.inherit(Downsha.ContentClipper, Downsha.AbstractStyleScript);
  Downsha.ContentClipper._instance = null;
  Downsha.ContentClipper.getInstance = function() {
    if (!this._instance) {
      this._instance = new Downsha.ContentClipper();
    }
    return this._instance;
  };
  Downsha.ContentClipper.destroyInstance = function() {
    this._instance = null;
  };

  Downsha.ContentClipper.LOG_LEVEL = 0;
  Downsha.ContentClipper.LOCALIZED_STYLE_TAG_ID = "downshaChromeExtensionLocalizedStyleSheet"; // id name of style tag that has all local styles
  Downsha.ContentClipper.prototype.PREVIEW_ARTICLE_CLASS = "downshaPreviewArticleContainer"; // class name of node that has article content
	Downsha.ContentClipper.prototype.SHOW_WAIT_CLIP_DELAY_TIME = 300;
	Downsha.ContentClipper.prototype.WAIT_FADE_TIME = 1000;
	Downsha.ContentClipper.prototype.AFTER_INJECT_SIGNAL_DELAY_TIME = 300;
  Downsha.ContentClipper.prototype.clip = null; // Downsha.Clip object
  Downsha.ContentClipper.prototype._localizedStyleSheets = null;
  Downsha.ContentClipper.prototype._localizedStyleSheetCount = 0;
  Downsha.ContentClipper.prototype._localizedStyleSheetsInjected = false;
  Downsha.ContentClipper.prototype._sema = null;
  Downsha.ContentClipper.prototype._article = null;
  Downsha.ContentClipper.prototype._articleRules = null;
  Downsha.ContentClipper.prototype.initialStyleSheetUrls = ["chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/css/contentclipper.css"];

  Downsha.ContentClipper.prototype.initialize = function(win) {
    this.window = (win) ? win : window;
    Downsha.ContentClipper.parent.initialize.apply(this, []);
    
    this._sema = Downsha.Semaphore.mutex();
    this.fetchArticleRules();
    
    // inject all external css files as a internal style tag
    if (!this.isLocalizedStyleSheetsInjected()) {
      this.localizeStyleSheets();
    }
    this.__defineGetter__("article", this.getArticle);
    this.__defineGetter__("articleRules", this.getArticleRules);
  };
	Downsha.ContentClipper.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	
	/**
	 * following constants value will be overwritten by ChromeExtension.getClipperContentScripting
	 */ 
  Downsha.ContentClipper.prototype.PAGE_CLIP_SUCCESS = Downsha.Constants.RequestType.PAGE_CLIP_SUCCESS;
  Downsha.ContentClipper.prototype.PAGE_CLIP_CONTENT_TOO_BIG = Downsha.Constants.RequestType.PAGE_CLIP_CONTENT_TOO_BIG;
  Downsha.ContentClipper.prototype.PAGE_CLIP_CONTENT_SUCCESS = Downsha.Constants.RequestType.PAGE_CLIP_CONTENT_SUCCESS;
  Downsha.ContentClipper.prototype.PAGE_CLIP_CONTENT_FAILURE = Downsha.Constants.RequestType.PAGE_CLIP_CONTENT_FAILURE;
  Downsha.ContentClipper.prototype.PAGE_CLIP_FAILURE = Downsha.Constants.RequestType.PAGE_CLIP_FAILURE;
  Downsha.ContentClipper.prototype.WAIT_CONTAINER_ID = "downshaContentClipperWait"; // show clipping status

  Downsha.ContentClipper.prototype.onClip = function(clip) {
    new Downsha.RequestMessage(this.PAGE_CLIP_SUCCESS, clip.toDataObject()).send();
  };
  Downsha.ContentClipper.prototype.onClipContent = function(clip) {
    new Downsha.RequestMessage(this.PAGE_CLIP_CONTENT_SUCCESS, clip.toDataObject()).send();
  };
  Downsha.ContentClipper.prototype.onClipFailure = function(error) {
    new Downsha.RequestMessage(this.PAGE_CLIP_FAILURE, error).send();
  };
  Downsha.ContentClipper.prototype.onClipContentFailure = function(error) {
    new Downsha.RequestMessage(this.PAGE_CLIP_CONTENT_FAILURE, error).send();
  };
  Downsha.ContentClipper.prototype.onClipContentTooBig = function(clip) {
    new Downsha.RequestMessage(this.PAGE_CLIP_CONTENT_TOO_BIG, clip.toDataObject()).send();
  };
  Downsha.ContentClipper.prototype.getArticleRules = function() {
  	return this._articleRules;
  };
  Downsha.ContentClipper.prototype.fetchArticleRules = function() {
  	LOG.debug("ContentClipper.fetchArticleRules");
  	var self = this;
  	if (!this._articleRules) {
  		this._sema.critical(function() {
  			chrome.extension.sendRequest( // send request to ChromeExtension which then get remote article rules by ajax
  			new Downsha.RequestMessage(Downsha.Constants.RequestType.FETCH_ARTICLE_RULES, this.window.document.location.href),
        function(response) {
        	self._articleRules = (response && response.rules) ? response.rules : {};
        	self._sema.signal();
        });
  		});
  	}
  };
  
  Downsha.ContentClipper.prototype.localizeStyleSheets = function() {
  	LOG.debug("ContentClipper.localizeStyleSheets");
    var self = this;
    this._localizedStyleSheets = [];
    this._localizedStyleSheets.count = 0;
    this._localizedStyleSheetCount = 0;
    var fetchCount = 0;
    var complete = function() {
      if (fetchCount == 0) {
        LOG.debug("Not injecting localized styles cuz there were none fetched");
        self._sema.signal();
        return;
      }
      if (!self.isLocalizedStyleSheetsInjected() && self._localizedStyleSheets.count == self._localizedStyleSheetCount) {
        LOG.debug("Injecting " + self._localizedStyleSheetCount + " localized style sheets");
        self._importExternalStyles(function() {
          self._injectLocalizedStyles();
          setTimeout(function() {
            self._sema.signal();
          }, self.AFTER_INJECT_SIGNAL_DELAY_TIME);
        });
      }
    };
    this._sema.critical(function() {
          /**
           * document.styleSheets returns a list of CSSStyleSheet objects 
           * for stylesheets explicitly linked into or embedded in a document.
           * CSSStyleSheet.cssRules returns a CSSRuleList of the CSS rules in the style sheet.
           */
          for (var i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) { // disabled indicates whether the current stylesheet has been applied or not
              LOG.debug("Skipping disabled sheet");
              continue;
            } else if (document.styleSheets[i].media // media specifies the intended destination medium for style information.
                && document.styleSheets[i].media.length > 0 // the default value for media is "screen"
                && document.styleSheets[i].media.mediaText
                && document.styleSheets[i].media.mediaText.toLowerCase().indexOf("screen") < 0
                && document.styleSheets[i].media.mediaText.toLowerCase().indexOf("all") < 0) {
              LOG.debug("Skipping style sheet cuz it's not for screen");
              continue;
            } else if (document.styleSheets[i].rules) { // rules for ie/chrome, cssRules for firefox
              var cssText = self.serializeStyleRules(document.styleSheets[i].rules); // save serialized local rules
              LOG.debug("Adding local rules, css text length: " + cssText.length);
              self._localizedStyleSheets[self._localizedStyleSheetCount++] = cssText;
              self._localizedStyleSheets.count++;
            } else if (document.styleSheets[i].href && document.styleSheets[i].href.toLowerCase().indexOf("http") == 0) {
              LOG.debug("Fetching remote style sheet: " + document.styleSheets[i].href);
              var fetchProcess = function(cssResponse) { // callback for fetch ok
                var cssText = (cssResponse && cssResponse.cssText) ? cssResponse.cssText : "";
                var _count = arguments.callee._count; // arguments.callee refers to current object fetchProcess
                var _url = arguments.callee._url;
                self._localizedStyleSheets[_count] = "/* " + _url + "*/\n" + cssText; // add url content as comment and save rules
                self._localizedStyleSheets.count++;
                complete();
              };
              fetchProcess._count = self._localizedStyleSheetCount++;
              fetchProcess._url = document.styleSheets[i].href;
              self.fetchStyleSheet(document.styleSheets[i].href, fetchProcess); // fetch remote css files
              fetchCount++;
            } else { // skip other css files, including injected css files by extension, e.g. contentpreview.css
              LOG.debug("Skipping style sheet: " + document.styleSheets[i].href);
            }
          }
        });
    complete();
  };

  Downsha.ContentClipper.prototype.fetchStyleSheet = function(href, callback) {
    var self = this;
    chrome.extension.sendRequest( // send request to ChromeExtension which then get remote css files by ajax
    	new Downsha.RequestMessage(Downsha.Constants.RequestType.FETCH_STYLE_SHEET_RULES, href),
        function(cssResponse) {
          if (typeof callback == 'function') {
            callback(cssResponse);
          }
        });
  };

  Downsha.ContentClipper.prototype.serializeStyleRules = function(rulesList) { // get css rules text together
    var cssText = "";
    for ( var i = 0; i < rulesList.length; i++) {
      cssText += rulesList[i].cssText + "\n";
    }
    return cssText;
  };

  Downsha.ContentClipper.prototype.isLocalizedStyleSheets = function() {
    return (this._localizedStyleSheets) ? true : false;
  };

  Downsha.ContentClipper.prototype.getDocBase = function() { // get document base url
    var docBase = document.location.protocol + "//" + document.location.hostname;
    docBase = docBase.toLowerCase();
    return docBase;
  };

  Downsha.ContentClipper.prototype._importExternalStyles = function(callback) {
    LOG.debug("ContentClipper._importExternalStyles");
    var self = this;
    var cssText = this._localizedStyleSheets.join("").replace(/\n+/, ""); // get all css texts together
    this._importExternalStylesFromString(cssText, callback);
  };

  Downsha.ContentClipper.prototype._importExternalStylesFromString = function(cssText, callback) {
    LOG.debug("ContentClipper._importExternalStylesFromString");
    var self = this;
    var selfArgs = arguments;
    if (cssText) {
      var re = /@import\s+url\(\s*[\'\"]?([^\'\"\)]+)[\'\"]?\s*\)\s*;?/ig; // match rule: @import url("abc");
      var match = null;
      var docBase = this.getDocBase();
      var fetchCount = 0;
      var complete = function() {
        if (fetchCount == 0 && typeof callback == 'function') {
          callback();
        }
      };
      while (match = re.exec(cssText)) {
        var url = match[1];
        if (url.toLowerCase().indexOf("http") < 0) { // make absolute css import url
          if (url.charAt(0) == "/") {
            url = docBase + url;
          } else {
            url = document.location.href.replace(/\/[^\/]*$/, "/" + url);
          }
        }
        if (url && url.toLowerCase().indexOf(docBase) < 0) { //cross-origin import
          LOG.debug("Fetching import: " + url);
          // fetch imported style sheet
          var fetchProc = function(cssResponse) {
            var _cssText = (cssResponse && cssResponse.cssText) ? cssResponse.cssText : "";
            var _pattern = arguments.callee._pattern;
            LOG.debug("Replacing: " + _pattern + " with css text of length: " + _cssText.length);
            if (_pattern) { // replace the @import direction with corresponding css text
              for ( var i = 0; i < self._localizedStyleSheets.length; i++) {
                self._localizedStyleSheets[i] = self._localizedStyleSheets[i].replace(_pattern, _cssText);
              }
            }
            fetchCount--;
            if (re.test(_cssText.replace(/[\n\r]+/g, ""))) { // check recursive import
              self._importExternalStylesFromString(_cssText, function() {
                complete();
              });
            } else {
              complete();
            }
          };
          fetchProc._pattern = match[0];
          this.fetchStyleSheet(url, fetchProc);
          fetchCount++;
        } else if (!url) {
          LOG.warn("Could not determine URL of import: " + match[0]);
        } else if (url.toLowerCase().indexOf(docBase) == 0) {
          LOG.debug("Skipping same-origin import: " + url);
        }
      }
      complete();
    }
  };

  Downsha.ContentClipper.prototype._injectLocalizedStyles = function() {
    LOG.debug("ContentClipper._injectLocalizedStyles");
    var cssText = this._localizedStyleSheets.join("\n");
    if (cssText) {
      var old = document.getElementById(this.constructor.LOCALIZED_STYLE_TAG_ID);
      if (old && old.parentElement) {
        old.parentElement.removeChild(old);
      }
      var styleTag = document.createElement("style");
      styleTag.setAttribute("id", this.constructor.LOCALIZED_STYLE_TAG_ID);
      var text = document.createTextNode();
      text.textContent = cssText;
      styleTag.appendChild(text);
      document.head.appendChild(styleTag);
    }
  };

  Downsha.ContentClipper.prototype.isLocalizedStyleSheetsInjected = function() {
    var styleTag = document.getElementById(this.constructor.LOCALIZED_STYLE_TAG_ID);
    return (styleTag) ? true : false;
  };

  Downsha.ContentClipper.prototype._doClip = function(fn, showWait) {
    var self = this;
    if (showWait) {
      this.wait();
      setTimeout(function() {
        self._sema.critical(function() {
          fn();
          self._sema.signal();
          self.clearWait();
        });
      }, self.SHOW_WAIT_CLIP_DELAY_TIME);
    } else {
      this._sema.critical(function() {
        fn();
        self._sema.signal();
      });
    }
  };

  Downsha.ContentClipper.prototype.perform = function(fullPageOnly, stylingStrategy, showWait) {
    var self = this;
    this._doClip(function() {
      self._perform(fullPageOnly, stylingStrategy);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipSelection = function(stylingStrategy, attrs, showWait) {
    LOG.debug("ContentClipper.clipSelection");
    var self = this;
    this._doClip(function() {
      self._clipSelection(stylingStrategy, attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipFullPage = function(stylingStrategy, attrs, showWait) {
    LOG.debug("ContentClipper.clipFullPage");
    var self = this;
    this._doClip(function() {
      self._clipFullPage(stylingStrategy, attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipArticle = function(stylingStrategy, attrs, showWait) {
    LOG.debug("ContentClipper.clipArticle");
    var self = this;
    this._doClip(function() {
      self._clipArticle(stylingStrategy, attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.getArticleElement = function() {
    var el = this.window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS)[0];
    if (el) {
    	return el;
    } else if (this.article) { // this.article will call getArticle automatically
			Downsha.Utils.addElementClass(this.article, this.PREVIEW_ARTICLE_CLASS);
			return this.article;
    }
    return null;
  };

  Downsha.ContentClipper.prototype.getArticle = function() {
    if (!this._article) {
    	this._article = Downsha.Utils.getArticleNode(this.window.document, this.articleRules);
    }
    return this._article;
  };

  Downsha.ContentClipper.prototype._clipSelection = function(stylingStrategy, attrs) {
    LOG.debug("ContentClipper._clipSelection");
    this._perform(false, stylingStrategy, attrs);
  };

  Downsha.ContentClipper.prototype._clipFullPage = function(stylingStrategy, attrs) {
    LOG.debug("ContentClipper._clipFullPage");
    this._perform(true, stylingStrategy, attrs);
  };

  Downsha.ContentClipper.prototype._clipArticle = function(stylingStrategy, attrs) {
    LOG.debug("ContentClipper._clipArticle");
    this.createClipObject(stylingStrategy); // construct Downsha.Clip
    var el = this.getArticleElement();
    LOG.debug("Article element: " + el);
    
    try {
      if (el && this.clip.clipElement(el)) { // clip article element
        this._overloadClipNote(this.clip, attrs);
        if (logEnabled) {
          LOG.debug("Successful clip of element's contents: " + this.clip.toString());
          LOG.dir(this.clip.toDataObject());
        }
        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
          if (logEnabled)
            LOG.debug("Notifying full page clip failure");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else {
        if (logEnabled)
          LOG.debug("Failed to clip contents of given element");
        this.onClipFailure(chrome.i18n.getMessage("articleClipFailure"));
      }
    } catch (e) {
      if (logEnabled)
        LOG.exception("Exception clipping page or its selection"
            + ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
  };

  Downsha.ContentClipper.prototype._overloadClipNote = function(note, attrs) {
    if (note && attrs) {
      if (logEnabled) {
        LOG.debug("Overloading attrs: ");
        LOG.dir(attrs);
      }
      for ( var a in attrs) {
        if (attrs[a] && Downsha.hasOwnProperty(note, a)) {
          try {
            note[a] = attrs[a];
          } catch (e) {
          }
        }
      }
    }
  };

  Downsha.ContentClipper.prototype.createClipObject = function(stylingStrategy) {
    var self = this;
    this.clip = new Downsha.Clip(this.window, stylingStrategy,
        Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX, this.articleRules);
    this.clip.onsizeexceed = function() {
      LOG.debug("Content size exceeded during serialization");
      self.onClipContentTooBig(self.clip);
    };
    return this.clip;
  };

  Downsha.ContentClipper.prototype._perform = function(fullPageOnly, stylingStrategy, attrs) {
    if (logEnabled)
      LOG.debug("Contentscript clipping...");

    var self = this;
    this.createClipObject(stylingStrategy); // construct Downsha.Clip
    if (logEnabled)
      LOG.debug("CLIP: " + this.clip.toString());

    try {
      if (!fullPageOnly && this.clip.hasSelection() //*** clip selection if anything selected
          && this.clip.clipSelection()) {
        this._overloadClipNote(this.clip, attrs);
        if (logEnabled)
          LOG.debug("Successful clip of selection: " + this.clip.toString());
        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
          if (logEnabled)
            LOG.debug("Notifying full page clip failure");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (!fullPageOnly && this.article //*** clip article if found
      	&& Downsha.Utils.isArticleSane( //*** call isArticleSane to determine whethe article makes sense
    		this.window.document.width, // these data have been collected by page info scripts
    		this.window.document.height, 
    		Downsha.Utils.getAbsoluteBoundingClientRect(this.article))
    		// TODO article clip without preview might cause error!
    		// http://www.chinanews.com/gn/2011/10-12/3384268.shtml
    		// http://pic.news.sohu.com/group-295904.shtml#0
    		&& this.clip.clipElement(this.article)) {
       this._overloadClipNote(this.clip, attrs);
        if (logEnabled) {
          LOG.debug("Successful clip of element's contents: " + this.clip.toString());
          LOG.dir(this.clip.toDataObject());
        }
        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
          if (logEnabled)
            LOG.debug("Notifying full page clip failure");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (this.clip.hasBody()) { //*** otherwise, clip body part
        this._overloadClipNote(this.clip, attrs);
        this.onClip(this.clip);
        if (logEnabled) {
          LOG.debug("Successful clip of full page: " + this.clip.toString());
        }
        if (this.clip.clipBody()) { // clip body
          if (this.clip.sizeExceeded
              || this.clip.length >= (Downsha.Constants.Limits.CLIP_NOTE_CONTENT_LEN_MAX)) {
            if (logEnabled)
              LOG.debug("Notifying full page clip failure");
            this.onClipContentTooBig(this.clip);
          } else {
            if (logEnabled)
              LOG.debug("Notifying full page clip success");
            this.onClipContent(this.clip);
          }
        } else {
          this.onClipContentFailure(chrome.i18n.getMessage("fullPageClipFailure"));
        }
      } else {
        if (logEnabled)
          LOG.debug("Failed to clip full page");
        this.onClipFailure(chrome.i18n.getMessage("fullPageClipFailure"));
      }
    } catch (e) {
      // Can't construct a clip -- usually because the body is a frame
      if (logEnabled)
        LOG.debug("Exception clipping page or its selection"
            + ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
    if (logEnabled)
      LOG.debug("Done clipping...");
  };

  Downsha.ContentClipper.prototype.getWaitContainer = function() {
    var container = document.getElementById(this.WAIT_CONTAINER_ID);
    if (!container) {
      container = document.createElement("DOWNSHADIV");
      container.id = this.WAIT_CONTAINER_ID;
      var content = document.createElement("DIV");
      content.id = this.WAIT_CONTAINER_ID + "Content";
      container.appendChild(content);
      var center = document.createElement("CENTER");
      content.appendChild(center);
      var spinner = document.createElement("IMG");
      spinner.setAttribute("src", "chrome-extension://"
          + chrome.i18n.getMessage("@@extension_id")
          + "/images/icon_scissors.png");
      center.appendChild(spinner);
      var text = document.createElement("SPAN");
      text.id = this.WAIT_CONTAINER_ID + "Text";
      center.appendChild(text);
      container._waitMsgBlock = text;
      container.setMessage = function(msg) {
        this._waitMsgBlock.innerHTML = msg;
      };
    }
    return container;
  };
  Downsha.ContentClipper.prototype.wait = function() {
    var wait = this.getWaitContainer();
    wait.style.opacity = "1";
    wait.setMessage(chrome.i18n.getMessage("contentclipper_clipping"));
    document.body.appendChild(wait);
  };
  Downsha.ContentClipper.prototype.clearWait = function() {
    var wait = document.getElementById(this.WAIT_CONTAINER_ID);
    if (wait) {
      wait.style.opacity = "0";
      setTimeout(function() {
        wait.parentNode.removeChild(wait);
      }, this.WAIT_FADE_TIME);
    }
  };
})();
