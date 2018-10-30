import createTableComponents from './createTableComponents';
import preprocessOperations from '../utils/preprocessOperations';
import PropTypes from 'prop-types';
import React from 'react';
import Table from './table';

const OperationsHistory = ({ agentConfiguration, initialOperations }) => {
  const { Header, Row } = createTableComponents(agentConfiguration);
  const preprocessedOperations = preprocessOperations(
    agentConfiguration,
    initialOperations
  );
  return (
    <Table className="craft-operations-history">
      <Header />
      {preprocessedOperations.map(Row)}
    </Table>
  );
};

OperationsHistory.defaultProps = {
  initialOperations: []
};

OperationsHistory.propTypes = {
  agentConfiguration: PropTypes.object.isRequired,
  initialOperations: PropTypes.array
};

export default OperationsHistory;
