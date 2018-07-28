/**
*   新闻列表
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
	var template = require('text!view/news/tpl/index.html');
	var AppHeader = require('view/app-header');
	var NewsDetail = require('view/news/detail');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            'tap .news-box': 'viewDetail'
		},
        viewDetail: function (e) {
            var uuid = $(e.currentTarget).data('uuid');
			if (!uuid) {
				return;
			}

			// Backbone.history.navigate('news-detail/'+this.type+'/'+uuid, { trigger: true });
			var newsDetail = new NewsDetail({
				type: this.type,
				uuid: uuid
			});
			newsDetail.show();
        },
		getList: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getNewsList({
				page: this.current_page,
				rows: this.rows,
				newType: this.type,
				maxWidth: this._w
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.newsTemplate)({ data: data.obj });
				this.$listContent.html(tpl);

				this.$wrapper.scrollTop(0);

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
			Backbone.history.navigate('index', { trigger: true });
		},
		initialize: function (options) {
			this.type = options.type;

			var title = '';

			switch (this.type) {
				case '1':
					title = '实时新闻';
					break;
				case '2':
					title = '公告通知';
					break;
				case '3':
					title = '任务下达';
					break;
			}

            this.header = new AppHeader({
                host: this,
                main: false,
				title: title
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.newsTemplate = this.$('#news-tpl').html();
			this.noticeTemplate = this.$('#notice-tpl').html();

			this.$listContent = this.$('.news-day-box-wrapper');
			this.$wrapper = this.$('#newsList > div');

			this.current_page = 1;	//当前页
			this.rows = 1; //每页显示数目
			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this._w = $(window).width() - 20;
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
