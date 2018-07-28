/**
*   在线阅读
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
	var template = require('text!view/read/tpl/index.html');
	var AppHeader = require('view/app-header');
	var MyRead = require('view/read/my');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .materials-controls-mask': 'toggleTypePanel',
            'tap .materials-control-btn': 'toggleTypePanel',
			'tap .label-type': 'searchByType',
			'tap .search-keyword': 'searchByKeyword',
			'tap .list-warning': 'initList',
			'tap .btn-prev,.btn-next': 'viewPage',
			'tap .materials-box': 'viewInfo',
			'tap .myread': 'viewMyRead'
		},
		viewMyRead: function(){
			var view = new MyRead();
			view.show();
		},
		viewInfo: function (e) {
			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');

			Backbone.history.navigate('read-info/' + uuid+"/true", { trigger: true });
		},
		hideTypePanel: function(){
			if(this.$typeContentMask.hasClass('fadein')){
				var $iconfont = this.$('.materials-control-btn').find('.iconfont');
				$iconfont.removeClass('turn');
				this.$typeContentMask.removeClass('fadein');
				setTimeout(_.bind(function(){
					this.$typeContentMask.hide();
				},this), 500);
			}
		},
		toggleTypePanel: function () {	//切换类型栏
			if ($.trim(this.$typeContent.html())) {
				var $iconfont = this.$('.materials-control-btn').find('.iconfont');
			
				if(this.$typeContentMask.hasClass('fadein')){
					$iconfont.removeClass('turn');
					this.$typeContentMask.removeClass('fadein');
					setTimeout(_.bind(function(){
						this.$typeContentMask.hide();
					},this), 500);
				}else{
					this.$typeContentMask.css('display', 'block');

					setTimeout(_.bind(function(){
						$iconfont.addClass('turn');
						this.$typeContentMask.addClass('fadein');
					},this), 100);
				}
				
				// this.$typeContentMask.toggle();
			}
		},
		searchByType: function (e) {
			// this.$typeContentMask.hide();
			this.hideTypePanel();
			this.$('.materials-keyword').val('');
			this.search_title_keyword = '';

			var $e = $(e.currentTarget);
			var uuid = $e.data('uuid');
			this.search_type_uuid = uuid;

			this.$warning.show();
			this.getList(1, $.noop);
			return false;
		},
		searchByKeyword: function () {
			// this.$typeContentMask.hide();
			this.hideTypePanel();
			this.search_type_uuid = '';

			var keyword = $.trim(this.$input.val());
			if (!keyword) {
				return;
			}

			this.search_title_keyword = keyword;

			this.$warning.show();
			this.getList(1, $.noop);
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
		},
		getList: function (page, callback) {
			this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.readList({
				page: this.current_page,
				rows: this.rows,
				courName: this.search_title_keyword,
				courImageWidth: 180,
				courTypeUUID: this.search_type_uuid
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.listTemplate)({ data: data.obj.readCourseware });
				this.$listContent.html(tpl);

				this.renderType(data.obj.readCoursewareType);

				this.$listContent.scrollTop(0);

				callback();
			}, this), _.bind(function (err) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				$.jtoast(err);
				this.$listContent.html(this.errorHTML);

				callback();
			}, this));
		},
		initList: function () {
			// this.$typeContentMask.hide();
			this.hideTypePanel();
			this.$warning.hide();
			this.$input.val('');

			this.search_title_keyword = '';	//搜索关键字
			this.search_type_uuid = '';	//搜索类型uuid

			this.getList(1, $.noop);
		},
		renderType: function (data) {
			if (!data.length) {
				return;
			}

			var tpl = _.template(this.typeTemplate)({ list: data });
			this.$typeContent.html(tpl);
		},
		backbutton: function () {
			if(this.$('.materials-controls-mask').hasClass('fadein')){
				this.hideTypePanel();
				return;
			}

            Backbone.history.navigate('work', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '在线阅读'
            });
			this.header.setRightBtn('<span class="text myread">阅读记录</span>');

            this.$el.empty().append(this.header.$el).append(template);

			this.$listContent = this.$('.materials-box-wrapper');
			this.listTemplate = this.$('#listTpl').html();

			this.$typeContentMask = this.$('.materials-controls-mask');
			this.$typeContent = this.$('.materials-controls');
			this.typeTemplate = this.$('#typeTpl').html();

			this.$warning = this.$('.list-warning');
			this.$input = this.$('.materials-keyword');

			this.current_page = 1;	//当前页
			this.rows = 10; //每页显示数目
			this.search_title_keyword = '';	//搜索关键字
			this.search_type_uuid = '';	//搜索类型uuid

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
            //下拉刷新
            this.$('.materials-list').pullToRefresh();
            this.$('.materials-list').on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getList(1, _.bind(function () {
					this.$('.materials-list').pullToRefreshDone();
				}, this));
			}, this));

			this.getList(1, $.noop);
			return this;
		}
	});

	return View;
});
