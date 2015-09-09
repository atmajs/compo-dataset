var PagerDataProvider = Compo(IDataProvider, {

	template: `
		// import Pager.mask
	`,
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
		this.model.pageNum = 1;
		IDataProvider.filter.call(this, query);
	},

	aDataset: null,
	onRenderStart_ () {
		this.model = mask.obj.extend(this.model, {
			pageNum: this.xPageNum,
			pageSize: this.xPageSize,
			pageTotal: null,
			isLastPage: false
		});
	},
	go_ (diff) {
		this.model.pageNum += diff;
		this.load_();
	},
	createQuery_ () {
		return {
			[this.xQueryPageNum ]: this.model.pageNum,
			[this.xQueryPageSize]: this.model.pageSize
		};
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
