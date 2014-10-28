var coverage_info = _.extend(new Controller(), {
  main: function() {
    this.qs = _.qs(this.destination);
    this.fetchData();
    this.render();
  },
  fetchData: function() {
    this.data = {};
    this.data.rows = [
      {controller: 'health_checklist', title: 'Health Checklist'},
      {controller: 'insurance_basics', title: 'Insurance Basics'},
      {controller: 'money_saving_tips', title: 'Money-Saving Tips'},
      {controller: 'health_care_rights', title: 'Health Care Rights'}
    ];
  },
  render: function(data) {
    var src = $('#coverage_info_row_tpl').html();
    var row_tpl = _.template(src);
    this.rendered = '';

    $.each(this.data.rows, function() {
      coverage_info.rendered += row_tpl({
        container_class: this.controller,
        link_url: this.controller,
        link_text: this.title
      });
    });

    this.updateDisplay();
  }
});