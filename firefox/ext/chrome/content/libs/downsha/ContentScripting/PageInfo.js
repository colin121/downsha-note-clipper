/**
 * @author: chenmin
 * @date: 2011-09-06
 * @desc: get width and height of entire page and article bounding.
 * these values are used to decide whether article mode is sensible.
 */

(function() {
  var LOG = null;
	Downsha.PageInfo = function PageInfo(win) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(win);
	};
	
	Downsha.PageInfo.prototype.article = null;
	Downsha.PageInfo.prototype.articleBoundingClientRect = null;
	Downsha.PageInfo.prototype.documentWidth = null;
	Downsha.PageInfo.prototype.documentHeight = null;
	Downsha.PageInfo.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		this.profile();
	};
	Downsha.PageInfo.prototype.profile = function() {
		LOG.debug("PageInfo.profile");
		this.profilePage();
		this.profileSelection();
		this.profileArticle();
	};
	Downsha.PageInfo.prototype.profilePage = function() {
		LOG.debug("PageInfo.profilePage");
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
	Downsha.PageInfo.prototype.profileSelection = function() {
		LOG.debug("PageInfo.profileSelection");
		var selectionFinder = new Downsha.SelectionFinder(this.window.document);
		selectionFinder.find(true);
		this.selection = (selectionFinder.hasSelection()) ? true : false; // determine whether there is selection in document
	};
	Downsha.PageInfo.prototype.profileArticle = function() {
		LOG.debug("PageInfo.profileArticle");
		var e = new ExtractContentJS.LayeredExtractor();
		e.addHandler(e.factory.getHandler("Heuristics"));
		var d = e.extract(this.window.document);
		if (d.isSuccess) {
			var articleNode = d.content.asNode();
			if (articleNode) {
				LOG.debug("articleNode is " + articleNode);
				var clientRect = Downsha.Utils.getAbsoluteBoundingClientRect(articleNode.parentNode);
				if (clientRect) {
					this.articleBoundingClientRect = clientRect;
					this.article = d.content.asNode();
				}
			}
		}
	};
})();
