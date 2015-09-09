var CollectionDataProvider = Compo(IDataProvider, {

	setData_ (arr) {
		this.model.data.collection = arr;
	}

});

mask.registerHandler(DatasetCompo, 'Collection', CollectionDataProvider);
