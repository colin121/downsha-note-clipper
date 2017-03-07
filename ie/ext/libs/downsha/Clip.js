/**
 * @author: chenmin
 * @date: 2011-10-23
 * @desc: clip action
 */

(function() {
  Downsha.Clip = function Clip(win, stylingStrategy, maxSize) {
    this.initialize(win, stylingStrategy, maxSize);
  };

  Downsha.Clip.NOKEEP_NODE_ATTRIBUTES = { // skip following attributes
    "style" : null,
    "tabindex" : null,
    "class" : null,
    "id" : null,
    "className" : null, 
    "_downshaPreviewRect" : null,
    "_downshaEmbedMarker" : null
  };
  Downsha.Clip.CONDITIONAL_NODES = { // only clip when visible and use special serializer
    /*
    "IFRAME" : null,
    "EMBED" : null,
    "OBJECT" : null
    */
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
  Downsha.Clip.SUPPORTED_NODES = { // some nodes, like input, textarea, both belong to support list and reject list.
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
    "VAR" : null
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
  Downsha.Clip.NON_ANCESTOR_NODES = { // selection traversal should trace to the ancestors of following nodes
    "OL" : null,
    "UL" : null,
    "LI" : null
  };
  Downsha.Clip.SELF_CLOSING_NODES = { // <img />, <input />, <br />
    "IMG" : null,
    "INPUT" : null,
    "BR" : null
  };

  Downsha.Clip.HTMLEncode = function(str) {
    var result = "";
    for ( var i = 0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      /**
       * Direct index access of String object is NOT supported in IE.
       * We should use charAt method instead.
       */
      var aChar = str.charAt(i);
      if (charcode > 0x7f) { // greater than 127, show hex value
        result += "&#" + charcode + ";";
      } else if (aChar == '>') { // '>' -> "&gt;"
        result += "&gt;";
      } else if (aChar == '<') { // '<' -> "&lt;"
        result += "&lt;";
      } else if (aChar == '&') { // '&' -> "&amp;"
        result += "&amp;";
      } else {
        result += aChar;
      }
    }
    return result;
  };

  Downsha.Clip.prototype.window = null;
  Downsha.Clip.prototype.title = null;
  Downsha.Clip.prototype.url = null;
  Downsha.Clip.prototype.deep = true; // recursive traverse
  Downsha.Clip.prototype.stylingStrategy = null;
  Downsha.Clip.prototype.documentBase = null;
  Downsha.Clip.prototype.maxSize = 0;
  Downsha.Clip.prototype.sizeExceeded = false;
  Downsha.Clip.prototype.notebookGuid = false; // clip owner
  Downsha.Clip.prototype.tagNames = false; // tags
  Downsha.Clip.prototype.comment = false; // additional text
  Downsha.Clip.prototype.includeFontFaceDescriptions = false; // indicates whether includes css FontFace rules

  // Declares the content and source of a web clip
  Downsha.Clip.prototype.initialize = function(win, stylingStrategy, maxSize) {
  	this.window = (win) ? win : window;
  	this.title = this.window.document.title;
  	this.url = (this.window.document.URL) ? this.window.document.URL : this.window.document.location.href;
    this.range = null;
    if (stylingStrategy) {
    	this.setStylingStrategy(stylingStrategy);
    }
    this.setMaxSize(maxSize);
  };

  /**
   * Override with a function to have that function called when the clip's
   * serialized string exceeds maxSize property.
   */
  Downsha.Clip.prototype.onsizeexceed = null;

  Downsha.Clip.prototype.isFullPage = function() { // clip full page if no selection
    return !this.hasSelection();
  };

  Downsha.Clip.prototype.hasSelection = function() {
  	var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
  	return selectionFinder.hasSelection();
  };
  Downsha.Clip.prototype.getRange = function() {
  	var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
    if (selectionFinder.hasSelection()) {
      return selectionFinder.getRange();
    }
    return null;
  };
  Downsha.Clip.prototype.getRangeAncestor = function() {
  	var selectionFinder = Downsha.getIEExtension().getSelectionFinder();
    if (selectionFinder.hasSelection()) {
      return selectionFinder.getCommonAncestorContainer();
    }
    return null;
  };
  Downsha.Clip.prototype.hasBody = function() { // determine whether page has body
    return (this.window && this.window.document && this.window.document.body && 
    	this.window.document.body.tagName.toLowerCase() == "body");
  };
  Downsha.Clip.prototype.hasContentToClip = function() {
    return (this.hasBody() || this.hasSelection());
  };
  Downsha.Clip.prototype.getDocumentBase = function() {
    if (this.documentBase == null) {
      var baseTags = this.window.document.getElementsByTagName("base");
      if (baseTags.length > 0) {
        for ( var i = 0; i < baseTags.length; i++) {
          this.setDocumentBase(baseTags[i].href);
          if (this.documentBase) {
            break;
          }
        }
      }
      if (!this.documentBase) {
				/**
				 * Say the URL is http://www.sitename.com/article/2009/09/14/this-is-an-article/, 
				 * then window.location.origin would be http://www.sitename.com without tailing slash.
				 * However, window.location.origin only works fine in Chrome, not in firefox/IE.
				 */
				this.documentBase = this.url.replace(/[^\/]+$/, ""); // trim end part of pathname
      }
    }
    return this.documentBase;
  };
  Downsha.Clip.prototype.setDocumentBase = function(url) {
    if (typeof url == 'string' && url.indexOf("http") == 0) {
      this.documentBase = url;
    } else {
      this.documentBase = null;
    }
  };
  Downsha.Clip.prototype.getMaxSize = function() {
    return this.maxSize;
  };
  Downsha.Clip.prototype.setMaxSize = function(num) {
    this.maxSize = parseInt(num);
    if (isNaN(this.maxSize) || num < 0) {
      this.maxSize = 0;
    }
  };
  Downsha.Clip.prototype.isSizeExceeded = function() {
    return this.sizeExceeded;
  };
  Downsha.Clip.prototype.setSizeExceeded = function(bool) {
    this.sizeExceeded = (bool) ? true : false;
  };
  Downsha.Clip.prototype.getUrl = function() {
    return this.url;
  };
  Downsha.Clip.prototype.setUrl = function(url) {
    if (typeof url == 'string' || url == null) {
      this.url = url;
    }
  };

  /**
   * Captures all the content of the document
   */
  Downsha.Clip.prototype.clipBody = function() {
  	LOG.debug("Clip.clipBody");
    if (!this.hasBody()) {
    	LOG.debug("Document has no body...");
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var startStamp = 0; // start stamp
    var endStamp = 0; // end stamp
    startStamp = new Date().getTime();
    this.content = this.serializeDOMNode(this.window.document.body, true); // serialize entire body
		endStamp = new Date().getTime();
		LOG.debug("Clipped body in " + (endStamp - startStamp) + " milliseconds");
    if (typeof this.content != 'string') {
      return false;
    }
    return true;
  };

  Downsha.Clip.prototype.clipElement = function(element) {
  	LOG.debug("Clip.clipElement");
    if (element) {
      if (this.stylingStrategy) {
        this.stylingStrategy.cleanUp();
      }
      var startStamp = 0;
      var endStamp = 0;
      startStamp = new Date().getTime();
      this.content = this.serializeDOMNode(element, true); // serialize specified element
			endStamp = new Date().getTime();
			LOG.debug("Clipped element's content in " + (endStamp - startStamp) + " milliseconds");
      if (typeof this.content == 'string') {
        return true;
      }
    }
    LOG.debug("Cannot clip because no valid element was specified");
    return false;
  };
  
  Downsha.Clip.prototype.clipUrl = function() {
  	LOG.debug("Clip.clipUrl");
  	this.content = Downsha.Utils.createUrlClipContent(this.title, this.url);
    return true;
  };

  /**
   * Captures selection in the document
   */
  Downsha.Clip.prototype.clipSelection = function() {
  	LOG.debug("Clip.clipSelection");
    if (!this.hasSelection()) {
    	LOG.debug("Document has no selection...");
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var startStamp = 0;
    var endStamp = 0;
    this.range = this.getRange();
    if (this.range) {
    	var startStamp = new Date().getTime();
      var ancestor = this.getRangeAncestor();
      if (!ancestor) {
      	LOG.debug("No selection range ancestor");
				this.range = null;
				return false;
      }
      // TODO fix bug of rangeIntersectsNode
      /*
      while (typeof Downsha.Clip.NON_ANCESTOR_NODES[ancestor.nodeName] != 'undefined' && ancestor.parentNode) {
        if (ancestor.nodeName == "BODY") {
          break;
        }
        ancestor = ancestor.parentNode;
      }
      */
      ancestor = this.window.document.body;
      LOG.debug("selection ancestor node: " + Downsha.Utils.getNodeString(ancestor));
      // TODO fix bug of selection in IE 6/7/8
      /*
      if (this.range.htmlText) { for IE 6/7/8
      	this.content = this.constructor.HTMLEncode(this.range.htmlText);
      } else { // for IE 9
      	this.content = this.serializeDOMNode(ancestor, false); // serialize selection ancestor element
      }
      */
      this.content = this.serializeDOMNode(ancestor, false); // serialize selection ancestor element
			var endStamp = new Date().getTime();
			LOG.debug("Clipped selection in " + (endStamp - startStamp) + " milliseconds");      
    	this.range = null;
      return true;
    }
    this.range = null;
    return false;
  };
  
	Downsha.Clip.prototype.rangeIntersectsNode = function(node) {
	  if (node && this.range) {
	  	// ownerDocument was introduced in Microsoft Internet Explorer 6.
	  	var doc = (node.ownerDocument) ? node.ownerDocument : node.document;
	  	if (doc && doc.createRange) { // for IE 9
		    var nodeRange = doc.createRange();
		    if (nodeRange) {
			    try {
			      nodeRange.selectNode(node);
			    } catch (e) {
			      nodeRange.selectNodeContents(node);
			    }
			    /**
			     * Note: IE 9 doesn't support for the intersectsNode method of Range object.
			     * Use the compareBoundaryPoints method to emulate range intersects node.
			     * see http://help.dottoro.com/ljsuotfs.php
			     */
			    return ((this.range.compareBoundaryPoints(this.range.START_TO_END, nodeRange) == 1) 
			      && (this.range.compareBoundaryPoints(this.range.END_TO_START, nodeRange) == -1));
		    }
	  	} else if (doc && doc.body && doc.body.createTextRange) { // for IE 6/7/8
	  		/**
	  		 * If you want to align the boundary points of a TextRange object to the contents of an element 
	  		 * that supports the createTextRange method, use the createTextRange method on the required element. 
	  		 * For other elements, create a TextRange object with the body.createTextRange method and 
	  		 * use the moveToElementText method with the required element.
	  		 * moveToElementText only supports element node as input parameter.
	  		 */
	  		if (node.nodeType != Node.ELEMENT_NODE) {
	  			return true;
	  		}
	  		var nodeRange = doc.body.createTextRange();
	  		if (nodeRange) {
	  			/**
	  			 * IE throws "invalid argument" error for some cases.
	  			 * There are a number of properties and methods on DOM nodes that cannot be safely accessed 
	  			 * in IE until the node has been properly inserted and rendered in the "actual" DOM.
	  			 * http://media.china.com.cn/cmdf/cszx/zjsy/2011/1104/65498.html
	  			 * <A href="/news/mn/2011/1009/58675.html" target=_blank>
	  			 * 		<IMG border=0 src="/uploads/allimg/111009/18-111009102H30-L.jpg" width=125 height=95>
	  			 * </A>
	  			 */
	  			try {
	  				nodeRange.moveToElementText(node);
			  		/**
			  		 * In IE 6/7/8, the compareEndPoints method of TextRange object provides similar functionality 
			  		 * of compareBoundaryPoints of Range object in IE 9/Firefox/Chrome.
			  		 * see http://help.dottoro.com/ljllaprb.php#supByObj
			  		 */
				    return ((this.range.compareEndPoints("EndToStart", nodeRange) == 1) 
				      && (this.range.compareEndPoints("StartToEnd", nodeRange) == -1));	  				
	  			} catch (e) {
	  			}
		    }
	  	}
	  }
	  return false;
	};

  Downsha.Clip.prototype.serializeDOMNode = function(root, fullPage) {
  	LOG.debug("Clip.serializeDOMNode root: " + root + ", fullPage: " + fullPage);
    var str = "";
    // oh yeah, if we ever decide to keep <style> crap, setting includeFontFaceDescriptions
    // will allow to include font face descriptions inside <style> tags =)
		/**
		 * font-face example
		 * <style type="text/css">
		 * @font-face { 
		 *   font-family:comic; 
		 *   src:url(http://valid_url/some_font_file.eot);
		 * }
		 * </style>
		 */
    if (this.includeFontFaceDescriptions && this.stylingStrategy) {
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
    
    // performance test: http://www.qq.com IE7
    // total cost: 7s, text node: 1.5s, styles: 2.3s, attrs: 2.8s, basic: 0.3s
    try {
			while (node) {
			  //LOG.debug("current node: " + node.nodeName + ", current length: " + str.length);
			  //LOG.debug("current node: " + Downsha.Utils.getNodeString(node));
			  if (this.maxSize > 0 && str.length > this.maxSize) { // whether content size exceeds
			    LOG.debug("Length of serialized content exceeds " + this.maxSize);
			    this.sizeExceeded = true;
			    if (typeof this.onsizeexceed == 'function') {
			      this.onsizeexceed();
			    }
			    break;
			  }
			  // if there is selection, we need to check whether current node intersects with selection range
			  // TODO only check intersection when NOT in fullPage mode.
			  var inRange = (fullPage || !this.range || this.rangeIntersectsNode(node)) ? true : false;
			  if (inRange && node.nodeType == Node.TEXT_NODE) { // text node
			    if (this.range) { // there is selection, get selected text content from nodeValue
			    	if (typeof this.range.startContainer != "undefined" && 
			    		typeof this.range.endContainer != "undefined") { // for IE 9
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
			      } else { // for IE 6/7/8
					    // In IE 6/7/8, you cannot retrieve the elements and offsets 
					    // that define the start and end points of a TextRange object. 
					    // Instead, you can get the coordinates of the TextRange object's 
					    // start point with the offsetLeft and offsetTop properties.
					    str += this.constructor.HTMLEncode(node.nodeValue);
			      }
			    } else { // no selection, get entire text content from nodeValue
			      str += this.constructor.HTMLEncode(node.nodeValue);
			    }
			  } else if (inRange && node.nodeType == Node.ELEMENT_NODE // CONDITIONAL element nodes, like <iframe>, <embed>, <object>
			      && typeof Downsha.Clip.CONDITIONAL_NODES[node.nodeName] != 'undefined') {
			    if (this.isNodeVisible(node)) { // only process visible nodes
			      var nodeStyle = null;
			      if (this.stylingStrategy) {
			      	nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage);
			      }
			      var _str = this.serializeConditionalElement(node, nodeStyle);
			      if (typeof _str == 'string' && _str) {
			        str += _str;
			      }
			    }
			  } else if (inRange && node.nodeType == Node.ELEMENT_NODE // NOT REJECT element nodes
			      && typeof Downsha.Clip.REJECT_NODES[node.nodeName] == 'undefined') {
			    if (this.isNodeVisible(node)) { // only process visible nodes
			      var attrs = node.attributes;
			      var attrStr = "";
			      for ( var i = 0; i < attrs.length; i++) { // enumerate all attributes of node
			      	// IE 5-7 takes the second possible attribute of node x, whether it's defined or not. 
			      	// Therefore it consists of all attributes that can possibly be defined on the node (84 in all).
			      	// By using the object's specified property, it returns a boolean value indicating 
			      	// whether the attribute in question is user defined or not.
			        if (!attrs[i] || !attrs[i].name || !attrs[i].specified) {
			        	continue;
			        }
			        
			        var n = attrs[i].name;
			        if ((typeof Downsha.Clip.NOKEEP_NODE_ATTRIBUTES[n] == 'undefined') // skip NO KEEP attributes, like id, class, style, etc.
			        	&& (n.substring(0, 2).toLowerCase() != "on") // skip event attributes, like onclick, onmousedown, etc.
			        	&& !(n == "href" && attrs[i].value.substring(0, 11).toLowerCase() == "javascript:")) { // skip event anchor, like href="javascript:void(0);"
			          var v = (attrs[i].value) ? attrs[i].value : "";
			          if (n == "src" || n == "href") {
									// following code call Utils.absoluteUrl to make "src", "href" absolute. (add document base url)
									// suppose document base url is : "http://www.host.com/path", 
									// 1. url starts with "//", like: "//www.host.com/index.php", then change to: "http://www.host.com/index.php"
									// 2. url starts with "/", like: "/index.php", then change to: "http://www.host.com/index.php"
									// 3. url starts with "./", "../", like: "./index.php", then change to: "http://www.host.com/./index.php"
									// 4. url starts with other, like: "index.php", then change to: "http://www.host.com/path/index.php"
			          	if ((typeof v == "string") && (v.length > 0) && 
			          		(v.substring(0, 4).toLowerCase().indexOf("http") != 0) && 
			          		(v.substring(0, 11).toLowerCase().indexOf("data:image/") != 0)) {
			          		v = Downsha.Utils.absoluteUrl(v, this.getDocumentBase());
			          	}
			          	if (v.substring(0, 4).toLowerCase().indexOf("http") == 0) {
			          		v = Downsha.Utils.escapeURL(v);
			          	}
			          } else {
			          	// escapeXML makes url ugly, e.g. http://t2.baidu.com/it/u=482339445,646192924&amp;fm=0&amp;gp=0.jpg
			          	v = Downsha.Utils.escapeXML(v);
			          }
			          
			          if (v) { // serialize current attribute name and value to the string
			            attrStr += " " + n + "=\"" + v + "\"";
			          } else {
			            attrStr += " " + n;
			          }
			        }
			      }
			      
			      /**
			       * following code get style of node by current styling strategy
			       * the result is an instance of ClipStyle or string
			       */
			      if (this.stylingStrategy) {
			        var nodeStyle = this.stylingStrategy.styleForNode(node, root, fullPage);
			        
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
			      
			      /**
			       * if node name is in NODE_NAME_TRANSLATIONS, then translate it to corresponding name.
			       * if node name is NOT in SUPPORTED_NODES, then translate it to div.
			       */
			      var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName] || node.nodeName;
			      nodeName = (typeof Downsha.Clip.SUPPORTED_NODES[nodeName] != 'undefined') ? 
			      	nodeName : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
			      str += "<" + nodeName + attrStr;
			      
			      if (typeof this.window.getComputedStyle != "undefined") {
			        var computedStyle = this.window.getComputedStyle(node, '');
			        var visValue = computedStyle.getPropertyValue("visibility");
			      } else {
			      	var visValue = node.currentStyle.visibility;
			      }
			      if (visValue != "hidden" && node.hasChildNodes()) { // node visibility is NOT hidden 
			        str += ">";
			        /**
			         * The childNodes nodeList consists of all child nodes of the element, 
			         * including text nodes and comment nodes. IE up to 8 does not count empty text nodes. 
			         * Since this is the desired behaviour as far as I'm concerned, it still gets a Yes.
			         */
			        node = node.childNodes[0]; // *** depth-first traversal, first process children, then siblings.
			        continue;
			      } else if (typeof Downsha.Clip.SELF_CLOSING_NODES[nodeName] == 'undefined') {
			        // The standards are great when no one follows them...
			        // in the case of a BUTTON tag, make sure we fucking close it since
			        // it's not a self-closing tag
			        // and having a self-closing button will often result in the
			        // siblings becoming its children
			        // e.g. <button/><div>...</div> would become
			        // <button><div>...</div></button>
			        str += ">" + "</" + nodeName + ">";
			      } else { // self-closing node
			        str += "/>";
			      }
			    }
			  }
			
			  if (node.nextSibling) { // *** traverse to siblings
			    node = node.nextSibling;
			  } else if (node != root) { // otherwise, no siblings, no children, trace BACK to parent node
			    if (node.parentElement && node.parentElement._downsha_float_) {
			      var floatClearingStr = this.getFloatClearingElementString(node.parentElement);
			      str += floatClearingStr;
			      node.parentElement.removeAttribute("_downsha_float_");
			    }
			    while (node.parentNode) {
			      node = node.parentNode;
			      // if the current node is the root node, let's append a terminal
			      // element to compensate for any floating children
			      if (node == root) {
			        str += "<div style='clear: both'></div>";
			      }
			      
			      // add close tag for parent node
			      var nodeName = Downsha.Clip.NODE_NAME_TRANSLATIONS[node.nodeName] || node.nodeName;
			      nodeName = (typeof Downsha.Clip.SUPPORTED_NODES[nodeName] != 'undefined') ? 
			      	nodeName : Downsha.Clip.NODE_NAME_TRANSLATIONS["*"];
			      str += "</" + nodeName + ">";
			      
			      if (node == root) {
			        break;
			      } else if (node.nextSibling) { // *** traverse to uncles
			        node = node.nextSibling;
			        break;
			      } else if (node.parentElement && node.parentElement._downsha_float_) {
			        var floatClearingStr = this.getFloatClearingElementString(node.parentElement);
			        str += floatClearingStr;
			        node.parentElement.removeAttribute("_downsha_float_");
			      } else {
			      }
			    } // end while
			    if (node == root) { // reach the root of serialize range
			      break;
			    } else if ((node.nodeName == "#document") || // reach the root of entire document
			    	(node.nodeType == Node.DOCUMENT_NODE)) {
			    	break;
			    }
			  } else {
			    break;
			  }
			}
    } catch(e) {
			// The DOMException object is supported in Internet Explorer from version 9.
			if ((typeof DOMException != "undefined") && 
				(e instanceof DOMException) && 
				(e.code == DOMException.SECURITY_ERR)) {
				LOG.debug("Ignoring DOMException.SECURITY_ERR for node: " + Downsha.Utils.getNodeString(node));
			} else {
				LOG.warn("Error serializing node: " + Downsha.Utils.getNodeString(node));
				LOG.dir(e);
				// TODO throw out exception again or hide it ?
				//throw e;
			}
    }
    return str;
  };
  
  Downsha.Clip.prototype.getFloatClearingElementString = function(node) {
    var str = "";
    if (node && this.stylingStrategy) {
      var style = this.stylingStrategy.styleForFloatClearingNode(node);
      if (style && style.length > 0) {
        var nodeName = "div";
        if (node.nodeName == "UL" || node.nodeName == "OL") {
          nodeName = "li";
        } else if (node.nodeName == "DL") {
          nodeName = "dd";
        }
        str = "<" + nodeName + " style=\"" + style.toString() + "\"></" + nodeName + ">";
      }
    }
    return str;
  };

  Downsha.Clip.prototype.isNodeVisible = function(node) {
    if (typeof this.window.getComputedStyle != "undefined") {
		  var computedStyle = this.window.getComputedStyle(node);
		  var disValue = computedStyle.getPropertyValue("display");
		  var visValue = computedStyle.getPropertyValue("visibility");
		  var posValue = computedStyle.getPropertyValue("position");
		} else {
			var disValue = node.currentStyle.display;
			var visValue = node.currentStyle.visibility;
			var posValue = node.currentStyle.position;
		}
    if (disValue != "none" && !(visValue == "hidden" && posValue == "absolute")) {
      return true;
    }
    return false;
  };

  Downsha.Clip.prototype.serializeConditionalElement = function(node, nodeStyle) { // serialize conditional element by ElementSerializerFactory
    if (Downsha.ElementSerializerFactory) {
	    var impl = Downsha.ElementSerializerFactory.getImplementationFor(node);
	    if (typeof impl == 'function') {
	      var serializer = new impl(node, nodeStyle);
	      return serializer.serialize();
	    }
  	}
    return null;
  };

  Downsha.Clip.prototype.setStylingStrategy = function(strategy) {
    if (typeof strategy == 'function'
        && Downsha.inherits(strategy, Downsha.ClipStylingStrategy)) {
      this.stylingStrategy = new strategy(this.window);
    } else if (strategy instanceof Downsha.ClipStylingStrategy) {
      this.stylingStrategy = strategy;
    } else if (strategy == null) {
      this.stylingStrategy = null;
    }
  };
  Downsha.Clip.prototype.getStylingStrategy = function() {
    return this.stylingStrategy;
  };

  Downsha.Clip.prototype.toString = function() {
    return "Downsha.Clip[" + this.url + "] ("
        + ((this.content) ? this.content.length : 0) + ") " + this.title;
  };

  // return POSTable length of this Downsha.Clip
  Downsha.Clip.prototype.getLength = function() {
    var total = 0;
    var o = this.toDataObject();
    for (var i in o) {
      total += ("" + o[i]).length + i.length + 2;
    }
    total -= 1;
    return total;
  };

  Downsha.Clip.prototype.toDataObject = function() {
    return {
      "content" : this.content,
      "title" : this.title,
      "url" : this.url,
      "fullPage" : this.isFullPage(),
      "sizeExceeded" : this.sizeExceeded,
      "notebookGuid" : this.notebookGuid,
      "tagNames" : this.tagNames,
      "comment" : this.comment
    };
  };

  Downsha.Clip.prototype.toLOG = function() {
    return {
      title : this.title,
      url : this.url,
      fullPage : this.isFullPage(),
      sizeExceeded : this.sizeExceeded,
      contentLength : this.content.length
    };
  };
})();
