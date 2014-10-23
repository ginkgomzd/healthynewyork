var tablePage = {
  initialize: function() {
    this.bindEvents();

    // facilitate theming
    $('#content').addClass('has-tables');
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    // handle all links
    $('.toggle-fave').bind('tap', function(e) {
      $(e.currentTarget).toggleClass('active');

      // TODO: database write
    });
  }
};

$(document).ready(function () {
  tablePage.initialize();
});