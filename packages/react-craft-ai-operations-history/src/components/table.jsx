import React from 'react';
import styled from 'react-emotion';

const Table = styled('table')`
  border-spacing: 0px;
  border-collapse: collapse;

  tr {
    display: flex;
    flex-direction: row;
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

export default Table;
