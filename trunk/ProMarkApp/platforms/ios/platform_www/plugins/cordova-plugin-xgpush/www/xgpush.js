cordova.define("cordova-plugin-xgpush.XGPush", function(require, exports, module) { 'use strict';

var xgpush = {};

xgpush.SERVICE = 'XGPush';
xgpush.ACTION_REGISTER_PUSH = 'registerpush';
xgpush.ACTION_UNREGISTER_PUSH = 'unregisterpush';
xgpush.ACTION_ADD_LISTENER = 'addlistener';

xgpush.registerPush = function(alias,callback,callbackError) {
	cordova.exec(callback,callbackError,xgpush.SERVICE,xgpush.ACTION_REGISTER_PUSH,[alias]);
};

xgpush.registerListener = function(callback,callbackError) {
	cordova.exec(callback,callbackError,xgpush.SERVICE,xgpush.ACTION_ADD_LISTENER,[]);
};

xgpush.unregisterPush = function(callback,callbackError) {
	cordova.exec(callback,callbackError,xgpush.SERVICE,xgpush.ACTION_UNREGISTER_PUSH,[]);
};

module.exports = xgpush;

});

