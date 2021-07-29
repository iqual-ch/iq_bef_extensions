(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_advanced_select = {
    attach: function (context, settings) {
      if (!window.initBefPlugins) {
        window.initBefPlugins = [];
      }
      var promise = $.Deferred();
      window.initBefPlugins.push(promise);
      $('.select2-container--open').remove();
      if (drupalSettings.iq_bef_extensions.advanced_selects) {
        $.each(drupalSettings.iq_bef_extensions.advanced_selects_options, function (i, advancedSelectOptions) {
          var data_selector = 'edit-' + advancedSelectOptions.dataSelector;
          var $input = $("select[data-drupal-selector=" + data_selector + "]", context).once('advanced-select-filter');
          let options = {
            'width': '100%',
          };
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
          let $ul = $input.parent().find('ul').removeClass('has-counter');
          $ul.prepend('<li class="select2-selection__label">' + $ul.closest('.js-form-item').find('label').text() + '</li>');
          let maxWidth = $ul.parent().innerWidth();
          let width = 0;
          let count = 0;
          if (maxWidth > 0) {
            $ul.find('li').each(function(){
              width += $(this).innerWidth();
              $(this).show();
              if (width + 35 > maxWidth) {
                count++;
                $(this).remove();
              }
            });
            if (count) {
              $ul.addClass('has-counter');
              $ul.append('<li class="select2-selection__count">+' + count + '</li>')
            }
          }

          $input.on('select2:select select2:unselect', function (e) {
            let $ul = $input.parent().find('ul').removeClass('has-counter');
            $ul.prepend('<li class="select2-selection__label">' + $ul.closest('.js-form-item').find('label').text() + '</li>');
            let maxWidth = $ul.parent().width();
            let width = 0;
            let count = 0;
            $ul.find('li').each(function(){
              width += $(this).width();
              $(this).show();
              if (width + 35 > maxWidth) {
                count++;
                $(this).remove();
              }
            });
            if (count) {
              $ul.addClass('has-counter');
              $ul.append('<li class="select2-selection__count">+' + count + '</li>')
            }
          });

          $input.on('select2:opening select2:closing', function( event ) {
            var $searchfield = $(this).parent().find('.select2-search__field');
            $searchfield.prop('disabled', true);
          });

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
      promise.resolve();
    }
  }

})(jQuery, Drupal, drupalSettings);
