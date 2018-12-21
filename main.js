
requirejs.config({
    paths: {
        jquery: 'lib/jquery-1.8.3.min',
        notify: 'lib/notify'
    }
});

requirejs(["jquery", "notify", "screen-control", "memo-control", "config-control", "notify-control", "storage-control", "index"], function($, n, screen, memo, config, notify, storage) {

  $(document).keydown(function(e) { // keypress did not work with ESC
  	var code = e.keyCode || e.which;
    if (code == 27) { // esc
      screen().processEsc();
    } else if (code == 13) { // enter
      var value = $('#mainInput').val().toHalfWidth();
      $('#mainInput').val("");
      screen().fireLink(value);
      screen().processEnter(e);
      storage(value);
    }
  });

  screen().init();
  memo().init();
  config().init();
  notify().init();

});
