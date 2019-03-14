import ContainerDimensions from 'react-container-dimensions';
import NodeInformations from './nodeInformation/nodeInformation';
import PropTypes from 'prop-types';
import semver from 'semver';
import styled from '@emotion/styled';
import Tree from './tree';
import React, { useState } from 'react';

const DecisionTreeContainer = styled('div')`
  height: 100%;
`;

const DecisionTreeWithPanel = ({
  scale,
  position,
  data,
  height,
  width,
  updatePositionAndZoom
}) => {
  const [selectedNode, setSelectedNode] = useState('');
  const treeVersion = semver.major(data._version);

  return (
    <DecisionTreeContainer
      style={{
        display: 'flex',
        height: height,
        width: width
      }}
    >
      <NodeInformations
        tree={ data }
        selectedNodePath={ selectedNode }
        updateSelectedNode={ setSelectedNode }
      />
      <ContainerDimensions>
        {({ height, width }) => (
          <Tree
            version={ treeVersion }
            updateSelectedNode={ setSelectedNode }
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

DecisionTreeWithPanel.defaultProps = {
  position: [0, 0],
  scale: -1,
  updatePositionAndZoom: null,
  auto: false
};

DecisionTreeWithPanel.propTypes = {
  scale: PropTypes.number,
  position: PropTypes.array,
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  updatePositionAndZoom: PropTypes.func
};

export default DecisionTreeWithPanel;
