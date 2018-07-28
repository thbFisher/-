define(function (require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');

    jQuery.maskScreen = function () {
        $('body').append('<div class="mask"></div>')
    }

    jQuery.removeScreen = function (time) {
        if ($('.mask').length > 0) {
            setTimeout(function () {
                $('.mask').remove();
            }, time);
        }
    }

    //toast
    jQuery.jtoast = function (text) {
        $('.jtoast').remove();

        var $j = $('<div class="jtoast"><span>' + text + '</span></div>');
        $('body').append($j);

        var time, pos;
        var _LONG = 5 * 1000;
        var _SHORT = 3 * 1000;
        var _TOP = 'top';
        var _MIDDLE = 'middle';
        var _BOTTOM = 'bottom';

        //默认参数
        var options = {
            duration: 'SHORT',
            position: 'MIDDLE',
            background: ''
        }

        //持续时间
        if (arguments[1]) {
            options.duration = arguments[1];
        }

        //展示位置
        if (arguments[2]) {
            options.position = arguments[2];
        }

        //颜色
        if (arguments[3]) {
            options.background = arguments[3];
        }

        $j.addClass(options.background);

        if (typeof options.position == 'string') {
            switch (options.position) {
                case 'TOP':
                    pos = _TOP;
                    break;
                case 'MIDDLE':
                    pos = _MIDDLE;
                    break;
                case 'BOTTOM':
                    pos = _BOTTOM;
                    break;
            }
        } else {
            console.warn('参数错误');
            return;
        }
        $j.addClass(pos);

        if (typeof options.duration == 'string') {
            switch (options.duration) {
                case 'LONG':
                    time = _LONG;
                    break;
                case 'SHORT':
                    time = _SHORT;
                    break;
            }
        } else if (options.duration == 'number') {
            time = duration * 1000;
        }

        $j.addClass('in');
        setTimeout(function () {
            $j.addClass('out');
            setTimeout(function () {
                $j.remove();
            }, 300);
        }, time);
    }

    //format图文消息
    jQuery.formatText = function (content) {
        var $content = $(content);

        var new_content = '';
        $.each($content, function (i, v) {
            $(v).css({
                'font-size': '1em',
                'line-height': '1.8',
                'color': '#555'
            });

            $(v).find('span').css({
                'font-size': '1em',
                'line-height': '1.8',
                'color': '#555'
            });

            $(v).find('img').css({
                width: '100%'
            });

            $(v).find('img').parent().css({
                'text-indent': 0,
                'margin': 0,
                'padding': 0,
                'max-width': '100%'
            });

            $(v).find('a').prop('href', 'javascript:;');

            new_content += $(v).get(0).outerHTML;
        });

        return new_content;
    }

    //加载条
    jQuery.fn.loadingMask = function (option, retryCallback) {
        // 定义插件构造类
        function LoadingMask($el, options) {
            this.$el = $el;
            this.options = options;
            this.$mask = $('<div class="loading-mask"></div>');
            this.$content = $('<div class="inner-text"></div>');
            this.$ball = $('<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>');

            this.init();
        }
        LoadingMask.prototype = {
            init: function () {
                var maskDefaultCss = {
                    // top: 0,
                    // left: 0,
                    // width: orgiWidth,
                    // height: orgiHeight
                };

                this.$el.append(this.$mask);
                this.$content.html(this.$ball).css(this.options.contentCss);

                this.$ball.css(this.options.ballCss);

                setTimeout(_.bind(function () {
                    this.$mask.html(this.$content).css($.extend({}, maskDefaultCss, this.options.maskCss));
                }, this), 100);
            },
            hide: function () {
                setTimeout(_.bind(function () {
                    this.$mask.css({
                        opacity: 0
                    }).remove();
                    this.$el.removeData('loadingMask');
                }, this), 200);
            }
        };

        // 插件真正入口
        var $this = $(this);
        var plugin = $this.data('loadingMask');
        var options = $.extend({}, $.fn.loadingMask.defaults, typeof option == 'object' && option);

        if (!plugin) { // 没有绑定插件的情况下, 初始化一次插件
            plugin = new LoadingMask($this, options);
            $this.data('loadingMask', plugin);
        }

        if (typeof option == 'string') { // 直接调用插件方法
            plugin[option].apply(plugin, jQuery.makeArray(arguments).slice(1));
        }
    };

    // 插件默认配置
    jQuery.fn.loadingMask.defaults = {
        maskCss: {},
        content: '',
        contentCss: {},
        maskClass: '',
        ballCss: {}
    };

    /**
     * 录音键
     * 聊天室限定
     */
    jQuery.fn.recordVoice = function (option, retryCallback) {
        // 定义插件构造类
        function RecordVoid($el, options) {
            this.$el = $el;
            this.options = options;

            this.init();
        }
        RecordVoid.prototype = {
            refresh: function () {
                //重新初始化
                $('.voice-mask p').html('正在录音');
                $('.voice-mask').hide(); //隐藏遮罩层
                clearInterval(this.count_interval); //清除时间循环
                this.initArg();  //重新初始化参数
            },
            initArg: function () {
                this.start_p = 0;   //点击初始位移
                this.is_cancel = false; //是否选择取消录音操作
                this.cancel_limit = 100;    //取消录音位移
                this.record_time = 30;   //最大录音时长
                this.record_count_time = 0; //录音计时
                this.count_interval = null; //计时器
                this.record_end = 1;    //是否录音完成
            },
            init: function () {
                this.initArg();

                /**
                 * 确认用户权限打开
                 */
                if (window.cordova) {
                    this.record_end = 0;
                    window.plugins.audioRecorderAPI.record(_.bind(function (msg) {
                        this.record_end = 1;
                        // alert(msg);
                        console.log('默认开启录音');
                    }, this), _.bind(function (msg) {
                        this.record_end = 1;
                        console.log('默认开启录音');
                    }, this), 1);
                }

                /**
                 * 向上位移超过cancel_limit,可取消录音
                 */
                this.$el.on('touchstart', _.bind(function (e) {
                    if (!this.record_end) {
                        return;
                    }

                    this.start_p = $.getTouchPosition(e);

                    $('.voice-mask').show();
                    /**
                     * 开始录音
                     * 开启录音计时
                     */
                    this.record_end = 0;

                    this.count_interval = setInterval(_.bind(function () {
                        this.record_count_time++;
                        console.log(this.record_count_time);

                        //当时长等于指定录音时长
                        if (this.record_count_time == this.record_time) {
                            this.$el.trigger('touchend');
                        }
                    }, this), 1000);

                    if (window.cordova) {
                        window.plugins.audioRecorderAPI.record(_.bind(function (msg) {
                            // this.options.success(msg);
                            // this.refresh();
                            console.log('too long');
                        }, this), _.bind(function (msg) {
                            this.options.error(msg);
                            this.refresh();
                        }, this), 1000);
                    } else {
                        console.log('开始录音');
                    }
                }, this));

                this.$el.on('touchmove', _.bind(function (e) {
                    var p = $.getTouchPosition(e);
                    var diff = this.start_p.y - p.y;

                    if (diff > this.cancel_limit) {
                        this.is_cancel = true;
                        $('.voice-mask p').html('松开手指，取消发送');
                    } else {
                        this.is_cancel = false;
                        $('.voice-mask p').html('正在录音');
                    }

                    e.preventDefault();
                }, this), false);

                this.$el.on('touchend', _.bind(function () {
                    if (this.record_end) {
                        return;
                    }

                    /**
                     * 录音时间太短不做发送处理
                     */
                    if (this.record_count_time < 1) {
                        if (window.cordova) {
                            window.plugins.audioRecorderAPI.stop(function (msg) {
                                cosnole.log('cancelok: ' + msg);
                            }, function (msg) {
                                console.log('cancelerror: ' + msg);
                            });
                        }

                        $.toast('录音时间太短', 'cancel');
                        this.refresh();
                        return;
                    }

                    /**
                     * 准备发送处理
                     */
                    if (this.is_cancel) {
                        //取消录音
                        if (window.cordova) {
                            window.plugins.audioRecorderAPI.stop(function (msg) {
                                cosnole.log('cancelok: ' + msg);
                            }, function (msg) {
                                console.log('cancelerror: ' + msg);
                            });
                        } else {
                            console.log('取消录音');
                        }
                    } else {
                        //成功录音
                        if (window.cordova) {
                            window.plugins.audioRecorderAPI.stop(_.bind(function (msg) {
                                this.options.success(msg);
                            }, this), _.bind(function (msg) {
                                this.options.error(msg);
                            }, this));
                        } else {
                            this.options.success('测试url');
                        }
                    }

                    this.refresh();

                }, this));
            }
        };

        // 插件真正入口
        var $this = $(this);
        var plugin = $this.data('recordVoice');
        var options = $.extend({}, $.fn.recordVoice.defaults, typeof option == 'object' && option);

        if (!plugin) { // 没有绑定插件的情况下, 初始化一次插件
            plugin = new RecordVoid($this, options);
            $this.data('recordVoice', plugin);
        }

        if (typeof option == 'string') { // 直接调用插件方法
            plugin[option].apply(plugin, jQuery.makeArray(arguments).slice(1));
        }
    };

    // 插件默认配置
    jQuery.fn.recordVoice.defaults = {
        success: $.noop,
        stop: $.noop,
        error: $.noop
    };

    jQuery.updateApp = function (msg, downloadFn) {
        //安卓机指定
        if (window.cordova && device.platform != 'Android') {
            return;
        }

        if ($('.update-app').length <= 0) {
            var msg_str = '';

            if(msg){
                var msg_arr = msg.split('\n');
                $.each(msg_arr, function(i,v){
                    msg_str += '<p>'+v+'</p>'
                });
            }
            
            var html = [
                '<div class="updateMask update-app">',
                '<div class="updatePanel">',
                '<div class="updateTitle text-center">更新提示</div>',
                '<div class="updateContentWrapper">',
                msg_str,
                '</div>',
                '<div class="updateAction">',
                '<div class="font-blue update-app-download">下载</div>',
                '<div class="update-app-close">关闭</div>',
                '</div>',
                '</div>',
                '</div>'
            ];

            var $dom = $(html.join(''));

            $('body').append($dom);

            $dom.find('.update-app-download').on('tap', function () {
                //下载方法
                downloadFn();
                $dom.remove();
            });

            $dom.find('.update-app-close').on('tap', function () {
                $dom.remove();
            });
        }
    }

    /**
     * 捕捉错误
     */
    function catchError(e) {
        /*
            EvalError: raised when an error occurs executing code in eval()  
            RangeError: raised when a numeric variable or parameter is outside of its valid range  
            ReferenceError: raised when de-referencing an invalid reference  
            SyntaxError: raised when a syntax error occurs while parsing code in eval()  
            TypeError: raised when a variable or parameter is not a valid type  
            URIError: raised when encodeURI() or decodeURI() are passed invalid parameters  
        */

        var str = ('【页面发生错误】' + e.name + ": " + e.message);

        console.log(str);
        if (e instanceof EvalError) {
            console.log('raised when an error occurs executing code in eval()');
        } else if (e instanceof RangeError) {
            console.log('raised when a numeric variable or parameter is outside of its valid range');
        } else if (e instanceof ReferenceError) {
            console.log('raised when de-referencing an invalid reference');
        } else if (e instanceof SyntaxError) {
            console.log('raised when a syntax error occurs while parsing code in eval()');
        } else if (e instanceof TypeError) {
            console.log('raised when a variable or parameter is not a valid type');
        } else if (e instanceof URIError) {
            console.log('raised when encodeURI() or decodeURI() are passed invalid parameters');
        } else {
            console.log('Error');
        }

        return str;
    }

    /**
	 * 计算字符数目
	 **/
    function getStrBytesLength(str) {
        var bytesCount = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            if (/^[\u0000-\u00ff]$/.test(c)) { //匹配双字节
                bytesCount += 1;
            } else {
                bytesCount += 2;
            }
        }
        return bytesCount;
    }

    /**
     * 转换日期
     */
    function formatDateTime(stamp) {
        var now = new Date(stamp);
        var yy = now.getFullYear();      //年
        var mm = now.getMonth() + 1;     //月
        var dd = now.getDate();          //日
        var hh = now.getHours();         //时
        var ii = now.getMinutes();       //分
        var ss = now.getSeconds();       //秒

        var clock = yy + "-";
        if (mm < 10) clock += "0";
        clock += mm + "-";
        if (dd < 10) clock += "0";
        clock += dd + " ";
        if (hh < 10) clock += "0";
        clock += hh + ":";
        if (ii < 10) clock += "0";
        clock += ii + ":";
        if (ss < 10) clock += "0";
        clock += ss;
        return clock;
    }

    /**
     * 倒计时
     */
    function formatTimeLengthSimple(length) {
        var timer = ['00', '00', '00'];

        var h = Math.floor(length / 3600);
        if (h) {
            var hh = h;
            if (h < 10) {
                hh = '0' + h;
            }

            timer[0] = hh;
            length = length - h * 3600;
        }

        if (length) {
            var m = Math.floor(length / 60);
            if (m) {
                var mm = m;
                if (m < 10) {
                    mm = '0' + m;
                }

                timer[1] = mm;
                length = length - m * 60;
            }
        }

        if (length) {
            var s = length;
            var ss = s;
            if (s < 10) {
                ss = '0' + s;
            }

            timer[2] = ss;
        }

        if (!h) {
            str = timer[1] + ':' + timer[2];
        } else {
            str = timer.join(':');
        }

        // console.log(str);
        return str;
    }

    return {
        catchError: catchError,
        getStrBytesLength: getStrBytesLength,
        formatDateTime: formatDateTime,
        formatTimeLengthSimple: formatTimeLengthSimple
    }

});
