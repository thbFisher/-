/**
*   知识库回答
**/

define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

    require('touch');
	require('swiper');
	require('jquery-weui');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/knowledge/tpl/answer.html');
	var AppHeader = require('view/app-header');
	var GetImage = require('view/get-image');
	// var SlidePage = require('view/slide-page');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            'keyup .input-answer': 'countText',
			'tap .delete': 'deleteImage',
			'tap .input-image-box': 'showImage',
            'tap .btn-input-camera': 'selectWay',
            'tap .btn-submit': 'validSubmit'
		},
        countText: function(e){
            var $e = $(e.currentTarget);
            var text = $.trim($e.val());

            var count = utils.getStrBytesLength(text);
            if(count > this.countLimit){
                this.$('.btn-submit').prop('disabled', true);
                this.$count.html('<span style="color: red">'+count+'</span>');
            }else{
                this.$('.btn-submit').prop('disabled', false);
                this.$count.html(count);
            }
        },
		showImage: function(e){
			var $e = $(e.currentTarget)
			var index = $e.find('img').index('.input-image-box img');

			var arr = _.pluck(this.$('.input-image-box img'),'src');

			this.pb = $.photoBrowser({
				items: arr,
				onOpen:  _.bind(function(){
					this.isPb = 1;
				},this),
				onClose: _.bind(function(){
					this.isPb = 0;
				},this),
                initIndex: index
			});

			this.pb.open();
		},
		renderImage: function(src){
			var imageTpl = _.template(this.imageTemplate)({src: src});
			this.$picContent.append(imageTpl);
		},
		selectWay: function(e){
			var $e = $(e.currentTarget);
            if($e.hasClass('disabled')){
                return;
            }

			if(this.$('.input-image-box').length == 9){
				$.jtoast('最多只能添加9张图片');
				return;
			}

			var view = new GetImage();
			view.on('get', _.bind(this.renderImage,this));
			view.show();
		},
		deleteImage: function(e){
			var $e = $(e.currentTarget);
			$e.parent().remove();
			return false;
		},
        validSubmit: function(){
            if(this.$count.html() > this.countLimit){
                return;
            }

			var text = $.trim(this.$('.input-answer').val());

            if(!text){
                $.jtoast('请填写问题内容');
                return;
            }

			this.valid = {};
            this.valid.content = text;
            this.valid.contentImgJson = [];
            this.valid.queUuid = this.uuid;

            this.startUpload = 0;
			this.retryUploadCount = 0;

            this.canBack = 0;

            this.imageUpload();
        },
		imageUpload: function(){
			this.$uploadingImage = this.$picContent.find('img.prepare-upload:eq(0)');

			//是否存在图片需要上传
			if (this.$uploadingImage.length > 0) {
				this.$uploadLoading.show();

				if(!this.startUpload){
					this.startUpload = 1;
					var sum = this.$('img.prepare-upload').length;
					this.$uploadTotal.html(sum);
				}
				
				var num = this.$uploadingImage.index('.input-image img')+1;
				this.$uploadIndex.html(num);

				var imageURI = this.$uploadingImage.attr('src');
				var uploadAction = businessDelegate.getUploadUrl();
				var dataParam = phonegaputil.getHeadAndBody({bucketName:this.bucketName});
				var param = {b:JSON.stringify(dataParam)};

				//开始上传图片
				phonegaputil.uploadPhoto(imageURI,uploadAction,param,_.bind(this.uploadSuccess,this),_.bind(this.uploadFailed,this),_.bind(this.uploadProgress,this));
			}else{
				//上传数据
				this.clearUploadLoading();
				this.valid.contentImgJson = this.imageinfo;
				this.submitData();
			}
		},
		//上传成功
		uploadSuccess: function(entry){
			var data = $.parseJSON(entry.response);

			//上传成功
			if (data.code === 0) {
			    // 取消未上传标识
			    this.$uploadingImage.removeClass('prepare-upload');

			    //获取返回参数result:{key,url}
			    this.imageinfo.push(data.obj.relativeUrl);
			    this.imageUpload();
			}else{
				this.canBack = 1;
				$.jtoast('上传失败，请重试');
				this.clearUploadLoading();
			}
		},
		//上传失败
		uploadFailed: function(error){
			console.log('error: ' + error);
			// 失败自动重试
			this.retryUploadCount++;
			if (this.retryUploadCount > 10) {
			   	//上传图片结束
				this.canBack = 1;
			   	$.jtoast('上传失败, 请重试');
				this.clearUploadLoading();
			} else {
			    this.imageUpload();
			}
		},
		//进度条
		uploadProgress: function(progressEvent){
		    if (progressEvent.lengthComputable) {
		        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
		        this.$uploadPer.css('width', perc + '%');
		    } else {
		        console.log('loading.........');
		    }
		},
		submitData: function () {
			$.showLoading('正在提交...');
            businessDelegate.addKnowledgeAnswer(this.valid, _.bind(function (data) {
				this.canBack = 1;
                $.hideLoading();
                $.toast('提交成功');
                this.clearForm();
				this.trigger('refresh');
                setTimeout(_.bind(this.backbutton,this), 1000);
            }, this), _.bind(function (err) {
				this.canBack = 1;
                $.hideLoading();
                $.jtoast(err);
            }, this));
		},
		clearUploadLoading: function(){
			this.$uploadLoading.hide();
			this.$uploadIndex.html('0');
			this.$uploadTotal.html('0');
			this.$uploadPer.css('width','0%');
		},
		clearForm: function () {
			this.$('.input-answer').val('');
			this.$('.input-image-box').remove();
			this.$('.weui_textarea_counter>span').html('0');
			this.imageinfo = [];

			this.clearUploadLoading();			
		},
		backbutton: function () {
			if(!this.canBack){
				return;
			}

            if(this.isPb){
				this.pb.close();
				return;
			}

            Backbone.history.navigate('knowledge-detail/'+this.uuid+'/'+this.history, { trigger: true });
			// this.back();
		},
		initialize: function (options) {
            this.history = options.history;
            this.uuid = options.uuid;

            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '我要回答'
            });

            this.$el.empty().append(this.header.$el).append(template);

			this.canBack = 1;

            this.countLimit = 400;
            this.$count = this.$('.weui_textarea_counter > span');

            this.$picContent = this.$('.input-image');
            this.imageTemplate = this.$('#imageTpl').html();

			this.bucketName = 'answer';
			this.imageinfo = [];
			this.pb = null;
			this.isPb = 0;
            
			this.$uploadLoading = this.$('.upload-loading-mask');
			this.$uploadIndex = this.$('.upload-index');
			this.$uploadTotal = this.$('.upload-total');
			this.$uploadPer = this.$('.upload-progress');
		},
		render: function () {
			return this;
		}
	});

	return View;
});
