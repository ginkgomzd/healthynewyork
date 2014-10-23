var search = _.extend(new Controller(), {
  main: function() {
    ctl = search;
    ctl.qs = _.qs(ctl.destination);

    ctl.renderTpl();
//    ctl.fetchData();
    ctl.updateDisplay();
  },
  renderTpl: function() {
    var src = $('#search_form_tpl').html();
    var content_tpl = _.template(src);
    ctl.rendered = content_tpl();
  }
//  fetchData: function() {
//    ctl.data = {};
//    ctl.data.rows = [];
//    faq.data.page_title = this.content_type;
//
//    localDB.db.transaction(this.buildQueries,
//      // TODO: we need a generic error handler
//      function(tx, er){
//        console.log("Transaction ERROR: "+ er.message);
//      },
//      function(){
//        ctl.bindData();
//        ctl.updateDisplay();
//      }
//    );
//  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  ,
  bindEvents: function() {
    // handle form submissions
    $('body').on('submit', 'form#search',
      function(e) {
      e.preventDefault();
      $('#search_results').show();
      // TODO: database write
    });
  }
});

search.bindEvents();
