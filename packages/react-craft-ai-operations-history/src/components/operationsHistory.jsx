import createRowComponent from './createRowComponent';
import HeaderRow from './headerRow';
import InfiniteList from './infiniteList';
import PlaceholderRow from './placeholderRow';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import Table from './table';

function estimateCount({
  estimatedPeriod,
  from,
  initialOffset,
  loadedOperations,
  to
}) {
  const loadedCount = loadedOperations.length;
  if ((from == null || to == null) && loadedCount == 0) {
    throw new Error(
      'Unexpected error, either \'from\' and \'to\' should be defined or \'loadedOperations\' should not be empty'
    );
  }
  if (loadedCount == 0) {
    // No data to estimate
    const count = Math.ceil((to - from) / estimatedPeriod);
    return {
      from,
      to,
      estimatedPeriod,
      estimatedLoadedOffset: 0,
      initialOffset: Math.min(initialOffset || 0, count - 1),
      count: Math.ceil((to - from) / estimatedPeriod)
    };
  }

  // Operations are ordered from the latest to the earliest
  const loadedTo = loadedOperations[0].timestamp;
  const loadedFrom = loadedOperations[loadedCount - 1].timestamp;
  const updatedEstimatedPeriod = (loadedTo - loadedFrom) / loadedCount;

  if (from == null || to == null) {
    return {
      from: loadedFrom,
      to: loadedTo,
      estimatedLoadedOffset: 0,
      estimatedPeriod: updatedEstimatedPeriod,
      initialOffset: Math.min(initialOffset || 0, loadedCount - 1),
      count: loadedCount
    };
  }

  const estimatedLoadedOffset = Math.ceil(
    (to - loadedTo) / updatedEstimatedPeriod
  );
  const count = Math.ceil((to - from) / updatedEstimatedPeriod);
  return {
    from,
    to,
    estimatedLoadedOffset,
    estimatedPeriod: estimatedLoadedOffset,
    initialOffset: Math.min(initialOffset || estimatedLoadedOffset, count - 1),
    count
  };
}

class OperationsHistory extends React.Component {
  constructor(props) {
    super(props);

    const {
      agentConfiguration,
      estimatedPeriod,
      from,
      initialOperations,
      to
    } = props;

    if ((from == null || to == null) && initialOperations.length == 0) {
      throw new Error(
        'Unable to build a \'OperationsHistory\', either \'from\' and \'to\' should be defined or \'initialOperations\' should not be empty'
      );
    }

    const initialState = {
      from,
      to,
      estimatedPeriod,
      loadedOperations: preprocessOperations(
        agentConfiguration,
        initialOperations
      )
    };

    this.state = {
      ...initialState,
      ...estimateCount(initialState)
    };

    this._refreshRowComponent = this._refreshRowComponent.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._renderPlaceholderRow = this._renderPlaceholderRow.bind(this);
  }
  _refreshRowComponent() {
    const { agentConfiguration, rowHeight } = this.props;
    this.Row = createRowComponent({ agentConfiguration, rowHeight });
  }
  _renderRow(index) {
    const { estimatedLoadedOffset, loadedOperations } = this.state;
    //console.log('estimatedLoadedOffset', estimatedLoadedOffset);
    //console.log('index', index);
    const loadedIndex = index - estimatedLoadedOffset;
    //console.log('loadedIndex', loadedIndex);
    const operation = loadedOperations[loadedIndex];
    //console.log('operation', operation);
    if (!operation) {
      return <this.Row key={ index } index={ index } loading />;
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
    // Maybe simply use a memoize woumd be fine
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
  estimatedPeriod: 60 * 10, // 10 minutes
  count: 0,
  rowHeight: 45,
  height: 600,
  initialOperations: []
};

OperationsHistory.propTypes = {
  agentConfiguration: PropTypes.object.isRequired,
  rowHeight: PropTypes.number,
  height: PropTypes.number,
  initialOperations: PropTypes.array,
  estimatedPeriod: PropTypes.number,
  to: PropTypes.number,
  from: PropTypes.number
};

export default OperationsHistory;
