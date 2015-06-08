	
var ModelDataProvider = Compo({
	aDataset: null,
	onRenderStart (model) {
		
		var arr = mask.Utils.Expression.eval(this.expression, model);
		this.model = {
			data: {
				collection: arr
			}
		};
		this.aDataset = this.closest('a:dataset');
		this.aDataset.data = this.model.data;
	}
	
});

mask.registerHandler(DatasetCompo, 'Model', ModelDataProvider);