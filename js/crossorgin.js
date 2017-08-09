/********************
 自定义跨域调用
 ********************/
// 依赖于$.json-2.2.js
define(["common"], function() {
	// 目录服务器根地址
	$.ibo.AppWebUrl = "http://test.bounb.com";
	$.ibo.getAppWebUrl = function() {
		var url = localStorage.getItem("$.ibo.AppWebUrl");
		if(url == null || url == "" || url == undefined || url == "undefined") {
			url = $.ibo.AppWebUrl;
		}
		return url;
	}
	//------------公共服务--------------------------------------
	//公共服务
	$.ibo.IndexSrvUrl = $.ibo.getAppWebUrl() + "/PublicOperateService";
	//用户服务
	$.ibo.PublicUserSrvUrl = $.ibo.getAppWebUrl() + "/PublicUserService";
	//用户服务
	$.ibo.PublicMessageSrvUrl = $.ibo.getAppWebUrl() + "/PublicMessageService";
	//webapi服务
	$.ibo.BusinessSrvUrl = $.ibo.getAppWebUrl() + "/BIWebAPI";
	//------------公共服务 end --------------------------------------

	//------------企业端--------------------------------------
	//企业端-基础服务
	$.ibo.CompanyBaseSrvUrl = $.ibo.getAppWebUrl() + "/CompanyBaseService";
	//企业端-协同办公服务组件
	$.ibo.CompanyOASrvUrl = $.ibo.getAppWebUrl() + "/CompanyOAService";
	//企业端-工作流服务组件
	$.ibo.CompanyFlowSrvUrl = $.ibo.getAppWebUrl() + "/CompanyFlowService";
	//企业端-营销推广服务组件
	$.ibo.CompanyMarketSrvUrl = $.ibo.getAppWebUrl() + "/CompanyMarketService";
	//------------企业端 end --------------------------------------

	//------------办办端--------------------------------------
	//办办端-基础服务
	$.ibo.BanbanBaseSrvUrl = $.ibo.getAppWebUrl() + "/BanbanBaseService";
	//办办端-工作流服务组件
	$.ibo.BanbanFlowSrvUrl = $.ibo.getAppWebUrl() + "/BanbanFlowService";
	//企业端-营销推广服务组件
	$.ibo.BanbanMarketSrvUrl = $.ibo.getAppWebUrl() + "/BanbanMarketService";
	//------------办办端 end --------------------------------------

	//系统应用服务器地址
	$.ibo.ApplicationWebUrl = $.ibo.getAppWebUrl() + "/AppWeb";
	//营销图片地址
	$.ibo.ApplicationFormFlowUrl = $.ibo.getAppWebUrl() + "/FormFlow";
	//登陆页面地址
	var loginViewUrl = "../login/index.html?extflag=" + Math.random();


    //------------------ 令牌 --------------------------------
    //获取令牌
	var token = localStorage.getItem("token");
	var tokeStr = JSON.stringify({
	    ClientId: 'Client',// localStorage.getItem("HX_EaseAppClientID"), //用户名
	    ClientSecrets: 'secret',//localStorage.getItem("HX_EaseAppClientSecret"), //认证密码
	    AllowedScopes: 'UserApi',//"client_credentials"//
	});
    //初始化获取token 第一次取令牌
	if (token == null || token == "" || token == undefined || token == "undefined") {
	   // getToken();
	} else {
	    var tokenOutTime = Date.parse(localStorage.getItem("tokenOutTime"));
	    var now = new Date();
	    //令牌时间已经过期，需要重新获取令牌
	    if (now >= tokenOutTime) {
	        //   alert("需要重新获取令牌");
	      //  getToken();
	    }
	    else {
	        // alert("不需要重新获取令牌");
	    }
	}
    //更新令牌
	function getToken() {
	    $.ajax({
	        url: 'http://test.search.bounb.com/api/Base/GetToken',
	        type: 'post',
	        data: tokeStr,
	        datatype: 'json',
	        beforeSend: function (xhr) {
	            xhr.setRequestHeader('Content-Type', 'application/json')
	        },
	        success: function (data) {
	            //获取唯一令牌参数
	            try {
	                token = data.access_token;
	                localStorage.setItem("token", token);//缓存令牌过期时间
	                var dayNow = new Date(); //当前时间		
	                var tokenOutTime = dayNow.setSeconds(dayNow.getSeconds() + data.expires_in);  //令牌过期时间
	                localStorage.setItem("tokenOutTime", tokenOutTime);//缓存令牌过期时间
	                //alert(token);
	            } catch (e) {
	                alert("token值有误！");
	            }
	        }
	    });
	}
    //------------------ 令牌end ------------------------------



	// 跳转到登录页
	$.ibo.loadLoginView = function() {
		$.ibo.LoginOut(function() {
			$.ibo.BackLogin(loginViewUrl);
		});
	};
	//请求后台数据返回标识
	$.ibo.ResFlag = {
		// 成功
		"Success": 0,
		// 失败
		"Failed": 1,
		// 登陆超时
		"LoginOut": 2,
		// 没有权限
		"NoRight": 3,
		// 程序异常
		"Error": 4
	};

	// 回调函数字典
	var postCallBackArray = new Array();
	// iframe字典
	var postIframeArray = new Array();

	//url:跨越请求地址 funcName:请求方法名 data:请求参数 success:成功回调函数 pageName:提交页面名(默认CrossOrgin.html)
	$.ibo.crossOrgin = function(para) {
		var url = "";
		// 判断是否存在url
		if(!para || !para.url) {
			$.ibo.loadLoginView();
			return;
		}
		/* 浏览器调试使用方法 */
		var BrowserData = function() {
			var iframe = $("<iframe>");
			// 设置iframe不可见
			iframe.css("display", "none");
			// 提交页面名
			if(!para || !para.pageName) {
				url = para.url + "/CrossOrgin.html?t=" + Math.random();
			}
			iframe.attr("src", url);
			var callBackID = $.ibo.GetCallBackID();
			// 传递参数json串
			iframe.on("load", function() {
				try {
					$.ibo.postMessage(para, this, callBackID);
				} catch(e) {
					$.ibo.loadLoginView();
				}
			});
			// 将iframe放置到document
			$(document.body).append(iframe);
		};
		/* App跨域请求后台方法 */
		var AppData = function() {
			if(para.url === $.ibo.IndexSrvUrl || para.url === $.ibo.PublicUserSrvUrl) {
				url = para.url + "/OperateService.svc/" + para.funcName;
			} else if(para.url === $.ibo.BusinessSrvUrl) {
				url = para.url + "/api/" + para.funcName;
			} else {
				url = para.url + "/ApplicationService.svc/" + para.funcName;
			}
			$.ajax({
				type: "POST",
				url: url,
				data: para.data,
				beforeSend: function(XHR) {
					//发送ajax请求之前向http的head里面加入验证信息
					var openId = localStorage.getItem("EmpOpenID");
					XHR.setRequestHeader('openId', "openId " + openId);
					var token = localStorage.getItem("token");
					XHR.setRequestHeader('Authorization', "Bearer " + token);
				},
				contentType: "application/json",
				dataType: "json",
				/*crossDomain: true,
				xhrFields: {
					withCredentials: true
				},*/
				success: function(res) {
					var dataJson = "";
					if(url.indexOf($.ibo.BusinessSrvUrl) > -1) {
						dataJson = res;
					} else {
						dataJson = $.parseJSON(res);
					}
					if(dataJson && dataJson.ResFlag == $.ibo.ResFlag.LoginOut) {
						console.log(para.data);
						console.log(url);
						console.log(res);
					}
					if(dataJson && dataJson.ResFlag == $.ibo.ResFlag.Error) {
						console.log(para.data);
						console.log(url);
						console.log(res);
						dataJson.ResObj = dataJson.ResErrorMsg;
					}
					if(para && para.success && typeof(para.success) == "function") {
						para.success(dataJson);
					}
				},
				error: function(err) {
					console.log(para.data);
					console.log(url);
					console.log($.toJSON(err));
					if(para && para.error && typeof(para.error) == "function") {
						para.error();
					} else {
						mui.toast("网络超时，请稍后再试。");
					}
				}
			});
		};
		if(mui.os.plus) {
			AppData();
		} else {
			if(para.url === $.ibo.BusinessSrvUrl) {
				AppData();
			} else {
				BrowserData();
			}
		}
	};

	//跨域请求下载文件地址
	$.ibo.dphCrossse = function(para) {
		// 创建iframe
		var iframe = $("<iframe>");
		// 设置iframe不可见
		iframe.css("display", "none");
		var url = "";
		// 判断是否存在url
		if(!para || !para.url) {
			$.ibo.loadLoginView();
			return;
		}
		url = para.url + 't=' + Math.random();

		iframe.attr("src", url);
		var callBackID = $.ibo.GetCallBackID();
		// 传递参数json串
		iframe.on("load", function() {
			try {
				$.ibo.postMessage(para, this, callBackID);
			} catch(e) {
				$.ibo.loadLoginView();
			}
		});
		// 将iframe放置到document
		$(document.body).append(iframe);
	};
	// 当前回调id
	CurentCallBackID = 0;
	// 当前已回调id
	CurentExcCallBackID = 0;
	// 获取当前回调id
	$.ibo.GetCallBackID = function() {
		return CurentCallBackID++;
	};

	// para:调用参数 iframe:中间页面iframe
	$.ibo.postMessage = function(para, iframe, callBackID) {
		// 存在回调函数,存储到全局变量中
		if(para && para.success && typeof(para.success) == "function") {
			postCallBackArray[callBackID] = para.success;

		} else postCallBackArray[callBackID] = null;
		postIframeArray[callBackID] = iframe;
		// 跨域发送消息至目标页面
		iframe.contentWindow.postMessage($.toJSON({
			jsonStr: para.data,
			funcName: para.funcName,
			callBackID: callBackID
		}), "*");
	};

	// 执行回调函数   fn回调函数   para回调参数   callBackID回调id
	$.ibo.ExcCallBack = function(fn, para, callBackID) {
		// 判断回调id是否与已执行回调id一致
		if(callBackID == CurentExcCallBackID) {
			// 已回调id自增长
			CurentExcCallBackID++;
			// 执行回调
			fn(para);
		} else {
			// 否则延迟执行回调   直到回调id与已执行回调id一致   保持异步调用回调函数执行顺序
			setTimeout(function() {
				$.ibo.ExcCallBack(fn, para, callBackID)
			}, 100);
		}
	};

	// 监听消息
	$(window).on("message", function(e) {
		var e = e.originalEvent;
		// 消息内容
		var data = e.data;
		if(data == "ok") {
			return;
		}
		// 转换成json对象
		var jsonObj = $.parseJSON(data);
		// 请求传递参数
		var jsonStr = jsonObj.jsonStr;
		var resObj = $.parseJSON(jsonStr);
		// 回调函数id
		var callBackID = jsonObj.callBackID;
		//超时
		if(resObj && resObj.ResFlag == $.ibo.ResFlag.LoginOut) {
			//$.ibo.loadLoginView();
			console.log(resObj);
		}
		// 存在回调函数id
		if(callBackID != undefined && callBackID != null) {
			// 根据id获取回调函数
			var callBackFun = postCallBackArray[callBackID];
			if(callBackFun != null) {
				if(resObj && resObj.ResFlag == $.ibo.ResFlag.Error) {
					resObj.ResObj = resObj.ResErrorMsg;
					console.log(e);
				}
				console.log(resObj);
				$.ibo.ExcCallBack(callBackFun, resObj, callBackID);
			}
			// 移除回调函数
			delete postCallBackArray[callBackID];
		}

		if(postIframeArray.length) {
			postIframeArray[callBackID].remove();
			delete postIframeArray[callBackID];
		}
	});

	// 获取回调函数凭证 生成长度为16的随机字符串
	var getCallBackFunNum = function() {
		len = 16;
		var $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
		var maxPos = $chars.length;
		var num = "";
		for(i = 0; i < len; i++) {
			num += $chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return num;
	};
	//退出登录操作
	$.ibo.LoginOut = function(Callback) {
		var clientID = localStorage.getItem("clientId");
		if(clientID != null && clientID != "") {
			var data = $.toJSON({
				ClientId: clientID
			});
			$.ibo.crossOrgin({
				url: $.ibo.PublicUserSrvUrl,
				funcName: "LoginOut",
				data: data,
				success: function(obj) {
					console.log($.toJSON(obj));
					if($.ibo.ResFlag.Success == obj.ResFlag) {
						$.ibo.clearLogin();
					}
					if(typeof Callback == 'function') {
						Callback();
					}
				},
				error: function() {
					$.ibo.clearLogin();
					if(typeof Callback == 'function') {
						Callback();
					}
				}
			});
		} else {
			$.ibo.clearLogin();
			if(typeof Callback == 'function') {
				Callback();
			}
		}
	};
});