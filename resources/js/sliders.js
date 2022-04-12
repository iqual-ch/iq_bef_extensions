
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_slider = {
    attach: function (context, settings) {
      $(document).on("iq-bef-extionsions-init", function(){

        Object.keys(drupalSettings.iq_bef_extensions.filters).filter(function(element){
          return drupalSettings.iq_bef_extensions.filters[element].type == "slider"
        }).forEach(function (filterId) {
          let options = drupalSettings.iq_bef_extensions.filters[filterId];
          var data_selector = 'edit-' + options.dataSelector.replace('-wrapper', '');

          // Collect all possible input fields for this filter.
          var $inputs = $("input[data-drupal-selector=" + data_selector + "], input[data-drupal-selector=" + data_selector + "-max], input[data-drupal-selector=" + data_selector + "-min]", context).once('slider-filter');
          $inputs.first().closest('.fieldset-wrapper').parent().children().wrapAll('<div class="iq-bef-input-wrapper slider"></div>');

          if ($inputs.first().attr('init') == 'true') {
            return
          }
          $inputs.first().attr('init', 'true');

          // This is a single-value filter.
          if ($inputs.length === 1) {
            // This is a single-value filter.
            var $input = $($inputs[0]);

            // Get the default value. We use slider min if there is no default.
            var defaultValue = parseFloat(($input.val() === '') ? options.min : $input.val());

            // Set the element value in case we are using the slider min.
            $input.val(defaultValue);


          }
          else if ($inputs.length === 2) {
            let $min = $($inputs[0]),
                $max = $($inputs[1]);

            let $form = $min.closest('form');

            let formId = $form.attr('id'),
            fieldNameMin = $min.attr('name'),
            fieldNameMax = $max.attr('name');


            let $wrapper = $min.closest('.iq-bef-input-wrapper');
            $wrapper.addClass('iq-bef-slider-holder');

            let $formControl = $('<div class="form-control"></div>');
            $formControl.append($min);
            $formControl.append($max);
            $wrapper.append($formControl);

            let $label = $('<label>' + $wrapper.find('.fieldset-legend').text() + '</label>');
            $formControl.append($label);

            $preview = $('<div class="preview-values">');
            $label.append($preview);

            $wrapper.children('.fieldset-wrapper, legend').remove();

            // Setup histogram
            if (options.min == options.max) {

              let text = options.min;
              if (options.tooltip_settings.prefix) {
                text = options.tooltip_settings.prefix + ' ' + text;
              }

              if (options.tooltip_settings.suffix) {
                text = text + ' ' + options.tooltip_settings.suffix;
              }
              $max.closest('.iq-bef-slider-holder').find('label').addClass('locked');

              $preview.text(text);
            }
            else{


              let $sliderWrapper = $('<div class="iq-bef-histogram-slider">');
              let $histogramWrapper = $('<div class="histogram">');
              let $histogram = $('<div class="inner">');

              options.value_histogram.forEach(function(height){
                let $bin = $('<div>');
                $bin.css('height', height + '%');
                $histogram.append($bin);
              });

              $histogramWrapper.append($histogram);
              $sliderWrapper.append($histogramWrapper);
              let $slider = $('<div class="slider">');
              $sliderWrapper.append($slider);

              // Setup Slider dropdown
              let $dropdwon = $('<div class="dropdown">');
              $dropdwon.append($sliderWrapper);
              let $button = $('<button class="submit-slider">' + options.apply_filter_text + '</button>');
              $button.click(function(e){
                e.preventDefault();
                $(this).closest('.iq-bef-slider-holder').toggleClass('active');
                if (options.auto_submit && !$(this).closest('.iq-bef-slider-holder').hasClass('active')) {
                  window.view_filter_show_active = true;
                  $slider.closest('form').find('[data-drupal-selector*="edit-submit"]').click()
                }
              });
              $dropdwon.append($button);

              $max.closest('.iq-bef-slider-holder').append($dropdwon);
              $max.closest('.iq-bef-slider-holder').find('label').click(function(){
                if ($(this).closest('.iq-bef-slider-holder').hasClass('active')) {
                  $('.iq-bef-slider-holder').removeClass('active');
                } else{
                  $('.iq-bef-slider-holder').removeClass('active');
                  $(this).closest('.iq-bef-slider-holder').addClass('active');
                }
              });

              // Setup Reset button
              let $btnReset = $('<button class="reset-slider">' + options.reset_filter_text + '</button>');
              $btnReset.click(function(e){
                e.preventDefault();
                $min.val('');
                $max.val('');
                Drupal.resetFilterValue(formId, fieldNameMin);
                Drupal.resetFilterValue(formId, fieldNameMax);
                $form.find('[data-drupal-selector*="edit-submit"]').click();
              });
              $dropdwon.prepend($btnReset);

              // Setup Slider
              let tooltipFactor = parseFloat(options.tooltip_settings.factor);

              let sliderMin = parseFloat(options.min);
              let sliderMax = parseFloat(options.max);

              if (tooltipFactor > 1) {
                sliderMin = Math.ceil(options.min / ( tooltipFactor / 10 )) * tooltipFactor / 10;
                sliderMax = Math.ceil(options.max / ( tooltipFactor / 10 )) * tooltipFactor / 10;
              }

              var defaultMin = parseFloat($min.val());
              var defaultMax = parseFloat($max.val());

              var startMin = sliderMin;
              if ($min.val()) {
                startMin = parseFloat($min.val());
              }
              if (Drupal.retrieveFilterValue($min.closest('form').attr('id'), $min.attr('name'))) {
                startMin = Drupal.retrieveFilterValue($min.closest('form').attr('id'), $min.attr('name'));
                $min.val(startMin);
              }

              var startMax = sliderMax;
              if ($max.val()) {
                startmax = parseFloat($max.val());
              }
              if (Drupal.retrieveFilterValue($max.closest('form').attr('id'), $max.attr('name'))) {
                startMax = Drupal.retrieveFilterValue($max.closest('form').attr('id'), $max.attr('name'));
                $max.val(startMax);
              }

              noUiSlider.create($slider[0], {
                start: [startMin, startMax],
                tooltips: [
                  wNumb({
                    decimals: parseInt(options.tooltip_settings.scale),
                    thousand: options.tooltip_settings.thousand_separator,
                    prefix: options.tooltip_settings.prefix,
                    suffix: options.tooltip_settings.suffix,
                    mark: options.tooltip_settings.decimal_separator,
                    encoder: function (value){
                      return parseFloat((parseFloat(value) / parseFloat(options.tooltip_settings.factor)).toFixed(1));
                    },
                    decoder: function (value){
                      return parseFloat((parseFloat(value) / parseFloat(options.tooltip_settings.factor)).toFixed(1)) * parseFloat(options.tooltip_settings.factor)
                    },
                  }),
                  wNumb({
                    decimals: parseInt(options.tooltip_settings.scale),
                    thousand: options.tooltip_settings.thousand_separator,
                    prefix: options.tooltip_settings.prefix,
                    suffix: options.tooltip_settings.suffix,
                    mark: options.tooltip_settings.decimal_separator,
                    encoder: function (value){
                      return parseFloat((parseFloat(value) / parseFloat(options.tooltip_settings.factor)).toFixed(1));
                    },
                    decoder: function (value){
                      return parseFloat((parseFloat(value) / parseFloat(options.tooltip_settings.factor)).toFixed(1)) * parseFloat(options.tooltip_settings.factor)
                    },
                  })
                ],
              connect: true,
                step: parseFloat(options.step),
                range: {
                  'min': sliderMin,
                  'max': sliderMax
                }
              });

              $slider[0].noUiSlider.on('change', function (values, handle) {

                let valueMin = parseFloat(values[0]),
                valueMax = parseFloat(values[1]);

                if (!(valueMin == sliderMin && valueMax == sliderMax)) {
                  Drupal.storeFilterValues(formId, fieldNameMin, valueMin);
                  Drupal.storeFilterValues(formId, fieldNameMax, valueMax);
                  $min.val(valueMin);
                  $max.val(valueMax);
                } else {
                  if (!(defaultMin == sliderMin && defaultMax == sliderMax)) {
                    $min.val('');
                    $max.val('');
                    Drupal.resetFilterValue(formId, fieldNameMin);
                    Drupal.resetFilterValue(formId, fieldNameMax);
                  }
                }
              });

              $slider[0].noUiSlider.on('update', function (values, handle) {
                let valueMin = parseInt(values[0]),
                valueMax = parseInt(values[1]);
                $slider.closest('.iq-bef-slider-holder').find('.preview-values').html( this.getTooltips()[0].textContent + ' – ' + this.getTooltips()[1].textContent );
              });
            }
          }
        });
      });
    }
  }

})(jQuery, Drupal, drupalSettings);
