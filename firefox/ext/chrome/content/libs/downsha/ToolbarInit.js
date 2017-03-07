/**
 * @author: chenmin
 * @date: 2011-08-29
 * @desc: initialization of loading toolbar button
 */

function initDownshaButton() {
	var buttonId = "downsha-button";
	var navBar = document.getElementById("nav-bar");
	if (!navBar) return;
	
	var currentSet = navBar.getAttribute(navBar.hasAttribute("currentset") ? "currentset" : "defaultset");
	if (!currentSet || currentSet.indexOf(buttonId) >= 0) return;
	
	if (!document.getElementById(buttonId)) {
		navBar.insertItem(buttonId, null, null, false);
	}
	
	currentSet = currentSet.replace("," + buttonId, "");
	currentSet = currentSet + "," + buttonId;
	
	navBar.setAttribute("currentset", currentSet);
	navBar.currentSet = currentSet;
	document.persist(navBar.id, "currentset");
  
	// see http://developer.mozilla.org/en/docs/Code_snippets:Toolbar
	// If you don't do the following call, funny things happen
	try {
		BrowserToolboxCustomizeDone(true);
	} catch (e) {
	}
}

window.addEventListener("load", initDownshaButton, false);
