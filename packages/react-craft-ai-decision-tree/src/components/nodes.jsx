import _ from 'lodash';
import { computeLeafColor } from '../utils/utils';
import { interpreter } from 'craft-ai';
import Node from './node';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import ToolTip from 'react-craft-ai-tooltip';
import {
  NODE_DEPTH,
  NODE_HEIGHT,
  NODE_WIDTH,
  SELECTED_BORDER_WIDTH,
  SELECTED_COLOR_EDGES
} from '../utils/constants';

const Links = styled('div')`
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  text-align: center;
  font-size: smaller;
  pointer-events: auto;
`;

class Nodes extends React.Component {
  linkRef = {};

  nodeRef = {};

  state = {
    showingTooltip: false,
    tooltipOnPovover: false,
    tooltipText: '',
    tooltipRef: null,
    tooltipPlacement: 'bottom',
    selectedNodeId: undefined
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
      _.isEqual(this.props.nodes, nextProps.nodes) ||
      _.isEqual(this.props.links, nextProps.links) ||
      this.props.height != nextProps.height;

    return doUpdate;
  }

  showNodeTooltip = (index, text) => (input) => {
    if (this.props.selectable) {
      this.setState({
        showingTooltip: true,
        tooltipText: text,
        tooltipRef: this.nodeRef[index]
      });
    }
  };

  indexNodeRef = (index) => (input) => {
    this.nodeRef[index] = input;
  };

  displayNode = (node, index) => {
    const setSelectedNode = () => {
      if (this.props.updateSelectedNode) {
        this.props.updateSelectedNode(node.treePath);
        this.props.highlightSelectedEdgePath(node.treeNodeIdPath);
        this.setState({ selectedNodeId: node.id });
      }
    };

    const indexRef = (input) => {
      this.nodeRef[index] = input;
    };

    let text;
    let color;

    if (this.props.version == 1) {
      if (_.isUndefined(node.children)) {
        // leaf
        color = computeLeafColor(node.data.confidence);
        text = _.isNull(node.data.predicted_value)
          ? ''
          : _.isFinite(node.data.predicted_value)
            ? parseFloat(node.data.predicted_value.toFixed(3))
              .toString()
            : node.data.predicted_value;
      }
      else {
        // node
        text = node.children[0].data.decision_rule.property;
      }
    }
    else {
      if (!_.isUndefined(node.data.prediction)) {
        // leaf
        color = computeLeafColor(node.data.prediction.confidence);
        text = _.isNull(node.data.prediction.value)
          ? ''
          : _.isFinite(node.data.prediction.value)
            ? parseFloat(node.data.prediction.value.toFixed(3))
              .toString()
            : node.data.prediction.value;
      }
      else {
        // node
        text = node.data.children[0].decision_rule.property;
      }
    }

    const showTooltip = () => {
      this.setState({
        showingTooltip: true,
        tooltipText: text,
        tooltipRef: this.nodeRef[index]
      });
    };

    return (
      <Node
        key={ index }
        ref={ indexRef }
        onMouseOver={ showTooltip }
        onMouseOut={ this.hideTooltip }
        onClick={ setSelectedNode }
        className='craft-nodes '
        style={{
          border:
            this.state.selectedNodeId === node.id
              ? `solid ${SELECTED_BORDER_WIDTH}px ${SELECTED_COLOR_EDGES}`
              : '',
          top:
            node.y -
            NODE_HEIGHT / 3 -
            (this.state.selectedNodeId === node.id ? SELECTED_BORDER_WIDTH : 0),
          left:
            node.x -
            NODE_WIDTH / 2 -
            (this.state.selectedNodeId === node.id ? SELECTED_BORDER_WIDTH : 0),
          backgroundColor: color
        }}
      >
        {text}
      </Node>
    );
  };

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
        onMouseOut={ this.hideTooltips }
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
    return (
      <div style={{ position: 'relative' }}>
        {_.map(this.props.nodes, this.displayNode)}
        {_.map(this.props.links, this.displayLinksText)}
        <ToolTip
          style={{ pointerEvents: 'none' }} // disable click on tooltip
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
  highlightSelectedEdgePath: PropTypes.func.isRequired,
  updateSelectedNode: PropTypes.func,
  configuration: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  version: PropTypes.number.isRequired
};

export default Nodes;
