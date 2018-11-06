import createRowComponent from './createRowComponent';
import has from 'lodash.has';
import HeaderRow from './headerRow';
import InfiniteList from './infiniteList';
import PlaceholderRow from './placeholderRow';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import Table from './table';
import { EventEmitter } from 'events';
import { Object } from 'es6-shim';
import * as most from 'most';

function computeDiff(object, updatedObject) {
  const diff = {};
  // Properties of the object having different values in the updated object
  Object.keys(object).map((key) => {
    if (has(updatedObject, key) && object[key] != updatedObject[key]) {
      diff[key] = updatedObject[key];
    }
  });
  // Properties of the updated object not existing in the object
  Object.keys(updatedObject).map((key) => {
    if (!has(object, key)) {
      diff[key] = updatedObject[key];
    }
  });
  return diff;
}

function computeUpdatedState(
  updatedState,
  state = {},
  updatedProps = {},
  props = {}
) {
  // Computing the diffs
  const diffState = computeDiff(state, updatedState);
  const diffProps = computeDiff(props, updatedProps);

  // Updating the loaded operations
  let loadedOperations = diffState.loadedOperations || state.loadedOperations;
  let estimatedPeriod =
    diffProps.estimatedPeriod ||
    diffState.estimatedPeriod ||
    state.estimatedPeriod ||
    props.estimatedPeriod;

  if (diffProps.initialOperations || loadedOperations == null) {
    // Initial operations changed or no loaded operations
    const agentConfiguration =
      diffProps.agentConfiguration || props.agentConfiguration;
    loadedOperations = preprocessOperations(
      agentConfiguration,
      diffProps.initialOperations || props.initialOperations
    );
    estimatedPeriod = diffProps.estimatedPeriod || props.estimatedPeriod;
  }

  const loadedCount = loadedOperations.length;

  // Updating the overall bounds
  const from = diffProps.from || diffState.from || state.from || props.from;
  const to = diffProps.to || diffState.to || state.to || props.to;

  if ((from == null || to == null) && loadedCount == 0) {
    throw new Error(
      'Unexpected error, either \'from\' and \'to\' should be defined or \'loadedOperations\' should not be empty'
    );
  }

  const initialOffset = diffState.initialOffset || state.initialOffset || 0;

  if (loadedCount == 0) {
    // No data to estimate
    const count = Math.ceil((to - from) / estimatedPeriod);
    return {
      from,
      to,
      estimatedPeriod,
      estimatedLoadedOffset: 0,
      initialOffset: Math.min(initialOffset, count - 1),
      count: Math.ceil((to - from) / estimatedPeriod),
      loadedOperations
    };
  }

  // Operations are ordered from the latest to the earliest
  const loadedTo = loadedOperations[0].timestamp;
  const loadedFrom = loadedOperations[loadedCount - 1].timestamp;

  // Period is the average time between operations
  const updatedEstimatedPeriod = (loadedTo - loadedFrom) / (loadedCount - 1);

  if (from == null || to == null) {
    return {
      from: loadedFrom,
      to: loadedTo,
      estimatedLoadedOffset: 0,
      estimatedPeriod: updatedEstimatedPeriod,
      initialOffset: Math.min(initialOffset || 0, loadedCount - 1),
      count: loadedCount,
      loadedOperations
    };
  }

  const estimatedLoadedOffset = Math.floor(
    (to - loadedTo) / updatedEstimatedPeriod
  );

  const count = Math.floor((to - from) / updatedEstimatedPeriod);
  return {
    from,
    to,
    estimatedLoadedOffset,
    estimatedPeriod: updatedEstimatedPeriod,
    initialOffset: Math.min(initialOffset || estimatedLoadedOffset, count - 1),
    count,
    loadedOperations
  };
}

class OperationsHistory extends React.Component {
  constructor(props) {
    super(props);

    const { from, initialOperations, to } = props;

    if ((from == null || to == null) && initialOperations.length == 0) {
      throw new Error(
        'Unable to build a \'OperationsHistory\', either \'from\' and \'to\' should be defined or \'initialOperations\' should not be empty'
      );
    }

    this.state = computeUpdatedState({}, this.state, {}, props);

    this._refreshRowComponent = this._refreshRowComponent.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._renderPlaceholderRow = this._renderPlaceholderRow.bind(this);
    this._loadRows = this._createLoadRows.bind(this)();
  }
  _createLoadRows() {
    const eventEmitter = new EventEmitter();
    const REQUEST_ROW_EVENT = 'requestRow';
    const { loadedOperations } = this.state;

    const loadedCount = loadedOperations.length;

    most
      // Build a stream of all the requested operation's timestamp.
      .fromEvent(REQUEST_ROW_EVENT, eventEmitter)
      // Transform it to a stream of the requested timestamp bounds
      // /!\ There is no support for "holes" in the loaded operations
      .scan(
        ({ from, to }, timestamp) => ({
          from: Math.min(from, timestamp),
          to: Math.max(to, timestamp)
        }),
        {
          from:
            loadedCount > 0
              ? loadedOperations[loadedCount - 1].timestamp
              : Number.POSITIVE_INFINITY,
          to: loadedCount > 0 ? loadedOperations[0].timestamp : 0
        }
      )
      // Only one event every 500ms
      .debounce(500)
      // .tap(({ from, to }) =>
      //   console.log(`Requesting operations from '${from}' to '${to}'...`)
      // )
      .concatMap(({ from, to }) => {
        const { loadedOperations } = this.state;
        const { onRequestOperations, onRequestState } = this.props;
        const loadedCount = loadedOperations.length;
        if (loadedCount == 0) {
          // Nothing already loaded
          return most.fromPromise(
            Promise.all([
              onRequestOperations(from, to),
              onRequestState(from)
            ]).then(([operations, initialState]) => {
              const { agentConfiguration } = this.props;

              const preprocessedOperations = preprocessOperations(
                agentConfiguration,
                operations,
                initialState.context
              );

              return preprocessedOperations;
            })
          );
        }
        const loadedTo = loadedOperations[0].timestamp;
        const loadedFrom = loadedOperations[loadedCount - 1].timestamp;

        // First promise is about loading operations after what is already
        // loaded, second promise is about before, third is about the very first state
        return most.fromPromise(
          Promise.all([
            loadedCount > 0 && to > loadedTo
              ? onRequestOperations(loadedTo, to)
              : Promise.resolve([]),
            from < loadedFrom
              ? onRequestOperations(from, loadedFrom)
              : Promise.resolve([]),
            from < loadedFrom ? onRequestState(from) : Promise.resolve({})
          ]).then(([afterOperations, beforeOperations, beforeInitialState]) => {
            const { agentConfiguration } = this.props;
            const { loadedOperations } = this.state;

            // Let's deal with 'afterOperations'
            const lastLoadedTimestamp = loadedOperations[0].timestamp;
            const lastLoadedState = loadedOperations[0].state;
            const preprocessedAfterOperations = preprocessOperations(
              agentConfiguration,
              afterOperations.filter(
                ({ timestamp }) => timestamp > lastLoadedTimestamp
              ),
              lastLoadedState
            );

            // Let's deal with 'beforeOperations' && 'beforeInitialState'
            const loadedCount = loadedOperations.length;
            const firstLoadedTimestamp =
              loadedOperations[loadedCount - 1].timestamp;
            const preprocessedBeforeOperations = preprocessOperations(
              agentConfiguration,
              beforeOperations.filter(
                ({ timestamp }) => timestamp < firstLoadedTimestamp
              ),
              beforeInitialState.context
            );

            // Return the new value for the loaded operations
            return preprocessedAfterOperations.concat(
              loadedOperations,
              preprocessedBeforeOperations
            );
          })
        );
      })
      // .tap((newLoadedOperations) =>
      //   console.log(
      //     `Operations from '${newLoadedOperations[0].timestamp}' to '${
      //       newLoadedOperations[newLoadedOperations.length - 1].timestamp
      //     }' loaded!`
      //   )
      // )
      .observe((newLoadedOperations) => {
        this.setState(
          computeUpdatedState(
            {
              loadedOperations: newLoadedOperations
            },
            this.state,
            {},
            this.props
          )
        );
      });

    return (timestamp) => {
      eventEmitter.emit(REQUEST_ROW_EVENT, timestamp);
    };
  }
  _refreshRowComponent() {
    const { agentConfiguration, rowHeight } = this.props;
    this.Row = createRowComponent({ agentConfiguration, rowHeight });
  }
  _renderRow(index) {
    const {
      estimatedLoadedOffset,
      estimatedPeriod,
      loadedOperations,
      to
    } = this.state;
    const loadedIndex = index - estimatedLoadedOffset;
    const operation = loadedOperations[loadedIndex];
    if (!operation) {
      const estimatedTimestamp = to - index * estimatedPeriod;

      this._loadRows(estimatedTimestamp);
      return (
        <this.Row
          key={ index }
          index={ index }
          timestamp={ estimatedTimestamp }
          loading
        />
      );
    } else {
      return <this.Row key={ index } index={ index } { ...operation } />;
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
  render() {
    const { agentConfiguration, height, rowHeight } = this.props;
    const { count, initialOffset } = this.state;
    // This should only be called if agentConfiguration or rowHeight changes
    // Maybe simply use a memoize would be fine
    this._refreshRowComponent();
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
          initialOffset={ initialOffset }
          count={ count }
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
