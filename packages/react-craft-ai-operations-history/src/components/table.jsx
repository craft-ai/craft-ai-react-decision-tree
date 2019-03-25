import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

export const CELL_WIDTH = 120;
export const TIMESTAMP_CELL_WIDTH = 280;

const Table = styled('table')`
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  border-spacing: 0px;
  border-collapse: collapse;

  thead {
    display: block;
    width: ${({ width }) => (width == null ? 'auto' : `${width}px`)};

    overflow-x: hidden;
  }
  tbody {
    display: block;
    height: ${({ height, rowHeight }) => `${height - rowHeight}px`};
    width: ${({ width }) => (width == null ? 'auto' : `${width}px`)};

    overflow-x: scroll;
    overflow-y: scroll;
  }

  tr {
    display: inline-flex;
    flex-direction: row;
    height: ${({ rowHeight }) => rowHeight}px;
  }
  th,
  td {
    flex: 0 0 auto;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: ${CELL_WIDTH}px;
    &:first-child {
      width: ${TIMESTAMP_CELL_WIDTH}px;
    }

    padding: 10px;
    &:last-child {
      padding-right: 17px; // Take into account the scrollbar
    }

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    small {
      font-size: 0.7em;
    }
  }
`;

Table.propTypes = {
  height: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired
};

export default Table;
