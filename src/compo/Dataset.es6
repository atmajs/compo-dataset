var DatasetCompo = mask.Compo({
	tagName: 'div',
	meta: {
		template: 'merge'
	},
	attr: {
		style: 'position: relative;'
	},
	
	slots: {
		datasetItemRemove (event) {
			var model = $(event.target).model();
				
			this
				.find('Confirmation')
				.confirm('remove', model)
				.done(() => {
					var arr = this.data.collection;
					var i   = arr.indexOf(model);
					arr.splice(i, 1);
				});
		},
		datasetItemEdit (event) {
			var model = $(event.target).model();
			this.find('Editor').edit(model);
		},
		datasetItemNew (event) {
			var model = this.createDataItem();			
			this
				.find('Editor')
				.edit(model)
				.done(json => {
					this.data.collection.push(json);
				})
		}
	},
	
	onRenderStart (model, ctx, container) {
		jmask(this).prepend('Activity; Confirmation;');
		this.ensureDataProvider_();
	},
	
	createDataItem () {
		return {};
	},
	
	ensureDataProvider_ () {
		if (this.xEndpoint == null) {
			return;
		}
		jmask(this).prepend('ModelDataProvider');
	},
});


var Template = `
	// import Activity.mask
	// import Confirmation.mask
	// import Dialog.mask
`;

mask.registerFromTemplate(Template, DatasetCompo);

// import Table.es6
// import Editor.es6
// import ./provider/Model.es6
// import ./provider/Pager.es6
