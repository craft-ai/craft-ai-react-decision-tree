import { css } from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import { select as d3Select, scaleLinear } from 'd3';

const rectangleCssClass = css`
  stroke-width: 2;
  stroke: none;
  fill: rgba(46,204,113,0.5);
`;

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

const margin = {
  top: 5,
  down: 5,
  left: 15,
  right: 15
};

class BoxPlot extends React.Component {
  constructor(props){
    super(props);
    this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidMount() {
    const { totalMin, totalMax, width, height } = this.props;
    this.scaleX = scaleLinear()
      .domain([totalMin, totalMax])
      .range([margin.left, width - margin.right]);
    
    this.scaleY = scaleLinear()
      .domain([0, 1])
      .range([margin.top, height - margin.down]);
    
    this.scaleVal = scaleLinear()
      .domain([0, Math.abs(totalMax - totalMin)])
      .range([0, width]);

    // Add the TotalMin - TotalMax line
    d3Select(this.node)
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .attr('opacity', 0.3)
      .attr('x1', this.scaleX(totalMin))
      .attr('x2', this.scaleX(totalMax))
      .attr('y1', this.scaleY(0.5))
      .attr('y2', this.scaleY(0.5));

    // Add Total Min text
    d3Select(this.node)
      .append('text')
      .attr('y', this.scaleY(0.5) - 5)
      .attr('opacity', 0.3)
      .attr('x', this.scaleX(totalMin))
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .text((Math.round(totalMin * 100) / 100));
  
    // Add Total Max text
    d3Select(this.node)
      .append('text')
      .attr('y', this.scaleY(0.5) - 5)
      .attr('opacity', 0.3)
      .attr('x', this.scaleX(totalMax))
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .text((Math.round(totalMax * 100) / 100));
    
    // Define the div for the tooltip
    this.tooltip = d3Select(this.div)
      .append('div')	
      .attr('class', tooltipCssClass)				
      .style('opacity', 0);
  
    this.createBoxPlot(this.props);
  }

  componentDidUpdate() {
    this.createBoxPlot(this.props);
  }

  createBoxPlot = ({ mean, std, min, max, width, height }) => {
    const node = this.node;
    const scaleX = this.scaleX;
    const scaleY = this.scaleY;
    const scaleVal = this.scaleVal;
    const rectHeight = 20;

    d3Select(node)
      .selectAll('g')
      .remove();

    let container = d3Select(node)
      .append('g')
      .attr('width', width)
      .attr('height', height);
    
    // Add the min - max line
    container
      .append('line')
      .attr('stroke-width', 4)
      .attr('stroke', 'black')
      .attr('x1', scaleX(min))
      .attr('x2', scaleX(max))
      .attr('y1', scaleY(0.5))
      .attr('y2', scaleY(0.5));
    
    let minMaxTip = container
      .append('g');
    if (scaleX(max) - scaleX(min) > 20) {
      minMaxTip.append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('x1', scaleX(min))
        .attr('x2', scaleX(min))
        .attr('y1', scaleY(0.5))
        .attr('y2', scaleY(0.6));
      minMaxTip.append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('x1', scaleX(max))
        .attr('x2', scaleX(max))
        .attr('y1', scaleY(0.5))
        .attr('y2', scaleY(0.6));
      minMaxTip.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('y', scaleY(0.6) + 10)
        .attr('x', scaleX(min))
        .text((Math.round(min * 100) / 100));
      minMaxTip.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('y', scaleY(0.6) + 10)
        .attr('x', scaleX(max))
        .text((Math.round(max * 100) / 100));
    }
    else if (scaleX(max) - scaleX(min) > 0) {
      const shift = 15;
      minMaxTip.append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('x1', scaleX(min))
        .attr('x2', scaleX(min) - shift)
        .attr('y1', scaleY(0.5))
        .attr('y2', scaleY(0.6));
      minMaxTip.append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('x1', scaleX(min) - shift)
        .attr('x2', scaleX(min) - shift)
        .attr('y1', scaleY(0.6))
        .attr('y2', scaleY(0.65));

      minMaxTip.append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('x1', scaleX(max))
        .attr('x2', scaleX(max) + shift)
        .attr('y1', scaleY(0.5))
        .attr('y2', scaleY(0.6));
      minMaxTip.append('line')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('x1', scaleX(max) + shift)
        .attr('x2', scaleX(max) + shift)
        .attr('y1', scaleY(0.6))
        .attr('y2', scaleY(0.65));
      
      minMaxTip.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('y', scaleY(0.65) + 10)
        .attr('x', scaleX(min) - shift)
        .text((Math.round(min * 100) / 100));

      minMaxTip.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('y', scaleY(0.65) + 10)
        .attr('x', scaleX(max) + shift)
        .text((Math.round(max * 100) / 100));
    }

    // Add the standard deviation rectangle
    container
      .append('rect')
      .attr('class', rectangleCssClass)
      .attr('x', scaleX(mean) - scaleVal(std))
      .attr('y', (height - rectHeight) / 2)
      .attr('width', 2 * scaleVal(std))
      .attr('height', rectHeight);

    // Add the mean line
    container
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', 'coral')
      .attr('x1', scaleX(mean))
      .attr('x2', scaleX(mean))
      .attr('y1', (height - rectHeight) / 2 - 2)
      .attr('y2', (height + rectHeight) / 2 + 2);
    
    container
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('y', (height - rectHeight) / 2 - 10)
      .attr('x', scaleX(mean))
      .text((Math.round(mean * 100) / 100));
  }

  render() {
    return <div ref={ (div) => this.div = div } style={{ position: 'relative' }}>
      <svg ref={ (node) => this.node = node }>
      </svg>
    </div>;
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
  size: PropTypes.number.isRequired,
  totalMin: PropTypes.number,
  totalMax: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
};

export default BoxPlot;
