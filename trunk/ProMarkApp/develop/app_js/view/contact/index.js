/**
*   首页
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
	var template = require('text!view/contact/tpl/index.html');
	var AppHeader = require('view/app-header');
	var AppMenu = require('view/app-menu');
	var ContactDetail = require('view/contact/detail');
    var CharFirstPinyin = require('charFirst.pinyin');

	var View = Backbone.View.extend({
		el: 'body',
        events: {
			'tap .contact-type': 'selectType',
			'tap .contact-company': 'selectCompany',
			'tap .contact-section': 'selectSection',
			'tap .contact-list-box': 'viewContactInfo',

			'tap .btn-contact-search': 'searchContactList',
			'tap #sectionListControl .btn-prev,#sectionListControl .btn-next': 'viewSectionPage'
		},
		asc_sort: function (aObj, bObj) {
			var a = aObj.name;
			var b = bObj.name;
			return CharFirstPinyin.makePy(b)[0].charAt(0).toUpperCase() < CharFirstPinyin.makePy(a)[0].charAt(0).toUpperCase() ? 1 : -1;
		},
		renderNav: function () {
			var str = '联系人>';
			// if (this.nav.length && this.nav[this.nav.length - 1].floor == -1) {
			// 	str += ' 搜索>';
			// } else {
			// 	_.each(this.nav, function (v) {
			// 		str += ' ' + v.navStr + '>';
			// 	});
			// }

			_.each(this.nav, function (v) {
				str += ' ' + v.navStr + '>';
			});

			this.$('.nav').html(str);

			if (this.nav.length >= 1) {
				this.$('.left-button').show();
			} else {
				this.$('.left-button').hide();
			}
		},
		renderFloor: function () {
			console.log(this.nav);

			if (!this.nav.length) {
				this.type = '';
				this.typeStr = '';
				this.companyStr = '';
				this.sectionStr = '';

				this.$listContent.html(this.typeListTemplate);
				this.renderNav();
			} else {
				var last = this.nav.length - 1;
				var nav = this.nav[last];

				switch (nav.floor) {
					case 1:
						//获取公司列表
						this.type = nav.type;
						this.typeStr = nav.typeStr;
						this.companyStr = '';
						this.sectionStr = '';

						this.getCompanyList();
						this.renderNav();
						break;
					case 2:
						//获取部门列表
						this.type = nav.type;
						this.typeStr = nav.typeStr;
						this.companyStr = nav.companyStr;
						this.sectionStr = '';

						this.getSectionList(1);
						this.renderNav();
						break;
					case 3:
						//获取联系人列表
						this.type = nav.type;
						this.typeStr = nav.typeStr;
						this.companyStr = nav.companyStr;
						this.sectionStr = nav.sectionStr;

						this.getContactList($.noop);
						this.renderNav();
						break;
					case -1:
						break;
				}
			}
		},
		/**
		 * 查看联系人详情
		 */
		viewContactInfo: function (e) {
			var $e = $(e.currentTarget);
			var view = new ContactDetail($e.data());
			view.show();
		},
		/**
		 * 搜索联系人
		 */
		searchContactList: function () {
			var search = $.trim(this.$('.input-contact-search').val());

			if (!search) {
				return;
			}

			if (!isNaN(search) && search % 1 === 0) {
				//正整数
				if (utils.getStrBytesLength(search) < 3) {
					$.jtoast('请至少输入3位数字搜索');
					return;
				}
			} else {
				//字符串
				// if (utils.getStrBytesLength(search) < 2) {
				// 	$.jtoast('请至少输入1个汉字搜索');
				// 	return;
				// }
			}

			if (!this.nav.length || this.nav[this.nav.length - 1].floor > -1) {
				this.nav.push({
					type: this.type,
					typeStr: this.typeStr,
					companyStr: '',
					sectionStr: '',
					navStr: '搜索',
					floor: -1
				});
			}

			this.renderNav();
			this.search = search;

			this.getContactList(_.bind(function () {
				//清空搜索项
				this.$('.input-contact-search').val('');
				this.search = '';
			}, this));
		},
		/**
		 * 获取联系人列表
		 */
		selectSection: function (e) {
			this.sectionStr = $(e.currentTarget).data('sectionstr');
			if (!this.sectionStr) {
				return;
			}

			this.nav.push({
				type: this.type,
				typeStr: this.typeStr,
				companyStr: this.companyStr,
				sectionStr: this.sectionStr,
				navStr: this.sectionStr,
				floor: 3
			});

			this.renderNav();
			this.getContactList($.noop);
		},
		getContactList: function (callback) {
			$.showLoading();
			businessDelegate.getContactUserList({
				type: this.type,
				company: this.companyStr,
				section: this.sectionStr,
				name: this.search,
			}, _.bind(function (data) {
				$.hideLoading();

				var list = data.obj;
				list.sort(this.asc_sort);

				var obj = {};

				var _h;
				_.each(list, function (v) {
					var h = CharFirstPinyin.makePy(v.name)[0].charAt(0).toUpperCase();

					if (h != _h) {
						obj[h] = [v];
						_h = h;
					} else {
						obj[_h].push(v);
					}
				});

				console.log(obj);

				var tpl = _.template(this.contactListTemplate)({ obj: obj });

				this.$listContent.html(tpl);

				this.$listContent.scrollTop(0);

				callback();
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$listContent.html(this.errorHTML);
			}, this));
		},
		/**
		 * 获取部门列表
		 */
		selectCompany: function (e) {
			this.companyStr = $(e.currentTarget).data('companystr');
			if (!this.companyStr) {
				return;
			}

			this.nav.push({
				type: this.type,
				typeStr: this.typeStr,
				companyStr: this.companyStr,
				sectionStr: '',
				navStr: this.companyStr,
				floor: 2
			});

			this.renderNav();
			this.getSectionList(1);
		},
		viewSectionPage: function (e) {
			var page = $(e.currentTarget).data('page');
			this.getSectionList(page);
		},
		getSectionList: function (page) {
			$.showLoading();
			businessDelegate.getContactSectionList({
				type: this.type,
				company: this.companyStr,
				page: page,
				rows: this.rows
			}, _.bind(function (data) {
				$.hideLoading();

				var tpl = _.template(this.sectionListTemplate)({ data: data.obj });

				this.$listContent.html(tpl);

				this.$listContent.scrollTop(0);
			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$listContent.html(this.errorHTML);
			}, this));
		},
		/**
		 * 获取公司列表
		 */
		selectType: function (e) {
			this.type = $(e.currentTarget).data('type');

			if (!this.type) {
				return;
			}

			this.typeStr = $(e.currentTarget).data('typestr');

			this.nav.push({
				type: this.type,
				typeStr: this.typeStr,
				companyStr: '',
				sectionStr: '',
				floor: 1,
				navStr: this.typeStr,
			});

			this.renderNav();
			this.getCompanyList();
		},
		getCompanyList: function () {
			$.showLoading();
			businessDelegate.getContactCompanyList({
				type: this.type
			}, _.bind(function (data) {
				$.hideLoading();

				var tpl = _.template(this.companyListTemplate)({ list: data.obj });

				this.$listContent.html(tpl);

				this.$listContent.scrollTop(0);

			}, this), _.bind(function (err) {
				$.hideLoading();
				$.jtoast(err);
				this.$listContent.html(this.errorHTML);
			}, this));
		},
		backbutton: function () {
			if (!this.nav.length) {
				Backbone.history.navigate('index', { trigger: true });
			} else {
				this.nav.pop();
				this.renderFloor();
			}
		},
		initialize: function () {
            this.header = new AppHeader({
                host: this,
                main: false,
				title: '联系人'
            });

			this.menu = new AppMenu({
				index: 3
			});

            this.$el.empty().append(this.header.$el).append(template).append(this.menu.$el);

			this.$('.left-button').hide();

			this.typeListTemplate = this.$('#typeList').html();
			this.companyListTemplate = this.$('#companyList').html();
			this.sectionListTemplate = this.$('#sectionList').html();
			this.contactListTemplate = this.$('#contactList').html();

			this.errorHTML = '<div class="warning-panel">无法获取数据</div>';

			this.$listContent = this.$('.contact-list-wrapper');

			this.type = '';
			this.typeStr = '';
			this.companyStr = '';
			this.searchStr = '';
			this.nav = [];
			this.rows = 500;

			/**
			 * 测试数据
			 */
			// this.nav = [
			// 	{
			// 		type: 2,
			// 		typeStr: '渠道',
			// 		floor: 1,
			// 		navStr: '渠道',
			// 	},
			// 	{
			// 		type: 2,
			// 		typeStr: '渠道',
			// 		companyStr: '韶山',
			// 		floor: 2,
			// 		navStr: '韶山',
			// 	},
			// 	{
			// 		type: 2,
			// 		typeStr: '渠道',
			// 		companyStr: '韶山',
			// 		floor: 3,
			// 		navStr: '竹鸡营业厅',
			// 		sectionStr: '竹鸡营业厅'
			// 	}
			// ];

			// this.renderFloor();

			// this.$('.input-contact-search').val(139);
			// this.searchContactList();
		},
		render: function () {
			return this;
		}
	});

	return View;
});
