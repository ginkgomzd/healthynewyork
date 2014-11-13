var schedule = _.extend(new Controller(), {
  main: function() {
    this.renderTpl();
  },
  renderTpl: function() {

    var src = $('#schedule_tpl').html();
    var content_tpl = _.template(src);
    this.rendered = content_tpl();
    this.updateDisplay();

    qs='dr_specialty=&address=&insurance_carrier=400&refine_search=Find+a+Doctor';
    $('#zocdoc_frame').attr('src','http://www.zocdoc.com/'+'?'+ qs);

  }
});