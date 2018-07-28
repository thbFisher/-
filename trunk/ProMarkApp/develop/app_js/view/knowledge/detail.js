/**
*   问题详情
*	关闭问题：当user为提问人时展示
*	设置最佳：当user为提问人，且user不是回答人,且没有最佳答案时显示
**/

define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

    require('touch');
	require('swiper');
	require('jquery-weui');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/knowledge/tpl/detail.html');
	var AppHeader = require('view/app-header');
	// var AnswerView = require('view/knowledge/answer');
	var GetShare = require('view/get-share');
	var Comment = require('view/knowledge/comment');
	// var SlidePage = require('view/slide-page');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .answer': 'showAnswerPanel',
			'tap .view-answer': 'viewAnswer',
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap .answer-control .iconfont': 'showControl',
			'tap .common-content': 'hideControl',
			'tap .comment-more': 'showMoreComment',
			'tap .btn-comment': 'showCommentForm',
			'tap .btn-send': 'sendComment',
			'tap .btn-setting': 'settingBest',
			'tap .image > img': 'showImage',
			'tap .btn-close-question': 'closeQuestion',
			'tap .share-question': 'shareQuestion',
			'tap .btn-share': 'shareAnswser'
		},
		/**
		 * 操作
		 */
		closeQuestion: function(e){	//关闭问题，禁止回复和评论，可转发
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			$.confirm('确认关闭该问题吗', _.bind(function () {
				$.showLoading('正在关闭');
				businessDelegate.closeKnowledgeQuestion({
					queUuid: uuid
				}, _.bind(function(data){
					$.hideLoading();
					this.t = 0;
					this.getDetail(1, $.noop);
				},this), _.bind(function(err){
					$.hideLoading();
					$.jtoast(err);
				},this));
			}, this), $.noop);
		},
		settingBest: function(e){	//设置最佳答案，设置成功后不可更改
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			$.confirm('确认设置该答案为最佳答案吗', _.bind(function () {
				//设置最佳答案
				$.showLoading('正在设置');
				businessDelegate.setKnowledgeBestAnswer({
					anUuid: uuid
				}, _.bind(function () {
					$.hideLoading();
					$.toast('设置成功');

					this.t = 0;
					this.getDetail(1, _.bind(function(){
						this.hideControl();
					}, this));
				}, this), _.bind(function (err) {
					$.hideLoading();
					$.jtoast(err);
				}, this));
			}, this), $.noop);
		},
		refreshQuestionShareCount: function($e){
			var $queShareCount = this.$('.knowledge-question-content .control .share > span');

			var que_count = $queShareCount.text();
			$queShareCount.text(parseInt(que_count)+1);
		},
		shareQuestion: function(){	//分享问题
			var question = $.trim(this.$('.knowledge-question-content .text').text());
			var view = new GetShare({
				queUuid: this.uuid,
				anUuid: '',
				question: question
			});
			view.show();
			view.on('refreshQuestionShareCount', _.bind(this.refreshQuestionShareCount,this));
			this.hideControl();
		},
		refreshAnswerShareCount: function($e){
			var $shareCount = $e.parent().parent().parent().find('.share > span');
			var $queShareCount = this.$('.knowledge-question-content .control .share > span');

			var count = $shareCount.text();
			$shareCount.text(parseInt(count)+1);

			var que_count = $queShareCount.text();
			$queShareCount.text(parseInt(que_count)+1);
		},
		shareAnswser: function(e){	//分享问题及答案
			var $e = $(e.currentTarget);
			
			var question = $.trim(this.$('.knowledge-question-content .text').text());
			var anUUID = $e.data('anuuid');
			var queUUID = $e.data('queuuid');
			
			var view = new GetShare({
				queUuid: queUUID,
				anUuid: anUUID,
				e: $e,
				question: question
			});
			view.show();
			view.on('refreshAnswerShareCount', _.bind(this.refreshAnswerShareCount,this));
			this.hideControl();
		},
		sendComment: function (e) {	//发送评论
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			var best = $e.data('best');

			if (!uuid) {
				$.jtoast('无法评论');
				this.hideControl();
				return;
			}

			var text = $.trim(this.$('.input-comment').val());
			if (!text) {
				$.jtoast('请说些什么');
				return;
			}

			this.refreshPos = best;

			//发送评论
			$.showLoading('正在提交评论');
			businessDelegate.addKnowledgeAnswerComment({
				anUuid: uuid,
				commentContent: text
			}, _.bind(function () {
				$.hideLoading();
				$.toast('评论成功');
				this.getDetail(1, _.bind(function () {
					this.hideControl();
					this.refreshPos = 0;
				}, this));
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.refreshPos = 0;
			}, this))
		},
		/**
		 * 展示界面
		 */
		showMoreComment: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			// var uuid = 'f1d971ec-e02d-4bd7-806c-29149a1e981e';

			var view = new Comment({
				uuid: uuid
			});
			view.show();
		},
		showCommentForm: function (e) {	//打开评论操作面板
			this.hideControl();

			//展示评论表单
			this.$wrapper.css('overflow', 'hidden');
			this.$('.comment-form').show();
			this.$('.input-comment').focus();

			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			var best = $e.data('best');
			this.$('.btn-send').data('uuid', uuid).data('best', best);

			return false;
		},
		showControl: function (e) {	//打开答案操作面板
			var $e = $(e.currentTarget);
			var $p = $e.parent();

			if ($p.find('.btn-groups').css('display') == 'flex') {
				this.$('.btn-groups').css('display', 'none');
			} else {
				this.$('.btn-groups').css('display', 'none');
				$p.find('.btn-groups').css('display', 'flex');
			}
			return false;
		},
		hideControl: function () {	//清除所有操作面板
			this.$('.btn-groups').css('display', 'none');
			this.$('.input-comment').val('');
			this.$('.comment-form').hide();
			this.$('.btn-send').data('uuid', '');
			this.$wrapper.css('overflow', 'auto');
			this.$('.answer-panel-wrapper').removeClass('active');
		},
		viewPage: function (e) {	//翻页
			var page = $(e.currentTarget).data('page');
			this.getDetail(page, $.noop);
		},
		showImage: function(e){	//展示图片
			var $e = $(e.currentTarget);
			var $p = $e.parent();

			var index = $e.index();

			var arr = _.pluck($p.find('img'),'src');

			this.pb = $.photoBrowser({
				items: arr,
				onOpen:  _.bind(function(){
					this.isPb = 1;
				},this),
				onClose: _.bind(function(){
					this.isPb = 0;
				},this),
                initIndex: index
			});

			this.pb.open();
		},
		showAnswerPanel: function(){
			if(this.$('.answer-panel-wrapper').hasClass('active')){
				this.$('.answer-panel-wrapper').removeClass('active');
			}else{
				this.$('.answer-panel-wrapper').addClass('active');
			}
		},
		viewAnswer: function () {
			if(!this.canAnswer){
				$.jtoast('该问题不能进行回答');
				return;
			}

			Backbone.history.navigate('knowledge-answer/' + this.uuid + '/' + this.history, { trigger: true });

			// this.hideControl();

			// var view = new AnswerView({
			// 	history: this.history,
			// 	uuid: this.uuid
			// });
			// view.show();

			// view.on('refresh', _.bind(function(){
			// 	this.getDetail(1, $.noop);
			// },this));
		},
		getDetail: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$wrapper.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			var _w = $(window).width();
			businessDelegate.getKnowledgeAnswers({
				queUuid: this.uuid,
				page: this.current_page,
				rows: this.rows,
				maxWidth: _w
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				//第一页查看是否有最佳答案
				var hasBest = 0;

				if (page == 1) {
					if (data.obj.an.rows.length > 0 && data.obj.an.rows[0].isGood) {
						hasBest = 1;
					}
				}

				if(data.obj.know.queStatus){
					//已关闭
					this.canAnswer = 0;
				}else{
					//未关闭
					this.canAnswer = 1;
				}

				data.obj.hasBest = hasBest;

				var tpl = _.template(this.detailTemplate)(data.obj);
				this.$wrapper.html(tpl);

				//只滚动到答案显示区域
				if(!this.t){
					this.$content.scrollTop(0);
					this.t = this.$('#blank').offset().top;	//答案位移
					if(hasBest){
						this.t1 = this.$('#blank1').offset().top; //有最佳答案时的其他回答位移
					}else{
						this.t1 = this.t;
					}
					
				}else{
					if(this.refreshPos == 1){
						this.$content.scrollTop(this.t - 42);
					}else{
						if(hasBest == 1){
							this.$content.scrollTop(this.t1 - 42);
						}else{
							this.$content.scrollTop(this.t - 42);
						}
					}
				}

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				$.jtoast(err);
				this.$wrapper.html(this.errorHTML);
				
				callback();
			}, this));
		},
		backbutton: function () {
			//有对话框无法回退
			if(this.$('.weui_dialog').length > 0){
				return;
			}

			//有图片展示框
			if(this.isPb){
				this.pb.close();
				return;
			}

			// this.back();
            Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function (options) {
            this.uuid = options.uuid;
            this.history = options.history;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '查看问题'
            });

            this.header.setRightBtn('<span class="answer"><i class="iconfont icon-fontDa"></i></span>');

            this.$el.empty().append(this.header.$el).append(template);

			this.detailTemplate = this.$('#detailTpl').html();
			this.current_page = 1;	//当前页
			this.rows = 5; //每页显示数目
			this.$wrapper = this.$('.knowledge-info-content');
			this.$content = this.$('.knowledge-detail-content');
			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.isPb = 0; //是否开启图片展示
			this.t = 0;	//答案位移
			this.canAnswer = 0;	//是否可以回答问题
			this.refreshPos = 0; //#0 blank/#1  blank1
		},
		render: function () {
			//下拉刷新
            this.$content.pullToRefresh();
            this.$content.on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				//刷新到第一页顶部
				this.getDetail(1, _.bind(function () {
					this.hideControl();
					this.$content.pullToRefreshDone();
					this.$content.scrollTop(0);
				}, this));
			}, this));

			this.getDetail(1, $.noop);
			return this;
		}
	});

	return View;
});
