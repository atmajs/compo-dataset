// source /src/umd.es6
"use strict";

(function (root, factory) {
	var _global = typeof global !== "undefined" ? global : window,
	    _mask = _global.mask || _global.atma && _global.atma.mask;

	if (_mask == null) {
		if (typeof require === "function") {
			mask = require("maskjs");
		} else {
			throw Error("MaskJS was not loaded");
		}
	}

	factory(_global, _mask, _mask.Compo.config.getDOMLibrary());
})(undefined, function (global, mask, $) {

	// source utils/obj.es6
	"use strict";

	var obj_toFlatObject, obj_getType;
	(function () {

		obj_getType = function (obj) {
			return Object.prototype.toString.call(obj).replace("[object ").replace("]");
		};
		obj_toFlatObject = function (mix, prefix) {
			var out = arguments[2] === undefined ? {} : arguments[2];

			if (mix == null) return out;

			var type = _getType(mix);

			if ("Array" === type) {
				mix.forEach(function (x, i) {
					obj_toFlatObject(x, prefix + "[" + i + "]", out);
				});
				return out;
			}

			if ("Object" === type) {
				if (prefix) prefix += ".";

				var key, x, prop;
				for (key in mix) {
					x = mix[key];
					prop = prefix + key;

					if (x == null) continue;

					var type = _getType(x);
					switch (type) {
						case "Object":
						case "Array":
							obj_toFlatObject(x, prop, out);
							continue;
						case "String":
						case "Number":
						case "Boolean":
						case "Blob":
							if (prop in out) {
								console.warn("ToFormData: Overwrite property", prop);
							}
							out[prop] = x;
							continue;
						default:
							console.error("Possible type violation", type);
							out[prop] = x;
							continue;
					}
				}
				return out;
			}

			switch (type) {
				case "String":
				case "Number":
				case "Boolean":
				case "Blob":
					break;
				default:
					console.error("Possible type violation", type);
					break;
			}

			if (prefix in out) {
				console.warn("ToFormData: Overwrite property", prefix);
			}
			out[prefix] = mix;
			return out;
		};
	})();
	//# sourceMappingURL=obj.es6.map
	// end:source utils/obj.es6
	// source utils/form.es6
	"use strict";

	var form_append;
	(function () {
		form_append = function (form, mix) {
			var name = arguments[2] === undefined ? "" : arguments[2];

			var data = obj_toFlatObject(mix, name);
			for (var key in data) {
				var filename = null;
				var val = data[key];

				if (typeof val === "object" && val.fileName) {
					filename = val.fileName;
				}
				if (filename != null) {
					form.append(key, val, filename);
					continue;
				}
				form.append(key, val);
			}
		};
	})();
	//# sourceMappingURL=form.es6.map
	// end:source utils/form.es6
	// source utils/compo.es6
	"use strict";

	var compo_walk;
	(function () {

		compo_walk = function (root, fn) {
			mask.TreeWalker.walk(root, function (compo) {
				if (compo === root) {
					return;
				}
				return fn(compo);
			});
		};
	})();
	//# sourceMappingURL=compo.es6.map
	// end:source utils/compo.es6

	// source class/Xhr.es6
	"use strict";

	var Xhr;
	(function () {
		/*
   * Events
   *  - start
   *  - error
   *  - progress ('load', percent) ('upload', percent)
   */
		Xhr = mask["class"].create(mask["class"].EventEmitter, mask["class"].Deferred, {
			constructor: function constructor(url, method) {
				this.url = url;
				this.method = method;

				this.xhr_ = null;
				this.loadPercent = 0;
				this.uploadPercent = 0;
				this.headers = {};
			},
			write: function write(data) {
				this.data = data;
				if (obj_getType(data) === "Object") {
					this.data = JSON.stringify(data);
				}
				return this;
			},
			writeHeaders: function writeHeaders(headers) {
				mask.obj.extend(this.headers, headers);
				return this;
			},
			setEndpoint: function setEndpoint(url, method) {
				this.url = url;
				this.method = method;
				return this;
			},
			isBusy: function isBusy() {
				return this.xhr_ != null;
			},
			loading_: function loading_(percent) {
				this.emit("progress", "load", this.loadPercent = percent);
			},
			uploading_: function uploading_(percent) {
				this.emit("progress", "upload", this.uploadPercent = percent);
			},
			readResponse_: function readResponse_(fn) {
				var xhr = this.xhr_;
				var response = xhr.responseText || "";
				var type = xhr.getResponseHeader("content-type");
				if (type == null) {
					return fn(Error("Content-Type not set"));
				}
				if (/json/i.test(type)) {
					try {
						response = JSON.parse(response);
					} catch (error) {
						return fn(Error("Json response malformed: " + String(error)));
					}
				}

				if (xhr.status === 200) {
					return fn(null, response);
				}
				return fn(this.toError_(xhr, response));
			},
			toError_: function toError_(xhr, resp) {
				var status = xhr.status,
				    message = xhr.responseText || xhr.statusText;
				if (resp != null && typeof resp === "object") {
					status = resp.status || status;
					message = resp.message || resp.error || message;
				}
				return new HttpError(message, status);
			},
			complete_: function complete_(error, data) {
				this.loading_(100);
				this.xhr_ = null;
				if (error) {
					this.emit("error", error);
					this.reject(error);
					return;
				}
				this.emit("complete", data);
				this.resolve(data);
			},

			send: function send() {
				var _this = this;

				if (this.isBusy()) {
					throw Error("Request is not reusable");
				}

				var xhr = this.xhr_ = new XMLHttpRequest();
				xhr.onload = function () {
					_this.readResponse_(function (error, data) {
						return _this.complete_(error, data);
					});
				};

				if (xhr.upload) {
					xhr.upload.onprogress = function (event) {

						if (event.lengthComputable) {
							var loaded = event.loaded,
							    total = event.total,
							    percent = event.loaded / event.total * 100 | 0;
							_this.uploading_(percent);
							return;
						}
						if (_this.uploadPercent < 90) {
							_this.uploading_(_this.uploadPercent + 10);
							return;
						}
						_this.uploading_(100);
					};
				}

				xhr.open(this.method, this.url);

				for (var key in this.headers) {
					xhr.setRequestHeader(key, this.headers[key]);
				}

				this.emit("start");
				xhr.send(this.data);
				return this;
			}
		});
	})();
	//# sourceMappingURL=Xhr.es6.map
	// end:source class/Xhr.es6
	// source class/Actor.es6
	"use strict";

	var IActor = mask["class"].create({
		run: function run(name) {
			var _this = this;

			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			this.error = null;

			var actions = this[name],
			    result;

			args.unshift(this);
			actions.forEach(function (x) {
				if (_this.error) {
					return;
				}
				result = _this.perform(x, args);
			});
			return result;
		},
		perform_: function perform_(mix, args) {
			var fn = typeof mix === "string" ? this[mix] : mix;
			try {
				return fn.apply(null, args);
			} catch (error) {
				this.error = error;
				this.throw_(error);
			}
		},
		throw_: function throw_(error) {
			throw error;
		}
	});
	//# sourceMappingURL=Actor.es6.map
	// end:source class/Actor.es6
	// source class/Message.es6
	"use strict";

	var Message = mask["class"].create(Object.defineProperties({
		body: null,
		headers: null,
		method: "POST",
		endpoint: window.location.href,
		contentType: "application/json",

		constructor: function constructor(body) {
			var params = arguments[1] === undefined ? {} : arguments[1];

			this.body = body;
			this.headers = params.headers;

			if (params.endpoint) this.endpoint = params.endpoint;
			if (params.method) this.method = params.method;
			if (params.contenType) this.contentType = params.contentType;
		},
		serializeHeaders: function serializeHeaders() {
			var obj = {
				"Content-Type": this.contentType
			};
			return mask.obj.extend(obj, this.headers);
		},
		serialize: function serialize() {
			if (/form-data/i.test(this.contentType)) {
				return this.formData;
			}
			return JSON.stringify(this.body);
		}
	}, {
		formData: {
			get: function get() {
				var form = new global.FormData();
				form_append(form, this.body);
				return form;
			},
			configurable: true,
			enumerable: true
		}
	}));
	//# sourceMappingURL=Message.es6.map
	// end:source class/Message.es6
	// source class/ValidationError.es6
	"use strict";

	var ValidationError = mask["class"].createError("ValidationError", {
		constructor: function constructor(error) {
			if (error != null && typeof error === "object") {
				this.message = error.message || error.error || String(error);
			}
		},
		message: ""
	});
	//# sourceMappingURL=ValidationError.es6.map
	// end:source class/ValidationError.es6
	// source class/HttpError.es6
	"use strict";

	var HttpError = mask["class"].createError("HttpError", {
		status: 500,
		message: "",
		constructor: function constructor(message, status) {
			this.status = status;
			this.message = message;
		}
	});
	//# sourceMappingURL=HttpError.es6.map
	// end:source class/HttpError.es6

	// source partial/Transport.es6
	"use strict";

	var Transport;
	(function () {
		Transport = {
			getJson: function getJson(url) {
				return new Xhr(url, "GET").send();
			},
			upload: function upload(message) {
				var endpoint = message.endpoint;
				var method = message.method;

				var body = message.serialize();

				var xhr = new Xhr(endpoint, method);

				return xhr.write(message.serialize()).writeHeaders(message.serializeHeaders()).send();
			}
		};
	})();
	//# sourceMappingURL=Transport.es6.map
	// end:source partial/Transport.es6
	// source partial/Validation.es6
	"use strict";

	var Validation;
	(function () {
		Validation = {
			process: function process(formCompo) {
				var error;
				compo_walk(formCompo, function (compo) {

					var name = compo.compoName;
					if (name === ":dualbind" || name === "dualbind") {
						error = compo.provider.validate();
						if (error) {
							return { "break": true };
						}
					}

					var fn = compo.validateUi || compo.validate;
					if (fn != null) {
						error = fn.call(compo);
						if (error) {
							return { "break": true };
						}
					}
				});
				return error;
			}
		};
	})();
	//# sourceMappingURL=Validation.es6.map
	// end:source partial/Validation.es6
	// source partial/Builder.es6
	"use strict";

	var Builder;
	(function () {
		Builder = {
			createMessage: function createMessage(formCompo) {
				var params = arguments[1] === undefined ? {} : arguments[1];

				var body = getJson(formCompo),
				    contentType = params.contentType || formCompo.xContenType,
				    endpoint = params.action || formCompo.xAction,
				    method = params.method || formCompo.xMethod;

				return new Message(body, {
					contentType: contentType,
					endpoint: endpoint,
					method: method
				});
			}
		};

		function getJson(formCompo) {
			var model = formCompo.model;
			var data = mask.obj.extend({}, model);

			compo_walk(formCompo, function (compo) {
				var fn = compo.toJson || compo.toJSON;
				if (fn) {
					var json = fn.call(compo);
					mask.obj.extend(data, json);
					return { deep: false };
				}
			});
			return data;
		}
	})();
	//# sourceMappingURL=Builder.es6.map
	// end:source partial/Builder.es6

	// source compo/Dataset.es6
	"use strict";

	var DatasetCompo = mask.Compo({
		tagName: "div",
		meta: {
			template: "merge"
		},
		attr: {
			style: "position: relative;"
		},

		slots: {
			datasetItemRemove: function datasetItemRemove(event) {
				var _this = this;

				var model = $(event.target).model();

				this.find("Confirmation").confirm("remove", model).done(function () {
					var arr = _this.data.collection;
					var i = arr.indexOf(model);
					arr.splice(i, 1);
				});
			},
			datasetItemEdit: function datasetItemEdit(event) {
				var model = $(event.target).model();
				this.find("Editor").edit(model);
			},
			datasetItemNew: function datasetItemNew(event) {
				var _this = this;

				var model = this.createDataItem();
				this.find("Editor").edit(model).done(function (json) {
					_this.data.collection.push(json);
				});
			}
		},

		filter: function filter(query) {
			var provider = this.find("#provider");
			if (provider && provider.filter) {
				provider.filter(query);
			}
		},

		activity: function activity(diff) {
			this.emitIn("datasetActivity", diff);
		},

		onRenderStart: function onRenderStart(model, ctx, container) {
			jmask(this).prepend("Activity; Confirmation;");
			this.ensureDataProvider_();
		},

		createDataItem: function createDataItem() {
			return {};
		},

		ensureDataProvider_: function ensureDataProvider_() {
			if (this.xEndpoint == null) {
				return;
			}
			jmask(this).prepend("ModelDataProvider");
		} });

	mask.registerFromTemplate("\n\t// source Controls/Activity.mask\n\tlet Activity as (div.a-dataset-activity) {\n\t\t\n\t\tvar activity = 0;\n\t\t\n\t\tslot datasetActivity (sender, diff) {\n\t\t\tvar count = this.scope.activity + diff;\n\t\t\tif (count < 0) count = 0;\n\t\t\tthis.scope.activity = count;\n\t\t}\n\t\t\n\t\tstyle {\n\t\t\t.a-dataset-activity-backdrop {\n\t\t\t\tposition: absolute;\n\t\t\t\t\n\t\t\t\ttop:0;\n\t\t\t\tleft:0;\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tbackground: rgba(255,255,255, .8);\n\t\t\t\tz-index: 100;\n\t\t\t}\n\t\t\t.a-dataset-activity-spinner {\n\t\t\t\twidth: 40px;\n\t\t\t\theight: 40px;\n\t\t\t  \n\t\t\t\tposition: relative;\n\t\t\t\tmargin: auto;\n\t\t\t}\n\t\t\t.a-dataset-activity-bounce1, .a-dataset-activity-bounce2 {\n\t\t\t\twidth: 100%;\n\t\t\t\theight: 100%;\n\t\t\t\tborder-radius: 50%;\n\t\t\t\tbackground-color: #27ae60;\n\t\t\t\topacity: 0.6;\n\t\t\t\tposition: absolute;\n\t\t\t\ttop: 0;\n\t\t\t\tleft: 0;\t\t\t\n\t\t\t\t-webkit-animation: bounce 2.0s infinite ease-in-out;\n\t\t\t\tanimation: bounce 2.0s infinite ease-in-out;\n\t\t\t}\t\t\n\t\t\t.a-dataset-activity-bounce2 {\n\t\t\t\t-webkit-animation-delay: -1.0s;\n\t\t\t\tanimation-delay: -1.0s;\n\t\t\t}\n\t\t\t\n\t\t\t@-webkit-keyframes bounce {\n\t\t\t\t0%, 100% { -webkit-transform: scale(0.0) }\n\t\t\t\t50% { -webkit-transform: scale(1.0) }\n\t\t\t}\n\t\t\t\n\t\t\t@keyframes bounce {\n\t\t\t\t0%, 100% { \n\t\t\t\t\ttransform: scale(0.0);\n\t\t\t\t\t-webkit-transform: scale(0.0);\n\t\t\t\t} 50% { \n\t\t\t\t\ttransform: scale(1.0);\n\t\t\t\t\t-webkit-transform: scale(1.0);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t\n\t\t+if ($scope.activity > 0) {\t\t\n\t\t\t.a-dataset-activity-backdrop >\n\t\t\t\t.a-dataset-activity-spinner {\n\t\t\t\t\t.a-dataset-activity-bounce1;\n\t\t\t\t\t.a-dataset-activity-bounce2;\n\t\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/Activity.mask\n\t// source Controls/Confirmation.mask\n\tlet Confirmation {\n\t\t\n\t\tfunction confirm(type, model) {\n\t\t\tvar compo = this;\n\t\t\treturn mask.class.Deferred.run(function(resolve, reject){\n\t\n\t\t\t\tvar msg = compo.getMessage_(type, model);\n\t\t\t\tvar confirmed = confirm(msg);\n\t\n\t\t\t\tif (confirmed) {\n\t\t\t\t\treturn resolve();\n\t\t\t\t}\n\t\t\t\treject();\n\t\t\t});\n\t\t}\n\t\n\t\tfunction getMessage_(type, model) {\n\t\t\tif ('remove' === type)\n\t\t\t\treturn 'Are you sure to remove the item?';\n\t\t}\n\t\t\n\t}\n\t// end:source Controls/Confirmation.mask\n\t// source Controls/Dialog.mask\n\tlet Dialog {\n\t\t\n\t\tfunction show () {\n\t\t\tthis.$.modal('show');\n\t\t}\n\t\tfunction hide () {\n\t\t\tthis.$.modal('hide');\n\t\t}\n\t\t\n\t\tslot datasetEditorOpen () {\n\t\t\tthis.show();\n\t\t\treturn false;\n\t\t}\n\t\t\n\t\tslot datasetEditorClose () {\n\t\t\tthis.hide();\n\t\t\treturn false;\n\t\t}\n\t\t\n\t\tslot complete () {\n\t\t\tthis.hide();\n\t\t}\n\t\t\n\t\t.modal.fade > .modal-dialog.modal-lg > .modal-content {\n\t\t\t\t.modal-header {\n\t\t\t\t\t\n\t\t\t\t\tbutton.close data-dismiss= modal > span > 'x';\n\t\t\t\t\th4 .modal-title {\n\t\t\t\t\t\t' ' @title;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t@body > .modal-body style='position:relative; height:@attr.height' > @placeholder;\n\t\t\t\t.modal-footer {\n\t\t\t\t\t@footer;\n\t\t\t\t}\n\t\t\t}\n\t}\n\t// end:source Controls/Dialog.mask\n\t// source Controls/Table.mask\n\tlet Table {\n\t\t\n\t\tlet Item {\n\t\t\ttr {\n\t\t\t\t@each (row) {\n\t\t\t\t\ttd > @placeholder;\n\t\t\t\t}\n\t\t\t\ttd {\n\t\t\t\t\t@if (actions) {\n\t\t\t\t\t\t@actions;\n\t\t\t\t\t}\n\t\t\t\t\t@else {\n\t\t\t\t\t\ta .btn.btn-sm title='Edit'   x-tap=datasetItemEdit   > i.glyphicon.glyphicon-pencil;\n\t\t\t\t\t\ta .btn.btn-sm title='Remove' x-tap=datasetItemRemove > i.glyphicon.glyphicon-trash;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t\n\t\ttable.table.table-striped.table-hover {\n\t\t\tthead > tr {\n\t\t\t\t@each (head) {\n\t\t    \t\tth > @placeholder;\n\t\t    \t}\n\t\t\t\tth > ''\n\t\t    }\n\t\t    tbody {\n\t\t    \t+each(data.collection) > @template;\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/Table.mask\n", DatasetCompo);

	// source Components/Editor.es6
	"use strict";

	(function () {

		var Editor = mask.Compo(mask["class"].Deferred, {
			tagName: "div",
			meta: {
				mode: "client",
				template: "merge" },

			attr: {
				"class": "a-dataset-editor"
			},
			compos: {
				form: "compo: a:form"
			},
			slots: {
				complete: function complete(sender, json) {
					this.resolve(json);
				}
			},
			onRenderStart: function onRenderStart(model, ctx, container, parent) {
				this.model = {};
			},
			onRenderEnd: function onRenderEnd() {
				if (this.compos.form == null) {
					console.warn("Dataset Component. When using `Editor`, it must contain `a:form` component");
				}
			},

			edit: function edit(model) {
				this.defer();
				this.compos.form.setEntity(model);
				this.emitIn("datasetEditorOpen");
				return this;
			}
		});

		mask.registerHandler(DatasetCompo, "Editor", Editor);
	})();
	//# sourceMappingURL=Editor.es6.map
	// end:source Components/Editor.es6
	// source Provider/Model.es6
	"use strict";

	var ModelDataProvider = Compo({
		aDataset: null,
		onRenderStart: function onRenderStart(model) {

			var arr = mask.Utils.Expression.eval(this.expression, model);
			this.model = {
				data: {
					collection: arr
				}
			};
			this.aDataset = this.closest("a:dataset");
			this.aDataset.data = this.model.data;
		}

	});

	mask.registerHandler(DatasetCompo, "Model", ModelDataProvider);
	//# sourceMappingURL=Model.es6.map
	// end:source Provider/Model.es6
	// source Provider/Pager.es6
	"use strict";

	var _defineProperty = function _defineProperty(obj, key, value) {
		return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
	};

	var PagerDataProvider = Compo({

		template: "\n\t\t// source Pager.mask\n\t\t@placeholder;\n\t\t\n\t\t.a-dataset-pager {\n\t\t\ti.glyphicon.glyphicon-road;\n\t\t\t.shadow-z-1 {\n\t\t\t\tstyle scoped {\n\t\t\t\t\t:host {\n\t\t\t\t\t\tdisplay: inline;\n\t\t\t\t\t\tmargin: 0px 10px;\n\t\t\t\t\t\tpadding: 10px 20px;\n\t\t\t\t\t\tbackground: white;\n\t\t\t\t\t\tcolor: gray;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\t+if (activity === 0) {\n\t\t\t\t\n\t\t\t\t\tspan > +if (pageNum != 1) {\n\t\t\t\t\t\tbutton.btn.btn-sm x-tap=datasetPagePrev >\n\t\t\t\t\t\t\ti.glyphicon.glyphicon-arrow-left;\n\t\t\t\t\t}\n\t\t\t\t\tspan > b > ' ~[bind: pageNum]/~[bind: pageTotal]'\n\t\t\t\n\t\t\t\t\tspan > +if (isLastPage != true) {\n\t\t\t\t\t\tbutton.btn.btn-sm x-tap=datasetPageNext >\n\t\t\t\t\t\t\ti.glyphicon.glyphicon-arrow-right;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\telse {\n\t\t\t\t\tbutton.btn.btn-sm > i.fa.fa-circle-o-notch.fa-spin;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t// end:source Pager.mask\n\t",

		attr: {
			id: "provider"
		},
		filterQuery: null,
		meta: {
			template: "merge",
			attributes: {
				endpoint: "string",
				"page-num": {
					"default": 1
				},
				"page-size": {
					"default": 10
				},
				"query-page-num": "page",
				"query-page-size": "size",
				"prop-collection": "collection",
				"prop-is-last": "",
				"prop-total": "total" }
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
					collection: null },
				pageNum: this.xPageNum,
				pageSize: this.xPageSize,
				pageTotal: null,
				isLastPage: false,
				activity: 0 };

			this.aDataset = this.closest("a:dataset");
			this.readQuery_();
			this.load_();
		},
		readQuery_: function readQuery_() {
			var _this = this;

			if (typeof ruta == "undefined") {
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

			function read(name, setter) {
				var val = query[name];
				if (val == null) {
					return;
				}val = parseInt(val);
				if (isNaN(val)) {
					return;
				}
				setter(val);
			}
		},
		go_: function go_(diff) {
			this.model.pageNum += diff;
			this.load_();
		},
		activity_: function activity_(diff) {
			//- this.model.activity += diff;
			this.aDataset.activity(diff);
		},
		load_: function load_() {
			var _this = this;

			this.activity_(1);

			var query = (function () {
				var _query = {};

				_defineProperty(_query, _this.xQueryPageNum, _this.model.pageNum);

				_defineProperty(_query, _this.xQueryPageSize, _this.model.pageSize);

				return _query;
			})();
			if (this.filterQuery) {
				for (var key in this.filterQuery) {
					query[key] = this.filterQuery[key];
				}
			}

			if (typeof ruta !== "undefined") {
				ruta.navigate(query, { extend: true });
			}
			return $.getJSON(this.xEndpoint, query).done(function (page) {
				_this.setData_(page);
				_this.activity_(-1);
			});
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

	mask.registerHandler(DatasetCompo, "Pager", PagerDataProvider);
	//# sourceMappingURL=Pager.es6.map
	// end:source Provider/Pager.es6
	//# sourceMappingURL=Dataset.es6.map
	// end:source compo/Dataset.es6

	mask.registerHandler("a:dataset", DatasetCompo);
});
//# sourceMappingURL=umd.es6.map
// end:source /src/umd.es6