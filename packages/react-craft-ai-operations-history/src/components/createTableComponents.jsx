import camelCase from 'camelcase';
import orderBy from 'lodash.orderby';
import PropTypes from 'prop-types';
import React from 'react';
import styled, { cx } from 'react-emotion';
import { GENERATED_TIME_TYPES } from 'craft-ai/lib/constants';
import { interpreter, Time } from 'craft-ai';

function createHeaderComponent(properties) {
  const HeaderCell = ({ output, property }) => (
    <th>
      {property}
      {output ? <small>output</small> : void 0}
    </th>
  );
  HeaderCell.propTypes = {
    property: PropTypes.string.isRequired,
    output: PropTypes.bool.isRequired
  };
  const Header = ({ className }) => (
    <tr className={ className }>
      <th>timestamp</th>
      {properties.map((property, index) => (
        <HeaderCell key={ index } { ...property } />
      ))}
    </tr>
  );
  Header.propTypes = {
    className: PropTypes.string
  };
  return Header;
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

function createRowCellComponent({
  isGenerated,
  output,
  property,
  timezone,
  type
}) {
  const formatter = interpreter.formatProperty(type);
  if (property === 'timestamp') {
    return createPropertyCellComponent(property, ({ timestamp }) => {
      return (
        <td>
          {new Date(timestamp * 1000).toUTCString()}
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
        const operationTz = state[timezone];
        return (
          <td className="craft-property-generated-value">
            {formatter(Time(timestamp, operationTz))}
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

function createRowComponent(properties) {
  const TimestampCell = createRowCellComponent({ property: 'timestamp' });
  const Cells = properties.map(createRowCellComponent);
  const Row = ({ index, operation = {}, state = {}, timestamp }) => (
    <tr
      key={ index }
      className={ cx({
        'craft-operation': true,
        [`${index}`]: true,
        odd: index % 2 == 1,
        even: index % 2 == 1
      }) }>
      <TimestampCell
        operation={ operation }
        state={ state }
        timestamp={ timestamp }
      />
      {Cells.map((Cell, index) => (
        <Cell
          key={ index }
          operation={ operation }
          state={ state }
          timestamp={ timestamp }
        />
      ))}
    </tr>
  );
  Row.propTypes = {
    timestamp: PropTypes.number.isRequired,
    operation: PropTypes.object,
    state: PropTypes.object,
    index: PropTypes.number.isRequired
  };
  return Row;
}

const PlaceholderRowTr = styled('tr')`
  height: ${({ height }) => height}px !important;
`;

const PlaceholderRow = ({ rowCount, rowHeight }) => {
  if (rowCount > 0) {
    return (
      <PlaceholderRowTr
        className="craft-operations-placeholder"
        height={ rowCount * rowHeight }
      />
    );
  }
  return null;
};

PlaceholderRow.propTypes = {
  rowHeight: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired
};

function createTableComponents(agentConfiguration) {
  const properties = Object.keys(agentConfiguration.context).map(
    (property) => ({
      property,
      ...agentConfiguration.context[property],
      output: !!agentConfiguration.output.find(
        (outputProperty) => outputProperty === property
      )
    })
  );

  const sortedProperties = orderBy(properties, ['output', 'property']);

  return {
    Header: createHeaderComponent(sortedProperties),
    Row: createRowComponent(sortedProperties),
    PlaceholderRow
  };
}

export default createTableComponents;
