define(function(require,exports,module){
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	var View = Backbone.View.extend({
		className: 'slide-page',
		backbutton: function(){
			this.back();
		},
		back: function(){
			if(!this.canBack){
				return;
			}

			if(this.destroy){
				this.destroy();
			}
			
			$.maskScreen();
			// this.$el.removeClass('in').addClass('out');

		    //删除滑动层
		    setTimeout(_.bind(function(){
		    	this.remove();
		    },this),500);

			$.removeScreen(500);
		},
		show: function() {
			this.canBack = 1;//是否允许回退

			$.maskScreen();
			// 确保slide-page被添加到页面最上层
			$(document.body).append(this.el);

			this.render();
			this.afterRender();
			
			// setTimeout(_.bind(function(){
				// this.$el.removeClass('out').addClass('in');
			// },this),1);

		    $.removeScreen(500);
			return this;
		},
		afterRender: function(){
			console.log('afterRender');
		},
		destroy: function(){
			console.log('destroy');
		}
	});

	return View;
});
