/**
 * @author: chenmin
 * @date: 2011-08-29
 * @desc: This object should be used to load JQuery inside main Firefox window
 */

Downsha.getjQuery = function() { // return the scope variables of jQuery
  if (this.jQuery) {
  	return this.jQuery;
  } else {
  	return $;
  }
};

Downsha.JQueryLoader = {
  JQUERY_PATH : "chrome://downsha/content/libs/jquery/jquery-1.6.2.js",

  load : function() {
    var scope = {};
    var globals_array = [],
        globals_array_after = [],
        new_globals_introduced = [],
        loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader),
        prop, i;

    // save the variables of window object before loading
    for (prop in window) {
      if (window.hasOwnProperty(prop)) {
      	globals_array.push(prop);
      }
    }

    // load jQuery library here
    loader.loadSubScript(this.JQUERY_PATH);

    // save the variables of window object after loading
    for (prop in window) {
      if (window.hasOwnProperty(prop)) {
      	globals_array_after.push(prop);
      }
    }
    
    // Diff the global arrays
    new_globals_introduced = globals_array_after.filter(function (item) {
        return globals_array.indexOf(item) < 0;
    });
    
    // Populate the scope object with the new global objects
    for (i = 0; i < new_globals_introduced.length; i++) {
        scope[new_globals_introduced[i]] = window[new_globals_introduced[i]];
        delete window[new_globals_introduced[i]]; // delete from window object
    }

    // save scope object to global object
    Downsha.jQuery = scope.$ || scope.jQuery;
  }
};
