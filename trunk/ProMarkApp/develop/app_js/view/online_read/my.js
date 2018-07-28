/**
 * 阅读记录
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
	var template = require('text!view/online_read/tpl/my.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
			'tap .btn-prev,.btn-next': 'viewPage'
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
		},
		getList: function (page) {
			this.current_page = page;

			$.showLoading();
			businessDelegate.myReadList({
				page: this.current_page,
				rows: this.rows
			}, _.bind(function (data) {
				$.hideLoading();

				var tpl = _.template(this.listTemplate)({ data: data.obj});
				this.$listContent.html(tpl);

				this.$listContent.scrollTop(0);
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$listContent.html(this.errorHTML);
			}, this));
		},
		initialize: function (options) {
            this.options = options;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '阅读记录'
            });

            this.$el.empty().append(this.header.$el).append(template);

            this.$listContent = this.$('.read_wrapper');
			this.listTemplate = this.$('#listTpl').html();

            this.current_page = 1;	//当前页
			this.rows = 10; //每页显示数目
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
			this.getList(1);
			return this;
		}
	});

	return View;
});
