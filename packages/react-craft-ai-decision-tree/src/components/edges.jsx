import { css } from 'react-emotion';
import { select as d3Select } from 'd3';
import { NODE_HEIGHT } from '../utils/constants';
import PropTypes from 'prop-types';
import React from 'react';
import { ADDITIONAL_SELECTED_STROKE_WIDTH,
  DEFAULT_COLOR_EDGES,
  DEFAULT_MINIMUM_STROKE_WIDTH,
  DEFAULT_STROKE_WIDTH_RATIO,
  SELECTED_COLOR_EDGES } from '../utils/constants';

// make links css rules
const defaultLinksCssClass = css`
  fill: none;
  stroke: ${DEFAULT_COLOR_EDGES};
`;

const selectedLinksCssClass = css`
  fill: none;
  stroke: ${SELECTED_COLOR_EDGES};
`;

class Edges extends React.Component {
  componentDidMount() {
    // Render the tree using d3 after first component mount
    this.renderTree(
      this.props.treeData,
      this.svgTreeRef,
      this.props.nodes,
      this.props.links,
      this.props.edgePath,
      this.props.totalNbSamples,
      this.props.version,
      this.props.edgeType
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Delegate rendering the tree to a d3 function on prop change
    this.renderTree(
      nextProps.treeData,
      this.svgTreeRef,
      nextProps.nodes,
      nextProps.links,
      nextProps.edgePath,
      this.props.totalNbSamples,
      this.props.version,
      this.props.edgeType
    );

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

  refSvgTree = (input) => {
    this.svgTreeRef = input;
  };

  renderTree = (treeData, svgDomNode, nodes, links, edgePath, totalNbSamples, version, edgeType) => {
    // Cleans up the SVG on re-render
    d3Select(svgDomNode)
      .selectAll('*')
      .remove();

    let svg = d3Select(svgDomNode)
      .attr('width', this.props.width)
      .attr('height', this.props.height)
      .append('g');

    // Update the nodes…
    let node = svg.selectAll('g.node')
      .data(nodes, (d) => d.id);

    // Enter any new nodes at the parent's previous position.
    let nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeEnter.append('circle')
      .attr('r', 1);

    // Transition exiting nodes to the parent's new position.
    node
      .exit()
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .remove();

    // Update the links… (they are ordered)
    let link = svg.selectAll('path.link')
      .data(links, (d) => {
        d.linkClass = defaultLinksCssClass;
        if (edgePath.indexOf(d.target.id) !== -1) {
          d.linkClass = selectedLinksCssClass;
        }
        return d.target.id;
      });

    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert('path', 'g')
      .attr(
        'class',
        (d) =>
          `${d.linkClass} ${
            d.linkClass == selectedLinksCssClass ? 'selected-link' : ''
          }`
      )
      .attr('stroke-width', (d) => {
        if (version == 1 || (edgeType != 'relative' && edgeType != 'absolute')) {
          return d.linkClass == selectedLinksCssClass ?
            DEFAULT_MINIMUM_STROKE_WIDTH + ADDITIONAL_SELECTED_STROKE_WIDTH :
            DEFAULT_MINIMUM_STROKE_WIDTH;
        }
        else {
          // Relative ratio
          let branchRatio = d.target.nbSamples / d.source.nbSamples;
          if (edgeType == 'absolute') {
            // Absolute ratio
            branchRatio = d.source.nbSamples / totalNbSamples;
          }
          let strokeWidth = DEFAULT_STROKE_WIDTH_RATIO * branchRatio;
          strokeWidth = strokeWidth < DEFAULT_MINIMUM_STROKE_WIDTH ?
            DEFAULT_MINIMUM_STROKE_WIDTH : strokeWidth;
          if (d.linkClass == selectedLinksCssClass) {
            return strokeWidth + ADDITIONAL_SELECTED_STROKE_WIDTH;
          }
          return strokeWidth ;
        }
      })
      .attr('d', (d) => {
        const source = {
          x: d.source.x,
          y: d.source.y + (2 * NODE_HEIGHT / 3)
        };
        const target = {
          x: d.target.x,
          y: d.target.y - NODE_HEIGHT / 3
        };
        return this.diagonal(source, target);
      });

    // Transition exiting nodes to the parent's new position.
    link.exit()
      .remove();
  };

  render() {
    // Render a blank svg node
    return (
      <div style={{ width: this.props.width, height: this.props.height }}>
        <svg ref={ this.refSvgTree } />
      </div>
    );
  }
}

Edges.propTypes = {
  version: PropTypes.number.isRequired,
  edgePath: PropTypes.array.isRequired,
  treeData: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired,
  links: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  totalNbSamples: PropTypes.number,
  edgeType: PropTypes.string
};

export default Edges;
