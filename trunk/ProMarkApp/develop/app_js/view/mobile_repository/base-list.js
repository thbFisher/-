/**
 * 基础知识列表
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
	var template = require('text!view/mobile_repository/tpl/_base-list.html');

	var View = Backbone.View.extend({
		el: '.content',
        events: {
			// 'tap #mobileRepositoryBaseHeader .sort_type_btn': 'searchByType',
			// 'tap #mobileRepositoryBaseHeader .sort_time_btn': 'sortByTime',
			// 'tap #mobileRepositoryBaseHeader .sort_view_btn': 'sortByView',
			'tap #mobileRepositoryBaseHeader .btn-search': 'searchByKeyword',
            'tap #mobileRepositoryBaseWrapper .list-warning': 'initList',
            'tap #mobileRepositoryBaseWrapper .btn-prev,#mobileRepositoryBaseWrapper .btn-next': 'viewPage'
		},
		sortByTime: function(e){
			var $e = $(e.currentTarget);
			this.sort_type = $e.data('type');
			this.sort_order = $e.data('order');

			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(0)');
			this.host.hideSortPanel($panel);
		},
		sortByView: function(e){
			var $e = $(e.currentTarget);
			this.sort_type = $e.data('type');
			this.sort_order = $e.data('order');

			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(2)');
			this.host.hideSortPanel($panel);
		},
		searchByType: function(e){
			var uuid = $(e.currentTarget).data('uuid');
			if(!uuid){
				this.initList();
				return;
			}
			
			this.search_type = uuid;
			
			this.$warning.show();
			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(1)');
			this.host.hideSortPanel($panel);
		},
		searchByKeyword: function () {
			if(!this.data){
				return;
			}

			if (this.$('.sort_mask').hasClass('active') || this.$('.list_ctrl_btn').hasClass('active')) {
				this.host.toggleCtrlBtn();
			}

			this.search_keyword = '';
			var keyword = $.trim(this.$input.val());
			if (!keyword) {
				return;
			}

			this.search_keyword = keyword;

			this.$warning.show();
			this.getList(1, $.noop);
		},
		initList: function () {
			if (this.$('.sort_mask').hasClass('active') || this.$('.list_ctrl_btn').hasClass('active')) {
				this.host.toggleCtrlBtn();
			}

			this.$warning.hide();
			this.$input.val('');

			this.search_keyword = '';	//搜索关键字
			this.search_type = '';
			this.sort_order = '';
			this.sort_type = '';

			this.getList(1, $.noop);
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
		},
		getList: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getKnowledgeList({
				page: this.current_page,
				rows: this.rows,
				queDesc: this.search_keyword,
				queTypeUuid: this.search_type,
				maxWidth: 120,
				sort: this.sort_type,
				order: this.sort_order
			}, _.bind(function (data) {
				this.data = data;

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.listTemplate)({ data: data.obj.queList });
				this.$listContent.html(tpl);

				//获取类型
				this.host.typeArr = data.obj.queTypeList;

				this.$listWrapper.scrollTop(0);

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				$.jtoast(err);
				this.$listContent.html(this.errorHTML);

				callback();
			}, this));
		},
		initialize: function (options) {
			this.host = options.host;
            this.$el.empty().append(template);

			this.listTemplate = this.$('#listTpl').html();

            this.$listWrapper = this.$('.wrapper > .inner');
			this.$listContent = this.$('.repository_wrapper');
			this.listTemplate = this.$('#listTpl').html();
			this.$warning = this.$('.list-warning');
			this.$input = this.$('.input-search');

			this.data = null;	//当前内容
			this.current_page = 1;	//当前页
			this.rows = 30; //每页显示数目
			this.search_keyword = ''; //搜索关键字
			this.search_type = '';	//搜索类型uuid
			this.sort_type = ''; 	//按排序类别
			this.sort_order = '';	//排序正负

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
			
			//类型数据
			this.host.typeArr = [];

			//下拉刷新
            this.$listWrapper.pullToRefresh();
            this.$listWrapper.on("pull-to-refresh", _.bind(function () {
                this.isPullRefresh = 1;
                this.getList(1, _.bind(function () {
                    this.$listWrapper.pullToRefreshDone();
                }, this));
            }, this));

            this.getList(1, $.noop);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
