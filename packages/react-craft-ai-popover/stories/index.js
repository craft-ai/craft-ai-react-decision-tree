import Popover from '../src/popoverComponent';
import PropTypes from 'prop-types';
import React from 'react';
import { storiesOf } from '@storybook/react';

import './style.css';

class Button extends React.Component {
  state = {
    show: false,
    mouseOnPovover: false
  }

  setRefButton = (input) => {
    this.buttonRef = input;
  }

  showPopover = () => {
    this.setState({ show: true });
  }

  hidePopover = () => {
    this.setState({ show: false });
  }

  setMouseOnPopover = (onPopover) => {
    this.setState({ mouseOnPovover: onPopover });
  }

  render() {
    return (
      <div>
        <button
          style={{ margin: 200 }}
          ref={ this.setRefButton }
          onMouseEnter={ this.showPopover }
          onMouseOut={ this.hidePopover }>
          hover me
        </button>
        <Popover
          onPopover={ this.props.stayWhenHovered ? this.setMouseOnPopover : () => null }
          className={ this.props.className }
          placement={ this.props.placement }
          show={ this.state.show || this.state.mouseOnPovover }
          target={ this.buttonRef }>
          { this.props.content }
        </Popover>
      </div>
    );
  }
}

Button.defaultProps = {
  stayWhenHovered: false,
  content: (<span>Nice popover!</span>)
};

Button.propTypes = {
  stayWhenHovered: PropTypes.bool,
  placement: PropTypes.placement,
  className: PropTypes.string,
  content: PropTypes.node
};

storiesOf('Popover when hovering button', module)
  .add('popover bottom', () => (<Button placement='bottom' />))
  .add('popover top', () => (<Button placement='top' />))
  .add('popover right', () => (<Button placement='right' />))
  .add('popover left', () => (<Button placement='left' />))
  .add('with custom style', () => (
    <Button
      className='with-style'
      placement='bottom' />
  ))
  .add('with custom content', () => (
    <Button
      content={
        (
          <div>
            <div style={{
              padding: 5,
              borderBottom: 'solid 1px black',
              textAlign: 'center'
            }}> TITLE </div>
            <div style={{ padding: 5 }}>NICE CONTENT</div>
          </div>
        )
      }
      placement='bottom' />
  ))
  .add('stayed when hovered', () => (
    <Button
      stayWhenHovered
      placement='bottom' />
  ));
