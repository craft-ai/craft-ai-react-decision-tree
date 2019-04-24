import _ from 'lodash';
import { computeLeafColor } from '../../utils/utils';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const OutputDiv = styled('div')`
  font-size: 1.3em;
  margin-bottom: 5px;
`;

const Prediction = ({ node, treeVersion, configuration }) => {
  let confidence;
  let std;
  let value;
  if (treeVersion == 1) {
    confidence = node.confidence;
    std = node.standard_deviation;
    value = node.predicted_value;
  }
  else {
    if (!_.isUndefined(node.prediction)) {
      confidence = node.prediction.confidence;
      std = node.prediction.distribution
        ? node.prediction.distribution.standard_deviation
        : undefined;
      value = node.prediction.value;
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
      {value ? (
        <PredictionDiv>
          <OutputDiv>
            <code>{configuration.output[0]}</code> {value}
          </OutputDiv>
          <div>Confidence: {(confidence * 100).toFixed(2)}%</div>
          {std ? <div>Standard deviation: {std.toFixed(2)}</div> : null}
        </PredictionDiv>
      ) : null}
    </div>
  );
};

Prediction.propTypes = {
  node: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  treeVersion: PropTypes.number.isRequired
};

export default Prediction;
