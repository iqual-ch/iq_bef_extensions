(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_layout_standard = {
    attach: function (context, settings) {
      $('[data-toggle]').click(function(){
        $('[data-toggable="' + $(this).data('toggle') + '"]').toggleClass('active')
      })
    }
  }
})(jQuery, Drupal, drupalSettings);
