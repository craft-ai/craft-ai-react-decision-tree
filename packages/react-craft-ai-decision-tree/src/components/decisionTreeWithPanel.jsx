import createInterpreter from '../utils/interpreter';
import DecisionTreeContainer from './decisionTreeContainer';
import NodeInformations from './nodeInformation/nodeInformation';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import Tree from './tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const NodeInformationsOverlay = styled('div')`
  position: absolute;
  height: ${({ height }) => height}px;
  z-index: 10;
`;

const DecisionTreeWithPanel = ({
  scale,
  position,
  data,
  selectedNode,
  updatePositionAndZoom,
  edgeType,
  foldedNodes,
  style
}) => {
  const [selectedNodeState, setSelectedNode] = useState(selectedNode);

  useEffect(() => setSelectedNode(selectedNode), [selectedNode]);

  const interpreter = useMemo(
    () => {
      setSelectedNode(undefined);
      return createInterpreter(data, Object.keys(data.trees)[0]);
    },
    [data]
  );

  const closeNodeInformation = useCallback(() => {
    setSelectedNode(undefined);
  }, []);

  return (
    <DecisionTreeContainer style={ style }>
      {({ height, width }) => (
        <React.Fragment>
          <NodeInformationsOverlay height={ height }>
            <NodeInformations
              tree={ data }
              selectedNodePath={ selectedNodeState || '' }
              closeNodeInformation={ closeNodeInformation }
              width={ 400 }
            />
          </NodeInformationsOverlay>
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
        </React.Fragment>
      )}
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
  updatePositionAndZoom: PropTypes.func,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  foldedNodes: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
};

export default DecisionTreeWithPanel;
