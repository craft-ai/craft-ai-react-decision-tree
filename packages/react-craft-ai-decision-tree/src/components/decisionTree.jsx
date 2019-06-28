import ContainerDimensions from 'react-container-dimensions';
import createInterpreter from '../utils/interpreter';
import DecisionTreeContainer from './decisionTreeContainer';
import PropTypes from 'prop-types';
import Tree from './tree';
import React, { useMemo } from 'react';

const DecisionTree = ({
  data,
  edgeType,
  position,
  scale,
  selectedNode,
  updateSelectedNode,
  updatePositionAndZoom,
  foldedNodes,
  style
}) => {
  const interpreter = useMemo(
    () => createInterpreter(data, Object.keys(data.trees)[0]),
    [data]
  );

  return (
    <DecisionTreeContainer style={ style }>
      {({ height, width }) => (
        <Tree
          interpreter={ interpreter }
          updateSelectedNode={ updateSelectedNode }
          height={ height }
          width={ width }
          position={ position }
          scale={ scale }
          updatePositionAndZoom={ updatePositionAndZoom }
          configuration={ data.configuration }
          dt={ interpreter.dt }
          edgeType={ edgeType }
          selectedNode={ selectedNode }
          foldedNodes={ foldedNodes }
        />
      )}
    </DecisionTreeContainer>
  );
};

DecisionTree.defaultProps = {
  position: [0, 0],
  scale: -1,
  updatePositionAndZoom: null,
  auto: false,
  updateSelectedNode: undefined,
  edgeType: 'constant',
  selectedNode: ''
};

DecisionTree.propTypes = {
  scale: PropTypes.number,
  position: PropTypes.array,
  updateSelectedNode: PropTypes.func,
  data: PropTypes.object.isRequired,
  updatePositionAndZoom: PropTypes.func,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  foldedNodes: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
};

export default DecisionTree;
