(function ($, Drupal, drupalSettings) {
  window.initBefPlugins = [];
  Drupal.behaviors.iq_bef_extensions_init = {
    attach: function (context, settings) {

      Drupal.storeFilterValues = function(formId, inputName, value) {
        if (formId && inputName) {
          let formStorage = {};
          if (sessionStorage.getItem("formStorage")) {
            formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
          }
          if (!formStorage.hasOwnProperty(formId)) {
            formStorage[formId] = {};
          }
          formStorage[formId][inputName] = value;
          sessionStorage.setItem("formStorage", JSON.stringify(formStorage));
        }
      }

      Drupal.retrieveFilterValue = function(formId, inputName) {
        if (formId && inputName) {
          let formStorage = {};
          if (sessionStorage.getItem("formStorage")) {
            formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
            if (formStorage.hasOwnProperty(formId)) {
              return formStorage[formId][inputName];
            }
          }
        }
      }

      Drupal.retrieveForm = function() {
        if (sessionStorage.getItem("formStorage")) {
          let formStorage = JSON.parse(sessionStorage.getItem("formStorage"));

          Object.keys(formStorage).forEach(function(formId){
            Object.keys(formStorage[formId]).forEach(function(inputName){
              $('#' + formId ).find('[name="' + inputName + '"]').val(formStorage[formId][inputName]);
            });
          });
        }
      }

      Drupal.resetFilterValue = function(formId, inputName) {
        let formStorage = {};
        if (sessionStorage.getItem("formStorage")) {
          formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
        }
        if (formStorage.hasOwnProperty(formId)) {
          delete formStorage[formId][inputName];
          sessionStorage.setItem("formStorage", JSON.stringify(formStorage));
        }
      }

      Drupal.resetForm = function(formId) {
        let formStorage = {};
        formStorage[formId] = {};
        sessionStorage.setItem("formStorage", JSON.stringify(formStorage));
      }

      $(document).trigger("iq-bef-extionsions-before-init");
      $(document).trigger("iq-bef-extionsions-init");
      $(document).trigger("iq-bef-extionsions-after-init");
    }
  }

  $(document).on("iq-bef-extionsions-before-init", function(){
    Drupal.retrieveForm();
  });

  $(document).on("iq-bef-extionsions-after-init", function(){
    $('.bef-exposed-form').find('input[placeholder], select').change(function(e){
      Drupal.storeFilterValues($(this).closest('form').attr('id'), $(this).attr('name'), $(this).val())
    });

    $('.bef-exposed-form').find('[data-drupal-selector="edit-reset"]').click(function(){
      Drupal.resetForm($(this).closest('form').attr('id'));
    });
  });

})(jQuery, Drupal, drupalSettings);
