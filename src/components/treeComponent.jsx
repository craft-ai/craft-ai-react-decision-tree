import _ from 'lodash';
import ContainerDimensions from 'react-container-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import Tree from './tree';

class TreeComponent extends React.Component {
  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <ContainerDimensions>
          {
            ({ height, width }) => (
              <Tree
                height={ height || 400 }
                width={ width }
                configuration={ this.props.data.configuration }
                treeData={ this.props.data.trees[_.keys(this.props.data.trees)[0]] } />
            )
          }
        </ContainerDimensions>
      </div>
    );
  }
}

TreeComponent.propTypes = {
  data: PropTypes.object.isRequired
};

export default TreeComponent;
