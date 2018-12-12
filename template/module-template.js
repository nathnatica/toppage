(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (global is window)
        global.sample = factory();
    }
}(this, function() {
    "use strict";

    var sample = function(func) {

		// codes are here !!!

    };
    return sample;
}));