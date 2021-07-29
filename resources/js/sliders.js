
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_slider = {
    attach: function (context, settings) {
      if (!window.initBefPlugins) {
        window.initBefPlugins = [];
      }
      var promise = $.Deferred();
      window.initBefPlugins.push(promise);

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
            $min.parent().children().wrapAll('<div class="form-control">');

            $preview = $('<div class="preview-values">');
            $max.closest('.iq-bef-slider-holder').find('label').append($preview);

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
              })

              $histogramWrapper.append($histogram);
              $sliderWrapper.append($histogramWrapper);
              let $slider = $('<div class="slider">');
              $sliderWrapper.append($slider);


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
              })

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
                step: parseFloat(sliderOptions.step),
                range: {
                  'min': parseFloat(sliderOptions.min),
                  'max': parseFloat(sliderOptions.max)
                }
              });

              var snapValues = [$min[0], $max[0]];

              $slider[0].noUiSlider.on('update', function (values, handle) {
                $(snapValues[handle]).val(values[handle]);
                if ( true || !((parseFloat(sliderOptions.min) == parseFloat(values[0])) && (parseFloat(sliderOptions.max) == parseFloat(values[1]))) ) {
                  $slider.closest('.iq-bef-slider-holder').find('.preview-values').html( this.getTooltips()[0].textContent + ' – ' + this.getTooltips()[1].textContent );
                  $btnReset = $('<button class="reset-slider">' + sliderOptions.reset_filter_text + '</button>');
                  $btnReset.click(function(e){
                    e.preventDefault();
                    $slider[0].noUiSlider.set([ parseFloat(sliderOptions.min), parseFloat(sliderOptions.max)]);
                    $slider.closest('.iq-bef-slider-holder').find('.preview-values').text("");
                    $slider.closest('.iq-bef-slider-holder').toggleClass('active');
                    window.view_filter_show_active = true;
                    $slider.closest('form').find('[data-drupal-selector*="edit-submit"]').click()
                  });
                  if (!$slider.closest('.dropdown').find('.reset-slider').length) {
                    $slider.closest('.dropdown').prepend($btnReset);
                  }
                }
              });

              $min.val('');
              $max.val('');
            }
          }
        })
      }
      promise.resolve();
    }
  }

})(jQuery, Drupal, drupalSettings);
