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
	var template = require('text!view/data-statistic/tpl/unlearDetail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');
	
	//keywords  关键字
	var View = SlidePage.extend({
        events: {
        },
        toDetail: function(e){
			
		},
		initPage(uuid){
            businessDelegate.dataStatisticLearnDetail({
				courUuid:uuid
			},_.bind(function (data) {
            	// $.hideLoading();
				var html = ""
				for(var i = 0 ; i < data.obj.datas.length ;i++){
					var user = data.obj.datas[i] ;
					html += '<div class="oneUser"><span class="user-name">用户名称：<span>'+user.name+'</span></span><span class="user-mobile">联系电话：<span>'+user.mobile+'</span></span></div>'
				}
				$("#unlearnDetail .allUnlearn").empty();
				$("#unlearnDetail .allUnlearn").html(html);
            }, this), _.bind(function (err) {
                debugger ;
            	$.jtoast(err);
            }, this));
        },
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: "未学习名单"
            });
            this.$el.empty().append(this.header.$el).append(template);
			this.initPage(options.uuid) ;
		},
		render: function () {
			return this;
		}
	});

	return View;
});
