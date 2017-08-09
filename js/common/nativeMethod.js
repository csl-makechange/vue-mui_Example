define(function(require, exports, module) {
	//复制内容到粘贴面板
	exports.copyValue = function(okCallback, txtValue) {
		if(window.plus) {
			if(plus.os.name == "iOS") {
				var UIPasteboard = plus.ios.importClass("UIPasteboard");
				var generalPasteboard = UIPasteboard.generalPasteboard();
				// 设置文本内容
				generalPasteboard.setValueforPasteboardType(txtValue, "public.utf8-plain-text");
				// 获取文本内容
				var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
				if(typeof okCallback == 'function') {
					okCallback(value);
				}
			} else {
				var Context = plus.android.importClass("android.content.Context");
				var main = plus.android.runtimeMainActivity();
				var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
				// 设置文本内容
				plus.android.invoke(clip, "setText", txtValue);
				// 获取文本内容
				var value = plus.android.invoke(clip, "getText");
				if(typeof okCallback == 'function') {
					okCallback(value);
				}
			}
		}
	};
	//获取当前复制内容
	exports.getCopyValue = function(okCallback) {
		if(window.plus) {
			if(plus.os.name == "iOS") {
				var UIPasteboard = plus.ios.importClass("UIPasteboard");
				var generalPasteboard = UIPasteboard.generalPasteboard();
				// 获取文本内容
				var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
				if(typeof okCallback == 'function') {
					okCallback(value);
				}
			} else {
				var Context = plus.android.importClass("android.content.Context");
				var main = plus.android.runtimeMainActivity();
				var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
				// 获取文本内容
				var value = plus.android.invoke(clip, "getText");
				if(typeof okCallback == 'function') {
					okCallback(value);
				}
			}
		}
	};
	//弹出键盘
	exports.popupKeyboard = function(obj, times) {
		if(window.plus) {
			var nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
			if(plus.os.name == 'Android') {
				plus.android.importClass(nativeWebview);
				nativeWebview.requestFocus();
				var Context = plus.android.importClass("android.content.Context");
				var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
				var main = plus.android.runtimeMainActivity();
				var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
				imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
			} else {
				nativeWebview.plusCallMethod({
					"setKeyboardDisplayRequiresUserAction": false
				});
			}
			var timesout = 100;
			if(times) {
				timesout = parseInt(times);
			}
			setTimeout(function() {
				document.getElementById(obj).focus();
			}, timesout);
		} else {
			document.getElementById(obj).focus();
		}
	};
});