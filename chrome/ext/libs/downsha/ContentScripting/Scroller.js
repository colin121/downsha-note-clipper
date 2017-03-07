/**
 * @author: chenmin
 * @date: 2011-10-04
 * @desc: set animated document scroll from window.pageXOffset/pageYOffset to specified endX/endY
 */

Downsha.Scroller = function Scroller() {
	this.initialize();
};
Downsha.Scroller.prototype.initialize = function() {
	this.initialPoint = {x : window.pageXOffset, y : window.pageYOffset};
};
Downsha.Scroller.scrollTo = function(endX, endY, scrollTotalTime, scrollInterval) {
	if (!scrollTotalTime) {
		scrollTotalTime = 300;
	}
	if (!scrollInterval) {
		scrollInterval = 10;
	}
	if (this._instance) {
		this._instance.abort();
	}
	this._instance = new Downsha.Scroller();
	this._instance.scrollTo({x : endX, y : endY}, scrollTotalTime, scrollInterval);
};
Downsha.Scroller.prototype.scrollTo = function(endPoint, scrollTotalTime, scrollInterval) {
	this.endPoint = endPoint;
	this.step = 0;
	this.calculatePath(scrollTotalTime, scrollInterval);
	var self = this;
	this.proc = setInterval(
		function() {
			if (!self.doScroll()) {
				self.abort();
			}
		},
		scrollInterval
	);
};
Downsha.Scroller.prototype.calculatePath = function(scrollTotalTime, scrollInterval) {
	this.path = [];
	var initialX = this.initialPoint.x;
	var initialY = this.initialPoint.y;
	var endX = this.endPoint.x;
	var endY = this.endPoint.y;
	var deltaAngle = (Math.PI * scrollInterval) / scrollTotalTime;
	for (var e = -(Math.PI/2); e < (Math.PI / 2); e += deltaAngle) {
		var deltaDist = ((1 + Math.sin(e)) / 2);
		this.path.push({x : (initialX + deltaDist * (endX - initialX)), y : (initialY + deltaDist * (endY - initialY))});
	}
};
Downsha.Scroller.prototype.doScroll = function() {
	var scrollPoint = this.path[++this.step];
	if (!scrollPoint) {
		return false;
	}
	window.scrollTo(scrollPoint.x, scrollPoint.y);
	return true;
};
Downsha.Scroller.prototype.abort = function() {
	if (this.proc) {
		clearInterval(this.proc);
		this.proc = null;
	}
};
