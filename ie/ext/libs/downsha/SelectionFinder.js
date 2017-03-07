/**
 * @author: chenmin
 * @date: 2011-10-17
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
  Downsha.SelectionFinder = function SelectionFinder(document) {
    this.initDocument = document;
    this.document = document;
  };
  Downsha.SelectionFinder.prototype.initDocument = null;
  Downsha.SelectionFinder.prototype.document = null;
  Downsha.SelectionFinder.prototype.selection = null;
  Downsha.SelectionFinder.prototype.text = null;

  Downsha.SelectionFinder.prototype.reset = function() {
    this.document = this.initDocument;
    this.selection = null;
    this.text = null;
  };
  Downsha.SelectionFinder.prototype.hasSelection = function() {
    var range = this.getRange();
    if (range && typeof range.startContainer != "undefined" && typeof range.endContainer != "undefined") {
    	if ((range.startContainer != range.endContainer) || 
    		(range.startContainer == range.endContainer && range.startOffset != range.endOffset)) {
    		return true;
    	} else {
    		return false;
    	}
    } else if (range) {
	    /**
	     * In IE 6/7/8, you cannot retrieve the elements and offsets 
	     * that define the start and end points of a TextRange object. 
	     * Instead, you can get the coordinates of the TextRange object's 
	     * start point with the offsetLeft and offsetTop properties.
	     */
      return true;
    }
    return false;
  };
  Downsha.SelectionFinder.prototype.find = function(deep) { // deep means recursive search in inner frames
    var sel = this._findSelectionInDocument(this.document, deep);
    this.document = sel.document;
    this.selection = sel.selection;
    this.text = sel.text;
  };
  Downsha.SelectionFinder.prototype.getRange = function() {
    if (!this.selection || !this.text || this.text.length == 0) {
      return null;
    }
    
    if (typeof this.selection.rangeCount != "undefined" && // for IE 9 
    	this.selection.rangeCount > 0) {
    	/**
    	 * Range object used by IE 9/Firefox/Chrome
			 * {
			 *   collapsed : false,
			 *   commonAncestorContainer : [object HTMLParagraphElement],
			 *   endContainer : [object HTMLParagraphElement],
			 *   endOffset : 15,
			 *   startContainer : [object HTMLParagraphElement],
			 *   startOffset : 0,
			 *   cloneContents :  function cloneContents() {     [native code] } ,
			 *   cloneRange :  function cloneRange() {     [native code] } ,
			 *   collapse :  function collapse() {     [native code] } ,
			 *   compareBoundaryPoints :  function compareBoundaryPoints() {     [native code] } ,
			 *   deleteContents :  function deleteContents() {     [native code] } ,
			 *   detach :  function detach() {     [native code] } ,
			 *   extractContents :  function extractContents() {     [native code] } ,
			 *   getBoundingClientRect :  function getBoundingClientRect() {     [native code] } ,
			 *   getClientRects :  function getClientRects() {     [native code] } ,
			 *   insertNode :  function insertNode() {     [native code] } ,
			 *   selectNode :  function selectNode() {     [native code] } ,
			 *   selectNodeContents :  function selectNodeContents() {     [native code] } ,
			 *   setEnd :  function setEnd() {     [native code] } ,
			 *   setEndAfter :  function setEndAfter() {     [native code] } ,
			 *   setEndBefore :  function setEndBefore() {     [native code] } ,
			 *   setStart :  function setStart() {     [native code] } ,
			 *   setStartAfter :  function setStartAfter() {     [native code] } ,
			 *   setStartBefore :  function setStartBefore() {     [native code] } ,
			 *   surroundContents :  function surroundContents() {     [native code] } ,
			 *   toString :  function toString() {     [native code] } ,
			 *   END_TO_END : 2,
			 *   END_TO_START : 3,
			 *   START_TO_END : 1,
			 *   START_TO_START : 0
			 * }
			 */    		
	    if (typeof this.selection.getRangeAt != "undefined") {
	    	return this.selection.getRangeAt(0); // returns Range object
	    } else {
	      var range = this.document.createRange();
	      range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
	      range.setEnd(this.selection.focusNode, this.selection.focusOffset);
	      return range; // returns Range object
	    }
	  } else { // for IE 6/7/8, manually compute start container and end container for text range
			if (this.selection && 
				(typeof this.selection.startContainer == "undefined" || 
				typeof this.selection.endContainer == "undefined")) {
				var startRange = this.selection.duplicate();
				startRange.collapse(true);
				var startInfo = this.getTextRangeContainer(startRange);
				if (startInfo && startInfo['container']) {
					this.selection.startContainer = startInfo['container'];
					this.selection.startOffset  = startInfo['offset'];
					LOG.debug("range start container: " + this.selection.startContainer + ", offset: " + this.selection.startOffset);
				}
				var endRange = this.selection.duplicate();
				endRange.collapse(false);
				var endInfo = this.getTextRangeContainer(endRange);
				if (endInfo && endInfo['container']) {
					this.selection.endContainer = endInfo['container'];
					this.selection.endOffset = endInfo['offset'];
					LOG.debug("range end container: " + this.selection.endContainer + ", offset: " + this.selection.endOffset);
				}
			}
	  	return this.selection; // returns TextRange object
	  }
  };
	Downsha.SelectionFinder.prototype.getTextRangeContainer = function(textRange) {
		var rangeContainer = textRange.parentElement();
		if (!rangeContainer) {
			return null;
		}
		var forward = true;
		var node = rangeContainer.firstChild;
		var newRange = rangeContainer.ownerDocument.body.createTextRange();
		newRange.moveToElementText(rangeContainer);
		newRange.setEndPoint("EndToStart", textRange);
		var rangeLength = newRange.text.length;
		if (rangeLength >= rangeContainer.innerText.length / 2) {
			forward = false;
			node = rangeContainer.lastChild;
			newRange.moveToElementText(rangeContainer);
			newRange.setEndPoint("StartToStart", textRange);
			rangeLength = newRange.text.length;
		}
		
		while (node) {
			switch(node.nodeType) {
			case Node.TEXT_NODE:
				nodeLength = node.data.length;
				if (nodeLength < rangeLength) {
					var difference = rangeLength - nodeLength;
					if (forward) {
						newRange.moveStart("character", difference);
					} else {
						newRange.moveEnd("character", -difference);
					}
					rangeLength = difference;
				} else {
					if (forward) {
						return {'container': node, 'offset': rangeLength};
					} else {
						return {'container': node, 'offset': nodeLength - rangeLength};
					}
				}
				break;
			case Node.ELEMENT_NODE:
				nodeLength = node.innerText.length;
				if (forward) {
					newRange.moveStart("character", nodeLength);
				} else {
					newRange.moveEnd("character", -nodeLength);
				}
				rangeLength = rangeLength - nodeLength;
				break;
			}
			if(forward) {
				node = node.nextSibling;
			} else {
				node = node.previousSibling;
			}
		}
		return {'container': rangeContainer, 'offset': 0};
	};
  Downsha.SelectionFinder.prototype.getCommonAncestorContainer = function() {
    var ancestorElement = null;
    var range = this.getRange();
    /**
     * The Range object and its commonAncestorContainer property are supported in Internet Explorer from version 9.
     * In Internet Explorer before version 9 (and in newer ones as well), the TextRange object provides functionality 
     * similar to the Range object. To get the container element of a TextRange object, use the parentElement method.
     */
  	if (range && range.commonAncestorContainer) { // for IE 9 standard mode
  		ancestorElement = range.commonAncestorContainer;
  	}
    else if (range && (typeof range.parentElement != "undefined")) { // for IE 6/7/8
	    /**
	     * In IE 6/7/8, if you need the deepest element in the DOM hierarchy 
	     * that contains the entire TextRange object, use the parentElement method. 
	     * NOT the commonAncestorContainer property which is used by firefox, chrome and IE 9.
	     */
    	ancestorElement = range.parentElement();
    }
    while (ancestorElement && ancestorElement.nodeType != Node.ELEMENT_NODE) {
      ancestorElement = (ancestorElement.parentElement) ? ancestorElement.parentElement : ancestorElement.parentNode;
    }
    return ancestorElement;
  };
  Downsha.SelectionFinder.prototype._findSelectionInDocument = function(doc, deep) {
    var text = null;
    var sel = null;
    if (typeof doc.getSelection != "undefined") { // for IE 9
    	/**
    	 * selectionRange object (W3C standard, used by IE9/Chrome/Firefox)
    	 * {
    	 *   anchorNode : [object Text],
    	 *   anchorOffset : 1,
    	 *   focusNode : [object Text],
    	 *   focusOffset : 1,
    	 *   isCollapsed : true,
    	 *   rangeCount : 1,
    	 *   addRange :  function addRange() {     [native code] } ,
    	 *   collapse :  function collapse() {     [native code] } ,
    	 *   collapseToEnd :  function collapseToEnd() {     [native code] } ,
    	 *   collapseToStart :  function collapseToStart() {     [native code] } ,
    	 *   deleteFromDocument :  function deleteFromDocument() {     [native code] } ,
    	 *   getRangeAt :  function getRangeAt() {     [native code] } ,
    	 *   removeAllRanges :  function removeAllRanges() {     [native code] } ,
    	 *   removeRange :  function removeRange() {     [native code] } ,
    	 *   selectAllChildren :  function selectAllChildren() {     [native code] } ,
    	 *   toString :  function toString() {     [native code] } 
    	 * } 
    	 */
      sel = doc.getSelection();
      if (sel && typeof sel.toString != "undefined") {
      	text = sel.toString();
      }
    } else if (doc.selection && typeof doc.selection.createRange != "undefined") { // for IE 6/7/8
    	/**
    	 * TextRange object (IE only)
    	 * {
    	 *   text : "",
    	 *   boundingWidth : 0,
    	 *   offsetLeft : 190,
    	 *   boundingLeft : 190,
    	 *   htmlText : "",
    	 *   boundingTop : 2,
    	 *   offsetTop : 2,
    	 *   boundingHeight : 53
    	 * }
    	 */
    	 
    	// type == 'None' means no selection or the selected content is not available.
    	if (doc.selection.type != "None") {
    		sel = doc.selection.createRange();
	      if (sel && sel.text) {
	      	text = sel.text;
	      }
	    }
    } else {
    	LOG.warn("SelectionFinder._findSelectionInDocument can't get selection");
	    return {
	      document : doc,
	      selection : sel,
	      text : text
	    };
    }
    
    if ((!text || text.length == 0) && deep) {
      var documents = Downsha.Utils.findDocuments(doc);
      if (documents.length > 0) {
      	LOG.debug("find selection range empty, trying frames, count: " + documents.length);
        for ( var i = 0; i < documents.length; i++) {
          if (documents[i]) {
            var framedSel = this._findSelectionInDocument(documents[i], deep);
            if (framedSel.selection && framedSel.text && framedSel.text.length > 0) {
              return framedSel;
            }
          }
        }
      }
    }
    return {
      document : doc,
      selection : sel,
      text : text
    };
  };
})();
