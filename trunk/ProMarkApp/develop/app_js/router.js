define(function(require, exports, module) {
    var Backbone = require('backbone');
    var utils = require('utils');

    var loginView = require('view/login'); //登录
    var indexView = require('view/index'); //主页
    var workView = require('view/work'); //主页

    //在线阅读
    // var readIndex = require('view/read/index');
    // var readInfo = require('view/read/info');
    // var readAttachment = require('view/read/attachment');
    // var readDetail = require('view/read/detail');
    // var readComment = require('view/read/comment');
    // var readMore = require('view/read/more');

    //new在线阅读
    var onlineReadIndex = require('view/online_read/index');
    var onlineReadInfo = require('view/online_read/info');
    var onlineReadDetail = require('view/online_read/detail');
    var onlineReadAttachment = require('view/online_read/attachment');

    //评测考试
    var examIndex = require('view/exam/index');
    var examHelp = require('view/exam/help');
    var examPaper = require('view/exam/paper');
    var examRecord = require('view/exam/record');
    var examFault = require('view/exam/fault');
    var examBankList = require('view/exam/banklist');
    var examBank = require('view/exam/bank');


    //知识库
    // var knowledgeIndex = require('view/knowledge/index');
    // var knowledgeList = require('view/knowledge/list');
    // var knowledgeDetail = require('view/knowledge/detail');
    // var knowledgeAnswer = require('view/knowledge/answer');
    // var knowledgeQuestion = require('view/knowledge/question');
    // var knowledgeMyQuestion = require('view/knowledge/myquestion');
    // var knowledgeMyAnswer = require('view/knowledge/myanswer');

    //new知识库
    var mobileRepositoryIndex = require('view/mobile_repository/index');
    var mobileRepositoryQuestion = require('view/mobile_repository/question');
    var mobileRepositoryMy = require('view/mobile_repository/my');
    var mobileRepositoryDetail = require('view/mobile_repository/detail');
    var exampleDetail = require('view/mobile_repository/example-detail');

    //个人中心
    var centerIndex = require('view/center/index');

    //聊天室
    var chatroomList = require('view/chatroom/list');
    var chatroomView = require('view/chatroom/index');

    //在线营销
    // var marketingIndex = require('view/marketing/index');
    // var marketingFixture = require('view/marketing/fixture');
    // var marketingMission = require('view/marketing/mission');
    // var marketingMissionList = require('view/marketing/mission-list');
    // var marketingMissionDetail = require('view/marketing/mission-detail');
    // var marketingMissionReply = require('view/marketing/mission-reply');
    // var marketingPay = require('view/marketing/pay');

    //new在线营销
    var onlineMarketingIndex = require('view/online_marketing/index');

    //新闻
    var newsIndex = require('view/news/index');
    // var newsDetail = require('view/news/detail');

    //联系人
    var contactIndex = require('view/contact/index');

    //我的客户
    var myCustomer = require('view/my_customer/index');
    //酬金查询
    var queryRemuneration = require("view/queryRemuneration/index");
    //图文营销
    var graphicMarketing = require("view/graphic_marketing/index");
    var marketingCommunications = require("view/marketing-communications/index");
    var marketingTask = require("view/marketing-tasks/index");

    //数据统计
    var dataStatisticIndex = require("view/data-statistic/index") ;
    var dataStatisticActivity = require("view/data-statistic/activity") ;
    var dataStatisticUnlearn = require("view/data-statistic/unlearn") ;
    var dataStatisticTaskOrder = require("view/data-statistic/taskOrder") ;
    

    // var contactList = require('view/contact/list');
    // var contactDetail = require('view/contact/detail');

    //日志
    // var logIndex = require('view/log/index');
    // var logForm = require('view/log/form');
    // var logMine = require('view/log/mine');
    // var logDetail = require('view/log/detail');


    //测试页面
    var learnAppliationIndex = require('view/learn-application');
    var AppRouter = Backbone.Router.extend({
        routes: {
            'login': 'loginView',
            'index': 'indexView',
            'work/:history': 'workView',

            //在线阅读
            // 'read-index': 'readIndex',
            // 'read-info/:uuid/:addCount': 'readInfo',
            // 'read-attachment/:uuid': 'readAttachment',
            // 'read-detail/:uuid': 'readDetail',
            // 'read-comment/:uuid': 'readComment',
            // 'read-more/:uuid/:commentUUID': 'readMore',

            //new在线阅读
            'online-read-index/:history/:history': 'onlineReadIndex',
            'online-read-info/:uuid': 'onlineReadInfo',
            'online-read-detail/:uuid': 'onlineReadDetail',
            'online-read-attachment/:uuid': 'onlineReadAttachment',

            //评测考试
            'exam-index/:history/:history': 'examIndex',
            'exam-help': 'examHelp',
            'exam-paper/:uuid': 'examPaper',
            'exam-record': 'examRecord',
            'exam-fault': 'examFault',
            'exam-banklist': 'examBankList',
            'exam-bank/:uuid': 'examBank',

            //知识库
            // 'knowledge-index': 'knowledgeIndex',
            // 'knowledge-list': 'knowledgeList',
            // 'knowledge-question': 'knowledgeQuestion',
            // 'knowledge-myquestion': 'knowledgeMyQuestion',
            // 'knowledge-myanswer': 'knowledgeMyAnswer',
            // 'knowledge-detail/:uuid/:history': 'knowledgeDetail',
            // 'knowledge-answer/:uuid/:history': 'knowledgeAnswer',

            //new知识库
            'mobile-repository-index(/:nav)/:history/:history': 'mobileRepositoryIndex',
            'mobile-repository-question': 'mobileRepositoryQuestion',
            'mobile-repository-my/:type(/:status)': 'mobileRepositoryMy',
            'mobile-repository-detail/:uuid/:history(/:type)': 'mobileRepositoryDetail',
            'example-detail/:uuid': 'exampleDetail',

            //个人中心
            'center-index': 'centerIndex',

            //聊天室
            'chatroom-list': 'chatroomList',
            'chatroom/:uuid/:title': 'chatroomView',

            //在线营销
            // 'marketing-index': 'marketingIndex',
            // 'marketing-fixture': 'marketingFixture',
            // 'marketing-mission': 'marketingMission',
            // 'marketing-mission-list/:uuid': 'marketingMissionList',
            // 'marketing-mission-detail/:uuid': 'marketingMissionDetail',
            // 'marketing-mission-reply/:uuid': 'marketingMissionReply',
            // 'marketing-pay': 'marketingPay',

            //new在线营销
            'online-marketing-index/:history': 'onlineMarketingIndex',

            //新闻
            'news-index/:type': 'newsIndex',
            // 'news-detail/:type/:uuid': 'newsDetail',

            //联系人
            'contact-index': 'contactIndex',
            // 'contact-list': 'contactList',
            // 'contact-detail': 'contactDetail',

            //日志
            // 'log-index': 'logIndex',
            // 'log-form/:type': 'logForm',
            // 'log-mine': 'logMine',
            // 'log-detail/:type': 'logDetail'


            //测试页面
            'learnAppliation/:history': 'learnAppliationIndex',
            //我的客户
            'my-customer/:history/:history': 'myCustomer' ,
            'query-remuneration/:history/:history': 'queryRemuneration' ,
            "graphic-marketing/:history/:history" : "graphicMarketing" ,
            //数据统计
            "dataStatisticIndex/:history/:history":"dataStatisticIndex" ,
            "dataStatisticActivity/dataStatisticIndex/:history/:history": "dataStatisticActivity" ,
            "dataStatisticUnlearn/dataStatisticIndex/:history/:history":"dataStatisticUnlearn" ,
            "dataStatisticTaskOrder/dataStatisticIndex/:history/:history":"dataStatisticTaskOrder" ,
            "marketing-communications/:history/:history" :"marketingCommunications" ,
            "marketing-task/:history/:history" :"marketingTask"
        },
        initialize: function() {
            console.log("AppRouter initialize");
            this.currentPage = null;
        },
        changePage: function(page) {
            $.maskScreen();

            //销毁事件
            if (this.currentPage) {
                this.currentPage.undelegateEvents();
                if (this.currentPage.destroy) {
                    this.currentPage.destroy();
                }
            }

            page.render();

            if (page.afterRender) {
                page.afterRender();
            }

            this.currentPage = page;

            $.removeScreen(300);
        },
        resume: function() {
            var $slidePage = $('.slide-page');

            if ($slidePage.length > 0) {
                $slidePage.last().find('.btn-resume').trigger('tap');
                return;
            }

            if (this.currentPage && this.currentPage.resume) {
                this.currentPage.resume();
            }
        },
        pause: function() {
            var $slidePage = $('.slide-page');

            if ($slidePage.length > 0) {
                $slidePage.last().find('.btn-pause').trigger('tap');
                return;
            }

            if (this.currentPage && this.currentPage.pause) {
                this.currentPage.pause();
            }
        },
        resize: function() {
            if (this.currentPage && this.currentPage.resize) {
                this.currentPage.resize();
            }
        },
        backButton: function() {
            var $slidePage = $('.slide-page');

            if (window.cordova && window.Keyboard.isVisible) {
                return;
            }

            if ($slidePage.length > 0) {
                $slidePage.last().find('.btn-back').trigger('tap');
                return;
            }

            if (this.currentPage && this.currentPage.backbutton) {
                this.currentPage.backbutton();
            }
        },
        loginView: function() {
            var view = new loginView();
            this.changePage(view);
        },
        indexView: function() {
            var view = new indexView();
            this.changePage(view);
        },
        workView: function(history) {
            var view = new workView({
                history: history
            });
            this.changePage(view);
        },

        //old在线阅读
        // readIndex: function () {
        // 	var view = new readIndex();
        // 	this.changePage(view);
        // },
        // readInfo: function (uuid, addCount) {
        // 	var view = new readInfo({ uuid: uuid, addCount: addCount });
        // 	this.changePage(view);
        // },
        // readAttachment: function (uuid) {
        // 	var view = new readAttachment({ uuid: uuid });
        // 	this.changePage(view);
        // },
        // readDetail: function (uuid) {
        // 	var view = new readDetail({ uuid: uuid });
        // 	this.changePage(view);
        // },
        // readComment: function (uuid) {
        // 	var view = new readComment({ uuid: uuid });
        // 	this.changePage(view);
        // },
        // readMore: function (uuid, commentUUID) {
        // 	var view = new readMore({ uuid: uuid, commentUUID: commentUUID });
        // 	this.changePage(view);
        // },

        //new在线阅读
        onlineReadIndex: function(history) {
            var view = new onlineReadIndex({
                history: history
            });
            this.changePage(view);
        },
        onlineReadInfo: function(uuid) {
            var view = new onlineReadInfo({ uuid: uuid });
            this.changePage(view);
        },
        onlineReadDetail: function(uuid) {
            var view = new onlineReadDetail({ uuid: uuid });
            this.changePage(view);
        },
        onlineReadAttachment: function(uuid) {
            var view = new onlineReadAttachment({ uuid: uuid });
            this.changePage(view);
        },

        //在线测评
        examIndex: function(history) {
            var view = new examIndex({
                history: history
            });
            this.changePage(view);
        },
        examHelp: function() {
            var view = new examHelp();
            this.changePage(view);
        },
        examPaper: function(uuid) {
            var view = new examPaper({ uuid: uuid });
            this.changePage(view);
        },
        examRecord: function() {
            var view = new examRecord();
            this.changePage(view);
        },
        examFault: function() {
            var view = new examFault();
            this.changePage(view);
        },
        examBankList: function() {
            var view = new examBankList();
            this.changePage(view);
        },
        examBank: function(uuid) {
            var view = new examBank({ uuid: uuid });
            this.changePage(view);
        },

        //old知识库
        // knowledgeIndex: function () {
        // 	var view = new knowledgeIndex();
        // 	this.changePage(view);
        // },
        // knowledgeList: function () {
        // 	var view = new knowledgeList();
        // 	this.changePage(view);
        // },
        // knowledgeQuestion: function () {
        // 	var view = new knowledgeQuestion();
        // 	this.changePage(view);
        // },
        // knowledgeDetail: function (uuid, history) {
        // 	var view = new knowledgeDetail({
        // 		uuid: uuid,
        // 		history: history
        // 	});
        // 	this.changePage(view);
        // },
        // knowledgeAnswer: function (uuid, history) {
        // 	var view = new knowledgeAnswer({
        // 		uuid: uuid,
        // 		history: history
        // 	});
        // 	this.changePage(view);
        // },
        // knowledgeMyQuestion: function () {
        // 	var view = new knowledgeMyQuestion();
        // 	this.changePage(view);
        // },
        // knowledgeMyAnswer: function () {
        // 	var view = new knowledgeMyAnswer();
        // 	this.changePage(view);
        // },

        //new知识库
        mobileRepositoryIndex: function(nav,c) {
            var view = new mobileRepositoryIndex({
                nav: nav,
                history: history
            });
            this.changePage(view);
        },
        mobileRepositoryQuestion: function() {
            var view = new mobileRepositoryQuestion();
            this.changePage(view);
        },
        mobileRepositoryMy: function(type, status) {
            var view = new mobileRepositoryMy({
                type: type,
                status: status
            });
            this.changePage(view);
        },
        mobileRepositoryDetail: function(uuid, history, type) {
            var view = new mobileRepositoryDetail({
                uuid: uuid,
                history: history,
                type: type
            });
            this.changePage(view);
        },
        exampleDetail: function(uuid) {
            var view = new exampleDetail({
                uuid: uuid
            });
            this.changePage(view);
        },

        //个人中心
        centerIndex: function() {
            var view = new centerIndex();
            this.changePage(view);
        },
        chatroomList: function() {
            var view = new chatroomList();
            this.changePage(view);
        },
        chatroomView: function(uuid, title) {
            var view = new chatroomView({
                uuid: uuid,
                title: title
            });
            this.changePage(view);
        },
        // marketingIndex: function () {
        // 	var view = new marketingIndex();
        // 	this.changePage(view);
        // },
        // marketingFixture: function () {
        // 	var view = new marketingFixture();
        // 	this.changePage(view);
        // },
        // marketingMission: function () {
        // 	var view = new marketingMission();
        // 	this.changePage(view);
        // },
        // marketingMissionList: function (uuid) {
        // 	var view = new marketingMissionList({
        // 		uuid: uuid
        // 	});
        // 	this.changePage(view);
        // },
        // marketingMissionDetail: function (uuid) {
        // 	var view = new marketingMissionDetail({
        // 		uuid: uuid
        // 	});
        // 	this.changePage(view);
        // },
        // marketingMissionReply: function (uuid) {
        // 	var view = new marketingMissionReply({
        // 		uuid: uuid
        // 	});
        // 	this.changePage(view);
        // },
        // marketingPay: function () {
        // 	var view = new marketingPay();
        // 	this.changePage(view);
        // },

        /**
         * 
         */
        onlineMarketingIndex: function(history) {
            var view = new onlineMarketingIndex({
                history: history
            });
            this.changePage(view);
        },

        /**
         * 新闻
         */
        newsIndex: function(type) {
            var view = new newsIndex({
                type: type
            });
            this.changePage(view);
        },
        // newsDetail: function(type, uuid){
        // 	var view = new newsDetail({
        // 		type: type,
        // 		uuid: uuid
        // 	});
        // 	this.changePage(view);
        // },
        /**
         * 联系人
         */
        contactIndex: function() {
            var view = new contactIndex();
            this.changePage(view);
        },
        /**
         * 测试
         */
        learnAppliationIndex: function(history) {
            var view = new learnAppliationIndex({
                history: history
            });
            this.changePage(view);
        },
        myCustomer: function(history){
            var view = new myCustomer({
                history: history
            });
            this.changePage(view);
        },
        queryRemuneration: function(history){
            var view = new queryRemuneration({
                history: history
            });
            this.changePage(view);
        },
        graphicMarketing: function(history){
            var view = new graphicMarketing({
                history: history
            });
            this.changePage(view);
        },
        dataStatisticIndex: function(history){
            var view = new dataStatisticIndex({
                history: history
            });
            this.changePage(view);
        },
        dataStatisticActivity: function(history){
            var view = new dataStatisticActivity({
                history: history
            });
            this.changePage(view);
        },
        dataStatisticUnlearn: function(history){
            var view = new dataStatisticUnlearn({
                history: history
            });
            this.changePage(view);
        },
        dataStatisticTaskOrder: function(history){
            var view = new dataStatisticTaskOrder({
                history: history
            }); 
            this.changePage(view) ;
        },
        marketingCommunications: function(history){
            var view = new marketingCommunications({
                history: history
            });
            this.changePage(view);
        },
        marketingTask: function(history){
            var view = new marketingTask({
                history: history
            });
            this.changePage(view);
        }
        // contactList: function(){
        // 	var view = new contactList();
        // 	this.changePage(view);
        // },
        // contactDetail: function(){
        // 	var view = new contactDetail();
        // 	this.changePage(view);
        // },

        /**
         * 日志
         */
        // logIndex: function(){
        // 	var view = new logIndex();
        // 	this.changePage(view);
        // },
        // logForm: function(type){
        // 	var view = new logForm({
        // 		type: type
        // 	});
        // 	this.changePage(view);
        // },
        // logMine: function(){
        // 	var view = new logMine();
        // 	this.changePage(view);
        // },
        // logDetail: function(type){
        // 	var view = new logDetail({
        // 		type: type
        // 	});
        // 	this.changePage(view);
        // }
    });

    return AppRouter;
});