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
	var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/my_customer/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		events: {
			"tap .phonePic": "callphone",
			"tap .msgPic": "sendMsg"
		},
		sendMsg: function (e) {
			var number = $(e.currentTarget).data("phone");
			phonegaputil.sendSMS([number], "", _.bind(function () {
			}, this), function (err) {
				console.log(err);
				$.jtoast('跳转失败请重试');
			});
		},
		callphone: function (e) {
			var number = $(e.currentTarget).data("phone");
			//addCallNumber
			var queryObj = {
				customerMobile: "" + number
			}
			businessDelegate.addCallNumber(queryObj, _.bind(function (data) {

			}, this), _.bind(function (err) {
				// callback();
			}, this));
			window.location.href = "tel:" + number;
			// if (device.platform == 'iOS') {
			// 	window.plugins.CallNumber.callNumber(function () {
			// 		console.log("success");
			// 	}, function (err) {
			// 		console.log("error");
			// 		console.log(err);
			// 	}, number);
			// } else if (device.platform == 'Android') {
			// 	window.location.href = "tel:" + number;
			// }
		},
		initPage: function (uuid) {
			businessDelegate.getMarketingFixtureDetail({
				uuid: uuid
			}, _.bind(function (data) {
				this.detailTemplate = this.$("#myCustomerDetail").html();
				var tpl = _.template(this.detailTemplate)({ data: data.obj });
				// var tpl = _.template(this.userTemplate)({ data: data.obj });
				this.$("#customerDetail").empty();
				this.$("#customerDetail").html(tpl);
				// callback();
			}, this), _.bind(function (err) {
				// callback();
			}, this));
		},
		initialize: function (options) {
			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: "客户详情"
			});
			var uuid = options.uuid;
			this.detailTemplate = this.$("#myCustomerDetail").html();
			this.initPage(uuid);
			this.$el.empty().append(this.header.$el).append(template);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
