import backgrounds from '@storybook/addon-backgrounds';
import CONFIGURATION_1 from './configuration_1.json';
import CONFIGURATION_1_OPERATIONS_1 from './configuration_1_operations_1.json';
import OperationsHistory from '../src';
import React from 'react';

import { storiesOf } from '@storybook/react';


storiesOf('OperationsHistory', module)
  .addDecorator(backgrounds([
    { name: 'craft', value: '#42348b', default: true },
    { name: 'pink', value: '#d54267' },
  ]))
  .add('simple', () => {
    const onLoadOperations = () => CONFIGURATION_1_OPERATIONS_1;
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_1 }
        fromTimestamp={ CONFIGURATION_1_OPERATIONS_1[0].timestamp }
        toTimestamp={ CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1 ].timestamp }
        onLoadOperations={ onLoadOperations }
      />
    );
  });
