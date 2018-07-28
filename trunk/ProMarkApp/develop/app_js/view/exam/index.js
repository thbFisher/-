/**
 * 考试首页
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

    var Calendar = require('Calendar');

    // 加载模版通过text插件的方式将文本作为模块
    var template = require('text!view/exam/tpl/index.html');
    var AppHeader = require('view/app-header');

    var View = Backbone.View.extend({
        el: 'body',
        events: {
            'tap .exam-menu > div,.exam-help': 'viewPage',
            'tap .btn-startexam': 'viewPaper'
        },
		viewPaper: function(e){
            var uuid = $(e.currentTarget).data('uuid');
            if(!uuid){
                return;
            }

			Backbone.history.navigate('exam-paper/'+uuid, { trigger: true });
		},
        viewPage: function (e) {
            var href = $(e.currentTarget).data('href');
            if (!href) {
                return;
            }

            Backbone.history.navigate(href, { trigger: true });
        },
        renderExamDay: function (date) {
            var day_first = date.substr(8, 1);
            var day_second = date.substr(9, 1);

            var day;

            if (day_first == 0) {
                day = new Number(day_second);
            } else {
                day = new Number(date.substr(8, 2));
            }

            console.log(day);

            var cur = new Number(this.$('.curDay').html());

            var str = '<div class="td_sign_1" >' + day + '</div>';
            
            if(cur > day){
                str = '<div class="td_sign_2" >' + day + '</div>';
            }
            
            this.$('.day' + day).html(str);
        },
        getData: function () {
            $.showLoading();
            businessDelegate.getExam(_.bind(function (data) {
                $.hideLoading();

                _.each(data.obj.examDateArr, _.bind(function (v) {
                    this.renderExamDay(v);
                }, this));

                var tpl = _.template(this.template)({ list: data.obj.list });
                $('.exam-list').html(tpl);

            }, this), _.bind(function (err) {
                $.hideLoading();
                $.jtoast(err);
            }, this))
        },
        backbutton: function () {
            Backbone.history.navigate(this.history, { trigger: true });
        },
        initialize: function () {
            this.history = window._pageHistory ? window._pageHistory : "work/index";
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '在线测评'
            });

            this.header.setRightBtn('<span class="text exam-help" data-href="exam-help">考试须知</span>');

            this.$el.empty().append(this.header.$el).append(template);

            this.template = this.$('#tpl').html();

            Calendar.Init(null);

            var i = this.$('.curDay').index('.curMonth');
            $('.curMonth:lt('+i+')').css('color', '#aaa');
            
            this.getData();
        },
        render: function () {
            return this;
        }
    });

    return View;
});
