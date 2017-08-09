/**********
requirejs通用配置
**********/

requirejs.config({
	"baseUrl": "../..",
	// 路径别名映射
	"paths": {
		"jq": "js/jquery-3.1.1.min", // jquery-3.1.1.min jq
		"json": "js/jquery.json-2.2", // jquery.json-2.2 jq json数据处理扩展
		"cropper":"js/cropper.min",
		"md5": "js/md5", // md5加密处理
		"css": "js/css", // css.js requirejs引用css样式文件扩展
		"cssfile": "css", // cssfile css样式文件根目录地址
		"viewsfile": "css/views", // viewsfile 页面对应独有css样式文件根目录地址
		"common": "js/common/common", // common.js 公用处理js库
		"crossorgin": "js/crossorgin", // 自定义跨域调用封装
		"appcommon": "js/common/app-common", //app公共方法
		"async": "js/async", //异步加载地图
		"amapwebapi": "https://webapi.amap.com/maps?v=1.3&key=f62345015dbde265c2c3689aee4b62c2&callback=init", //高德地图Api
		"highcharts": "js/highcharts", //图表js库
		"swiper": "js/swiper.min",
		"zoom": "js/mui.zoom",
		"share": "js/common/share", //分享功能
		"lazyload": "js/jquery.lazyload.min", //图片延迟加载
		"mui": "js/mui.min",
		"muipicker": "js/mui.picker.min",
		"muiImage": "js/mui.previewimage",
		"nativeUI": "js/common/nativeUI",
		"immersed": "js/common/immersed",
		"appevent": "js/common/appevent",
		"update": "js/common/update",
		"imgReady": "js/common/imgReady",
		"nativeMethod": "js/common/nativeMethod",
		"base-common": "js/common/base-common",
		"muipullToRefresh": "js/mui.pullToRefresh",
		"muipullToRefreshmaterial": "js/mui.pullToRefresh.material",
		"city-data":"js/city.data.min",
		"storageData":"js/common/storageData",
		"userInfo": "js/common/userInfo",
		"exif":"js/exif",
		"vue":"js/vue"
	},
	// 文件依赖
	"shim": {
		"highcharts": ["jq"],
		"swiper": ["css!cssfile/swiper.min.css"],
		"zoom": ["mui"],
		"share": ["mui", "jq"],
		"userInfo": ["crossorgin"],
		"lazyload": ["jq"],
		"muipicker": ["mui", "css!cssfile/mui.picker.min.css"],
		"muiImage": ["zoom", "css!cssfile/mui.min.css"],
		"muipullToRefresh": ["mui"],
		"muipullToRefreshmaterial": ["muipullToRefresh"],
	},
	//等待时间
	"waitSeconds": 0
});