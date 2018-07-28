/**
*   首页
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
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/tpl/index.html');
	var AppHeader = require('view/app-header');
	var AppMenu = require('view/app-menu');
	var BannerDetail = require('view/banner-detail');
    var ExpectingView = require('view/expecting');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .new-view': 'viewNews',
			'tap .work-view': 'viewWork' ,
			'tap .applacationItem' : 'viewAppliCation' ,
			'tap .showSeeNext': "showSeeNext", 
			"tap .icon-unread-notice": "toChatRoom" ,
			"tap .myThings": "mythings" ,
			"tap .workLink": "workLink" ,
			"tap .showSeeNext.toLink": "linkToOther"
		},
		linkToOther: function(e){
			var link = $(e.currentTarget).data('link');
			window._pageHistory = "index" ;
            Backbone.history.navigate(link, { trigger: true });
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
		workLink: function(e){
			var link = $(e.currentTarget).data('link');
			window._pageHistory = "index" ;
            Backbone.history.navigate(link, { trigger: true });
		},
		mythings: function(){
			$.jtoast("敬请期待");
		},
		toChatRoom: function(e){
			var link = "chatroom-list" ;
			Backbone.history.navigate(link, { trigger: true });
		},
		showSeeNext: function(e){
			 // $.jtoast('敬请期待');
			 var title = $(e.currentTarget).data('title');
			 var view = new ExpectingView({
				 title: title
			 });
			 view.show();

			 return;
		},
		viewAppliCation: function(e){
			var link = $(e.currentTarget).data("link");
			if (!link) {
                // $.jtoast('敬请期待');
                var title = $(e.currentTarget).data('title');
                var view = new ExpectingView({
                    title: title
                });
                view.show();
                return;
			}
			window._pageHistory = "index" ;
            Backbone.history.navigate(link, { trigger: true });
		},
		viewWork: function(){
			Backbone.history.navigate('online-marketing-index/index', { trigger: true });
		},
		viewNews: function (e) {
			var type = $(e.currentTarget).data('type');
			Backbone.history.navigate('news-index/' + type, { trigger: true });
		},
		getIndex: function () {
			this.userTemplate = this.$('#indexPersonUserInfo').html();
			this.indexUnreadNewsTemplate = this.$('#indexUnreadNews').html();
			businessDelegate.getUserInfo(_.bind(function (data) {
				var startIndex = data.obj.headImgUrl.indexOf("/ImageAction") + 13;
				var endIndex = data.obj.headImgUrl.indexOf("/" ,startIndex) ;
				var base64Url = data.obj.headImgUrl.substring(startIndex ,endIndex) ;
				var afterParseImg = this.decodeBase64(base64Url) ;
				window.user.afterParseImg = afterParseImg ;
				var tpl = _.template(this.userTemplate)({data: data.obj});
				this.$(".index-banner .swiper-wrapper .person-info").empty();
				this.$(".index-banner .swiper-wrapper .person-info").html(tpl);
				// callback();
			}, this), _.bind(function (err) {
				// callback();
			}, this));
			businessDelegate.getWaitStatistics(_.bind(function (data) {
				var tpl = _.template(this.indexUnreadNewsTemplate)({data: data.obj});
				this.$(".index-banner .swiper-wrapper .un-read-news").empty();
				this.$(".index-banner .swiper-wrapper .un-read-news").html(tpl);
				// callback();
			}, this), _.bind(function (err) {
				// callback();
			}, this));
			// var _w = $(window).width();

			// $.showLoading();
			// businessDelegate.getBannerList({
			// 	maxWidth: _w
			// }, _.bind(function (data) {
			// 	$.hideLoading();
			// 	this.renderIndex(data.obj);
			// }, this), _.bind(function (err) {
			// 	$.hideLoading();
			// 	$.jtoast(err);
			// }, this));
		},
		renderIndex: function (data) {
			var str = '';
			// _.each(data.bannerList, function (v) {
			// 	str += '<div class="swiper-slide" data-uuid="' + v.uuid + '"><div class="img"><img src="' + v.bannerImg + '"></div><div class="text">' + v.title + '</div></div>';
			// });
			this.$('.index-banner > .swiper-wrapper').html(str);

			var mySwiper = new Swiper('.swiper-container', {
				direction: 'horizontal',
				loop: true,
				autoplay: 3000,
				// 如果需要分页器
				pagination: '.swiper-pagination',
				onTap: function (s, e) {
					var $p = $(e.target).parent().parent();
					var uuid = $p.data('uuid');

					var bannerDetail = new BannerDetail({
						uuid: uuid
					});
					bannerDetail.show();
				}
			});
			if(data.news){
				this.$('#newsInfo > .first > span').html(data.news.newsTitle);
				this.$('#newsInfo .date').html(data.news.queryDate);
			}
			
			if(data.notice){
				this.$('#noticeInfo > .first > span').html(data.notice.newsTitle);
				this.$('#noticeInfo .date').html(data.notice.queryDate);
			}
			// this.$('#missionInfo > .first > span').html(data.job.newsTitle);
			// this.$('#missionInfo .date').html(data.news.queryDate);
		},
		backbutton: function () {
			phonegaputil.exitApp();
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: true,
				title: '首页'
            });

			this.menu = new AppMenu({
				index: 1
			});
			this.$el.empty().append(template).append(this.menu.$el);
			// this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);
			this.getIndex();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
