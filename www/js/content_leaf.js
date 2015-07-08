var content_leaf = _.extend(new Controller(), {
  main: function(id) {
    content_leaf.id = id;
    content_leaf.fetchData();
  },
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('tap', '.btn.share', function(e){
      e.preventDefault();
      content_leaf.socialShare();
    });
  },
  socialShare: function() {
    var url = "http://healthyi.yidata.org/";
    var file = null;
    var msgBody = $(content_leaf.data.body).text().substr(0, 296 - content_leaf.data.title_text.length);
    var lastSpace = msgBody.lastIndexOf(" ");
    msgBody = msgBody.substring(0, lastSpace);
    msgBody = "Check out what I learned from the Healthy NY app:\n\n" + content_leaf.data.title_text + "\n" + msgBody + "...\n";
    console.log(msgBody);
    window.plugins.socialsharing.share(
        msgBody,
        content_leaf.data.title_text,
        file,
        url,
        function(result) {
          //onSuccess
        },
        function(result) {
          //onFailure
        }
    );
  },
  fetchData: function() {
    content_leaf.data = {};

    localDB.db.transaction(content_leaf.buildQueries,
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
      content_id: content_leaf.id,
      content_table: 'content',
      status: content_leaf.data.status
    });

    var share_src = $('#share_btn_tpl').html();
    var share_tpl = _.template(share_src);
    content_leaf.data.share_btn = share_tpl({
      content_id: content_leaf.id,
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
      [content_leaf.id],
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

$(document).ready(function () {
  content_leaf.initialize();
});