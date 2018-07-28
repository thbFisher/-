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
	var template = require('text!view/online_marketing/tpl/_fixture-list.html');
    var Detail = require('view/online_marketing/fixture-detail');

	var View = Backbone.View.extend({
		el: '.content-content',
        events: {
            'tap #fixtureListContent .list-warning': 'initList',
            'tap #fixtureListContent .btn-prev,.btn-next': 'viewPage',
            'tap .fixture_box > li': 'viewDetail'
		},
        viewDetail: function(e){
            var uuid = $(e.currentTarget).data('uuid');
            var view = new Detail({
                uuid: uuid
            });
            view.show();
        },
		searchByKeyword: function ($input) {
            this.$input = $input;

			if(!this.data){
				return;
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
			this.$warning.hide();
			this.$input.val('');
			this.search_keyword = '';	//搜索关键字

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
				mobile: this.search_keyword
			}, _.bind(function (data) {
				this.data = data.obj;

				var tpl = _.template(this.listTemplate)({ data: data.obj });
				this.$listContent.html(tpl);

				this.$listWrapper.scrollTop(0);
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
		initialize: function () {
			if(!window.user.regularVisitors){
				this.$el.empty().append('<div class="warning-panel">您没有权限查看</div>');
                return;
			}

            this.$el.empty().append(template);

            this.$listWrapper = this.$('#fixtureListContent > div');
			this.$listContent = this.$('.fixture_wrapper');
			this.listTemplate = this.$('#listTpl').html();
			this.$warning = this.$('.list-warning');
			this.$input;

			this.current_page = 1;	//当前页
			this.rows = 10; //每页显示数目

			this.data = null;	//当前内容
			this.search_keyword = ''; //搜索关键字

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

            this.getList(1, $.noop);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
