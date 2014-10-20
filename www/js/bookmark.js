var bookmark = {
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
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call class methods, we
    // must explicitly call 'bookmark.myMethod(...);'
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

      // load up state from DB
      $('.toggle-fave').each(function(){
        var el = $(this);
        var content_id = el.data('id');
        var content_table = el.data('table');

        localDB.db.transaction(
          function(tx) {
            tx.executeSql('SELECT COUNT(*) AS cnt FROM bookmark WHERE content_id = ? AND content_table = ?',
              [content_id, content_table],
              function (tx, results) {
                $.each(results.rows.item(0), function (key, value) {
                  el.toggleClass('active', (results.rows.item(0).cnt === 1));
                });
              });
          },
          localDB.installError,
          localDB.installSuccess
        );
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
    }
};

$(document).ready(function () {
  bookmark.initialize();
});