import PropTypes from 'prop-types';
import React from 'react';
import styled, { cx } from 'react-emotion';

const MARGIN = 10;

const TooltipContentOuter = styled('div')`
  z-index: 1070;
  position: absolute;
  opacity: 1;
  display: block;
  &.top,
  &.bottom {
    padding: 5px 0;
  }
  &.left,
  &.right {
    padding: 0 5px;
  }
`;

const TooltipArrow = styled('div')`
  display: block;
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;

  ${({ placement }) => {
    switch (placement) {
      default:
      case 'top':
        return `
          bottom: 0;
          left: 50%;
          margin-left: -5px;
          border-top-color: black;
          border-width: 5px 5px 0;
        `;
      case 'bottom':
        return `
          top: 0;
          left: 50%;
          margin-left: -5px;
          border-bottom-color: black;
          border-width: 0 5px 5px;
        `;
      case 'left':
        return `
          top: 50%;
          right: 0;
          margin-top: -5px;
          border-left-color: black;
          border-width: 5px 0 5px 5px;
        `;
      case 'right':
        return `
          top: 50%;
          left: 0;
          margin-top: -5px;
          border-right-color: black;
          border-width: 5px 5px 5px 0;
        `;
    }
  }}
`;

const TooltipContentInner = styled('div')`
  padding: 3px 8px;
  background-color: black;
  color: white;
  text-align: center;
  maxwidth: 200px;
`;

class TooltipContent extends React.Component {
  setTooltipRef = (input) => (this.tooltipRef = input);

  componentDidUpdate() {
    this.props.onPlacementUpdated(
      this.tooltipRef &&
        this.tooltipRef.offsetHeight + this.props.style.top + MARGIN >
          window.innerHeight
    );
  }

  render() {
    let { arrowOffsetLeft, children, className, placement, style } = this.props;

    // dealing with arrow percentage
    let arrowLeftPercent;
    if (arrowOffsetLeft) {
      arrowLeftPercent = parseFloat(arrowOffsetLeft);

      if (arrowLeftPercent > 75) {
        arrowOffsetLeft = '75%';
      }
    }

    return (
      <TooltipContentOuter
        ref={this.setTooltipRef}
        placement={placement}
        className={cx('craft-tooltip', className, placement)}
        style={{ ...style }}
      >
        <TooltipArrow
          placement={placement}
          className='craft-tooltip-arrow'
          style={{ left: arrowOffsetLeft }}
        />
        <TooltipContentInner className='craft-tooltip-content'>
          {children}
        </TooltipContentInner>
      </TooltipContentOuter>
    );
  }
}

TooltipContent.propTypes = {
  className: PropTypes.string,
  placement: PropTypes.string.isRequired,
  arrowOffsetLeft: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func
};

export default TooltipContent;
