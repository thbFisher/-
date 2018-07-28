/**
*   意见反馈
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
	var template = require('text!view/center/tpl/advise.html');
	var AppHeader = require('view/app-header');
    var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
            'tap .btn-submit': 'submit'
		},
        submit: function(){
            var text = $.trim(this.$('.input-text').val());

            if(!text){
                $.jtoast('请填写您的建议');
                return;
            }

            $.showLoading('正在提交');
            businessDelegate.addAdvise({
                msgContent: text
            },_.bind(function(data){
                $.hideLoading();
                $.toast('提交成功');
                this.$('.input-text').val('');
            },this),_.bind(function(err){
                $.hideLoading();
                $.jtoast(err);
            },this));
        },
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, 
                title: '意见反馈'
            });

            this.$el.empty().append(this.header.$el).append(template);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
