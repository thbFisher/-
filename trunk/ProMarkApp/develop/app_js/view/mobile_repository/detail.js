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
	var template = require('text!view/mobile_repository/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var GetShare = require('view/get-share');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .base_img > .img': 'showImage',
			'tap .close_question_btn': 'closeQuestion',
			'tap .common-header .answer': 'shareQuestion',
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap #mobileRepositoryDetail > .content': 'prepareReply',
			'tap .reply_ctrl': 'prepareReplyReply',
			'tap .btn-reply': 'sendReply',
			'tap .btn-reply-reply': 'sendReplyReply',

			'tap .like_ctrl': 'settingBest'
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

					this.viewPage = true;
					this.getDetail(1);
				}, this), _.bind(function (err) {
					$.hideLoading();
					$.jtoast(err);
				}, this));
			}, this), $.noop);
		},
		prepareReply: function () {
			if (this.$('.btn-reply-reply').length) {
				this.$('.btn-reply-reply').removeClass('btn-reply-reply').addClass('btn-reply');
			} else {
				return;
			}

			this.replyUUID = '';
			this.replyName = '';

			this.$('.input-comment').val('');
			this.$('.input-comment').attr('placeholder', '请写下您的回答吧~');
		},
		prepareReplyReply: function (e) {
			var $e = $(e.currentTarget);
			this.replyUUID = $e.data('uuid');
			this.replyName = $e.data('name');

			this.$('.input-comment').val('');
			this.$('.input-comment').attr('placeholder', '回复' + this.replyName);

			if (this.$('.btn-reply').length) {
				this.$('.btn-reply').removeClass('btn-reply').addClass('btn-reply-reply');
			}

			return false;
		},
		//一级回复，回复问题答案
		sendReply: function () {
			var text = $.trim(this.$('.input-comment').val());

			if (!text) {
				$.jtoast('请填写回答内容');
				return;
			}

			$.showLoading('正在提交');
			businessDelegate.addKnowledgeAnswer({
				queUuid: this.uuid,
				contentImgJson: [],
				content: text
			}, _.bind(function (data) {
				$.hideLoading();

				this.viewPage = true;
				this.getDetail(1);

				this.$('.input-comment').val('');
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		//二级回复
		sendReplyReply: function () {
			var text = $.trim(this.$('.input-comment').val());
			if (!text) {
				$.jtoast('请填写回复内容');
				return;
			}

			$.showLoading('正在提交');
			businessDelegate.addKnowledgeAnswerComment({
				anUuid: this.replyUUID,
				commentContent: text
			}, _.bind(function (data) {
				$.hideLoading();

				this.viewPage = true;
				this.getDetail(this.current_page);

				this.prepareReply();
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		/**
		 * 操作
		 */
		//关闭问题，禁止回复和评论，可转发
		closeQuestion: function (e) {
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			$.confirm('确认关闭该问题吗', _.bind(function () {
				$.showLoading('正在关闭');
				businessDelegate.closeKnowledgeQuestion({
					queUuid: uuid
				}, _.bind(function (data) {
					$.hideLoading();
					this.getDetail(1);
				}, this), _.bind(function (err) {
					$.hideLoading();
					$.jtoast(err);
				}, this));
			}, this), $.noop);
		},
		showImage: function (e) {	//展示图片
			var $e = $(e.currentTarget);

			var index = $e.index('.base_img > .img');

			var arr = _.pluck($e.parent().find('img'), 'src');

			this.pb = $.photoBrowser({
				items: arr,
				onOpen: _.bind(function () {
					this.isPb = 1;
				}, this),
				onClose: _.bind(function () {
					this.isPb = 0;
				}, this),
                initIndex: index
			});

			this.pb.open();
		},
		shareQuestion: function () {	//分享问题
			var question = $.trim(this.$('.base_title > h3').text());
			var view = new GetShare({
				queUuid: this.uuid,
				anUuid: '',
				question: question
			});
			view.show();
		},
		scrollToCommentTop: function () {
			var h = this.$('.question_content').height();
			this.$wrapper.scrollTop(h);
		},
		/**
		 * 列表操作
		 */
		viewPage: function (e) {	//翻页
			this.viewPage = true;
			var page = $(e.currentTarget).data('page');
			this.getDetail(page);
		},
		getDetail: function (page) {
			this.current_page = page;

			$.showLoading();

			businessDelegate.getKnowledgeAnswers({
				queUuid: this.uuid,
				page: this.current_page,
				rows: this.rows,
				maxWidth: 120
			}, _.bind(function (data) {
				$.hideLoading();

				this.status = data.obj.know.queStatus;
				// this.status = 1;
				if (data.obj.know.queStatus) {
					//已关闭
					this.canAnswer = 0;
					this.$('.form').hide();
					this.$wrapper.addClass('full');
				} else {
					//未关闭
					this.canAnswer = 1;
					this.$('.form').show();
					this.$wrapper.removeClass('full');
				}

				if (page == 1 && data.obj.an.rows.length && data.obj.an.rows[0].isGood) {
					this.hasBest = 1;
				}

				var tpl = _.template(this.detailTemplate)({ data: data.obj, hasBest: this.hasBest });
				this.$wrapper.html(tpl);

				if (this.viewPage) {
					this.scrollToCommentTop();
				}
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$wrapper.html(this.errorHTML);
			}, this));
		},
		backbutton: function () {
			//有对话框无法回退
			if (this.$('.weui_dialog').length > 0) {
				return;
			}

			//有图片展示框
			if (this.isPb) {
				this.pb.close();
				return;
			}

			var str = '';
			
			//从我的回答或我的提问进入专用通道
            if (this.history == 'mobile-repository-my' && this.type) {
				var arr = this.type.split('_');
                var str = '/' + arr[0] + '/' + this.status;
            }
			if("0" == this.type){
				this.backHref = "mobile-repository-index/0/work/index"
			}else{
				this.backHref = "mobile-repository-index/1/work/index"
			}
            // this.backHref = this.history + str;

            Backbone.history.navigate(this.backHref, { trigger: true });
		},
		initialize: function (options) {
            this.uuid = options.uuid;
            this.history = options.history;
			this.type = options.type;
			
			if (this.history == 'mobile-repository-my' && this.type) {
				var arr = this.type.split('_');
				this.status = arr[1];
            }

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '基础知识详情'
            });

            this.header.setRightBtn('<span class="answer text">分享</span>');

            this.$el.empty().append(this.header.$el).append(template);
			this.detailTemplate = this.$('#detailTpl').html();

			this.$wrapper = this.$('#mobileRepositoryDetail > .content');

			this.current_page = 1;	//当前页
			this.rows = 50; //每页显示数目
			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.isPb = 0; //是否开启图片展示
			this.canAnswer = 0;	//是否可以回答问题
			this.hasBest = 0;
			this.viewPage = false; //是否在翻阅评论

			this.getDetail(1);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
