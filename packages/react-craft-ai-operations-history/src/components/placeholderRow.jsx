import PropTypes from 'prop-types';
import React from 'react';
import { css, cx } from 'react-emotion';

const PlaceholderRow = ({ rowCount, rowHeight }) => {
  if (rowCount > 0) {
    return (
      <tr
        className={cx(
          'craft-operations-placeholder',
          css`
            height: ${rowCount * rowHeight}px !important;
          `
        )}
      />
    );
  }
  return null;
};

PlaceholderRow.propTypes = {
  rowCount: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired
};

export default PlaceholderRow;
