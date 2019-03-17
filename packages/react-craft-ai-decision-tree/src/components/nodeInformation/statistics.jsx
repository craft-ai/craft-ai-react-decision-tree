import _ from 'lodash';
import BoxPlot from './boxplot';
import { H3NodeInformation } from './utils';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Ul = styled('ul')`
  list-style: none;
  padding-inline-start: 0;
`;

const Statistics = ({ node, totalMin, totalMax }) => {
  if (node.prediction) {
    const plot = () => {
      if (_.isArray(node.prediction.distribution)) {
        return null;
      }
      else {
        const { value, standard_deviation, min, max, size } = interpreter.distribution(node);
        return <BoxPlot
          mean={ value }
          std={ standard_deviation }
          min={ min }
          max={ max }
          size={ size }
          totalMin={ totalMin }
          totalMax={ totalMax }
        ></BoxPlot>;
      }
    };
    return (
      <div className='node-predictions'>
        <H3NodeInformation>Statistics</H3NodeInformation>
        <Ul>
          <li>{node.prediction.nb_samples} samples</li>
          {_.isArray(node.prediction.distribution) ? (
            <li>dsitrbution: {node.prediction.distribution}</li>
          ) : (
            <div>
              <li>mean {node.prediction.value}</li>
              <li>std {node.prediction.distribution.standard_deviation}</li>
              <li>min {node.prediction.distribution.min}</li>
              <li>max {node.prediction.distribution.max}</li>
            </div>
          )}
        </Ul>
        {plot()}
      </div>
    );
  }
  return <div />;
};

Statistics.propTypes = {
  node: PropTypes.object.isRequired,
  totalMin: PropTypes.number,
  totalMax: PropTypes.number
};

export default Statistics;
