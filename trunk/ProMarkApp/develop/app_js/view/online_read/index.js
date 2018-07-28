/**
*   在线阅读
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
	var template = require('text!view/online_read/tpl/index.html');
	var AppHeader = require('view/app-header');
	var MyRead = require('view/online_read/my');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .show_ctrl_btn': 'toggleCtrlBtn',
			'tap .list_ctrl_btn > div': 'getSortPanel',
			'tap .list-warning': 'initList',
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap .btn-search': 'searchByKeyword',
			'tap .sort_type_btn': 'searchByType',
			'tap .sort_time_btn': 'sortByTime',
			'tap .sort_view_btn': 'sortByView',
			'tap .myread': 'viewMyRead',
			'tap #onlineReadIndex .read_box': 'viewInfo',
			"tap #onlineReadIndex .read_box .learn": 'toLearn'
		},
		toLearn: function(e){
			e.stopPropagation();
			var read = $(e.currentTarget).data("read") ;
			var uuid = $(e.currentTarget).data("uuid") ;
			window.currentRecordRead = read ;
			Backbone.history.navigate('online-read-attachment/'+uuid, { trigger: true });
		},
		viewInfo: function (e) {
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			var read = $(e.currentTarget).data("read") ;
			window.currentRecordRead = read ;
			Backbone.history.navigate('online-read-info/' + uuid, { trigger: true });
		},
		viewMyRead: function(){
			var view = new MyRead();
			view.show();
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
		sortByTime: function(e){
			var $e = $(e.currentTarget);
			this.sort_type = $e.data('type');
			this.sort_order = $e.data('order');

			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(0)');
			this.hideSortPanel($panel);
		},
		sortByView: function(e){
			var $e = $(e.currentTarget);
			this.sort_type = $e.data('type');
			this.sort_order = $e.data('order');

			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(2)');
			this.hideSortPanel($panel);
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
			this.hideSortPanel($panel);
		},
		searchByKeyword: function () {
			if(!this.data){
				return;
			}

			if (this.$('.sort_mask').hasClass('active') || this.$('.list_ctrl_btn').hasClass('active')) {
				this.toggleCtrlBtn();
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
				this.toggleCtrlBtn();
			}

			this.$warning.hide();
			this.$input.val('');

			this.search_keyword = '';	//搜索关键字
			this.search_type = '';	//搜索类型uuid
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
				this.$content.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.readList({
				page: this.current_page,
				rows: this.rows,
				courName: this.search_keyword,
				courImageWidth: 140,
				courTypeUUID: this.search_type,
				sort: this.sort_type,
				order: this.sort_order
			}, _.bind(function (data) {
				this.data = data;

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				this.listData = data.obj.readCourseware;
				this.typeArr = data.obj.readCoursewareType;

				var tpl = _.template(this.listTemplate)({ data: this.listData });
				this.$content.html(tpl);
				this.$content.scrollTop(0);

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				$.jtoast(err);
				this.$content.html(this.errorHTML);

				callback();
			}, this));
		},
		backbutton: function () {
			if (this.$('.sort_mask').hasClass('active')) {
				this.toggleCtrlBtn();
				return;
			}

            Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function () {
			this.history = window._pageHistory?window._pageHistory:"work/index";
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '在线学习'
            });
			this.header.setRightBtn('<span class="text myread">阅读记录</span>');

            this.$el.empty().append(this.header.$el).append(template);


			this.listTemplate = this.$('#listTpl').html();
			this.typeTemplate = this.$('#typeTpl').html();
			this.sortTimeTemplate = this.$('#sortTimeTpl').html();
			this.sortViewTemplate = this.$('#sortViewTpl').html();

            this.$wrapper = this.$('.content > .inner');
			this.$content = this.$('.read_wrapper');
			this.$warning = this.$('.list-warning');
			this.$input = this.$('.input-search');

			this.typeArr;	//类型
			this.listData;	//列表信息

			this.data = null;	//当前内容
			this.current_page = 1;	//当前页
			this.rows = 10; //每页显示数目
			this.search_keyword = '';	//搜索关键字
			this.search_type = '';	//搜索类型uuid
			this.sort_type = ''; 	//按排序类别
			this.sort_order = '';	//排序正负

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.current_sort_btn;
		},
		render: function () {
            //下拉刷新
            this.$wrapper.pullToRefresh();
            this.$wrapper.on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getList(1, _.bind(function () {
					this.$wrapper.pullToRefreshDone();
				}, this));
			}, this));

			this.getList(1, $.noop);
			return this;
		}
	});

	return View;
});
