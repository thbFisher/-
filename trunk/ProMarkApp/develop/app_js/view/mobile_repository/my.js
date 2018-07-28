/**
*   我的问题
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
	var template = require('text!view/mobile_repository/tpl/my.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .show_ctrl_btn': 'toggleCtrlBtn',
			'tap .list_ctrl_btn > div': 'getSortPanel',
			'tap .nav > div': 'renderList',

            'tap .sort_type_btn': 'searchByType',
			'tap .sort_time_btn': 'sortByTime',
			'tap .sort_view_btn': 'sortByView',

            'tap .btn-search': 'searchByKeyword',
            'tap .list-warning': 'initList',
            'tap .btn-prev,.btn-next': 'viewPage',

			'tap .base_box': 'viewDetail'
		},
		viewDetail: function (e) {
			var uuid = $(e.currentTarget).data('uuid');
			Backbone.history.navigate('mobile-repository-detail/' + uuid + '/mobile-repository-my/' + this.options.type + '_' + this.queStatus, { trigger: true });
		},
		sortByTime: function (e) {
			var $e = $(e.currentTarget);
			this.sort_type = $e.data('type');
			this.sort_order = $e.data('order');

			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(0)');
			this.hideSortPanel($panel);
		},
		sortByView: function (e) {
			var $e = $(e.currentTarget);
			this.sort_type = $e.data('type');
			this.sort_order = $e.data('order');

			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(2)');
			this.hideSortPanel($panel);
		},
		searchByType: function (e) {
			var uuid = $(e.currentTarget).data('uuid');
			if (!uuid) {
				this.initList();
				return;
			}

			this.search_type = uuid;

			this.$warning.show();
			this.getList(1, $.noop);

			var $panel = this.$('.list_ctrl_btn > div:eq(1)');
			this.hideSortPanel($panel);
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
        renderList: function (e) {
			if (e == 0) {
				this.queStatus = e;

				$('.nav > div').removeClass('active');
				$('.nav > div:eq(1)').addClass('active');
			} else if (e == 1) {
				this.queStatus = e;

				$('.nav > div').removeClass('active');
				$('.nav > div:eq(0)').addClass('active');
			} else {
				var $e = $(e.currentTarget);
				if ($e.hasClass('active')) {
					return;
				}

				$('.nav > div').removeClass('active');
				$e.addClass('active');

				this.queStatus = $e.data('value');
			}

			this.getList(1, $.noop);
        },
		searchByKeyword: function () {
			if (!this.data) {
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
			this.search_type = '';
			this.sort_order = '';
			this.sort_type = '';

			this.getList(1, $.noop);
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
		},
		getAnswerList: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getMyKnowledgeAnswer({
				page: this.current_page,
				rows: this.rows,
				queDesc: this.search_keyword,
				queTypeUuid: this.search_type,
				maxWidth: 120,
				sort: this.sort_type,
				order: this.sort_order,
				queStatus: this.queStatus
			}, _.bind(function (data) {
				this.data = data;

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.listTemplate)({ data: data.obj.queList });
				this.$listContent.html(tpl);

				//获取类型
				this.typeArr = data.obj.queTypeList;

				this.$listContent.scrollTop(0);

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
		getQuestionList: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getMyKnowledgeQuestion({
				page: this.current_page,
				rows: this.rows,
				queDesc: this.search_keyword,
				queTypeUuid: this.search_type,
				maxWidth: 120,
				sort: this.sort_type,
				order: this.sort_order,
				queStatus: this.queStatus
			}, _.bind(function (data) {
				this.data = data;

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.listTemplate)({ data: data.obj.queList });
				this.$listContent.html(tpl);

				//获取类型
				this.typeArr = data.obj.queTypeList;

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
		backbutton: function () {
			if (this.$('.sort_mask').hasClass('active')) {
				this.toggleCtrlBtn();
				return;
			}

            Backbone.history.navigate('mobile-repository-index', { trigger: true });
		},
		initialize: function (options) {
			this.options = options;

			var status = 1;	//已关闭问题
			if (this.options.status) {
				var status = this.options.status;
			}

			var title = '';
			if (this.options.type == 'question') {
				title = '我的提问';
				this.getList = this.getQuestionList;
			} else if (this.options.type == 'answer') {
				title = '我的回答';
				this.getList = this.getAnswerList;
			}

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: title
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.typeTemplate = this.$('#typeTpl').html();
			this.sortTimeTemplate = this.$('#sortTimeTpl').html();
			this.sortViewTemplate = this.$('#sortViewTpl').html();
            this.listTemplate = this.$('#listTpl').html();


            this.$listWrapper = this.$('.wrapper > .inner');
			this.$listContent = this.$('.repository_wrapper');
			this.$warning = this.$('.list-warning');
			this.$input = this.$('.input-search');

			this.data = null;	//当前内容
            this.typeArr;	//类型
			this.current_page = 1;	//当前页
			this.rows = 30; //每页显示数目
			this.search_keyword = ''; //搜索关键字
			this.search_type = '';	//搜索类型uuid
			this.sort_type = ''; 	//按排序类别
			this.sort_order = '';	//排序正负
			this.queStatus = 1;	//已关闭问题

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			//下拉刷新
            this.$listWrapper.pullToRefresh();
            this.$listWrapper.on("pull-to-refresh", _.bind(function () {
                this.isPullRefresh = 1;
                this.getList(1, _.bind(function () {
                    this.$listWrapper.pullToRefreshDone();
                }, this));
            }, this));

            this.renderList(status);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
