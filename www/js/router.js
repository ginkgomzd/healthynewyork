Router = function() {
  /**
   * @see this.setClickStack
   */
  this.clickStack = [];

  this.initialize = function() {
    var router = this;
    routie({
      'content_leaf/:id': function(id) {
        content_leaf.control(id);
      },
      'content_list/:id': function(id) {
        content_list.control(id);
      },
      'node/:id': this.routeNode,
      '*': function(controller) {
        c = router.getControllerByName(controller);
        if (c !== false) {
          c.control();
        } else {
          console.log('Route for ' + controller + ' not implemented');
        }
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
  this.setClickStack = function () {
    var route = '#' + window.location.hash.substring(1);
    var index = this.clickStack.indexOf(route);
    if (index === -1) {
      this.clickStack.push(route);
    } else {
      this.clickStack = this.clickStack.slice(0, index + 1);
    }
  };
};