// convert full-width to half-width
String.prototype.toHalfWidth = function() {
  return this.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  });
}

angular.module("mainModule", ['ui.utils', 'ngSanitize']).controller("mainController", function($scope, $compile) {
  // Initialization
  $scope.editValue = "";

  $scope.onKeyUp = function($event) {
    var value = $scope.editValue;
    ScreenControl().showAllNoteFirst(value);
    ScreenControl().searchNote(value);
    ScreenControl().showMatchingLink(value);
    if ($event.which == 13) { // enter
      ScreenControl().showAllNoteFirst("");
    }
  };

  $scope.to_trusted = function(html_code) {
    return $sce.trustAsHtml(html_code);
  }
});

$(document).keydown(function(e) { // keypress did not work with ESC
	var code = e.keyCode || e.which;
  if (code == 27) { // esc
    ScreenControl().processEsc();
  } else if (code == 13) { // enter
    var value = $('#mainInput').val().toHalfWidth();
    $('#mainInput').val("");
    ScreenControl().fireLink(value);
    ScreenControl().processEnter(e);
    StorageControl(value);
  }
});

$(function() {
  ScreenControl().init();
  MemoControl().init();
  ConfigControl().init();
  NotifyControl().init();
});
