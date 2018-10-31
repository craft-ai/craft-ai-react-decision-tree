import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import range from 'lodash.range';
import React from 'react';

class InfiniteList extends React.Component {
  constructor(props) {
    super(props);

    this.wrapperElement = null;

    this._setWrapperElement = this._setWrapperElement.bind(this);
    this._updateVisibleIndexes = debounce(
      this._updateVisibleIndexes.bind(this),
      10
    );

    const { bufferedRowCount, rowCount } = props;

    this.state = {
      renderedRowsStart: 0,
      renderedRowsEnd: Math.min(bufferedRowCount, rowCount)
    };
  }
  componentDidMount() {
    this._updateVisibleIndexes();
  }
  _setWrapperElement(element) {
    this.wrapperElement = element;
  }
  _updateVisibleIndexes() {
    const { bufferedRowCount, rowCount, rowHeight } = this.props;

    // Computing the number of row that are actually visible
    const wrapperRect = this.wrapperElement.getBoundingClientRect();
    const visibleRowCount = Math.ceil(wrapperRect.height / rowHeight);
    // Computing the index of the first visible row
    const firstVisibleRow = Math.ceil(
      this.wrapperElement.scrollTop / rowHeight
    );
    const renderedRowsStart = Math.max(firstVisibleRow - bufferedRowCount, 0);
    const renderedRowsEnd = Math.min(
      firstVisibleRow + visibleRowCount + bufferedRowCount,
      rowCount
    );
    this.setState({
      renderedRowsStart,
      renderedRowsEnd
    });
  }
  render() {
    const { renderPlaceholderRow, renderRow, rowCount, tag: Tag } = this.props;
    const { renderedRowsEnd, renderedRowsStart } = this.state;
    return (
      <Tag ref={ this._setWrapperElement } onScroll={ this._updateVisibleIndexes }>
        {/* The placeholder before the rows */}
        {renderPlaceholderRow(0, renderedRowsStart)}
        {/* The rendered rows */}
        {range(renderedRowsStart, renderedRowsEnd).map((index) =>
          renderRow(index)
        )}
        {/* The placeholder after the rows */}
        {renderPlaceholderRow(renderedRowsEnd, rowCount)}
      </Tag>
    );
  }
}

InfiniteList.defaultProps = {
  tag: 'div',
  initialRowData: [],
  bufferedRowCount: 40
};

InfiniteList.propTypes = {
  // Pass in a Component to override default button element
  // default: 'div'
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  bufferedRowCount: PropTypes.number,
  rowCount: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  renderRow: PropTypes.func.isRequired,
  renderPlaceholderRow: PropTypes.func.isRequired
};

export default InfiniteList;
