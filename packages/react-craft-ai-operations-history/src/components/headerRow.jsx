import orderBy from 'lodash.orderby';
import PropTypes from 'prop-types';
import React from 'react';
import {
  faCalendar,
  faClock,
  faGlobeAfrica,
  faStopwatch,
  faTachometerAlt,
  faTags
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TYPES } from 'craft-ai/lib/constants';

const PropertyTypeIcons = {
  [TYPES.continuous]: <FontAwesomeIcon icon={ faTachometerAlt } />,
  [TYPES.enum]: <FontAwesomeIcon icon={ faTags } />,
  [TYPES.timezone]: <FontAwesomeIcon icon={ faGlobeAfrica } />,
  [TYPES.time_of_day]: <FontAwesomeIcon icon={ faClock } />,
  [TYPES.day_of_week]: <FontAwesomeIcon icon={ faCalendar } />,
  [TYPES.day_of_month]: <FontAwesomeIcon icon={ faCalendar } />,
  [TYPES.month_of_year]: <FontAwesomeIcon icon={ faCalendar } />
};

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

const HeaderCell = ({ output, property, type }) => (
  <th>
    <span>
      {PropertyTypeIcons[type]} {property}
    </span>
    {output ? <small>output</small> : null}
  </th>
);
HeaderCell.propTypes = {
  property: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  output: PropTypes.bool.isRequired
};

const HeaderRow = ({ agentConfiguration }) => {
  const properties = extractProperties(agentConfiguration);
  return (
    <tr>
      <th>
        <span>
          <FontAwesomeIcon icon={ faStopwatch } /> timestamp
        </span>
      </th>
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
