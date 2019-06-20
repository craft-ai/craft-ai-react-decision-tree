import _ from 'lodash';
import Edges from './edges';
import Nodes from './nodes';
import PropTypes from 'prop-types';
import React from 'react';
import ZoomableCanvas from './ZoomableCanvas';
import { hierarchy as d3Hierarchy, tree as d3Tree } from 'd3';
import {
  NODE_DEPTH,
  NODE_HEIGHT,
  NODE_PATH_REGEXP,
  NODE_PATH_SEPARATOR,
  NODE_WIDTH,
  NODE_WIDTH_MARGIN,
  ZOOM_EXTENT
} from '../utils/constants';

function computeHierarchy(rootDtNode, collapsedDepth) {
  const hierarchy = d3Hierarchy(rootDtNode, (treeNode) => treeNode.children);
  let index = 0;
  hierarchy.each((hNode) => {
    // Unique idbased on index
    hNode.id = index;
    index += 1;

    // Deal with decision rules
    if (hNode.parent) {
      hNode.treeNodeIdPath = _.clone(hNode.parent.treeNodeIdPath);
      hNode.treeNodeIdPath.push(hNode.id);
      const indexForParent = hNode.parent.children.findIndex(
        (child) => child === hNode
      );
      hNode.treePath = `${
        hNode.parent.treePath
      }${NODE_PATH_SEPARATOR}${indexForParent}`;
      hNode.decisionRules = _.isEmpty(hNode.parent.decisionRules)
        ? {}
        : _.cloneDeep(hNode.parent.decisionRules);
      // adding decision rules of the node
      if (hNode.decisionRules[hNode.data.decision_rule.property]) {
        hNode.decisionRules[hNode.data.decision_rule.property].push({
          operator: hNode.data.decision_rule.operator,
          operand: hNode.data.decision_rule.operand
        });
      }
      else {
        hNode.decisionRules[hNode.data.decision_rule.property] = [
          {
            operator: hNode.data.decision_rule.operator,
            operand: hNode.data.decision_rule.operand
          }
        ];
      }
    }
    else {
      // root node
      hNode.treeNodeIdPath = [hNode.id];
      hNode.treePath = '0';
    }

    // If a `collapsedDepth` is giving, collapses all the nodes from this depth.
    if (collapsedDepth != null) {
      if (hNode.depth >= collapsedDepth) {
        hNode.hidden_children = hNode.children;
        hNode.children = null;
      }
    }
  });
  return hierarchy;
}

const d3ComputeHierarchyLayout = d3Tree()
  .nodeSize([
    NODE_WIDTH + NODE_WIDTH_MARGIN,
    NODE_HEIGHT
  ]);

function computeHierarchyLayout(hierarchy) {
  d3ComputeHierarchyLayout(hierarchy);

  let treeDepth = 0;
  let dxMin = Number.MAX_SAFE_INTEGER;
  let dxMax = Number.MIN_SAFE_INTEGER;

  // Find out the boundaries of the hierarchy
  hierarchy.each((hNode) => {
    treeDepth = Math.max(treeDepth, hNode.depth);

    // Normalize for fixed-depth.
    hNode.y = hNode.depth * NODE_DEPTH;

    dxMin = Math.min(hNode.x, dxMin);
    dxMax = Math.max(hNode.x, dxMax);
  });

  const minSvgHeight = (treeDepth + 1) * NODE_DEPTH;
  const minSvgWidth = Math.abs(dxMin) + Math.abs(dxMax) + NODE_WIDTH;
  const offsetX = Math.abs(dxMin) + NODE_WIDTH / 2;

  // place correctly the tree in the svg with the minSvgWidth
  hierarchy.each((hNode) => {
    hNode.x = hNode.x + offsetX;
    hNode.y = hNode.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
  });

  return {
    minSvgWidth,
    minSvgHeight
  };
}

function computeTree(rootDtNode = {}, collapsedDepth) {
  const hierarchy = computeHierarchy(rootDtNode, collapsedDepth);
  const { minSvgWidth, minSvgHeight } = computeHierarchyLayout(hierarchy);

  return {
    minSvgHeight,
    minSvgWidth,
    hierarchy
  };
}

class Tree extends React.Component {
  constructor(props) {
    super(props);

    const { minSvgHeight, minSvgWidth, hierarchy } = computeTree(
      props.dt,
      props.collapsedDepth
    );

    this.state = {
      initialZoom: this.props.scale > 0 && {
        x: this.props.position[0],
        y: this.props.position[1],
        k: this.props.scale
      },
      isPanActivated: false,
      selectedEdgePath: [],
      minSvgHeight,
      minSvgWidth,
      edgeType: this.props.edgeType,
      hierarchy
    };

    this.zoom = this.state.initialZoom;
  }

  translatedTreeRef = null;

  componentDidMount() {
    if (this.props.selectedNode) {
      this.findAndHightlightSelectedNodePath();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.dt !== this.props.dt ||
      !_.isEqual(prevProps.collapsedDepth, this.props.collapsedDepth)
    ) {
      this.setState(computeTree(this.props.dt, this.props.collapsedDepth), () =>
        this.doFitToScreen()
      );
    }
    if (prevProps.selectedNode !== this.props.selectedNode) {
      this.findAndHightlightSelectedNodePath();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !_.isEqual(nextProps, this.props) ||
      !_.isEqual(this.state.initialZoom, nextState.initialZoom) ||
      !_.isEqual(this.state.minSvgHeight, nextState.minSvgHeight) ||
      !_.isEqual(this.state.minSvgWidth, nextState.minSvgWidth) ||
      !_.isEqual(this.state.selectedEdgePath, nextState.selectedEdgePath)
    );
  }

  onClickNode = (node) => {
    if (!_.isNull(node.children)) {
      node.hidden_children = node.children;
      node.children = null;
    }
    else {
      node.children = node.hidden_children;
      node.hidden_children = null;
    }

    // Get clicked node position
    const previousClickedNodePosX = node.x;
    const previousClickedNodePosY = node.y;
    const { minSvgHeight, minSvgWidth } = computeHierarchyLayout(
      this.state.hierarchy
    );

    // Unselect the previously selected node if a parent is collapsed
    if (
      this.props.selectedNode.startsWith(node.treePath) &&
      this.props.selectedNode !== node.treePath
    ) {
      this.props.updateSelectedNode('');
    }

    // this.translateTree(deltaX, deltaY);
    this.setState({
      minSvgHeight: minSvgHeight,
      minSvgWidth: minSvgWidth,
      initialZoom: {
        // This should compensate for the folding
        x: this.zoom.x - (node.x - previousClickedNodePosX) * this.zoom.k,
        y: this.zoom.y - (node.y - previousClickedNodePosY) * this.zoom.k,
        k: this.zoom.k
      },
      hierarchy: this.state.hierarchy,
      clickedNode: node
    });
  };

  onZooming = (isZooming) => {
    this.setState({ isPanActivated: isZooming });
  };

  handleZoomChange = (zoom) => {
    this.zoom = zoom;
    if (this.props.updatePositionAndZoom) {
      this.props.updatePositionAndZoom([zoom.x, zoom.y], zoom.k);
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
        this.setState({
          selectedEdgePath: this.state.hierarchy.treeNodeIdPath
        });
      }
      else {
        const pathArray = this.props.selectedNode.split(NODE_PATH_SEPARATOR);
        // remove the first element of the path because it is the root path;
        const selectedPath = findSelectedNodeRecursion(
          _.tail(pathArray),
          this.state.hierarchy
        );
        this.setState({ selectedEdgePath: selectedPath });
      }
    }
    else {
      throw new Error(`Selected node is not valid: ${this.props.selectedNode}`);
    }
  };

  render() {
    const { height, width } = this.props;
    const {
      initialZoom,
      isPanActivated,
      hierarchy,
      minSvgHeight,
      minSvgWidth,
      clickedNode
    } = this.state;
    return (
      <ZoomableCanvas
        initialZoom={ initialZoom }
        canvasWidth={ minSvgWidth }
        canvasHeight={ minSvgHeight }
        onZooming={ this.onZooming }
        onZoomChange={ this.handleZoomChange }
        minZoomScale={ ZOOM_EXTENT[0] }
        maxZoomScale={ ZOOM_EXTENT[1] }
        style={{ height, width, backgroundColor: 'white', minWidth: 400 }}
      >
        <Nodes
          version={ this.props.version }
          selectable={ !isPanActivated }
          height={ this.props.height }
          configuration={ this.props.configuration }
          hierarchy={ hierarchy }
          updateSelectedNode={ this.props.updateSelectedNode }
          selectedNode={ this.props.selectedNode }
          onClickNode={ this.onClickNode }
        />
        <Edges
          edgePath={ this.state.selectedEdgePath }
          dt={ this.props.dt }
          hierarchy={ hierarchy }
          width={ minSvgWidth }
          height={ minSvgHeight }
          edgeType={ this.props.version == 1 ? 'constant' : this.props.edgeType }
          clickedNode={ clickedNode }
        />
      </ZoomableCanvas>
    );
  }
}

Tree.propTypes = {
  version: PropTypes.number.isRequired,
  dt: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  position: PropTypes.array.isRequired,
  scale: PropTypes.number.isRequired,
  updatePositionAndZoom: PropTypes.func,
  updateSelectedNode: PropTypes.func.isRequired,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  collapsedDepth: PropTypes.number
};

export default Tree;
