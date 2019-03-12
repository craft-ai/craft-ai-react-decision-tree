import { computeLeafColor } from '../../utils/utils';
import PropTypes from 'prop-types';
import React from 'react';

const Prediction = ({ node, treeVersion, configuration }) => {
  let confidence;
  let std;
  let value;
  if (treeVersion == '1') {
    confidence = node.confidence;
    std = node.standard_deviation;
    value = node.predicted_value;
  }
  else {
    if (node.prediction) {
      confidence = node.prediction.confidence;
      std = node.prediction.distribution
        ? node.prediction.distribution.standard_deviation
        : undefined;
      value = node.prediction.value;
    }
  }

  return (
    <div className='node-predictions'>
      {value ? (
        <div
          style={{
            backgroundColor: computeLeafColor(confidence),
            padding: '10px',
            textAlign: 'center',
            marginTop: 10
          }}
        >
          <div style={{ fontSize: '1.3em', marginBottom: 5 }}>
            <code>{configuration.output[0]}</code> {value}
          </div>
          <div>Confidence {(confidence * 100).toFixed(2)}%</div>
          {std ? <div>Standard deviation {std.toFixed(2)}</div> : null}
        </div>
      ) : null}
    </div>
  );
};

Prediction.propTypes = {
  node: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  treeVersion: PropTypes.string.isRequired
};

export default Prediction;
