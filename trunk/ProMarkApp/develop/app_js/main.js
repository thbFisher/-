require.config({
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'touch': {
            deps: ['jquery']
        },
        'jstorage': {
            deps: ['jquery']
        },
        'des-ecb': {
            deps: ['tripledes']
        },
        'jquery-weui': {
            deps: ['jquery']
        },
        'base64': {
            exports: 'Base64'
        },
        'swiper': {
            deps: ['jquery-weui']
        },
        'Calendar': {
            exports: 'Calendar'
        }
    },
    paths: { // 公共模块在此注册
        'jquery': '../app_lib/jquery-2.1.4',
        'underscore': '../app_lib/underscore',
        'backbone': '../app_lib/backbone',
        'text': '../app_lib/text',
        'touch': '../app_lib/touch',
        'md5': '../app_lib/md5',
        'jstorage': '../app_lib/jstorage',
        'jquery-weui': '../app_lib/jquery-weui',
        'swiper': '../app_lib/swiper',
        'base64': '../app_lib/base64.min',
        'PreloadingImg': '../app_lib/PreloadingImg',
        'fastclick': '../app_lib/fastclick',
        'localDB': '../app_lib/localDB',
        'FastClick': '../app_lib/fastclick',
        'reconnectingWebSocket': '../app_lib/reconnecting-websocket',
        'Calendar': '../app_lib/Calendar',
        'charFirst.pinyin': '../app_lib/jquery.charfirst.pinyin'
    }
});

require(['fastclick', 'PreloadingImg', 'backbone', 'router', 'localDB', 'phonegaputil'], function(FastClick, PreloadingImg, Backbone, AppRouter, localDB, phonegaputil) {
    var constant = require('constant');
    var businessDelegate = require('business-delegate');
    require('jstorage');

    var appRouter = new AppRouter();
    Backbone.history.start();

    function onBackKeyDown(e) {
        e.preventDefault();
        if (!Keyboard.isVisible) {
            appRouter.backButton();
        }
        e.stopPropagation();
    }

    function onPause() {
        setTimeout(function() {
            // TODO: do your thing!
            appRouter.pause();
        }, 0);
    }

    function onResume() {
        setTimeout(function() {
            // TODO: do your thing!
            appRouter.resume();
        }, 0);
    }

    function onMenuKeyDown(e) {
        e.preventDefault();
        appRouter.menuKeyDown();
        e.stopPropagation();
    }

    function onGetPayResult(e, result) {
        e.preventDefault();
        appRouter.getPayResult(result);
        e.stopPropagation();
    }

    function onResize(e) {
        appRouter.resize();
    }

    // function onkeyboardDidShow(e, result) {
    //     e.preventDefault();
    //     // alert('keyboardDidShow');
    //     e.stopPropagation();
    // }

    // function onkeyboardDidHide(e) {
    //     e.preventDefault();
    //     // alert('keyboardDidHide');
    //     e.stopPropagation();
    // }

    Backbone.on('TKonError', function(err) {
        console.log('令牌错误:' + err);
    });

    Backbone.on('NoUserId', function() {
        $.jtoast('账户已被禁用');
        console.log('NoUserId:');
        if (window.user) {
            phonegaputil.saveConfig('user', '', function() {
                Backbone.history.navigate('login', { trigger: true });
            }, function() {
                $.toast('登出失败', 'cancel');
            });
        }

    });

    function deviceReady() {
        console.log("deviceReady");

        PreloadingImg.perLoadingImg();

        FastClick.attach(document.body);

        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);

        $(document).on("backbutton", onBackKeyDown);
        $(document).on("menubutton", onMenuKeyDown);
        $(document).on("getPayResult", onGetPayResult);
        // $(window).bind("keyboardDidShow", onkeyboardDidShow);
        // $(window).bind("keyboardDidHide", onkeyboardDidHide);


        //IOS隐藏任务栏
        if (window.StatusBar && device.platform == 'iOS') {
            StatusBar.hide();
        }

        //隐藏闪屏
        setTimeout(function() {
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
        }, 1000);

        $(window).on('resize', onResize);

        //定义用户信息
        window.user = '';


        console.log($.jStorage.get('setting'));

        //获取缓存设置
        var obj = $.jStorage.get('setting');
        if (!obj) {
            $.jStorage.set('setting', {
                a: true, //新消息通知
                b: true, //声音
                c: true //震动
            });
        }

        // if (window.cordova) {
        //     //调试模式
        //     alert(device.model + "----" + device.cordova + "------" + device.uuid + "-----" + device.version + "----" + device.platform);
        // }

        //进入首页
        if (window.cordova) {
            appRouter.loginView();
        } else {
            localDB.initDb(function() {
                appRouter.loginView();
            });
        }
    }


    if (/(Android|iPhone|iPod|iPad)/.test(navigator.userAgent)) {
        console.log("android or ios");
        if (window.cordova) {
            document.addEventListener('deviceready', deviceReady, false);
        } else {
            $(function() {
                deviceReady();
                document.addEventListener('keydown', function(event) {
                    if (event.keyCode === 27) {
                        appRouter.backButton();
                    }
                });
            });
        }
    } else {
        $(function() {
            deviceReady();
            //按ESC键
            document.addEventListener('keydown', function(event) {
                if (event.keyCode === 27) {
                    appRouter.backButton();
                }
            });
        });
    }
});