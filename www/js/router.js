
Router = function() {
  /**
  * Determines how to route requests. Very basic at present. As we start incorporating
  * user-generated content, we may need additional processing to handle different
  * types of requests or to handle invalid requests. Possibly this could be handled
  * by returning app.updateDisplay()'s promise and doing damage control if the
  * AJAX call fails.
  *
  * @param {Tap event} e
  * @returns {undefined}
  */
  this.route = function(e) {
      var el = $(e.currentTarget);
      var destination = el.attr('href');

      // don't try to route external links (i.e., those with a protocol ://); let them behave normally
      if (!/:\/\//.test(destination)) {
        e.preventDefault();
        // TODO: we may need to do more URL processing at a later time, but for now we can pass through
        this.control(destination);
      }
    }

  this.control = function(destination) {
    if (destination === 'pages/bookmarks.html') {
      app.controller = bookmark;
    } else if (/^pages\/faq\.html/.test(destination)) {
      app.controller = faq;
    } else if (/^pages\/search\.html/.test(destination)) {
      app.controller = search;
    } else if (destination === 'pages/ask.html') {
      app.controller = ask;
    } else if (destination === 'pages/schedule_appt.html') {
      app.controller = schedule;
    } else if (destination) {
      app.controller = new Controller();
    }
    app.controller.destination = destination;
    app.controller.main();
  }
}