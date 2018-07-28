/**
 * 考试试卷
 */

define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/exam/tpl/paper.html');
	var AppHeader = require('view/app-header');
	var ExamResult = require('view/exam/result');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .btn-back': 'backbutton',
			'change input[name=paper-item]': 'putAnswer',
			'tap .next': 'nextItem',
			'tap .prev': 'prevItem',
			'tap .btn-submit': 'submitPaper'
        },
		initCamera: function () {
			if (!window.cordova) {
				return;
			}

			var x = $(window).width() - 110;
            var rect = { x: x, y: 45, width: 100, height: 120 };

            cordova.plugins.camerapreview.startCamera(rect, "front", false, false, false);

			cordova.plugins.camerapreview.setOnPictureTakenHandler(_.bind(function (result) {
				console.log('======================CAMERA==========================');
				console.log(result);

				//删除裁剪图片
				if(phonegaputil.getDevicePlatform() == 'android'){
					phonegaputil.removeFileByCamerapreview(result[1]);
				}
				
				//上传图片
				this.imageUpload(result[0]);
			}, this));

			this.takePicture();
		},
		takePicture: function () {
			if (this.isSubmit) {
				return;
			}

			if (this.imageArr.length == this.imageLimit) {
				return;
			}

			var timer = this.imageTimer;
			if(this.imageArr.length == 0){
				timer = 8000;
			}

			this.timeout = setTimeout(function () {
				// alert('开始拍照咯');
				cordova.plugins.camerapreview.takePicture();
			}, timer);
		},
		imageUpload: function (file_path) {
			var imageURI = file_path;
			var uploadAction = businessDelegate.getUploadUrl();
			var dataParam = phonegaputil.getHeadAndBody({ bucketName: this.bucketName });
			var param = { b: JSON.stringify(dataParam) };

			//开始上传图片
			phonegaputil.uploadPhoto(imageURI, uploadAction, param, _.bind(function (entry) {
				//上传成功
				this.retryUploadCount = 0;
				var data = $.parseJSON(entry.response);

				if (data.code === 0) {
					//获取返回参数
					this.imageArr.push(data.obj.relativeUrl); //data.obj.url;data.obj.relativeUrl;

					//删除照片
					phonegaputil.removeFileByCamerapreview(file_path);

					//继续执行拍照
					this.takePicture();
				} else {
					console.log('上传失败');
				}
			}, this), _.bind(function (error) {
				this.retryUploadCount++;
				if (this.retryUploadCount > 10) {
					//上传图片结束
					this.retryUploadCount = 0;
					console.log('上传失败');
				} else {
					//重新上传
					this.imageUpload(file_path);
				}
			}, this), $.noop);
		},
        initPaper: function () {
			$.showLoading('正在获取试卷信息');
			businessDelegate.getExamPaper({
				examUUID: this.uuid
			}, _.bind(function (data) {
				$.hideLoading();
				this.exam = data.obj;
				this.examPaper = data.obj.papersContent;
				this.examPaperLength = this.examPaper.length;
				this.timer = this.exam.examTime * 60;
				// this.timer = 10;

				$.alert('考试即将开始，考试中我们将对您的面部进行摄像，请注意将您的面部对准手机前置摄像头', _.bind(function () {
					//试卷正式开始
					this.canBack = 1;
					//渲染题目
					this.renderItem();
					//开始倒计时
					this.startInterval();
					//启动摄像头
					this.initCamera();
				}, this));
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.alert(err, _.bind(function () {
					this.back();
				}, this));
			}, this), this.apiMode);
        },
		renderItem: function () {
			this.$('.prev').removeClass('disable');
			this.$('.next').removeClass('disable');

			if (this.examPaperIndex == 0) {
				$('.prev').addClass('disable');
			}

			if (this.examPaperIndex == this.examPaperLength - 1) {
				$('.next').addClass('disable');
			}

			var q = this.examPaper[this.examPaperIndex];

			var tpl = _.template(this.itemTemplate)({ q: q });
			this.$paperContent.html(tpl);

			this.$('.exam-index').html((this.examPaperIndex + 1) + '/' + this.examPaperLength);
			this.$paperContent.scrollTop(0);
		},
		startInterval: function () {
			var str = utils.formatTimeLengthSimple(this.timer);
			this.$('.paper-timecount').html(str);

			this.interval = setInterval(_.bind(this.intervalTimer, this), 1000);
		},
		reStartCounting: function () {
			this.interval = setInterval(_.bind(this.intervalTimer, this), 1000);
		},
		intervalTimer: function () {
			this.timer--;

			var str = utils.formatTimeLengthSimple(this.timer);
			this.$('.paper-timecount').html(str);

			//时间到
			if (this.timer === 0) {
				clearInterval(this.interval);

				//到时提交试卷
				$.alert('时间到，考试结束', _.bind(function () {
					var obj = this.getAnswerPaper();
					this.submitData(obj.answer_paper);
				}, this));
			}
		},
		//交卷
		submitPaper: function () {
			var obj = this.getAnswerPaper();
			console.log(obj);

			var msg = '您确认提交试卷吗？';
			if (obj.flag > 0) {
				msg = '您还有题目未完成，确认提交试卷吗？'
			}

			$.confirm(msg, _.bind(function () {
				this.submitData(obj.answer_paper);
			}, this), $.noop);
		},
		//提交数据到服务器
		submitData: function (answer_paper) {
			console.log('提交数据');

			//停止倒计时
			clearInterval(this.interval);
			this.canBack = 0;

			var json_str = JSON.stringify(answer_paper);
			var image_str = this.imageArr.join(',');

			console.log(json_str);

			$.showLoading('正在提交试卷');
			businessDelegate.submitExamPaper({
				examUUID: this.uuid,
				answer: json_str,
				examingImages: image_str
			}, _.bind(function (data) {
				//success
				$.hideLoading();
				this.canBack = 1;
				this.isSubmit = 1;

				var result = data.obj;

				var str = utils.formatTimeLengthSimple(this.exam.examTime * 60 - this.timer);
				result.timer = str;
				this.showResult(result);
			}, this), _.bind(function (err) {
				//error
				$.hideLoading();
				$.jtoast(err);

				this.canBack = 1;
				this.reStartCounting();
			}, this), this.apiMode);
		},
		//展示结果
		showResult: function (result) {
			console.log(result);
			//关闭摄像头
			if (window.cordova) {
				cordova.plugins.camerapreview.stopCamera();
			}

			var view = new ExamResult({
				data: result,
				host: this
			});
			view.show();
		},
		//获取答卷
		getAnswerPaper: function () {
			var answer_paper = {};
			var flag = 0;
			_.each(this.examPaper, function (v) {
				if (!v.put_answer) {
					v.put_answer = [];
					flag++;
				}
				answer_paper[v.uuid] = v.put_answer.join(',');
			});

			return {
				answer_paper: answer_paper,
				flag: flag
			}
		},
		putAnswer: function () {
			var answer = _.pluck(this.$('input[name=paper-item]:checked'), 'value');
			this.examPaper[this.examPaperIndex].put_answer = answer;
		},
		prevItem: function (e) {
			var $e = $(e.currentTarget);
			if ($e.hasClass("disable")) {
				return;
			}

			console.log('prev');
			if (this.examPaperIndex == 0) {
				return;
			}

			this.examPaperIndex--;
			this.renderItem();
		},
		nextItem: function (e) {
			var $e = $(e.currentTarget);
			if ($e.hasClass("disable")) {
				return;
			}

			console.log('next');
			if (this.examPaperIndex == this.examPaperLength - 1) {
				return;
			}

			this.examPaperIndex++;
			this.renderItem();
		},
		back: function () {
			Backbone.history.navigate('exam-index', { trigger: true });
		},
		backbutton: function () {
			if (this.isSubmit) {
				Backbone.history.navigate('exam-index', { trigger: true });
				return;
			}

			if (this.canBack) {
				$.closeModal();
				$.confirm('每场考试只有2次应试机会<br>您确认要退出考试吗', '考试未完成', function () {
					Backbone.history.navigate('exam-index', { trigger: true });
				}, $.noop);
			}
		},
		initialize: function (options) {
			this.uuid = options.uuid;
            this.header = new AppHeader({
                host: this,
                main: false,
                title: '考试'
            });
			this.header.setRightBtn('<span class="text btn-submit">提交试卷</span>');

            this.$el.empty().append(this.header.$el).append(template);

			this.$paperContent = this.$('.paper-content');
			this.itemTemplate = $('#question-item-tpl').html();

			this.exam = null; //考试信息
			this.examPaper = null; //试卷信息
			this.examPaperLength = 0;	//题目总数
			this.examPaperIndex = 0;	//当前题目

			this.canBack = 0;
			this.timer = 0;	//考试时长
			this.isSubmit = 0; //是否已提交

			this.apiMode = '';	//调试模式
			// this.apiMode = 'local';

			this.imageArr = []; //拍摄图片
			this.imageLimit = 9;	//拍摄上限
			this.imageTimer = 60000;	//拍照间隔
			this.bucketName = 'exam'; //照片参数
			this.retryUploadCount = 0;
		},
		render: function () {
            this.initPaper();
			return this;
		},
		destroy: function () {
			//取消计时器
			clearInterval(this.interval);
			clearTimeout(this.timeout);

			//关闭摄像头
			if (window.cordova) {
				cordova.plugins.camerapreview.stopCamera();
			}
		}
	});

	return View;
});
