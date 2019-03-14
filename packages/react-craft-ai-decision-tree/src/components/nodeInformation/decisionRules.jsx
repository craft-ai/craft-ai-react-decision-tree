import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import { H3NodeInformation, TdNodeInformation } from './utils';

const DecisionRules = ({ context, node }) => {
  const displayConditions = (key, index) => {
    const decisionRule = interpreter.reduceDecisionRules(
      node.decisionRules[key]
    );
    // Add the type to format properly the decision rule
    decisionRule[0].type = context[key].type;
    const text = interpreter
      .formatDecisionRules(decisionRule)
      .replace(/ /g, '\u00a0');
    if (index !== 0) {
      return (
        <tr key={ key }>
          <TdNodeInformation>
            <code>{key}</code>
          </TdNodeInformation>
          <TdNodeInformation>{text}</TdNodeInformation>
        </tr>
      );
    }
    return (
      <tr key={ key }>
        <td>
          <code>{key}</code>
        </td>
        <td>{text}</td>
      </tr>
    );
  };

  const decisionRulesKeys = node ? Object.keys(node.decisionRules) : [];
  return (
    <div className='node-decision-rules'>
      <H3NodeInformation>Decision rules</H3NodeInformation>
      {!decisionRulesKeys.length ? (
        <div>N/A (root node)</div>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>{decisionRulesKeys.map(displayConditions)}</tbody>
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
