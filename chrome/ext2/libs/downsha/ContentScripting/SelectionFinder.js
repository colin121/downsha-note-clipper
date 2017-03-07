/**
 * @author: chenmin
 * @date: 2011-09-29
 * @desc: Downsha.SelectionFinder
 * Downsha.SelectionFinder provides mechanism for finding selection on the page
 * via find(). It is able to traverse frames in order to find a selection. It
 * will report whether there's a selection via hasSelection(). After doing
 * find(), the selection is stored in the selection property, and the document
 * property will contain the document in which the selection was found. Find
 * method will only recurse documents if it was invoked as find(true),
 * specifying to do recursive search. You can use reset() to undo find().
 */
(function() {
  var LOG = null;
  var logEnabled = false;

  Downsha.SelectionFinder = function SelectionFinder(document) {
    this.initDocument = document;
    this.document = document;
    LOG = Downsha.Logger.getInstance();
    if (LOG.level == Downsha.Logger.LOG_LEVEL_DEBUG) {
      logEnabled = true;
    }
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
    	(range.startContainer == range.endContainer && range.startOffset != range.endOffset))) {
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
  Downsha.SelectionFinder.prototype.getCommonAncestorContainer = function() {
    var range = this.getRange();
    if (range && range.commonAncestorContainer) {
      var p = range.commonAncestorContainer;
      while (p && p.nodeType != Node.ELEMENT_NODE) {
        p = p.parentElement;
      }
      return p;
    }
    return null;
  };
  Downsha.SelectionFinder.prototype._findSelectionInDocument = function(doc,
      deep) {
    var sel = null;
    if (typeof doc.getSelection == 'function') {
      sel = doc.getSelection();
    } else if (doc.selection && typeof doc.selection.createRange == 'function') {
      sel = doc.selection.createRange();
    }
    if (sel && sel.rangeCount == 0 && deep) {
      var documents = Downsha.Utils.findDocuments(doc);
      if (documents.length > 0) {
      	if (logEnabled) {
      		LOG.debug("find selection range empty, trying frames, count: " + documents.length);
      	}
        for (var i = 0; i < documents.length; i++) {
          if (documents[i]) {
            if (logEnabled) {
            	LOG.debug("trying nested doc: " + documents[i]);
            }
            var framedSel = this._findSelectionInDocument(documents[i], deep);
            if (framedSel.selection.rangeCount > 0) {
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