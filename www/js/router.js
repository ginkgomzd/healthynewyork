Router = function() {
  /**
   * @see this.setClickStack
   */
  this.clickStack = [];
  /**
   * Determines how to route requests.
   *
   * @param {Tap event} e
   */
  this.route = function(e) {
      e.preventDefault();
      var el = $(e.currentTarget);
      var destination = el.attr('href');
      this.setClickStack(destination);

      // don't try to route external links (i.e., those with a protocol ://); pass them to the system browser
      if (!/:\/\//.test(destination)) {
        this.control(destination);
      } else {
        window.open(destination, '_system');
      }
    };

  this.control = function(destination) {
    if (typeof destination === 'undefined') {
      return;
    }

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

  /**
   * Maintains the list of paths the user has visited. This is used to provide back-button
   * functionality where needed. Note that when a user visits a path for the second time,
   * the stack is truncated at that point to prevent the user from being caught in an
   * endless loop of click "back" between just two pages.
   *
   * @param {string} destination
   * @returns {undefined}
   */
  this.setClickStack = function (destination) {
    var index = this.clickStack.indexOf(destination);
    if (index === -1) {
      this.clickStack.push(destination);
    } else {
      this.clickStack = this.clickStack.slice(0, index + 1);
    }
  }
};