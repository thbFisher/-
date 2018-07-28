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
	var template = require('text!view/data-statistic/tpl/channelDetai.html');
	var AppHeader = require('view/app-header');
	var SlidePage = require('view/slide-page');
	
	//keywords  关键字
	var View = SlidePage.extend({
        events: {
			"tap #dataStatisticOrderDetail .content table tbody tr th.order": "orderEvt"
        },
        orderEvt: function(e){
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
            $("#dataStatisticOrderDetail table tbody tr th.order").removeClass("desc") ;
            $("#dataStatisticOrderDetail table tbody tr th.order").removeClass("asc") ;
            if("desc" == current){
                $(e.currentTarget).addClass("desc") ;
            }else{
                $(e.currentTarget).addClass("asc") ;
            }
            this.initPage() ;
		},
		initPage(uuid){
            var query = {
				channelUUID : this.uuid ,
				orderBy : this.orderBy ,
				order : this.order ,
				month : this.month ,
				jobUuid : this.jobUuid ,
				areas: this.cityId 
			};
			businessDelegate.dataStatisticTaksOrderDetail(query,_.bind(function (data) {
				var tpl = _.template(this.trTmpl)({ list: data.obj.datas });
				$("#dataStatisticOrderDetail table tbody tr.data-line").empty();
				$("#dataStatisticOrderDetail table tbody").append(tpl);
            }, this), _.bind(function (err) {
            	$.jtoast(err);
            	$.hideLoading();
            }, this));
        },
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: "营销工单任务执行情况"
            });
			this.$el.empty().append(this.header.$el).append(template);
			this.channelUUID = options.uuid ;
			this.orderBy = options.orderBy ;
			this.order = options.order ;
			this.month = options.month ;
			this.jobUuid = options.jobUuid ;
			this.cityId  = options.cityId ;
			this.trTmpl = this.$("#dataStatisticOrderDetailTr").html();
			this.initPage() ;
		},
		render: function () {
			return this;
		}
	});

	return View;
});
