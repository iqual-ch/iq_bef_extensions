
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_slider = {
    attach: function (context, settings) {
      if (drupalSettings.iq_bef_extensions.slider) {
        $.each(drupalSettings.iq_bef_extensions.slider_options, function (i, sliderOptions) {
          var data_selector = 'edit-' + sliderOptions.dataSelector;

          // Collect all possible input fields for this filter.
          var $inputs = $("input[data-drupal-selector=" + data_selector + "], input[data-drupal-selector=" + data_selector + "-max], input[data-drupal-selector=" + data_selector + "-min]", context).once('slider-filter');

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
            // This is an in-between or not-in-between filter. Use a range
            // filter and tie the min and max into the two input elements.
            var $min = $($inputs[0]),
                $max = $($inputs[1]),
                // Get the default values. We use slider min & max if there are
                // no defaults.
                defaultMin = parseFloat(($min.val() == '') ? sliderOptions.min : $min.val()),
                defaultMax = parseFloat(($max.val() == '') ? sliderOptions.max : $max.val());

            // Set the element value in case we are using the slider min & max.
            $min.val(defaultMin);
            $max.val(defaultMax);

            // Move max next to Min field
            $maxParent = $max.parent();
            $max.appendTo($min.parent());
            $maxParent.remove();
            $min.parent().addClass('iq-bef-slider-holder');

            var $slider = $('<div class="iq-bef-slider">');
            $slider.insertAfter($max);

            noUiSlider.create($slider[0], {
              start: [defaultMin, defaultMax],
              tooltips: [
                wNumb({
                  decimals: parseInt(sliderOptions.tooltip_settings.scale),
                  thousand: sliderOptions.tooltip_settings.thousand_separator,
                  prefix: sliderOptions.tooltip_settings.prefix,
                  suffix: sliderOptions.tooltip_settings.suffix,
                  mark: sliderOptions.tooltip_settings.decimal_separator,
                  encoder: function (value){
                    return value / parseInt(sliderOptions.tooltip_settings.factor);
                  },
                  decoder: function (value){
                    return value * parseInt(sliderOptions.tooltip_settings.factor);
                  },
                }),
                wNumb({
                  decimals: parseInt(sliderOptions.tooltip_settings.scale),
                  thousand: sliderOptions.tooltip_settings.thousand_separator,
                  prefix: sliderOptions.tooltip_settings.prefix,
                  suffix: sliderOptions.tooltip_settings.suffix,
                  mark: sliderOptions.tooltip_settings.decimal_separator,
                  encoder: function (value){
                    return value / parseInt(sliderOptions.tooltip_settings.factor);
                  },
                  decoder: function (value){
                    return value * parseInt(sliderOptions.tooltip_settings.factor);
                  },
                })
              ],
              connect: true,
              margin: parseFloat(sliderOptions.margin),
              step: parseFloat(sliderOptions.step),
              range: {
                'min': parseFloat(sliderOptions.min),
                'max': parseFloat(sliderOptions.max)
              }
            });

            var snapValues = [$min[0], $max[0]];

            $slider[0].noUiSlider.on('update', function (values, handle) {
              $(snapValues[handle]).val(values[handle]);
            });
          }
        })
      }
    }
  }

})(jQuery, Drupal, drupalSettings);
