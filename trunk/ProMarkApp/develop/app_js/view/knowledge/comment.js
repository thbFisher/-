/**
*   知识库提问
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
	var template = require('text!view/knowledge/tpl/comment.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
			'tap .btn-prev,.btn-next': 'viewPage'
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page);
		},
        getList: function(page){
			this.current_page = page;

            $.showLoading();
            businessDelegate.getKnowledgeAnswerComment({
				anUuid: this.uuid,
				page: this.current_page,
				rows: this.rows
			}, _.bind(function (data) {
				$.hideLoading();
				var tpl = _.template(this.commentTemplate)({data: data.obj});
				this.$content.html(tpl);

				this.$content.scrollTop(0);
			}, this), _.bind(function (err) {
                $.hideLoading();
				$.jtoast(err);
				this.$listContent.html(this.errorHTML);
			}, this));
        },
		initialize: function (options) {
            this.uuid = options.uuid;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '更多评论'
            });

            this.rows = 10;
            this.current_page = 1;

            this.$el.empty().append(this.header.$el).append(template);

			this.$content = this.$('.knowledge-comment-content');
			this.commentTemplate = this.$('#commentTpl').html();
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
            this.getList(1);
			return this;
		}
	});

	return View;
});
