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
		datasetFilter (sender, query) {
			this.filter(query);
		}
	},
	filter (query) {
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
	onRenderStart (model, ctx, container, ctr) {
		this.model = {
			data: {
				collection: null,
			},
			activity: 0,
		};
		this.aDataset = this.closest('a:dataset');
		this.onRenderStart_();
		this.readQuery_();
		this.load_();
	},
	onRenderStart_ () {

	},
	addEntity (json) {
		var arr = this.model.data.collection;
		if (arr == null) {
			arr = this.model.data.collection = [];
		}
		arr.push(json);
	},
	updateEntity (json, original = null) {
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
			var x = arr.find(x => x.id === json.id);
			i = arr.indexOf(x);
		}
		if (i === -1 && json.name !== void 0) {
			var x = arr.find(x => x.name === json.name);
			i = arr.indexOf(x);
		}
		arr.splice(i, 1, json);
	},
	removeEntity (json) {
		var arr = this.model.data.collection,
			i   = arr.indexOf(json);
		arr.splice(i, 1);
	},
	readQuery_ () {
		if (typeof ruta == 'undefined' || this.xEnableRuta !== true) {
			return;
		}
		var query = ruta._.query.get();
		if (query == null) {
			return;
		}
		read(this.xQueryPageNum,  val => this.model.pageNum  = val);
		read(this.xQueryPageSize, val => this.model.pageSize = val);

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
			if (val == null)
				return;

			val = parseInt(val);
			if (isNaN(val)) {
				return;
			}
			setter(val);
		}
	},
	activity_ (diff) {
		this.aDataset.activity(diff);
	},
	load_ () {
		this.activity_(1);

		var query = this.createQuery_();
		if (this.filterQuery) {
			for (var key in this.filterQuery) {
				query[key] = this.filterQuery[key];
			}
		}

		if (typeof ruta !== 'undefined' && this.xEnableRuta) {
			ruta.navigate(query, { extend: true});
		}
		return $
			.getJSON(this.xEndpoint, query)
			.done(page => {
				this.setData_(page);
				this.activity_(-1);
			});
	},
	createQuery_ () {
		return {}
	},
	setData_ (json) {
		throw Error('Not Implemented');
	}
};