import ContainerDimensions from 'react-container-dimensions';
import createInterpreter from '../utils/interpreter';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Tree from './tree';
import React, { useMemo } from 'react';

const DecisionTreeContainer = styled('div')`
  height: 100%;
`;

const DecisionTree = ({
  data,
  edgeType,
  height,
  position,
  scale,
  selectedNode,
  updateSelectedNode,
  updatePositionAndZoom,
  width,
  foldedNodes
}) => {
  const interpreter = useMemo(
    () => createInterpreter(data, Object.keys(data.trees)[0]),
    [data]
  );

  return (
    <DecisionTreeContainer
      style={{
        display: 'flex',
        height: height,
        width: width
      }}
    >
      <ContainerDimensions>
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
      </ContainerDimensions>
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
  height: PropTypes.number,
  width: PropTypes.number,
  updatePositionAndZoom: PropTypes.func,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  foldedNodes: PropTypes.arrayOf(PropTypes.string)
};

export default DecisionTree;
