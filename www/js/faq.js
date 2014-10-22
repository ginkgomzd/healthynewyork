
var faq = _.extend(new Controller(), {
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
  },
  // The scope of 'this' is the event. In order to call class methods, we
  // must explicitly call 'bookmark.myMethod(...);'
  onDeviceReady: function() {
//      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, faq.gotFS, fail);
  },
//    templateLoaded: function() {
//      console.log("Read as text");
//      console.log(evt.target.result);
//      faq._tplFile = evt.target.result;
//    },
//    gotFS: function(fileSystem) {
////      console.log(fileSystem.root.toURL());
//      fileSystem.root.getFile('file:///data/data/org.younginvincibles.healthynewyork/pages/faq.tpl', null, faq.loadTemplate, fail);
//    },
//    loadTemplate: function(file) {
//      var reader = new FileReader();
//      reader.onloadend = faq.templateLoaded;
//      reader.readAsText(file);
//    }
  updateDisplay: function() {
    var tpl_src = $('#faq_tpl').html();
    var data = {my_var: "my_value"};
    var template = _.template(tpl_src);
    var content = template(data);

    $('#content').html(content);
    Controller.resetContentDisplay();
  }
});

$(document).ready(function () {
  faq.initialize();
});
