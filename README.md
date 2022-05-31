# iq_bef_extensions

Extensions for the BEF (better exposed filters) module.

## Background
Eventhough the BEF module providies significant enhancements for exposed filter, there's still some missing funcitonlities, such as range sliders etc.

## This module includes
Filter plugins:
- Slider: Rangefilter, based on noUiSlider JS library. Contains a histogram that shows the distribution of the filter results.
- Advanced select: Select dropdown based on chosen JS library
Settings for filter extension can be found in a view display's advanced settings tab, in the section exposed filter settings
- Single: Single on/off widget implementation

A basic filter form layout
To use the layout, change the style of the exposed filter form to "Better Exposed Filters (with layout)" and choose one of the given layouts

## Setup & Installation

Install module as usual:

    composer require iqual/iq_bef_extensions
    drush en iq_bef_extensions


If you want to work with layouts, make sure VEFL is compatible with BEF 5 by applying these patches:

    composer patch-add drupal/vefl "Fix BEF 5 compatibility issue" https://www.drupal.org/files/issues/2020-07-28/3161777-fix-VeflBef.patch
    composer patch-add drupal/vefl "Render wrapped min/max" https://www.drupal.org/files/issues/2021-08-25/vefl-render_wrapped_min_max.patch

## Configutation

### General options
- **Remove filter if not used**: If this option is enabled, the filter will be hidden if it has no effect on the result. This means: none of the resulting objects have values for the corresponding fields.

### Slider options (Only the non-self-explanatory ones)
- **Range minimum**: The minimum of the slider range. Leave empty for automatic calculation.
- **Range maximum**: The maximum of the slider range. Leave empty for automatic calculation.
- **Step**: The minimum sliding distance of the slider. Leave empty for automatic calculation, based on the number of histogram bins.
- **Tooltip Factor**: Factor between the tooltip and the effective filter value. Use this if you want the tooltip to display a different unit than the underlying data model. Example: A numeric field is configured to store values in *mm*. If the slider should display *cm* instead, the tooltip factor can simply be set to 10.
- **Tooltip scale**: Number of decimals.

### Advanced select options
- **Remove unused items**: Hides all options that not return empty filter results.
