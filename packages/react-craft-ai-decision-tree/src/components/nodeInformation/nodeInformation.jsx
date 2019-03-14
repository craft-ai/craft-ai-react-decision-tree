import DecisionRules from './decisionRules';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { findSelectedNode } from '../../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Prediction from './prediction';
import PropTypes from 'prop-types';
import React from 'react';
import semver from 'semver';
import Split from './split';
import Statistics from './statistics';
import styled from 'react-emotion';

const NodeInformationContainer = styled('div')`
  width: 200px;
  display: flex;
  flex-direction: column;
  float: left;
  z-index: 586;
  padding: 10px;
  position: relative;
  background-color: white;
  border-right: solid 1px;
`;

const InformationContainer = styled('div')`
  flex: 1 1 auto;
`;

const CloseButton = styled('button')`
  cursor: pointer;
  border: none;
  outline: none;
`;

const CloseButtonDiv = styled('div')`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
`;

const NodeInformation = ({ updateSelectedNode, tree, selectedNodePath }) => {
  if (selectedNodePath) {
    const treeVersion = semver.major(tree._version);
    const treeData = tree.trees[Object.keys(tree.trees)[0]];
    const selectedNode = findSelectedNode(selectedNodePath, treeData);

    const closeNodeInformation = () => {
      updateSelectedNode(undefined);
    };

    return (
      <NodeInformationContainer className='node-informations'>
        <InformationContainer>
          <CloseButtonDiv>
            <CloseButton onClick={ closeNodeInformation }>
              <FontAwesomeIcon icon={ faTimes } />
            </CloseButton>
          </CloseButtonDiv>
          <Prediction
            configuration={ tree.configuration }
            node={ selectedNode }
            treeVersion={ treeVersion }
          />
          <DecisionRules
            context={ tree.configuration.context }
            node={ selectedNode }
          />
          <Split context={ tree.configuration.context } node={ selectedNode } />
          <Statistics node={ selectedNode } />
        </InformationContainer>
      </NodeInformationContainer>
    );
  }
  else {
    return <div className='node-informations' />;
  }
};

NodeInformation.propTypes = {
  updateSelectedNode: PropTypes.func.isRequired,
  tree: PropTypes.object.isRequired,
  selectedNodePath: PropTypes.string.isRequired
};

export default NodeInformation;
