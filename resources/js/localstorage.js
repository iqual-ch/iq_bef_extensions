(function ($, Drupal, drupalSettings) {
  
  Drupal.behaviors.iq_bef_extensions_localstorage = {
    attach: function (context, settings) {

      Drupal.storeFilterValues = function(formId, inputName, value) {
        if (formId && inputName) {
          let formStorage = {};
          let path = drupalSettings.path.currentPath;
          if (sessionStorage.getItem("formStorage")) {
            formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
          }
          if (!formStorage.hasOwnProperty(path)) {
            formStorage[path] = {};
          }
          if (!formStorage[path].hasOwnProperty(formId)) {
            formStorage[path][formId] = {};
          }
          formStorage[path][formId][inputName] = value;
          sessionStorage.setItem("formStorage", JSON.stringify(formStorage));
        }
      }

      Drupal.retrieveFilterValue = function(formId, inputName) {
        if (formId && inputName) {
          let formStorage = {};
          let path = drupalSettings.path.currentPath;
          if (sessionStorage.getItem("formStorage")) {
            formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
            if (formStorage.hasOwnProperty(path) && formStorage[path].hasOwnProperty(formId)) {
              return formStorage[path][formId][inputName];
            }
          }
        }
      }

      Drupal.retrieveForm = function() {
        if (sessionStorage.getItem("formStorage")) {
          let formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
          let path = drupalSettings.path.currentPath;
          if (formStorage.hasOwnProperty(path)) {
            Object.keys(formStorage[path]).forEach(function(formId){
              Object.keys(formStorage[path][formId]).forEach(function(inputName){
                $('#' + formId ).find('[name="' + inputName + '"]').val(formStorage[path][formId][inputName]);
              });
            });
          }
        }
      }

      Drupal.resetFilterValue = function(formId, inputName) {
        let formStorage = {};
        let path = drupalSettings.path.currentPath;
        if (sessionStorage.getItem("formStorage")) {
          formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
        }
        if (formStorage.hasOwnProperty(path) && formStorage[path].hasOwnProperty(formId)) {
          delete formStorage[path][formId][inputName];
          sessionStorage.setItem("formStorage", JSON.stringify(formStorage));
        }
      }

      Drupal.resetForm = function(formId) {
        let formStorage = {};
        let path = drupalSettings.path.currentPath;

        if (sessionStorage.getItem("formStorage")) {
          formStorage = JSON.parse(sessionStorage.getItem("formStorage"));
          delete formStorage[path];
        }

        sessionStorage.setItem("formStorage", JSON.stringify(formStorage));
      }
    }
  }
  $(document).on("iq-bef-extionsions-after-init", function(){
    $('.bef-exposed-form').find('input[placeholder], select').change(function(e){
      Drupal.storeFilterValues($(this).closest('.views-element-container').attr('id'), $(this).attr('name'), $(this).val())
    });

    $('.bef-exposed-form').find('[data-drupal-selector="edit-reset"]').click(function(){
      Drupal.resetForm($(this).closest('.views-element-container').attr('id'));
    });
  });

  $(document).ready(function () {

    $(document).on('change', '[name="sort_bef_combine"]', function(){
      $(this).closest('.views-element-container').find($('[data-drupal-selector*="edit-submit"]')).click();
    })

  });

})(jQuery, Drupal, drupalSettings);
