(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.iq_bef_extensions_layout_standard = {
    attach: function (context, settings) {
      window.view_filter_show_active = false;
      if (window.view_filter_active) {
        Object.keys(window.view_filter_active).forEach(function(key){
          if (window.view_filter_active[key]) {
            $('[data-toggable="' + key + '"]').addClass('active');
          }
        })
      } else{
        window.view_filter_active = {};
      }

      $('[data-toggle]').click(function(){
        $('[data-toggable="' + $(this).data('toggle') + '"]').toggleClass('active');
        if ($('[data-toggable="' + $(this).data('toggle') + '"]').hasClass('active')) {
          window.view_filter_active[$(this).data('toggle')] = true;
        }
        else {
          delete window.view_filter_active[$(this).data('toggle')];
        }
      });

      $('.sorting-region select').focus(function(){
        $(this).parent().addClass('active')
      });

      $('.sorting-region select').change(function(){
        $(this).parent().removeClass('active');
        $(this).blur();
        $(this).closest('form').find('[data-iq-bef-extension-sumbmit]').click()
      });

      $('[data-drupal-selector*="edit-submit"]').click(function(e){
        if (!window.view_filter_show_active) {
          delete window.view_filter_active[$(this).closest('form').find('[data-toggle]').data('toggle')]
        }
      });
    }
  }
})(jQuery, Drupal, drupalSettings);
