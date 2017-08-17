import Popover from '../src/popoverComponent';
import PropTypes from 'prop-types';
import React from 'react';
import { storiesOf } from '@storybook/react';

import './style.css';

class Button extends React.Component {
  state = {
    show: false
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
          className={ this.props.className }
          placement={ this.props.placement }
          show={ this.state.show }
          target={ this.buttonRef }>
          <span>Nice popover!</span>
        </Popover>
      </div>
    );
  }
}

Button.propTypes = {
  placement: PropTypes.placement,
  className: PropTypes.string
};

storiesOf('Popover when hovering button', module)
  .add('popover bottom', () => (<Button placement='bottom' />))
  .add('popover top', () => (<Button placement='top' />))
  .add('popover right', () => (<Button placement='right' />))
  .add('popover left', () => (<Button placement='left' />));

storiesOf('Popover with style', module)
  .add('popover bottom', () => (
    <Button
      className='with-style'
      placement='bottom' />
  ))
  .add('popover top', () => (
    <Button
      className='with-style'
      placement='top' />
  ))
  .add('popover right', () => (
    <Button
      className='with-style'
      placement='right' />
  ))
  .add('popover left', () => (
    <Button
      className='with-style'
      placement='left' />
  ));
