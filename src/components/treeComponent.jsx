import _ from 'lodash';
import Dimensions from 'react-dimensions';
import PropTypes from 'prop-types';
import React from 'react';
import Tree from './tree';

class TreeComponent extends React.Component {
  render() {
    return (
      <Tree
        height={ this.props.containerHeight }
        width={ this.props.containerWidth }
        configuration={ this.props.data.configuration }
        treeData={ this.props.data.trees[_.keys(this.props.data.trees)[0]] } />
    );
  }
}

TreeComponent.propTypes = {
  data: PropTypes.object.isRequired,
  containerWidth: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired
};

export default Dimensions()(TreeComponent);
