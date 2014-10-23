
/**
 * Parent constructor for our Applicatin Controller Class.
 * @returns {undefined}
 */
Controller = function () {
  this.destination = '';
  this.rendered = {};

/**
  * Updates content on the page and toggles active states for nav links. This
  * helper function is called from app.route() and should not be called directly.
  *
  * @param {string} destination
  * @returns {undefined}
  */
  this.updateDisplay = function() {
    var destination = this.destination;
    $('#content').html(this.rendered);
    this.resetContentDisplay();
  }

  this.resetContentDisplay = function() {
    // get the path minus any parameters
    var q = this.destination.indexOf('?');
    var basePathLength = (q === -1 ? this.destination.length : q);
    var basePath = this.destination.substr(0, basePathLength);

    $('.row-offcanvas').removeClass('active'); // any time a link is followed, close the off-canvas menu
    $('nav a').removeClass('active');
    $('nav a[href^="' + basePath + '"]').addClass('active');
      app.manageDependencies();
  }

}

