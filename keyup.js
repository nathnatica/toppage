// convert full-width to half-width
String.prototype.toHalfWidth = function() {
  return this.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  });
}

angular.module("mainModule", ['ui.utils', 'ngSanitize']).controller("mainController", function($scope) {
  // Initialization
  $scope.editValue = "";

  $scope.onKeyUp = function($event) {
    var value = $scope.editValue;
    screenControl.showAllNoteFirst();
    screenControl.searchNote(value);
    screenControl.showMatchingLink(value);
    if ($event.which == 13) { // enter
      screenControl.showAllNoteFirst();
    }
  };

  $scope.to_trusted = function(html_code) {
    return $sce.trustAsHtml(html_code);
  }
});
