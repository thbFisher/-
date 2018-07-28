/**
 * 任务详情
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
	var template = require('text!view/marketing/tpl/mission-detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
        events: {
            'tap .btn-send': 'send'
		},
		send: function(){
			$.showLoading('正在获取导出文件', function(){
				$('.weui_toast').css({
					'width': '10em',
					'margin-left': '-5em'
				});
			});

			businessDelegate.sendMissionTargetList({
				uuid: this.options.uuid
			}, _.bind(function(data){
				$.hideLoading();
				$.alert('文件已发送至您的邮箱');
			},this), _.bind(function(err){
				$.hideLoading();
				$.jtoast(err);
			},this));
		},
		initialize: function (options) {
            this.options = options;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '任务详情'
            });

            this.$el.empty().append(this.header.$el);
			
			var tpl = _.template(template)(this.options);
			this.$el.append(tpl);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
