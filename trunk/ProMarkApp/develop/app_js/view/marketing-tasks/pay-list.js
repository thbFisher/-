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
	var template = require('text!view/online_marketing/tpl/_pay-list.html');
    var Detail = require('view/online_marketing/pay-detail');

	var View = Backbone.View.extend({
		el: '.content-content',
        events: {
            'tap .pay_box > li': 'viewDetail'
		},
        viewDetail: function(e){
            var uuid = $(e.currentTarget).data('uuid');
            var view = new Detail({
                uuid: uuid
            });
            view.show();
        },
		getMonth: function (callback) {
			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getMarketingPayMonthByChannel({
				uuid: this.options.uuid
			}, _.bind(function (data) {
				var tpl = _.template(this.listTemplate)({ list: data.obj });
				this.$listContent.html(tpl);
				this.$listWrapper.scrollTop(0);

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				callback();
			}, this), _.bind(function (err) {
				$.jtoast(err);
				this.$listContent.html(this.errorHTML);

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				callback();
			}, this));
		},
		initialize: function (options) {
            this.options = options;

			if(!window.user.queryFee){
				this.$el.empty().append('<div class="warning-panel">您没有权限查看</div>');
                return;
			}

            this.$el.empty().append(template);

            this.$listWrapper = this.$('#payListContent > div');
			this.$listContent = this.$('.pay_wrapper');
			this.listTemplate = this.$('#listTpl').html();

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			//下拉刷新
            this.$listWrapper.pullToRefresh();
            this.$listWrapper.on("pull-to-refresh", _.bind(function () {
                this.isPullRefresh = 1;
                this.getMonth(_.bind(function () {
                    this.$listWrapper.pullToRefreshDone();
                }, this));
            }, this));

            this.getMonth($.noop);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
