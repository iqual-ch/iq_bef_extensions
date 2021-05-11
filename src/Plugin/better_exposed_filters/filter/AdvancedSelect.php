<?php

namespace Drupal\iq_bef_extensions\Plugin\better_exposed_filters\filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\better_exposed_filters\Plugin\better_exposed_filters\filter\DefaultWidget;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\views\Views;

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
      'no_results_text' => NULL,
      'auto_submit' => FALSE,
      'remove_unused_items' => FALSE,
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
    $is_chs = is_a($filter, 'Drupal\cshs\Plugin\views\filter\CshsTaxonomyIndexTid');;
    if (($is_chs) && !$filter->isAGroup()) {
      $is_applicable = TRUE;
    }

    return $is_applicable;

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
    $fieldId = $this->getExposedFilterFieldId();
    parent::exposedFormAlter($form, $form_state);
    $form[$fieldId]['#attached']['library'][] = 'iq_bef_extensions/advanced_selects';

    $filter = $this->handler;
    $this->view = $this->view;

    if ($filter->isExposed() && !empty($this->configuration['remove_unused_items'])) {

      if (empty($this->view->selective_filter)) {
        $view = Views::getView($this->view->id());
        $view->selective_filter = TRUE;
        $view->setArguments($this->view->args);
        $view->setItemsPerPage(0);
        $view->setDisplay($this->view->current_display);
        $view->preExecute();
        $view->execute();

        if (!empty($view->result)) {
          $hierarchy = !empty($filter->options['hierarchy']);
          $field_id = $filter->definition['field_name'];
          $relationship = $filter->options['relationship'];
          $element = &$form[$fieldId];

          $ids = [];
          foreach ($view->result as $row) {
            $entity = $row->_entity;
            if ($relationship != 'none') {
              $entity = $row->_relationship_entities[$relationship] ?? FALSE;
            }
            if ($entity instanceof FieldableEntityInterface && $entity->hasField($field_id)) {
              $term_values = $entity->get($field_id)->getValue();

              if (!empty($term_values)) {
                foreach ($term_values as $term_value) {
                  $tid = $term_value['target_id'];
                  $ids[$tid] = $tid;

                  if ($hierarchy) {
                    $parents = \Drupal::service('entity_type.manager')
                      ->getStorage("taxonomy_term")
                      ->loadAllParents($tid);

                    foreach ($parents as $term) {
                      $ids[$term->id()] = $term->id();
                    }
                  }
                }
              }
            }
          }

          if (!empty($element['#options'])) {
            foreach ($element['#options'] as $key => $option) {
              if ($key === 'All') {
                continue;
              }

              $target_id = $key;
              if (is_object($option) && !empty($option->option)) {
                $target_id = array_keys($option->option);
                $target_id = reset($target_id);
              }
              if (!in_array($target_id, $ids)) {
                unset($element['#options'][$key]);
              }
            }
          }
        }
      }
    }

    $form[$fieldId]['#attached']['drupalSettings']['iq_bef_extensions']['advanced_selects'] = TRUE;
    $form[$fieldId]['#attached']['drupalSettings']['iq_bef_extensions']['advanced_selects_options'][$fieldId] = [
      'id' => Html::getUniqueId($fieldId),
      'dataSelector' => Html::getId($fieldId),
      'viewId' => $form['#id'],
      'placeholder' => $form[$fieldId]['#title'],
      'no_results_text' => $this->configuration['no_results_text'],
      'auto_submit' => $this->configuration['auto_submit'],
    ];
  }

}
