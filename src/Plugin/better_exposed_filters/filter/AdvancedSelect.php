<?php

namespace Drupal\iq_bef_extensions\Plugin\better_exposed_filters\filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;

/**
 * Select implementation using the chosen JS library.
 *
 * @BetterExposedFiltersFilterWidget(
 *   id = "iq_advanced_select",
 *   label = @Translation("Advanced Select"),
 * )
 */
class AdvancedSelect extends DefaultWidget {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
      return parent::defaultConfiguration() + [
      'no_results_text' => null,
      'auto_submit' => false,
      'remove_unused_items' => false,
      'remove_unused_filter' => false,
      'counter_prefix' => '+'
      ];
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable($filter = null, array $filter_options = []) {
      return ($filter_options && ($filter_options['type'] == 'select' || $filter_options['widget'] == 'select' || (array_key_exists('group_info', $filter_options) && array_key_exists('widget', $filter_options['group_info']) && $filter_options['group_info']['widget'] == 'select')));
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['auto_submit'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Auto submit after change'),
      '#default_value' => $this->configuration['auto_submit'],
    ];

    $form['no_results_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t("No results text"),
      '#default_value' => $this->configuration['no_results_text'],
    ];

    $form['counter_prefix'] = [
      '#type' => 'textfield',
      '#title' => $this->t("Prefix for counter"),
      '#default_value' => $this->configuration['counter_prefix'],
    ];

    $form['remove_unused_items'] = [
      '#type' => 'checkbox',
      '#title' => $this->t("Remove unused items"),
      '#description' => $this->t("Remove filter items that do not show results after applying"),
      '#default_value' => $this->configuration['remove_unused_items'],
    ];

    $form['remove_unused_filter'] = [
      '#type' => 'checkbox',
      '#title' => $this->t("Remove filter if not used"),
      '#description' => $this->t("Remove the filter if it doesn't affect the results."),
      '#default_value' => $this->configuration['remove_unused_filter'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function exposedFormAlter(array &$form, FormStateInterface $form_state) {
    $fieldId = $this->getExposedFilterFieldId();
    parent::exposedFormAlter($form, $form_state);
    $filter = $this->handler;
    $element = &$form[$fieldId];
    $element['#attached']['library'][] = 'iq_bef_extensions/advanced_selects';

    if (
      $filter->isExposed()
      && empty($this->view->selective_filter)
      && !empty($this->configuration['remove_unused_items'])
    ) {

      $relationship = ($filter->options['relationship']) ? $filter->options['relationship'] : 'none';
      $ids = $this->getFilterIds($relationship);
      if (
        empty($ids)
        && !empty($this->configuration['remove_unused_filter'])
        && empty($form_state->getUserInput()[$fieldId])
      ) {
        $element['#access'] = FALSE;
      } else {
        $this->filterElementWithOptions($element, $ids);
      }
    }

    $element['#attached']['drupalSettings']['iq_bef_extensions'][$this->view->id() . '__' . $this->view->current_display]['filters'][$fieldId] = [
      'id' => Html::getUniqueId($fieldId),
      'filter_id' => $fieldId,
      'type' => 'advanced_select',
      'dataSelector' => Html::getId($fieldId),
      'viewId' => $form['#id'],
      'placeholder' => $form[$fieldId]['#title'],
      'no_results_text' => $this->configuration['no_results_text'],
      'auto_submit' => $this->configuration['auto_submit'],
      'remove_unused_items' => !empty($this->configuration['remove_unused_items']),
      'remove_unused_filter' => !empty($this->configuration['remove_unused_filter']),
      'counter_prefix' => $this->configuration['counter_prefix'],
    ];
  }
}
