
var app = {
    // Application Constructor
    initialize: function() {
        app.router = new Router();
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
          app.router.route(e);
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