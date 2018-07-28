/**
*   知识库首页
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
	var template = require('text!view/knowledge/tpl/index.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .knowledge-menu-box': 'viewPage',
            'tap .btn-ask-quetion': 'askQuestion'
		},
		viewPage: function(e){
			var url = $(e.currentTarget).data('url');
			Backbone.history.navigate(url, { trigger: true });
		},
		askQuestion: function(){
			Backbone.history.navigate('knowledge-question', { trigger: true });
		},
		backbutton: function () {
            Backbone.history.navigate('work', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '掌上知识库'
            });

            this.$el.empty().append(this.header.$el).append(template);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
