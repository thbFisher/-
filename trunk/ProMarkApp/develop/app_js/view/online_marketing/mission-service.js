/**
 * 营销服务目标列表
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
    var template = require('text!view/online_marketing/tpl/mission-service.html');
    var AppHeader = require('view/app-header');
    var MissionDetail = require('view/online_marketing/mission-detail');
    var MissionReply = require('view/online_marketing/mission-reply');
    var SlidePage = require('view/slide-page');

    var View = SlidePage.extend({
        events: {
            'tap #missionServiceContent .btn-search': 'searchByKeyword',
            'tap #missionServiceContent .list-warning': 'initList',
            'tap #missionServiceContent .btn-prev,.btn-next': 'viewPage',

            'tap .right-button .text': 'showDetail',
            'tap .misson_service_box': 'showReply'
        },
        //显示任务详情页
        showDetail: function () {
            var view = new MissionDetail({
                sign: true,
                uuid: this.options.uuid
            });
            view.show();
        },
        //显示目标详情页
        showReply: function (e) {
            var uuid = $(e.currentTarget).data('uuid');

            var view = new MissionReply({
                uuid: uuid
            });
            view.show();

            view.on('render', _.bind(function () {
                this.getList(this.current_page, $.noop);
            }, this));
        },
        searchByKeyword: function () {
            if (!this.data) {
                return;
            }

            this.search_keyword = '';
            var keyword = $.trim(this.$input.val());
            if (!keyword) {
                return;
            }

            this.search_keyword = keyword;

            this.$warning.show();
            this.getList(1, $.noop);
        },
        viewPage: function (e) {
            var page = $(e.currentTarget).data('page');
            this.getList(page, $.noop);
        },
        getList: function (page, callback) {
            this.current_page = page;

            if (!this.isPullRefresh) {
                this.$listContent.empty();
                $.showLoading();
            } else {
                this.isPullRefresh = 0;
            }

            businessDelegate.getMissionTargetList({
                page: this.current_page,
                rows: this.rows,
                mobile: this.search_keyword,
                jobUuid: this.options.uuid
            }, _.bind(function (data) {
                this.data = data.obj;

                var tpl = _.template(this.listTemplate)({ data: data.obj });
                this.$listContent.html(tpl);

                this.$listWrapper.scrollTop(0);
                if (!this.isPullRefresh) {
                    $.hideLoading();
                }

                callback();
            }, this), _.bind(function (err) {
                this.$listContent.html(this.errorHTML);
                $.jtoast(err);

                if (!this.isPullRefresh) {
                    $.hideLoading();
                }

                callback();
            }, this));
        },
        initList: function () {
            this.$warning.hide();
            this.$input.val('');
            this.search_keyword = '';	//搜索关键字

            this.getList(1, $.noop);
        },
        initialize: function (options) {
            this.options = options;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '营销服务目标'
            });

            this.header.setRightBtn('<div class="text">任务详情</div>');
            this.$el.empty().append(this.header.$el).append(template);

            this.listTemplate = this.$('#listTpl').html();
            this.$listWrapper = this.$('#missionServiceContent .content');
            this.$listContent = this.$('#missionServiceContent .content > .inner');
            this.$input = this.$('.input-search');
            this.$warning = this.$('.list-warning');

            this.current_page = 1;	//当前页
            this.rows = 10; //每页显示数目

            this.data = null;	//当前内容
            this.search_keyword = ''; //搜索关键字

            this.isPullRefresh = 1;
            this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

            //下拉刷新
            this.$listWrapper.pullToRefresh();
            this.$listWrapper.on("pull-to-refresh", _.bind(function () {
                this.isPullRefresh = 1;
                this.getList(1, _.bind(function () {
                    this.$listWrapper.pullToRefreshDone();
                }, this));
            }, this));

            this.getList(1, $.noop);
        },
        render: function () {
            return this;
        }
    });

    return View;
});
