define(["jq"], function() {
	'use strict';
	var NewPageIDArr = []; //保存通讯录加载页面id
	(function($) {
		//上传图片
		/* 
		   para.url:上传图片后台路径（非必填）
		   para.checkFun:上传图片之前校验方法，bool类型（非必填） 
		   para.callBackFun:上传图片完成后回调函数  
		   para.multiple:是否多图片上传，bool类型
		   para.maximum:上传最大图片数，int类型（默认3张）
		   para.IsConfirm:上传时确认操作，bool类型
		   para.percent:压缩图片百分比,string类型
		   para.quality:压缩图片质量,int类型
		   para.IsOriginal:是否上传原图,bool类型
		*/
		$.fn.extend({
			UploaderImg: function(para) {
				var objthis = $(this);
				var uploadImgUrl = (para && para.url && typeof(para.url) == "string") ? para.url : $.ibo.CompanyBaseSrvUrl + "/UploadHandler.ashx?IsKD=true";
				var checkFun = (para && para.checkFun && typeof(para.checkFun) == "function") ? para.checkFun : false;
				var multiple = (para && para.multiple !== null && para.multiple !== "undefined" && para.multiple !== undefined) ? para.multiple : false;
				var maximum = (para && para.maximum || para.maximum == 0) ? para.maximum : 3;
				var IsConfirm = (para && para.IsConfirm !== null && para.IsConfirm !== "undefined" && para.IsConfirm !== undefined) ? para.IsConfirm : false;
				var percent = (para && para.percent) ? para.percent : "50%";
				var quality = (para && para.quality) ? para.quality : 10;
				var IsOriginal = (para && para.IsOriginal !== null && para.IsOriginal !== "undefined" && para.IsOriginal !== undefined) ? para.IsOriginal : true;
				//绑定事件
				objthis.off("tap").on("tap", function(e) {
					if(checkFun) {
						if(checkFun()) {
							if(window.plus) {
								plusReadyUploadImg();
							} else {
								document.addEventListener("plusready", plusReadyUploadImg, false);
							}
						}
					} else {
						if(window.plus) {
							plusReadyUploadImg();
						} else {
							document.addEventListener("plusready", plusReadyUploadImg, false);
						}
					}
				});

				function plusReadyUploadImg() {
					// 弹出系统选择按钮框
					plus.nativeUI.actionSheet({
						cancel: "取消",
						buttons: [{
							title: "拍照"
						}, {
							title: "相册"
						}]
					}, function(e) {
						if(e.index == "1") { //拍照
							getCamera();
						} else if(e.index == "2") { //相册
							gallery();
						}
					});
				};
				//拍照
				function getCamera() {
					if(!$.checkCamera()) {
						plus.nativeUI.alert('请到设置中打开相机权限');
						return;
					}
					plus.camera.getCamera().captureImage(function(p) {
						if(!$.checkCamera()) {
							plus.nativeUI.alert('请到设置中打开相机权限');
							return;
						}
						var files = [];
						files.push({
							name: "uploadkey",
							path: p
						});
						if(IsConfirm) {
							plus.nativeUI.confirm("确认使用?", function(e) {
								if(e.index == 1) {
									uploadNew(files);
								}
							}, "", ["取消", "确定"]);
						} else {
							uploadNew(files);
						}
					}, function(e) {
						var code = e.code;
						var message = e.message;
						console.log(code);
						console.log(message);
						if(!$.checkCamera()) {
							plus.nativeUI.alert('请到设置中打开相机权限');
							return;
						}
					});
				};
				//相册
				function gallery() {
					if(!$.checkGallery()) {
						plus.nativeUI.alert('请到设置中打开相册权限');
						return;
					}
					plus.gallery.pick(function(p) {
						if(!$.checkGallery()) {
							plus.nativeUI.alert('请到设置中打开相册权限');
							return;
						}
						var files = [];
						if(multiple) {
							for(var i = 0; i < p.files.length; i++) {
								files.push({
									name: "uploadkey" + i,
									path: p.files[i]
								});
							}
						} else {
							files.push({
								name: "uploadkey",
								path: p
							});
						}
						if(IsConfirm) {
							plus.nativeUI.confirm("确认选择?", function(e) {
								if(e.index == 1) {
									uploadNew(files);
								}
							}, "", ["取消", "确定"]);
						} else {
							uploadNew(files);
						}
					}, function(e) {
						var code = e.code;
						var message = e.message;
						console.log(code);
						console.log(message);
						if(!$.checkGallery()) {
							plus.nativeUI.alert('请到设置中打开相册权限');
							return;
						}
					}, {
						filter: "image",
						multiple: multiple,
						maximum: maximum,
						system: false,
						onmaxed: function() {
							return;
						}
					});
				}
				//上传
				function uploadNew(files) {
					if(files.length <= 0) {
						plus.nativeUI.closeWaiting();
						plus.nativeUI.toast("没有添加上传文件");
						return;
					}
					plus.nativeUI.showWaiting('上传中...');
					var time = setTimeout(function() {
						plus.nativeUI.closeWaiting();
						plus.nativeUI.toast("上传失败");
					}, 1000 * 60);
					var arr_orl = [];
					var arr_com = [];
					for(var i = 0; i < files.length; i++) {
						(function() {
							var f = files[i];
							plus.io.resolveLocalFileSystemURL(f.path, function(entry) {
								var path = entry.toLocalURL();
								var name = f.name;
								var repath = path.substr(path.lastIndexOf("."));
								var name_orl = name + "_orl"; //原图转换
								var path_orl = '_documents/' + name_orl + repath; //原图转换（解决拍照旋转问题）
								var name_com = name + "_com"; //压缩后的名称
								var path_com = '_documents/' + name_com + repath; //压缩后的路径
								var iscom = true; //是否压缩
								if(IsOriginal) {
									plus.zip.compressImage({
											src: path,
											quality: 100,
											dst: path_orl,
											overwrite: true
										},
										function(event) {
											var fileSize = event.size;
											var width = event.width;
											var height = event.height;
											if(fileSize > (1024 * 1024 * 5)) {
												if(time != null) {
													clearTimeout(time);
												}
												plus.nativeUI.closeWaiting();
												plus.nativeUI.toast("文件大小不能超过5M");
												return;
											}
											if(width < 500 && height < 500) {
												iscom = false;
											}
											var task_orl = plus.uploader.createUpload(uploadImgUrl, { //原图上传任务
													method: "POST",
													retry: 0
												},
												function(t, status) { //上传完成
													if(status == 200) {
														var resultSrc = eval("(" + t.responseText + ")");
														arr_orl.push({
															"img": resultSrc.url,
															"type": "orl"
														});
														if(iscom) {
															plus.zip.compressImage({
																	src: path,
																	dst: path_com,
																	overwrite: true,
																	quality: quality,
																	width: percent,
																	height: "auto"
																},
																function(event) {
																	var task_com = plus.uploader.createUpload(uploadImgUrl, { //压缩后上传任务
																			method: "POST",
																			retry: 0
																		},
																		function(t_com, status_com) { //上传完成
																			if(status_com == 200) {
																				var resultSrc_com = eval("(" + t_com.responseText + ")");
																				arr_com.push({
																					"img": resultSrc_com.url,
																					"type": "com"
																				});
																				if(arr_orl.length == files.length && arr_com.length == files.length && para && para.callBackFun && typeof(para.callBackFun) == "function") {
																					var arr = [];
																					$.each(arr_orl, function(i, n) {
																						var img_com = arr_com[i].img;
																						arr.push({
																							"img_orl": n.img,
																							"img_com": img_com
																						});
																					});
																					if(time != null) {
																						clearTimeout(time);
																					}
																					plus.nativeUI.closeWaiting();
																					console.log("arr1:" + $.toJSON(arr));
																					para.callBackFun(arr);
																				}
																			} else {
																				if(time != null) {
																					clearTimeout(time);
																				}
																				plus.nativeUI.closeWaiting();
																				plus.nativeUI.toast("上传失败");
																				console.log("上传失败：" + status_com);
																			}
																		}
																	);
																	task_com.addFile(path_com, {
																		key: name_com
																	});
																	task_com.start();
																},
																function(error) {
																	plus.nativeUI.closeWaiting();
																	plus.nativeUI.toast(error.message);
																	console.log(error.message);
																});
														} else {
															arr_com.push({
																"img": resultSrc.url,
																"type": "com"
															});
															if(arr_orl.length == files.length && arr_com.length == files.length && para && para.callBackFun && typeof(para.callBackFun) == "function") {
																var arr = [];
																$.each(arr_orl, function(i, n) {
																	var img_com = arr_com[i].img;
																	arr.push({
																		"img_orl": n.img,
																		"img_com": img_com
																	});
																});
																if(time != null) {
																	clearTimeout(time);
																}
																plus.nativeUI.closeWaiting();
																console.log("arr2:" + $.toJSON(arr));
																para.callBackFun(arr);
															}
														}
													} else {
														if(time != null) {
															clearTimeout(time);
														}
														plus.nativeUI.closeWaiting();
														plus.nativeUI.toast("上传失败");
														console.log("上传失败：" + status);
													}
												}
											);
											task_orl.addFile(path_orl, {
												key: name_orl
											});
											task_orl.start();
										},
										function(error) {
											plus.nativeUI.closeWaiting();
											plus.nativeUI.toast(error.message);
											console.log("path:" + path);
											console.log("path_orl:" + path_orl);
											console.log("path_com:" + path_com);
											console.log(error.message);
										});
								} else {
									plus.zip.compressImage({
											src: path,
											dst: path_com,
											overwrite: true,
											quality: quality,
											width: percent,
											height: "auto"
										},
										function(event) {
											var fileSize = event.size;
											var width = event.width;
											var height = event.height;
											if(fileSize > (1024 * 1024 * 5)) {
												if(time != null) {
													clearTimeout(time);
												}
												plus.nativeUI.closeWaiting();
												plus.nativeUI.toast("文件大小不能超过5M");
												return;
											}
											var task_com = plus.uploader.createUpload(uploadImgUrl, { //压缩后上传任务
													method: "POST",
													retry: 0
												},
												function(t_com, status_com) { //上传完成
													if(status_com == 200) {
														var resultSrc_com = eval("(" + t_com.responseText + ")");
														arr_com.push({
															"img": resultSrc_com.url,
															"type": "com"
														});
														if(arr_com.length == files.length && para && para.callBackFun && typeof(para.callBackFun) == "function") {
															var arr = [];
															$.each(arr_com, function(i, n) {
																arr.push({
																	"img_orl": n.img,
																	"img_com": n.img
																});
															});
															if(time != null) {
																clearTimeout(time);
															}
															plus.nativeUI.closeWaiting();
															console.log("arr3:" + $.toJSON(arr));
															para.callBackFun(arr);
														}
													} else {
														if(time != null) {
															clearTimeout(time);
														}
														plus.nativeUI.closeWaiting();
														plus.nativeUI.toast("上传失败");
														console.log("上传失败：" + status_com);
													}
												}
											);
											task_com.addFile(path_com, {
												key: name_com
											});
											task_com.start();
										},
										function(error) {
											plus.nativeUI.closeWaiting();
											plus.nativeUI.toast(error.message);
											console.log(error.message);
										});
								}
							});
						})();
					}
				};
			},

		});
		//转换图片
		$.fn.extend({
			ConvertImg: function(para) {
				var objthis = $(this);
				var checkFun = (para && para.checkFun && typeof(para.checkFun) == "function") ? para.checkFun : false;
				var multiple = (para && para.multiple !== null && para.multiple !== "undefined" && para.multiple !== undefined) ? para.multiple : false;
				var maximum = (para && para.maximum || para.maximum == 0) ? para.maximum : 3;
				var percent = (para && para.percent) ? para.percent : "50%";
				var quality = (para && para.quality) ? para.quality : 50;
				//绑定事件
				objthis.off("tap").on("tap", function(e) {
					if(checkFun) {
						if(checkFun()) {
							if(window.plus) {
								plusReadyUploadImg();
							} else {
								document.addEventListener("plusready", plusReadyUploadImg, false);
							}
						}
					} else {
						if(window.plus) {
							plusReadyUploadImg();
						} else {
							document.addEventListener("plusready", plusReadyUploadImg, false);
						}
					}
				});

				function plusReadyUploadImg() {
					plus.nativeUI.actionSheet({
						cancel: "取消",
						buttons: [{
							title: "拍照"
						}, {
							title: "相册"
						}]
					}, function(e) {
						if(e.index == "1") { //拍照
							getCamera();
						} else if(e.index == "2") { //相册
							gallery();
						}
					});
				};
				//拍照
				function getCamera() {
					if(!$.checkCamera()) {
						plus.nativeUI.alert('请到设置中打开相机权限');
						return;
					}
					plus.camera.getCamera().captureImage(function(p) {
						if(!$.checkCamera()) {
							plus.nativeUI.alert('请到设置中打开相机权限');
							return;
						}
						var files = [];
						files.push({
							name: "uploadkey",
							path: p
						});
						ConvertImage(files);
					}, function(e) {
						var code = e.code;
						var message = e.message;
						console.log(code);
						console.log(message);
						if(!$.checkCamera()) {
							plus.nativeUI.alert('请到设置中打开相机权限');
							return;
						}
					});
				};
				//相册
				function gallery() {
					if(!$.checkGallery()) {
						plus.nativeUI.alert('请到设置中打开相册权限');
						return;
					}
					plus.gallery.pick(function(p) {
						if(!$.checkGallery()) {
							plus.nativeUI.alert('请到设置中打开相册权限');
							return;
						}
						var files = [];
						if(multiple) {
							for(var i = 0; i < p.files.length; i++) {
								files.push({
									name: "uploadkey" + i,
									path: p.files[i]
								});
							}
						} else {
							files.push({
								name: "uploadkey",
								path: p
							});
						}
						ConvertImage(files);
					}, function(e) {
						var code = e.code;
						var message = e.message;
						console.log(code);
						console.log(message);
						if(!$.checkGallery()) {
							plus.nativeUI.alert('请到设置中打开相册权限');
							return;
						}
					}, {
						filter: "image",
						multiple: multiple,
						maximum: maximum,
						system: false,
						onmaxed: function() {
							return;
						}
					});
				};
				//转换图片
				function ConvertImage(imglist, imgsource) {
					if(imglist.length <= 0) {
						plus.nativeUI.closeWaiting();
						return;
					}
					plus.nativeUI.showWaiting('上传中...');
					var time = setTimeout(function() {
						plus.nativeUI.closeWaiting();
						plus.nativeUI.toast("上传失败");
					}, 1000 * 60 * 5);
					var arr = [];
					var uploadImgMessage = function() {
						if(time != null) {
							clearTimeout(time);
						}
						plus.nativeUI.closeWaiting();
					};
					var sendImg = function(base, baseUrl, imgType) { //传输图片
						$.ibo.crossOrgin({
							url: $.ibo.CompanyBaseSrvUrl,
							funcName: "UploadPic",
							data: $.toJSON({
								fileExt: imgType,
								imageData: base
							}),
							success: function(obj) {
								console.log($.toJSON(obj));
								if(obj.ResFlag === $.ibo.ResFlag.Success) {
									arr.push({
										"fileUrl": baseUrl,
										"srcUrl": obj.ResObj
									});
									if(arr.length == imglist.length && para && para.callBackFun && typeof(para.callBackFun) == "function") {
										uploadImgMessage();
										console.log("arr:" + $.toJSON(arr));
									}
									para.callBackFun([{
										"fileUrl": baseUrl,
										"srcUrl": obj.ResObj
									}]);
								} else {
									uploadImgMessage();
									plus.nativeUI.toast("上传失败");
								}
							},
							error:function(){
								uploadImgMessage();
								plus.nativeUI.toast("上传失败");
							}
						});
					};
					var uploadImg = function(src, imgType) { //上传方法
						console.log("src:" + src);
						console.log("imgType:" + imgType);
						plus.io.resolveLocalFileSystemURL(src, function(entry) {
							var fileReader = new plus.io.FileReader();
							var baseUrl = entry.toLocalURL();
							fileReader.onloadend = function(e) {
								var base64 = e.target.result;
								//console.log("base64:" + base64);
								var basearr = base64.split(',');
								if(basearr.length > 1) {
									sendImg(basearr[1], baseUrl, imgType);
								}
								fileReader.abort();
							};
							fileReader.readAsDataURL(entry);
						}, function() {
                            uploadImgMessage();
                            plus.nativeUI.toast("上传失败");
						});
					};
					var compressImg = function(fileSize, width) { //根据图片大小，宽生成压缩参数
						var arrcom = [];
						var arrquality = null;
						var arrpercent = null;
						if((1024 * 1024 * 0.5) <= fileSize && fileSize < (1024 * 1024 * 1)) {
							arrquality = 35;
						} else if((1024 * 1024 * 1) <= fileSize && fileSize < (1024 * 1024 * 2)) {
							arrquality = 30;
						} else if((1024 * 1024 * 2) <= fileSize && fileSize < (1024 * 1024 * 3)) {
							arrquality = 25;
						} else if((1024 * 1024 * 3) <= fileSize && fileSize < (1024 * 1024 * 4)) {
							arrquality = 20;
						} else if((1024 * 1024 * 4) <= fileSize && fileSize < (1024 * 1024 * 5)) {
							arrquality = 15;
						} else if((1024 * 1024 * 5) <= fileSize) {
							arrquality = 10;
						}
						if(500 <= width && width < 1000) {
							arrpercent = "80%";
						} else if(1000 <= width && width < 2000) {
							arrpercent = "70%";
						} else if(2000 <= width && width < 3000) {
							arrpercent = "60%";
						} else if(3000 <= width && width < 4000) {
							arrpercent = "50%";
						} else if(4000 <= width && width < 5000) {
							arrpercent = "40%";
						} else if(5000 <= width) {
							arrpercent = "30%";
						}
						arrcom.push({
							"quality": arrquality,
							"width": arrpercent
						});
						return arrcom;
					};
					var getImgName = function() {
						var guid = "";
						for(var i = 1; i <= 16; i++) {
							var n = Math.floor(Math.random() * 16.0).toString(16);
							guid += n;
							if((i == 4) || (i == 8) || (i == 12))
								guid += "-";
						}
						return guid;
					}
					require(["exif"], function() {
						for(var i = 0; i < imglist.length; i++) {
							(function() {
								var f = imglist[i];
								var num = i + 1;
								plus.io.resolveLocalFileSystemURL(f.path, function(entry) {
									var path = entry.toLocalURL();
									var name = entry.name;
									var imageType = name.substr(name.lastIndexOf('.') + 1);
									var rename = getImgName();
									var path_orl = '_documents/' + rename + '-' + num + '.' + imageType; //转换后的图片路径
									entry.getMetadata(function(metadata) {
										var fileSize = metadata.size;
										var imgtemp = new Image();
										imgtemp.src = path;
										imgtemp.onload = function() {
											var width = this.width;
											var height = this.height;
											console.log("原图大小：" + fileSize + " 宽：" + width + " 高：" + height + " 名称：" + name + " 路径：" + path);
											var compressOption = {
												src: path,
												dst: path_orl,
												overwrite: true,
											};
											EXIF.getData(imgtemp, function() {
												var Orientation = EXIF.getTag(this, 'Orientation'); /* 1、图片没有发生旋转；6、顺时针90°；8、逆时针90°；3、180° 旋转 */
												console.log("Orientation:" + Orientation);
												if(plus.os.name == "iOS" && imgsource == 1) { //解决ios下拍照大于2M的图片旋转90度
													if(fileSize > (1024 * 1024 * 2)) {
														if(Orientation === 6) {
															compressOption.rotate = 270;
														} else if(Orientation === 3) {
															compressOption.rotate = 180;
														} else if(Orientation === 8) {
															compressOption.rotate = 90;
														}
													}
												}
												var arrQP = compressImg(fileSize, width);
												if(arrQP.length > 0) {
													if(arrQP[0].quality != null)
														compressOption.quality = arrQP[0].quality;
													if(arrQP[0].width != null)
														compressOption.width = arrQP[0].width;
												}
												if(imageType.toLocaleLowerCase() == "gif") {
													if(fileSize > (1024 * 1024 * 5)) {
														uploadImgMessage();
														if(imglist.length > 1) {
															plus.nativeUI.toast("上传的第" + num + "张图太大");
														} else {
															plus.nativeUI.toast("上传的图太大");
														}
														return false;
													} else {
														uploadImg(path, imageType);
													}
												} else {
													console.log("compressOption:" + $.toJSON(compressOption));
													if(fileSize <= (1024 * 1024 * 1)) {
														uploadImg(path, imageType);
													} else {
														plus.zip.compressImage(compressOption,
															function(event) {
																var fileSize_com = event.size;
																var width_com = event.width;
																var height_com = event.height;
																console.log("压缩图大小:" + fileSize_com + " 宽:" + width_com + " 高:" + height_com);
																if(fileSize_com > (1024 * 1024 * 2)) {
																	uploadImgMessage();
																	if(imglist.length > 1) {
																		plus.nativeUI.toast("上传的第" + num + "张图太大");
																	} else {
																		plus.nativeUI.toast("上传的图太大");
																	}
																	return false;
																} else {
																	uploadImg(path_orl, imageType);
																}
															});
													}
												}
											});
										};
									});
								},function(){
									uploadImgMessage();
									plus.nativeUI.toast("上传失败");
								});
							})();
						}
					});
				}
			}
		});

		//裁剪图片
		$.fn.extend({
			uploadHeaderImg: function(para) {
				var objthis = $(this);
				var checkFun = (para && para.checkFun && typeof(para.checkFun) == "function") ? para.checkFun : false;
				var percent = (para && para.percent) ? para.percent : "50%";
				var quality = (para && para.quality) ? para.quality : 50;
				//绑定事件
				objthis.off("tap").on("tap", function(e) {
					if(checkFun) {
						if(checkFun()) {
							if(window.plus) {
								plusReadyUploadImg();
							} else {
								document.addEventListener("plusready", plusReadyUploadImg, false);
							}
						}
					} else {
						if(window.plus) {
							plusReadyUploadImg();
						} else {
							document.addEventListener("plusready", plusReadyUploadImg, false);
						}
					}
				});

				function plusReadyUploadImg() {
					plus.nativeUI.actionSheet({
						cancel: "取消",
						buttons: [{
							title: "从相册选择"
						}]
					}, function(e) {
						if(e.index == 1) { //相册
							gallery();
						}
					});
				};
				//相册
				function gallery() {
					if(!$.checkGallery()) {
						plus.nativeUI.alert('请到设置中打开相册权限');
						return;
					}
					plus.gallery.pick(function(p) {
						plus.io.resolveLocalFileSystemURL(p, function(entry) {
							var path = entry.toLocalURL();
							var name = entry.name;
							entry.getMetadata(function(metadata) {
								var fileSize = metadata.size;
								compressImage(path, name, fileSize);
							})
						}, function(e) {
							plus.nativeUI.toast("取消选择图片");
						}, {
							filename: "_doc/camera/",
							filter: "image"
						})
					}, function(e) {
						plus.nativeUI.toast("取消选择图片");
						var code = e.code;
						var message = e.message;
						console.log(code);
						console.log(message);
						if(!$.checkGallery()) {
							plus.nativeUI.alert('请到设置中打开相册权限');
							return;
						}
					}, {
						filter: "image",
						multiple: false
					});
				};
				//压缩
				function compressImage(path, filename, filesize) {
					var iscom = true; //是否压缩
					var path_orl = "_doc/upload/" + filename;
					if(filesize < 1024 * 1024 * 1) {
						cutting(path);
					} else {
						plus.zip.compressImage({
							src: path,
							dst: path_orl,
							overwrite: true,
							quality: quality,
							width: percent,
							height: "auto"
						}, function(event) {
							var target = event.target;
							cutting(target);
						}, function() {
							plus.nativeUI.toast("压缩失败");
						})
					}
				};
				//跳转页面
				function cutting(p) {
					mui.openWindow({
						url: "../../views/clip/cutting.html",
						id: "cutting.html",
						extras: {
							path: p
						},
						waiting: {
							autoShow: true
						}
					});
				};
			}
		});
		//保存图片
		$.fn.extend({
			SavaImgLocal: function(para) {
				var ObjThis = $(this);
				var path = null; //图片路径
				function plusReadySavaImgLocal() {
					// 弹出系统选择按钮框
					plus.nativeUI.actionSheet({
						cancel: "取消",
						buttons: [{
							title: "保存到手机"
						}]
					}, function(e) {
						if(e.index == "1") { //保存
							if(window.plus) {
								SavaImg();
							} else {
								document.addEventListener("plusready", SavaImg, false);
							}
						}
					});
				}
				for(var i = 0; i < ObjThis.length; i++) {
					if(window.plus) {
						plusReadySavaImgLocal();
					} else {
						document.addEventListener("plusready", plusReadySavaImgLocal, false);
					}
					path = $(ObjThis[i]).find("img").attr("src");
				}
				//保存
				function SavaImg() {
					//先下载到本地
					var dtask = plus.downloader.createDownload(path, {}, function(d, status) {
						if(status == 200) {
							plus.gallery.save(d.filename, function(e) {
								mui.toast("图片保存成功");
							}, function(e) {
								mui.toast("图片保存失败");
							});
						}
					});
					dtask.start();
				}
				$(".BackRadius").parent().css("border-radius", ".5rem");
			}
		});

		//搜索页面
		$.fn.extend({
			SearchPage: function(para) {
				if(!para) para = {};
				var div_main;
				//搜索触发事件
				var onsearch = para.onsearch ? para.onsearch : false;
				// 加载页面
				var load = function() {
					div_main = $(".banban-searchlist-page");
					// 若page不存在则创建page
					if(div_main.length == 0) {
						var id = "id" + Math.random().toString().replace(".", "");
						//主容器
						div_main = $("<div>", {
							"id": id,
							"class": "page banban-searchlist-page"
						});
						// 标题
						var header = $("<header>", {
							"class": "bar bar-nav"
						});
						var div_bar = $("<div>", {
							"class": "bar searchPage-bar"
						});
						var div_searchbar = $("<div>", {
							"class": "searchbar searchPage-searchbar row"
						});
						var div_searchinput = $("<div>", {
							"class": "search-input searchPage-searchleft"
						});
						//搜索框
						var input_search = $("<input>", {
							"id": "searchPage",
							"class": "searchbg searchPage-searchinput",
							"type": "search",
							"placeholder": "搜索"
						});
						input_search.on("input propertychange", function() {
							var value = $(this).val();
							if(onsearch && typeof onsearch == "function") {
								onsearch(value);
							}
						});
						div_searchinput.append('<label class="icon iconfont icon-search" for="search"></label>');
						div_searchinput.append(input_search);
						div_searchbar.append(div_searchinput);
						var a_cancel = $("<a>", {
							"class": "searchPage-searchcancel searchPage-cancelleft"
						});
						a_cancel.html("取消");
						a_cancel.on("tap", function() {
							$("#searchPage").val("");
							$("#" + id + " .search_content").children().not(".searchPage-nocontent").remove();
							mui.back();
						});
						div_searchbar.append(a_cancel);
						div_bar.append(div_searchbar);
						header.append(div_bar);
						div_main.append(header);
						var div_content = $("<div>", {
							"class": "content search_content"
						});
						var div_searchoncontent = $('<div class="searchPage-nocontent">')
						var img = $('<img src="../../img/common/no-search.png" />');
						div_searchoncontent.append(img);
						var span = $('<span style="display:block;margin-top:1.25rem;color:#999;font-size:0.8rem;">');
						span.text("暂时没有搜到内容");
						div_searchoncontent.append(span);
						div_content.append(div_searchoncontent);
						div_main.append(div_content);
						// 添加page到page-group中
						$(".page-group:first").append(div_main);
						$(document).on("pageAnimationEnd", "#" + div_main.attr("id"), function() {
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
								setTimeout(function() {
									document.getElementById('searchPage').focus();
								}, 100);
							} else {
								document.getElementById('searchPage').focus();
							}
						});
					}

					$.router.loadPage("#" + div_main.attr("id"));
					$("#" + div_main.attr("id") + " .search_content").find(".searchPage-nocontent").show();
				};
				//加载页面
				$(this).on("tap", function() {
					load();
				});
			}
		});
		//通讯录加载
		$.fn.extend({
			"addrlistDept": function(id, DeptName, para, NewPageIDArr) {
				//保存加载页面的id
				NewPageIDArr.push(id);
				//加载新的页面DIV
				var div = $("<div class='popup page' id='page" + id + "'>");
				var header = $('<header class="bar bar-nav">   </header>');
				var div_a = $('<a href="" class="button button-link button-nav pull-left Deptback"> <span class="icon icon-left"></span>返回 </a>');
				//返回事件
				div_a.click(function() {
					onback()
				});
				var div_h1 = $('<h1 class="title">' + DeptName + '</h1>');
				header.append(div_a, div_h1);
				var divConten = $('<div class="content">')
				divConten.css("background", "#f1f1f1");
				var div1 = $('<div class="list-block Content-EmptList" style="margin:0;">');
				var divCenter = $('<div class="sellChance-content-padded" style="color: #0894ec;border-bottom:none;">未分组</div>');
				var div2 = $('<div>');
				var ul = $('<ul>');
				div1.append(ul);
				divConten.append(div1, div2);
				div.append(header);
				div.append(divConten);
				$("body").append(div);

				$.ibo.crossOrgin({
					url: $.ibo.CompanyOASrvUrl,
					funcName: "CRM_GetUnderDeptsAndUserTargetAmount",
					data: $.toJSON({
						ParentID: id
					}),
					success: function(obj) {
						if($.ibo.ResFlag.Success == obj.ResFlag) {
							if(obj.ResObj) {
								console.log(obj.ResObj);
								if(obj.ResObj.ChildDeptList.length != 0) {
									$.each(obj.ResObj.ChildDeptList, function(i, n) {
										var li = $("<li style='border-bottom:1px solid #e7e7e7'>");
										var a = $("<a  class=\"item-content item-link\">");
										a.append("<div class=\"item-inner\"> <div class=\"item-title\">" + n.DeptName + "</div> <div class=\"item-after\">" + n.EmpCount + "</div> </div>");
										li.append(a);
										ul.append(li);
										a.on("click", function() {
											//保存加载页面的id
											if($("#page" + n.DeptID).length == 0) {
												$(this).addrlistDept(n.DeptID, n.DeptName, para, NewPageIDArr);
											} else {
												NewPageIDArr.push(n.DeptID);
												$.popup("#page" + n.DeptID);
											}
										})
									})
								} else {
									div1.hide();
								}
								if(obj.ResObj.EmpList.length != 0) {
									var Empdiv = $("<div class='list-block' style='margin:0;'>");
									var Empul = $("<ul style='border-bottom:none;'>");

									$.each(obj.ResObj.EmpList, function(i, n) {
										if(!n.IconUrl) {
											if(n.Sex == 1) {
												n.IconUrl = "../../img/views/address-list/Male-head.png"
											} else {
												n.IconUrl = "../../img/views/address-list/Female-Avatar.png";
											}
										}
										var Empli = $("<li class='item-content' style='border-bottom:1px solid #e7e7e7;'>");
										var Empdiv1 = $("<div class='item-media' style='padding-bottom:0;'>");
										Empdiv1.append("<i class='icon'><img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/></i>");
										var Empdiv2 = $("<div class='item-inner'>");
										Empdiv2.append("<div class=\"item-title\" style='margin-top:.2rem;'>" + n.EmpName + "</div> <div class=\"item-after\">" + $.FormatNum(n.TargetAmount, 2) + "元</div>")
										Empli.append(Empdiv1, Empdiv2);
										//ul.append(liChar);
										Empul.append(Empli);
										//点击回调事件
										Empli.on("click", function() {
											if(para.callBack && typeof(para.callBack) == 'function') {
												NewPageIDArr = [];
												para.callBack(n);
												$.closeModal(".popup");
												setTimeout(function() {
													$(".popup").remove();
													$(".popup-overlay").remove();
												}, 200);
											}
										})
									})
									Empdiv.append(Empul);
									div2.append(Empdiv);
								}
								//判断是不是显示未分组
								if(obj.ResObj.ChildDeptList.length != 0 && obj.ResObj.EmpList.length != 0) {
									div2.before(divCenter)
								} else if(obj.ResObj.ChildDeptList.length == 0 && obj.ResObj.EmpList.length == 0) {
									div1.hide();
									var noEmp = $("<div class='NoEmpShow' style='display:block;text-align: center;margin-top: 10rem;'>");
									noEmp_img = $("<img src='../../img/views/address-list/linkman.png' style='width:4.5rem;'>");
									noEmp_div = $("<div style='color:#999;'>");
									noEmp_div.text("暂时没有联系人");
									noEmp.append(noEmp_img, noEmp_div);
									divConten.append(noEmp);
								}
							}
						} else {
							alert(obj.ResObj);
						}
					}
				});

				$.popup("#page" + id);
				//Android返回
				function onback() {
					if(NewPageIDArr.length == 0) {
						mui.back()
					} else if(NewPageIDArr.length == 1) {
						$.closeModal(".banban-SelIndexAddress-page");
						setTimeout(function() {
							$(".popup").remove();
							$(".popup-overlay").remove();
						}, 200);
					} else {
						$.closeModal("#page" + NewPageIDArr[NewPageIDArr.length - 1]);
					}
					NewPageIDArr.pop();
				}

				function plusReadyBack() {
					plus.key.removeEventListener("backbutton", onback);
					plus.key.addEventListener("backbutton", onback, false);
				}
				if(window.plus) {
					plusReadyBack();
				} else {
					document.addEventListener('plusready', plusReadyBack, false);
				}
			}
		});
		//文本编辑框
		$.fn.extend({
			_opt: {
				validHtml: [],
			},
			iboEditor: function(options) {
				var _this = this;
				var obj = $(this);
				obj.addClass("needsfocus");
				obj.attr("contenteditable", true);
				_this._opt = $.extend(_this._opt, options);
				var uploadSuccess = (_this._opt && _this._opt.uploadSuccess && typeof(_this._opt.uploadSuccess) == "function") ? _this._opt.uploadSuccess : false;
				try {
					$(_this._opt.imgTar).UploaderImg({
						IsOriginal: false,
						quality: 80,
						multiple: true,
						//url: _this._opt.uploadUrl,
						callBackFun: function(src) {
							if(uploadSuccess) {
								uploadSuccess(src);
							} else {
								$.each(src, function(i, n) {
									var imgurl = n.img_com;
									//var image = '<img src="' + imgurl + '" style="width:90%;" />';
									//_this.insertImage(image);
									obj.append('</br><img src="' + imgurl + '" style="width:90%;" /></br>');
								});
							}
							if(window.getSelection) {
								obj.focus();
								var range = window.getSelection();
								range.selectAllChildren(obj);
								range.collapseToEnd();
							} else if(document.selection) {
								var range = document.selection.createRange();
								range.moveToElementText(obj);
								range.collapse(false);
								range.select();
							}
							obj.focus();
						}
					});
					_this.pasteHandler();
					_this.propertychangeHandler();
				} catch(e) {
					console.log(e);
				}
			},
			insertImage: function(src) {
				$(this).focus();
				var selection = window.getSelection ? window.getSelection() : document.selection;
				var range = selection.createRange ? selection.createRange() : selection.getRangeAt(0);
				if(!window.getSelection) {
					range.pasteHTML(src);
					range.collapse(false);
					range.select();
				} else {
					range.collapse(false);
					var hasR = range.createContextualFragment(src);
					var hasLastChild = hasR.lastChild;
					while(hasLastChild && hasLastChild.nodeName.toLowerCase() == "br" && hasLastChild.previousSibling && hasLastChild.previousSibling.nodeName.toLowerCase() == "br") {
						var e = hasLastChild;
						hasLastChild = hasLastChild.previousSibling;
						hasR.removeChild(e);
					}
					range.insertNode(range.createContextualFragment("<br/>"));
					range.insertNode(hasR);
					if(hasLastChild) {
						range.setEndAfter(hasLastChild);
						range.setStartAfter(hasLastChild);
					}
					selection.removeAllRanges();
					selection.addRange(range);
				}
			},
			pasteHandler: function() {
				var _this = this;
				$(this).on("paste", function(e) {
					var content = $(this).html();
					var validHTML = ["<br/>"];
					content = content.replace(/_moz_dirty=""/gi, "").replace(/\[/g, "[[-").replace(/\]/g, "-]]").replace(/<\/ ?tr[^>]*>/gi, "[br]").replace(/<\/ ?td[^>]*>/gi, "&nbsp;&nbsp;").replace(/<(ul|dl|ol)[^>]*>/gi, "[br]").replace(/<(li|dd)[^>]*>/gi, "[br]").replace(/<p [^>]*>/gi, "[br]").replace(new RegExp("<(/?(?:" + validHTML.join("|") + ")[^>]*)>", "gi"), "[$1]").replace(new RegExp('<span([^>]*class="?at"?[^>]*)>', "gi"), "[span$1]").replace(/\[\[\-/g, "[").replace(/\-\]\]/g, "]").replace(new RegExp("\\[(/?(?:" + validHTML.join("|") + "|img|span)[^\\]]*)\\]", "gi"), "<$1>");
					//.replace(/<[^>]*>/g, "")
					if(!/firefox/.test(navigator.userAgent.toLowerCase())) {
						content = content.replace(/\r?\n/gi, "<br>");
					}
					$(this).focus().html(content);
				});
			},
			propertychangeHandler: function() {
				var _this = this;
				//赋值焦点
				$(this).on("input propertychange", function(e) {
					$.each($(this).find("*:not(.needsfocus)"), function(i, n) {
						n.className = "needsfocus";
					});
				});
			},
			getValue: function() {
				return $(this).html();
			},
			setValue: function(str) {
				$(this).html(str);
			}
		});
	})(jQuery);

	$.extend({
		// 判断是否为邮箱
		checkEmail: function(v) {
			var regEmail = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
			return regEmail.test(v);
		},
		//判断手机号码
		checkPhone: function(v) {
			var regPhone = /^1[3|4|5|7|8]\d{9}$/;
			return regPhone.test(v);
		},
		// 判断是否为空
		checkNotNull: function(v) {
			if(v) return $.trim(v).length > 0;
			return false;
		},
		//打开客户选择
		SelectCustom: function(para) {
			var div_main = $(".banban-SelCustom-page");
			if(div_main.length == 0) {
				var data = $.toJSON({
					pgIndex: 0,
					pgSize: 0,
					keyword: "",
					INDChar: "",
					EmpID: localStorage.getItem("EmpID")
				});
				$.ibo.crossOrgin({
					url: $.ibo.CompanyOASrvUrl,
					funcName: "CRM_GetCustonList",
					data: data,
					success: function(obj) {
						if($.ibo.ResFlag.Success == obj.ResFlag) {
							console.log(obj);
							var id = "id" + Math.random().toString().replace(".", "");
							div_main = $("<div>", {
								"id": id,
								"class": "popup page banban-SelCustom-page"
							});
							// 标题
							var header = $("<header>", {
								"class": "bar bar-nav"
							});
							div_main.append(header);
							var h1_title = $("<h1>", {
								"class": "title"
							});
							header.append(h1_title);
							h1_title.text("客户列表");
							var back = $("<a>", {
								"class": "button button-link button-nav pull-left SelCustom-back"
							});
							back.append('<span class="icon icon-left"></span>返回');
							header.append(back);
							back.off("click").on("click", function() {
								$.closeModal('.banban-SelCustom-page');
							});
							//确定
							var confirm = $("<a>", {
								"class": "button button-link button-nav pull-right clickBackground"
							});
							header.append(confirm);
							confirm.text("确定");
							confirm.off('click').on("click", function() {
								var value = $("#" + div_main.attr("id")).find("input:radio:checked").val();
								var text = $("#" + div_main.attr("id")).find("input:radio:checked").attr('data-text');
								if(text == "" || text == undefined) {
									$.toast('请选择一个客户');
									return;
								}
								if(para.callback && typeof(para.callback) == 'function') {
									para.callback(value, text);
									$.closeModal('.banban-SelCustom-page');
								}
							});
							div_main.append(header);
							var div_content = $("<div>", {
								"class": "content sellChanceAdd-content-add"
							});
							div_content.css("background", "#f1f1f1");
							var SelCustom = $("<div>", {
								"class": "list-block"
							});
							var ul = $("<ul>");
							console.log(obj.ResObj);
							$.each(obj.ResObj, function(i, n) {
								var li = $("<li>");
								var label = $("<label>", {
									"class": "label-checkbox item-content"
								});
								label.append('<input type="radio" name="my-radio" value="' + n.CustomID + '" data-text="' + n.CustomName + '"/>');
								var div_media = $("<div class='item-media'>");
								div_media.append('<i class="icon icon-form-checkbox"></i>');
								var media_span = $('<span style="padding-left:.5rem;">');
								div_media.append(media_span);
								var media_img = $('<img src="" style="width:1.6rem; height:1.6rem;border-radius:1rem;">');
								media_span.append(media_img);
								switch(n.grade) {
									case 0:
										media_img.attr("src", " ../../img/views/crm/rate-un.png");
										break;
									case 1:
										media_img.attr("src", " ../../img/views/crm/rate_1.png");
										break;
									case 2:
										media_img.attr("src", " ../../img/views/crm/rate_2.png");
										break;
									case 3:
										media_img.attr("src", " ../../img/views/crm/rate_3.png");
										break;
									case 4:
										media_img.attr("src", " ../../img/views/crm/rate_4.png");
										break;
									case 5:
										media_img.attr("src", " ../../img/views/crm/rate_5.png");
										break;
								}
								label.append(div_media);
								var label_inner = $('<div class="item-inner sellChanceAdd-content-add-bottom">');
								var lable_row = $('<div class="item-title-row">');
								var label_text = $('<div class="item-title-row">');
								lable_row.append(label_text);
								var label_text_span = $("<span>");
								label_text_span.text(n.CustomName);
								var label_text_position = $("<span>");
								label_text_position.css({
									"color": "#888",
									"margin": "0 0 .3rem .7rem",
									"font-size": ".7rem",
									"display": "inline-block"
								});
								label_text_position.text(n.PositionName);
								var label_text_company = $("<div>");
								label_text_company.css({
									"color": "#666",
									"margin-top": ".2rem",
									"font-size": ".7rem"
								});
								label_text_company.text(n.CompanyName);
								label_text.append(label_text_span, label_text_position, label_text_company);
								label_inner.append(lable_row);
								label.append(label_inner);
								li.append(label);
								ul.append(li);
							});
							SelCustom.append(ul);
							div_content.append(SelCustom);
							div_main.append(div_content);
							// 添加page到page-group中
							$(".page-group:first").append(div_main);
							$.popup("#" + div_main.attr("id"));
						} else {
							$.alert(obj.ResObj);
						}
					}
				});
			} else {
				$.popup("#" + div_main.attr("id"));
				$("#" + div_main.attr("id")).find(".SelCustom-back").off("click").on("click", function() {
					$.closeModal('.banban-SelCustom-page');
				});
			}
		},
		//打开手机通讯录(未用)
		SelectAddress: function(para) {
			function getAddress() {
				var div_main = $(".banban-SelAddress-page");
				if(div_main.length == 0) {
					plus.contacts.getAddressBook(plus.contacts.ADDRESSBOOK_PHONE, function(addressbook) {
						var id = "id" + Math.random().toString().replace(".", "");
						div_main = $("<div>", {
							"id": id,
							"class": "popup page banban-SelAddress-page"
						});
						// 标题
						var header = $("<header>", {
							"class": "bar bar-nav"
						});
						div_main.append(header);
						var h1_title = $("<h1>", {
							"class": "title"
						});
						header.append(h1_title);
						h1_title.text("通讯录");
						var back = $("<a>", {
							"class": "button button-link button-nav pull-left SelAddress-back"
						});
						back.append('<span class="icon icon-left"></span>返回');
						header.append(back);
						back.off("click").on("click", function() {
							$.closeModal('.banban-SelAddress-page');
						});
						var div_content = $("<div>", {
							"class": "content"
						});
						$.showPreloader('加载中...');
						var time = setTimeout(function() {
							$.hidePreloader();
							$.toast('加载失败');
						}, 1000 * 30);
						addressbook.find(["displayName", "phoneNumbers", "photos"], function(contacts) {
							var divlistContent = $("<div>", {
								"class": "list-block contacts-block"
							});
							divlistContent.css("margin", "0");
							var array = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#"];
							var arrayObj = [];
							for(var i = 0; i < array.length; i++) {
								var div = $("<div>", {
									"class": "list-block media-list"
								});
								var ul = $("<ul>");
								ul.append('<li class="list-group-title">' + array[i] + '</li>');
								div.append(ul);
								arrayObj.push(div);
							}
							$.each(contacts, function(i, n) {
								var name = n.displayName;
								var nums = n.phoneNumbers;
								var photos = n.photos;
								var index = $.GetPy(name);
								if(index.length > 0) {
									index = index[0];
								} else {
									index = "#";
								}
								var phone = "";
								if(nums != null) {
									var ph = nums[0];
									if(ph != "" && ph != undefined) {
										phone = ph.value.replace("+86", "").replace(/-/g, "");
										if(!$.CheckMobile(phone)) {
											return true;
										}
									} else {
										return true;
									}
								} else {
									return true;
								}
								for(var j = 0; j < array.length; j++) {
									if(index.toUpperCase() == array[j]) {
										var li = $("<li>");
										var div = $("<div>", {
											"class": "item-content UserAddressBox"
										});
										if(photos == null) {
											div.append('<div class="item-media"><i class="icon"><img src="../../img/views/address-list/Male-head.png" /></i></div>');
										} else {
											var photo = photos[0];
											div.append('<div class="item-media"><i class="icon"><img src=' + ((photo == "" || photo == undefined) ? "../../img/views/address-list/Male-head.png" : photo.value) + ' /></i></div>');
										}
										div.append('<div class="item-inner">' +
											'<div class="item-title-row"><div class="item-title">' + name + '</div>' +
											//'<div class="item-after"><span class="pull-right icon"></span></div>' +
											'</div>' +
											'<div class="item-subtitle">' + phone + '</div>' +
											'</div>');
										div.on("click", function() {
											var addressname = $(this).find(".item-title").text();
											var addressphone = $(this).find(".item-subtitle").text();
											if(para.callback && typeof(para.callback) == 'function') {
												para.callback(addressname, addressphone);
												$.closeModal('.banban-SelAddress-page');
											}
										});
										li.append(div);
										arrayObj[j].find("ul").append(li);
										break;
									}
								}
							});
							$.each(arrayObj, function(i, n) {
								if(n.find('li').length > 1) { //索引下有数据的项才添加
									divlistContent.append(n);
								}
							});
							$.hidePreloader();
							if(time != null) {
								clearTimeout(time);
							}
							div_content.append(divlistContent);
							div_main.append(div_content);
							// 添加page到page-group中
							$(".page-group:first").append(div_main);
							$.popup("#" + div_main.attr("id"));
						}, function() {
							console.log("error");
						});
					}, function(e) {
						console.log("Get address book failed: " + e.message);
					});
				} else {
					$.popup("#" + div_main.attr("id"));
					$("#" + div_main.attr("id")).find(".SelAddress-back").off("click").on("click", function() {
						$.closeModal('.banban-SelAddress-page');
					});
				}
			};

			function plusReady() {
				getAddress();
			}
			if(window.plus) {
				plusReady();
			} else {
				document.addEventListener("plusready", plusReady, false);
			}
		},
		//打开销售管理的通讯录（最新）
		/*marketingManagement  销售管理
		 * */
		SelectIndexAddress: function(para) {
			var div_main = $(".banban-SelIndexAddress-page");
			if(div_main.length == 0) {
				$.ibo.crossOrgin({
					url: $.ibo.CompanyOASrvUrl,
					funcName: "CRM_GetUnderDeptsAndUserTargetAmount",
					data: $.toJSON({
						ParentID: para.data,
					}),
					success: function(obj) {
						if($.ibo.ResFlag.Success == obj.ResFlag) {
							//							console.log(obj);
							NewPageIDArr.push("first");
							var id = "id" + Math.random().toString().replace(".", "");
							var div_main = $("<div id=" + id + " class='popup page banban-SelIndexAddress-page'>");
							//标题
							var header = $("<header class='bar bar-nav'>");
							div_main.append(header);
							var back = $("<a class='button button-link button-nav pull-left address_back'>");
							back.append('<span class="icon icon-left"></span>返回');
							//返回事件
							back.off("click").on("click", function() {
								$.closeModal(".banban-SelIndexAddress-page");
								setTimeout(function() {
									$(".popup").remove();
									$(".popup-overlay").remove();
								}, 200);
								NewPageIDArr = [];
							});

							var title = $("<h1 class='title'>");
							title.text("下属列表");
							header.append(back, title);
							//内容
							var div_content = $("<div class='content'>");
							div_content.css("background", "#f1f1f1");
							div_main.append(div_content);
							//搜索
							var div_header_secondary = $("<div class='bar bar-header-secondary' style='top:0.05rem;'>");
							var div_searchbar = $("<div class='searchbar'>");
							div_searchbar.css("background", "#f1f1f1");
							div_header_secondary.append(div_searchbar);
							var div_Cancel = $("<div class='searchbarCancel'>");
							div_Cancel.text("取消");
							//取消搜索
							div_Cancel.on("click", function() {
								$(this).animate({
									"right": "-2rem"
								}, 200).hide();
								$(this).css("display", "none");
								$("#index_addrtree_searchinput").animate({
									"width": "100%"
								}, 200);
								$("#index_addrtree_searchinput").val("")
								$(".bar-header-secondary").nextAll().show();
								$(".SeachAllEmp>ul").html("");
							});
							var div_search_input = $("<div class='search-input'>");
							div_searchbar.append(div_Cancel, div_search_input);
							var label_icon = $("<label class='icon iconfont icon-search' for='index_addrtree_searchinput'>");
							var label_input = $("<input id='index_addrtree_searchinput' type='search' placeholder='搜索'/>");
							div_search_input.append(label_icon, label_input);
							//搜索功能
							var EmpdivSeach = $("<div class='list-block SeachAllEmp' style='margin:0'>");
							var EmpulSeach = $("<ul style='border-bottom:none;'>");
							EmpdivSeach.append(EmpulSeach);
							//搜索事件
							label_input.on("tap", function() {
								$.closeModal(".banban-SelIndexAddress-page");
								NewPageIDArr = [];
							})
							label_input.SearchPage({
								onsearch: function(value) {
									EmpulSeach.html("");
									if(value == "") {
										$(".search_content").find(".SeachAllEmp").remove();
										$(".search_content").find(".searchPage-nocontent").show();
										return;
									}
									//获取所有人员列表
									$.ibo.crossOrgin({
										url: $.ibo.CompanyOASrvUrl,
										funcName: "CRM_GetUnderUserTargetAmount",
										data: $.toJSON({
											EmpName: value
										}),
										success: function(obj) {
											if($.ibo.ResFlag.Success == obj.ResFlag) {
												console.log(obj);
												if(obj.ResObj) {
													$.each(obj.ResObj.EmpList, function(i, n) {
														$(".search_content").find(".searchPage-nocontent").hide();
														//判断是不是有没有图片
														if(!n.IconUrl) {
															if(n.Sex == 1) {
																n.IconUrl = "../../img/views/address-list/Male-head.png"
															} else {
																n.IconUrl = "../../img/views/address-list/Female-Avatar.png";
															}
														}
														var Empli = $("<li class='item-content' style='border-bottom:1px solid #e7e7e7'>");
														var Empdiv1 = $("<div class='item-media'>");
														Empdiv1.append("<i class='icon icon-form-checkbox'></i>");
														Empdiv1.append(" <span style=\"padding-left:.5rem;\"> <img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/> </span>");
														var Empdiv2 = $("<div class='item-inner'>");
														Empdiv2.append("<div class=\"item-title\" style='margin-top:.2rem;'>" + n.EmpName + "</div>")
														if(para.type == "marketingManagement") { //销售管理
															var div2_after = $("<div class=\"item-after\">");
															div2_after.text($.FormatNum(n.TargetAmount, 2) + "元");
														} else {
															var div2_after = $("<div class=\"item-after\">");
															div2_after.text(n.EmpCount);
														}
														Empdiv2.append(div2_after);
														Empli.append(Empdiv1, Empdiv2);
														EmpulSeach.append(Empli);
														//点击回调事件
														Empli.on("tap", function() {
															if(para.type == "marketingManagement") { //销售管理
																if(para.callBack && typeof(para.callBack) == 'function') {
																	NewPageIDArr = [];
																	para.callBack(n);
																	$.closeModal('.banban-SelIndexAddress-page');
																	setTimeout(function() {
																		$(".popup").remove();
																		$(".popup-overlay").remove();
																	}, 200);
																}
															}
														})
													});
													$(".banban-searchlist-page").find(".search_content").append(EmpdivSeach);
													if(EmpulSeach.html() == "") {
														$(".search_content").find(".searchPage-nocontent").show();
													}
												}
											}
										}
									})
								}
							})
							div_Cancel.on("input", function(e) {

								$(".bar-header-secondary").nextAll().not(EmpdivSeach).hide();
								$(".searchbarCancel").css("display", "block");
								$(".searchbarCancel").animate({
									"right": "0.5rem"
								}, 200);
								$(this).animate({
									"width": "88%"
								}, 200);
								var value = $(this).val();
								if(value) {
									$(".index_address_Emp").css("display", "block");
									$(".index_address_Emp").css("margin-top", "2.2rem");
									$(".index_address_Emp>ul").html("");

								}
							})
							var div_address_dept = $("<div class='list-block Content-EmptList' style='margin:2.2rem 0 0 0;'>");
							var div_ul = $("<ul class='index_address_Dept'>");
							div_address_dept.append(div_ul);
							//未分组
							var div_Ungroup = $('<div class="sellChance-content-padded" style="color:#0894ec;border-bottom:none;">未分组</div>');
							//所有人员
							var div_address_emp = $("<div>");

							div_content.append(div_header_secondary, div_address_dept, div_Ungroup, div_address_emp);

							//遍历添加部门
							if(obj.ResObj.ChildDeptList.length != 0) {
								$.each(obj.ResObj.ChildDeptList, function(i, n) {
									var li = $("<li style='border-top:1px solid #e7e7e7'>");
									var a = $("<a  class=\"item-content item-link\">");
									var a_inner = $("<div class=\"item-inner\">");
									var div2_title = $("<div class=\"item-title\">");
									div2_title.text(n.DeptName);
									if(para.type == "marketingManagement") { //销售管理
										var div2_after = $("<div class=\"item-after\">");
										div2_after.text($.FormatNum(n.EmpTargetAmount, 2) + "元");
									} else {
										var div2_after = $("<div class=\"item-after\">");
										div2_after.text(n.EmpCount);
									}
									a_inner.append(div2_title, div2_after)
									a.append(a_inner);
									li.append(a);
									div_ul.append(li);
									li.on("click", function() {
										if($("#page" + n.DeptID).length == 0) {
											$(this).addrlistDept(n.DeptID, n.DeptName, para, NewPageIDArr);
										} else {
											NewPageIDArr.push(n.DeptID);
											$.popup("#page" + n.DeptID);
										}
									})
								})
							}
							//遍历添加人员
							if(obj.ResObj.EmpList.length != 0) {
								var Empdiv = $("<div class='list-block' style='margin:0;'>");
								var Empul = $("<ul style='border-bottom:none;'>");
								$.each(obj.ResObj.EmpList, function(i, n) {
									if(!n.IconUrl) {
										if(n.Sex == 1) {
											n.IconUrl = "../../img/views/address-list/Male-head.png"
										} else {
											n.IconUrl = "../../img/views/address-list/Female-Avatar.png";
										}
									}
									var Empli = $("<li class='item-content' style='border-bottom:1px solid #e7e7e7'>");
									var Empdiv1 = $("<div class='item-media' style='padding-bottom:0;'>");
									Empdiv1.append("<i class='icon'><img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/></i>");
									var Empdiv2 = $("<div class='item-inner'>");
									var div2_title = $("<div class=\"item-title\" style='margin-top:.2rem;'>");
									div2_title.text(n.EmpName);
									if(para.type == "marketingManagement") { //销售管理
										var div2_after = $("<div class=\"item-after\">");
										div2_after.text($.FormatNum(n.TargetAmount, 2) + "元");
									} else {
										var div2_after = $("<div class=\"item-after\">");
										div2_after.text(n.EmpCount);
									}
									Empdiv2.append(div2_title, div2_after)
									Empli.append(Empdiv1, Empdiv2);
									//ul.append(liChar);
									Empul.append(Empli);
									//点击回调事件
									Empli.on("click", function() {
										if(para.type == "marketingManagement") { //销售管理
											if(para.callBack && typeof(para.callBack) == 'function') {
												NewPageIDArr = [];
												para.callBack(n);
												$.closeModal('.banban-SelIndexAddress-page');
												setTimeout(function() {
													$(".popup").remove();
													$(".popup-overlay").remove();
												}, 200);
											}
										}
									})
								})
								Empdiv.append(Empul);
								div_address_emp.append(Empdiv);

							} else {
								div_Ungroup.remove();
							}
							//添加到页面中
							$("body").append(div_main);
							$.popup(".banban-SelIndexAddress-page");

						} else {
							alert(obj.ResObj);
						}
					}
				})
			} else {
				NewPageIDArr.push("first");
				$.popup("#" + div_main.attr("id"));
				$("#" + div_main.attr("id")).find(".address_back").off("click").on("click", function() {
					$.closeModal(".banban-SelIndexAddress-page");
					NewPageIDArr = [];
				});
				console.log(NewPageIDArr);
			}
		},
		//打开通讯录（全部或当前下属）
		/*
		 * data：null  获取全部通讯录
		 * data：部门id  获取当前部门下属
		 * type：check   复选框
		 * type：radio   单选框
		 * type: null    默认框
		 * IsShowSeach：false(不展示)  true(默认展示)
		 * Text：自定义标题
		 * IsHidePopup：   true 点击确认不隐藏通讯录
		 * 	回调点击确定需关闭通讯录$.closeModal(".popup");
									setTimeout(function() {
										$(".popup").remove();
										$(".popup-overlay").remove();
									}, 200)
		 * 
		 * */
		SelectAllAddress: function(para) {
			//是否查询下级列表
			var IsChild = para.IsChild ? para.IsChild : false;
			var data = null;
			if(IsChild) {
				data = $.toJSON({
					ParentID: para.data,
					HasChild: 1
				});
			} else {
				data = $.toJSON({
					ParentID: para.data,
				});
			}
			$.ibo.crossOrgin({
				url: $.ibo.CompanyBaseSrvUrl,
				funcName: "Common_GetCurrentDeptList",
				data: data,
				success: function(obj) {
					console.log(obj);
					if($.ibo.ResFlag.Success == obj.ResFlag) {
						if(obj.ResObj) {
							NewPageIDArr.push(obj.ResObj.DeptID);
							var div_main = $("<div id=Address" + obj.ResObj.DeptID + " class='popup page'>");
							//标题
							var header = $("<header class='bar bar-nav'>");
							div_main.append(header);
							var back = $("<a class='button button-link button-nav pull-left address_back'>");
							back.append('<span class="icon icon-left"></span>返回');
							//返回事件
							back.off("click").on("click", function() {
								onback()
							});

							var title = $("<h1 class='title'>");
							title.text(para.Text ? para.Text : obj.ResObj.DeptName);
							if(para.type == "check" || para.type == "radio") {
								var confirm_Number = $('input[name="my-checkbox"]:checked').length;
								var confirm_a = $("<a class='button button-link button-nav pull-right confirm_total' style='color:#999;'>");
								confirm_a.text("确认");
								var confirm_span = $("<span class='confirm_span' style='display:none;'>");
								confirm_a.append(confirm_span);
								confirm_span.append("(<span>0</span>)");
								if(confirm_Number > 0) {
									confirm_a.css("color", "#008cf0");
									confirm_span.show();
									confirm_span.children().text(confirm_Number);
								}
								(para.type == "radio") && confirm_span.remove();
								header.append(back, title, confirm_a);
								//点击回调事件
								confirm_a.off("click").on("click", function() {
									if($('input[name="my-checkbox"]:checked').length == 0) {
										$.alert("请选择人员");
									} else {
										var obj = [];
										$('input[name="my-checkbox"]:checked').each(function() {
											var obj_data = {
												EmpID: $(this).attr("data_id"),
												EmpName: $(this).attr("data_name"),
												Phone: $(this).val(),
												IconUrl: $(this).attr("data_iconurl"),
												Sex: $(this).attr("data_sex"),
												UserID: $(this).attr("data_userid"),
												UserType: $(this).attr("data_usertype"),
											}
											obj.push(obj_data);
										})
										if(para.callBack && typeof(para.callBack) == 'function') {
											if(!para.IsHidePopup) {
												$.closeModal(".popup");
												setTimeout(function() {
													$(".popup").remove();
													$(".popup-overlay").remove();
												}, 200)
											}
											para.callBack(obj);
										}
									}

								})
							} else {
								header.append(back, title);
							}
							//内容
							var div_content = $("<div class='content' style='background:#f1f1f1;'>");
							div_main.append(div_content);
							//搜索
							var div_header_secondary = $("<div class='bar bar-header-secondary' style='top:0.05rem;'>");
							var div_searchbar = $("<div class='searchbar' style='background:#f1f1f1;'>");
							div_header_secondary.append(div_searchbar);
							var div_search_input = $("<div class='search-input'>");
							div_searchbar.append(div_search_input);
							var label_icon = $("<label class='icon iconfont icon-search' for='index_addrtree_searchinput'>");
							var label_input = $("<input id='index_addrtree_searchinput' type='search' placeholder='搜索' style='background:#fff;'/>");
							div_search_input.append(label_icon, label_input);
							//搜索功能
							var EmpdivSeach = $("<div class='list-block media-list SeachAllEmp' style='margin:0;'>");
							var EmpulSeach = $("<ul>");
							EmpdivSeach.append(EmpulSeach);
							//搜索事件
							label_input.on("tap", function() {
								$.closeModal("#Address" + NewPageIDArr[NewPageIDArr.length - 1]);
								NewPageIDArr.pop();
							})
							label_input.SearchPage({
								onsearch: function(value) {
									EmpulSeach.html("");
									if(value == "") {
										$(".search_content").find(".SeachAllEmp").remove();
										$(".search_content").find(".searchPage-nocontent").show();
										return;
									}
									//获取所有人员列表
									var condition = new Array();
									condition.push({
										key: "KeyWord",
										value: value
									});
									var data = $.toJSON({
										Condition: condition
									});
									$.ibo.crossOrgin({
										url: $.ibo.CompanyBaseSrvUrl,
										funcName: "Common_GetEmpList",
										data: data,
										success: function(obj) {
											if($.ibo.ResFlag.Success == obj.ResFlag) {
												if(obj.ResObj) {
													$.each(obj.ResObj, function(i, n) {
														if((n.EmpName.indexOf(value) != -1) || (n.Phone.indexOf(value) != -1)) {
															$(".search_content").find(".searchPage-nocontent").hide();
															//判断是不是有没有图片
															if(!n.IconUrl) {
																if(n.Sex == 1) {
																	n.IconUrl = "../../img/views/address-list/Male-head.png"
																} else {
																	n.IconUrl = "../../img/views/address-list/Female-Avatar.png";
																}
															}
															var Empli = $("<li class='item-content' style='border-bottom:1px solid #e7e7e7'>");
															var Empdiv1 = $("<div class='item-media'>");
															var Empdiv2 = $("<div class='item-inner' style='border-bottom:none'>");
															var div2_title = $("<div class=\"item-title\" style='margin-top:.2rem;'>");
															div2_title.text(n.EmpName);
															Empdiv2.append(div2_title);
															if(para.type == "check" || para.type == "radio") {
																var li_label = $("<label class=\"label-checkbox item-content\" style='padding-left:0;width:100%;'>");
																li_label.on("tap", function() {
																	var num = $('input[name="my-checkbox"]:checked').length;
																	$(".confirm_total").css("color", "#008cf0");
																	if($(this).find("input")[0].checked == false) {
																		if(para.type == "check") {
																			$(".confirm_span").show().children().text(num += 1);
																		} else {
																			$(".confirm_total").show().children().text(num += 1);
																		}
																	} else {
																		if(para.type == "check") {
																			$(".confirm_span").show().children().text(num -= 1);
																			if(num == 0) {
																				$(".confirm_total").css("color", "#999");
																				$(".confirm_span").hide();
																			}
																		}

																	}
																})
																var Type = null;
																(para.type == "check") ? Type = "checkbox": Type = "radio";
																var label_input = $("<input type='" + Type + "' name='my-checkbox' value='" + n.Phone + "' data_id='" + n.EmpID + "' data_name='" + n.EmpName + "' data_IconUrl='" + n.IconUrl + "' data_Sex='" + n.Sex + "' data_UserID='" + n.UserID + "' data_UserType='" + n.UserType + "'>");
																li_label.append(label_input, Empdiv1, Empdiv2);
																var div1_icon = $("<i class='icon icon-form-checkbox'>");
																var div1_span = $("<span style=\"padding-left:.5rem;\"> <img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/>");
																Empdiv1.append(div1_icon, div1_span);
																Empli.append(li_label);
															} else {
																Empdiv1.append("<i class='icon'><img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/></i>");
																Empli.append(Empdiv1, Empdiv2);
																//点击回调事件
																Empli.off("click").on("click", function() {
																	if(para.callBack && typeof(para.callBack) == 'function') {
																		if(!para.IsHidePopup) {
																			$.closeModal(".popup");
																			setTimeout(function() {
																				$(".popup").remove();
																				$(".popup-overlay").remove();
																			}, 200)
																		}
																		para.callBack(n);
																		NewPageIDArr = [];
																	}
																})
															}
															EmpulSeach.append(Empli);
														}
													});
													$(".banban-searchlist-page").find(".search_content").append(EmpdivSeach);
													if(EmpulSeach.html() == "") {
														$(".search_content").find(".searchPage-nocontent").show();
													}
												}
											}
										}
									})
								}
							});
							var div_address_dept = $("<div class='list-block Content-EmptList' style='margin:2.2rem 0 0 0;'>");
							var div_ul = $("<ul class='index_address_Dept' style='border-bottom:none;'>");
							div_address_dept.append(div_ul);
							//未分组
							var div_Ungroup = $('<div style="padding:.35rem 0 .35rem .75rem;font-size:.75rem;color:#0894ec;border-bottom:none;">未分组</div>');
							//所有人员
							var div_address_emp = $("<div>");

							if(para.IsShowSeach == "false") {
								div_address_dept.css("margin", "0");
								div_content.append(div_address_dept, div_Ungroup, div_address_emp);
							} else {
								div_content.append(div_header_secondary, div_address_dept, div_Ungroup, div_address_emp);
							}
							//遍历添加部门
							if(obj.ResObj.ChildDeptList.length != 0) {
								$.each(obj.ResObj.ChildDeptList, function(i, n) {
									var li = $("<li style='border-bottom:1px solid #e7e7e7'>");
									var a = $("<a  class=\"item-content item-link\">");
									var a_inner = $("<div class=\"item-inner\" style='border-bottom:none'>");
									var div2_title = $("<div class=\"item-title\">");
									div2_title.text(n.DeptName);
									var div2_after = $("<div class=\"item-after\">");
									div2_after.text(n.EmpCount);
									a_inner.append(div2_title, div2_after)
									a.append(a_inner);
									li.append(a);
									div_ul.append(li);
									li.on("click", function() {
										$.SelectAllAddress({
											data: n.DeptID,
											IsChild: IsChild,
											type: para.type,
											IsShowSeach: "false",
											IsHidePopup: (para.IsHidePopup) ? true : false,
											callBack: para.callBack
										});
									})
								})
							}
							//遍历添加人员
							if(obj.ResObj.EmpList.length != 0) {
								var Empdiv = $("<div class='list-block' style='margin:0;'>");
								var Empul = $("<ul style='border-bottom:none'>");
								$.each(obj.ResObj.EmpList, function(i, n) {
									if(!n.IconUrl) {
										if(n.Sex == 1) {
											n.IconUrl = "../../img/views/address-list/Male-head.png"
										} else {
											n.IconUrl = "../../img/views/address-list/Female-Avatar.png";
										}
									}
									var Empli = $("<li style='border-bottom:1px solid #e7e7e7'>");
									var Empdiv1 = $("<div class='item-media' style='padding-bottom:0;'>");
									var Empdiv2 = $("<div class='item-inner' style='border-bottom:none'>");
									var div2_title = $("<div class=\"item-title\" style='margin-top:.2rem;'>");
									div2_title.text(n.EmpName);
									Empdiv2.append(div2_title);
									if(para.type == "check" || para.type == "radio") {
										var li_label = $("<label class=\"label-checkbox item-content\" style='padding-left:.75rem;width:100%;'>");
										li_label.on("tap", function() {
											var num = $('input[name="my-checkbox"]:checked').length;
											$(".confirm_total").css("color", "#008cf0");
											if($(this).find("input")[0].checked == false) {
												if(para.type == "check") {
													$(".confirm_span").show().children().text(num += 1);
												} else {
													$(".confirm_total").show().children().text(num += 1);
												}
											} else {
												if(para.type == "check") {
													$(".confirm_span").show().children().text(num -= 1);
													if(num == 0) {
														$(".confirm_total").css("color", "#999");
														$(".confirm_span").hide();
													}
												}
											}
										})
										var Type = null;
										(para.type == "check") ? Type = "checkbox": Type = "radio";
										var label_input = $("<input type='" + Type + "' name='my-checkbox' value='" + n.Phone + "' data_id='" + n.EmpID + "' data_name='" + n.EmpName + "' data_IconUrl='" + n.IconUrl + "' data_Sex='" + n.Sex + "' data_UserID='" + n.UserID + "' data_UserType='" + n.UserType + "'>");
										li_label.append(label_input, Empdiv1, Empdiv2);
										var div1_icon = $("<i class='icon icon-form-checkbox'>");
										var div1_span = $("<span style=\"padding-left:.5rem;\"> <img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/>");
										Empdiv1.append(div1_icon, div1_span);
										Empli.append(li_label);
									} else {
										Empli.addClass("item-content");
										Empdiv1.append("<i class='icon'><img src=\" " + n.IconUrl + " \" style=\"width:1.6rem; height:1.6rem;border-radius:1rem;\"/></i>");
										Empli.append(Empdiv1, Empdiv2);
										//点击回调事件
										Empli.off("click").on("click", function() {
											NewPageIDArr = [];
											if(para.callBack && typeof(para.callBack) == 'function') {
												if(!para.IsHidePopup) {
													$.closeModal(".popup");
													setTimeout(function() {
														$(".popup").remove();
														$(".popup-overlay").remove();
													}, 200)
												}
												para.callBack(n);
												NewPageIDArr = [];
											}
										})
									}
									//ul.append(liChar);
									Empul.append(Empli);
								})
								Empdiv.append(Empul);
								div_address_emp.append(Empdiv);
							} else {
								div_Ungroup.remove();
							}
							//判断是不是显示未分组
							if(obj.ResObj.ChildDeptList.length == 0 && obj.ResObj.EmpList.length != 0) {
								div_address_dept.hide();
								div_Ungroup.remove();
							} else if(obj.ResObj.ChildDeptList.length == 0 && obj.ResObj.EmpList.length == 0) {
								div_address_dept.hide();
								var noEmp = $("<div class='NoEmpShow' style='display:block;text-align: center;margin-top: 10rem;'>");
								noEmp_img = $("<img src='../../img/views/address-list/linkman.png' style='width:4.5rem;'>");
								noEmp_div = $("<div style='color:#999;'>");
								noEmp_div.text("暂时没有联系人");
								noEmp.append(noEmp_img, noEmp_div);
								div_content.append(noEmp);
							}
							if(obj.ResObj.ChildDeptList.length == 0 && obj.ResObj.EmpList.length != 0 && (para.IsShowSeach != "false")) {
								div_address_dept.show();
							}
							//添加到页面中
							$("body").append(div_main);
							$.popup("#Address" + obj.ResObj.DeptID);
						}
					} else {
						alert(obj.ResObj);
					}
				}
			})

			//Android返回
			function onback() {
				if(NewPageIDArr.length == 0) {
					mui.back()
				} else if(NewPageIDArr.length == 1) {
					$.closeModal(".popup");
					setTimeout(function() {
						$(".popup").remove();
						$(".popup-overlay").remove();
					}, 200);
				} else {
					$.closeModal("#Address" + NewPageIDArr[NewPageIDArr.length - 1]);
				}
				NewPageIDArr.pop();
			}

			function plusReadyBack() {
				plus.key.removeEventListener("backbutton", onback);
				plus.key.addEventListener("backbutton", onback, false);
			}
			if(window.plus) {
				plusReadyBack();
			} else {
				document.addEventListener('plusready', plusReadyBack, false);
			}
		},
		//邮箱校验
		CheckEmail: function(para) {
			var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//手机校验
		CheckMobile: function(para) {
			var reg = /^1[3|4|5|7|8]\d{9}$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//电话校验
		CheckTel: function(para) {
			var reg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//区号校验
		CheckTelFirst: function(para) {
			var reg = /^[0-9]{3,4}$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//固话电话校验
		CheckTelSecond: function(para) {
			var reg = /^[0-9]{7,8}$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//英文名效验
		CheckEnglishName: function(para) {
			var reg = /^[a-zA-Z\/ ]{2,20}$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//格式化数字(s为传入的数字，n为四舍五入的位数)
		FormatNum: function(s, n) {
			n = n > 0 && n <= 20 ? n : 2;
			s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
			var l = s.split(".")[0].split("").reverse(),
				r = s.split(".")[1];
			var t = "";
			for(var i = 0; i < l.length; i++) {
				t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
			}
			return t.split("").reverse().join("") + "." + r;
		},
		//数字校验(小数点后可以有1-9位)
		CheckNum: function(para) {
			var reg = /^\d+(\.\d{1,9})?$/;
			if(para == "" || para == undefined) {
				return true;
			}
			if(reg.test(para))
				return true;
			else
				return false;
		},
		//下载方法
		DownloadFile: function(para) {
			var fileurl = (para && para.url) ? para.url : "";
			if(window.plus) {
				createDownload();
			} else {
				document.addEventListener("plusready", createDownload, false);
			}
			// 创建下载任务
			function createDownload() {
				if(fileurl == "") {
					return;
				}
				plus.runtime.openURL(fileurl);
			}
		},
		//获取汉字首字母  (参数,str中文字符串 type返回的字母类型 返回值:拼音首字母串数组)
		GetPy: function(str, type) {
			// 汉字拼音首字母列表 本列表包含了20902个汉字,用于配合 ToChineseSpell
			var strChineseFirstPY = "YDYQSXMWZSSXJBYMGCCZQPSSQBYCDSCDQLDYLYBSSJGYZZJJFKCCLZDHWDWZJLJPFYYNWJJTMYHZWZHFLZPPQHGSCYYYNJQYXXGJHHSDSJNKKTMOMLCRXYPSNQSECCQZGGLLYJLMYZZSECYKYYHQWJSSGGYXYZYJWWKDJHYCHMYXJTLXJYQBYXZLDWRDJRWYSRLDZJPCBZJJBRCFTLECZSTZFXXZHTRQHYBDLYCZSSYMMRFMYQZPWWJJYFCRWFDFZQPYDDWYXKYJAWJFFXYPSFTZYHHYZYSWCJYXSCLCXXWZZXNBGNNXBXLZSZSBSGPYSYZDHMDZBQBZCWDZZYYTZHBTSYYBZGNTNXQYWQSKBPHHLXGYBFMJEBJHHGQTJCYSXSTKZHLYCKGLYSMZXYALMELDCCXGZYRJXSDLTYZCQKCNNJWHJTZZCQLJSTSTBNXBTYXCEQXGKWJYFLZQLYHYXSPSFXLMPBYSXXXYDJCZYLLLSJXFHJXPJBTFFYABYXBHZZBJYZLWLCZGGBTSSMDTJZXPTHYQTGLJSCQFZKJZJQNLZWLSLHDZBWJNCJZYZSQQYCQYRZCJJWYBRTWPYFTWEXCSKDZCTBZHYZZYYJXZCFFZZMJYXXSDZZOTTBZLQWFCKSZSXFYRLNYJMBDTHJXSQQCCSBXYYTSYFBXDZTGBCNSLCYZZPSAZYZZSCJCSHZQYDXLBPJLLMQXTYDZXSQJTZPXLCGLQTZWJBHCTSYJSFXYEJJTLBGXSXJMYJQQPFZASYJNTYDJXKJCDJSZCBARTDCLYJQMWNQNCLLLKBYBZZSYHQQLTWLCCXTXLLZNTYLNEWYZYXCZXXGRKRMTCNDNJTSYYSSDQDGHSDBJGHRWRQLYBGLXHLGTGXBQJDZPYJSJYJCTMRNYMGRZJCZGJMZMGXMPRYXKJNYMSGMZJYMKMFXMLDTGFBHCJHKYLPFMDXLQJJSMTQGZSJLQDLDGJYCALCMZCSDJLLNXDJFFFFJCZFMZFFPFKHKGDPSXKTACJDHHZDDCRRCFQYJKQCCWJDXHWJLYLLZGCFCQDSMLZPBJJPLSBCJGGDCKKDEZSQCCKJGCGKDJTJDLZYCXKLQSCGJCLTFPCQCZGWPJDQYZJJBYJHSJDZWGFSJGZKQCCZLLPSPKJGQJHZZLJPLGJGJJTHJJYJZCZMLZLYQBGJWMLJKXZDZNJQSYZMLJLLJKYWXMKJLHSKJGBMCLYYMKXJQLBMLLKMDXXKWYXYSLMLPSJQQJQXYXFJTJDXMXXLLCXQBSYJBGWYMBGGBCYXPJYGPEPFGDJGBHBNSQJYZJKJKHXQFGQZKFHYGKHDKLLSDJQXPQYKYBNQSXQNSZSWHBSXWHXWBZZXDMNSJBSBKBBZKLYLXGWXDRWYQZMYWSJQLCJXXJXKJEQXSCYETLZHLYYYSDZPAQYZCMTLSHTZCFYZYXYLJSDCJQAGYSLCQLYYYSHMRQQKLDXZSCSSSYDYCJYSFSJBFRSSZQSBXXPXJYSDRCKGJLGDKZJZBDKTCSYQPYHSTCLDJDHMXMCGXYZHJDDTMHLTXZXYLYMOHYJCLTYFBQQXPFBDFHHTKSQHZYYWCNXXCRWHOWGYJLEGWDQCWGFJYCSNTMYTOLBYGWQWESJPWNMLRYDZSZTXYQPZGCWXHNGPYXSHMYQJXZTDPPBFYHZHTJYFDZWKGKZBLDNTSXHQEEGZZYLZMMZYJZGXZXKHKSTXNXXWYLYAPSTHXDWHZYMPXAGKYDXBHNHXKDPJNMYHYLPMGOCSLNZHKXXLPZZLBMLSFBHHGYGYYGGBHSCYAQTYWLXTZQCEZYDQDQMMHTKLLSZHLSJZWFYHQSWSCWLQAZYNYTLSXTHAZNKZZSZZLAXXZWWCTGQQTDDYZTCCHYQZFLXPSLZYGPZSZNGLNDQTBDLXGTCTAJDKYWNSYZLJHHZZCWNYYZYWMHYCHHYXHJKZWSXHZYXLYSKQYSPSLYZWMYPPKBYGLKZHTYXAXQSYSHXASMCHKDSCRSWJPWXSGZJLWWSCHSJHSQNHCSEGNDAQTBAALZZMSSTDQJCJKTSCJAXPLGGXHHGXXZCXPDMMHLDGTYBYSJMXHMRCPXXJZCKZXSHMLQXXTTHXWZFKHCCZDYTCJYXQHLXDHYPJQXYLSYYDZOZJNYXQEZYSQYAYXWYPDGXDDXSPPYZNDLTWRHXYDXZZJHTCXMCZLHPYYYYMHZLLHNXMYLLLMDCPPXHMXDKYCYRDLTXJCHHZZXZLCCLYLNZSHZJZZLNNRLWHYQSNJHXYNTTTKYJPYCHHYEGKCTTWLGQRLGGTGTYGYHPYHYLQYQGCWYQKPYYYTTTTLHYHLLTYTTSPLKYZXGZWGPYDSSZZDQXSKCQNMJJZZBXYQMJRTFFBTKHZKBXLJJKDXJTLBWFZPPTKQTZTGPDGNTPJYFALQMKGXBDCLZFHZCLLLLADPMXDJHLCCLGYHDZFGYDDGCYYFGYDXKSSEBDHYKDKDKHNAXXYBPBYYHXZQGAFFQYJXDMLJCSQZLLPCHBSXGJYNDYBYQSPZWJLZKSDDTACTBXZDYZYPJZQSJNKKTKNJDJGYYPGTLFYQKASDNTCYHBLWDZHBBYDWJRYGKZYHEYYFJMSDTYFZJJHGCXPLXHLDWXXJKYTCYKSSSMTWCTTQZLPBSZDZWZXGZAGYKTYWXLHLSPBCLLOQMMZSSLCMBJCSZZKYDCZJGQQDSMCYTZQQLWZQZXSSFPTTFQMDDZDSHDTDWFHTDYZJYQJQKYPBDJYYXTLJHDRQXXXHAYDHRJLKLYTWHLLRLLRCXYLBWSRSZZSYMKZZHHKYHXKSMDSYDYCJPBZBSQLFCXXXNXKXWYWSDZYQOGGQMMYHCDZTTFJYYBGSTTTYBYKJDHKYXBELHTYPJQNFXFDYKZHQKZBYJTZBXHFDXKDASWTAWAJLDYJSFHBLDNNTNQJTJNCHXFJSRFWHZFMDRYJYJWZPDJKZYJYMPCYZNYNXFBYTFYFWYGDBNZZZDNYTXZEMMQBSQEHXFZMBMFLZZSRXYMJGSXWZJSPRYDJSJGXHJJGLJJYNZZJXHGXKYMLPYYYCXYTWQZSWHWLYRJLPXSLSXMFSWWKLCTNXNYNPSJSZHDZEPTXMYYWXYYSYWLXJQZQXZDCLEEELMCPJPCLWBXSQHFWWTFFJTNQJHJQDXHWLBYZNFJLALKYYJLDXHHYCSTYYWNRJYXYWTRMDRQHWQCMFJDYZMHMYYXJWMYZQZXTLMRSPWWCHAQBXYGZYPXYYRRCLMPYMGKSJSZYSRMYJSNXTPLNBAPPYPYLXYYZKYNLDZYJZCZNNLMZHHARQMPGWQTZMXXMLLHGDZXYHXKYXYCJMFFYYHJFSBSSQLXXNDYCANNMTCJCYPRRNYTYQNYYMBMSXNDLYLYSLJRLXYSXQMLLYZLZJJJKYZZCSFBZXXMSTBJGNXYZHLXNMCWSCYZYFZLXBRNNNYLBNRTGZQYSATSWRYHYJZMZDHZGZDWYBSSCSKXSYHYTXXGCQGXZZSHYXJSCRHMKKBXCZJYJYMKQHZJFNBHMQHYSNJNZYBKNQMCLGQHWLZNZSWXKHLJHYYBQLBFCDSXDLDSPFZPSKJYZWZXZDDXJSMMEGJSCSSMGCLXXKYYYLNYPWWWGYDKZJGGGZGGSYCKNJWNJPCXBJJTQTJWDSSPJXZXNZXUMELPXFSXTLLXCLJXJJLJZXCTPSWXLYDHLYQRWHSYCSQYYBYAYWJJJQFWQCQQCJQGXALDBZZYJGKGXPLTZYFXJLTPADKYQHPMATLCPDCKBMTXYBHKLENXDLEEGQDYMSAWHZMLJTWYGXLYQZLJEEYYBQQFFNLYXRDSCTGJGXYYNKLLYQKCCTLHJLQMKKZGCYYGLLLJDZGYDHZWXPYSJBZKDZGYZZHYWYFQYTYZSZYEZZLYMHJJHTSMQWYZLKYYWZCSRKQYTLTDXWCTYJKLWSQZWBDCQYNCJSRSZJLKCDCDTLZZZACQQZZDDXYPLXZBQJYLZLLLQDDZQJYJYJZYXNYYYNYJXKXDAZWYRDLJYYYRJLXLLDYXJCYWYWNQCCLDDNYYYNYCKCZHXXCCLGZQJGKWPPCQQJYSBZZXYJSQPXJPZBSBDSFNSFPZXHDWZTDWPPTFLZZBZDMYYPQJRSDZSQZSQXBDGCPZSWDWCSQZGMDHZXMWWFYBPDGPHTMJTHZSMMBGZMBZJCFZWFZBBZMQCFMBDMCJXLGPNJBBXGYHYYJGPTZGZMQBQTCGYXJXLWZKYDPDYMGCFTPFXYZTZXDZXTGKMTYBBCLBJASKYTSSQYYMSZXFJEWLXLLSZBQJJJAKLYLXLYCCTSXMCWFKKKBSXLLLLJYXTYLTJYYTDPJHNHNNKBYQNFQYYZBYYESSESSGDYHFHWTCJBSDZZTFDMXHCNJZYMQWSRYJDZJQPDQBBSTJGGFBKJBXTGQHNGWJXJGDLLTHZHHYYYYYYSXWTYYYCCBDBPYPZYCCZYJPZYWCBDLFWZCWJDXXHYHLHWZZXJTCZLCDPXUJCZZZLYXJJTXPHFXWPYWXZPTDZZBDZCYHJHMLXBQXSBYLRDTGJRRCTTTHYTCZWMXFYTWWZCWJWXJYWCSKYBZSCCTZQNHXNWXXKHKFHTSWOCCJYBCMPZZYKBNNZPBZHHZDLSYDDYTYFJPXYNGFXBYQXCBHXCPSXTYZDMKYSNXSXLHKMZXLYHDHKWHXXSSKQYHHCJYXGLHZXCSNHEKDTGZXQYPKDHEXTYKCNYMYYYPKQYYYKXZLTHJQTBYQHXBMYHSQCKWWYLLHCYYLNNEQXQWMCFBDCCMLJGGXDQKTLXKGNQCDGZJWYJJLYHHQTTTNWCHMXCXWHWSZJYDJCCDBQCDGDNYXZTHCQRXCBHZTQCBXWGQWYYBXHMBYMYQTYEXMQKYAQYRGYZSLFYKKQHYSSQYSHJGJCNXKZYCXSBXYXHYYLSTYCXQTHYSMGSCPMMGCCCCCMTZTASMGQZJHKLOSQYLSWTMXSYQKDZLJQQYPLSYCZTCQQPBBQJZCLPKHQZYYXXDTDDTSJCXFFLLCHQXMJLWCJCXTSPYCXNDTJSHJWXDQQJSKXYAMYLSJHMLALYKXCYYDMNMDQMXMCZNNCYBZKKYFLMCHCMLHXRCJJHSYLNMTJZGZGYWJXSRXCWJGJQHQZDQJDCJJZKJKGDZQGJJYJYLXZXXCDQHHHEYTMHLFSBDJSYYSHFYSTCZQLPBDRFRZTZYKYWHSZYQKWDQZRKMSYNBCRXQBJYFAZPZZEDZCJYWBCJWHYJBQSZYWRYSZPTDKZPFPBNZTKLQYHBBZPNPPTYZZYBQNYDCPJMMCYCQMCYFZZDCMNLFPBPLNGQJTBTTNJZPZBBZNJKLJQYLNBZQHKSJZNGGQSZZKYXSHPZSNBCGZKDDZQANZHJKDRTLZLSWJLJZLYWTJNDJZJHXYAYNCBGTZCSSQMNJPJYTYSWXZFKWJQTKHTZPLBHSNJZSYZBWZZZZLSYLSBJHDWWQPSLMMFBJDWAQYZTCJTBNNWZXQXCDSLQGDSDPDZHJTQQPSWLYYJZLGYXYZLCTCBJTKTYCZJTQKBSJLGMGZDMCSGPYNJZYQYYKNXRPWSZXMTNCSZZYXYBYHYZAXYWQCJTLLCKJJTJHGDXDXYQYZZBYWDLWQCGLZGJGQRQZCZSSBCRPCSKYDZNXJSQGXSSJMYDNSTZTPBDLTKZWXQWQTZEXNQCZGWEZKSSBYBRTSSSLCCGBPSZQSZLCCGLLLZXHZQTHCZMQGYZQZNMCOCSZJMMZSQPJYGQLJYJPPLDXRGZYXCCSXHSHGTZNLZWZKJCXTCFCJXLBMQBCZZWPQDNHXLJCTHYZLGYLNLSZZPCXDSCQQHJQKSXZPBAJYEMSMJTZDXLCJYRYYNWJBNGZZTMJXLTBSLYRZPYLSSCNXPHLLHYLLQQZQLXYMRSYCXZLMMCZLTZSDWTJJLLNZGGQXPFSKYGYGHBFZPDKMWGHCXMSGDXJMCJZDYCABXJDLNBCDQYGSKYDQTXDJJYXMSZQAZDZFSLQXYJSJZYLBTXXWXQQZBJZUFBBLYLWDSLJHXJYZJWTDJCZFQZQZZDZSXZZQLZCDZFJHYSPYMPQZMLPPLFFXJJNZZYLSJEYQZFPFZKSYWJJJHRDJZZXTXXGLGHYDXCSKYSWMMZCWYBAZBJKSHFHJCXMHFQHYXXYZFTSJYZFXYXPZLCHMZMBXHZZSXYFYMNCWDABAZLXKTCSHHXKXJJZJSTHYGXSXYYHHHJWXKZXSSBZZWHHHCWTZZZPJXSNXQQJGZYZYWLLCWXZFXXYXYHXMKYYSWSQMNLNAYCYSPMJKHWCQHYLAJJMZXHMMCNZHBHXCLXTJPLTXYJHDYYLTTXFSZHYXXSJBJYAYRSMXYPLCKDUYHLXRLNLLSTYZYYQYGYHHSCCSMZCTZQXKYQFPYYRPFFLKQUNTSZLLZMWWTCQQYZWTLLMLMPWMBZSSTZRBPDDTLQJJBXZCSRZQQYGWCSXFWZLXCCRSZDZMCYGGDZQSGTJSWLJMYMMZYHFBJDGYXCCPSHXNZCSBSJYJGJMPPWAFFYFNXHYZXZYLREMZGZCYZSSZDLLJCSQFNXZKPTXZGXJJGFMYYYSNBTYLBNLHPFZDCYFBMGQRRSSSZXYSGTZRNYDZZCDGPJAFJFZKNZBLCZSZPSGCYCJSZLMLRSZBZZLDLSLLYSXSQZQLYXZLSKKBRXBRBZCYCXZZZEEYFGKLZLYYHGZSGZLFJHGTGWKRAAJYZKZQTSSHJJXDCYZUYJLZYRZDQQHGJZXSSZBYKJPBFRTJXLLFQWJHYLQTYMBLPZDXTZYGBDHZZRBGXHWNJTJXLKSCFSMWLSDQYSJTXKZSCFWJLBXFTZLLJZLLQBLSQMQQCGCZFPBPHZCZJLPYYGGDTGWDCFCZQYYYQYSSCLXZSKLZZZGFFCQNWGLHQYZJJCZLQZZYJPJZZBPDCCMHJGXDQDGDLZQMFGPSYTSDYFWWDJZJYSXYYCZCYHZWPBYKXRYLYBHKJKSFXTZJMMCKHLLTNYYMSYXYZPYJQYCSYCWMTJJKQYRHLLQXPSGTLYYCLJSCPXJYZFNMLRGJJTYZBXYZMSJYJHHFZQMSYXRSZCWTLRTQZSSTKXGQKGSPTGCZNJSJCQCXHMXGGZTQYDJKZDLBZSXJLHYQGGGTHQSZPYHJHHGYYGKGGCWJZZYLCZLXQSFTGZSLLLMLJSKCTBLLZZSZMMNYTPZSXQHJCJYQXYZXZQZCPSHKZZYSXCDFGMWQRLLQXRFZTLYSTCTMJCXJJXHJNXTNRZTZFQYHQGLLGCXSZSJDJLJCYDSJTLNYXHSZXCGJZYQPYLFHDJSBPCCZHJJJQZJQDYBSSLLCMYTTMQTBHJQNNYGKYRQYQMZGCJKPDCGMYZHQLLSLLCLMHOLZGDYYFZSLJCQZLYLZQJESHNYLLJXGJXLYSYYYXNBZLJSSZCQQCJYLLZLTJYLLZLLBNYLGQCHXYYXOXCXQKYJXXXYKLXSXXYQXCYKQXQCSGYXXYQXYGYTQOHXHXPYXXXULCYEYCHZZCBWQBBWJQZSCSZSSLZYLKDESJZWMYMCYTSDSXXSCJPQQSQYLYYZYCMDJDZYWCBTJSYDJKCYDDJLBDJJSODZYSYXQQYXDHHGQQYQHDYXWGMMMAJDYBBBPPBCMUUPLJZSMTXERXJMHQNUTPJDCBSSMSSSTKJTSSMMTRCPLZSZMLQDSDMJMQPNQDXCFYNBFSDQXYXHYAYKQYDDLQYYYSSZBYDSLNTFQTZQPZMCHDHCZCWFDXTMYQSPHQYYXSRGJCWTJTZZQMGWJJTJHTQJBBHWZPXXHYQFXXQYWYYHYSCDYDHHQMNMTMWCPBSZPPZZGLMZFOLLCFWHMMSJZTTDHZZYFFYTZZGZYSKYJXQYJZQBHMBZZLYGHGFMSHPZFZSNCLPBQSNJXZSLXXFPMTYJYGBXLLDLXPZJYZJYHHZCYWHJYLSJEXFSZZYWXKZJLUYDTMLYMQJPWXYHXSKTQJEZRPXXZHHMHWQPWQLYJJQJJZSZCPHJLCHHNXJLQWZJHBMZYXBDHHYPZLHLHLGFWLCHYYTLHJXCJMSCPXSTKPNHQXSRTYXXTESYJCTLSSLSTDLLLWWYHDHRJZSFGXTSYCZYNYHTDHWJSLHTZDQDJZXXQHGYLTZPHCSQFCLNJTCLZPFSTPDYNYLGMJLLYCQHYSSHCHYLHQYQTMZYPBYWRFQYKQSYSLZDQJMPXYYSSRHZJNYWTQDFZBWWTWWRXCWHGYHXMKMYYYQMSMZHNGCEPMLQQMTCWCTMMPXJPJJHFXYYZSXZHTYBMSTSYJTTQQQYYLHYNPYQZLCYZHZWSMYLKFJXLWGXYPJYTYSYXYMZCKTTWLKSMZSYLMPWLZWXWQZSSAQSYXYRHSSNTSRAPXCPWCMGDXHXZDZYFJHGZTTSBJHGYZSZYSMYCLLLXBTYXHBBZJKSSDMALXHYCFYGMQYPJYCQXJLLLJGSLZGQLYCJCCZOTYXMTMTTLLWTGPXYMZMKLPSZZZXHKQYSXCTYJZYHXSHYXZKXLZWPSQPYHJWPJPWXQQYLXSDHMRSLZZYZWTTCYXYSZZSHBSCCSTPLWSSCJCHNLCGCHSSPHYLHFHHXJSXYLLNYLSZDHZXYLSXLWZYKCLDYAXZCMDDYSPJTQJZLNWQPSSSWCTSTSZLBLNXSMNYYMJQBQHRZWTYYDCHQLXKPZWBGQYBKFCMZWPZLLYYLSZYDWHXPSBCMLJBSCGBHXLQHYRLJXYSWXWXZSLDFHLSLYNJLZYFLYJYCDRJLFSYZFSLLCQYQFGJYHYXZLYLMSTDJCYHBZLLNWLXXYGYYHSMGDHXXHHLZZJZXCZZZCYQZFNGWPYLCPKPYYPMCLQKDGXZGGWQBDXZZKZFBXXLZXJTPJPTTBYTSZZDWSLCHZHSLTYXHQLHYXXXYYZYSWTXZKHLXZXZPYHGCHKCFSYHUTJRLXFJXPTZTWHPLYXFCRHXSHXKYXXYHZQDXQWULHYHMJTBFLKHTXCWHJFWJCFPQRYQXCYYYQYGRPYWSGSUNGWCHKZDXYFLXXHJJBYZWTSXXNCYJJYMSWZJQRMHXZWFQSYLZJZGBHYNSLBGTTCSYBYXXWXYHXYYXNSQYXMQYWRGYQLXBBZLJSYLPSYTJZYHYZAWLRORJMKSCZJXXXYXCHDYXRYXXJDTSQFXLYLTSFFYXLMTYJMJUYYYXLTZCSXQZQHZXLYYXZHDNBRXXXJCTYHLBRLMBRLLAXKYLLLJLYXXLYCRYLCJTGJCMTLZLLCYZZPZPCYAWHJJFYBDYYZSMPCKZDQYQPBPCJPDCYZMDPBCYYDYCNNPLMTMLRMFMMGWYZBSJGYGSMZQQQZTXMKQWGXLLPJGZBQCDJJJFPKJKCXBLJMSWMDTQJXLDLPPBXCWRCQFBFQJCZAHZGMYKPHYYHZYKNDKZMBPJYXPXYHLFPNYYGXJDBKXNXHJMZJXSTRSTLDXSKZYSYBZXJLXYSLBZYSLHXJPFXPQNBYLLJQKYGZMCYZZYMCCSLCLHZFWFWYXZMWSXTYNXJHPYYMCYSPMHYSMYDYSHQYZCHMJJMZCAAGCFJBBHPLYZYLXXSDJGXDHKXXTXXNBHRMLYJSLTXMRHNLXQJXYZLLYSWQGDLBJHDCGJYQYCMHWFMJYBMBYJYJWYMDPWHXQLDYGPDFXXBCGJSPCKRSSYZJMSLBZZJFLJJJLGXZGYXYXLSZQYXBEXYXHGCXBPLDYHWETTWWCJMBTXCHXYQXLLXFLYXLLJLSSFWDPZSMYJCLMWYTCZPCHQEKCQBWLCQYDPLQPPQZQFJQDJHYMMCXTXDRMJWRHXCJZYLQXDYYNHYYHRSLSRSYWWZJYMTLTLLGTQCJZYABTCKZCJYCCQLJZQXALMZYHYWLWDXZXQDLLQSHGPJFJLJHJABCQZDJGTKHSSTCYJLPSWZLXZXRWGLDLZRLZXTGSLLLLZLYXXWGDZYGBDPHZPBRLWSXQBPFDWOFMWHLYPCBJCCLDMBZPBZZLCYQXLDOMZBLZWPDWYYGDSTTHCSQSCCRSSSYSLFYBFNTYJSZDFNDPDHDZZMBBLSLCMYFFGTJJQWFTMTPJWFNLBZCMMJTGBDZLQLPYFHYYMJYLSDCHDZJWJCCTLJCLDTLJJCPDDSQDSSZYBNDBJLGGJZXSXNLYCYBJXQYCBYLZCFZPPGKCXZDZFZTJJFJSJXZBNZYJQTTYJYHTYCZHYMDJXTTMPXSPLZCDWSLSHXYPZGTFMLCJTYCBPMGDKWYCYZCDSZZYHFLYCTYGWHKJYYLSJCXGYWJCBLLCSNDDBTZBSCLYZCZZSSQDLLMQYYHFSLQLLXFTYHABXGWNYWYYPLLSDLDLLBJCYXJZMLHLJDXYYQYTDLLLBUGBFDFBBQJZZMDPJHGCLGMJJPGAEHHBWCQXAXHHHZCHXYPHJAXHLPHJPGPZJQCQZGJJZZUZDMQYYBZZPHYHYBWHAZYJHYKFGDPFQSDLZMLJXKXGALXZDAGLMDGXMWZQYXXDXXPFDMMSSYMPFMDMMKXKSYZYSHDZKXSYSMMZZZMSYDNZZCZXFPLSTMZDNMXCKJMZTYYMZMZZMSXHHDCZJEMXXKLJSTLWLSQLYJZLLZJSSDPPMHNLZJCZYHMXXHGZCJMDHXTKGRMXFWMCGMWKDTKSXQMMMFZZYDKMSCLCMPCGMHSPXQPZDSSLCXKYXTWLWJYAHZJGZQMCSNXYYMMPMLKJXMHLMLQMXCTKZMJQYSZJSYSZHSYJZJCDAJZYBSDQJZGWZQQXFKDMSDJLFWEHKZQKJPEYPZYSZCDWYJFFMZZYLTTDZZEFMZLBNPPLPLPEPSZALLTYLKCKQZKGENQLWAGYXYDPXLHSXQQWQCQXQCLHYXXMLYCCWLYMQYSKGCHLCJNSZKPYZKCQZQLJPDMDZHLASXLBYDWQLWDNBQCRYDDZTJYBKBWSZDXDTNPJDTCTQDFXQQMGNXECLTTBKPWSLCTYQLPWYZZKLPYGZCQQPLLKCCYLPQMZCZQCLJSLQZDJXLDDHPZQDLJJXZQDXYZQKZLJCYQDYJPPYPQYKJYRMPCBYMCXKLLZLLFQPYLLLMBSGLCYSSLRSYSQTMXYXZQZFDZUYSYZTFFMZZSMZQHZSSCCMLYXWTPZGXZJGZGSJSGKDDHTQGGZLLBJDZLCBCHYXYZHZFYWXYZYMSDBZZYJGTSMTFXQYXQSTDGSLNXDLRYZZLRYYLXQHTXSRTZNGZXBNQQZFMYKMZJBZYMKBPNLYZPBLMCNQYZZZSJZHJCTZKHYZZJRDYZHNPXGLFZTLKGJTCTSSYLLGZRZBBQZZKLPKLCZYSSUYXBJFPNJZZXCDWXZYJXZZDJJKGGRSRJKMSMZJLSJYWQSKYHQJSXPJZZZLSNSHRNYPZTWCHKLPSRZLZXYJQXQKYSJYCZTLQZYBBYBWZPQDWWYZCYTJCJXCKCWDKKZXSGKDZXWWYYJQYYTCYTDLLXWKCZKKLCCLZCQQDZLQLCSFQCHQHSFSMQZZLNBJJZBSJHTSZDYSJQJPDLZCDCWJKJZZLPYCGMZWDJJBSJQZSYZYHHXJPBJYDSSXDZNCGLQMBTSFSBPDZDLZNFGFJGFSMPXJQLMBLGQCYYXBQKDJJQYRFKZTJDHCZKLBSDZCFJTPLLJGXHYXZCSSZZXSTJYGKGCKGYOQXJPLZPBPGTGYJZGHZQZZLBJLSQFZGKQQJZGYCZBZQTLDXRJXBSXXPZXHYZYCLWDXJJHXMFDZPFZHQHQMQGKSLYHTYCGFRZGNQXCLPDLBZCSCZQLLJBLHBZCYPZZPPDYMZZSGYHCKCPZJGSLJLNSCDSLDLXBMSTLDDFJMKDJDHZLZXLSZQPQPGJLLYBDSZGQLBZLSLKYYHZTTNTJYQTZZPSZQZTLLJTYYLLQLLQYZQLBDZLSLYYZYMDFSZSNHLXZNCZQZPBWSKRFBSYZMTHBLGJPMCZZLSTLXSHTCSYZLZBLFEQHLXFLCJLYLJQCBZLZJHHSSTBRMHXZHJZCLXFNBGXGTQJCZTMSFZKJMSSNXLJKBHSJXNTNLZDNTLMSJXGZJYJCZXYJYJWRWWQNZTNFJSZPZSHZJFYRDJSFSZJZBJFZQZZHZLXFYSBZQLZSGYFTZDCSZXZJBQMSZKJRHYJZCKMJKHCHGTXKXQGLXPXFXTRTYLXJXHDTSJXHJZJXZWZLCQSBTXWXGXTXXHXFTSDKFJHZYJFJXRZSDLLLTQSQQZQWZXSYQTWGWBZCGZLLYZBCLMQQTZHZXZXLJFRMYZFLXYSQXXJKXRMQDZDMMYYBSQBHGZMWFWXGMXLZPYYTGZYCCDXYZXYWGSYJYZNBHPZJSQSYXSXRTFYZGRHZTXSZZTHCBFCLSYXZLZQMZLMPLMXZJXSFLBYZMYQHXJSXRXSQZZZSSLYFRCZJRCRXHHZXQYDYHXSJJHZCXZBTYNSYSXJBQLPXZQPYMLXZKYXLXCJLCYSXXZZLXDLLLJJYHZXGYJWKJRWYHCPSGNRZLFZWFZZNSXGXFLZSXZZZBFCSYJDBRJKRDHHGXJLJJTGXJXXSTJTJXLYXQFCSGSWMSBCTLQZZWLZZKXJMLTMJYHSDDBXGZHDLBMYJFRZFSGCLYJBPMLYSMSXLSZJQQHJZFXGFQFQBPXZGYYQXGZTCQWYLTLGWSGWHRLFSFGZJMGMGBGTJFSYZZGZYZAFLSSPMLPFLCWBJZCLJJMZLPJJLYMQDMYYYFBGYGYZMLYZDXQYXRQQQHSYYYQXYLJTYXFSFSLLGNQCYHYCWFHCCCFXPYLYPLLZYXXXXXKQHHXSHJZCFZSCZJXCPZWHHHHHAPYLQALPQAFYHXDYLUKMZQGGGDDESRNNZLTZGCHYPPYSQJJHCLLJTOLNJPZLJLHYMHEYDYDSQYCDDHGZUNDZCLZYZLLZNTNYZGSLHSLPJJBDGWXPCDUTJCKLKCLWKLLCASSTKZZDNQNTTLYYZSSYSSZZRYLJQKCQDHHCRXRZYDGRGCWCGZQFFFPPJFZYNAKRGYWYQPQXXFKJTSZZXSWZDDFBBXTBGTZKZNPZZPZXZPJSZBMQHKCYXYLDKLJNYPKYGHGDZJXXEAHPNZKZTZCMXCXMMJXNKSZQNMNLWBWWXJKYHCPSTMCSQTZJYXTPCTPDTNNPGLLLZSJLSPBLPLQHDTNJNLYYRSZFFJFQWDPHZDWMRZCCLODAXNSSNYZRESTYJWJYJDBCFXNMWTTBYLWSTSZGYBLJPXGLBOCLHPCBJLTMXZLJYLZXCLTPNCLCKXTPZJSWCYXSFYSZDKNTLBYJCYJLLSTGQCBXRYZXBXKLYLHZLQZLNZCXWJZLJZJNCJHXMNZZGJZZXTZJXYCYYCXXJYYXJJXSSSJSTSSTTPPGQTCSXWZDCSYFPTFBFHFBBLZJCLZZDBXGCXLQPXKFZFLSYLTUWBMQJHSZBMDDBCYSCCLDXYCDDQLYJJWMQLLCSGLJJSYFPYYCCYLTJANTJJPWYCMMGQYYSXDXQMZHSZXPFTWWZQSWQRFKJLZJQQYFBRXJHHFWJJZYQAZMYFRHCYYBYQWLPEXCCZSTYRLTTDMQLYKMBBGMYYJPRKZNPBSXYXBHYZDJDNGHPMFSGMWFZMFQMMBCMZZCJJLCNUXYQLMLRYGQZCYXZLWJGCJCGGMCJNFYZZJHYCPRRCMTZQZXHFQGTJXCCJEAQCRJYHPLQLSZDJRBCQHQDYRHYLYXJSYMHZYDWLDFRYHBPYDTSSCNWBXGLPZMLZZTQSSCPJMXXYCSJYTYCGHYCJWYRXXLFEMWJNMKLLSWTXHYYYNCMMCWJDQDJZGLLJWJRKHPZGGFLCCSCZMCBLTBHBQJXQDSPDJZZGKGLFQYWBZYZJLTSTDHQHCTCBCHFLQMPWDSHYYTQWCNZZJTLBYMBPDYYYXSQKXWYYFLXXNCWCXYPMAELYKKJMZZZBRXYYQJFLJPFHHHYTZZXSGQQMHSPGDZQWBWPJHZJDYSCQWZKTXXSQLZYYMYSDZGRXCKKUJLWPYSYSCSYZLRMLQSYLJXBCXTLWDQZPCYCYKPPPNSXFYZJJRCEMHSZMSXLXGLRWGCSTLRSXBZGBZGZTCPLUJLSLYLYMTXMTZPALZXPXJTJWTCYYZLBLXBZLQMYLXPGHDSLSSDMXMBDZZSXWHAMLCZCPJMCNHJYSNSYGCHSKQMZZQDLLKABLWJXSFMOCDXJRRLYQZKJMYBYQLYHETFJZFRFKSRYXFJTWDSXXSYSQJYSLYXWJHSNLXYYXHBHAWHHJZXWMYLJCSSLKYDZTXBZSYFDXGXZJKHSXXYBSSXDPYNZWRPTQZCZENYGCXQFJYKJBZMLJCMQQXUOXSLYXXLYLLJDZBTYMHPFSTTQQWLHOKYBLZZALZXQLHZWRRQHLSTMYPYXJJXMQSJFNBXYXYJXXYQYLTHYLQYFMLKLJTMLLHSZWKZHLJMLHLJKLJSTLQXYLMBHHLNLZXQJHXCFXXLHYHJJGBYZZKBXSCQDJQDSUJZYYHZHHMGSXCSYMXFEBCQWWRBPYYJQTYZCYQYQQZYHMWFFHGZFRJFCDPXNTQYZPDYKHJLFRZXPPXZDBBGZQSTLGDGYLCQMLCHHMFYWLZYXKJLYPQHSYWMQQGQZMLZJNSQXJQSYJYCBEHSXFSZPXZWFLLBCYYJDYTDTHWZSFJMQQYJLMQXXLLDTTKHHYBFPWTYYSQQWNQWLGWDEBZWCMYGCULKJXTMXMYJSXHYBRWFYMWFRXYQMXYSZTZZTFYKMLDHQDXWYYNLCRYJBLPSXCXYWLSPRRJWXHQYPHTYDNXHHMMYWYTZCSQMTSSCCDALWZTCPQPYJLLQZYJSWXMZZMMYLMXCLMXCZMXMZSQTZPPQQBLPGXQZHFLJJHYTJSRXWZXSCCDLXTYJDCQJXSLQYCLZXLZZXMXQRJMHRHZJBHMFLJLMLCLQNLDXZLLLPYPSYJYSXCQQDCMQJZZXHNPNXZMEKMXHYKYQLXSXTXJYYHWDCWDZHQYYBGYBCYSCFGPSJNZDYZZJZXRZRQJJYMCANYRJTLDPPYZBSTJKXXZYPFDWFGZZRPYMTNGXZQBYXNBUFNQKRJQZMJEGRZGYCLKXZDSKKNSXKCLJSPJYYZLQQJYBZSSQLLLKJXTBKTYLCCDDBLSPPFYLGYDTZJYQGGKQTTFZXBDKTYYHYBBFYTYYBCLPDYTGDHRYRNJSPTCSNYJQHKLLLZSLYDXXWBCJQSPXBPJZJCJDZFFXXBRMLAZHCSNDLBJDSZBLPRZTSWSBXBCLLXXLZDJZSJPYLYXXYFTFFFBHJJXGBYXJPMMMPSSJZJMTLYZJXSWXTYLEDQPJMYGQZJGDJLQJWJQLLSJGJGYGMSCLJJXDTYGJQJQJCJZCJGDZZSXQGSJGGCXHQXSNQLZZBXHSGZXCXYLJXYXYYDFQQJHJFXDHCTXJYRXYSQTJXYEFYYSSYYJXNCYZXFXMSYSZXYYSCHSHXZZZGZZZGFJDLTYLNPZGYJYZYYQZPBXQBDZTZCZYXXYHHSQXSHDHGQHJHGYWSZTMZMLHYXGEBTYLZKQWYTJZRCLEKYSTDBCYKQQSAYXCJXWWGSBHJYZYDHCSJKQCXSWXFLTYNYZPZCCZJQTZWJQDZZZQZLJJXLSBHPYXXPSXSHHEZTXFPTLQYZZXHYTXNCFZYYHXGNXMYWXTZSJPTHHGYMXMXQZXTSBCZYJYXXTYYZYPCQLMMSZMJZZLLZXGXZAAJZYXJMZXWDXZSXZDZXLEYJJZQBHZWZZZQTZPSXZTDSXJJJZNYAZPHXYYSRNQDTHZHYYKYJHDZXZLSWCLYBZYECWCYCRYLCXNHZYDZYDYJDFRJJHTRSQTXYXJRJHOJYNXELXSFSFJZGHPZSXZSZDZCQZBYYKLSGSJHCZSHDGQGXYZGXCHXZJWYQWGYHKSSEQZZNDZFKWYSSTCLZSTSYMCDHJXXYWEYXCZAYDMPXMDSXYBSQMJMZJMTZQLPJYQZCGQHXJHHLXXHLHDLDJQCLDWBSXFZZYYSCHTYTYYBHECXHYKGJPXHHYZJFXHWHBDZFYZBCAPNPGNYDMSXHMMMMAMYNBYJTMPXYYMCTHJBZYFCGTYHWPHFTWZZEZSBZEGPFMTSKFTYCMHFLLHGPZJXZJGZJYXZSBBQSCZZLZCCSTPGXMJSFTCCZJZDJXCYBZLFCJSYZFGSZLYBCWZZBYZDZYPSWYJZXZBDSYUXLZZBZFYGCZXBZHZFTPBGZGEJBSTGKDMFHYZZJHZLLZZGJQZLSFDJSSCBZGPDLFZFZSZYZYZSYGCXSNXXCHCZXTZZLJFZGQSQYXZJQDCCZTQCDXZJYQJQCHXZTDLGSCXZSYQJQTZWLQDQZTQCHQQJZYEZZZPBWKDJFCJPZTYPQYQTTYNLMBDKTJZPQZQZZFPZSBNJLGYJDXJDZZKZGQKXDLPZJTCJDQBXDJQJSTCKNXBXZMSLYJCQMTJQWWCJQNJNLLLHJCWQTBZQYDZCZPZZDZYDDCYZZZCCJTTJFZDPRRTZTJDCQTQZDTJNPLZBCLLCTZSXKJZQZPZLBZRBTJDCXFCZDBCCJJLTQQPLDCGZDBBZJCQDCJWYNLLZYZCCDWLLXWZLXRXNTQQCZXKQLSGDFQTDDGLRLAJJTKUYMKQLLTZYTDYYCZGJWYXDXFRSKSTQTENQMRKQZHHQKDLDAZFKYPBGGPZREBZZYKZZSPEGJXGYKQZZZSLYSYYYZWFQZYLZZLZHWCHKYPQGNPGBLPLRRJYXCCSYYHSFZFYBZYYTGZXYLXCZWXXZJZBLFFLGSKHYJZEYJHLPLLLLCZGXDRZELRHGKLZZYHZLYQSZZJZQLJZFLNBHGWLCZCFJYSPYXZLZLXGCCPZBLLCYBBBBUBBCBPCRNNZCZYRBFSRLDCGQYYQXYGMQZWTZYTYJXYFWTEHZZJYWLCCNTZYJJZDEDPZDZTSYQJHDYMBJNYJZLXTSSTPHNDJXXBYXQTZQDDTJTDYYTGWSCSZQFLSHLGLBCZPHDLYZJYCKWTYTYLBNYTSDSYCCTYSZYYEBHEXHQDTWNYGYCLXTSZYSTQMYGZAZCCSZZDSLZCLZRQXYYELJSBYMXSXZTEMBBLLYYLLYTDQYSHYMRQWKFKBFXNXSBYCHXBWJYHTQBPBSBWDZYLKGZSKYHXQZJXHXJXGNLJKZLYYCDXLFYFGHLJGJYBXQLYBXQPQGZTZPLNCYPXDJYQYDYMRBESJYYHKXXSTMXRCZZYWXYQYBMCLLYZHQYZWQXDBXBZWZMSLPDMYSKFMZKLZCYQYCZLQXFZZYDQZPZYGYJYZMZXDZFYFYTTQTZHGSPCZMLCCYTZXJCYTJMKSLPZHYSNZLLYTPZCTZZCKTXDHXXTQCYFKSMQCCYYAZHTJPCYLZLYJBJXTPNYLJYYNRXSYLMMNXJSMYBCSYSYLZYLXJJQYLDZLPQBFZZBLFNDXQKCZFYWHGQMRDSXYCYTXNQQJZYYPFZXDYZFPRXEJDGYQBXRCNFYYQPGHYJDYZXGRHTKYLNWDZNTSMPKLBTHBPYSZBZTJZSZZJTYYXZPHSSZZBZCZPTQFZMYFLYPYBBJQXZMXXDJMTSYSKKBJZXHJCKLPSMKYJZCXTMLJYXRZZQSLXXQPYZXMKYXXXJCLJPRMYYGADYSKQLSNDHYZKQXZYZTCGHZTLMLWZYBWSYCTBHJHJFCWZTXWYTKZLXQSHLYJZJXTMPLPYCGLTBZZTLZJCYJGDTCLKLPLLQPJMZPAPXYZLKKTKDZCZZBNZDYDYQZJYJGMCTXLTGXSZLMLHBGLKFWNWZHDXUHLFMKYSLGXDTWWFRJEJZTZHYDXYKSHWFZCQSHKTMQQHTZHYMJDJSKHXZJZBZZXYMPAGQMSTPXLSKLZYNWRTSQLSZBPSPSGZWYHTLKSSSWHZZLYYTNXJGMJSZSUFWNLSOZTXGXLSAMMLBWLDSZYLAKQCQCTMYCFJBSLXCLZZCLXXKSBZQCLHJPSQPLSXXCKSLNHPSFQQYTXYJZLQLDXZQJZDYYDJNZPTUZDSKJFSLJHYLZSQZLBTXYDGTQFDBYAZXDZHZJNHHQBYKNXJJQCZMLLJZKSPLDYCLBBLXKLELXJLBQYCXJXGCNLCQPLZLZYJTZLJGYZDZPLTQCSXFDMNYCXGBTJDCZNBGBQYQJWGKFHTNPYQZQGBKPBBYZMTJDYTBLSQMPSXTBNPDXKLEMYYCJYNZCTLDYKZZXDDXHQSHDGMZSJYCCTAYRZLPYLTLKXSLZCGGEXCLFXLKJRTLQJAQZNCMBYDKKCXGLCZJZXJHPTDJJMZQYKQSECQZDSHHADMLZFMMZBGNTJNNLGBYJBRBTMLBYJDZXLCJLPLDLPCQDHLXZLYCBLCXZZJADJLNZMMSSSMYBHBSQKBHRSXXJMXSDZNZPXLGBRHWGGFCXGMSKLLTSJYYCQLTSKYWYYHYWXBXQYWPYWYKQLSQPTNTKHQCWDQKTWPXXHCPTHTWUMSSYHBWCRWXHJMKMZNGWTMLKFGHKJYLSYYCXWHYECLQHKQHTTQKHFZLDXQWYZYYDESBPKYRZPJFYYZJCEQDZZDLATZBBFJLLCXDLMJSSXEGYGSJQXCWBXSSZPDYZCXDNYXPPZYDLYJCZPLTXLSXYZYRXCYYYDYLWWNZSAHJSYQYHGYWWAXTJZDAXYSRLTDPSSYYFNEJDXYZHLXLLLZQZSJNYQYQQXYJGHZGZCYJCHZLYCDSHWSHJZYJXCLLNXZJJYYXNFXMWFPYLCYLLABWDDHWDXJMCXZTZPMLQZHSFHZYNZTLLDYWLSLXHYMMYLMBWWKYXYADTXYLLDJPYBPWUXJMWMLLSAFDLLYFLBHHHBQQLTZJCQJLDJTFFKMMMBYTHYGDCQRDDWRQJXNBYSNWZDBYYTBJHPYBYTTJXAAHGQDQTMYSTQXKBTZPKJLZRBEQQSSMJJBDJOTGTBXPGBKTLHQXJJJCTHXQDWJLWRFWQGWSHCKRYSWGFTGYGBXSDWDWRFHWYTJJXXXJYZYSLPYYYPAYXHYDQKXSHXYXGSKQHYWFDDDPPLCJLQQEEWXKSYYKDYPLTJTHKJLTCYYHHJTTPLTZZCDLTHQKZXQYSTEEYWYYZYXXYYSTTJKLLPZMCYHQGXYHSRMBXPLLNQYDQHXSXXWGDQBSHYLLPJJJTHYJKYPPTHYYKTYEZYENMDSHLCRPQFDGFXZPSFTLJXXJBSWYYSKSFLXLPPLBBBLBSFXFYZBSJSSYLPBBFFFFSSCJDSTZSXZRYYSYFFSYZYZBJTBCTSBSDHRTJJBYTCXYJEYLXCBNEBJDSYXYKGSJZBXBYTFZWGENYHHTHZHHXFWGCSTBGXKLSXYWMTMBYXJSTZSCDYQRCYTWXZFHMYMCXLZNSDJTTTXRYCFYJSBSDYERXJLJXBBDEYNJGHXGCKGSCYMBLXJMSZNSKGXFBNBPTHFJAAFXYXFPXMYPQDTZCXZZPXRSYWZDLYBBKTYQPQJPZYPZJZNJPZJLZZFYSBTTSLMPTZRTDXQSJEHBZYLZDHLJSQMLHTXTJECXSLZZSPKTLZKQQYFSYGYWPCPQFHQHYTQXZKRSGTTSQCZLPTXCDYYZXSQZSLXLZMYCPCQBZYXHBSXLZDLTCDXTYLZJYYZPZYZLTXJSJXHLPMYTXCQRBLZSSFJZZTNJYTXMYJHLHPPLCYXQJQQKZZSCPZKSWALQSBLCCZJSXGWWWYGYKTJBBZTDKHXHKGTGPBKQYSLPXPJCKBMLLXDZSTBKLGGQKQLSBKKTFXRMDKBFTPZFRTBBRFERQGXYJPZSSTLBZTPSZQZSJDHLJQLZBPMSMMSXLQQNHKNBLRDDNXXDHDDJCYYGYLXGZLXSYGMQQGKHBPMXYXLYTQWLWGCPBMQXCYZYDRJBHTDJYHQSHTMJSBYPLWHLZFFNYPMHXXHPLTBQPFBJWQDBYGPNZTPFZJGSDDTQSHZEAWZZYLLTYYBWJKXXGHLFKXDJTMSZSQYNZGGSWQSPHTLSSKMCLZXYSZQZXNCJDQGZDLFNYKLJCJLLZLMZZNHYDSSHTHZZLZZBBHQZWWYCRZHLYQQJBEYFXXXWHSRXWQHWPSLMSSKZTTYGYQQWRSLALHMJTQJSMXQBJJZJXZYZKXBYQXBJXSHZTSFJLXMXZXFGHKZSZGGYLCLSARJYHSLLLMZXELGLXYDJYTLFBHBPNLYZFBBHPTGJKWETZHKJJXZXXGLLJLSTGSHJJYQLQZFKCGNNDJSSZFDBCTWWSEQFHQJBSAQTGYPQLBXBMMYWXGSLZHGLZGQYFLZBYFZJFRYSFMBYZHQGFWZSYFYJJPHZBYYZFFWODGRLMFTWLBZGYCQXCDJYGZYYYYTYTYDWEGAZYHXJLZYYHLRMGRXXZCLHNELJJTJTPWJYBJJBXJJTJTEEKHWSLJPLPSFYZPQQBDLQJJTYYQLYZKDKSQJYYQZLDQTGJQYZJSUCMRYQTHTEJMFCTYHYPKMHYZWJDQFHYYXWSHCTXRLJHQXHCCYYYJLTKTTYTMXGTCJTZAYYOCZLYLBSZYWJYTSJYHBYSHFJLYGJXXTMZYYLTXXYPZLXYJZYZYYPNHMYMDYYLBLHLSYYQQLLNJJYMSOYQBZGDLYXYLCQYXTSZEGXHZGLHWBLJHEYXTWQMAKBPQCGYSHHEGQCMWYYWLJYJHYYZLLJJYLHZYHMGSLJLJXCJJYCLYCJPCPZJZJMMYLCQLNQLJQJSXYJMLSZLJQLYCMMHCFMMFPQQMFYLQMCFFQMMMMHMZNFHHJGTTHHKHSLNCHHYQDXTMMQDCYZYXYQMYQYLTDCYYYZAZZCYMZYDLZFFFMMYCQZWZZMABTBYZTDMNZZGGDFTYPCGQYTTSSFFWFDTZQSSYSTWXJHXYTSXXYLBYQHWWKXHZXWZNNZZJZJJQJCCCHYYXBZXZCYZTLLCQXYNJYCYYCYNZZQYYYEWYCZDCJYCCHYJLBTZYYCQWMPWPYMLGKDLDLGKQQBGYCHJXY";
			//此处收录了375个多音字,
			var oMultiDiff = {
				"19969": "DZ",
				"19975": "WM",
				"19988": "QJ",
				"20048": "YL",
				"20056": "SC",
				"20060": "NM",
				"20094": "QG",
				"20127": "QJ",
				"20167": "QC",
				"20193": "YG",
				"20250": "KH",
				"20256": "ZC",
				"20282": "SC",
				"20285": "QJG",
				"20291": "TD",
				"20314": "YD",
				"20340": "NE",
				"20375": "TD",
				"20389": "YJ",
				"20391": "CZ",
				"20415": "PB",
				"20446": "YS",
				"20447": "SQ",
				"20504": "TC",
				"20608": "KG",
				"20857": "ZC",
				"20911": "PF",
				"20854": "QJ",
				"20985": "AW",
				"21032": "PB",
				"21048": "XQ",
				"21049": "SC",
				"21089": "YS",
				"21119": "JC",
				"21242": "SB",
				"21273": "SC",
				"21305": "YP",
				"21306": "QO",
				"21330": "ZC",
				"21333": "SDC",
				"21345": "QK",
				"21378": "CA",
				"21397": "SC",
				"21414": "XS",
				"21442": "SC",
				"21477": "JG",
				"21480": "TD",
				"21484": "ZS",
				"21494": "YX",
				"21505": "YX",
				"21512": "HG",
				"21523": "XH",
				"21537": "PB",
				"21542": "PF",
				"21549": "KH",
				"21571": "E",
				"21574": "DA",
				"21588": "TD",
				"21589": "O",
				"21618": "ZC",
				"21621": "KHA",
				"21632": "ZJ",
				"21654": "KG",
				"21679": "LKG",
				"21683": "KH",
				"21710": "A",
				"21719": "YH",
				"21734": "WOE",
				"21769": "A",
				"21780": "WN",
				"21804": "XH",
				"21834": "A",
				"21899": "ZD",
				"21903": "RN",
				"21908": "WO",
				"21939": "ZC",
				"21956": "SA",
				"21964": "YA",
				"21970": "TD",
				"22003": "A",
				"22031": "JG",
				"22040": "XS",
				"22060": "ZC",
				"22066": "ZC",
				"22079": "MH",
				"22129": "XJ",
				"22179": "XA",
				"22237": "NJ",
				"22244": "TD",
				"22280": "JQ",
				"22300": "YH",
				"22313": "XW",
				"22331": "YQ",
				"22343": "YJ",
				"22351": "PH",
				"22395": "DC",
				"22412": "TD",
				"22484": "PB",
				"22500": "PB",
				"22534": "ZD",
				"22549": "DH",
				"22561": "PB",
				"22612": "TD",
				"22771": "KQ",
				"22831": "HB",
				"22841": "JG",
				"22855": "QJ",
				"22865": "XQ",
				"23013": "ML",
				"23081": "WM",
				"23487": "SX",
				"23558": "QJ",
				"23561": "YW",
				"23586": "YW",
				"23614": "YW",
				"23615": "SN",
				"23631": "PB",
				"23646": "ZS",
				"23663": "ZT",
				"23673": "YG",
				"23762": "TD",
				"23769": "ZS",
				"23780": "QJ",
				"23884": "QK",
				"24055": "XH",
				"24113": "DC",
				"24162": "ZC",
				"24191": "GA",
				"24273": "QJ",
				"24324": "NL",
				"24377": "TD",
				"24378": "QJ",
				"24439": "PF",
				"24554": "ZS",
				"24683": "TD",
				"24694": "WE",
				"24733": "LK",
				"24925": "TN",
				"25094": "ZG",
				"25100": "XQ",
				"25103": "XH",
				"25153": "PB",
				"25170": "PB",
				"25179": "KG",
				"25203": "PB",
				"25240": "ZS",
				"25282": "FB",
				"25303": "NA",
				"25324": "KG",
				"25341": "ZY",
				"25373": "WZ",
				"25375": "XJ",
				"25384": "A",
				"25457": "A",
				"25528": "SD",
				"25530": "SC",
				"25552": "TD",
				"25774": "ZC",
				"25874": "ZC",
				"26044": "YW",
				"26080": "WM",
				"26292": "PB",
				"26333": "PB",
				"26355": "ZY",
				"26366": "CZ",
				"26397": "ZC",
				"26399": "QJ",
				"26415": "ZS",
				"26451": "SB",
				"26526": "ZC",
				"26552": "JG",
				"26561": "TD",
				"26588": "JG",
				"26597": "CZ",
				"26629": "ZS",
				"26638": "YL",
				"26646": "XQ",
				"26653": "KG",
				"26657": "XJ",
				"26727": "HG",
				"26894": "ZC",
				"26937": "ZS",
				"26946": "ZC",
				"26999": "KJ",
				"27099": "KJ",
				"27449": "YQ",
				"27481": "XS",
				"27542": "ZS",
				"27663": "ZS",
				"27748": "TS",
				"27784": "SC",
				"27788": "ZD",
				"27795": "TD",
				"27812": "O",
				"27850": "PB",
				"27852": "MB",
				"27895": "SL",
				"27898": "PL",
				"27973": "QJ",
				"27981": "KH",
				"27986": "HX",
				"27994": "XJ",
				"28044": "YC",
				"28065": "WG",
				"28177": "SM",
				"28267": "QJ",
				"28291": "KH",
				"28337": "ZQ",
				"28463": "TL",
				"28548": "DC",
				"28601": "TD",
				"28689": "PB",
				"28805": "JG",
				"28820": "QG",
				"28846": "PB",
				"28952": "TD",
				"28975": "ZC",
				"29100": "A",
				"29325": "QJ",
				"29575": "SL",
				"29602": "FB",
				"30010": "TD",
				"30044": "CX",
				"30058": "PF",
				"30091": "YSP",
				"30111": "YN",
				"30229": "XJ",
				"30427": "SC",
				"30465": "SX",
				"30631": "YQ",
				"30655": "QJ",
				"30684": "QJG",
				"30707": "SD",
				"30729": "XH",
				"30796": "LG",
				"30917": "PB",
				"31074": "NM",
				"31085": "JZ",
				"31109": "SC",
				"31181": "ZC",
				"31192": "MLB",
				"31293": "JQ",
				"31400": "YX",
				"31584": "YJ",
				"31896": "ZN",
				"31909": "ZY",
				"31995": "XJ",
				"32321": "PF",
				"32327": "ZY",
				"32418": "HG",
				"32420": "XQ",
				"32421": "HG",
				"32438": "LG",
				"32473": "GJ",
				"32488": "TD",
				"32521": "QJ",
				"32527": "PB",
				"32562": "ZSQ",
				"32564": "JZ",
				"32735": "ZD",
				"32793": "PB",
				"33071": "PF",
				"33098": "XL",
				"33100": "YA",
				"33152": "PB",
				"33261": "CX",
				"33324": "BP",
				"33333": "TD",
				"33406": "YA",
				"33426": "WM",
				"33432": "PB",
				"33445": "JG",
				"33486": "ZN",
				"33493": "TS",
				"33507": "QJ",
				"33540": "QJ",
				"33544": "ZC",
				"33564": "XQ",
				"33617": "YT",
				"33632": "QJ",
				"33636": "XH",
				"33637": "YX",
				"33694": "WG",
				"33705": "PF",
				"33728": "YW",
				"33882": "SR",
				"34067": "WM",
				"34074": "YW",
				"34121": "QJ",
				"34255": "ZC",
				"34259": "XL",
				"34425": "JH",
				"34430": "XH",
				"34485": "KH",
				"34503": "YS",
				"34532": "HG",
				"34552": "XS",
				"34558": "YE",
				"34593": "ZL",
				"34660": "YQ",
				"34892": "XH",
				"34928": "SC",
				"34999": "QJ",
				"35048": "PB",
				"35059": "SC",
				"35098": "ZC",
				"35203": "TQ",
				"35265": "JX",
				"35299": "JX",
				"35782": "SZ",
				"35828": "YS",
				"35830": "E",
				"35843": "TD",
				"35895": "YG",
				"35977": "MH",
				"36158": "JG",
				"36228": "QJ",
				"36426": "XQ",
				"36466": "DC",
				"36710": "JC",
				"36711": "ZYG",
				"36767": "PB",
				"36866": "SK",
				"36951": "YW",
				"37034": "YX",
				"37063": "XH",
				"37218": "ZC",
				"37325": "ZC",
				"38063": "PB",
				"38079": "TD",
				"38085": "QY",
				"38107": "DC",
				"38116": "TD",
				"38123": "YD",
				"38224": "HG",
				"38241": "XTC",
				"38271": "ZC",
				"38415": "YE",
				"38426": "KH",
				"38461": "YD",
				"38463": "AE",
				"38466": "PB",
				"38477": "XJ",
				"38518": "YT",
				"38551": "WK",
				"38585": "ZC",
				"38704": "XS",
				"38739": "LJ",
				"38761": "GJ",
				"38808": "SQ",
				"39048": "JG",
				"39049": "XJ",
				"39052": "HG",
				"39076": "CZ",
				"39271": "XT",
				"39534": "TD",
				"39552": "TD",
				"39584": "PB",
				"39647": "SB",
				"39730": "LG",
				"39748": "TPB",
				"40109": "ZQ",
				"40479": "ND",
				"40516": "HG",
				"40536": "HG",
				"40583": "QJ",
				"40765": "YQ",
				"40784": "QJ",
				"40840": "YK",
				"40863": "QJG"
			}; /* 多音字 */
			var type = type ? type : "";

			function checkCh(ch) {
				var uni = ch.charCodeAt(0);
				//如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数  
				if(uni > 40869 || uni < 19968)
					return ch; //dealWithOthers(ch);  
				//检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母  
				return(oMultiDiff[uni] ? oMultiDiff[uni] : (strChineseFirstPY.charAt(uni - 19968)));
			};

			function mkRslt(arr) {
				var arrRslt = [""];
				for(var i = 0, len = arr.length; i < len; i++) {
					var str = arr[i];
					var strlen = str.length;
					if(strlen == 1) {
						for(var k = 0; k < arrRslt.length; k++) {
							arrRslt[k] += str;
						}
					} else {
						var tmpArr = arrRslt.slice(0);
						arrRslt = [];
						for(k = 0; k < strlen; k++) {
							//复制一个相同的arrRslt  
							var tmp = tmpArr.slice(0);
							//把当前字符str[k]添加到每个元素末尾  
							for(var j = 0; j < tmp.length; j++) {
								tmp[j] += str.charAt(k);
							}
							//把复制并修改后的数组连接到arrRslt上  
							arrRslt = arrRslt.concat(tmp);
						}
					}
				}
				return arrRslt;
			};
			if(typeof(str) != "string") {
				console.log('函数makePy需要字符串类型参数!');
				var n = new Array();
				n.push("#");
				return n;
			}
			var arrResult = new Array(); //保存中间结果的数组  
			if(type != "" && type != undefined) {
				for(var i = 0, len = str.length; i < len; i++) {
					//获得unicode码  
					var ch = str.charAt(i);
					//检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理  
					arrResult.push(checkCh(ch));
				}
			} else {
				var ch = str.charAt(0);
				if(!isNaN(Number(ch))) {
					var n = new Array();
					n.push("#");
					return n;
				}
				arrResult.push(checkCh(ch));
			}
			//处理arrResult,返回所有可能的拼音首字母串数组  
			return mkRslt(arrResult);
		},
		//校验密码
		CheckPassword: function(str) {
			var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
			if(reg.test(str)) {
				return true;
			}
			return false;
		},
		//发送短信
		SendMessage: function(para) {
			var phone = para && para.phone ? para.phone : "";
			var content = para && para.content ? para.content : "";

			function send() {
				var msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
				msg.to = [phone];
				msg.body = content;
				plus.messaging.sendMessage(msg, function() {
					if(para.callbackSuccess && typeof(para.callbackSuccess) == 'function') {
						para.callbackSuccess();
					}
				}, function() {
					if(para.callbackFailed && typeof(para.callbackFailed) == 'function') {
						para.callbackFailed();
					}
				});
			}
			if(window.plus) {
				send();
			} else {
				document.addEventListener("plusready", send, false);
			}
		},
		//生成32位的Guid字符串
		GetGuid: function() {
			var guid = "";
			for(var i = 1; i <= 32; i++) {
				var n = Math.floor(Math.random() * 16.0).toString(16);
				guid += n;
				if((i == 8) || (i == 12) || (i == 16) || (i == 20))
					guid += "-";
			}
			return guid;
		},
		//下拉刷新
		Pagerefresh: function(para) {
			// H5 plus事件处理
			function plusReady() {
				var types = {};
				types[plus.networkinfo.CONNECTION_UNKNOW] = "Unknown connection";
				types[plus.networkinfo.CONNECTION_NONE] = "网络不给力,请稍后再试";
				types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
				types[plus.networkinfo.CONNECTION_WIFI] = "WiFi连接";
				types[plus.networkinfo.CONNECTION_CELL2G] = "2G网络";
				types[plus.networkinfo.CONNECTION_CELL3G] = "3G网络";
				types[plus.networkinfo.CONNECTION_CELL4G] = "4G网络";
				var type = types[plus.networkinfo.getCurrentType()];
				if(type != "网络不给力,请稍后再试") {
					var refreshFun = (para && para.refreshFun) ? para.refreshFun : "";
					if(typeof(refreshFun) == "function") {
						$(".noNetWork").remove();
						refreshFun();
					}
				} else {
					$(".noNetWork").remove();
					var Netdiv = $("<div class='noNetWork'>");
					var Netimg = $("<span class='imgnoNetWork'>");
					var Netcontent = $("<span>");
					Netcontent.text("网络连接失败，请检查网络");
					Netdiv.append(Netimg);
					Netdiv.append(Netcontent);
					$("body").append(Netdiv);
					$('.noNetWork').delay(2000).hide(0);
				}
			}
			//下拉刷新
			$(document).on('refresh', '.pull-to-refresh-content', function(e) {
				setTimeout(function() {
					if(window.plus) {
						plusReady();
					}
					$.pullToRefreshDone('.pull-to-refresh-content');
				}, 1000);
			});
		},
		//发送短信验证码
		SendCode: function(Mobile, Callback) {
			var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
			var code = "";
			for(var i = 0; i < 5; i++) {
				var id = Math.ceil(Math.random() * 9);
				code += chars[id];
			}
			var data = $.toJSON({
				mobilePhone: Mobile,
				code: code
			});
			$.ibo.crossOrgin({
				url: $.ibo.PublicUserSrvUrl,
				funcName: "SendVerificationCode",
				data: data,
				success: function(obj) {
					if($.ibo.ResFlag.Success == obj.ResFlag) {
						mui.toast("短信发送成功！");
					} else {
						mui.alert(obj.ResObj);
					}
					if(typeof Callback == 'function') {
						Callback(code);
					}
				},
				error: function() {
					mui.toast("网络超时，请稍后再试。");
					if(typeof Callback == 'function') {
						Callback(code);
					}
				}
			});
		},
		//获取人员信息
		GetEmployeeInfo: function(Callback) {
			$.ibo.crossOrgin({
				url: $.ibo.CompanyBaseSrvUrl,
				funcName: "GetUserEmployee",
				data: null,
				success: function(obj) {
					if($.ibo.ResFlag.Success == obj.ResFlag) {
						if(obj.ResObj) {
							if(typeof Callback == "function") {
								Callback(obj.ResObj);
							}
						}
					} else {
						mui.alert(obj.ResObj);
					}
				},
				error: function() {
					mui.toast("网络超时，请稍后再试。");
					if(typeof Callback == 'function') {
						Callback();
					}
				}
			});
		},
		//校验拍照权限
		checkCamera: function() {
			var isUse = true;
			if(plus.os.name == "iOS") {
				var pp = plus.navigator.checkPermission('CAMERA');
				if(pp == "denied") {
					isUse = false;
				}
			} else if(plus.os.name == "Android") {
				try {
					var Camera = plus.android.importClass("android.hardware.Camera");
					var mCamera = Camera.open();
					var mParameters = mCamera.getParameters();
					var setParameters = mCamera.setParameters(mParameters);
					var release = mCamera.release();
				} catch(e) {
					isUse = false;
				}
			}
			return isUse;
		},
		//校验相册权限
		checkGallery: function() {
			var isUse = true;
			if(plus.os.name == "iOS") {
				var pp = plus.navigator.checkPermission('GALLERY');
				if(pp == "denied") {
					isUse = false;
				}
			}
			return isUse;
		}
	});
});