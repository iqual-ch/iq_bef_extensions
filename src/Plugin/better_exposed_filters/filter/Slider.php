<?php

namespace Drupal\iq_bef_extensions\Plugin\better_exposed_filters\filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\better_exposed_filters\Plugin\better_exposed_filters\filter\FilterWidgetBase;

/**
 * Slider implementation using the noUiSlider JS library.
 *
 * @BetterExposedFiltersFilterWidget(
 *   id = "iq_slide",
 *   label = @Translation("Slider"),
 * )
 */
class Slider extends FilterWidgetBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return parent::defaultConfiguration() + [
      'min' => 0,
      'max' => 1000,
      'step' => 1,
      'margin' => 10,
      'tooltip_factor' => 1,
      'tooltip_thousand_separator' => '',
      'tooltip_decimal_separator' => '.',
      'tooltip_scale' => 2,
      'tooltip_prefix' => '',
      'tooltip_suffix' => '',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable($filter = NULL, array $filter_options = []) {
    /** @var \Drupal\views\Plugin\views\filter\FilterPluginBase $filter */
    $is_applicable = FALSE;

    // The date filter handler extends the numeric filter handler so we have
    // to exclude it specifically.
    $is_numeric_filter = is_a($filter, 'Drupal\views\Plugin\views\filter\NumericFilter');
    $is_range_filter = is_a($filter, 'Drupal\range\Plugin\views\filter\Range');
    $is_date_filter = is_a($filter, 'Drupal\views\Plugin\views\filter\Date');
    if (($is_numeric_filter || $is_range_filter) && !$is_date_filter && !$filter->isAGroup()) {
      $is_applicable = TRUE;
    }

    return $is_applicable;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['min'] = [
      '#type' => 'number',
      '#title' => $this->t('Range minimum'),
      '#default_value' => $this->configuration['min'],
      '#description' => $this->t('The minimum allowed value for the jQuery range slider. It can be positive, negative, or zero and have up to 11 decimal places.'),
    ];

    $form['max'] = [
      '#type' => 'number',
      '#title' => $this->t('Range maximum'),
      '#default_value' => $this->configuration['max'],
      '#description' => $this->t('The maximum allowed value for the jQuery range slider. It can be positive, negative, or zero and have up to 11 decimal places.'),
    ];

    $form['step'] = [
      '#type' => 'number',
      '#title' => $this->t('Step'),
      '#default_value' => $this->configuration['step'],
      '#description' => $this->t('Determines the size or amount of each interval or step the slider takes between the min and max.') . '<br />' . $this->t('The full specified value range of the slider (Range maximum - Range minimum) must be evenly divisible by the step.') . '<br />' . $this->t('The step must be a positive number of up to 5 decimal places.'),
      '#min' => 0,
    ];

    $form['margin'] = [
      '#type' => 'number',
      '#title' => $this->t('Margin'),
      '#default_value' => $this->configuration['margin'],
      '#min' => 0,
    ];

    $form['tooltip_factor'] = [
      '#type' => 'number',
      '#title' => $this->t('Tooltip Factor'),
      '#default_value' => $this->configuration['tooltip_factor'],
      '#min' => 0,
    ];

    $form['tooltip_thousand_separator'] = [
      '#type' => 'select',
      '#title' => $this->t('Tooltip Thousand marker'),
      '#default_value' => $this->configuration['tooltip_thousand_separator'],
      '#options' => [
        '' => $this->t('- None -'),
        '.' => $this->t('Decimal point'),
        ',' => $this->t('Comma'),
        ' ' => $this->t('Space'),
        '&thinsp;' => $this->t('Thin space'),
        '\'' => $this->t('Apostrophe'),
      ],
    ];

    $form['tooltip_decimal_separator'] = [
      '#type' => 'select',
      '#title' => $this->t('Tooltip Decimal marker'),
      '#default_value' => $this->configuration['tooltip_decimal_separator'],
      '#options' => [
        '.' => $this->t('Decimal point'),
        ',' => $this->t('Comma'),
      ],
    ];

    $form['tooltip_scale'] = [
      '#type' => 'number',
      '#title' => $this->t('Tooltip Scale'),
      '#default_value' => $this->configuration['tooltip_scale'],
      '#min' => 0,
    ];

    $form['tooltip_prefix'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Tooltip prefix'),
      '#default_value' => $this->configuration['tooltip_prefix'],
      '#min' => 0,
    ];

    $form['tooltip_suffix'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Tooltip suffix'),
      '#default_value' => $this->configuration['tooltip_suffix'],
      '#min' => 0,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::validateConfigurationForm($form, $form_state);

    // Max must be > min.
    $min = $form_state->getValue('min');
    $max = $form_state->getValue('max');
    if ($max <= $min) {
      $form_state->setError($form['max'], $this->t('The slider max value must be greater than the slider min value.'));
    }

    // Step must have:
    // - No more than 5 decimal places.
    // - Slider range must be evenly divisible by step.
    $step = $form_state->getValue('step');
    if (strlen(substr(strrchr((string) $step, '.'), 1)) > 5) {
      $form_state->setError($form['step'], $this->t('The slider step option for %name cannot have more than 5 decimal places.'));
    }

    // Very small step and a vary large range can go beyond the max value of
    // an int in PHP. Thus we look for a decimal point when casting the result
    // to a string.
    if (strpos((string) ($max - $min) / $step, '.')) {
      $form_state->setError($form['step'], $this->t('The slider range must be evenly divisible by the step option.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function exposedFormAlter(array &$form, FormStateInterface $form_state) {
    $field_id = $this->getExposedFilterFieldId();

    parent::exposedFormAlter($form, $form_state);

    $form[$field_id]['#attached']['library'][] = 'iq_bef_extensions/sliders';

    // Set the slider settings.
    $form[$field_id]['#attached']['drupalSettings']['iq_bef_extensions']['slider'] = TRUE;
    $form[$field_id]['#attached']['drupalSettings']['iq_bef_extensions']['slider_options'][$field_id] = [
      'min' => $this->configuration['min'],
      'max' => $this->configuration['max'],
      'step' => $this->configuration['step'],
      'margin' => $this->configuration['margin'],
      'id' => Html::getUniqueId($field_id),
      'dataSelector' => Html::getId($field_id),
      'viewId' => $form['#id'],
      'tooltip_settings' => [
        'factor' => $this->configuration['tooltip_factor'],
        'thousand_separator' => $this->configuration['tooltip_thousand_separator'],
        'decimal_separator' => $this->configuration['tooltip_decimal_separator'],
        'scale' => $this->configuration['tooltip_scale'],
        'prefix' => $this->configuration['tooltip_prefix'],
        'suffix' => $this->configuration['tooltip_suffix'],
      ],
    ];
  }

}