
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

        // handle all links
        $('body').on('tap', 'a', function(e){
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
    }
};

_.qs = function (request) {
  var queryString = request.substring( request.indexOf('?') + 1 );
  var result = {}, params, temp, i, l;
   // Split into key/value pairs
   params = queryString.split("&");
   // Convert the array of strings into an object
   for ( i = 0, l = params.length; i < l; i++ ) {
       temp = params[i].split('=');
       result[temp[0]] = temp[1];
   }
   return result;
}

$(document).ready(function () {
  app.initialize();

});