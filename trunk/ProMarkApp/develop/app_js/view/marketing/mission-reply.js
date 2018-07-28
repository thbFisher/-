/**
 * 任务详情
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
	var template = require('text!view/marketing/tpl/mission-reply.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
			'tap .btn-submit': 'submit'
		},
		submit: function(){
			var s = this.$('input[name=input-simple]:checked').val();
			var t = $.trim(this.$('.input-text').val());
			
			$.showLoading();
			businessDelegate.replyMissionTarget({
				uuid: this.options.uuid,
				userResult: s,
				userFeedback: t
			}, _.bind(function (data) {
				$.hideLoading();
				$.toast('提交成功');

				setTimeout(_.bind(function(){
					this.trigger('render');
					this.back();
				},this), 1000);
			}, this), _.bind(function (err) {
				$.hideLoading();
			}, this));
		},
		getDetail: function(){
			$.showLoading();
			businessDelegate.getMissionTargetDetail({
				uuid: this.options.uuid
			}, _.bind(function (data) {
				var tpl = _.template(this.detailTemplate)(data.obj);
				this.$content.html(tpl);
				this.$content.height(this.$content.height());
				$.hideLoading();
			}, this), _.bind(function (err) {
				this.$content.html(this.errorHTML);
				$.jtoast(err);
				$.hideLoading();
			}, this));
		},
		initialize: function (options) {
            this.options = options;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '任务反馈'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.detailTemplate = this.$('#detailTpl').html();
			this.$content = this.$('.common-content');
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.getDetail();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
