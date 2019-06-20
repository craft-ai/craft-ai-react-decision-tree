/* eslint-disable react/jsx-no-bind */
import _ from 'lodash';
import { interpreter } from 'craft-ai';
import Node from './node';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import ToolTip from 'react-craft-ai-tooltip';
import { NODE_DEPTH, NODE_HEIGHT } from '../utils/constants';
import React, { useState } from 'react';

const Links = styled('div')`
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  text-align: center;
  font-size: smaller;
  pointer-events: auto;
`;

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
  linkRef = {};

  nodeRef = {};

  buttonRef = {};

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

  indexLinkRef = (index) => (input) => {
    this.linkRef[index] = input;
  };

  showLinkTooltip = (index, text) => (input) => {
    if (this.props.selectable) {
      this.setState({
        showingTooltip: true,
        tooltipText: text,
        tooltipRef: this.linkRef[index]
      });
    }
  };

  displayLinksText = (link, index) => {
    let x;
    let width = 100;
    if (link.source.x <= link.target.x) {
      if (link.source.children.length <= 2) {
        width = link.target.x - link.source.x;
        x = link.source.x;
      }
      else {
        x = link.target.x;
      }
    }
    else {
      if (link.source.children.length <= 2) {
        x = link.target.x;
        width = link.source.x - link.target.x;
      }
      else {
        x = link.target.x;
      }
    }
    const propertyType = this.props.configuration.context[
      link.target.data.decision_rule.property
    ].type;
    const text = interpreter.formatDecisionRules([
      {
        operand: link.target.data.decision_rule.operand,
        operator: link.target.data.decision_rule.operator,
        type: propertyType
      }
    ]);

    const showTooltip = () => {
      this.setState({
        showingTooltip: true,
        tooltipText: text,
        tooltipRef: this.linkRef[index]
      });
    };

    const indexRef = (input) => {
      this.linkRef[index] = input;
    };

    return (
      <Links
        key={ index }
        ref={ indexRef }
        onMouseOver={ showTooltip }
        onMouseOut={ this.hideTooltip }
        className='craft-links'
        style={{
          top: link.source.y + (NODE_DEPTH / 2 - NODE_HEIGHT / 3),
          left: x,
          width: width
        }}
      >
        {text}
      </Links>
    );
  };

  updateTooltipPlacement = (changeTooltipPlacement) => {
    if (changeTooltipPlacement && this.state.tooltipPlacement != 'top') {
      this.setState({ tooltipPlacement: 'top' });
    }
  };

  render() {
    const dtUtils = this.props.version == 1 ? DT_UTILS_V1 : DT_UTILS_V2;

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
              onShowTooltip={ (ref, text) =>
                this.setState({
                  showingTooltip: true,
                  tooltipText: text,
                  tooltipRef: ref
                })
              }
              onHideTooltip={ () =>
                this.setState({
                  showingTooltip: false
                })
              }
              dtUtils={ dtUtils }
            />
          ))}
        {this.props.hierarchy.links()
          .map(this.displayLinksText)}
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
