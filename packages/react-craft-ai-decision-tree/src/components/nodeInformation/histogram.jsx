import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { axisBottom, axisLeft, select as d3Select, scaleLinear } from 'd3';

const width = 200;
const height = 200;

const margin = {
  top: 10,
  down: 30,
  left: 30,
  right: 10
};

const width_ratio = 0.5;

const tooltipCssClass = css`
  position: absolute;
  text-align: center;
  margin-top: 3px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;			
  pointer-events: none;
  transform: translateX(-50%);
  padding: 1px 10px 1px 10px;
  white-space: nowrap;
`;

class Histogram extends React.Component {
  constructor(props){
    super(props);
    this.createHistogram = this.createHistogram.bind(this);
  }

  componentDidMount() {
    d3Select(this.node)
      .attr('width', width)
      .attr('height', height);

    this.fullBarWidth = (width - margin.right - margin.left) / this.props.distribution.length;
    this.barWidth = width_ratio * this.fullBarWidth;

    this.scaleX = scaleLinear()
      .domain([0, this.props.distribution.length])
      .range([margin.left, width - margin.right]);

    this.scaleY = scaleLinear()
      .domain([0, 1])
      .range([height - margin.top, margin.down]);

    this.createHistogram(this.props);

    const xAxis = axisBottom()
      .tickFormat('')
      .scale(this.scaleX);
    
    const yAxis = axisLeft()
      .scale(this.scaleY);

    d3Select(this.node)
      .append('g')
      .attr('transform', `translate(0, ${this.scaleY(0)})`)
      .call(xAxis);
    
    d3Select(this.node)
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);
  }

  componentDidUpdate() {
    this.createHistogram(this.props);
  }

  createHistogram = ({ distribution, outputValues, size }) => {
    let rect = d3Select(this.node)
      .selectAll('rect')
      .data(distribution);
    
    const scaleX = this.scaleX;
    const scaleY = this.scaleY;
    const barWidth = this.barWidth;
    const fullBarWidth = this.fullBarWidth;
    
    // Define the div for the tooltip
    const div = d3Select(this.div)
      .append('div')
      .attr('class', tooltipCssClass)	
      .style('opacity', 0);

    // Define the rectangle drawing the distribution
    rect.enter()
      .append('rect')
      .merge(rect)
      .style('fill', 'steelblue')
      .attr('x', (d, i) => scaleX(i) + (scaleX(1) - margin.left - barWidth) / 2)
      .attr('y', (d) => scaleY(d))
      .attr('width', barWidth)
      .attr('height', (d) => scaleY(0) - scaleY(d));
    
    // Define the rectangle to hover the drawn distribution
    let rectback = d3Select(this.node)
      .selectAll('fake')
      .data(distribution);

    rectback.enter()
      .append('rect')
      .merge(rectback)
      .attr('opacity', 0.0)
      .style('fill', 'steelblue')
      .attr('x', (d, i) => scaleX(i))
      .attr('y', scaleY(1))
      .attr('width', this.fullBarWidth)
      .attr('height', scaleY(0) - scaleY(1))
      .on('mouseover', function(d, i) {
        d3Select(this)
          .transition()
          .duration(100)
          .style('opacity', 0.2);
        div.transition()
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
        return div.transition()
          .duration(100)
          .style('opacity', 0);
      });
    
    rectback
      .exit()
      .remove();

    rect
      .exit()
      .remove();
  }

  render() {
    return <div ref={ (div) => this.div = div } style={{ position: 'relative' }}>
      <svg ref={ (node) => this.node = node }>
      </svg>
    </div>;
  }
}

Histogram.propTypes = {
  distribution: PropTypes.array.isRequired,
  outputValues: PropTypes.array.isRequired,
  size: PropTypes.number.isRequired
};

export default Histogram;
