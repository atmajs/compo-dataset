var PagerDataProvider = Compo({
	
	template: `
		// import Pager.mask
	`,
	
	attr: {
		id: 'provider'
	},
	filterQuery: null,
	meta: {
		template: 'merge',
		attributes: {
			'endpoint': 'string',
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
			'prop-total'  : 'total',
		}
	},
	
	slots: {
		datasetPagePrev () {
			this.go_(-1);
		},
		datasetPageNext () {
			this.go_(1);
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
		this.model.pageNum = 1;
		this.load_();
	},
	
	aDataset: null,
	onRenderStart (model, ctx, container, ctr) {
		this.model = {
			data: {
				collection: null,
			},
			pageNum: this.xPageNum,
			pageSize: this.xPageSize,
			pageTotal: null,
			isLastPage: false,
			activity: 0,
		};
		
		this.aDataset = this.closest('a:dataset');
		this.readQuery_();
		this.load_();
	},
	
	addEntity (json) {
		var arr = this.model.data.collection;
		if (arr) arr.push(json);
	},
	
	readQuery_ () {
		if (typeof ruta == 'undefined') {
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
	go_ (diff) {
		this.model.pageNum += diff;
		this.load_();
	},
	activity_ (diff) {
		//- this.model.activity += diff;
		this.aDataset.activity(diff);
	},
	load_ () {
		this.activity_(1);
		
		var query = {
			[this.xQueryPageNum ]: this.model.pageNum,
			[this.xQueryPageSize]: this.model.pageSize
		};
		if (this.filterQuery) {
			for (var key in this.filterQuery) {
				query[key] = this.filterQuery[key];
			}
		}
		
		if (typeof ruta !== 'undefined') {
			ruta.navigate(query, { extend: true});
		}
		return $
			.getJSON(this.xEndpoint, query)
			.done(page => {
				this.setData_(page);
				this.activity_(-1);
			});
	},
	setData_ (page) {
		this.model.data.collection = page[this.xPropCollection];
		var isLast = false;
		if (this.xPropIsLast) {
			isLast = page[this.xPropIsLast];
		}
		else if (this.xPropTotal) {
			var current = this.model.pageNum * this.model.pageSize;
			if (current >= page[this.xPropTotal]) {
				isLast = true;
			}
		}
		else if (this.model.data.collection.length < this.xPageSize) {
			isLast = true;
		}
		
		this.model.pageTotal = Math.ceil(page[this.xPropTotal] / this.xPageSize);
		this.model.isLastPage = isLast;
	}
	
});

mask.registerHandler(DatasetCompo, 'Pager', PagerDataProvider);
