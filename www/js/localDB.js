var localDB = {
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
    // must explicitly call 'localDB.myMethod(...);'
    onDeviceReady: function() {
      localDB.db = window.openDatabase("healthy", "1.0", "Healthy New York", 1000000);
      localDB.db.transaction(localDB.install, localDB.installError, localDB.installSuccess);
    },
    install: function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS bookmark (content_id INTEGER, content_table TEXT, PRIMARY KEY(content_id, content_table))');
    },
    installError: function(err) {
      alert("Install error");
    },
    installSuccess: function() {
//      alert("success!");
    }
};

$(document).ready(function () {
  localDB.initialize();
});