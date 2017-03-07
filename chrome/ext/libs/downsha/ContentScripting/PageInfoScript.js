/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: profile web page document (page/selection/article)
 */

(function() {
	var LOG = null;
	Downsha.PageInfoScript = function PageInfoScript(win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	Downsha.inherit(Downsha.PageInfoScript, Downsha.AbstractStyleScript);
	Downsha.PageInfoScript._instance = null;
	Downsha.PageInfoScript.getInstance = function() {
		if (!this._instance) {
			this._instance = new Downsha.PageInfoScript();
		}
		return this._instance;
	};
	Downsha.PageInfoScript.removeInstance = function() {
		this._instance = null;
	};
	
	Downsha.PageInfoScript.prototype.window = null;
  Downsha.PageInfoScript.prototype._sema = null;
  Downsha.PageInfoScript.prototype._articleRules = null;
	
	Downsha.PageInfoScript.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		Downsha.PageInfoScript.parent.initialize.apply(this, []);
		
    this._sema = Downsha.Semaphore.mutex();
    this.fetchArticleRules();
    this.__defineGetter__("articleRules", this.getArticleRules);
	};
	
  Downsha.PageInfoScript.prototype.getArticleRules = function() {
  	return this._articleRules;
  };
  Downsha.PageInfoScript.prototype.fetchArticleRules = function() {
  	LOG.debug("PageInfoScript.fetchArticleRules");
  	
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
  
  Downsha.PageInfoScript.prototype.profile = function() {
  	var self = this;
  	this._sema.critical(function() {
  		self._profile();
  		self._sema.signal();
  	});
  };
  
	Downsha.PageInfoScript.prototype._profile = function() {
		LOG.debug("PageInfoScript._profile");
		this.profilePage();
		this.profileSelection();
		this.profileArticle();
		this.notifyWithPageInfo();
	};
	Downsha.PageInfoScript.prototype.profilePage = function() {
		this.documentWidth = Downsha.Utils.getDocumentWidth(this.window.document);
		this.documentHeight = Downsha.Utils.getDocumentHeight(this.window.document);

		this.documentLength = 0;
		try {
			this.documentLength = this.window.document.body.textContent.length; // get content text length of document
		} catch(e) {
			LOG.warn("Could not determine document's text length");
		}
		this.containsImages = false;
		try {
			var imageTags = this.window.document.getElementsByTagName("IMG"); // determine whether there is image in document
			if (imageTags && imageTags.length > 0) {
				this.containsImages = true;
			}
		} catch(e) {
			LOG.warn("Could not determine whether document contains images");
		}
	};
	Downsha.PageInfoScript.prototype.profileSelection = function() {
		LOG.debug("PageInfoScript.profileSelection");
		var selectionFinder = new Downsha.SelectionFinder(this.window.document);
		selectionFinder.find(true);
		this.selection = (selectionFinder.hasSelection()) ? true : false; // determine whether there is selection in document
	};
	Downsha.PageInfoScript.prototype.profileArticle = function() {
		LOG.debug("PageInfoScript.profileArticle");
		var articleNode = Downsha.Utils.getArticleNode(this.window.document, this.articleRules);
		if (articleNode) {
			this.article = true;
			var articleBoundingClientRect = Downsha.Utils.getAbsoluteBoundingClientRect(articleNode);
			if (articleBoundingClientRect) {
				this.articleBoundingClientRect = articleBoundingClientRect; // get bounding rectangle of article
			}
		}
	};
	Downsha.PageInfoScript.prototype.notifyWithPageInfo = function() { // notify popup page to receive profile information
		LOG.debug(this.toString());
		chrome.extension.sendRequest(new Downsha.RequestMessage(Downsha.Constants.RequestType.PAGE_INFO, {pageInfo : this}));
	};
	Downsha.PageInfoScript.prototype.toJSON = function() {
		return {
			documentWidth : this.documentWidth,
			documentHeight : this.documentHeight,
			documentLength : this.documentLength,
			containsImages : this.containsImages,
			selection : this.selection,
			article : this.article,
			articleBoundingClientRect : this.articleBoundingClientRect
		};
	};
	Downsha.PageInfoScript.prototype.toString = function() {
	  return "PageInfoScript [document] " + this.documentWidth + "*" + this.documentHeight + 
	  	" length: " + this.documentLength + " contain image: " + this.containsImages + 
	  	" [selection] " + (this.selection ? "yes" : "no") + 
	  	" [article] " + (this.article ? this.articleBoundingClientRect.width + "*" + this.articleBoundingClientRect.height : "no");
	};	
})();
