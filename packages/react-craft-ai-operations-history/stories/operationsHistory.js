import backgrounds from '@storybook/addon-backgrounds';
import CONFIGURATION_1 from './configuration_1.json';
import OperationsHistory from '../src';
import orderBy from 'lodash.orderby';
import preprocessOperations from '../src/utils/preprocessOperations';
import React from 'react';

import { storiesOf } from '@storybook/react';

import './test.css';

const CONFIGURATION_1_OPERATIONS_1 = orderBy(
  require('./configuration_1_operations_1.json'),
  ['timestamp']
);
const CONFIGURATION_1_OPERATIONS_1_STATES = orderBy(
  preprocessOperations(CONFIGURATION_1, CONFIGURATION_1_OPERATIONS_1).map(
    ({ state, timestamp }) => ({ context: state, timestamp })
  ),
  ['timestamp']
);

function requestOperationsFromC1O1(from, to) {
  return new Promise((resolve, reject) => {
    console.log(`C101 - Requesting operations from ${from} to ${to}...`);
    resolve(
      CONFIGURATION_1_OPERATIONS_1.filter(
        ({ timestamp }) => timestamp >= from && timestamp <= to
      )
    );
  });
}

function requestStateFromC1O1(desiredTimestamp) {
  return new Promise((resolve, reject) => {
    console.log(`C101 - Requesting state at ${desiredTimestamp}...`);
    resolve(
      CONFIGURATION_1_OPERATIONS_1_STATES.filter(
        ({ timestamp }) => desiredTimestamp < timestamp
      )[0]
    );
    reject(new Error('not implemented'));
  });
}

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
        initialOperations={ CONFIGURATION_1_OPERATIONS_1 }
      />
    );
  })
  .add('Future operations dynamic loading', () => {
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_1 }
        initialOperations={ CONFIGURATION_1_OPERATIONS_1.slice(0, 300) }
        onRequestOperations={ requestOperationsFromC1O1 }
        onRequestState={ requestStateFromC1O1 }
        from={ CONFIGURATION_1_OPERATIONS_1[0].timestamp }
        to={
          CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1]
            .timestamp
        }
      />
    );
  })
  .add('Fully dynamic loading', () => {
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_1 }
        onRequestOperations={ requestOperationsFromC1O1 }
        onRequestState={ requestStateFromC1O1 }
        from={ CONFIGURATION_1_OPERATIONS_1[0].timestamp }
        to={
          CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1]
            .timestamp
        }
      />
    );
  });
