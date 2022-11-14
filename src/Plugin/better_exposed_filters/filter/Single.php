<?php

namespace Drupal\iq_bef_extensions\Plugin\better_exposed_filters\filter;

use Drupal\Core\Form\FormStateInterface;
use Drupal\iq_bef_extensions\Plugin\better_exposed_filters\filter\DefaultWidget;

/**
 * Single on/off widget implementation.
 *
 * @BetterExposedFiltersFilterWidget(
 *   id = "iq_single",
 *   label = @Translation("iqual Advanced Single On/Off Checkbox"),
 * )
 */
class Single extends DefaultWidget {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return parent::defaultConfiguration() + [
      'no_results_text' => NULL,
      'auto_submit' => FALSE,
      'remove_unused_items' => FALSE,
    ];
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
      '#title' => $this->t('No results text'),
      '#default_value' => $this->configuration['no_results_text'],
      '#min' => 0,
    ];

    $form['remove_unused_items'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Remove unused items'),
      '#default_value' => $this->configuration['remove_unused_items'],
      '#min' => 0,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function exposedFormAlter(array &$form, FormStateInterface $form_state) {
    /** @var \Drupal\views\Plugin\views\filter\FilterPluginBase $filter */
    $filter = $this->handler;
    // Form element is designated by the element ID which is user-
    // configurable, and stored differently for grouped filters.
    $exposedId = $filter->options['expose']['identifier'];
    $fieldId = $this->getExposedFilterFieldId();

    parent::exposedFormAlter($form, $form_state);

    if (!empty($form[$fieldId])) {
      // Views populates missing values in $form_state['input'] with the
      // defaults and a checkbox does not appear in $_GET (or $_POST) so it
      // will appear to be missing when a user submits a form. Because of
      // this, instead of unchecking the checkbox value will revert to the
      // default. More, the default value for select values (i.e. 'Any') is
      // reused which results in the checkbox always checked.
      $input = $form_state->getUserInput();
      // The input value ID is not always consistent.
      // Prioritize the field ID, but default to exposed ID.
      // @todo Remove $exposedId once
      //   https://www.drupal.org/project/drupal/issues/288429 is fixed.
      $inputValue = $input[$fieldId] ?? ($input[$exposedId] ?? NULL);
      $checked = FALSE;
      // We need to be super careful when working with raw input values. Let's
      // make sure the value exists in our list of possible options.
      if (in_array($inputValue, array_keys($form[$fieldId]['#options'])) && $inputValue !== 'All') {
        $checked = (bool) $inputValue;
      }
      if ($filter->isExposed()
      && empty($this->view->selective_filter)
      && !empty($this->configuration['remove_unused_items'])
      && !$checked) {
        [$table, $column, $referenceColumn] = $this->getTableAndColumn();
        $relationship = ($filter->options['relationship']) ? $filter->options['relationship'] : 'base';
        $entityIds = $this->getEntityIds($relationship);
        $count = (!empty($entityIds)) ? \Drupal::database()
          ->select($table, 't')
          ->condition('t.' . $referenceColumn, $entityIds, 'IN')
          ->condition('t.' . $column, 0, '<>')
          ->fields('t', [$column])
          ->countQuery()
          ->execute()
          ->fetchField() : 0;
        if ($count < 1 && !$inputValue) {
          $form[$fieldId]['#access'] = FALSE;
        }
      }
      if (!isset($form[$fieldId]['#access']) || !$form[$fieldId]['#access']) {
        $form[$fieldId]['#type'] = 'checkbox';
        $form[$fieldId]['#default_value'] = 0;
        $form[$fieldId]['#return_value'] = 1;
        $form[$fieldId]['#value'] = $checked ? 1 : 0;
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable($filter = NULL, array $filter_options = []) {
    /** @var \Drupal\views\Plugin\views\filter\FilterPluginBase $filter */
    $is_applicable = FALSE;

    // Sanity check to ensure we have a filter to work with.
    if (!isset($filter)) {
      return $is_applicable;
    }

    if (is_a($filter, 'Drupal\views\Plugin\views\filter\BooleanOperator') || ($filter->isAGroup() && count($filter->options['group_info']['group_items']) == 1)) {
      $is_applicable = TRUE;
    }

    return $is_applicable;
  }

}
