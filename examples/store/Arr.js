var Arr = module.exports = {
	collection: [],
	reset: reset,
	getById: getById,
	remove: remove,
	filter: function(filter){
		if (filter === 'even') {
			return Arr.collection.filter(function(x){
				return +x.number % 2 === 0
			});
		}
		return Arr.collection;
	}
};
var count = 12, index = 0;

function reset () {
	index = -1;
	var arr = Arr.collection = [];
	for(var i = 0; i < count; i++) {
		create(i+1);
	}
}
function getById(id){
	return Arr.collection.filter(function(x){
		return x.id === id
	})[0];
}
function create(number){
	var obj = {
		number: number + '',
		id: ++index
	};
	Arr.collection.push(obj);
	return obj;
}
function remove(id){
	var obj = getById(id);
	var i = Arr.collection.indexOf(obj);
	if (i === -1) return;
	Arr.collection.splice(i, 1);
}

reset();