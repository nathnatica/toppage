var MemoProcessIdx = {
  mediumPriorityMemoAddToIdx: 1000,
  moveMemoFromIndex: -1,
  modIndex: -1
};

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
    // global.MemoControl = factory();
  }
  global.MemoControl = factory();
}(this, function() {
  "use strict";

  var memo = function(func) {

    function appendMemo(i, s) {
        var lines = s.split(/\r\n|\n|\r/gm);

        var flagInfo = {};
        var m = getFlagInfo(i, s, lines, flagInfo);

        for (var j in lines) {
          if (lines[j].length > 80) {
            flagInfo["longLine"] = true;
          }
          makeMemoLink(lines[j], flagInfo);
          m = convertToDoItem(m, lines[j], i, j, flagInfo);
        }

        var html = "<div>" +
          getModDiv(i) +
          getHeadDiv(getHeadLine(lines[0], flagInfo), i) +
          getDelDiv(i, flagInfo) +
          "<hr>" +
          getMemoDivHead(flagInfo) +
          getMemoBody(m, flagInfo) +
          getSpaceDiv(i);
        return html;
      };

      function getSpaceDiv(i) {
        return "<div onclick='MemoControl().moveMemoTo(" + (i + 1) + ")' class='space'></div>"
      };

      function getFlagInfo(j, m, lines, flagInfo) {

        var rtn = m;

        if (rtn.length > 500) {
          flagInfo["longMemo"] = true;
        }

        if (lines[0].startsWith("#")) {
          var flagLine = lines.shift();
          var flags = flagLine.replace('#', '').split(/,/g);
          for (var i in flags) {
            flagInfo[flags[i]] = true;
            if (flags[i] == "lowp") { // low proprity memo
              MemoProcessIdx.mediumPriorityMemoAddToIdx = Math.min(MemoProcessIdx.mediumPriorityMemoAddToIdx, j);
            }
          }
          rtn = rtn.replace(/^#.+\n/, '');
        }

        if (lines[0].startsWith('*')) {
          flagInfo["headLine"] = true;
        }

        if (lines[0].startsWith('!')) {
          flagInfo["highLight"] = true;
        }
        return rtn;
      };

      function getMemoBody(m, flagInfo) {
        var b = m;
        if (flagInfo["headLine"]) {
          b = b.replace(/^\*.+\n/, '');
        }
        if (!flagInfo["todo"]) {
          b = b.replace(/>/g, "&gt;").replace(/</g, "&lt;");
        }
        return b.replace(/[\-]+\n/g, "</div><hr><div>").replace(new RegExp('\n', 'g'), '<br>') + "</div></div>";
      };

      function getMemoDivHead(flagInfo) {
        var rtn = "<div class='";

        if (flagInfo["longMemo"] || flagInfo["longLine"]) {
          rtn = rtn + "long ";
          if (flagInfo["longMemo"]) {
            rtn = rtn + "scroll ";
          }
        }
        if (flagInfo["highLight"]) {
          rtn = rtn + "highlight ";
        }
        if (flagInfo["hide"]) {
          rtn = rtn + "invisible ";
        }
        if (flagInfo["lowp"]) { // low priority memo
          rtn = rtn + "lowpriority ";
        }
        return rtn + "'>";
      };

      function makeMemoLink(line, flagInfo) {
        if (flagInfo["link"]) {
          var match = line.match(/(.*)\((.*)\)/);
          if (match != undefined) {
            var key = match[1];
            var link = match[2];
            if (key != undefined && link != undefined) {
              var span = document.createElement('span');
              $(span).attr("ng-bind-html", key).appendTo($("#note"));
              var a = document.createElement('a');
              $(a).attr("href", link).attr("id", key).appendTo($("#note"));
            }
          }
        }
      };

      function getHeadLine(line, flagInfo) {
        if (flagInfo["headLine"]) {
          return line.replace(/^\*/, '');
        } else {
          return "&nbsp;";
        }
      };

      function convertToDoItem(m, line, i, j, flagInfo) {
        if (line.startsWith("[]") || line.startsWith("[v]")) {
          flagInfo["todo"] = true;
          var delCheck = "<span onclick='MemoControl().delcheck(" + i + "," + j + ")' class='delcheck'>[X]</span>"
          if (line.startsWith("[]")) {
            var replaced = line.replace("[]", "<span onclick='MemoControl().check(" + i + "," + j + ")' class='unchecked'>[ ]&nbsp;") + "</span>" + delCheck;
            return m.replace(line, replaced);
          } else if (line.startsWith("[v]")) {
            var replaced = line.replace("[v]", "<span onclick='MemoControl().uncheck(" + i + "," + j + ")' class='checked'>[v]&nbsp;") + "</span>" + delCheck;
            return m.replace(line, replaced);
          }
        } else {
          return m;
        }
      };

      function getModDiv(i) {
        return "<div onclick='MemoControl().mod(" + i + ")'; style='text-align:left; float:left'>[..]</div>";
      };

      function getHeadDiv(headLine, i) {
        var headClass = "memoHead";
        if (encodeURIComponent(headLine).replace(/%../g, "x").length > 60) {
          headClass = "memoHead longMemoHead";
        }
        return "<div onclick='MemoControl().moveMemoFrom(" + i + ")' class='" + headClass + "'>" + headLine + "</div>";
      };

      function getDelDiv(i, flagInfo) {
        if (!flagInfo["lock"]) {
          return "<div onclick='MemoControl().del(" + i + ")'; style='text-align:right;'>[X]</div>";
        } else {
          return "<div style='text-align:right;'>[L]</div>";
        }
      };

      function del(i) {
        var result = confirm('delete?');
        if (result) {
          var a = JSON.parse(localStorage.memo);
          a.splice(i, 1);
          localStorage.memo = JSON.stringify(a);
          location.href = location.href;
        }
      };

      function moveMemoTo(idx) {
        var a = JSON.parse(localStorage.memo);
        var fromIdx = MemoProcessIdx.moveMemoFromIndex;
        var toIdx = idx;
        if (toIdx > fromIdx) {
          toIdx = toIdx - 1;
        }
        var target = a.splice(fromIdx, 1);
        a.splice(toIdx, 0, target);
        localStorage.memo = JSON.stringify(a);
        location.href = location.href;
      };

      function moveMemoFrom(idx) {
        MemoProcessIdx.moveMemoFromIndex = idx;
      };

      function mod(i) {
        var a = JSON.parse(localStorage.memo);
        var s = a[i];
        $('#areaValue').val(s);
        $('#area').show();
        $('#confirm').hide();
        $('#modify').show();
        $('#areaValue').focus();
        MemoProcessIdx.modIndex = i;
      };

      function check(i, j) {
        var a = JSON.parse(localStorage.memo);
        var s = a[i];
        var lines = s.split(/\r\n|\n|\r/gm);
        if (lines[0].startsWith("#")) {
          lines.shift();
        }
        var before = lines[j];
        var after = lines[j].replace("[]", "[v]");
        a[i] = s.replace(before, after);
        localStorage.memo = JSON.stringify(a);
        location.href = location.href;
      };

      function uncheck(i, j) {
        var a = JSON.parse(localStorage.memo);
        var s = a[i];
        var lines = s.split(/\r\n|\n|\r/gm);
        if (lines[0].startsWith("#")) {
          lines.shift();
        }
        var before = lines[j];
        var after = lines[j].replace("[v]", "[]");
        a[i] = s.replace(before, after);
        localStorage.memo = JSON.stringify(a);
        location.href = location.href;
      };

      function delcheck(i, j) {
        var a = JSON.parse(localStorage.memo);
        var s = a[i];
        var lines = s.split(/\r\n|\n|\r/gm);
        if (lines[0].startsWith("#")) {
          lines.shift();
        }
        var before = lines[j];
        a[i] = s.replace(before, "").replace(/[\r\n]+/g, "\n");
        localStorage.memo = JSON.stringify(a);
        location.href = location.href;
      };

	    function init() {
        if (!localStorage.memo) {
          localStorage.memo = JSON.stringify([]);
        }

        var a = [];
        if (localStorage.memo) {
          a = JSON.parse(localStorage.memo);

          // if TODO list not exist, add at first
          if (a.length == 0 || a[0].toString().indexOf("*TODO\n") == -1) {
            a.unshift("*TODO\n");
            localStorage.memo = JSON.stringify(a);
          }

          for (var i = 0; i < a.length; i++) {
            var s = a[i].toString();
            var memoEle = appendMemo(i, s);
            var noteEle = $("#note");
            noteEle.append(memoEle);
          }
        }

        $("div.memoHead").not(":eq(0)").dblclick(function() {
          $("div.memoHead").each(function() {
            $(this).removeClass("selected");
          });
          $(this).addClass("selected");
          $("div.space").show();
        });

        // $('#add').click(function() {
        // $('#areaValue').val("");
        // $('#area').toggle();
        // $('#confirm').show();
        // $('#modify').hide();
        // $('#areaValue').focus();
        // });

        $('#confirm').click(function() {
          var m = $('#areaValue').val();
          if (m != null && m != "") {
            a = JSON.parse(localStorage.memo);
            if (m.startsWith("[]")) { // for TODO list item
              var s = a[0] + "\n" + m;
              a[0] = s.replace(/[\r\n]+/g, '\n');
              localStorage.memo = JSON.stringify(a);
              location.href = location.href;
            } else { // for memo item
              if (a.length - 1 < MemoProcessIdx.mediumPriorityMemoAddToIdx) {
                a.push(m);
              } else {
                a.splice(MemoProcessIdx.mediumPriorityMemoAddToIdx, 0, m);
              }
              localStorage.memo = JSON.stringify(a);
              location.href = location.href;
            }
          }
        });

        $('#modify').click(function() {
          var m = $('#areaValue').val();
          if (m != null && m != "") {
            a = JSON.parse(localStorage.memo);
            a[MemoProcessIdx.modIndex] = m;
            localStorage.memo = JSON.stringify(a);
            location.href = location.href;
          }
        });

      };

    return {
      del: del,
      moveMemoTo: moveMemoTo,
      moveMemoFrom: moveMemoFrom,
      mod: mod,
      check: check,
      uncheck: uncheck,
      delcheck: delcheck,
      init: init
    };
  };
  return memo;
}));
