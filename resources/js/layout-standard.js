(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_layout_standard = {
    attach: function (context, settings) {
      $('[data-toggle]').click(function(){
        $('[data-toggable="' + $(this).data('toggle') + '"]').toggleClass('active')
      });

      $('.sorting-region select').focus(function(){
        $(this).parent().addClass('active')
      });

      $('.sorting-region select').change(function(){
        $(this).parent().removeClass('active');
        $(this).blur();
      })
    }
  }
})(jQuery, Drupal, drupalSettings);
