/**
*   修改邮箱
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
	var template = require('text!view/center/tpl/email.html');
	var AppHeader = require('view/app-header');
    var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
            'tap .validimg': 'refreshValidImage',
            'tap .btn-submit': 'submit'
		},
        submit: function(){
            var email = $.trim(this.$('.input-email').val());
            var valid = $.trim(this.$('.input-validcode').val());

            if(!email){
                $.jtoast('请输入邮箱地址');
                return;
            }

            if(!valid){
                $.jtoast('请输入验证码');
                return;
            }

            if(email == this.email){
                $.jtoast('已是当前邮箱地址');
                return;
            }

            $.showLoading('正在提交');
            businessDelegate.modifyEmail({
                email: email,
                validatecode: valid
            },_.bind(function(data){
                $.hideLoading();
                $.toast('修改成功');
                this.trigger('refresh', email);
                this.back();
            },this),_.bind(function(err){
                $.hideLoading();
                $.jtoast(err);
            },this));
        },
        refreshValidImage: function() {
            this.$('.validcode').val('');
            $('.validimg').prop('src', businessDelegate.validImage());
        },
		initialize: function (options) {
            this.email = options.email;

            this.header = new AppHeader({
                host: this,
                main: false, 
                title: '修改邮箱'
            });

            this.$el.empty().append(this.header.$el);
            var tpl = _.template(template)({img:businessDelegate.validImage()});
            this.$el.append(tpl);

            if(this.email){
                this.$('.input-email').val(this.email);
            }
		},
		render: function () {
			return this;
		}
	});

	return View;
});
