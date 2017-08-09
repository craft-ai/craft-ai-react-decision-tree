import PropTypes from 'prop-types';
import React from 'react';

const MARGIN = 10;

class ToolTip extends React.Component {
  setTooltipRef = (input) => (this.tooltipRef = input);

  componentDidUpdate() {
    this.props.onPlacementUpdated(
      this.tooltipRef &&
      (this.tooltipRef.offsetHeight + this.props.style.top + MARGIN) > window.innerHeight
    );
  }

  render() {
    let { arrowOffsetLeft, style, placement, children } = this.props;

    // dealing with arrow percentage
    let arrowLeftPercent = parseFloat(arrowOffsetLeft);

    if (arrowLeftPercent > 75) {
      arrowOffsetLeft = '75%';
    }

    return (
      <div
        ref={ this.setTooltipRef }
        className={ `craft-tooltip ${placement}` }
        style={{ opacity: 1, ...style }}>
        <div className='craft-tooltip-arrow' style={{ left: arrowOffsetLeft }} />
        <div className='craft-tooltip-content'>
          { children }
        </div>
      </div>
    );
  }
}

ToolTip.defaultProps = {
  onPlacementUpdated: () => null,
  arrowOffsetLeft: '0'
};

ToolTip.propTypes = {
  placement: PropTypes.string,
  arrowOffsetLeft: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func
};

export default ToolTip;
