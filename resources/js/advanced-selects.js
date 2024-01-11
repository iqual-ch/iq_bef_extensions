(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_advanced_select = {
    attach: function (context, settings) {

      $(document).on("iq-bef-extionsions-init", function () {
        $('.select2-container--open').remove();

        Object.keys(drupalSettings.iq_bef_extensions).forEach(function (befViewId) {

          Object.keys(drupalSettings.iq_bef_extensions[befViewId].filters).filter(function (element) {
            return drupalSettings.iq_bef_extensions[befViewId].filters[element].type == "advanced_select"
          }).forEach(function (filterId) {
            let options = drupalSettings.iq_bef_extensions[befViewId].filters[filterId];
            var data_selector = 'edit-' + options.dataSelector;
            var $input = $(once('advanced-select-filter', 'select[data-drupal-selector=" + data_selector + "]', context));

            $("select[data-drupal-selector=" + data_selector + "]", context).each(function () {
              $input = $(this);

              $input.parent().children().wrapAll('<div class="iq-bef-input-wrapper advanced-select"></div>')
              let select2options = {
                width: '100%',
              };
              if (options.placeholder) {
                select2options.placeholder = options.placeholder;
              }
              if (options.no_results_text) {
                select2options.language = {
                  "noResults": function () {
                    return options.no_results_text;
                  }
                };
              }
              select2options.closeOnSelect = false;
              select2options.templateResult = function (state) {
                let $state = $('<span class="checkbox">');
                let label = state.text.split('-').filter(Boolean).join('-');
                $state.text(label);
                if (state.element) {
                  let depth = state.text.length - label.length;
                  $state.addClass('depth-' + depth);
                }
                return $state;
              }

              select2options.templateSelection = function (state) {
                let label = state.text.split('-').filter(Boolean).join('-');
                return label;
              }

              options.select2options = select2options;
              options.count = (function ($input) {
                return function () {
                  let $ul = $input.parent().find('ul');
                  let maxWidth = $ul.innerWidth();
                  let width = 0;
                  let count = 0;
                  if (maxWidth > 0) {
                    $ul.find('li').each(function () {
                      width += $(this).innerWidth();
                      $(this).show();
                      if (width + 35 > maxWidth) {
                        $(this).hide();
                        count = ($ul.find('li').length - $ul.find('li:visible').length)
                      }
                    });
                  }
                  return count;
                }
              })($input);

              // Pass input/options to other scripts before select2 initalization
              $(document).trigger("iq-bef-extionsions-init-select2-before", [$input, options]);

              $chosen = $input.select2(select2options);
              let $ul = $input.parent().find('ul').removeClass('has-counter');
              $ul.prepend('<li class="select2-selection__label">' + $ul.closest('.js-form-item').find('label').text() + '</li>');

              let count = options.count;
              if (typeof count == 'function') {
                count = count();
              }
              if (count) {
                $ul.addClass('has-counter');
                $ul.append('<li class="select2-selection__count">' + options.counter_prefix + count + '</li>')
              }

              $input.on('select2:select select2:unselect', function (e) {
                let $ul = $input.parent().find('ul').removeClass('has-counter');
                $ul.find('.select2-selection__count').remove();
                if (!$ul.find('.select2-selection__label').length) {
                  $ul.prepend('<li class="select2-selection__label">' + $ul.closest('.js-form-item').find('label').text() + '</li>');
                }

                let count = options.count;
                if (typeof count == 'function') {
                  count = count();
                }

                if (count) {
                  $ul.addClass('has-counter');
                  if ($ul.find('.select2-selection__count').length < 1) {
                    $ul.append('<li class="select2-selection__count">' + options.counter_prefix + count + '</li>')
                  }
                  $ul.find('.select2-selection__count').text(options.counter_prefix + count);
                }
              });

              $input.on('select2:opening select2:closing', function (event) {
                var $searchfield = $(this).parent().find('.select2-search__field');
                $searchfield.prop('disabled', true);
              });

              if (options.auto_submit) {
                var selectedValues;
                $input.on('select2:close', function (e) {
                  if (selectedValues.filter(x => !$input.val().includes(x)).concat($input.val().filter(x => !selectedValues.includes(x))).length) {
                    window.view_filter_show_active = true;
                    $input.closest('form').find('[data-drupal-selector*="edit-submit"]').click();
                  }
                });
                $input.on('select2:opening', function (e) {
                  selectedValues = $input.val();
                });
                $input.on('select2:unselect', function (e) {
                  if (!$input.select2("isOpen")) {
                    window.view_filter_show_active = true;
                    $input.closest('form').find('[data-drupal-selector*="edit-submit"]').click()
                  }
                });
              }

              // Pass input to other scripts after select2 initalization
              $(document).trigger("iq-bef-extionsions-init-select2-after", [$input]);
            });
          });
        });
      });
    }
  }

})(jQuery, Drupal, drupalSettings);
