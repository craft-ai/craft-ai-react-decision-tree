import { css } from 'react-emotion';
import { select as d3Select, interpolate, arc } from 'd3';
import PropTypes from 'prop-types';
import React from 'react';
import { ADDITIONAL_SELECTED_STROKE_WIDTH,
  DEFAULT_COLOR_EDGES,
  DEFAULT_MINIMUM_STROKE_WIDTH,
  DEFAULT_STROKE_WIDTH_RATIO,
  SELECTED_COLOR_EDGES,
  NODE_HEIGHT,
  NODE_WIDTH,
  COLOR_NODES } from '../utils/constants';

// make links css rules
const defaultLinksCssClass = css`
  position: relative;
  fill: none;
  stroke: ${DEFAULT_COLOR_EDGES};
`;

const selectedLinksCssClass = css`
  position: relative;
  fill: none;
  stroke: ${SELECTED_COLOR_EDGES};
`;


const TRANSITION_DURATION = 1000;

class Edges extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: undefined
    };
  }

  expand(node) {
    node.children = node._children;
    node._children = null;
    this.props.onClickNode();
    if (node.children !== undefined) {
      node.children.map((n) => this.expand(n));
    }
  }

  onClickExpand(node) {
    if (!_.isNull(node.children)) {
      node._children = node.children;
      node.children = null;
      this.setState({
        selectedNode: node
      });
      this.props.onClickNode(node);  
    }
    else {
      node.children = node._children;
      node._children = null;
      this.setState({
        selectedNode: {
          x: node.x,
          y: node.y
        }
      });
      this.props.onClickNode(node);
    }      
  }

  componentDidMount() {
    // Render the tree using d3 after first component mount
    this.renderTree(
      this.props.treeData,
      this.props.nodes,
      this.props.links,
      this.props.edgePath,
      this.props.totalNbSamples,
      this.props.version,
      this.props.edgeType
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextState);
    // Delegate rendering the tree to a d3 function on prop change
    this.renderTree(
      nextProps.treeData,
      nextProps.nodes,
      nextProps.links,
      nextProps.edgePath,
      this.props.totalNbSamples,
      this.props.version,
      this.props.edgeType,
      nextProps.width,
      nextProps.height
    );

    // Do not allow react to render the component on prop change
    return true;
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

  renderTree = (treeData, svgDomNode, nodes, links, edgePath, totalNbSamples, version, edgeType, width, height) => {
    const selectedNode = this.state.selectedNode;
    console.log('clicked', this.state.selectedNode);
    d3Select(svgDomNode)
      .attr('width', width)
      .attr('height', height);
  
    // Update the links… (they are ordered)
    let nodesSvg = d3Select(svgDomNode)
      .selectAll('g.node')
      .data(nodes, (d) => d.id);
    
    let nodeEnter = nodesSvg
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('opacity', 0.5)
      .attr('transform', (d) => {
        if (selectedNode) {
          return `translate(${selectedNode.x},${selectedNode.y})`;
        }
        else {
          if (d.parent) {
            return `translate(${d.parent.x},${d.parent.y})`;
          }
          return `translate(${d.x},${d.y})`;
        }
      });

    // UPDATE
    let nodesUpdate = nodeEnter.merge(nodesSvg);
    
    nodesUpdate.transition()
      .duration(TRANSITION_DURATION)
      .attr('opacity', 1)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeEnter.append('rect')
      .attr('x', -NODE_WIDTH / 2) 
      .attr('y', -NODE_HEIGHT / 2)
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .attr('fill', COLOR_NODES)
      .on('click', (d) => this.onClickExpand(d));
    
    nodesSvg.exit()
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('transform', (d) => {
        return `translate(${selectedNode.x},${selectedNode.y})`;
      })
      .attr('opacity', 0.5)
      .remove();

    // Update the links… (they are ordered)
    let link = d3Select(svgDomNode)
      .selectAll('path')
      .data(links, (d) => {
        d.linkClass = defaultLinksCssClass;
        if (edgePath.indexOf(d.target.id) !== -1) {
          d.linkClass = selectedLinksCssClass;
        }
        return d.target.id;
      });
    
    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .append('path')
      .attr(
        'class',
        (d) => {
          return `${d.linkClass} ${
            d.linkClass == selectedLinksCssClass ? 'selected-link' : ''
          }`;
        }
      )
      .attr('stroke-width', (d) => {
        if (version == 1 || edgeType == 'constant') {
          return d.linkClass == selectedLinksCssClass ?
            DEFAULT_MINIMUM_STROKE_WIDTH + ADDITIONAL_SELECTED_STROKE_WIDTH :
            DEFAULT_MINIMUM_STROKE_WIDTH;
        }
        else if (edgeType == 'absolute' || edgeType == 'relative') {
          // Relative ratio
          let branchRatio = d.target.nbSamples / d.source.nbSamples;
          if (edgeType == 'absolute') {
            // Absolute ratio
            branchRatio = d.target.nbSamples / totalNbSamples;
          }
          const strokeWidth = DEFAULT_STROKE_WIDTH_RATIO * branchRatio < DEFAULT_MINIMUM_STROKE_WIDTH ?
            DEFAULT_MINIMUM_STROKE_WIDTH : DEFAULT_STROKE_WIDTH_RATIO * branchRatio;
          if (d.linkClass == selectedLinksCssClass) {
            return strokeWidth + ADDITIONAL_SELECTED_STROKE_WIDTH;
          }
          return strokeWidth ;
        }
        else {
          throw new Error(
            'Unexpected edgeType variable, only \'constant\', \'relative\' or \'absolute\' values are accepted.'
          );
        }
      })
      .attr('opacity', 0)
      .attr('d', (d) => {
        let source = {
          x: d.source.x,
          y: d.source.y + NODE_HEIGHT / 2
        };
        if (selectedNode) {
          source = {
            x: selectedNode.x,
            y: selectedNode.y + NODE_HEIGHT / 2
          };
        }
        return this.diagonal(source, source);
      });
    
    let linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
      .duration(TRANSITION_DURATION)
      .attr('opacity', 1)
      .attr('d', (d) => {
        const source = {
          x: d.source.x,
          y: d.source.y + NODE_HEIGHT / 2
        };
        const target = {
          x: d.target.x,
          y: d.target.y - NODE_HEIGHT / 2
        };
        return this.diagonal(source, target);
      });
   
    // Transition exiting nodes to the parent's new position.
    link.exit()
      .transition()
      .duration(TRANSITION_DURATION)
      .delay((d) => 1 / d.target.depth)
      .attr('d', (d) => {
        const source = {
          x: selectedNode.x,
          y: selectedNode.y + NODE_HEIGHT / 2
        };
        return this.diagonal(source, source);
      })
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
  edgeType: PropTypes.string,
  onClickNode: PropTypes.func
};

export default Edges;
