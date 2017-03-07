/**
 * @author: chenmin
 * @date: 2011-10-29
 * @desc: popup dialog management
 */

(function() {
	Downsha.Popup = function Popup(win) {
		this.initialize(win);
	};
	Downsha.inherit(Downsha.Popup, Downsha.AbstractStyleScript);
	
	Downsha.Popup.prototype.CLIP_SUBMIT_DELAY_TIME = 50;
  Downsha.Popup.prototype.DEFAULT_POPUP_WIDTH = 400;
  Downsha.Popup.prototype.DEFAULT_POPUP_HEIGHT = 170;
  Downsha.Popup.prototype.DEFAULT_POPUP_LEFT_MARGIN = 5;
  Downsha.Popup.prototype.DEFAULT_POPUP_TOP_MARGIN = 5;
  Downsha.Popup.prototype.DEFAULT_POPUP_RIGHT_MARGIN = 30;
  Downsha.Popup.prototype.pluginVersion = 0; // plugin version
	Downsha.Popup.prototype.window = null; // window object
	Downsha.Popup.prototype.title = null; // clip title
	Downsha.Popup.prototype.url = null; // clip url
	Downsha.Popup.prototype.clipAction = null; // clip action
	Downsha.Popup.prototype.clipOptions = null; // clip options
	Downsha.Popup.prototype.keyupEnabled = false; // determine whether keyboard event enabled
	Downsha.Popup.prototype.POPUP_ID = "downshaPopupContainer";
  Downsha.Popup.prototype.initialStyleSheetUrls = [{
  	id : "downshaPopupCSSCode",
		code : "/* css code for popup dialog */" +	
			"#downshaPopupContainer {" + // popup container
			((Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) ? 
			"  position: absolute;" : // for IE 6 and quirks mode, cuz IE 6 and quirks mode doesn't recognize fixed
			"	 position: fixed;") + // for IE 7/8/9, fixed position relative to screen 
			((Downsha.Platform.getIEVersion() <= 9) ? // at the top of all layers
			"	 z-index: 2147483647;" : 
			"	 z-index: 9999999999999999;") + 
			"  background: #f2f5f6;" + // background color
			"  min-width: 400px;" + 
			"  padding: 8px;" + 
			"  margin: 0px;" + 
			"  border: 5px solid #5cb8e5;" + 
			"  border-radius: 0px;" + // for IE 9+
			"  box-shadow: 0 0 8px #333333;" + // for IE 9+
			"  overflow: hidden;" + 
			"  width: auto;" + 
			"  font-family: Simsun, Arial Narrow, HELVETICA;" + // general font family
			"  font-size: 12px;" + // general font size
			"  color: black;" + // general font color
			/**
			 * -webkit-user-select/-moz-user-select specifies whether the text of the element can be selected.
			 * In Internet Explorer and Opera, use the unSelectable attribute for similar functionality.
			 * "-webkit-user-select: none;"
			 */
			"}" + 
			"#downshaPopupContainer div {" + 
			//"  border: 0px;" + 
			"  border-radius: 0px;" + // for IE 9+
			"  min-width: none;" + 
			"  max-width: none;" + 
			"  cursor: auto;" + 
			"}" + 
			"#downshaPopupContainer img {" + 
			"  border: 0px;" + 
			"}" + 
			"#downshaPopupContainer a {" + 
			"  border: 0px;" + 
			"}" + 
			"#downshaPopupHeader {" + 
			"  height: 40px;" + 
			"}" + 
			"#downshaPopupHeaderLogo {" + // logo div
			"  width: auto;" + 
			"  height: 32px;" + 
			"  float: left;" + 
			"}" + 
			"#downshaPopupHeaderLogo img {" + 
			"  width: 125px;" + 
			"  height: 32px;" + 
			"}" + 
			"#downshaPopupHeaderMessage {" + // message span
			"  vertical-align: top;" + 
			"  padding: 6px 10px 2px 10px;" + 
			"  font-size: 14px;" + 
			"  white-space: nowrap;" + 
			"  text-overflow: ellipsis;" + 
			"}" + 
			"#downshaPopupHeaderClose {" + // close button
			"  width: 16px;" + 
			"  height: 16px;" + 
			"  line-height: 16px;" + 
			"  display: inline-block;" + 
			"  vertical-align: top;" + 
			"  float: right;" + 
			"  cursor: pointer;" + 
			"}" + 
			"#downshaPopupHeaderClose img {" + 
			"  width: 16px;" + 
			"  height: 16px;" + 
			"  cursor: pointer;" + 
			"}" + 
			"#downshaPopupView {" + // view div
			"  width: auto;" + 
			"  overflow: hidden;" + 
			"}" + 
			"#downshaPopupForm {" + // form
			"  width: auto;" + 
			"  margin: 0px;" + 
			"}" + 
			"#downshaPopupForm .downshaPopupRow {" + // form row
			"  width: auto;" + 
			"  text-align: left;" + 
			"  margin: 0px;" + 
			"  padding: 4px;" + 
			"  border-style: solid;" + 
			"  border-width: 0px 1px 1px 1px;" + 
			"  border-color: #d9d9d9;" + 
			"  background-color: white;" + 
			"}" + 
			"#downshaPopupForm .downshaPopupRow.downshaPopupRowPadded {" + // padded form row
			"  padding: 4px 4px 4px 24px;" + 
			"}" + 
			"#downshaPopupForm .downshaPopupRow.downshaPopupFirstRow {" + // first row
			"  border-top-width: 1px;" + 
			"  border-top-left-radius: 4px;" + // for IE 9+
			"  border-top-right-radius: 4px;" + // for IE 9+
			"}" + 
			"#downshaPopupForm .downshaPopupRow.downshaPopupLastRow {" + // last row
			"  border-bottom-left-radius: 4px;" + // for IE 9+
			"  border-bottom-right-radius: 4px;" + // for IE 9+
			"}" + 
			"#downshaPopupForm .downshaPopupField {" + // form row field
			"  margin-right: 5px;" + 
			"  padding-right: 5px;" + 
			"  border-right: 1px solid #b2c0a6;" + 
			"}" + 
			"#downshaPopupForm input[type=text]," + // text input
			"#downshaPopupForm textarea {" + 
			"  margin: 0px;" + 
			"  padding: 0px;" + 
			"  border: 0px none;" + 
			"  width: 85%;" + 
			"  box-sizing: border-box;" + 
			"  text-overflow: ellipsis;" + 
			"}" + 
			"#downshaPopupForm textarea {" + 
			"  -ms-transform: translate(0px,2px);" + // for IE 9+
			"}" + 
			"#downshaPopupForm input[type=radio] {" + // radio button
			"  display: inline;" + 
			"  width: auto;" + 
			"  height: auto;" + 
			"  border: 0px none;" + 
			"  vertical-align: middle;" + 
			"}" + 
			"#downshaPopupForm label {" + 
			"  display: inline;" + 
			"  margin-right: 8px;" + 
			"}" + 
			"#downshaPopupOptions {" + 
			"}" + 
			"#downshaPopupActions {" + 
			"  text-align: right;" + 
			"  padding: 8px 0;" + 
			"}" + 
			"#downshaPopupAction {" + // submit button style
			"  width: auto;" + 
			"  height: auto;" + 
			"  color: #ffffff;" + 
			"  background: #4886d0;" + 
			"  font-weight: bold;" + 
			"  margin-right: 10px;" + 
			"  padding: 6px 10px;" + 
			"  border: 1px solid #265c9d;" + 
			"  position: relative;" + 
			"  box-sizing: content-box;" + 
			"  overflow: hidden;" + 
			"  text-overflow: ellipsis;" + 
			"  border-radius: 4px;" + // for IE 9+
			"  cursor: pointer;" + 
			"}" + 
			"#downshaPopupAction[disabled] {" + // :disabled not supported in < IE9
			"  color: #ACA899;" + 
			"  background: #F5F5F5;" + 
			"  border: 1px solid #ffffff;" + 
			"  cursor: default;" + 
			"}" + 
			"#downshaPopupAction:hover {" + 
			"  box-shadow: 0 0 4px #666666;" + // for IE 9+
			"}" + 
			"#downshaPopupAction:focus {" + 
			"}" + 
			"#downshaPopupFooter {" + 
			"  display: block;" + 
			"  text-align: left;" + 
			"  vertical-align: middle;" + 
			"  border-top: dashed 1px gray;" + 
			"  padding-top: 4px;" + 
			"  height: 20px;" + 
			"  color: gray;" + 
			"}" + 
			"#downshaPopupFooter img {" + 
			"  vertical-align: middle;" + 
			"  width: 16px;" + 
			"  height: 16px;" + 
			"  line-height: 16px;" + 
			"  padding: 2px;" + 
			"  border: 0px;" + 
			"}" + 
			"#downshaPopupFooter .buttons {" + 
			"  cursor: pointer;" + 
			"  border: 1px solid #f2f5f6;" + 
			"}" + 
			"#downshaPopupFooter .buttons:hover {" + 
			"  border: 1px solid #e0e0e0;" + 
			"}" + 
			"#downshaPopupTips {" + 
			"  color: gray;" + 
			"}" + 
			"#downshaPopupTips[level=warning] {" + 
			"  color: red;" + 
			"}"	
  }];

	Downsha.Popup.prototype.initialize = function(win) {
		//LOG.debug("Popup.initialize");
		this.window = (win) ? win : window;
		Downsha.Popup.parent.initialize.apply(this, [win]);
	};
	Downsha.Popup.prototype.getInitialStyleSheetUrls = function() {
		return this.initialStyleSheetUrls;
	};
	Downsha.Popup.prototype.openPopup = function(obj) {
		//LOG.debug("Popup.openPopup");
		this.initData(obj);
		this.showPopup();
		this.updateClipAction(true);
	};
	Downsha.Popup.prototype.initData = function(obj) {
		//LOG.debug("Popup.initData");
		this.pluginVersion = 0;
		if (obj && obj.pluginVersion) {
			this.pluginVersion = obj.pluginVersion;
		}
		
		this.title = "";
		if (obj && obj.title) {
			this.title = obj.title;
		}
		
		this.url = "";
		if (obj && obj.url) {
			this.url = obj.url;
		}
		
		this.clipAction = Downsha.Constants.CLIP_ACTION_URL;
		if (obj && obj.clipAction) {
			this.clipAction = obj.clipAction;
		}
		
		this.clipOptions = [
			Downsha.Constants.CLIP_ACTION_FULL_PAGE, 
			Downsha.Constants.CLIP_ACTION_SELECTION, 
			Downsha.Constants.CLIP_ACTION_ARTICLE, 
			Downsha.Constants.CLIP_ACTION_URL
		];
		if (obj && obj.clipOptions) {
			this.clipOptions = obj.clipOptions;
		}
	};
	Downsha.Popup.prototype.showPopup = function() {
		//LOG.debug("Popup.showPopup");
		var popup = this.window.document.getElementById(this.POPUP_ID);
		if (!popup) {
			popup = this.window.document.createElement("DIV");
			popup.id = this.POPUP_ID;
			//popup.unselectable = "on";
			//popup.attachEvent("onselectstart", function() {return false;}); // forbid selection
			popup.attachEvent("oncontextmenu", function() {return false;}); // forbid context menu
			popup.innerHTML = "<!-- popup dialog inner html -->" + 
				"<!-- header bar for home/logout/register -->" + 
				"<div id=\"downshaPopupHeader\">" + 
				"<div id=\"downshaPopupHeaderLogo\">" + 
				"<a target=\"_blank\" href=\"http://www.downsha.com/\" tabindex=\"-1\">" + 
				((Downsha.Platform.getIEVersion() <= 7) ? 
				"<img src=\"" + Downsha.Constants.SERVICE_PATH + "popup_logo.png\"/>" : 
				"<img src=\"data:image/png;base64,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\"/>") + 
				"</a>" + 
				"<span id=\"downshaPopupHeaderMessage\">" + 
				Downsha.i18n.getMessage("popup_header_message") + 
				"</span>" + 
				"</div>" + // id=\"downshaPopupHeaderLogo\"
				"<div id=\"downshaPopupHeaderClose\">" + 
				((Downsha.Platform.getIEVersion() <= 7) ? 
				"<img title=\"" + Downsha.i18n.getMessage("popup_close") + "\" src=\"" + Downsha.Constants.SERVICE_PATH + "popup_close.png\"/>" : 
				"<img title=\"" + Downsha.i18n.getMessage("popup_close") + "\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAAWdEVYdENyZWF0aW9uIFRpbWUAMTIvMDEvMDmEiCkWAAAAgElEQVQ4jc1SQQ6AIAwrfnR46jPAZ+ykvBQvOyCOBGNMbEICY3RdR6i14g2WV6//SUCykjyceCR5M8xTsAKQlsT2u91dELwpkMwAEoBiIQGwqWqeImiqih2LqkYv75spNNWLLfGMdQmsf4HJNulDEk9BQtdzS9InD02cxQ+/8lOcoJg6TaDFVqMAAAAASUVORK5CYII=\"/>") + 
				"</div>" + // id=\"downshaPopupHeaderClose\"
				"</div>" + // id=\"downshaPopupHeader\"
				"<!-- body part -->" + 
				"<div id=\"downshaPopupView\">" + 
				"<form id=\"downshaPopupForm\" action=\"#\">" + 
				"<div class=\"downshaPopupRow downshaPopupFirstRow\">" + 
				"<span class=\"downshaPopupField\">" + 
				Downsha.i18n.getMessage("popup_title") + 
				"</span>" + 
				"<input type=\"text\" id=\"downshaPopupTitle\" title=\"" + Downsha.i18n.getMessage("popup_title") + "\" maxlength=\"255\" size=\"45\" tabindex=\"3\" value=\"\"/>" + 
				"</div>" +  // class=\"downshaPopupRow downshaPopupFirstRow\"
				"<div class=\"downshaPopupRow downshaPopupLastRow\">" + 
				"<span class=\"downshaPopupField\">" + 
				Downsha.i18n.getMessage("popup_content") + 
				"</span>" + 
				"<span id=\"downshaPopupOptions\">" + 
				"</span>" + 
				"</div>" +  // class=\"downshaPopupRow downshaPopupLastRow\"
				"<div id=\"downshaPopupActions\">" + 
				"<input type=\"button\" id=\"downshaPopupAction\" value=\"" + Downsha.i18n.getMessage("popup_action") + "\" tabindex=\"1\"/>" + 
				"</div>" +  // id=\"downshaPopupActions\"
				"</form>" + // id=\"downshaPopupForm\"
				"</div>" + // id=\"downshaPopupView\"
				"<!-- footer bar for tips and help -->" + 
				"<div id=\"downshaPopupFooter\">" + 
				((Downsha.Platform.getIEVersion() <= 7) ? 
				"<img src=\"" + Downsha.Constants.SERVICE_PATH + "popup_tips.png\"/>" : 
				"<img src=\"data:image/png;base64,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\"/>") + 
				"<span id=\"downshaPopupTips\"></span>" + 
				"</div>"; // id=\"downshaPopupFooter\"
			var popupLeft = this.DEFAULT_POPUP_LEFT_MARGIN;
			var windowWidth = Math.max(this.window.document.body.clientWidth, this.window.document.documentElement.clientWidth);
			if (!isNaN(windowWidth)) {
				popupLeft = windowWidth - this.DEFAULT_POPUP_WIDTH - this.DEFAULT_POPUP_RIGHT_MARGIN;
				if (popupLeft < this.DEFAULT_POPUP_LEFT_MARGIN) {
					popupLeft = this.DEFAULT_POPUP_LEFT_MARGIN;
				}
			}
			var popupTop = this.DEFAULT_POPUP_TOP_MARGIN;
			popup.style.left = popupLeft + "px";
			popup.style.top = popupTop + "px";
			popup.style.width = this.DEFAULT_POPUP_WIDTH + "px";
			popup.style.height = this.DEFAULT_POPUP_HEIGHT + "px";
			//LOG.debug("popup left: " + popup.style.left + ", top: " + popup.style.top + ", width: " + popup.style.width + ", height: " + popup.style.height);
			this.window.document.body.appendChild(popup);
			// make visible when display is not fixed to screen. (for IE 6 and quirks mode)
			if (Downsha.Platform.getIEVersion() <= 6 || 
				Downsha.Platform.isQuirksMode(this.window.document)) {
				window.scrollTo(0, 0);
			}
			// bind events to elements
			this.bindPopup();
		}
	};
	Downsha.Popup.prototype.hidePopup = function() {
		//LOG.debug("Popup.hidePopup");
		var popup = this.window.document.getElementById(this.POPUP_ID);
		if (popup && popup.parentNode) {
			popup.parentNode.removeChild(popup);
		}
	};	
	Downsha.Popup.prototype.bindPopup = function() {
		//LOG.debug("Popup.bindPopup");
		var self = this;
		self.enableKeyup(); // enable keyboard event
		var clipClose = this.window.document.getElementById("downshaPopupHeaderClose");
		if (clipClose) {
			clipClose.attachEvent("onclick", function() {
				Downsha.getIEExtension().previewClear();
				self.hidePopup();
			});
		}
		
		var clipTitle = this.window.document.getElementById("downshaPopupTitle");
		if (clipTitle) {
			if (this.title) {
				clipTitle.value = this.title;
			} else {
				clipTitle.value = Downsha.i18n.getMessage("popup_untitledNote");
			}
			clipTitle.attachEvent("onfocus", function() {
				if (clipTitle.value == Downsha.i18n.getMessage("popup_untitledNote")) {
					clipTitle.value = "";
				}
			});
			clipTitle.attachEvent("onblur", function() {
				clipTitle.value = clipTitle.value.trim();
				if (clipTitle.value == "") {
					clipTitle.value = Downsha.i18n.getMessage("popup_untitledNote");
				}
			});
		}
		
		var clipOptions = this.window.document.getElementById("downshaPopupOptions");
		if (clipOptions) {
			for (var i = 0; i < this.clipOptions.length; i++) {
				var clipRadio = this.window.document.createElement("input");
				clipRadio.setAttribute("type", "radio");
				clipRadio.setAttribute("id", this.clipOptions[i]);
				clipRadio.setAttribute("name", "downshaPopupOption");
				clipRadio.setAttribute("value", this.clipOptions[i]);
				if (this.clipOptions[i] == this.clipAction) {
					clipRadio.setAttribute("defaultChecked", true); // for IE 6/7
					clipRadio.setAttribute('checked', 'checked'); // for IE 8+
				}
				clipRadio.attachEvent("onclick", function() {
					self.updateClipAction(false);
				});
				clipOptions.appendChild(clipRadio);
				
				var clipLabel = this.window.document.createElement("label");
				clipLabel.setAttribute("for", this.clipOptions[i]);
				clipLabel.innerHTML = Downsha.i18n.getMessage(this.clipOptions[i]);
				clipOptions.appendChild(clipLabel);
			}
		}
		var clipAction = this.window.document.getElementById("downshaPopupAction");
		if (clipAction) {
			if (Downsha.getIEExtension().pluginVersion == 0) {
				clipAction.setAttribute('disabled','disabled');
			} else {
				clipAction.focus(); // set focus to submit button
				clipAction.attachEvent("onclick", function() {
					self.submitClipAction();
				});
			}
		}
	};
	Downsha.Popup.prototype.updateClipAction = function(force) {
		//LOG.debug("Popup.updateClipAction");
		var self = Downsha.getIEExtension().getPopup();
		var changed = false;
		var clipOptions = this.window.document.getElementById("downshaPopupOptions");
		for (var i = 0; i < clipOptions.children.length; i++) {
			if (clipOptions.children[i].checked) {
				var selectedOption = clipOptions.children[i].value;
				if (self.clipAction != selectedOption) {
					self.clipAction = selectedOption;
					changed = true;
				}
				break;
			}
		}
		
		if (force || changed) {
			if (self.clipAction == Downsha.Constants.CLIP_ACTION_SELECTION) {
				Downsha.getIEExtension().previewSelection();
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_ARTICLE) {
				Downsha.getIEExtension().previewArticle();
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_FULL_PAGE) {
				Downsha.getIEExtension().previewFullPage();
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_URL) {
				Downsha.getIEExtension().previewUrl();
			}
			
			var clipTips = this.window.document.getElementById("downshaPopupTips");
			if (Downsha.getIEExtension().pluginVersion == 0) {
				clipTips.setAttribute('level', 'warning');
				clipTips.innerHTML = Downsha.i18n.getMessage("popup_tip_forbidden");
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_ARTICLE) {
				if (Downsha.Platform.getIEVersion() <= 7) {
					var popupPrevUrl = Downsha.Constants.SERVICE_PATH + "popup_prev.png";
					var popupNextUrl = Downsha.Constants.SERVICE_PATH + "popup_next.png";
					var popupShrinkUrl = Downsha.Constants.SERVICE_PATH + "popup_shrink.png";
					var popupExpandUrl = Downsha.Constants.SERVICE_PATH + "popup_expand.png";
				} else {
					// http://www.websemantics.co.uk/online_tools/image_to_data_uri_convertor/
					var popupPrevUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAChElEQVR42o2TXUhTYRjH/2ebx87mdHNNJ6WszD7WBzNjpiO60UgrSCjoZhXUTeJVNwp1EyTWRd4kRZEQBUFQdBHWhSFhQVP8KF3mRx8y+3LTXHPnnH2cbT1n6tiaFz7w53nf9zzP7zzPy/sw+M8K66/ZyJ0lVZGsJJH0ntRDujv7osWdGs+kJHLk7hQa8x2WMjNMBQYYDTpI0Si88z58/+nBu0GXDGslSGsaYDn5tXVnmc1u25344BeiCEZiUCgALksBzToleEHEwIcJuMa/dhLkfCrgwZ4dpY6qil3w8RJCUhyrmZZTQs0q8KZ/BGOT3xoJcpuRe6ZS+44dsi8l019l62zai3MdQxkQfY4KfIDHs5e9f2i7WQbcqiy3XNhaWozfC+FE0MOLtoR3tPeDZVWJdTgsJSEmPYu+4TFMfplplAFTR2urt0hxFcRwDI+b7cnAlQoCvJhWhUGbhV+zdKkDHx/JgFBD3QHW44vg6eWDWIudufEWorCIXudIjwwQ6msqOS8Bnl+pXRPgVFsPgiIP5+BYtwwYrt5nscYVLBYFCa+uH0kG1jR3rQooys+mFubhmpjulAFtpeaiFvPGQsx4l3rtbT+eAQhHIsl1sZHD6Pg0PHO+kzKghM6mKsu3sSGJgS+wFOjsOIH9TU+Qo+HSLrKkgMPcgp/egfszbbevPKRLJqPu6qYSUyLI7REyylYwDIopOcAHMfJpOkpHdfSQulNn4WaeVt1UsF4HXa6GSo5hUZSgUjLIVWeB8jE754P7R6JP+RXeTxumZchhcvcMeu0GjTobai4bsVgcYjAMf0DAX7/QT99PU/JExjSmQPLINSyPc4XcPmmU1E3qouRoavw/OVIC70TzgsIAAAAASUVORK5CYII=";
					var popupNextUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACdklEQVR42o2TS0wTURSG/+ljcFoKhVooUUgV8VEfATEgEHUDRlAXLIxuUBPdSFi5kUQ3JhJkoRuNRiOJceFKo4lBFzWNQY1AeGjBSsFHU3xRitTSzpR2Sj13BNJSFpzkz7l35v7fvefmXA7LIr/hagWl06QqUilJIr0nOUh3J5+3epPXc0lGgdKdfHNuk63ECkueCWaTEXI8jqnpAL7/9OHdwAiDtRGkLQWwYH5Vur2koqZip/IjKMYRic1DpQIErQr6NWqERQn9H9wYGf3aSZCzyYAHu7YVN1WV70AgLGNOTmClMAhq6HgVXvc54Rr71kyQ2xyrmY7ae/RgzX8z7bo8Olt248zNQWWck6lBOBTGkxfdf2i6kQFuVZbZzm0uLsTvmWiamec1CoBF0/U+JVtyePQOuTD2ZaKZAcaP1FVvkhMaSNHU3TP1wtIJFuN4x1uYDFr8mqRL7f/4kAHmGuv38b5ADI8vHcBq4tS1N5DEWXT3OB0MIDbUVgpTBHh2uW5VgBPtDkSkMHoGXHYGGKreYytNqHjMivKKhpcdh5fGtRe6UJCbQSVMY8Tt6WSA9mJrQat1fT4mpqTUC9RqUwD7zz9VcqFZwPCoBz5/4BgDFNG38cqyLfyczCEQiqVdJAPsbXmkzIvyBPhngtQH3s803brYSBctZuOVDUUWZZHXJ6aVoeI4FJI5FI7A+ckTp0/11Ej25LdwI9uga8lba4QxS48oNdSsJEOj5pCl04L8mPQH4P2h1Mm68H7KY1qAHKJ0z5RjWKfXZUAnZGB+PgEpEkUwJOJvUGSddJLM7rTXmATJptS48JzLSSHSMMlO6iJzPHn9P6Lq9uCZ3H4YAAAAAElFTkSuQmCC";
					var popupShrinkUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACX0lEQVR42o2Ty08TURTGv+ljcFoKhVpaom1QxEd9BIJpA8TEhRJpdMHCJcaFG4l/AIlhhUT3JhqNJMaFW1ZiYhNCcCEQCFpqpeCjKb7agoylM1PamdYztTZTaxpP8uXc1/nde+69h8Ff5vDf8ZK7SuohdZIk0mvSNOlhfGokpl3PaAI5cg8c9uYhT0cbnC022G1WyIqC5BaPz18TeLUUUmHjBBmvAJSCZzqPd3j7vCeLEylRQSaXh04HcEYdzHv0EEQJi28iCK1+nCDINS3gyalj7UM93SfACzJ25QL+ZRZODxOrw8uFIMJrn4YJcp9Rc6ajzl/q7/sdTLvWsqZ6A4S0gMnnsz+oe1AF3PN1ea4fbnfh+3a2KoBlDUWfzcrlMWcTi/nlMNY+bAyrgPWL53sPyQUDpGzl7vVmrujTglQxbrMY8S1Ol7r49qkK2B0cOMMm+BzyhQImR8/WTGFwbAYNJtpM3MHsXHBaBYj+cz4uSQAlX8DUWH9NgH/0RRGQkQTMLYUDKmC597Sns6BjsSPK+B9rba6jFLYQikQnVMDt9rbWkbb9DmwkK3NljcZyO5vLldsuO4eV1SgSm/xlFeCmsXVf1xF2V2bAp3M1L9LdwmFzO0X/IPaeukf/fKSbTrv11gG3s7golhCrjq1jGLgoOC1kEHwXVWhogD5SQFsLdxstphste62wNpjpyHnsSDIMeoYuzQiKR3yTR+xLMU/1Fz6uKKYS5AK5R7Ymyz6zqQ4mrg55ehkpk0UqLeJnSlyg+SsUHKmqRg2kUX3uUjl3q+mTVkgB0jMKVrTrfwHUe/bgdRe9TAAAAABJRU5ErkJggg==";
					var popupExpandUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACgUlEQVR42n2TXUhTYRjH/+eoszObTtfcpByW2Yd9MDM2VIIuTFILEoqujKBuEq+6UQivTMqbbpKiaBAFQVdeaZAhYkQqmqXL/OhjzL7cZq65c87czs56zlHXToYv/Hl4n/d5fu/7vO/7MPhnWOpuOshcJFWQ7CSR9JbUT7q/0NvqTY1nUhI5Mvcs5rzG0pIiWPNNMJuMkOJx+BeD+Prdh9djbgXWQZAODWAtecB+oMRR5TikLoSEOCIxGSwLcBkssrakgRdEjL6bgXv6s4sgl1MBjw7vL26sKD+IIC9hRUrgf8PApUGvY/FyZAJTs1+aCHKXUWqmow6frqlaTaZd14er+YhqL3W9Sfpyt6aDD/Pofjb4i6a7FMAdZ1nplT3Fhfi5FNXs+PiqIwmIRqWk35qrw/D4FGY/zTcpgLlTJyp3S4l0iFFZA3jaUqXa852vNH6TIQM/FuhSR98/UQArDbXHdL5gDHIige6249hsNLQPIFtPmwnLGBya6FcAQl21k/MTIC4n0Ntesymgru25CoiIPIbGpvoUwHjl0VJ7gtVhWZA0wS8661Vb3dKj8RfkZVIJi3DPeFwK4EZxUUFr0Q4L5v2iJnDw1pkkIBqLJf2FZg6T0x74AsFzCsBGvjln2V7disQgGP4bONR1NgkI86twWz6HwFKI/oH3I033rX+ka1az8fpOm1UN8vqEDbWzDINCSg7zEUx88MTJVUsfqS+1F27nGPTN+duMMGZn0ZFlLIsS0tMYurQMUD4WAkF4v6l1Kr/woaaZ1iAnyTww5Rq2Z+kzoecyIdPLiJEoQmEBv0PCCK1foOSZDd2YAslRnnutnctJYdIkqY/UQ8nx1Pg/GwUF7/QGKH4AAAAASUVORK5CYII=";
				}
				clipTips.innerHTML = Downsha.i18n.getMessage("popup_tip_article") + 
				"<img class=\"buttons\" id=\"downshaPopupPrev\" title=\"" + Downsha.i18n.getMessage("popup_prev") + "\" src=\"" + popupPrevUrl + "\"/>" + 
				"<img class=\"buttons\" id=\"downshaPopupNext\" title=\"" + Downsha.i18n.getMessage("popup_next") + "\" src=\"" + popupNextUrl + "\"/>" + 
				"<img class=\"buttons\" id=\"downshaPopupShrink\" title=\"" + Downsha.i18n.getMessage("popup_shrink") + "\" src=\"" + popupShrinkUrl + "\"/>" + 
				"<img class=\"buttons\" id=\"downshaPopupExpand\" title=\"" + Downsha.i18n.getMessage("popup_expand") + "\" src=\"" + popupExpandUrl + "\"/>";

				var clipExpand = this.window.document.getElementById("downshaPopupExpand");
				if (clipExpand) {
					clipExpand.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_PARENT);
					});
				}
				var clipShrink = this.window.document.getElementById("downshaPopupShrink");
				if (clipShrink) {
					clipShrink.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_CHILD);
					});
				}
				var clipPrev = this.window.document.getElementById("downshaPopupPrev");
				if (clipPrev) {
					clipPrev.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_PREVIOUS_SIBLING);
					});					
				}				
				var clipNext = this.window.document.getElementById("downshaPopupNext");
				if (clipNext) {
					clipNext.attachEvent("onclick", function() {
						Downsha.getIEExtension().previewNudge(Downsha.Constants.PREVIEW_NUDGE_NEXT_SIBLING);
					});					
				}
			} else {
				clipTips.innerHTML = Downsha.i18n.getMessage("popup_tip_default");
			}
	  }
	};
  Downsha.Popup.prototype.enableKeyup = function() {
		//LOG.debug("Popup.enableKeyup");
		if (this.keyupEnabled) {
			return;
		}
		try {
			var popup = this.window.document.getElementById(this.POPUP_ID);
			if (popup) {
				popup.attachEvent("onkeyup", this.handleKeyup); // bind keyup event
			}
		} catch(e) {
			LOG.warn("IEExtension.enableKeyup attachEvent exception");
			LOG.dir(e);
		}
		this.keyupEnabled = true;
  };
  Downsha.Popup.prototype.disableKeyup = function() {
		//LOG.debug("Popup.disableKeyup");
		if (this.keyupEnabled) {
			try {
				var popup = this.window.document.getElementById(this.POPUP_ID);
				if (popup) {
					popup.detachEvent("onkeyup", this.handleKeyup); // unbind keyup event
				}
			} catch(e) {
				LOG.warn("IEExtension.disableKeyup detachEvent exception");
				LOG.dir(e);
			}
			this.keyupEnabled = false;
		}
  };
  Downsha.Popup.prototype.handleKeyup = function() {
  	//LOG.debug("Popup.handleKeyup");
  	var self = Downsha.getIEExtension().getPopup();
		var keyCode = (event) ? event.keyCode : this.window.event.keyCode;
		var direction = null;
		switch (keyCode) {
			/*
			case 37: // left arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_PREVIOUS_SIBLING;
			}
			break;
			case 38: // up arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_PARENT;
			}
			break;
			case 39: // right arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_NEXT_SIBLING;
			}
			break;
			case 40: // down arrow
			{
				direction = Downsha.Constants.PREVIEW_NUDGE_CHILD;
			}
			break;
			*/
			case 13: // Enter key
			{
				return self.submitClipAction();
			}
		}
		if (direction) {
			Downsha.getIEExtension().previewNudge(direction);
		}
  };
	Downsha.Popup.prototype.submitClipAction = function() {
		//LOG.debug("Popup.submitClipAction");
		var self = Downsha.getIEExtension().getPopup();
		
		// get attributes from user input, such as title, directory, tags, comment, etc.
		var attrs = {};
		var clipTitle = this.window.document.getElementById("downshaPopupTitle");
		if (clipTitle) {
			if (clipTitle.value != Downsha.i18n.getMessage("popup_untitledNote")) {
				attrs.title = clipTitle.value;
			}
		}
		
		Downsha.getIEExtension().previewClear();
		self.hidePopup();
		
		self.window.setTimeout(function() {
			if (self.clipAction == Downsha.Constants.CLIP_ACTION_SELECTION) {
				Downsha.getIEExtension().clipSelection(attrs);
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_ARTICLE) {
				Downsha.getIEExtension().clipArticle(attrs);
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_FULL_PAGE) {
				Downsha.getIEExtension().clipFullPage(attrs);
			} else if (self.clipAction == Downsha.Constants.CLIP_ACTION_URL) {
				Downsha.getIEExtension().clipUrl(attrs);
			}
		}, self.CLIP_SUBMIT_DELAY_TIME);
	};
})();
