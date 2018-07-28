define(function (require, exports, module) {
	var $ = require('jquery');
    var localDB = require('localDB');
	var constant = require('constant');

	// 按2次回退退出程序
    var quitflag = 0;
    function exitApp() {
        if (navigator.app) {
            quitflag = quitflag + 1;

            setTimeout(function () {
                quitflag = 0;
            }, 3000);

            if (quitflag >= 2) {
                if (arguments.length != 0) {
                    arguments[0]();
                }
				//注意，这段代码是应用退出前保存统计数据，请在退出应用前调用
                // navigator.app.exitApp();
				cordova.getAppVersion.exitAPP();
            } else {
				$.jtoast('再按一次返回键退出', '', '', 'black');
            }
        }
    }

    //键盘控制
    function hideKeyboard() {
		if (navigator.notification) {
			var d = device.platform.toLocaleLowerCase();
			if (d == 'ios') {
				Keyboard.shrinkView(true);
			} else if (d == 'android') {
				Keyboard.hide();
			}
		} else {
			console.log('收起键盘');
		}
    }

    function showKeyboard() {
		if (navigator.notification) {
			var d = device.platform.toLocaleLowerCase();
			if (d == 'ios') {
				Keyboard.shrinkView(false);
			} else if (d == 'android') {
				Keyboard.show();
			}
		} else {
			console.log('展示键盘');
		}
    }

	function saveConfig(key, value, onSuccess, onFail) {
		if (window.plugins && window.plugins.appPreferences) {
			window.plugins.appPreferences.store(onSuccess, onFail, key, value);
		} else {
			localDB.put(key, JSON.stringify(value), onSuccess);
		}
	}

	function getConfig(key, onSuccess, onFail) {
		if (window.plugins && window.plugins.appPreferences) {
			window.plugins.appPreferences.fetch(onSuccess, onFail, key);
		} else {
			var data = null;
			localDB.get(key, function (o) {
                if (o) {
                    try {
                        data = JSON.parse(o.value);
                    } catch (e) {
                        onFail(e);
                        return;
                    }
                }

                onSuccess(data);
            }, function (e) {
                onSuccess(data);
            });
		}
	}

	function getDevicePlatform() {
		if (navigator.notification) {
			return device.platform.toLocaleLowerCase();
		} else {
			return 'android';
		}
	}


	//通过照相机获取图片路径
	function getImageViaCamera(onSuccess, onFail, options) {
		if (window.cordova) {
			var default_options = {
                quality: 100,
				targetHeight: 960,
				correctOrientation: true,
				destinationType: Camera.DestinationType.FILE_URI
            }

			navigator.camera.getPicture(function (src) {
				if (options.crop) {
                    plugins.crop(onSuccess, onFail, src, { quality: 50 });
                } else {
                    onSuccess(src);
                }
			}, onFail, default_options);
		} else {
			console.log('打开相机');
			onSuccess('http://bxslider.com/images/730_200/houses.jpg');
		}
	}


	//通过相册获取图片路径
	function getImageViaGallery(onSuccess, onFail, options) {
		if (window.cordova) {
			var default_options = {
                maximumImagesCount: 1,
				quality: 100,
				height: 960
            }

			window.imagePicker.getPictures(function (results) {
				var src = results[0];

				if (!src) {
					onSuccess(src);
					return;
				}

				if (options.crop) {
                    plugins.crop(onSuccess, onFail, src, { quality: 50 });
                } else {
                    onSuccess(src);
                }
			}, onFail, default_options);
		} else {
			console.log('打开相册');
			onSuccess(['http://bxslider.com/images/730_200/houses.jpg']);
		}
	}

	// 测试超慢网速时出现的上传一直卡住的问题:
	// 上传数据的过程中, 如果网络极慢(2G网络 1K的速度)的情况下, 会出现5分钟超时现象.
	// 上传进度会一直卡住, 此时HTTP一直处于连接状态, 而不是断开的,
	// 最终造成服务器解析HTTP流错误, 无法获取到完整的上传文件
	function uploadPhoto(imageURI, uploadAction, params, success, fail, onprogress) {
		console.log('uploadPhoto');
		var options = new FileUploadOptions();
		options.fileKey = "upfile";
		options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		options.mimeType = "image/jpeg";
		options.params = params;

		var ft = new FileTransfer();
		ft.onprogress = onprogress;
		ft.upload(imageURI, encodeURI(uploadAction), success, fail, options);
		return ft;
	}

	function uploadAudio(url, uploadAction, params, success, fail, onprogress) {
		console.log('uploadAudio');
		var options = new FileUploadOptions();
		options.fileKey = "upfile";
		options.fileName = url.substr(url.lastIndexOf('/') + 1);
		options.mimeType = "video/mp4";
		options.params = params;

		var ft = new FileTransfer();
		ft.onprogress = onprogress;
		ft.upload(url, encodeURI(uploadAction), success, fail, options);
		return ft;
	}

	//获取版本信息
    function getAppVersion(onSuccess) {
        if (window.cordova) {
            cordova.getAppVersion.getVersionNumber(function (version) {
                onSuccess(version);
            });
        } else {
            onSuccess('0.0.1beta');
        }
    }

	function getAppVersionCode(onSuccess){
        if (window.cordova) {
            cordova.getAppVersion.getVersionCode(function(code){
                onSuccess(code);
            });
        }else{
            onSuccess(1);
        }
    }

	//获取头部信息
	function getHead(data) {
		console.log('getHead');
        var strData = JSON.stringify(data);
        var timeTs = new Date().getTime();
        var tk = CryptoJS.MD5(strData + timeTs + constant.secretKey).toString().substr(8, 16);
        console.log('tk:' + tk);

        return {
            ts: timeTs,
            clientAppName: constant.clientAppName,
            tkon: tk
        };
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

	//删除文件
	String.prototype.endWith = function (s) {
		if (s == null || s == "" || this.length == 0 || s.length > this.length)
			return false;
		if (this.substring(this.length - s.length) == s)
			return true;
		else
			return false;
	}

	String.prototype.startWith = function (s) {
		if (s == null || s == "" || this.length == 0 || s.length > this.length)
			return false;
		if (this.substr(0, s.length) == s)
			return true;
		else
			return false;
	}

	function removeFileByCamerapreview(fileName) {
		var _fileName = fileName;
		if (!_fileName.startWith('file://') || !_fileName.startWith('assets-library://')) {
			_fileName = 'file://' + _fileName;
		}

		window.resolveLocalFileSystemURL(_fileName, function (fileEntry) {
			fileEntry.remove();//删除
		}, function (evt) {
			console.log(evt.target.error.code);
		});
	}

	/**
    *   自动更新
    **/
    function updateApp(onSuccess, onError) {
        getLastestByShotcut(function (akey) {
            getUpdateDetail(akey, function (data) {
                if (data.appVersionNo > window.versioncode) {
                    onSuccess('发现新版本');
                    $.updateApp(data.appUpdateDescription, function () {
                        if (window.cordova) {
                            PgyUpdatePlugin.updateAppAndListener(function () {
                                $.jtoast('正在准备下载，请耐心等待...', '', '', 'black');
                            }, onError);
                        } else {
                            console.log('自动更新下载');
                            $.jtoast('正在准备下载，请耐心等待...', '', '', 'black');
                        }
                    });
                } else {
                    onSuccess('当前已是最新版本');
                }
            }, onError);
        }, onError);
    }

    function getUpdateDetail(akey, success, error) {
        $.ajax({
            type: "POST",
            url: "http://www.pgyer.com/apiv1/app/view",
            dataType: 'json',
            data: {
                _api_key: constant._api_key,
                aKey: akey
            },
            success: function (result, textStatus, jqXHR) {
				console.log('app版本信息：',result);
				if (result.code == 0) {
					success(result.data);
				} else {
					error();
				}
            },
            error: function (jqXHR, textStatus, errorThrown) {
                error();
            }
        });
    }

    function getLastestByShotcut(success, error) {
        $.ajax({
            type: "POST",
            url: "http://www.pgyer.com/apiv1/app/getAppKeyByShortcut",
            dataType: 'json',
            data: {
                _api_key: constant._api_key,
                shortcut: constant.shortcut
            },
            success: function (result, textStatus, jqXHR) {
                console.log('app蒲公英信息：',result);
                if (result.code == 0) {
                    success(result.data.appKey);
                } else {
                    error();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                error();
            }
        });
    }

	/**
	 * 调用短信插件
	 * ios逗号分隔
	 * android分好分隔
	 */
	function sendSMS(numArr,content,onSuccess,onFailed){
        if (window.cordova) {
            var numbers = '';
            if(device.platform == 'iOS'){
                numbers = numArr.join(',');
            }else if(device.platform == 'Android'){
                numbers = numArr.join(';');
            }

            sms.send(numbers,content,{
                replaceLineBreaks: false,
                android: {
                    intent: 'INTENT'
                }
            },onSuccess,onFailed);
        }else{
            console.log('sendSMS');
            onSuccess();
        }
	}
	
    return {
		removeFileByCamerapreview: removeFileByCamerapreview,
        exitApp: exitApp,
        hideKeyboard: hideKeyboard,
        showKeyboard: showKeyboard,
        saveConfig: saveConfig,
        getConfig: getConfig,
        getDevicePlatform: getDevicePlatform,
		getImageViaCamera: getImageViaCamera,
		getImageViaGallery: getImageViaGallery,
		uploadPhoto: uploadPhoto,
		uploadAudio: uploadAudio,
		getAppVersion: getAppVersion,
		getAppVersionCode: getAppVersionCode,
		getHeadAndBody: getHeadAndBody,
		updateApp: updateApp,
		sendSMS: sendSMS
	}

});
