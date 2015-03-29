/**
 * Parent constructor for our Application Controller Class.
 * @returns {undefined}
 */
Controller = function () {
  /**
   * @var {String} activePath If a child controller sets this, the app navigation
   * state is updated accordingly when the controller is loaded. This determines
   * which icons light up. If it is not set, the previous state persists. activePath
   * should not be set by generic controllers like content_leaf or content_list.
   */
  this.activePath = null;
  this.rendered = {};
  this.usesBackButton = false;

  /**
   * This function is invoked to pass control of the application from one controller
   * to another.
   *
   * It takes care of some app-state housekeeping then calls the controller's main method.
   */
  this.control = function() {
    app.router.setClickStack();
    if (this.activePath !== null) {
      app.activePath = this.activePath;
    }

    app.controller = this;
    app.controller.main.apply(app.controller, arguments); // pass on arguments (e.g., node id) to the controller's main method
  };

  /**
   * Abstract method for children to implement. In the main method you probably want to do
   * stuff like fetch data from the database or instantiate a view.
   */
  this.main = function() {
    console.log('Application error: controller failed to implement main method');
  };

/**
  * Updates content on the page and toggles active states for nav links. This
  * helper function is called from the controller and should not be called directly.
  *
  * @returns {undefined}
  */
  this.updateDisplay = function() {
    var destination = this.destination;
    $('#content').html(this.rendered);

    $('#content').animate({scrollTop:0}, 10);

    var contentClasses = this.setContentClasses();
    $('#content').removeClass().addClass(contentClasses);
    this.updateNavDisplay();
    this.postUpdateDisplay();
  };

  /**
   * Abstract method for children to implement should it be necessary to call
   * custom JS, etc., after the content is updated.
   */
  this.postUpdateDisplay = function() {};

  this.updateNavDisplay = function() {
    this.setBackButton();

    $('nav a').removeClass('active');
    $('nav a[href^="' + app.activePath + '"]').addClass('active');
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
  this.setBackButton = function() {
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