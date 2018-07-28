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
	var template = require('text!view/tpl/index.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            'tap .index-box': 'viewPage'
		},
		viewPage: function(e){
			$e = $(e.currentTarget);
			var href = $e.data().href;
			if(href){
				Backbone.history.navigate(href, { trigger: true });
			}else{
				$.toast('正在建设中', 'cancel');
			}
		},
		backbutton: function () {
			phonegaputil.exitApp();
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: true,
				title: '首页'
            });

            this.$el.empty().append(this.header.$el);
			var tpl = _.template(template)(window.user);
			this.$el.append(tpl);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
