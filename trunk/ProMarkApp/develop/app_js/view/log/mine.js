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
	var template = require('text!view/log/tpl/mine.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			
		},
		backbutton: function () {
			Backbone.history.navigate('log-index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false,
				title: '查看日志'
            });

            this.$el.empty().append(this.header.$el).append(template)
		},
		render: function () {
			return this;
		}
	});

	return View;
});