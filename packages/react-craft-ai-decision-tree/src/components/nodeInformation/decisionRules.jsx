import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import {
  H3NodeInformation,
  TableNodeInformation,
  TdNodeInformation,
  TextCenterDiv
} from './utils';

const DecisionRules = ({ context, decisionRules }) => {
  const displayConditions = (key, index) => {
    const decisionRule = interpreter.reduceDecisionRules(decisionRules[key]);
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

  const decisionRulesKeys = decisionRules ? Object.keys(decisionRules) : [];

  return (
    <div className='node-decision-rules'>
      <H3NodeInformation>Decision rules</H3NodeInformation>
      {!decisionRulesKeys.length ? (
        <TextCenterDiv>N/A (root node)</TextCenterDiv>
      ) : (
        <TableNodeInformation>
          <tbody>{decisionRulesKeys.map(displayConditions)}</tbody>
        </TableNodeInformation>
      )}
    </div>
  );
};

DecisionRules.propTypes = {
  decisionRules: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired
};

export default DecisionRules;
