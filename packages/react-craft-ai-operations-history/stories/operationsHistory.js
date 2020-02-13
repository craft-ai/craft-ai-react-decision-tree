import backgrounds from '@storybook/addon-backgrounds';
import CONFIGURATION_1 from './configuration_1.json';
import CONFIGURATION_2 from './configuration_2.json';
import CONFIGURATION_3 from './configuration_3.json';
import CONFIGURATION_4 from './configuration_4.json';
import OperationsHistory from '../src';
import orderBy from 'lodash.orderby';
import preprocessOperations from '../src/utils/preprocessOperations';
import React from 'react';
import { storiesOf } from '@storybook/react';
import { number, withKnobs } from '@storybook/addon-knobs';

import './test.css';

const CONFIGURATION_1_OPERATIONS_1 = orderBy(
  require('./configuration_1_operations_1.json'),
  ['timestamp']
);
const CONFIGURATION_1_OPERATIONS_1_FROM =
  CONFIGURATION_1_OPERATIONS_1[0].timestamp;
const CONFIGURATION_1_OPERATIONS_1_TO =
  CONFIGURATION_1_OPERATIONS_1[CONFIGURATION_1_OPERATIONS_1.length - 1]
    .timestamp;

const CONFIGURATION_1_OPERATIONS_1_STATES = orderBy(
  preprocessOperations(CONFIGURATION_1, CONFIGURATION_1_OPERATIONS_1)
    .map(
      ({ state, timestamp }) => ({ context: state, timestamp })
    ),
  ['timestamp']
);

const CONFIGURATION_2_OPERATIONS_1 = orderBy(
  require('./configuration_2_operations_1.json'),
  ['timestamp']
);
const CONFIGURATION_2_OPERATIONS_1_FROM =
  CONFIGURATION_2_OPERATIONS_1[0].timestamp;
const CONFIGURATION_2_OPERATIONS_1_TO =
  CONFIGURATION_2_OPERATIONS_1[CONFIGURATION_2_OPERATIONS_1.length - 1]
    .timestamp;

const CONFIGURATION_2_OPERATIONS_1_STATES = orderBy(
  preprocessOperations(CONFIGURATION_2, CONFIGURATION_2_OPERATIONS_1)
    .map(
      ({ state, timestamp }) => ({ context: state, timestamp })
    ),
  ['timestamp']
);

const CONFIGURATION_3_OPERATIONS_1 = orderBy(
  require('./configuration_3_operations_1.json'),
  ['timestamp']
);
const CONFIGURATION_3_OPERATIONS_1_FROM =
  CONFIGURATION_3_OPERATIONS_1[0].timestamp;
const CONFIGURATION_3_OPERATIONS_1_TO =
  CONFIGURATION_3_OPERATIONS_1[CONFIGURATION_3_OPERATIONS_1.length - 1]
    .timestamp;

const CONFIGURATION_3_OPERATIONS_1_STATES = orderBy(
  preprocessOperations(CONFIGURATION_3, CONFIGURATION_3_OPERATIONS_1)
    .map(
      ({ state, timestamp }) => ({ context: state, timestamp })
    ),
  ['timestamp']
);

const CONFIGURATION_4_OPERATIONS_4 = orderBy(
  require('./configuration_4_operations_4.json'),
  ['timestamp']
);

const GENERATOR_OPERATIONS = orderBy(
  require('./generator_operations.json'),
  ['timestamp']
);

function delay(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

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
      return delay(5000)
        .then(() => ({
          operations: [],
          from: requestedFrom,
          to: requestedTo,
          initialState: undefined
        }));
    }
    console.log(
      `Requesting operations from ${requestedFrom} (at index ${fromIndex}) to ${requestedTo} (at index ${toIndex -
        1}).`
    );
    return delay(5000)
      .then(() => ({
        operations: operations.slice(fromIndex, toIndex + 1),
        from: operations[fromIndex].timestamp,
        to: operations[toIndex].timestamp,
        initialState: requestInitialState && states[fromIndex].context
      }));
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

const requestOperationsFromC3O1 = createRequestOperations(
  CONFIGURATION_3_OPERATIONS_1,
  CONFIGURATION_3_OPERATIONS_1_STATES
);

const requestOperationsBadC1 = (
  requestedFrom,
  requestedTo,
  requestInitialState = false
) => {
  console.log(
    `Requesting operations from ${requestedFrom} to ${requestedTo}...`
  );
  return delay(100)
    .then(() => {
      const operations = CONFIGURATION_1_OPERATIONS_1.slice(0, 20);
      return Promise.resolve({
        operations,
        from: operations[0].timestamp,
        to: operations[19].timestamp
      });
    });
};

function createHeightKnob() {
  return number('Height', 600, {
    range: true,
    min: 60,
    max: 1000,
    step: 1
  });
}

function createWidthKnob() {
  return number('Width', 600, {
    range: true,
    min: 60,
    max: 1000,
    step: 1
  });
}

function createRowHeightKnob() {
  return number('Row Height', 45, {
    range: true,
    min: 40,
    max: 300,
    step: 1
  });
}

function createInitialRowCountKnob(array, defaultCount) {
  return number('Initial Row Count', defaultCount, {
    range: true,
    min: 1,
    max: array.length,
    step: 1
  });
}

storiesOf('OperationsHistory', module)
  .addDecorator(withKnobs)
  .addDecorator(
    backgrounds([
      { name: 'light-green', value: '#99F2C5', default: true },
      { name: 'craft', value: '#42348b' },
      { name: 'pink', value: '#d54267' }
    ])
  )
  .add('no dynamic loading (custom css)', () => {
    return (
      <div className='test'>
        <OperationsHistory
          entityConfiguration={ CONFIGURATION_1 }
          initialOperations={ CONFIGURATION_1_OPERATIONS_1.slice(
            0,
            createInitialRowCountKnob(CONFIGURATION_1_OPERATIONS_1, 200)
          ) }
          focus={ number('Focus', null) }
          height={ createHeightKnob() }
          width={ createWidthKnob() }
          rowHeight={ createRowHeightKnob() }
        />
      </div>
    );
  })
  .add('no dynamic loading and with initial state for generators (custom css)', () => {
    const operations = GENERATOR_OPERATIONS;
    return (
      <div className='test'>
        <OperationsHistory
          entityConfiguration={{
            ...CONFIGURATION_1,
            filter: ['toto', 'toto2', 'toto3', 'toto4']
          }}
          initialOperations={ operations }
          initialState={{
            'toto': { 'load': 1947.4, 'timezone': '-07:00', 'temperature': 4.7 },
            'toto2': { 'load': 1947.4, 'timezone': '-05:00', 'temperature': 4.7 },
            'toto3': { 'load': 1947.4, 'timezone': '+02:00', 'temperature': 4.7 },
            'toto4': { 'load': 1947.4, 'timezone': '+03:00', 'temperature': 4.7 }
          }}
          from={ operations[0].timestamp }
          to={ operations[operations.length - 1].timestamp }
          height={ createHeightKnob() }
          width={ createWidthKnob() }
        />
      </div>
    );
  })
  .add('no dynamic loading (custom css)  with only 3 properties', () => {
    return (
      <div className='test'>
        <OperationsHistory
          entityConfiguration={ CONFIGURATION_4 }
          initialOperations={ CONFIGURATION_4_OPERATIONS_4 }
          focus={ number('Focus', null) }
          height={ createHeightKnob() }
          width={ createWidthKnob() }
          rowHeight={ createRowHeightKnob() }
        />
      </div>
    );
  })
  .add('no dynamic loading', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        initialOperations={ CONFIGURATION_1_OPERATIONS_1.slice(
          0,
          createInitialRowCountKnob(CONFIGURATION_1_OPERATIONS_1, 1000)
        ) }
      />
    );
  })
  .add('no dynamic loading and one operation', () => {
    const operations = CONFIGURATION_1_OPERATIONS_1.slice(0, 1);
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        initialOperations={ operations }
        from={ operations[0].timestamp }
        to={ operations[0].timestamp }
      />
    );
  })
  .add('no dynamic loading and with initial state', () => {
    const operations = CONFIGURATION_1_OPERATIONS_1.slice(1, 5);
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        initialOperations={ operations }
        initialState={ CONFIGURATION_1_OPERATIONS_1[0].context }
        from={ operations[0].timestamp }
        to={ operations[operations.length - 1].timestamp }
      />
    );
  })
  .add('no dynamic loading and with initial state for generators', () => {
    const operations = GENERATOR_OPERATIONS;
    return (
      <OperationsHistory
        entityConfiguration={{
          ...CONFIGURATION_1,
          filter: ['toto', 'toto2', 'toto3', 'toto4']
        }}
        initialOperations={ operations }
        initialState={{
          'toto': { 'load': 1947.4, 'timezone': '-07:00', 'temperature': 4.7 },
          'toto2': { 'load': 1947.4, 'timezone': '-05:00', 'temperature': 4.7 },
          'toto3': { 'load': 1947.4, 'timezone': '+02:00', 'temperature': 4.7 },
          'toto4': { 'load': 1947.4, 'timezone': '+03:00', 'temperature': 4.7 }
        }}
        from={ operations[0].timestamp }
        to={ operations[operations.length - 1].timestamp }
      />
    );
  })
  .add('Future operations dynamic loading', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        initialOperations={ CONFIGURATION_1_OPERATIONS_1.slice(
          0,
          createInitialRowCountKnob(CONFIGURATION_1_OPERATIONS_1, 300)
        ) }
        onRequestOperations={ requestOperationsFromC1O1 }
        from={ CONFIGURATION_1_OPERATIONS_1_FROM }
        to={ CONFIGURATION_1_OPERATIONS_1_TO }
      />
    );
  })
  .add('Future operations dynamic loading, irregular operations', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_2 }
        initialOperations={ CONFIGURATION_2_OPERATIONS_1.slice(0, 300) }
        onRequestOperations={ requestOperationsFromC2O1 }
        from={ CONFIGURATION_2_OPERATIONS_1_FROM }
        to={ CONFIGURATION_2_OPERATIONS_1[3000].timestamp }
      />
    );
  })
  .add('Past operations dynamic loading', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        initialOperations={ [
          CONFIGURATION_1_OPERATIONS_1_STATES[
            CONFIGURATION_1_OPERATIONS_1_STATES.length - 200
          ],
          ...CONFIGURATION_1_OPERATIONS_1.slice(
            CONFIGURATION_1_OPERATIONS_1.length - 199
          )
        ] }
        onRequestOperations={ requestOperationsFromC1O1 }
        from={ CONFIGURATION_1_OPERATIONS_1_FROM }
        to={ CONFIGURATION_1_OPERATIONS_1_TO }
      />
    );
  })
  .add('Fully dynamic loading', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        onRequestOperations={ requestOperationsFromC1O1 }
        from={ CONFIGURATION_1_OPERATIONS_1_FROM }
        to={ CONFIGURATION_1_OPERATIONS_1_TO }
      />
    );
  })
  .add('Fully dynamic loading, irregular operations', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_2 }
        onRequestOperations={ requestOperationsFromC2O1 }
        from={ CONFIGURATION_2_OPERATIONS_1_FROM }
        to={ CONFIGURATION_2_OPERATIONS_1_TO }
        width={ createWidthKnob() }
      />
    );
  })
  .add('Fully dynamic loading, irregular operations (custom css)', () => {
    return (
      <div className='test'>
        <OperationsHistory
          entityConfiguration={ CONFIGURATION_2 }
          onRequestOperations={ requestOperationsFromC2O1 }
          from={ number('From', CONFIGURATION_2_OPERATIONS_1[500].timestamp, {
            range: true,
            min: CONFIGURATION_2_OPERATIONS_1_FROM,
            max: CONFIGURATION_2_OPERATIONS_1_TO,
            step: 1
          }) }
          to={ number('To', CONFIGURATION_2_OPERATIONS_1[1000].timestamp, {
            range: true,
            min: CONFIGURATION_2_OPERATIONS_1_FROM,
            max: CONFIGURATION_2_OPERATIONS_1_TO,
            step: 1
          }) }
          focus={ number('Focus', null) }
        />
      </div>
    );
  })
  .add('Fully dynamic loading, with width and height (custom css) ', () => {
    return (
      <div
        style={{
          display: 'flex',
          padding: '20px 100px',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          flex: '1 1 auto'
        }}
      >
        <div className='test'>
          <OperationsHistory
            entityConfiguration={ CONFIGURATION_3 }
            onRequestOperations={ requestOperationsFromC3O1 }
            from={ number('From', CONFIGURATION_3_OPERATIONS_1[500].timestamp, {
              range: true,
              min: CONFIGURATION_3_OPERATIONS_1_FROM,
              max: CONFIGURATION_3_OPERATIONS_1_TO,
              step: 1
            }) }
            to={ number('To', CONFIGURATION_3_OPERATIONS_1[1000].timestamp, {
              range: true,
              min: CONFIGURATION_3_OPERATIONS_1_FROM,
              max: CONFIGURATION_3_OPERATIONS_1_TO,
              step: 1
            }) }
            width={ 1000 }
            height={ 300 }
            focus={ number('Focus', null) }
          />
        </div>
      </div>
    );
  })
  .add('Faulty request operations callback', () => {
    return (
      <OperationsHistory
        entityConfiguration={ CONFIGURATION_1 }
        onRequestOperations={ requestOperationsBadC1 }
        from={ CONFIGURATION_1_OPERATIONS_1_TO }
        to={ CONFIGURATION_1_OPERATIONS_1_TO + 1500 }
      />
    );
  });
