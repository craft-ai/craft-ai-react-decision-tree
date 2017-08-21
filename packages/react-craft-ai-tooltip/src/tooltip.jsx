import glamorous from 'glamorous';
import PropTypes from 'prop-types';
import React from 'react';

const MARGIN = 10;

const CraftTooltip = glamorous.div({
  zIndex: 1070,
  position: 'absolute',
  opacity: 1
},
({ placement = 'top' }) => {
  switch (placement) {
    case 'bottom':
    case 'top':
      return {
        padding: '5px 0'
      };
    case 'left':
    case 'right':
    default:
      return {
        padding: '0 5px'
      };
  }
});

const CraftTooltipArrow = glamorous.div({
  position: 'absolute',
  width: 0,
  height: 0,
  borderColor: 'transparent',
  borderStyle: 'solid'
},
({ placement = 'top' }) => {
  switch (placement) {
    case 'bottom':
      return {
        top: 0,
        left: '50%',
        marginLeft: -5,
        borderBottomColor: 'black',
        borderWidth: '0 5px 5px'
      };
    case 'left':
      return {
        top: '50%',
        right: 0,
        marginTop: -5,
        borderLeftColor: 'black',
        borderWidth: '5px 0 5px 5px'
      };
    case 'right':
      return {
        top: '50%',
        left: 0,
        marginTop: -5,
        borderRightColor: 'black',
        borderWidth: '5px 5px 5px 0'
      };
    default:
      // placement for top
      return {
        bottom: 0,
        left: '50%',
        marginLeft: -5,
        borderTopColor: 'black',
        borderWidth: '5px 5px 0'
      };
  }
});

const CraftTooltipContent = glamorous.div({
  padding: '3px 8px',
  backgroundColor: 'black',
  color: 'white',
  textAlign: 'center',
  maxWidth: 200
});


class ToolTip extends React.Component {
  setTooltipRef = (input) => (this.tooltipRef = input);

  componentDidUpdate() {
    this.props.onPlacementUpdated(
      this.tooltipRef &&
      (this.tooltipRef.offsetHeight + this.props.style.top + MARGIN) > window.innerHeight
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
      <CraftTooltip
        ref={ this.setTooltipRef }
        placement={ placement }
        className={ `craft-tooltip ${className} ${placement}` }
        style={{ ...style }}>
        <CraftTooltipArrow
          placement={ placement }
          className='craft-tooltip-arrow'
          style={{ left: arrowOffsetLeft }} />
        <CraftTooltipContent className='craft-tooltip-content'>
          { children }
        </CraftTooltipContent>
      </CraftTooltip>
    );
  }
}

ToolTip.propTypes = {
  className: PropTypes.string,
  placement: PropTypes.string.isRequired,
  arrowOffsetLeft: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func
};

export default ToolTip;
