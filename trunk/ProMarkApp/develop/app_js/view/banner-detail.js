/**
*   新闻详情
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
	var template = require('text!view/tpl/banner-detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
			
		},
		getDetail: function () {
			$.showLoading();
			businessDelegate.getBannerDetail({
				uuid: this.uuid
			}, _.bind(function (data) {
				$.hideLoading();

				//文章内容
				var tpl = _.template(this.contentTemplate)({ data: data.obj });
				this.$content.html(tpl);

			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$content.html(this.errorHTML);
			}, this));
		},
		initialize: function (options) {
			this.uuid = options.uuid;

            this.header = new AppHeader({
                host: this,
                main: false,
				title: '详情'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.contentTemplate = this.$('#news-detail-content-tpl').html();

			this.$content = this.$('.news-detail-content-wrapper');
			this.$wrapper = this.$('.common-content');

			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.getDetail();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
