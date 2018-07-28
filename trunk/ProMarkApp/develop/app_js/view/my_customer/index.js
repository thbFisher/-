/**
 * 营销首页
 */

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
	var template = require('text!view/my_customer/tpl/index.html');
	var missionListTemplate = require('text!view/my_customer/tpl/_mission-list.html');

	var AppHeader = require('view/app-header');
	var MissionList = require('view/my_customer/mission-list');
	var FixtureList = require('view/my_customer/fixture-list');
	var PayList = require('view/my_customer/pay-list');
	var DetailView = require("view/my_customer/detail");

	var View = Backbone.View.extend({
		el: 'body',
		events: {
			'tap .header_table .info': 'showAllInfoList',
			'tap .content-nav > div': 'selectNav',
			'tap .btn-mission-search': 'missionSearch',
			'tap .btn-fixture-search': 'fixtureSearch',
			'change .form-select': 'renderPayList',
			'tap .infoContainer': 'toCustomerDetail',
			"tap .btn.btn-primary.btn-mission-search": "getSearchKey",
			'tap .headerContent .btn-back': 'backbutton',
			'tap .channel-list>p': 'changeChannel'
		},
		changeChannel: function (e) {
			var uuid = $(e.currentTarget).data("uuid");
			this.customerChannelUuid = uuid;
			var $parent = $(e.currentTarget).parent();
			$(e.currentTarget).remove();
			$parent.prepend(e.currentTarget);
			this.renderNav();
		},
		backbutton: function () {
			this.host.backbutton();
		},
		toCustomerDetail: function (e) {
			var uuid = $(e.currentTarget).data("uuid");
			var view = new DetailView({
				uuid: uuid
			});
			view.show();
			return;
		},
		getSearchKey: function () {
			var $input = this.$('.input-fixture-search');
			debugger;
			this.search_keyword = $input.val();
			this.fixtureList.renderNav();
		},
		missionSearch: function () {
			var $input = this.$('.input-mission-search');
			this.missionList.searchByKeyword($input);
		},
		selectNav: function (e) {
			var $e = $(e.currentTarget);

			if ($e.hasClass('active')) {
				return;
			}

			this.$('.content-nav > div').removeClass('active');
			$e.addClass('active');

			var type = $e.data('type');
			this.renderNav(type);
		},
		renderNav: function () {
			this.$('.content-content').empty();
			businessDelegate.getMarketingFixtureList({
				page: this.current_page,
				rows: this.rows,
				customerMobile: window.user.mobile,
				customerChannelUuid : this.customerChannelUuid
			}, _.bind(function (data) {

				var tpl = _.template(this.myCustomerItemTemplate)({ list: data.obj.rows });
				// var tpl = _.template(this.userTemplate)({ data: data.obj });
				this.$(".index-banner .swiper-wrapper .person-info").empty();
				this.$(".index-banner .swiper-wrapper .person-info").html(tpl);
				this.$('.content-content').html(tpl);
				this.getChannelList();
			}, this), _.bind(function (err) {
			}, this));

		},
		getPaySelect: function () {
			$.showLoading();
			businessDelegate.getMarketingChannel(_.bind(function (data) {
				$.hideLoading();

				if (data.obj.length == 0) {
					return;
				}

				var tpl = _.template(this.paySelectTemplate)({ list: data.obj });
				this.$('.content-header').html(tpl);

				this.renderPayList();
			}, this), _.bind(function (err) {
				$.jtoast(err);
				$.hideLoading();

				this.renderPayList();
			}, this));
		},
		renderPayList: function () {
			var uuid = $('.form-select').val();

			if (!this.PayList) {
				this.PayList = new PayList({
					uuid: uuid
				});
			} else {
				this.PayList.initialize({
					uuid: uuid
				});
			}

		},
		renderUserInfoView: function () {
			$.showLoading();
			businessDelegate.getMarketingPermission(_.bind(function (data) {
				$.hideLoading();
				var tpl = _.template(this.userInfoTemplate)(data.obj);
				this.$('.header .tableContent').html(tpl);

				window.user.regularVisitors = data.obj.regularVisitors;	//获取常客查询权限
				window.user.taskSing = data.obj.taskSing;	//获取任务查询权限
				window.user.backfillTask = data.obj.backfillTask;	//获取任务回填权限
				window.user.queryFee = data.obj.queryFee;	//获取酬金查询权限
				this.renderNav(1);
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);

				this.renderNav(1);
			}, this));
		},
		getChannelList: function () {
			if (this.hasInitClannelList) {
				return;
			}
			businessDelegate.getMarketingChannel(_.bind(function (data) {
				this.hasInitClannelList = true;
				var html = '<p data-uuid="">全部</p>';
				for (var i = 0; i < data.obj.length; i++) {
					html += '<p data-uuid="' + data.obj[i].uuid + '">' + data.obj[i].title + '</p>';
				}
				this.$(".channel-list").empty();
				this.$(".channel-list").html(html);

			}, this), _.bind(function (err) {
			}, this));
		},
		showAllInfoList: function (e) {
			var $e = $(e.currentTarget);
			if ($e.find('.list').hasClass('unactive')) {
				$e.find('.list').removeClass('unactive').addClass('active');
			} else {
				$e.find('.list').removeClass('active').addClass('unactive');
			}
		},
		showList: function () {

		},
		backbutton: function () {
			Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function (options) {
			//this.history = options.history;
			this.history = window._pageHistory ? window._pageHistory : "work/index";
			window._pageHistory = "";
			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: '我的客户'
			});
			// this.$el.empty().append(this.header.$el).append(template);
			this.$el.empty().append(template);
			this.userInfoTemplate = this.$('#userInfoTpl').html();
			this.missionSearchTemplate = this.$('#missionSearchTpl').html();
			this.$('.content-header').html(this.missionSearchTemplate);
			this.fixtureSearchTemplate = this.$('#fixtureSearchTpl').html();
			this.paySelectInitTemplate = this.$('#paySelectInitTpl').html();
			this.paySelectTemplate = this.$('#paySelectTpl').html();
			this.myCustomerItemTemplate = this.$("#customUserItem").html();

			this.search_keyword = "";
			this.current_page = 0;	//当前页
			this.rows = 100; //每页显示数目
			//渲染用户信息
			this.renderUserInfoView();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
