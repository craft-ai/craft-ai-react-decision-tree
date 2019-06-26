/* eslint-disable react/jsx-no-bind */
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import { NODE_DEPTH, NODE_WIDTH } from '../utils/constants';

const EdgeLabelDiv = styled('div')`
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  text-align: center;
  font-size: smaller;
  pointer-events: auto;
  width: ${NODE_WIDTH}px;
  top: ${({ y }) => y}px;
  left: ${({ x }) => x}px;
`;

const EdgeLabel = ({
  hLink,
  configuration,
  onShowTooltip = (ref, text) => {},
  onHideTooltip = () => {}
}) => {
  const dtTargetNode = hLink.target.data;
  const edgeLabelRef = React.createRef();

  const propertyType =
    configuration.context[dtTargetNode.decision_rule.property].type;
  const text = interpreter.formatDecisionRules([
    {
      operand: dtTargetNode.decision_rule.operand,
      operator: dtTargetNode.decision_rule.operator,
      type: propertyType
    }
  ]);

  return (
    <EdgeLabelDiv
      ref={ edgeLabelRef }
      onMouseOver={ () => onShowTooltip(edgeLabelRef.current, text) }
      onMouseOut={ onHideTooltip }
      className='craft-links'
      x={ hLink.target.x - NODE_WIDTH / 2 }
      y={ hLink.target.y - (NODE_DEPTH * 2) / 5 }
    >
      {text}
    </EdgeLabelDiv>
  );
};

EdgeLabel.propTypes = {
  hLink: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  onShowTooltip: PropTypes.func,
  onHideTooltip: PropTypes.func
};

export default EdgeLabel;
