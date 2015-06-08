var PagerDataProvider = Compo({
	
	template: `
		// import Pager.mask
	`,
	
	meta: {
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
			'prop-total'  : '',
		}
	},
	
	slots: {
		dataPagePrev () {
			this.go_(-1);
		},
		datePageNext () {
			this.go_(1);
		}
	},
	
	aDataset: null,
	onRenderStart (model, ctx, container, ctr) {
		this.model = {
			collection: null,
			pageNum: this.xPageNum,
			pageSize: this.xPageSize,
			isLastPage: false,
		};
		this.aDataset = this.closest('a:dataset');		
		this.load_();
	},
	go_ (diff) {
		this.model.pageNum += diff;
		this.load_();
	},
	load_ () {
		this.aDataset.activity(1);
		return $
			.getJSON(this.xEndpoint, {
				[this.xQueryPageNum ]: this.model.pageNum,
				[this.xQueryPageSize]: this.model.pageSize
			})
			.done(page => {
				this.setData_(page);
				this.aDataset.activity(-1);
			});
	},
	setData_ (page) {
		this.model.collection = page[this.xPropCollection];
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
		else if (this.model.collection.length < this.xPageSize) {
			isLast = true;
		}
		this.model.isLastPage = isLast;
	}
	
});

mask.registerHandler(DatasetCompo, 'Pager', PagerDataProvider);
