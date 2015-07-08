var coverage_info = _.extend(new Controller(), {
  activePath: '#coverage_info',
  main: function() {
    this.fetchData();
  },
  fetchData: function() {
      this.data = {};
      this.data.rows = []; // supplies data to the rows of the table

      localDB.db.transaction(this.buildQueries,
        // TODO: we need a generic error handler
        function(tx, er){
          console.log("Transaction ERROR: "+ er.message);
        },
        function(){
          coverage_info.render();
        }
      );
  },
  buildQueries: function(tx) {
    tx.executeSql(
      'SELECT "import_id", "title", "icon_class" FROM "content" \
      WHERE "type" = ?',
      ['coverage_info'],
      coverage_info.buildRows
    );
  },
  buildRows: function(tx, result) {
    for(var i = 0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      coverage_info.data.rows.push({
        id: item.import_id,
        content_type: item.type,
        title: item.title,
        class: item.icon_class
      });
    }
  },
  render: function(data) {
    var src = $('#coverage_info_row_tpl').html();
    var row_tpl = _.template(src);
    this.rendered = "";

    $.each(this.data.rows, function() {
      coverage_info.rendered += row_tpl({
        container_class: this.class,
        link_url: '#node/' + this.id,
        link_text: this.title
      });
    });

    this.updateDisplay();
  },
  /**
   * Overrides "parent" method.
   *
   * @returns {String} One or more space-separated classes to be added to the class
   * attribute of the content element
   */
  setContentClasses: function() {
    return 'coverage_info';
  }
});