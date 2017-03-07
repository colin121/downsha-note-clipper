/**
 * @author: chenmin
 * @date: 2011-10-23
 * @desc: content clip script for FullPage/Selection/Article/URL
 * ContentClipper call Clip ojbect to perform clip action
 * ContentClipper also shows clipping wait icon and text while start clipping
 */

(function() {
  Downsha.ContentClipper = function ContentClipper(win, notifier, stylingStrategy) {
    this.initialize(win, notifier, stylingStrategy);
  };
  Downsha.inherit(Downsha.ContentClipper, Downsha.AbstractStyleScript);

  Downsha.ContentClipper.prototype.window = null;
  Downsha.ContentClipper.prototype.notifier = null;
  Downsha.ContentClipper.prototype.stylingStrategy = null;
  Downsha.ContentClipper.prototype.WAIT_CONTAINER_ID = "downshaContentClipperWait"; // show clipping status
	Downsha.ContentClipper.prototype.CLIP_WAIT_DELAY_TIME = 50;
	Downsha.ContentClipper.prototype.CLIP_SUCCESS_DELAY_TIME = 2000;
  Downsha.ContentClipper.prototype.clip = null; // Downsha.Clip object
  Downsha.ContentClipper.prototype.article = null;
  Downsha.ContentClipper.prototype.initialStyleSheetUrls = [{
  	id : "downshaClipperCSSCode",
		code : "/* css code for downsha clipper */" +	
			"#downshaContentClipperWait{" + 
			((Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) ? 
			"  position: absolute;" : // for IE 6 and quirks mode, cuz IE 6 and quirks mode doesn't recognize fixed
			"	 position: fixed;") + // for IE 7/8/9, fixed position relative to screen
			((Downsha.Platform.getIEVersion() <= 9) ? // at the top of all layers
			"	 z-index: 2147483647;" : 
			"	 z-index: 9999999999999999;") + 
			"	 padding: 0;" + 
			"	 margin: 0;" + 
			"	 left: 50%;" +  // horizontal center
			"	 top: 50%;" +  // vertical center
			"  width: 120px;" + // TODO IE 6/7 doesn't show div until specify width and height
			"  height: 40px;" + 
			"  filter: alpha(opacity=70)" + // transparent value
			"	 display: block;" + 
			"  font-family: Simsun, Arial Narrow, HELVETICA;" + // general font
			"}" + 
			"#downshaContentClipperWait *{" + 
			"	 display: block!important;" + 
			"}" + 
			"#downshaContentClipperWaitContent{" + 
			"	 background: black;" + 
			"	 color: white;" +  // content text color
			"  width: 120px;" + 
			"  height: 20px;" + 
			"	 padding: 10px 5px;" + 
			"	 border-radius: 5px;" + // border-radius works for IE 9
			"	 font-size: 16px;" + // content font size
			"}" + 
			"#downshaContentClipperWaitText{" + 
			"	 margin: 0;" + 
			"	 padding: 0;" + 
			"	 float: none;" + 
			"	 display: inline;" + 
			"	 letter-spacing: 1pt;" + 
			"	 line-height: 18px;" + 
			"  white-space: nowrap;" + 
			"  text-overflow: ellipsis;" + 
			"  text-align: center;" + 			
			"}" + 
			"#downshaContentClipperWait img{" + 
			"	 display: inline;" + 
			"	 float: left;" + 
			"	 margin: 0 0 0 4px;" + 
			"	 padding: 0;" + 
			"	 border: none;" + 
			"}"
  }];

  Downsha.ContentClipper.prototype.initialize = function(win, notifier, stylingStrategy) {
  	LOG.debug("ContentClipper.initialize");
    this.window = (win) ? win : window;
    this.notifier = (notifier) ? notifier : null;
    this.stylingStrategy = (stylingStrategy) ? stylingStrategy : Downsha.ClipFullStylingStrategy;
    Downsha.ContentClipper.parent.initialize.apply(this, [win]);
  };
	Downsha.ContentClipper.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	
  Downsha.ContentClipper.prototype.onClip = function(clip) {
  };
  Downsha.ContentClipper.prototype.onClipContent = function(clip) {
  	if (this.notifier) {
  		this.notifier.handlePageClipSuccess(clip.toDataObject());
  	}
  };
  Downsha.ContentClipper.prototype.onClipFailure = function(error) {
  	if (this.notifier) {
  		this.notifier.handlePageClipFailure(error);
  	}
  };
  Downsha.ContentClipper.prototype.onClipContentFailure = function(error) {
  	if (this.notifier) {
  		this.notifier.handlePageClipFailure(error);
  	}
  };
  Downsha.ContentClipper.prototype.onClipContentTooBig = function(clip) {
  	if (this.notifier) {
  		this.notifier.handlePageClipTooBig(clip.toDataObject());
  	}
  };
  
  Downsha.ContentClipper.prototype.doClip = function(fn, showWait) {
    var self = this;
    if (showWait) {
      this.showWaiter();
      this.window.setTimeout(function() {
      	fn();
      	self.showSuccess();
      }, self.CLIP_WAIT_DELAY_TIME);
    } else {
    	fn();
    }
  };

  Downsha.ContentClipper.prototype.perform = function(fullPageOnly, showWait) {
    var self = this;
    this.doClip(function() {
      self._perform(fullPageOnly);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipSelection = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipSelection");
    var self = this;
    this.doClip(function() {
      self._clipSelection(attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipFullPage = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipFullPage");
    var self = this;
    this.doClip(function() {
      self._clipFullPage(attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.clipArticle = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipArticle");
    var self = this;
    this.doClip(function() {
      self._clipArticle(attrs);
    }, showWait);
  };
  
  Downsha.ContentClipper.prototype.clipUrl = function(attrs, showWait) {
    LOG.debug("ContentClipper.clipUrl");
    var self = this;
    this.doClip(function() {
      self._clipUrl(attrs);
    }, showWait);
  };

  Downsha.ContentClipper.prototype.getArticleElement = function() {
  	// check if article was remembered
  	var articleNode = Downsha.getIEExtension().getPreviewer().getRememberedPreview();
  	if (articleNode) {
  		return articleNode;
  	}
	  
    // check if article can be extracted now
    if (this.getArticle()) {
    	var resNode = this.getArticle().content.asNode();
    	if (resNode) {
    		Downsha.getIEExtension().getPreviewer().rememberPreview(resNode);
    		return resNode;
    	}
    }
    return null;
  };

  Downsha.ContentClipper.prototype.getArticle = function() {
    if (!this.article) {
      var ex = new ExtractContentJS.LayeredExtractor();
      ex.addHandler(ex.factory.getHandler('Heuristics'));
      var res = ex.extract(this.window.document);
      if (res.isSuccess) {
        this.article = res;
      }
    }
    return this.article;
  };

  Downsha.ContentClipper.prototype._clipSelection = function(attrs) {
    LOG.debug("ContentClipper._clipSelection");
    this._perform(false, attrs);
  };

  Downsha.ContentClipper.prototype._clipFullPage = function(attrs) {
    LOG.debug("ContentClipper._clipFullPage");
    this._perform(true, attrs);
  };

  Downsha.ContentClipper.prototype._clipArticle = function(attrs) {
    LOG.debug("ContentClipper._clipArticle");
    this.createClipObject(); // construct Downsha.Clip
    var el = this.getArticleElement();
    LOG.debug("Article element: " + el);

    try {
      if (el && this.clip.clipElement(el)) { // clip article element
        this._overloadClipNote(this.clip, attrs);
        LOG.debug("Successful clip of element's contents: " + this.clip.toString());
        LOG.dir(this.clip.toDataObject());

        if (this.clip.sizeExceeded
            || this.clip.length >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
          LOG.debug("ContentClipper._clipArticle clip content too big");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else {
        LOG.debug("ContentClipper._clipArticle clip failure");
        this.onClipFailure(Downsha.i18n.getMessage("articleClipFailure"));
      }
    } catch (e) {
    	LOG.warn("ContentClipper._clipArticle clip exception" 
    		+ ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
  };
  
  Downsha.ContentClipper.prototype._clipUrl = function(attrs) {
    LOG.debug("ContentClipper._clipUrl");
    this.createClipObject(); // construct Downsha.Clip
    this.clip.clipUrl();
    this._overloadClipNote(this.clip, attrs);
    this.onClipContent(this.clip);
  };

  Downsha.ContentClipper.prototype._overloadClipNote = function(note, attrs) {
    if (note && attrs) {
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

  Downsha.ContentClipper.prototype.createClipObject = function() {
    var self = this;
    this.clip = new Downsha.Clip(this.window, this.stylingStrategy,
    	Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX);
    // comment following code to avoid double call to onClipContentTooBig
    /*
    this.clip.onsizeexceed = function() {
      LOG.debug("Content size exceeded during serialization");
      self.onClipContentTooBig(self.clip);
    };
    */
    return this.clip;
  };

  Downsha.ContentClipper.prototype._perform = function(fullPageOnly, attrs) {
  	LOG.debug("ContentClipper._perform");
    var self = this;
    var articleEle = null;
    this.createClipObject(); // construct Downsha.Clip

    try {
      if (!fullPageOnly && this.clip.hasSelection() //*** clip selection if anything selected
      	//&& this.clip.clipSelection()) { // TODO
      	&& Downsha.getIEExtension().selectionContent) { // get selection content from preseved
      	this.clip.content = Downsha.getIEExtension().selectionContent;
        this._overloadClipNote(this.clip, attrs);
        LOG.debug("Successful clip of selection: " + this.clip.toString());
        
        if (this.clip.sizeExceeded || this.clip.getLength() >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
          LOG.debug("ContentClipper._perform clip content too big");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (!fullPageOnly && this.getArticle() //*** clip article if found
      	&& (articleEle = this.getArticle().content.asNode())
      	&& Downsha.Utils.isArticleSane( //*** call isArticleSane to determine whethe article makes sense
    		Downsha.Utils.getDocumentWidth(this.window.document), // these data have been collected by page info scripts
    		Downsha.Utils.getDocumentHeight(this.window.document), 
    		Downsha.Utils.getAbsoluteBoundingClientRect(articleEle))
    		// TODO article clip without preview might cause error!
    		// http://www.chinanews.com/gn/2011/10-12/3384268.shtml
    		// http://pic.news.sohu.com/group-295904.shtml#0
    		&& this.clip.clipElement(articleEle)) {
       this._overloadClipNote(this.clip, attrs);
       LOG.debug("Successful clip of element's contents: " + this.clip.toString());
       LOG.dir(this.clip.toDataObject());
        if (this.clip.sizeExceeded || this.clip.getLength() >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
          LOG.debug("ContentClipper._perform clip content too big");
          this.onClipContentTooBig(this.clip);
        } else {
          this.onClipContent(this.clip);
        }
      } else if (this.clip.hasBody()) { //*** otherwise, clip body part
        this._overloadClipNote(this.clip, attrs);
        this.onClip(this.clip);
        LOG.debug("Successful clip of full page: " + this.clip.toString());
        if (this.clip.clipBody()) { // clip body
          if (this.clip.sizeExceeded || this.clip.getLength() >= (Downsha.Constants.CLIP_NOTE_CONTENT_LEN_MAX)) {
            LOG.debug("ContentClipper._perform clip content too big");
            this.onClipContentTooBig(this.clip);
          } else {
            this.onClipContent(this.clip);
          }
        } else {
          this.onClipContentFailure(Downsha.i18n.getMessage("fullPageClipFailure"));
        }
      } else {
        LOG.debug("ContentClipper._perform clip failure");
        this.onClipFailure(Downsha.i18n.getMessage("fullPageClipFailure"));
      }
    } catch (e) {
      // Can't construct a clip -- usually because the body is a frame
    	LOG.warn("ContentClipper._perform clip exception" 
    		+ ((typeof e.message != 'undefined') ? ": " + e.message : ""));
      this.onClipFailure(e.message);
    }
  };
  Downsha.ContentClipper.prototype.showWaiter = function() {
    var waiter = this.window.document.getElementById(this.WAIT_CONTAINER_ID);
    if (!waiter) {
      waiter = this.window.document.createElement("DOWNSHADIV");
      waiter.id = this.WAIT_CONTAINER_ID;
      
      var content = this.window.document.createElement("DIV");
      content.id = this.WAIT_CONTAINER_ID + "Content";
      waiter.appendChild(content);
      
      var spinner = this.window.document.createElement("IMG");
      if (Downsha.Platform.getIEVersion() <= 7) {
      	spinner.src = Downsha.Constants.SERVICE_PATH + "popup_scissors.png";
      } else {
      	spinner.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAASCAYAAABb0P4QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDQzQxMTI5NjBCMjA2ODExOTJCMDlEMzVEQTgyNzdBQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozRDYwMkQ1QzUwQjkxMUUwODE3NjkwQkEzNEM0QTBCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozRDYwMkQ1QjUwQjkxMUUwODE3NjkwQkEzNEM0QTBCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkNDNDExMjk2MEIyMDY4MTE5MkIwOUQzNURBODI3N0FCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkNDNDExMjk2MEIyMDY4MTE5MkIwOUQzNURBODI3N0FCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+FZ9gRgAAAaVJREFUeNqc1EsoBVEcx/HjlldIFsgjskDJSpHcBXksbpZ2lELqpuysFBvJhoVigbCgpLxioZCyQ8mjbLzqJhRlJe+M78l/cppmLt1Tn6mZOed3zsz/dJRlWbHoxSnOMYcCqEjoy6CE1aMM07hAfiSBUVwulVINOFK/bRUPaFN/t0oEUIITnXqFQsdMzQghLsxqirGEL+unHaJCyT/bRKbReVQ61bkEJaEbj9ZvG0aC/Q/TJfAMi9gxOm4gxQjTE+wb7+/R4iyK5kMAQ1jAMl5kUIVMOoJ3I+wApW5V9tKJJvmfN0aQDh13rPxfgXZxLtEnYbeo+mvbeG2HFBwiEXtIQydi5P7NdZTHTD5jVXpbjKEIM/JsBVnhPjkejZiSim/jGa8ISp9Subeb3hU1boHZ2JWqTcpmtduIY0A5toz3T+hyBuotMo9k48WADPC7fJY+TDpwbQTPItUO1FXMcQxqlE+KDlPRXEzgTUL1BNU+6vKJDEetWrGOjzCHQgjt8KMH+8jTM/XIOahXVYs1HHtV8T/HVxTJQTQhVvZYP+5UBO1bgAEAm6y67c0PYd4AAAAASUVORK5CYII=";
      }
      content.appendChild(spinner);
      
      var text = this.window.document.createElement("SPAN");
      text.id = this.WAIT_CONTAINER_ID + "Text";
      text.innerHTML = Downsha.i18n.getMessage("clipper_clipping");
      content.appendChild(text);
      this.window.document.body.appendChild(waiter);
    }
  };
  Downsha.ContentClipper.prototype.showSuccess = function() {
  	var self = this;
    var waiter = this.window.document.getElementById(this.WAIT_CONTAINER_ID);
    if (waiter) {
    	var text = this.window.document.getElementById(this.WAIT_CONTAINER_ID + "Text");
    	if (text) {
    		text.innerHTML = Downsha.i18n.getMessage("clipper_clipped");
    	}
    }
    this.window.setTimeout(function() {
      	self.clearWaiter();
      }, self.CLIP_SUCCESS_DELAY_TIME);    
  };  
  Downsha.ContentClipper.prototype.clearWaiter = function() {
    var waiter = this.window.document.getElementById(this.WAIT_CONTAINER_ID);
    if (waiter && waiter.parentNode) {
    	waiter.parentNode.removeChild(waiter);
    }
  };
})();
