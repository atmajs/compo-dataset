var obj_createInstance,
	obj_getType,
	obj_clone;
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
	obj_clone = function(obj){
		var Ctor = obj.constructor;
		if (typeof Ctor.clone === 'function') {
			return Ctor.clone(obj);
		}
		if (typeof obj.clone === 'function') {
			return obj.clone();
		}
		var instance = Ctor !== Object && Ctor.length === 0
			? new Ctor
			: {};
		
		mask.obj.extend(instance, obj);
		return instance;
	};

}());