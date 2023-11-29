<?php

namespace Drupal\iq_bef_extensions\Plugin\views\cache;

use Drupal\Core\Database\Query\SelectInterface;
use Drupal\views\Plugin\views\cache\CachePluginBase;

/**
 * Simple optimized cache plugin for ids listing for view using advanced select filter.
 *
 * @ingroup views_cache_plugins
 *
 * @ViewsCache(
 *   id = "iq_bef_extensions_cache",
 *   title = @Translation("Iq Bef Extensions Cache"),
 *   help = @Translation("An optimized cache plugin for ids listing.")
 * )
 */
class IqBefExtensionsCache extends CachePluginBase {

  /**
   * Overrides the cache key generation to allow alteration.
   */
  public function generateResultsKey() {
    if (!isset($this->resultsKey)) {

      $key_data = [];
      // Only exposed inputs should vary
      foreach ($this->view->getExposedInput() as $key => $value) {
        $key_data[$key] = $value;
      }

      $cache_contexts = $this->displayHandler->getCacheMetadata()->getCacheContexts();

      \Drupal::moduleHandler()->invokeAll('alter_iq_bef_extension_cache_contexts',
        [
          $this->view,
          &$cache_contexts,
        ]
      );

      $key_data += \Drupal::service('cache_contexts_manager')->convertTokensToKeys($cache_contexts)->getKeys();

      \Drupal::moduleHandler()->invokeAll('alter_iq_bef_extension_cache_key',
        [
          $this->view,
          &$key_data,
        ]
      );

      $this->resultsKey = $this->view->storage->id() . ':' . $this->displayHandler->display['id'] . ':results:' . hash('sha256', serialize($key_data));
    }

    return $this->resultsKey;
  }

}
