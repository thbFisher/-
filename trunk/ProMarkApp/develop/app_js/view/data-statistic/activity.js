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
    var template = require('text!view/data-statistic/tpl/activity.html');
    var AppHeader = require('view/app-header');

    var View = Backbone.View.extend({
        el: 'body',
        events: {
            "tap #dataStatisticActivity .queryTools .oneItem": "chooseItem",
            "tap #dataStatisticActivity .queryTools .oneItem .city": "chooseCity",
            "tap #dataStatisticActivity .queryTools .oneItem .channel": "chooseChannel",
            "tap #dataStatisticActivity .queryTools .oneItem .part": "choosePart",
            "change #dataStatisticActivity .resultBody input.timeSelect": "timeSelect"
        },
        /**
         * 城市选择
         */
        chooseCity: function (e) {
            if(!this.cityDataInit){
                $.jtoast("数据还未返回请稍后");
            }
            var cityUUID = "" + $(e.currentTarget).data("uuid") ;
            $(e.currentTarget).siblings().removeClass("active");
            $(e.currentTarget).addClass("active");

            var text = $(e.currentTarget).data("text") ;
            $(e.currentTarget).parents(".oneItem").find(".queryResult").text(text) ;
            //置空部门
            $(e.currentTarget).parents(".oneItem").parent().find(".selectedPart").text("部门") ;
            this.partUUID = "" ;
            this.cityUUID = cityUUID ;
            this.initChannelByCity(text);
        },
        timeSelect(e){
            if($(e.currentTarget).hasClass("timeStart")){//开始时间
                this.startTime = $(e.currentTarget).val();
            }else{//结束时间
                if(!this.startTime){
                    $.jtoast("请开始时间！");
                    return ;
                }
                this.endTime = $(e.currentTarget).val();
                this.initPageData(true);
            }
        },
        /**
        * 渠道选择
        */
        chooseChannel: function (e) {
            if(!this.channelDataInit){
                $.jtoast("数据还未返回请稍后");
            }
            $(e.currentTarget).siblings().removeClass("active");
            $(e.currentTarget).addClass("active");
            // if(!this.cityUUID){
            //     $.jtoast(err);
            // }
            var channelUUID = $(e.currentTarget).data("uuid") ;
            var text = $(e.currentTarget).data("text") ;
            $(e.currentTarget).parents(".oneItem").find(".queryResult").text(text) ;
            this.channelUUID = channelUUID ;
            if(this.startTime && this.endTime){
                this.initPageData(true);
            }
        },
        /**
         * 选择部门
         */
        choosePart: function (e) {
            if(!this.partDataInit){
                $.jtoast("数据还未返回请稍后");
            }
            $(e.currentTarget).siblings().removeClass("active");
            $(e.currentTarget).addClass("active");
            // var partUUID = $(e.currentTarget).data("uuid") ;
            var text = $(e.currentTarget).data("text") ;
            var partUUID = text ;
            $(e.currentTarget).parents(".oneItem").find(".queryResult").text(text) ;
            //置空城市 渠道
            $(e.currentTarget).parents(".oneItem").parent().find(".selectCity").text("公司") ;
            this.cityUUID = "" ;
            $(e.currentTarget).parents(".oneItem").parent().find(".selectChannel").text("渠道") ;
            this.channelUUID = "" ;
            
            this.partUUID = partUUID ;
            if(this.startTime && this.endTime){
                this.initPageData(true);
            }
        },
        chooseItem: function (e) {
            if($(e.currentTarget).find(".selectChannel").length){//选择渠道
                if(!this.cityUUID){ //城市选择为空
                    $.jtoast("请先选择城市");
                    return ;
                }
            }
            if ($(e.currentTarget).hasClass("active")) {//已经被选中
                if ($(e.currentTarget).find(".moreQuery").hasClass("none")) {//被隐藏
                    $(e.currentTarget).find(".moreQuery").removeClass("none");
                    $(e.currentTarget).find(".moreQuery .active")[0].scrollIntoView() ;
                    $(e.currentTarget).find(".queryResult").removeClass("triup");
                    $(e.currentTarget).find(".queryResult").addClass("tridown");
                } else {
                    $(e.currentTarget).find(".moreQuery").addClass("none");
                    $(e.currentTarget).find(".queryResult").addClass("triup");
                    $(e.currentTarget).find(".queryResult").removeClass("tridown");
                }
            } else {
                $("#dataStatisticActivity .queryTools .oneItem").removeClass("active");
                $("#dataStatisticActivity .queryTools .oneItem .queryResult").addClass("rightWhite");
                $("#dataStatisticActivity .queryTools .oneItem .queryResult").removeClass("triup");
                $("#dataStatisticActivity .queryTools .oneItem .queryResult").removeClass("tridown");

                $("#dataStatisticActivity .queryTools .oneItem .moreQuery").addClass("none");
                $(e.currentTarget).addClass("active");
                $(e.currentTarget).find(".moreQuery").removeClass("none");
                $(e.currentTarget).find(".queryResult").removeClass("rightWhite");
                $(e.currentTarget).find(".queryResult").addClass("tridown");
            }
        },
        viewPage: function (e) {

        },
        initCity: function(){
            //dataStatisticActCity
            businessDelegate.dataStatisticActCity({},_.bind(function (data) {
                this.cityDataInit = true ;
                var html = "" ;
                for(var i = 0 ; i < data.obj.datas.length ;i++){
                    html += '<div class="city" data-uuid="'+data.obj.datas[i]+'" data-text="'+data.obj.datas[i]+'">'+data.obj.datas[i]+'</div>' ;
                }
                $("#dataStatisticActivity .queryTools .oneItem .cityList").empty();
                $("#dataStatisticActivity .queryTools .oneItem .cityList").html(html);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
        initChannelByCity: function(query){
            businessDelegate.dataStatisticActChannelByCity({
                area: query
            } ,_.bind(function (data) {
                this.channelDataInit = true ;
                var html = "" ;
                for(var i = 0 ; i < data.obj.datas.length ;i++){
                    html += '<div class="channel" data-uuid="'+data.obj.datas[i].uuid+'" data-text="'+data.obj.datas[i].title+'">'+data.obj.datas[i].title+'</div>' ;
                }
                $("#dataStatisticActivity .queryTools .oneItem .channelList").empty();
                $("#dataStatisticActivity .queryTools .oneItem .channelList").html(html);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
        initPart: function(){
            businessDelegate.dataStatisticActPart({},_.bind(function (data) {
                this.partDataInit = true ;
                var html = "" ;
                for(var i = 0 ; i < data.obj.datas.length ;i++){
                    html += '<div class="part" data-uuid="'+i+'" data-text="'+data.obj.datas[i]+'">'+data.obj.datas[i]+'</div>' ;
                }
                $("#dataStatisticActivity .queryTools .oneItem .partList").empty();
                $("#dataStatisticActivity .queryTools .oneItem .partList").html(html);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
        initPageData: function (flag) {
            var param = {}
            if(flag){
                param = {
                    startTime: this.startTime ,
                    endTime: this.endTime ,
                    area: this.cityUUID ,
                    channelUUID: this.channelUUID ,
                    departmentName: this.partUUID
                }
            }
            $.showLoading();
            businessDelegate.dataStatisticActivity(param,_.bind(function (data) {
            	$.hideLoading();
                var html = _.template(this.dataStatisticActivityTemp)({ obj: data.obj });
                $("#dataStatisticActivity .resultBody .result").empty();
                $("#dataStatisticActivity .resultBody .result").html(html);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
        backbutton: function () {
            Backbone.history.navigate("dataStatisticIndex/work/index", { trigger: true });
        },
        initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: 'APP活跃情况'
            });
            this.$el.empty().append(this.header.$el).append(template);
            var date = new Date() ;
            date.setTime(date.getTime()-24*60*60*1000);
            var day = date.getDate() ;
            day = day > 9 ? day : ("0" + day) ;
            var month = date.getMonth() + 1 ;
            month = month > 9 ? month : ("0" + month) ;
            var year = date.getFullYear() ;
            var defaultMinDate = year + "-" + "01-01" ;
            var maxDate = year + "-" + month + "-" + day ;
            var defaultMaxDate = maxDate ;
            $("#dataStatisticActivity .resultBody input.timeSelect").attr("max", maxDate) ;
            // $("#dataStatisticActivity .resultBody input.timeStart").attr("value" , defaultMinDate) ;
            $("#dataStatisticActivity .resultBody input.timeStart").val(defaultMinDate) ;
            this.startTime = defaultMinDate ;
            $("#dataStatisticActivity .resultBody input.timeEnd").val(defaultMaxDate) ;
            this.endTime = defaultMaxDate ;
            this.dataStatisticActivityTemp = this.$("#dataStatisticActivityResult").html();
            this.initCity();
            this.initPart();
            this.initPageData(true);
        },
        render: function () {
            return this;
        }
    });

    return View;
});
