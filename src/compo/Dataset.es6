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

			var onComfirm = () => {
				this
					.find('Editor')
					.remove(model)
					.done(onRemove)
					.fail(onError)
			};
			var onRemove = () => {
				this
					.find('#provider')
					.removeEntity(model)
					;
			};
			var onError = (error) => {
				alert('Error ' + error.message);
			};
			this
				.find('Confirmation')
				.confirm('remove', model)
				.done(onComfirm);
		},
		datasetItemEdit (event) {
			var compo = $(event.target).compo();
			var model = this.cloneDataItem(compo.model);
			this
				.find('Editor')
				.edit(model, compo)
				.done(json => {
					var provider = this.find('#provider');
					if (provider.updateEntity) {
						provider.updateEntity(json);
					}
				});
		},
		datasetItemNew (event) {
			var model = this.createDataItem();
			this
				.find('Editor')
				.edit(model)
				.done(json => {
					var provider = this.find('#provider');
					if (provider.addEntity) {
						provider.addEntity(json);
					}
				})
		}
	},

	filter (query) {
		var provider = this.find('#provider');
		if (provider.filter) {
			provider.filter(query);
		}
	},

	activity (diff) {
		this.emitIn('datasetActivity', diff);
	},

	onRenderStart (model, ctx, container) {
		jmask(this).append('Activity; Confirmation;');
		this.ensureDataProvider_();
	},

	createDataItem () {
		var provider = this.find('#provider');
		var obj = mask.obj.get(provider, 'model.data.collection.0') || {};
		return obj_createInstance(obj);
	},

	cloneDataItem (model) {
		return obj_clone(model);
	},

	ensureDataProvider_ () {
		if (this.xEndpoint == null) {
			return;
		}
		jmask(this).prepend('ModelDataProvider');
	},
});

mask.registerFromTemplate(`
	// import Controls/Activity.mask
	// import Controls/Confirmation.mask
	// import Controls/Dialog.mask
	// import Controls/Inline.mask
	// import Controls/Table.mask
	// import Controls/List.mask
`, DatasetCompo);

// import Components/Editor.es6
// import Provider/exports.es6
