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
    faq.content_type = 'Terms to Know';
    faq.qs = _.qs(faq.destination);
    faq.fetchData();
  },
  // TODO: we can probably parameterize this to some extent; if this function could
  // accept type and ID args, we could build probably all the FAQ pages we need...
  // at least for lists and individual pages -- for fetching a list of categories
  // we might want a different function
  fetchData: function() {
    faq.data = {};
    faq.data.rows = [];
    faq.data.page_title = this.content_type;

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
    if(faq.qs.display === 'content') {
      faq.bindDataContent();
    } else {
      faq.bindDataTitles(data);
    }
  },
  bindDataTitles: function(data) {
    var src = $('#faq_table_row_tpl').html();
    var row_tpl = _.template(src);
    faq.data.tbody = '';

    $.each(faq.data.rows, function() {
      faq.data.tbody += row_tpl(this);
    });

    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);
    faq.rendered = template(faq.data);
  },
  bindDataContent: function() {
    var btn_src = $('#bookmark_btn_tpl').html();
    var btn_tpl = _.template(btn_src);
    faq.data.bookmark_btn = btn_tpl({
      content_id: faq.qs.cntId,
      content_table: 'content',
      status: faq.data.status
    });

    var src = $('#faq_conent_tpl').html();
    var content_tpl = _.template(src);
    faq.rendered = content_tpl(faq.data);
  },
  buildQueries: function(tx) {
    if(faq.qs.display === 'content') {
      faq.buildContentQueries(tx, faq.parseContentResult);
    } else {
      faq.buildTitleQueries(tx, faq.buildRows);
    }
  },
  buildTitleQueries: function(tx, callback) {
    tx.executeSql('SELECT import_id, title FROM content WHERE type = ?',
      [faq.content_type],
      callback
    );
  },
  buildContentQueries: function(tx, callback) {
    tx.executeSql(
        'SELECT * FROM content \
          LEFT JOIN bookmark \
          ON content.import_id = bookmark.content_id \
          WHERE import_id = ?',
      [faq.qs.cntId],
      callback
    );
  },
  buildRows: function(tx, result) {
    var baseUrl = 'pages/faq.html?';
    for(var i=0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      // TODO: this link_url is totally fake
      var contentUrl = baseUrl + 'display=content&cntId=' + item.import_id;
      faq.data.rows.push({title_text: item.title, link_url: contentUrl});
    }
  },
  parseContentResult: function(tx, result) {
    for(var i=0; i < result.rows.length; i++) {
      faq.data.title_text = result.rows.item(i).title;
      faq.data.body = result.rows.item(i).body;
      faq.data.status = (result.rows.item(i).content_id === null ? 0 : 1);
    }
  }
});

$(document).ready(function () {
  faq.initialize();
});