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
	var template = require('text!view/online_marketing/tpl/index.html');
	var missionListTemplate = require('text!view/online_marketing/tpl/_mission-list.html');

	var AppHeader = require('view/app-header');
	var MissionList = require('view/online_marketing/mission-list');
	var FixtureList = require('view/online_marketing/fixture-list');
	var PayList = require('view/online_marketing/pay-list');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .header_table .info': 'showAllInfoList',
			'tap .content-nav > div': 'selectNav',
			'tap .btn-mission-search': 'missionSearch',
			'tap .btn-fixture-search': 'fixtureSearch',
			'change .form-select': 'renderPayList'
		},
        fixtureSearch: function () {
			var $input = this.$('.input-fixture-search');
			this.fixtureList.searchByKeyword($input);
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
		renderNav: function (type) {
			this.$('.content-content').empty();

			switch (type) {
				case 1:
					//任务查询
					this.$('.content-header').html(this.missionSearchTemplate);
					//渲染任务查询
					if (!this.missionList) {
						this.missionList = new MissionList();
					} else {
						this.missionList.initialize();
					}
					break
				case 2:
					//常客查询
					this.$('.content-header').html(this.fixtureSearchTemplate);
					//渲染常客查询
					if (!this.fixtureList) {
						this.fixtureList = new FixtureList();
					} else {
						this.fixtureList.initialize();
					}
					break
				case 3:
					//酬金查询
					this.$('.content-header').html(this.paySelectInitTemplate);

					//获取营业厅
					this.getPaySelect();
					break
			}
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
				this.$('.header').html(tpl);

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
		showAllInfoList: function (e) {
			var $e = $(e.currentTarget);
			if ($e.find('.list').hasClass('unactive')) {
				$e.find('.list').removeClass('unactive').addClass('active');
			} else {
				$e.find('.list').removeClass('active').addClass('unactive');
			}
		},
		backbutton: function () {
            Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function (options) {
			this.history = options.history;
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '在线营销'
            });

            this.$el.empty().append(this.header.$el).append(template);
			this.userInfoTemplate = this.$('#userInfoTpl').html();
			this.missionSearchTemplate = this.$('#missionSearchTpl').html();
			this.fixtureSearchTemplate = this.$('#fixtureSearchTpl').html();
			this.paySelectInitTemplate = this.$('#paySelectInitTpl').html();
			this.paySelectTemplate = this.$('#paySelectTpl').html();

			//渲染用户信息
			this.renderUserInfoView();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
