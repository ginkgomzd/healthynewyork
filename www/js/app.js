
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        // wait for device API libraries to load
        document.addEventListener('deviceready', this.onDeviceReady, false);

        // wire up off-canvas menu
        $('#toggle-offcanvas').bind('tap', function () {
          $('.row-offcanvas').toggleClass('active');
        });

        // wire up swipes on the top navbar
        $('#navbar-top').bind('swipe', function (e) {
          var hdir = app.getSwipeDirection(e).horizontal;
          if (hdir === 'left') {
            $('.row-offcanvas').removeClass('active');
          } else if(hdir === 'right') {
            $('.row-offcanvas').addClass('active');
          }
        });

        // TODO: it's not good enough to bind to existing anchor tags; we have be
        // constantly listening for any newly added ones

        // handle all links
        $('a').bind('tap', function(e) {
          app.route(e);
        });
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call class methods, we
    // must explicitly call 'app.myMethod(...);'
    onDeviceReady: function() {
        // TODO
    },
    /**
     * Depends on jQuery mobile's swipe event. Presently reports on horizontal
     * swipes only; app.getSwipeDirection.direction.vertical will always be null.
     *
     * @param {Swipe event} swipe
     * @returns {object} with properties horizontal ('left', 'right', or null)
     *                   and vertical (null)
     */
    getSwipeDirection: function(swipe) {
      var startX = swipe.swipestart.coords[0];
      var endX = swipe.swipestop.coords[0];
      var direction = {horizontal: null, vertical: null};

      if (startX > endX) {
        direction.horizontal = 'left';
      } else if(endX > startX) {
        direction.horizontal = 'right';
      }

      return direction;
    },
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
    route: function(e) {
      var el = $(e.currentTarget);
      var destination = el.attr('href');

      // don't try to route external links (i.e., those with a protocol ://); let them behave normally
      if (!/:\/\//.test(destination)) {
        e.preventDefault();
        // TODO: we may need to do more URL processing at a later time, but for now we can pass through
        app.updateDisplay(destination);
      }
    },
    /**
     * Updates content on the page and toggles active states for nav links. This
     * helper function is called from app.route() and should not be called directly.
     *
     * @param {string} destination
     * @returns {undefined}
     */
    updateDisplay: function(destination) {
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
    },
    manageDependencies: function() {
      // clear any classes that might have been previously added by child pages (this is a reset)
      $('#content').removeClass().addClass('container');

      if ($('#content').find('table').length !== 0) {
        $.getScript('js/tablePage.js');
      }
    }
};

$(document).ready(function () {
  app.initialize();
});