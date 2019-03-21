import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { select as d3Select, scaleLinear } from 'd3';

const rectangleCssClass = css`
  stroke-width: 2;
  stroke: none;
  fill: rgba(46,204,113,0.5);
`;

const basicTextCssClass = (opacity) => css`
  opacity: ${opacity};
  text-anchor: middle;
  font-size: 10px;
`;
const totalTextCssClass = basicTextCssClass(0.3);
const localTextCssClass = basicTextCssClass(1);

const basicLineCssClass = (strokeWidth) => css`
  stroke-width: ${strokeWidth};
  stroke: black;
`;

const boxPlotMargin = {
  top: 5,
  down: 5,
  left: 15,
  right: 15
};

const stdRectangleHeight = 20;

class BoxPlot extends React.Component {
  componentDidMount() {
    this.createBoxPlot(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Delegate rendering the tree to a d3 function on prop change
    this.createBoxPlot(nextProps);

    // Do not allow react to render the component on prop change
    return false;
  }

  diagonal(source, target) {
    return `M${source.x},${source.y}C${source.x},${(source.y +
      target.y) /
      2} ${target.x},${(source.y + target.y) / 2} ${target.x},${
      target.y
    }`;
  }

  createBoxPlot = ({ totalMin, totalMax, mean, std, min, max, width, height }) => {
    // Scalers 
    const scaleX = scaleLinear()
      .domain([totalMin, totalMax])
      .range([boxPlotMargin.left, width - boxPlotMargin.right]);
  
    const scaleY = scaleLinear()
      .domain([0, 1])
      .range([boxPlotMargin.top, height - boxPlotMargin.down]);
    
    // constant positions:
    const minPosX = scaleX(min);
    const maxPosX = scaleX(max);
    const middleY = scaleY(0.5);

    const scaleVal = scaleLinear()
      .domain([0, Math.abs(totalMax - totalMin)])
      .range([0, width]);

    // Since there is no animation, we clean the svg:
    d3Select(this.node)
      .selectAll('*')
      .remove();
    
    // Begin here to define the svg:
    let svg = d3Select(this.node)
      .attr('width', width)
      .attr('height', height); // identifier

    // Add the TotalMin - TotalMax line
    svg
      .append('line')
      .attr('class', basicLineCssClass(2))
      .attr('opacity', 0.3)
      .attr('x1', scaleX(totalMin))
      .attr('x2', scaleX(totalMax))
      .attr('y1', middleY)
      .attr('y2', middleY);

    // Add Total Min text
    svg
      .append('text')
      .attr('class', totalTextCssClass)
      .attr('y', middleY - 5)
      .attr('x', scaleX(totalMin))
      .text((Math.round(totalMin * 100) / 100));

    // Add Total Max text
    svg
      .append('text')
      .attr('class', totalTextCssClass)
      .attr('y', middleY - 5)
      .attr('x', scaleX(totalMax))
      .text((Math.round(totalMax * 100) / 100));

    // Add the min - max line
    svg
      .append('line')
      .attr('class', basicLineCssClass(4))
      .attr('x1', minPosX)
      .attr('x2', maxPosX)
      .attr('y1', middleY)
      .attr('y2', middleY);

    // Add lines and text to show local min/max
    if (maxPosX - minPosX > 20) {
      svg
        .append('line')
        .attr('class', basicLineCssClass(1))
        .attr('x1', minPosX)
        .attr('x2', minPosX)
        .attr('y1', middleY)
        .attr('y2', scaleY(0.6));
      svg
        .append('line')
        .attr('class', basicLineCssClass(1))
        .attr('x1', maxPosX)
        .attr('x2', maxPosX)
        .attr('y1', middleY)
        .attr('y2', scaleY(0.6));
      svg
        .append('text')
        .attr('class', localTextCssClass)
        .attr('y', scaleY(0.6) + 10)
        .attr('x', minPosX)
        .text((Math.round(min * 100) / 100));
      svg
        .append('text')
        .attr('class', localTextCssClass)
        .attr('y', scaleY(0.6) + 10)
        .attr('x', maxPosX)
        .text((Math.round(max * 100) / 100));
    }
    // If two local min/max are too close draw a bezier line and separate them more
    else if (maxPosX - minPosX > 0) {
      const shift = 15;
  
      svg
        .append('path')
        .attr('d', () => {
          const source = {
            x: minPosX + 1, // +1 for the line thickness
            y: middleY
          };
          const target = {
            x: minPosX - shift,
            y: scaleY(0.65)
          };
          return this.diagonal(source, target);
        })
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', 'black');

      svg
        .append('path', 'g')
        .attr('d', () => {
          const source = {
            x: maxPosX - 1, // -1 for the line thickness
            y: scaleY(0.5)
          };
          const target = {
            x: maxPosX + shift,
            y: scaleY(0.65)
          };
          return this.diagonal(source, target);
        })
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', 'black');

      svg
        .append('text')
        .attr('class', localTextCssClass)
        .attr('y', scaleY(0.65) + 10)
        .attr('x', minPosX - shift)
        .text((Math.round(min * 100) / 100));

      svg
        .append('text')
        .attr('class', localTextCssClass)
        .attr('y', scaleY(0.65) + 10)
        .attr('x', maxPosX + shift)
        .text((Math.round(max * 100) / 100));
    }

    // Add the standard deviation rectangle
    svg
      .append('rect')
      .attr('class', rectangleCssClass)
      .attr('x', scaleX(mean) - scaleVal(std))
      .attr('y', (height - stdRectangleHeight) / 2)
      .attr('width', 2 * scaleVal(std))
      .attr('height', stdRectangleHeight);

    // Add the mean line
    svg
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', 'coral')
      .attr('x1', scaleX(mean))
      .attr('x2', scaleX(mean))
      .attr('y1', (height - stdRectangleHeight) / 2 - 2)
      .attr('y2', (height + stdRectangleHeight) / 2 + 2);

    svg
      .append('text')
      .attr('class', localTextCssClass)
      .attr('y', (height - stdRectangleHeight) / 2 - 10)
      .attr('x', scaleX(mean))
      .text((Math.round(mean * 100) / 100));
  }

  render() {
    return <svg ref={ (node) => this.node = node }></svg>;
  }
}

BoxPlot.defaultProps = {
  width: 200,
  height: 100
};

BoxPlot.propTypes = {
  mean: PropTypes.number.isRequired,
  std: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  totalMin: PropTypes.number,
  totalMax: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
};

export default BoxPlot;
