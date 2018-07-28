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
	var template = require('text!view/graphic_marketing/tpl/index.html');
	var missionListTemplate = require('text!view/my_customer/tpl/_mission-list.html');

	var AppHeader = require('view/app-header');
	var DetailView = require("view/graphic_marketing/detail");

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			"tap .list-item" : "toDetail",
			"tap .btn-mission-search":"search"
		},
		toDetail: function(e){
			var imgUrl = $(e.currentTarget).data("imgurl");
			var view = new DetailView({
				imgUrl:imgUrl
			});
			view.show();
			return;
		},
		search: function(e){
			this.searchkey = $(e.currentTarget).parent().next().find("input").val() ;
			this.getListData();
		},
		getPaySelect: function () {
			$.showLoading();
			businessDelegate.getMarkGraphicList(_.bind(function (data) {
				$.hideLoading();

				if (data.obj.length == 0) {
					return;
				}

				var tpl = _.template(this.paySelectTemplate)({ list: data.obj.markGraphic.rows });
				this.$('.content-header').html(tpl);

				this.renderPayList();
			}, this), _.bind(function (err) {
				$.jtoast(err);
				$.hideLoading();

				this.renderPayList();
			}, this));
		},
		renderPayList: function () {
			var uuid = $('.form-select').val();

			if (!this.PayList) {
				this.PayList = new PayList({
					uuid: uuid
				});
			} else {
				this.PayList.initialize({
					uuid: uuid
				});
			}

		},
		getListData: function(){
			//getMarkGraphicList
			businessDelegate.getMarkGraphicList({
				page: this.current_page,
				rows: this.rows,
				graphicTitle : this.searchkey // customerMobile : window.user.mobile
			},_.bind(function (data) {
				/**列表 */
				this.listTemplate = this.$("#gmListTpl").html();
				var listtpl = _.template(this.listTemplate)({ list : data.obj.markGraphic.rows }) ;
				this.$('.common-content .gm-list-content').empty() ;
				this.$('.common-content .gm-list-content').html(listtpl);
			}, this), _.bind(function (err) {
				$.jtoast(err);
				$.hideLoading();

				this.renderPayList();
			}, this));
		},
		backbutton: function () {
            Backbone.history.navigate(this.history, { trigger: true });
		},
		initialize: function (options) {
			//this.history = options.history;
			this.history = window._pageHistory?window._pageHistory:"work/index";
			window._pageHistory = "" ;
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '图文营销'
            });
            /**搜索 */
            this.$el.empty().append(this.header.$el).append(template);
            this.searchTemplate = this.$('#gmSearchTpl').html();
			this.$('.common-content .gm-search-content').html(this.searchTemplate);
			this.current_page = 0 ;
			this.rows = 500 ;
			this.searchkey = "" ;
			this.getListData() ;
		},
		render: function () {
			return this;
		}
	});

	return View;
});
