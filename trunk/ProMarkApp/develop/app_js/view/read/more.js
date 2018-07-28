/**
*   在线阅读-更多评论
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
	var template = require('text!view/read/tpl/more.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap .comment-reply-like': 'likeReadCommentReply',
			'tap .btn-reply': 'replyComment'
		},
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
		replyComment: function(){
			console.log('回复评论' + this.commentUUID);

			if(!this.commentUUID){
				$.jtoast('无法回复');
				return;
			}

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
				commentsUuid: this.commentUUID,
        		comments: text
			}, _.bind(function(data){
				$.hideLoading();
				this.$commentReplyForm.val('');
				this.getDetail(1);
			},this), _.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
			},this));
		},
		viewPage: function(e){
			var page = $(e.currentTarget).data('page');
			this.getDetail(page);
		},
		getDetail: function (page) {
			$.showLoading();
			businessDelegate.readCommentReplyList({
				commentsUuid: this.commentUUID,
				page: page,
				rows: this.rows
			}, _.bind(function (data) {
				$.hideLoading();

				this.data = data.obj;

				var tpl = _.template(this.commentReplyTemplate)({ data: data.obj });
				this.$content.html(tpl);

				this.$content.scrollTop(0);
			}, this), _.bind(function (err) {
				$.hideLoading();
				this.$content.html(this.errorHTML);
				$.jtoast(err);
			}, this));
		},
		backbutton: function () {
            Backbone.history.navigate('read-comment/'+this.uuid, { trigger: true });
		},
		initialize: function (options) {
			this.uuid = options.uuid;
			this.commentUUID = options.commentUUID;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '更多评论'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.commentReplyTemplate = this.$('#commentReplyTpl').html();
			this.$content = this.$('.common-content');
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
			
			this.$commentReplyForm = this.$('.comment-reply-form');

			this.rows = 5; //每页显示数目
			this.data = null;
		},
		render: function () {
			this.getDetail(1);
			return this;
		}
	});

	return View;
});