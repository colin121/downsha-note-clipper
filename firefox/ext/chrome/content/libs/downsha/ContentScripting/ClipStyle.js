/**
 * @author: chenmin
 * @date: 2012-03-06
 * @desc: Downsha.ClipStyle
 * ClipStyle is a container for CSS styles. It is able to add and remove
 * CSSStyleRules (and parse CSSRuleList's for rules), as well as
 * CSSStyleDeclaration's and instances of itself.
 * 
 * ClipStyle provides a mechanism to serialize itself via toString(), and
 * reports its length via length property. It also provides a method to clone
 * itself and expects to be manipulated via addStyle and removeStyle.
 */

(function() {
	Downsha.ClipStyle = function ClipStyle( css, filter ) {
	    this.__defineGetter__( "styleFilter", this.getFilter );
	    this.__defineSetter__( "styleFilter", this.setFilter );
	    this.initialize( css, filter );
	};
	
	Downsha.ClipStyle.stylePrefix = function( style ) {
	    if ( typeof style == 'string' ) {
	        var i = 0;
	        if ( (i = style.indexOf( "-" )) > 0 ) {
	            return style.substring( 0, i );
	        }
	    }
	
	    return style;
	};
	
	Downsha.ClipStyle.findFontFaceRules = function( doc ) {
	    var d = doc || document;
	    var sheets = d.styleSheets;
	    var fontFaceRules = [ ];
	
	    for ( var i = 0; i < sheets.length; i++ ) {
	        var sheet = sheets[ i ];
	        if ( sheet.cssRules ) {
	            for ( var r = 0; r < sheet.cssRules.length; r++ ) {
	                var rule = sheet.cssRules[ r ];
	                if ( rule instanceof CSSFontFaceRule ) {
	                    fontFaceRules.push( rule );
	                }
	            }
	        }
	    }
	
	    return fontFaceRules;
	};
	
	Downsha.ClipStyle.prototype.length = 0;
	Downsha.ClipStyle.prototype._filter = null;
	
	Downsha.ClipStyle.prototype.initialize = function( css, filter ) {
	    this.styleFilter = filter;
	    if ( css instanceof CSSRuleList || css instanceof Array ) {
	        if ( css.length > 0 ) {
	            for ( var i = 0; i < css.length; i++ ) {
	                this.addStyle( css[i].style );
	            }
	        }
	    }
	    else if ( css instanceof CSSStyleRule ) {
	        this.addStyle( css.style );
	    }
	    else if ( css instanceof CSSStyleDeclaration ) {
	        this.addStyle( css );
	    }
	    else if ( typeof css == 'object' && css != null ) {
	        this.addStyle( css );
	    }
	};
	
	Downsha.ClipStyle.prototype._addSimpleStyle = function( prop, val ) {
	    if ( typeof this[ prop ] == 'undefined' ) {
	        this.length++;
	    }
	    this[ prop ] = val;
	};
	
	Downsha.ClipStyle.STYLES = [
	    "background-attachment", "background-clip", "background-color", "background-image", "background-origin", "background-position",
	    "background-repeat", "background-size", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius",
	    "border-bottom-style", "border-bottom-width", "border-collapse", "border-left-color", "border-left-style", "border-left-width",
	    "border-right-color", "border-right-style", "border-right-width", "border-spacing", "border-top-color", "border-top-left-radius",
	    "border-top-right-radius", "border-top-style", "border-top-width", "bottom", "box-shadow", "caption-side", "clear", "clip",
	    "color", "content", "counter-increment", "counter-reset", "cursor", "direction", "display", "empty-cells", "float",
	    "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "height",
	    "ime-mode", "left", "letter-spacing", "line-height", "list-style-image", "list-style-position", "list-style-type",
	    "margin-bottom", "margin-left", "margin-right", "margin-top", "marker-offset", "max-height", "max-width", "min-height",
	    "min-width", "opacity", "outline-color", "outline-offset", "outline-style", "outline-width", "overflow", "overflow-x",
	    "overflow-y", "padding-bottom", "padding-left", "padding-right", "padding-top", "page-break-after", "page-break-before",
	    "pointer-events", "position", "resize", "right", "table-layout", "text-align", "text-decoration", "text-indent",
	    "text-overflow", "text-shadow", "text-transform", "top", "vertical-align", "visibility", "white-space", "width",
	    "word-spacing", "word-wrap", "z-index", "text-anchor"
	];
	
	Downsha.ClipStyle.prototype.addStyle = function( style ) {
	    if ( style instanceof CSSStyleDeclaration && style.length > 0 ) {
	        for ( var i = 0; i < Downsha.ClipStyle.STYLES.length; i++ ) {
	            var prop = Downsha.ClipStyle.STYLES[ i ];
	            var val = style.getPropertyValue( prop );
	
	            if ( ( this.styleFilter && !this.styleFilter( prop, val )) ) {
	                continue;
	            }
	
	            this._addSimpleStyle( prop, val );
	        }
	    }
	    else if ( style instanceof Downsha.ClipStyle ) {
	        for ( prop in style ) {
	            if ( typeof this.constructor.prototype[ prop ] == 'undefined' ) {
	                if ( this.styleFilter && !this.styleFilter( prop, style[ prop ] ) ) {
	                    continue;
	                }
	
	                val = style[ prop ];
	                this._addSimpleStyle( prop, val );
	            }
	        }
	    }
	    else if ( typeof style == 'object' && style != null ) {
	        for ( prop in style ) {
	            if ( this.styleFilter && !this.styleFilter( prop, style[ prop ] ) ) {
	                continue;
	            }
	
	            if ( typeof style[ prop ] != 'function' && typeof this.constructor.prototype[ prop ] == 'undefined' ) {
	                val = style[ prop ];
	                this._addSimpleStyle( prop, val );
	            }
	        }
	    }
	};
	
	Downsha.ClipStyle.prototype.removeStyle = function( style, fn ) {
	    var self = this;
	    function rem( prop, value ) {
	        if ( typeof self[ prop ] != 'undefined' && typeof self.constructor.prototype[ prop ] == 'undefined'
	             && (typeof fn == 'function' || self[ prop ] == value) ) {
	            if ( typeof fn != 'function' || (typeof fn == 'function' && fn( prop, self[prop], value )) ) {
	                if ( delete (self[prop]) ) {
	                    self.length--;
	                }
	            }
	        }
	    }
	
	    if ( style instanceof CSSStyleDeclaration && style.length > 0 ) {
	        for ( var i = 0; i < style.length; i++ ) {
	            var prop = style[ i ];
	            rem( prop, style.getPropertyValue( prop ) );
	        }
	    }
	    else if ( style instanceof Downsha.ClipStyle && style.length > 0 ) {
	        for ( prop in style ) {
	            rem( prop, style[ prop ] );
	        }
	    }
	    else if ( style instanceof Array ) {
	        for ( i = 0; i < style.length; i++ ) {
	            rem( style[ i ], this[ style[ i ] ] );
	        }
	    }
	    else if ( typeof style == 'string' ) {
	        rem( style, this[ style ] );
	    }
	};
	
	Downsha.ClipStyle.prototype.removeStyleIgnoreValue = function( style ) {
	    this.removeStyle( style, function( /*prop, propValue, value*/ ) {
	        return true;
	    } );
	};
	
	Downsha.ClipStyle.styleInArray = function( style, styleArray ) {
	    if ( typeof style != 'string' || !(styleArray instanceof Array) ) {
	        return false;
	    }
	
	    var i = -1;
		  var styleFull = style.toLowerCase();
		  var styleType = ((i = styleFull.indexOf("-")) > 0) ? styleFull.substring(0, i) : styleFull;
		  for (var i = 0; i < styleArray.length; i++) {
		    if (styleArray[i] == styleFull || styleArray[i] == styleType)
		      return true;
		  }
	    return false;
	};
	
	/**
	 * Derives to smaller set of style attributes by comparing differences with
	 * given style and makes sure that style attributes in matchSyle are preserved.
	 * This is useful for removing style attributes that are present in the parent
	 * node. In that case, the instance will contain combined style attributes, and
	 * the first argument to this function will be combined style attributes of the
	 * parent node. The second argument will contain matched style attributes. The
	 * result will contain only attributes that are free of duplicates while
	 * preserving uniqueness of the style represented by this instance.
	 */
	Downsha.ClipStyle.prototype.deriveStyle = function( style, matchStyle, keepArray ) {
	    this.removeStyle( style, function( prop, propValue, value ) {
	        if ( keepArray instanceof Array && Downsha.ClipStyle.styleInArray( prop, keepArray ) ) {
	            return false;
	        }
	        
	        return typeof matchStyle[ prop ] != 'undefined' && propValue == value;
	    } );
	};
	
	Downsha.ClipStyle.prototype.setFilter = function( filter ) {
	    if ( typeof filter == 'function' ) {
	        this._filter = filter;
	    }
	    else if ( filter == null ) {
	        this._filter = null;
	    }
	};
	
	Downsha.ClipStyle.prototype.getFilter = function() {
	    return this._filter;
	};
	
	Downsha.ClipStyle.prototype.mergeStyle = function( style, override ) {
	    if ( style instanceof Downsha.ClipStyle && style.length > 0 ) {
	        var undef = true;
	        for ( var i in style ) {
	            if ( typeof this.constructor.prototype[ i ] != 'undefined' || typeof this.__lookupSetter__( i ) != 'undefined' ) {
	                continue;
	            }
	
	            if ( (undef = (typeof this[ i ] == 'undefined')) || override ) {
	                this[ i ] = style[ i ];
	                if ( undef ) {
	                    this.length++;
	                }
	            }
	        }
	    }
	};
	
	Downsha.ClipStyle.prototype.clone = function() {
	    var clone = new Downsha.ClipStyle();
	    for ( var prop in this ) {
	        if ( typeof this.constructor.prototype[ prop ] == 'undefined' ) {
	            clone[ prop ] = this[ prop ];
	        }
	    }
	
	    clone.length = this.length;
	    return clone;
	};
	
	Downsha.ClipStyle.prototype.toString = function() {
	    var str = "";
	    var skip = {};
	
	    if (this["background-image"]) {
	        str += "background-image:" + this[ "background-image" ] + ";";
	        skip["background-image"] = true;
	    }
	    
	    if (this["background-position"]) {
	    	str += "background-position:" + this["background-position"] + ";";
	    } else if (this["background-position-x"] || this["background-position-y"]) {
	    	var _px = (this["background-position-x"]) ? this["background-position-x"] : "0%";
	    	var _py = (this["background-position-y"]) ? this["background-position-y"] : "0%";
	    	str += "background-position:" + _px + " " + _py + ";";
	    }
	    skip["background-position-x"] = true;
	    skip["background-position-y"] = true;
	    skip["background-position"] = true;
	    
			var _rx = (this["background-repeat-x"]) ? this["background-repeat-x"] : "initial";
			var _ry = (this["background-repeat-y"]) ? this["background-repeat-y"] : "initial";
			if (_rx == "initial" && _ry == "initial") {
				str += "background-repeat:" + this["background-repeat"] + ";";
			} else {
				str += "background-repeat:" + _rx + " " + _ry + ";";
			}    
	    skip["background-repeat-x"] = true;
	    skip["background-repeat-y"] = true;
	    skip["background-repeat"] = true;
	
	    if (this.length > 0) {
	        for (var i in this) {
	            if (typeof this[i] != 'string' || 
	            	typeof this.constructor.prototype[i] != 'undefined' || 
	            	this[i].length == 0 || 
	            	typeof skip[i] != 'undefined') {
	                continue;
	            }
	            str += i + ":" + this[i] + ";";
	        }
	    }
	    
	    return str;
	};
})();

(function() {
	/**************** Downsha.ClipStylingStrategy ****************/
	Downsha.ClipStylingStrategy = function ClipStylingStrategy( window ) {
	    this.initialize( window );
	};
	
	Downsha.ClipStylingStrategy.prototype.initialize = function( window ) {
	    this.window = window;
	};
	
	Downsha.ClipStylingStrategy.prototype.cleanUp = function() {
	    return true;
	};
	
	Downsha.ClipStylingStrategy.prototype.styleForNode = function( /*node, root, fullPage, parentStyle*/ ) {
	    return null;
	};
	
	Downsha.ClipStylingStrategy.prototype.getNodeView = function ( b ) {
	    var c = b.ownerDocument;
	    return (c.defaultView) ? c.defaultView : this.window;
	};
	
	Downsha.ClipStylingStrategy.prototype.getFontFaceRules = function( doc ) {
	    return Downsha.ClipStyle.findFontFaceRules( doc );
	};
	
	Downsha.ClipStylingStrategy.prototype.getNodeStyle = function( node, filter ) {    
	    var style = new Downsha.ClipStyle();
	    if ( node && typeof node.nodeType == 'number' && node.nodeType == 1 ) {
	        var doc = node.ownerDocument;
	        var view = (doc.defaultView) ? doc.defaultView : this.window;
	        style = new Downsha.ClipStyle( view.getComputedStyle( node, null ), filter );
	    }
	
	    return style;
	};
})();

(function() {
	/**************** Downsha.ClipTextStylingStrategy ****************/
	Downsha.ClipTextStylingStrategy = function ClipTextStylingStrategy( window ) {
	    this.initialize( window );
	};
	
	Downsha.inherit( Downsha.ClipTextStylingStrategy, Downsha.ClipStylingStrategy );
	
	Downsha.ClipTextStylingStrategy.COLOR_THRESH = 50;
	
	Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES = {
	    "b" : null,
	    "big" : null,
	    "em" : null,
	    "i" : null,
	    "small" : null,
	    "strong" : null,
	    "sub" : null,
	    "sup" : null,
	    "ins" : null,
	    "del" : null,
	    "s" : null,
	    "strike" : null,
	    "u" : null,
	    "code" : null,
	    "kbd" : null,
	    "samp" : null,
	    "tt" : null,
	    "var" : null,
	    "pre" : null,
	    "listing" : null,
	    "plaintext" : null,
	    "xmp" : null,
	    "abbr" : null,
	    "acronym" : null,
	    "address" : null,
	    "bdo" : null,
	    "blockquote" : null,
	    "q" : null,
	    "cite" : null,
	    "dfn" : null
	};
	
	Downsha.ClipTextStylingStrategy.STYLE_ATTRS = {
	    "font" : null,
	    "text" : null,
	    "color": null
	};
	
	Downsha.ClipTextStylingStrategy.prototype.isFormatNode = function( node ) {
	    return node && node.nodeType == 1 && typeof Downsha.ClipTextStylingStrategy.FORMAT_NODE_NAMES[ node.nodeName.toLowerCase() ] != 'undefined';
	};
	
	Downsha.ClipTextStylingStrategy.prototype.hasTextNodes = function( node ) {
	    if ( node && node.nodeType == 1 && node.childNodes.length > 0 ) {
	        for ( var i = 0; i < node.childNodes.length; i++ ) {
	            if ( node.childNodes[ i ].nodeType == 3 ) {
	                return true;
	            }
	        }
	    }
	
	    return false;
	};
	
	Downsha.ClipTextStylingStrategy.prototype.styleFilter = function( style ) {
	    var s = Downsha.ClipStyle.stylePrefix( style.toLowerCase() );
	    if ( typeof Downsha.ClipTextStylingStrategy.STYLE_ATTRS[ s ] != 'undefined' ) {
	        return true;
	    }
	};
	
	Downsha.ClipTextStylingStrategy.prototype.styleForNode = function( node/*, root, fullPage, parentStyle*/ ) {
	    var nodeStyle = null;
	    if ( this.isFormatNode( node ) || this.hasTextNodes( node ) ) {
	        nodeStyle = this.getNodeStyle( node, this.styleFilter );
	    }
	
	    if ( nodeStyle && nodeStyle.color ) {
	        var color = nodeStyle.color;
	        var colorParts = color.replace( /[^0-9,\s]+/g, "" ).replace( /[,\s]+/g, " " ).split( /\s+/ );
	
	        var r = parseInt( colorParts[0] );
	        r = (isNaN( r )) ? 0 : r;
	
	        var g = parseInt( colorParts[1] );
	        g = (isNaN( g )) ? 0 : r;
	
	        var b = parseInt( colorParts[2] );
	        b = (isNaN( b )) ? 0 : b;
	
	        if ( (r + g + b) > (255 - Downsha.ClipTextStylingStrategy.COLOR_THRESH) * 3 ) {
	            r = Math.max( 0, r - Downsha.ClipTextStylingStrategy.COLOR_THRESH );
	            g = Math.max( 0, g - Downsha.ClipTextStylingStrategy.COLOR_THRESH );
	            b = Math.max( 0, b - Downsha.ClipTextStylingStrategy.COLOR_THRESH );
	        }
	
	        nodeStyle.color = (colorParts.length == 4) ? ("rgba(" + [r, g, b, 1].join( ", " ) + ")") : ("rgb(" + [r, g, b].join( ", " ) + ")");
	    }
	
	    return nodeStyle;
	};
})();

(function() {
  var LOG = null;
	/**************** Downsha.ClipFullStylingStrategy ****************/
	Downsha.ClipFullStylingStrategy = function ClipFullStylingStrategy( window ) {
		LOG = Downsha.Logger.getInstance();
		this.initialize(window);
	};
	
	Downsha.inherit(Downsha.ClipFullStylingStrategy, Downsha.ClipStylingStrategy);
	
	Downsha.ClipFullStylingStrategy.ALWAYS_KEEP = {
		"*": ["quotes", "height", "width", "margin", "padding", "top", "left", "right", "bottom", "float", "clear", "background",
		"background-image", "background-color", "background-position", "background-repeat", "border-bottom-color", "border-collapse",
		"border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-left-color",
		"border-left-style", "border-left-width", "border-right-color", "border-right-style", "border-right-width", "border-spacing",
		"border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width",
		"display", "font", "font-size", "color", "text-decoration", "list-style-type", "margin-bottom", "margin-left",
		"margin-right", "margin-top"],
		"img": ["width", "height"]
	};
	
	Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node, root, fullPage, parentStyle) {
		var matchedStyle = this.getNodeStyle(node, null);
		if (!parentStyle && node.parentNode) {
			parentStyle = this.getNodeStyle(node.parentNode, null);
		}
		
		var keepers = Downsha.ClipFullStylingStrategy.ALWAYS_KEEP["*"];
		matchedStyle.deriveStyle(parentStyle, matchedStyle, keepers);
		
		if (fullPage) {
			this.evaluateWidth(root, node, matchedStyle, parentStyle);
		}
		
		var isRoot = (node == root || node.nodeName == "BODY") ? true : false;
		if (isRoot) { // special handling of root element
			LOG.debug("Handling extra styles for root element");
			// remove unnecessary margin from root element
			matchedStyle._addSimpleStyle("padding", "0px");
			matchedStyle._addSimpleStyle("margin", "0px");
			
			if (matchedStyle["position"]) {
				matchedStyle["position"] = "relative";
			}
			else {
				matchedStyle._addSimpleStyle("position", "relative");
			}
			
			if (!fullPage) {
				this.processRootNodeStyles( node, matchedStyle, false );
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
			for (var i = 0; i < inlineStyle.length; i++) {
				matchedStyle._addSimpleStyle(inlineStyle[i], inlineStyle.getPropertyValue(inlineStyle[i]));
			}
		}
		
		matchedStyle.removeStyle("quotes");
		return matchedStyle;
	};
	
	Downsha.ClipFullStylingStrategy.prototype.evaluateWidth = function(root, node, styles, parentStyle) {
		if ((parseInt(styles["margin-left"]) == 0 && parseInt(styles["margin-right"]) == 0) 
			&& ((parseInt(parentStyle.width) - parseInt(node.offsetWidth)) / 2 == parseInt(node.offsetLeft))) {
			styles._addSimpleStyle("margin-left", "auto");
			styles._addSimpleStyle("margin-right", "auto");
		}
	};
	
	Downsha.ClipFullStylingStrategy.prototype.processRootNodeStyles = function(rootNode, matchedStyle, isBgStylesInherit) {
		LOG.debug("Handling extra styles for root element");
		
		matchedStyle._addSimpleStyle("padding", "0px");
		matchedStyle._addSimpleStyle("margin", "0px");
		matchedStyle._addSimpleStyle("position", "relative");
		
		if (isBgStylesInherit) {
			var bgStyle = this._inhBackgroundForNode(rootNode, true);
			
			if (matchedStyle["background-image"] == "none") {
				matchedStyle.removeStyle("background-image");
				matchedStyle.removeStyle("background-repeat");
				matchedStyle.removeStyle("background-position");
			}
			
			if (matchedStyle["background-color"] == "transparent") {
				matchedStyle.removeStyle("background-color");
			}
			
			if (bgStyle.length > 0) {
				matchedStyle.mergeStyle(bgStyle, false);
			}
			
			// deduce font properties on root element if not fullPage
			var fontStyle = this._inhFontForNode( rootNode, true );
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
		
		if (typeof rootNode._downsha_absolute_xOffset == 'number' && typeof rootNode._downsha_absolute_yOffset == 'number') {
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
		
		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		
		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;
		
		return {top: Math.round(top), left: Math.round(left)}
	};
	
	Downsha.ClipFullStylingStrategy.prototype._inhBackgroundForNode = function(node, recur) {
		LOG.debug("ClipFullStylingStrategy._inhBackgroundForNode()");
		
		var parent = node.parentNode;
		var styles = [ ];
		var nodes = [ ];
		
		var bgExtraAttrs = [
			"background-repeat-x",
			"background-repeat-y",
			"background-position-x",
			"background-position-y",
			"background-origin",
			"background-size"
		];
		
		var topElement = (this.window.document.body.parentNode) ? this.window.document.body.parentNode : this.window.document.body;
		while (parent) {
			nodes.push(parent);
			styles.push(this.getNodeStyle(parent, function(p, v) {
				if ((p == "background-color") || (p == "background-image" && v != "none") 
					|| (bgExtraAttrs.indexOf(p) >= 0) || p == "opacity" || p == "filter") {
					return true;
				}
				
				return false;
			}));
			
			if (!recur || parent == topElement) {
				break;
			} else {
				parent = parent.parentNode;
			}
		}
		
		LOG.debug( "Retracted " + styles.length + " styles" );
		var bgStyle = new Downsha.ClipStyle();
		var _bgColorSet = 0;
		
		for (var i = 0; i < styles.length; i++) {
			var s = styles[i];
			var n = nodes[i];
			
			// set background-color - it's the most important one...
			if (s["background-color"] && s["background-color"] != "transparent" 
				&& !s["background-color"].match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)/) && !bgStyle["background-color"]) {
				LOG.debug("Setting background-color: " + s["background-color"]);
				_bgColorSet = i;
				bgStyle._addSimpleStyle("background-color", s["background-color"]);
			}
			
			// set background image only if it hasn't been set already and the bg color
			// wasn't set previously; also determine repetition and positioning
			if (s["background-image"] && !bgStyle["background-image"] && (i == _bgColorSet || !bgStyle["background-color"])) {
				LOG.debug("Adding background-image: " + s["background-image"]);
				bgStyle._addSimpleStyle("background-image", s["background-image"]);
				
				for (var x = 0; x < bgExtraAttrs.length; x++) {
					var bgAttr = bgExtraAttrs[x];
					if (s[bgAttr] && bgAttr.indexOf("background-repeat") < 0) {
						LOG.debug("Adding " + bgAttr);
						bgStyle._addSimpleStyle(bgAttr, s[bgAttr]);
					}
				}
				
				var _rx = (s["background-repeat-x"] && s["background-repeat-x"] != "initial") ? s["background-repeat-x"] : "no-repeat";
				var _ry = (s["background-repeat-y"] && s["background-repeat=y"] != "initial") ? s["background-repeat-y"] : "no-repeat";
				
				bgStyle._addSimpleStyle("background-repeat-x", _rx);
				bgStyle._addSimpleStyle("background-repeat-y", _rx);
				bgStyle._addSimpleStyle("background-repeat", _rx + " " + _ry);
				
				if (n) {
					LOG.debug("Dettermining background image offset");
					
					var bgNodeRect = this.getOffsetRect(n);
					var nodeRect = this.getOffsetRect(node);
					var yDelta = nodeRect.top - bgNodeRect.top;
					var xDelta = nodeRect.left - bgNodeRect.left;
					
					LOG.debug("xDelta: " + xDelta + "; yDelta: " + yDelta);
					
					var view = this.getNodeView(n);
					var bgNodeComputedStyle = view.getComputedStyle(n, null);
					var bgPosition = bgNodeComputedStyle.getPropertyValue("background-position").split(" ");
					var bgNodeBgPosX = bgPosition[0];
					var bgNodeBgPosY = bgPosition[1];
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
					
					var xOffset = 0 - xDelta + origPosX;
					var yOffset = 0 - yDelta + origPosY;
					
					LOG.debug("xOffset: " + xOffset + "; yOffset: " + yOffset);
					bgStyle._addSimpleStyle("background-position", xOffset + "px " + yOffset + "px");
				}
			}
			
			if (s.opacity && !bgStyle.opacity && !isNaN(parseFloat(s.opacity)) 
				&& (typeof bgStyle.opacity == 'undefined' || parseFloat(s.opacity) < parseFloat(bgStyle.opacity))) {
				bgStyle._addSimpleStyle("opacity", s.opacity);
			}
			
			if (s.filter && !bgStyle.filter && (typeof bgStyle.filter == 'undefined' 
				|| parseFloat(s.filter.replace(/[^0-9]+/g, "")) < parseFloat(bgStyle.filter.replace(/[^0-9]+/g, "")))) {
				bgStyle._addSimpleStyle("filter", s.filter);
			}
		}
		
		return bgStyle;
	};
	
	Downsha.ClipFullStylingStrategy.prototype._inhFontForNode = function(node, recur) {
		var parent = node.parentNode;
		var styles = [ ];
		var nodes = [ ];
		var attrs = [ "font-family", "color", "line-height" ];
		
		while (parent) {
			nodes.push(parent);
			styles.push(this.getNodeStyle(parent, function(p/*, v */) {
				if (attrs.indexOf(p) >= 0) {
					return true;
				}
				return false;
			}));
			
			if (!recur || parent == this.window.document.body) {
				break;
			}
			else {
				parent = parent.parentElement;
			}
		}
		
		var fontStyle = new Downsha.ClipStyle();
		for (var i = 0; i < styles.length; i++) {
			var s = styles[i];
			for (var a = 0; a < attrs.length; a++) {
				if (!fontStyle[attrs[a]] && s[attrs[a]]) {
					LOG.debug("Adding " + attrs[a] + ": " + s[attrs[a]]);
					fontStyle._addSimpleStyle(attrs[a], s[attrs[a]]);
				}
			}
		}
		
		return fontStyle;
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
