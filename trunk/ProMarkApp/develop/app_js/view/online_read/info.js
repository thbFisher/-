/**
*   在线阅读-资料概述
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
	var template = require('text!view/online_read/tpl/info.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .btn-view-detail': 'viewDetail',
			'tap .btn-view-attachment': 'viewAttachment'	
		},
		viewDetail: function(){
			Backbone.history.navigate('online-read-detail/'+this.uuid, { trigger: true });
		},
		viewAttachment: function(){
			Backbone.history.navigate('online-read-attachment/'+this.uuid, { trigger: true });
		},
		getInfo: function(){
			$.showLoading();
			businessDelegate.readInfo({
				coursewareUuid: this.uuid,
				addCount:this.addCount
			}, _.bind(function (data) {
				$.hideLoading();
				this.renderInfo(data.obj);
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		renderInfo: function(data){
			this.$('.btn-view-detail').prop('disabled', false);
			this.$('.btn-view-attachment').prop('disabled', false);

			var tpl = _.template(this.infoTemplate)({data:data});
			this.$wrapper.html(tpl);
		},
		backbutton: function () {
            Backbone.history.navigate('online-read-index/work/index', { trigger: true });
		},
		initialize: function (opitons) {
			this.uuid = opitons.uuid;
			this.addCount = opitons.addCount;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '资料概述'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.infoTemplate = this.$('#infoTpl').html();
			this.$wrapper = this.$('.content');
		},
		render: function () {
			this.getInfo();
			return this;
		}
	});

	return View;
});
