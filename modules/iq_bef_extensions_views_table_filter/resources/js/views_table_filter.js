/**
 * @file
 * Vat.
 */

(function ($, Drupal, drupalSettings) {
    Drupal.behaviors.views_table_filter = {
      attach: function (context, settings) {
        if (settings['views_table_filter']) {
          for (var view in settings['views_table_filter']) {
            var form = $('input.views-table-filter[value="' + view + '"]').eq(0).closest('form');
            if (form.length > 0) {
              var view_container = form.eq(0).closest('.view');
              view_container.find('.table-header-filter').once().each(process_view);
            }
          }
        }
  
        function process_view() {
          var header_widget_wrapper = $(this);
          var classes = header_widget_wrapper.attr('class').split(' ');
  
          for (var i in classes) {
            if (/^table-header-filter-/.test(classes[i])) {
              var filter = classes[i].replace(/^table-header-filter-/, '');
              var name = settings['views_table_filter'][view][filter];
  
              if (!name) {
                continue;
              }
              var input = form.find('[name="' + name + '"],[name="' + name + '[]"],[name="' + name + '[value][date]"]');
              var widget = input.eq(0).closest('.js-form-item');
  
  
              if (widget.length < 1) {
                continue;
              }
  
              widget.find('label').hide();
              var container = widget.parent();
              var widget_clone = widget.clone(true);
  
              widget_clone.hide();
  
              widget_clone.find('[id]').each(add_id_suffix);
              widget_clone.appendTo(container);
              var input_clone = widget_clone.find('[name="' + name + '"],[name="' + name + '[]"],[name="' + name + '[value][date]"]');
              input_clone.removeClass('form-autocomplete');
  
              input.change(function () {
                input_clone.val(input.val());
                input_clone.change();
              });
              input.keyup(function () {
                setTimeout(function () {
                  input_clone.val(input.val());
                }, 100);
              });
  
              widget.detach().appendTo(header_widget_wrapper.closest('th'));
  
            }
          }
        }
  
        function add_id_suffix() {
          var element = $(this);
          element.attr('id', element.attr('id') + '-views-table-filter');
        }
      }
    };
  })(jQuery, Drupal, drupalSettings);
  