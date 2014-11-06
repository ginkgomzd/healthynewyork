
Router = function() {
  /**
   * Determines how to route requests.
   *
   * @param {Tap event} e
   */
  this.route = function(e) {
      e.preventDefault();
      var el = $(e.currentTarget);
      var destination = el.attr('href');

      // don't try to route external links (i.e., those with a protocol ://); pass them to the system browser
      if (!/:\/\//.test(destination)) {
        this.control(destination);
      } else {
        window.open(destination, '_system');
      }
    };

  this.control = function(destination) {
    var q = destination.indexOf('?');
    if (q === -1) {
      var destinationBase = destination;
    } else {
      var destinationBase = destination.substring(0, q);
    }

    var controller = this.getControllerByName(destinationBase);
    if (controller !== false) {
      app.controller = controller;
    } else if (destination === 'pages/bookmarks.html') {
      app.controller = bookmark;
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
  };

  /**
   * Duck test, since we can't really check inheritance
   *
   * @param {string} controller name
   * @returns {mixed} The controller object on success, boolean false otherwise
   */
  this.getControllerByName = function (controller) {
    // window[controller] is a variable variable, like double dollar signs in PHP
    var c = window[controller];
    if (c !== null && typeof c === "object" && 'updateDisplay' in c) {
      return c;
    } else {
      return false;
    }
  };
};