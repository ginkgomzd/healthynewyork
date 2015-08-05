var content_list = _.extend(new Controller(), {
  main: function(id) {
    content_list.id = id;
    content_list.fetchData();
  },
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('tap', 'td.icon', function(e){
      if (content_list.data.content_type === "health_checklist") {
        var el = $(this);
        var id = el.data("id");
        if(content_list.data.checklist[id]) {
          content_list.data.checklist[id] = false;
          el.removeClass("checked");
        } else {
          content_list.data.checklist[id] = true;
          el.addClass("checked");
        }

        content_list.saveChecklist();
      }
      e.preventDefault();
    });
  },
  fetchData: function() {
    content_list.data = {};
    content_list.data.rows = [];

    localDB.db.transaction(content_list.fetchListNode,
      // TODO: we need a generic error handler
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      }
    );
  },
  bindData: function(data) {
    var tpl_src = $('#table_page_tpl').html();
    var template = _.template(tpl_src);

    if(content_list.data.content_type == "health_checklist") {
      content_list.data.pre_table = '<p>When you\'ve completed an item, tap its number in the list to check it off.</p>';
    }
    content_list.data.tbody = '';

    var src = $('#content_list_table_row_tpl').html();
    var row_tpl = _.template(src);

    var i = 1;
    $.each(content_list.data.rows, function() {
      var row_data = this;
      row_data.checkmark_class = '';
      row_data.icon_inner = (row_data.icon_class !== null ? '' : i++);
      if(content_list.data.content_type == "health_checklist") {
        row_data.icon_class = "checkIndex";
        if(content_list.data.checklist[ row_data.id ]) {
          row_data.checkmark_class = 'checked';
        }
      }
      content_list.data.tbody += row_tpl(row_data);
    });

    content_list.rendered = template(content_list.data);
  },
  fetchListNode: function(tx) {
    tx.executeSql('SELECT "type", "title", "list_contains" FROM "content" WHERE "import_id" = ?',
      [content_list.id],
      function(tx, result) {
        if (result.rows.length < 1) {
          console.log('Could not route request; node ID invalid or no such node.');
        } else {
          var item = result.rows.item(0);
          content_list.data.page_title = item.title;
          content_list.data.content_type = item.list_contains;
          content_list.fetchList();
        }
      }
    );
  },
  fetchList: function(tx) {
    localDB.db.transaction(content_list.buildQueries,
      // TODO: we need a generic error handler
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      },
      function(){
        if(content_list.data.content_type === "health_checklist") {
          content_list.fetchChecklist();
        } else {
          content_list.bindData();
          content_list.updateDisplay();
        }
      }
    );
  },
  buildQueries: function(tx) {
    tx.executeSql('SELECT "import_id", "title", "icon_class" FROM "content" WHERE "type" = ?',
      [content_list.data.content_type],
      content_list.parseResult
    );
  },
  parseResult: function(tx, result) {
    for(var i=0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      content_list.data.rows.push({title_text: item.title, link_url: '#node/' + item.import_id, id: item.import_id, icon_class: item.icon_class});
    }
  },
  fetchChecklist: function() {
    localDB.db.transaction(
        function(tx){
          tx.executeSql(
              'SELECT "value" FROM "settings" WHERE key="health_checklist"',
              [],
              function(tx, result) {
                if(result.rows.length > 0) {
                  var item = result.rows.item(0);
                  content_list.data.checklist = JSON.parse(item.value);
                } else {
                  content_list.data.checklist = {};
                }
                content_list.bindData();
                content_list.updateDisplay();
              },
              function(tx, er){
                console.log("Transaction ERROR: "+ er.message);
              }
          )
        }
    );
  },
  saveChecklist: function() {
    //Not 100% why data has to be a var and not called inline,
    //but that is the only way it works.
    var data = JSON.stringify(content_list.data.checklist);
    localDB.db.transaction(
        function(tx) {
          tx.executeSql('REPLACE INTO "settings" ("key", "value") VALUES (?,?)', ['health_checklist', data]);
        },
        function() {console.log('Checklist::Update SQL ERROR');}
    );
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

$(document).ready(function () {
  content_list.initialize();
});