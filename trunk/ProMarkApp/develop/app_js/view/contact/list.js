/**
*   首页
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
    var template = require('text!view/contact/tpl/list.html');
    var AppHeader = require('view/app-header');
    var CharFirstPinyin = require('charFirst.pinyin');

    var View = Backbone.View.extend({
        el: 'body',
        events: {

        },
        backbutton: function () {
            Backbone.history.navigate('contact-index', { trigger: true });
        },
        initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false,
                title: '联系人'
            });

            this.$el.empty().append(this.header.$el).append(template);

            /**
             * 测试
             */
            var str = CharFirstPinyin.makePy('wAsss我啊');
            console.log(str[0].charAt(0).toUpperCase());

            var arr = ['我扫地', '你下厨', '担惊受恐', '是的的', '天地间是', '自己说的', '技术的'];

            arr.sort(asc_sort);//按首字母排序
            console.log(arr);

            //按首字母排序
            function asc_sort(a, b) {
                return CharFirstPinyin.makePy(b)[0].charAt(0).toUpperCase() < CharFirstPinyin.makePy(a)[0].charAt(0).toUpperCase() ? 1 : -1;
            }
        },
        render: function () {
            return this;
        }
    });

    return View;
});
