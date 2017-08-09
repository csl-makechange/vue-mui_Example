define(function(require, exports, module) {
	/* 事件监听 */
	exports.ReBack = function(Callback) {
		window.addEventListener("ReBack", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	exports.ReLogin = function(Callback) {
		window.addEventListener("ReLogin", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	exports.Refresh = function(Callback) {
		window.addEventListener("Refresh", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	exports.PageShow = function(Callback) {
		window.addEventListener("PageShow", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	exports.PageAdd = function(Callback) {
		window.addEventListener("PageAdd", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	exports.PageUpdate = function(Callback) {
		window.addEventListener("PageUpdate", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	exports.PageDelete = function(Callback) {
		window.addEventListener("PageDelete", function(event) {
			if(typeof Callback == 'function') {
				if(event && event.detail) {
					Callback(event.detail);
				} else {
					Callback();
				}
			}
		});
	};
	/* 事件发送 */
	exports.SendReBack = function(view, data) {
		if(mui) {
			mui.fire(view, 'ReBack', data);
		}
	};
	exports.SendReLogin = function(view, data) {
		if(mui) {
			mui.fire(view, 'ReLogin', data);
		}
	};
	exports.SendRefresh = function(view, data) {
		if(mui) {
			mui.fire(view, 'Refresh', data);
		}
	};
	exports.SendPageShow = function(view, data) {
		if(mui) {
			mui.fire(view, 'PageShow', data);
		}
	};
	exports.SendPageAdd = function(view, data) {
		if(mui) {
			mui.fire(view, 'PageAdd', data);
		}
	};
	exports.SendPageUpdate = function(view, data) {
		if(mui) {
			mui.fire(view, 'PageUpdate', data);
		}
	};
	exports.SendPageDelete = function(view, data) {
		if(mui) {
			mui.fire(view, 'PageDelete', data);
		}
	};
});