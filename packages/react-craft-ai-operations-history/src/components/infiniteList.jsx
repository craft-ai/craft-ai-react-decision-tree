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

    const { bufferedCount, count, initialOffset } = props;

    this.state = {
      renderedRowsStart: Math.max(initialOffset - bufferedCount, 0),
      renderedRowsEnd: Math.min(initialOffset + bufferedCount, count)
    };
  }
  componentDidMount() {
    const { initialOffset, rowHeight } = this.props;
    // Update the scroll position
    this.wrapperElement.scrollTop = initialOffset * rowHeight;
    this._updateVisibleIndexes();
  }
  _setWrapperElement(element) {
    this.wrapperElement = element;
  }
  _updateVisibleIndexes() {
    const { bufferedCount, count, rowHeight } = this.props;

    // Computing the number of row that are actually visible
    const wrapperRect = this.wrapperElement.getBoundingClientRect();
    const visibleRowCount = Math.ceil(wrapperRect.height / rowHeight);
    // Computing the index of the first visible row
    const rowOffset = Math.ceil(this.wrapperElement.scrollTop / rowHeight);
    const renderedRowsStart = Math.max(rowOffset - bufferedCount, 0);
    const renderedRowsEnd = Math.min(
      rowOffset + visibleRowCount + bufferedCount,
      count
    );
    this.setState({
      renderedRowsEnd,
      renderedRowsStart
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.count != prevProps.count) {
      this._updateVisibleIndexes(); // Count has change, we need to refresh what's visible
    }
  }
  render() {
    const { count, renderPlaceholderRow, renderRow, tag: Tag } = this.props;
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
        {renderPlaceholderRow(renderedRowsEnd, count)}
      </Tag>
    );
  }
}

InfiniteList.defaultProps = {
  tag: 'div',
  initialOffset: 0,
  bufferedCount: 40
};

InfiniteList.propTypes = {
  // Pass in a Component to override default button element
  // default: 'div'
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  bufferedCount: PropTypes.number,
  // Index of the row that should visible be on top initially
  // default: 0
  initialOffset: PropTypes.number,
  count: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  renderRow: PropTypes.func.isRequired,
  renderPlaceholderRow: PropTypes.func.isRequired
};

export default InfiniteList;
