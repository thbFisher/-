/**
 * 酬金查询
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
	var template = require('text!view/marketing/tpl/pay.html');
	var AppHeader = require('view/app-header');
	var Detail = require('view/marketing/pay-detail');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            'change .form-select': 'changeChannel',
			'tap .mobile-list-box': 'viewDetail'
		},
		viewDetail: function(e){
			var uuid = $(e.currentTarget).data('uuid');
			var view = new Detail({
				uuid: uuid
			});
			view.show();
		},
		changeChannel: function(){
			this.getMonth($.noop);
		},
		getMonth: function(callback){
			this.channelUUID = this.$('.form-select').val();
			
			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getMarketingPayMonthByChannel({
				uuid: this.channelUUID
			}, _.bind(function (data) {
				var tpl = _.template(this.listTemplate)({list: data.obj});
				this.$listContent.html(tpl);

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				callback();
			}, this), _.bind(function (err) {
				this.$listContent.html(this.errorHTML);
				$.jtoast(err);

				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				callback();
			}, this));
		},
		getChannel: function(){
			$.showLoading();

			businessDelegate.getMarketingChannel(_.bind(function (data) {
				if(data.obj.length == 0){
					this.$listContent.html(this.errorHTML);
					$.hideLoading();
					return;
				}

				var tpl = _.template(this.channelTemplate)({list: data.obj});
				this.$selectContent.html(tpl);
				$.hideLoading();

				//下拉刷新
				this.$('.weui-pull-to-refresh-layer').removeClass('hide');
				this.$('.mission-pay-content').pullToRefresh();
				this.$('.mission-pay-content').on("pull-to-refresh", _.bind(function () {
					this.isPullRefresh = 1;
					this.getMonth(_.bind(function () {
						this.$('.mission-pay-content').pullToRefreshDone();
					}, this));
				}, this));

				this.getMonth($.noop);
			}, this), _.bind(function (err) {
				this.$listContent.html(this.errorHTML);
				$.jtoast(err);
				$.hideLoading();
			}, this));
		},
		backbutton: function () {
            Backbone.history.navigate('marketing-index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '酬金查询'
            });

            this.$el.empty().append(this.header.$el).append(template);
			
			this.$selectContent = this.$('.form-select');
			this.$listContent = this.$('.mission-pay-content > .inner');

			this.channelTemplate = this.$('#channelTpl').html();
			this.listTemplate = this.$('#listTpl').html();

			this.channelUUID = '';
			this.isPullRefresh = 1;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
			this.getChannel();
			return this;
		}
	});

	return View;
});
