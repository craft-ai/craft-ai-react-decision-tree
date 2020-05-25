import camelCase from 'camelcase';
import { computeCellWidth } from './table';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GENERATED_TIME_TYPES } from 'craft-ai/lib/constants';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled, { cx } from 'react-emotion';

function formatTimestampAsUtcDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const DD = String(date.getUTCDate())
    .padStart(2, '0');
  const MM = String(date.getUTCMonth() + 1)
    .padStart(2, '0');
  const YYYY = String(date.getUTCFullYear());
  const hh = String(date.getUTCHours())
    .padStart(2, '0');
  const mm = String(date.getUTCMinutes())
    .padStart(2, '0');
  const ss = String(date.getUTCSeconds())
    .padStart(2, '0');
  return `${DD}/${MM}/${YYYY} ${hh}:${mm}:${ss} UTC`;
}

function createPropertyCellComponent(property, renderFun) {
  const PropertyCell = renderFun;
  PropertyCell.displayName = `${camelCase(property, {
    pascalCase: true
  })}PropertyCell`;
  PropertyCell.propTypes = {
    timestamp: PropTypes.number,
    agent_id: PropTypes.string,
    operation: PropTypes.object,
    state: PropTypes.object
  };
  return PropertyCell;
}

const CustomWidthTd = styled('td')`
  width: ${({ width, isLoading }) =>
    isLoading ? width : computeCellWidth(width)}px !important;
`;

const CustomWidthTr = styled('tr')`
  width: ${({ width }) => width}px !important;
`;

function createRowCellComponent({ isGenerated, output, property, type, agentColumnWidth }) {
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
  }
  if (property === 'agent_id') {
    return createPropertyCellComponent(property, ({ agent_id }) => {
      return (
        <td style={{ width: agentColumnWidth }}>
          { agent_id }
        </td>
      );
    });
  }
  else if (
    isGenerated ||
    GENERATED_TIME_TYPES.find((generatedType) => generatedType == type)
  ) {
    return createPropertyCellComponent(property, ({ state = {} }) => {
      return (
        <CustomWidthTd
          width={ property.length }
          className='craft-property-generated-value'
        >
          {formatter(state[property])}
        </CustomWidthTd>
      );
    });
  }
  return createPropertyCellComponent(property, ({ operation = {} }) => {
    const value = operation[property];
    const isUndefined = value === undefined;
    return (
      <CustomWidthTd
        width={ property.length }
        className={ cx({
          'craft-property-undefined': isUndefined,
          'craft-property-output': output
        }) }
      >
        {isUndefined ? '-' : `${formatter(value)}`}
      </CustomWidthTd>
    );
  });
}

export default function createRowComponent({ properties, totalWidth, agentColumnWidth }) {
  const TimestampCell = createRowCellComponent({ property: 'timestamp' });
  const AgentIdCell = createRowCellComponent({ property: 'agent_id', agentColumnWidth });
  const Cells = properties.map(createRowCellComponent);
  const Row = ({ agent_id, focus, index, loading, operation, state, timestamp }) => {
    const classNames = cx({
      'craft-operation': true,
      [`${timestamp}`]: timestamp != null,
      loading: loading,
      odd: index % 2 === 1,
      even: index % 2 === 0,
      focus: focus
    });
    if (loading) {
      return (
        <CustomWidthTr width={ totalWidth } key={ index } className={ classNames }>
          <TimestampCell timestamp={ timestamp } />
          <CustomWidthTd width={ totalWidth } isLoading={ true }>
            <FontAwesomeIcon icon={ faSpinner } spin />
          </CustomWidthTd>
        </CustomWidthTr>
      );
    }
    return (
      <CustomWidthTr width={ totalWidth } key={ index } className={ classNames }>
        <TimestampCell timestamp={ timestamp } />
        {
          agent_id !== undefined ? (
            <AgentIdCell agent_id={ agent_id } />
          ) : null
        }
        {Cells.map((Cell, cellIndex) => (
          <Cell
            key={ cellIndex }
            operation={ operation }
            state={ state }
            timestamp={ timestamp }
          />
        ))}
      </CustomWidthTr>
    );
  };
  Row.defaultProps = {
    loading: false,
    focus: false,
    operation: {},
    state: {}
  };
  Row.propTypes = {
    agent_id: PropTypes.string,
    index: PropTypes.number.isRequired,
    loading: PropTypes.bool,
    focus: PropTypes.bool,
    timestamp: PropTypes.number.isRequired,
    operation: PropTypes.object,
    state: PropTypes.object
  };
  return Row;
}
