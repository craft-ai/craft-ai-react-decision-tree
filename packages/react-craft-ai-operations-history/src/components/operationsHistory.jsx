import createRowComponent from './createRowComponent';
import { EventEmitter } from 'events';
import HeaderRow from './headerRow';
import InfiniteList from './infiniteList';
import last from 'lodash.last';
import memoizeOne from 'memoize-one';
import orderBy from 'lodash.orderby';
import PlaceholderRow from './placeholderRow';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import * as most from 'most';
import Table, {
  AGENT_NAME_CELL_WIDTH,
  computeCellWidth,
  TIMESTAMP_CELL_WIDTH
} from './table';

const TIMESTAMP_MAX = Number.MAX_SAFE_INTEGER;
const TIMESTAMP_MIN = 0;

function extractProperties(entityConfiguration) {
  const properties = Object.keys(entityConfiguration.context)
    .map(
      (property) => ({
        property,
        ...entityConfiguration.context[property],
        output: !!entityConfiguration.output.find(
          (outputProperty) => outputProperty === property
        )
      })
    );

  const sortedProperties = orderBy(properties, ['output', 'property']);

  return sortedProperties;
}

const memoizedCreateRowComponent = memoizeOne((properties, totalWidth) => {
  return createRowComponent({ properties, totalWidth });
});

function computeUpdatedEstimations({
  estimatedPeriod,
  focus,
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
    loadedOperations[0].timestamp, // Operations are ordered from the earliest to the latest
    loadedFrom || TIMESTAMP_MAX
  );
  if (from == null) {
    updatedFrom = updatedLoadedFrom;
  }
  else {
    updatedFrom = from;
    updatedLoadedFrom = Math.max(updatedLoadedFrom, updatedFrom);
  }

  let updatedTo;
  let updatedLoadedTo = Math.max(
    loadedOperations[loadedCount - 1].timestamp, // Operations are ordered from the earliest to the latest
    loadedTo || updatedLoadedFrom
  );
  if (to == null) {
    updatedTo = updatedLoadedTo;
  }
  else {
    updatedTo = to;
    updatedLoadedTo = Math.min(updatedLoadedTo, updatedTo);
  }

  // Period is the average time between operations
  const updatedEstimatedPeriod = loadedCount === 1 ?
    loadedCount :
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
    from: updatedFrom,
    to: updatedTo,
    loadedFrom: updatedLoadedFrom,
    loadedTo: updatedLoadedTo
  };
}

function computeInitialStateFromProps(props) {
  const { entityConfiguration, focus, from, initialOperations, initialState, to } = props;

  const loadedOperations = preprocessOperations(
    entityConfiguration,
    initialOperations,
    initialState
  );
  const estimations = computeUpdatedEstimations({
    from,
    to,
    loadedOperations,
    estimatedPeriod: entityConfiguration.time_quantum || 1 // Use a time quantum of 1 as the default period
  });

  return {
    scrollToTimestamp: focus || estimations.loadedTo,
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

function computeStateAfterOperationsLoading(
  state,
  { loadedFrom, loadedOperationsAfter, loadedOperationsBefore, loadedTo }
) {
  const { from, loadedOperations, to } = state;
  const updatedLoadedOperations = [
    ...(loadedOperationsAfter || []),
    ...(loadedOperations || []),
    ...(loadedOperationsBefore || [])
  ].filter(({ timestamp }) => timestamp >= from && timestamp <= to);
  const updatedLoadedCount = updatedLoadedOperations.length;
  const updatedLoadedFrom = Math.min(
    updatedLoadedCount
      ? last(updatedLoadedOperations).timestamp
      : TIMESTAMP_MAX,
    loadedFrom
  );
  const updatedLoadedTo = Math.max(
    updatedLoadedCount ? updatedLoadedOperations[0].timestamp : TIMESTAMP_MIN,
    loadedTo
  );
  const estimations = computeUpdatedEstimations({
    ...state,
    loadedFrom: updatedLoadedFrom,
    loadedOperations: updatedLoadedOperations,
    loadedTo: updatedLoadedTo
  });
  return {
    ...estimations,
    loadedOperations: updatedLoadedOperations
  };
}

function estimateIndexFromTimestamp(timestamp, state) {
  const {
    estimatedAfterLoadedCount,
    estimatedCount,
    from,
    loadedFrom,
    loadedOperations,
    loadedTo,
    to
  } = state;
  if (timestamp <= from) {
    return estimatedCount - 1;
  }
  else if (timestamp <= loadedFrom) {
    return Math.floor((timestamp - from) / (loadedFrom - from));
  }
  else if (timestamp <= loadedTo) {
    return (
      estimatedAfterLoadedCount +
      loadedOperations.findIndex(
        (operation) => timestamp >= operation.timestamp
      )
    );
  }
  else if (timestamp <= to) {
    return Math.floor((to - timestamp) / (to - loadedTo));
  }
  else {
    return 0;
  }
}

const memoizedComputedEstimatedFocusIndex = memoizeOne((timestamp, state) => {
  if (timestamp == null) {
    return null;
  }
  else {
    return estimateIndexFromTimestamp(timestamp, state);
  }
});

class OperationsHistory extends React.Component {
  constructor(props) {
    super(props);

    this.state = computeInitialStateFromProps(props);

    this.wrapperElement = null;

    this._setHeaderElement = this._setHeaderElement.bind(this);
    this._onHorizontalScroll = this._onHorizontalScroll.bind(this);
    const {
      onRequestOperation,
      onUpdateOperationsBounds
    } = this._createEventHandlers.bind(this)();
    this._onRequestOperation = onRequestOperation;
    this._onUpdateOperationsBounds = onUpdateOperationsBounds;

    this._renderRow = this._renderRow.bind(this);
    this._renderPlaceholderRow = this._renderPlaceholderRow.bind(this);

    this._extractedProperties = extractProperties(props.entityConfiguration);
    this._totalWidth = TIMESTAMP_CELL_WIDTH + (props.entityConfiguration.filter ? AGENT_NAME_CELL_WIDTH : 0);
    this._extractedProperties.forEach(
      ({ property }) => (this._totalWidth += computeCellWidth(property.length))
    );
  }

  _setHeaderElement(element) {
    this.headerElement = element;
  }

  _onHorizontalScroll(scrollLeft) {
    this.headerElement.scrollLeft = scrollLeft;
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
      .scan(
        ({ requestedFrom, requestedTo }, { from, requestedTimestamp, to }) => {
          if (requestedTimestamp) {
            // Update the requested bounds
            // /!\ There is no support for "holes" in the loaded operations
            return {
              requestedFrom: Math.min(requestedFrom, requestedTimestamp),
              requestedTo: Math.max(requestedTo, requestedTimestamp)
            };
          }
          else {
            // "reset" the requested bounds when a bound update occurs.
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
            onRequestOperations(requestedFrom, requestedTo, true)
              .then(
                (result) => {
                  const { entityConfiguration } = this.props;

                  if (result.to < requestedFrom) {
                    throw new Error(
                      '\'onRequestOperations\' returned operations not overlapping with the requested range.'
                    );
                  }

                  const preprocessedOperations = preprocessOperations(
                    entityConfiguration,
                    result.operations,
                    result.initialState
                  );

                  return {
                    loadedFrom: result.from,
                    loadedOperationsBefore: preprocessedOperations,
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
          ])
            .then(([afterResults, beforeResults]) => {
              if (
                afterResults.to < loadedTo ||
              beforeResults.to < requestedFrom
              ) {
                throw new Error(
                  '\'onRequestOperations\' returned operations not overlapping with the requested range.'
                );
              }

              const { entityConfiguration } = this.props;
              const { loadedFrom, loadedOperations, loadedTo } = this.state;
              // Let's deal with 'afterOperations'
              const lastLoadedState = loadedOperations[0].state;
              const preprocessedAfterOperations = preprocessOperations(
                entityConfiguration,
                afterResults.operations.filter(
                  ({ timestamp }) => timestamp > loadedTo
                ),
                lastLoadedState
              );

              // Let's deal with 'beforeOperations' && 'beforeInitialState'
              const preprocessedBeforeOperations = preprocessOperations(
                entityConfiguration,
                beforeResults.operations.filter(
                  ({ timestamp }) => timestamp < loadedFrom
                ),
                beforeResults.initialState
              );

              // Return the new value for the loaded operations
              return {
                loadedFrom: Math.min(beforeResults.from, loadedFrom),
                loadedOperationsAfter: preprocessedAfterOperations,
                loadedOperationsBefore: preprocessedBeforeOperations,
                loadedTo: Math.max(afterResults.to, loadedTo)
              };
            })
        );
      })
      .observe(
        ({
          loadedFrom,
          loadedOperationsAfter,
          loadedOperationsBefore,
          loadedTo
        }) => {
          this.setState((state) =>
            computeStateAfterOperationsLoading(state, {
              loadedFrom,
              loadedOperationsAfter,
              loadedOperationsBefore,
              loadedTo
            })
          );
        }
      )
      .catch((error) => {
        this.setState((state) => ({
          ...state,
          error: state.error || error
        }));
      });

    return {
      onRequestOperation: (timestamp) =>
        eventEmitter.emit(REQUEST_OPERATION_EVENT, timestamp),
      onUpdateOperationsBounds: ({ from, to }) =>
        eventEmitter.emit(UPDATE_OPERATIONS_BOUNDS_EVENT, { from, to })
    };
  }

  _renderRow(index) {
    const { focus } = this.props;
    const {
      estimatedAfterLoadedCount,
      estimatedBeforeLoadedCount,
      estimatedCount,
      estimatedPeriod,
      from,
      loadedOperations,
      to
    } = this.state;
    const Row = memoizedCreateRowComponent(
      this._extractedProperties,
      this._totalWidth,
      this._cellsWidth
    );
    const estimatedFocusIndex = memoizedComputedEstimatedFocusIndex(
      focus,
      this.state
    );
    const chronologicalIndex = estimatedCount - 1 - index;
    if (index >= estimatedCount || index < 0) {
      console.error(
        `Unable to render row at index ${index}, it should belong to [0;${estimatedCount}[`
      );
      return null;
    }
    if (index < estimatedAfterLoadedCount) {
      // We try to display something that is, in time, after the loaded operations
      const estimatedTimestamp = Math.ceil(to - index * estimatedPeriod);
      this._onRequestOperation(estimatedTimestamp);
      return (
        <Row
          key={ index }
          index={ index }
          timestamp={ estimatedTimestamp }
          loading
          focus={ estimatedFocusIndex === index }
        />
      );
    }
    else if (chronologicalIndex < estimatedBeforeLoadedCount) {
      // We try to display something that is, in time, before the loaded operations
      const estimatedTimestamp = Math.floor(
        from + chronologicalIndex * estimatedPeriod
      );
      this._onRequestOperation(estimatedTimestamp);
      return (
        <Row
          key={ index }
          index={ index }
          timestamp={ estimatedTimestamp }
          loading
          focus={ estimatedFocusIndex === index }
        />
      );
    }
    else {
      const loadedIndex = index - estimatedAfterLoadedCount;
      const operation = loadedOperations[loadedIndex];
      return (
        <Row
          key={ index }
          index={ index }
          { ...operation }
          focus={ estimatedFocusIndex === index }
        />
      );
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

  componentDidUpdate(prevProps) {
    const { scrollToTimestamp } = this.state;
    if (scrollToTimestamp != null) {
      // Desired offset was set to something, that triggered a scroll to the offset
      // in the child InfiniteList, now we can set it back to null.
      this.setState({
        scrollToTimestamp: null
      });
    }
    if (this.props.focus != prevProps.focus) {
      this.setState({
        scrollToTimestamp: this.props.focus
      });
    }
    if (this.props.initialOperations !== prevProps.initialOperations) {
      // New initial operations, it's like a new start.
      this.setState((state, props) => {
        const newState = computeInitialStateFromProps(props);
        this._onUpdateOperationsBounds({
          from: newState.from,
          to: newState.to
        });
        return newState;
      });
    }
    const { from, to } = this.props;
    if (to !== prevProps.to || from !== prevProps.from) {
      // Bounds has been updated.
      this.setState((state) => {
        const newState = computeStateAfterBoundsUpdate(state, {
          from,
          to
        });
        this._onUpdateOperationsBounds({
          from: newState.from,
          to: newState.to
        });
        return newState;
      });
    }
  }

  render() {
    const { entityConfiguration, height, rowHeight, width } = this.props;
    const { error, estimatedCount, scrollToTimestamp } = this.state;

    if (error) {
      throw error;
    }

    return (
      <Table
        className='craft-operations-history'
        height={ height }
        rowHeight={ rowHeight }
        maxWidth={ width }
      >
        <thead ref={ this._setHeaderElement }>
          <HeaderRow properties={ this._extractedProperties } isGenerator={ entityConfiguration.filter !== undefined } />
        </thead>
        <InfiniteList
          tag='tbody'
          rowHeight={ rowHeight }
          renderRow={ this._renderRow }
          renderPlaceholderRow={ this._renderPlaceholderRow }
          scrollToIndex={
            scrollToTimestamp != null
              ? estimateIndexFromTimestamp(scrollToTimestamp, this.state)
              : null
          }
          onHorizontalScroll={ this._onHorizontalScroll }
          count={ estimatedCount }
        />
      </Table>
    );
  }
}

OperationsHistory.defaultProps = {
  onRequestOperations: (
    requestedFrom,
    requestedTo,
    requestInitialState = false
  ) => Promise.reject(new Error('\'onRequestOperations\' is not defined.')),
  rowHeight: 45,
  height: 600,
  initialOperations: [],
  initialState: {}
};

OperationsHistory.propTypes = {
  entityConfiguration: PropTypes.object.isRequired,
  onRequestOperations: PropTypes.func,
  rowHeight: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
  initialOperations: PropTypes.array,
  initialState: PropTypes.object,
  to: PropTypes.number,
  from: PropTypes.number,
  focus: PropTypes.number
};

export default OperationsHistory;
