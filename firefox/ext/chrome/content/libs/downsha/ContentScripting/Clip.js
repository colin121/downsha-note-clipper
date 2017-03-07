/**
 * @author: chenmin
 * @date: 2011-09-04
 * @desc: content clip script for FullPage/Selection/Article/URL
 */

(function() {
  var LOG = null;
	Downsha.Clip = function Clip(win, stylingStrategy, maxSize) {
		LOG = Downsha.Logger.getInstance();
	  this.__defineGetter__("fullPage", this.isFullPage);
	  this.__defineGetter__("length", this.getLength);
	  this.__defineGetter__("stylingStrategy", this.getStylingStrategy);
	  this.__defineSetter__("stylingStrategy", this.setStylingStrategy);
	  this.__defineGetter__("documentBase", this.getDocumentBase);
	  this.__defineSetter__("documentBase", this.setDocumentBase);
	  this.__defineGetter__("maxSize", this.getMaxSize);
	  this.__defineSetter__("maxSize", this.setMaxSize);
	  this.initialize(win, stylingStrategy, maxSize);
	};
	
	Downsha.Clip.NOKEEP_NODE_ATTRIBUTES = {
	  "style" : null,
	  "tabindex" : null,
	  "class" : null,
	  "id" : null,
    "_downshaPreviewRect" : null
	};
	Downsha.Clip.CONDITIONAL_NODES = {
		"EMBED" : null,
		"OBJECT" : null
	};
	Downsha.Clip.NODE_NAME_TRANSLATIONS = {
		
    "HTML" : "DIV",
    "BODY" : "DIV",
    "FORM" : "DIV",
    "LABEL" : "SPAN",
    "FIELDSET" : "DIV",
    "LEGEND" : "SPAN",
    "SECTION" : "DIV",
    "CANVAS" : "DIV",
    "CUFON" : "DIV",
    "*" : "DIV"
	};
	Downsha.Clip.SUPPORTED_NODES = {
		"A" : null,
		"ABBR" : null,
		"ACRONYM" : null,
		"ADDRESS" : null,
		"AREA" : null,
		"B" : null,
		"BASE" : null,
		"BASEFONT" : null,
		"BDO" : null,
		"BIG" : null,
		"BLOCKQUOTE" : null,
		"BR" : null,
		"BUTTON" : null,
		"CAPTION" : null,
		"CENTER" : null,
		"CITE" : null,
		"CODE" : null,
		"COL" : null,
		"COLGROUP" : null,
		"DD" : null,
		"DEL" : null,
		"DFN" : null,
		"DIR" : null,
		"DIV" : null,
		"DL" : null,
		"DT" : null,
		"EM" : null,
		"EMBED" : null,
		"FIELDSET" : null,
		"FONT" : null,
		"FORM" : null,
		"FRAME" : null,
		"FRAMESET" : null,
		"H1" : null,
		"H2" : null,
		"H3" : null,
		"H4" : null,
		"H5" : null,
		"H6" : null,
		"HEAD" : null,
		"HR" : null,
		"HTML" : null,
		"I" : null,
		"IFRAME" : null,
		"IMG" : null,
		"INPUT" : null,
		"INS" : null,
		"KBD" : null,
		"LABEL" : null,
		"LEGEND" : null,
		"LI" : null,
		"LINK" : null,
		"MAP" : null,
		"MENU" : null,
		"META" : null,
		"NOBR" : null,
		"NOFRAMES" : null,
		"NOSCRIPT" : null,
		"OBJECT" : null,
		"OL" : null,
		"OPTGROUP" : null,
		"OPTION" : null,
		"P" : null,
		"PARAM" : null,
		"PRE" : null,
		"Q" : null,
		"QUOTE" : null,
		"S" : null,
		"SAMP" : null,
		"SCRIPT" : null,
		"SELECT" : null,
		"SMALL" : null,
		"SPAN" : null,
		"STRIKE" : null,
		"STRONG" : null,
		"STYLE" : null,
		"SUB" : null,
		"SUP" : null,
		"TABLE" : null,
		"TBODY" : null,
		"TD" : null,
		"TEXTAREA" : null,
		"TFOOT" : null,
		"TH" : null,
		"THEAD" : null,
		"TITLE" : null,
		"TR" : null,
		"TT" : null,
		"U" : null,
		"UL" : null,
		"VAR" : null,
		"VIDEO" : null
	};
	Downsha.Clip.REJECT_NODES = {
		"SCRIPT" : null,
		"STYLE" : null,
		"INPUT" : null,
		"SELECT" : null,
		"OPTION" : null,
		"OPTGROUP" : null,
		"TEXTAREA" : null,
		"NOSCRIPT" : null,
		"HEAD" : null,
		"DOWNSHADIV" : null,
		"CUFONTEXT" : null,
		"NOEMBED" : null
	};
	Downsha.Clip.NON_ANCESTOR_NODES = {
		"OL" : null,
		"UL" : null,
		"LI" : null
	};
	Downsha.Clip.SELF_CLOSING_NODES = {
		"IMG" : null,
		"INPUT" : null,
		"BR" : null
	};
	
	Downsha.Clip.HTMLEncode = function(str) {
	  var result = "";
	  for ( var i = 0; i < str.length; i++) {
	    var charcode = str.charCodeAt(i);
	    var aChar = str[i];
	    if (charcode > 0x7f) {
	      result += "&#" + charcode + ";";
	    } else if (aChar == '>') {
	      result += "&gt;";
	    } else if (aChar == '<') {
	      result += "&lt;";
	    } else if (aChar == '&') {
	      result += "&amp;";
	    } else {
	      result += str[i];
	    }
	  }
	  return result;
	};
	
	Downsha.Clip.prototype.title = null;
	Downsha.Clip.prototype.location = null;
	Downsha.Clip.prototype.window = null;
	Downsha.Clip.prototype.selectionFinder = null;
	Downsha.Clip.prototype.deep = true;
	Downsha.Clip.prototype.content = null;
	Downsha.Clip.prototype.range = null;
	Downsha.Clip.prototype._stylingStrategy = null;
	Downsha.Clip.prototype._documentBase = null;
	Downsha.Clip.prototype._maxSize = 0;
	Downsha.Clip.prototype._verboseLog = false;
	Downsha.Clip.prototype.PREVIEW_ARTICLE_CLASS = "downshaPreviewArticleContainer"; // class name of node that has article content
	
	// Declares the content and source of a web clip
	Downsha.Clip.prototype.initialize = function(win, stylingStrategy, maxSize) {
		this.window = (win) ? win : window;
	  this.title = this.window.document.title;
	  this.location = this.window.location;
	  this.selectionFinder = new Downsha.SelectionFinder(this.window.document);
	  this.range = null;
	  if (stylingStrategy) {
	    this.stylingStrategy = stylingStrategy;
	  }
	  this.maxSize = maxSize;
	};
	Downsha.Clip.prototype.getDocumentBase = function() {
	  if (this._documentBase == null) {
	    var baseTags = this.window.document.getElementsByTagName("base");
	    if (baseTags.length > 0) {
	      for ( var i = 0; i < baseTags.length; i++) {
	        this.setDocumentBase(baseTags[i].href);
	        if (this._documentBase) {
	          break;
	        }
	      }
	    }
	    if (!this._documentBase) {
				/**
				 * Say the URL is http://www.sitename.com/article/2009/09/14/this-is-an-article/, 
				 * then window.location.origin would be http://www.sitename.com without tailing slash.
				 * However, window.location.origin only works fine in Chrome, not in firefox/IE.
				 */
	      this._documentBase = this.window.location.protocol + "//" + this.window.location.host
	          + this.location.pathname.replace(/[^\/]+$/, ""); // trim end part of pathname
	    }
	  }
	  return this._documentBase;
	};
	Downsha.Clip.prototype.setDocumentBase = function(url) {
	  if (typeof url == 'string' && url.indexOf("http") == 0) {
	    this._documentBase = url;
	  } else {
	    this._documentBase = null;
	  }
	};
	Downsha.Clip.prototype.getMaxSize = function() {
	  return this._maxSize;
	};
	Downsha.Clip.prototype.setMaxSize = function(num) {
	  this._maxSize = parseInt(num);
	  if (isNaN(this._maxSize) || num < 0) {
	    this._maxSize = 0;
	  }
	};
	/**
	 * [DEPRECATED] Returns CSS style for the given node as a ClipStyle object. If computed is
	 * true, the style will be computed, otherwise - it would only contain style
	 * attributes matching the node.
	 */
	Downsha.Clip.prototype.getNodeStyle = function(node, computed) {
	  var style = new Downsha.ClipStyle();
	  if (this._verboseLog)
	    LOG.debug(">>> NODE: " + node.nodeName + "/" + node.nodeType);
	  if (node && typeof node.nodeType == 'number' && node.nodeType == 1) {
	    var doc = node.ownerDocument;
	    var view = (doc.defaultView) ? doc.defaultView : this.window;
	    var matchedRulesDefined = (typeof view["getMatchedCSSRules"] == 'function') ? true : false;
	    if (computed) {
	      if (this._verboseLog) {
	        LOG.debug(">>> Getting computed style");
	        LOG.debug("... " + view.getComputedStyle(node, null).length);
	      }
	      style = new Downsha.ClipStyle(view.getComputedStyle(node, null));
	    } else if (matchedRulesDefined) { // **** getMatchedCSSRules is NOT available in firefox
	      if (this._verboseLog)
	        LOG.debug(">>> Getting matched rules");
	      style = new Downsha.ClipStyle(view.getMatchedCSSRules(node));
	    }
	  }
	  if (this._verboseLog)
	    LOG.debug(">>> " + node.nodeName + " style: " + style.toString());
	  return style;
	};
	Downsha.Clip.prototype.getNodeStylePropertyValue = function(node, propName) {
	  if (node && node.nodeType == Node.ELEMENT_NODE && typeof propName == 'string') {
	    var doc = node.ownerDocument;
	    var view = (doc.defaultView) ? doc.defaultView : this.window;
	    var style = view.getComputedStyle(node, null);
	    return style.getPropertyValue(propName);
	  }
	  return null;
	};
	
	Downsha.Clip.prototype.setStylingStrategy = function(strategy) {
	  if (typeof strategy == 'function' && Downsha.inherits(strategy, Downsha.ClipStylingStrategy)) {
	    this._stylingStrategy = new strategy(this.window);
	  } else if (strategy instanceof Downsha.ClipStylingStrategy) {
	    this._stylingStrategy = strategy;
	  } else if (strategy == null) {
	    this._stylingStrategy = null;
	  }
	};
	Downsha.Clip.prototype.getStylingStrategy = function() {
	  return this._stylingStrategy;
	};
	
	Downsha.Clip.prototype.clipUrl = function() {
		this.content = Downsha.Utils.createUrlClipContent(this.title, this.location.href, 
			"http://www.google.com/s2/favicons?domain=" + Downsha.Utils.urlDomain(this.location.href).toLowerCase());
		return true;
	};
	
	Downsha.Clip.prototype.isFullPage = function() {
	  return !this.hasSelection();
	};
	
	Downsha.Clip.prototype.hasSelection = function() {
	  if (this.selectionFinder.hasSelection()) {
	    return true;
	  } else {
	    this.selectionFinder.find(this.deep);
	    return this.selectionFinder.hasSelection();
	  }
	};
	Downsha.Clip.prototype.getSelection = function() {
	  if (this.hasSelection()) {
	    return this.selectionFinder.selection;
	  }
	  return null;
	};
	Downsha.Clip.prototype.getRange = function() {
	  if (this.hasSelection()) {
	    return this.selectionFinder.getRange();
	  }
	  return null;
	};
	Downsha.Clip.prototype.hasBody = function() {
	  return (this.window && this.window.document && this.window.document.body && 
	  	this.window.document.body.tagName.toLowerCase() == "body");
	};
	Downsha.Clip.prototype.hasContentToClip = function() {
	  return (this.hasBody() || this.hasSelection());
	};
	
	/**
	 * Captures article content from the page
	 */
	Downsha.Clip.prototype.clipArticle = function() {
		LOG.debug("Clip.clipArticle");
		var startStamp = 0;
		var endStamp = 0;
		if (LOG.isDebugEnabled()) {
		  startStamp = new Date().getTime();
		}
		var articleNode = null;
		var rememberNodes = this.window.document.getElementsByClassName(this.PREVIEW_ARTICLE_CLASS);
		if (rememberNodes && rememberNodes.length > 0) {
			articleNode = rememberNodes[0];
		} else {
		  var ex = new ExtractContentJS.LayeredExtractor();
		  ex.addHandler(ex.factory.getHandler("Heuristics"));
		  var res = ex.extract(this.window.document);
		  if(res.isSuccess) {
		  	articleNode = res.content.asNode();
		  	Downsha.Utils.addElementClass(articleNode, this.PREVIEW_ARTICLE_CLASS);
		  }
		}
		if (!articleNode) {
		  LOG.debug("Document has no article...");
		  return false;
		}
		this.content = this.serializeDOMNode(articleNode, true);
		if (LOG.isDebugEnabled()) {
			endStamp = new Date().getTime();
			LOG.debug("Clipped article in " + (endStamp - startStamp) + " milliseconds");
		}
		return typeof this.content == 'string';
	};
	
	/**
	 * Captures all the content of the document
	 */
	Downsha.Clip.prototype.clipBody = function() {
	  if (!this.hasBody()) {
	    LOG.debug("Document has no body...");
	    return false;
	  }
	  var startStamp = 0;
	  var endStamp = 0;
	  if (LOG.isDebugEnabled()) {
	    LOG.debug("Getting body text: " + this);
	    startStamp = new Date().getTime();
	  }
	  this.content = this.serializeDOMNode(this.window.document.body, true); // serialize entire body
	  if (LOG.isDebugEnabled()) {
	    endStamp = new Date().getTime();
	    LOG.debug("Clipped body in " + (endStamp - startStamp) + " milliseconds");
	  }
	  if (typeof this.content != 'string') {
	    return false;
	  }
	  return true;
	};
	
	/**
	 * Captures selection in the document
	 */
	Downsha.Clip.prototype.clipSelection = function() {
	  if (!this.hasSelection()) {
	    LOG.debug("Document has no selection...");
	    return false;
	  }
	  var startStamp = 0;
	  var endStamp = 0;
	  
	  this.range = this.getRange();
	  if (this.range) {
	    if (LOG.isDebugEnabled()) {
	      startStamp = new Date().getTime();
	    }
	    
			var ancestor = (this.stylingStrategy && 
				this.range.commonAncestorContainer.nodeType == Node.TEXT_NODE && 
				this.range.commonAncestorContainer.parentNode) ? 
				this.range.commonAncestorContainer.parentNode : 
				this.range.commonAncestorContainer;
			
			while (typeof Downsha.Clip.NON_ANCESTOR_NODES[ancestor.nodeName] != 'undefined' && ancestor.parentNode) {
				if (ancestor.nodeName == "BODY") {
					break;
				}
				ancestor = ancestor.parentNode;
			}
	    this.content = this.serializeDOMNode(ancestor, false);
	    
	    if (LOG.isDebugEnabled()) {
	      endStamp = new Date().getTime();
	    }
	    this.range = null;
	    if (LOG.isDebugEnabled()) {
	      LOG.debug("Success...");
	      LOG.debug("Clipped selection in " + (endStamp - startStamp) + " milliseconds");
	    }
	    return true;
	  }
	  
	  this.range = null;
	  LOG.debug("Failed to clip selection");
	  return false;
	};
	
	Downsha.Clip.prototype.rangeIntersectsNode = function(node) {
	  if (this.range) {
	    var nodeRange = node.ownerDocument.createRange();
	    try {
	      nodeRange.selectNode(node);
	    }
	    catch (e) {
	      nodeRange.selectNodeContents(node);
	    }
	    /**
	     * Note: The support for the intersectsNode method of Range object has been removed in Firefox 3. 
	     * Use the compareBoundaryPoints method instead. see http://help.dottoro.com/ljsuotfs.php
	     */
	    return this.range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1 
	      && this.range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1;
	  }
	  return false;
	};
	
	Downsha.Clip.prototype.serializeDOMNode = function(root, fullPage) {
	  var str = "";
		if (this._includeFontFaceDescriptions && this.stylingStrategy) {
		  var ffRules = this.stylingStrategy.getFontFaceRules();
		  if (ffRules) {
		    str += "<style>\n";
		    for ( var ffrx = 0; ffrx < ffRules.length; ffrx++) {
		      str += ffRules[ffrx].cssText + "\n";
		    }
		    str += "</style>\n";
		  }
		}
		var node = root;
		var parentStyle = null;
		
		while (node) {
			//LOG.debug("current node: " + this.getNodeString(node));
			if (this.maxSize > 0 && str.length > this.maxSize) { // whether content size exceeds
			  LOG.debug("Length of serialized content exceeds " + this.maxSize);
			  this.sizeExceeded = true;
			  if (typeof this.onsizeexceed == 'function') {
			    this.onsizeexceed();
			  }
			  break;
			}
			
			var isNodeForSerialize = (this.range && !this.rangeIntersectsNode(node)) ? false : true;
			if (this.isRejectedNode(node)) isNodeForSerialize = false;
		  
		  //LOG.debug("SerializeDOMNode: " + node.nodeName);
		  if (isNodeForSerialize && node.nodeType == Node.TEXT_NODE) { // text node
		    if (this.range) {
		      if (this.range.startContainer == node
		          && this.range.startContainer == this.range.endContainer) {
		        str += this.constructor.HTMLEncode(node.nodeValue.substring(
		            this.range.startOffset, this.range.endOffset));
		      } else if (this.range.startContainer == node) {
		        str += this.constructor.HTMLEncode(node.nodeValue
		            .substring(this.range.startOffset));
		      } else if (this.range.endContainer == node) {
		        str += this.constructor.HTMLEncode(node.nodeValue.substring(0,
		            this.range.endOffset));
		      } else if (this.range.commonAncestorContainer != node) {
		        str += this.constructor.HTMLEncode(node.nodeValue);
		      }
		    } else {
		      str += this.constructor.HTMLEncode(node.nodeValue);
		    }
			} else if (isNodeForSerialize && node.nodeType == Node.ELEMENT_NODE && this.isConditionalNode(node)) { // conditional element node
				if (this.isNodeVisible(node)) { // only process visible nodes
				  var nodeStyle = null;
				  if (this.stylingStrategy) {
				    nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage, parentStyle);
				  }
				  var _str = this.serializeConditionalElement(node, nodeStyle);
				  if (typeof _str == 'string' && _str) {
				    str += _str;
				  }
				}				
		  } else if (isNodeForSerialize && node.nodeType == Node.ELEMENT_NODE && !this.isConditionalNode(node)) { // common element node
	    	if (this.isNodeVisible(node)) { // node visibility is NOT hidden
		      // serialize node
		      var translatedNodeName = this.translateNodeName(node);
		      str += "<" + translatedNodeName;
		      
		      var attrStr = this.nodeAttributesToString(node); // include attributes
		      if (this.stylingStrategy) { // include styles
	
		        var nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage, parentStyle);
		        parentStyle = nodeStyle;
		        
						if (nodeStyle instanceof Downsha.ClipStyle && nodeStyle.length > 0) {
							if (nodeStyle["float"] && nodeStyle["float"] != "none" && node.parentElement) {
								node.parentElement._downsha_float_ = true;
							}
							// serialize css text to the string, replace Double Quotes(") with Space( )
							attrStr += " style=\"" + nodeStyle.toString().replace(/\"/g, "") + "\"";
							//attrStr += " style=\"" + nodeStyle.toString().replace(/\"/g, "\\\"") + "\"";
						} else if (typeof nodeStyle == 'string') {
							// serialize css text to the string, replace Double Quotes(") with Space( )
							attrStr += " style=\"" + nodeStyle.replace(/\"/g, "") + "\"";
							//attrStr += " style=\"" + nodeStyle.replace(/\"/g, "\\\"") + "\"";
						}
		      }
		      
		      if (attrStr.length > 0) {
		        str += " " + attrStr;
		      }
		      if (node.hasChildNodes()) {
		      	str += ">";
		      	node = node.childNodes[0]; // *** depth-first traversal, first process children, then siblings.
		      	continue;
		      }
		      else if (!this.isSelfClosingNode(node)) {     	
		      	str += ">" + "</" + translatedNodeName + ">";
		      } else {
		      	str += "/>";
		      }
		    }
		  }
		  
		  if (node.nextSibling ) { // *** traverse to siblings
		  	node = node.nextSibling;
		  }
	    else if (node != root ) { // otherwise, no siblings, no children, trace BACK to parent node
	    	if (node.parentElement && node.parentElement._downsha_float_) {
	    		str += this._getFloatClearingElementString(node.parentElement);
	    		delete node.parentElement._downsha_float_;
	    	}
	    	while (node.parentNode) {
	    		node = node.parentNode;
	    		
	        // if the current node is the root node, let's append a terminal
	        // element to compensate for any floating children
	        if ( node == root ) {
	        	str += "<div style='clear: both'></div>";
	        }
	        // add close tag for parent node
	        nodeName = this.translateNodeName(node);
	        str += "</" + nodeName + ">";
	        
	        if (node == root) {
	        	break;
	        } else if (node.nextSibling) { // *** traverse to uncles
	        	node = node.nextSibling;
	        	break;
	        } else if (node.parentElement && node.parentElement._downsha_float_) {
	        	str += this._getFloatClearingElementString(node.parentElement);
	        	delete node.parentElement._downsha_float_;
	        }
	      } // end while
	      
	      if (node == root) { // reach the root of serialize range
	      	break;
	      } else if ((node.nodeName == "#document") || // reach the root of entire document
	      	(node.nodeType == Node.DOCUMENT_NODE)) {
	      		break;
	      }
	    }
	    else {
	        break;
	    }
	  }
	  return str;
	};
	
	Downsha.Clip.prototype.getNodeString = function(node) {
		var nodeStr = null;
		if (typeof node != "object" || node == null) {
			nodeStr = "[null]";
		} else if (node && node.nodeType == Node.TEXT_NODE) {
			if (typeof node.nodeValue == "string" && node.nodeValue.length > 0) {
				nodeStr = node.nodeName + " " + node.nodeValue;
			} else {
				nodeStr = node.nodeName + " [empty]";
			}
		} else if (node && node.nodeType == Node.ELEMENT_NODE) {
			nodeStr = "<" + node.nodeName;
			var attrs = node.attributes;
			for (var i = 0; i < attrs.length; i++) {
	      if (!attrs[i] || !attrs[i].name || !attrs[i].specified) {
	      	continue;
	      }
	      if (attrs[i].value) {
	      	nodeStr += " " + attrs[i].name + "=\"" + attrs[i].value + "\"";
	      } else {
	      	nodeStr += " " + attrs[i].name;
	      }
			}
			nodeStr += ">";
		} else {
			nodeStr = "node";
			if (typeof node.nodeName == "string" && node.nodeName.length > 0) {
				nodeStr += " name: " + node.nodeName;
			}
			if (typeof node.nodeType == "number") {
				nodeStr += " type: " + node.nodeType;
			}
			if (typeof node.nodeValue == "string" && node.nodeValue.length > 0) {
				nodeStr += " value: " + node.nodeValue;
			}
		}
		return nodeStr;
	};
	
	Downsha.Clip.prototype._getFloatClearingElementString = function(node) {
		var str = "";
		if (node && this.stylingStrategy) {
			var style = this.stylingStrategy.styleForFloatClearingNode(node);
			if (style && style.length > 0) {
				var nodeName = "div";
				if (node.nodeName == "UL" || node.nodeName == "OL") {
					nodeName = "li";
				}
				else if (node.nodeName == "DL") {
					nodeName = "dd";
				}
				str = "<" + nodeName + " style=\"" + style.toString() + "\"></" + nodeName + ">";
			}
		}
		
		return str;
	};
	
  Downsha.Clip.prototype.serializeConditionalElement = function(node, nodeStyle) {
    var str = "";
    if (node && node.nodeType == Node.ELEMENT_NODE) {
    	var doc = node.ownerDocument || document;
      var url = (doc.URL) ? doc.URL : doc.location.href;
      var rules = null;
      
      rules = this.articleRules;
      if (rules) {
  			var desc = null;
  			var thumb = null;
  			
  			if (rules.d) {
  				var descNode = Downsha.Utils.querySelectors(rules.d, doc);
  				if (descNode) {
  					desc = descNode.textContent;
  				}
  			}
  			if (rules.t) {
  				for (var i = 0; i < rules.t.length; i++) {
  					var rule = rules.t[i];
  					var base = doc;
  					if (rule.b === "relative") {
  						base = node;
  					}
  					var thumbNode = Downsha.Utils.querySelectors(rule.s, base);
  					if (thumbNode) {
  						var thumbValue = "";
    					if (rule.d === "value") {
    						thumbValue = thumbNode.value;
    					} else if (rule.d === "textContent") {
    						thumbValue = thumbNode.textContent;
    					} else if (rule.d) {
    						thumbValue = thumbNode.getAttribute(rule.d);
    						if (rule.d === "src" || rule.d === "href") {
    							thumbValue = decodeURIComponent(thumbValue);
    						}
    					}
    					if (thumbValue) {
    						if (rule.p) {
    							var regexp = new RegExp(rule.p, "i");
    							var match = thumbValue.match(regexp);
    							if (match && match[1]) {
    								thumb = match[1];
    							}
    						} else {
    							thumb = thumbValue;
    						}
    						if (thumb && rule.m && (typeof rule.r == "string")) {
    							var regexp = new RegExp(rule.m, "i");
    							thumb = thumb.replace(regexp, rule.r);
    						}
    						if (thumb) {
    							break;
    						}
    					}
  					}
  				}
  			}
  			if (desc || thumb) {
    			str += "<div style=\"display:none;\">";
    			if (desc) {
    				str += "<span>" + desc + "</span>";
    			}
    			if (thumb) {
    				str += "<img src=\"" + thumb + "\" />";
    			}
    			str += "</div>";
  			}
      }
    }
    
    str += this.serializePluginElement(node, nodeStyle);
    return str;
  };
  
  Downsha.Clip.prototype.serializePluginElement = function(node, nodeStyle) {
		var getAttrStr = function(ele) {
			var attrStr = "";
			var attrs = ele.attributes;
			for (var i = 0; i < attrs.length; i++) {
	      if (!attrs[i] || !attrs[i].name || !attrs[i].specified) {
	      	continue;
	      }
	      if (typeof Downsha.Clip.NOKEEP_NODE_ATTRIBUTES[attrs[i].name] == 'undefined' // skip NO KEEP attributes, like id, class, style, etc.
	      	&& attrs[i].name.substring(0, 2).toLowerCase() != "on" // skip event attributes, like onclick, onmousedown, etc.
	      	&& !(attrs[i].name == "href" && attrs[i].value.substring(0, 11).toLowerCase() == "javascript:")) { // skip event anchor, like href="javascript:void(0);"
	      	attrStr += " " + attrs[i].name;
	      	if (attrs[i].value) {
	      		attrStr += "=\"" + attrs[i].value.replace("\"", "&quot;") + "\"";
	      	}
	      }
			}
			return attrStr;
		};
		var styleStr = (nodeStyle instanceof Downsha.ClipStyle) ? "style=\"" + nodeStyle.toString() + "\"" : "";
		var str = "<" + node.nodeName + getAttrStr(node) + " " + styleStr + ">";
		var children = node.children;
		for (var i = 0; i < children.length; i++) {
			str += "<" + children[i].nodeName + getAttrStr(children[i]) + " />";
		}
		str += "</" + node.nodeName + ">";
		return str;
  };
	
	Downsha.Clip.prototype.isRejectedNode = function(node) {
	    return typeof Downsha.Clip.REJECT_NODES[node.nodeName.toUpperCase()] != 'undefined';
	};
	Downsha.Clip.prototype.isConditionalNode = function( node ) {
	    return typeof Downsha.Clip.CONDITIONAL_NODES[node.nodeName.toUpperCase()] != 'undefined';
	};
	Downsha.Clip.prototype.isNodeVisible = function(node) {
		var s = window.getComputedStyle(node, null);
		var sDisplay = s.getPropertyValue("display");
		var sVisibility = s.getPropertyValue("visibility");
		var sPosition = s.getPropertyValue("position");
		
		if (sDisplay != "none" && !(sVisibility == "hidden" && sPosition == "absolute")) {
			return true;
		}
		
		return false;  
	};
	Downsha.Clip.prototype.isSelfClosingNode = function(node) {
	  return (node && typeof Downsha.Clip.SELF_CLOSING_NODES[node.nodeName.toUpperCase()] != 'undefined');
	};
	Downsha.Clip.prototype.nodeAttributesToString = function(node) {
	  var self = this;
	  var str = "";
	  var attrs = node.attributes;
	  if (attrs != null) {
	    for (var i = 0; i < attrs.length; i++) {
	      if (typeof attrs[i].name == 'string' 
	      	&& typeof Downsha.Clip.NOKEEP_NODE_ATTRIBUTES[attrs[i].name.toLowerCase()] == 'undefined' // skip NO KEEP attributes, like id, class, style, etc.
	      	&& attrs[i].name.substring(0, 2).toLowerCase() != "on" // skip event attributes, like onclick, onmousedown, etc.
	      	&& !(attrs[i].name.toLowerCase() == "href" && attrs[i].value != null 
	      		&& attrs[i].value.length > 0 && attrs[i].value.substring(0, 11).toLowerCase() == "javascript:")) { // skip event anchor, like href="javascript:void(0);"
	        var v = (attrs[i].value) ? attrs[i].value : "";
	        if (attrs[i].name.toLowerCase() == "src" || attrs[i].name.toLowerCase() == "href") {
						/**
						 * following code call Utils.absoluteUrl to make "src", "href" absolute. (add document base url)
						 * suppose document base url is : "http://www.host.com/path", 
						 * 1. url starts with "//", like: "//www.host.com/index.php", then change to: "http://www.host.com/index.php"
						 * 2. url starts with "/", like: "/index.php", then change to: "http://www.host.com/index.php"
						 * 3. url starts with "./", "../", like: "./index.php", then change to: "http://www.host.com/path/./index.php"
						 * 4. url starts with other, like: "index.php", then change to: "http://www.host.com/path/index.php"
						 */
	        	if ((typeof v == "string") && (v.length > 0) && 
	        		(v.substring(0, 4).toLowerCase().indexOf("http") != 0) && 
	        		(v.substring(0, 11).toLowerCase().indexOf("data:image/") != 0)) {
	        		v = Downsha.Utils.absoluteUrl(v, this.getDocumentBase());
	        	}
	        	if (v.substring(0, 4).toLowerCase().indexOf("http") == 0) {
	        		v = encodeURI(v);
	        	}
	        } else {
	        	// escapeXML makes url ugly, e.g. http://t2.baidu.com/it/u=482339445,646192924&amp;fm=0&amp;gp=0.jpg
	        	v = Downsha.Utils.escapeXML(v);
	        }
	        if (v) { // serialize current attribute name and value to the string
	          str += " " + attrs[i].name + "=\"" + v + "\"";
	        } else {
	          str += " " + attrs[i].name;
	        }
	      }
	    }
	  }
	  return str.replace(/\s+$/, "");
	};
	Downsha.Clip.prototype.translateNodeName = function(node) {  
		var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName.toUpperCase()] || node.nodeName;
		return (typeof Downsha.Clip.SUPPORTED_NODES[nodeName.toUpperCase()] != "undefined") ? 
			nodeName : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
	};
	
	Downsha.Clip.prototype.toString = function() {
	  return "Clip[" + this.location + "] " + this.title;
	};
	
	// return POSTable length of this Clip
	Downsha.Clip.prototype.getLength = function() {
	  var total = 0;
	  var o = this.toDataObject();
	  for ( var i in o) {
	    total += ("" + o[i]).length + i.length + 2;
	  }
	  total -= 1;
	  return total;
	};
	
	Downsha.Clip.prototype.toDataObject = function() {
	  return {
	    "content" : this.content,
	    "title" : this.title,
	    "url" : this.location.href,
	    "fullPage" : this.fullPage
	  };
	}
})();
