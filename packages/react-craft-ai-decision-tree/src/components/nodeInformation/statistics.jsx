import { H3NodeInformation } from './utils';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Ul = styled('ul')`
  list-style: none;
  padding-inline-start: 0;
`;

const Statistics = ({ node }) => {
  if (node.nb_samples) {
    return (
      <div className='node-predictions'>
        <H3NodeInformation>Statistics</H3NodeInformation>
        <Ul>
          <li>{node.nb_samples} samples</li>
        </Ul>
      </div>
    );
  }
  return <div />;
};

Statistics.propTypes = {
  node: PropTypes.object.isRequired
};

export default Statistics;
