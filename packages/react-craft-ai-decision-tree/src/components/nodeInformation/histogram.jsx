import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { axisLeft, axisTop, select as d3Select, scaleLinear } from 'd3';

const margin = {
  top: 30,
  bottom: 50,
  left: 40,
  right: 10
};

const barWidthRatio = 0.5;
const rectColor = 'rgb(0,178,103)';
const maxLegendCharacters = 5;

const tooltipCssClass = css`
  position: absolute;
  text-align: center;
  margin-top: 10px;
  font: 12px sans-serif;
  background: ${rectColor};
  color: white;
  border: 0px;
  border-radius: 8px;			
  pointer-events: none;
  transform: translateX(-100%);
  width: 100px;
  padding: 1px 10px 1px 10px;
  white-space: normal;
`;

class Histogram extends React.Component {
  componentDidMount() {
    // When the React Component is mounted, create the histogram
    // static elements such as axes and legend.
    // This function then returns a function to update the SVG.
    this.updateHistogram = this.createHistogram(this.props);
    this.updateHistogram(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Delegate rendering the tree to a d3 function on prop change
    this.updateHistogram(nextProps);
    // Do not allow react to render the component on prop change
    return false;
  }

  createHistogram = ({ distribution, outputValues, size, width, fullBarWidth }) => {
    const height = fullBarWidth * distribution.length;
    const barWidth = barWidthRatio * fullBarWidth;

    // Set width and height
    d3Select(this.node)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top);

    const scaleX = scaleLinear()
      .domain([0, 1])
      .range([margin.left, width + margin.left]);

    const scaleY = scaleLinear()
      .domain([0, distribution.length])
      .range([margin.top, height + margin.top]);

    const xAxis = axisTop()
      .ticks(3)
      .scale(scaleX);

    const yAxis = axisLeft()
      .tickFormat('')
      .ticks(distribution.length)
      .scale(scaleY);

    d3Select(this.node)
      .append('g')
      .attr('transform', `translate(0, ${scaleY(0)})`)
      .call(xAxis);

    d3Select(this.node)
      .append('g')
      .attr('transform', `translate(${scaleX(0)}, 0)`)
      .call(yAxis);

    d3Select(this.node)
      .selectAll('text.legend')
      .data(outputValues)
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('color', 'black')
      .attr('x', scaleX(0) - 17)
      .attr('y', (_, i) => (scaleY(i) + fullBarWidth / 2 + 4))
      .text((d) => d.length > maxLegendCharacters ? `${d.substring(0, maxLegendCharacters)}...` : d);

    const updateHistogram = ({ size: newSize, distribution: newDistribution }) => {
      // Get the tooltip div, apply style and hide it initially
      const div = d3Select(this.tooltip)
        .attr('class', tooltipCssClass)
        .style('opacity', 0);

      let histogram = d3Select(this.node)
        .selectAll('rect')
        .data(newDistribution, (d, i) => i);

      // Define the rectangle drawing the distribution
      const histEnter = histogram
        .enter()
        .append('rect')
        .style('fill', `${rectColor}`)
        .attr('x', scaleX(0))
        .attr('y', (d, i) => scaleY(i) + (scaleY(1) - margin.top - barWidth) / 2)
        .attr('width', 0)
        .attr('height', barWidth);

      const histUpdate = histEnter.merge(histogram);

      histUpdate
        .transition()
        .duration(1000)
        .attr('x', margin.left)
        .attr('y', (d, i) => scaleY(i) + (scaleY(1) - margin.top - barWidth) / 2)
        .attr('width', (d) => scaleX(d) - scaleX(0))
        .attr('height', barWidth);

      histogram
        .exit()
        .remove();

      // Define the rectangle to hover the drawn distribution
      let rectback = d3Select(this.node)
        .selectAll('rect.fake')
        .data(newDistribution, (d, i) => i);

      rectback
        .enter()
        .append('rect')
        .attr('class', 'fake')
        .attr('opacity', 0.0)
        .style('fill', `${rectColor}`)
        .attr('x', scaleX(0))
        .attr('y', (_, i) => scaleY(i))
        .attr('width', scaleX(1) - scaleX(0))
        .attr('height', fullBarWidth)
        .on('mouseover', function(d, i) {
          d3Select(this)
            .transition()
            .duration(100)
            .style('opacity', 0.2);
          div
            .transition()
            .duration(100)
            .style('opacity', 0.9);
          return div.html(`<b>${outputValues[i]}</b></br>${d.toFixed(2)}</br>${Math.floor(newSize * d)} samples`)
            .style('left', `${scaleX(1)}px`)
            .style('top', `${scaleY(i) + (fullBarWidth) / 2}px`);
        })
        .on('mouseout', function() {
          d3Select(this)
            .transition()
            .duration(100)
            .style('opacity', 0.0);
          return div
            .transition()
            .duration(100)
            .style('opacity', 0);
        });

      rectback
        .exit()
        .remove();
    };

    return updateHistogram;
  }

  getSVGRef = (node) => {
    this.node = node;
  }

  getToolTipRef = (tooltip) => {
    this.tooltip = tooltip;
  }

  render() {
    return (
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '30px' }}>
        <svg ref={ this.getSVGRef } />
        <div ref={ this.getToolTipRef } />
      </div>
    );
  }
}

Histogram.defaultProps = {
  width: 130,
  fullBarWidth: 25
};

Histogram.propTypes = {
  distribution: PropTypes.array.isRequired,
  outputValues: PropTypes.array.isRequired,
  size: PropTypes.number.isRequired,
  width: PropTypes.number,
  fullBarWidth: PropTypes.number
};

export default Histogram;
