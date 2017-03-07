/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: Downsha.ClipStyle
 * Downsha.ClipStyle is a container for CSS styles. It is able to add and
 * remove CSSStyleRules (and parse CSSRuleList's for rules), as well as
 * CSSStyleDeclaration's and instances of itself.
 * 
 * Downsha.ClipStyle provides a mechanism to serialize itself via toString(),
 * and reports its length via length property. It also provides a method to
 * clone itself and expects to be manipulated via addStyle and removeStyle.
 */

Downsha.ClipStyle = function ClipStyle(css, filter) {
  this.__defineGetter__("styleFilter", this.getFilter);
  this.__defineSetter__("styleFilter", this.setFilter);
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
      for ( var r = 0; r < sheet.cssRules.length; r++) {
        var rule = sheet.cssRules[r];
        if (rule instanceof CSSFontFaceRule) {
          fontFaceRules.push(rule);
        }
      }
    }
  }
  return fontFaceRules;
};
Downsha.ClipStyle.PERIMETERS = [ "top", "right", "bottom", "left" ];
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
Downsha.ClipStyle.prototype.length = 0;
Downsha.ClipStyle.prototype._filter = null;
Downsha.ClipStyle.prototype.initialize = function(css, filter) {
  this.styleFilter = filter;
  if (css instanceof CSSRuleList || css instanceof Array) { // CSSRuleList and CSSStyleRule is the result of getMatchedCSSRules
    if (css.length > 0) {
      for ( var i = 0; i < css.length; i++) {
        this.addStyle(css[i].style);
      }
    }
  } else if (css instanceof CSSStyleRule) {
    this.addStyle(css.style);
  } else if (css instanceof CSSStyleDeclaration) { // CSSStyleDeclaration is the result of getComputedStyle
    this.addStyle(css);
  } else if (typeof css == 'object' && css != null) {
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
  if (style instanceof CSSStyleDeclaration && style.length > 0) {
    for ( var i = 0; i < style.length; i++) {
      var prop = style[i];
      if (this.styleFilter
          && !this.styleFilter(prop, style.getPropertyValue(prop))) {
        continue;
      }
      var val = style.getPropertyValue(prop);
      if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
        this._addPerimeterStyle(prop, val);
      } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
        this._addPerimeterExtraStyle(prop, val);
      } else {
        this._addSimpleStyle(prop, val);
      }
    }
  } else if (style instanceof Downsha.ClipStyle) {
    for ( var prop in style) {
      if (typeof this.constructor.prototype[prop] == 'undefined') {
        if (this.styleFilter && !this.styleFilter(prop, style[prop])) {
          continue;
        }
        var val = style[prop];
        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
          this._addPerimeterStyle(prop, val);
        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
          this._addPerimeterExtraStyle(prop, val);
        } else {
          this._addSimpleStyle(prop, val);
        }
      }
    }
  } else if (typeof style == 'object' && style != null) {
    for ( var prop in style) {
      if (this.styleFilter && !this.styleFilter(prop, style[prop])) {
        continue;
      }
      if (typeof style[prop] != 'function'
          && typeof this.constructor.prototype[prop] == 'undefined') {
        var val = style[prop];
        if (typeof Downsha.ClipStyle.PERIMETER_PROPS[prop] != 'undefined') {
          this._addPerimeterStyle(prop, val);
        } else if (typeof Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop] != 'undefined') {
          this._addPerimeterExtraStyle(prop, val);
        } else {
          this._addSimpleStyle(prop, val);
        }
      }
    }
  }
};
Downsha.ClipStyle.prototype.removeStyle = function(style, fn) {
  var self = this;
  function rem(prop, value) {
    if (typeof self[prop] != 'undefined'
        && typeof self.constructor.prototype[prop] == 'undefined'
        && (typeof fn == 'function' || self[prop] == value)) {
      if (typeof fn != 'function'
          || (typeof fn == 'function' && fn(prop, self[prop], value))) {
        if (delete (self[prop]))
          self.length--;
      }
    }
  }
  if (style instanceof CSSStyleDeclaration && style.length > 0) {
    for ( var i = 0; i < style.length; i++) {
      var prop = style[i];
      rem(prop, style.getPropertyValue(prop));
    }
  } else if (style instanceof Downsha.ClipStyle && style.length > 0) {
    for ( var prop in style) {
      rem(prop, style[prop]);
    }
  } else if (style instanceof Array) {
    for ( var i = 0; i < style.length; i++) {
      rem(style[i], this[style[i]]);
    }
  } else if (typeof style == 'string') {
    rem(style, this[style]);
  }
};
Downsha.ClipStyle.prototype.removeStyleIgnoreValue = function(style) {
  this.removeStyle(style, function(prop, propValue, value) {
    return true;
  });
};
Downsha.ClipStyle.styleInArray = function(style, styleArray) {
  if (typeof style != 'string' || !(styleArray instanceof Array))
    return false;
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
 * given style and makes sure that style attributes in matchStyle are preserved.
 * This is useful for removing style attributes that are present in the parent
 * node. In that case, the instance will contain combined style attributes, and
 * the first argument to this function will be combined style attributes of the
 * parent node. The second argument will contain matched style attributes. The
 * result will contain only attributes that are free of duplicates while
 * preserving uniqueness of the style represented by this instance.
 */
Downsha.ClipStyle.prototype.deriveStyle = function(style, matchStyle,
    keepArray) {
  this.removeStyle(style, function(prop, propValue, value) {
    if (keepArray instanceof Array
        && Downsha.ClipStyle.styleInArray(prop, keepArray))
      return false;
    return (typeof matchStyle[prop] != 'undefined' && propValue == value);
  });
};
Downsha.ClipStyle.prototype.setFilter = function(filter) {
  if (typeof filter == 'function') {
    this._filter = filter;
  } else if (filter == null) {
    this._filter = null;
  }
};
Downsha.ClipStyle.prototype.getFilter = function() {
  return this._filter;
};
Downsha.ClipStyle.prototype.mergeStyle = function(style, override) {
  if (style instanceof Downsha.ClipStyle && style.length > 0) {
    var undef = true;
    for ( var i in style) {
      if (typeof this.constructor.prototype[i] != 'undefined'
          || typeof this.__lookupSetter__(i) != 'undefined') {
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
Downsha.ClipStyle.prototype.toString_background = function(skipObj) {
  var str = "";
  if (typeof this["background-color"] != 'undefined'
      && this["background-color"] != "rgba(0, 0, 0, 0)") {
    str += "background: " + this["background-color"];
  }
  if (typeof this["background-image"] != 'undefined') {
    if (this["background-image"] != "none") {
      str += " " + this["background-image"];
      if (typeof this["background-position"] != 'undefined') {
        str += " " + this["background-position"];
      }
      if (typeof this["background-repeat"] != 'undefined') {
        str += " " + this["background-repeat"];
      }
    }
  }
  if (skipObj) {
    skipObj["background-color"] = null;
    skipObj["background-image"] = null;
    skipObj["background-position"] = null;
    skipObj["background-repeat"] = null;
  }
  if (str.length == 0) {
    str += "background:none;";
  } else if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_outline = function(skipObj) {
  var str = this._toPerimeterExtraString("outline");
  if (skipObj) {
    skipObj["outline-style"] = null;
    skipObj["outline-width"] = null;
    skipObj["outline-color"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  } else if (str.length == 0) {
    str = "outline:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_margin = function(skipObj) {
  var str = this._toPerimeterString("margin");
  if (skipObj) {
    skipObj["margin-top"] = null;
    skipObj["margin-right"] = null;
    skipObj["margin-bottom"] = null;
    skipObj["margin-left"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  } else if (str.length == 0) {
    str = "margin:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_padding = function(skipObj) {
  var str = this._toPerimeterString("padding");
  if (skipObj) {
    skipObj["padding-top"] = null;
    skipObj["padding-right"] = null;
    skipObj["padding-bottom"] = null;
    skipObj["padding-left"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  } else if (str.length == 0) {
    str = "padding:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString_border = function(skipObj) {
  var str = this._toPerimeterExtraString("border");
  if (skipObj) {
    skipObj["border-top-width"] = null;
    skipObj["border-top-style"] = null;
    skipObj["border-top-color"] = null;
    skipObj["border-right-width"] = null;
    skipObj["border-right-style"] = null;
    skipObj["border-right-color"] = null;
    skipObj["border-bottom-width"] = null;
    skipObj["border-bottom-style"] = null;
    skipObj["border-bottom-color"] = null;
    skipObj["border-left-width"] = null;
    skipObj["border-left-style"] = null;
    skipObj["border-left-color"] = null;
  }
  if (str.length > 0 && str.charAt(str.length - 1) != ";") {
    str += ";";
  }
  if (str.length == 0 || str.indexOf("none") >= 0) {
    str = "border:none;";
  }
  return str;
};
Downsha.ClipStyle.prototype.toString = function(shorten) {
  var str = "";
  var skip = {};
  if (shorten) {
    str += this.toString_background(skip);
    str += this.toString_border(skip);
    str += this.toString_margin(skip);
    str += this.toString_outline(skip);
    str += this.toString_padding(skip);
  } else {
    if (this["background-image"]) {
      str += "background-image:" + this["background-image"] + ";";
      skip["background-image"] = true;
    }
    var _rx = (this["background-repeat-x"]) ? this["background-repeat-x"] : "initial";
    var _ry = (this["background-repeat-y"]) ? this["background-repeat-y"] : "initial";
    str += "background-repeat:" + _rx + " " + _ry + ";";
    skip["background-repeat-x"] = true;
    skip["background-repeat-y"] = true;
    skip["background-repeat"] = true;
  }
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
Downsha.ClipStyle.prototype._toPerimeterString = function(prop) {
  var valParts = [];
  var allEqual = true;
  var missing = false;
  var str = "";
  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
    valParts[i] = this[prop + "-" + Downsha.ClipStyle.PERIMETERS[i]];
    if (valParts[i]) {
      str += prop + "-" + Downsha.ClipStyle.PERIMETERS[i] + ":" + valParts[i]
          + ";";
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
    valParts = [ valParts[0] ];
  } else if (valParts[0] == valParts[2] && valParts[1] == valParts[3]) {
    valParts = [ valParts[0], valParts[1] ];
  }
  return prop + ":" + valParts.join(" ") + ";";
};
Downsha.ClipStyle.prototype._toPerimeterExtraString = function(prop) {
  var perimParts = [];
  var allEqual = true;
  var str = "";
  for ( var i = 0; i < Downsha.ClipStyle.PERIMETERS.length; i++) {
    var pPrefix = prop + "-" + Downsha.ClipStyle.PERIMETERS[i];
    var extras = Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[pPrefix]
        || Downsha.ClipStyle.PERIMETER_EXTRA_PROPS[prop];
    if (extras instanceof Array) {
      var part = "";
      var partStr = "";
      var missing = false;
      for ( var e = 0; e < extras.length; e++) {
        var fullProp = pPrefix + "-" + extras[e];
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
        str += pPrefix + ":" + part + ";";
      } else {
        str += partStr;
      }
    }
    if (i > 0 && allEqual
        && (!perimParts[i] || perimParts[i] != perimParts[i - 1])) {
      allEqual = false;
    }
  }
  if (allEqual) {
    return prop + ":" + perimParts[0] + ";";
  } else {
    return str;
  }
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

Downsha.ClipStylingStrategy = function ClipStylingStrategy(window) {
  this.initialize(window);
};
Downsha.ClipStylingStrategy.DEFAULT_FILTER = function(prop, val) {
  // skip orphans, widows, speak, page-break, pointer-events
  return (val && prop != "orphans" && prop != "widows" && prop != "speak"
      && prop.indexOf("page-break") != 0 && prop.indexOf("pointer-events") != 0);
};
Downsha.ClipStylingStrategy.prototype.initialize = function(window) {
  this.window = window;
};
Downsha.ClipStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
  return null;
};
Downsha.ClipStylingStrategy.prototype.getNodeView = function(node) {
  var doc = node.ownerDocument;
  var view = (doc.defaultView) ? doc.defaultView : this.window;
  return view;
};
Downsha.ClipStylingStrategy.prototype.getNodeStyle = function(node, computed, filter) {
  var thisFilter = (typeof filter == 'function') ? filter : Downsha.ClipStylingStrategy.DEFAULT_FILTER;
  if (node && typeof node.nodeType == 'number' && node.nodeType == 1) { // element node
    var view = this.getNodeView(node);
    var matchedRulesDefined = (typeof view["getMatchedCSSRules"] == 'function') ? true : false;
    if (computed) { // getComputedStyle return current style of the element, however this style is set.
      return style = new Downsha.ClipStyle(view.getComputedStyle(node, ''), thisFilter);
    } else if (matchedRulesDefined) { // getMatchedCSSRules is only for webkit
      return style = new Downsha.ClipStyle(view.getMatchedCSSRules(node, ''), thisFilter);
    }
  }
  var s = new Downsha.ClipStyle();
  s.setFilter(thisFilter);
  return s;
};
Downsha.ClipStylingStrategy.prototype.getFontFaceRules = function() {
  return Downsha.ClipStyle.findFontFaceRules();
};
Downsha.ClipStylingStrategy.prototype.cleanUp = function() {
  return true;
};
Downsha.ClipStylingStrategy.prototype.styleForFloatClearingNode = function(node) {
	return null;
};

Downsha.ClipTextStylingStrategy = function ClipTextStylingStrategy(window) {
    this.initialize(window);
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
    var s = Downsha.ClipStyle.stylePrefix(style.toLowerCase()); // *** only preserve styles prefix with color, font, text
    if (typeof Downsha.ClipTextStylingStrategy.STYLE_ATTRS[s] != 'undefined') {
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
      nodeStyle["color"] = (colorParts.length == 4) ? "rgba("+[r, g, b, 1].join(", ")+")" : "rgb("+[r, g, b].join(", ")+")";
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

(function() {
  var LOG = null;
  Downsha.ClipFullStylingStrategy = function ClipFullStylingStrategy(window) {
    LOG = Downsha.Logger.getInstance();
    this.initialize(window);
  };
  Downsha.inherit(Downsha.ClipFullStylingStrategy, Downsha.ClipStylingStrategy);
  Downsha.ClipFullStylingStrategy.SKIP_UNDEFINED_PROPS = { // [NOT USED] skip following undefined properties
    "widows" : null,
    "orphans" : null,
    "pointer-events" : null,
    "speak" : null
  };
  Downsha.ClipFullStylingStrategy.SKIP_NONINHERENT_AUTO_PROPS = { // [NOT USED] skip following key-value pair
    "left" : "auto",
    "right" : "auto",
    "float" : "auto",
    "clear" : "auto",
    "image-rendering" : "auto",
    "z-index" : "auto",
    "color-rendering" : "auto",
    "shapre-rendering" : "auto",
    "page-break-before" : "auto",
    "page-break-after" : "auto",
    "page-break-inside" : "auto"
  };
  Downsha.ClipFullStylingStrategy.LIST_NODES = {
    "UL" : null,
    "OL" : null,
    "LI" : null
  };
  Downsha.ClipFullStylingStrategy.NODE_PROPS = {
    "BR" : [ "clear", "padding", "margin", "line-height", "border", "white-space" ]
  };
  Downsha.ClipFullStylingStrategy.TEXT_NODES = {
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
  Downsha.ClipFullStylingStrategy.prototype.styleForNode = function(node, root, fullPage) {
    var matchedStyle = this.getNodeStyle(node, false); // ***(first) getMatchedCSSRules return list
    var origHeight = matchedStyle["height"];
    var computedStyle = this.getNodeStyle(node, true); // ***(second) getComputedStyles return list
    var inlineStyle = node.style; // ***(third) inline styles list
    var isRoot = (node == root) ? true : false;
    if (isRoot) { // special handling of root element
      // use computed font-size and font-family
      if (computedStyle["font-size"]) {
        matchedStyle._addSimpleStyle("font-size", computedStyle["font-size"]);
      }
      if (computedStyle["font-family"]) {
        matchedStyle._addSimpleStyle("font-family",
            computedStyle["font-family"]);
      }
      // remove unnecessary margin from root element
      // margin: 0px; position: relative
      matchedStyle._addSimpleStyle("margin", "0px");
      if (matchedStyle["position"]) {
        matchedStyle["position"] = "relative";
      } else {
        matchedStyle._addSimpleStyle("position", "relative");
      }
      if (!fullPage) {
        // deduce background properties on root element if not fullPage
        var bgStyle = this._inhBackgroundForNode(node, true);
        if (bgStyle.length > 0) {
          matchedStyle.mergeStyle(bgStyle, false);
        }
        // deduce font properties on root element if not fullPage
        var fontStyle = this._inhFontForNode(node, true);
        if (fontStyle.length > 0) {
          matchedStyle.mergeStyle(fontStyle, false);
        }
        // fix width on root element with background-image if not fullPage
        if (node.nodeName != "HTML" && node.nodeName != "BODY" && bgStyle["background-image"]) {
          LOG.debug("Setting fixed width because it's not a top-level tag and has background-image");
          if (computedStyle["width"] && computedStyle["width"] != "0px") {
            matchedStyle._addSimpleStyle("width", computedStyle["width"]);
          }
          if (origHeight && computedStyle["height"] && computedStyle["height"] != "0px") {
            matchedStyle._addSimpleStyle("height", computedStyle["height"]);
          }
        }
        // remove floating on root element if not fullPage
        if (matchedStyle["float"]) {
          matchedStyle.removeStyle("float");
        }
      }
    } // end if (isRoot)
    
    // for elements that contain nothing but text nodes, 
    // ensure preservation of computed font-size if not fullPage
    if (!fullPage && node.childElementCount != node.childNodes.length) {
      var _textNodeFound = false;
      for ( var _c = 0; _c < node.childNodes.length; _c++) {
        if (node.childNodes[_c].nodeType == Node.TEXT_NODE) {
          _textNodeFound = true;
          break;
        }
      }
      if (_textNodeFound) {
        if (computedStyle["font-size"]) {
          LOG.debug("Adding font-size to text node without font-size spec");
          matchedStyle._addSimpleStyle("font-size", computedStyle["font-size"]);
        }
      }
    }
    // because canvas elements do not preserve their drawn state, 
    // we preserve it via background-image property
    if (node.nodeName == "CANVAS" && typeof node.toDataURL == 'function') {
      matchedStyle._addSimpleStyle("background-image", "url(" + node.toDataURL() + ")");
    } else if (node.nodeName == "OBJECT" || node.nodeName == "EMBED") {
      matchedStyle._addSimpleStyle("width", computedStyle["width"]);
      matchedStyle._addSimpleStyle("min-width", computedStyle["width"]);
      matchedStyle._addSimpleStyle("max-width", computedStyle["width"]);
      matchedStyle._addSimpleStyle("height", computedStyle["height"]);
      matchedStyle._addSimpleStyle("min-height", computedStyle["height"]);
      matchedStyle._addSimpleStyle("max-height", computedStyle["height"]);
      matchedStyle._addSimpleStyle("display", computedStyle["display"]);
      matchedStyle._addSimpleStyle("overflow", computedStyle["hidden"]);
    }
    // adjust absolute positioning on root and its immediate children when not fullPage
    // if position is absolute, then left -= margin-left, top -= margin-top
    if (!fullPage && (isRoot || node.parentElement == root)) {
      if (matchedStyle["position"] == "absolute") {
        var rect = node.getBoundingClientRect();
        var ml = parseInt(computedStyle["margin-left"]);
        var mt = parseInt(computedStyle["margin-top"]);
        var xDelta = rect.left - ((isNaN(ml)) ? 0 : ml);
        var yDelta = rect.top - ((isNaN(mt)) ? 0 : mt);
        if (typeof root._downsha_absolute_xOffset == 'number'
            && typeof root._downsha_absolute_yOffset == 'number') {
          var xDelta = Math.max(0, xDelta - root._downsha_absolute_xOffset);
          var yDelta = Math.max(0, yDelta - root._downsha_absolute_yOffset);
          matchedStyle._addSimpleStyle("left", xDelta + "px");
          matchedStyle._addSimpleStyle("top", yDelta + "px");
        } else {
          root._downsha_absolute_xOffset = xDelta;
          root._downsha_absolute_yOffset = yDelta;
          matchedStyle._addSimpleStyle("top", "0px");
          matchedStyle._addSimpleStyle("left", "0px");
        }
        matchedStyle.removeStyle("right");
        matchedStyle.removeStyle("bottom");
      }
    }

    // add inline style attributes
    for ( var i = 0; i < inlineStyle.length; i++) {
      matchedStyle._addSimpleStyle(inlineStyle[i], inlineStyle.getPropertyValue(inlineStyle[i]));
    }
    if (origHeight && matchedStyle["height"] && computedStyle["height"]) {
      matchedStyle["height"] = computedStyle["height"];
    }
    // preserve direction
    if (!matchedStyle["direction"] && computedStyle["direction"] && computedStyle["direction"] != "ltr") {
        matchedStyle._addSimpleStyle("direction", computedStyle["direction"]);
    }
    return matchedStyle;
  };
  Downsha.ClipFullStylingStrategy.prototype._hasTextOnlyChildren = function(node) { // all children are text nodes
    if (node) {
      if (node.childElementCount == 0) {
        return true;
      } else {
        var totalChildren = node.childElementCount;
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
      LOG.dir(s);
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
          var bgNodeComputedStyle = view.getComputedStyle(n);
          var bgNodeBgPosX = bgNodeComputedStyle.getPropertyValue("background-position-x");
          var bgNodeBgPosY = bgNodeComputedStyle.getPropertyValue("background-position-y");
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
    if (this._dirty) {
      var els = this.window.document.getElementsByTagName("*");
      for ( var i = 0; i < els.length; i++) {
        delete els[i][this.constructor.COMPUTED_STYLE_KEY];
      }
    }
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
