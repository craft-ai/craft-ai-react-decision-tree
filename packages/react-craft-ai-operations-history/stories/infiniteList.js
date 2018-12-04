import InfiniteList from '../src/components/infiniteList.jsx';
import memoizeOne from 'memoize-one';
import palette from 'google-palette';
import React from 'react';
import styled, { css } from 'react-emotion';
import { boolean, number, withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

const createRenderRow = memoizeOne((rowHeight) => {
  const rowPaletteSize = 50;
  const rowPalette = palette('mpn65', rowPaletteSize);
  const Row = styled('div')`
    height: ${rowHeight}px;
    line-height: ${rowHeight}px;
    text-align: center;
    color: white;
    background-color: #${({ index }) => rowPalette[index % rowPaletteSize]};
  `;

  /* eslint react/display-name: 0 */
  return (index) => (
    <Row index={ index } key={ index }>
      {index}
    </Row>
  );
});

const createRenderPlaceholderRow = memoizeOne((rowHeight) => {
  const PlaceholderRow = styled('div')`
    height: ${({ count }) => rowHeight * count}px;
    background-color: white;
    border: red 10px solid;
  `;

  return (from, to) => {
    if (from == to) {
      return null;
    } else {
      return <PlaceholderRow key={ from } count={ to - from } />;
    }
  };
});

storiesOf('InfiniteList', module)
  .addDecorator(withKnobs)
  .add('div', () => {
    const count = number('Count', 500, {
      range: true,
      min: 10,
      max: 1000,
      step: 1
    });
    const enableScrollToIndex = boolean('Enable ScrollToIndex', false);
    const scrollToIndex = number('ScrollToIndex', 0, {
      range: true,
      min: 0,
      max: 1000,
      step: 1
    });
    const height = number('Height', 600, {
      range: true,
      min: 60,
      max: 1000,
      step: 1
    });
    const rowHeight = number('Row Height', 45, {
      range: true,
      min: 40,
      max: 300,
      step: 1
    });
    const renderRow = createRenderRow(rowHeight);
    const renderPlaceholderRow = createRenderPlaceholderRow(rowHeight);
    return (
      <InfiniteList
        className={ css`
          height: ${height}px;
          ::-webkit-scrollbar {
            -webkit-appearance: none;
            width: 10px;
          }

          ::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: rgba(0, 0, 0, 0.5);
            -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
          }
        ` }
        tag="div"
        rowHeight={ rowHeight }
        renderRow={ renderRow }
        renderPlaceholderRow={ renderPlaceholderRow }
        scrollToIndex={
          enableScrollToIndex ? Math.min(scrollToIndex, count - 1) : null
        }
        count={ count }
      />
    );
  });
