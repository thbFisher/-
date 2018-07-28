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
    var template = require('text!view/data-statistic/tpl/taskOrder.html');
    var AppHeader = require('view/app-header');
    var detailView = require("view/data-statistic/channelDetai");
    var View = Backbone.View.extend({
        el: 'body',
        events: {
            "tap #dataStatisticTaskOrder .queryTools .oneItem.evt": "chooseItem",
            "tap #dataStatisticTaskOrder .queryTools .oneItem .time": "chooseTime",
            "tap #dataStatisticTaskOrder .queryTools .oneItem .slectVal": "selectVal",
            "change #dataStatisticTaskOrder .timePicker input": "changeTime",
            "tap #dataStatisticTaskOrder .resultBody .content table tbody .clkToDetail": "toDetail" ,
            "tap #dataStatisticTaskOrder .resultBody .content table tbody tr th.order": "orderEvt"
        },
        orderEvt(e){
            var field = $(e.currentTarget).data("orderby");
            this.orderBy = field ;
            var current = "";
            if($(e.currentTarget).hasClass("asc")){//原本是升序
                current = "desc" ;
            }else if($(e.currentTarget).hasClass("desc")){//原本是降序
                current = "asc" ;
            }else{//原来没有排序，默认升序
                current = "asc" ;
            }
            this.order = current ;
            $("#dataStatisticTaskOrder .resultBody .content table tbody tr th.order").removeClass("desc") ;
            $("#dataStatisticTaskOrder .resultBody .content table tbody tr th.order").removeClass("asc") ;
            if("desc" == current){
                $(e.currentTarget).addClass("desc") ;
            }else{
                $(e.currentTarget).addClass("asc") ;
            }
            this.initPage() ;
        },
        toDetail: function(e){
            var uuid = $(e.currentTarget).data("uuid");
            var view = new detailView({
                month : this.selectedTime,
                area : this.city ,
                jobUuid : this.order ,
                uuid: uuid ,
                orderBy: this.orderBy ,
                order: this.order ,
                cityId : this.cityId 
            });
			view.show();
			return;
        },
        initCity: function(){
            //dataStatisticActCity
            businessDelegate.dataStatisticActCity({},_.bind(function (data) {
                this.cityDataInit = true ;
                var html = "" ;
                for(var i = 0 ; i < data.obj.datas.length ;i++){
                    html += '<div class="slectVal" data-type="city" data-uuid="'+data.obj.datas[i]+'" data-text="'+data.obj.datas[i]+'">'+data.obj.datas[i]+'</div>' ;
                }
                $("#dataStatisticTaskOrder .queryTools .oneItem .cityList").empty();
                $("#dataStatisticTaskOrder .queryTools .oneItem .cityList").html(html);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
        initOrderByTime: function(query){
            businessDelegate.dataStatistictaskOrderQuery({
                month: query
            } ,_.bind(function (data) {
                this.orderDataInit = true ;
                if(!data.obj.datas.length){
                    $.jtoast("无该月工单数据！");
                }
                var html = "" ;
                for(var  i = 0 ; i < data.obj.datas.length ;i++){
                    var order = data.obj.datas[i] ;
                    html += '<div class="slectVal" data-type="order"  data-uuid="'+ order.uuid +'" data-text="'+ order.jobsName +'">'+ order.jobsName +'</div>' ;
                }
                $("#dataStatisticTaskOrder .queryTools .oneItem .order").empty();
                $("#dataStatisticTaskOrder .queryTools .oneItem .order").html(html);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
        selectVal: function(e){
            var type = $(e.currentTarget).data("type") ;
            var uuid = $(e.currentTarget).data("uuid") ;
            if("city" == type){
                this.cityId = uuid ;
            }else{
                this.orderId = uuid ;
            }
            var text = $(e.currentTarget).data("text") ;
            $(e.currentTarget).parents(".oneItem").find(".queryResult").text(text) ;
            this.initPage() ;
        },
        /**时间选择 */
        chooseTime: function(){
            $("#dataStatisticTaskOrder .timePicker").removeClass("none") ;
            $('.jtoast').remove();
            $("#dataStatisticTaskOrder .timePicker input").click() ;
        },
        changeTime: function(){
            var val = $("#dataStatisticTaskOrder .timePicker input").val() ;
            $("#dataStatisticTaskOrder .queryTools .oneItem .time").text(val) ;
            this.selectedTime = val ;
            this.initOrderByTime(val) ;
            $("#dataStatisticTaskOrder .timePicker").addClass("none") ;
        },
        chooseItem: function(e){
            if($(e.currentTarget).hasClass("orderSelected")){
                if(!this.selectedTime){
                    $.jtoast("请先选择时间！");
                    return ;
                }
            }
            if ($(e.currentTarget).hasClass("active")) {//已经被选中
                if ($(e.currentTarget).find(".moreQuery").hasClass("none")) {//被隐藏
                    $(e.currentTarget).find(".moreQuery").removeClass("none");
                    $(e.currentTarget).find(".queryResult").removeClass("triup");
                    $(e.currentTarget).find(".queryResult").addClass("tridown");
                } else {
                    $(e.currentTarget).find(".moreQuery").addClass("none");
                    $(e.currentTarget).find(".queryResult").addClass("triup");
                    $(e.currentTarget).find(".queryResult").removeClass("tridown");
                }
            } else {
                $("#dataStatisticTaskOrder .queryTools .oneItem").removeClass("active");
                $("#dataStatisticTaskOrder .queryTools .oneItem .queryResult").addClass("rightWhite");
                $("#dataStatisticTaskOrder .queryTools .oneItem .queryResult").removeClass("triup");
                $("#dataStatisticTaskOrder .queryTools .oneItem .queryResult").removeClass("tridown");

                $("#dataStatisticTaskOrder .queryTools .oneItem .moreQuery").addClass("none");
                $(e.currentTarget).addClass("active");
                $(e.currentTarget).find(".moreQuery").removeClass("none");
                $(e.currentTarget).find(".queryResult").removeClass("rightWhite");
                $(e.currentTarget).find(".queryResult").addClass("tridown");
            }
        },
        initPage: function () {
            var query = {
                month : this.selectedTime,
                // month : "2018-05",
                areas : this.cityId ,
                jobUuid : this.orderId ,
                orderBy: this.orderBy ,
                order: this.order
            }
            businessDelegate.dataStatistictaskOrderQueryByChannel(query ,_.bind(function (data) {
            	// $.hideLoading();
                var html = "" ;
                for(var  i = 0 ; i < data.obj.datas.length ;i++){
                    var channel = data.obj.datas[i] ;
                    html += "<tr class='data-line'><td class='clkToDetail' data-uuid="+ channel.channelUUID +">"+channel.title+"</td><td>"+channel.total_cnt+"</td><td>"+channel.suc_cnt+"</td><td>"+channel.fail_cnt+"</td><td>"+channel.conu_cnt+"</td><td>"+channel.wait_cnt+"</td><td>"+(channel.suc_rate*100).toFixed(2)+"%</td><td>"+(channel.over_rate*100).toFixed(2)+"%</td></tr>" ;
                }
                $("#dataStatisticTaskOrder .resultBody .content table tr.data-line").remove() ;
                $("#dataStatisticTaskOrder .resultBody .content table tbody").append(html) ;
                
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },  
        backbutton: function () {
            Backbone.history.navigate("dataStatisticIndex/work/index", { trigger: true });
        },
        initialize: function () {
            //dataStatistictaskOrderQuery
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '营销任务工单执行情况'
            });
            this.$el.empty().append(this.header.$el).append(template);
            var date = new Date() ;
            var month = date.getMonth() + 1 ;
            month = month > 9 ? month : ("0" + month) ;
            var time = "" + date.getFullYear() +"-"+ month;
            // this.selectedTime = time ;
            // this.initPage() ;
            this.initCity() ;
            // this.initOrderByTime("2018-05");
            // this.initOrderByTime(time);
            this.initPage() ;
            
        },
        render: function () {
            return this;
        }
    });

    return View;
});
