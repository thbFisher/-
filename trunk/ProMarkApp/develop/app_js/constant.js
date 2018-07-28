define(function(require, exports, module){
	var outTime = 20000; //超时时间,默认20秒超时
	var cacheTime = 1 * 1000;
	var isWeixin = false;

	var shortcut = 'azc2';
	var _api_key = '2493457a5d9285d0a6ac8ea86db16c21';

	// 是否调试模式， 如果为false ，则window.console里的方法会变成空方法，则不会在浏览器上做调试输出
	var isDebug = false;
	if (!isDebug) {
		var methods = [ "log", "debug", "warn", "info", "time", "timeEnd" ];
		for (var i = 0; i < methods.length; i++) {
			console[methods[i]] = function() {
			};
		}
	}

	// 桌面端的 配置配置信息（serverURL： 访问的服务器地址 secretKey： 密钥
	// var serverURL = "http://192.168.13.186:8080/ProMark/client/";
	// var serverURL = 'http://115.159.207.172:8979/ProMark/client/';
	// var serverURL = 'https://www.apphzs.cn/ProMark/client/';
	var serverURL = 'http://47.100.126.72/ProMark/client/';
	//正式服务器
	// var serverURL = "";

	var secretKey = '13061723b289d370fe35184a4928cb8a';
	var clientAppName = 'proMarkApp';
	var globalApiMode = 'remote';
	var appVersion = '0.0.1';
	var wx_server ='http://wxdeveloper2.talkyun.com.cn/luanchuanAdmin/';

	//for weixin
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger'){//如果是微信
		isWeixin=true;
		serverURL ='/luanchuanAdmin/client/';
	}

	return {
		shortcut:shortcut,
		_api_key:_api_key,
		appVersion:appVersion,
		outTime:outTime,
		cacheTime : cacheTime,
		serverURL:serverURL,
		wx_server:wx_server,
		secretKey:secretKey,
		clientAppName:clientAppName,
		globalApiMode : globalApiMode,
		isWeixin:isWeixin
	};

});