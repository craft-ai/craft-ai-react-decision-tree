import _ from 'lodash';
import DecisionRulesPopover from './decisionRulesPopover';
import { mix } from 'polished';
import Node from './node';
import Popover from 'react-craft-ai-popover';
import PropTypes from 'prop-types';
import React from 'react';
import {
  COLOR_LEAVES_CONFIDENCE_0,
  COLOR_LEAVES_CONFIDENCE_1,
  NODE_HEIGHT,
  NODE_WIDTH
} from '../utils/constants';

function computeLeafColor(confidence) {
  const blend = Math.pow(confidence, 3);
  return mix(blend, COLOR_LEAVES_CONFIDENCE_1, COLOR_LEAVES_CONFIDENCE_0);
}

class Leaf extends React.Component {
  state = {
    showingPopover: false,
    mouseOnPovover: false,
    popoverRef: null,
    placement: 'bottom'
  };

  showPopover = () => {
    if (this.props.selectable && !this.state.showingPopover) {
      this.setState({ showingPopover: true, popoverRef: this.leafRef });
    }
  };

  hidePopover = () => {
    if (this.props.selectable && this.state.showingPopover) {
      this.setState({ showingPopover: false, placement: 'bottom' });
    }
  };

  setLeafRef = (input) => {
    this.leafRef = input;
  };

  updatePopOverPlacement = (changePlacement) => {
    if (changePlacement) {
      this.setState({ placement: 'top' });
    }
  };

  setMouseOnPopover = (onPopover) => {
    this.setState({ mouseOnPovover: onPopover });
  };

  setSelectedLeaf = () => {
    this.props.updateSelectedNode(this.props.node.treePath);
  };

  render() {
    const { node } = this.props;
    const color = computeLeafColor(node.data.confidence);
    const text = node.data.predicted_value;

    const rendererText = _.isNull(text)
      ? ''
      : _.isFinite(text)
      ? parseFloat(text.toFixed(3)).toString()
      : text;

    return (
      <div>
        <Node
          ref={this.setLeafRef}
          onMouseEnter={this.showPopover}
          onMouseLeave={this.hidePopover}
          onClick={this.setSelectedLeaf}
          empty={_.isNull(text)}
          className="craft-nodes"
          style={{
            top: node.y - NODE_HEIGHT / 3,
            left: node.x - NODE_WIDTH / 2,
            backgroundColor: color
          }}
        >
          {rendererText}
        </Node>
      </div>
    );
  }
}

Leaf.propTypes = {
<<<<<<< HEAD
  selectable: PropTypes.bool.isRequired,
=======
  updateSelectedNode: PropTypes.func.isRequired,
>>>>>>> f489039... first version of node informations
  node: PropTypes.object.isRequired,
  configuration: PropTypes.object,
  height: PropTypes.number
};

export default Leaf;
