/**
*   在线阅读-资料评论
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
	var template = require('text!view/read/tpl/comment.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap .add-comment': 'prepareAddReadComment',
			'tap .add-like': 'likeRead',
			'tap .comment-view': 'prepareReplyReadComment',
			'tap .reply-read': 'replyRead',
			'tap .comment-like': 'likeReadComment',
			'tap .comment-reply-like': 'likeReadCommentReply',
			'tap .reply-comment': 'replyComment',
			'tap .comment-sub-more': 'viewMore'
		},
		//准备回复资料
		prepareAddReadComment: function(){
			this.$commentReplyForm.val('').attr('placeholder', '说点什么');

			this.$btnReply.removeClass('reply-comment').addClass('reply-read').data('uuid', this.uuid);;
		},
		//回复资料
		replyRead: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			if(!uuid){
				uuid = this.uuid;
			}
			console.log('回复资料'+uuid);

			if (!this.data) {
				console.log('无法操作');
				return;
			}

			var text = $.trim(this.$commentReplyForm.val());
			if(!text){
				$.jtoast('请输入回复内容');
				return;
			}

			$.showLoading('正在提交评论');
			businessDelegate.addReadComment({
				coursewareUuid: uuid,
        		comments: text
			}, _.bind(function(data){
				$.hideLoading();
				this.prepareAddReadComment();
				this.getDetail(1, $.noop);
			},this), _.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
			},this));
		},
		//资料点赞
		likeRead: function(e){
			var $e = $(e.currentTarget);

			//this.uuid
			console.log('资料点赞'+this.uuid);
			//点赞方法
			businessDelegate.likeReadDetail({
				coursewareUuid: this.uuid
			}, _.bind(function (data) {
				$e.removeClass('btn-default').addClass('btn-primary');
			}, this), _.bind(function (err) {
				if(err == '已点赞'){
					$e.removeClass('btn-default').addClass('btn-primary');
				}
			}, this));
		},
		//准备回复评论
		prepareReplyReadComment: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			var id = $e.data('id');

			var comment = _.find(this.data.list.rows, function(o){
				return o.uuid == uuid;
			});

			this.$commentReplyForm.val('').attr('placeholder', '回复 ' + id + ' ' + comment.name);

			this.$btnReply.removeClass('reply-read').addClass('reply-comment').data('uuid', uuid);
		},
		//回复评论
		replyComment: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			if(!uuid){
				$.jtoast('无法回复');
				return;
			}
			console.log('回复评论'+uuid);

			if (!this.data) {
				console.log('无法操作');
				return;
			}

			var text = $.trim(this.$commentReplyForm.val());
			if(!text){
				$.jtoast('请输入回复内容');
				return;
			}

			$.showLoading('正在提交回复');
			businessDelegate.addReadCommentReply({
				commentsUuid: uuid,
        		comments: text
			}, _.bind(function(data){
				$.hideLoading();
				this.prepareAddReadComment();
				this.getDetail(this.current_page, $.noop);
			},this), _.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
			},this));
		},
		//评论点赞
		likeReadComment: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			var $icon =  $e.find('.iconfont');
			
			console.log('资料评论点赞'+uuid);

			//点赞方法
			businessDelegate.likeReadComment({
				commentsUuid: uuid
			}, _.bind(function (data) {
				$e.find('.iconfont').removeClass('icon-dianzan1').addClass('icon-dianzan');
				var count = new Number($e.find('span').text());
				$e.find('span').text(count+1);
			}, this), _.bind(function (err) {
				if(err == '已点赞'){
					$e.find('.iconfont').removeClass('icon-dianzan1').addClass('icon-dianzan');
				}
			}, this));
		},
		//评论回复点赞
		likeReadCommentReply: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			
			console.log('资料评论回复点赞'+uuid);

			//点赞方法
			businessDelegate.likeReadCommentReply({
				commentsSecondaryUuid: uuid
			}, _.bind(function (data) {
				$e.find('.iconfont').removeClass('icon-dianzan1').addClass('icon-dianzan');
				var count = new Number($e.find('span').text());
				$e.find('span').text(count+1);
			}, this), _.bind(function (err) {
				if(err == '已点赞'){
					$e.find('.iconfont').removeClass('icon-dianzan1').addClass('icon-dianzan');
				}
			}, this));
		},
		viewMore: function(e){
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			Backbone.history.navigate('read-more/' + this.uuid + '/' + uuid, { trigger: true });
		},
		viewPage: function(e){
			var page = $(e.currentTarget).data('page');
			this.getDetail(page, $.noop);
		},
		getDetail: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.readCommentsList({
				commentsUuid: this.uuid,
				page: page,
				rows: this.rows
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				this.data = data.obj;

				var tpl = _.template(this.commentTemplate)({ data: data.obj });
				this.$content.html(tpl);

				this.$wrapper.scrollTop(0);

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				this.$content.html(this.errorHTML);
				$.jtoast(err);

				callback();
			}, this));
		},
		backbutton: function () {
            Backbone.history.navigate('read-detail/' + this.uuid, { trigger: true });
		},
		initialize: function (options) {
			this.uuid = options.uuid;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '评论'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.current_page = 1;	//当前页
			this.rows = 5; //每页显示数目
			this.data = null;

			this.commentTemplate = this.$('#commentTpl').html();
			this.$content = this.$('.comment-content');
			this.$wrapper = this.$('.common-content');
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		
			this.$commentReplyForm = this.$('.comment-reply-form');
			this.$btnReply = this.$('.btn-reply');

			this.isPullRefresh = 0;
		},
		render: function () {
			this.$wrapper.pullToRefresh();
            this.$wrapper.on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getDetail(1, _.bind(function () {
					this.$wrapper.pullToRefreshDone();
				}, this));
			}, this));

			this.getDetail(1, $.noop);
			return this;
		}
	});

	return View;
});