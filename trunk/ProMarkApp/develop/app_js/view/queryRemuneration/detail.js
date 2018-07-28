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
	var template = require('text!view/queryRemuneration/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
			'tap span.showOrHide' : 'showOrHideBlock' 
		},
		showOrHideBlock: function(e){
			// var picSpan = this.$(".showOrHide") ;
			// for(var i = 0 ; i < picSpan.length ;i++){
			// 	$(picSpan[i]).hasClass();
			// }
			if($(e.currentTarget).hasClass("transform180")){//已经有这个样式了
				$(e.currentTarget).removeClass("transform180");
				$(e.currentTarget).parents(".detail-block-title").next().removeClass("displayNone");
				
			}else{
				$(e.currentTarget).addClass("transform180");
				$(e.currentTarget).parents(".detail-block-title").next().addClass("displayNone");
			}
		},
		initPage: function(){
			businessDelegate.getMarkRemunerationNewDetails({
				uuid: this.uuid 
			},_.bind(function (data) {
				var tpl = _.template(this.detailTemplate)({ data: data.obj });
				this.$('#remunerationDetail').empty();
				this.$('#remunerationDetail').html(tpl);
			}, this), _.bind(function (err) {
				this.$listContent.html(this.errorHTML);
				$.jtoast(err);
				$.hideLoading();
			}, this));
		},
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: "酬金详情"
			});
			this.$el.empty().append(this.header.$el).append(template);
			this.uuid = options.uuid ;
			this.detailTemplate = this.$("#remDetailTemplate").html();
			this.initPage();
			
			//getMarkRemunerationNewDetails
			

            // this.$el.empty().append(this.header.$el).append(template);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
