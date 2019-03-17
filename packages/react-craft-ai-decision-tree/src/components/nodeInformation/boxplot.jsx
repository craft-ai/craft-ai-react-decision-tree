import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { select as d3Select, event, scaleLinear } from 'd3';

const rectangleCssClass = css`
  stroke-width: 2;
  stroke: black;
  fill: rgba(46,204,113,0.5);
`;

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

class BoxPlot extends React.Component {
  constructor(props){
    super(props);
    this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidMount() {
    this.createBoxPlot(this.props);
  }

  componentDidUpdate() {
    this.createBoxPlot(this.props);
  }

  createBoxPlot = ({ mean, std, min, max, totalMin, totalMax }) => {
    const width = 200;
    const height = 25;
    const margin = 15;

    const node = this.node;
    const scaleX = scaleLinear()
      .domain([totalMin, totalMax])
      .range([margin, width - margin]);
    
    const scaleVal = scaleLinear()
      .domain([0, Math.abs(totalMax - totalMin)])
      .range([0, width]);
    
    d3Select(node)
      .selectAll('*')
      .data(this.props)
      .exit()
      .remove();
    
    d3Select(node)
      .selectAll('*')
      .data(this.props)
      .enter();

    d3Select(node)
      .attr('width', width)
      .attr('height', height);
    
    // Add the TotalMin - TotalMax line
    d3Select(node)
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .attr('x1', scaleX(totalMin))
      .attr('x2', scaleX(totalMax))
      .attr('y1', height / 2)
      .attr('y2', height / 2);

    // Add Total Min text
    d3Select(node)
      .append('text')
      .attr('y', height)
      .attr('x', scaleX(totalMin))
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .text((Math.round(totalMin * 100) / 100));
    
    // Add Total Max text
    d3Select(node)
      .append('text')
      .attr('y', height)
      .attr('x', scaleX(totalMax))
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .text((Math.round(totalMax * 100) / 100));
    
    // Add the min - max line
    d3Select(node)
      .append('line')
      .attr('stroke-width', 4)
      .attr('stroke', 'black')
      .attr('x1', scaleX(min))
      .attr('x2', scaleX(max))
      .attr('y1', height / 2)
      .attr('y2', height / 2);
    
    // Add the standard deviation rectangle
    d3Select(node)
      .append('rect')
      .attr('class', rectangleCssClass)
      .attr('x', scaleX(mean) - scaleVal(std))
      .attr('y', 0)
      .attr('width', 2 * scaleVal(std))
      .attr('height', height);

    // Define the div for the tooltip
    const div = d3Select('body')
      .append('div')	
      .attr('class', tooltipCssClass)				
      .style('opacity', 0);

    // Add the mean line
    d3Select(node)
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', 'coral')
      .attr('x1', scaleX(mean))
      .attr('x2', scaleX(mean))
      .attr('y1', 0)
      .attr('y2', height)
      .on('mouseover', function() {
        div.transition()
          .duration(200)
          .style('opacity', 0.9);
        return div.html(`mean<br/>${Math.round(mean * 100) / 100}`)
          .style('left', `${event.pageX}px`)		
          .style('top', `${event.pageY}px`);	
      })
      .on('mouseout', function() {
        return div.transition()
          .duration(200)
          .style('opacity', 0);
      });

    d3Select(node)
      .exit()
      .remove();
  }

  render() {
    // eslint-disable-next-line react/jsx-no-bind
    return <svg ref={ (node) => this.node = node }>
    </svg>;
  }
}

BoxPlot.propTypes = {
  mean: PropTypes.number.isRequired,
  std: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  totalMin: PropTypes.number,
  totalMax: PropTypes.number
};

export default BoxPlot;
