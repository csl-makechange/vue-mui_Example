define(function(require, exports, module) {
	//是否记录登录状态
	exports.isLogin = function() {
		var account = localStorage.getItem("$.account");
		var password = localStorage.getItem("$.password");
		if(account != null && password != null) {
			return true;
		} else {
			return false;
		}
	};
});