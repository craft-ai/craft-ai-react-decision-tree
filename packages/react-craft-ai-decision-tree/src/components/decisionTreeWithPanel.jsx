import ContainerDimensions from 'react-container-dimensions';
import createInterpreter from '../utils/interpreter';
import NodeInformations from './nodeInformation/nodeInformation';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Tree from './tree';
import React, { useEffect, useMemo, useState } from 'react';

const DecisionTreeContainer = styled('div')`
  height: 100%;
`;

const DecisionTreeWithPanel = ({
  scale,
  position,
  data,
  height,
  width,
  selectedNode,
  updatePositionAndZoom,
  edgeType,
  foldedNodes
}) => {
  const [selectedNodeState, setSelectedNode] = useState(selectedNode);

  useEffect(() => setSelectedNode(selectedNode), [selectedNode]);

  const interpreter = useMemo(
    () => createInterpreter(data, Object.keys(data.trees)[0]),
    [data]
  );

  const closeNodeInformation = () => {
    setSelectedNode(undefined);
  };

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
        selectedNodePath={ selectedNodeState || '' }
        closeNodeInformation={ closeNodeInformation }
      />
      <ContainerDimensions>
        {({ height, width }) => (
          <Tree
            interpreter={ interpreter }
            updateSelectedNode={ setSelectedNode }
            height={ height }
            width={ width }
            position={ position }
            scale={ scale }
            updatePositionAndZoom={ updatePositionAndZoom }
            configuration={ data.configuration }
            edgeType={ edgeType }
            selectedNode={ selectedNodeState }
            foldedNodes={ foldedNodes }
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
  auto: false,
  edgeType: 'constant'
};

DecisionTreeWithPanel.propTypes = {
  scale: PropTypes.number,
  position: PropTypes.array,
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  updatePositionAndZoom: PropTypes.func,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  foldedNodes: PropTypes.arrayOf(PropTypes.string)
};

export default DecisionTreeWithPanel;
