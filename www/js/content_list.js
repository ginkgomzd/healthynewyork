var content_list = _.extend(new Controller(), {
  main: function() {
    this.qs = _.qs(this.destination);
    this.fetchData();
  },
  fetchData: function() {
    this.data = {};
    this.data.rows = [];
    this.data.page_title = this.qs.page_title;
    this.data.table_class = this.qs.content_type;

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
    content_list.data.tbody = '';

    if (content_list.qs.content_type === 'health_checklist') {
      // TODO
    } else {
      var src = $('#content_list_table_row_tpl').html();
      var row_tpl = _.template(src);

      var i = 1;
      $.each(content_list.data.rows, function() {
        var row_data = this;
        row_data.icon_inner = (content_list.qs.content_type === 'money_saving_tips' ? i++ : '');
        content_list.data.tbody += row_tpl(row_data);
      });
    }
    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);
    content_list.rendered = template(content_list.data);
  },
  buildQueries: function(tx) {
    tx.executeSql('SELECT import_id, title, link, icon_class FROM content WHERE type = ?',
      [content_list.qs.content_type],
      content_list.parseResult
    );
  },
  parseResult: function(tx, result) {
    var contentUrl = '';

    for(var i=0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      if(typeof item.link === 'string' && item.link.length > 0) {
        urlParts = $.parseJSON(item.link);
        contentUrl = urlParts.controller + '?' + 'content_type=' + urlParts.content_type
          + '&page_title=' + urlParts.page_title;
      } else {
        contentUrl = 'content_leaf?id=' + item.import_id;
      }
      content_list.data.rows.push({title_text: item.title, link_url: contentUrl, icon_class: item.icon_class});
    }
  },
  usesBackButton: true,

  /**
   * @returns {String} One or more space-separated classes to be added to the class
   * attribute of the content element
   */
  setContentClasses: function() {
    return 'content_list';
  }
});