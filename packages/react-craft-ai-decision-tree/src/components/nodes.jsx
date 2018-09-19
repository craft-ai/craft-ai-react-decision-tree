import _ from 'lodash';
import glamorous from 'glamorous';
import Leaf from './leaf';
import Node from './node';
import PropTypes from 'prop-types';
import React from 'react';
import ToolTip from 'react-craft-ai-tooltip';
import {
  COLOR_EDGES_CAPTION_BG,
  NODE_DEPTH, NODE_HEIGHT, NODE_WIDTH
} from '../utils/constants';
import { Properties } from 'craft-ai';

const Links = glamorous.div({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  position: 'absolute',
  textAlign: 'center',
  fontSize: 'smaller',
  pointerEvents: 'auto',
  backgroundColor: COLOR_EDGES_CAPTION_BG
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

  shouldComponentUpdate(nextProps, nextState) {
    const doUpdate = this.props.configuration != nextProps.configuration ||
                   _.isEqual(this.props.nodes, nextProps.nodes) ||
                   _.isEqual(this.props.links, nextProps.links) ||
                   this.props.height != nextProps.height;

    return doUpdate;
  }

  displayNode = (node, index) => {
    if (_.isUndefined(node.children)) { // leaf
      return (
        <Leaf
          key={ index }
          height={ this.props.height }
          node={ node }
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
      <Links
        key={ index }
        ref={ indexRef }
        onMouseOver={ showTooltip }
        onMouseOut={ this.hideTooltip }
        className='craft-links'
        style={{ top: link.source.y + (NODE_DEPTH / 2 - NODE_HEIGHT / 3), left: x, width: width }}>
        { text }
      </Links>
    );
  }

  updateTooltipPlacement = (changeTooltipPlacement) => {
    if (changeTooltipPlacement && this.state.tooltipPlacement != 'top') {
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
