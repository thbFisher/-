/**
 * 考试记录
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
	var template = require('text!view/exam/tpl/record.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .btn-prev,.btn-next': 'viewPage'
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
		},
        getList: function (page, callback) {
            if (!this.isPullRefresh) {
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getExamRecord({
				page: page,
				rows: this.rows
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.listTemplate)({ data: data.obj });
				this.$content.html(tpl);

				this.$wrapper.scrollTop(0);

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
            Backbone.history.navigate('exam-index/work/index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '考试成绩'
            });

            this.$el.empty().append(this.header.$el).append(template);

            this.listTemplate = this.$('#listTpl').html();
            this.$content = this.$('.list-info-content');
            this.$wrapper = this.$('.common-content > div');

			this.rows = 10; //每页显示数目
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.isPullRefresh = 0;
			//下拉刷新
            this.$wrapper.pullToRefresh();
            this.$wrapper.on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getList(1, _.bind(function () {
					this.$wrapper.pullToRefreshDone();
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
