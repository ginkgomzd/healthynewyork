var coverage_info = _.extend(new Controller(), {
  main: function() {
    this.qs = _.qs(this.destination);
    this.fetchData();
    this.render();
  },
  fetchData: function() {
    this.data = {};
    this.data.rows = [
      {content_type: 'health_checklist', title: 'Health Checklist'},
      {content_type: 'insurance_basics', title: 'Insurance Basics'},
      {content_type: 'money_saving_tips', title: 'Money-Saving Tips'},
      {content_type: 'health_care_rights', title: 'Health Care Rights'}
    ];
  },
  render: function(data) {
    var src = $('#coverage_info_row_tpl').html();
    var row_tpl = _.template(src);
    this.rendered = '';

    $.each(this.data.rows, function() {
      coverage_info.rendered += row_tpl({
        container_class: this.content_type,
        link_url: 'faq?content_type=' + this.content_type,
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
  },

  /**
   * Overrides "parent" stub method
   */
  postUpdateDisplay: function() {
    var h = 100 / this.data.rows.length;
    h = h.toString() + '%';
    $('#content.coverage_info .container-fluid').height(h);
  }
});