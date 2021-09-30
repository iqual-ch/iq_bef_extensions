
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_slider = {
    attach: function (context, settings) {
      $(document).on("iq-bef-extionsions-init", function(){
        if (drupalSettings.iq_bef_extensions.slider) {
          $.each(drupalSettings.iq_bef_extensions.slider_options, function (i, sliderOptions) {
            var data_selector = 'edit-' + sliderOptions.dataSelector;

            // Collect all possible input fields for this filter.
            var $inputs = $("input[data-drupal-selector=" + data_selector + "], input[data-drupal-selector=" + data_selector + "-max], input[data-drupal-selector=" + data_selector + "-min]", context).once('slider-filter');


            if ($inputs.first().attr('init') == 'true') {
              return
            }
            $inputs.first().attr('init', 'true');

            // This is a single-value filter.
            if ($inputs.length === 1) {
              // This is a single-value filter.
              var $input = $($inputs[0]);

              // Get the default value. We use slider min if there is no default.
              var defaultValue = parseFloat(($input.val() === '') ? sliderOptions.min : $input.val());

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


              // Move max next to Min field
              $maxParent = $max.parent();
              $max.appendTo($min.parent());
              $maxParent.remove();
              $min.parent().addClass('iq-bef-slider-holder');
              $min.parent().children().wrapAll('<div class="form-control">');

              $preview = $('<div class="preview-values">');
              $max.closest('.iq-bef-slider-holder').find('label').append($preview);

              // Setup histogram
              if (sliderOptions.min == sliderOptions.max) {

                let text = sliderOptions.min;
                if (sliderOptions.tooltip_settings.prefix) {
                  text = sliderOptions.tooltip_settings.prefix + ' ' + text;
                }

                if (sliderOptions.tooltip_settings.suffix) {
                  text = text + ' ' + sliderOptions.tooltip_settings.suffix;
                }
                $max.closest('.iq-bef-slider-holder').find('label').addClass('locked');

                $preview.text(text);
              }
              else{


                let $sliderWrapper = $('<div class="iq-bef-histogram-slider">');
                let $histogramWrapper = $('<div class="histogram">');
                let $histogram = $('<div class="inner">');

                sliderOptions.value_histogram.forEach(function(height){
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
                let $button = $('<button class="submit-slider">' + sliderOptions.apply_filter_text + '</button>');
                $button.click(function(e){
                  e.preventDefault();
                  $(this).closest('.iq-bef-slider-holder').toggleClass('active');
                  if (sliderOptions.auto_submit && !$(this).closest('.iq-bef-slider-holder').hasClass('active')) {
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
                let $btnReset = $('<button class="reset-slider">' + sliderOptions.reset_filter_text + '</button>');
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
                let tooltipFactor = parseFloat(sliderOptions.tooltip_settings.factor);
                var sliderMin = Math.ceil(sliderOptions.min / ( tooltipFactor / 10 )) * tooltipFactor / 10;
                var sliderMax = Math.ceil(sliderOptions.max / ( tooltipFactor / 10 )) * tooltipFactor / 10;

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
                      decimals: parseInt(sliderOptions.tooltip_settings.scale),
                      thousand: sliderOptions.tooltip_settings.thousand_separator,
                      prefix: sliderOptions.tooltip_settings.prefix,
                      suffix: sliderOptions.tooltip_settings.suffix,
                      mark: sliderOptions.tooltip_settings.decimal_separator,
                      encoder: function (value){
                        return parseFloat((parseFloat(value) / parseFloat(sliderOptions.tooltip_settings.factor)).toFixed(1));
                      },
                      decoder: function (value){
                        return parseFloat((parseFloat(value) / parseFloat(sliderOptions.tooltip_settings.factor)).toFixed(1)) * parseFloat(sliderOptions.tooltip_settings.factor)
                      },
                    }),
                    wNumb({
                      decimals: parseInt(sliderOptions.tooltip_settings.scale),
                      thousand: sliderOptions.tooltip_settings.thousand_separator,
                      prefix: sliderOptions.tooltip_settings.prefix,
                      suffix: sliderOptions.tooltip_settings.suffix,
                      mark: sliderOptions.tooltip_settings.decimal_separator,
                      encoder: function (value){
                        return parseFloat((parseFloat(value) / parseFloat(sliderOptions.tooltip_settings.factor)).toFixed(1));
                      },
                      decoder: function (value){
                        return parseFloat((parseFloat(value) / parseFloat(sliderOptions.tooltip_settings.factor)).toFixed(1)) * parseFloat(sliderOptions.tooltip_settings.factor)
                      },
                    })
                  ],
                connect: true,
                //   step: 100,
                  range: {
                    'min': sliderMin,
                    'max': sliderMax
                  }
                });

                $slider[0].noUiSlider.on('change', function (values, handle) {

                  let valueMin = parseInt(values[0]),
                  valueMax = parseInt(values[1]);

                  if (!(valueMin == sliderMin && valueMax == sliderMax)) {
                    Drupal.storeFilterValues(formId, fieldNameMin, valueMin);
                    Drupal.storeFilterValues(formId, fieldNameMax, valueMax);
                    $min.val(valueMin);
                    $max.val(valueMax);
                  } else {
                    if (!(defaultMin == startMin && defaultMax == startMax)) {
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
          })
        }
      });
    }
  }

})(jQuery, Drupal, drupalSettings);
