import Tooltip from './tooltip';
import PropTypes from 'prop-types';
import React from 'react';
import { Overlay } from 'react-overlays';

const TooltipComponent = ({
  arrowOffsetLeft, children, className,
  onPlacementUpdated, placement, show,
  style, target
}) => (
  <Overlay
    show={ show }
    placement={ placement }
    target={ target }>
    <Tooltip
      className={ className }
      arrowOffsetLeft={ arrowOffsetLeft }
      placement={ placement }
      style={{ ...style }}
      onPlacementUpdated={ onPlacementUpdated }>
      { children }
    </Tooltip>
  </Overlay>
);

TooltipComponent.defaultProps = {
  placement: 'top',
  onPlacementUpdated: () => null
};

TooltipComponent.propTypes = {
  className: PropTypes.string,
  show: PropTypes.bool.isRequired,
  target: PropTypes.object.isRequired,
  placement: PropTypes.string,
  arrowOffsetLeft: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func
};

export default TooltipComponent;
