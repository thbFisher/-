define(function(require, exports, module) {
    // 统一在最前面定义依赖
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');

    require('touch');

    // 加载模版通过text插件的方式将文本作为模块
    var template = require('text!view/tpl/_app-menu.html');

    var View = Backbone.View.extend({
        className: 'common-menu',
        events: {
            'tap a.weui_tabbar_item': 'changePage'
        },
        changePage: function(e) {
            var $e = $(e.currentTarget);
            var href = $e.data('href');
            if (!href) {
                return;
            }
            Backbone.history.navigate(href, { trigger: true });
        },
        initialize: function(options) {
            var menuData = [{
                    icon: '<i class="iconfont icon-liaotian"></i>',
                    title: '沟通',
                    url: 'chatroom-list'
                }, {
                    icon: '<i class="iconfont icon-shouye1"></i>',
                    title: '首页',
                    url: 'index'
                },
                // {
                //     icon: '<i class="iconfont icon-jiugongge"></i>',
                //     title: '工作',
                //     url: 'work'
                // },
                // {
                //     icon: '<i class="iconfont icon-lianxiren"></i>',
                //     title: '联系人',
                //     url: 'contact-index'
                // },
                {
                    icon: '<i class="iconfont icon-wode"></i>',
                    title: '我的',
                    url: 'center-index'
                }
            ];
            // if("#chatroom-list" == window.location.hash){
            //     options = 0 ;
            // }
            var data = _.extend(options, { data: menuData });
            console.log(data);
            var tpl = _.template(template)(data);
            this.$el.html(tpl);
        },
        render: function() {
            return this;
        }
    });

    return View;
});