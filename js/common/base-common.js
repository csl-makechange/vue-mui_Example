define(function(require, exports, module) {
	exports.convertDate = function(DateStr, IsShow) {
		var weekArr = ["日", "一", "二", "三", "四", "五", "六", ];
		var result = null;
		var iosDataParse = "";
		if(DateStr.indexOf(".") > -1) {
			var StrPath = DateStr.substr(DateStr.lastIndexOf("."));
			iosDataParse = DateStr.replace(StrPath, "").replace(/-/g, "/");
		} else {
			iosDataParse = DateStr.replace(/-/g, "/");
		}
		var dateParse = Date.parse(iosDataParse);
		var agoYear = new Date(dateParse).getFullYear();
		var agoMonth = parseInt(new Date(dateParse).getMonth()) + 1;
		var agoDay = new Date(dateParse).getDate();
		var agoWeek = new Date(dateParse).getDay();
		var agoHours = new Date(dateParse).getHours();
		var agoMinute = new Date(dateParse).getMinutes();
		var agoSecond = new Date(dateParse).getSeconds();
		//当前年月日
		var NowDate = new Date().getTime();
		var nowYear = new Date().getFullYear();
		var nowMonth = new Date().getMonth();
		var nowDay = new Date().getDate();
		var nowHours = new Date().getHours();
		var nowMinute = new Date().getMinutes();
		var nowSecond = new Date().getSeconds();
		//间隔毫秒数
		var diffValue = NowDate - dateParse;
		//日期间隔数
		var DayC = diffValue / (1000 * 60 * 60 * 24);
		var HoursC = diffValue / (1000 * 60 * 60);
		var MinuteC = diffValue / (1000 * 60);
		//显示日期
		var strDate = "";
		if(IsShow) {
			strDate = agoYear + "年" + agoMonth + "月" + agoDay + "日";
		} else {
			strDate = agoYear + "-" + (agoMonth > 9 ? agoMonth : "0" + agoMonth) + "-" + (agoDay > 9 ? agoDay : "0" + agoDay) + " " + (agoHours > 9 ? agoHours : "0" + agoHours) + ":" + (agoMinute > 9 ? agoMinute : "0" + agoMinute);
		}
		if(nowYear > agoYear) {
			result = strDate;
		} else {
			if(DayC > 7) {
				result = strDate;
			} else if(DayC <= 7 && DayC >= 1) {
				result = parseInt(DayC) + "天前";
			} else if(1 <= HoursC && HoursC < 24) {
				result = parseInt(HoursC) + "小时前";
			} else if(1 <= MinuteC && MinuteC <= 60) {
				result = parseInt(MinuteC) + "分钟前";
			} else if(1 >= MinuteC) {
				result = "刚刚";
			}
		}
		return result;
	};
	exports.randomColor = function(ComID) { //企业logo随机颜色
		var arrColor = ["#ffafbe", "#faa028", "#afc8ff", "#28cdeb", "#ffe155", "#ff5a32", "#96e664"];
		var randomNum = parseInt(Math.random() * 6);
		var resultColor = arrColor[randomNum];
		if(mui.os.plus) {
			var LogoImage = JSON.parse(plus.storage.getItem("LogoImage" + ComID));
			if(LogoImage) {
				return LogoImage;
			} else {
				plus.storage.setItem("LogoImage" + ComID, JSON.stringify(resultColor));
				return resultColor;
			}
		} else {
			return resultColor;
		}
	};
	var _timer = {};
	exports.delay_click = function(id, fn, wait) { //防止重复点击、提交动作
		if(_timer[id]) {
			window.clearTimeout(_timer[id]);
			delete _timer[id];
		}
		return _timer[id] = window.setTimeout(function() {
			fn();
			delete _timer[id];
		}, wait);
	};
	exports.createIframe = function(el, opt) {
		var elContainer = document.querySelector(el);
		var wrapper = document.querySelector(".mui-iframe-wrapper");
		if(!wrapper) {
			// 创建wrapper 和 iframe
			wrapper = document.createElement('div');
			wrapper.className = 'mui-iframe-wrapper';
			for(var i in opt.style) {
				wrapper.style[i] = opt.style[i];
			}
			var iframe = document.createElement('iframe');
			iframe.src = opt.url;
			iframe.id = opt.id || opt.url;
			iframe.name = opt.id;
			wrapper.appendChild(iframe);
			elContainer.appendChild(wrapper);
		} else {
			var iframe = wrapper.querySelector('iframe');
			iframe.src = opt.url;
			iframe.id = opt.id || opt.url;
			iframe.name = iframe.id;
		}
	}
});