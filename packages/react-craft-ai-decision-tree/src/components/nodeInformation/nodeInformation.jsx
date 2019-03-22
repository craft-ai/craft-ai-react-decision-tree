import DecisionRules from './decisionRules';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { findSelectedNode } from '../../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { interpreter } from 'craft-ai';
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

const NodeInformation = ({ closeNodeInformation, selectedNodePath, tree }) => {
  if (selectedNodePath) {
    const treeVersion = semver.major(tree._version);
    const treeData = tree.trees[Object.keys(tree.trees)[0]];
    const selectedNode = findSelectedNode(selectedNodePath, treeData);
    let min = undefined;
    let max = undefined;
    if (treeVersion == 2) {
      const res = interpreter.distribution(treeData);
      min = res.min;
      max = res.max;
    }

    return (
      <NodeInformationContainer className='node-informations'>
        <InformationContainer>
          {closeNodeInformation ? (
            <CloseButtonDiv>
              <CloseButton onClick={ closeNodeInformation }>
                <FontAwesomeIcon icon={ faTimes } />
              </CloseButton>
            </CloseButtonDiv>
          ) : null}
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
          <Statistics
            node={ selectedNode }
            totalMin={ min }
            totalMax={ max }
            treeVersion={ treeVersion }
            outputValues={ treeData.output_values }
          />
        </InformationContainer>
      </NodeInformationContainer>
    );
  }
  else {
    return <div className='node-informations' />;
  }
};

NodeInformation.propTypes = {
  closeNodeInformation: PropTypes.func,
  tree: PropTypes.object.isRequired,
  selectedNodePath: PropTypes.string.isRequired
};

export default NodeInformation;
