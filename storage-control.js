(function(global, factory) {
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
    global.StorageControl = factory();
  }
}(this, function() {
  "use strict";

  var control = function(param) {

    var params = param.split(':');
    if (params.length == 4) {
      var prop = params[1];
      var condition = params[2];
      var setting = params[3];
      var conditions = condition.split("=");
      var values = setting.split("=");
      if (conditions.length == 2 && values.length == 2) {
        var condKey = conditions[0];
        var condVal = conditions[1];
        var valKey = values[0];
        var valVal = values[1];

        if (condKey && condVal && valKey && valVal) {
          if (localStorage && localStorage.hasOwnProperty(prop)) {
            var data = JSON.parse(localStorage[prop]);
            for (var i in data) {
              if (data[i][condKey] == condVal) {
                data[i][valKey] = valVal;
                localStorage[prop] = JSON.stringify(data);
                $.notify(param + " (config updated)", "success");
                return;
              }
            }
            var obj = {};
            obj[condKey] = condVal;
            obj[valKey] = valVal;
            data.push(obj);
            localStorage[prop] = JSON.stringify(data);
            $.notify(param + " (config registerd)", "success");
          } else if (localStorage) {
            var obj = {};
            obj[condKey] = condVal;
            obj[valKey] = valVal;
            localStorage[prop] = JSON.stringify([obj]);
            $.notify(param + " (config registerd)", "success");
          }
        } else {
          $.notify(param + " (failed)", "error");
        }
      }
    }
  };
  return control;
}));
