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
	var template = require('text!view/marketing-tasks/tpl/overView.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var taskDetailView = require("view/marketing-tasks/detail");
	var taskDetailView2 = require("view/marketing-tasks/taskDetail");
	
	var View = SlidePage.extend({
        events: {
			"tap #maketingTaskOverView .list-item": "toDetail" ,
			"tap .right-button .taskDetail": "totaskDetail"
		},
		totaskDetail: function(e){
			var uuid = $(e.currentTarget).data("uuid") ;
            var view = new taskDetailView2({
				uuid: this.uuid 
			});
			view.show();
			return;
		},
        toDetail: function(e){
			var uuid = $(e.currentTarget).data("uuid") ;
			var index = $(e.currentTarget).data("index") ;
			var allLength = $(e.currentTarget).data("alllength")
            var view = new taskDetailView({
				jobUuid :  this.taskId ,
				uuid: uuid ,
				index: index ,
				allNumber: allLength
			});
			view.show();
			return;
		},
		getPageData: function(){
			businessDelegate.getMarkJobsNewTargetList({
				page : this.page ,
				rows :this.rows ,
				jobUuid :  this.taskId ,
				mobile: window.user.mobile ,
				customerChannelUuid: this.customerChannelUuid
			},_.bind(function (data) {
				this.serverData = data.obj.rows ;
				window.successNum = data.obj.totalRecord - data.obj.unfinishedRecord ;
				var tpl = _.template(this.maketingTaskOverItem)({ obj: data.obj });
				$("#maketingTaskOverView .list-content").empty();
				$("#maketingTaskOverView .list-content").html(tpl);
			}, this), _.bind(function (err) {
				// callback();
			}, this));
		},
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: "营销服务目标"
            });
			this.$el.empty().append(this.header.$el).append(template);
			//搜索模块
			this.taskId = options.uuid ;
			this.uuid = options.uuid ;
			this.customerChannelUuid = options.customerChannelUuid ;
			this.overViewSearch = this.$("#maketingTaskSearch").html() ;
			this.$("#maketingTask .search-content").empty();
			this.$("#maketingTask .search-content").html(this.overViewSearch);
			this.$("#maketingTaskOverView").prev().find(".right-button").removeClass("hide");
			this.$("#maketingTaskOverView").prev().find(".right-button").css("width","70px") ;
			this.$("#maketingTaskOverView").prev().find(".right-button").html("<div class='taskDetail' data-uuid='"+this.uuid+"'>任务详情</div>");
			
			this.maketingTaskOverItem = this.$("#maketingTaskOverItem").html();
			this.page  =  0 ;
			this.rows  = 500 ;
			this.getPageData();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
