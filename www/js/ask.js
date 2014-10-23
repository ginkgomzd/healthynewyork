var ask = _.extend(new Controller(), {
  main: function() {
    this.renderTpl();
  },
  renderTpl: function() {
    var src = $('#ask_form_tpl').html();
    var content_tpl = _.template(src);
    this.rendered = content_tpl();
    this.updateDisplay();
  }
});