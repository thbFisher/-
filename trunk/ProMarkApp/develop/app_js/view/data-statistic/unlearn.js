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
    var template = require('text!view/data-statistic/tpl/unlearn.html');
    var AppHeader = require('view/app-header');
	var detailView = require("view/data-statistic/unlearDetail");
    var View = Backbone.View.extend({
        el: 'body',
        events: {
            "tap #dataStatisticUnLearn .listItem": "toDetail" ,
            "tap #dataStatisticUnLearn .search .btn-search": "queryBySearch"
        },
        queryBySearch: function(e){
            var text = $(e.currentTarget).parents(".search").find("input.input-search").val();
            this.initPage(text);
        },
        toDetail: function(e){
            var uuid = $(e.currentTarget).data("uuid");
            var view = new detailView({
                uuid: uuid
            });
			view.show();
			return;
        },
        viewPage: function (e) {
            
        },
        backbutton: function () {
            Backbone.history.navigate("dataStatisticIndex/work/index", { trigger: true });
        },
        initPage(text){
            var query = {
            }
            if(text){
                query.courName = text ;
            }
            businessDelegate.dataStatisticLearn(query,_.bind(function (data) {
            	// $.hideLoading();
                var html = _.template(this.listTemp)({ list : data.obj.datas });
                $("#dataStatisticUnLearn .list .listContent").empty();
                $("#dataStatisticUnLearn .list .listContent").html(html);
                
            }, this), _.bind(function (err) {
                debugger ;
            	$.jtoast(err);
            }, this));
        },
        initialize: function () {
        // dataStatisticLearn: dataStatisticLearn ,
        // dataStatisticLearnDetail:  ,
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '业务学习情况'
            });
            this.$el.empty().append(this.header.$el).append(template);
            this.listTemp =  this.$("#dataStatisticUnLearnListItem").html();
            this.initPage() ;
        },
        render: function () {
            return this;
        }
    });

    return View;
});
