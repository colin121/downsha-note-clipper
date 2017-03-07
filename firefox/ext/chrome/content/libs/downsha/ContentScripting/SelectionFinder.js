/**
 * @author: chenmin
 * @date: 2011-09-04
 * @desc: Downsha.SelectionFinder
 * SelectionFinder provides mechanism for finding selection on the page via
 * find(). It is able to traverse frames in order to find a selection. It will
 * report whether there's a selection via hasSelection(). After doing find(),
 * the selection is stored in the selection property, and the document property
 * will contain the document in which the selection was found. Find method will
 * only recurse documents if it was invoked as find(true), specifying to do
 * recursive search. You can use reset() to undo find().
 */
(function() {
  var LOG = null;
	Downsha.SelectionFinder = function SelectionFinder(doc) {
		LOG = Downsha.Logger.getInstance();
		this.document = (doc) ? doc : document;
	  this.initDocument = this.document;
	};
	Downsha.SelectionFinder.prototype.initDocument = null;
	Downsha.SelectionFinder.prototype.document = null;
	Downsha.SelectionFinder.prototype.selection = null;
	
	Downsha.SelectionFinder.prototype.reset = function() {
	  this.document = this.initDocument;
	  this.selection = null;
	};
	Downsha.SelectionFinder.prototype.hasSelection = function() {
	  var range = this.getRange();
	  if (range && (range.startContainer != range.endContainer || 
	  	(range.startContainer == range.endContainer && 
	  	range.startOffset != range.endOffset))) {
	    return true;
	  }
	  return false;
	};
	Downsha.SelectionFinder.prototype.find = function(deep) {
	  var sel = this._findSelectionInDocument(this.document, deep);
	  this.document = sel.document;
	  this.selection = sel.selection;
	};
	Downsha.SelectionFinder.prototype.getRange = function() {
	  if (!this.selection || this.selection.rangeCount == 0) {
	    return null;
	  }
	  if (typeof this.selection.getRangeAt == 'function') {
	    return this.selection.getRangeAt(0);
	  } else {
	    var range = this.document.createRange();
	    range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
	    range.setEnd(this.selection.focusNode, this.selection.focusOffset);
	    return range;
	  }
	};
	Downsha.SelectionFinder.prototype._findSelectionInDocument = function(doc, deep) {
	  var sel = null;
	  var hasSelection = false;
	  var win = null;
	  try {
	    win = (doc.defaultView) ? doc.defaultView : window;
	  } catch (e) {
	    if (this._verboseLog) {
	      LOG.debug("Could not retrieve default view... using default window");
	    }
	    win = window;
	  }
	  if (typeof win.getSelection == 'function') {
	    sel = win.getSelection();
	    if (sel && typeof sel.rangeCount != 'undefined' && sel.rangeCount > 0) {
	      hasSelection = true;
	    }
	  } else if (win.selection && typeof win.selection.createRange == 'function') {
	    sel = win.selection.createRange();
	    if (typeof win.selection.type == 'Text' && typeof sel.htmlText == 'string' && sel.htmlText.length > 0) {
	      hasSelection = true;
	    }
	  } else if (doc.selection && doc.selection.createRange) {
	    sel = doc.selection.createRange();
	    if (typeof doc.selection.type == 'Text' && typeof sel.htmlText == 'string' && sel.htmlText.length > 0) {
	      hasSelection = true;
	    }
	  }
	  if (sel && !hasSelection && deep) {
	    var documents = Downsha.Utils.findDocuments(doc);
	    if (documents.length > 0) {
	    	if (this._verboseLog) {
	    		LOG.debug("find selection range empty, trying frames, count: " + documents.length);
	    	}
	      for (var i = 0; i < documents.length; i++) {
	        if (documents[i]) {
	          if (this._verboseLog) {
	          	LOG.debug("trying nested doc: " + documents[i]);
	          }
	          var framedSel = this._findSelectionInDocument(documents[i], deep);
	          if (framedSel && framedSel.selection && framedSel.selection.rangeCount > 0) {
	            return framedSel;
	          }
	        }
	      }
	    }
	  }
	  return {
	    document : doc,
	    selection : sel
	  };
	};
})();
