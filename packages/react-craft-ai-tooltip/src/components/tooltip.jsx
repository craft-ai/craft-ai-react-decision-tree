import { Overlay } from 'react-overlays';
import PropTypes from 'prop-types';
import React from 'react';
import TooltipContent from './tooltipContent';

const Tooltip = ({
  arrowOffsetLeft,
  children,
  className,
  onPlacementUpdated,
  placement,
  show,
  style,
  target
}) => (
  <Overlay show={ show } placement={ placement } target={ target }>
    <TooltipContent
      className={ className }
      arrowOffsetLeft={ arrowOffsetLeft }
      placement={ placement }
      style={{ ...style }}
      onPlacementUpdated={ onPlacementUpdated }
    >
      {children}
    </TooltipContent>
  </Overlay>
);

Tooltip.defaultProps = {
  placement: 'top',
  onPlacementUpdated: () => null
};

Tooltip.propTypes = {
  className: PropTypes.string,
  show: PropTypes.bool.isRequired,
  target: PropTypes.object,
  placement: PropTypes.string,
  arrowOffsetLeft: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func
};

export default Tooltip;
