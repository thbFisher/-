/**
 * 营销服务目标列表
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
	var template = require('text!view/marketing/tpl/mission-list.html');
	var AppHeader = require('view/app-header');
	var Detail = require('view/marketing/mission-detail');
	var Reply = require('view/marketing/mission-reply');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .search-keyword': 'searchByKeyword',
			'tap .list-warning': 'initList',
			'tap .btn-prev,.btn-next': 'viewPage',

			'tap .btn-sign-mission': 'signMission',
            'tap .right-button .text': 'showDetail',
			'tap .mobile-list-box': 'showReply'
		},
		//签收
		signMission: function(){
			$.showLoading();
			businessDelegate.signMission({
				uuid: this.options.uuid
			}, _.bind(function (data) {
				$.hideLoading();
				$.toast('签收成功');

				setTimeout(_.bind(function(){
					this.getDetail();
				},this), 1000);
			}, this), _.bind(function (err) {
				$.jtoast(err);
				$.hideLoading();
			}, this));
		},
		//显示任务详情页
		showDetail: function(){
			var view = new Detail(this.data);
			view.show();
		},
		//显示目标详情页
		showReply: function(e){
			var uuid = $(e.currentTarget).data('uuid');
			var view = new Reply({
				uuid: uuid
			});
			view.show();
			view.on('render', _.bind(function(){
				this.getList(this.current_page,$.noop);
			},this));
		},
		searchByKeyword: function () {
			if(!this.data || !this.list){
				return;
			}

			this.search_mobile = '';
			var keyword = $.trim(this.$input.val());
			if (!keyword) {
				return;
			}

			this.search_mobile = keyword;

			this.$warning.show();
			this.getList(1, $.noop);
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
		},
		getList: function(page, callback){
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getMissionTargetList({
				page: this.current_page,
				rows: this.rows,
				mobile: this.search_mobile,
				jobUuid: this.options.uuid
			}, _.bind(function (data) {
				this.list = data.obj;

				var tpl = _.template(this.listTemplate)({ data: data.obj });
				this.$listContent.html(tpl);

				this.$listContent.scrollTop(0);
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
		initList: function () {
			this.$warning.hide();
			this.$input.val('');
			this.search_mobile = '';	//搜索关键字

			this.getList(1, $.noop);
		},
		getDetail: function(){
			this.$content.empty();

			$.showLoading();
			businessDelegate.getMissionDetail({
				uuid: this.options.uuid
			}, _.bind(function (data) {
				this.data = data.obj;

				var tpl = _.template(this.detailTemplate)(data.obj);
				this.$content.html(tpl);
				$.hideLoading();

				/**
				 * 获取列表
				 */
				if(this.data.signStatus == 1){
					this.$('.right-button .text').removeClass('hide');

					this.$listContent = this.$('.mission-list-content .inner');
					this.listTemplate = this.$('#listTpl').html();

					this.$warning = this.$('.list-warning');
					this.$input = this.$('.marketing-keyword');

					this.current_page = 1;	//当前页
					this.rows = 10; //每页显示数目
					this.search_mobile = ''; //搜索关键字

					//下拉刷新
					this.$('.mission-list-content').pullToRefresh();
					this.$('.mission-list-content').on("pull-to-refresh", _.bind(function () {
						this.isPullRefresh = 1;
						this.getList(1, _.bind(function () {
							this.$('.mission-list-content').pullToRefreshDone();
						}, this));
					}, this));

					this.getList(1, $.noop);
				}
			}, this), _.bind(function (err) {
				this.$content.html(this.errorHTML);
				$.jtoast(err);
				$.hideLoading();
			}, this));
		},
		backbutton: function () {
            Backbone.history.navigate('marketing-mission', { trigger: true });
		},
		initialize: function (options) {
            this.options = options;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '营销服务目标'
            });

			this.header.setRightBtn('<div class="text hide">任务详情</div>');

			this.$el.empty().append(this.header.$el).append(template);

			this.$content = this.$('.mission-list-wrapper');

			this.detailTemplate = this.$('#detailTpl').html();
			this.listTemplate = this.$('#listTpl').html();

			this.isPullRefresh = 1;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.data = null;
			this.list = null;
			this.getDetail();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
