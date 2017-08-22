import _ from 'lodash';
import PopoverContent from './popoverContent';
import PropTypes from 'prop-types';
import React from 'react';
import { Overlay } from 'react-overlays';

class Popover extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: this.props.show
    };
  }

  // Trick to ensure the popover hover
  setShow = (show) => (this.setState({ show: show }))

  componentWillReceiveProps(nextProps) {
    if (nextProps.show != this.props.show) {
      _.delay(this.setShow, 5, nextProps.show);
    }
  }

  render() {
    const {
      arrowOffsetLeft, children, className, height,
      onPlacementUpdated, onPopover, placement,
      style, target
    } = this.props;

    return (
      <Overlay
        show={ this.state.show }
        placement={ placement }
        target={ target }>
        <PopoverContent
          className={ className }
          arrowOffsetLeft={ arrowOffsetLeft }
          placement={ placement }
          height={ height }
          style={{ ...style }}
          onPopover={ onPopover }
          onPlacementUpdated={ onPlacementUpdated }>
          { children }
        </PopoverContent>
      </Overlay>
    );
  }
}

Popover.defaultProps = {
  onPopover: () => null,
  height: window.innerHeight,
  placement: 'top',
  onPlacementUpdated: () => null
};

Popover.propTypes = {
  className: PropTypes.string,
  show: PropTypes.bool.isRequired,
  target: PropTypes.object,
  placement: PropTypes.string,
  arrowOffsetLeft: PropTypes.string,
  onPopover: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func,
  height: PropTypes.number
};

export default Popover;
