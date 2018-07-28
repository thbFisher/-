/**
 * 我的错题
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
	var template = require('text!view/exam/tpl/fault.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .next': 'nextItem',
			'tap .prev': 'prevItem'
		},
        initPaper: function () {
			$.showLoading('正在获取错题集');
			businessDelegate.getExamFault(_.bind(function (data) {
				$.hideLoading();

				this.examPaper = data.obj;
				this.examPaperLength = this.examPaper.length;

				if(this.examPaperLength == 0){
					this.$paperContent.html(this.nullHTML);
					return;	
				}

                //渲染题目
                this.renderItem();
			}, this), _.bind(function (err) {
				$.hideLoading();
                $.jtoast(err);
                this.$paperContent.html(this.errorHTML);
			}, this));
        },
		renderItem: function () {
			this.$('.prev').removeClass('disable');
			this.$('.next').removeClass('disable');

			if (this.examPaperIndex == 0) {
				$('.prev').addClass('disable');
			}

			if (this.examPaperIndex == this.examPaperLength - 1) {
				$('.next').addClass('disable');
			}

			var q = this.examPaper[this.examPaperIndex];

			var tpl = _.template(this.itemTemplate)({ q: q });
			this.$paperContent.html(tpl);

			this.$('.exam-index').html((this.examPaperIndex + 1) + '/' + this.examPaperLength);
			this.$paperContent.scrollTop(0);
		},
		prevItem: function (e) {
			var $e = $(e.currentTarget);
			if ($e.hasClass("disable")) {
				return;
			}

			console.log('prev');
			if (this.examPaperIndex == 0) {
				return;
			}

			this.examPaperIndex--;
			this.renderItem();
		},
		nextItem: function (e) {
			var $e = $(e.currentTarget);
			if ($e.hasClass("disable")) {
				return;
			}

			console.log('next');
			if (this.examPaperIndex == this.examPaperLength - 1) {
				return;
			}

			this.examPaperIndex++;
			this.renderItem();
		},
		backbutton: function () {
			$.closeModal();
			$.confirm('确认退出错题集吗？', function () {
				Backbone.history.navigate('exam-index/work/index', { trigger: true });
			}, $.noop);
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false,
                title: '错题集'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.$paperContent = this.$('.paper-content');
			this.itemTemplate = $('#question-item-tpl').html();
            
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
			this.nullHTML = '<div class="warning-panel">暂无错题数据</div>';
            
			this.examPaper = []; //试卷信息
			this.examPaperLength = 0;	//题目总数
			this.examPaperIndex = 0;	//当前题目
		},
		render: function () {
            this.initPaper();
			return this;
		}
	});

	return View;
});
