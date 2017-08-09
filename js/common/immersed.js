define(function(require, exports, module) {
	exports.getStatusbarHeight = function() {
		var immersed = 0;
		var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
		if (ms && ms.length >= 3) {
			immersed = parseFloat(ms[2]);
		}
		return immersed ? immersed : 0;
	};
});