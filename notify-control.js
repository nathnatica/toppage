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
    global.NotifyControl = factory();
  }
}(this, function() {
  "use strict";

  var notify_control = function(func) {

    var notifyAddUnit = null;

    function addIfPassed(m, now, unit) {
        if (now.isAfter(m) && notifyAddUnit == null) {
          notifyAddUnit = unit;
        }
      };

      function notifyShow(title, m, now, style) {
        if (m.isAfter(now)) {
          var days = m.diff(now, 'days');
          var hours = m.diff(now, 'hours');
          var minutes = m.diff(now, 'minutes');

          if (days <= 10) {
            var truncated = m.startOf('day');
            var nowTruncated = moment().startOf('day');
            var diffDays = truncated.diff(nowTruncated, 'days');
            m.startOf('second');
            if (diffDays >= 1) {
              $.notify(title + " (" + diffDays + " days after)", style);
            } else if (hours >= 2) {
              var remainMinToHour = Math.trunc((minutes % 60) / 60 * 10);
              var remain = remainMinToHour > 0 ? "." + remainMinToHour : "";
              $.notify(title + " (" + hours + remain + " hours after)", "warn");
            } else if (minutes <= 120) {
              $.notify(title + " (" + minutes + " minutes after)", "error");
              notifyLoop(title, m, style);
            }
          }
        } else if (!now.isAfter(m)) {
          $.notify(title + " (now)", "error");
        }
      };

      function notifyLoop(title, m, style) {
        var timerId = window.setInterval(function() {
          var minutes = m.diff(moment(), 'minutes');
          if (minutes > 0) {
            $.notify(title + " (" + minutes + " minutes after)", style);
          } else {
            clearInterval(timerId);
          }
        }, 10 * 60 * 1000); // every 10 minutes
      };

      function init() {
        var now = moment();
        if (localStorage.schedule) {
          var ss = JSON.parse(localStorage.schedule);
          for (var i in ss) {
            var s = ss[i];
            var start = moment(s.start);
            var end = moment(s.end);
            if (now.isAfter(start) && start.date() != end.date()) {
              notifyShow(s.title, end, now, 'info');
            } else {
              notifyShow(s.title, start, now, 'info');
            }
          }
        }

        if (localStorage.memo) {
          var mm = JSON.parse(localStorage.memo);
          var todoMemo = mm[0].toString();
          var lines = todoMemo.split(/\r\n|\n|\r/gm);
          for (var j in lines) {
            var l = lines[j];

            var match1 = l.match(/\[\](.*)\(([0-9]{12})\)/);
            if (match1 != undefined) { // YYYYMMDDHHmm
              var title = match1[1];
              var time = match1[2];
              var m = moment(time, 'YYYYMMDDHHmm');
              notifyShow(title, m, now, 'success');
            }
            var match2 = l.match(/\[\](.*)\(([0-9\*]{1,2}) ([0-9\*]{1,2}) ([0-9\*]{1,2}) ([0-9\*]{1,2}) ([1-7\*]{1}) ([0-9\*]{1,4})\)/);
            if (match2 != undefined) {
              var title = match2[1];
              var minute = match2[2];
              var hour = match2[3];
              var date = match2[4];
              var month = match2[5];
              var dayOfWeek = match2[6];
              var year = match2[7];

              notifyAddUnit = null; // init

              var m = moment().startOf('minute');
              now = moment().startOf('minute');

              if (year != "*") {
                m.year(year);
                addIfPassed(m, now, 'year');
              }

              if (dayOfWeek != "*") { // 1-7 (Monday to Sunday)
                m.isoWeekday(Number(dayOfWeek));
                if (now.isAfter(m)) {
                  m.add(7, "day");
                }
              }

              if (month != "*") { // 0-11
                m.month(month - 1);
                addIfPassed(m, now, 'year');
              }

              if (date != "*") {
                m.date(date);
                addIfPassed(m, now, 'month'); // might be a problem (in case of day+1 and month+1)
              }

              if (hour != "*") {
                m.hours(hour);
                addIfPassed(m, now, 'day');
              }

              if (minute != "*") {
                m.minutes(minute);
                addIfPassed(m, now, 'hour');
              } else {
                m.minutes(0);
              }

              if (notifyAddUnit != null) {
                if (notifyAddUnit == "hour" && hour != "*") {
                  notifyAddUnit = "day";
                }
                if (notifyAddUnit == "day" && date != "*") {
                  notifyAddUnit = "month";
                }
                if (notifyAddUnit == "month" && month != "*") {
                  notifyAddUnit = "year";
                }
                m.add(1, notifyAddUnit);
              }

              console.log("NEXT MEMO SCHEDULE : " + title + "(" + m.local().format() + ")");

              notifyShow(title, m, now, 'success');
            }
          }
        }
      };

    return {
      init: init
    };
  };
  return notify_control;
}));
