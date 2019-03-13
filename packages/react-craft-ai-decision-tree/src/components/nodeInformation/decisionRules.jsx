import _ from 'lodash';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';

const DecisionRules = ({ context, node }) => {
  const displayConditions = (key, index) => {
    console.log('node', node);
    const decisionRule = interpreter.reduceDecisionRules(
      node.decisionRules[key]
    );
    // Add the type to format properly the decision rule
    decisionRule[0].type = context[key].type;
    const text = interpreter
      .formatDecisionRules(decisionRule)
      .replace(/ /g, '\u00a0');
    return (
      <tr key={ key }>
        <td
          style={{
            borderTop: index !== 0 ? 'solid 1px black' : 'none'
          }}
        >
          <code>{key}</code>
        </td>
        <td style={{ borderTop: index !== 0 ? 'solid 1px black' : 'none' }}>
          {text}
        </td>
      </tr>
    );
  };

  const decisionRulesKeys = node ? _.keys(node.decisionRules) : [];
  return (
    <div className='node-decision-rules'>
      <h3 style={{ textAlign: 'center' }}>Decision rules</h3>
      {!decisionRulesKeys.length ? (
        <div>N/A (root node)</div>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>{_.map(decisionRulesKeys, displayConditions)}</tbody>
        </table>
      )}
    </div>
  );
};

DecisionRules.propTypes = {
  context: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired
};

export default DecisionRules;
