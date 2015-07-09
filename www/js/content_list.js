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
          el.find("span.checkMark").fadeOut("fast", function() {
            el.find("span.checkIndex").fadeIn("fast");
            el.removeClass("checked");
          });


        } else {
          content_list.data.checklist[id] = true;
          el.find("span.checkIndex").fadeOut("fast", function() {
            el.find("span.checkMark").fadeIn("fast");
            el.addClass("checked");
          });
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
  bindDataChecklist: function(data) {
    var rows = [];
    var hc_src = $('#health_checklist_table_row_tpl').html();
    var hc_row_tpl = _.template(hc_src);

    // we're going to process these two at a time to make a two-column table like so:
    // 1   3
    // 2   4
    var cnt = data.rows.length;
    var cnt_half = Math.floor(cnt/2);
    if (cnt % 2 !== 0) {
      cnt_half++;
    }
    for (var i = 0; i < cnt/2; i++) {
      var hc_row_data = {};
      hc_row_data.icon_inner = i + 1;
      hc_row_data.icon_inner_2 = cnt_half + hc_row_data.icon_inner;

      hc_row_data.icon_class = data.rows[i].icon_class;
      hc_row_data.link_url = data.rows[i].link_url;
      hc_row_data.title_text = data.rows[i].title_text;

      var i_2 = cnt_half + i;
      if (i_2 >= cnt) { // handles the last table cells for an odd number of results
        hc_row_data.icon_inner_2 = '';
        hc_row_data.icon_class_2 = '';
        hc_row_data.link_url_2 = '';
        hc_row_data.title_text_2 = '';
      } else {
        hc_row_data.icon_class_2 = data.rows[i_2].icon_class;
        hc_row_data.link_url_2 = data.rows[i_2].link_url;
        hc_row_data.title_text_2 = data.rows[i_2].title_text;
      }
      rows += hc_row_tpl(hc_row_data);
    }
    return rows;
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