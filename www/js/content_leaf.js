var content_leaf = _.extend(new Controller(), {
  main: function() {
    this.qs = _.qs(this.destination);
    this.fetchData();
  },
  fetchData: function() {
    this.data = {};

    localDB.db.transaction(this.buildQueries,
      // TODO: we need a generic error handler
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      },
      function(){
        content_leaf.bindData();
        content_leaf.updateDisplay();
      }
    );
  },
  bindData: function(data) {
    var btn_src = $('#bookmark_btn_tpl').html();
    var btn_tpl = _.template(btn_src);
    content_leaf.data.bookmark_btn = btn_tpl({
      content_id: content_leaf.qs.id,
      content_table: 'content',
      status: content_leaf.data.status
    });

    var src = $('#content_leaf_tpl').html();
    var content_tpl = _.template(src);
    content_leaf.rendered = content_tpl(content_leaf.data);
  },
  buildQueries: function(tx) {
    tx.executeSql(
        'SELECT * FROM content \
          LEFT JOIN bookmark \
          ON content.import_id = bookmark.content_id \
          WHERE import_id = ?',
      [content_leaf.qs.id],
      content_leaf.parseResult
    );
  },
  parseResult: function(tx, result) {
    for(var i=0; i < result.rows.length; i++) {
      content_leaf.data.title_text = result.rows.item(i).title;
      content_leaf.data.body = result.rows.item(i).body;
      content_leaf.data.status = (result.rows.item(i).content_id === null ? 0 : 1);
    }
  },
  usesBackButton: true
});