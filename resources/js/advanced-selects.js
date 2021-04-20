(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_advanced_select = {
    attach: function (context, settings) {
      $('.select2-container--open').remove();
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

          options.templateResult = function(state) {
            let $state = $('<span class="checkbox">');
            let label = state.text.split('-').filter(Boolean).join('-');
            $state.text(label);
            if (state.element) {
              let depth = state.text.length - label.length;
              $state.addClass('depth-' + depth);
            }
            return $state;
          }

          options.templateSelection = function(state) {
            let label = state.text.split('-').filter(Boolean).join('-');
            return label;
          }

          $chosen = $input.select2(options);

          if (advancedSelectOptions.auto_submit) {
            var selectedValues;
            $input.on('select2:close', function (e) {
              if (selectedValues.filter(x => !$input.val().includes(x)).concat($input.val().filter(x => !selectedValues.includes(x))).length) {
                $input.closest('form').find('[data-drupal-selector*="edit-submit"]').click()
              }
            });
            $input.on('select2:opening', function (e) {
              selectedValues = $input.val();
            });
            $input.on('select2:unselect', function (e) {
              if (!$input.select2("isOpen")) {
                $input.closest('form').find('[data-drupal-selector*="edit-submit"]').click()
              }
            });
          }
        });
      }
    }
  }

})(jQuery, Drupal, drupalSettings);

