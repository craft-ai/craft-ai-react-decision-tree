import PropTypes from 'prop-types';
import React from 'react';
import { select as d3Select } from 'd3-selection';

class Edges extends React.Component {
  componentDidMount() {
    // Render the tree using d3 after first component mount
    this.renderTree(this.props.treeData, this.svgTreeRef, this.props.nodes, this.props.links);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Delegate rendering the tree to a d3 function on prop change
    this.renderTree(nextProps.treeData, this.svgTreeRef, nextProps.nodes, nextProps.links);

    // Do not allow react to render the component on prop change
    return false;
  }

  diagonal(d) {
    return `M${d.source.x},${d.source.y}C${d.source.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${d.target.y}`;
  }

  refSvgTree = (input) => {
    this.svgTreeRef = input;
  }

  renderTree = (treeData, svgDomNode, nodes, links) => {
    // Cleans up the SVG on re-render
    d3Select(svgDomNode).selectAll('*').remove();

    let svg = d3Select(svgDomNode)
      .attr('width', this.props.width)
      .attr('height', this.props.height)
      .append('g');

    let i = 0;

    // Update the nodes…
    let node = svg.selectAll('g.node')
      .data(nodes, (d) => d.id || (d.id = ++i));

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeEnter.append('circle')
      .attr('r', 1);

    // Transition exiting nodes to the parent's new position.
    node.exit()
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .remove();

    // Update the links…
    let link = svg.selectAll('path.link')
      .data(links, (d) => d.target.id);

    // Enter any new links at the parent's previous position.
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', this.diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit()
      .remove();
  }

  render() {
    // Render a blank svg node
    return (
      <div style={{ width: this.props.width, height: this.props.height }}>
        <svg ref={ this.refSvgTree }></svg>
      </div>
    );
  }
}

Edges.propTypes = {
  treeData: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number
};

export default Edges;
