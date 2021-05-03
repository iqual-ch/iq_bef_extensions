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
        $(this).closest('form').find('[data-drupal-selector*="edit-submit"]').click()
      })
    }
  }
})(jQuery, Drupal, drupalSettings);
