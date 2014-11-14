var schedule = _.extend(new Controller(), {
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
        id: 7,
        name: 'Aetna'
      },
      {
        id: 8,
        name: 'BlueCross BlueShield'
      }
    ];
  },
  /**
   * This is a placeholder function to retrieve the list of insurance plans the user may select;
   * the real thing will probably do a DB lookup.
   */
  getInsurancePlans: function() {
    var carrier = $('form#schedule select[name="insurance_carrier"]').val();
    if (carrier === '7') {
      return [
        {
          id: 901,
          name: 'Aetna HMO'
        },
        {
          id: 702,
          name: 'Aetna PPO'
        }
      ];
    } else if (carrier === '8') {
      return [
        {
          id: 777,
          name: 'BlueCross PPO'
        },
        {
          id: 202,
          name: 'BlueCross HMO'
        },
        {
          id: 111,
          name: 'BlueCross ABC'
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
   *
   * @param {jQuery event} e
   * @returns {undefined}
   */
  handleSubmit: function(e) {

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

    qs='dr_specialty=&address=&insurance_carrier=400&refine_search=Find+a+Doctor';
    $('#zocdoc_frame').attr('src','http://www.zocdoc.com/'+'?'+ qs);
  }
});

$(document).ready(function () {
  schedule.initialize();
});