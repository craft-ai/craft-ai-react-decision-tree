import PropTypes from 'prop-types';
import React from 'react';
import styled, { cx } from 'react-emotion';

const MARGIN = 10;

const PopoverContentOuter = styled('div')`
  z-index: 1070;
  position: absolute;
  max-width: 286px;
  display: block;
  &.top {
    padding-bottom: 10px;
  }
  &.bottom {
    padding-top: 10px;
  }
  &.left {
    padding-right: 10px;
  }
  &.right {
    padding-left: 10px;
  }
`;

const PopoverArrow = styled('div')`
  position: absolute;
  border-width: 11px;
  display: block;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
  &::after {
    content: ' ';
    border-width: 10px;
    position: absolute;
    height: 0px;
    width: 0px;
    border-style: solid;
    border-color: transparent;
    box-sizing: border-box;
  }

  ${({ placement }) => {
    switch (placement) {
      default:
      case 'top':
        return `
          margin-left: -10px;
          border-top-color: rgba(0, 0, 0, 0.25);
          border-bottom-width: 0px;
          bottom: 0;
          left: 50%;
          ::after {
            bottom: 1px;
            margin-left: -10px;
            border-top-color: white;
            border-bottom-width: 0px;
          }
        `;
      case 'bottom':
        return `
          margin-left: -10px;
          border-bottom-color: rgba(0, 0, 0, 0.25);
          border-top-width: 0px;
          top: 0;
          left: 50%;
          ::after {
            top: 1px;
            margin-left: -10px;
            border-top-width: 0px;
            border-bottom-color: white;
          }
        `;
      case 'left':
        return `
          border-left-color: rgba(0, 0, 0, 0.25);
          border-right-width: 0px;
          margin-top: -11px;
          right: 0;
          top: 50%;
          ::after {
            right: 1px;
            bottom: -10px;
            border-right-width: 0px;
            border-left-color: white;
          }
        `;
      case 'right':
        return `
          border-right-color: rgba(0, 0, 0, 0.25);
          border-left-width: 0px;
          margin-top: -11px;
          left: 0;
          top: 50%;
          ::after {
            left: 1px;
            bottom: -10px;
            border-left-width: 0px;
            border-right-color: white;
          }
        `;
    }
  }}
`;

const PopoverContentInner = styled('div')`
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: white;
`;

class PopoverContent extends React.Component {
  setPopoverRef = (input) => (this.popoverRef = input);

  onPopover = () => this.props.onPopover(true);

  notOnPopover = () => this.props.onPopover(false);

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.placement != this.props.placement ||
      nextProps.style.left != this.props.style.left ||
      nextProps.style.top != this.props.style.top ||
      nextProps.height != this.props.height ||
      nextProps.arrowOffsetLeft != this.props.arrowOffsetLeft
    );
  }

  componentDidUpdate() {
    this.props.onPlacementUpdated(
      this.popoverRef &&
        this.popoverRef.offsetHeight +
          (this.props.style ? this.props.style.top : MARGIN) >
          this.props.height
    );
  }

  render() {
    let { arrowOffsetLeft, children, className, placement, style } = this.props;

    // dealing with left arrow percentage
    let arrowLeftPercent;
    if (arrowOffsetLeft) {
      arrowLeftPercent = parseFloat(arrowOffsetLeft);

      if (arrowLeftPercent > 95) {
        arrowOffsetLeft = '95%';
      }
    }

    return (
      <PopoverContentOuter
        placement={placement}
        onMouseEnter={this.onPopover}
        onMouseLeave={this.notOnPopover}
        innerRef={this.setPopoverRef}
        className={cx('craft-popover', className, placement)}
        style={{ ...style }}
      >
        <PopoverContentInner className='craft-popover-content'>
          <PopoverArrow
            placement={placement}
            className={cx('craft-popover-arrow', placement)}
            style={{ left: arrowOffsetLeft }}
          />
          {children}
        </PopoverContentInner>
      </PopoverContentOuter>
    );
  }
}

PopoverContent.propTypes = {
  className: PropTypes.string,
  placement: PropTypes.string.isRequired,
  arrowOffsetLeft: PropTypes.string,
  onPopover: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func,
  height: PropTypes.number
};

export default PopoverContent;
