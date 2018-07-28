/**
*   聊天室
**/

define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

    require('touch');
	require('jquery-weui');
	var ReconnectingWebSocket = require('reconnectingWebSocket');

	var utils = require('utils');
	var phonegaputil = require('phonegaputil');
    var businessDelegate = require('business-delegate');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/chatroom/tpl/index.html');
	var AppHeader = require('view/app-header');
	var AppMenu = require('view/app-menu');

	var ClientList = require('view/chatroom/client-list');
	
	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .right-button': 'openClientList',
            'tap .input-type': 'changeInput',
			'tap .btn-send': 'sendText',
			'focus .text-input': 'scrollDown',
			//用户名片
			'tap .avatar-wrapper': 'getUserCard',
			'tap #userCard .close': 'closeUserCard',
			//录音
			'tap .btn-start-voice': 'startRecordVoice',
			'tap .btn-end-voice': 'endRecordVoice',
			//播放
			'tap .message-voice': 'playVoice'
		},
		openClientList: function () {
			this.clientList = new ClientList({
				host: this,
				charRoomUuid:this.charRoomUuid
			});
			this.clientList.show();
		},
		closeUserCard: function () {
			this.$('#userCard .avatar > img').prop('src', 'app_img/noavatar.png');
			this.$('#userCard .control > a').prop('href', 'javascript:;');
			this.$('#userCard .usercard-name').html('-');
			this.$('#userCard .usercard-mobile').html('-');
			this.$('#userCard .usercard-company').html('-');
			this.$('#userCard .usercard-email').html('-');
			$.closePopup();
		},
		renderUserCard: function (data) {
			if (data.headImgUrl) {
				this.$('#userCard .avatar > img').prop('src', data.headImgUrl);
			}

			this.$('#userCard .control > a').prop('href', 'tel:' + data.mobile);
			this.$('#userCard .usercard-name').html(data.name);
			this.$('#userCard .usercard-mobile').html(data.mobile);
			this.$('#userCard .usercard-company').html(data.company);
			this.$('#userCard .usercard-email').html(data.email);
		},
		getUserCard: function (e) {
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			console.log(uuid)
			if(uuid.length == 32){
				$.jtoast('您无法查看该用户信息');
				return;
			}

			$.showLoading('正在获取信息');
			businessDelegate.getClientUserInfo({
				charRoomUuid:this.charRoomUuid,
				userUuid: uuid
			}, _.bind(function (data) {
				$.hideLoading();
				this.renderUserCard(data.obj);
				this.$('#userCard').popup();
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
			}, this));
		},
		changeInput: function (e) {
			var $e = $(e.currentTarget);
			if ($e.find('i').hasClass('change-to-voice')) {
				this.$('.keyboard-footer').addClass('hidden');
				this.$('.voice-footer').removeClass('hidden');
				this.input_type = 'voice';
				return;
			}

			if ($e.find('i').hasClass('change-to-keyboard')) {
				this.$('.voice-footer').addClass('hidden');
				this.$('.keyboard-footer').removeClass('hidden');
				this.input_type = 'text';
				return;
			}
		},
		sendText: function (e) {
			// this.receiveMessage({});
			// return;

			console.log(this.input_type);

			var reg = new RegExp("<div><br></div>", "gmi");
			// var text = $.trim(this.$('.text-input').html()).replace(reg, '');
			var text = $.trim(this.$('.text-input').val()).replace(reg, '');

			if (!text) {
				$.jtoast('请输入发送内容');
				// this.$('.text-input').html('');
				this.$('.text-input').val('');
				return;
			}

			this.socket.send(this.formatMessage(text, this.input_type));
			// this.$('.text-input').html('');
			this.$('.text-input').val('');
		},
		/**
		 * 录音
		 */
		refreshRecordVoice: function () {
			this.$('.voice-progress-bar').css('width', 0);
			this.$('.voice-progress-ball').css('left', 0);
			this.$('.voice-mask').hide(); //隐藏遮罩层
            clearInterval(this.count_interval); //清除时间循环
			this.initRecordVoiceArg();
		},
		initRecordVoiceArg: function () {
			this.record_time = 60;   //最大录音时长
			this.record_count_time = 0; //录音计时
			this.count_interval = null; //计时器
			this.record_end = 1;    //是否录音完成
		},
		startRecordVoice: function () {
			this.isRecording = 1;	//开始录音

			this.initRecordVoiceArg();

			this.$('.voice-mask').show();

			this.count_interval = setInterval(_.bind(function () {
				this.record_count_time++;
				console.log(this.record_count_time);

				//启用进度条
				var num = parseInt(this.record_count_time / this.record_time * 100);
				var per = num + '%';

				this.$('.voice-progress-bar').css('width', per);
				this.$('.voice-progress-ball').css('left', per);

				//当时长等于指定录音时长
				if (this.record_count_time == this.record_time) {
					this.endRecordVoice();
				}
			}, this), 1000);

			if (window.cordova) {
				window.plugins.audioRecorderAPI.record(_.bind(function (msg) {
					console.log('too long');
					this.refreshRecordVoice();
				}, this), _.bind(function (msg) {
					$.toast('录音出错', 'cancel');
					this.refreshRecordVoice();
				}, this), 1000);	//设置超长时间，千秒
			} else {
				console.log('开始录音');
			}
		},
		endRecordVoice: function () {
			/**
			 * 录音时间太短不做发送处理
			 */
			if (this.record_count_time < 1) {
				$.toast('录音时间太短', 'cancel');
				this.overRecordVoice();
				return;
			}

			//成功录音
			if (window.cordova) {
				window.plugins.audioRecorderAPI.stop(_.bind(function (msg) {
					this.successRecordVoice(msg);
				}, this), _.bind(function (msg) {
					$.toast('录音出错', 'cancel');
				}, this));
			} else {
				this.successRecordVoice('测试url');
			}

			this.isRecording = 0;
			this.refreshRecordVoice();
		},
		//强制停止录音
		overRecordVoice: function () {
			if (window.cordova) {
				window.plugins.audioRecorderAPI.stop($.noop, $.noop);
			}

			this.isRecording = 0;
			this.refreshRecordVoice();
		},
		successRecordVoice: function (url) {
			// 成功录音
			// if (window.cordova) {
			// 	cordova.plugins.disusered.open('file:' + url, $.noop, $.noop);
			// } else {
			// 	console.log('ok');
			// }

			$.confirm('确认发送语音', _.bind(function () {
				console.log('send');
				this.voiceUpload(url);
			}, this), $.noop)

		},
		/**
		 * 上传声音
		 */
		voiceUpload: function (url) {
			if (!window.cordova) {
				return;
			}

			//是否存在图片需要上传
			var uploadAction = businessDelegate.getRecordUploadUrl();
			var dataParam = phonegaputil.getHeadAndBody({ mobile: window.user.mobile });
			var param = { b: JSON.stringify(dataParam) };

			//开始上传图片
			phonegaputil.uploadAudio(url, uploadAction, param, _.bind(this.uploadSuccess, this), _.bind(this.uploadFailed, this), $.noop);
		},
		uploadSuccess: function (entry) {
			var data = $.parseJSON(entry.response);

			if (data.code === 0) {
				//发送语音信息
				this.socket.send(this.formatMessage(data.obj.url, this.input_type));
			} else {
				console.log('error');
			}
		},
		uploadFailed: function () {
			console.log('error');
		},
		playVoiceNavite: function (url) {
			if (window.cordova) {
				this.navite_media = new Media(url, _.bind(function () {
					console.log("playAudio():Audio Success");
					this.playingUrl = '';
					this.$('.message-voice').removeClass('active').find('span').html('点击播放语音');
					if (this.navite_media) {
						this.navite_media.stop();
						this.navite_media.release();
						this.navite_media = null;
					}
				}, this), function (err) {
					console.log("playAudio():Audio Error: " + err);
				});
				this.navite_media.play();
			}
		},
		playVoice: function (e) {
			if (this.$(".message-voice.active").length > 0) {
				$.jtoast('正在播放语音', '', '', 'black');
				return;
			}

			var $e = $(e.currentTarget);
			//	this.$('.message-voice').removeClass('active').find('span').html('点击播放语音');

			var url = $e.data('url');

			if (this.playingUrl == url) {
				this.playingUrl = '';
				return;
			} else {
				$e.addClass('active');
				$e.find('span').html('正在播放');

				this.playingUrl = url;

				if (window.cordova) {
					this.playVoiceNavite(url);
				} else {
					this.audio.pause();
					this.$audio.prop('src', url);
					this.audio.play();
				}
			}
		},
		/**
		 * 刷新消息
		 * 刷新聊天室状态信息
		 */
		formatMessage: function (msg, type) {
			var message = {
				charRoomUuid:this.charRoomUuid ,
				user: {
					avatar: window.user.headImgUrl,
					name: window.user.name,
					mobile: window.user.mobile,
					uuid: window.user.uuid
				},
				type: type, //voice text
				message: msg
			}

			return JSON.stringify(message);
		},
		receiveMessage: function (obj) {
			// obj = {
			// 	user: {
			// 		avatar: window.user.headImgUrl,
			// 		name: window.user.name,
			// 		mobile: window.user.mobile,
			// 		uuid: window.user.uuid+1
			// 	},
			// 	type: 'voice', //voice text
			// 	message: 'aaaaaaaaaaaaaaaaaa'
			// }

			console.log(obj);

			var limit = 10 * 60 * 1000;	//时间span产生间隔，10分钟
			// var limit = 60000;

			//展示之前的消息
			if (obj.ordMsgList && obj.ordMsgList.length > 0) {
				_.each(obj.ordMsgList, _.bind(function (v) {
					var time = '';

					if (!this.lastMessageTimeStamp) {
						//展示开头时间
						time = utils.formatDateTime(v.timestamp).substr(0, 16);
					} else {
						var diff = v.timestamp - this.lastMessageTimeStamp;
						if (diff > limit) {
							//展示时间
							time = utils.formatDateTime(v.timestamp).substr(0, 16);
						}
					}
					this.lastMessageTimeStamp = v.timestamp;
					var tpl = _.template(this.messageBoxTemplate)({ data: v, time: time });
					this.$content.append(tpl);
					//装入消息盒子
					this.messageBoxs.push(v);
				}, this));
			}

			if (obj.serverInfo) {
				this.$('.user-status > span').html(obj.serverInfo.userCount);
			}

			//收到消息处理
			if (obj.type == 'text' || obj.type == 'voice') {
				//装入消息盒子
				this.messageBoxs.push(obj);

				//保持页面固定条数条记录
				if (this.messageBoxs.length > this.limitBox) {
					this.messageBoxs.shift();
					this.$content.find('.chatroom-message-box:eq(0)').remove();
				}

				var time = '';
				if (!this.lastMessageTimeStamp) {
					//展示开头时间
					time = utils.formatDateTime(obj.timestamp).substr(0, 16);
				} else {
					var diff = obj.timestamp - this.lastMessageTimeStamp;
					if (diff > limit) {
						//展示时间
						time = utils.formatDateTime(obj.timestamp).substr(0, 16);
					}
				}

				var tpl = _.template(this.messageBoxTemplate)({ data: obj, time: time });
				this.$content.append(tpl);
			} else {
				//其他处理
			}

			//保持滚动条在底部
			this.scrollDown();
		},
		resize: function () {
			this.scrollDown();
		},
		scrollDown: function () {
			var h = this.$wrapper[0].scrollHeight;
			this.$wrapper.scrollTop(h);
		},
		/**
		 * 初始化
		 */
		initWebSockt: function (url) {
			if (this.socket) {
				return;
			}

			this.socket = new ReconnectingWebSocket(url, null, {
				debug: true,
				reconnectInterval: 3000,
				maxReconnectAttempts: 50
			});

			//重连
			this.socket.onconnecting = _.bind(function (event) {
				console.log('=========================connecting===============');
				//停止录音
				if(this.isRecording){
					this.overRecordVoice();
				}

				//关闭弹出层
				$.closePopup();
				if (this.clientList) {
					this.clientList.back();
				}

				console.log(this.relink);
				if (!this.relink) {
					$.showLoading('正在重新连接', function () {
						$('.weui_mask_transparent').css('top', '45px');
					});
				}

				this.relink++;
				this.$chatroomStatus.html('正在连接');
			}, this);

			//收到信息
			this.socket.onmessage = _.bind(function (event) {
				console.log('=========================message===============');
				// console.log('Received: ' + event.data);
				var data = JSON.parse(event.data);
				this.receiveMessage(data);
			}, this);

			//当连接上
			this.socket.onopen = _.bind(function (event) {
				console.log('==========================open===============');

				$.hideLoading();

				//停止录音
				if(this.isRecording){
					this.overRecordVoice();
				}

				//关闭弹出层
				$.closePopup();
				if (this.clientList) {
					this.clientList.back();
				}

				this.lastMessageTimeStamp = '';
				this.relink = 0;
				this.messageBoxs = [];
				this.$content.empty();

				this.$chatroomStatus.html('您已进入沟通面板');
			}, this);


			//连接被关闭
			this.socket.onclose(function (event) {
				console.log('==========================close===============');
				this.$chatroomStatus.html('连接已关闭');
			});

			//错误
			this.socket.onerror(_.bind(function (event) {
				console.log('==========================error===============');
				this.$chatroomStatus.html('您已断开连接');
			}, this));
		},
		login: function () {
			$.showLoading('正在连接');

			businessDelegate.loginWebSocket({
				charRoomUuid:this.charRoomUuid   //聊天室uuid
			}, _.bind(function (res) {
				// console.log(res);
				this.initWebSockt(res.obj.url);
			}, this), _.bind(function (err) {
				//获取连接失败
				$.hideLoading();

				//开启重连面板
				$.confirm('是否重新连接', '获取聊天室连接失败', _.bind(function () {
					this.login();
				}, this), function () {
					Backbone.history.navigate('contact-list', { trigger: true });
				});
			}, this));
		},
		backbutton: function () {
			if (this.$('#userCard').css('display') == 'block') {
				$.closePopup();
				return;
			}

			if (this.isRecording) {
				this.endRecordVoice();
				return;
			}

			if (this.socket) {
				this.socket.close();
			}

			if (window.cordova) {
				if (this.navite_media) {
					this.navite_media.stop();
					this.navite_media.release();
					this.navite_media = null;
				}
			}

            Backbone.history.navigate('chatroom-list', { trigger: true });
		},
		initialize: function (options) {
            this.header = new AppHeader({
                host: this,
                main: false,
                title: options.title
			});
			this.menu = new AppMenu({
				index: 0
			});
			this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);
			this.header.setRightBtn('<i class="iconfont icon-duoren"></i>');

            // this.$el.empty().append(this.header.$el).append(template);

			this.socket = null;
			this.relink = 0; //重连次数

			this.isRecording = 0;	//是否正在录音
			this.input_type = 'text';	//传输类型

			this.messageBoxs = [];	//消息盒子
			this.lastMessageTimeStamp = '';

			this.messageBoxTemplate = this.$('#message-box-tpl').html();
			this.$wrapper = this.$('.chatroom-content-wrapper');
			this.$content = this.$('.chatroom-content');
			this.$chatroomStatus = this.$('.client-status');

			//播放器
			this.$audio = this.$('#playvoice');
			this.audio = this.$audio[0];
			this.playingUrl = '';
			this.navite_media = null;


			//聊天室uuid
			this.charRoomUuid = options.uuid;

			//录音绑定播放结束事件
			this.$audio.on('ended', _.bind(function () {
				this.playingUrl = '';
				this.$('.message-voice').removeClass('active').find('span').html('点击播放语音');
			}, this));

			this.limitBox = 50;
		},
		render: function () {
			this.$wrapper.height(this.$wrapper.height());
			this.login();
			return this;
		},
		destroy: function () {
			this.$audio.prop('src', '');
			this.$audio.remove();
			businessDelegate.abortApi('loginWebSocket');
		}
	});

	return View;
});
