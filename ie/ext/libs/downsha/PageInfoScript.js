/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: profile web page document (page/selection/article)
 */

(function() {
	Downsha.PageInfoScript = function PageInfoScript(win) {
		this.initialize(win);
	};
	Downsha.inherit(Downsha.PageInfoScript, Downsha.AbstractStyleScript);

	Downsha.PageInfoScript.prototype.window = null;
	Downsha.PageInfoScript.prototype.initialize = function(win) {
		this.window = (win) ? win : window;
		Downsha.PageInfoScript.parent.initialize.apply(this, [win]);
	};
	Downsha.PageInfoScript.prototype.profile = function() {
		LOG.debug("PageInfoScript.profile");
		this.profilePage();
		this.profileSelection();
		this.profileArticle();
		LOG.debug(this.toString());
	};
	Downsha.PageInfoScript.prototype.profilePage = function() {
		LOG.debug("PageInfoScript.profilePage");
		this.documentWidth = Downsha.Utils.getDocumentWidth(this.window.document);
		this.documentHeight = Downsha.Utils.getDocumentHeight(this.window.document);
		
		this.documentLength = 0;
		try {
			this.documentLength = this.window.document.body.innerText.length; // use document.body.innerText, NOT textContent
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
		try {
			var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
			selectionFinder.find(true); // only check one time at initial state
			this.selection = (selectionFinder.hasSelection()) ? true : false; // determine whether there is selection in document
		} catch(e) {
			LOG.warn("Could not determine whether document contains selection");
			this.selection = false;
		}
	};
	Downsha.PageInfoScript.prototype.profileArticle = function() {
		LOG.debug("PageInfoScript.profileArticle");
		try {
			var extractor = new ExtractContentJS.LayeredExtractor();
			extractor.addHandler(extractor.factory.getHandler("Heuristics"));
			var extractRes = extractor.extract(this.window.document);
			if (extractRes.isSuccess) {
				this.article = extractRes.content.asText(); // get content text of article
				this.articleNode = extractRes.content.asNode();
				if (this.articleNode) {
					var articleBoundingClientRect = Downsha.Utils.getAbsoluteBoundingClientRect(this.articleNode, this.window);
					if (articleBoundingClientRect) {
						this.articleBoundingClientRect = articleBoundingClientRect; // get bounding rectangle of article
					}
				}
			}
		} catch(e) {
			LOG.warn("Could not determine whether document contains article");
		}
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
	  	" [article] " + (this.articleBoundingClientRect ? this.articleBoundingClientRect.width + "*" + this.articleBoundingClientRect.height : "no");
	};
})();
