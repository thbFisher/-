/**
 * 原始题库
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
	var template = require('text!view/exam/tpl/bank.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            'tap .paper-items-control>.btn': 'validAnswer',
			'tap .next': 'nextItem',
			'tap .prev': 'prevItem'
		},
        initPaper: function () {
			$.showLoading('正在获取题库信息');
			businessDelegate.getExamBankDetail({
				typeUuid: this.uuid
            },_.bind(function (data) {
				$.hideLoading();

				this.header.setTitle(data.obj.typeName);

				this.examPaper = data.obj.question;
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
        //比对答案
        validAnswer: function(){
            console.log('验证答案');
            //保存答案
            var answer = _.pluck(this.$('input[name=paper-item]:checked'), 'value');
			this.examPaper[this.examPaperIndex].put_answer = answer;
			this.examPaper[this.examPaperIndex].view_answer = true;

			this.renderItem();
        },
		//值，输入答案，正确答案
		ifValueIn: function(value, arr1, arr2){
			var flag1 = _.find(arr1, function(v){ return v == value; });
			var flag2 = _.find(arr2, function(v){ return v == value; });

			if(flag1 && flag2){
				return true;
			}

			// if(flag1 && !flag2){
			// 	return false;
			// }

			if(!flag1 && flag2){
				return false;
			}

			return -1;
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

			if(!q.view_answer){
				this.$('.prev').addClass('disable');
				this.$('.next').addClass('disable');
			}

			var tpl = _.template(this.itemTemplate)({ q: q, ifValueIn: this.ifValueIn });
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

            //已填写过不展示可回答问题
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
            
            //已填写过不展示可回答问题
			this.renderItem();
		},
		backbutton: function (options) {
			$.closeModal();
			$.confirm('确认退出题库练习吗？', function () {
				Backbone.history.navigate('exam-banklist', { trigger: true });
			}, $.noop);
		},
		initialize: function (options) {
			this.uuid = options.uuid;
            this.header = new AppHeader({
                host: this,
                main: false,
                title: ''
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.$paperContent = this.$('.paper-content');
			this.itemTemplate = $('#question-item-tpl').html();
            
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
			this.nullHTML = '<div class="warning-panel">暂无题库数据</div>';
            
			this.examPaper = [];  //试卷信息
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
