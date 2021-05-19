(function ($, Drupal, drupalSettings) {
  window.initBefPlugins = [];
  Drupal.behaviors.iq_bef_extensions_init = {
    attach: function (context, settings) {
      $(document).trigger("iq-bef-extionsions-after-init");
    }
  }
})(jQuery, Drupal, drupalSettings);
