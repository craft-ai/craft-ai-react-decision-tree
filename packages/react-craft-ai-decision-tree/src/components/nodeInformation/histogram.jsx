import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { axisBottom, axisLeft, select as d3Select, scaleLinear } from 'd3';

const width = 200;
const height = 200;

const margin = {
  top: 30,
  down: 30,
  left: 30,
  right: 10
};

const width_ratio = 0.5;

const tooltipCssClass = css`
  position: absolute;			
  text-align: center;			
  width: 60px;					
  height: 28px;					
  padding: 2px;				
  font: 12px sans-serif;		
  background: lightsteelblue;	
  border: 0px;		
  border-radius: 8px;			
  pointer-events: none;			
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

    this.barWidth = width_ratio * (width - margin.right - margin.left) / this.props.distribution.length;

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

  createHistogram = ({ distribution, outputValues }) => {
    let rect = d3Select(this.node)
      .selectAll('rect')
      .data(distribution);

    // Define the div for the tooltip
    const div = d3Select('body')
      .append('div')	
      .attr('class', tooltipCssClass)				
      .style('opacity', 0);

    rect.enter()
      .append('rect')
      .merge(rect)
      .style('fill', 'steelblue')
      .attr('x', (d, i) => this.scaleX(i) + (this.scaleX(1) - margin.left - this.barWidth) / 2)
      .attr('y', (d) => this.scaleY(d))
      .attr('width', this.barWidth)
      .attr('height', (d) => this.scaleY(0) - this.scaleY(d))
      .on('mouseover', function(d, i) {
        div.transition()
          .duration(200)
          .style('opacity', 0.9);
        return div.html(`${outputValues[i]}</br>${Math.round(d * 100) / 100}`)
          .style('left', `${event.pageX}px`)		
          .style('top', `${event.pageY}px`);	
      })
      .on('mouseout', function() {
        return div.transition()
          .duration(200)
          .style('opacity', 0);
      });
    rect
      .exit()
      .remove();
  }

  render() {
    // eslint-disable-next-line react/jsx-no-bind
    return <svg ref={ (node) => this.node = node }>
    </svg>;
  }
}

Histogram.propTypes = {
  distribution: PropTypes.array.isRequired,
  outputValues: PropTypes.array.isRequired
};

export default Histogram;
