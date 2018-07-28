/**
 * 常客查询
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
	var template = require('text!view/marketing/tpl/fixture.html');
	var AppHeader = require('view/app-header');
    var Detail = require('view/marketing/fixture-detail');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .search-keyword': 'searchByKeyword',
			'tap .list-warning': 'initList',
			'tap .btn-prev,.btn-next': 'viewPage',
            'tap .mobile-list-box': 'showDetail'
		},
        showDetail: function(e){
            var uuid = $(e.currentTarget).data('uuid');
            var view = new Detail({
                uuid: uuid
            });
            view.show();
        },
		searchByKeyword: function () {
			if(!this.data){
				return;
			}

			this.search_mobile = '';
			var keyword = $.trim(this.$input.val());
			if (!keyword) {
				return;
			}

			this.search_mobile = keyword;

			this.$warning.show();
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

			businessDelegate.getMarketingFixtureList({
				page: this.current_page,
				rows: this.rows,
				mobile: this.search_mobile
			}, _.bind(function (data) {
				this.data = data.obj;

				var tpl = _.template(this.listTemplate)({ data: data.obj });
				this.$listContent.html(tpl);

				this.$listContent.scrollTop(0);
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				callback();
			}, this), _.bind(function (err) {
				this.$listContent.html(this.errorHTML);
				$.jtoast(err);
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				callback();
			}, this));
		},
		initList: function () {
			this.$warning.hide();
			this.$input.val('');
			this.search_mobile = '';	//搜索关键字

			this.getList(1, $.noop);
		},
		backbutton: function () {
            Backbone.history.navigate('marketing-index', { trigger: true });
		},
		initialize: function () {
			if(!window.user.regularVisitors){
				this.backbutton();
				return;
			}

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '常客查询'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.$listContent = this.$('.marketing-fixture-wrapper');
			this.listTemplate = this.$('#listTpl').html();
			
			this.$warning = this.$('.list-warning');
			this.$input = this.$('.marketing-keyword');

			this.current_page = 1;	//当前页
			this.rows = 10; //每页显示数目

			this.data = null;	//当前内容
			this.search_mobile = ''; //搜索关键字

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
			//下拉刷新
            this.$('.marketing-fixture-list').pullToRefresh();
            this.$('.marketing-fixture-list').on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getList(1, _.bind(function () {
					this.$('.marketing-fixture-list').pullToRefreshDone();
				}, this));
			}, this));

			this.getList(1, $.noop);
			return this;
		}
	});

	return View;
});
