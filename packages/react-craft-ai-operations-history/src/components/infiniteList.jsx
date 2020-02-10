import debounce from 'lodash.debounce';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import range from 'lodash.range';
import React from 'react';
import styled from 'react-emotion';

const memoizedCreateBaseComponent = memoizeOne((tag) => {
  const Base = styled(tag)`
    overflow-y: scroll;
  `;
  return Base;
});

class InfiniteList extends React.Component {
  constructor(props) {
    super(props);

    this.wrapperElement = null;

    this._setWrapperElement = this._setWrapperElement.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._handleVerticalScroll = debounce(
      this._handleVerticalScroll.bind(this),
      10
    );
    this._handleResize = debounce(this._handleResize.bind(this), 10);

    const { rowHeight, scrollToIndex } = props;

    this.state = {
      scrollTop: scrollToIndex != null ? scrollToIndex * rowHeight : 0,
      visibleHeight: 0
    };
  }

  _setWrapperElement(element) {
    this.wrapperElement = element;
  }

  _onScroll(e) {
    const { onHorizontalScroll } = this.props;
    const { scrollLeft, scrollTop } = this.wrapperElement;
    if (onHorizontalScroll) {
      onHorizontalScroll(scrollLeft);
    }
    this._handleVerticalScroll(scrollTop);
  }

  _handleVerticalScroll(scrollTop) {
    this.setState({
      scrollTop
    });
  }

  _handleResize() {
    this.setState({
      visibleHeight: this.wrapperElement.getBoundingClientRect().height
    });
  }

  componentDidMount() {
    // Update the scroll position
    const { scrollTop } = this.state;
    this.wrapperElement.scrollTop = scrollTop;

    // Listen for potential component resize
    this._handleResize();
    window.addEventListener('resize', this._handleResize);
  }

  componentWillUnmount() {
    // Remove the component resizing events
    window.removeEventListener('resize', this._handleResize);
  }

  componentDidUpdate(prevProps) {
    const { rowHeight, scrollToIndex } = this.props;
    if (scrollToIndex != prevProps.scrollToIndex && scrollToIndex != null) {
      const newScrollTop = scrollToIndex * rowHeight;
      this.wrapperElement.scrollTop = newScrollTop;
      this.setState({
        scrollTop: newScrollTop
      });
    }
  }

  render() {
    const {
      bufferedCount,
      className,
      count,
      renderPlaceholderRow,
      renderRow,
      rowHeight,
      tag
    } = this.props;

    const Base = memoizedCreateBaseComponent(tag);

    const { scrollTop, visibleHeight } = this.state;

    const rowOffset = Math.min(Math.ceil(scrollTop / rowHeight), count - 1);
    const visibleCount = Math.ceil(visibleHeight / rowHeight);

    // Computing the index of the first visible row
    const renderedRowsStart = Math.max(rowOffset - bufferedCount, 0);
    const renderedRowsEnd = Math.min(
      rowOffset + visibleCount + bufferedCount,
      count
    );

    return (
      <Base
        className={ className }
        innerRef={ this._setWrapperElement }
        onScroll={ this._onScroll }
      >
        {/* The placeholder before the rows */}
        {renderPlaceholderRow(0, renderedRowsStart)}
        {/* The rendered rows */}
        {range(renderedRowsStart, renderedRowsEnd)
          .map((index) =>
            renderRow(index)
          )}
        {/* The placeholder after the rows */}
        {count > renderedRowsEnd
          ? renderPlaceholderRow(renderedRowsEnd, count)
          : null}
      </Base>
    );
  }
}

InfiniteList.defaultProps = {
  className: '',
  tag: 'div',
  scrollToIndex: null,
  onHorizontalScroll: undefined,
  bufferedCount: 500
};

InfiniteList.propTypes = {
  // Pass in a Component to override default button element
  // default: 'div'
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string,
  bufferedCount: PropTypes.number,
  // Index of the row that should visible be on top
  // default: undefined
  scrollToIndex: PropTypes.number,
  onHorizontalScroll: PropTypes.func,
  count: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  renderRow: PropTypes.func.isRequired,
  renderPlaceholderRow: PropTypes.func.isRequired
};

export default InfiniteList;
