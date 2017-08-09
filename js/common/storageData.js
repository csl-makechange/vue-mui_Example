define(function(require, exports, module) {
	exports.isSupport = function(localStorageJson) {
		return window.localStorage;
	};
	exports.setJson = function(localStorageJson) {
		if (window.localStorage) {
			if (localStorageJson) {
				for (var key in localStorageJson) {
					if(typeof localStorageJson[key]=='object'){
						localStorage.setItem(key, JSON.stringify(localStorageJson[key]));
					}else{
						localStorage.setItem(key, localStorageJson[key].toString());
					}
				}
			}
		}
	};
	exports.set = function(key, value) {
		if (window.localStorage) {
			localStorage.setItem(key, value);
		}
	};
	exports.removeItem = function(key) {
		if (window.localStorage) {
			localStorage.removeItem(key);
		}
	};
	exports.get = function(key) {
		if (window.localStorage) {
			return $.trim(localStorage.getItem(key));
		}
	};
});