
requirejs.config({
    paths: {
        jquery: 'lib/jquery-1.8.3.min',
        notify: 'lib/notify'
    }
});

requirejs(["jquery", "notify", "screen-control", "memo-control", "config-control", "notify-control", "storage-control", "index"], function($, n, screen, memo, config, notify, storage) {

  screenControl = screen();
  $(document).keydown(function(e) { // keypress did not work with ESC
  	var code = e.keyCode || e.which;
    if (code == 27) { // esc
      screenControl.processEsc();
    } else if (code == 13) { // enter
      var value = $('#mainInput').val().toHalfWidth();
      $('#mainInput').val("");
      screenControl.fireLink(value);
      screenControl.processEnter(e);
      storage(value);
    }
  });

  screenControl.init();
  memoControl = memo();
  memoControl.init();
  config().init();
  notify().init();

});
