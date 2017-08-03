import PropTypes from 'prop-types';
import React from 'react';

const MARGIN = 10;

class PopOver extends React.Component {
  setPopoverRef = (input) => (this.popoverRef = input)

  onPopover = () => (this.props.onTooltip(true))

  notOnPopover = () => (this.props.onTooltip(false))

  componentDidUpdate() {
    this.props.onPlacementUpdated(
      this.popoverRef &&
      (this.popoverRef.offsetHeight + this.props.style.top + MARGIN) > window.innerHeight
    );
  }

  render() {
    let { style, placement, children, arrowOffsetLeft } = this.props;

    // dealing with arrow percentage
    let arrowLeftPercent = parseFloat(arrowOffsetLeft);

    if (arrowLeftPercent > 95) {
      arrowOffsetLeft = '95%';
    }

    return (
      <div
        onMouseEnter={ this.onPopover }
        onMouseLeave={ this.notOnPopover }
        ref={ this.setPopoverRef }
        className={ `popover ${placement}` }
        style={{ display: 'block', ...style }}>
        <div className='arrow' style={{ left: arrowOffsetLeft }} />
        { children }
      </div>
    );
  }
}

PopOver.defaultProps = {
  arrowOffsetLeft: '0',
  onTooltip: () => null
};

PopOver.propTypes = {
  placement: PropTypes.string,
  arrowOffsetLeft: PropTypes.string,
  onTooltip: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node,
  onPlacementUpdated: PropTypes.func
};

export default PopOver;
