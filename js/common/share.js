define(function(require, exports, module) {
	//分享功能
	var shares = null;
	mui.plusReady(function() {
		updateSerivces();
	});
	/**
	 * 更新分享服务
	 */
	function updateSerivces() {
		plus.share.getServices(function(s) {
			shares = {};
			for(var i in s) {
				var t = s[i];
				shares[t.id] = t;
			}
			console.log("获取分享服务列表成功");
		}, function(e) {
			console.log("获取分享服务列表失败：" + e.message);
		});
	};
	//分享函数type 类型 （number）参数: 1 --》微信好友，2 --》微信朋友圈，3--》qq好友，4 --》腾讯微博，5--》新浪微博.  
	//data 类型 （object）参数: href（string）--》分享链接地址，title（string）--》分享标题，content（string）--》分享内容，pictures（Array）--》分享图片，thumbs（Array）--》分享图片的缩略图 图片大小不要超过20kb
	//data 例如   data = {
	//			    href: 'http://blog.csdn.net/zhuming3834',
	//				title: 'HGDQ-分享测试-title',
	//				content: 'HGDQ-分享测试-content',
	//				thumbs: ['http://img3.3lian.com/2013/v10/4/87.jpg'],
	//				pictures: ['http://img3.3lian.com/2013/v10/4/87.jpg']
	//			  }
	//callback function 分享成功回调 ;
	//errorcallback function 分享失败回调 ;
	function shareServe(type, data, callback, errorcallback) {
		/**
		 * 分享操作
		 */
		function shareAction(id, ex) {
			var s = null;
			if(!id) {
				outLine("无效的分享服务！");
				return;
			}
			s = shares[id];
			if(s.authenticated) {
				outSet("---已授权---");
				shareMessage(s, ex);
			} else {
				outSet("---未授权---");
				s.authorize(function() {
					shareMessage(s, ex);
				}, function(e) {
					//outLine("认证授权失败");
					outLine("分享失败!");
				});
			}
		};
		/**
		 * 发送分享消息
		 */
		function shareMessage(s, ex) {
			data.extra = {
				scene: ex
			};
			if(data.href) {
				var href = data.href;
				if(href.indexOf("?") <= -1) {
					data.href = href + "?t=" + Math.random();
				} else {
					data.href = href + "&t=" + Math.random();
				}
			}
			if(data.title) {
				var title = data.title;
				if(title.length > 50) {
					data.title = title.substr(0, 50) + "...";
				}
			}
			if(data.content) {
				var content = data.content;
				if(content.length > 100) {
					data.content = content.substr(0, 100) + "...";
				}
			}
			data.thumbs = ["_www/img/enterprise.png"];
			data.pictures = ["_www/img/enterprise.png"];
			if(type == 5) {
				var content = data.content;
				if(data.href) {
					data.content = content + " " + data.href;
				}
			}
			var popup_share = document.querySelector(".ibo-share-popup");
			var popup_over = document.querySelector(".ibo-share-popup-overlay");
			if(popup_share && popup_over) {
				popup_share.remove();
				popup_over.remove();
			}
			s.send(data, function() {
				if(callback) {
					callback(type);
				} else {
					outLine("分享成功!");
				}
			}, function(e) {
				if(errorcallback) {
					errorcallback();
				} else {
					outLine("分享失败!");
				}
				console.log(e.message);
			});
			//			require(["imgReady"], function() {
			//				if(type != 5) {
			//					imgReady(data.thumbs, function() {}, function() {
			//						if(this.width > 200 || this.height > 200) {
			//							data.thumbs = ["_www/img/enterprise.png"];
			//						}
			//						s.send(data, function() {
			//							if(callback) {
			//								callback(type);
			//							} else {
			//								outLine("分享成功!");
			//							}
			//						}, function(e) {
			//							if(errorcallback) {
			//								errorcallback();
			//							} else {
			//								outLine("分享失败!");
			//							}
			//							console.log(e.message);
			//						});
			//					}, function() {
			//						data.thumbs = ["_www/img/enterprise.png"];
			//						s.send(data, function() {
			//							if(callback) {
			//								callback(type);
			//							} else {
			//								outLine("分享成功!");
			//							}
			//						}, function(e) {
			//							if(errorcallback) {
			//								errorcallback();
			//							} else {
			//								outLine("分享失败!");
			//							}
			//							console.log(e.message);
			//						});
			//					});
			//				} else { //微博分享
			//					data.thumbs = ["_www/img/enterprise.png"];
			//					data.pictures = [];
			//					s.send(data, function() {
			//						if(callback) {
			//							callback(type);
			//						} else {
			//							outLine("分享成功!");
			//						}
			//					}, function(e) {
			//						if(errorcallback) {
			//							errorcallback();
			//						} else {
			//							outLine("分享失败!");
			//						}
			//						console.log(e.message);
			//					});
			//				}
			//			});
		};
		// 控制台输出日志
		function outSet(msg) {
			console.log(msg);
		}
		// 界面弹出吐司提示
		function outLine(msg) {
			plus.nativeUI.toast(msg);
		}
		//判断分享类型
		switch(type) {
			case 1:
				shareAction('weixin', 'WXSceneSession'); /*微信好友*/
				break;
			case 2:
				shareAction('weixin', 'WXSceneTimeline'); /*微信朋友圈*/
				break;
			case 3:
				shareAction('qq'); /*QQ好友*/
				break;
			case 4:
				shareAction('tencentweibo'); /*腾讯微博*/
				break;
			case 5:
				shareAction('sinaweibo'); /*新浪微博*/
				break;
		}
	};
	//分享方法
	exports.iboshare = function(type, data, callback, errorcallback) {
		shareServe(type, data, callback, errorcallback);
	};
	//分享弹窗
	exports.iboshare_popup = function(data, callback, errorcallback) {
		var createpopup = function() {
			var popup = document.createElement('div');
			popup.className = "ibo-share-popup";
			var content = document.createElement('div');
			content.className = "share-content";
			var p = document.createElement('p');
			p.innerText = "分享到";
			var content_padd = document.createElement('div');
			content_padd.className = "content-padded";
			var row = document.createElement('div');
			row.className = "row";
			//微信
			var wxshare = document.createElement('div');
			wxshare.className = "col-25 wxshare";
			var wxmark = document.createElement('div');
			wxmark.className = "mark wechat";
			var wxdivhtml = document.createElement('div');
			wxdivhtml.innerText = "微信好友";
			var wxMask = document.createElement('div');
			wxMask.className = "mask";
			wxshare.appendChild(wxmark);
			wxshare.appendChild(wxdivhtml);
			wxmark.appendChild(wxMask);
			wxshare.addEventListener("tap", function() {
				shareServe(1, data, callback, errorcallback);
			});
			//微信朋友圈
			var wxfshare = document.createElement('div');
			wxfshare.className = "col-25 wxfshare";
			var wxfmark = document.createElement('div');
			wxfmark.className = "mark friend";
			var wxfdivhtml = document.createElement('div');
			wxfdivhtml.innerText = "微信朋友圈";
			var wxfMask = document.createElement('div');
			wxfMask.className = "mask";
			wxfshare.appendChild(wxfmark);
			wxfshare.appendChild(wxfdivhtml);
			wxfmark.appendChild(wxfMask);
			wxfshare.addEventListener("tap", function() {
				shareServe(2, data, callback, errorcallback);
			});
			//QQ好友
			var qqshare = document.createElement('div');
			qqshare.className = "col-25 qqshare";
			var qqmark = document.createElement('div');
			qqmark.className = "mark qq";
			var qqdivhtml = document.createElement('div');
			qqdivhtml.innerText = "QQ好友";
			var qqMask = document.createElement('div');
			qqMask.className = "mask";
			qqshare.appendChild(qqmark);
			qqshare.appendChild(qqdivhtml);
			qqmark.appendChild(qqMask);
			qqshare.addEventListener("tap", function() {
				shareServe(3, data, callback, errorcallback);
			});
			//新浪微博
			var sinashare = document.createElement('div');
			sinashare.className = "col-25 sinashare";
			var sinamark = document.createElement('div');
			sinamark.className = "mark sina";
			var sinadivhtml = document.createElement('div');
			sinadivhtml.innerText = "新浪微博";
			var sinaMask = document.createElement('div');
			sinaMask.className = "mask";
			sinashare.appendChild(sinamark);
			sinashare.appendChild(sinadivhtml);
			sinamark.appendChild(sinaMask);
			sinashare.addEventListener("tap", function() {
				shareServe(5, data, callback, errorcallback);
			});
			//关闭按钮
			var bottom = document.createElement('div');
			bottom.className = "bottom";
			var close = document.createElement('div');
			close.className = "close";
			var closeButton = document.createElement('div');
			closeButton.className = "closeButton"
			closeButton.addEventListener("tap", function(event) {
				//$(this).removeClass('close').addClass('closed');
				close.className = "closed";
				var times = setTimeout(function() {
					popup.remove();
					popup_overlay.remove();
					times = null;
				}, 10)
				event.stopPropagation();
				return false;
			});
			closeButton.appendChild(close);
			bottom.appendChild(closeButton);
			row.appendChild(wxshare);
			row.appendChild(wxfshare);
			row.appendChild(qqshare);
			row.appendChild(sinashare);
			content_padd.appendChild(row);
			content.appendChild(p);
			content.appendChild(content_padd);
			content.appendChild(bottom);
			popup.appendChild(content);
			//遮罩
			var popup_overlay = document.createElement('div');
			popup_overlay.className = "ibo-share-popup-overlay ibo-share-modal-overlay-visible";
			popup_overlay.addEventListener("tap", function() {
				popup.remove();
				popup_overlay.remove();
			});
			//插入popup
			document.body.appendChild(popup);
			document.body.appendChild(popup_overlay);
		};
		var popup_share = document.querySelector(".ibo-share-popup");
		var popup_over = document.querySelector(".ibo-share-popup-overlay");
		if(popup_share && popup_over) {
			popup_share.remove();
			popup_over.remove();
		}
		createpopup();
	};
});