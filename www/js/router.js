Router = function() {
  /**
   * @see this.setClickStack
   */
  this.clickStack = [];

  this.initialize = function() {
    routie({
      'ask': function() {
        ask.main();
      },
      'bookmarks': function() {
        bookmark.main();
      },
      'content_leaf/:id': function() {
        console.log('not yet implemented');
      },
      'content_list/:id': content_list.main,
      'coverage_info': function() {
        coverage_info.main();
      },
      'inbox': function() {
        console.log('not yet implemented');
      },
      'node/:id': this.routeNode,
      'schedule_appt': function() {
        schedule.main();
      },
      'search': function() {
        search.main();
      },
      'settings': function() {
        settings.main();
      }
    });
  };

/**
 * Determines whether a node is a list or a leaf and routes it accordingly
 *
 * @param {Int} id Node ID
 */
  this.routeNode = function(id) {
    localDB.db.transaction(
      function(tx) {
        tx.executeSql(
          'SELECT "link" FROM "content" WHERE "import_id" =  ?',
          [id],
          function(tx, result) {
            if (result.rows.length < 1) {
              console.log('Could not route request; node ID invalid or no such node.');
            } else {
              var item = result.rows.item(0);
              if (item.link === null) {
                routie('content_leaf/' + id);
              } else {
                routie('content_list/' + id);
              }
            }
          }
        );
      },
      function() {console.log('Could not route request; node lookup failed.');}
    );
  };

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
  };
};