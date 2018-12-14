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
    global.ConfigControl = factory();
  }
}(this, function() {
  "use strict";

  var control = function() {

    var textFile = null;
    function makeTextFile(text) {
        var data = new Blob([text], {
          type: 'text/plain'
        });

        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);
        return textFile;
      };

      /////////////////// backup //////////////////////////////
      function initBackupLink() {
        var backup = document.getElementById('backupData');
        backup.addEventListener('click', function() {
          var data = {};
          data['memo'] = localStorage.memo;
          data['schedule'] = localStorage.schedule;
          data['calendar'] = localStorage.calendar;
          var link = document.createElement('a');
          link.setAttribute('download', 'backup.' + moment(new Date()).utcOffset('+0900').format('YYYYMMDD_HHmmss') + '.data');
          link.href = makeTextFile(JSON.stringify(data));
          document.body.appendChild(link);

          window.requestAnimationFrame(function() {
            var event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
          });
        }, false);
      };

      /////////////////// apply //////////////////////////////
      function initApplyLink() {
        var file = document.getElementById('fileInput');
        file.addEventListener('change', function(evt) {
          var r = new FileReader();
          r.readAsText(evt.target.files[0]);
          r.onloadend = function() {
            if (window.confirm("apply data file?")) {
              var data = JSON.parse(r.result);
              for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                  console.log(prop);
                  localStorage[prop] = data[prop];

                }
              }
              location.href = location.href;
            }
          }
        }, false);
      };

      /////////////////// delete old calendar data ////////////////////////
      function initDeleteOldDataLink() {
        var deleteOld = document.getElementById('deleteOldData');
        deleteOld.addEventListener('click', function() {
          if (window.confirm("delete calendar data?(before 6 month)")) {
            if (localStorage.schedule) {
              var ss = JSON.parse(localStorage.schedule);
              var deleteBefore = new moment().add(-6, 'month');
              for (var i = 0; i < ss.length; i++) {
                var s = ss[i];
                var start = new moment(s.start);
                var end = new moment(s.end);
                if (deleteBefore.isAfter(start) && deleteBefore.isAfter(end)) {
                  ss.splice(i, 1);
                  i = i - 1;
                }
                localStorage.schedule = JSON.stringify(ss);
              }
            }
          }
        }, false);
      };

      function initConfigChangeLink() {
        $('#changeButton').click(function() {
          var k = $("#configKey").val();
          var v = $("#configValue").val();
          if (k && v) {
            StorageControl(":calendar:id=" + k + ":name=" + v);
            $("#configKey").val("");
            $("#configValue").val("");
          }
        });
      }

      function init() {
        initBackupLink();
        initApplyLink();
        initDeleteOldDataLink();
        initConfigChangeLink();

        $("#fileInput").hide();
        $("#applyData").click(function() {
          $("#fileInput").toggle();
        });
      };

    return {
      init: init
    };
  };
  return control;
}));
