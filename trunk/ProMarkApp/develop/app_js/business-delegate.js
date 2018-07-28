define(function (require, exports, module) {
    var $ = require('jquery');
    var constant = require('constant');

    require('md5');
    require('backbone');
    require('jstorage');

    // 全局控制数据代理是访问本地还是远程
    var globalApiMode = constant.globalApiMode;
    // 全局是否使用本地缓存
    var isUserLocalDB = true;

    //清除全部缓存
    // $.jStorage.flush();

    //接口
    var processAjaxMap = {};

    var remoteRoot = constant.serverURL;

    // 访问字典
    var apiMap = {
        getLoginSMS: { //获取登录短信验证码
            local: '',
            remote: 'nologin/clientUserSms.do'
        },
        login: { //登录
            local: '',
            remote: 'nologin/clientUserLogin.do'
        },
        getClientUserInfo: {  //获取指定用户名片信息
            local: '',
            remote: 'login/getClientUserInfo.do'
        },
        getClientUserList: {    //获取全部在线用户信息
            local: '',
            remote: 'login/getPersonInfo.do'
        },
        /**
         * 个人中心
         */
        modifyEmail: { //修改邮箱
            local: '',
            remote: 'login/clientUserUpdateEmail.do'
        },
        modifyAvatar: { //修改头像
            local: '',
            remote: 'login/clientUserUpdateImg.do'
        },
        getUserInfo: {
            remote: 'login/getCurrentClientUserInfo.do'
        },
        getWaitStatistics: {
            remote: 'login/getWaitStatistics.do'
        },
        addAdvise: {
            remote: 'login/saveLeaving.do'
        },
        modifyInfo: {
            remote: 'login/clientUserUpdateInfo.do'
        },

        /**
         * 登录聊天室
         */
        loginWebSocket: {
            remote: 'login/clientWebSocketLogin.do'
        },
        /**
         * 考试信息
         */
        getExam: { //获取考试信息
            local: 'app_data/exam/index.json',
            remote: 'login/examIndex.do'
        },
        getExamPaper: {  //获取试卷信息   
            local: 'app_data/exam/paper.json',
            remote: 'login/examPaper.do'
        },
        submitExamPaper: {
            local: 'app_data/exam/submitpaper.json',
            remote: 'login/examPaperSubmit.do'
        },
        getExamRecord: {    //获取考试记录成绩
            local: 'app_data/exam/record.json',
            remote: 'login/examRecord.do'
        },
        getExamHelp: {    //获取考试须知
            local: 'app_data/exam/help.json',
            remote: 'login/examInfo.do'
        },
        getExamFault: {
            local: 'app_data/exam/fault.json',
            remote: 'login/examFault.do'
        },
        getExamBankList: {
            local: 'app_data/exam/banklist.json',
            remote: 'login/examTypeList.do'
        },
        getExamBankDetail: {
            local: 'app_data/exam/bank.json',
            remote: 'login/examTypeQuestionList.do'
        },
        /**
         * 在线阅读
         */
        //学习资料列表
        readList: {
            local: 'app_data/read/list.json',
            remote: 'login/readList.do'
        },
        //我的浏览记录
        myReadList: {
            remote: 'login/readUserList.do'
        },
        //学习资料概述
        readInfo: {
            local: 'app_data/read/info.json',
            remote: 'login/readInfo.do'
        },
        //学习资料附件列表
        readAttachment: {
            local: 'app_data/read/attach.json',
            remote: 'login/readAttacments.do'
        },
        //获取预览
        getReadAttachmentPreview: {
            remote: 'login/readAttacmentsPreview.do'
        },
        //获取下载
        getReadAttachmentDownload: {
            remote: 'login/readAttacmentsDownload.do'
        },
        //学习资料详情
        readDetail: {
            local: 'app_data/read/detail.json',
            remote: 'login/readDetail.do'
        },
        //资料评论列表
        readCommentsList: {
            local: 'app_data/read/comment.json',
            remote: 'login/readCommentsList.do'
        },
        //回复评论列表
        readCommentReplyList: {
            local: 'app_data/read/more.json',
            remote: 'login/readCommentsSecondaryList.do'
        },
        /**
         * 在线阅读操作
         */
        //资料点赞
        likeReadDetail: {
            remote: 'login/readCoursewareThumbs.do'
        },
        //新增资料一级评论
        addReadComment: {
            remote: 'login/readCommentsSave.do'
        },
        //资料一级评论点赞
        likeReadComment: {
            remote: 'login/readCommentsThumbs.do'
        },
        //回复一级评论
        addReadCommentReply: {
            remote: 'login/readCommentsSecondarySave.do'
        },
        //回复评论点赞
        likeReadCommentReply: {
            remote: 'login/readCommentsSecondaryThumbs.do'
        },
        /**
         * 掌上知识库
         */
        //获取问题类型
        getKnowledgeQuestionType: {
            remote: 'login/getPalmKnowTypeService.do'
        },
        //知识库问题列表
        getKnowledgeList: {
            remote: 'login/getAllKnowList.do'
        },
        //新增问题
        addKnowledgeQuestion: {
            remote: 'login/insertNewKnowQue.do'
        },
        //获取我的问题
        getMyKnowledgeQuestion: {
            remote: 'login/getKnowListCurrentUser.do'
        },
        //获取我回答的问题
        getMyKnowledgeAnswer: {
            remote: 'login/queryMyAnQueList.do'
        },
        //回答问题
        addKnowledgeAnswer: {
            remote: 'login/insertNewKnowQueAn.do'
        },
        //获取查看问题详情
        getKnowledgeAnswers: {
            remote: 'login/getQueAndAnByQUUID.do'
        },
        //设置最佳评论
        setKnowledgeBestAnswer: {
            remote: 'login/setAnIsGoodByAnUUID.do'
        },
        //关闭问题
        closeKnowledgeQuestion: {
            remote: 'login/closeQuestionByQUUID.do'
        },
        //回复评论
        addKnowledgeAnswerComment: {
            remote: 'login/insertNewCommentByAnUUID.do'
        },
        //获取评论列表
        getKnowledgeAnswerComment: {
            remote: 'login/getCommentByAnUUID.do'
        },
        //获取分享信息
        getKnowledgeShareInfo: {
            remote: 'login/queryShare.do'
        },
        //设置答案转发次数
        addKnowledgeShareCountByAnUUID: {
            remote: 'login/addForwardCountByAnUUID.do'
        },
        //设置问题转发次数
        addKnowledgeShareCountByQueUUID: {
            remote: 'login/addForwardCountByQueUUID.do'
        },
        /**
         * 在线营销
         */
        //获取权限
        getMarketingPermission: {
            remote: 'login/markEmpPermissions.do'
        },
        //获取我的客户列表
        getMarketingFixtureList: {
            remote: 'login/markCustomerList.do'
        },
        //获取我的客户详情
        getMarketingFixtureDetail: {
            remote: 'login/markCustomerDetails.do'
        },
        //获取任务列表
        getMissionList: {
            remote: 'login/markJobsList.do'
        },
        //获取任务详情
        getMissionDetail: {
            remote: 'login/markJobsDetails.do'
        },
        markJobsNewTargetDetailsSave:{
            remote: 'login/markJobsNewTargetDetailsSave.do'
        },
        //签收任务
        signMission: {
            remote: 'login/markJobsTargetSign.do'
        },
        //获取营销服务目标列表
        getMissionTargetList: {
            remote: 'login/markJobsTargetList.do'
        },
        //获取营销服务目标详情
        getMissionTargetDetail: {
            remote: 'login/markJobsTargetDetails.do'
        },
        //完成任务目标
        replyMissionTarget: {
            remote: 'login/markJobsTargetDetailsSave.do'
        },
        //导出任务目标营销单
        sendMissionTargetList: {
            remote: 'login/markJobsTargetEmail.do'
        },
        //获取渠道列表
        getMarketingChannel: {
            remote: 'login/markChannelList.do'
        },
        addCallNumber: {//addCallNumber.do
            remote: 'login/addCallNumber.do'
        },
        //获取酬金月份
        getMarketingPayMonthByChannel: {
            remote: 'login/markRemunerationList.do'
        },
        //获取酬金详情
        getMarketingPayDetail: {
            remote: 'login/markRemunerationDetails.do'
        },
        /**通报主题 */
        getMarkReportList:{
            remote: 'login/markReportList.do'
        },
        /**营销通报任务列表  */
        getMarkReportTaskList:{
            remote: 'login/markReportTaskList.do'
        },
        /**营销通报竞赛列表  */
        getMarkReportContastList:{
            remote: 'login/markReportContastList.do'
        },
        /**竞赛通报详情 */
        getMarkReportContastDetail:{
            remote: 'login/markReportContastDetail.do'
        },
        /**营销通报个人列表  */
        getMarkReportPersonList:{
            remote: 'login/markReportPersonList.do'
        },
        /**酬金  。月份查询列表 */
        getmarkRemunerationNewListByChannel:{
            remote: "login/markRemunerationNewListByChannel.do"
        },
        /**酬金  。渠道查询列表 */
        getMarkRemunerationNewListByMonth :{
            remote: "login/markRemunerationNewListByMonth.do"
        },
        /**酬金  详情 */
        getMarkRemunerationNewDetails :{
            remote: "login/markRemunerationNewDetails.do"
        },
        
        
        /**营销任务列表 */
        getMarkJobsNewList :{
            remote: "login/markJobsNewList.do"
        },

        sendMarketingTaskMsg:{
            remote: "login/sendSms.do"
        },
        /**营销任务详情 */
        getmarkJobsDetailsNew :{
            remote: "login/markJobsDetailsNew.do"
        },
        markJobsNewTargetEmail:{
            remote: "login/markJobsNewTargetEmail.do"
        },
        /**营销任务客户列表 */
        getMarkJobsNewTargetList:{//markJobsNewTargetList.do
            remote: "login/markJobsNewTargetList.do"
        },
        /*任务反馈详情 */
        getMarkJobsNewTargetDetails:{
            remote: "login/markJobsNewTargetDetails.do"
        },
        //签收任务
        markJobsNewTargetSign:{
            remote: "login/markJobsNewTargetSign.do"
        },
        /**图文营销列表 */
        getMarkGraphicList:{
            remote: "login/markGraphicList.do"
        },
        /**数据统计相关 */
        dataStatisticActivity:{
            remote: "login/appBussinessActives.do"
        },
        dataStatistictaskOrderQuery:{
            remote: "login/markJobsOfMonth.do"
        },
        dataStatistictaskOrderQueryByChannel:{
            remote: "login/sumMarkTaskByChannel.do"
        },
        dataStatisticTaksOrderDetail:{
            remote: "login/sumMarkTaskByUser.do"
        },
        dataStatisticLearn:{
            remote: "login/queryCourceList.do"
        },
        dataStatisticLearnDetail:{
            remote: "login/queryUnLearners.do"
        },
        dataStatisticActCity:{
            remote: "login/querySubCos.do"
        },
        dataStatisticActChannelByCity:{
            remote: "login/queryChannelByArea.do"
        },
        dataStatisticActPart:{
            remote: "login/queryDepts.do"
        },
        /**
         * 新闻
         */
        getBannerList: {
            remote: 'login/getBannerList.do'
        },
        getBannerDetail: {
            remote: 'login/bannerDetail.do'
        },
        getNewsList: {
            remote: 'login/newsManagerList.do'
        },
        getNewsDetail: {
            remote: 'login/newsManagerDetail.do'
        },
        getNewsComments: {
            remote: 'login/newsCommentsList.do'
        },
        addNewsComment: {
            remote: 'login/addNewsCommentsOne.do'
        },
        addSubNewsComment: {
            remote: 'login/addNewsCommentsTwo.do'
        },

        /**
         * 聊天室
         */
        getChatRoomList: {
            remote: 'login/getCharRoom.do'
        },

        /**
         * 联系人
         */
        getContactCompanyList: {
            remote: 'login/companyList.do'
        },
        getContactSectionList: {
            remote: 'login/sectionList.do'
        },
        getContactUserList: {
            remote: 'login/userList.do'
        },
        getContactUserInfo: {
            remote: 'login/userInfo.do'
        },
        /**
         * 投诉案例
         */
        getExampleList: {
            remote: 'login/complaintsList.do'
        },
        getExampleDetail: {
            remote: 'login/complaintsDetails.do'
        },
        getExampleCommentList: {
            remote: 'login/saveCommentsList.do'
        },
        likeExample: {
            remote: 'login/thumbs.do'
        },
        addExampleComment: {
            remote: 'login/saveCommentsOne.do'
        },
        addExampleReply: {
            remote: 'login/saveCommentsTwo.do'
        }
    };


    /**
     * method
     */
    function getLoginSMS(param, callback, errorCallback) {
        requestApi({
            api: 'getLoginSMS',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function login(param, callback, errorCallback) {
        requestApi({
            api: 'login',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getClientUserInfo(param, callback, errorCallback) {
        requestApi({
            api: 'getClientUserInfo',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getClientUserList(param, callback, errorCallback) {
        requestApi({
            api: 'getClientUserList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    /**
     * 个人中心
     */
    function modifyEmail(param, callback, errorCallback) {
        requestApi({
            api: 'modifyEmail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function modifyAvatar(param, callback, errorCallback) {
        requestApi({
            api: 'modifyAvatar',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getUserInfo(callback, errorCallback) {
        requestApi({
            api: 'getUserInfo',
            body: {},
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getWaitStatistics(callback, errorCallback){
        requestApi({
            api: 'getWaitStatistics',
            body: {},
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addAdvise(param, callback, errorCallback) {
        requestApi({
            api: 'addAdvise',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function modifyInfo(param, callback, errorCallback) {
        requestApi({
            api: 'modifyInfo',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    /**
     * 聊天室
     */
    function loginWebSocket(param, callback, errorCallback) {
        requestApi({
            api: 'loginWebSocket',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    /**
     * 在线考试
     */

    //获取考试信息
    function getExam(callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExam',
            body: {},
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //获取考试试卷
    function getExamPaper(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExamPaper',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //提交试卷
    function submitExamPaper(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'submitExamPaper',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //获取考试记录成绩
    function getExamRecord(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExamRecord',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //获取考试须知
    function getExamHelp(callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExamHelp',
            body: {},
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //获取错题集
    function getExamFault(callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExamFault',
            body: {},
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //获取题库列表
    function getExamBankList(callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExamBankList',
            body: {},
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    //获取题库
    function getExamBankDetail(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'getExamBankDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    /**
     * 在线阅读
     */
    function readList(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'readList',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    function myReadList(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'myReadList',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    function readInfo(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'readInfo',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    function readAttachment(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'readAttachment',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    function getReadAttachmentPreview(param, callback, errorCallback) {
        requestApi({
            api: 'getReadAttachmentPreview',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getReadAttachmentDownload(param, callback, errorCallback) {
        requestApi({
            api: 'getReadAttachmentDownload',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function readDetail(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'readDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    function readCommentsList(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'readCommentsList',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    function readCommentReplyList(param, callback, errorCallback, apiMode) {
        requestApi({
            api: 'readCommentReplyList',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            apiMode: apiMode
        });
    }

    /**
     * 资料操作
     */
    function likeReadDetail(param, callback, errorCallback) {
        requestApi({
            api: 'likeReadDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addReadComment(param, callback, errorCallback) {
        requestApi({
            api: 'addReadComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function likeReadComment(param, callback, errorCallback) {
        requestApi({
            api: 'likeReadComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addReadCommentReply(param, callback, errorCallback) {
        requestApi({
            api: 'addReadCommentReply',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function likeReadCommentReply(param, callback, errorCallback) {
        requestApi({
            api: 'likeReadCommentReply',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getKnowledgeQuestionType(callback, errorCallback) {
        requestApi({
            api: 'getKnowledgeQuestionType',
            body: {},
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getKnowledgeList(param, callback, errorCallback) {
        requestApi({
            api: 'getKnowledgeList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }


    function addKnowledgeQuestion(param, callback, errorCallback) {
        requestApi({
            api: 'addKnowledgeQuestion',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMyKnowledgeQuestion(param, callback, errorCallback) {
        requestApi({
            api: 'getMyKnowledgeQuestion',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMyKnowledgeAnswer(param, callback, errorCallback, cache) {
        requestApi({
            api: 'getMyKnowledgeAnswer',
            body: param,
            callback: callback,
            errCallback: errorCallback,
            cache: cache
        });
    }

    function addKnowledgeAnswer(param, callback, errorCallback) {
        requestApi({
            api: 'addKnowledgeAnswer',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getKnowledgeAnswers(param, callback, errorCallback) {
        requestApi({
            api: 'getKnowledgeAnswers',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function setKnowledgeBestAnswer(param, callback, errorCallback) {
        requestApi({
            api: 'setKnowledgeBestAnswer',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function closeKnowledgeQuestion(param, callback, errorCallback) {
        requestApi({
            api: 'closeKnowledgeQuestion',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addKnowledgeAnswerComment(param, callback, errorCallback) {
        requestApi({
            api: 'addKnowledgeAnswerComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getKnowledgeShareInfo(param, callback, errorCallback) {
        requestApi({
            api: 'getKnowledgeShareInfo',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addKnowledgeShareCountByAnUUID(param, callback, errorCallback) {
        requestApi({
            api: 'addKnowledgeShareCountByAnUUID',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addKnowledgeShareCountByQueUUID(param, callback, errorCallback) {
        requestApi({
            api: 'addKnowledgeShareCountByQueUUID',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    //anUuid,page,rows
    function getKnowledgeAnswerComment(param, callback, errorCallback) {
        requestApi({
            api: 'getKnowledgeAnswerComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarketingPermission(callback, errorCallback) {
        requestApi({
            api: 'getMarketingPermission',
            body: {},
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarketingFixtureList(param, callback, errorCallback) {
        requestApi({
            api: 'getMarketingFixtureList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarketingFixtureDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getMarketingFixtureDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMissionList(param, callback, errorCallback) {
        requestApi({
            api: 'getMissionList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMissionDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getMissionDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function markJobsNewTargetDetailsSave(param, callback, errorCallback){
        requestApi({
            api: 'markJobsNewTargetDetailsSave',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function signMission(param, callback, errorCallback) {
        requestApi({
            api: 'signMission',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMissionTargetList(param, callback, errorCallback) {
        requestApi({
            api: 'getMissionTargetList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMissionTargetDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getMissionTargetDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function replyMissionTarget(param, callback, errorCallback) {
        requestApi({
            api: 'replyMissionTarget',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function sendMissionTargetList(param, callback, errorCallback) {
        requestApi({
            api: 'sendMissionTargetList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarketingChannel(callback, errorCallback) {
        requestApi({
            api: 'getMarketingChannel',
            body: {},
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addCallNumber(param, callback, errorCallback){
        requestApi({
            api: 'addCallNumber',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarketingPayMonthByChannel(param, callback, errorCallback) {
        requestApi({
            api: 'getMarketingPayMonthByChannel',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarketingPayDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getMarketingPayDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    
    function getMarkReportList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkReportList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkReportTaskList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkReportTaskList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkReportContastList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkReportContastList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    
    function getMarkReportContastDetail(param, callback, errorCallback){
        requestApi({
            api: 'getMarkReportContastDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkReportPersonList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkReportPersonList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getmarkRemunerationNewListByChannel(param, callback, errorCallback){
        requestApi({
            api: 'getmarkRemunerationNewListByChannel',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkRemunerationNewListByMonth(param, callback, errorCallback){
        requestApi({
            api: 'getMarkRemunerationNewListByMonth',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkRemunerationNewDetails(param, callback, errorCallback){
        requestApi({
            api: 'getMarkRemunerationNewDetails',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkJobsNewList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkJobsNewList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function sendMarketingTaskMsg(param, callback, errorCallback){
        requestApi({
            api: 'sendMarketingTaskMsg',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getmarkJobsDetailsNew(param, callback, errorCallback){
        requestApi({
            api: 'getmarkJobsDetailsNew',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function markJobsNewTargetEmail(param, callback, errorCallback){
        requestApi({
            api: 'markJobsNewTargetEmail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkJobsNewTargetList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkJobsNewTargetList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkJobsNewTargetDetails(param, callback, errorCallback){
        requestApi({
            api: 'getMarkJobsNewTargetDetails',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function markJobsNewTargetSign(param, callback, errorCallback){
        requestApi({
            api: 'markJobsNewTargetSign',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getMarkGraphicList(param, callback, errorCallback){
        requestApi({
            api: 'getMarkGraphicList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticActivity(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticActivity',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatistictaskOrderQuery(param, callback, errorCallback){
        requestApi({
            api: 'dataStatistictaskOrderQuery',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatistictaskOrderQueryByChannel(param, callback, errorCallback){
        requestApi({
            api: 'dataStatistictaskOrderQueryByChannel',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticTaksOrderDetail(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticTaksOrderDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticLearn(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticLearn',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticActCity(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticActCity',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticActChannelByCity(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticActChannelByCity',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticActPart(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticActPart',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function dataStatisticLearnDetail(param, callback, errorCallback){
        requestApi({
            api: 'dataStatisticLearnDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    function getBannerList(param, callback, errorCallback) {
        requestApi({
            api: 'getBannerList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getBannerDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getBannerDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getNewsList(param, callback, errorCallback) {
        requestApi({
            api: 'getNewsList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getNewsDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getNewsDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getNewsComments(param, callback, errorCallback) {
        requestApi({
            api: 'getNewsComments',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addNewsComment(param, callback, errorCallback) {
        requestApi({
            api: 'addNewsComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addSubNewsComment(param, callback, errorCallback) {
        requestApi({
            api: 'addSubNewsComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getChatRoomList(param, callback, errorCallback) {
        requestApi({
            api: 'getChatRoomList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getContactCompanyList(param, callback, errorCallback) {
        requestApi({
            api: 'getContactCompanyList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getContactSectionList(param, callback, errorCallback) {
        requestApi({
            api: 'getContactSectionList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getContactUserList(param, callback, errorCallback) {
        requestApi({
            api: 'getContactUserList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getContactUserInfo(param, callback, errorCallback) {
        requestApi({
            api: 'getContactUserInfo',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    /**
     * 投诉案例
     */
    function getExampleList(param, callback, errorCallback) {
        requestApi({
            api: 'getExampleList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getExampleDetail(param, callback, errorCallback) {
        requestApi({
            api: 'getExampleDetail',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function getExampleCommentList(param, callback, errorCallback) {
        requestApi({
            api: 'getExampleCommentList',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function likeExample(param, callback, errorCallback) {
        requestApi({
            api: 'likeExample',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addExampleComment(param, callback, errorCallback) {
        requestApi({
            api: 'addExampleComment',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }

    function addExampleReply(param, callback, errorCallback) {
        requestApi({
            api: 'addExampleReply',
            body: param,
            callback: callback,
            errCallback: errorCallback
        });
    }
    /**
     * 工具
     */
    function validImage() { //验证码
        var t = new Date().getTime();
        return remoteRoot.replace('client/', '') + 'Admin/getLoginCaptcha.do?t=' + t;
    }

    function flushCache() { //清除全部缓存
        $.jStorage.flush();
    }

    function requestApi(param) {
        var apiMode = param.apiMode || globalApiMode;
        var api = param.api;
        var body = param.body;
        var callback = param.callback;
        var errCallback = param.errCallback || function () {
            console.error('error', arguments);
        };
        var cache = param.cache ? true : false; //是否启用缓存数据

        if (apiMode === 'local') {
            // 本地采用JSON
            console.log('本地采用JSON');
            $.getJSON(apiMap[api][apiMode], function (data, textStatus, jqXHR) {
                if (textStatus == 'success') {
                    console.log(data);
                    callback(data);
                } else {
                    var errMsg = {};
                    errMsg.errorcode = 1007;
                    errMsg.errorinf = '离线模式下无法获取相关数据';
                    errCallback(errMsg);
                }
            }).error(function () {
                errCallback();
            });
        } else {
            var url = remoteRoot + apiMap[api][apiMode];
            // API 缓存策略
            var ttl = apiMap[api].ttl || constant.cacheTime;
            console.log('远程调用跨域使用JSONP :' + url + ' 缓存策略: ' + ttl);
            var _body = getHeadAndBody(body);
            // console.log('请求:', _body);
            // 计算查询条件MD5 ID标示
            var _id = CryptoJS.MD5(JSON.stringify(body) + api).toString();
            // console.log('_id:' + _id);

            // 如果使用本地缓存数据库，则判断是否已存在需要的数据
            if (isUserLocalDB && cache) {
                // console.log('_id:使用缓存');

                var isReadData = false; // 是否从本地数据库中读到数据
                var value = $.jStorage.get(_id);
                if (value) {
                    console.log('使用缓存:' + value);
                    // console.log('读取本地数据');
                    // console.log(value);
                    callback(value);
                    isReadData = true;
                }

                if (isReadData) {
                    return;
                }
            }

            console.log('准备发起申请:', param.body);
            processAjaxMap[api] = $.ajax({
                type: 'post',
                url: url,
                data: _body,
                cache: false,
                timeout: constant.outTime
            }).success(function (data, textStatus, jqXHR) { // 请求成功, 但业务异常
                console.log('返回:', data);

                if (textStatus == 'success') {
                    if (data.code) {
                        // 通用异常处理
                        switch (data.code) {
                            case '001': //通讯MD5签名不一致
                                errCallback('签名不一致');
                                Backbone.trigger('TKonError', data);
                                break;
                            case '002': //接口需要传入UUID
                                errCallback('参数错误');
                                Backbone.trigger('TKonError', data);
                                break;
                            case '003': //服务器错误X001
                                errCallback('服务器出错');
                                Backbone.trigger('TKonError', data);
                                break;
                            case '004': //服务器错误X001
                                errCallback('账号被禁用');
                                Backbone.trigger('NoUserId', data);
                                break;
                            default:
                                errCallback(data.desc);
                                break;
                        }

                        if (processAjaxMap[api]) {
                            processAjaxMap[api] = null;
                        }
                        return;
                    }

                    // 如果使用本地缓存数据库，则要存入
                    if (isUserLocalDB) {
                        if (ttl == Infinity) { // 永久缓存
                            $.jStorage.set(_id, data);
                        } else {
                            $.jStorage.set(_id, data, {
                                TTL: ttl
                            });
                        }
                    }

                    callback(data);
                } else {
                    errCallback(data, textStatus, jqXHR);
                }

                if (processAjaxMap[api]) {
                    processAjaxMap[api] = null;
                }
            }).error(function (jqXHR, textStatus, errorThrown) {
                console.log('error:', textStatus);

                // 不管是超时还是无网络状况,
                // 都调用错误的回调方法
                if (textStatus === 'timeout'
                    || textStatus === 'error') {
                    var errMsg = {};
                    errMsg.errorcode = 1001;
                    errMsg.errorinf = '连接超时';
                    errCallback(errMsg.errorinf);
                }
            }); // HTTP请求失败
        }
    }

    //取消执行接口
    function abortApi(api) {
        console.log('abort:' + api);
        if (processAjaxMap[api]) {
            processAjaxMap[api].abort();
            processAjaxMap[api] = null;
        }
    }

    function getHeadAndBody(data) {
        var sendData = {
            "header": getHead(data),
            "body": data
        };

        return {
            b: JSON.stringify(sendData)
        };
    }

    function getHead(data) {
        var platform = 'web';
        if (navigator.notification) {
            platform = device.platform.toLocaleLowerCase();
        }

        var strData = JSON.stringify(data);
        var timeTs = new Date().getTime();
        var tk = CryptoJS.MD5(strData + timeTs + constant.secretKey).toString().substr(8, 16);

        var uuid = '';
        if (window.user) {
            uuid = window.user.uuid;
        }

        return {
            userUUID: uuid,   //获取当前用户id
            clientType: platform,
            ts: timeTs,
            clientAppName: constant.clientAppName,
            tkon: tk
        };
    }

    function getUploadUrl() {
        return remoteRoot.replace('client/', '') + 'C/ClientUploadFileAction/upload.do';
    }

    function getRecordUploadUrl() {
        return remoteRoot.replace('client/', '') + 'C/ClientUploadFileAction/uploadM4a.do';
    }


    return {
        abortApi: abortApi,
        getUploadUrl: getUploadUrl,
        getRecordUploadUrl: getRecordUploadUrl,
        validImage: validImage,

        getExam: getExam,
        getExamPaper: getExamPaper,
        submitExamPaper: submitExamPaper,
        getExamRecord: getExamRecord,
        getExamHelp: getExamHelp,
        getExamFault: getExamFault,
        getExamBankList: getExamBankList,
        getExamBankDetail: getExamBankDetail,

        readList: readList,
        myReadList: myReadList,
        readInfo: readInfo,
        readAttachment: readAttachment,
        getReadAttachmentPreview: getReadAttachmentPreview,
        getReadAttachmentDownload: getReadAttachmentDownload,
        readDetail: readDetail,
        readCommentsList: readCommentsList,
        readCommentReplyList: readCommentReplyList,

        likeReadDetail: likeReadDetail,
        addReadComment: addReadComment,
        likeReadComment: likeReadComment,
        addReadCommentReply: addReadCommentReply,
        likeReadCommentReply: likeReadCommentReply,

        getKnowledgeQuestionType: getKnowledgeQuestionType,
        getKnowledgeList: getKnowledgeList,
        addKnowledgeQuestion: addKnowledgeQuestion,
        getMyKnowledgeQuestion: getMyKnowledgeQuestion,
        getMyKnowledgeAnswer: getMyKnowledgeAnswer,
        addKnowledgeAnswer: addKnowledgeAnswer,
        getKnowledgeAnswers: getKnowledgeAnswers,
        setKnowledgeBestAnswer: setKnowledgeBestAnswer,
        closeKnowledgeQuestion: closeKnowledgeQuestion,
        addKnowledgeAnswerComment: addKnowledgeAnswerComment,
        getKnowledgeAnswerComment: getKnowledgeAnswerComment,
        getKnowledgeShareInfo: getKnowledgeShareInfo,
        addKnowledgeShareCountByAnUUID: addKnowledgeShareCountByAnUUID,
        addKnowledgeShareCountByQueUUID: addKnowledgeShareCountByQueUUID,

        getMarketingPermission: getMarketingPermission,
        getMarketingFixtureList: getMarketingFixtureList,
        getMarketingFixtureDetail: getMarketingFixtureDetail,
        getMissionList: getMissionList,
        getMissionDetail: getMissionDetail,
        markJobsNewTargetDetailsSave: markJobsNewTargetDetailsSave ,
        signMission: signMission,
        getMissionTargetList: getMissionTargetList,
        getMissionTargetDetail: getMissionTargetDetail,
        replyMissionTarget: replyMissionTarget,
        sendMissionTargetList: sendMissionTargetList,
        getMarketingChannel: getMarketingChannel,
        addCallNumber:addCallNumber ,
        getMarketingPayMonthByChannel: getMarketingPayMonthByChannel,
        getMarketingPayDetail: getMarketingPayDetail,
        getMarkReportList:getMarkReportList ,
        getMarkReportTaskList:getMarkReportTaskList,
        getMarkReportContastList:getMarkReportContastList,
        getMarkReportContastDetail:getMarkReportContastDetail ,
        getMarkReportPersonList:getMarkReportPersonList ,
        getmarkRemunerationNewListByChannel: getmarkRemunerationNewListByChannel ,
        getMarkRemunerationNewListByMonth: getMarkRemunerationNewListByMonth ,
        getMarkRemunerationNewDetails:getMarkRemunerationNewDetails ,
        getMarkJobsNewList: getMarkJobsNewList ,
        sendMarketingTaskMsg: sendMarketingTaskMsg ,
        getmarkJobsDetailsNew: getmarkJobsDetailsNew ,
        markJobsNewTargetEmail:markJobsNewTargetEmail ,
        getMarkJobsNewTargetList: getMarkJobsNewTargetList ,
        getMarkJobsNewTargetDetails: getMarkJobsNewTargetDetails ,
        markJobsNewTargetSign: markJobsNewTargetSign ,
        getMarkGraphicList: getMarkGraphicList ,
        dataStatisticActivity: dataStatisticActivity ,
        dataStatistictaskOrderQuery: dataStatistictaskOrderQuery ,
        dataStatistictaskOrderQueryByChannel: dataStatistictaskOrderQueryByChannel ,
        dataStatisticTaksOrderDetail:dataStatisticTaksOrderDetail ,
        dataStatisticLearn: dataStatisticLearn ,
        dataStatisticLearnDetail: dataStatisticLearnDetail ,
        dataStatisticActCity:dataStatisticActCity ,
        dataStatisticActChannelByCity: dataStatisticActChannelByCity ,
        dataStatisticActPart:dataStatisticActPart ,
        getBannerList: getBannerList,
        getBannerDetail: getBannerDetail,
        getNewsList: getNewsList,
        getNewsDetail: getNewsDetail,
        getNewsComments: getNewsComments,
        addNewsComment: addNewsComment,
        addSubNewsComment: addSubNewsComment,

        getChatRoomList: getChatRoomList,

        getContactCompanyList: getContactCompanyList,
        getContactSectionList: getContactSectionList,
        getContactUserList: getContactUserList,
        getContactUserInfo: getContactUserInfo,

        getExampleList: getExampleList,
        getExampleDetail: getExampleDetail,
        getExampleCommentList: getExampleCommentList,
        likeExample: likeExample,
        addExampleComment: addExampleComment,
        addExampleReply: addExampleReply,

        getLoginSMS: getLoginSMS,
        login: login,
        getClientUserInfo: getClientUserInfo,
        getClientUserList: getClientUserList,

        modifyEmail: modifyEmail,
        modifyAvatar: modifyAvatar,
        getUserInfo: getUserInfo,
        getWaitStatistics: getWaitStatistics ,
        addAdvise: addAdvise,
        modifyInfo: modifyInfo,

        loginWebSocket: loginWebSocket
    };
});
