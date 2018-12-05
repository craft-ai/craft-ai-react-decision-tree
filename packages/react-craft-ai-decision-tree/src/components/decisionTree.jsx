import _ from 'lodash';
import ContainerDimensions from 'react-container-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import Tree from './tree';

const DecisionTreeContainer = styled('div')`
  height: 100%;
`;

const DecisionTree = ({ data, height, width }) => (
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
        />
      )}
    </ContainerDimensions>
  </DecisionTreeContainer>
);

DecisionTree.defaultProps = {
  auto: false
};

DecisionTree.propTypes = {
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number
};

export default DecisionTree;
