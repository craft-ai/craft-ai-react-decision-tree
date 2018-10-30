import backgrounds from '@storybook/addon-backgrounds';
import CONFIGURATION_1 from './configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './configuration_1_operations_1.json';
import OperationsHistory from '../src';
import React from 'react';

import { storiesOf } from '@storybook/react';

import './test.css';

storiesOf('OperationsHistory', module)
  .addDecorator(
    backgrounds([
      { name: 'light-green', value: '#99F2C5', default: true },
      { name: 'craft', value: '#42348b' },
      { name: 'pink', value: '#d54267' }
    ])
  )
  .add('no dynamic loading (custom css)', () => {
    return (
      <div className="test">
        <OperationsHistory
          agentConfiguration={ CONFIGURATION_1 }
          initialOperations={ CONFIGURATION_1_OPERATIONS_1.slice(0, 200) }
        />
      </div>
    );
  })
  .add('no dynamic loading', () => {
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_1 }
        initialOperations={ CONFIGURATION_1_OPERATIONS_1.slice(50, 200) }
      />
    );
  });
