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
	var template = require('text!view/marketing-tasks/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		events: {
			"tap .selectRadio": "selectRadio",
			"change #taskReturnSelect": "changeTaskReturn",
			"tap .submitBtnTask": "submitTask",
			"tap #taskReturnCallPhone": "callPhone",
			"tap #taskReturnSendMsg": "showBorder",
			"tap #maketingTaskDetail .title .showOrHide": "showOrHideBase",
			"tap .choose-body .recorder-container": "checkRadio",
			"tap .choose-body .operation-btn .cancle": "hideBorder",
			"tap .zezhao": "hideBorder",
			"tap .choose-body .operation-btn .send": "sendMsg",
			"tap .taskSuccess": "taskSuccess",
			"tap .taskFailedAndGiveUp": "taskSuccess",
			"tap .taskFaileContinue": "taskSuccess" ,
			"tap .fail-operation-btn .sendReseaon": "failResean",
			"tap .fail-operation-btn .cancle-send": "cancleSendMsg"
			// "tap .taskFaileContinue": "gotoNextPage" 
		},
		sendMsg: function () {
			var checks = $("#maketingTaskDetail .choose-body .one-record>span.myradiock-cked");
			
			var mobile = checks.data("mobile") ;
			var msgcontent = checks.data("msgcontent");
			// $.showLoading();
			phonegaputil.sendSMS([mobile], msgcontent, _.bind(function () {

			}, this), function (err) {
				console.log(err);
				$.jtoast('跳转失败请重试');
			});
			// for (var i = 0; i < checks.length; i++) {
			// 	var msgContnet = $(checks[i]).data("msgcontent");
			// 	var mobile = $(checks[i]).data("mobile")
			// 	//sendMarketingTaskMsg
			// 	businessDelegate.sendMarketingTaskMsg({
			// 		mobile: mobile,
			// 		smsContent: msgContnet
			// 	}, _.bind(function (data) {
			// 		$.hideLoading();
			// 	}, this), _.bind(function (err) {
			// 		$.hideLoading();
			// 		$.jtoast(err);
			// 		// callback();
			// 	}, this));
			// }
			// $.jtoast("发送成功");
			// $.hideLoading();
			$("#maketingTaskDetail .zezhao").addClass("hide");
			$("#maketingTaskDetail .choose-body").addClass("hide");
		},
		hideBorder: function () {
			$("#maketingTaskDetail .zezhao").addClass("hide");
			$("#maketingTaskDetail .choose-body").addClass("hide");
			$("#maketingTaskDetail .fail-reseason").addClass("hide");
			this.showOrHideBase();
		},
		checkRadio: function (e) {
			var doms = $(e.currentTarget).siblings() ;
			doms.find("span:first-child").addClass("myradiock");
			doms.find("span:first-child").removeClass("myradiock-cked");
			$(e.currentTarget).find("span:first-child").addClass("myradiock-cked");
			$(e.currentTarget).find("span:first-child").removeClass("myradiock");
			// for(var i = 0 ; i < doms.length ;i++){
			// 	if(doms[i] == e.currentTarget){//选中
			// 		$(e.currentTarget).find("span:first-child").addClass("myradiock-cked");
			// 		$(e.currentTarget).find("span:first-child").removeClass("myradiock");
			// 	}else{
			// 		$(e.currentTarget).find("span:first-child").addClass("myradiock");
			// 		$(e.currentTarget).find("span:first-child").removeClass("myradiock-cked");
			// 	}
			// }
			//是否被选中
			// if ($(e.currentTarget).find("span:first-child").hasClass("myradiock-cked")) {
			// 	$(e.currentTarget).find("span:first-child").addClass("myradiock");
			// 	$(e.currentTarget).find("span:first-child").removeClass("myradiock-cked");
			// } else {
			// 	$(e.currentTarget).find("span:first-child").addClass("myradiock-cked");
			// 	$(e.currentTarget).find("span:first-child").removeClass("myradiock");
			// }
		},
		showOrHideBase: function (e) {
			if ($(e.currentTarget).parent().next().is(":hidden")) {
				$(e.currentTarget).parent().next().show();
				$(e.currentTarget).removeClass("transform180");
			} else {
				$(e.currentTarget).parent().next().hide();
				$(e.currentTarget).addClass("transform180");
			}
		},
		showBorder: function (e) {
			if (this.pageData.businessTitleOne || this.pageData.businessTitleTwo || this.pageData.businessTitleThree || this.pageData.businessTitleFour || businessTitleFive) {
				$("#maketingTaskDetail .zezhao").removeClass("hide");
				$("#maketingTaskDetail .choose-body").removeClass("hide");
			} else {
				$.jtoast("无可用话术模板");
			}
		},
		callPhone: function (e) {
			var phone = $(e.currentTarget).data("phonenum");
			window.location.href = "tel:" + phone;
		},
		changeTaskReturn: function (e) {
			var val = $(e.currentTarget).val();
			this.$("#taskReturnSelectSuggest").val(val);
		},
		submitTask: function (e) {
			var result = this.$("#maketingTaskDetail .radioselect>div[val='checked']").data("result");
			var suggest = this.$("#taskReturnSelectSuggest").val();
			var obj = {
				uuid: this.uuid,
				userResult: result,
				userFeedback: suggest
			}
			$.showLoading();
			businessDelegate.markJobsNewTargetDetailsSave(obj, _.bind(function (data) {
				$.hideLoading();
				$.jtoast("提交成功");
				$(".submitBtnTask").addClass("hide");
				this.$(".btn-back").trigger("tap");
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				// callback();
			}, this));
		},
		taskSuccess: function (e) {
			var result = $(e.currentTarget).data("result");
			this.taskResult = result ;
			var obj = {
				uuid: this.uuid,
				userResult: result,
				userFeedback: ""
			}
			if ("1" == obj.userResult) {
				this.ajaxData(obj);
				window.successNum++ ;
			} else {
				$(".zezhao").removeClass("hide");
				$(".fail-reseason").removeClass("hide");
				this.showOrHideBase({
					currentTarget: $("#maketingTaskDetail .title .showOrHide")[0]
				});
			}
		},
		failResean: function(e){
			var val = $(e.currentTarget).parent().find("textarea").val();
			var obj = {
				uuid: this.uuid,
				userResult: this.taskResult,
				userFeedback: val
			}
			this.ajaxData(obj);
		},
		cancleSendMsg: function(e){
			$(".zezhao").addClass("hide");
			$(".fail-reseason").addClass("hide")
		},
		ajaxData: function (obj) {
			$.showLoading();
			businessDelegate.markJobsNewTargetDetailsSave(obj, _.bind(function (data) {
				$.hideLoading();
				var msg ;
				if(obj.userResult == "1"){//成功
					msg = "恭喜获得成功" ;
				}else if(obj.userResult == "2"){//放弃
					msg = "客户第一，再接再厉！" ;
				}else{//失败并继续
					msg = "离成功只有一步之遥了哟！" ;
				}
				$.jtoast(msg);
				this.gotoNextPage( obj.userResult == "1"|| obj.userResult == "2" ? true : false);
				// this.$(".btn-back").trigger("tap");
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				// callback();
			}, this));
		},
		gotoNextPage: function (boolean) {
			var thisItem = $(".list-content .list-item[data-uuid='" + this.uuid + "']");
			var nextItem = $(".list-content .list-item[data-uuid='" + this.uuid + "']").next();
			if (boolean) {
				thisItem.remove();
				// thisItem.addClass("hide");
			}else{
				thisItem.find(".goon").removeClass("hide");
			}
			if (nextItem) {
				var nextId = nextItem.data("uuid");
				var index = nextItem.data("index") ;
				var allLength = nextItem.data("alllength") ; 
				
				this.initialize({
					jobUuid: this.taskId,
					uuid: nextId,
					index: index ,
					allNumber: allLength
				});
			} else {
				this.$(".btn-back").trigger("tap");
			}
		},
		//getMarkJobsNewTargetDetails
		initPage: function () {
			businessDelegate.getMarkJobsNewTargetDetails({
				uuid: this.uuid
			}, _.bind(function (data) {
				this.pageData = data.obj;
				var tpl = _.template(this.detailTemplate)({ data: data.obj });
				var borderTpl = _.template(this.sendBorderTemplate)({ data: data.obj });
				this.$("#maketingTaskDetail .task-recommended").empty();
				this.$("#maketingTaskDetail .task-recommended").html(tpl);
				this.$("#maketingTaskDetail .choose-body").empty();
				this.$("#maketingTaskDetail .choose-body").html(borderTpl);
			}, this), _.bind(function (err) {
				// callback();
			}, this));
		},
		selectRadio: function (e) {
			if ("checked" == $(e.currentTarget).attr('val')) {//当前选中
				return;
			} else {
				var index = $(e.currentTarget).data('index');
				var currentTarget = this.$("#maketingTaskDetail .selectRadio>span:first-child")[index];
				var otherTarget = this.$("#maketingTaskDetail .selectRadio>span:first-child")['0' == index ? '1' : '0'];
				this.$("#maketingTaskDetail .selectRadio").removeAttr("val");
				$(e.currentTarget).attr("val", "checked");

				$(currentTarget).removeClass("myradio");
				$(currentTarget).addClass("myradiock");
				$(otherTarget).removeClass("myradiock");
				$(otherTarget).addClass("myradio");
			}
		},
		initialize: function (options) {
			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: "任务反馈"
			});
			this.$el.empty().append(this.header.$el).append(template);
			this.$(".common-header .right-button").removeClass("hide") ;
			this.$(".common-header .right-button").addClass("marketing-tasksProccess") ;
			this.$(".common-header .right-button").append("(<span class='taskIndex'>" + window.successNum + "/" + options.allNumber +"</span>)");
			this.taskId = options.jobUuid;
			this.uuid = options.uuid;
			this.detailTemplate = this.$("#maketingTaskDetailTemplate").html();
			this.sendBorderTemplate = this.$("#chooseMsgModule").html();
			this.initPage();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
