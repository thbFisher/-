define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	require('touch');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
	var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/tpl/_get-share.html');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		events: {
			'tap .full': 'backbutton',
			'tap .btn-sharewx': 'shareWX',
			'tap .btn-sharesms': 'shareSMS'
		},
		shareWX: function (e) {
			// this.trigger('refreshShareCount', this.options.e);
			// if (!window.cordova) {
			// 	console.log('需要手机环境');
			// 	return false;
			// }

			var $e = $(e.currentTarget);
			var scene = $e.data('scene');	//分享至朋友圈或好友

			var shareInfo = this.data ? this.data.shareWx : {};
			var param;
			if ("graphic-maketing-pic" != this.type) {
				param = {
					message: {
						title: this.options.question,
						description: shareInfo.content,
						thumb: shareInfo.shareImg,
						media: {
							type: Wechat.Type.WEBPAGE,
							webpageUrl: shareInfo.shareUrl
						}
					},
					scene: Wechat.Scene[scene]   // share to Timeline
				};
			} else {
				//http://117.78.33.165:8080/stategrid/page/images/login_bg3.jpg
				//Wechat.Type.IMAGE,
				var img = "http://117.78.33.165:8080/stategrid/page/images/login_bg3.jpg";
				param = {
					message: {
						title: "",
						description: "",
						thumb: "",
						media: {
							// type: Wechat.Type.IMAGE,  
							type: Wechat.Type.IMAGE,
							image: this.shareImgUrl
						}
					},
					scene: Wechat.Scene[scene]   // share to Timeline  
				};
			}
			Wechat.isInstalled(function (installed) {
				if (!installed) {
					$.hideLoading();
					$.jtoast('未安装微信');
					return;
				}
				if ("graphic-maketing-pic" != this.type) {
					Wechat.share(param, _.bind(function () {
						// $.hideLoading();
						console.log("Success");
						//设置转发数
						if (this.options.anUuid) {	//转发答案
							businessDelegate.addKnowledgeShareCountByAnUUID({
								anUuid: this.options.anUuid
							}, _.bind(function () {
								this.trigger('refreshAnswerShareCount', this.options.e);
							}, this), $.noop);
						} else {	//转发问题
							businessDelegate.addKnowledgeShareCountByQueUUID({
								queUuid: this.options.queUuid
							}, _.bind(function () {
								this.trigger('refreshQuestionShareCount', this.options.e);
							}, this), $.noop);
						}
					}, this), function (reason) {
						// $.hideLoading();
						console.log("Failed: " + reason);
					});
				} else {
					Wechat.share(param, _.bind(function () {
						// alert("success");
					}, this), function (reason) {
						// $.hideLoading();
						console.log("Failed: " + reason);
						// alert("faill:"+reason);
					});
				}
			}, function (reason) {
				// $.hideLoading();
				console.log("Failed: " + reason);
				$.jtoast('检测微信环境失败');
			});
			return false;
		},
		shareSMS: function () {
			var content;
			if (this.data && this.data.shareSms) {
				content = this.data.shareSms.content;
			}
			// var content = this.data.shareSms.content;
			if (!content) {
				$.jtoast('无法获取短信分享信息');
				return;
			}

			$.showLoading('正在打开');
			phonegaputil.sendSMS([], content, _.bind(function () {
				$.hideLoading();
				console.log('success');
				//设置转发数
				if (this.options.anUuid) {	//转发答案
					businessDelegate.addKnowledgeShareCountByAnUUID({
						anUuid: this.options.anUuid
					}, _.bind(function () {
						this.trigger('refreshAnswerShareCount', this.options.e);
					}, this), $.noop);
				} else {	//转发问题
					businessDelegate.addKnowledgeShareCountByQueUUID({
						queUuid: this.options.queUuid
					}, _.bind(function () {
						this.trigger('refreshQuestionShareCount', this.options.e);
					}, this), $.noop);
				}
			}, this), function (err) {
				$.hideLoading();
				console.log(err);
				$.jtoast('跳转失败请重试');
			});

			return false;
		},
		getShare: function () {
			$.showLoading('获取分享信息');
			businessDelegate.getKnowledgeShareInfo({
				queUuid: this.options.queUuid,
				anUuid: this.options.anUuid
			}, _.bind(function (data) {
				$.hideLoading();
				this.data = data.obj;
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.back();
			}, this));
		},
		initialize: function (options) {
			if ("graphic-maketing-pic" == options.question.type) {//图文营销，只分享图片
				this.shareImgUrl = options.question.url;
				this.type = options.question.type;
				this.options = {
					crop: false,
					title: '转发分享'
				};
			} else {
				this.options = {
					crop: false,
					title: '转发分享'
				};
			}
			if (options) {
				this.options = _.extend(this.options, options);
			}

			var tpl = _.template(template)({ title: this.options.title });
			this.$el.empty().append(tpl);
			this.data = null;
		},
		render: function () {
			if ("graphic-maketing-pic" != window.pageType) {
				this.getShare();
				window.pageType = "";
			}
			return this;
		}
	});

	return View;
});
