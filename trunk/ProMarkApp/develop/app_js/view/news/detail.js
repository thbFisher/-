/**
*   新闻详情
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
	var template = require('text!view/news/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		// el: 'body',
        events: {
			'tap .btn-reply': 'sendReply',
			'tap .btn-reply-reply': 'sendReplyReply',
			'tap .reply-reply': 'prepareReplyReply',
			'tap #newsDetail > .inner': 'prepareReply',
			'tap .btn-prev,.btn-next': 'viewPage',
		},
		prepareReply: function(){
			if(this.$('.btn-reply-reply').length){
				this.$('.btn-reply-reply').removeClass('btn-reply-reply').addClass('btn-reply');
			}else{
				return;
			}

			this.replyUUID = '';
			this.replyName = '';
			
			this.$('.input-comment').val('');
			this.$('.input-comment').attr('placeholder', '发表一下你的点评吧~');

		},
		prepareReplyReply: function(e){
			var $e = $(e.currentTarget);
			this.replyUUID = $e.data('uuid');
			this.replyName = $e.data('name');

			this.$('.input-comment').val('');
			this.$('.input-comment').attr('placeholder', '回复'+this.replyName);

			if(this.$('.btn-reply').length){
				this.$('.btn-reply').removeClass('btn-reply').addClass('btn-reply-reply');
			}

			return false;
		},
		sendReply: function(){
			var text = $.trim(this.$('.input-comment').val());
			if(!text){
				$.jtoast('请填写点评内容');
				return;
			}

			$.showLoading('正在发表');
			businessDelegate.addNewsComment({
				uuid: this.uuid,
				content: text
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
		sendReplyReply: function(){
			var text = $.trim(this.$('.input-comment').val());
			if(!text){
				$.jtoast('请填写点评内容');
				return;
			}

			$.showLoading('正在发表');
			businessDelegate.addSubNewsComment({
				uuid: this.replyUUID,
				content: text
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
		getDetail: function () {
			$.showLoading();
			businessDelegate.getNewsDetail({
				uuid: this.uuid
			}, _.bind(function (data) {
				$.hideLoading();

				//文章内容
				var tpl = _.template(this.contentTemplate)({ data: data.obj });
				this.$content.html(tpl);

				//评论数
				this.$('.news-detail-comment-sum > span').html(data.obj.commentsSum);

				//获取评论
				this.getList(1);
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$content.html(this.errorHTML);
			}, this));
		},
		viewPage: function(e){
			this.viewPage = true;
			var page = $(e.currentTarget).data('page');
			this.getList(page);
		},
		getList: function (page) {
			this.current_page = page;
			$.showLoading();
			businessDelegate.getNewsComments({
				uuid: this.uuid,
				page: page,
				rows: this.rows
			}, _.bind(function (data) {
				$.hideLoading();

				var tpl = _.template(this.commentTemplate)({ data: data.obj });
				this.$comment.html(tpl);
				
				if(this.viewPage){
					this.scrollToCommentTop();
				}
				
			}, this), _.bind(function (err) {
				$.hideLoading();
				this.$comment.html(this.errorHTML);
				$.jtoast(err);
			}, this));
		},
		scrollToCommentTop: function(){
			var h = this.$content.height();
			this.$wrapper.scrollTop(h);
		},
		// backbutton: function () {
		// 	Backbone.history.navigate('news-index/' + this.type, { trigger: true });
		// },
		initialize: function (options) {
			this.type = options.type;
			this.uuid = options.uuid;

			var title = '';

			switch (this.type) {
				case '1':
					title = '新闻详情';
					break;
				case '2':
					title = '公告详情';
					break;
				case '3':
					title = '任务详情';
					break;
			}

            this.header = new AppHeader({
                host: this,
                main: false,
				title: title
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.current_page = 1;	//当前页
			this.rows = 50; //每页显示数目
			this.viewPage = false; //是否在翻阅评论

			this.contentTemplate = this.$('#news-detail-content-tpl').html();
			this.commentTemplate = this.$('#news-detail-comment-tpl').html();

			this.$content = this.$('.news-detail-content-wrapper');
			this.$comment = this.$('.news-detail-reply');
			this.$wrapper = this.$('.common-content');

			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.getDetail();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
