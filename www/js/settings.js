var settingsBase = {
  insurance_carriers: {},
  activePath: '#settings',
  formFields: {},
  formErrors: {},
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $('body').on('submit', 'form#settings', this.handleSubmit);
    $('body').on('change', 'form#settings select[name="insurance_carrier"]', settings.populateInsurancePlans);
  },
  /**
   * Handles the submission of the settings a question form
   *
   * @param {jQuery event} e
   * @returns {undefined}
   */
  handleSubmit: function(e){
    e.preventDefault();

    // reset error registry
    settings.formErrors = {};

    settings.getFormValues();

    if (settings.formValidate() === true) {
      settings.saveProfileData();
    } else {
      $('#modal .modal-title').empty().html('<h1>Settings not saved</h1>');
      $('#modal .modal-body').empty().html('<p>Please correct the following errors:</p><ul></ul>');

      $.each(settings.formErrors, function (k, v){
        $('#modal .modal-body ul').append('<li>' + v + '</li>');
      });

      $('#modal').modal('show');
    }
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
          WHERE profile_id = "0"',
          [],
          settings.bindData
        )
      },
      function(tx, er){
        console.log("Transaction ERROR: "+ er.message);
      }
    );
  },
  /**
   * Save profile Data (contents of the model - use getFormValues first)
   * @returns {undefined}
   */
  saveProfileData: function() {
    var profile_id = '0';
    localDB.db.transaction(
      function(tx) {
        tx.executeSql('INSERT or REPLACE into personal_info (profile_id, key, value) VALUES (?, ?, ?)',
          [profile_id, 'email', settings.formFields.email.value]);

        tx.executeSql('INSERT or REPLACE into personal_info (profile_id, key, value) VALUES (?, ?, ?)',
          [profile_id, 'provider', settings.formFields.provider.value]);

        tx.executeSql('INSERT or REPLACE into personal_info (profile_id, key, value) VALUES (?, ?, ?)',
          [profile_id, 'plan', settings.formFields.plan.value]);

        tx.executeSql('INSERT or REPLACE into personal_info (profile_id, key, value) VALUES (?, ?, ?)',
          [profile_id, 'zipcode', settings.formFields.zipcode.value]);
      },
      function() {console.log('settings::saveProfileData SQL ERROR');},
      settings.confirmSaved()
    );
  },
  confirmSaved: function() {
    $('#modal .modal-title').empty().html('<h1>Personal Settings</h1>');
    $('#modal .modal-body').empty().html('<p>Your settings have been saved.</p>');
    $('#modal').modal('show');
  },
  bindData: function(tx, result) {
    settings.setFormValues(result.rows);
    settings.populateInsuranceCarriers();
    settings.populateInsurancePlans();
  },
  /**
   * Update form model from user entry
   * @returns none
   */
  getFormValues: function() {
    if (Object.keys(settings.formFields).length === 0) {
      settings.findFormElements();
    }
    $.each(this.formFields, function(k, v) {
      settings.formFields[k].value = v.element.val();
    });
  },
  /**
   * Assign values to form model, update elements with model;
   * @param array values
   * @returns none
   */
  setFormValues: function(values) {
    settings.findFormElements();

    if (values !== null) {
      for(var i = 0; i < values.length; i++) {
        var item = values.item(i);
        switch (item.key) {
          case 'email':
            settings.formFields.email.value = item.value;
            settings.formFields.email.element.val(item.value);
            break;
          case 'provider':
            settings.formFields.provider.value = item.value;
            break;
          case 'plan':
            settings.formFields.plan.value = item.value;
            break;
          case 'zipcode':
            settings.formFields.zipcode.value = item.value;
            settings.formFields.zipcode.element.val(item.value);
            break;
        }
      }
    }
  },
  /**
   * Initialize form model with references to DOM elements
   * @returns {undefined}
   */
  findFormElements: function() {
    settings.formFields.email = {
      element: $('form [name="email"]')
    };
    settings.formFields.provider = {
      element: $('form [name="insurance_carrier"]'),
    };
    settings.formFields.plan = {
      element: $('form [name="insurance_plan"]'),
    };
    settings.formFields.zipcode = {
      element: $('form [name="zipcode"]'),
    };
  },
  main: function() {
    this.renderTpl();
    console.log('Settings.Main()');
    schedule.fetchInsuranceCarriers(this.fillInsuranceCarriers);
    this.fetchProfileData();
  },
  renderTpl: function() {
    var src = $('#settings_form_tpl').html();
    var content_tpl = _.template(src);
    this.rendered = content_tpl();
    this.updateDisplay();
  },
  /**
   * Checks for a valid email address and question at least one character long.
   *
   * @return {Boolean}
   */
  formValidate: function() {
    var email = this.formFields.email.value;
    if (email != '' && validateEmail(email) === false) {
      this.formErrors.email = 'Please enter a valid email address';
    }

    var zipcode = this.formFields.zipcode.value;
    var zipIsValid = validateZIP(zipcode);
    if (this.formFields.zipcode.value != '' && zipIsValid !== true) {
      this.formErrors.zip = zipIsValid;
    }

    return (Object.keys(this.formErrors).length === 0);
  },
  fillInsuranceCarriers: function(tx, result) {
    console.log('Settings::fillInsuranceCarriers');
    var item = result.rows.item(0);
    settings.insurance_carriers = JSON.parse(item.value);
  },
  /**
   * This is a placeholder function to populate the list of insurance carriers the user may select.
   */
  populateInsuranceCarriers: function() {
    var select = $('form select[name="insurance_carrier"]');
    $.each(settings.insurance_carriers, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      select.append(opt);
    });
    select.val(settings.formFields.provider.value);
    select.select2();
  },
  /**
   * This is a placeholder function to populate the list of insurance plans the user may select.
   */
  populateInsurancePlans: function() {
    $('form select[name="insurance_plan"] option:not(:first)').remove();
    var plans = schedule.getInsurancePlans(settings.insurance_carriers);
    var select = $('form select[name="insurance_plan"]');
    $.each(plans, function(){
      var opt = '<option value="' + this.id + '">' + this.name + '</option>';
      select.append(opt);
    });
    select.val(settings.formFields.plan.value);
    select.select2();
  }
};

var settings = _.extend(new Controller(), settingsBase);

$(document).ready(function () {
  settings.initialize();
});