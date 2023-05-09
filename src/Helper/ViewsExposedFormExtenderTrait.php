<?php

namespace Drupal\iq_bef_extensions\Helper;

use Drupal\Core\Form\FormStateInterface;

trait ViewsExposedFormExtenderTrait
{
  /**
   * {@inheritdoc}
   */
  protected function defineOptions()
  {
    $options = parent::defineOptions();
    $options['iq_bef_extensions_filter_storage']['default'] = 'localstorage';
    return $options;
  }

  /**
   * Build the views options form and adds custom options for BEF.
   *
   * @inheritDoc
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state)
  {
    parent::buildOptionsForm($form, $form_state);

    $form['bef']['general']['iq_bef_extensions_filter_storage'] = [
      '#type' => 'select',
      '#title' => $this->t('Select store for changed inputs'),
      '#description' => $this->t('Select a storage for the values of the changed inputs.'),
      '#default_value' => $this->options['bef']['general']['iq_bef_extensions_filter_storage'],
      '#options' => ['localstorage' => 'Local storage', 'addressbar' => 'address bar']
    ];
    return $form;
  }

  public function exposedFormAlter(&$form, FormStateInterface $form_state)
  {
    parent::exposedFormAlter($form, $form_state);
    if (
      isset($this->options['bef']['general']['iq_bef_extensions_filter_storage']) &&
      $this->options['bef']['general']['iq_bef_extensions_filter_storage'] == 'localstorage'
    ) {
      $form['#attached']['library'][] = 'iq_bef_extensions/localstorage';
    }
  }
}
