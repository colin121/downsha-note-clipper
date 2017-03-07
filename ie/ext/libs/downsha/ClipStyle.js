/**
 * @author: chenmin
 * @date: 2011-10-24
 * @desc: Downsha.ClipStyle
 * Downsha.ClipStyle is a container for CSS styles. It is able to add and
 * remove CSSStyleRules (and parse CSSRuleList's for rules), as well as
 * CSSStyleDeclaration's and instances of itself.
 * 
 * Downsha.ClipStyle provides a mechanism to serialize itself via toString(),
 * and reports its length via length property. It also provides a method to
 * clone itself and expects to be manipulated via addStyle and removeStyle.
 */

(function() {
	Downsha.ClipStyle = function ClipStyle(css, filter) {
	  this.initialize(css, filter);
	};
	Downsha.ClipStyle.stylePrefix = function(style) {
	  if (typeof style == 'string') {
	    var i = 0;
	    if ((i = style.indexOf("-")) > 0) {
	      return style.substring(0, i);
	    }
	  }
	  return style;
	};
	Downsha.ClipStyle.findFontFaceRules = function(doc) {
	  var d = doc || document;
	  var sheets = d.styleSheets;
	  var fontFaceRules = [];
	  for ( var i = 0; i < sheets.length; i++) {
	    var sheet = sheets[i];
	    if (sheet.cssRules) {
	      for ( var i = 0; i < sheet.cssRules.length; i++) {
	        var rule = sheet.cssRules[i];
	        if ((typeof CSSFontFaceRule != "undefined") && (rule instanceof CSSFontFaceRule)) {
	          fontFaceRules.push(rule);
	        }
	      }
	    }
	  }
	  return fontFaceRules;
	};
	Downsha.ClipStyle.PERIMETERS = [ "top", "right", "bottom", "left" ];
	Downsha.ClipStyle.CORNOR_PERIMETERS = [ "top-left", "top-right", "bottom-right", "bottom-left" ];
	Downsha.ClipStyle.PERIMETER_PROPS = {
	  "margin" : null,
	  "padding" : null
	};
	Downsha.ClipStyle.PERIMETER_EXTRA_PROPS = {
	  "border" : [ "width", "style", "color" ],
	  "border-top" : [ "width", "style", "color" ],
	  "border-right" : [ "width", "style", "color" ],
	  "border-bottom" : [ "width", "style", "color" ],
	  "border-left" : [ "width", "style", "color" ],
	  "outline" : [ "width", "style", "color" ]
	};
	Downsha.ClipStyle.STYLES = [ // for IE9 currently keep 89 elements
    "background-attachment", "background-clip", "background-color", "background-image", "background-origin", "background-position",
    "background-repeat", "background-size", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius",
    "border-bottom-style", "border-bottom-width", "border-collapse", "border-left-color", "border-left-style", "border-left-width",
    "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-top-color", "border-top-left-radius",
    "border-top-right-radius", "border-top-style", "border-top-width", "bottom", "box-shadow", "caption-side", "clear", "clip",
    "color", "content", "counter-increment", "counter-reset", "cursor", "direction", "display", "empty-cells", "float",
    "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "height",
    /*"ime-mode", */"left", "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type",
    "margin-bottom", "margin-left", "margin-right", "margin-top", /*"marker-offset", */"max-height", "max-width", "min-height",
    "min-width", "opacity", "outline-color", /*"outline-offset", */"outline-style", "outline-width", "overflow", "overflow-x",
    "overflow-y", "padding-bottom", "padding-left", "padding-right", "padding-top", /*"page-break-after", "page-break-before",
    "pointer-events", */"position", /*"resize", */"right", "table-layout", "text-align", "text-anchor", "text-decoration", "text-indent",
    "text-overflow", /*"text-shadow", */"text-transform", "top", "vertical-align", "visibility", "white-space", "width",
    "word-spacing", /*"word-wrap", */"z-index"
	];
	
	// http://msdn.microsoft.com/en-us/library/ms535231(v=VS.85).aspx
	// http://www.hbcms.com/main/dhtml/objects/currentstyle.html
	Downsha.ClipStyle.STYLE_TRANSLATIONS = { // for IE 6/7/8 currently keep 78 elements
		//"accelerator"               : "-ms-accelerator", 
		//"background"                : "background", 
    "backgroundAttachment"        : "background-attachment", 
    //"backgroundClip"            : "background-clip",            // N/A in IE7
    "backgroundColor"             : "background-color", 
    "backgroundImage"             : "background-image", 
    //"backgroundOrigin"          : "background-origin",          // N/A in IE7
    //"backgroundPosition"        : "background-position",        // N/A in IE7, use backgroundPositionX/Y
    "backgroundPositionX"         : "background-position-x", 
    "backgroundPositionY"         : "background-position-y", 
    "backgroundRepeat"            : "background-repeat", 
    //"backgroundSize"            : "background-size",            // N/A in IE7
    
    "borderBottomColor"           : "border-bottom-color", 
    //"borderBottomLeftRadius"    : "border-bottom-left-radius",  // N/A in IE7
    //"borderBottomRightRadius"   : "border-bottom-right-radius", // N/A in IE7
    "borderBottomStyle"           : "border-bottom-style", 
    "borderBottomWidth"           : "border-bottom-width", 
    "borderCollapse"              : "border-collapse", 
    "borderLeftColor"             : "border-left-color", 
    "borderLeftStyle"             : "border-left-style", 
    "borderLeftWidth"             : "border-left-width",
    "borderRightColor"            : "border-right-color", 
    "borderRightStyle"            : "border-right-style", 
    "borderRightWidth"            : "border-right-width", 
    "borderSpacing"               : "border-spacing", 
    "borderTopColor"              : "border-top-color", 
    //"borderTopLeftRadius"       : "border-top-left-radius",     // N/A in IE7
    //"borderTopRightRadius"      : "border-top-right-radius",    // N/A in IE7
    "borderTopStyle"              : "border-top-style", 
    "borderTopWidth"              : "border-top-width", 
    
    "bottom"                      : "bottom", 
    //"boxShadow"                 : "box-shadow",                 // N/A in IE7
    "captionSide"                 : "caption-side", 
    "clear"                       : "clear", 
    "clip"                        : "clip",
    "color"                       : "color", 
    "content"                     : "content", 
    //"counterIncrement"          : "counter-increment", 
    //"counterReset"              : "counter-reset", 
    "cursor"                      : "cursor", 
    "direction"                   : "direction", 
    "display"                     : "display", 
    "emptyCells"                  : "empty-cells", 
    "styleFloat"                  : "float",
    "fontFamily"                  : "font-family", 
    "fontSize"                    : "font-size", 
    //"fontSizeAdjust"            : "font-size-adjust",           // N/A in IE7
    //"fontStretch"               : "font-stretch",               // N/A in IE7
    "fontStyle"                   : "font-style", 
    "fontVariant"                 : "font-variant", 
    "fontWeight"                  : "font-weight", 
    "height"                      : "height",
    //"imeMode"                   : "ime-mode",                   // [-ms-ime-mode] Gets the state of an Input Method Editor (IME).
    "left"                        : "left", 
    "letterSpacing"               : "letter-spacing", 
    "lineHeight"                  : "line-height", 
    "listStyleImage"              : "list-style-image", 
    "listStylePosition"           : "list-style-position", 
    "listStyleType"               : "list-style-type",
    "marginBottom"                : "margin-bottom", 
    "marginLeft"                  : "margin-left", 
    "marginRight"                 : "margin-right", 
    "marginTop"                   : "margin-top", 
    //""                          : "marker-offset", 
    "maxHeight"                   : "max-height", 
    "maxWidth"                    : "max-width", 
    "minHeight"                   : "min-height", 
    "minWidth"                    : "min-width", 
    "opacity"                     : "opacity", 
    "outlineColor"                : "outline-color", 
    //""                          : "outline-offset", 
    "outlineStyle"                : "outline-style", 
    "outlineWidth"                : "outline-width", 
    "overflow"                    : "overflow", 
    "overflowX"                   : "overflow-x", 
    "overflowY"                   : "overflow-y", 
    "paddingBottom"               : "padding-bottom", 
    "paddingLeft"                 : "padding-left", 
    "paddingRight"                : "padding-right", 
    "paddingTop"                  : "padding-top", 
    /*
    "pageBreakAfter"              : "page-break-after",  // [for Print] Gets a value indicating whether a page break occurs after the object.
    "pageBreakBefore"             : "page-break-before", // [for Print] Gets a string indicating whether a page break occurs before the object.
    "pointerEvents"               : "pointer-events",    // Gets or sets a value that specifies under what circumstances a given graphics element can be the target element for a pointer event in SVG.
    */
    "position"                    : "position", 
    //""                          : "resize", 
    "right"                       : "right", 
    "tableLayout"                 : "table-layout", 
    "textAlign"                   : "text-align", 
    "textAnchor"                  : "text-anchor", 
    "textDecoration"              : "text-decoration", 
    "textIndent"                  : "text-indent", 
    "textOverflow"                : "text-overflow", 
    //""                          : "text-shadow", 
    "textTransform"               : "text-transform", 
    "top"                         : "top", 
    "verticalAlign"               : "vertical-align", 
    "visibility"                  : "visibility", 
    "whiteSpace"                  : "white-space", 
    "width"                       : "width",
    "wordSpacing"                 : "word-spacing", 
    //"wordWrap"                  : "word-wrap",         // [-ms-word-wrap] Gets whether to break words when the content exceeds the boundaries of its container.
    "zIndex"                      : "z-index"
  };

	Downsha.ClipStyle.prototype.length = 0;
	Downsha.ClipStyle.prototype.styleFilter = null;
	Downsha.ClipStyle.prototype.initialize = function(css, filter) {
	  this.setFilter(filter);
	  var constructorName = Downsha.Utils.getConstructorName(css);
	  if ((constructorName == "CSSRuleList") || 
	  	((typeof CSSRuleList != "undefined") && (typeof css == 'object' && css instanceof CSSRuleList)) || 
	  	(typeof css == 'object' && css instanceof Array)) {
		  /**
		   * CSSRuleList includes a list of CSSRule objects, which may be following 7 kind of instances.
		   * CSSCharsetRule, CSSFontFaceRule, CSSImportRule, CSSMediaRule, CSSPageRule, CSSStyleRule, CSSUnknownRule.
		   * window.getMatchedCSSRules() returns a CSSRuleList object of specified node.
		   * document.styleSheets[x].cssRules (IE 9/Firefox/Chrome) also returns a CSSRuleList in the style sheet.
		   * document.styleSheets[x].rules (IE 6/7/8/9) is similar as cssRules, 
		   * except that rules does not contain @import declarations.
		   */
	    if (css.length > 0) {
	      for ( var i = 0; i < css.length; i++) {
	        this.addStyle(css[i].style);
	      }
	    }
	  } else if ((constructorName == "CSSStyleRule") || 
	  	((typeof CSSStyleRule != "undefined") && (typeof css == 'object' && css instanceof CSSStyleRule))) {
	    this.addStyle(css.style);
	  } else if ((constructorName == "CSSStyleDeclaration") || // for IE 9
	  	((typeof CSSStyleDeclaration != "undefined") && (typeof css == 'object' && css instanceof CSSStyleDeclaration))) {
	  	/**
	  	 * window.getComputedStyle() returns a CSSStyleDeclaration object of specified node.
	  	 * CSSStyleRule.getStyle() also returns a CSSStyleDeclaration object.
	  	 */
	    this.addStyle(css);
	  } else if (typeof css == "object" && css != null) { // for IE 6/7/8
	    this.addStyle(css);
	  }
	};
	Downsha.ClipStyle.prototype._addPerimeterStyle = function(prop, val) {
	  var valParts = val.replace(/\s+/, " ").split(" ");
	  if (valParts.length == 1) {
	    valParts = valParts.concat(valParts, valParts, valParts);
	  } else if (valParts.length == 2) {
	    valParts = valParts.concat(valParts[0], valParts[1]);
	  } else if (valParts.length == 3) {
	    valParts = valParts.concat(valParts[1]);
	  } else if (valParts.length == 0) {
	    valParts = [ "auto", "auto", "auto", "auto" ];
	  }
	  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	    var p = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
	    this._addSimpleStyle(p, valParts[i]);
	  }
	};
	Downsha.ClipStyle.prototype._addPerimeterExtraStyle = function(prop, val) {
	  var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
	  if (extras instanceof Array) {
	    var valParts = val.replace(/\s+/g, " ").split(" ");
	    var re = new RegExp(Downsha.ClipStyle.PERIMETERS.join("|"), "i");
	    var perimetered = (prop.match(re)) ? true : false;
	    for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	      for ( var e = 0; e < extras.length; e++) {
	        var p = prop
	            + ((perimetered) ? "" : "-" + Downsha.ClipStyle.PERIMETERS[i])
	            + "-" + extras[e];
	        if (valParts[e]) {
	          this._addSimpleStyle(p, valParts[e]);
	        }
	      }
	      if (perimetered) {
	        break;
	      }
	    }
	  }
	};
	Downsha.ClipStyle.prototype._addSimpleStyle = function(prop, val) {
	  if (typeof this[prop] == 'undefined') {
	    this.length++;
	  }
	  this[prop] = val;
	};
	Downsha.ClipStyle.prototype.addStyle = function(style) {
		var constructorName = Downsha.Utils.getConstructorName(style);
	  if (((constructorName == "CSSStyleDeclaration") || // for IE 9 CSSStyleDeclaration object
	  	((typeof CSSStyleDeclaration != "undefined") && (typeof style == 'object' && style instanceof CSSStyleDeclaration))) && 
	  	(style.length > 0)) {
	  	// enumerate fixed style array rather than all styles
	    //for (var i = 0; i < style.length; i++) {
	    //	var prop = style[i];
	    for (var i = 0; i < Downsha.ClipStyle.STYLES.length; i++) {
	    	var prop = Downsha.ClipStyle.STYLES[i];
	      var val = style.getPropertyValue(prop); // getPropertyValue is NOT supported in IE 6/7/8
	      if (this.styleFilter && !this.styleFilter(prop, val)) {
	        continue;
	      }
	      if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
	        this._addPerimeterStyle(prop, val);
	      } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
	        this._addPerimeterExtraStyle(prop, val);
	      } else {
	        this._addSimpleStyle(prop, val);
	      }
	    }
	  } else if (typeof style == 'object' && style instanceof Downsha.ClipStyle) {
	    for ( var prop in style) {
	      if (typeof this.constructor.prototype[prop] == 'undefined') {
	        var val = style[prop];
	        if (this.styleFilter && !this.styleFilter(prop, val)) {
	          continue;
	        }
	        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
	          this._addPerimeterStyle(prop, val);
	        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
	          this._addPerimeterExtraStyle(prop, val);
	        } else {
	          this._addSimpleStyle(prop, val);
	        }
	      }
	    }
	  } else if (typeof style == 'object' && style != null) { // for IE 6/7/8  currentStyle object
	    for (var i in Downsha.ClipStyle.STYLE_TRANSLATIONS) {
	    	var prop = Downsha.ClipStyle.STYLE_TRANSLATIONS[i];
	    	var val = style.getAttribute(i); // style[i]
	      if (this.styleFilter && !this.styleFilter(prop, val)) {
	        continue;
	      }
        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
          this._addPerimeterStyle(prop, val);
        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
          this._addPerimeterExtraStyle(prop, val);
        } else {
          this._addSimpleStyle(prop, val);
        }
      }
	    /*
	    for (var prop in style) {
	      if (typeof style[prop] != 'function'
	          && typeof this.constructor.prototype[prop] == 'undefined') {
	        var val = style[prop];
		      if (this.styleFilter && !this.styleFilter(prop, val)) {
		        continue;
		      }
	        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
	          this._addPerimeterStyle(prop, val);
	        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
	          this._addPerimeterExtraStyle(prop, val);
	        } else {
	          this._addSimpleStyle(prop, val);
	        }
	      }
	    }
	    */
	  }
	};
	Downsha.ClipStyle.prototype.removeStyle = function(style, fn) {
		var constructorName = Downsha.Utils.getConstructorName(style);
	  var self = this;
	  function rem(prop, value) {
	    if (typeof self[prop] != 'undefined' // make sure we have this property
	        && typeof self.constructor.prototype[prop] == 'undefined' // this property is not inherited from prototype
	        && (typeof fn == 'function' || self[prop] == value)) {
	      // we will delete this property either value is equal or the filter function returns true.
	      if (typeof fn != 'function' || (typeof fn == 'function' && fn(prop, self[prop], value))) {
	        if (delete (self[prop]))
	          self.length--;
	      }
	    }
	  }
	  if (((constructorName == "CSSStyleDeclaration") || 
	  	((typeof CSSStyleDeclaration != "undefined") && (typeof style == 'object' && style instanceof CSSStyleDeclaration))) && 
	  	(style.length > 0)) {
	    for ( var i = 0; i < style.length; i++) {
	      var prop = style[i];
	      var val = style.getPropertyValue(prop);
	      rem(prop, val);
	    }
	  } else if (typeof style == 'object' && style instanceof Downsha.ClipStyle && style.length > 0) {
	    for ( var prop in style) {
	      rem(prop, style[prop]);
	    }
	  } else if (typeof style == 'object' && style instanceof Array) {
	    for ( var i = 0; i < style.length; i++) {
	      rem(style[i], this[style[i]]);
	    }
	  } else if (typeof style == 'string') {
	    rem(style, this[style]);
	  } else {
	  }
	};
	Downsha.ClipStyle.prototype.removeStyleIgnoreValue = function(style) {
	  this.removeStyle(style, function(prop, propValue, value) {
	    return true;
	  });
	};
	Downsha.ClipStyle.styleInArray = function(style, styleArray) {
	  if (typeof style != 'string' || !(styleArray instanceof Array)) {
	    return false;
	  }
	  var i = -1;
	  var styleFull = style.toLowerCase();
	  // chenmin 2012-07-09 ##### fast speed for IE only #####
	  // IE style array only contains specific styles, e.g. font-family, font-size, not just font.
	  for (var i = 0; i < styleArray.length; i++) {
	    if (styleArray[i] == styleFull)
	      return true;
	  }
	  /*
	  var styleType = ((i = styleFull.indexOf("-")) > 0) ? styleFull.substring(0, i) : styleFull;
	  for (var i = 0; i < styleArray.length; i++) {
	    if (styleArray[i] == styleFull || styleArray[i] == styleType)
	      return true;
	  }
	  */
	  return false;
	};
	/**
	 * Derives to smaller set of style attributes by comparing differences with
	 * given style and makes sure that style attributes in matchStyle are preserved.
	 * This is useful for removing style attributes that are present in the parent
	 * node. In that case, the instance will contain combined style attributes, and
	 * the first argument to this function will be combined style attributes of the
	 * parent node. The second argument will contain matched style attributes. The
	 * result will contain only attributes that are free of duplicates while
	 * preserving uniqueness of the style represented by this instance.
	 */
	Downsha.ClipStyle.prototype.deriveStyle = function(style, matchStyle, keepArray) {
	  this.removeStyle(style, function(prop, propValue, value) { // property will be removed only if this function returns true
	    if (keepArray instanceof Array && Downsha.ClipStyle.styleInArray(prop, keepArray))
	      return false;
	    
	    // chenmin 2012-07-06  ##### bug fixes: remove property only if it exists in matchStyle ##### 
	    //return ((!matchStyle || (typeof matchStyle[prop] == 'undefined')) && propValue == value);
	    return (typeof matchStyle[prop] != 'undefined' && propValue == value);
	  });
	};
	Downsha.ClipStyle.prototype.setFilter = function(filter) {
	  if (typeof filter == 'function') {
	    this.styleFilter = filter;
	  } else if (filter == null) {
	    this.styleFilter = null;
	  }
	};
	Downsha.ClipStyle.prototype.getFilter = function() {
	  return this.styleFilter;
	};
	Downsha.ClipStyle.prototype.mergeStyle = function(style, override) {
	  if (style instanceof Downsha.ClipStyle && style.length > 0) {
	    var undef = true;
	    for ( var i in style) {
	      if (typeof this.constructor.prototype[i] != 'undefined'
	          || (typeof this.__lookupSetter__ != 'undefined' 
	          	&& typeof this.__lookupSetter__(i) != 'undefined')) {
	        continue;
	      }
	      if ((undef = (typeof this[i] == 'undefined')) || override) {
	        this[i] = style[i];
	        if (undef) {
	          this.length++;
	        }
	      }
	    }
	  }
	};
	Downsha.ClipStyle.prototype.clone = function() {
	  var clone = new Downsha.ClipStyle();
	  for ( var prop in this) {
	    if (typeof this.constructor.prototype[prop] == 'undefined') {
	      clone[prop] = this[prop];
	    }
	  }
	  clone.length = this.length;
	  return clone;
	};
	Downsha.ClipStyle.prototype.toString_background = function(skipObj) { // special handle of background styles
	  var str = "";
	  if (this["background-color"] && 
	  	this["background-color"] != "transparent" && 
	  	this["background-color"] != "rgba(0, 0, 0, 0)") {
	    str += "background-color:" + this["background-color"] + ";";
	  }
	  
	  // The background-clip property specifies the painting area of the background.
	  if (this["background-clip"] && 
	  	this["background-clip"] != "border-box") {
	    str += "background-clip:" + this["background-clip"] + ";";
	  }
	  
		if (this["background-image"] && this["background-image"] != "none") {
			str += "background-image:" + this["background-image"] + ";";
			
			// The background-position property sets the starting position of a background image.
			if (this["background-position"]) {
				str += "background-position:" + this["background-position"] + ";";
			} else if (this["background-position-x"] || this["background-position-y"]) {
				var _px = (this["background-position-x"]) ? this["background-position-x"] : "0%";
				var _py = (this["background-position-y"]) ? this["background-position-y"] : "0%";
				str += "background-position:" + _px + " " + _py + ";";
			}
			
			// The background-origin property specifies what the background-position property should be relative to.
			if (this["background-origin"]) {
				str += "background-origin:" + this["background-origin"] + ";";
			}
			
			// The background-repeat property sets if/how a background image will be repeated.
			if (this["background-repeat"]) {
				str += "background-repeat:" + this["background-repeat"] + ";";
			} else if (this["background-repeat-x"] || this["background-repeat-y"]) {
				var _rx = (this["background-repeat-x"]) ? this["background-repeat-x"] : "initial";
				var _ry = (this["background-repeat-y"]) ? this["background-repeat-y"] : "initial";
				if (_rx != "initial" || _ry != "initial") {
					str += "background-repeat:" + _rx + " " + _ry + ";";
				}
			}
			
			// The background-attachment property sets whether a background image is fixed or scrolls with the rest of the page.
			if (this["background-attachment"]) {
				str += "background-attachment:" + this["background-attachment"] + ";";
			}
			
			// The background-size property specifies the size of the background images.
			if (this["background-size"]) {
				str += "background-size:" + this["background-size"] + ";";
			}
		}
		
	  if (skipObj) {
	  	skipObj["background"]            = null;
	    skipObj["background-color"]      = null;
	    skipObj["background-clip"]       = null;
	    skipObj["background-image"]      = null;
	    skipObj["background-position"]   = null;
	    skipObj["background-position-x"] = null;
	    skipObj["background-position-y"] = null;
	    skipObj["background-origin"]     = null;
	    skipObj["background-repeat"]     = null;
	    skipObj["background-repeat-x"]   = null;
	    skipObj["background-repeat-y"]   = null;
	    skipObj["background-attachment"] = null;
	    skipObj["background-size"]       = null;
	  }
	  
	  if (str.length == 0) {
	    str += "background:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_margin = function(skipObj) { // special handle of margin styles
		var str = "";
		if (this["margin"]) {
			str = "margin:" + this["margin"] + ";";
		} else {
			str = this._toPerimeterString("margin");
		}
	  
	  if (skipObj) {
	  	skipObj["margin"]        = null;
	    skipObj["margin-top"]    = null;
	    skipObj["margin-right"]  = null;
	    skipObj["margin-bottom"] = null;
	    skipObj["margin-left"]   = null;
	  }
	  
	  if (str.length == 0) {
	    str = "margin:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_padding = function(skipObj) { // special handle of padding styles
		var str = "";
		if (this["padding"]) {
			str = "padding:" + this["padding"] + ";";
		} else {
			str = this._toPerimeterString("padding");
		}
	  
	  if (skipObj) {
	  	skipObj["padding"]        = null;
	    skipObj["padding-top"]    = null;
	    skipObj["padding-right"]  = null;
	    skipObj["padding-bottom"] = null;
	    skipObj["padding-left"]   = null;
	  }
	  
	  if (str.length == 0) {
	    str = "padding:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_border = function(skipObj) { // special handle of border styles
	  //var str = this._toPerimeterExtraString("border");
	  var str = "";
	  var borderStyleProp = "";
	  var borderWidthProp = "";
	  var borderColorProp = "";
	  for (var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	  	borderStyleProp = "border-" + Downsha.ClipStyle.PERIMETERS[i] + "-style";
	  	borderWidthProp = "border-" + Downsha.ClipStyle.PERIMETERS[i] + "-width";
	  	borderColorProp = "border-" + Downsha.ClipStyle.PERIMETERS[i] + "-color";
			if (this[borderStyleProp] && this[borderStyleProp] != "none" &&
					this[borderWidthProp] && this[borderWidthProp] != "0px") {
			  /**
			   * The border property is a shorthand for the following individual border properties:
			   * border-width, border-style (required), border-color
			   * Example: "border:5px solid red";
			  */
				str += "border-" + Downsha.ClipStyle.PERIMETERS[i] + ":";
				if (this[borderWidthProp]) {
					str += this[borderWidthProp] + " ";
				}
				str += this[borderStyleProp];
				if (this[borderColorProp]) {
					str += " " + this[borderColorProp];
				}
				str += ";";
			}
	  }
	  
	  if (skipObj) {
	  	skipObj["border"]              = null;
	    skipObj["border-top-width"]    = null;
	    skipObj["border-top-style"]    = null;
	    skipObj["border-top-color"]    = null;
	    skipObj["border-right-width"]  = null;
	    skipObj["border-right-style"]  = null;
	    skipObj["border-right-color"]  = null;
	    skipObj["border-bottom-width"] = null;
	    skipObj["border-bottom-style"] = null;
	    skipObj["border-bottom-color"] = null;
	    skipObj["border-left-width"]   = null;
	    skipObj["border-left-style"]   = null;
	    skipObj["border-left-color"]   = null;
	  }
	  
	  if (str.length == 0) {
	    str = "border:none;";
	  }
	  return str;
	};
	Downsha.ClipStyle.prototype.toString_border_radius = function(skipObj) { // special handle of border radius styles
	  var valParts = [];
	  var missing = false;
	  var str = "";
	  
	  for (var i = 0; i < Downsha.ClipStyle.CORNOR_PERIMETERS.length; i++) {
	    valParts[i] = this["border-" + Downsha.ClipStyle.CORNOR_PERIMETERS[i] + "-radius"];
	    if (!valParts[i]) {
	      missing = true;
	      break;
	    }
	  }
	  
	  /**
	   * The four values for each radius are given in the order top-left, top-right, bottom-right, bottom-left. 
	   * If bottom-left is omitted it is the same as top-right. 
	   * If bottom-right is omitted it is the same as top-left. 
	   * If top-right is omitted it is the same as top-left.
	  */
	  if (missing) {
	  } else if (valParts[0] == valParts[1] && valParts[1] == valParts[2] && valParts[2] == valParts[3]) {
	    str = "border-radius:" + valParts[0] + ";";
	  } else {
	    str = "border-radius:" + valParts.join(" ") + ";";
	  }
	  
	  if (skipObj) {
	  	skipObj["border-radius"]              = null;
	    skipObj["border-top-left-radius"]     = null;
	    skipObj["border-top-right-radius"]    = null;
	    skipObj["border-bottom-left-radius"]  = null;
	    skipObj["border-bottom-right-radius"] = null;
	  }

	  return str;
	};
	Downsha.ClipStyle.prototype.toString_outline = function(skipObj) {
		//var str = this._toPerimeterExtraString("outline");
		var str = "";
		if (this["outline-style"] && this["outline-style"] != "none") {
		/**
		 * The outline shorthand property sets all the outline properties in one declaration.
		 * The properties that can be set, are (in order): outline-color, outline-style, outline-width.
		 * If one of the values above are missing, e.g. "outline:solid #ff0000;", 
		 * the default value for the missing property will be inserted, if any.
		 */			
			str += "outline:";
			if (this["outline-color"]) {
				str += this["outline-color"] + " ";
			}
			str += this["outline-style"];
			if (this["outline-width"]) {
				str += " " + this["outline-width"];
			}
			str += ";";
		}
	  
	  if (skipObj) {
	  	skipObj["outline"]       = null;
	    skipObj["outline-style"] = null;
	    skipObj["outline-width"] = null;
	    skipObj["outline-color"] = null;
	  }
	  
	  return str;
	};
	Downsha.ClipStyle.prototype._toPerimeterString = function(prop) {
	  var valParts = [];
	  var allEqual = true;
	  var missing = false;
	  var str = "";
	  
	  for (var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	    valParts[i] = this[prop + "-" + Downsha.ClipStyle.PERIMETERS[i]];
	    if (valParts[i]) {
	    	// chenmin 2012-07-09 ##### fast speed for IE only #####
	    	// IE style array only contains specific styles, e.g. margin-top, margin-right, not just margin.
	      //str += prop + "-" + Downsha.ClipStyle.PERIMETERS[i] + ":" + valParts[i] + ";";
	    } else {
	      missing = true;
	    }
	    if (i > 0 && allEqual && valParts[i] != valParts[i - 1]) {
	      allEqual = false;
	    }
	  }
	  
	  if (missing) {
	    return str;
	  } else if (allEqual) {
	    valParts = [valParts[0]];
	  } else if (valParts[0] == valParts[2] && valParts[1] == valParts[3]) {
	    valParts = [valParts[0], valParts[1]];
	  }
	  return prop + ":" + valParts.join(" ") + ";";
	};
	Downsha.ClipStyle.prototype._toPerimeterExtraString = function(prop) {
	  var perimParts = [];
	  var allEqual = true;
	  var str = "";
	  
	  for (var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
	    var propPrefix = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
	    var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[propPrefix] || Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
	    if (extras instanceof Array) {
	      var part = "";
	      var partStr = "";
	      var missing = false;
	      
	      for ( var e = 0; e < extras.length; e++) {
	        var fullProp = propPrefix + "-" + extras[e];
	        if (this[fullProp]) {
	          part += this[fullProp] + ((e == extras.length - 1) ? "" : " ");
	          partStr += fullProp + ":" + this[fullProp] + ";";
	        } else {
	          missing = true;
	          allEqual = false;
	        }
	      }
	      
	      if (!missing) {
	        perimParts[i] = part;
	        str += propPrefix + ":" + part + ";";
	      } else {
	        str += partStr;
	      }
	    }
	    
	    if (i > 0 && allEqual && (!perimParts[i] || perimParts[i] != perimParts[i - 1])) {
	      allEqual = false;
	    }
	  }
	  
	  if (allEqual) {
	    return prop + ":" + perimParts[0] + ";";
	  } else {
	    return str;
	  }
	};
	Downsha.ClipStyle.prototype.toString = function() {
	  var str = "";
	  var skip = {};

		str += this.toString_background(skip);
		str += this.toString_margin(skip);
		str += this.toString_padding(skip);
		str += this.toString_border(skip);
		str += this.toString_border_radius(skip);
		str += this.toString_outline(skip);
	  
	  if (this.length > 0) {
	    for (var i in this) {
	      if (typeof this[i] != 'string'
	          || typeof this.constructor.prototype[i] != 'undefined'
	          || this[i].length == 0 || typeof skip[i] != 'undefined') {
	        continue;
	      }
	      str += i + ":" + this[i] + ";";
	    }
	  }
	  
	  return str;
	};	
	Downsha.ClipStyle.prototype.toJSON = function() {
	  var obj = {};
	  if (this.length > 0) {
	    for ( var i in this) {
	      if (typeof this[i] != 'string'
	          || typeof this.constructor.prototype[i] != 'undefined'
	          || this[i].length == 0)
	        continue;
	      obj[i] = this[i];
	    }
	  }
	  return obj;
	};
})();

(function() {
	Downsha.ClipStylingStrategy = function ClipStylingStrategy(win) {
	  this.initialize(win);
	};
	Downsha.ClipStylingStrategy.DEFAULT_FILTER = function(prop, val) {
	  // skip following styles: orphans, widows, speak, page-break, pointer-events
	  return (val && prop != "orphans" && prop != "widows" && prop != "speak"
	      && prop.indexOf("page-break") != 0 && prop.indexOf("pointer-events") != 0);
	};
	Downsha.ClipStylingStrategy.prototype.initialize = function(win) {
	  this.window = (win) ? win : window;
	};
	Downsha.ClipStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
	  return null;
	};
	Downsha.ClipStylingStrategy.prototype.getNodeView = function(node) {
	  var doc = (node.ownerDocument) ? node.ownerDocument : node.document;
	  var view = (doc.defaultView) ? doc.defaultView : this.window;
	  return view;
	};
	Downsha.ClipStylingStrategy.prototype.getNodeStyle = function(node, computed, filter) {
	  var thisFilter = (typeof filter == 'function') ? filter : Downsha.ClipStylingStrategy.DEFAULT_FILTER;
	  if (node && typeof node.nodeType == 'number' && node.nodeType == 1) { // element node
	    var view = this.getNodeView(node);
	    var computedStyleDefined = (typeof view["getComputedStyle"] == 'function') ? true : false;
	    var matchedRulesDefined = (typeof view["getMatchedCSSRules"] == 'function') ? true : false;
	    if (computed) { // getComputedStyle return current style of the element, however this style is set.
	      if (computedStyleDefined) { // for IE 9
		      return new Downsha.ClipStyle(view.getComputedStyle(node, ''), thisFilter);
		    } else if (node.currentStyle) { // for IE 6/7/8
		    	return new Downsha.ClipStyle(node.currentStyle, thisFilter);
		    	/*
		    	var currentStyle = {};
			    for (var prop in node.currentStyle) {
			    	// IE 6 returns 'unknown' for typeof node.currentStyle['rubyOverhang']
			      if ((typeof node.currentStyle[prop] == "string") ||
			       (typeof node.currentStyle[prop] == "number")) {
			        // if the css value is a unit we can try to compute, then try to convert it.
			        // currently, we only convert 4 kinds: em, ex, pt and percentage.
			        var val = node.currentStyle[prop];
			        // /^\d*\.?\d*\s*(em|ex|pt|%)$/i.test(val)
			        if ((typeof val == "string") && (val.length > 0) && (/^\d*\.?\d*\s*pt$/i.test(val))) {
			        	val = Math.round(Downsha.Utils.getPixelSize(node, val)) + "px";
			        }
			        // while window.getComputedStyle() in IE9/Firefox/Chrome refers style properties as hyphen cases.
			        // IE 6/7/8/9 style/currentStyle/runtimeStyle all refers style properties as camel case.
			        // now we need to transfer to hyphen case if it's a style/currentStyle/runtimeStyle object.
			        var hyphenProp = Downsha.Utils.toHyphenCase(prop);
			        currentStyle[hyphenProp] = val;
			      }
			    }
		    	return new Downsha.ClipStyle(currentStyle, thisFilter);
		    	*/
		    }
	    } else if (matchedRulesDefined) { // getMatchedCSSRules is only for webkit
	      return new Downsha.ClipStyle(view.getMatchedCSSRules(node, ''), thisFilter);
	    }
	  }
	  var clipStyle = new Downsha.ClipStyle();
	  clipStyle.setFilter(thisFilter);
	  return clipStyle;
	};
	Downsha.ClipStylingStrategy.prototype.getFontFaceRules = function() {
	  return Downsha.ClipStyle.findFontFaceRules(this.window.document);
	};
	Downsha.ClipStylingStrategy.prototype.cleanUp = function() {
	  return true;
	};
	Downsha.ClipStylingStrategy.prototype.styleForFloatClearingNode = function(node) {
		return null;
	};
})();


(function() {
	Downsha.ClipTextStylingStrategy = function ClipTextStylingStrategy(win) {
		this.initialize(win);
	};
	Downsha.inherit(Downsha.ClipTextStylingStrategy, Downsha.ClipStylingStrategy);
	Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES = {
		"b": null,
		"big": null,
		"em": null,
		"i": null,
		"small": null,
		"strong": null,
		"sub": null,
		"sup": null,
		"ins": null,
		"del": null,
		"s": null,
		"strike": null,
		"u": null,
		"code": null,
		"kbd": null,
		"samp": null,
		"tt": null,
		"var": null,
		"pre": null,
		"listing": null,
		"plaintext": null,
		"xmp": null,
		"abbr": null,
		"acronym": null,
		"address": null,
		"bdo": null,
		"blockquote": null,
		"q": null,
		"cite": null,
		"dfn": null
	};
	Downsha.ClipTextStylingStrategy.STYLE_ATTRS = {
		"font": null,
		"text": null,
		"color": null
	};
	Downsha.ClipTextStylingStrategy.COLOR_THRESH = 50; // maximum color value for human reading
	Downsha.ClipTextStylingStrategy.prototype.isFormatNode = function(node) {
		return (node && node.nodeType == 1 && // element node and in FORMAT_NODE_NAMES list
			typeof Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES[node.nodeName.toLowerCase()] != 'undefined');
	};
	Downsha.ClipTextStylingStrategy.prototype.hasTextNodes = function(node) {
		if (node && node.nodeType == 1 && node.childNodes.length > 0) { // whether parent is element node
			for (var i = 0; i < node.childNodes.length; i++) {
				if (node.childNodes[i].nodeType == 3) { // whether child is text node
					return true;
				}
			}
		}
		return false;
	};
	Downsha.ClipTextStylingStrategy.prototype.styleFilter = function(style) {
		var stylePrefix = Downsha.ClipStyle.stylePrefix(style.toLowerCase()); // *** only preserve styles prefix with color, font, text
		if (typeof Downsha.ClipTextStylingStrategy.STYLE_ATTRS[stylePrefix] != 'undefined') {
			return true;
		}
	};
	Downsha.ClipTextStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
		var nodeStyle = null;
		if (this.isFormatNode(node) || this.hasTextNodes(node)) {
			nodeStyle = this.getNodeStyle( // parent method, return a ClipStyle instance
				node, // only format nodes or nodes has text child.
				true, // use getComputedStyle
				this.styleFilter // only preserve styles prefix with color, font, text
			);
		}
		/**
		* adjust text color for better reading experience. (not too white)
		* suppose origin value: rgba(255,255,255,1), then changes to rgba(205,205,205,1)
		*/
		if (nodeStyle && nodeStyle["color"]){
			var color = nodeStyle["color"];
			var a = "";
			var colorParts = color.replace(/[^0-9,\s]+/g, "").replace(/[,\s]+/g, " ").split(/\s+/);
			var r = parseInt(colorParts[0]);
			r = (isNaN(r)) ? 0 : r;
			var g = parseInt(colorParts[1]);
			g = (isNaN(g)) ? 0 : r;
			var b = parseInt(colorParts[2]);
			b = (isNaN(b)) ? 0 : b;
			if ((r + g + b) > (255 - Downsha.ClipTextStylingStrategy.COLOR_THRESH)*3) {
				r = Math.max(0, r - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
				g = Math.max(0, g - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
				b = Math.max(0, b - Downsha.ClipTextStylingStrategy.COLOR_THRESH);
			}
			nodeStyle["color"] = (colorParts.length == 4) ? 
				"rgba(" + [r, g, b, 1].join(", ") + ")" : 
				"rgb(" + [r, g, b].join(", ") + ")";
		}
		// preserve direction, if it's not ltr(left-to-right), then add direction style
		if (nodeStyle && !nodeStyle["direction"]) {
			var computedStyle = this.getNodeStyle(node, true);
			if (computedStyle && computedStyle["direction"] && computedStyle["direction"] != "ltr") {
				nodeStyle._addSimpleStyle("direction", computedStyle["direction"]);
			}
		}
		return nodeStyle;
	};
})();


(function() {
  Downsha.ClipFullStylingStrategy = function ClipFullStylingStrategy(win) {
    this.initialize(win);
  };
  Downsha.inherit(Downsha.ClipFullStylingStrategy, Downsha.ClipStylingStrategy);
  /*
  Downsha.ClipFullStylingStrategy.SKIP_UNDEFINED_PROPS = { // [NOT USED] skip following undefined properties
    "widows" : null,
    "orphans" : null,
    "pointer-events" : null,
    "speak" : null
  };
  */
  /*
  Downsha.ClipFullStylingStrategy.SKIP_DEFAULT_PROPS = { // skip following key-value pair
  	"width"                      : "auto",        // Inherited: no
    "height"                     : "auto",        // Inherited: no
    "left"                       : "auto",        // Inherited: no
    "right"                      : "auto",        // Inherited: no
    "top"                        : "auto",        // Inherited: no
    "bottom"                     : "auto",        // Inherited: no
    
    "background-image"           : "none",        // Inherited: no
    "background-position"        : "0% 0%",       // Inherited: no
    "background-repeat"          : "repeat",      // Inherited: no
    "background-attachment"      : "scroll",      // Inherited: no
    "background-clip"            : "border-box",  // Inherited: no
    "background-color"           : "transparent", // Inherited: no
    "background-origin"          : "padding-box", // Inherited: no
    "background-size"            : "auto",        // Inherited: no
    
    "border-bottom-color"        : "transparent", // Inherited: no [not specified]
    "border-bottom-left-radius"  : "0px",         // Inherited: no
    "border-bottom-right-radius" : "0px",         // Inherited: no
    "border-bottom-style"        : "none",        // Inherited: no [not specified]
    "border-bottom-width"        : "0px",         // Inherited: no [medium]
    
    "border-top-color"           : "transparent", // Inherited: no [not specified]
    "border-top-left-radius"     : "0px",         // Inherited: no 
    "border-top-right-radius"    : "0px",         // Inherited: no 
    "border-top-style"           : "none",        // Inherited: no [not specified]
    "border-top-width"           : "0px",         // Inherited: no [medium]
    
    "border-left-color"          : "transparent", // Inherited: no [not specified] 
    "border-left-style"          : "none",        // Inherited: no [not specified] 
    "border-left-width"          : "0px",         // Inherited: no [medium]
    
    "border-right-color"         : "transparent", // Inherited: no [not specified] 
    "border-right-style"         : "none",        // Inherited: no [not specified] 
    "border-right-width"         : "0px",         // Inherited: no [medium]
    
    "border-collapse"            : "separate",    // Inherited: yes
    "border-spacing"             : "0px 0px",     // Inherited: yes [not specified] 
    
    "box-shadow"                 : "none",        // Inherited: no
    "caption-side"               : "top",         // Inherited: yes
    "clear"                      : "none",        // Inherited: no [auto]
    "clip"                       : "auto",        // Inherited: no
    //"color"                    : "",            // Inherited: yes [not specified] 
    "content"                    : "normal",      // Inherited: no
    "counter-increment"          : "none",        // Inherited: no
    "counter-reset"              : "none",        // Inherited: no
    "cursor"                     : "auto",        // Inherited: yes    
    "direction"                  : "ltr",         // Inherited: yes
    //"display"                  : "inline",      // Inherited: no
    "empty-cells"                : "show",        // Inherited: yes
    "float"                      : "none",        // Inherited: no [auto]
    
    //"font-family"              : "",            // Inherited: yes [not specified] 
    //"font-size"                : "medium",      // Inherited: yes
    "font-size-adjust"           : "none",        // Inherited: yes
    "font-stretch"               : "normal",      // Inherited: yes
    "font-style"                 : "normal",      // Inherited: yes
    "font-variant"               : "normal",      // Inherited: yes
    "font-weight"                : "normal",      // Inherited: yes
    
    "letter-spacing"             : "normal",      // Inherited: yes
    "list-style-image"           : "none",        // Inherited: yes
    "list-style-position"        : "outside",     // Inherited: yes
    "list-style-type"            : "none",        // Inherited: yes ["disc" for <ul> and "decimal" for <ol>]
    
    "margin-bottom"              : "0px",         // Inherited: no
    "margin-left"                : "0px",         // Inherited: no
    "margin-right"               : "0px",         // Inherited: no
    "margin-top"                 : "0px",         // Inherited: no
    
    "max-height"                 : "none",        // Inherited: no
    "max-width"                  : "none",        // Inherited: no
    "min-height"                 : "0px",         // Inherited: no
    "min-width"                  : "0px",         // Inherited: no
    
    "opacity"                    : "1",           // Inherited: no
    "outline-color"              : "transparent", // Inherited: no [invert]
    "outline-style"              : "none",        // Inherited: no
    "outline-width"              : "0px",         // Inherited: no [medium]
    
    "overflow"                   : "visible",     // Inherited: no
    "overflow-x"                 : "visible",     // Inherited: no
    "overflow-y"                 : "visible",     // Inherited: no
    
    "padding-bottom"             : "0px",         // Inherited: no
    "padding-left"               : "0px",         // Inherited: no
    "padding-right"              : "0px",         // Inherited: no
    "padding-top"                : "0px",         // Inherited: no
    
    //"position"                 : "static",      // Inherited: no
    
    "table-layout"               : "auto",        // Inherited: no
    "text-align"                 : "left",        // Inherited: yes [left if direction is ltr, and right if direction is rtl]
    "text-anchor"                : "start",
    "text-decoration"            : "none",        // Inherited: no
    "text-indent"                : "0px",         // Inherited: yes
    "text-overflow"              : "clip",        // Inherited: no
    "text-transform"             : "none",        // Inherited: yes
    
    "vertical-align"             : "baseline",    // Inherited: no
    //"visibility"               : "visible",     // Inherited: yes
    "word-spacing"               : "0px",         // Inherited: yes [normal]
    "z-index"                    : "auto"         // Inherited: no
  };
  */
	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP = { // no inherited styles. currently keep 48 elements
		"*": [
			"width", "height", "bottom", "left", "right", "top", 
			/*"font", */"font-size", "font-style", "font-variant", "font-weight", "color", 
			/*"background", */"background-image", "background-color", "background-position", "background-repeat", 
			/*"border-bottom", */"border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", 
			/*"border-left", */"border-left-color", "border-left-style", "border-left-width", 
			/*"border-right", */"border-right-color", "border-right-style", "border-right-width", 
			/*"border-top", */"border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
			"border-collapse", "border-spacing", 
			/*"margin", */"margin-bottom", "margin-left", "margin-right", "margin-top", 
			/*"padding", */"padding-bottom", "padding-left", "padding-right", "padding-top", 
			"clear", "display", "float", 
			/*"list-style", */"list-style-type", "position", "text-decoration"], 
		"img": ["width", "height"]
	};
	/*
  Downsha.ClipFullStylingStrategy.LIST_NODES = { // [NOT USED]
    "UL" : null,
    "OL" : null,
    "LI" : null
  };
  Downsha.ClipFullStylingStrategy.NODE_PROPS = { // [NOT USED]
    "BR" : [ "clear", "padding", "margin", "line-height", "border", "white-space" ]
  };
  Downsha.ClipFullStylingStrategy.TEXT_NODES = { // [NOT USED]
    "A" : null,
    "B" : null,
    "BIG" : null,
    "EM" : null,
    "I" : null,
    "SMALL" : null,
    "STRONG" : null,
    "SUB" : null,
    "SUP" : null,
    "INS" : null,
    "DEL" : null,
    "S" : null,
    "STRIKE" : null,
    "U" : null,
    "CODE" : null,
    "KBD" : null,
    "SAMP" : null,
    "TT" : null,
    "VAR" : null,
    "PRE" : null,
    "LISTING" : null,
    "PLAINTEXT" : null,
    "XMP" : null,
    "ABBR" : null,
    "ACRONYM" : null,
    "ADDRESS" : null,
    "BDO" : null,
    "BLOCKQUOTE" : null,
    "Q" : null,
    "CITE" : null,
    "DFN" : null
  };
  */
  /*
	Downsha.ClipFullStylingStrategy.prototype.styleFilter = function(prop, val) {
		if (typeof Downsha.ClipFullStylingStrategy.SKIP_DEFAULT_PROPS[prop] != 'undefined' && 
			Downsha.ClipFullStylingStrategy.SKIP_DEFAULT_PROPS[prop] == val) {
			return false;
		}
		
		return true;
	};
	*/
	Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
    
    var matchedStyle = this.getNodeStyle(node, true, null);
    var parentStyle = null;
    if (node.parentNode) {
    	parentStyle = this.getNodeStyle(node.parentNode, true, null);
    }
    
    var isRoot = (node == root || node.nodeName == "BODY") ? true : false;
    if (!isRoot) {
    	var keepers = Downsha.ClipFullStylingStrategy.ALWAYS_KEEP["*"];
    	matchedStyle.deriveStyle(parentStyle, matchedStyle, keepers);
    }

    if (fullPage) {
    	this.evaluateWidth(root, node, matchedStyle, parentStyle);
    }
    
    if (isRoot) { // special handling of root element
			// remove unnecessary margin from root element
			matchedStyle._addSimpleStyle("padding", "0px");
			matchedStyle._addSimpleStyle("margin", "0px");
			
			if (matchedStyle["position"]) {
				matchedStyle["position"] = "relative";
			} else {
				matchedStyle._addSimpleStyle("position", "relative");
			}
			
			if (!fullPage) {
				this.processRootNodeStyles(node, matchedStyle, false);
			}
    }

    // adjust absolute positioning on root and its immediate children when not fullPage
    if (!fullPage) {
	    var rect = this.getOffsetRect(root);
	    root._downsha_absolute_xOffset = rect.left;
	    root._downsha_absolute_yOffset = rect.top;    	
    	if (matchedStyle["position"] == "absolute") {
    		this.evaluateAbsolutePosition(root, node, matchedStyle);
    	}
    }

    // add inline style attributes
    if (typeof node.style != "undefined") {
			var inlineStyle = node.style;
			
			// the getPropertyValue() method works for IE 9/Firefox/Chrome.
			// the getAttribute() method provides similar functionality in IE all versions.
			if (inlineStyle.getPropertyValue) { // for IE 9
				// [typeof node.style.length] IE 6/7/8 returns undefined
				for (var i = 0; i < inlineStyle.length; i++) {
					matchedStyle._addSimpleStyle(inlineStyle[i], inlineStyle.getPropertyValue(inlineStyle[i]));
				}
			} else { // for IE 6/7/8
				// TODO style.cssText: "POSITION: relative; WIDTH: 100%; HEIGHT: 24px"
				// "Z-INDEX: 2147483647; BORDER-BOTTOM: 0px; POSITION: fixed; TEXT-ALIGN: left !important; 
				// BORDER-LEFT: 0px; PADDING-BOTTOM: 0px !important; PADDING-LEFT: 0px !important; WIDTH: 0px; 
				// PADDING-RIGHT: 0px !important; HEIGHT: 0px; VISIBILITY: visible; MARGIN-LEFT: 0px; FONT-SIZE: 0px; 
				//OVERFLOW: hidden; BORDER-TOP: 0px; BORDER-RIGHT: 0px; PADDING-TOP: 0px !important; TOP: 0px; LEFT: 0px"
				// LOG.debug("inlineStyle cssText: " + inlineStyle.cssText);
				/*
				for (var i in inlineStyle) {
					if (typeof inlineStyle[i] != 'function') {
						//LOG.debug("inlineStyle prop: " + i + " val: " + inlineStyle.getAttribute(i));
					}
				}
				*/
			}
    }
    
    // 2012-07-06 following code call Utils.absoluteUrl to make "background-image" url absolute. (add document base url)
		// suppose document base url is : "http://www.host.com/path", 
		// 1. url starts with "//", like: "//www.host.com/index.php", then change to: "http://www.host.com/index.php"
		// 2. url starts with "/", like: "/index.php", then change to: "http://www.host.com/index.php"
		// 3. url starts with "./", "../", like: "./index.php", then change to: "http://www.host.com/./index.php"
		// 4. url starts with other, like: "index.php", then change to: "http://www.host.com/path/index.php"
		var backgroundImage = matchedStyle["background-image"];
    if ((typeof backgroundImage == "string") && (backgroundImage.length > 0) && 
    (backgroundImage.substring(0, 3).toLowerCase().indexOf("url") == 0)) {
    	
    	var backgroundParts = backgroundImage.match(/url\s*\(\s*(?:\\)?['"]?\s*([-a-z0-9_:\\@&?=+,.!/~*%\\$]+)\s*(?:\\)?['"]?\s*\)/i);
    	if (backgroundParts && backgroundParts[1]) {
    		var imageUrl = backgroundParts[1];
				if ((typeof imageUrl == "string") && (imageUrl.length > 0) && 
					(imageUrl.substring(0, 4).toLowerCase().indexOf("http") != 0) && 
					(imageUrl.substring(0, 11).toLowerCase().indexOf("data:image/") != 0)) {
					
					var doc = (node.ownerDocument) ? node.ownerDocument : node.document;
					if (doc) {
						var docUrl = (doc.URL) ? doc.URL : doc.location.href;
						if (docUrl) {
							var baseUrl = docUrl.replace(/[^\/]+$/, ""); // trim end part of pathname
							if (baseUrl) {
								imageUrl = Downsha.Utils.absoluteUrl(imageUrl, baseUrl);
							}
						}
					}
				}
				if (imageUrl.substring(0, 4).toLowerCase().indexOf("http") == 0) {
					imageUrl = Downsha.Utils.escapeURL(imageUrl);
					matchedStyle["background-image"] = "url('" + imageUrl + "')";
				}
    	}
    }
    
    // 2012-07-06 "quotes" is NOT in style array of IE 6/7/8/9
    //matchedStyle.removeStyle("quotes");
    
    return matchedStyle;
  };

	Downsha.ClipFullStylingStrategy.prototype.evaluateWidth = function(root, node, styles, parentStyle) {
		if ((parseInt(styles["margin-left"]) == 0 && parseInt(styles["margin-right"]) == 0)
			&& ((parseInt(parentStyle.width) - parseInt(node.offsetWidth )) / 2 == parseInt(node.offsetLeft))) {
			styles._addSimpleStyle("margin-left", "auto");
			styles._addSimpleStyle("margin-right", "auto");
		}
	};

	Downsha.ClipFullStylingStrategy.prototype.processRootNodeStyles = function(rootNode, matchedStyle, isBgStylesInherit) {
		matchedStyle._addSimpleStyle("padding", "0px");
		matchedStyle._addSimpleStyle("margin", "0px");
		matchedStyle._addSimpleStyle("position", "relative");
		
		if (isBgStylesInherit) {
			var bgStyle = this._inhBackgroundForNode(rootNode, true);
			
			if (matchedStyle["background-image"] == "none") {
				matchedStyle.removeStyle( "background-image" );
				matchedStyle.removeStyle( "background-repeat" );
				matchedStyle.removeStyle( "background-position" );
			}
			
			if (matchedStyle["background-color"] == "transparent") {
				matchedStyle.removeStyle("background-color");
			}
			
			if (bgStyle.length > 0) {
				matchedStyle.mergeStyle(bgStyle, false);
			}
			
			// deduce font properties on root element if not fullPage
			var fontStyle = this._inhFontForNode(rootNode, true);
			if (fontStyle.length > 0) {
				matchedStyle.mergeStyle(fontStyle, false);
			}
			
			// remove floating on root element if not fullPage
			if (matchedStyle["float"]) {
				matchedStyle.removeStyle("float");
			}
		}
	};
	
	Downsha.ClipFullStylingStrategy.prototype.evaluateAbsolutePosition = function(rootNode, relativeNode, relativeNodeStyles) {
		if (!relativeNodeStyles) {
			relativeNodeStyles = this.getNodeStyle(relativeNode, null);
		}
		
		var rect = this.getOffsetRect(relativeNode);
		var xDelta = rect.left;
		var yDelta = rect.top;
		
		if (typeof rootNode._downsha_absolute_xOffset == 'number' && typeof rootNode._downsha_absolute_yOffset == 'number' ) {
			xDelta = Math.max(0, xDelta - rootNode._downsha_absolute_xOffset);
			yDelta = Math.max(0, yDelta - rootNode._downsha_absolute_yOffset);
			
			relativeNodeStyles._addSimpleStyle("left", xDelta + "px");
			relativeNodeStyles._addSimpleStyle("top", yDelta + "px");
		}
		else {
			rootNode._downsha_absolute_xOffset = xDelta;
			rootNode._downsha_absolute_yOffset = yDelta;
			
			relativeNodeStyles._addSimpleStyle("top", "0px");
			relativeNodeStyles._addSimpleStyle("left", "0px");
		}
		
		relativeNodeStyles.removeStyle("right");
		relativeNodeStyles.removeStyle("bottom");
	};
	
	Downsha.ClipFullStylingStrategy.prototype.getOffsetRect = function(elem) {
		var box = elem.getBoundingClientRect();
		var body = elem.ownerDocument.body;
		var docElem = elem.ownerDocument.documentElement;
		
		// pageXOffset/pageYOffset is NOT supported in IE 6/7/8
		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		
		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;
		
		return {top: Math.round(top), left: Math.round(left)};
	};
	/*
	Downsha.ClipFullStylingStrategy.prototype.styleFilter = function(style) {
		if (typeof Downsha.ClipFullStylingStrategy.SKIP_UNDEFINED_PROPS[style] != 'undefined') {
			return false;
		}
		return true;
	};
  Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
    var computedStyle = this.getNodeStyle(node, true, this.styleFilter); // getComputedStyle/currentStyle return list
    var isRoot = (node == root) ? true : false;
    
    if (isRoot) { // special handling of root element
      // remove unnecessary margin from root element
      // margin: 0px; position: relative
      computedStyle._addSimpleStyle("margin", "0px");
      if (computedStyle["position"]) {
        computedStyle["position"] = "relative";
      } else {
        computedStyle._addSimpleStyle("position", "relative");
      }
      if (!fullPage) {
        // deduce background properties on root element if not fullPage
        var bgStyle = this._inhBackgroundForNode(node, true);
        if (bgStyle.length > 0) {
          computedStyle.mergeStyle(bgStyle, false);
        }
        // deduce font properties on root element if not fullPage
        var fontStyle = this._inhFontForNode(node, true);
        if (fontStyle.length > 0) {
          computedStyle.mergeStyle(fontStyle, false);
        }
        // remove floating on root element if not fullPage
        if (computedStyle["float"]) {
          computedStyle.removeStyle("float");
        }
      }
    } else {
    	var parentNode = (node.parentNode) ? node.parentNode : node.parentElement;
    	if (parentNode) {
	    	var parentStyle = this.getNodeStyle(parentNode, true, this.styleFilter); //*** parent computed styles
	    	if (parentStyle) {
		      var keepers = (typeof Downsha.ClipFullStylingStrategy.ALWAYS_KEEP[node.nodeName.toLowerCase()] != 'undefined') ? 
		      	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP[node.nodeName.toLowerCase()] : 
		      	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP["*"];
		      // remove styles which already exists in parent node, 
		      // except those defined in nodeMatchedStyle (empty) and keepers (font,text,color,margin,padding,etc).
		      computedStyle.deriveStyle(parentStyle, null, keepers); // derive some styles from parent and matched
		    }
    	}
    }
    
    // because canvas elements do not preserve their drawn state, 
    // we preserve it via background-image property
    if (node.nodeName == "CANVAS" && typeof node.toDataURL == 'function') {
      computedStyle._addSimpleStyle("background-image", "url(" + node.toDataURL() + ")");
    } else if (node.nodeName == "OBJECT" || node.nodeName == "EMBED") {
      computedStyle._addSimpleStyle("width", computedStyle["width"]);
      computedStyle._addSimpleStyle("min-width", computedStyle["width"]);
      computedStyle._addSimpleStyle("max-width", computedStyle["width"]);
      computedStyle._addSimpleStyle("height", computedStyle["height"]);
      computedStyle._addSimpleStyle("min-height", computedStyle["height"]);
      computedStyle._addSimpleStyle("max-height", computedStyle["height"]);
      computedStyle._addSimpleStyle("display", computedStyle["display"]);
      computedStyle._addSimpleStyle("overflow", computedStyle["hidden"]);
    }
    
    // adjust absolute positioning on root and its immediate children when not fullPage
    // if position is absolute, then left -= margin-left, top -= margin-top
    if (!fullPage && (isRoot || node.parentElement == root)) {
      if (computedStyle["position"] == "absolute") {
        var rect = node.getBoundingClientRect();
        var ml = parseInt(computedStyle["margin-left"]);
        var mt = parseInt(computedStyle["margin-top"]);
        var xDelta = rect.left - ((isNaN(ml)) ? 0 : ml);
        var yDelta = rect.top - ((isNaN(mt)) ? 0 : mt);
        if (typeof root._downsha_absolute_xOffset == 'number'
            && typeof root._downsha_absolute_yOffset == 'number') {
          var xDelta = Math.max(0, xDelta - root._downsha_absolute_xOffset);
          var yDelta = Math.max(0, yDelta - root._downsha_absolute_yOffset);
          computedStyle._addSimpleStyle("left", xDelta + "px");
          computedStyle._addSimpleStyle("top", yDelta + "px");
        } else {
          root._downsha_absolute_xOffset = xDelta;
          root._downsha_absolute_yOffset = yDelta;
          computedStyle._addSimpleStyle("top", "0px");
          computedStyle._addSimpleStyle("left", "0px");
        }
        computedStyle.removeStyle("right");
        computedStyle.removeStyle("bottom");
      }
    }
    return computedStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._hasTextOnlyChildren = function(node) { // all children are text nodes
    if (node) {
    	var totalChildren = (node.childElementCount) ? node.childElementCount : node.children.length;
      if (totalChildren == 0) {
        return true;
      } else {
        for ( var i = 0; i < totalChildren; i++) {
          if (typeof this.constructor.TEXT_NODES[node.children[i]] == 'undefined') {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  };
  Downsha.ClipFullStylingStrategy.prototype._mergeBoundingRects = function(a, b) { //union set of two rects
    a.left = Math.min(a.left, b.left);
    a.right = Math.max(a.right, b.right);
    a.top = Math.min(a.top, b.top);
    a.bottom = Math.max(a.bottom, b.bottom);
    a.width = a.right - a.left;
    a.height = a.bottom - a.top;
  };
  */
  Downsha.ClipFullStylingStrategy.prototype._inhBackgroundForNode = function(node, recur) {
    LOG.debug("ClipFullStylingStrategy._inhBackgroundForNode");
    var parent = node.parentNode;
    var styles = []; // ancestor styles
    var nodes = []; // ancestor nodes
    var bgExtraAttrs = [
    	"background-repeat-x",
    	"background-repeat-y",
    	"background-position-x",
    	"background-position-y",
    	"background-origin",
    	"background-size" ];

    // walk up the DOM and grab parent elements that contain background specifics
    var topElement = (this.window.document.body.parentElement) ? 
    	this.window.document.body.parentElement : this.window.document.body;
    while (parent) {
      nodes.push(parent);
      styles.push(this.getNodeStyle(parent, true, function(p, v) { // filter function
        if ((p == "background-color")
            || (p == "background-image" && v != "none")
            || (bgExtraAttrs.indexOf(p) >= 0) || p == "opacity"
            || p == "filter") {
          return true;
        }
        return false;
      }));
      if (!recur || parent == topElement) {
        break;
      } else {
        parent = parent.parentElement;
      }
    }
    LOG.debug("Retracted " + styles.length + " styles");
    // walk thru all the collected styles (same order as traversing up the tree)
    // and gather background specifics
    var bgStyle = new Downsha.ClipStyle();
    var _bgColorSet = 0;
    for ( var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var n = nodes[i];
      // set background-color - it's the most important one...
      if (s["background-color"]
          && s["background-color"] != "transparent" // not transparent
          && !s["background-color"].match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/) // alpha != 0
          && !bgStyle["background-color"]) {
        LOG.debug("Setting background-color: " + s["background-color"]);
        _bgColorSet = i;
        bgStyle._addSimpleStyle("background-color", s["background-color"]);
      } // end background-color
      
      // set background image only if it hasn't been set already and the bg color
      // wasn't set previously; also determine repetition and positioning
      if (s["background-image"] && !bgStyle["background-image"]
          && (i == _bgColorSet || !bgStyle["background-color"])) {
        LOG.debug("Adding background-image: " + s["background-image"]);
        bgStyle._addSimpleStyle("background-image", s["background-image"]);
        for ( var x = 0; x < bgExtraAttrs.length; x++) {
          var bgAttr = bgExtraAttrs[x];
          if (s[bgAttr] && bgAttr.indexOf("background-repeat") < 0) { // skip repeat-x/y of background image
            LOG.debug("Adding " + bgAttr);
            bgStyle._addSimpleStyle(bgAttr, s[bgAttr]);
          }
        }
        // process repeat-x/y of background image now
        var _rx = (s["background-repeat-x"] && s["background-repeat-x"] != "initial") ? 
        	s["background-repeat-x"] : "no-repeat";
        var _ry = (s["background-repeat-y"] && s["background-repeat=y"] != "initial") ? 
        	s["background-repeat-y"] : "no-repeat";
        bgStyle._addSimpleStyle("background-repeat-x", _rx);
        bgStyle._addSimpleStyle("background-repeat-y", _rx);
        bgStyle._addSimpleStyle("background-repeat", _rx + " " + _ry);
        
        // compute exact position of background image
        if (n) {
          // get offset between ancstor node and current node
          LOG.debug("Dettermining background image offset");
          var bgNodeStyle = s;
          var bgNodeRect = n.getBoundingClientRect(); // ancestor node rect
          LOG.debug("bgNodeRect left: " + bgNodeRect.left + "; top: " + bgNodeRect.top);
          var nodeRect = node.getBoundingClientRect(); // current node rect
          LOG.debug("nodeRect left: " + nodeRect.left + "; top: " + nodeRect.top);
          var yDelta = nodeRect.top - bgNodeRect.top;
          var xDelta = nodeRect.left - bgNodeRect.left;
          LOG.debug("xDelta: " + xDelta + "; yDelta: " + yDelta);
          
          // get origin position of background image
          var view = this.getNodeView(n);
          if (typeof view.getComputedStyle != "undefined") {
	          var bgNodeComputedStyle = view.getComputedStyle(n);
	          var bgNodeBgPosX = bgNodeComputedStyle.getPropertyValue("background-position-x");
	          var bgNodeBgPosY = bgNodeComputedStyle.getPropertyValue("background-position-y");
	        } else if (n.currentStyle) {
	        	var bgNodeBgPosX = n.currentStyle.backgroundPositionX;
	        	var bgNodeBgPosY = n.currentStyle.backgroundPositionY;
	        }
          LOG.debug("bg position: " + bgNodeBgPosX + " " + bgNodeBgPosY);
          var origPosX = 0;
          var origPosY = 0;
          if (bgNodeBgPosX.indexOf("%") > 0) {
            origPosX = bgNodeRect.width * (parseInt(bgNodeBgPosX) / 100);
          } else {
            origPosX = parseInt(bgNodeBgPosX);
          }
          if (bgNodeBgPosY.indexOf("%") > 0) {
            origPosY = bgNodeRect.height * (parseInt(bgNodeBgPosY) / 100);
          } else {
            origPosY = parseInt(bgNodeBgPosY);
          }
          if (isNaN(origPosX)) {
            origPosX = 0;
          }
          if (isNaN(origPosY)) {
            origPosY = 0;
          }
          LOG.debug("origPosX: " + origPosX + "; origPosY: " + origPosY);
          
          // compute new position of background image
          var xOffset = 0 - xDelta + origPosX;
          var yOffset = 0 - yDelta + origPosY;
          LOG.debug("xOffset: " + xOffset + "; yOffset: " + yOffset);
          bgStyle._addSimpleStyle("background-position", xOffset + "px " + yOffset + "px");
        }
      } // end background-image
      
      if (s["opacity"]
          && !bgStyle["opacity"]
          && !isNaN(parseFloat(s["opacity"]))
          && (typeof bgStyle["opacity"] == 'undefined' || parseFloat(s["opacity"]) < parseFloat(bgStyle["opacity"]))) {
        bgStyle._addSimpleStyle("opacity", s["opacity"]);
      } // end opacity
      
      if (s["filter"]
          && !bgStyle["filter"]
          && (typeof bgStyle["filter"] == 'undefined' || parseFloat(s["filter"]
              .replace(/[^0-9]+/g, "")) < parseFloat(bgStyle["filter"].replace(
              /[^0-9]+/g, "")))) {
        bgStyle._addSimpleStyle("filter", s["filter"]);
      } // end filter
    }
    return bgStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._inhFontForNode = function(node, recur) {
    var parent = node.parentNode;
    var styles = [];
    var nodes = [];
    var attrs = [ "font-family", "color", "line-height" ]; // only need these styles
    
    // walk up the DOM and grab parnet elements that contain background specifics
    while (parent) {
      nodes.push(parent);
      styles.push(this.getNodeStyle(parent, true, function(p, v) {
        if (attrs.indexOf(p) >= 0) {
          return true;
        }
        return false;
      }));
      if (!recur || parent == this.window.document.body) {
        break;
      } else {
        parent = parent.parentElement;
      }
    }
    
    // walk thru all the collected styles (same order as traversing up the tree)
    // and gather background specifics
    var bgStyle = new Downsha.ClipStyle();
    for ( var i = 0; i < styles.length; i++) {
      var s = styles[i];
      var n = nodes[i];
      for ( var a = 0; a < attrs.length; a++) {
        if (!bgStyle[attrs[a]] && s[attrs[a]]) {
          LOG.debug("Adding " + attrs[a] + ": " + s[attrs[a]]);
          bgStyle._addSimpleStyle(attrs[a], s[attrs[a]]);
        }
      }
    }
    return bgStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype.cleanUp = function() {
    /*
    if (this._dirty) {
      var els = this.window.document.getElementsByTagName("*");
      for ( var i = 0; i < els.length; i++) {
        delete els[i][this.constructor.COMPUTED_STYLE_KEY];
      }
    }
    */
    return true;
  };
  Downsha.ClipFullStylingStrategy.prototype.styleForFloatClearingNode = function(node) {
    if (node) {
      var style = new Downsha.ClipStyle();
      style._addSimpleStyle("clear", "both");
      style._addSimpleStyle("width", "0px");
      style._addSimpleStyle("height", "0px");
      return style;
    }
    return null;
  };
})();
