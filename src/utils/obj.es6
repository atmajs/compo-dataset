var obj_createInstance,
	obj_getType;
(function(){
	
	obj_createInstance = function (obj) {
		if (obj.constructor !== Object && obj.constructor.length === 0) {
			return new (obj.constructor);
		}
		var out = {},
			key, val;
		for(key in obj) {
			val = obj[key];
			if (mask.is.Array(val)) {
				out[key] = [];
				continue;
			}
			if (mask.is.Object(val)) {
				out[key] = {};
				continue;
			}
			out[key] = null;
		}
		return out;
	};
}());