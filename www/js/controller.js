
/**
 * Parent constructor for our Applicatin Controller Class.
 * @returns {undefined}
 */
Controller = function () {
  this.destination = '';

/**
  * Updates content on the page and toggles active states for nav links. This
  * helper function is called from app.route() and should not be called directly.
  *
  * @param {string} destination
  * @returns {undefined}
  */
  this.updateDisplay = function() {
    var destination = this.destination;
    // get the path minus any parameters
    var q = destination.indexOf('?');
    var basePathLength = (q === -1 ? destination.length : q);
    var basePath = destination.substr(0, basePathLength);

    $('#content').load(destination, function() {
      $('.row-offcanvas').removeClass('active'); // any time a link is followed, close the off-canvas menu
      $('nav a').removeClass('active');
      $('nav a[href^="' + basePath + '"]').addClass('active');
      app.manageDependencies();
    });
  }
}

