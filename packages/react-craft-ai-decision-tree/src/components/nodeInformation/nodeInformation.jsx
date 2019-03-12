import DecisionRules from './decisionRules';
import { findSelectedNode } from '../../utils/utils';
import Prediction from './prediction';
import PropTypes from 'prop-types';
import React from 'react';
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

class NodeInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showNodeInformations: false
    };
  }

  closeNodeInformation = () => {
    this.props.updateSelectedNode();
  };

  render() {
    if (this.props.selectedNode) {
      const selectedNode = findSelectedNode(
        this.props.selectedNode,
        this.props.treeData
      );
      return (
        <NodeInformationContainer className='node-informations'>
          <div
            style={{
              flexDirection: 'column',
              flex: '1 1 auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                style={{ cursor: 'pointer' }}
                onClick={ this.closeNodeInformation }
              >
                X
              </button>
            </div>
            <Prediction
              configuration={ this.props.configuration }
              node={ selectedNode }
              treeVersion={ this.props.treeVersion }
            />
            <DecisionRules
              context={ this.props.configuration.context }
              node={ selectedNode }
            />
            <Split
              context={ this.props.configuration.context }
              node={ selectedNode }
            />
            <Statistics node={ selectedNode } />
          </div>
        </NodeInformationContainer>
      );
    }
    else {
      return <div className='node-informations' />;
    }
  }
}

NodeInformation.propTypes = {
  updateSelectedNode: PropTypes.func.isRequired,
  configuration: PropTypes.object.isRequired,
  treeVersion: PropTypes.string.isRequired,
  treeData: PropTypes.object.isRequired,
  selectedNode: PropTypes.string.isRequired
};

export default NodeInformation;
