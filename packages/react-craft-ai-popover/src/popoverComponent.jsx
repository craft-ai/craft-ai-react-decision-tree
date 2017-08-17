import Popover from './popover';
import PropTypes from 'prop-types';
import React from 'react';
import { Overlay } from 'react-overlays';

const PopoverComponent = ({
  arrowOffsetLeft, children, className, height,
  onPlacementUpdated, onPopover, placement, show,
  style, target
}) => (
  <Overlay
    show={ show }
    placement={ placement }
    target={ target }>
    <Popover
      className={ className }
      arrowOffsetLeft={ arrowOffsetLeft }
      placement={ placement }
      height={ height }
      style={{ ...style }}
      onPopover={ onPopover }
      onPlacementUpdated={ onPlacementUpdated }>
      { children }
    </Popover>
  </Overlay>
);

PopoverComponent.defaultProps = {
  onPopover: () => null,
  height: window.innerHeight,
  placement: 'top',
  onPlacementUpdated: () => null
};

PopoverComponent.propTypes = {
  className: PropTypes.string,
  show: PropTypes.bool.isRequired,
  target: PropTypes.object.isRequired,
  placement: PropTypes.string,
  arrowOffsetLeft: PropTypes.string,
  onPopover: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func,
  height: PropTypes.number
};

export default PopoverComponent;
