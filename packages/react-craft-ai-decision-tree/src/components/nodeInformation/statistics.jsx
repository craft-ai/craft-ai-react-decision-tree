import _ from 'lodash';
import BoxPlot from './boxplot';
import Histogram from './histogram';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import { H3NodeInformation, TextCenterDiv } from './utils';

const Ul = styled('ul')`
  list-style: none;
  padding-inline-start: 0;
`;

const Statistics = ({
  dtNode,
  interpreter,
  totalMin,
  totalMax,
  outputValues
}) => {
  if (interpreter.version == 2) {
    const {
      value,
      standard_deviation,
      min,
      max,
      size
    } = interpreter.distribution(dtNode);
    return (
      <div className='node-predictions'>
        <H3NodeInformation>Statistics</H3NodeInformation>
        <TextCenterDiv>
          <Ul>
            <li>{size} samples</li>
          </Ul>
          {_.isUndefined(standard_deviation) ? (
            <Histogram
              distribution={ value }
              outputValues={ outputValues }
              size={ size }
            />
          ) : (
            <BoxPlot
              mean={ value }
              std={ standard_deviation }
              min={ min }
              max={ max }
              size={ size }
              totalMin={ totalMin }
              totalMax={ totalMax }
            />
          )}
        </TextCenterDiv>
      </div>
    );
  }
  return <div />;
};

Statistics.propTypes = {
  dtNode: PropTypes.object.isRequired,
  interpreter: PropTypes.object.isRequired,
  totalMin: PropTypes.number,
  totalMax: PropTypes.number,
  outputValues: PropTypes.array
};

export default Statistics;
