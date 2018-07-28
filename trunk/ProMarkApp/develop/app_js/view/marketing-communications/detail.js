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

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/marketing-communications/tpl/detail.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');
    var businessDelegate = require('business-delegate');

	var View = SlidePage.extend({
        events: {
            "tap .gameellipsePng": "showDifferentOption" ,
            "tap .morePage .gamequeryByType>div": "changeTypeInGamePage"
        },
        showDifferentOption: function(e){
            if($(e.currentTarget).next().hasClass("hide")){
                $(e.currentTarget).next().removeClass("hide");
            }else{
                $(e.currentTarget).next().addClass("hide");
            }
        },
        changeTypeInGamePage: function(e){
            var type = $(e.currentTarget).data("type");
            $(e.currentTarget).parent().addClass("hide");
            this.renderDifferent(type);
        },
        renderDifferent: function(type){
            this.$("#marketingCommunicationsDetail").empty();
            if("2" == type){//个人详情
                var person = _.template(this.personDetail)({ data : this.detail }) ;
                this.$("#marketingCommunicationsDetail").html(person);
            }else if("1" == type){//竞赛详情--完成数
                var persondata = {} ;
                // var person = _.template(this.gameDetail)({ data : persondata }) ;
                // this.$("#marketingCommunicationsDetail").html(person);
                businessDelegate.getMarkReportContastDetail({
					markReportUuid: this.marketuuid,
					channelUUID : this.uuid,
					type: "1" 
				},_.bind(function (data) {
                    var person = _.template(this.gameDetail)({ data : data.obj.detail }) ;
					this.$("#marketingCommunicationsDetail").html(person);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
            }else if("0" == type){//任务详情
                var person = _.template(this.taskDetail)({ data : this.detail }) ;
                this.$("#marketingCommunicationsDetail").html(person);
            }else if("3" == type){//竞赛详情--积分量
                var persondata = {} ;
                // var person = _.template(this.gameDetail)({ data : persondata }) ;
                // this.$("#marketingCommunicationsDetail").html(person);
                businessDelegate.getMarkReportContastDetail({
					markReportUuid: this.marketuuid,
					channelUUID : this.uuid,
					type: "2" 
				},_.bind(function (data) {
                    var person = _.template(this.gameDetailPoint)({ data : data.obj.detail }) ;
					this.$("#marketingCommunicationsDetail").html(person);
					// callback();
				}, this), _.bind(function (err) {
					// callback();
				}, this));
            }
        },
		initialize: function (options) {
            var title = "" ;
            if("0" == options.type){
                title = "任务通报详情" ;
            }else if("1" == options.type){
                title = "竞赛通报详情" ;
            }else{
                title = "个人通报详情" ;
            }
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: title
            });
            this.$el.empty().append(this.header.$el).append(template);
            this.personDetail = this.$("#marketingCommunicationsDetailPerson").html() ;//个人通报
            this.taskDetail = this.$("#marketingCommunicationsDetailTask").html() ;//个人通报
            this.gameDetail = this.$("#marketingCommunicationsDetailGame").html();
            this.gameDetailPoint = this.$("#marketingCommunicationsDetailGamePoint").html();
            this.detail = options.detailInfo ;
            this.uuid = options.uuid ;
            this.marketuuid = options.marketuuid ;
            if("1" == options.type){//竞赛详情
                var htmlStr = '<div class="morePage"><div class="gameellipsePng"><img src="app_img/ellipse.png" alt=""></div><div class="gamequeryByType hide" style="    background-color: rgb(44 ,154 ,244); "><div data-type="1">完成数 </div><div data-type="3">积分量</div></div></div>';
                this.$(".common-header .right-button").html(htmlStr);
			    this.$(".common-header .right-button").removeClass("hide");
            }
            this.renderDifferent(options.type);

            // this.overViewSearch = this.$("#marketingCommunicationsOverviewSearch").html() ;
            // //搜索模块
            // this.$("#marketingCommunicationsOverview .search-content").empty();
            // this.$("#marketingCommunicationsOverview .search-content").html(this.overViewSearch);

		},
		render: function () {
			return this;
		}
	});

	return View;
});
