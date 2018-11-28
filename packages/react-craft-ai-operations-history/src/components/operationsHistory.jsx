import createRowComponent from './createRowComponent';
import HeaderRow from './headerRow';
import InfiniteList from './infiniteList';
import memoizeOne from 'memoize-one';
import PlaceholderRow from './placeholderRow';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import Table from './table';
import { EventEmitter } from 'events';
import * as most from 'most';

const TIMESTAMP_MAX = Number.MAX_SAFE_INTEGER;
const TIMESTAMP_MIN = 0;

const memoizedCreateRowComponent = memoizeOne((agentConfiguration) => {
  return createRowComponent({ agentConfiguration });
});

function computeUpdatedEstimations({
  estimatedPeriod,
  from,
  loadedFrom,
  loadedOperations,
  loadedTo,
  to
}) {
  const loadedCount = loadedOperations.length;

  if ((from == null || to == null) && loadedCount == 0) {
    throw new Error(
      'Unexpected error, either \'from\' and \'to\' should be defined or \'loadedOperations\' should not be empty'
    );
  }

  if (loadedCount == 0) {
    // No loaded data to re-estimate the period
    const estimatedCount = Math.ceil((to - from) / estimatedPeriod);

    return {
      estimatedPeriod,
      estimatedCount,
      estimatedBeforeLoadedCount: estimatedCount,
      estimatedAfterLoadedCount: 0,
      from,
      to,
      loadedFrom,
      loadedTo
    };
  }

  // Operations are ordered from the latest to the earliest
  const updatedLoadedFrom = Math.min(
    loadedOperations[loadedCount - 1].timestamp,
    loadedFrom || TIMESTAMP_MAX
  );
  const updatedLoadedTo = Math.max(
    loadedOperations[0].timestamp,
    loadedTo || TIMESTAMP_MIN
  );
  const updatedFrom = Math.min(updatedLoadedFrom, from || TIMESTAMP_MAX);
  const updatedTo = Math.max(updatedLoadedTo, to || TIMESTAMP_MIN);

  // Period is the average time between operations
  const updatedEstimatedPeriod =
    (updatedLoadedTo - updatedLoadedFrom) / (loadedCount - 1);

  // Estimate how many operations there is before and after what is loaded
  const estimatedAfterLoadedCount = Math.ceil(
    (updatedTo - updatedLoadedTo) / updatedEstimatedPeriod
  );
  const estimatedBeforeLoadedCount = Math.ceil(
    (updatedLoadedFrom - updatedFrom) / updatedEstimatedPeriod
  );

  const estimatedCount =
    estimatedBeforeLoadedCount + loadedCount + estimatedAfterLoadedCount;

  return {
    estimatedPeriod: updatedEstimatedPeriod,
    estimatedCount,
    estimatedBeforeLoadedCount,
    estimatedAfterLoadedCount,
    from: Math.min(updatedLoadedFrom, from || TIMESTAMP_MAX),
    to: Math.max(updatedLoadedTo, to || TIMESTAMP_MIN),
    loadedFrom: updatedLoadedFrom,
    loadedTo: updatedLoadedTo
  };
}

function computeInitialStateFromProps(props) {
  const {
    agentConfiguration,
    estimatedPeriod,
    from,
    initialOperations,
    to
  } = props;

  if ((from == null || to == null) && initialOperations.length == 0) {
    throw new Error(
      'Unable to compute \'OperationsHistory\' initial state, either \'from\' and \'to\' should be defined or \'initialOperations\' should not be empty'
    );
  }

  const loadedOperations = preprocessOperations(
    agentConfiguration,
    initialOperations
  );
  const estimations = computeUpdatedEstimations({
    from,
    to,
    loadedOperations,
    estimatedPeriod
  });

  return {
    scrollToIndex: estimations.estimatedAfterLoadedCount,
    loadedOperations,
    ...estimations
  };
}

class OperationsHistory extends React.Component {
  constructor(props) {
    super(props);

    this.state = computeInitialStateFromProps(props);

    this._renderRow = this._renderRow.bind(this);
    this._renderPlaceholderRow = this._renderPlaceholderRow.bind(this);
    this._loadRows = this._createLoadRows.bind(this)();
  }
  _createLoadRows() {
    const eventEmitter = new EventEmitter();
    const REQUEST_ROW_EVENT = 'requestRow';

    most
      // Build a stream of all the requested operation's timestamp.
      .fromEvent(REQUEST_ROW_EVENT, eventEmitter)
      // Transform it to a stream of the requested timestamp bounds
      // /!\ There is no support for "holes" in the loaded operations
      .scan(
        ({ requestedFrom, requestedTo }, timestamp) => ({
          requestedFrom: Math.min(requestedFrom, timestamp),
          requestedTo: Math.max(requestedTo, timestamp)
        }),
        {
          requestedFrom: TIMESTAMP_MAX,
          requestedTo: TIMESTAMP_MIN
        }
      )
      // Only one event every 500ms
      .debounce(500)
      .concatMap(({ requestedFrom, requestedTo }) => {
        const { loadedFrom, loadedOperations, loadedTo } = this.state;
        const { onRequestOperations } = this.props;
        const loadedCount = loadedOperations.length;
        if (loadedCount == 0) {
          // Nothing already loaded
          return most.fromPromise(
            onRequestOperations(requestedFrom, requestedTo, true).then(
              (result) => {
                const { agentConfiguration } = this.props;

                const preprocessedOperations = preprocessOperations(
                  agentConfiguration,
                  result.operations,
                  result.initialState
                );

                return {
                  loadedFrom: result.from,
                  loadedOperations: preprocessedOperations,
                  loadedTo: result.to
                };
              }
            )
          );
        }

        // First promise is about loading operations after what is already
        // loaded, second promise is about before, third is about the very first state
        return most.fromPromise(
          Promise.all([
            requestedTo > loadedTo
              ? onRequestOperations(loadedTo, requestedTo, false)
              : Promise.resolve({
                operations: [],
                from: loadedTo,
                to: requestedTo
              }),
            requestedFrom < loadedFrom
              ? onRequestOperations(requestedFrom, loadedFrom, true)
              : Promise.resolve({
                operations: [],
                from: requestedFrom,
                to: loadedFrom
              })
          ]).then(([afterResults, beforeResults]) => {
            const { agentConfiguration } = this.props;
            const { loadedFrom, loadedOperations, loadedTo } = this.state;

            // Let's deal with 'afterOperations'
            const lastLoadedState = loadedOperations[0].state;
            const preprocessedAfterOperations = preprocessOperations(
              agentConfiguration,
              afterResults.operations.filter(
                ({ timestamp }) => timestamp > loadedTo
              ),
              lastLoadedState
            );

            // Let's deal with 'beforeOperations' && 'beforeInitialState'
            const preprocessedBeforeOperations = preprocessOperations(
              agentConfiguration,
              beforeResults.operations.filter(
                ({ timestamp }) => timestamp < loadedFrom
              ),
              beforeResults.initialState
            );

            // Return the new value for the loaded operations
            return {
              loadedFrom: Math.min(beforeResults.from, loadedFrom),
              loadedOperations: preprocessedAfterOperations.concat(
                loadedOperations,
                preprocessedBeforeOperations
              ),
              loadedTo: Math.max(beforeResults.to, loadedTo)
            };
          })
        );
      })
      .observe(({ loadedFrom, loadedOperations, loadedTo }) => {
        const estimations = computeUpdatedEstimations({
          ...this.state,
          loadedFrom,
          loadedOperations,
          loadedTo
        });
        this.setState({
          ...estimations,
          loadedOperations
        });
      });

    return (timestamp) => {
      eventEmitter.emit(REQUEST_ROW_EVENT, timestamp);
    };
  }
  _renderRow(index) {
    const { agentConfiguration } = this.props;
    const {
      estimatedAfterLoadedCount,
      estimatedBeforeLoadedCount,
      estimatedCount,
      estimatedPeriod,
      from,
      loadedOperations,
      to
    } = this.state;
    const Row = memoizedCreateRowComponent(agentConfiguration);
    const chronologicalIndex = estimatedCount - 1 - index;
    if (index < estimatedAfterLoadedCount) {
      // We try to display something that is, in time, after the loaded operations
      const estimatedTimestamp = Math.ceil(to - index * estimatedPeriod);
      this._loadRows(estimatedTimestamp);
      return (
        <Row key={ index } index={ index } timestamp={ estimatedTimestamp } loading />
      );
    } else if (chronologicalIndex < estimatedBeforeLoadedCount) {
      // We try to display something that is, in time, before the loaded operations
      const estimatedTimestamp = Math.floor(
        from + chronologicalIndex * estimatedPeriod
      );
      this._loadRows(estimatedTimestamp);
      return (
        <Row key={ index } index={ index } timestamp={ estimatedTimestamp } loading />
      );
    } else {
      const loadedIndex = index - estimatedAfterLoadedCount;
      const operation = loadedOperations[loadedIndex];
      return <Row key={ index } index={ index } { ...operation } />;
    }
  }
  _renderPlaceholderRow(start, end) {
    const { rowHeight } = this.props;
    return (
      <PlaceholderRow
        key={ start }
        rowCount={ end - start }
        rowHeight={ rowHeight }
      />
    );
  }
  componentDidUpdate(prevProps, prevState) {
    const { scrollToIndex } = this.state;
    if (scrollToIndex != null) {
      // Desired offset was set to something, that triggered a scroll to the offset
      // in the child InfiniteList, now we can set it back to null.
      this.setState({
        scrollToIndex: null
      });
    }
    if (this.props.initialOperations !== prevProps.initialOperations) {
      // New initial operations, it's like a new start.
      this.setState({
        ...computeInitialStateFromProps(this.props)
      });
    }
  }
  render() {
    const { agentConfiguration, height, rowHeight } = this.props;
    const { estimatedCount, scrollToIndex } = this.state;

    return (
      <Table
        className="craft-operations-history"
        height={ height }
        rowHeight={ rowHeight }>
        <thead>
          <HeaderRow agentConfiguration={ agentConfiguration } />
        </thead>
        <InfiniteList
          tag="tbody"
          rowHeight={ rowHeight }
          renderRow={ this._renderRow }
          renderPlaceholderRow={ this._renderPlaceholderRow }
          scrollToIndex={ scrollToIndex }
          count={ estimatedCount }
        />
      </Table>
    );
  }
}

OperationsHistory.defaultProps = {
  onRequestOperations: (from, to) =>
    Promise.reject(new Error('\'onRequestOperations\' is not defined.')),
  onRequestState: (timestamp) =>
    Promise.reject(new Error('\'onRequestState\' is not defined.')),
  estimatedPeriod: 60 * 10, // 10 minutes
  rowHeight: 45,
  height: 600,
  initialOperations: []
};

OperationsHistory.propTypes = {
  agentConfiguration: PropTypes.object.isRequired,
  onRequestOperations: PropTypes.func,
  onRequestState: PropTypes.func,
  rowHeight: PropTypes.number,
  height: PropTypes.number,
  initialOperations: PropTypes.array,
  estimatedPeriod: PropTypes.number,
  to: PropTypes.number,
  from: PropTypes.number
};

export default OperationsHistory;
