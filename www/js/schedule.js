var schedule = _.extend(new Controller(), {
  formFields: {},
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('submit', 'form#schedule', this.handleSubmit);
    $('body').on('change', 'form#schedule select[name="insurance_carrier"]', this.populateInsurancePlans);
  },
  /**
   * This is a placeholder function to retrieve the list of insurance carriers the user may select;
   * the real thing will probably do a DB lookup.
   */
  getInsuranceCarriers: function() {
    return [
      {
        id: 300,
        name: 'Aetna'
      },
      {
        id: 1109,
        name: 'Blue Choice Health Plan'
      }
    ];
  },
  /**
   * This is a placeholder function to retrieve the list of insurance plans the user may select;
   * the real thing will probably do a DB lookup.
   */
  getInsurancePlans: function() {
    var carrier = $('form#schedule select[name="insurance_carrier"]').val();
    if (carrier === '300') {
      return [
        {
          id: 11187,
          name: 'Aetna Advantage PD'
        },
        {
          id: 8252,
          name: 'Aetna Basic HMO'
        }
      ];
    } else if (carrier === '1109') {
      return [
        {
          id: 9309,
          name: 'BlueCard PPO/EPO'
        },
        {
          id: 9310,
          name: 'BludeCard Traditional'
        },
        {
          id: 9303,
          name: 'BlueChoice Advantage'
        }
      ];
    }
  },
  /**
   * This is a placeholder function to populate the list of insurance carriers the user may select.
   */
  populateInsuranceCarriers: function() {
    var carriers = this.getInsuranceCarriers();
    $.each(carriers, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      $('form#schedule select[name="insurance_carrier"]').append(opt);
    });
  },
  /**
   * This is a placeholder function to populate the list of insurance plans the user may select.
   */
  populateInsurancePlans: function() {;
    $('form#schedule select[name="insurance_plan"] option:not(:first)').remove();
    var plans = schedule.getInsurancePlans();
    $.each(plans, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      $('form#schedule select[name="insurance_plan"]').append(opt);
    });
  },
  /**
   * Handles the submission of the ask a question form
   *
   * @param {jQuery event} e
   * @returns {undefined}
   */
  handleSubmit: function(e) {
    e.preventDefault();

    schedule.formFields.insurance_carrier = {
      element: $('form#schedule [name="insurance_carrier"]')
    };
    schedule.formFields.insurance_plan = {
      element: $('form#schedule [name="insurance_plan"]')
    };
    schedule.getFormValues();
    schedule.showResults();
  },
  showResults: function () {
    $('form#schedule').hide();
    var qs = '';
    $.each(this.formFields, function(k, v) {
      qs += k + '=' + v.value + '&';
    });
    $('#zocdoc_frame').show().attr('src','http://www.zocdoc.com/search/'+'?'+ qs);

    // configure the back button to bring back the form
    $('#toggle-offcanvas').hide();
    $('#back').show().on('tap', this.setBackButtonPostSubmit);
  },
  /**
   * Get values for each form field.
   */
  getFormValues: function() {
    $.each(this.formFields, function(k, v) {
      schedule.formFields[k].value = v.element.val();
    });
  },
  main: function() {
    this.renderTpl();
    this.populateInsuranceCarriers();
  },
  renderTpl: function() {
    var src = $('#schedule_tpl').html();
    var content_tpl = _.template(src);
    this.rendered = content_tpl();
    this.updateDisplay();
  },
  setBackButtonPostSubmit: function(e) {
    // disable all listeners for this event
    e.preventDefault();
    e.stopImmediatePropagation();

    $('#zocdoc_frame').hide();
    $('form#schedule').show();

    // remove this (and all other) listener(s)
    $('#back').off('tap');

    // turn back on the routing listener
    $('body').on('tap', '#back', function(e){
      app.router.route(e);
    });
  },
  setContentClasses: function() {
    return '';
  }
});

$(document).ready(function () {
  schedule.initialize();
});