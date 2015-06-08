(function () {
	
	var Editor = mask.Compo(mask.class.Deferred, {
		tagName: 'div',
		meta: {
			mode: 'client',
			template: 'merge',
		},
		
		attr: {
			class: 'a-dataset-editor'
		},
		compos: {
			form: 'compo: a:form'
		},
		slots: {
			'complete' (sender, json) {
				this.resolve(json);
			}
		},
		onRenderStart (model, ctx, container, parent) {
			this.model = null;
		},
		onRenderEnd () {
			if (this.compos.form == null) {
				console.warn('Dataset Component. When using `Editor`, it must contain `a:form` component');
			}
		},
		
		edit (model) {
			this.defer();
			this.compos.form.setEntity(model);
			this.emitIn('datasetEditorOpen');
			return this;
		}
	});

	mask.registerHandler(DatasetCompo, 'Editor', Editor);
}());
