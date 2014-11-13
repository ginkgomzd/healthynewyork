var ask = _.extend(new Controller(), {
  formFields: {},
  formErrors: {},
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('submit', 'form#ask', this.handleSubmit);
  },
  /**
   * Handles the submission of the ask a question form
   *
   * @param {jQuery event} e
   * @returns {undefined}
   */
  handleSubmit: function(e){
    e.preventDefault();

    ask.formFields.email = {
      element: $('form#ask [name="email"]'),
      googleName: "entry.1020011979"
    };
    ask.formFields.question = {
      element: $('form#ask [name="question"]'),
      googleName: "entry.580093334"
    };
    ask.getFormValues();

    if (ask.formValidate() === true) {
      ask.formPost();
    } else {
      $('#modal .modal-title').empty().html('<h1>Question not submitted</h1>');
      $('#modal .modal-body').empty().html('<p>Please correct the following errors:</p><ul></ul>');

      $.each(ask.formErrors, function (k, v){
        $('#modal .modal-body ul').append('<li>' + v + '</li>');
      });

      $('#modal').modal('show');
    }
  },
  /**
   * Get values for each form field.
   */
  getFormValues: function() {
    $.each(this.formFields, function(k, v) {
      ask.formFields[k].value = v.element.val();
    });
  },
  main: function() {
    this.renderTpl();
  },
  renderTpl: function() {
    var src = $('#ask_form_tpl').html();
    var content_tpl = _.template(src);
    this.rendered = content_tpl();
    this.updateDisplay();
  },
  /**
   * Posts the data to YI's Google Form
   */
  formPost: function() {
    var data = {};
    $.each(this.formFields, function() {
      data[this.googleName] = this.value;
    });

    var result = $.post(
      'https://docs.google.com/forms/d/1RguP0c51sn8RZn5h2urGJl4WR8g_O4xJMOtThEIViZg/formResponse',
      data,
      function() {
        $('#modal .modal-title').empty().html('<h1>Question Submitted</h1>');
        $('#modal .modal-body').empty().html('<p>Thanks for your question. We will respond within two (2) business days.</p>');
        $('#modal').modal('show');
      }
    ).fail(function(jqXHR, status, error) {
      $('#modal .modal-title').empty().html('<h1>Connection Error</h1>');
      $('#modal .modal-body').empty().html('<p>Could not connect to server. Check your network connection.</p>');
      $('#modal').modal('show');
    });
  },
  /**
   * Checks for a valid email address and question at least one character long.
   *
   * @return {Boolean}
   */
  formValidate: function() {
    if (validateEmail(this.formFields.email.value) === false) {
      this.formErrors.email = 'Please enter a valid email address';
    }

    if (this.formFields.question.value.length < 1) {
      this.formErrors.question = 'Please enter a question';
    }

    return (Object.keys(this.formErrors).length === 0);
  }
});

$(document).ready(function () {
  ask.initialize();
});