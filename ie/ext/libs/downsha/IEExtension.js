/**
 * @author: chenmin
 * @date: 2011-10-18
 * @desc: ie extension manager is the core module of the extension.
 * 1. handles all the events defined by the ie extension api
 * 2. handles all the events defined by internal program
 * 3. provides utilities of clipper and previewer.
 */

(function() {
  Downsha.getIEExtension = function(win) { // make Downsha.ieExtension object single and global
    if (!Downsha.ieExtension) {
        Downsha.ieExtension = new Downsha.IEExtension(win);
    }
    return Downsha.ieExtension;
  };

  Downsha.IEExtension = function IEExtension(win) {
    this.initialize(win);
  };
	
	Downsha.IEExtension.prototype.START_UP_DELAY_TIME = 50; // interval between context initialization and clip startup
	Downsha.IEExtension.prototype.CLIP_PROCESS_DELAY_TIME = 50; // interval between clip completion and submit to plugin
	Downsha.IEExtension.prototype.pluginVersion = 0; // plugin version
	Downsha.IEExtension.prototype.window = null; // window object
	Downsha.IEExtension.prototype.title = null; // document title
	Downsha.IEExtension.prototype.url = null; // document url
	Downsha.IEExtension.prototype.clipAction = null; // clip action
	Downsha.IEExtension.prototype.clipOptions = null; // clip options
	Downsha.IEExtension.prototype.supportCanvas = true; // determine whether support html5 canvas
  Downsha.IEExtension.prototype.pageinfo = null; // pageinfo object
  Downsha.IEExtension.prototype.previewer = null; // previewer object
  Downsha.IEExtension.prototype.clipper = null; // clipper object
  Downsha.IEExtension.prototype.selectionFinder = null; // SelectionFinder object
  Downsha.IEExtension.prototype.selectionContent = null; // selection content
  Downsha.IEExtension.prototype.popup = null; // popup object

  Downsha.IEExtension.prototype.initialize = function(win) {
  	LOG.debug("-------- DOWNSHA STARTING ------------");
  	LOG.debug("IEExtension.initialize");
  	this.window = (win) ? win : window;
  	this.title = this.window.document.title;
  	this.url = (this.window.document.URL) ? this.window.document.URL : this.window.document.location.href;
  	this.initContext();
  	//var self = this;
  	//this.window.setTimeout(function() {self.startUp();}, this.START_UP_DELAY_TIME);
  };
  Downsha.IEExtension.prototype.initContext = function() {
  	LOG.debug("IEExtension.initContext");
		/**
		 * Since IE does not define the Node interface constants, 
		 * which let you easily identify the type of node, one of the first things 
		 * to do in a DOM script for the Web is to make sure you define one yourself, if it's missing.
		 */
		if (!window['Node']) {
		  window.Node = new Object();
		}
		if (!Node.ELEMENT_NODE)                Node.ELEMENT_NODE                = 1;
		if (!Node.ATTRIBUTE_NODE)              Node.ATTRIBUTE_NODE              = 2;
		if (!Node.TEXT_NODE)                   Node.TEXT_NODE                   = 3;
		if (!Node.CDATA_SECTION_NODE)          Node.CDATA_SECTION_NODE          = 4;
		if (!Node.ENTITY_REFERENCE_NODE)       Node.ENTITY_REFERENCE_NODE       = 5;
		if (!Node.ENTITY_NODE)                 Node.ENTITY_NODE                 = 6;
		if (!Node.PROCESSING_INSTRUCTION_NODE) Node.PROCESSING_INSTRUCTION_NODE = 7;
		if (!Node.COMMENT_NODE)                Node.COMMENT_NODE                = 8;
		if (!Node.DOCUMENT_NODE)               Node.DOCUMENT_NODE               = 9;
		if (!Node.DOCUMENT_TYPE_NODE)          Node.DOCUMENT_TYPE_NODE          = 10;
		if (!Node.DOCUMENT_FRAGMENT_NODE)      Node.DOCUMENT_FRAGMENT_NODE      = 11;
		if (!Node.NOTATION_NODE)               Node.NOTATION_NODE               = 12;
		
		/**
		 * Since IE doesn't support indexOf method to the Array natively.
		 * we need to implement it at the beginning.
		 */
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(elt /*, from*/) {
				var len = this.length;
				var from = Number(arguments[1]) || 0;
				from = (from < 0) ? Math.ceil(from) : Math.floor(from);
				if (from < 0) {
					from += len;
				}
				
				for (; from < len; from++) {
					if (from in this && this[from] === elt) {
						return from;
					}
				}
				return -1;
			};
		}
		
		/**
		 * IE doesn't support trim method of String object until version 9.
		 * we need to implement it at the beginning.
		 */
		if (!String.prototype.trim) {
			String.prototype.trim = function() {
				return this.replace(/^[\s]+/, '').replace(/[\s]+$/, '');
			};
		}
		
		// feature detect: html5 canvas, theorectically IE 9 will pass this test.
		var canvas = this.window.document.createElement("CANVAS");
		if (canvas && canvas.getContext) {
			this.supportCanvas = true;
			LOG.debug("IEExtension.initContext html5 canvas support");
		} else {
			this.supportCanvas = false;
			LOG.debug("IEExtension.initContext html5 canvas not support");
		}
  };
  Downsha.IEExtension.prototype.destroy = function() {
    LOG.debug("IEExtension.destroy");
    LOG.debug("-------- DOWNSHA TERMINTATING --------");
  };
  Downsha.IEExtension.prototype.startUp = function() {
    LOG.debug("IEExtension.startUp title: " + this.title + " url: " + this.url);
    
    /**
     * let's detect plugin version at first
     */    
    this.getPluginVersion();
    /**
     * let's detect page information here so we can decide clip options.
     */
		this.clipOptions = [];
		this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_URL);
		this.clipAction = Downsha.Constants.CLIP_ACTION_URL;
		if (!Downsha.Utils.isForbiddenUrl(this.url)) {
			this.getPageInfo().profile();
			if (this.getPageInfo().documentLength > 0 || this.getPageInfo().containsImages) {
				this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_FULL_PAGE);
				this.clipAction = Downsha.Constants.CLIP_ACTION_FULL_PAGE;
			}
			if (this.getPageInfo().article && this.isArticleSane()) {
				this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_ARTICLE);
				this.clipAction = Downsha.Constants.CLIP_ACTION_ARTICLE;
			}
			if (this.getPageInfo().selection && this.isSelectionSane()) {
				this.clipOptions.unshift(Downsha.Constants.CLIP_ACTION_SELECTION);
				this.clipAction = Downsha.Constants.CLIP_ACTION_SELECTION;
			}
		}
    /**
     * let's show popup dialog for user interactive here.
     */
		var obj = {
			pluginVersion : this.pluginVersion,
			title : this.title,
			url : this.url,
			clipAction : this.clipAction,
			clipOptions : this.clipOptions
		};
		this.getPopup().openPopup(obj);
  };
  Downsha.IEExtension.prototype.isSelectionSane = function() {
  	var clip = new Downsha.Clip(this.window, this.stylingStrategy, Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX);
  	if (clip.clipSelection()) this.selectionContent = clip.content; // preseve selection content at first
  	if (!this.selectionContent || this.selectionContent.length == 0) return false;
  	return true;
  };
  Downsha.IEExtension.prototype.isArticleSane = function() {
    if (this.getPageInfo().articleBoundingClientRect) {
	    var pageArea = Math.round(this.getPageInfo().documentWidth * this.getPageInfo().documentHeight);
	    var articleArea = Math.round(this.getPageInfo().articleBoundingClientRect.width * 
	    	this.getPageInfo().articleBoundingClientRect.height);
	    var articleRatio = Math.round((pageArea > 0) ? (articleArea * 100 / pageArea) : 0);
	    LOG.debug("IEExtension.isArticleSane PageArea: " + pageArea + " ArticleArea: " + articleArea + " Ratio: " + articleRatio + "%");
    	return Downsha.Utils.isArticleSane(
    		this.getPageInfo().documentWidth, 
    		this.getPageInfo().documentHeight, 
    		this.getPageInfo().articleBoundingClientRect);
    }
    return false;
  };
  Downsha.IEExtension.prototype.getClipper = function() {
  	if (!this.clipper) {
  		this.clipper = new Downsha.ContentClipper(this.window, this);
  	}
  	return this.clipper;
  };
  Downsha.IEExtension.prototype.getPreviewer = function() {
  	if (!this.previewer) {
  		this.previewer = new Downsha.ContentPreviewScript(this.window, this.supportCanvas);
  	}
  	return this.previewer;
  };
  Downsha.IEExtension.prototype.getPageInfo = function() {
  	if (!this.pageinfo) {
  		this.pageinfo = new Downsha.PageInfoScript(this.window);
  	}
  	return this.pageinfo;
  };
  Downsha.IEExtension.prototype.getSelectionFinder = function() {
  	if (!this.selectionFinder) {
  		this.selectionFinder = new Downsha.SelectionFinder(this.window.document);
  	}
  	return this.selectionFinder;
  };  
  Downsha.IEExtension.prototype.getPopup = function() {
  	if (!this.popup) {
  		this.popup = new Downsha.Popup(this.window);
  	}
  	return this.popup;
  };
  Downsha.IEExtension.prototype.handlePageClipSuccess = function(clip) {
    LOG.debug("IEExtension.handlePageClipSuccess");
    var self = Downsha.getIEExtension();
    var clipNote = clip;
    clipNote.created = new Date().getTime();

    var contentLength = (clipNote && clipNote.content) ? clipNote.content.length : 0;
    LOG.debug("Clipped note's content length: " + contentLength);
    if (contentLength == 0) {
    	var msg = Downsha.i18n.getMessage("fullPageClipEmpty");
    	alert(msg);
    } else {
	    self.window.setTimeout(function() {
		    // *** send clip note to process
		    self.processClip(clipNote);
		    
		    // TODO show clip content in a new window
		    //self.window.document.body.innerHTML = clipNote.content;
		  }, self.CLIP_PROCESS_DELAY_TIME);    	
    }
  };
  Downsha.IEExtension.prototype.handlePageClipTooBig = function(clip) {
    LOG.debug("IEExtension.handlePageClipTooBig");
    var msg = Downsha.i18n.getMessage("fullPageClipTooBig");
    alert(msg);
  };
  Downsha.IEExtension.prototype.handlePageClipFailure = function(error) {
    LOG.debug("IEExtension.handlePageClipFailure");
    if (typeof error == "string" && error.length > 0) {
    	var msg = error;
    } else {
    	var msg = Downsha.i18n.getMessage("fullPageClipFailure");
    }
    alert(msg);
  };
  Downsha.IEExtension.prototype.previewSelection = function() {
    LOG.debug("IEExtension.previewSelection");
    this.getPreviewer().previewSelection();
  };
  Downsha.IEExtension.prototype.previewFullPage = function() {
    LOG.debug("IEExtension.previewFullPage");
    this.getPreviewer().previewFullPage();
  };
  Downsha.IEExtension.prototype.previewArticle = function() {
    LOG.debug("IEExtension.previewArticle");
    this.getPreviewer().previewArticle(false);
  };
  Downsha.IEExtension.prototype.previewUrl = function() {
    LOG.debug("IEExtension.previewUrl");
    this.getPreviewer().previewUrl(this.title, this.url, null);
  };
  Downsha.IEExtension.prototype.previewNudge = function(direction) {
    LOG.debug("IEExtension.previewNudge");
    this.getPreviewer().previewNudge(direction); // nudge direction: expand/shrink/previous/next
  };
  Downsha.IEExtension.prototype.previewClear = function() {
    LOG.debug("IEExtension.previewClear");
    this.getPreviewer().clear();
  };
  Downsha.IEExtension.prototype.clipPage = function(fullPage, attrs) { // for conext menu - clip selection/article/page
    LOG.debug("IEExtension.clipPage");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().perform(fullPage, {}, true);
  };
  Downsha.IEExtension.prototype.clipFullPage = function(attrs) { // for browser icon - clip full page
    LOG.debug("IEExtension.clipFullPage");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().clipFullPage(attrs, true);
  };
  Downsha.IEExtension.prototype.clipSelection = function(attrs) { // for context menu and browser icon - clip selection
    LOG.debug("IEExtension.clipSelection");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().clipSelection(attrs, true);
  };
  Downsha.IEExtension.prototype.clipArticle = function(attrs) {
    LOG.debug("IEExtension.clipArticle");
    if (Downsha.Utils.isForbiddenUrl(this.url)) {
      alert(Downsha.i18n.getMessage("illegalUrlClipFailure"));
      return;
    }
    this.getClipper().clipArticle(attrs, true);
  };
  Downsha.IEExtension.prototype.clipUrl = function(attrs) {
    LOG.debug("IEExtension.clipUrl");
    this.getClipper().clipUrl(attrs, true);
    /*
    var clip = {
    	url : this.url,
    	title : this.title,
    	content : Downsha.Utils.createUrlClipContent(this.title, this.url)
    };
    this.handlePageClipSuccess(clip);
    */
  };
  Downsha.IEExtension.prototype.processClip = function(clip) {
    LOG.debug("IEExtension.processClip");
    if ((typeof clip == "object") && (clip != null)) {
	    /**
	     * since we have arrived here, now we should hand over clip data to
	     * ActiveX object. ActiveX object will get cache data for inner images 
	     * from local file system. after cache, ActiveX object should send clip 
	     * data to remote servers and notify result to our scripts.
	     */
			try {
				if (!downshaClipper) {
					var downshaClipper = new ActiveXObject("DownshaIE.Clipper.1");
				}
				if (downshaClipper) {
					downshaClipper.AddClip(
					(clip.content) ? clip.content : "", 
					(clip.title) ? clip.title : "", 
					(clip.url) ? clip.url : "", 
					Downsha.Platform.getUserAgent());
				}
			} catch (e) {
				LOG.warn("IEExtension.processClip exception");
				LOG.dir(e);
			}
		}
  };
  Downsha.IEExtension.prototype.getPluginVersion = function() {
    /**
     * we're tring to get version from our plugin API.
     * If failed, we should notify users to activate our plugin at first use.
     */
		try {
			if (!downshaClipper) {
				var downshaClipper = new ActiveXObject("DownshaIE.Clipper.1");
			}
			if (downshaClipper) {
				this.pluginVersion = downshaClipper.GetVersion();
			}
		} catch (e) {
			this.pluginVersion = 0;
			LOG.warn("IEExtension.getVersion exception");
			LOG.dir(e);
		}
		LOG.debug("IEExtension.getPluginVersion " + this.pluginVersion);
  };
})();
