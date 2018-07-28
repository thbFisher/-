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
	var template = require('text!view/marketing-tasks/tpl/taskDetail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		events: {
			"tap .export": "exportDoc" ,
		},
		exportDoc: function(e){
			//markJobsNewTargetEmail
			$.showLoading();
			businessDelegate.markJobsNewTargetEmail({
				uuid : this.uuid
			},_.bind(function (data) {
				$.hideLoading();
				$.jtoast("导出成功");
			}, this), _.bind(function (err) {
				// callback();
			}, this));
		},
		changeTaskReturn: function(e){
			var val = $(e.currentTarget).val() ;
			this.$("#taskReturnSelectSuggest").val(val);
		},
		//getMarkJobsNewTargetDetails
		initPage: function(){
			businessDelegate.getmarkJobsDetailsNew({
				uuid : this.uuid
			},_.bind(function (data) {
				var tpl = _.template(this.maketingTaskDetailTemplate2)({ data: data.obj });
				this.$("#maketingTaskDetail2 .task-recommended").empty();
				this.$("#maketingTaskDetail2 .task-recommended").html(tpl);
			}, this), _.bind(function (err) {
				// callback();
			}, this));
		},
		initialize: function (options) {
			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: "任务详情"
			});
			this.$el.empty().append(this.header.$el).append(template);
			this.uuid = options.uuid ;
			this.maketingTaskDetailTemplate2 = this.$("#maketingTaskDetailTemplate2").html();
			this.initPage();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
