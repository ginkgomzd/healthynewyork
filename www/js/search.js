var search = {
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    // handle form submissions
    $('form').bind('submit', function(e) {
      e.preventDefault();
      $('#search_results').show();

      // TODO: database write
    });
  }
};

$(document).ready(function () {
  search.initialize();
});