import _ from 'lodash';
import BoxPlot from './boxplot';
import { H3NodeInformation } from './utils';
import Histogram from './histogram';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Ul = styled('ul')`
  list-style: none;
  padding-inline-start: 0;
`;

const Statistics = ({ node, totalMin, totalMax, treeVersion, outputValues }) => {
  if (treeVersion == 2) {
    const plot = () => {
      const { value, standard_deviation, min, max, size } = interpreter.distribution(node);
      interpreter.distribution(node);
      if (_.isUndefined(standard_deviation)) {
        return <Histogram
          distribution={ value }
          outputValues={ outputValues }
        ></Histogram>;
      }
      else {
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
          {!_.isUndefined(node.prediction) ? <li>{node.prediction.nb_samples} samples</li> : null}
        </Ul>
        {plot()}
      </div>
    );
  }
  return <div />;
};

Statistics.propTypes = {
  node: PropTypes.object.isRequired,
  totalMin: PropTypes.number.isRequired,
  totalMax: PropTypes.number.isRequired,
  treeVersion: PropTypes.number.isRequired,
  outputValues: PropTypes.array
};

export default Statistics;
