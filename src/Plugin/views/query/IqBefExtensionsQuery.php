<?php

namespace Drupal\iq_bef_extensions\Plugin\views\query;

use Drupal\Core\Database\DatabaseExceptionWrapper;
use Drupal\views\Plugin\views\query\Sql;
use Drupal\views\ResultRow;
use Drupal\views\ViewExecutable;
use Drupal\views\Views;

/**
 * Views query plugin for an SQL query without entities load.
 *
 * @ingroup views_query_plugins
 *
 * @ViewsQuery(
 *   id = "iq_bef_extensions_query",
 *   title = @Translation("SQL Query without entity load"),
 *   help = @Translation("Query will be generated and run using the Drupal database API.")
 * )
 */
class IqBefExtensionsQuery extends Sql {

  /**
   * Executes the query and fills associated view object with according values.
   *
   * Values to set: $view->result, $view->total_rows, $view->execute_time,
   * $view->current_page.
   */
  public function execute(ViewExecutable $view) {
    $query = $view->build_info['query'];
    $count_query = $view->build_info['count_query'];

    $query->addMetaData('view', $view);
    $count_query->addMetaData('view', $view);

    if (empty($this->options['disable_sql_rewrite'])) {
      $base_table_data = Views::viewsData()->get($this->view->storage->get('base_table'));
      if (isset($base_table_data['table']['base']['access query tag'])) {
        $access_tag = $base_table_data['table']['base']['access query tag'];
        $query->addTag($access_tag);
        $count_query->addTag($access_tag);
      }

      if (isset($base_table_data['table']['base']['query metadata'])) {
        foreach ($base_table_data['table']['base']['query metadata'] as $key => $value) {
          $query->addMetaData($key, $value);
          $count_query->addMetaData($key, $value);
        }
      }
    }

    if ($query) {
      $additional_arguments = \Drupal::moduleHandler()->invokeAll('views_query_substitutions', [$view]);

      // Count queries must be run through the preExecute() method.
      // If not, then hook_query_node_access_alter() may munge the count by
      // adding a distinct against an empty query string
      // (e.g. COUNT DISTINCT(1) ...) and no pager will return.
      // See \Drupal\Core\Database\Query\PagerSelectExtender::execute()
      // See https://www.drupal.org/node/1046170.
      $count_query->preExecute();

      // Build the count query.
      $count_query = $count_query->countQuery();

      // Add additional arguments as a fake condition.
      // XXX: this doesn't work, because PDO mandates that all bound arguments
      // are used on the query. TODO: Find a better way to do this.
      if (!empty($additional_arguments)) {
        // $query->where('1 = 1', $additional_arguments);
        // $count_query->where('1 = 1', $additional_arguments);
      }

      $start = microtime(TRUE);

      try {
        if ($view->pager->useCountQuery() || !empty($view->get_total_rows)) {
          $view->pager->executeCountQuery($count_query);
        }

        // Let the pager modify the query to add limits.
        $view->pager->preExecute($query);

        if (!empty($this->limit) || !empty($this->offset)) {
          // We can't have an offset without a limit, so provide a very large limit instead.
          $limit = intval(!empty($this->limit) ? $this->limit : 999999);
          $offset = intval(!empty($this->offset) ? $this->offset : 0);
          $query->range($offset, $limit);
        }

        $result = $query->execute();
        $result->setFetchMode(\PDO::FETCH_CLASS, 'Drupal\views\ResultRow');

        // Setup the result row objects.
        $view->result = iterator_to_array($result);
        array_walk($view->result, function (ResultRow $row, $index) {
          $row->index = $index;
        });

        $view->pager->postExecute($view->result);
        $view->pager->updatePageInfo();
        $view->total_rows = $view->pager->getTotalItems();

        // Load all entities contained in the results.
        if (
          !property_exists($view, 'only_retrieve_ids') ||
          (
            property_exists($view, 'only_retrieve_ids') &&
            $view->only_retrieve_ids === FALSE
          )
        ) {
          $this->loadEntities($view->result);
        }
      }
      catch (DatabaseExceptionWrapper $e) {
        $view->result = [];
        if (!empty($view->live_preview)) {
          $this->messenger->addError($e->getMessage());
        }
        else {
          throw new DatabaseExceptionWrapper("Exception in {$view->storage->label()}[{$view->storage->id()}]: {$e->getMessage()}");
        }
      }

    }
    else {
      $start = microtime(TRUE);
    }
    $view->execute_time = microtime(TRUE) - $start;
  }

}
