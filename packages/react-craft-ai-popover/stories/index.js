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
          <span>Nice popover!</span>
        </Popover>
      </div>
    );
  }
}

Button.defaultProps = {
  stayWhenHovered: false
};

Button.propTypes = {
  stayWhenHovered: PropTypes.bool,
  placement: PropTypes.placement,
  className: PropTypes.string
};

storiesOf('Popover when hovering button', module)
  .add('popover bottom', () => (<Button placement='bottom' />))
  .add('popover top', () => (<Button placement='top' />))
  .add('popover right', () => (<Button placement='right' />))
  .add('popover left', () => (<Button placement='left' />));

class ButtonWithTitledPopover extends React.Component {
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
          <div>
            <div style={{
              padding: 5,
              borderBottom: 'solid 1px black',
              textAlign: 'center'
            }}> TITLE </div>
            <div style={{ padding: 5 }}>NICE CONTENT</div>
          </div>
        </Popover>
      </div>
    );
  }
}

ButtonWithTitledPopover.propTypes = {
  placement: PropTypes.placement,
  className: PropTypes.string
};

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

storiesOf('Popover with titled popover', module)
  .add('popover bottom', () => (
    <ButtonWithTitledPopover placement='bottom' />
  ))
  .add('popover top', () => (
    <ButtonWithTitledPopover placement='top' />
  ))
  .add('popover right', () => (
    <ButtonWithTitledPopover placement='right' />
  ))
  .add('popover left', () => (
    <ButtonWithTitledPopover placement='left' />
  ));

storiesOf('Popover misc', module)
  .add('popover stay when hovered', () => (
    <Button
      stayWhenHovered
      placement='bottom' />
  ));
