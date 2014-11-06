/**
 * Parent constructor for our Application Controller Class.
 * @returns {undefined}
 */
Controller = function () {
  this.destination = '';
  this.rendered = {};
  this.usesBackButton = false;

/**
  * Updates content on the page and toggles active states for nav links. This
  * helper function is called from the controller and should not be called directly.
  *
  * @returns {undefined}
  */
  this.updateDisplay = function() {
    var destination = this.destination;
    $('#content').html(this.rendered);
    var contentClasses = this.setContentClasses();
    $('#content').removeClass().addClass(contentClasses);
    this.resetContentDisplay();
    this.postUpdateDisplay();
  };

  /**
   * Abstract method for children to implement should it be necessary to call
   * custom JS, etc., after the content is updated.
   */
  this.postUpdateDisplay = function() {};

  this.resetContentDisplay = function() {
    // get the path minus any parameters
    var q = this.destination.indexOf('?');
    var basePathLength = (q === -1 ? this.destination.length : q);
    var basePath = this.destination.substr(0, basePathLength);
    this.setBackButton(basePath);

    $('.row-offcanvas').removeClass('active'); // any time a link is followed, close the off-canvas menu
    $('nav a').removeClass('active');
    $('nav a[href^="' + basePath + '"]').addClass('active');
  };

  /**
   * @returns {String} One or more space-separated classes to be added to the class
   * attribute of the content element
   */
  this.setContentClasses = function() {
    result = 'container';

    if ($('#content').find('table').length !== 0) {
      result += ' has-tables';
    }

    return result;
  };

  /**
   * Toggles between the hamburger and back icons, setting the back URL as needed
   *
   * @param {string} controller
   * @returns {undefined}
   */
  this.setBackButton = function(controller) {
    if (this.usesBackButton === true) {
      var href = app.router.clickStack[app.router.clickStack.length - 2];
      $('#back').attr('href', href).show();
      $('#toggle-offcanvas').hide();
    } else {
      $('#back').hide();
      $('#toggle-offcanvas').show();
    }
  };
};