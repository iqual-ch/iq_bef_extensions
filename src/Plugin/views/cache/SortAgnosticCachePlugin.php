<?php

namespace Drupal\iq_bef_extensions\Plugin\views\cache;

use Drupal\Core\Database\Query\SelectInterface;
use Drupal\views\Plugin\views\cache\CachePluginBase;

/**
 * Simple sort agnostic cache plugin for view using advanced select filter.
 *
 * @ingroup views_cache_plugins
 *
 * @ViewsCache(
 *   id = "sort_agnostic_cache",
 *   title = @Translation("Sort Agnostic Cache"),
 *   help = @Translation("A sort agnostic cache plugin.")
 * )
 */
class SortAgnosticCachePlugin extends CachePluginBase {

  /**
   * Retrieve data from the cache.
   *
   * A plugin should override this to provide specialized caching behavior.
   *
   * @param string $type
   *   The cache type, either 'query', 'result'.
   *
   * @return bool
   *   TRUE if data has been taken from the cache, otherwise FALSE.
   */
  public function cacheGet($type) {
    $cutoff = $this->cacheExpire($type);
    switch ($type) {
      case 'query':
        // Not supported currently, but this is certainly where we'd put it.
        return FALSE;

      case 'results':
        // Values to set: $view->result, $view->total_rows, $view->execute_time,
        // $view->current_page.
        if ($cache = \Drupal::cache($this->resultsBin)->get($this->generateResultsKey())) {
          if (!$cutoff || $cache->created > $cutoff) {
            $this->view->result = $cache->data['result'];
            $this->view->total_rows = $cache->data['total_rows'];
            $this->view->setCurrentPage(0, TRUE);
            $this->view->execute_time = 0;
            return TRUE;
          }
        }
        return FALSE;
    }
  }

  /**
   * Overrides the cache key generation to allow alteration.
   */
  public function generateResultsKey() {
    if (!isset($this->resultsKey)) {
      // Ensure the view is build and query exists.
      if (!$this->view->build) {
        $this->view->build();
      }

      $build_info = $this->view->build_info;

      foreach (['query', 'count_query'] as $index) {
        // If the default query back-end is used generate SQL query strings from
        // the query objects.
        if ($build_info[$index] instanceof SelectInterface) {
          $query = clone $build_info[$index];
          $query->preExecute();
          $build_info[$index] = [
            'query' => (string) $query,
            'arguments' => $query->getArguments(),
          ];
        }
      }

      $key_data = [
        'build_info' => $build_info,
      ];

      $key_data += \Drupal::service('cache_contexts_manager')->convertTokensToKeys($this->displayHandler->getCacheMetadata()->getCacheContexts())->getKeys();

      \Drupal::moduleHandler()->invokeAll('alter_iq_bef_extension_cache_key', [$key_data]);

      $this->resultsKey = $this->view->storage->id() . ':' . $this->displayHandler->display['id'] . ':results:' . hash('sha256', serialize($key_data));
    }

    return $this->resultsKey;
  }

}
