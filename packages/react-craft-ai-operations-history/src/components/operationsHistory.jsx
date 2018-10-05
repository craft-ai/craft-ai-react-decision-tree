import PropTypes from 'prop-types';
import React from 'react';

const OperationsHistory = ({ agentConfiguration, fromTimestamp, onLoadOperations, toTimestamp }) => (
  <div>
    <div>{ JSON.stringify(agentConfiguration, null, 2) }</div>
    <div>{ fromTimestamp } to { toTimestamp }</div>
  </div>
);

OperationsHistory.defaultProps = {
};

OperationsHistory.propTypes = {
  agentConfiguration: PropTypes.object.isRequired,
  fromTimestamp: PropTypes.number.isRequired,
  onLoadOperations: PropTypes.func.isRequired,
  toTimestamp: PropTypes.number.isRequired,
};

export default OperationsHistory;
