var bookmark = _.extend(new Controller(), {
    activePath: '#bookmark',
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
      $('body').on('tap', '.toggle-fave', function(e){
        e.preventDefault();
        var el = $(e.currentTarget);

        if (el.is('.active')) {
          bookmark.delete(el);
        } else {
          bookmark.save(el);
        }
      });

      $('body').on('tap', '.btn.toggle-fave', function(e){
        e.preventDefault();
        $(this).find('span').animate({marginLeft: "0px"}, "slow");
      });
    },

    /**
     * @param {object} el The clicked element. Must have content_id and content_table
     *        properties for the DB interaction. The element is passed along to
     *        bookmark.updateButton, which handles representing state to the user.
     */
    delete: function(el) {
      localDB.db.transaction(
        function(tx) {
          tx.executeSql('DELETE FROM bookmark WHERE content_id = ? AND content_table = ?',
            [el.data('id'), el.data('table')]);
        },
        function() {console.log('bookmarks::delete SQL ERROR');},
        bookmark.updateButton(el)
      );
    },

    /**
     * @param {object} el The clicked element. Must have content_id and content_table
     *        properties for the DB interaction. The element is passed along to
     *        bookmark.updateButton, which handles representing state to the user.
     */
    save: function(el) {
      localDB.db.transaction(
        function(tx) {
          tx.executeSql('INSERT INTO bookmark (content_id, content_table) VALUES (?, ?)',
            [el.data('id'), el.data('table')]);
        },
        function() {console.log('bookmarks::save SQL ERROR');},
        bookmark.updateButton(el)
      );
      Parse.Analytics.track('save_bookmark', {action: 'save', node: String(el.data('id')), table: el.data('table') });
    },
    updateButton: function(button) {
      // do this for both buttons and stars on the bookmarks page
      button.toggleClass('active');

      // check to make sure this is a button (i.e., at the bottom of a page of content),
      // not a star on the bookmarks page
      if (button.is('button')) {
        // use a little animation to clue in the user that something is happening
        var fontsize = button.css('font-size');
        var txt = button.is('.active') ? 'Remove from favorites' : 'Add to favorites';

        // we don't want the button to resize, just the text within it
        var height = button.css('height');
        button.css('min-height', height);

        button.animate({"font-size": '0px'}, {duration: 100, complete: function() {
          button.text(txt).animate({"font-size": fontsize}, 100);
        }});
      } else {
        // clean up the bookmarks page
        bookmark.removeUnfavoritedItems();
      }
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
      this.data.content_type = 'table-striped'; // this has a funny name; it's used to set a class on the table

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
          title: item.title
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
        this.link_url = '#node/' + this.id;
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
    },
    removeUnfavoritedItems: function() {
      // TODO: this selector should be... more selective
      $('table.table .toggle-fave').not('.active').parent('tr').remove();
    }
});

$(document).ready(function () {
  bookmark.initialize();
});