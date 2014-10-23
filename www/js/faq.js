// TODO: Do we really need faq.initialize, faq.bindEvents, or faq.onDeviceReady?
// Do we really need the $(document).ready at the bottom of this file?

var faq = _.extend(new Controller(), {
// Application Constructor
  initialize: function() {
      this.bindEvents();
  },
  bindEvents: function() {
      // wait for device API libraries to load
      document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // The scope of 'this' is the event.
  onDeviceReady: function() {
//      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, faq.gotFS, fail);
  },
  main: function() {
    this.content_type = 'Terms to Know';
    this.fetchData();
  },
  // TODO: we can probably parameterize this to some extent; if this function could
  // accept type and ID args, we could build probably all the FAQ pages we need...
  // at least for lists and individual pages -- for fetching a list of categories
  // we might want a different function
  fetchData: function() {
    this.data = {};
    this.data.rows = [];
    this.data.page_title = this.content_type;

    localDB.db.transaction(this.buildQueries,
      // TODO: we need a generic error handler
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      },
      function(){
        faq.bindData();
        faq.updateDisplay();
      }
    );
  },
  bindData: function(data) {
    var src = $('#faq_table_row_tpl').html();
    var row_tpl = _.template(src);
    this.data.tbody = '';

    $.each(this.data.rows, function() {
      faq.data.tbody += row_tpl(this);
    });

    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);
    this.rendered = template(this.data);
  },
  buildQueries: function(tx) {
    tx.executeSql('SELECT "import_id", "title" FROM "content" WHERE type = ?',
      [faq.content_type],
      faq.buildRows
    );
  },
  buildRows: function(tx, result) {
    for(var i=0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      // TODO: this link_url is totally fake
      faq.data.rows.push({title_text: item.title, link_url: item.import_id});
    }
  }
});

$(document).ready(function () {
  faq.initialize();
});