var bookmark = _.extend(new Controller(), {
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
      // don't bind listeners until the device is ready (i.e., we have a database)
      $('.toggle-fave').bind('tap', function(e) {
        var el = $(e.currentTarget);

        if (el.is('.active')) {
          bookmark.delete(el.data('id'), el.data('table'));
        } else {
          bookmark.save(el.data('id'), el.data('table'));
        }
      });
    },
    delete: function(content_id, content_table) {
      localDB.db.transaction(
        function(tx) {
          tx.executeSql('DELETE FROM bookmark WHERE content_id = ? AND content_table = ?',
            [content_id, content_table]);
        },
        localDB.installError,
        localDB.installSuccess
      );
    },
    save: function(content_id, content_table) {
      localDB.db.transaction(
        function(tx) {
          tx.executeSql('INSERT INTO bookmark (content_id, content_table) VALUES (?, ?)',
            [content_id, content_table]);
        },
        localDB.installError,
        localDB.installSuccess
      );
    },
    main: function() {
      this.fetchData();
    },
    /**
     * Fetches all bookmarks
     *
     * @returns {undefined}
     */
    fetchData: function() {
      this.data = {};
      this.data.rows = []; // supplies data to the rows of the table
      this.data.page_title = 'Bookmarks';

      localDB.db.transaction(this.buildQueries,
        // TODO: we need a generic error handler
        function(tx, er){
          console.log("Transaction ERROR: "+ er.message);
        },
        function(){
          bookmark.bindData();
          bookmark.updateDisplay();
        }
      );
    },
    buildQueries: function(tx) {
      tx.executeSql(
        'SELECT DISTINCT "import_id", "title", "type" FROM "content" \
        INNER JOIN "bookmark" \
        ON "import_id" = "content_id"',
        [],
        bookmark.buildRows
      );
    },
    buildRows: function(tx, result) {
      for(var i = 0; i < result.rows.length; i++) {
        var item = result.rows.item(i);
        bookmark.data.rows.push({
          id: item.import_id,
          title: item.title,
          type: item.type
        });
      }
    },
    bindData: function(data) {
      var bookmark_cell_src = $('#bookmark_cell').html();
      var bookmark_cell_tpl = _.template(bookmark_cell_src);

      var src = $('#bookmark_table_row_tpl').html();
      var row_tpl = _.template(src);
      this.data.tbody = '';

      $.each(this.data.rows, function() {
        this.link_url = 'pages/faq.html?id=' + this.id;
        this.bookmark_cell = bookmark_cell_tpl({
          content_id: this.id,
          content_table: 'content',
          status: 1
        });
        bookmark.data.tbody += row_tpl(this);
      });

      var tpl_src = $('#table_page_tpl').html();
      var template = _.template(tpl_src);
      this.rendered = template(this.data);
    }
});

$(document).ready(function () {
  bookmark.initialize();
});