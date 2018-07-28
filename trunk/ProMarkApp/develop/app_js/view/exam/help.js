/**
 * 考试须知
 */

define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/exam/tpl/help.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
		},
		getData: function(callback){
			$.showLoading();
			businessDelegate.getExamHelp(_.bind(function (data) {
				$.hideLoading();
				this.$content.html($.formatText(data.obj));
				callback();
			}, this), _.bind(function (err) {
				$.hideLoading();
				this.$content.html(this.errorHTML);
				$.jtoast(err);
				callback();
			}, this))
		},
		backbutton: function () {
            Backbone.history.navigate('exam-index/work/index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false,
                title: '考试须知'
            });

            this.$el.empty().append(this.header.$el).append(template);

            this.$content = this.$('.exam-info-content');
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			// $('.common-content').pullToRefresh();
			// $('.common-content').on("pull-to-refresh", _.bind(function() {
			// 	  this.getData(function(){
			// 			$('.common-content').pullToRefreshDone();
			// 	  });
			// },this));
		},
		render: function () {
			this.getData($.noop);
			return this;
		}
	});

	return View;
});
