/**
 *   首页
 **/

define(function(require, exports, module) {
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
    var template = require('text!view/tpl/work.html');
    var AppHeader = require('view/app-header');
    var AppMenu = require('view/app-menu');
    var ExpectingView = require('view/expecting');

    var View = Backbone.View.extend({
        el: 'body',
        events: {
            'tap .work-link': 'viewPage' ,
            'tap .common-header .right-button .manager': 'toastInfo'
        },
        toastInfo: function(e){
            $.jtoast("敬请期待");
        },
        viewPage: function(e) {
            var link = $(e.currentTarget).data('link');
            var works = $(".common-content .work-link") ;
            for(var i = 0 ; i < works.length ; i++){
                if(works[i] == e.currentTarget){
                    window.workLinkArr = window.workLinkArr || [] ;
                    window.workLinkArr.push(i) ;
                    $.unique(window.workLinkArr) ;// 去重
                    break ;
                }
            }
            if (!link) {
                // $.jtoast('敬请期待');
                var title = $(e.currentTarget).data('title');
                var view = new ExpectingView({
                    title: title
                });
                view.show();

                return;
            }

            Backbone.history.navigate(link, { trigger: true });
        },
        backbutton: function() {
            Backbone.history.navigate('index', { trigger: true });
        },
        initialize: function(options) {
            window._pageHistory = "" ;
            this.history = options.history;
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '应用管理'
            });

            // this.menu = new AppMenu({
            //     index: 2
            // });

            // this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);
            this.$el.empty().append(this.header.$el).append(template);
            this.$(".common-header .right-button").removeClass("hide");
            this.$(".common-header .right-button").html("<div class='manager' style='width: 100%;height: 100%;line-height: 45px;'>编辑</div>");
            // this.$(".common-header").css("background","url(../app_img/banner.png) no-repeat;");
            var mySwiper = new Swiper('.swiper-container', {
                direction: 'horizontal',
                loop: true,
                autoplay: 3000,
                // 如果需要分页器
                pagination: '.swiper-pagination'
            });
            setTimeout(function(){
                if(window.workLinkArr && window.workLinkArr.length){
                    for(var i = 0 ; i < window.workLinkArr.length ; i++ ){
                        var needRemoveIndex = window.workLinkArr[i] ;
                        $($(".common-content .work-link")[needRemoveIndex]).find(".redPot").removeClass("redPot") ;
                    }
                }
            },5);
        },
        render: function() {
            return this;
        }
    });


    return View;
});