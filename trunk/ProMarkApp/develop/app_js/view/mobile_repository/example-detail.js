/**
*   在线阅读-详细描述
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
	var template = require('text!view/mobile_repository/tpl/example-detail.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .not_like': 'likeArticle',
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap .like_ctrl': 'likeComment',
			'tap #exampleDetail > .content': 'prepareReply',
			'tap .reply_ctrl': 'prepareReplyReply',
			'tap .btn-reply': 'sendReply',
			'tap .btn-reply-reply': 'sendReplyReply'
		},
		//评论点赞
		likeComment: function (e) {
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			//点赞方法
			businessDelegate.likeExample({
				uuid: uuid,
                type: 1
			}, _.bind(function (data) {
				this.renderLike($e);

				var count = new Number($e.find('span').text());
				$e.find('span').text(count + 1);
			}, this), _.bind(function (err) {
				if (err == '已点赞') {
					this.renderLike($e);
				}
			}, this));
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
			this.$('.input-comment').attr('placeholder', '发表一下你的点评吧~');
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
		//一级回复
		sendReply: function () {
			var text = $.trim(this.$('.input-comment').val());

			if (!text) {
				$.jtoast('请填写点评内容');
				return;
			}

			$.showLoading('正在发表');
			businessDelegate.addExampleComment({
				uuid: this.uuid,
				comments: text
			}, _.bind(function (data) {
				$.hideLoading();

				this.viewPage = true;
				this.getList(1);

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
				$.jtoast('请填写点评内容');
				return;
			}

			$.showLoading('正在发表');
			businessDelegate.addExampleReply({
				uuidTwo: this.replyUUID,
				comments: text
			}, _.bind(function (data) {
				$.hideLoading();

				this.viewPage = false;
				this.getList(this.current_page);

				this.prepareReply();
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		viewPage: function (e) {
			this.viewPage = true;
			var page = $(e.currentTarget).data('page');
			this.getList(page);
		},
		getList: function (page) {
			this.current_page = page;
			$.showLoading();
			businessDelegate.getExampleCommentList({
				uuid: this.uuid,
				page: page,
				rows: this.rows
			}, _.bind(function (data) {
				$.hideLoading();

				var tpl = _.template(this.commentTemplate)({ data: data.obj });
				this.$commentWrapper.html(tpl);

				//重新获取评论数
				this.$('.reply_btn > p').html(data.obj.commentsCount);

				if (this.viewPage) {
					this.scrollToCommentTop();
				}
			}, this), _.bind(function (err) {
				$.hideLoading();
				this.$commentWrapper.html(this.errorHTML);
				$.jtoast(err);
			}, this));
		},
		/**
		 * 文章信息
		 */
		likeArticle: function () {
			var $like = this.$('.like_btn');

			businessDelegate.likeExample({
				uuid: this.uuid,
                type: 0
			}, _.bind(function (data) {
				this.renderLike($like);

				var count = parseInt(this.$('.like_btn > p').text()) + 1;
				this.$('.like_btn > p').text(count);
			}, this), _.bind(function (err) {
				if (err == '已点赞') {
					this.renderLike($like);
				}
			}, this));
		},
		getDetail: function () {
			$.showLoading();
			businessDelegate.getExampleDetail({
				uuid: this.uuid
			}, _.bind(function (data) {
				$.hideLoading();
				this.renderDetail(data.obj);
				this.getList(1);
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		renderDetail: function (data) {
			//渲染文章
			var tpl = _.template(this.detailTemplate)(data);
			this.$('.example_wrapper').html(tpl);

			//渲染评论数
			this.$('.reply_btn > p').html(data.commentsCount);

			//渲染点赞数
			this.$('.like_btn > p').html(data.thumbsCount);

			//渲染点赞
			if (data.isThumbs) {
				var $like = this.$('.like_btn');
				$like.removeClass('not_like');
				this.renderLike($like);
			}
		},
		/**
		 * 工具
		 */
		scrollToCommentTop: function () {
			var h1 = this.$('.example_wrapper').height();
			var h2 = this.$('.article_ctrl').height();
			this.$wrapper.scrollTop(h1 + h2);
		},
		renderLike: function ($like) {
			if ($like.find('.fill_love').hasClass('hide')) {
				$like.find('.empty_love').addClass('hide');
				$like.find('.fill_love').removeClass('hide');
			}
		},
		backbutton: function () {
            Backbone.history.navigate('mobile-repository-index/1', { trigger: true });
		},
		initialize: function (options) {
			this.uuid = options.uuid;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '案例详情'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.detailTemplate = this.$('#detailTpl').html();
			this.commentTemplate = this.$('#commentTpl').html();

			this.$wrapper = $('#exampleDetail > .content');
			this.$commentWrapper = this.$('.comment_wrapper');

			this.current_page = 1;	//当前页
			this.rows = 50; //每页显示数目
			this.viewPage = false; //是否在翻阅评论

			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.getDetail();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
