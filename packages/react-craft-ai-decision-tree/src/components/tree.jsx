import _ from 'lodash';
import Edges from './edges';
import Nodes from './nodes';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import { applyMarginToBox, boxFromRect, computeFitTransformation } from '../utils/box';
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
  NODE_PATH_REGEXP,
  NODE_PATH_SEPARATOR,
  NODE_WIDTH,
  NODE_WIDTH_MARGIN,
  ZOOM_EXTENT
} from '../utils/constants';

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
      node.treePath = `${node.parent.treePath}${NODE_PATH_SEPARATOR}${index}`;
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
      if (node.data.prediction) {
        node.nbSamples = node.data.prediction.nb_samples;
      }
      else {
        node.nbSamples = 0;
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
      node.children.forEach((child, childIndex) => {
        enrichTreeRecursive(childIndex, child);
      });
      node.nbSamples = node.children.reduce(
        (acc, child) => acc + child.nbSamples,
        0
      );
    }
    return node;
  };

  nodes = enrichTreeRecursive(0, nodes);

  minSvgHeight = (maxTreeDepth + 1) * NODE_DEPTH;
  minSvgWidth = Math.abs(dxMin) + Math.abs(dxMax) + NODE_WIDTH;
  const nodeDescendantsArray = nodes.descendants();

  return {
    minSvgWidth: minSvgWidth,
    minSvgHeight: minSvgHeight,
    nodes: nodeDescendantsArray,
    links,
    totalNbSamples: nodeDescendantsArray[0].nbSamples,
    offsetX: Math.abs(dxMin) + NODE_WIDTH / 2
  };
}

class Tree extends React.Component {
  constructor(props) {
    super(props);

    const {
      links,
      nodes,
      minSvgHeight,
      minSvgWidth,
      totalNbSamples
    } = this.computeTree();

    this.state = {
      newPos: this.props.position,
      scale: this.props.scale === -1 ? 1 : this.props.scale,
      isPanActivated: false,
      selectedEdgePath: [],
      nodes,
      links,
      minSvgHeight,
      minSvgWidth,
      totalNbSamples,
      edgeType: this.props.edgeType
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
    if (this.props.scale === -1) {
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
    if (this.props.selectedNode) {
      this.findAndHightlightSelectedNodePath();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.fitToScreenTimeout);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.treeData !== this.props.treeData) {
      this.setState(this.computeTree());
    }
    if (prevProps.selectedNode !== this.props.selectedNode) {
      this.findAndHightlightSelectedNodePath();
    }
  }

  computeTree = () => {
    let root = this.props.treeData;
    root.x = 0;
    root.y = 0;

    const {
      selectedNodeId,
      links,
      minSvgHeight,
      minSvgWidth,
      nodes,
      offsetX,
      totalNbSamples
    } = computeSvgSizeFromData(root);

    // place correctly the tree in the svg with the minSvgWidth
    _.forEach(nodes, (d) => {
      d.x = d.x + offsetX;
      d.y = d.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
    });

    return {
      links,
      minSvgHeight,
      minSvgWidth,
      nodes,
      selectedNodeId,
      totalNbSamples
    };
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
    const canvasBbox = boxFromRect(
      d3Select('div.zoomed-tree')
        .node()
        .getBoundingClientRect()
    );
    const marginedCanvasBbox = applyMarginToBox(canvasBbox, MARGIN);
    const treeBbox = boxFromRect(
      d3Select('div.translated-tree')
        .node()
        .getBoundingClientRect()
    );
    const { newPos, scale } = computeFitTransformation(
      treeBbox,
      marginedCanvasBbox,
      this.state,
      ZOOM_EXTENT
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

  findAndHightlightSelectedNodePath = () => {
    if (!this.props.selectedNode) {
      this.setState({ selectedEdgePath: [] });
    }
    // Check validity of the selectedNode
    else if (NODE_PATH_REGEXP.test(this.props.selectedNode)) {
      const findSelectedNodeRecursion = (path, node) => {
        if (path.length !== 0) {
          const indexChild = parseInt(path[0]);
          return findSelectedNodeRecursion(
            _.tail(path),
            node.children[indexChild]
          );
        }
        return node.treeNodeIdPath;
      };

      // making the root node an exception
      if (this.props.selectedNode === '0') {
        this.setState({ selectedEdgePath: this.state.nodes[0].treeNodeIdPath });
      }
      else {
        const pathArray = this.props.selectedNode.split(NODE_PATH_SEPARATOR);
        // remove the first element of the path because it is the root path;
        const selectedPath = findSelectedNodeRecursion(
          _.tail(pathArray),
          this.state.nodes[0]
        );
        this.setState({ selectedEdgePath: selectedPath });
      }
    }
    else {
      throw new Error(`Selected node is not valid: ${this.props.selectedNode}`);
    }
  };

  render() {
    const panActivated = this.state.isPanActivated;
    const {
      links,
      minSvgHeight,
      minSvgWidth,
      nodes,
      totalNbSamples
    } = this.state;
    return (
      <TreeCanvas
        onDoubleClick={ this.resetPosition }
        className='tree zoomed-tree'
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
            updateSelectedNode={ this.props.updateSelectedNode }
            selectedNode={ this.props.selectedNode }
          />
          <Edges
            version={ this.props.version }
            edgePath={ this.state.selectedEdgePath }
            treeData={ this.props.treeData }
            nodes={ nodes }
            links={ links }
            width={ minSvgWidth }
            height={ minSvgHeight }
            totalNbSamples={ totalNbSamples }
            edgeType={ this.props.edgeType }
          />
        </div>
      </TreeCanvas>
    );
  }
}

Tree.propTypes = {
  version: PropTypes.number.isRequired,
  treeData: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  position: PropTypes.array.isRequired,
  scale: PropTypes.number.isRequired,
  updatePositionAndZoom: PropTypes.func,
  updateSelectedNode: PropTypes.func.isRequired,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string
};

export default Tree;
