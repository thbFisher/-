/**
*   个人中心
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
	var template = require('text!view/center/tpl/index.html');
	var AppHeader = require('view/app-header');
	var AppMenu = require('view/app-menu');
	var EmailView = require('view/center/email');
	var ModifyView = require('view/center/modify');
	var Advise = require('view/center/advise');
	var GetImage = require('view/get-image');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
            'tap .avatar img': 'selectWay',
			'tap .show-email': 'viewEmail',
			'tap .show-modify': 'viewModify',
			'tap .show-advise': 'viewAdvise',
			'tap .app-update': 'checkVersion',
			'tap .btn-logout': 'logout',
			'change .setting_chk': 'changeSetting'
		},
		/**
		 * 登出
		 * 清空用户保存信息
		 */
		logout: function () {
			$.confirm("确认退出登录", function () {
				phonegaputil.saveConfig('user', '', function () {
					Backbone.history.navigate('login', { trigger: true });
				}, function () {
					$.toast('登出失败', 'cancel');
				});
			}, $.noop);
		},
		/**
		 * 检查更新
		 */
		checkVersion: function () {
			$.showLoading('检查新版本');

			phonegaputil.updateApp(function (r) {
				$.jtoast(r, '', '', 'black');
				$.hideLoading();
			});
		},
		/**
		 * 意见反馈
		 */
		viewAdvise: function () {
			var view = new Advise();
			view.show();
		},
		/**
		 * 更新其他信息
		 */
		getModify: function (type, value) {
			this.$('.show-'+type+' > span').html(value);
			window.user[type] = value;
			phonegaputil.saveConfig('user', window.user, $.noop, $.noop);
		},
		viewModify: function(e){
			var type = $(e.currentTarget).data('type');
			var view = new ModifyView({
				value: window.user[type],
				type: type
			});
			view.on('refresh', _.bind(this.getModify, this));
			view.show();
		},
		/**
		 * 更新邮箱地址
		 * 重新保存用户信息
		 */
		getEmail: function (email) {
			this.$('.show-email > span').html(email);
			window.user.email = email;
			phonegaputil.saveConfig('user', window.user, $.noop, $.noop);
		},
		viewEmail: function () {
			var view = new EmailView({
				email: window.user.email
			});
			view.on('refresh', _.bind(this.getEmail, this));
			view.show();
		},
		/**
		 * 更改头像显示
		 * 重新保存用户信息
		 */
		//修改头像
		selectWay: function () {
			var view = new GetImage({
				crop: true,
				title: '选择头像'
			});

			view.on('get', _.bind(this.changeAvatar, this));
			view.show();
		},
		changeAvatar: function (src) {
			this.$('.avatar img').prop('src', src).addClass('prepare-upload');

			//上传头像
			$.showLoading('正在上传头像');

			this.canBack = 0;
			this.retryUploadCount = 0;
			this.imageUpload();
		},
		imageUpload: function () {
			this.$uploadingImage = this.$('img.prepare-upload:eq(0)');

			//是否存在图片需要上传
			if (this.$uploadingImage.length > 0) {
				var imageURI = this.$uploadingImage.attr('src');
				var uploadAction = businessDelegate.getUploadUrl();
				var dataParam = phonegaputil.getHeadAndBody({ bucketName: this.bucketName });
				var param = { b: JSON.stringify(dataParam) };

				//开始上传图片
				phonegaputil.uploadPhoto(imageURI, uploadAction, param, _.bind(this.uploadSuccess, this), _.bind(this.uploadFailed, this), $.noop);
			} else {
				//上传数据
				this.submitAvatar();
			}
		},
		//上传成功
		uploadSuccess: function (entry) {
			this.retryUploadCount = 0;

			var data = $.parseJSON(entry.response);

			//上传成功
			if (data.code === 0) {
				// 取消未上传标识
				this.$uploadingImage.removeClass('prepare-upload');

				//获取返回参数
				this.uploadAvatar = data.obj.relativeUrl;
				this.avatar = data.obj.url;
				this.imageUpload();
			} else {
				this.canBack = 1;
				$.hideLoading();
				$.jtoast('上传失败，请重试');
				this.$('.avatar img').prop('src', this.orginSrc);
			}
		},
		//上传失败
		uploadFailed: function (error) {
			// 失败自动重试
			this.retryUploadCount++;
			if (this.retryUploadCount > 10) {
				//上传图片结束
				this.canBack = 1;
				$.hideLoading();
				$.jtoast('上传失败, 请重试');
				this.$('.avatar img').prop('src', this.orginSrc);
			} else {
				this.imageUpload();
			}
		},
		//更新头像数据
		submitAvatar: function () {
			businessDelegate.modifyAvatar({
                headImgUrl: this.uploadAvatar
            }, _.bind(function (data) {
				this.canBack = 1;
				$.hideLoading();
                $.toast('修改头像成功');

				window.user.headImgUrl = this.avatar;
				this.orginSrc = this.avatar;

				phonegaputil.saveConfig('user', window.user, $.noop, $.noop);
            }, this), _.bind(function (err) {
				this.canBack = 1;
                $.hideLoading();
                $.jtoast(err);
            }, this));
		},
		getUserInfo: function (callback) {
			if (!this.isPullRefresh) {
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getUserInfo(_.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}
				
				window.user = $.extend(window.user, data.obj);
				phonegaputil.saveConfig('user', window.user, $.noop, $.noop);

				this.renderUserInfo(data.obj);
				this.$wrapper.scrollTop(0);

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}
				this.renderUserInfo(window.user);
				callback();
			}, this));
		},
		changeSetting: function(){
			var setting = {};
			$('.setting_chk').each(function(i,v){
				var value = $(v).prop('checked');
				var key = $(v).prop('id').replace('setting_','');
				setting[key] = value;
			});
			console.log(setting);
			$.jStorage.set('setting', setting);
		},
		renderUserInfo: function (user) {
			if (user.headImgUrl) {
				this.$('.user-info-header > .avatar > img').attr('src', user.headImgUrl);
			}
			this.$('.user-info-header > h3').html(user.name);
			this.$('.user-info-header > p').html(user.company);

			var tpl = _.template(this.infoTemplate)({ user: user, version: window.version, platform: phonegaputil.getDevicePlatform() })
			this.$content.html(tpl);

			var setting = $.jStorage.get('setting');
			_.each(setting, _.bind(function (o, k) {
				this.$('#setting_' + k).prop('checked', o);
			}, this));
		},
		backbutton: function () {
			if (!this.canBack) {
				return;
			}

            Backbone.history.navigate('index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: true,
                title: '我的'
            });

			this.header.setRightBtn('<span class="text btn-logout">注销账号</span>');

			this.menu = new AppMenu({
				index: 2
			});

			// this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);
			this.$el.empty().append(template).append(this.menu.$el);

			this.$content = this.$('.user-info-wrapper');
			this.infoTemplate = this.$('#infoTpl').html();
			this.$wrapper = this.$('.user-info-container > div')

			this.canBack = 1;
			this.bucketName = 'avatar';
			this.uploadAvatar = '';
			this.avatar = '';

			this.orginSrc = this.$('.avatar img').prop('src');

			this.isPullRefresh = 0;

			this.getUserInfo($.noop);
		},
		render: function () {
			this.$wrapper.pullToRefresh();
			this.$wrapper.on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getUserInfo(_.bind(function () {
					this.$wrapper.pullToRefreshDone();
				}, this));
			}, this));

			return this;
		}
	});

	return View;
});
