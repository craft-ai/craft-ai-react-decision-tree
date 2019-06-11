import _ from 'lodash';
import { computeLeafColor } from '../../utils/utils';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const OutputDiv = styled('div')`
  font-size: 1.3em;
  margin-bottom: 5px;
`;

const Prediction = ({ node, treeVersion, configuration, outputValues }) => {
  let confidence;
  let std;
  let outputValue;
  if (treeVersion == 1) {
    confidence = node.confidence;
    std = node.standard_deviation;
    outputValue = node.predicted_value;
  }
  else {
    if (!_.isUndefined(node.prediction)) {
      confidence = node.prediction.confidence;
      std = node.prediction.distribution
        ? node.prediction.distribution.standard_deviation
        : undefined;
      outputValue = node.prediction.value;
    }
    else {
      const { value, standard_deviation } = interpreter.distribution(node);
      if (!standard_deviation) {
        const argmax = value.map((x, i) => [x, i])
          .reduce((r, a) => (a[0] > r[0] ? a : r))[1];
        outputValue = outputValues[argmax];
      }
      else {
        std = standard_deviation;
        outputValue = value;
      }
    }
  }

  const PredictionDiv = styled('div')`
    background-color: ${computeLeafColor(confidence)};
    padding: 10px;
    text-align: center;
    margin-top: 10;
  `;

  return (
    <div className='node-predictions'>
      {
        outputValue ? (
          <PredictionDiv>
            <OutputDiv>
              <code>{configuration.output[0]}</code> {outputValue}
            </OutputDiv>
            {
              confidence ? (
                <div>Confidence {(confidence * 100).toFixed(2)}%</div>
              ) : null
            }
            {
              std ? (
                <div>Standard deviation {std.toFixed(2)}</div>
              ) : null
            }
          </PredictionDiv>
        ) : null
      }
    </div>
  );
};

Prediction.propTypes = {
  node: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  treeVersion: PropTypes.number.isRequired,
  outputValues: PropTypes.array
};

export default Prediction;
