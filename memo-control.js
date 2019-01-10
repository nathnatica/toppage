// var MemoProcessIdx = {
//   mediumPriorityMemoAddToIdx: 1000,
//   moveMemoFromIndex: -1,
//   modIndex: -1
// };

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
    global.MemoControl = factory();
  }
}(this, function() {
  "use strict";

  var memo = function(func) {
    var dictMemoIdx = new Index();
    var mediumPriorityMemoAddToIdx = new Index(1000),
    moveMemoFromIndex = new Index(),
    modIndex = new Index();

    function appendMemo(i, s) {
        var lines = s.split(/\r\n|\n|\r/gm);

        var flagInfo = {};
        var m = getFlagInfo(i, s, lines, flagInfo);

        for (var j in lines) {
          if (lines[j].length > 80) {
            flagInfo["longLine"] = true;
          }
          m = makeMemoLink(m, lines[j], flagInfo);
          m = convertToDoItem(m, lines[j], i, j, flagInfo);
          m = convertDictItem(m, lines[j], i, j, flagInfo);
        }

        var html = $("<div></div>")
          .append(getModDiv(i))
          .append(getHeadDiv(getHeadLine(lines[0], flagInfo), i))
          .append(getDelDiv(i, flagInfo))
          .append($("<hr>"))
          .append(getMemoBody(m, flagInfo));
        return html;
      };

      function getSpaceDiv(i) {
        return $("<div></div>").attr("onclick","memoControl.moveMemoTo(" + (i + 1) + ")").addClass("space");
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
          }
          if (flagInfo["lowp"] == true) { // low proprity memo
            mediumPriorityMemoAddToIdx.set(Math.min(mediumPriorityMemoAddToIdx.get(), j));
          } else if (flagInfo["dict"] == true) { // to find first dictionary memo to add new dictionary
            dictMemoIdx.addtoSet(j);
            if (flagInfo["backup"] == true) {
              flagInfo["lowp"] = true;
              mediumPriorityMemoAddToIdx.set(Math.min(mediumPriorityMemoAddToIdx.get(), j));
            }
          }
          rtn = rtn.replace(/^#.+\n/, '');
        }

        if (lines[0]) {
          if (lines[0].startsWith('*')) {
            flagInfo["headLine"] = true;
          }

          if (lines[0].startsWith('!')) {
            flagInfo["highLight"] = true;
          }
        }
        return rtn;
      };

      function getMemoBody(m, flagInfo) {
        var divHead = getMemoDivHead(flagInfo);
        var b = m;
        if (flagInfo["headLine"]) {
          b = b.replace(/^\*.+\n/, '');
        }
        if (!flagInfo["link"] && !flagInfo["todo"] && !flagInfo["dict"]) {
          b = b.replace(/>/g, "&gt;").replace(/</g, "&lt;");
        }
        // return divHead + b.replace(/[\-]+\n/g, "</div><hr>" + divHead).replace(new RegExp('\n', 'g'), '<br>') + "</div></div>";
        return divHead.html(b.replace(/[\-]+\n/g, "<hr>").replace(new RegExp('\n', 'g'), '<br>'));
      };

      function getMemoDivHead(flagInfo) {
        var rtn = $("<div></div>");
        if ((flagInfo["longMemo"] || flagInfo["longLine"] || flagInfo["dict"]) && !flagInfo["link"]) {
          rtn.addClass("long");
          if (flagInfo["longMemo"]) {
            rtn.addClass("scroll");
          }
        }
        if (flagInfo["highLight"]) {
          rtn.addClass("highlight");
        }
        if (flagInfo["hide"]) {
          rtn.addClass("invisible");
        }
        if (flagInfo["lowp"]) { // low priority memo
          rtn.addClass("lowpriority");
        }
        if (flagInfo["backup"]) {
          rtn.addClass("scroll");
        }
        return rtn;
      };

      function makeMemoLink(m, line, flagInfo) {
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
              var key2 = key.padEnd(4, "_").replace(/_/g, "&nbsp;");
              var replaced = line.replace(key,"<b>" + key2 + "</b>");
              return m.replace(line, replaced);
            }
          }
        }
        return m;
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
          var delCheck = "<span onclick='memoControl.delcheck(" + i + "," + j + ")' class='delcheck'>[X]</span>"
          if (line.startsWith("[]")) {
            var replaced = line.replace("[]", "<span onclick='memoControl.check(" + i + "," + j + ")' class='unchecked'>[ ]&nbsp;") + "</span>" + delCheck;
            return m.replace(line, replaced);
          } else if (line.startsWith("[v]")) {
            var replaced = line.replace("[v]", "<span onclick='memoControl.uncheck(" + i + "," + j + ")' class='checked'>[v]&nbsp;") + "</span>" + delCheck;
            return m.replace(line, replaced);
          }
        } else {
          return m;
        }
      };

      function convertDictItem(m, line, i, j, flagInfo) {
        if (flagInfo["dict"]) {
          if (!line.startsWith("*")) {
            var match = line.match(/^[ 　]*(\S+)[ 　](.*)$/);
            if (match != undefined) {
              var word = match[1];
              var desc = match[2];
              if (word != undefined && desc != undefined) {
                var downDict = "<span onclick='memoControl.down(" + i + "," + j + ")' class='updown'>[↓]</span>";
                var upDict = "<span onclick='memoControl.up(" + i + "," + j + ")' class='updown'>[↑]</span>";
                var delDict = "<span onclick='memoControl.delcheck(" + i + "," + j + ")' class='delcheck'>[X]</span>";
                var replaced = line
                .replace(word, "<span class='word'>" + word + "</span>")
                .replace(desc, "<span class='desc'>" + desc + "</span>") + delDict + upDict + downDict;
                return m.replace(line, replaced);
              }
            }
          }
        }
        return m;
      };

      function getModDiv(i) {
        return $("<div></div>")
        .attr("onclick", "memoControl.mod(" + i + ")")
        .attr("style", "text-align:left; float:left")
        .text("[..]");
      };

      function getHeadDiv(headLine, i) {
        var headClass = "memoHead";
        if (encodeURIComponent(headLine).replace(/%../g, "x").length > 60) { // if long head
          headClass = "memoHead longMemoHead";
        }
        return $("<div></div>").attr("onclick","memoControl.moveMemoFrom(" + i + ")").html(headLine).addClass(headClass);
      };

      function getDelDiv(i, flagInfo) {
        var t = $("<div></div>").attr("style", "text-align:right").text("[L]");
        if (!flagInfo["lock"]) {
          t.attr("onclick", "memoControl.del(" + i + ")").text("[X]");
        }
        return t;
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
        var fromIdx = moveMemoFromIndex.get();
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
        moveMemoFromIndex.set(idx);
      };

      function mod(i) {
        var a = JSON.parse(localStorage.memo);
        var s = a[i];
        $('#areaValue').val(s);
        $('#area').show();
        $('#confirm').hide();
        $('#modify').show();
        $('#areaValue').focus();
        modIndex.set(i);
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

      function down(i, j) {
        var to = dictMemoIdx.getNext(i);
        moveMemoLineTo(i, j, to);
      };

      function up(i, j) {
        var to = dictMemoIdx.getBefore(i);
        moveMemoLineTo(i, j, to);
      };

      function moveMemoLineTo(i, j, to) {
        if (i != to) {
          // delete from
          var a = JSON.parse(localStorage.memo);
          var from = a[i];
          var lines = from.split(/\r\n|\n|\r/gm);
          if (lines[0].startsWith("#")) {
            lines.shift();
          }
          var target = lines[j];
          a[i] = from.replace(target, "").replace(/[\r\n]+/g, "\n");

          // add to
          var m = a[to] + "\n" + target;
          a[to] = m.replace(/[\r\n]+/g, "\n");

          localStorage.memo = JSON.stringify(a);
          location.href = location.href;
        }
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
            noteEle.append(memoEle).append(getSpaceDiv(i));
          }
        }

        $("div.memoHead").not(":eq(0)").dblclick(function() {
          $("div.memoHead").each(function() {
            $(this).removeClass("selected");
          });
          $(this).addClass("selected");
          $("div.space").show();
        });

        $('#confirm').click(function() {
          var m = $('#areaValue').val();
          if (m != null && m != "") {
            a = JSON.parse(localStorage.memo);
            if (m.startsWith("[]")) { // for TODO list item
              var s = a[0] + "\n" + m;
              a[0] = s.replace(/[\r\n]+/g, '\n');
              localStorage.memo = JSON.stringify(a);
              location.href = location.href;
            } else if ((m.startsWith("??") || m.startsWith("？？")) && dictMemoIdx.size() != 0) { // for dictionay item
              var firstIdx = dictMemoIdx.getFirst();
              var s = a[firstIdx] + "\n" + m.replace(/[\?？]/g,'');
              a[firstIdx] = s.replace(/[\r\n]+/g, '\n');
              localStorage.memo = JSON.stringify(a);
              location.href = location.href;
            } else { // for memo item
              if (a.length - 1 < mediumPriorityMemoAddToIdx.get()) {
                a.push(m);
              } else {
                a.splice(mediumPriorityMemoAddToIdx.get(), 0, m);
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
            a[modIndex.get()] = m;
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
      down: down,
      up: up,
      init: init
    };
  };
  return memo;
}));
