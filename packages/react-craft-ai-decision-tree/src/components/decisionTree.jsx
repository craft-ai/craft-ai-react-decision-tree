import _ from 'lodash';
import ContainerDimensions from 'react-container-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import Tree from './tree';

const DecisionTreeContainer = styled('div')`
  height: 100%;
`;

const DecisionTree = ({ data, height, width, scale, position, updatePositionAndZoom }) => (
  <DecisionTreeContainer
    style={{
      height: height,
      width: width
    }}
  >
    <ContainerDimensions>
      {({ height, width }) => (
        <Tree
          height={ height }
          width={ width }
          configuration={ data.configuration }
          treeData={ data.trees[_.keys(data.trees)[0]] }
          position={ position }
          scale={ scale }
          updatePositionAndZoom={ updatePositionAndZoom }
        />
      )}
    </ContainerDimensions>
  </DecisionTreeContainer>
);

DecisionTree.defaultProps = {
  position: [0, 0],
  scale: -1,
  updatePositionAndZoom: null
};

DecisionTree.propTypes = {
  scale: PropTypes.number,
  position: PropTypes.array,
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  updatePositionAndZoom: PropTypes.func
};

export default DecisionTree;
