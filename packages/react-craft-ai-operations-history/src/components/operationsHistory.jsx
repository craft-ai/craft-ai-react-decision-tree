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
    // The 'to' might be before the 'from', we need to update it
    const updatedTo = Math.max(from, to);
    // No loaded data to re-estimate the period
    const estimatedCount = Math.ceil((updatedTo - from) / estimatedPeriod);

    return {
      estimatedPeriod,
      estimatedCount,
      estimatedBeforeLoadedCount: estimatedCount,
      estimatedAfterLoadedCount: 0,
      from,
      to: updatedTo,
      loadedFrom: loadedFrom != null ? Math.max(loadedFrom, from) : null,
      loadedTo: loadedTo != null ? Math.min(loadedTo, updatedTo) : null
    };
  }

  let updatedFrom;
  let updatedLoadedFrom = Math.min(
    loadedOperations[loadedCount - 1].timestamp, // Operations are ordered from the latest to the earliest
    loadedFrom || TIMESTAMP_MAX
  );
  if (from == null) {
    updatedFrom = updatedLoadedFrom;
  } else {
    updatedFrom = from;
    updatedLoadedFrom = Math.max(updatedLoadedFrom, updatedFrom);
  }

  let updatedTo;
  let updatedLoadedTo = Math.max(
    loadedOperations[0].timestamp, // Operations are ordered from the latest to the earliest
    loadedTo || updatedLoadedFrom
  );
  if (to == null) {
    updatedTo = updatedLoadedTo;
  } else {
    updatedTo = to;
    updatedLoadedTo = Math.min(updatedLoadedTo, updatedTo);
  }

  // Period is the average time between operations
  const updatedEstimatedPeriod =
    (updatedLoadedTo - updatedLoadedFrom) / (loadedCount - 1);
  console.log(
    'updatedEstimatedPeriod',
    updatedEstimatedPeriod,
    'updatedLoadedTo',
    updatedLoadedTo,
    'updatedLoadedFrom',
    updatedLoadedFrom,
    'loadedCount',
    loadedCount
  );

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
    from: updatedFrom,
    to: updatedTo,
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
    scrollToTimestamp: estimations.loadedTo,
    loadedOperations,
    ...estimations
  };
}

function computeStateAfterBoundsUpdate(state, { from, to }) {
  const { estimatedPeriod, loadedFrom, loadedOperations, loadedTo } = state;
  const newLoadedOperations = loadedOperations.filter(
    ({ timestamp }) => timestamp >= from && timestamp <= to
  );
  const estimations = computeUpdatedEstimations({
    estimatedPeriod,
    from,
    loadedFrom,
    loadedOperations: newLoadedOperations,
    loadedTo,
    to
  });
  return {
    ...state,
    loadedOperations: newLoadedOperations,
    ...estimations
  };
}

class OperationsHistory extends React.Component {
  constructor(props) {
    super(props);

    this.state = computeInitialStateFromProps(props);

    const {
      onRequestOperation,
      onUpdateOperationsBounds
    } = this._createEventHandlers.bind(this)();
    this._onRequestOperation = onRequestOperation;
    this._onUpdateOperationsBounds = onUpdateOperationsBounds;

    this._renderRow = this._renderRow.bind(this);
    this._renderPlaceholderRow = this._renderPlaceholderRow.bind(this);
    this._estimateIndexFromTimestamp = this._estimateIndexFromTimestamp.bind(
      this
    );
  }
  _createEventHandlers() {
    const eventEmitter = new EventEmitter();
    const REQUEST_OPERATION_EVENT = 'requestOperation';
    const UPDATE_OPERATIONS_BOUNDS_EVENT = 'updateOperationBounds';

    most
      .merge(
        // Build a stream of all the requested operation's timestamp.
        most
          .fromEvent(REQUEST_OPERATION_EVENT, eventEmitter)
          .map((requestedTimestamp) => ({ requestedTimestamp })),
        // Build a stream of all the changes in the  operation's timestamp.
        most.fromEvent(UPDATE_OPERATIONS_BOUNDS_EVENT, eventEmitter)
      )
      // /!\ There is no support for "holes" in the loaded operations
      .scan(
        ({ requestedFrom, requestedTo }, { from, requestedTimestamp, to }) => {
          if (requestedTimestamp) {
            return {
              requestedFrom: Math.min(requestedFrom, requestedTimestamp),
              requestedTo: Math.max(requestedTo, requestedTimestamp)
            };
          } else {
            return {
              requestedFrom: Math.max(requestedFrom, from || TIMESTAMP_MAX),
              requestedTo: Math.min(requestedTo, to || TIMESTAMP_MIN)
            };
          }
        },
        {
          requestedFrom: TIMESTAMP_MAX,
          requestedTo: TIMESTAMP_MIN
        }
      )
      .filter(({ requestedFrom, requestedTo }) => requestedTo > requestedFrom)
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
        console.log('A - this.setState', {
          ...estimations,
          loadedOperations
        });
        this.setState({
          ...estimations,
          loadedOperations
        });
      });

    return {
      onRequestOperation: (timestamp) =>
        eventEmitter.emit(REQUEST_OPERATION_EVENT, timestamp),
      onUpdateOperationsBounds: ({ from, to }) =>
        eventEmitter.emit(UPDATE_OPERATIONS_BOUNDS_EVENT, { from, to })
    };
  }
  _estimateIndexFromTimestamp(timestamp) {
    const {
      estimatedAfterLoadedCount,
      estimatedCount,
      from,
      loadedFrom,
      loadedOperations,
      loadedTo,
      to
    } = this.state;
    if (timestamp <= from) {
      return 0;
    } else if (timestamp <= loadedFrom) {
      return Math.floor((timestamp - from) / (loadedFrom - from));
    } else if (timestamp <= loadedTo) {
      return (
        estimatedAfterLoadedCount +
        loadedOperations.findIndex(
          (operation) => timestamp >= operation.timestamp
        )
      );
    } else if (timestamp <= to) {
      return Math.floor((to - timestamp) / (to - loadedTo));
    } else {
      return estimatedCount - 1;
    }
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
      this._onRequestOperation(estimatedTimestamp);
      return (
        <Row key={ index } index={ index } timestamp={ estimatedTimestamp } loading />
      );
    } else if (chronologicalIndex < estimatedBeforeLoadedCount) {
      // We try to display something that is, in time, before the loaded operations
      const estimatedTimestamp = Math.floor(
        from + chronologicalIndex * estimatedPeriod
      );
      this._onRequestOperation(estimatedTimestamp);
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
    const { scrollToTimestamp } = this.state;
    if (scrollToTimestamp != null) {
      // Desired offset was set to something, that triggered a scroll to the offset
      // in the child InfiniteList, now we can set it back to null.
      console.log('B - this.setState', {
        scrollToTimestamp: null
      });
      this.setState({
        scrollToTimestamp: null
      });
    }
    if (this.props.initialOperations !== prevProps.initialOperations) {
      // New initial operations, it's like a new start.
      const newState = computeInitialStateFromProps(this.props);
      console.log('C - this.setState', newState);
      this.setState(newState);
      this._onUpdateOperationsBounds({ from: newState.from, to: newState.to });
    }
    const { from, to } = this.props;
    if (to !== prevProps.to || from !== prevProps.from) {
      // Bounds has been updated.
      const newState = computeStateAfterBoundsUpdate(this.state, { from, to });
      console.log('D - this.setState', newState);
      this.setState(newState);
      this._onUpdateOperationsBounds({ from: newState.from, to: newState.to });
    }
  }
  render() {
    const { agentConfiguration, height, rowHeight } = this.props;
    const { estimatedCount, scrollToTimestamp } = this.state;

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
          scrollToIndex={
            scrollToTimestamp != null
              ? this._estimateIndexFromTimestamp(scrollToTimestamp)
              : null
          }
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
