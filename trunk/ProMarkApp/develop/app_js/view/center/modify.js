/**
*   修改邮箱
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
    var template = require('text!view/center/tpl/modify.html');
    var AppHeader = require('view/app-header');
    var SlidePage = require('view/slide-page');

    var View = SlidePage.extend({
        events: {
            'tap .btn-submit': 'submit'
        },
        submit: function () {
            var str = $.trim(this.$('.input-modify').val());
            var warning = this.$('.input-modify').attr('placeholder');

            if (!str) {
                $.jtoast(warning);
                return;
            }

            var param = {
                wx: window.user.wx,
                qq: window.user.qq,
                weibo: window.user.weibo
            }

            param[this.type] = str;

            $.showLoading('正在提交');
            businessDelegate.modifyInfo(param, _.bind(function (data) {
                $.hideLoading();
                $.toast('修改成功');
                this.trigger('refresh', this.type, str);
                this.back();
            }, this), _.bind(function (err) {
                $.hideLoading();
                $.jtoast(err);
            }, this));
        },
        initialize: function (options) {
            this.type = options.type;
            this.value = options.value;

            var title = '';
            switch (this.type) {
                case 'qq':
                    title = '修改QQ';
                    break;
                case 'wx':
                    title = '修改微信';
                    break;
                case 'weibo':
                    title = '修改微博';
                    break;
            }

            this.header = new AppHeader({
                host: this,
                main: false,
                title: title
            });

            this.$el.empty().append(this.header.$el);
            var tpl = _.template(template)({ img: businessDelegate.validImage() });
            this.$el.append(tpl);


            this.qqTemplate = this.$('#qqTpl').html();
            this.wxTemplate = this.$('#wxTpl').html();
            this.weiboTemplate = this.$('#weiboTpl').html();

            switch (this.type) {
                case 'qq':
                    this.$('.modify-content').html(this.qqTemplate);
                    break;
                case 'wx':
                    this.$('.modify-content').html(this.wxTemplate);
                    break;
                case 'weibo':
                    this.$('.modify-content').html(this.weiboTemplate);
                    break;
            }

            if (this.value) {
                this.$('.input-modify').val(this.value);
            }
        },
        render: function () {
            return this;
        }
    });

    return View;
});
