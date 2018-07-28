/**
 * 营销首页
 */

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
	var template = require('text!view/marketing/tpl/index.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .marketing-menu-btn.active': 'viewPage'
		},
		viewPage: function (e) {
			var href = $(e.currentTarget).data('href');
			Backbone.history.navigate(href, { trigger: true });
		},
		renderView: function(){
			$.showLoading();
			businessDelegate.getMarketingPermission(_.bind(function(data){
				$.hideLoading();
				var tpl = _.template(template)(data.obj);
				this.$el.append(tpl);

				window.user.regularVisitors = data.obj.regularVisitors;	//获取常客查询权限
				window.user.taskSing = data.obj.taskSing;	//获取任务查询权限
				window.user.backfillTask = data.obj.backfillTask;	//获取任务回填权限
				window.user.queryFee = data.obj.queryFee;	//获取酬金查询权限
			},this),_.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
				this.$el.append('<div class="common-content"><div class="warning-panel">无法获取数据</div></div>');
			},this));
		},
		backbutton: function () {
            Backbone.history.navigate('work', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '在线营销'
            });

            this.$el.empty().append(this.header.$el);
			this.renderView();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
