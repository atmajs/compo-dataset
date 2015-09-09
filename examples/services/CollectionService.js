var Arr = require('../store/Arr');
var Srv = require('atma-server');

module.exports = Srv.HttpService({
	meta: {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
		}
	},
	'$get /': function(req, res){
		this.resolve(Arr.collection);
	},
	'$get /page': function(req, res, params){
		var page = +(params.page || 1),
			size = +(params.size || 3),
			filter = params.filter;

		var index = (page-1)*size;
		var end = index + size;

		var arr = Arr.filter(filter);

		this.resolve({
			total: arr.length,
			page: page,
			size: size,
			isLastPage: end >= arr.length,
			collection: arr.slice(index, index + size)
		});
	},
	'$put /:id': function(req, res, params){
		var obj = Arr.getById(parseInt(params.id));
		if (obj == null) {
			return this.reject('Not Found');
		}
		obj.number = req.body.number;
		this.resolve(obj);
	},
	'$delete /:id': function(req, res, params){
		Arr.remove(parseInt(params.id));
		this.resolve({status: 'ok'});
	},
	'$post /': function(req, res){
		var obj = Arr.create(params.number);
		this.resolve(obj);
	},
	'$post /reset': function(){
		Arr.reset();
		this.resolve({});
	}
});