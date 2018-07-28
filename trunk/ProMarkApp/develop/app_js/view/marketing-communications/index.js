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
	var template = require('text!view/marketing-communications/tpl/index.html');

	var AppHeader = require('view/app-header');
	var overView = require("view/marketing-communications/overview");

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            "tap .tabs-item" : "changeTab" ,
            "tap .task-item" : "toOverView"
		},
		changeTab: function(e){
            var index = $(e.currentTarget).data('index') ;
            this.changeTabByIndex(index);
        },
        changeTabByIndex:function(index){
            //所有tabs 去除选中颜色
            this.$("#marketing-communications .tabs .tabs-item").removeClass("backcolorblue") ;
            //所有tabs 添加未选中颜色
            this.$("#marketing-communications .tabs .tabs-item").addClass("backcolorgrey") ;
			var currentTarget = this.$("#marketing-communications .tabs .tabs-item")[index] ;
			$(currentTarget).addClass("backcolorblue") ;//添加选中颜色
			/*  渲染不同模板 */
			if("0" == index){//任务通报
				businessDelegate.getMarkReportList({
					page: this.current_page,
					rows: this.rows,
					markReportType: '1' 
				},_.bind(function (data) {
					var tpl = _.template(this.taskTabItem)({ list: data.obj.rows });
					this.$("#marketing-communications .tabs-content").empty();
            		this.$("#marketing-communications .tabs-content").html(tpl);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
			}else if("1" == index){//竞赛通报
				businessDelegate.getMarkReportList({
					page: this.current_page,
					rows: this.rows,
					markReportType: '2'
				},_.bind(function (data) {
					var tpl = _.template(this.gameTabItem)({ list: data.obj.rows });
					this.$("#marketing-communications .tabs-content").empty();
            		this.$("#marketing-communications .tabs-content").html(tpl);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
			}else if("2" == index){//个人通报
				businessDelegate.getMarkReportList({
					page: this.current_page,
					rows: this.rows,
					markReportType: '3'
				},_.bind(function (data) {
					var tpl = _.template(this.personTabItem)({ list: data.obj.rows });
					this.$("#marketing-communications .tabs-content").empty();
            		this.$("#marketing-communications .tabs-content").html(tpl);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
			}
            
        },
        toOverView: function(e){
			var type = $(e.currentTarget).data("type") ;
			var uuid = $(e.currentTarget).data("id") ;
            var view = new overView({
				type: type ,
				uuid: uuid
			});
			view.show();
			return;
        },
		getPaySelect: function () {
			$.showLoading();
			businessDelegate.getMarketingChannel(_.bind(function (data) {
				$.hideLoading();

				if (data.obj.length == 0) {
					return;
				}

				var tpl = _.template(this.paySelectTemplate)({ list: data.obj });
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
                title: '营销通报'
            });
            
            this.$el.empty().append(this.header.$el).append(template);
			this.personTabItem = this.$('#personTabItem').html();
			this.gameTabItem =  this.$('#gameTabItem').html();
			this.taskTabItem =  this.$('#taskTabItem').html();
			this.current_page = 0 ;
			this.rows = 50 ;
			this.changeTabByIndex(0);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
