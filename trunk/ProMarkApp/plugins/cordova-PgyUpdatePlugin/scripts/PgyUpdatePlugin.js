module.exports = {
    updateApp: function ( successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PgyUpdatePlugin", "updateApp", []);
    },
    updateAppAndListener: function ( successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PgyUpdatePlugin", "updateAppAndListener", []);
    },
    exitAPP: function ( successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "PgyUpdatePlugin", "exitAPP", []);
    }
};