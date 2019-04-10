import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import {
  H3NodeInformation,
  TableNodeInformation,
  TdNodeInformation,
  TextCenterDiv
} from './utils';

const Split = ({ context, node }) => {
  const displaySplit = (child, key) => {
    try {
      const propertyType = context[child.decision_rule.property].type;
      const text = interpreter.formatDecisionRules([
        {
          operand: child.decision_rule.operand,
          operator: child.decision_rule.operator,
          type: propertyType
        }
      ]);
      if (key !== 0) {
        return (
          <tr key={ key }>
            <TdNodeInformation>
              <code>{child.decision_rule.property}</code>
            </TdNodeInformation>
            <TdNodeInformation>{text}</TdNodeInformation>
          </tr>
        );
      }
      return (
        <tr key={ key }>
          <td><code>{child.decision_rule.property}</code></td>
          <td>{text}</td>
        </tr>
      );
    }
    catch (err) {
      return (
        <tr style={{ color: 'red' }} key={ key }>
          <td>{err.message}</td>
        </tr>
      );
    }
  };

  return (
    <div className='node-split'>
      <H3NodeInformation>Splits</H3NodeInformation>
      {!node.children ? (
        <TextCenterDiv>N/A (leaf node)</TextCenterDiv>
      ) : (
        <TableNodeInformation>
          <tbody>{node.children.map(displaySplit)}</tbody>
        </TableNodeInformation>
      )}
    </div>
  );
};

Split.propTypes = {
  node: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired
};

export default Split;
