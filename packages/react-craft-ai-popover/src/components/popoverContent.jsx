import glamorous from 'glamorous';
import PropTypes from 'prop-types';
import React from 'react';

const MARGIN = 10;

const PopoverContentOuter = glamorous.div({
  zIndex: 1070,
  position: 'absolute',
  maxWidth: 286,
  display: 'block'
},
({ placement = 'top' }) => {
  switch (placement) {
    case 'bottom':
      return {
        paddingTop: 10
      };
    case 'left':
      return {
        paddingRight: 10
      };
    case 'right':
      return {
        paddingLeft: 10
      };
    default:
      // placement for top
      return {
        paddingBottom: 10
      };
  }
});

const PopoverArrow = glamorous.div({
  position: 'absolute',
  borderWidth: 11,
  display: 'block',
  width: 0,
  height: 0,
  borderColor: 'transparent',
  borderStyle: 'solid',
  '::after': {
    content: ' ',
    borderWidth: 10,
    position: 'absolute',
    height: 0,
    width: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
    boxSizing: 'border-box'
  }
},
({ placement = 'top' }) => {
  switch (placement) {
    case 'bottom':
      return {
        marginLeft: -10,
        borderBottomColor: 'rgba(0, 0, 0, 0.25)',
        borderTopWidth: 0,
        top: 0,
        left: '50%',
        '::after': {
          marginLeft: -10,
          top: 1,
          borderTopWidth: 0,
          borderBottomColor: 'white'
        }
      };
    case 'left':
      return {
        borderLeftColor: 'rgba(0, 0, 0, 0.25)',
        borderRightWidth: 0,
        marginTop: -11,
        right: 0,
        top: '50%',
        '::after': {
          right: 1,
          bottom: -10,
          borderRightWidth: 0,
          borderLeftColor: 'white',
        }
      };
    case 'right':
      return {
        borderRightColor: 'rgba(0, 0, 0, 0.25)',
        borderLeftWidth: 0,
        marginTop: -11,
        left: 0,
        top: '50%',
        '::after': {
          left: 1,
          bottom: -10,
          borderLeftWidth: 0,
          borderRightColor: 'white',
        }
      };
    default:
      // placement for top
      return {
        marginLeft: -10,
        borderTopColor: 'rgba(0, 0, 0, 0.25)',
        borderBottomWidth: 0,
        bottom: 0,
        left: '50%',
        '::after': {
          marginLeft: -10,
          bottom: 1,
          borderTopColor: 'white',
          borderBottomWidth: 0
        }
      };
  }
});

const PopoverContentInner = glamorous.div({
  border: '1px solid rgba(0, 0, 0, 0.2)',
  backgroundColor: 'white',
});

class PopoverContent extends React.Component {
  setPopoverRef = (input) => (this.popoverRef = input)

  onPopover = () => (this.props.onPopover(true))

  notOnPopover = () => (this.props.onPopover(false))

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.placement != this.props.placement ||
           nextProps.style.left != this.props.style.left ||
           nextProps.style.top != this.props.style.top ||
           nextProps.height != this.props.height ||
           nextProps.arrowOffsetLeft != this.props.arrowOffsetLeft;
  }

  componentDidUpdate() {
    this.props.onPlacementUpdated(
      this.popoverRef &&
      (this.popoverRef.offsetHeight + (this.props.style ? this.props.style.top : MARGIN)) > this.props.height
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
        placement={ placement }
        onMouseEnter={ this.onPopover }
        onMouseLeave={ this.notOnPopover }
        innerRef={ this.setPopoverRef }
        className={ `craft-popover ${placement} ${className}` }
        style={{ ...style }}>
        <PopoverContentInner className='craft-popover-content'>
          <PopoverArrow
            placement={ placement }
            className={ `craft-popover-arrow ${placement}` }
            style={{ left: arrowOffsetLeft }} />
          { children }
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
