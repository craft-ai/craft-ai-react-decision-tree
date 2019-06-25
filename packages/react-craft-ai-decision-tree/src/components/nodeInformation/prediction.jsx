import { computeLeafColor } from '../../utils/utils';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const OutputDiv = styled('div')`
  font-size: 1.3em;
  margin-bottom: 5px;
`;

const Prediction = ({ dtNode, interpreter }) => {
  const { confidence, value, distribution } = interpreter.getPrediction(dtNode);
  const std = distribution.standard_deviation;

  const PredictionDiv = styled('div')`
    background-color: ${computeLeafColor(confidence)};
    padding: 10px;
    text-align: center;
    margin-top: 10;
  `;

  return (
    <div className='node-predictions'>
      {value != null ? (
        <PredictionDiv>
          <OutputDiv>
            <code>{interpreter.outputProperty}</code> {value}
          </OutputDiv>
          {confidence ? (
            <div>Confidence {(confidence * 100).toFixed(2)}%</div>
          ) : null}
          {std ? <div>Standard deviation {std.toFixed(2)}</div> : null}
        </PredictionDiv>
      ) : null}
    </div>
  );
};

Prediction.propTypes = {
  dtNode: PropTypes.object.isRequired,
  interpreter: PropTypes.object.isRequired
};

export default Prediction;
