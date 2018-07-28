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
	var template = require('text!view/log/tpl/detail.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			
		},
		backbutton: function () {
			Backbone.history.navigate('log-mine', { trigger: true });
		},
		initialize: function (options) {
			var title = '';
			this.type = options.type;

			if(this.type == 1){
				title = '日报';
			}else if(this.type == 2){
				title = '周报';
			}else if(this.type == 3){
				title = '月报';
			}

            this.header = new AppHeader({
                host: this,
                main: false,
				title: title
            });

            this.$el.empty().append(this.header.$el).append(template);

			// this.day_template = this.$('#day').html();
			// this.week_template = this.$('#week').html();
			// this.month_template = this.$('#month').html();

			// if(this.type == 1){
			// 	this.$('.flag').before(this.day_template);
			// }else if(this.type == 2){
			// 	this.$('.flag').before(this.week_template);
			// }else if(this.type == 3){
			// 	this.$('.flag').before(this.month_template);
			// }
		},
		render: function () {
			return this;
		}
	});

	return View;
});
