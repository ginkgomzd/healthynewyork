var search = _.extend(new Controller(), {
  query: new String,
  whereClause: new String,
  fromClause: 'FROM content',
  selectClause: new String,
  zeroRows: false,
  renderedResults: {},
  main: function() {
    ctl = search;

    ctl.renderTpl();
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
    search.zeroRows = true;
    
    if (search.validateForm() === false) {
      return;
    }
    search.data = {rows: [], tbody: new String, content_type: 'table-striped' };
    search.doSearch($('form#search input#search_terms')[0]);
  },
  validateForm: function() {
    search.query = $('form#search input#search_terms').val();
    if (search.query === "") {
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
    if (search.zeroRows) {
      search.noResults();
      return;
    }
    var results = $('#search_results');
    results.empty();
    results.html(search.renderedResults);

    $('#no_search_results').hide();
    results.show();
  },
  doSearch: function() {
    localDB.db.transaction(this.doQuery,
      function(er){
        console.log("Transaction ERROR: "+ er.message);
      },
      function(){
        search.bindData();
        search.showResults();
      }
    );
  },
  bindData: function() {
    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);
    var src = $('#content_list_table_row_tpl').html();
    var row_tpl = _.template(src);

    $.each(search.data.rows, function() {
      search.data.tbody += row_tpl(this);
    });
    search.renderedResults = template(search.data);
  },
  doQuery: function(tx) {
    tx.executeSql(search.buildQuery(), [],
    search.queryCallback);
  },
  queryCallback: function(tx, result) {
    search.zeroRows = (result.rows.length === 0);

    for(var i=0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      search.data.rows.push(
        { title_text: item.title,
          link_url: '#node/' + item.import_id,
          icon_class: null,
          icon_inner: null
        });
    }
  },
  buildQuery: function() {
    search.buildWhere(search.query.split(' '));
    search.selectClause = 'SELECT import_id, title';
    return search.selectClause+' '+search.fromClause+' '+search.whereClause;
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
  bindEvents: function() {
    $('body').on('submit', 'form#search',this.handleSubmit);
  },
  setContentClasses: function() {
    return '';
  }
});

$(document).ready(function () {
  search.initialize();
});
