import orderBy from 'lodash.orderby';
import PropTypes from 'prop-types';
import React from 'react';

export function extractProperties(agentConfiguration) {
  const properties = Object.keys(agentConfiguration.context).map(
    (property) => ({
      property,
      ...agentConfiguration.context[property],
      output: !!agentConfiguration.output.find(
        (outputProperty) => outputProperty === property
      )
    })
  );

  const sortedProperties = orderBy(properties, ['output', 'property']);

  return sortedProperties;
}

const HeaderCell = ({ output, property }) => (
  <th>
    {property}
    {output ? <small>output</small> : void 0}
  </th>
);
HeaderCell.propTypes = {
  property: PropTypes.string.isRequired,
  output: PropTypes.bool.isRequired
};

const HeaderRow = ({ agentConfiguration }) => {
  const properties = extractProperties(agentConfiguration);
  return (
    <tr>
      <th>timestamp</th>
      {properties.map((property, index) => (
        <HeaderCell key={ index } { ...property } />
      ))}
    </tr>
  );
};

HeaderRow.propTypes = {
  agentConfiguration: PropTypes.object.isRequired
};

export default HeaderRow;
