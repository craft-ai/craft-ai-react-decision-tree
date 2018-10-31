import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

const Table = styled('table')`
  border-spacing: 0px;
  border-collapse: collapse;

  thead {
    display: block;
  }
  tbody {
    display: block;
    overflow-y: scroll;
    height: ${({ height, rowHeight }) => `${height - rowHeight}px`};
  }

  tr {
    display: flex;
    flex-direction: row;
    height: ${({ rowHeight }) => `${rowHeight}px`};
  }
  th,
  td {
    flex: 1 0 auto;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 120px;
    &:first-child {
      width: 250px;
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

Table.defaultProps = {};

Table.propTypes = {
  height: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired
};

export default Table;
