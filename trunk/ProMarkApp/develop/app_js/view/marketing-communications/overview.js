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
	var template = require('text!view/marketing-communications/tpl/overView.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var detailView = require("view/marketing-communications/detail");
	
	//keywords  关键字
	var View = SlidePage.extend({
        events: {
            "tap .listItem": "toDetail"
        },
        toDetail: function(e){
			var type = $(e.currentTarget).data("type") ;
			var dataIndex = $(e.currentTarget).data("index") ;
			var uuid = $(e.currentTarget).data("uuid") ;
			var marketuuid = $(e.currentTarget).data("marketuuid");
            var view = new detailView({
				type: type,
				detailInfo: this.detailInfos[dataIndex] ,
				uuid: uuid ,
				marketuuid: marketuuid
			});
			view.show();
			return;
		},
		initDifferentTpl: function(type ,uuid){
			var tpl = "" ;
			var data = {} ;
			if("0" == type){//任务通报
				businessDelegate.getMarkReportTaskList({
					page: this.current_page,
					rows: this.rows,
					markReportUuid: uuid ,
					keywords: this.keywords
				},_.bind(function (data) {
					tpl = _.template(this.taskTpl)({list: data.obj.rows});
					this.detailInfos = data.obj.rows ;//详情数据
					this.$("#marketingCommunicationsOverview .list-content").empty();
					this.$("#marketingCommunicationsOverview .list-content").html(tpl);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
			}else if("1" == type){//竞赛通报
				businessDelegate.getMarkReportContastList({
					page: this.current_page,
					rows: this.rows,
					markReportUuid: uuid ,
					keywords: this.keywords
				},_.bind(function (data) {
					tpl = _.template(this.gameTpl)({ list: data.obj.rows });
					this.$("#marketingCommunicationsOverview .list-content").empty();
					this.$("#marketingCommunicationsOverview .list-content").html(tpl);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
			}else if("2" == type){//个人通报
				businessDelegate.getMarkReportPersonList({
					page: this.current_page,
					rows: this.rows,
					markReportUuid: uuid ,
					keywords: this.keywords
				},_.bind(function (data) {
					tpl = _.template(this.persionTpl)({list: data.obj.rows});
					this.detailInfos = data.obj.rows ;//详情数据
					this.$("#marketingCommunicationsOverview .list-content").empty();
					this.$("#marketingCommunicationsOverview .list-content").html(tpl);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
			}
		},
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: "通报概览"
            });
            this.$el.empty().append(this.header.$el).append(template);
			this.overViewSearch = this.$("#marketingCommunicationsOverviewSearch").html() ;
			this.persionTpl = this.$("#marketingCommunicationsOverviewPerson").html(); //个人通报模板
			this.gameTpl = this.$("#marketingCommunicationsOverviewGame").html(); //竞赛通报模板
			this.taskTpl = this.$("#marketingCommunicationsOverviewTask").html(); //任务通报模板
            //搜索模块
			this.$("#marketingCommunicationsOverview .search-content").empty();
			this.$("#marketingCommunicationsOverview .search-content").html(this.overViewSearch);
			this.current_page = 0 ;
			this.rows  = 50 ;
			this.keywords = "" ;
			this.detailInfos = "" ;
			this.pageType = options.type ;
			this.initDifferentTpl(options.type, options.uuid);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
