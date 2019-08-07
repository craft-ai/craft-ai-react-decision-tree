import createInterpreter from '../../utils/interpreter';
import DecisionRules from './decisionRules';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Prediction from './prediction';
import PropTypes from 'prop-types';
import Split from './split';
import Statistics from './statistics';
import styled from 'react-emotion';
import React, { useMemo } from 'react';

const NodeInformationContainer = styled('div')`
  height: 100%;
  ${({ width }) => (width ? `width: ${width}` : '')}
  display: flex;
  flex-direction: column;
  float: left;
  z-index: 586;
  padding: 10px;
  position: relative;
  background-color: white;
  border-right: solid 1px;
  overflow-y: auto;
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

const NodeInformation = ({
  closeNodeInformation,
  minifyTree,
  selectedNodePath,
  style,
  tree,
  width
}) => {
  const interpreter = useMemo(
    () => createInterpreter(tree, Object.keys(tree.trees)[0]),
    [tree]
  );

  if (selectedNodePath) {
    const { dtNode, decisionRules } = interpreter.findNode(selectedNodePath);
    const { distribution } = interpreter.getPrediction(interpreter.dt);

    const { min, max } = distribution || { min: undefined, max: undefined };

    const minifyLeaf = minifyTree ? () => minifyTree(selectedNodePath) : null;

    return (
      <NodeInformationContainer className='node-informations' style={ style }>
        <InformationContainer>
          {closeNodeInformation ? (
            <CloseButtonDiv>
              <CloseButton onClick={ closeNodeInformation }>
                <FontAwesomeIcon icon={ faTimes } />
              </CloseButton>
            </CloseButtonDiv>
          ) : null}
          <Prediction dtNode={ dtNode } interpreter={ interpreter } />
          <DecisionRules
            context={ tree.configuration.context }
            decisionRules={ decisionRules }
          />
          <Split context={ tree.configuration.context } dtNode={ dtNode } />
          <Statistics
            dtNode={ dtNode }
            totalMin={ min }
            totalMax={ max }
            interpreter={ interpreter }
            outputValues={ interpreter.dt.output_values }
          />
          <span>
            {
              !dtNode.children && minifyTree ? (
                <button onClick={ minifyLeaf }>
                  Minify Tree
                </button>
              ) : null
            }
          </span>
        </InformationContainer>
      </NodeInformationContainer>
    );
  }
  else {
    return <div className='node-informations' />;
  }
};

NodeInformation.defaultProps = {
  style: {}
};

NodeInformation.propTypes = {
  closeNodeInformation: PropTypes.func,
  minifyTree: PropTypes.func,
  tree: PropTypes.object.isRequired,
  selectedNodePath: PropTypes.string.isRequired,
  width: PropTypes.number,
  style: PropTypes.object
};

export default NodeInformation;
