var scheduleBase =  {
  activePath: '#schedule',
  formFields: {},
  /**
   * @type Array Insurance carriers, in the format [{id=,name=,plans={id=,name=}}]
   */
  insurance_carriers: [],
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('submit', 'form#schedule', this.handleSubmit);
    $('body').on('change', 'form#schedule select[name="insurance_carrier"]', this.populateInsurancePlans);
    $('body').on('change', 'form#schedule select[name="insurance_plan"]', this.askSaveSelection);
    $('body').on('click', '#saveCancel #modal-save', this.saveToProfile);
    $('body').on('change', '#saveCancel .dont-nag-me', this.dontNag);
  },
  main: function() {
    this.renderTpl();
    this.fetchInsuranceCarriers();
    this.fetchProfileData();
  },
  /**
   * Get the carriers array from the db
   */
  fetchInsuranceCarriers: function() {
    localDB.db.transaction(
      function(tx){
        tx.executeSql(
          'SELECT "value" FROM "settings" WHERE key="insurance_plans"',
          [],
          schedule.fillInsuranceCarriers,
          function(tx, er){
            console.log("Transaction ERROR: "+ er.message);
          }
        )
      }
    );
  },
  /**
   * Called from fetchInsuranceCarriers when db query finishes
   */
  fillInsuranceCarriers: function(tx, result) {
    var item = result.rows.item(0);
    schedule.insurance_carriers = JSON.parse(item.value);

    schedule.populateInsuranceCarriers();
    schedule.populateInsurancePlans();
  },
  /**
  * Fetches all saved settings from db
  * @returns {undefined}
  */
  fetchProfileData: function() {
    localDB.db.transaction(
      function(tx){
        tx.executeSql(
          'SELECT "key", "value" FROM "personal_info" \
          WHERE profile_id = "0" AND (key = "plan" OR key = "provider")',
          [],
          schedule.fillSavedSelections
        )
      },
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      }
    );
  },
  /**
   * Called from fetchProfileData when db query finishes
   */
  fillSavedSelections: function(tx, result) {
    schedule.findFormElements();

    for(var i = 0; i < result.rows.length; i++) {
      var item = result.rows.item(i);
      switch (item.key) {
        case 'provider':
          schedule.formFields.insurance_carrier.value = item.value;
          break;
        case 'plan':
          schedule.formFields.insurance_plan.value = item.value;
          break;
      }
    }
    schedule.populateInsuranceCarriers();
    schedule.populateInsurancePlans();
  },
  /**
   * Get an array of insurance plans, in the format [{id=,name=}]
   */
  getInsurancePlans: function() {
    var carrier = {};
    var carrier_id = $('form select[name="insurance_carrier"]').val();
    $.each(schedule.insurance_carriers, function() {
      if (this['id'] === carrier_id) {
        carrier = this;
      }
    });
    return carrier.hasOwnProperty('plans') ? carrier.plans : [];
  },
  /**
   * Populate the list of insurance carriers the user may select.
   */
  populateInsuranceCarriers: function() {
    $('form select[name="insurance_carrier"] option:not(:first)').remove();
    var select = $('form select[name="insurance_carrier"]');
    $.each(schedule.insurance_carriers, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      select.append(opt);
    });

    schedule.setDefaultOption('insurance_carrier');
    select.select2();
  },
  /**
   * Populate the list of insurance plans the user may select.
   */
  populateInsurancePlans: function() {;
    $('form select[name="insurance_plan"] option:not(:first)').remove();
    var plans = schedule.getInsurancePlans();
    var select = $('form select[name="insurance_plan"]');
    $.each(plans, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      select.append(opt);
    });

    schedule.setDefaultOption('insurance_plan');
    select.select2();
  },
  /**
   * @param {String} field Name of the select field to set the default value for
   */
  setDefaultOption: function(field) {
    var select = $('form select[name="' + field + '"]');
    if (schedule.formFields.hasOwnProperty(field)
      && schedule.formFields[field].hasOwnProperty('value')
      && $("form select[name='" + field + "'] option[value='" + schedule.formFields[field].value + "']").length > 0)
    {
      select.val(schedule.formFields[field].value);
    } else {
      select.val('');
    }
  },
  /**
   * Handles the submission of the ask a question form
   *
   * @param {jQuery event} e
   * @returns {undefined}
   */
  handleSubmit: function(e) {
    e.preventDefault();
    $("#loading-div").show();

    schedule.formFields.insurance_carrier = {
      element: $('form [name="insurance_carrier"]')
    };
    schedule.formFields.insurance_plan = {
      element: $('form [name="insurance_plan"]')
    };
    schedule.getFormValues();
    schedule.showResults();

    $('#zocdoc_frame').load(function() { $("#loading-div").hide(); });
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
    $('#back').show().on('tap.schedule', this.setBackButtonPostSubmit);
  },
  /**
   * Get values for each form field.
   */
  getFormValues: function() {
    $.each(this.formFields, function(k, v) {
      schedule.formFields[k].value = v.element.val();
    });
  },
  /**
   * Initialize form model with references to DOM elements
   * @returns {undefined}
   */
  findFormElements: function() {
    schedule.formFields.insurance_carrier = {
      element: $('form [name="insurance_carrier"]')
    };
    schedule.formFields.insurance_plan = {
      element: $('form [name="insurance_plan"]')
    };
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

    $('#zocdoc_frame').hide();
    $('form#schedule').show();

    $('#toggle-offcanvas').show();

    // TODO: The listener is only unregistered if the user clicks the back button;
    // if the user navigates away from the page, e.g., via the navigation menu,
    // the listener stays attached and breaks the back-button functionality.
    $('#back').off('tap.schedule', this.setBackButtonPostSubmit).hide();
  },
  setContentClasses: function() {
    return '';
  },
  askSaveSelection: function(e) {
    if ( app.dontNagMe === 1 || $(e.target).val() === schedule.formFields.insurance_plan.value) {
      return; // don't alert
    }

    $('#saveCancel .modal-title').empty().html('<h1>Remember Selection?</h1>');
    $('#saveCancel .modal-body').empty().html('<p>To save time, click Save to remember this selection.</p>');
    $('#saveCancel').modal('show');

  },
  saveToProfile: function() {
    var profile_id = '0';
    schedule.getFormValues();
    localDB.db.transaction(
      function(tx) {
        tx.executeSql('INSERT or REPLACE into personal_info (profile_id, key, value) VALUES (?, ?, ?)',
          [profile_id, 'provider', schedule.formFields.insurance_carrier.value]);

        tx.executeSql('INSERT or REPLACE into personal_info (profile_id, key, value) VALUES (?, ?, ?)',
          [profile_id, 'plan', schedule.formFields.insurance_plan.value]);
      },
      function(tx, err) {
        console.log('schedule::saveToProfile SQL ERROR');
        console.log(err.message);
      },
      settings.confirmSaved()
    );
  },
  dontNag: function(e) {
    if ($(e.target).is(':checked')) {
      app.dontNagMe = 1;
    } else {
      app.dontNagMe = 0;
    }
  }
}

var schedule = _.extend(new Controller(), scheduleBase);

$(document).ready(function () {
  schedule.initialize();
});