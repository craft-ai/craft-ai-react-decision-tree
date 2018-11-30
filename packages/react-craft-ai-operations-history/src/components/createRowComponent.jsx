import camelCase from 'camelcase';
import PropTypes from 'prop-types';
import React from 'react';
import styled, { cx } from 'react-emotion';
import { extractProperties } from './headerRow';
import { GENERATED_TIME_TYPES } from 'craft-ai/lib/constants';
import { interpreter } from 'craft-ai';

function formatTimestampAsUtcDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const DD = String(date.getUTCDate()).padStart(2, '0');
  const MM = String(date.getUTCMonth() + 1).padStart(2, '0');
  const YYYY = String(date.getUTCFullYear());
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${DD}/${MM}/${YYYY} ${hh}:${mm}:${ss} UTC`;
}

function createPropertyCellComponent(property, renderFun) {
  const PropertyCell = renderFun;
  PropertyCell.displayName = `${camelCase(property, {
    pascalCase: true
  })}PropertyCell`;
  PropertyCell.propTypes = {
    timestamp: PropTypes.number.isRequired,
    operation: PropTypes.object.isRequired,
    state: PropTypes.object.isRequired
  };
  return PropertyCell;
}

function createRowCellComponent({ isGenerated, output, property, type }) {
  const formatter = interpreter.formatProperty(type);
  if (property === 'timestamp') {
    return createPropertyCellComponent(property, ({ timestamp }) => {
      return (
        <td>
          {formatTimestampAsUtcDate(timestamp)}
          <small>{timestamp}</small>
        </td>
      );
    });
  } else if (
    isGenerated ||
    GENERATED_TIME_TYPES.find((generatedType) => generatedType == type)
  ) {
    return createPropertyCellComponent(
      property,
      ({ state = {}, timestamp }) => {
        return (
          <td className="craft-property-generated-value">
            {formatter(state[property])}
          </td>
        );
      }
    );
  }
  return createPropertyCellComponent(property, ({ operation = {} }) => {
    const value = operation[property];
    const isUndefined = value == null;
    return (
      <td
        className={ cx({
          'craft-property-undefined': isUndefined,
          'craft-property-output': output
        }) }>
        {isUndefined ? '-' : formatter(value)}
      </td>
    );
  });
}

const LoadingTd = styled('td')`
  flex-grow: 1 !important;
`;

export default function createRowComponent({ agentConfiguration }) {
  const properties = extractProperties(agentConfiguration);

  const TimestampCell = createRowCellComponent({ property: 'timestamp' });
  const Cells = properties.map(createRowCellComponent);
  const Row = ({ index, loading, operation, state, timestamp }) => {
    const classNames = cx({
      'craft-operation': true,
      [`${timestamp}`]: timestamp != null,
      loading: loading,
      odd: index % 2 === 1,
      even: index % 2 === 0
    });
    if (loading) {
      return (
        <tr key={ index } className={ classNames }>
          <TimestampCell timestamp={ timestamp } />
          <LoadingTd colSpan={ properties.length }>loading...</LoadingTd>
        </tr>
      );
    }
    return (
      <tr key={ index } className={ classNames }>
        <TimestampCell timestamp={ timestamp } />
        {Cells.map((Cell, cellIndex) => (
          <Cell
            key={ cellIndex }
            operation={ operation }
            state={ state }
            timestamp={ timestamp }
          />
        ))}
      </tr>
    );
  };
  Row.defaultProps = {
    loading: false,
    operation: {},
    state: {}
  };
  Row.propTypes = {
    index: PropTypes.number.isRequired,
    loading: PropTypes.bool,
    timestamp: PropTypes.number.isRequired,
    operation: PropTypes.object,
    state: PropTypes.object
  };
  return Row;
}
