// to use case insensitive search at contains method
$.expr[":"].contains = $.expr.createPseudo(function(args) {
  return function(elem) {
    return $(elem).text().toUpperCase().indexOf(args.toUpperCase()) >= 0;
  }
});

// ie not support String.startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

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
    // TODO parksungho for running in angular module()
    // global.ScreenControl = factory();
  }
  // TODO parksungho for running in angular module()
  global.ScreenControl = factory();
}(this, function() {
  "use strict";

  var screen = function(func) {

    function init() {
        // init for highlight links
        $('div.padding1 > span').each(function() {
          var text = $(this).text();
          if ($(this).next().attr("id") == undefined) {
            $(this).next().attr("id", text);
          }
        });

        $('div.padding1 > a').after("<br/><br/>");
        $('h2').after("<br/>");
        $('h3').after("<br/>");
        $('p').after("<br/>");
        $('div.padding1 > span').after("&nbsp;&nbsp;");

        $(window).bind("resize", function() {
          setTimeout(function() {
            popupResize();
          }, 1000);
        });
      };

      function popupDisp() {
        $('#popup_outer').css('display', 'table');
        $('#popup_inner').css('display', 'table-cell');
        $('.pop_contents').css('display', 'block');
      };

      function popupClose() {
        $('#popup_outer, #popup_inner .pop_contents').css('display', 'none');
      };

      function popupResize() {
        $('#popup_outer').width('100%').height('100%');
      };

      function showAllNoteFirst(value) {
        $('div').filter('[id]').hide();
        if (value.length <= 1) {
          $('#note').show();
          $('#note > div').not(".space").each(function() {
            $(this).show();
          });
          $('#add').show();
        }
      };

      function searchNote(value) {
        if (value.startsWith('/') || value.startsWith('・')) { // if search keyword
          var searchValue = value.replace(/^\//, '').replace(/^・/, '');
          $('#note > div').each(function() {
            $(this).hide();
          });
          $('#add').hide();
          if (searchValue.length > 0) {
            $("#note > div:contains(" + searchValue + ")").not(".space").each(function() {
              $('#note').show();
              $(this).show();
            });
          }
        }
      };

      function showMatchingLink(value) {
        for (var i = 2; i <= 5; i++) {
          if (value.length >= i) {
            $('div[id="' + value.substring(0, i) + '"]').not('#area').show();
          }
        }
        $('div[id^="' + value + '"]').not('#area').show();
      };

      function processEsc() {
        $('#mainInput').focus();

        // init memo move
        $("div.memoHead").each(function() {
          $(this).removeClass("selected");
        });
        $("div.space").hide();
        MemoProcessIdx.moveMemoFromIndex = -1;
        popupClose();
      };

      function fireLink(value) {
        if (value != null && value.length > 0 && !value.startsWith('/') && !value.startsWith('・')) { // if not search keyword
          var link = document.getElementById(value);
          if (link) {
            link.setAttribute("target", "_blank");
            link.click();
          } else if ($('a[id^="' + value + '"]').length == 1) {
            $('a[id^="' + value + '"]').attr("target", "_blank")[0].click();
          }
        }
      };

      function processEnter(e) {
        if (!$('#mainInput').is(':focus') && !$('#areaValue').is(':focus')) {
          $('#mainInput').focus();
        } else if ($('#areaValue').is(':focus') && e.ctrlKey) { // confirm or modify
          if ($('#confirm').is(':visible')) {
            $('#confirm').trigger('click');
          } else if ($('#modify').is(':visible')) {
            $('#modify').trigger('click');
          }
        } else if ($('#mainInput').is(':focus') && e.ctrlKey) { // show textarea
          $('#areaValue').val("");
          $('#area').toggle();
          $('#confirm').show();
          $('#modify').hide();
          $('#areaValue').focus();
        }
      };

    return {
      init: init,
      popupDisp: popupDisp,
      popupClose: popupClose,
      showAllNoteFirst: showAllNoteFirst,
      searchNote: searchNote,
      showMatchingLink: showMatchingLink,
      processEsc: processEsc,
      fireLink: fireLink,
      processEnter: processEnter
    };
  };

  return screen;
}));
