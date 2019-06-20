/* eslint-disable react/jsx-no-bind */
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import { NODE_DEPTH, NODE_HEIGHT, NODE_WIDTH } from '../utils/constants';

const EdgeLabelDiv = styled('div')`
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  text-align: center;
  font-size: smaller;
  pointer-events: auto;
  width: ${({ width }) => width}px;
  top: ${({ y }) => y}px;
  left: ${({ x }) => x}px;
`;

const EdgeLabel = ({
  hLink,
  configuration,
  onShowTooltip = (ref, text) => {},
  onHideTooltip = () => {}
}) => {
  const dtSourceNode = hLink.source.data;
  const dtTargetNode = hLink.target.data;
  const edgeLabelRef = React.createRef();

  let x;
  let width;
  if (dtSourceNode.children.length > 2) {
    // arity of 2 or more.
    x = hLink.target.x;
    width = NODE_WIDTH;
  }
  else if (hLink.source.x <= hLink.target.x) {
    // source on the left
    x = hLink.source.x;
    width = hLink.target.x - hLink.source.x;
  }
  else {
    // source on the right
    x = hLink.target.x;
    width = hLink.source.x - hLink.target.x;
  }

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
      width={ width }
      x={ x }
      y={ hLink.source.y + (NODE_DEPTH / 2 - NODE_HEIGHT / 3) }
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
