/*!
 * Dataset Component v%IMPORT(version)%
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, %IMPORT(year)% Atma.js and other contributors
 */
(function(root, factory){
	var _global = typeof global !== 'undefined' ? global : window,
		_mask = _global.mask || (_global.atma && _global.atma.mask); 
	
	if (_mask == null) {
		if (typeof require === 'function') {
			mask = require('maskjs');
		} else {
			throw Error('MaskJS was not loaded');
		}
	}
	
	factory(_global, _mask, _mask.Compo.config.getDOMLibrary());
	
}(this, function(global, mask, $){
	
	// import utils/obj.es6
	
	// import compo/Dataset.es6
	
	mask.registerHandler('a:dataset', DatasetCompo);
}));
