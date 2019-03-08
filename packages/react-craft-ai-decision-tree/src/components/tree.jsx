import _ from 'lodash';
import Box from '../utils/box';
import { cx } from 'react-emotion';
import Edges from './edges';
import Nodes from './nodes';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {
  event as d3Event,
  hierarchy as d3Hierarchy,
  select as d3Select,
  tree as d3Tree,
  zoom as d3Zoom,
  zoomIdentity
} from 'd3';
import {
  MARGIN,
  NODE_DEPTH,
  NODE_HEIGHT,
  NODE_WIDTH,
  NODE_WIDTH_MARGIN,
  ZOOM_EXTENT
} from '../utils/constants';

function computeFitTransformation(
  treeBbox,
  canvasBbox,
  prevTransformation,
  scaleExtent = ZOOM_EXTENT
) {
  // from https://developer.mozilla.org/en/docs/Web/SVG/Attribute/transform
  // worldX = localX * scaleX + translateX
  // <=>
  // localX = (worldX - translateX) / scaleX

  // 1 - Compute the scales to apply to have the tree match the canvas.
  const scaleX =
    (canvasBbox.delta.x * prevTransformation.scale) / treeBbox.delta.x;
  const scaleY =
    (canvasBbox.delta.y * prevTransformation.scale) / treeBbox.delta.y;
  const scale = Math.max(
    scaleExtent[0],
    Math.min(Math.min(scaleX, scaleY, scaleExtent[1]))
  );

  // 2 - Compute the translation to apply to have the center of the two bbox match
  // canvasCenterX = treeCenterWorldX
  // <=>
  // canvasCenterX = treeCenterLocalX * scaleX + translateX
  // <=>
  // canvasCenterX = (treeCenterPrevWorldX - prevTranslateX) / prevScaleX * scaleX + translateX
  // <=>
  // canvasOriginX + canvasDeltaX / 2 = (treeOriginPrevWorldX + treeDeltaPrevWorldX / 2 - prevTranslateX) / prevScaleX * scaleX + translateX
  // <=>
  // translateX = canvasOriginX + canvasDeltaX / 2 - (treeOriginPrevWorldX + treeDeltaPrevWorldX / 2 - prevTranslateX) / prevScaleX * scaleX
  const translate = [
    canvasBbox.origin.x +
      canvasBbox.delta.x / 2 -
      ((treeBbox.origin.x +
        treeBbox.delta.x / 2 -
        prevTransformation.newPos[0]) /
        prevTransformation.scale) *
        scale,
    canvasBbox.origin.y +
      canvasBbox.delta.y / 2 -
      ((treeBbox.origin.y +
        treeBbox.delta.y / 2 -
        prevTransformation.newPos[1]) /
        prevTransformation.scale) *
        scale
  ];

  return {
    scale: scale,
    newPos: translate
  };
}

const TreeCanvas = styled('div')`
  min-width: 400px;
  overflow: hidden;
  background-color: white;
  position: absolute;
`;

function computeSvgSizeFromData(root) {
  const tree = d3Tree()
    .nodeSize([NODE_WIDTH + NODE_WIDTH_MARGIN, NODE_HEIGHT]);
  let nodes = d3Hierarchy(root, (d) => d.children);
  tree(nodes);
  const links = nodes.links();

  let dxMin;
  let dxMax;
  let maxTreeDepth = 0;
  let minSvgWidth;
  let minSvgHeight;
  let incr = 0;

  // Compute the max tree depth(node which is the lowest leaf)
  const enrichTreeRecursive = (index, node) => {
    node.id = incr++;
    // Deal with decision rules
    if (node.parent) {
      node.treeNodeIdPath = _.clone(node.parent.treeNodeIdPath);
      node.treeNodeIdPath.push(node.id);
      node.treePath = `${node.parent.treePath}${index}`;
      node.decisionRules = _.isEmpty(node.parent.decisionRules)
        ? {}
        : _.cloneDeep(node.parent.decisionRules);
      // adding decision rules of the node
      if (node.decisionRules[node.data.decision_rule.property]) {
        node.decisionRules[node.data.decision_rule.property].push({
          operator: node.data.decision_rule.operator,
          operand: node.data.decision_rule.operand
        });
      }
      else {
        node.decisionRules[node.data.decision_rule.property] = [
          {
            operator: node.data.decision_rule.operator,
            operand: node.data.decision_rule.operand
          }
        ];
      }
    }
    else {
      // root node
      node.treeNodeIdPath = [node.id];
      node.treePath = `${index}`;
    }

    if (node.depth > maxTreeDepth) {
      maxTreeDepth = node.depth;
    }

    // Normalize for fixed-depth.
    node.y = node.depth * NODE_DEPTH;

    if (_.isUndefined(dxMin) || node.x < dxMin) {
      dxMin = node.x;
    }
    if (_.isUndefined(dxMax) || node.x > dxMax) {
      dxMax = node.x;
    }

    if (node.children) {
      node.children.map((child, childIndex) => {
        return enrichTreeRecursive(childIndex, child);
      });
    }
    return node;
  };

  nodes = enrichTreeRecursive(0, nodes);

  minSvgHeight = (maxTreeDepth + 1) * NODE_DEPTH;
  minSvgWidth = Math.abs(dxMin) + Math.abs(dxMax) + NODE_WIDTH;

  return {
    minSvgWidth: minSvgWidth,
    minSvgHeight: minSvgHeight,
    nodes: nodes.descendants(),
    links: links,
    offsetX: Math.abs(dxMin) + NODE_WIDTH / 2
  };
}

class Tree extends React.Component {
  constructor(props) {
    super(props);

    const { links, nodes, minSvgHeight, minSvgWidth } = this.computeTree();

    this.state = {
      newPos: this.props.position,
      scale: this.props.scale === -1 ? 1 : this.props.scale,
      isPanActivated: false,
      selectedEdgePath: [],
      nodes,
      links,
      minSvgHeight,
      minSvgWidth
    };
  }

  zoom = d3Zoom();

  translatedTreeRef = null;

  componentDidMount() {
    const selection = d3Select('div.zoomed-tree');
    selection
      .call(
        this.zoom
          .scaleExtent(ZOOM_EXTENT)
          .on('zoom', this.mouseWheel)
          .on('start', this.onPanningActivated)
          .on('end', this.onPanningDeactivated)
      )
      .on('dblclick.zoom', null);
    if (this.props.scale == -1) {
      this.resetPosition();
    }
    else {
      const selection = d3Select('div.zoomed-tree');
      selection.call(
        this.zoom.transform,
        zoomIdentity
          .translate(this.state.newPos[0], this.state.newPos[1])
          .scale(this.state.scale)
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this.fitToScreenTimeout);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.treeData !== this.props.treeData) {
      this.setState(this.computeTree());
    }
  }

  computeTree = () => {
    let root = this.props.treeData;
    root.x = 0;
    root.y = 0;

    const {
      links,
      minSvgHeight,
      minSvgWidth,
      nodes,
      offsetX
    } = computeSvgSizeFromData(root);

    // place correctly the tree in the svg with the minSvgWidth
    _.forEach(nodes, (d) => {
      d.x = d.x + offsetX;
      d.y = d.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
    });

    return { links, minSvgHeight, minSvgWidth, nodes };
  };

  mouseWheel = () => {
    this.setState({
      scale: d3Event.transform.k,
      newPos: [d3Event.transform.x, d3Event.transform.y]
    });
    if (this.props.updatePositionAndZoom) {
      this.props.updatePositionAndZoom(this.state.newPos, this.state.scale);
    }
  };

  doFitToScreen = () => {
    const canvasBbox = new Box(
      d3Select('div.zoomed-tree')
        .node()
        .getBoundingClientRect()
    );
    const marginedCanvasBbox = canvasBbox.applyMargin(MARGIN);
    const treeBbox = new Box(
      d3Select('div.translated-tree')
        .node()
        .getBoundingClientRect()
    );
    const { newPos, scale } = computeFitTransformation(
      treeBbox,
      marginedCanvasBbox,
      this.state
    );
    this.setState({ newPos, scale });
    const selection = d3Select('div.zoomed-tree');
    selection.call(
      this.zoom.transform,
      zoomIdentity.translate(newPos[0], newPos[1])
        .scale(scale)
    );
  };

  resetPosition = () => {
    this.doFitToScreen();
    this.fitToScreenTimeout = setTimeout(() => this.doFitToScreen(), 0);
  };

  onPanningActivated = () => {
    if (!this.state.isPanActivated) {
      this.setState({ isPanActivated: true });
    }
  };

  onPanningDeactivated = () => {
    if (this.state.isPanActivated) {
      this.setState({ isPanActivated: false });
    }
  };

  getTranslatedTreeRef = (input) => {
    this.translatedTreeRef = input;
  };

  highlightSelectedEdgePath = (selectedEdgePath) => {
    this.setState({ selectedEdgePath });
  };

  render() {
    const panActivated = this.state.isPanActivated;
    const { links, minSvgHeight, minSvgWidth, nodes } = this.state;
    return (
      <TreeCanvas
        onDoubleClick={ this.resetPosition }
        className="tree zoomed-tree"
        style={{
          height: this.props.height,
          width: this.props.width
        }}
      >
        <div
          ref={ this.getTranslatedTreeRef }
          onDoubleClick={ this.resetPosition }
          className={ 'translated-tree' }
          style={{
            transformOrigin: 'left top 0px',
            transform: `translate(${this.state.newPos[0]}px,${
              this.state.newPos[1]
            }px) scale(${this.state.scale})`,
            width: minSvgWidth,
            height: minSvgHeight
          }}
        >
          <Nodes
            version={ this.props.version }
            selectable={ !panActivated }
            height={ this.props.height }
            configuration={ this.props.configuration }
            nodes={ nodes }
            links={ links }
            highlightSelectedEdgePath={ this.highlightSelectedEdgePath }
            updateSelectedNode={ this.props.updateSelectedNode }
          />
          <Edges
            edgePath={ this.state.selectedEdgePath }
            treeData={ this.props.treeData }
            nodes={ nodes }
            links={ links }
            width={ minSvgWidth }
            height={ minSvgHeight }
          />
        </div>
      </TreeCanvas>
    );
  }
}

Tree.propTypes = {
  version: PropTypes.string.isRequired,
  treeData: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  position: PropTypes.array.isRequired,
  scale: PropTypes.number.isRequired,
  updatePositionAndZoom: PropTypes.func,
  updateSelectedNode: PropTypes.func.isRequired
};

export default Tree;
