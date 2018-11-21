import backgrounds from '@storybook/addon-backgrounds';
import CONFIGURATION_1 from './configuration_1.json';
import CONFIGURATION_2 from './configuration_2.json';
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

const CONFIGURATION_2_OPERATIONS_1 = orderBy(
  require('./configuration_2_operations_1.json'),
  ['timestamp']
);
const CONFIGURATION_2_OPERATIONS_1_STATES = orderBy(
  preprocessOperations(CONFIGURATION_2, CONFIGURATION_2_OPERATIONS_1).map(
    ({ state, timestamp }) => ({ context: state, timestamp })
  ),
  ['timestamp']
);

function createRequestOperations(operations, states) {
  return (requestedFrom, requestedTo, requestInitialState = false) => {
    const fromIndex = operations.findIndex(
      ({ timestamp }) => timestamp >= requestedFrom
    );
    const toIndex =
      operations.findIndex(({ timestamp }) => timestamp >= requestedTo) ||
      operations.length - 1;
    if (fromIndex == toIndex) {
      console.log(
        `Requesting operations from ${requestedFrom} to ${requestedTo}, no operations found.`
      );
      return Promise.resolve({
        operations: [],
        from: requestedFrom,
        to: requestedTo,
        initialState: undefined
      });
    }
    console.log(
      `Requesting operations from ${requestedFrom} (at index ${fromIndex}) to ${requestedTo} (at index ${toIndex -
        1}).`
    );
    return Promise.resolve({
      operations: operations.slice(fromIndex, toIndex + 1),
      from: operations[fromIndex].timestamp,
      to: operations[toIndex].timestamp,
      initialState: requestInitialState && states[fromIndex].context
    });
  };
}

const requestOperationsFromC1O1 = createRequestOperations(
  CONFIGURATION_1_OPERATIONS_1,
  CONFIGURATION_1_OPERATIONS_1_STATES
);

const requestOperationsFromC2O1 = createRequestOperations(
  CONFIGURATION_2_OPERATIONS_1,
  CONFIGURATION_2_OPERATIONS_1_STATES
);

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
        from={ CONFIGURATION_1_OPERATIONS_1[0].timestamp }
        to={
          CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1]
            .timestamp
        }
      />
    );
  })
  .add('Future operations dynamic loading, irregular operations', () => {
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_2 }
        initialOperations={ CONFIGURATION_2_OPERATIONS_1.slice(0, 300) }
        onRequestOperations={ requestOperationsFromC2O1 }
        from={ CONFIGURATION_2_OPERATIONS_1[0].timestamp }
        to={
          CONFIGURATION_2_OPERATIONS_1[CONFIGURATION_2_OPERATIONS_1.length - 1]
            .timestamp
        }
      />
    );
  })
  .add('Past operations dynamic loading', () => {
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_1 }
        initialOperations={ [
          CONFIGURATION_1_OPERATIONS_1_STATES[
            CONFIGURATION_1_OPERATIONS_1_STATES.length - 200
          ],
          ...CONFIGURATION_1_OPERATIONS_1.slice(
            CONFIGURATION_1_OPERATIONS_1.length - 199
          )
        ] }
        onRequestOperations={ requestOperationsFromC1O1 }
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
        from={ CONFIGURATION_1_OPERATIONS_1[0].timestamp }
        to={
          CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1]
            .timestamp
        }
      />
    );
  })
  .add('Fully dynamic loading, irregular operations', () => {
    return (
      <OperationsHistory
        agentConfiguration={ CONFIGURATION_2 }
        onRequestOperations={ requestOperationsFromC2O1 }
        from={ CONFIGURATION_2_OPERATIONS_1[0].timestamp }
        to={
          CONFIGURATION_2_OPERATIONS_1[CONFIGURATION_2_OPERATIONS_1.length - 1]
            .timestamp
        }
      />
    );
  });
