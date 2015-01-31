var scheduleBase =  {
  formFields: {},
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('submit', 'form#schedule', this.handleSubmit);
    $('body').on('change', 'form#schedule select[name="insurance_carrier"]', this.populateInsurancePlans);
    $('body').on('change', 'form#schedule select[name="insurance_plan"]', this.askSaveSelection);
    $('body').on('click', '#saveCancel #modal-save', this.saveToProfile);
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
    var carrier = $('form select[name="insurance_carrier"]').val();
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
    } else {
      return [];
    }
  },
  /**
   * This is a placeholder function to populate the list of insurance carriers the user may select.
   */
  populateInsuranceCarriers: function() {
    var carriers = this.getInsuranceCarriers();
    $('form select[name="insurance_carrier"] option:not(:first)').remove();
    var select = $('form select[name="insurance_carrier"]');
    $.each(carriers, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      select.append(opt);
    });

    if (schedule.formFields.hasOwnProperty('insurance_carrier')) {
      select.val(schedule.formFields.insurance_carrier.value);
    }
  },
  /**
   * This is a placeholder function to populate the list of insurance plans the user may select.
   */
  populateInsurancePlans: function() {;
    $('form select[name="insurance_plan"] option:not(:first)').remove();
    var plans = schedule.getInsurancePlans();
    var select = $('form select[name="insurance_plan"]');
    $.each(plans, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      select.append(opt);
    });

    if (typeof schedule.formFields.hasOwnProperty('insurance_plan')) {
      select.val(schedule.formFields.insurance_plan.value);
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

    schedule.formFields.insurance_carrier = {
      element: $('form [name="insurance_carrier"]')
    };
    schedule.formFields.insurance_plan = {
      element: $('form [name="insurance_plan"]')
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
  /**
   * Initialize form model with references to DOM elements
   * @returns {undefined}
   */
  findFormElements: function() {
    schedule.formFields.insurance_carrier = {
      element: $('form [name="insurance_carrier"]'),
    };
    schedule.formFields.insurance_plan = {
      element: $('form [name="insurance_plan"]'),
    };
  },
  main: function() {
    this.renderTpl();
    this.populateInsuranceCarriers();
    this.fetchProfileData();
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
  },
  /**
  * Fetches all settings
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
  askSaveSelection: function(e) {
    if ($(e.target).val() === schedule.formFields.insurance_plan.value) {
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
  }
}

var schedule = _.extend(new Controller(), scheduleBase);

$(document).ready(function () {
  schedule.initialize();
});