/**
*   沟通列表
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
	var template = require('text!view/chatroom/tpl/list.html');
	var AppHeader = require('view/app-header');
	var AppMenu = require('view/app-menu');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .chatroom-group-box': 'viewChatroom' ,
			'tap .chatRoomHeader img.searchBtn' : 'toastInfo'
		},
        toastInfo: function(e){
            $.jtoast("敬请期待");
        },
		viewChatroom: function (e) {
			var uuid = $(e.currentTarget).data('uuid');
			var title = $(e.currentTarget).data('title');

			if (!uuid || !title) {
				return;
			}

			if (!('WebSocket' in window)) {
				$.alert('您的系统不支持websoket<br>无法使用聊天室');
				return;
			}
			
			Backbone.history.navigate('chatroom/' + uuid + '/' + title, { trigger: true });
		},
		backbutton: function () {
			Backbone.history.navigate('index', { trigger: true });
		},
		getList: function (callback) {
			if (!this.isPullRefresh) {
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getChatRoomList({
				maxWidth: 80
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.template)({ list: data.obj.rows });
				this.$listContent.html(tpl);

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				$.jtoast(err);
				this.$listContent.html(this.errorHTML);

				callback();
			}, this));
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: true,
				title: '沟通'
            });

			// this.header.setRightBtn('<span class="add-chatroom"><i class="iconfont icon-jia"></i></span>');

			this.menu = new AppMenu({
				index: 0
			});

            // this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);
			this.$el.empty().append(template).append(this.menu.$el);
			this.$listContent = this.$('.chatroom-group-wrapper');
			this.template = this.$('#tpl').html();
			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
			//下拉刷新
            this.$('#chatroomList > div').pullToRefresh();
            this.$('#chatroomList > div').on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getList(_.bind(function () {
					this.$('#chatroomList > div').pullToRefreshDone();
				}, this));
			}, this));

			this.getList($.noop);

			return this;
		}
	});

	return View;
});
