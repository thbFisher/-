define(function (require, exports, module) {
	// 统一在最前面定义依赖
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('backbone');

	var phonegaputil = require('phonegaputil');

	// 加载模版通过text插件的方式将文本作为模块
	var template = require('text!view/tpl/_get-image.html');
	var SlidePage = require('view/slide-page');

	var View = SlidePage.extend({
		events: {
            'tap .btn-cancel-get-image': 'backbutton',
            // 'tap .full': 'backbutton',
            'tap .btn-camera': 'getImageByCamera',
            'tap .btn-gallery': 'getImageByGallery'
		},
		getImageByCamera: function () {
			phonegaputil.getImageViaCamera(_.bind(function (src) {
				this.trigger('get', src);
				this.back();
			}, this), _.bind(function (error) {
				// this.back();
				console.log('调用相机报错', 'cancel');
			}, this), this.options);

			return false;
		},
		getImageByGallery: function () {
			phonegaputil.getImageViaGallery(_.bind(function (src) {
				if (src) {
					this.trigger('get', src);
					this.back();
				}
			}, this), _.bind(function (error) {
				// this.back();
				console.log('调用相册报错', 'cancel');
			}, this), this.options);

			return false;
		},
		initialize: function (options) {
			this.options = {
				crop: false,
				title: '选择照片'
			};

			if (options) {
				this.options = _.extend(this.options,options);
			}

			var tpl = _.template(template)({title: this.options.title});
			this.$el.empty().append(tpl);
		},
		render: function () {
			return this;
		}
	});

	return View;
});
