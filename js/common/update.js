define(['crossorgin', "css!cssfile/mui.min.css"], function() {
	var wgtUrl = $.ibo.getAppWebUrl() + '/FormFlow/AppFile/';
	//下载
	function downWgt(downurl) {
		plus.nativeUI.showWaiting("下载中...");
		plus.downloader.createDownload(downurl, {
			filename: "_doc/update/"
		}, function(d, status) {
			plus.nativeUI.closeWaiting();
			if(status == 200) {
				installWgt(d.filename);
			} else {
				plus.nativeUI.alert("下载安装失败！");
			}
		}).start();
	};
	//安装
	function installWgt(path) {
		plus.nativeUI.showWaiting("更新中...");
		plus.runtime.install(path, {
			force: false
		}, function() {
			plus.nativeUI.closeWaiting();
			plus.nativeUI.alert("更新完成！", function() {
				plus.runtime.restart();
			});
		}, function(e) {
			plus.nativeUI.closeWaiting();
			plus.nativeUI.alert("安装失败");
			console.log("安装失败[" + e.code + "]：" + e.message);
		});
	};
	//小版本更新
	function updateSamllApp(apkUrl, iosUrl, fileUrl) {
		if(apkUrl != "" && iosUrl != "") {
			if(plus.os.name == "Android") {
				plus.runtime.openURL(apkUrl);
			} else if(plus.os.name == "iOS") {
				plus.runtime.openURL(iosUrl);
			}
		} else {
			downWgt(fileUrl);
		}
	};
	//大版本更新
	function updateBigApp(apkUrl, iosUrl) {
		if(plus.os.name == "Android") {
			plus.runtime.openURL(apkUrl);
		} else if(plus.os.name == "iOS") {
			plus.runtime.openURL(iosUrl);
		}
	};
	//递归输出
	function DGText(obj, len) {
		var Info = "";
		if(obj.length > len) {
			var objStr = obj.substring(0, len);
			return Info = objStr + "<br>" + DGText(obj.replace(objStr, ""), len);
		} else {
			return obj;
		}
	}
	//更新
	function update(para) {
		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			var wgtVer = inf.version;
			var data = $.toJSON({
				"versionNo": wgtVer
			});
			$.ibo.crossOrgin({
				url: $.ibo.IndexSrvUrl,
				funcName: "GetAppUpdate",
				data: data,
				success: function(obj) {
					if($.ibo.ResFlag.Success == obj.ResFlag) {
						var ObjVersion = obj.ResObj;
						if(ObjVersion) {
							var VersionStatus = ObjVersion.VersionStatus; // 0.小版本 1.大版本
							var VersionType = ObjVersion.VersionType; //0.正常升级 1.强制升级
							var NoticeWords = ObjVersion.NoticeWords; //提示语
							var Version = ObjVersion.Version; //版本号
							var ApkFileName = ObjVersion.ApkFileName; //Apk文件
							var IpaFileName = ObjVersion.IpaFileName; //Ios文件
							var WgtFileName = ObjVersion.WgtFileName; //更新包名
							if(Version != wgtVer) {
								//关闭软键盘
								document.activeElement.blur();
								var WordsInfo = "";
								var WordsArr = NoticeWords.split('$');
								for(var i = 0; i < WordsArr.length; i++) {
									WordsInfo += DGText(WordsArr[i], 17) + "<br>";
								}
								WordsInfo = '<div style="text-align:left;">' + WordsInfo + '</div>';
								if(VersionStatus == 0) {
									if(plus.os.name == "Android") {
										if(VersionType == 0) {
											mui.confirm(WordsInfo, "软件更新提示", ['暂不更新', '立即更新'], function(e) {
												if(e.index == 1) {
													updateSamllApp(ApkFileName, IpaFileName, wgtUrl + WgtFileName);
												}
											}, 'div');
										} else {
											mui.alert(WordsInfo, '软件更新提示', '立即更新', function() {
												updateSamllApp(ApkFileName, IpaFileName, wgtUrl + WgtFileName);
											}, 'div');
										}
									}
								} else if(VersionStatus == 1) {
									if(VersionType == 0) {
										mui.confirm(WordsInfo, "发现新版本", ['暂不下载', '立即下载'], function(e) {
											if(e.index == 1) {
												updateBigApp(ApkFileName, IpaFileName);
											}
										}, 'div');
									} else {
										mui.alert(WordsInfo, '发现新版本', '立即下载', function() {
											updateBigApp(ApkFileName, IpaFileName);
										}, 'div');
									}
								}
								$(".mui-popup-backdrop").css("z-index", "9998");
							} else {
								if(para) {
									plus.nativeUI.toast("当前为最新版本");
								}
							}
						}
					} else {
						if(para) {
							plus.nativeUI.toast("当前为最新版本");
						}
					}
				}
			});
		});
	}
	//检测更新
	return {
		checkUpdate: function(para) {
			if(window.plus) {
				update(para)
			} else {
				document.addEventListener("plusready", update, false);
			}
		}
	}
});