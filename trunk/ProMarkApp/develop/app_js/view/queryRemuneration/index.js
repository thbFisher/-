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
	var template = require('text!view/queryRemuneration/tpl/index.html');
	var missionListTemplate = require('text!view/my_customer/tpl/_mission-list.html');

	var AppHeader = require('view/app-header');
	var MissionList = require('view/my_customer/mission-list');
	var FixtureList = require('view/my_customer/fixture-list');
	var PayList = require('view/my_customer/pay-list');
	var DetailView = require("view/queryRemuneration/detail");

	var View = Backbone.View.extend({
		el: 'body',
		events: {
			'tap .header_table .info': 'showAllInfoList',
			'tap .content-nav > div': 'selectNav',
			'tap .btn-mission-search': 'missionSearch',
			'tap .btn-fixture-search': 'fixtureSearch',
			'change .form-select': 'renderPayList',
			'tap .listitem': 'toRemunerationDetail',
			'tap .ellipsePng': "changePageEllipse1",
			'tap .morePage .queryByType>div': "changePage",
			'tap .headerContent .btn-back': 'backbutton' ,
			'tap .channel-list>p': 'changeChannel'
		},
		changeChannel: function (e) {
			this.channelUUID = $(e.currentTarget).data("uuid");
			this.dateMonth = $(e.currentTarget).data("month");
			var $parent = $(e.currentTarget).parent();
			$(e.currentTarget).remove();
			$parent.prepend(e.currentTarget);
			this.getlistData();
		},
		backbutton: function () {
			this.host.backbutton();
		},
		changePageEllipse1: function(e) {
			var flag = $(e.currentTarget).next().hasClass("hide") ;
			if (flag) {
				$(e.currentTarget).next().removeClass("hide");
			} else {
				$(e.currentTarget).next().addClass("hide");
			}

		},
		changePage: function(e) {
			var type = this.$(e.currentTarget).data("type");
			this.pageType = type;
			this.$(e.currentTarget).parent().addClass("hide");
			this.getDataByType();
		},
		// changeChannel: function (e) {
		// 	this.channelUUID = $(e.currentTarget).val();
		// 	this.dateMonth = $(e.currentTarget).val();
		// 	// this.renderNav();
		// 	this.getlistData();
		// },
		toRemunerationDetail: function (e) {
			e.stopPropagation();
			// this.$(".common-header .right-button").addClass("hide");
			var uuid = $(e.currentTarget).data("uuid");
			var view = new DetailView({
				uuid: uuid
			});
			view.show();
			return;
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
			var channelUUID = this.channelUUID ? this.channelUUID : this.$(".header_table.table .channel").val();
			var dateMonth = this.dateMonth;
			var queryObj = {};
			businessDelegate.getmarkRemunerationNewListByChannel(queryObj, _.bind(function (data) {
				var tpl = _.template(this.remunerationList)({ list: data.obj });
				this.$('.content-content').html(tpl);
			}, this), _.bind(function (err) {
				// callback();
			}, this));
			// var tpl = _.template(this.remunerationList)({ list : data }) ;
			// this.$('.content-content').html(tpl);
			// this.$('.content-content')[0].innerHTML = this.myCustomerItemTemplate ;
		},
		getDataByType: function () {//获取查询条件
			if ("1" == this.pageType) {//营业厅
				$("#query-remuneration .header_table tr:nth-child(3) td").text(window.user.mobile);
				businessDelegate.getMarketingChannel(_.bind(function (data) {
					// var html = '<p data-uuid="">全部</p>';
					var html = '';
					for (var i = 0; i < data.obj.length; i++) {
						html += '<p data-uuid="' + data.obj[i].uuid + '">' + data.obj[i].title + '</p>';
					}
					// this.getMonth($.noop);
					this.$(".header_table.table .channel-list").empty();
					this.$(".header_table.table .channel-list").html(html);
					if(window.user.queryFee){
						this.getlistData();
					}else{
						var htmlStr = "<div class='pemissionInfo'>对不起，您暂无权限查看此功能。</div>"
						this.$(".content-content .list").empty();
						this.$(".content-content .list").html(htmlStr);
					}
				}, this), _.bind(function (err) {
					this.$listContent.html(this.errorHTML);
					$.jtoast(err);
					$.hideLoading();
				}, this));
			} else {//yuefen
				$("#query-remuneration .header_table tr:nth-child(3) td").text(window.user.title);
				var options = "";
				for (var i = 1; i < 13; i++) {
					// options = options + '<option value="' + i + '">' + i + '月份</option>';
					options = options + '<p data-month="' + i + '">' + i + '月份</p>';
					
				}
				// this.getMonth($.noop);
				this.$(".header_table.table .channel-list").empty();
				this.$(".header_table.table .channel-list").html(options);
				this.getlistData();
			}
		},
		getlistData: function () {//获取列表数据
			var channelUUID = this.channelUUID?this.channelUUID:$("#query-remuneration .list.channel-list p:first").data("uuid") ;
			var queryObj = {};
			if ("1" == this.pageType) {//营业厅
				queryObj.uuid = channelUUID;
				businessDelegate.getmarkRemunerationNewListByChannel(queryObj, _.bind(function (data) {
					var tpl = _.template(this.remunerationList)({ list: data.obj, type: this.pageType });
					this.$(".content-content .list").empty();
					this.$(".content-content .list").html(tpl);
				}, this), _.bind(function (err) {
					// this.$listContent.html(this.errorHTML);
					$.jtoast(err);
					$.hideLoading();
				}, this));
			} else {//月份
				queryObj.dateMonth = this.dateMonth ? this.dateMonth : $("#query-remuneration .list.channel-list p:first").data("month");
				businessDelegate.getMarkRemunerationNewListByMonth(queryObj, _.bind(function (data) {
					var tpl = _.template(this.remunerationList)({ list: data.obj, type: this.pageType });
					this.$(".content-content .list").empty();
					this.$(".content-content .list").html(tpl);
				}, this), _.bind(function (err) {
					// this.$listContent.html(this.errorHTML);
					$.jtoast(err);
					$.hideLoading();
				}, this));
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
				this.$('.header .tableContent').html(tpl);
				window.user.title = data.obj.title;
				window.user.regularVisitors = data.obj.regularVisitors;	//获取常客查询权限
				window.user.taskSing = data.obj.taskSing;	//获取任务查询权限
				window.user.backfillTask = data.obj.backfillTask;	//获取任务回填权限
				window.user.queryFee = data.obj.queryFee;	//获取酬金查询权限
				// this.renderNav(1);
				this.getDataByType(); //获取营业厅
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
			this.history = window._pageHistory ? window._pageHistory : "work/index";
			window._pageHistory = "";
			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: '酬金查询'
			});

			// this.$el.empty().append(this.header.$el).append(template);
			this.$el.empty().append(template);
			this.userInfoTemplate = this.$('#userInfoTpl').html();
			this.missionSearchTemplate = this.$('#missionSearchTpl').html();
			this.fixtureSearchTemplate = this.$('#fixtureSearchTpl').html();
			this.paySelectInitTemplate = this.$('#paySelectInitTpl').html();
			this.paySelectTemplate = this.$('#paySelectTpl').html();
			this.remunerationList = this.$("#remunerationList").html();
			// var htmlStr = '<div class="morePage" style="margin-right: 5px;"><div class="ellipsePng"><img src="app_img/ellipse.png" alt=""></div><div class="queryByType hide" style="background-color: rgb(44 ,154 ,244);"><div data-type="1">营业厅</div><div data-type="2">月份</div></div></div>';
			// this.$(".common-header .right-button").html(htmlStr);
			// this.$(".common-header .right-button").removeClass("hide");
			this.pageType = "1";
			//渲染用户信息
			this.renderUserInfoView();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
