/**
*   我的问题
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
	var template = require('text!view/knowledge/tpl/myquestion.html');
	var AppHeader = require('view/app-header');
	// var Detail = require('view/knowledge/detail');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .materials-controls-mask': 'toggleTypePanel',
            'tap .materials-control-btn': 'toggleTypePanel',
			'tap .label-type': 'searchByType',
			'tap .search-keyword': 'searchByKeyword',
			'tap .list-warning': 'initList',
			'tap .btn-prev,.btn-next': 'viewPage',
            'tap .knowledge-question-box .control': 'viewDetail'
		},
		viewDetail: function(e){
			var uuid = $(e.currentTarget).data('uuid');
			Backbone.history.navigate('knowledge-detail/'+uuid+'/knowledge-myquestion', { trigger: true });
			// var view = new Detail({
			// 	uuid: uuid
			// });
			// view.show();
		},
		viewPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getList(page, $.noop);
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
			this.$input.val('');
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
        getList: function(page, callback){
            this.current_page = page;

			if (!this.isPullRefresh) {
				this.$listContent.empty();
				$.showLoading();
			} else {
				this.isPullRefresh = 0;
			}

			businessDelegate.getMyKnowledgeQuestion({
				page: this.current_page,
				rows: this.rows,
				queDesc: this.search_title_keyword,
				queTypeUuid: this.search_type_uuid,
				maxWidth: 50
			}, _.bind(function (data) {
				if (!this.isPullRefresh) {
					$.hideLoading();
				}

				var tpl = _.template(this.listTemplate)({ data: data.obj.queList });
				this.$listContent.html(tpl);

				this.renderType(data.obj.queTypeList);

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
        renderType: function(data){
			if (!data.length) {
				return;
			}

            var tpl = _.template(this.typeTemplate)({list: data});
            this.$typeContent.html(tpl);
        },
		backbutton: function () {
			if(this.$('.materials-controls-mask').hasClass('fadein')){
				this.hideTypePanel();
				return;
			}
            Backbone.history.navigate('knowledge-index', { trigger: true });
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false, //是否主页面
                title: '我的问题'
            });

            this.$el.empty().append(this.header.$el).append(template);
            
			this.$listContent = this.$('.knowledge-question-box-wrapper');
			this.listTemplate = this.$('#listTpl').html();

			this.$typeContentMask = this.$('.materials-controls-mask');
            this.$typeContent = this.$('.materials-controls');
            this.typeTemplate = this.$('#typeTpl').html();

			this.$warning = this.$('.list-warning');
			this.$input = this.$('.knowledge-question-keyword');

            this.current_page = 1;	//当前页
			this.rows = 10; //每页显示数目
			this.search_title_keyword = '';	//搜索关键字
			this.search_type_uuid = '';	//搜索类型uuid

			this.isPullRefresh = 0;
			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';
		},
		render: function () {
            //下拉刷新
            this.$('.knowledge-question-list').pullToRefresh();
            this.$('.knowledge-question-list').on("pull-to-refresh", _.bind(function () {
				this.isPullRefresh = 1;
				this.getList(1, _.bind(function () {
					this.$('.knowledge-question-list').pullToRefreshDone();
				}, this));
			}, this));

            //获取列表
			this.getList(1, $.noop);

			return this;
		}
	});

	return View;
});
