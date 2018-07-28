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
	var template = require('text!view/read/tpl/detail.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .add-like': 'addLike',
			'tap .show-comment': 'viewComment'
		},
		addLike: function () {
			if (this.$like.hasClass('active')) {
				console.log('已点赞');
				return;
			}

			//点赞方法
			businessDelegate.likeReadDetail({
				coursewareUuid: this.uuid
			}, _.bind(function (data) {
				this.renderLike();
				var count = parseInt(this.$('.like-count').text()) + 1;
				this.$('.like-count').text(count);
			}, this), _.bind(function (err) {
				if(err == '已点赞'){
					this.renderLike();
				}
			}, this));
		},
		viewComment: function () {
			Backbone.history.navigate('read-comment/' + this.uuid, { trigger: true });
		},
		getDetail: function () {
			$.showLoading();
			businessDelegate.readDetail({
				coursewareUuid: this.uuid
			}, _.bind(function (data) {
				$.hideLoading();
				this.renderDetail(data.obj);
			}, this), _.bind(function (err) {
				$.hideLoading();
				this.$content.html(this.errorHTML);
				$.jtoast(err);
			}, this));
		},
		renderDetail: function (data) {
			data.courDetails = $.formatText(data.courDetails);

			var tpl = _.template(this.detailTemplate)({ data: data });
			this.$content.html(tpl);

			this.$('.materials-detail-control').removeClass('disabled');

			this.$('.comment-count').text('(' + data.commentsCount + ')');
			this.$('.like-count').text(data.thumbsCount);

			if (data.isThumbs) {
				this.renderLike();
			}
		},
		renderLike: function () {
			this.$like.addClass('active');
			this.$like.find('span:eq(0)').html('已赞');
			this.$like.find('.iconfont').removeClass('icon-dianzan1').addClass('icon-dianzan');
		},
		backbutton: function () {
            Backbone.history.navigate('read-info/' + this.uuid+'/false', { trigger: true });
		},
		initialize: function (options) {
			this.uuid = options.uuid;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '资料详情'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.detailTemplate = this.$('#detailTpl').html();
			this.$content = this.$('.common-content');
			this.$like = this.$('.add-like');

			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
			this.getDetail();
			return this;
		}
	});

	return View;
});
