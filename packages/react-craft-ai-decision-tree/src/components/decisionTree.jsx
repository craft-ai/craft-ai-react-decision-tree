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
  scale,
  position,
  data,
  height,
  width,
  updateSelectedNode,
  updatePositionAndZoom
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
            treeData={ data.trees[Object.keys(data.trees)[0]] }
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
  updateSelectedNode: undefined
};

DecisionTree.propTypes = {
  scale: PropTypes.number,
  position: PropTypes.array,
  updateSelectedNode: PropTypes.func,
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  updatePositionAndZoom: PropTypes.func
};

export default DecisionTree;
