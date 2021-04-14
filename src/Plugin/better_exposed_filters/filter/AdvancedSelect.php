<?php

namespace Drupal\iq_bef_extensions\Plugin\better_exposed_filters\filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\better_exposed_filters\Plugin\better_exposed_filters\filter\FilterWidgetBase;

/**
 * Select implementation using the chosen JS library.
 *
 * @BetterExposedFiltersFilterWidget(
 *   id = "iq_advanced_select",
 *   label = @Translation("Advanced Select"),
 * )
 */
class AdvancedSelect extends FilterWidgetBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return parent::defaultConfiguration() + [
      'placeholder' => $this->t('- All -'),
      'no_results_text' => NULL,
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

    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['placeholder'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Placeholder'),
      '#default_value' => $this->configuration['placeholder'],
    ];

    $form['no_results_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('No results text'),
      '#default_value' => $this->configuration['no_results_text'],
      '#min' => 0,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function exposedFormAlter(array &$form, FormStateInterface $form_state) {
    $field_id = $this->getExposedFilterFieldId();
    parent::exposedFormAlter($form, $form_state);
    $form[$field_id]['#attached']['library'][] = 'iq_bef_extensions/advanced_selects';

    $form[$field_id]['#attached']['drupalSettings']['iq_bef_extensions']['advanced_selects'] = TRUE;
    $form[$field_id]['#attached']['drupalSettings']['iq_bef_extensions']['advanced_selects_options'][$field_id] = [
      'id' => Html::getUniqueId($field_id),
      'dataSelector' => Html::getId($field_id),
      'viewId' => $form['#id'],
      'placeholder' => $this->configuration['placeholder'],
      'no_results_text' => $this->configuration['no_results_text'],
    ];
  }

}
