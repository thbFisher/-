define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/chatroom/tpl/client-list.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		events: {
            'tap .client-box': 'showUserCard'
		},
        backbutton: function(){
            if(this.host.$('#userCard').css('display') == 'block'){
				$.closePopup();
				return;
			}

            this.back();
        },
        showUserCard: function(e){
            var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

            if(uuid.length == 32){
				$.jtoast('您无法查看该用户的信息');
				return;
			}

            var obj = _.find(this.list, function(o){
                return uuid == o.uuid
            });

            this.host.renderUserCard(obj);
		    this.host.$('#userCard').popup();
            return false;
        },
        getList: function(){
            $.showLoading();
            businessDelegate.getClientUserList({
                charRoomUuid:this.charRoomUuid
            },_.bind(function(data){
				$.hideLoading();
                this.list = data;
                var tpl = _.template(this.listTemplate)({list: data});
                this.$content.html(tpl);

                // alert($('.client-box').width());
                // alert($('.common-content').width());
            },this),_.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
                this.$content.html('<div class="warning-panel">无法获取数据</div>')
            },this));
        },
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false,
                title: '在线用户'
            });

			this.$el.empty().append(this.header.$el).append(template);
            this.listTemplate = this.$('#clientListTpl').html();
            this.$content = this.$('.client-list-content');

            this.list = [];
            this.host = options.host;

            this.charRoomUuid = options.charRoomUuid;
		},
		render: function () {
            this.getList();
			return this;
		}
	});

	return View;
});
