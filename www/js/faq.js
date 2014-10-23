
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
  main: function() {
    this.fetchData();
    this.bindData(this.data);
    this.updateDisplay();
  },
  fetchData: function() {
    console.log("GSL:: fetchData");
    this.data = {};
    this.data.rows = [];
    this.data.page_title = 'Terms to Know';

    localDB.db.transaction(this.buildQueries, function(tx,er){
      console.log("GSL:: transaction ERROR"+ er.message);
    }, function(a){
      console.log("GSL:: transaction SUCCESS");
    });
  },
  bindData: function(data) {
console.log("GSL:: bindData");
    var src = $('#faq_table_row_tpl').html();
    var row_tpl = _.template(src);
    this.data.tbody = '';
    $.each(this.data.rows, function() {
      this.data.tbody += row_tpl(this);
    });

    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);
    this.rendered = template(this.data);
  },
  buildQueries: function(tx) {
    console.log("GSL:: buildQueries");
    $.each(tx, function(key, val) {console.log(key);console.log('][');console.log(val)});
    tx.executeSql('SELECT "title" FROM "content"', [], this.buildRows,
    function(tx,er){
      console.log("GSL:: executeSql ERROR"+ er.message);
    });
    console.log("GSL:: didn't die");
  },
  buildRows: function(tx, result) {
    console.log("GSL:: buildRows");
    for( var i=0; i < result.rows.length; i++ ) {
      this.data.rows.push(result.rows.item(i).title);
    }
  }
});

$(document).ready(function () {
  faq.initialize();
});
