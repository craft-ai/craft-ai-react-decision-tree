import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { axisBottom, axisLeft, select as d3Select, scaleLinear } from 'd3';

const margin = {
  top: 10,
  down: 30,
  left: 30,
  right: 10
};

const barWidthRatio = 0.5;
const rectColor = 'rgb(0,178,103)';

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
  transform: translateX(-50%);
  padding: 1px 10px 1px 10px;
  white-space: nowrap;
`;

class Histogram extends React.Component {
  componentDidMount() {
    this.createHistogram(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Delegate rendering the tree to a d3 function on prop change
    this.createHistogram(nextProps);

    // Do not allow react to render the component on prop change
    return false;
  }

  createHistogram = ({ distribution, outputValues, size, width, height }) => { 
    d3Select(this.node)
      .attr('width', width)
      .attr('height', height);

    const fullBarWidth = (width - margin.right - margin.left) / distribution.length;
    const barWidth = barWidthRatio * fullBarWidth;

    const scaleX = scaleLinear()
      .domain([0, distribution.length])
      .range([margin.left, width - margin.right]);

    const scaleY = scaleLinear()
      .domain([0, 1])
      .range([height - margin.top, margin.down]);

    const xAxis = axisBottom()
      .tickFormat('')
      .ticks(distribution.length)
      .scale(scaleX);
    
    const yAxis = axisLeft()
      .ticks(3)
      .scale(scaleY);

    d3Select(this.node)
      .append('g')
      .attr('transform', `translate(0, ${scaleY(0)})`)
      .call(xAxis);
    
    d3Select(this.node)
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
    
    // Define the div for the tooltip
    const div = d3Select(this.div)
      .append('div')
      .attr('class', tooltipCssClass)	
      .style('opacity', 0);

    let histogram = d3Select(this.node)
      .selectAll('rect')
      .data(distribution, (d, i) => i);

    // Define the rectangle drawing the distribution
    const histEnter = histogram
      .enter()
      .append('rect')
      .style('fill', `${rectColor}`)
      .attr('x', (d, i) => scaleX(i) + (scaleX(1) - margin.left - barWidth) / 2)
      .attr('y', (d) => scaleY(d))
      .attr('width', barWidth)
      .attr('height', (d) => scaleY(0) - scaleY(d));
    
    const histUpdate = histEnter.merge(histogram);

    histUpdate
      .transition()
      .duration(1000)
      .attr('x', (d, i) => scaleX(i) + (scaleX(1) - margin.left - barWidth) / 2)
      .attr('y', (d) => scaleY(d))
      .attr('width', barWidth)
      .attr('height', (d) => scaleY(0) - scaleY(d));

    histogram
      .exit()
      .remove();
  
    // Define the rectangle to hover the drawn distribution
    let rectback = d3Select(this.node)
      .selectAll('rect.fake')
      .data(distribution, (d, i) => i);

    rectback
      .enter()
      .append('rect')
      .attr('class', 'fake')
      .attr('opacity', 0.0)
      .style('fill', `${rectColor}`)
      .attr('x', (d, i) => scaleX(i))
      .attr('y', scaleY(1))
      .attr('width', fullBarWidth)
      .attr('height', scaleY(0) - scaleY(1))
      .on('mouseover', function(d, i) {
        d3Select(this)
          .transition()
          .duration(100)
          .style('opacity', 0.2);
        div
          .transition()
          .duration(100)
          .style('opacity', 0.9);
        return div.html(`${outputValues[i]}</br>${Math.round(d * 100) / 100}</br>${Math.floor(size * d)} samples`)
          .style('left', `${scaleX(i) + (fullBarWidth) / 2}px`)		
          .style('top', `${scaleY(0)}px`);	
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
  }

  render() {
    return (
      <div ref={ (div) => this.div = div } style={{ position: 'relative', display: 'inline-block' }}>
        <svg ref={ (node) => this.node = node } />
      </div>
    );
  }
}

Histogram.defaultProps = {
  width: 200,
  height: 200
};

Histogram.propTypes = {
  distribution: PropTypes.array.isRequired,
  outputValues: PropTypes.array.isRequired,
  size: PropTypes.number.isRequired,
  width: PropTypes.number,
  height: PropTypes.number  
};

export default Histogram;
