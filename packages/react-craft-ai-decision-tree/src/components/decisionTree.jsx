import ContainerDimensions from 'react-container-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import semver from 'semver';
import styled from '@emotion/styled';
import Tree from './tree';

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
  collapsedDepth
}) => {
  const treeVersion = semver.major(data._version);

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
            version={ treeVersion }
            updateSelectedNode={ updateSelectedNode }
            height={ height }
            width={ width }
            position={ position }
            scale={ scale }
            updatePositionAndZoom={ updatePositionAndZoom }
            configuration={ data.configuration }
            dt={ data.trees[Object.keys(data.trees)[0]] }
            edgeType={ edgeType }
            selectedNode={ selectedNode }
            collapsedDepth={ collapsedDepth }
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
  collapsedDepth: PropTypes.number
};

export default DecisionTree;
