/* eslint-disable react/jsx-no-bind */
import _ from 'lodash';
import EdgeLabel from './edgeLabel';
import Node from './node';
import PropTypes from 'prop-types';
import ToolTip from 'react-craft-ai-tooltip';
import React, { useState } from 'react';

const DT_UTILS_V1 = {
  isLeaf: (dtNode) => dtNode.predicted_value != null,
  getPrediction: (dtNode) => ({
    confidence: dtNode.confidence,
    value: dtNode.predicted_value
  })
};

const DT_UTILS_V2 = {
  isLeaf: (dtNode) => dtNode.prediction != null,
  getPrediction: (dtNode) => dtNode.prediction || {}
};

class Nodes extends React.Component {
  state = {
    showingTooltip: false,
    tooltipOnPovover: false,
    tooltipText: '',
    tooltipRef: null,
    tooltipPlacement: 'bottom',
    selectedNodeId: undefined,
    showingNodeButtonId: undefined
  };

  hideTooltip = () => {
    this.setState({
      showingTooltip: false,
      tooltipText: '',
      tooltipRef: null,
      tooltipPlacement: 'bottom'
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    const doUpdate =
      this.props.configuration != nextProps.configuration ||
      _.isEqual(this.props.hierarchy, nextProps.hierarchy) ||
      _.isEqual(this.state.nodes, nextState.nodes) ||
      this.props.height != nextProps.height;
    return doUpdate;
  }

  updateTooltipPlacement = (changeTooltipPlacement) => {
    if (changeTooltipPlacement && this.state.tooltipPlacement != 'top') {
      this.setState({ tooltipPlacement: 'top' });
    }
  };

  render() {
    const dtUtils = this.props.version == 1 ? DT_UTILS_V1 : DT_UTILS_V2;

    const hideTooltip = () =>
      this.setState({
        showingTooltip: false
      });

    const showTooltip = (ref, text) => {
      if (this.props.selectable) {
        this.setState({
          showingTooltip: true,
          tooltipText: text,
          tooltipRef: ref
        });
      }
    };

    return (
      <div style={{ position: 'relative' }}>
        {this.props.hierarchy.descendants()
          .map((hNode, index) => (
            <Node
              key={ index }
              hNode={ hNode }
              selected={ hNode.treePath === this.props.selectedNode }
              onSelectNode={ () => {
                if (this.props.updateSelectedNode) {
                  this.props.updateSelectedNode(hNode.treePath);
                }
              } }
              onToggleSubtreeFold={ () => {
                if (this.props.onClickNode) {
                  this.props.onClickNode(hNode);
                }
              } }
              onShowTooltip={ showTooltip }
              onHideTooltip={ hideTooltip }
              dtUtils={ dtUtils }
            />
          ))}
        {this.props.hierarchy.links()
          .map((hLink, index) => (
            <EdgeLabel
              key={ index }
              hLink={ hLink }
              configuration={ this.props.configuration }
              onShowTooltip={ showTooltip }
              onHideTooltip={ hideTooltip }
            />
          ))}
        <ToolTip
          style={{
            pointerEvents: 'none'
          }} // disable click on tooltip
          show={ this.state.showingTooltip }
          placement={ this.state.tooltipPlacement }
          target={ this.state.tooltipRef }
          onPlacementUpdated={ this.updateTooltipPlacement }
        >
          {this.state.tooltipText}
        </ToolTip>
      </div>
    );
  }
}

Nodes.propTypes = {
  selectable: PropTypes.bool.isRequired,
  updateSelectedNode: PropTypes.func,
  configuration: PropTypes.object.isRequired,
  hierarchy: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired,
  selectedNode: PropTypes.string,
  onClickNode: PropTypes.func.isRequired
};

export default Nodes;
