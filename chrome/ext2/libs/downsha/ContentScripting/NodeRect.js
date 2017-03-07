/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: provides the functions of rectangle
 */

Downsha.NodeRect = function NodeRect() {
	this.__defineGetter__("width", this.getWidth);
	this.__defineGetter__("height", this.getHeight);
};
Downsha.NodeRect.fromNode = function(b) { // get the bounding rectangle of nodes b
	var c = b.ownerDocument;
	var a = null;
	var d = c.createRange();
	if (b.childNodes.length == 0) {
		d.selectNode(b);
	} else {
		d.selectNodeContents(b);
	}
	a = d.getBoundingClientRect();
	if (a) {
		a = Downsha.NodeRect.fromObject(a);
	}
	return a;
};
Downsha.NodeRect.fromObject = function(d) {
	var c = new Downsha.NodeRect();
	if (d) {
		var b = ["left","top","right","bottom"];
		for (var a = 0; a < b.length; a++) {
			if (d[b[a]]) {
				c[b[a]] = d[b[a]];
			}
		}
	}
	return c;
};

Downsha.NodeRect.prototype.left = 0;
Downsha.NodeRect.prototype.top = 0;
Downsha.NodeRect.prototype.right = 0;
Downsha.NodeRect.prototype.bottom = 0;
Downsha.NodeRect.prototype.getWidth = function() {
	return (this.right - this.left);
};
Downsha.NodeRect.prototype.getHeight = function() {
	return (this.bottom - this.top);
};
Downsha.NodeRect.prototype.toString = function() {
	return "" + this.left + ":" + this.top + "x" + this.right + ":" + this.bottom + " (" + this.width + "x" + this.height + ")";
};
