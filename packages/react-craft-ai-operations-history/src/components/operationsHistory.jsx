import createRowComponent from './createRowComponent';
import HeaderRow from './headerRow';
import InfiniteList from './infiniteList';
import PlaceholderRow from './placeholderRow';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import Table from './table';

class OperationsHistory extends React.Component {
  constructor(props) {
    super(props);

    const { agentConfiguration, initialOperations } = this.props;

    const preprocessedOperations = preprocessOperations(
      agentConfiguration,
      initialOperations
    );

    this.state = {
      loadedOperations: preprocessedOperations,
      operationsCount: preprocessedOperations.length
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
    const { loadedOperations } = this.state;
    return <this.Row key={ index } index={ index } { ...loadedOperations[index] } />;
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
    const { operationsCount } = this.state;
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
          rowCount={ operationsCount }
        />
      </Table>
    );
  }
}

OperationsHistory.defaultProps = {
  rowHeight: 45,
  height: 600,
  initialOperations: []
};

OperationsHistory.propTypes = {
  agentConfiguration: PropTypes.object.isRequired,
  rowHeight: PropTypes.number,
  height: PropTypes.number,
  initialOperations: PropTypes.array
};

export default OperationsHistory;
