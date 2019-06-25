/* eslint-disable react/jsx-no-bind */
import _ from 'lodash';
import { computeLeafColor } from '../utils/utils';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
  COLOR_NODES,
  NODE_HEIGHT,
  NODE_PADDING,
  NODE_WIDTH,
  SELECTED_BORDER_WIDTH,
  SELECTED_COLOR_EDGES
} from '../utils/constants';
import React, { useState } from 'react';

const BUTTON_RADIUS = 21;
const BUTTON_BORDER = 2;

const NodeWrapper = styled('div')`
  display: inline-block;
  padding: ${NODE_PADDING}px ${NODE_PADDING}px ${NODE_PADDING}px
    ${NODE_PADDING}px;
  position: absolute;
  top: ${({ y }) => y - NODE_HEIGHT / 3 - NODE_PADDING}px;
  left: ${({ x }) => x - NODE_WIDTH / 2 - NODE_PADDING}px;
`;

const NodeLabel = styled('div')`
  position: relative;
  text-align: center;
  line-height: 1.75;
  text-overflow: ellipsis;
  overflow: hidden;
  width: ${NODE_WIDTH}px;
  height: ${NODE_HEIGHT}px;
  font-style: ${({ isFolded }) => (isFolded ? 'italic' : 'initial')};
  pointer-events: auto;
  cursor: pointer;
  box-sizing: content-box;
  border: ${({ selected }) =>
    selected ? `solid ${SELECTED_BORDER_WIDTH}px ${SELECTED_COLOR_EDGES}` : ''};
  top: ${({ selected }) => (selected ? -SELECTED_BORDER_WIDTH : 0)};
  left: ${({ selected }) => (selected ? -SELECTED_BORDER_WIDTH : 0)};
  background-color: ${({ color = COLOR_NODES }) => color};
`;

const NodeButton = styled('button')`
  position: relative;
  left: ${NODE_WIDTH / 2}px;
  height: ${BUTTON_RADIUS}px;
  width: ${BUTTON_RADIUS}px;
  border: ${BUTTON_BORDER}px solid white;
  border-radius: 50%;
  color: black;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 0 3px gray;
  float: left;
  font-size: 12px;
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  font-weight: bold;
  display: inline-block;
  transform: translate(-50%, -50%);
  padding: 0px;
  transition: background-color 0.1s;
  cursor: pointer;
  &:hover {
    background: #ffcc00;
  }
  &:focus {
    outline: none;
  }
  &:active {
    background: ${SELECTED_COLOR_EDGES};
  }
`;

function computeNodePresentationData(hNode, interpreter) {
  const dtNode = hNode.data;
  const isLeaf = interpreter.isLeaf(dtNode);
  const isFolded = hNode.foldedChildren != null;
  if (isLeaf || isFolded) {
    const { value, confidence } = interpreter.getPrediction(dtNode);
    return {
      isLeaf,
      isFolded,
      text: _.isFinite(value) ? parseFloat(value.toFixed(3)) : value,
      color: computeLeafColor(confidence)
    };
  }
  else {
    return {
      isLeaf,
      isFolded,
      text: dtNode.children[0].decision_rule.property,
      color: undefined
    };
  }
}

const Node = ({
  hNode,
  interpreter,
  selected = false,
  onSelectNode = () => {},
  onShowTooltip = (ref, text) => {},
  onHideTooltip = () => {},
  onToggleSubtreeFold = () => {}
}) => {
  const buttonRef = React.createRef();
  const labelRef = React.createRef();

  const { isFolded, isLeaf, color, text = 'N/A' } = computeNodePresentationData(
    hNode,
    interpreter
  );

  const [showNodeButton, setShowNodeButton] = useState(false);

  return (
    <NodeWrapper
      onMouseOver={ () => {
        setShowNodeButton(true);
        onShowTooltip(isLeaf ? labelRef.current : buttonRef.current, text);
      } }
      onMouseOut={ () => {
        setShowNodeButton(false);
        onHideTooltip();
      } }
      x={ hNode.x }
      y={ hNode.y }
    >
      <NodeLabel
        ref={ labelRef }
        onClick={ onSelectNode }
        className='craft-nodes'
        color={ color }
        selected={ selected }
        isFolded={ isFolded }
      >
        {text}
      </NodeLabel>
      <NodeButton
        ref={ buttonRef }
        onClick={ onToggleSubtreeFold }
        visible={ !isLeaf && showNodeButton }
      >
        {isFolded ? '+' : '-'}
      </NodeButton>
    </NodeWrapper>
  );
};

Node.propTypes = {
  hNode: PropTypes.object.isRequired,
  interpreter: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onSelectNode: PropTypes.func,
  onShowTooltip: PropTypes.func,
  onHideTooltip: PropTypes.func,
  onToggleSubtreeFold: PropTypes.func
};

export default Node;
