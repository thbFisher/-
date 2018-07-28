/**
*   基础页面定义
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
	// var template = require('text!view/tpl/default.html');
	var AppHeader = require('view/app-header');
	var AppMenu = require('view/app-menu');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            
		},
		backbutton: function () {
			// phonegaputil.exitApp();
            // Backbone.history.navigate('index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: true, //是否主页面
                title: ''
            });

            //当前菜单项
			this.menu = new AppMenu({
				index: 0
			});

            this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
