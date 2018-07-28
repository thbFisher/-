/**
*   基础页面定义
**/

define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	require('touch');
	require('jquery-weui');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/graphic_marketing/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');
	var GetShare = require('view/get-share');

	var View = SlidePage.extend({
		events: {
			"tap .shareBtn": "share" ,
			"tap .toQQ": "qqShare" ,
			"tap .toWechat": "wechatShare"
		},
		qqShare: function(){
			var args = {};
			args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
			args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
			args.title = '这个是 Cordova QQ 图片分享的标题';
			args.description = '这个是 Cordova QQ 图片分享的描述';
			args.image = this.realImgUrl;
			QQSDK.shareImage(function () {
			alert('shareImage success');
			}, function (failReason) {
			alert(failReason);
			}, args);
					},
		wechatShare: function(){
			Wechat.share({
				message: {
					title: "Hi, there",
					description: "This is description.",
					thumb: this.realImgUrl,
					mediaTagName: "TEST-TAG-001",
					messageExt: "这是第三方带的测试字段",
					messageAction: "<action>dotalist</action>",
					media: "来自Samsung Glaxy S8+"
				},
				scene: Wechat.Scene.TIMELINE   // share to Timeline
			}, function () {
				alert("Success");
			}, function (reason) {
				alert("Failed: " + reason);
			});
		},
		share: function () {
			if(this.realImgUrl){
				var view = new GetShare({
					question: {
						type:"graphic-maketing-pic" ,
						url :this.orangeUrl
					}
				});
				window.pageType = "graphic-maketing-pic"
				view.show();
			}else{
				$.jtoast("图片不存在");
			}
			//http://47.100.126.72/ProMark/ImageAction/aHR0cDovLzQ3LjEwMC4xMjYuNzIvUHJvTWFyay9obnd4aW1nL21hcmsvZ3JhcGhpYy9jb3Zlci8yMDE4LTA1LTA3L2Q4NjcyZTU0LWQyMGYtNGMxMi1iYjQzLWM1N2Q5YTFmMmNmOC5wbmc=/120/scale.do
			// app_img/paper.jpg
			// window.plugins.socialsharing.share(null, null, "https://www.baidu.com/img/bdlogo.gif", null) ;//测试通过
			// window.plugins.socialsharing.share(null, null, "http://117.78.33.165:8080/stategrid/page/images/login_bg3.jpg", null) ;
		},
		decodeBase64: function (input) {
			var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while (i < input.length) {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = this._utf8_decode(output);
			return output;
		},
		_utf8_decode: function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while (i < utftext.length) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		},
		initialize: function (options) {
			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: "图文详情"
			});
			var url = options.imgUrl ;
			this.orangeUrl = url ;
			var startIndex = url.indexOf("/ImageAction") + 13;
			var endIndex = url.indexOf("/" ,startIndex) ;
			// var regArr = this.imgUrl.match(/ImageAction\/(\S*)\//);//字符串后面会把  /120也带上
			var base64Url = url.substring(startIndex ,endIndex) ;
			if(base64Url){
				var imgUrl = this.decodeBase64(base64Url);
				this.imgUrl = url;
				this.realImgUrl = imgUrl ;
				this.$el.empty().append(this.header.$el).append(template);
				var htmlStr = '<img src="' + imgUrl + '" alt="">';
				this.$("#graphic_marketing_detail .imgcontent>img").attr("src", imgUrl);
			}else{
				$.jtoast("图片不存在");
			}
		},
		render: function () {
			return this;
		}
	});

	return View;
});
