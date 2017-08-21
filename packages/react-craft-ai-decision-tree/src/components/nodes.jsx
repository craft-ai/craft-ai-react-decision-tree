import _ from 'lodash';
import glamorous from 'glamorous';
import Leaf from './leaf';
import PropTypes from 'prop-types';
import React from 'react';
import ToolTip from 'react-craft-ai-tooltip';
import Node from './node';
import {
  NODE_DEPTH, NODE_HEIGHT, NODE_WIDTH, NOT_RELIABLE_LIMIT, NOT_RELIABLE_COLOR,
  NULL_COLOR, RELIABLE_PERCENT, RELIABLE_COLOR
} from '../utils/constants';
import { Properties } from 'craft-ai';

const makeGradientColor = (percent) => {
  let newColor = {};

  const makeChannel = (a, b) => {
    return (a + Math.round((b - a) * (((percent - NOT_RELIABLE_LIMIT) * RELIABLE_PERCENT) / 100)));
  };

  const makeColorPiece = (num) => {
    num = Math.min(num, 255);   // not more than 255
    num = Math.max(num, 0);     // not less than 0
    let str = num.toString(16);
    if (str.length < 2) {
      str = `0${str}`;
    }
    return str;
  };

  if (percent == 0) {
    newColor.cssColor = `#${makeColorPiece(NULL_COLOR.r)}${makeColorPiece(NULL_COLOR.g)}${makeColorPiece(NULL_COLOR.b)}`;
    return newColor;
  }

  if (percent < NOT_RELIABLE_LIMIT) {
    newColor.cssColor = `#${makeColorPiece(NOT_RELIABLE_COLOR.r)}${makeColorPiece(NOT_RELIABLE_COLOR.g)}${makeColorPiece(NOT_RELIABLE_COLOR.b)}`;
    return newColor;
  }

  newColor.r = makeChannel(NOT_RELIABLE_COLOR.r, RELIABLE_COLOR.r);
  newColor.g = makeChannel(NOT_RELIABLE_COLOR.g, RELIABLE_COLOR.g);
  newColor.b = makeChannel(NOT_RELIABLE_COLOR.b, RELIABLE_COLOR.b);
  newColor.cssColor = `#${makeColorPiece(newColor.r)}${makeColorPiece(newColor.g)}${makeColorPiece(newColor.b)}`;
  return newColor;
};

const CraftLinks = glamorous.div({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  position: 'absolute',
  textAlign: 'center',
  fontSize: 'smaller',
  pointerEvents: 'auto',
  backgroundColor: 'rgba(255, 255, 255, 0.5)'
});

class Nodes extends React.Component {
  linkRef = {};
  nodeRef = {};

  state = {
    showingTooltip: false,
    tooltipOnPovover: false,
    tooltipText: '',
    tooltipRef: null,
    tooltipPlacement: 'bottom'
  }

  hideTooltip = () => {
    this.setState({
      showingTooltip: false,
      tooltipText: '',
      tooltipRef: null,
      tooltipPlacement: 'bottom'
    });
  }

  displayNode = (node, index) => {
    if (_.isUndefined(node.children)) { // leaf
      let newColor = makeGradientColor(node.data.confidence * 100);
      return (
        <Leaf
          key={ index }
          height={ this.props.height }
          node={ node }
          color={ newColor.cssColor }
          text={ node.data.predicted_value }
          configuration={ this.props.configuration } />
      );
    }
    const text = node.children[0].data.decision_rule.property;

    const showTooltip = () => {
      this.setState({ showingTooltip: true, tooltipText: text, tooltipRef: this.nodeRef[index] });
    };

    const indexRef = (input) => {
      this.nodeRef[index] = input;
    };

    return (
      <Node
        key={ index }
        ref={ indexRef }
        onMouseOver={ showTooltip }
        onMouseOut={ this.hideTooltip }
        className='craft-nodes'
        style={{ top: node.y - NODE_HEIGHT / 3, left: node.x - NODE_WIDTH / 2 }}>
        { text }
      </Node>
    );
  }

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
    const propertyType = this.props.configuration.context[link.target.data.decision_rule.property].type;
    const text = Properties.formatDecisionRule({
      ...link.target.data.decision_rule,
      type: propertyType
    });

    const showTooltip = () => {
      this.setState({ showingTooltip: true, tooltipText: text, tooltipRef: this.linkRef[index] });
    };

    const indexRef = (input) => {
      this.linkRef[index] = input;
    };

    return (
      <CraftLinks
        key={ index }
        ref={ indexRef }
        onMouseOver={ showTooltip }
        onMouseOut={ this.hideTooltip }
        className='craft-links'
        style={{ top: link.source.y + (NODE_DEPTH / 2 - NODE_HEIGHT / 3), left: x, width: width }}>
        { text }
      </CraftLinks>
    );
  }

  updateTooltipPlacement = (changeTooltipPlacement) => {
    if (changeTooltipPlacement) {
      this.setState({ tooltipPlacement: 'top' });
    }
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        { _.map(this.props.nodes, this.displayNode) }
        { _.map(this.props.links, this.displayLinksText) }
        <ToolTip
          show={ this.state.showingTooltip }
          placement={ this.state.tooltipPlacement }
          target={ this.state.tooltipRef }
          onPlacementUpdated={ this.updateTooltipPlacement }>
          { this.state.tooltipText }
        </ToolTip>
      </div>
    );
  }
}

Nodes.propTypes = {
  configuration: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};

export default Nodes;
