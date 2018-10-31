import createTableComponents from './createTableComponents';
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
  const { Header, Row } = createTableComponents(agentConfiguration);
  const preprocessedOperations = preprocessOperations(
    agentConfiguration,
    initialOperations
  );
  return (
    <Table
      className="craft-operations-history"
      rowHeight={ rowHeight }
      height={ height }>
      <thead>
        <Header />
      </thead>
      <tbody>{preprocessedOperations.map(Row)}</tbody>
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
