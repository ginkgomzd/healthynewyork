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
      // TODO
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

    // todo: success/failure handlers
    var result = $.post(
      'https://docs.google.com/forms/d/1RguP0c51sn8RZn5h2urGJl4WR8g_O4xJMOtThEIViZg/formResponse',
      data
    )
      .fail(function(jqXHR, status, error) {
        alert(status + ": " + error);
      }
    );
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