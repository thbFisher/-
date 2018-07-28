/**
 * 考试首页
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
	var template = require('text!view/exam/tpl/index.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .list > div': 'viewPage',
			'tap .btn-exam-start.active': 'viewPaper'
		},
		viewPaper: function(){
			Backbone.history.navigate('exam-paper/'+this.data.examUUID, { trigger: true });
		},
		viewPage: function (e) {
			var $e = $(e.currentTarget);
			var href = $e.data().href;

			Backbone.history.navigate(href, { trigger: true });
		},
		getData: function(){
			$.showLoading();
			businessDelegate.getExam(_.bind(function (data) {
				$.hideLoading();

				//没有考试
				if(data.obj.count == 0){
					return;
				}

				this.data = data.obj;

				//有考试
				var tpl = _.template(this.boardTemplate)(data.obj);
				this.$boardText.html(tpl);

				this.$startBtn.addClass('active').find('p').html('开始考试');

			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this))
		},
		backbutton: function () {
            Backbone.history.navigate('work', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '评测考试'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.boardTemplate = this.$('#examBoardTpl').html();
			this.$boardText = this.$('.exam-board-text');
			this.$startBtn = this.$('.btn-exam-start');

			this.data = null;
		},
		render: function () {
			this.getData();
			return this;
		}
	});

	return View;
});
