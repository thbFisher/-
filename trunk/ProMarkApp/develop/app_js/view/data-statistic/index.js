/**
 * 数据统计
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
    var template = require('text!view/data-statistic/tpl/index.html');
    var AppHeader = require('view/app-header');
    var ExpectingView = require('view/expecting');

    var View = Backbone.View.extend({
        el: 'body',
        events: {
            'tap #dataStatistic .content .menuCls': 'viewPage'
        },
        viewPage: function (e) {
            var type = $(e.currentTarget).data("type") ;
            console.log("type :" , type);
            var link ;
            if("activity" == type){//app活跃情况
                //  /dataStatisticActivity/dataStatisticIndex/work/index
                link = "/dataStatisticActivity/dataStatisticIndex/work/index" ;
            }else if("unlearn" == type){
                link = "/dataStatisticUnlearn/dataStatisticIndex/work/index" ;
            }else if("taskOrder" == type){
                link = "/dataStatisticTaskOrder/dataStatisticIndex/work/index" ;
            }
            if(link){
                Backbone.history.navigate(link, { trigger: true });
            }else{
                var title = $(e.currentTarget).data('title') || "敬请期待";
                var view = new ExpectingView({
                    title: title
                });
                view.show();

                return;
            }
            
        },
        backbutton: function () {
            Backbone.history.navigate(this.history, { trigger: true });
        },
        initialize: function () {
            this.history = window._pageHistory?window._pageHistory:"work/index";
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '数据统计'
            });
            this.$el.empty().append(this.header.$el).append(template);
        },
        render: function () {
            return this;
        }
    });

    return View;
});
