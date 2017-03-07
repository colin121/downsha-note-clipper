/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: clip action
 */

(function() {
  var LOG = null;
  var logEnabled = false;
  Downsha.Clip = function Clip(win, stylingStrategy, maxSize, articleRules) {
    LOG = Downsha.Logger.getInstance();
    if (LOG.level == Downsha.Logger.LOG_LEVEL_DEBUG) {
      logEnabled = true;
    }
    this.__defineGetter__("fullPage", this.isFullPage);
    this.__defineGetter__("length", this.getLength);
    this.__defineGetter__("stylingStrategy", this.getStylingStrategy);
    this.__defineSetter__("stylingStrategy", this.setStylingStrategy);
    this.__defineGetter__("documentBase", this.getDocumentBase);
    this.__defineSetter__("documentBase", this.setDocumentBase);
    this.__defineGetter__("maxSize", this.getMaxSize);
    this.__defineSetter__("maxSize", this.setMaxSize);
    this.__defineGetter__("sizeExceeded", this.isSizeExceeded);
    this.__defineSetter__("sizeExceeded", this.setSizeExceeded);
    this.__defineGetter__("url", this.getUrl);
    this.__defineSetter__("url", this.setUrl);
    this.initialize(win, stylingStrategy, maxSize, articleRules);
  };

  Downsha.Clip.NOKEEP_NODE_ATTRIBUTES = { // skip following attributes
    "style" : null,
    "tabindex" : null,
    "class" : null,
    "id" : null,
    "_downshaPreviewRect" : null
  };
  Downsha.Clip.CONDITIONAL_NODES = { // only clip when visible and use special serializer
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
      var aChar = str[i];
      if (charcode > 0x7f) { // greater than 127, show hex value
        result += "&#" + charcode + ";";
      } else if (aChar == '>') { // '>' -> "&gt;"
        result += "&gt;";
      } else if (aChar == '<') { // '<' -> "&lt;"
        result += "&lt;";
      } else if (aChar == '&') { // '&' -> "&amp;"
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
  Downsha.Clip.prototype.deep = true; // recursive traverse
  Downsha.Clip.prototype._stylingStrategy = null;
  Downsha.Clip.prototype._documentBase = null;
  Downsha.Clip.prototype._maxSize = 0;
  Downsha.Clip.prototype._sizeExceeded = false;
  Downsha.Clip.prototype.notebookGuid = false; // clip owner
  Downsha.Clip.prototype.tagNames = false; // tags
  Downsha.Clip.prototype.comment = false; // additional text
  Downsha.Clip.prototype._includeFontFaceDescriptions = false; // indicates whether includes css FontFace rules

  // Declares the content and source of a web clip
  Downsha.Clip.prototype.initialize = function(win, stylingStrategy, maxSize, articleRules) {
  	this.window = (win) ? win : window;
    this.title = this.window.document.title;
    this.location = this.window.location;
    this.selectionFinder = new Downsha.SelectionFinder(this.window.document);
    this.range = null;
    if (stylingStrategy) {
      this.stylingStrategy = stylingStrategy;
    }
    this.maxSize = maxSize;
    this.articleRules = articleRules;
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
  Downsha.Clip.prototype.hasBody = function() { // determine whether page has body
    return (this.window && this.window.document && this.window.document.body && 
    	this.window.document.body.tagName.toLowerCase() == "body");
  };
  Downsha.Clip.prototype.hasContentToClip = function() {
    return (this.hasBody() || this.hasSelection());
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
        this._documentBase = this.location.origin
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
  Downsha.Clip.prototype.isSizeExceeded = function() {
    return this._sizeExceeded;
  };
  Downsha.Clip.prototype.setSizeExceeded = function(bool) {
    this._sizeExceeded = (bool) ? true : false;
  };
  Downsha.Clip.prototype.getUrl = function() {
    if (!this._url) {
      this._url = this.location.href;
    }
    return this._url;
  };
  Downsha.Clip.prototype.setUrl = function(url) {
    if (typeof url == 'string' || url == null) {
      this._url = url;
    }
  };

  /**
   * Captures all the content of the document
   */
  Downsha.Clip.prototype.clipBody = function() {
    if (!this.hasBody()) {
      if (logEnabled) {
        LOG.debug("Document has no body...");
      }
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var startStamp = 0; // start stamp
    var endStamp = 0; // end stamp
    if (logEnabled) {
      LOG.debug("Getting body text: " + this);
      startStamp = new Date().getTime();
    }
    this.content = this.serializeDOMNode(this.window.document.body, true); // serialize entire body
    if (logEnabled) {
      endStamp = new Date().getTime();
      LOG.debug("Clipped body in " + (endStamp - startStamp) + " milliseconds");
    }
    if (typeof this.content != 'string') {
      return false;
    }
    return true;
  };

  Downsha.Clip.prototype.clipElement = function(element) {
    if (element) {
      if (this.stylingStrategy) {
        this.stylingStrategy.cleanUp();
      }
      var startStamp = 0;
      var endStamp = 0;
      if (logEnabled) {
        LOG.debug("Getting element text: " + this);
        startStamp = new Date().getTime();
      }
      this.content = this.serializeDOMNode(element, true); // serialize specified element
      if (logEnabled) {
        endStamp = new Date().getTime();
        LOG.debug("Clipped element's content in " + (endStamp - startStamp) + " milliseconds");
      }
      if (typeof this.content == 'string') {
        return true;
      }
    }
    LOG.debug("Cannot clip because no valid element was specified");
    return false;
  };

  /**
   * Captures selection in the document
   */
  Downsha.Clip.prototype.clipSelection = function() {
    if (!this.hasSelection()) {
      if (logEnabled) {
      	LOG.debug("Document has no selection...");
      }
      return false;
    }
    if (this.stylingStrategy) {
      this.stylingStrategy.cleanUp();
    }
    var startStamp = 0;
    var endStamp = 0;
    this.range = this.getRange();
    if (this.range) {
      if (logEnabled) {
      	var startStamp = new Date().getTime();
      }
      var ancestor = (this.stylingStrategy && // get parent if it is a text node
      	this.range.commonAncestorContainer.nodeType == Node.TEXT_NODE && 
      	this.range.commonAncestorContainer.parentNode) ? 
      	this.range.commonAncestorContainer.parentNode : 
      	this.range.commonAncestorContainer;
      while (typeof Downsha.Clip.NON_ANCESTOR_NODES[ancestor.nodeName] != 'undefined'
          && ancestor.parentNode) {
        if (ancestor.nodeName == "BODY") {
          break;
        }
        ancestor = ancestor.parentNode;
      }
      this.content = this.serializeDOMNode(ancestor, false); // serialize selection ancestor element
      if (logEnabled) {
        endStamp = new Date().getTime();
      }
      this.range = null;
      if (logEnabled) {
        LOG.debug("Clipped selection in " + (endStamp - startStamp) + " milliseconds");
      }
      return true;
    }
    this.range = null;
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
    
    try {
        while (node) {
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
          var inRange = (!this.range || this.range.intersectsNode(node)) ? true : false;
          if (inRange && node.nodeType == Node.TEXT_NODE) { // text node
            if (this.range) { // there is selection, get selected text content from nodeValue
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
            } else { // no selection, get entire text content from nodeValue
              str += this.constructor.HTMLEncode(node.nodeValue);
            }
          } else if (inRange && node.nodeType == Node.ELEMENT_NODE // CONDITIONAL element nodes, like <embed>, <object>
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
              	if (!attrs[i] || !attrs[i].name || !attrs[i].specified) {
              		continue;
              	}
                if (typeof Downsha.Clip.NOKEEP_NODE_ATTRIBUTES[attrs[i].name] == 'undefined' // skip NO KEEP attributes, like id, class, style, etc.
                	&& attrs[i].name.substring(0, 2).toLowerCase() != "on" // skip event attributes, like onclick, onmousedown, etc.
                	&& !(attrs[i].name == "href" && attrs[i].value.substring(0, 11).toLowerCase() == "javascript:")) { // skip event anchor, like href="javascript:void(0);"
                  var v = (attrs[i].value) ? attrs[i].value : "";
                  if (attrs[i].name == "src" || attrs[i].name == "href") {
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
				          		v = Downsha.Utils.escapeURL(v);
				          	}
                  } else {
                  	// escapeXML makes url ugly, e.g. http://t2.baidu.com/it/u=482339445,646192924&amp;fm=0&amp;gp=0.jpg
                  	v = Downsha.Utils.escapeXML(v);
                  }
                  if (v) { // serialize current attribute name and value to the string
                    attrStr += " " + attrs[i].name + "=\"" + v + "\"";
                  } else {
                    attrStr += " " + attrs[i].name;
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
              
              var s = window.getComputedStyle(node, '');
              var sVisibility = s.getPropertyValue("visibility");
              if (sVisibility != "hidden" && node.hasChildNodes()) { // node visibility is NOT hidden 
                str += ">";
                node = node.childNodes[0]; // *** depth-first traversal, first process children, then siblings.
                continue;
              } else if (typeof Downsha.Clip.SELF_CLOSING_NODES[nodeName] == 'undefined') {
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
              delete node.parentElement._downsha_float_;
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
                delete node.parentElement._downsha_float_;
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
        if (e instanceof DOMException && e.code == DOMException.SECURITY_ERR) {
            LOG.debug("Ignoring DOMException.SECURITY_ERR for node: " + Downsha.Utils.getNodeString(node));
        } else {
            LOG.error("Error serializing node: " + Downsha.Utils.getNodeString(node));
            throw e;
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
    var s = window.getComputedStyle(node);
    var sDisplay = s.getPropertyValue("display");
    var sVisibility = s.getPropertyValue("visibility");
    var sPosition = s.getPropertyValue("position");
    if (sDisplay != "none" && !(sVisibility == "hidden" && sPosition == "absolute")) {
      return true;
    }
    return false;
  };

  Downsha.Clip.prototype.serializeConditionalElement = function(node, nodeStyle) {
    var str = "";
    if (node && node.nodeType == Node.ELEMENT_NODE) {
    	var doc = node.ownerDocument || document;
      var url = (doc.URL) ? doc.URL : doc.location.href;
      var rules = null;
      
      /*
      var host = null;
      var match = url.match(/^https?:\/\/([-a-z0-9]+(?:\.[-a-z0-9]+)*\.[-a-z0-9]+)(?::[0-9]+)?(\/|$)/i);
      if (match) {
      	host = match[1].toLowerCase();
      }
      if (host && Downsha.Utils.HOST_ARTICLE_TABLE) {
      	for (var prop in Downsha.Utils.HOST_ARTICLE_TABLE) {
      		if (host.indexOf(prop) >= 0 && Downsha.Utils.HOST_ARTICLE_TABLE[prop]) {
      			rules = Downsha.Utils.HOST_ARTICLE_TABLE[prop];
      			break;
      		}
      	}
      }
      */
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
    					} else if (rule.d === "innerHTML") {
    						thumbValue = thumbNode.innerHTML;
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
	      		// DO NOT call escapeXML or escapeURL, otherwise values will be broken.
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

  Downsha.Clip.prototype.setStylingStrategy = function(strategy) {
    if (typeof strategy == 'function'
        && Downsha.inherits(strategy, Downsha.ClipStylingStrategy)) {
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

  Downsha.Clip.prototype.toString = function() {
    return "Downsha.Clip[" + this.location + "] ("
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
      "fullPage" : this.fullPage,
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
      fullPage : this.fullPage,
      sizeExceeded : this.sizeExceeded,
      contentLength : this.content.length
    };
  };
})();
