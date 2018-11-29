import _ from 'lodash';
import ContainerDimensions from 'react-container-dimensions';
import NodeInformations from './nodeInformations';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import Tree from './tree';

const DecisionTreeContainer = styled('div')`
  height: 100%;
`;

class DecisionTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: ''
    };

    if (_.isUndefined(this.props.updateSelectedNode)) {
      // use standalone version
      this.updateSelectedNode = (nodeId) => {
        this.setState({ selectedNode: nodeId });
      };
    } else {
      // Use user version
      this.updateSelectedNode = this.props.updateSelectedNode;
    }
  }

  render() {
    const { data, height, width } = this.props;
    return (
      <DecisionTreeContainer
        style={{
          display: 'flex',
          height: height,
          width: width
        }}
      >
        <NodeInformations
          updateSelectedNode={this.updateSelectedNode}
          configuration={data.configuration}
          treeData={data.trees[_.keys(data.trees)[0]]}
          selectedNode={this.state.selectedNode}
        />
        <ContainerDimensions>
          {({ height, width }) => (
            <Tree
              updateSelectedNode={this.updateSelectedNode}
              height={height}
              width={width}
              configuration={data.configuration}
              treeData={data.trees[_.keys(data.trees)[0]]}
            />
          )}
        </ContainerDimensions>
      </DecisionTreeContainer>
    );
  }
}

DecisionTree.defaultProps = {
  auto: false,
  updateSelectedNode: undefined
};

DecisionTree.propTypes = {
  updateSelectedNode: PropTypes.func,
  data: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number
};

export default DecisionTree;
