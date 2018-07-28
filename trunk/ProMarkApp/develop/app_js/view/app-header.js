define(function(require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/tpl/_app-header.html');
 
	var View = Backbone.View.extend({
	    className: 'common-header',
		events: {
            'tap .btn-back': 'backbutton'
		},
		backbutton: function() {
		    this.host.backbutton();
		},
		initialize: function(options) {
		    this.host = options.host;
			this.$el.html(_.template(template)(options));
			this.$hdTitle = this.$('.title');
		},
		setTitle: function(html) {
			this.$hdTitle.html(html);
		},
        setLeftBtn: function(html){
			this.$('.left-button').removeClass('hide').html(html);
        },
		setRightBtn: function(html){
            this.$('.right-button').removeClass('hide').html(html);
		},
		render: function() {
			return this;
		}
	});

	return View;
});
