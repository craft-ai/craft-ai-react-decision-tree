import createTableComponents from './createTableComponents';
import InfiniteList from './infiniteList';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import Table from './table';

const OperationsHistory = ({
  agentConfiguration,
  height,
  initialOperations,
  rowHeight
}) => {
  const { Header, PlaceholderRow, Row } = createTableComponents(
    agentConfiguration
  );
  const preprocessedOperations = preprocessOperations(
    agentConfiguration,
    initialOperations
  );
  const renderRow = (index) => (
    <Row key={ index } index={ index } { ...preprocessedOperations[index] } />
  );
  const renderPlaceholderRow = (start, end) => (
    <PlaceholderRow key={ start } rowHeight={ rowHeight } rowCount={ end - start } />
  );
  return (
    <Table
      className="craft-operations-history"
      rowHeight={ rowHeight }
      height={ height }>
      <thead>
        <Header />
      </thead>
      <InfiniteList
        tag="tbody"
        rowHeight={ rowHeight }
        renderRow={ renderRow }
        renderPlaceholderRow={ renderPlaceholderRow }
        rowCount={ preprocessedOperations.length }
      />
    </Table>
  );
};

OperationsHistory.defaultProps = {
  initialOperations: [],
  rowHeight: 50,
  height: 600
};

OperationsHistory.propTypes = {
  agentConfiguration: PropTypes.object.isRequired,
  rowHeight: PropTypes.number,
  height: PropTypes.number,
  initialOperations: PropTypes.array
};

export default OperationsHistory;
