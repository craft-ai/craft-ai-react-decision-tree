import PropTypes from 'prop-types';
import React from 'react';

const Statistics = ({ node }) => {
  if (node.nb_samples) {
    return (
      <div className='node-predictions'>
        <h3 style={{ textAlign: 'center' }}>Statistics</h3>
        <ul style={{ listStyle: 'none', paddingInlineStart: 0 }}>
          <li>{node.nb_samples} samples</li>
        </ul>
      </div>
    );
  }
  return <div />;
};

Statistics.propTypes = {
  node: PropTypes.object.isRequired
};

export default Statistics;
