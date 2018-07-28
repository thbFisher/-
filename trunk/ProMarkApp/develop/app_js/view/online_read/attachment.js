/**
*   在线阅读-附件下载
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
	var template = require('text!view/online_read/tpl/attachment.html');
	var AppHeader = require('view/app-header');

	var View = Backbone.View.extend({
		el: 'body',
		events: {
			'tap .btn-preview': 'preview',
			'tap .btn-download': 'download'
		},
		download: function (e) {
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			console.log('下载' + uuid);

			$.showLoading('正在获取下载信息', function () {
				$('.weui_toast').css({
					'width': '10em',
					'margin-left': '-5em'
				});
			});

			businessDelegate.getReadAttachmentDownload({
				attacmentsUuid: uuid
			}, _.bind(function (data) {
				$.hideLoading();
				$.alert('下载地址已发送至您的邮箱<br>该邮件可能会被您的邮箱误判为垃圾邮件，若您查询不到相关邮件，请在垃圾箱中查看');
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		preview: function (e) {
			var $e = $(e.currentTarget);
			$e.text("已学习") ;
			window.currentRecordRead = 1 ;
			var uuid = $e.data('uuid');

			console.log('预览' + uuid);

			$.showLoading('正在获取预览信息', function () {
				$('.weui_toast').css({
					'width': '10em',
					'margin-left': '-5em'
				});
			});

			businessDelegate.getReadAttachmentPreview({
				attacmentsUuid: uuid
			}, _.bind(function (data) {
				$.hideLoading();
				screen.orientation.lock('landscape');
				if(/^(\S*).mp4$/.test(data.obj.realUrl)){
					window.plugins.streamingMedia.playVideo(data.obj.realUrl);
				}else{
					window.open(data.obj.viewUrl, '_blank', 'location=no,zoom=yes,enableViewportScale=yes,closebuttoncaption=完成');
				}
				// window.plugins.streamingMedia.playVideo("http://47.100.126.72/ProMark/hnwximg/read/courseware/mp4/2018-05-07/a38bfec8-fa25-451d-b87f-fdec72d4ebddWxPc.mp4");
				// var my_media = new Media("http://47.100.126.72/ProMark/hnwximg/read/courseware/mp4/2018-05-07/a38bfec8-fa25-451d-b87f-fdec72d4ebddWxPc.mp4",         // success callback
				// 	function () {
				// 		console.log("playAudio():Audio Success");
				// 	},
				// 	// error callback
				// 	function (err) {
				// 		console.log("playAudio():Audio Error: " + err);
				// 	}
				// );
				// // Play audio
				// my_media.play();
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		getList: function () {
			$.showLoading();
			businessDelegate.readAttachment({
				coursewareUuid: this.uuid
			}, _.bind(function (data) {
				$.hideLoading();
				let list = data.obj ;
				for(var i = 0 ; i < list.length ;i++){
					list[i].isRead = window.currentRecordRead ;
				}
				var tpl = _.template(this.listTemplate)({ list: list });
				this.$content.html(tpl);

			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$content.html(this.errorHTML);
			}, this));
		},
		backbutton: function () {
			// Backbone.history.navigate('online-read-info/' + this.uuid, { trigger: true });
			window.history.go(-1);
		},
		initialize: function (options) {
			this.uuid = options.uuid;

			this.header = new AppHeader({
				host: this,
				main: false, //是否主页面
				title: '学习内容'
			});

			this.$el.empty().append(this.header.$el).append(template);

			this.listTemplate = this.$('#listTpl').html();
			this.$content = this.$('.common-content');
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
			this.getList();
			return this;
		}
	});

	return View;
});
