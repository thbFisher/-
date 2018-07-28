/**
 * 预加载图片
 */
define(function(require, exports, module){
	var $ = require('jquery');

	function perLoadingImg() {
		// var path = findCordovaPath();
		// console.log('&&&&&&&&&&&&&&&&&&&&&',path);
		var path = 'app_img/';
		$.ajax({
			type : 'GET',
			url : path + 'loading.txt',
			contentType : 'text/HTML',
		}).success(function(data, textStatus, jqXHR) {
			var splitArrays = data.split('\n');
			$.each(splitArrays, function(i, v) {
				if (v) {
					console.log(v+'已加载');
					var img = new Image();
					img.src = v;
					// console.log(img.src);
				}
			});
		});
	}

	function findCordovaPath() {
		var path = null;
		var scripts = document.getElementsByTagName('script');
		var term = 'require.js';
		for (var n = scripts.length - 1; n > -1; n--) {
			var src = scripts[n].src;
			if (src.indexOf(term) == (src.length - term.length)) {
				path = src.substring(0, src.length - term.length);
				break;
			}
		}
		return path;
	}

	return {
		perLoadingImg : perLoadingImg
	}
});