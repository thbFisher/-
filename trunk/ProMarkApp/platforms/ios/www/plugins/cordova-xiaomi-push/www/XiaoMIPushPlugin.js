cordova.define("cordova-xiaomi-push.XiaoMIPushPlugin", function(require, exports, module) {
var exec = require('cordova/exec');

var XiaoMIPushPlugin = {
  registerPushAndAccount: function(account,successFn, failureFn) {
    exec(successFn, failureFn, 'XiaoMIPushPlugin', 'registerPushAndAccount', [account]);
  },
   unPushAndAccount: function(account,successFn, failureFn) {
    exec(successFn, failureFn, 'XiaoMIPushPlugin', 'unPushAndAccount', [account]);
  } 
};

module.exports = XiaoMIPushPlugin
});
