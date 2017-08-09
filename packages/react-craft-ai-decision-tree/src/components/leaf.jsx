import _ from 'lodash';
import DecisionRulesPopover from '../widgets/decisionRulesPopover';
import Node from './node';
import PopOver from '../widgets/popover';
import PropTypes from 'prop-types';
import React from 'react';
import { NODE_HEIGHT, NODE_WIDTH } from '../utils/constants';
import { Overlay } from 'react-overlays';

class Leaf extends React.Component {
  state = {
    showingPopover: false,
    mouseOnPovover: false,
    popoverRef: null,
    placement: 'bottom'
  }

  showPopover = () => {
    this.setState({ showingPopover: true, popoverRef: this.leafRef });
  }

  hidePopover = () => {
    this.setState({ showingPopover: false, placement: 'bottom' });
  }

  setLeafRef = (input) => {
    this.leafRef = input;
  }

  updatePopOverPlacement = (changePlacement) => {
    if (changePlacement) {
      this.setState({ placement: 'top' });
    }
  }

  setMouseOnPopover = (onPopover) => {
    this.setState({ mouseOnPovover: onPopover });
  }

  render() {
    const { node, text, color } = this.props;
    const rendererText = _.isNull(text) ?
      '' :
      (_.isFinite(text) ? parseFloat(text.toFixed(3)).toString() : text);

    const renderList = node ? (
      <DecisionRulesPopover
        node={ node }
        context={ this.props.configuration.context }
        title={ rendererText }
        color={ color } />
    ) : null;

    return (
      <div>
        <Node
          ref={ this.setLeafRef }
          onMouseEnter={ this.showPopover }
          onMouseLeave={ this.hidePopover }
          empty={ _.isNull(text) }
          className='craft-nodes'
          style={{ top: node.y - NODE_HEIGHT / 3, left: node.x - NODE_WIDTH / 2, backgroundColor: color }}>
          { rendererText }
        </Node>
        <Overlay
          show={ this.state.showingPopover || this.state.mouseOnPovover }
          placement={ this.state.placement }
          target={ this.state.popoverRef }>
          <PopOver
            onPopover={ this.setMouseOnPopover }
            height={ this.props.height }
            onPlacementUpdated={ this.updatePopOverPlacement }>
            { renderList }
          </PopOver>
        </Overlay>
      </div>
    );
  }
}

Leaf.propTypes = {
  node: PropTypes.object.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  color: PropTypes.string.isRequired,
  configuration: PropTypes.object,
  height: PropTypes.number
};

export default Leaf;
