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

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/tpl/expecting.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
            
		},
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: options.title
            });

            this.$el.empty().append(this.header.$el).append(template);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
