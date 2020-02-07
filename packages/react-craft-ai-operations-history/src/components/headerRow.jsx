import { computeCellWidth } from './table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import { TYPES } from 'craft-ai/lib/constants';

import '../utils/icons';

const PropertyTypeIcons = {
  [TYPES.continuous]: <FontAwesomeIcon icon='tachometer-alt' />,
  [TYPES.enum]: <FontAwesomeIcon icon='tags' />,
  [TYPES.timezone]: <FontAwesomeIcon icon='globe-africa' />,
  [TYPES.time_of_day]: <FontAwesomeIcon icon='clock' />,
  [TYPES.day_of_week]: <FontAwesomeIcon icon='calendar' />,
  [TYPES.day_of_month]: <FontAwesomeIcon icon='calendar' />,
  [TYPES.month_of_year]: <FontAwesomeIcon icon='calendar' />
};

const CustomWidthTh = styled('th')`
  width: ${({ width }) => computeCellWidth(width)}px !important;
`;

const HeaderCell = ({ output, property, type }) => (
  <CustomWidthTh width={ property.length }>
    <span>
      {PropertyTypeIcons[type]} {property}
    </span>
    {output ? <small>output</small> : null}
  </CustomWidthTh>
);
HeaderCell.propTypes = {
  property: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  output: PropTypes.bool.isRequired
};

const HeaderRow = ({ isGenerator, properties }) => (
  <tr>
    <th>
      <span>
        <FontAwesomeIcon icon='stopwatch' /> timestamp
      </span>
    </th>
    {
      isGenerator ? (
        <th>
          <span>
            <FontAwesomeIcon icon='craft-ai-stanley' /> AgentName
          </span>
        </th>
      ) : null
    }
    {properties.map((property, index) => (
      <HeaderCell key={ index } { ...property } />
    ))}
  </tr>
);

HeaderRow.defaultProps = {
  isGenerator: false
};

HeaderRow.propTypes = {
  properties: PropTypes.array.isRequired,
  isGenerator: PropTypes.bool
};

export default HeaderRow;
