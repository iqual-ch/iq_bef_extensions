(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_advanced_select = {
    attach: function (context, settings) {
      if (drupalSettings.iq_bef_extensions.advanced_selects) {
        $.each(drupalSettings.iq_bef_extensions.advanced_selects_options, function (i, advancedSelectOptions) {
          var data_selector = 'edit-' + advancedSelectOptions.dataSelector;
          var $input = $("select[data-drupal-selector=" + data_selector + "]", context).once('advanced-select-filter');
          let options = {};
          if (advancedSelectOptions.placeholder) {
            options.placeholder = advancedSelectOptions.placeholder;
          }
          if (advancedSelectOptions.no_results_text) {
            options.language = {
              "noResults": function(){
                return advancedSelectOptions.no_results_text;
              }
            };
          }
          options.closeOnSelect = false;
          $chosen = $input.select2(options);
        });
      }
    }
  }

})(jQuery, Drupal, drupalSettings);

