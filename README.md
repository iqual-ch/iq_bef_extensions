# iq_bef_extensions

Extensions for the BEF (better exposed filters) module.

**Important note**
The module is still under active development and has only been tested on one installation.

## Background
Eventhough the BEF module providies significant enhancements for exposed filter, there's still some missing funcitonlities, such as range sliders etc.

## This module includes
Filter plugins:
- Slider: Rangefilter, based on noUiSlider JS library
- Advanced select, based on chosen JS library
Settings for filter extension can be found in a view display's advanced settings tab, in the section exposed filter settings

A basic filter form layout
To use the layout, change the style of the exposed filter form to "Better Exposed Filters (with layout)" and choose one of the given layouts

## Setup & Installation

Install module as usual:

    composer require iqual/iq_bef_extensions
    drush en iq_bef_extensions


If you want to work with layouts, make sure VEFL is compatible with BEF 5 by applying these patches:

    composer patch-add drupal/vefl "Fix BEF 5 compatibility issue" https://www.drupal.org/files/issues/2020-07-28/3161777-fix-VeflBef.patch
    composer patch-add drupal/vefl "Render wrapped min/max" https://www.drupal.org/files/issues/2021-08-25/vefl-render_wrapped_min_max.patch

