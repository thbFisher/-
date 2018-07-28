/**
*   登录
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
    var template = require('text!view/tpl/login.html');

    var View = Backbone.View.extend({
        el: 'body',
        events: {
            'tap .get-validcode': 'getValidCode',
            'tap .btn-login': 'login'
        },
        getValidCode: function () {
            var mobile = $.trim(this.$('.login-mobile').val());
            if (!mobile) {
                $.jtoast('请输入手机号码');
                return;
            }

            $.showLoading("正在发送验证码");
            businessDelegate.getLoginSMS({
                mobile: mobile
            }, _.bind(function (data) {
                $.hideLoading();
                console.log(data.obj);
                $.alert("验证码已发送到您的手机", "发送成功");

                this.unValid();
            }, this), _.bind(function (err) {
                $.hideLoading();
                $.jtoast(err);
            }, this));

        },
        unValid: function () {
            var number = 59;
            this.$('.get-validcode').addClass('disabled');

            var interval = setInterval(_.bind(function () {
                this.$('.get-validcode').text(number + 's');

                if (number == 0) {
                    this.$('.get-validcode').text('获取验证码').removeClass('disabled');
                    clearInterval(interval);
                }

                number--;
            }, this), 1000);
        },
        login: function () {
            var mobile = $.trim(this.$('.login-mobile').val());
            var valid = $.trim(this.$('.login-valid').val());

            if (!mobile) {
                $.jtoast('请输入手机号码');
                return;
            }

            if (!valid) {
                $.jtoast('请输入验证码');
                return;
            }

            $.showLoading("正在登录...");
            businessDelegate.login({
                mobile: mobile,
                verify: valid
            }, _.bind(function (data) {
                $.hideLoading();
                $.toast("登录成功");

                window.user = data.obj;

                //跳转到首页
                phonegaputil.saveConfig('user', data.obj, function () {
                    Backbone.history.navigate('index', { trigger: true });
                }, function () {
                    Backbone.history.navigate('index', { trigger: true });
                });

                this.autoLoginPush();
            }, this), _.bind(function (err) {
                $.hideLoading();
                $.jtoast(err);
            }, this));
        },
        autoLoginPush: function () {
            if (window.cordova) {
                var phoneModel = device.model;
                if (phoneModel.startWith('MI') || phoneModel.indexOf('MI') > -1 || phoneModel.indexOf('xiaomi') > -1 || phoneModel.indexOf('XIAOMI') > -1) {
                    //小米设备
                    XiaoMIPushPlugin.registerPushAndAccount('A' + window.user.mobile, function () { }, function () { });
                } else {
                    //其他设备
                    xgpush.registerPush('A' + window.user.mobile, $.noop, $.noop);
                }
            } else {
                console.log('非cordova环境不执行推送模块注册');
            }
        },
        autoLogin: function () {
            phonegaputil.getConfig('user', _.bind(function (obj) {
                // alert(JSON.stringify(obj));
                //测试用户数据
                // obj = {
                //     company: "开发组测试",
                //     email: "277697086@qq.com",
                //     headImgUrl: "http://115.159.207.172:8979/ProMark/luanchuanimg/clientImg/avatar/2016-09-23/da43a4c7-2905-4ab1-9fb9-5a04155f085a.jpg",
                //     mobile: "17773166219",
                //     name: "田总",
                //     uuid: "55398a95-bcdb-42b5-ba2b-7377ccd72015",
                //     wx: "aaa",
                //     qq: "bbb",
                //     weibo: "ccc"
                // };

                if (obj) {
                    $.showLoading("正在自动登录...");
                    window.user = obj;

                    setTimeout(_.bind(function () {
                        $.hideLoading();
                        this.autoLoginPush();
                        Backbone.history.navigate('index', { trigger: true });
                    }, this), 100);
                }
            }, this), $.noop);
        },
        backbutton: function () {
            phonegaputil.exitApp();
        },
        initialize: function () {

            this.$el.empty().append(template);

            phonegaputil.getAppVersion(_.bind(function (version) {
                window.version = version;
            }, this));

            phonegaputil.getAppVersionCode(_.bind(function (code) {
                // alert(code);
                window.versioncode = code;
            }, this));
        },
        render: function () {
            this.autoLogin();
            return this;
        }
    });

    return View;
});
