import Tooltip from '../src/tooltipComponent';
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
        <Tooltip
          className={ this.props.className }
          placement={ this.props.placement }
          show={ this.state.show }
          target={ this.buttonRef }>
          <span>Nice tooltip!</span>
        </Tooltip>
      </div>
    );
  }
}

Button.propTypes = {
  placement: PropTypes.placement,
  className: PropTypes.string
};

storiesOf('Toolip when hovering button', module)
  .add('tooltip bottom', () => (<Button placement='bottom' />))
  .add('tooltip top', () => (<Button placement='top' />))
  .add('tooltip right', () => (<Button placement='right' />))
  .add('tooltip left', () => (<Button placement='left' />));

storiesOf('Toolip with style', module)
  .add('tooltip bottom', () => (
    <Button
      className='with-style'
      placement='bottom' />
  ))
  .add('tooltip top', () => (
    <Button
      className='with-style'
      placement='top' />
  ))
  .add('tooltip right', () => (
    <Button
      className='with-style'
      placement='right' />
  ))
  .add('tooltip left', () => (
    <Button
      className='with-style'
      placement='left' />
  ));
