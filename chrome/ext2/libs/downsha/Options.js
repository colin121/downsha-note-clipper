/**
 * @author: chenmin
 * @date: 2011-09-20
 * @desc: options model
 */

(function() {
  var LOG = null;
  Downsha.Options = function Options(context, opts) {
    LOG = Downsha.Logger.getInstance();
    this.__defineGetter__("context", this.getContext);
    this.__defineSetter__("context", this.setContext);
    this.__defineGetter__("developerMode", this.isDeveloperMode);
    this.__defineSetter__("developerMode", this.setDeveloperMode);
    this.__defineGetter__("debugLevel", this.getDebugLevel);
    this.__defineSetter__("debugLevel", this.setDebugLevel);
    this.__defineGetter__("clipStyle", this.getClipStyle);
    this.__defineSetter__("clipStyle", this.setClipStyle);
    this.__defineGetter__("useContextMenu", this.isUseContextMenu);
    this.__defineSetter__("useContextMenu", this.setUseContextMenu);
    this.__defineGetter__("debugEnabled", this.isDebugEnabled);
    this.__defineSetter__("debugEnabled", this.setDebugEnabled);
    this.__defineGetter__("clipNotificationEnabled", this.isClipNotificationEnabled);
    this.__defineSetter__("clipNotificationEnabled", this.setClipNotificationEnabled);
    this.__defineGetter__("clipAction", this.getClipAction);
    this.__defineSetter__("clipAction", this.setClipAction);
    this.initialize(context, opts);
  };

  Downsha.Options.FULL_PAGE_OPTIONS = {
    NEVER : 0,
    ALWAYS : 1,
    REMEMBER : 2
  };
  Downsha.Options.CLIP_STYLE_OPTIONS = {
    NONE : 0,
    TEXT : 1,
    FULL : 2
  };
  Downsha.Options.CLIP_ACTION_OPTIONS = {
    ARTICLE : 0,
    FULL_PAGE : 1,
    URL : 2
  };

  Downsha.Options.__defineGetter__("DEFAULTS", function() {
    return {
    	developerMode: false, 
    	debugLevel : Downsha.Logger.LOG_LEVEL_ERROR, // TODO
      clipStyle : Downsha.Options.CLIP_STYLE_OPTIONS.FULL,
      useContextMenu : true,
      debugEnabled : true,
      clipNotificationEnabled : true,
      clipAction : Downsha.Options.CLIP_ACTION_OPTIONS.ARTICLE
    };
  });

  Downsha.Options.isValidClipStyleOptionValue = function(value) {
    return Downsha.Options.isValidOptionValue(value,
        Downsha.Options.CLIP_STYLE_OPTIONS);
  };

  Downsha.Options.isValidClipActionOptionValue = function(value) {
    return Downsha.Options.isValidOptionValue(value,
        Downsha.Options.CLIP_ACTION_OPTIONS);
  };

  Downsha.Options.isValidOptionValue = function(value, allOptions) {
    if (typeof allOptions == 'object' && allOptions != null) {
      for ( var i in allOptions) {
        if (value == allOptions[i]) {
          return true;
        }
      }
    }
    return false;
  };

  Downsha.Options.prototype._context = null;
  Downsha.Options.prototype._developerMode = Downsha.Options.DEFAULTS.developerMode;
  Downsha.Options.prototype._debugLevel = Downsha.Options.DEFAULTS.debugLevel;
  Downsha.Options.prototype._clipStyle = Downsha.Options.DEFAULTS.clipStyle;
  Downsha.Options.prototype._useContextMenu = Downsha.Options.DEFAULTS.useContextMenu;
  Downsha.Options.prototype._debugEnabled = Downsha.Options.DEFAULTS.debugEnabled;
  Downsha.Options.prototype._clipNotificationEnabled = Downsha.Options.DEFAULTS.clipNotificationEnabled;
  Downsha.Options.prototype._clipAction = Downsha.Options.DEFAULTS.clipAction;

  Downsha.Options.prototype.initialize = function(context, options) {
    if (context instanceof Downsha.DownshaContext) {
      this.context = context;
    }
    var opts = (typeof options == 'object' && options != null) ? 
    	options : Downsha.Options.DEFAULTS;
    for ( var i in opts) {
      if (typeof this[i] != 'undefined') {
        this[i] = opts[i];
      }
    }
  };
  Downsha.Options.prototype.setContext = function(context) {
    if (context instanceof Downsha.DownshaContext) {
      this._context = context;
    } else if (context == null) {
      this._context = null;
    }
  };
  Downsha.Options.prototype.getContext = function() {
    return this._context;
  };
  Downsha.Options.prototype.setDeveloperMode = function(bool) {
    this._developerMode = (bool) ? true : false;
  };
  Downsha.Options.prototype.isDeveloperMode = function() {
    return this._developerMode;
  };
  Downsha.Options.prototype.setDebugLevel = function(level) {
    if (typeof level == 'number') {
      this._debugLevel = level;
    } else if (typeof level == 'string') {
      this._debugLevel = parseInt(level);
    } else if (level == null) {
      this._debugLevel = 0;
    }
  };
  Downsha.Options.prototype.getDebugLevel = function() {
    return this._debugLevel;
  };
  Downsha.Options.prototype.setClipStyle = function(val) {
    if (Downsha.Options.isValidClipStyleOptionValue(val)) {
      this._clipStyle = val;
    } else if (val == null) {
      this._clipStyle = Downsha.Options.DEFAULTS.clipStyle;
    }
  };
  Downsha.Options.prototype.getClipStyle = function() {
    return this._clipStyle;
  };
  Downsha.Options.prototype.isUseContextMenu = function() {
    return this._useContextMenu;
  };
  Downsha.Options.prototype.setUseContextMenu = function(bool) {
    this._useContextMenu = (bool) ? true : false;
  };
  Downsha.Options.prototype.isDebugEnabled = function() {
    return this._debugEnabled;
  };
  Downsha.Options.prototype.setDebugEnabled = function(bool) {
    this._debugEnabled = (bool) ? true : false;
  };
  Downsha.Options.prototype.isClipNotificationEnabled = function() {
    return this._clipNotificationEnabled;
  };
  Downsha.Options.prototype.setClipNotificationEnabled = function(bool) {
    this._clipNotificationEnabled = (bool) ? true : false;
  };
  Downsha.Options.prototype.getClipAction = function() {
    return this._clipAction;
  };
  Downsha.Options.prototype.setClipAction = function(val) {
    if (Downsha.Options.isValidClipActionOptionValue(val)) {
      this._clipAction = val;
    } else if (val == null) {
      this._clipAction = Downsha.Options.DEFAULTS.clipAction;
    }
  };

  Downsha.Options.prototype.apply = function() {
    LOG.level = this.debugLevel;
    Downsha.Logger.setLevel(this.debugLevel);
    if (this.context) {
      this.context.setOptions(this);
    }
  };
  Downsha.Options.prototype.reset = function() {
    this.initialize(this.context, null);
  };

  Downsha.Options.prototype.toJSON = function() {
    return {
      debugLevel : this.debugLevel,
      developerMode : this.developerMode,
      clipStyle : this.clipStyle,
      useContextMenu : this.useContextMenu,
      debugEnabled : this.debugEnabled,
      clipNotificationEnabled : this.clipNotificationEnabled,
      clipAction : this.clipAction
    };
  };
})();
