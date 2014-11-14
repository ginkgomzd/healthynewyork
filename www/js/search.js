var search = _.extend(new Controller(), {
  whereClause: new String,
  fromClause: 'FROM content',
  selectClause: new String,
  main: function() {
    ctl = search;
    ctl.qs = _.qs(ctl.destination);

    ctl.renderTpl();
//    ctl.fetchData();
    ctl.updateDisplay();
  },
  initialize: function() {
    this.bindEvents();
  },
  renderTpl: function() {
    var src = $('#search_form_tpl').html();
    var content_tpl = _.template(src);
    ctl.rendered = content_tpl();
  },
  handleSubmit: function(e) {
    e.preventDefault();
    console.log('Form Submit');
    input = $('form#search input')[0];
    if (search.validateForm() === false) {
      search.noResults();
    } else {
      input = $('form#search input')[0];
      search.doSearch(input);
    }
  },
  validateForm: function() {
    input = $('form#search input')[0];
    if (input.value === "") {
      console.log('validateForm::no query received');
      return false;
    }
    return true;
  },
  noResults: function() {
    $('#search_results').hide();
    $('#no_search_results').show();
  },
  showResults: function() {
    $('#no_search_results').hide();
    $('#search_results').show();
  },
  doSearch: function(input) {
    search.buildWhere(input.value.split(' '));
    search.selectClause = 'SELECT id, title';
    sql = search.buildQuery(
            search.selectClause, search.fromClause, search.whereClause);
    console.log(sql);

    search.showResults();
  },
  buildQuery: function(select, from, where) {
    return select+' '+from+' '+where;
  },
  buildWhere: function(searchTerms) {
    search.whereClause = 'WHERE ';
    search.whereClause += search.formatTerms('content.title', searchTerms);
    search.whereClause += ' OR '+ search.formatTerms('content.body', searchTerms);
    return search.whereClause;
  },
  formatTerms: function(field, searchTerms) {
    tplWhere = _.template("<%= field %> LIKE '%<%= search_term %>%'");
    parts = [];
    for(i=0; i< searchTerms.length; i++) {
      term = searchTerms[i];
      parts[i] = tplWhere({field: field, search_term: term});
    }
    return '('+parts.join(' AND ')+')';
  },
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
  bindEvents: function() {
    // handle form submissions
    $('body').on('submit', 'form#search',this.handleSubmit);
  }
});

$(document).ready(function () {
  search.initialize();
});
