var tablePage = {
  initialize: function() {
    this.bindEvents();

    // facilitate theming
    $('#content').addClass('has-tables');
  }
};

$(document).ready(function () {
  tablePage.initialize();
});