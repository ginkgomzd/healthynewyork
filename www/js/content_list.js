var content_list = _.extend(new Controller(), {
  main: function() {
    this.qs = _.qs(this.destination);
    this.fetchData();
  },
  fetchData: function() {
    this.data = {};
    this.data.rows = [];
    this.data.page_title = this.qs.page_title;

    localDB.db.transaction(this.buildQueries,
      // TODO: we need a generic error handler
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      },
      function(){
        content_list.bindData();
        content_list.updateDisplay();
      }
    );
  },
  bindData: function(data) {
    var src = $('#content_list_table_row_tpl').html();
    var row_tpl = _.template(src);
    content_list.data.tbody = '';

    $.each(content_list.data.rows, function() {
      content_list.data.tbody += row_tpl(this);
    });

    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);
    content_list.rendered = template(content_list.data);
  },
  buildQueries: function(tx) {
    tx.executeSql('SELECT import_id, title FROM content WHERE type = ?',
      [content_list.qs.content_type],
      content_list.parseResult
    );
  },
  parseResult: function(tx, result) {
    var baseUrl = 'content_leaf?';
    for(var i=0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      var contentUrl = baseUrl + 'id=' + item.import_id;
      content_list.data.rows.push({title_text: item.title, link_url: contentUrl});
    }
  },
  usesBackButton: true
});