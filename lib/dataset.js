// source /src/umd.es6
'use strict';

/*!
 * Dataset Component v0.9.19
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2017 Atma.js and other contributors
 */
(function (root, factory) {
	var _global = typeof global !== 'undefined' ? global : window,
	    _mask = _global.mask || _global.atma && _global.atma.mask;

	if (_mask == null) {
		if (typeof require === 'function') {
			mask = require('maskjs');
		} else {
			throw Error('MaskJS was not loaded');
		}
	}

	factory(_global, _mask, _mask.Compo.config.getDOMLibrary());
})(undefined, function (global, mask, $) {

	// source utils/obj.es6
	'use strict';

	var obj_createInstance, obj_getType, obj_clone;
	(function () {

		obj_createInstance = function obj_createInstance(obj) {
			if (obj.constructor !== Object && obj.constructor.length === 0) {
				return new obj.constructor();
			}
			var out = {},
			    key,
			    val;
			for (key in obj) {
				val = obj[key];
				if (mask.is.Array(val)) {
					out[key] = [];
					continue;
				}
				if (mask.is.Object(val)) {
					out[key] = {};
					continue;
				}
				out[key] = null;
			}
			return out;
		};
		obj_clone = function obj_clone(obj) {
			var Ctor = obj.constructor;
			if (typeof Ctor.clone === 'function') {
				return Ctor.clone(obj);
			}
			if (typeof obj.clone === 'function') {
				return obj.clone();
			}
			var instance = Ctor !== Object && Ctor.length === 0 ? new Ctor() : {};

			mask.obj.extend(instance, obj);
			return instance;
		};
	})();
	// end:source utils/obj.es6

	// source compo/Dataset.es6
	'use strict';

	var DatasetCompo = mask.Compo({
		tagName: 'div',
		meta: {
			template: 'merge'
		},
		attr: {
			style: 'position: relative;'
		},

		slots: {
			datasetItemRemove: function datasetItemRemove(event) {
				var _this3 = this;

				var model = $(event.target).model();

				var onComfirm = function onComfirm() {
					_this3.find('Editor').remove(model).done(onRemove).fail(onError);
				};
				var onRemove = function onRemove() {
					_this3.find('#provider').removeEntity(model);
				};
				var onError = function onError(error) {
					alert('Error ' + error.message);
				};
				this.find('Confirmation').confirm('remove', model).done(onComfirm);
			},
			datasetItemEdit: function datasetItemEdit(event) {
				var _this4 = this;

				var compo = $(event.target).compo();
				var originalModel = compo.model;
				var model = this.cloneDataItem(originalModel);
				this.find('Editor').edit(model, compo).done(function (json) {
					var provider = _this4.find('#provider');
					if (provider.updateEntity) {
						provider.updateEntity(json, originalModel);
					}
				});
			},
			datasetItemNew: function datasetItemNew(event) {
				var _this5 = this;

				var model = this.createDataItem();
				this.find('Editor').edit(model).done(function (json) {
					var provider = _this5.find('#provider');
					if (provider.addEntity) {
						provider.addEntity(json);
					}
				});
			}
		},

		filter: function filter(query) {
			var provider = this.find('#provider');
			if (provider.filter) {
				provider.filter(query);
			}
		},
		activity: function activity(diff) {
			this.emitIn('datasetActivity', diff);
		},
		onRenderStart: function onRenderStart(model, ctx, container) {
			jmask(this).append('Activity; Confirmation;');
			this.ensureDataProvider_();
		},
		createDataItem: function createDataItem() {
			var provider = this.find('#provider');
			var obj = mask.obj.get(provider, 'model.data.collection.0') || {};
			return obj_createInstance(obj);
		},
		cloneDataItem: function cloneDataItem(model) {
			return obj_clone(model);
		},
		ensureDataProvider_: function ensureDataProvider_() {
			if (this.xEndpoint == null) {
				return;
			}
			jmask(this).prepend('ModelDataProvider');
		}
	});

	mask.registerFromTemplate('\n\t// source Controls/Activity.mask\n\tlet Activity as (div.a-dataset-activity) {\n\t\t\n\t\tvar activity = 0;\n\t\t\n\t\tslot datasetActivity (sender, diff) {\n\t\t\tvar count = this.scope.activity + diff;\n\t\t\tif (count < 0) count = 0;\n\t\t\tthis.scope.activity = count;\n\t\t}\n\t\t\n\t\tstyle {\n\t\t\t.a-dataset-activity-backdrop {\n\t\t\t\tposition: absolute;\n\t\t\t\t\n\t\t\t\ttop:0;\n\t\t\t\tleft:0;\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tbackground: rgba(255,255,255, .8);\n\t\t\t\tz-index: 100;\n\t\t\t}\n\t\t\t.a-dataset-activity-spinner {\n\t\t\t\twidth: 40px;\n\t\t\t\theight: 40px;\n\t\t\t  \n\t\t\t\tposition: relative;\n\t\t\t\tmargin: auto;\n\t\t\t}\n\t\t\t.a-dataset-activity-bounce1, .a-dataset-activity-bounce2 {\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tborder-radius: 50%;\n\t\t\t\tbackground-color: #27ae60;\n\t\t\t\topacity: 0.6;\n\t\t\t\tposition: absolute;\n\t\t\t\ttop: 0;\n\t\t\t\tleft: 0;\t\t\t\n\t\t\t\t-webkit-animation: bounce 2.0s infinite ease-in-out;\n\t\t\t\tanimation: bounce 2.0s infinite ease-in-out;\n\t\t\t}\t\t\n\t\t\t.a-dataset-activity-bounce2 {\n\t\t\t\t-webkit-animation-delay: -1.0s;\n\t\t\t\tanimation-delay: -1.0s;\n\t\t\t}\n\t\t\t\n\t\t\t@-webkit-keyframes bounce {\n\t\t\t\t0%, 100% { -webkit-transform: scale(0.0) }\n\t\t\t\t50% { -webkit-transform: scale(1.0) }\n\t\t\t}\n\t\t\t\n\t\t\t@keyframes bounce {\n\t\t\t\t0%, 100% { \n\t\t\t\t\ttransform: scale(0.0);\n\t\t\t\t\t-webkit-transform: scale(0.0);\n\t\t\t\t} 50% { \n\t\t\t\t\ttransform: scale(1.0);\n\t\t\t\t\t-webkit-transform: scale(1.0);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t\n\t\t+if ($scope.activity > 0) {\t\t\n\t\t\t.a-dataset-activity-backdrop >\n\t\t\t\t.a-dataset-activity-spinner {\n\t\t\t\t\t.a-dataset-activity-bounce1;\n\t\t\t\t\t.a-dataset-activity-bounce2;\n\t\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/Activity.mask\n\t// source Controls/Confirmation.mask\n\tlet Confirmation {\n\t\t\n\t\tfunction confirm(type, model) {\n\t\t\tvar compo = this;\n\t\t\treturn mask.class.Deferred.run(function(resolve, reject){\n\t\n\t\t\t\tvar msg = compo.getMessage_(type, model);\n\t\t\t\tvar confirmed = confirm(msg);\n\t\n\t\t\t\tif (confirmed) {\n\t\t\t\t\treturn resolve();\n\t\t\t\t}\n\t\t\t\treject();\n\t\t\t});\n\t\t}\n\t\n\t\tfunction getMessage_(type, model) {\n\t\t\tif (\'remove\' === type)\n\t\t\t\treturn \'Are you sure to remove the item?\';\n\t\t}\n\t\t\n\t}\n\t// end:source Controls/Confirmation.mask\n\t// source Controls/Dialog.mask\n\tlet Dialog {\n\t\t\n\t\tfunction show () {\n\t\t\tthis.$.modal(\'show\');\n\t\t}\n\t\tfunction hide () {\n\t\t\tthis.$.modal(\'hide\');\n\t\t}\n\t\t\n\t\tslot datasetEditorOpen () {\n\t\t\tthis.show();\n\t\t\treturn false;\n\t\t}\n\t\t\n\t\tslot datasetEditorClose () {\n\t\t\tthis.hide();\n\t\t\treturn false;\n\t\t}\n\t\t\n\t\tslot complete () {\n\t\t\tthis.hide();\n\t\t}\n\t\t\n\t\t.modal.fade > .modal-dialog.modal-lg > .modal-content {\n\t\t\t\t.modal-header {\n\t\t\t\t\t\n\t\t\t\t\tbutton.close data-dismiss= modal > span > \'x\';\n\t\t\t\t\th4 .modal-title {\n\t\t\t\t\t\t\'\xA0\' @title;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t@body > .modal-body style=\'position:relative; height:@attr.height\' > @placeholder;\n\t\t\t\t.modal-footer {\n\t\t\t\t\t@footer;\n\t\t\t\t}\n\t\t\t}\n\t}\n\t// end:source Controls/Dialog.mask\n\t// source Controls/Inline.mask\n\tlet Inline {\n\t\n\t\tfunction constructor () {\n\t\t\tthis.currentCompo = null;\n\t\t}\n\t\tfunction show (compo) {\n\t\t\tif (this.currentCompo) {\n\t\t\t\tthis.hide();\n\t\t\t}\n\t\n\t\t\tcompo.$.hide();\n\t\t\tthis.$elements.insertBefore(compo.$);\n\t\t\tthis.currentCompo = compo;\n\t\t}\n\t\tfunction hide () {\n\t\t\tif (this.currentCompo == null)\n\t\t\t\treturn;\n\t\n\t\t\tthis.$elements.detach();\n\t\t\tthis.currentCompo.$.show();\n\t\t\tthis.currentCompo = null;\n\t\t}\n\t\tslot datasetEditorOpen (sender, compo) {\n\t\t\tthis.show(compo);\n\t\t}\n\t\tslot datasetEditorClose () {\n\t\t\tthis.hide();\n\t\t}\n\t\tslot complete () {\n\t\t\tthis.hide();\n\t\t}\n\t\tfunction onRenderEnd () {\n\t\t\tthis.$elements = this.$.children().detach();\n\t\t}\n\t\tdiv style=\'display: none\' > @placeholder;\n\t}\n\t// end:source Controls/Inline.mask\n\t// source Controls/Table.mask\n\tlet Table {\n\t\t\n\t\tlet Item {\n\t\t\ttr {\n\t\t\t\t@each (row) {\n\t\t\t\t\ttd > @placeholder;\n\t\t\t\t}\n\t\t\t\ttd {\n\t\t\t\t\t@if (actions) {\n\t\t\t\t\t\t@actions;\n\t\t\t\t\t}\n\t\t\t\t\t@else {\n\t\t\t\t\t\ta .btn.btn-sm title=\'Edit\'   x-tap=datasetItemEdit   > i.glyphicon.glyphicon-pencil;\n\t\t\t\t\t\ta .btn.btn-sm title=\'Remove\' x-tap=datasetItemRemove > i.glyphicon.glyphicon-trash;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t\n\t\ttable.table.table-striped.table-hover {\n\t\t\tthead > tr {\n\t\t\t\t@each (head) {\n\t\t    \t\tth > @placeholder;\n\t\t    \t}\n\t\t\t\tth > \'\'\n\t\t    }\n\t\t    tbody {\n\t\t    \t+each(data.collection) > @template;\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/Table.mask\n\t// source Controls/List.mask\n\tlet List as (ul.unstyled) {\n\t\n\t\tlet Actions {\n\t\t\ta .btn.btn-sm title=\'Edit\'   x-tap=datasetItemEdit   > i.glyphicon.glyphicon-pencil;\n\t\t\ta .btn.btn-sm title=\'Remove\' x-tap=datasetItemRemove > i.glyphicon.glyphicon-trash;\n\t\t}\n\t\t\n\t\t+each(data.collection) > li > @template;\n\t}\n\t// end:source Controls/List.mask\n', DatasetCompo);

	// source Components/Editor.es6
	'use strict';

	(function () {

		var Editor = mask.Compo(mask.class.Deferred, {
			tagName: 'div',
			meta: {
				mode: 'client',
				template: 'merge'
			},

			attr: {
				class: 'a-dataset-editor'
			},
			compos: {
				form: 'compo: a:form'
			},
			slots: {
				'complete': function complete(sender, json) {
					this.resolve(json);
				}
			},
			onRenderStart: function onRenderStart(model, ctx, container, parent) {
				this.model = {};
			},
			onRenderEnd: function onRenderEnd() {
				if (this.compos.form == null) {
					console.warn('Dataset Component. When using `Editor`, it must contain `a:form` component');
				}
			},
			edit: function edit(model, compo) {
				this.defer();
				this._done = this._fail = this._always = null;
				this.compos.form.setEntity(model);
				this.emitIn('datasetEditorOpen', compo);
				return this;
			},
			remove: function remove(model) {
				this.defer();
				this.compos.form.removeEntity(model);
				return this;
			}
		});

		mask.registerHandler(DatasetCompo, 'Editor', Editor);
	})();
	// end:source Components/Editor.es6
	// source Provider/exports.es6
	'use strict';

	(function () {

		// source ./IDataProvider.es6
		'use strict';

		var IDataProvider = {
			attr: {
				id: 'provider'
			},
			filterQuery: null,
			meta: {
				template: 'merge',
				attributes: {
					'endpoint': 'string',
					'enable-ruta': true
				}
			},
			slots: {
				datasetFilter: function datasetFilter(sender, query) {
					this.filter(query);
				}
			},
			filter: function filter(query) {
				for (var key in this.filterQuery) {
					if (query == null || query[key] === void 0) {
						this.filterQuery[key] = null;
					}
				}
				if (query != null) {
					this.filterQuery = query;
				}
				this.load_();
			},

			aDataset: null,
			onRenderStart: function onRenderStart(model, ctx, container, ctr) {
				this.model = {
					data: {
						collection: null
					},
					activity: 0
				};
				this.aDataset = this.closest('a:dataset');
				this.onRenderStart_();
				this.readQuery_();
				this.load_();
			},
			onRenderStart_: function onRenderStart_() {},
			addEntity: function addEntity(json) {
				var arr = this.model.data.collection;
				if (arr == null) {
					arr = this.model.data.collection = [];
				}
				arr.push(json);
			},
			updateEntity: function updateEntity(json) {
				var original = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				var arr = this.model.data.collection;
				if (arr == null) {
					arr = this.model.data.collection = [json];
					return;
				}
				var i = -1;
				if (original != null) {
					i = arr.indexOf(original);
				}

				if (i === -1 && json.id !== void 0) {
					var x = arr.find(function (x) {
						return x.id === json.id;
					});
					i = arr.indexOf(x);
				}
				if (i === -1 && json.name !== void 0) {
					var x = arr.find(function (x) {
						return x.name === json.name;
					});
					i = arr.indexOf(x);
				}
				arr.splice(i, 1, json);
			},
			removeEntity: function removeEntity(json) {
				var arr = this.model.data.collection,
				    i = arr.indexOf(json);
				arr.splice(i, 1);
			},
			readQuery_: function readQuery_() {
				var _this = this;

				if (typeof ruta == 'undefined' || this.xEnableRuta !== true) {
					return;
				}
				var query = ruta._.query.get();
				if (query == null) {
					return;
				}
				read(this.xQueryPageNum, function (val) {
					return _this.model.pageNum = val;
				});
				read(this.xQueryPageSize, function (val) {
					return _this.model.pageSize = val;
				});

				for (var key in query) {
					if (key === this.xQueryPageNum || key === this.xQueryPageSize) {
						continue;
					}
					if (this.filterQuery == null) {
						this.filterQuery = {};
					}
					this.filterQuery[key] = query[key];
				}

				function read(name, setter) {
					var val = query[name];
					if (val == null) return;

					val = parseInt(val);
					if (isNaN(val)) {
						return;
					}
					setter(val);
				}
			},
			activity_: function activity_(diff) {
				this.aDataset.activity(diff);
			},
			load_: function load_() {
				var _this2 = this;

				this.activity_(1);

				var query = this.createQuery_();
				if (this.filterQuery) {
					for (var key in this.filterQuery) {
						query[key] = this.filterQuery[key];
					}
				}

				if (typeof ruta !== 'undefined' && this.xEnableRuta) {
					ruta.navigate(query, { extend: true });
				}
				return $.getJSON(this.xEndpoint, query).done(function (page) {
					_this2.setData_(page);
					_this2.activity_(-1);
				});
			},
			createQuery_: function createQuery_() {
				return {};
			},
			setData_: function setData_(json) {
				throw Error('Not Implemented');
			}
		};
		// end:source ./IDataProvider.es6
		// source ./Model.es6
		'use strict';

		var ModelDataProvider = Compo({
			aDataset: null,
			onRenderStart: function onRenderStart(model) {

				var arr = mask.Utils.Expression.eval(this.expression, model);
				this.model = {
					data: {
						collection: arr
					}
				};
				this.aDataset = this.closest('a:dataset');
				this.aDataset.data = this.model.data;
			},
			addEntity: function addEntity(json) {
				var arr = this.model.data.collection;
				if (arr) arr.push(json);
			}
		});

		mask.registerHandler(DatasetCompo, 'Model', ModelDataProvider);
		// end:source ./Model.es6
		// source ./Pager.es6
		'use strict';

		function _defineProperty(obj, key, value) {
			if (key in obj) {
				Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
			} else {
				obj[key] = value;
			}return obj;
		}

		var PagerDataProvider = Compo(IDataProvider, {

			template: '\n\t\t// source Pager.mask\n\t\t@placeholder;\n\t\t\n\t\t.a-dataset-pager {\n\t\t\ti.glyphicon.glyphicon-road;\n\t\t\t.shadow-z-1 {\n\t\t\t\tstyle scoped {\n\t\t\t\t\t:host {\n\t\t\t\t\t\tdisplay: inline;\n\t\t\t\t\t\tmargin: 0px 10px;\n\t\t\t\t\t\tpadding: 10px 20px;\n\t\t\t\t\t\tbackground: white;\n\t\t\t\t\t\tcolor: gray;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t+if (activity === 0) {\n\t\t\t\t\n\t\t\t\t\tspan > +if (pageNum != 1) {\n\t\t\t\t\t\tbutton.btn.btn-sm x-tap=datasetPagePrev >\n\t\t\t\t\t\t\ti.glyphicon.glyphicon-arrow-left;\n\t\t\t\t\t}\n\t\t\t\t\tspan > b > \' ~[bind: pageNum]/~[bind: pageTotal]\'\n\t\t\t\n\t\t\t\t\tspan > +if (isLastPage != true) {\n\t\t\t\t\t\tbutton.btn.btn-sm x-tap=datasetPageNext >\n\t\t\t\t\t\t\ti.glyphicon.glyphicon-arrow-right;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\telse {\n\t\t\t\t\tbutton.btn.btn-sm > i.fa.fa-circle-o-notch.fa-spin;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t// end:source Pager.mask\n\t',
			attr: {
				id: 'provider'
			},
			filterQuery: null,
			meta: {
				attributes: {
					'page-num': {
						default: 1
					},
					'page-size': {
						default: 10
					},
					'query-page-num': 'page',
					'query-page-size': 'size',
					'prop-collection': 'collection',
					'prop-is-last': '',
					'prop-total': 'total'
				}
			},

			slots: {
				datasetPagePrev: function datasetPagePrev() {
					this.go_(-1);
				},
				datasetPageNext: function datasetPageNext() {
					this.go_(1);
				}
			},

			filter: function filter(query) {
				this.model.pageNum = 1;
				IDataProvider.filter.call(this, query);
			},

			aDataset: null,
			onRenderStart_: function onRenderStart_() {
				this.model = mask.obj.extend(this.model, {
					pageNum: this.xPageNum,
					pageSize: this.xPageSize,
					pageTotal: null,
					isLastPage: false
				});
			},
			go_: function go_(diff) {
				this.model.pageNum += diff;
				this.load_();
			},
			createQuery_: function createQuery_() {
				var _ref;

				return _ref = {}, _defineProperty(_ref, this.xQueryPageNum, this.model.pageNum), _defineProperty(_ref, this.xQueryPageSize, this.model.pageSize), _ref;
			},
			setData_: function setData_(page) {
				this.model.data.collection = page[this.xPropCollection];
				var isLast = false;
				if (this.xPropIsLast) {
					isLast = page[this.xPropIsLast];
				} else if (this.xPropTotal) {
					var current = this.model.pageNum * this.model.pageSize;
					if (current >= page[this.xPropTotal]) {
						isLast = true;
					}
				} else if (this.model.data.collection.length < this.xPageSize) {
					isLast = true;
				}

				this.model.pageTotal = Math.ceil(page[this.xPropTotal] / this.xPageSize);
				this.model.isLastPage = isLast;
			}
		});

		mask.registerHandler(DatasetCompo, 'Pager', PagerDataProvider);
		// end:source ./Pager.es6
		// source ./Collection.es6
		'use strict';

		var CollectionDataProvider = Compo(IDataProvider, {
			setData_: function setData_(arr) {
				this.model.data.collection = arr;
			}
		});

		mask.registerHandler(DatasetCompo, 'Collection', CollectionDataProvider);
		// end:source ./Collection.es6
	})();
	// end:source Provider/exports.es6
	// end:source compo/Dataset.es6

	mask.registerHandler('a:dataset', DatasetCompo);
});
// end:source /src/umd.es6