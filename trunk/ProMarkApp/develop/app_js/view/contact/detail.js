/**
*   首页
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
	var template = require('text!view/contact/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
			
		},
		getDetail: function(){
			$.showLoading();
			businessDelegate.getContactUserInfo(this.options,_.bind(function(data){
				$.hideLoading();

				if(data.obj.userImg){
					this.$('#contactDetail .avatar > img').attr('src', data.obj.userImg);
				}

				var tpl = _.template(this.template)(data.obj);
				this.$content.html(tpl);
			},this),_.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
			},this));
		},
		initialize: function (options) {
			this.options = options;
			console.log(options);

            this.header = new AppHeader({
                host: this,
                main: false,
				title: '用户详情'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.template = this.$('#infoTpl').html();
			this.$content = this.$('#contactInfo');

			this.getDetail();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
