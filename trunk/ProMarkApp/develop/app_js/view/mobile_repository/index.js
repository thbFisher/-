/**
*   知识库首页
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
	var template = require('text!view/mobile_repository/tpl/index.html');
	var AppHeader = require('view/app-header');

	var BaseList = require('view/mobile_repository/base-list');
	var ExampleList = require('view/mobile_repository/example-list');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap #mobileRepositorySort .sort_type_btn': 'searchByType',
			'tap #mobileRepositorySort .sort_time_btn': 'sortByTime',
			'tap #mobileRepositorySort .sort_view_btn': 'sortByView',

			'tap .show_ctrl_btn': 'toggleCtrlBtn',
			'tap .list_ctrl_btn > div': 'getSortPanel',
			'tap .nav > div': 'renderList',
			'tap .menu > div': 'viewPage',
			'tap .base_box': 'viewBaseDetail',
			'tap .example_box': 'viewExampleDetail'
		},
		sortByTime: function(e){
			if(this.i == 0){
				this.baseList.sortByTime(e);
			}else if(this.i == 1){
				this.exampleList.sortByTime(e);
			}
		},
		sortByView: function(e){
			if(this.i == 0){
				this.baseList.sortByView(e);
			}else if(this.i == 1){
				this.exampleList.sortByView(e);
			}
		},
		searchByType: function(e){
			if(this.i == 0){
				this.baseList.searchByType(e);
			}else if(this.i == 1){
				this.exampleList.searchByType(e);
			}
		},
		viewExampleDetail: function(e){
			var uuid = $(e.currentTarget).data('uuid');
			Backbone.history.navigate('example-detail/' + uuid, { trigger: true });
		},
		viewBaseDetail: function (e) {
			var uuid = $(e.currentTarget).data('uuid');
			Backbone.history.navigate('mobile-repository-detail/' + uuid + '/mobile-repository-index/' + this.nav, { trigger: true });
		},
		viewPage: function (e) {
			var href = $(e.currentTarget).data('href');
			if (!href) {
				return;
			}

			Backbone.history.navigate(href, { trigger: true });
		},
		toggleCtrlBtn: function (e) {
			if (this.$('.list_ctrl_btn').hasClass('active')) {
				//收起
				this.$('.list_ctrl_btn').removeClass('active');
				this.$('.double-arrow-down').addClass('hide');
				this.$('.double-arrow-right').removeClass('hide');

				//收起
				this.$('.arrow-down').addClass('hide');
				this.$('.arrow-up').removeClass('hide');
				this.$('.sort_mask').removeClass('active');
				this.current_sort_btn = '';
			} else {
				//打开
				this.$('.list_ctrl_btn').addClass('active');
				this.$('.double-arrow-right').addClass('hide');
				this.$('.double-arrow-down').removeClass('hide');
			}
		},
		getSortPanel: function (e) {
			var $e = $(e.currentTarget);
			var type = $e.data('type');

			if (!this.current_sort_btn) {
				this.current_sort_btn = type;
				this.renderSortPanel($e);
			} else {
				if (type == this.current_sort_btn) {
					this.toggleSortPanel($e);
					return;
				} else {
					this.current_sort_btn = type;
					this.renderSortPanel($e);
				}
			}
		},
		showSortPanel: function ($e) {
			this.$('.arrow-down').addClass('hide');
			this.$('.arrow-up').removeClass('hide');

			this.$('.sort_mask').addClass('active');
			$e.find('.arrow-up').addClass('hide');
			$e.find('.arrow-down').removeClass('hide');
		},
		hideSortPanel: function ($e) {
			this.$('.sort_mask').removeClass('active');
			$e.find('.arrow-down').addClass('hide');
			$e.find('.arrow-up').removeClass('hide');
		},
		toggleSortPanel: function ($e) {
			if (this.$('.sort_mask').hasClass('active')) {
				//收起
				this.hideSortPanel($e);
			} else {
				//打开
				this.showSortPanel($e);
			}
		},
		renderSortPanel: function ($e) {
			var type = $e.data('type');
			switch (type) {
				case 'time':
					//按时间排序
					this.$('.sort_panel').html(this.sortTimeTemplate);
					break;
				case 'type':
					//按类别搜索
					var tpl = _.template(this.typeTemplate)({ list: this.typeArr });
					this.$('.sort_panel').html(tpl);
					break;
				case 'view':
					//按浏览量排序
					this.$('.sort_panel').html(this.sortViewTemplate);
					break;
			}

			this.showSortPanel($e);
		},
		renderList: function (i) {
			this.i = i;
			if (i == 0) {
				if (this.baseList) {
					this.baseList.initialize({
						host: this
					});
				} else {
					this.baseList = new BaseList({
						host: this
					});
				}
			} else if (i == 1) {
				if (this.exampleList) {
					this.exampleList.initialize({
						host: this
					});
				} else {
					this.exampleList = new ExampleList({
						host: this
					});
				}
			} else {
				var $e = $(i.currentTarget);
				var index = $e.index();

				if (!$e.hasClass('active')) {
					this.renderList(index);
				}
			}
		},
		backbutton: function () {
			if (this.$('.sort_mask').hasClass('active')) {
				this.toggleCtrlBtn();
				return;
			}
            Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function (options) {
			this.history = window._pageHistory ? window._pageHistory : "work/index";
			var type = options.nav || 0 ;//0 基础知识  1 投诉案例
			this.nav = type  ;
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '0' == type ? "基础知识" : "投诉案例"
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.typeTemplate = this.$('#typeTpl').html();
			this.sortTimeTemplate = this.$('#sortTimeTpl').html();
			this.sortViewTemplate = this.$('#sortViewTpl').html();

			this.typeArr;	//类型

			if(options.nav){
				this.renderList(options.nav);
			}else{
				this.renderList(0);
			}
			
		},
		render: function () {
			return this;
		}
	});

	return View;
});
