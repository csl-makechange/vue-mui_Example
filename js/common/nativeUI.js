define(function(require, exports, module) {
	var waitingObj = null;
	exports.pickDate = function(okCallback, cancelCallback, options) {
		if(window.plus) {
			plus.nativeUI.pickDate(function(e) {
				var date = e.date;
				if(typeof okCallback == 'function') {
					okCallback(date);
				}
			}, function(e) {
				if(typeof cancelCallback == 'function') {
					cancelCallback(e.message);
				}
			}, options);
		}
	};
	exports.pickTime = function(okCallback, cancelCallback, options) {
		if(window.plus) {
			plus.nativeUI.pickTime(function(e) {
				var date = e.date;
				if(typeof okCallback == 'function') {
					okCallback(date);
				}
			}, function(e) {
				if(typeof cancelCallback == 'function') {
					cancelCallback(e.message);
				}
			}, options);
		}
	};
	exports.toast = function(msg) {
		if(window.plus) {
			plus.nativeUI.toast(msg, {
				duration: 'short',
				align: 'center',
				verticalAlign: 'bottom'
			});
		} else {
			mui.toast(msg);
		}
	};
	exports.waiting = function(msg, closeTimes,Callback) {
		if(waitingObj) { // 避免快速多次点击创建多个窗口
			return;
		}
		if(window.plus) {
			waitingObj = plus.nativeUI.showWaiting(msg);
			if(closeTimes) {
				closeTimes = parseInt(closeTimes);
				if(closeTimes > 0) {
					window.setTimeout(function() {
						if(waitingObj) {
							waitingObj.close();
							if(typeof Callback == 'function') {
					            Callback();
				            }
							waitingObj = null;
						}
					}, closeTimes);
				}
			}
		}
	};
	exports.waitingTitle = function(msg) {
		if(window.plus) {
			if(waitingObj) {
				waitingObj.setTitle(msg);
			}
		}
	};
	exports.waitingClose = function() {
		if(window.plus) {
			if(waitingObj) {
				waitingObj.close();
				waitingObj = null;
			}
		}
	};
	exports.alert = function(title, msg, button, callback) {
		if(window.plus) {
			plus.nativeUI.alert(msg, function() {
				if(typeof callback == 'function') {
					callback();
				}
			}, title, button);
		} else {
			mui.alert(msg, title, function() {
				if(typeof callback == 'function') {
					callback();
				}
			});
		}
	};
	exports.confirm = function(title, msg, button, okCallback, cancelCallback) {
		if(window.plus) {
			plus.nativeUI.confirm(msg, function(e) {
				if(e.index == 0) {
					if(typeof okCallback == 'function') {
						okCallback();
					}
				} else {
					if(typeof cancelCallback == 'function') {
						cancelCallback();
					}
				}
			}, title, button);
		} else {
			mui.confirm(msg, title, button, function(e) {
				if(e.index == 1) {
					if(typeof okCallback == 'function') {
						okCallback();
					}
				} else {
					if(typeof cancelCallback == 'function') {
						cancelCallback();
					}
				}
			})
		}
	};
	exports.actionSheet = function(title, cancelText, buttons, callback) {
		if(window.plus) {
			var arr = {};
			if(title && title != "") {
				arr["title"] = title;
			}
			arr["cancel"] = cancelText;
			arr["buttons"] = buttons;
			plus.nativeUI.actionSheet(arr, function(e) {
				if(typeof callback == 'function') {
					callback(e.index);
				}
			});
		}
	};
	exports.prompt = function(msg, callback, title, tip, buttons) {
		if(window.plus) {
			plus.nativeUI.prompt(msg, function(e) {
				if(typeof callback == 'function') {
					callback(e.index);
				}
			}, title, tip, buttons);
		} else {
			mui.prompt(msg, tip, title, buttons, function(e) {
				if(e.index == 1) {
					if(typeof callback == 'function') {
						callback(e.index);
					}
				} else {

				}
			})
		}
	};
});