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
	var template = require('text!view/marketing-tasks/tpl/index.html');
	var missionListTemplate = require('text!view/marketing-tasks/tpl/_mission-list.html');

	var AppHeader = require('view/app-header');
	var MissionList = require('view/marketing-tasks/mission-list');
	var FixtureList = require('view/marketing-tasks/fixture-list');
	var PayList = require('view/marketing-tasks/pay-list');
	var overView = require("view/marketing-tasks/overview");

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap #marketingTasks .header_table .info': 'showAllInfoList',
			'tap .btn-mission-search': 'missionSearch',
			'tap #marketingTasks .list-item': 'toTaskOverView',
			"tap .acceptedBtn": "acceptedTask" ,
			'tap .headerContent .btn-back': 'backbutton' ,
			'tap .channel-list>p': 'changeChannel'
		},
		changeChannel: function (e) {
			var uuid = $(e.currentTarget).data("uuid");
			this.customerChannelUuid = uuid;
			var $parent = $(e.currentTarget).parent();
			$(e.currentTarget).remove();
			$parent.prepend(e.currentTarget);
			this.$el.find(".content-header").addClass("eventNone");
			this.renderNav();
			e.stopPropagation() ;
			$(e.currentTarget).parent().removeClass("active");
			$(e.currentTarget).parent().addClass("unactive");
			
		},
		backbutton: function() {
		    this.host.backbutton();
		},
		toTaskOverView: function(e){
			var type = $(e.currentTarget).data("type") ;
			var uuid = $(e.currentTarget).data("uuid");
            var view = new overView({
				type: type,
				uuid: uuid ,
				customerChannelUuid: this.customerChannelUuid
			});
			
			view.show();
			return;
		},
		acceptedTask: function(e){
			e.stopPropagation();
			var uuid = $(e.currentTarget).data("uuid");
			// markJobsNewTargetSign
			businessDelegate.markJobsNewTargetSign({
				uuid: uuid
			},_.bind(function (data) {
				$(e.currentTarget).addClass("hide");
				$.jtoast("接收成功");
				$(e.currentTarget).parent().find(".task-info-overview>img").attr("src","app_img/accepted.png");
				// callback();
			}, this), _.bind(function (err) {
				// callback();
			}, this));
		},
        missionSearch: function () {
			var $input = this.$('.input-mission-search');
			this.keyword = $input.val() ;
			this.renderNav();
			// this.missionList.searchByKeyword($input);
		},
		renderNav: function (type) {
			businessDelegate.getMarkJobsNewList({
				page: this.current_page,
				rows: this.rows,
				title: this.keyword ,
				customerChannelUuid :this.customerChannelUuid
			},_.bind(function (data) {
				//data.obj.rows
				this.$el.find(".content-header").removeClass("eventNone");
				var tpl = _.template(this.taskItem)({ list: data.obj.rows });
				this.$("#marketingTasks .content-content").empty();
				this.$("#marketingTasks .content-content").html(tpl);
				this.getChannelList();
				// callback();
			}, this), _.bind(function (err) {
				// callback();
			}, this));

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
		showAllInfoList: function (e) {
			var $e = $(e.currentTarget);
			e.stopPropagation() ;
			if ($e.find('.list').hasClass('unactive')) {
				$e.find('.list').removeClass('unactive').addClass('active');
			} else {
				$e.find('.list').removeClass('active').addClass('unactive');
			}
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
				this.$("#marketingTasks .channel-list").empty();
				this.$("#marketingTasks .channel-list").html(html);

			}, this), _.bind(function (err) {
			}, this));
		},
		backbutton: function () {
            Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function (options) {
			//this.history = options.history;
			this.history = window._pageHistory?window._pageHistory:"work/index";
			window._pageHistory = "" ;
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '营销任务'
            });
			// this.$el.empty().append(this.header.$el).append(template);
			this.$el.empty().append(template);
			this.userInfoTemplate = this.$('#userInfoTpl').html();
			this.missionSearchTemplate = this.$('#missionSearchTpl').html();
			this.$('.content-header').html(this.missionSearchTemplate);
			this.myCustomerItemTemplate = this.$("#customUserItem").html();
			this.current_page=0 ;
			this.rows = 50 ;
			this.keyword = "" ;
			this.taskItem = this.$("#marketingTasksItem").html() ;
			//渲染用户信息
			this.renderUserInfoView();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
