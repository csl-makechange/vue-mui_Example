define(["json", "mui","vue"], function(require, exports, module) {
	'use strict';
	$.config = {
		autoInit: false
	};
	Date.prototype.addDay = function(num) {
		this.setDate(this.getDate() + num);
		return this
	};
	Date.prototype.addMonth = function(num) {
		var tempDate = this.getDate();
		this.setMonth(this.getMonth() + num);
		if(tempDate != this.getDate()) {
			this.setDate(0)
		}
		return this
	};
	Date.prototype.addYear = function(num) {
		var tempDate = this.getDate();
		this.setYear(this.getYear() + num);
		if(tempDate != this.getDate()) {
			this.setDate(0)
		}
		return this
	};
	Date.prototype.Format = function(formatStr) {
		var str = formatStr;
		var Week = ["日", "一", "二", "三", "四", "五", "六"];
		str = str.replace(/yyyy|YYYY/, this.getFullYear());
		str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : "0" + (this.getYear() % 100));
		str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : "0" + (this.getMonth() + 1));
		str = str.replace(/M/g, (this.getMonth() + 1));
		str = str.replace(/w|W/g, Week[this.getDay()]);
		str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : "0" + this.getDate());
		str = str.replace(/d|D/g, this.getDate());
		str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : "0" + this.getHours());
		str = str.replace(/h|H/g, this.getHours());
		str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : "0" + this.getMinutes());
		str = str.replace(/m/g, this.getMinutes());
		str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : "0" + this.getSeconds());
		str = str.replace(/s|S/g, this.getSeconds());
		return str
	};

	function StringBuilder(value) {
		this.strings = new Array("");
		this.append(value)
	}
	StringBuilder.prototype.append = function(value) {
		if(value) {
			this.strings.push(value)
		}
	};
	StringBuilder.prototype.clear = function() {
		this.strings.length = 1
	};
	StringBuilder.prototype.toString = function() {
		return this.strings.join("")
	};

	function HashMap() {
		var size = 0;
		var entry = [];
		this.put = function(key, value) {
			if(!this.containsKey(key)) {
				size++
			}
			entry[key] = value
		};
		this.get = function(key) {
			return this.containsKey(key) ? entry[key] : null
		};
		this.remove = function(key) {
			if(this.containsKey(key) && (delete entry[key])) {
				size--
			}
		};
		this.containsKey = function(key) {
			return(key in entry)
		};
		this.containsValue = function(value) {
			for(var prop in entry) {
				if(entry[prop] == value) {
					return true
				}
			}
			return false
		};
		this.values = function() {
			var values = new Array();
			for(var prop in entry) {
				values.push(entry[prop])
			}
			return values
		};
		this.keys = function() {
			var keys = new Array();
			for(var prop in entry) {
				keys.push(prop)
			}
			return keys
		};
		this.size = function() {
			return size
		};
		this.clear = function() {
			size = 0;
			entry = new Object()
		}
	}
	Array.prototype.insert = function(index, item) {
		this.splice(index, 0, item)
	};
	Array.prototype.contain = function(obj) {
		var index = this.indexOf(obj);
		return index > -1
	};
	Array.prototype.removeAt = function(Index) {
		if(isNaN(Index) || Index > this.length) {
			return false
		}
		for(var i = 0, n = 0; i < this.length; i++) {
			if(this[i] != this[Index]) {
				this[n++] = this[i]
			}
		}
		this.length -= 1
	};
	Array.prototype.remove = function(obj) {
		if(null == obj) {
			return
		}
		for(var i = 0, n = 0; i < this.length; i++) {
			if(this[i] != obj) {
				this[n++] = this[i]
			}
		}
		this.length -= 1
	};
	Array.prototype.Contains = function(obj) {
		if(null == obj) {
			return false
		}
		var c = false;
		for(var i = 0, n = 0; i < this.length; i++) {
			if(this[i] == obj) {
				c = true
			}
		}
		return c
	};
	Array.prototype.IndexOf = function(obj) {
		if(null == obj) {
			return
		}
		for(var i = 0, n = 0; i < this.length; i++) {
			if(this[i] == obj) {
				return i
			}
		}
		return -1
	};
	Array.prototype.Clear = function() {
		this.length = 0
	};
	String.formatmodel = function(str, model) {
		for(var k in model) {
			var re = new RegExp("{" + k + "}", "g");
			str = str.replace(re, model[k])
		}
		return str
	};
	var base64_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	String.prototype.ToCharArray = function() {
		return this.split("")
	};
	String.prototype.Reverse = function() {
		return this.split("").reverse().join("")
	};
	String.prototype.IsContains = function(str) {
		return(this.indexOf(str) > -1)
	};
	String.prototype.IsEmpty = function() {
		return this == ""
	};
	String.prototype.IsNumeric = function() {
		var tmpFloat = parseFloat(this);
		if(isNaN(tmpFloat)) {
			return false
		}
		return true
	};
	String.prototype.IsInt = function() {
		if(this == "NaN") {
			return false
		}
		return this == parseInt(this).toString()
	};
	String.prototype.resetBlank = function() {
		return this.replace(/s+/g, "")
	};
	String.prototype.LTrim = function() {
		return this.replace(/(^\s*)/g, "")
	};
	String.prototype.RTrim = function() {
		return this.replace(/(\s*$)/g, "")
	};
	String.prototype.trim = function() {
		return this.replace(/(^\s*)|(\s*$)/g, "")
	};
	String.prototype.getNum = function() {
		return this.replace(/[^d]/g, "")
	};
	String.prototype.getEn = function() {
		return this.replace(/[^A-Za-z]/g, "")
	};
	String.prototype.getCn = function() {
		return this.replace(/[^u4e00-u9fa5uf900-ufa2d]/g, "")
	};
	String.prototype.ByteLength = function() {
		return this.replace(/[^\x00-\xff]/g, "aa").length
	};
	String.prototype.left = function(n) {
		return this.slice(0, n)
	};
	String.prototype.right = function(n) {
		return this.slice(this.length - n)
	};
	String.prototype.HTMLEncode = function() {
		var re = this;
		var q1 = [/x26/g, /x3C/g, /x3E/g, /x20/g];
		var q2 = ["&", "<", ">", " "];
		for(var i = 0; i < q1.length; i++) {
			re = re.replace(q1[i], q2[i])
		}
		return re
	};
	String.prototype.Unicode = function() {
		var tmpArr = [];
		for(var i = 0; i < this.length; i++) {
			tmpArr.push("&#" + this.charCodeAt(i) + ";")
		}
		return tmpArr.join("")
	};
	String.prototype.Insert = function(index, str) {
		return this.substring(0, index) + str + this.substr(index)
	};
	String.prototype.startsWith = function(str) {
		return this.substr(0, str.length) == str
	};
	String.prototype.iStartsWith = function(str) {
		return this.substr(0, str.length).iEquals(str)
	};
	String.prototype.endsWith = function(str) {
		return this.substr(this.length - str.length) == str
	};
	String.prototype.iEndsWith = function(str) {
		return this.substr(this.length - str.length).iEquals(str)
	};
	String.prototype.iEquals = function(str) {
		return this.toLowerCase() == str.toLowerCase()
	};
	String.prototype.compareTo = function(str) {
		if(this == str) {
			return 0
		} else {
			if(this < str) {
				return -1
			} else {
				return 1
			}
		}
	};
	String.prototype.iCompareTo = function(str) {
		return this.toLowerCase().compareTo(str.toLowerCase())
	};
	String.prototype.encode64 = function() {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		var input = this.toString();
		do {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if(isNaN(chr2)) {
				enc3 = enc4 = 64
			} else {
				if(isNaN(chr3)) {
					enc4 = 64
				}
			}
			output = output + base64_keyStr.charAt(enc1) + base64_keyStr.charAt(enc2) + base64_keyStr.charAt(enc3) + base64_keyStr.charAt(enc4);
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = ""
		} while (i < input.length);
		return output
	};
	String.prototype.StringFormat = function() {
		if(arguments.length == 0) {
			return null
		}
		var str = arguments[0];
		for(var i = 1; i < arguments.length; i++) {
			var re = new RegExp("\\{" + (i - 1) + "\\}");
			str = str.replace(re, arguments[i])
		}
		return str
	};
	String.prototype.decode64 = function(input) {
		var output = "";
		var chr1, chr2, chr3 = "";
		var enc1, enc2, enc3, enc4 = "";
		var i = 0;
		if(input.length % 4 != 0) {
			return ""
		}
		var base64test = /[^A-Za-z0-9\+\/\=]/g;
		if(base64test.exec(input)) {
			return ""
		}
		do {
			enc1 = base64_keyStr.indexOf(input.charAt(i++));
			enc2 = base64_keyStr.indexOf(input.charAt(i++));
			enc3 = base64_keyStr.indexOf(input.charAt(i++));
			enc4 = base64_keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if(enc3 != 64) {
				output += String.fromCharCode(chr2)
			}
			if(enc4 != 64) {
				output += String.fromCharCode(chr3)
			}
			chr1 = chr2 = chr3 = "";
			enc1 = enc2 = enc3 = enc4 = ""
		} while (i < input.length);
		return output
	};
	String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
		if(!RegExp.prototype.isPrototypeOf(reallyDo)) {
			return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith)
		} else {
			return this.replace(reallyDo, replaceWith)
		}
	};

	function dateLe(startDate, endDate) {
		if(startDate && endDate) {
			startDate = startDate.replace(/-/g, "/");
			endDate = endDate.replace(/-/g, "/");
			var dt1 = new Date(Date.parse(startDate));
			var dt2 = new Date(Date.parse(endDate));
			return(dt1 <= dt2)
		} else {
			return false
		}
	}

	function dateLt(startDate, endDate) {
		if(startDate && endDate) {
			startDate = startDate.replace(/-/g, "/");
			endDate = endDate.replace(/-/g, "/");
			var dt1 = new Date(Date.parse(startDate));
			var dt2 = new Date(Date.parse(endDate));
			return(dt1 < dt2)
		} else {
			return false
		}
	}

	function dateGt(startDate, endDate) {
		if(startDate && endDate) {
			startDate = startDate.replace(/-/g, "/");
			endDate = endDate.replace(/-/g, "/");
			var dt1 = new Date(Date.parse(startDate));
			var dt2 = new Date(Date.parse(endDate));
			return(dt1 > dt2)
		} else {
			return false
		}
	}

	function dateGe(startDate, endDate) {
		if(startDate && endDate) {
			startDate = startDate.replace(/-/g, "/");
			endDate = endDate.replace(/-/g, "/");
			var dt1 = new Date(Date.parse(startDate));
			var dt2 = new Date(Date.parse(endDate));
			return(dt1 >= dt2)
		} else {
			return false
		}
	}

	function getLocationHref() {
		return document.location.href
	}

	function checkLength(strTemp) {
		var i, sum;
		sum = 0;
		for(i = 0; i < strTemp.length; i++) {
			if((strTemp.charCodeAt(i) >= 0) && (strTemp.charCodeAt(i) <= 255)) {
				sum = sum + 1
			} else {
				sum = sum + 2
			}
		}
		return sum
	}

	function getRandomNumber(min, max) {
		var range = max - min;
		var rand = Math.random();
		return(min + Math.round(rand * range))
	}

	function isJson(obj) {
		var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
		return isjson
	}

	function strToJson(str) {
		var json = eval("(" + str + ")");
		return json
	}

	function checkDate(startDate, endDate) {
		var sDate = new Date(startDate.replace(/\-/g, "/"));
		var eDate = new Date(endDate.replace(/\-/g, "/"));
		if(sDate > eDate) {
			return false
		}
		return true
	}

	function parseURL(paramsURL) {
		var url = "";
		if(paramsURL) {
			url = paramsURL
		} else {
			url = document.baseURI || document.URL
		}
		url = decodeURI(url);
		var parse = url.match(/^(([a-z]+):\/\/)?([^\/\?#]+)\/*([^\?#]*)\??([^#]*)#?(\w*)$/i);
		var query = parse[5];
		var arrtmp = query.split("&");
		var queryMap = new HashMap();
		for(i = 0; i < arrtmp.length; i++) {
			num = arrtmp[i].indexOf("=");
			if(num > 0) {
				name = arrtmp[i].substring(0, num);
				value = arrtmp[i].substr(num + 1);
				queryMap.put(name, value)
			}
		}
		return queryMap
	}

	function isNull(str) {
		if(str == "") {
			return true
		}
		var regu = "^[ ]+$";
		var re = new RegExp(regu);
		return re.test(str)
	}

	function isInteger(str) {
		var regu = /^[-]{0,1}[0-9]{1,}$/;
		return regu.test(str)
	}

	function isNumber(s) {
		var regu = "^[0-9]+$";
		var re = new RegExp(regu);
		if(s.search(re) != -1) {
			return true
		} else {
			return false
		}
	}

	function isDecimal(str) {
		if(isInteger(str)) {
			return true
		}
		var re = /^[-]{0,1}(\d+)[\.]+(\d+)$/;
		if(re.test(str)) {
			if(RegExp.$1 == 0 && RegExp.$2 == 0) {
				return false
			}
			return true
		} else {
			return false
		}
	}
	jQuery.ibo = {};
	$.ibo.GetDataJson = function(str) {
		str = str.replace("T", " ");
		if($.ibo.ismobile() == "0") {
			str = str.replace(/-/g, "/")
		}
		return "/Date(" + (new Date(str) - new Date("1970-01-01")) + "+0800)/"
	};
	$.ibo.quickSort = function(arr, fn) {
		if(arr.length <= 1) {
			return arr
		}
		var pivotIndex = Math.floor(arr.length / 2);
		var pivot = arr.splice(pivotIndex, 1)[0];
		var left = [];
		var right = [];
		for(var i = 0; i < arr.length; i++) {
			if(fn(arr[i], pivot)) {
				left.push(arr[i])
			} else {
				right.push(arr[i])
			}
		}
		return $.ibo.quickSort(left, fn).concat([pivot], $.ibo.quickSort(right, fn))
	};
	$.ibo.QSArray;
	$.ibo.QueryString = function(key, cache) {
		if(!$.ibo.QSArray || !cache) {
			$.ibo.QSArray = [];
			var searchArr = window.location.search;
			if(searchArr.length > 0) {
				searchArr = searchArr.substr(1)
			}
			searchArr = searchArr.split("&");
			var length = searchArr.length;
			for(var i = 0; i < length; i++) {
				var tmpArr = searchArr[i].split("=");
				$.ibo.QSArray[tmpArr[0].toLowerCase()] = tmpArr[1]
			}
		}
		return $.ibo.QSArray[key.toLowerCase()]
	};
	$.ibo.OpenModalWin = function(para) {
		var ifr = $("<iframe>");
		ifr.attr("frameborder", "no");
		ifr.css("border", "0 none");
		ifr.addClass("ibo-newwindow-before");
		ifr.attr("src", para.url);
		ifr.on("load", function() {
			ifr.get(0).contentWindow.closeWin = function(IsCallBack, CallBackPara) {
				if(para && para.close && typeof para.close == "function") {
					para.close(IsCallBack, CallBackPara)
				}
				if(IsCallBack && para && para.fn && typeof para.fn == "function") {
					para.fn(CallBackPara)
				}
				ifr.remove();
				$(document.body).css({
					overflow: "auto"
				})
			}
		});
		$(document.body).css({
			overflow: "hidden"
		});
		$(document.body).append(ifr);
		return ifr
	};
	$.ibo.OpenModalWinDph = function(para) {
		var ifr = $("<iframe>");
		ifr.attr("frameborder", "no");
		ifr.css("border", "0 none");
		ifr.addClass("ibo-newwindow-before");
		ifr.attr("src", para.url);
		$(document.body).css({
			overflow: "hidden"
		});
		$("#appiframe").empty().html(ifr);
		return ifr
	};
	$.ibo.ShowErrorMsg = function(obj) {
		if(obj && obj.ResObj) {
			alert(obj.ResObj)
		} else {
			alert(obj)
		}
	};
	$.ibo.showIndicator = function() {
		$("body").append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
		setTimeout(function() {
			$(".preloader-indicator-overlay, .preloader-indicator-modal").remove()
		}, 1000 * 10)
	};
	$.ibo.hideIndicator = function() {
		$(".preloader-indicator-overlay, .preloader-indicator-modal").remove()
	};
	$.ibo.IsPC = function() {
		var userAgentInfo = navigator.userAgent;
		var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
		var flag = true;
		for(var v = 0; v < Agents.length; v++) {
			if(userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = false;
				break
			}
		}
		return flag
	};
	$.ibo.Upload = function(para) {
		var fd = new FormData();
		fd.append("fileToUpload", para.file);
		var xhr = new XMLHttpRequest();
		if(xhr.addEventListener) {
			xhr.addEventListener("load", para.complete, false);
			xhr.addEventListener("error", uploadFailed, false)
		} else {
			xhr.attachEvent("load", para.complete);
			xhr.attachEvent("error", uploadFailed)
		}

		function uploadFailed(evt) {
			alert(evt.target.responseText)
		}
		xhr.open("POST", $.ibo.CompanyBaseSrvUrl + "/UploadHandler.ashx?ComID=" + $.ibo.ComID);
		xhr.send(fd)
	};
	$.ibo.ismobile = function() {
		var u = navigator.userAgent,
			app = navigator.appVersion;
		if(/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
			if(window.location.href.indexOf("?mobile") < 0) {
				try {
					if(/iPhone|mac|iPod|iPad/i.test(navigator.userAgent)) {
						return "0"
					} else {
						return "1"
					}
				} catch(e) {}
			}
		} else {
			if(u.indexOf("iPad") > -1) {
				return "0"
			} else {
				return "1"
			}
		}
	};
	$.ibo.pagefloat = function(dom, sclid) {
		if($.ibo.ismobile() == "0") {
			return
		}
		var _this = $(dom);
		var _sclid = sclid ? $(sclid) : $(window);
		var posi = _this.offset();
		var hg = $(window).height();
		var scltop = _sclid.scrollTop();
		var movelen;
		window.onresize = function() {
			$.ibo.pagefloat(dom, sclid)
		};
		if(hg < 2 * (posi.top)) {
			movehg = scltop + (posi.top - 80);
			_sclid.scrollTop(movehg)
		} else {
			if(scltop && (hg > 2 * (posi.top))) {
				movehg = scltop - 40;
				_sclid.scrollTop(movehg)
			}
		}
	};
	$.ibo.netWork = function(obj) {
		var types = {};
		types[plus.networkinfo.CONNECTION_UNKNOW] = "Unknown connection";
		types[plus.networkinfo.CONNECTION_NONE] = "网络不给力,请稍后再试";
		types[plus.networkinfo.CONNECTION_ETHERNET] = "Ethernet connection";
		types[plus.networkinfo.CONNECTION_WIFI] = "WiFi连接";
		types[plus.networkinfo.CONNECTION_CELL2G] = "2G网络";
		types[plus.networkinfo.CONNECTION_CELL3G] = "3G网络";
		types[plus.networkinfo.CONNECTION_CELL4G] = "4G网络";
		var Netdiv = $("<div class='noNetWork'>");
		var Netimg = $("<div class='iconfont icon-nowifi imgnoNetWork'>");
		var Netcontent = $("<div class='contentnoNetWork'>");
		Netcontent.text("无网络连接");
		Netdiv.append(Netimg);
		Netdiv.append(Netcontent);
		$("body").append(Netdiv);
		if(types[plus.networkinfo.getCurrentType()] == "网络不给力,请稍后再试") {
			$(".noNetWork").show();
			if(obj) {
				$(".noNetWork").delay(2000).hide(0);
			}
		} else {
			$(".noNetWork").hide()
		}
		document.addEventListener("netchange", function() {
			if(types[plus.networkinfo.getCurrentType()] == "网络不给力,请稍后再试") {
				$(".noNetWork").show();
				if(obj) {
					$(".noNetWork").delay(2000).hide(0);
				}
			} else {
				$(".noNetWork").hide();
			}
		})
	};
	$.networks = {
		show: function() {
			mui.plusReady(function() {
				$.ibo.netWork();
			})
		},
		hide: function() {
			mui.plusReady(function() {
				$.ibo.netWork(true);
			})
		}
	};
	$.ibo.clearWebview = function() {
		if(window.plus) {
			var imWindow = plus.webview.getWebviewById("im_index");
			var deskWindow = plus.webview.getWebviewById("desk_index");
			var circleWindow = plus.webview.getWebviewById("circle_index");
			var marketingWindow = plus.webview.getWebviewById("marketing_index");
			var meWindow = plus.webview.getWebviewById("me_index");
			var recommendWindow = plus.webview.getWebviewById("recommend_index");
			if(imWindow) {
				imWindow.close();
			}
			if(deskWindow) {
				deskWindow.close();
			}
			if(circleWindow) {
				circleWindow.close();
			}
			if(marketingWindow) {
				marketingWindow.close();
			}
			if(meWindow) {
				meWindow.close();
			}
			if(recommendWindow) {
				recommendWindow.close();
			}
		}
	};
	$.ibo.clearAllWebview = function(currentwindow) {
		if(window.plus) {
			var windowList = plus.webview.all();
			var launchId = plus.webview.getLaunchWebview().id;
			var currentId = currentwindow.id;
			console.log(currentId);
			if(windowList && launchId) {
				for(var i = 0; i < windowList.length; i++) {
					var windowObj = windowList[i];
					if(windowObj) {
						var winID = windowObj.id;
						console.log(winID);
						if(winID) {
							if(winID != launchId) {
								var flag = false;
								if(currentId) {
									if(currentId.indexOf(winID) != -1) {
										flag = true;
									}
								}
								if(!flag) {
									windowObj.hide();
									windowObj.close();
								}
							}
						}
					}
				}
			}
		}
	};
	$.ibo.clearLogin = function() {
		localStorage.removeItem("$.ibo.ComID");
		localStorage.removeItem("UrlItem");
		localStorage.removeItem("pwd");
		localStorage.removeItem("passwordxx");
		localStorage.removeItem("chooseType");
		localStorage.removeItem("IsHandPwd");
		localStorage.removeItem("IsComFlag")
	};
	$.swiperight = {
		right: function() {
			var u = navigator.userAgent;
			var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
			var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
			if(isiOS == "true") {
				window.addEventListener("swiperight", function() {
					mui.back()
				})
			}
		}
	};
	$.ibo.IsLogin = function(para) {
		mui.alert(para, "下线通知", "重新登录", function() {
			$.ibo.clearLogin();
			$.ibo.BackLogin();
		})
	};
	$.ibo.BackLogin = function(paraurl) {
		var loginurl = paraurl ? paraurl : "../login/index.html?extflag=" + Math.random();
		var nw = mui.openWindow({
			url: loginurl,
			styles: {
				popGesture: 'none'
			}
		});
		nw.addEventListener("show", function() {
			$.ibo.clearAllWebview(nw);
		});
	};
	$.ibo.Getsearch = function() {
		var search = location.search;
		var arr = [];
		var obj = {};
		if(search) {
			arr = search.substring(1).split("&")
		}
		for(var i = 0; i < arr.length; i++) {
			var str = [];
			str = arr[i].split("=");
			obj[str[0]] = str[1]
		}
		return obj
	};
	$(function() {
		$(document).on("focus", ".searchbar input", function() {
			$(this).parents(".searchbar").addClass("searchbar-active");
			$(this).scrollLeft(1000);
		});
		$(document).on("tap", ".searchbar-cancel", function(e) {
			$(this).parents(".searchbar").removeClass("searchbar-active");
			$(this).parents(".searchbar").find("input[type='search']").val("");
		});
		$(document).on("blur", ".searchbar input", function() {
			$(this).parents(".searchbar").removeClass("searchbar-active");
		});
	});
	(function($) {
		'use strict';

		function FastClick(layer, options) {
			var oldOnClick;
			options = options || {};
			this.trackingClick = false;
			this.trackingClickStart = 0;
			this.targetElement = null;
			this.touchStartX = 0;
			this.touchStartY = 0;
			this.lastTouchIdentifier = 0;
			this.touchBoundary = options.touchBoundary || 10;
			this.layer = layer;
			this.tapDelay = options.tapDelay || 200;
			this.tapTimeout = options.tapTimeout || 700;
			if(FastClick.notNeeded(layer)) {
				return
			}

			function bind(method, context) {
				return function() {
					return method.apply(context, arguments)
				}
			}
			var methods = ["onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel"];
			var context = this;
			for(var i = 0, l = methods.length; i < l; i++) {
				context[methods[i]] = bind(context[methods[i]], context)
			}
			if(deviceIsAndroid) {
				layer.addEventListener("mouseover", this.onMouse, true);
				layer.addEventListener("mousedown", this.onMouse, true);
				layer.addEventListener("mouseup", this.onMouse, true)
			}
			layer.addEventListener("click", this.onClick, true);
			layer.addEventListener("touchstart", this.onTouchStart, false);
			layer.addEventListener("touchmove", this.onTouchMove, false);
			layer.addEventListener("touchend", this.onTouchEnd, false);
			layer.addEventListener("touchcancel", this.onTouchCancel, false);
			if(!Event.prototype.stopImmediatePropagation) {
				layer.removeEventListener = function(type, callback, capture) {
					var rmv = Node.prototype.removeEventListener;
					if(type === "click") {
						rmv.call(layer, type, callback.hijacked || callback, capture)
					} else {
						rmv.call(layer, type, callback, capture)
					}
				};
				layer.addEventListener = function(type, callback, capture) {
					var adv = Node.prototype.addEventListener;
					if(type === "click") {
						adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
							if(!event.propagationStopped) {
								callback(event)
							}
						}), capture)
					} else {
						adv.call(layer, type, callback, capture)
					}
				}
			}
			if(typeof layer.onclick === "function") {
				oldOnClick = layer.onclick;
				layer.addEventListener("click", function(event) {
					oldOnClick(event)
				}, false);
				layer.onclick = null
			}
		}
		var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
		var deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0 && !deviceIsWindowsPhone;
		var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
		var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);
		var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);
		var deviceIsBlackBerry10 = navigator.userAgent.indexOf("BB10") > 0;
		FastClick.prototype.needsClick = function(target) {
			switch(target.nodeName.toLowerCase()) {
				case "button":
				case "select":
				case "textarea":
					if(target.disabled) {
						return true
					}
					break;
				case "input":
					if((deviceIsIOS && target.type === "file") || target.disabled) {
						return true
					}
					break;
				case "label":
				case "iframe":
				case "video":
					return true;
				default:
			}
			return(/\bneedsclick\b/).test(target.className)
		};
		FastClick.prototype.needsFocus = function(target) {
			switch(target.nodeName.toLowerCase()) {
				case "textarea":
					return true;
				case "select":
					return !deviceIsAndroid;
				case "input":
					switch(target.type) {
						case "button":
						case "file":
						case "image":
						case "radio":
						case "submit":
							return false
					}
					return !target.disabled && !target.readOnly;
				default:
					return(/\bneedsfocus\b/).test(target.className)
			}
		};
		FastClick.prototype.sendClick = function(targetElement, event) {
			var clickEvent, touch;
			if(document.activeElement && document.activeElement !== targetElement) {
				document.activeElement.blur()
			}
			touch = event.changedTouches[0];
			clickEvent = document.createEvent("MouseEvents");
			clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
			clickEvent.forwardedTouchEvent = true;
			targetElement.dispatchEvent(clickEvent)
		};
		FastClick.prototype.determineEventType = function(targetElement) {
			if(deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
				return "mousedown"
			}
			return "click"
		};
		FastClick.prototype.focus = function(targetElement) {
			var length;
			if(deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time" && targetElement.type !== "month" && targetElement.type !== "number" && targetElement.type !== "checkbox") {
				length = targetElement.value.length;
				targetElement.setSelectionRange(length, length);
			} else {
				targetElement.focus();
			}
		};
		FastClick.prototype.updateScrollParent = function(targetElement) {
			var scrollParent, parentElement;
			scrollParent = targetElement.fastClickScrollParent;
			if(!scrollParent || !scrollParent.contains(targetElement)) {
				parentElement = targetElement;
				do {
					if(parentElement.scrollHeight > parentElement.offsetHeight) {
						scrollParent = parentElement;
						targetElement.fastClickScrollParent = parentElement;
						break
					}
					parentElement = parentElement.parentElement
				} while (parentElement)
			}
			if(scrollParent) {
				scrollParent.fastClickLastScrollTop = scrollParent.scrollTop
			}
		};
		FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
			if(eventTarget.nodeType === Node.TEXT_NODE) {
				return eventTarget.parentNode
			}
			return eventTarget
		};
		FastClick.prototype.onTouchStart = function(event) {
			var targetElement, touch, selection;
			if(event.targetTouches.length > 1) {
				return true
			}
			targetElement = this.getTargetElementFromEventTarget(event.target);
			touch = event.targetTouches[0];
			if(deviceIsIOS) {
				selection = window.getSelection();
				if(selection.rangeCount && !selection.isCollapsed) {
					return true
				}
				if(!deviceIsIOS4) {
					if(touch.identifier && touch.identifier === this.lastTouchIdentifier) {
						event.preventDefault();
						return false
					}
					this.lastTouchIdentifier = touch.identifier;
					this.updateScrollParent(targetElement)
				}
			}
			this.trackingClick = true;
			this.trackingClickStart = event.timeStamp;
			this.targetElement = targetElement;
			this.touchStartX = touch.pageX;
			this.touchStartY = touch.pageY;
			if((event.timeStamp - this.lastClickTime) < this.tapDelay) {
				event.preventDefault()
			}
			return true
		};
		FastClick.prototype.touchHasMoved = function(event) {
			var touch = event.changedTouches[0],
				boundary = this.touchBoundary;
			if(Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
				return true
			}
			return false
		};
		FastClick.prototype.onTouchMove = function(event) {
			if(!this.trackingClick) {
				return true
			}
			if(this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
				this.trackingClick = false;
				this.targetElement = null
			}
			return true
		};
		FastClick.prototype.findControl = function(labelElement) {
			if(labelElement.control !== undefined) {
				return labelElement.control
			}
			if(labelElement.htmlFor) {
				return document.getElementById(labelElement.htmlFor)
			}
			return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")
		};
		FastClick.prototype.onTouchEnd = function(event) {
			var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
			if(!this.trackingClick) {
				return true
			}
			if((event.timeStamp - this.lastClickTime) < this.tapDelay) {
				this.cancelNextClick = true;
				return true
			}
			if((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
				return true
			}
			this.cancelNextClick = false;
			this.lastClickTime = event.timeStamp;
			trackingClickStart = this.trackingClickStart;
			this.trackingClick = false;
			this.trackingClickStart = 0;
			if(deviceIsIOSWithBadTarget) {
				touch = event.changedTouches[0];
				targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
				targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent
			}
			targetTagName = targetElement.tagName.toLowerCase();
			if(targetTagName === "label") {
				forElement = this.findControl(targetElement);
				if(forElement) {
					this.focus(targetElement);
					if(deviceIsAndroid) {
						return false
					}
					targetElement = forElement
				}
			} else {
				if(this.needsFocus(targetElement)) {
					if((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === "input")) {
						this.targetElement = null;
						return false
					}
					this.focus(targetElement);
					this.sendClick(targetElement, event);
					if(!deviceIsIOS || targetTagName !== "select") {
						this.targetElement = null;
						event.preventDefault()
					}
					return false
				} else {
					var parent = targetElement;
					while(parent && (parent.tagName.toUpperCase() !== "BODY")) {
						if(parent.tagName.toUpperCase() === "LABEL") {
							$(parent).find("input").click()
						}
						parent = parent.parentNode
					}
				}
			}
			if(deviceIsIOS && !deviceIsIOS4) {
				scrollParent = targetElement.fastClickScrollParent;
				if(scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
					return true
				}
			}
			if(!this.needsClick(targetElement)) {
				event.preventDefault();
				this.sendClick(targetElement, event)
			}
			return false
		};
		FastClick.prototype.onTouchCancel = function() {
			this.trackingClick = false;
			this.targetElement = null
		};
		FastClick.prototype.onMouse = function(event) {
			if(!this.targetElement) {
				return true
			}
			if(event.forwardedTouchEvent) {
				return true
			}
			if(!event.cancelable) {
				return true
			}
			if(!this.needsClick(this.targetElement) || this.cancelNextClick) {
				if(event.stopImmediatePropagation) {
					event.stopImmediatePropagation()
				} else {
					event.propagationStopped = true
				}
				event.stopPropagation();
				event.preventDefault();
				return false
			}
			return true
		};
		FastClick.prototype.onClick = function(event) {
			var permitted;
			if(this.trackingClick) {
				this.targetElement = null;
				this.trackingClick = false;
				return true
			}
			if(event.target.type === "submit" && event.detail === 0) {
				return true
			}
			permitted = this.onMouse(event);
			if(!permitted) {
				this.targetElement = null
			}
			return permitted
		};
		FastClick.prototype.destroy = function() {
			var layer = this.layer;
			if(deviceIsAndroid) {
				layer.removeEventListener("mouseover", this.onMouse, true);
				layer.removeEventListener("mousedown", this.onMouse, true);
				layer.removeEventListener("mouseup", this.onMouse, true)
			}
			layer.removeEventListener("click", this.onClick, true);
			layer.removeEventListener("touchstart", this.onTouchStart, false);
			layer.removeEventListener("touchmove", this.onTouchMove, false);
			layer.removeEventListener("touchend", this.onTouchEnd, false);
			layer.removeEventListener("touchcancel", this.onTouchCancel, false)
		};
		FastClick.notNeeded = function(layer) {
			var metaViewport;
			var chromeVersion;
			var blackberryVersion;
			var firefoxVersion;
			if(typeof window.ontouchstart === "undefined") {
				return true
			}
			chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
			if(chromeVersion) {
				if(deviceIsAndroid) {
					metaViewport = document.querySelector("meta[name=viewport]");
					if(metaViewport) {
						if(metaViewport.content.indexOf("user-scalable=no") !== -1) {
							return true
						}
						if(chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
							return true
						}
					}
				} else {
					return true
				}
			}
			if(deviceIsBlackBerry10) {
				blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
				if(blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
					metaViewport = document.querySelector("meta[name=viewport]");
					if(metaViewport) {
						if(metaViewport.content.indexOf("user-scalable=no") !== -1) {
							return true
						}
						if(document.documentElement.scrollWidth <= window.outerWidth) {
							return true
						}
					}
				}
			}
			if(layer.style.msTouchAction === "none" || layer.style.touchAction === "manipulation") {
				return true
			}
			firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
			if(firefoxVersion >= 27) {
				metaViewport = document.querySelector("meta[name=viewport]");
				if(metaViewport && (metaViewport.content.indexOf("user-scalable=no") !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
					return true
				}
			}
			if(layer.style.touchAction === "none" || layer.style.touchAction === "manipulation") {
				return true
			}
			return false
		};
		FastClick.attach = function(layer, options) {
			return new FastClick(layer, options)
		};
		$(function() {
			FastClick.attach(document.body)
		});
	}($));
});