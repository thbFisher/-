/**
 * 考试成绩
 */
define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/exam/tpl/result.html');
	var AppHeader = require('view/app-header');
    var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
            
		},
        backbutton: function(){
            this.host.backbutton();
        },
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, 
                title: '考试结果'
            });

            this.data = options.data;
            this.host = options.host;

            this.$el.empty().append(this.header.$el);
            var tpl = _.template(template)(this.data);
            this.$el.append(tpl);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
