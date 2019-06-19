import _ from 'lodash';
import Edges from './edges';
import Nodes from './nodes';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import {
  applyMarginToBox,
  boxFromRect,
  computeFitTransformation
} from '../utils/box';
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

const computeTreeLayout = d3Tree()
  .nodeSize([
    NODE_WIDTH + NODE_WIDTH_MARGIN,
    NODE_HEIGHT
  ]);

function adjustTreePosition(tree) {
  let maxTreeDepth = 0;
  let dxMin;
  let dxMax;

  const adjustPositions = (node) => {
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
      node.children.forEach(adjustPositions);
    }
    return node;
  };

  tree = adjustPositions(tree);
  const minSvgHeight = (maxTreeDepth + 1) * NODE_DEPTH;
  const minSvgWidth = Math.abs(dxMin) + Math.abs(dxMax) + NODE_WIDTH;

  return {
    minSvgWidth: minSvgWidth,
    minSvgHeight: minSvgHeight,
    offsetX: Math.abs(dxMin) + NODE_WIDTH / 2
  };
}

function updateTree(hierarchy) {
  computeTreeLayout(hierarchy);

  const { minSvgWidth, minSvgHeight, offsetX } = adjustTreePosition(hierarchy);
  const nodeDescendantsArray = hierarchy.descendants();

  return {
    minSvgWidth: minSvgWidth,
    minSvgHeight: minSvgHeight,
    nodeDescendantsArray: nodeDescendantsArray,
    links: hierarchy.links(),
    hierarchy: hierarchy,
    offsetX: offsetX
  };
}

function collapseNodesFromDepth(hNodes, collapsedDepth) {
  const collapse = (hNode) => {
    if (hNode.depth >= collapsedDepth) {
      hNode.hidden_children = hNode.children;
      hNode.children = null;
    }
  };
  hNodes.map(collapse);
}

function computeSvgSizeFromData(rootDtNode, collapsedDepth) {
  let incr = 0;
  const hierarchy = d3Hierarchy(
    rootDtNode,
    (treeNode) => treeNode.children
  )
    .each((hNode) => {
      hNode.id = incr++;
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
    });

  // If a `collapsedDepth` is giving, collapses all the nodes from this depth.
  if (!_.isUndefined(collapsedDepth)) {
    collapseNodesFromDepth(hierarchy.descendants(), collapsedDepth);
  }

  computeTreeLayout(hierarchy);

  const { minSvgWidth, minSvgHeight, offsetX } = adjustTreePosition(hierarchy);
  const nodeDescendantsArray = hierarchy.descendants();

  return {
    minSvgWidth: minSvgWidth,
    minSvgHeight: minSvgHeight,
    nodeDescendantsArray: nodeDescendantsArray,
    links: hierarchy.links(),
    hierarchy: hierarchy,
    offsetX: offsetX
  };
}

class Tree extends React.Component {
  constructor(props) {
    super(props);

    const {
      links,
      nodeDescendantsArray,
      minSvgHeight,
      minSvgWidth,
      hierarchy
    } = this.computeTree(props.dt, props.collapsedDepth);

    this.state = {
      newPos: this.props.position,
      scale: this.props.scale === -1 ? 1 : this.props.scale,
      isPanActivated: false,
      selectedEdgePath: [],
      links,
      nodeDescendantsArray,
      minSvgHeight,
      minSvgWidth,
      edgeType: this.props.edgeType,
      hierarchy: hierarchy
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
    if (
      prevProps.dt !== this.props.dt ||
      !_.isEqual(prevProps.collapsedDepth, this.props.collapsedDepth)
    ) {
      this.setState(
        this.computeTree(this.props.dt, this.props.collapsedDepth),
        () => this.doFitToScreen()
      );
    }
    if (prevProps.selectedNode !== this.props.selectedNode) {
      this.findAndHightlightSelectedNodePath();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !_.isEqual(nextProps, this.props) ||
      !_.isEqual(this.state.newPos, nextState.newPos) ||
      !_.isEqual(
        this.state.nodeDescendantsArray,
        nextState.nodeDescendantsArray
      ) ||
      !_.isEqual(this.state.selectedEdgePath, nextState.selectedEdgePath)
    );
  }

  onClickNode = (node) => {
    // Get clicked node position
    const previousClickedNodePosX = node.x;
    const previousClickedNodePosY = node.y;
    const {
      links,
      minSvgHeight,
      minSvgWidth,
      nodeDescendantsArray,
      offsetX,
      hierarchy
    } = updateTree(this.state.hierarchy);

    // place correctly the tree in the svg with the minSvgWidth
    _.forEach(nodeDescendantsArray, (d) => {
      d.x = d.x + offsetX;
      d.y = d.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
    });

    // Unselect the previously selected node if a parent is collapsed
    if (
      this.props.selectedNode.startsWith(node.treePath) &&
      this.props.selectedNode !== node.treePath
    ) {
      this.props.updateSelectedNode('');
    }

    // Get clicked node new position
    const currentClickedNodePosX = node.x;
    const currentClickedNodePosY = node.y;

    const deltaX = currentClickedNodePosX - previousClickedNodePosX;
    const deltaY = currentClickedNodePosY - previousClickedNodePosY;

    this.translateTree(deltaX, deltaY);
    this.setState({
      nodeDescendantsArray: nodeDescendantsArray,
      links: links,
      minSvgHeight: minSvgHeight,
      minSvgWidth: minSvgWidth,
      hierarchy: hierarchy,
      clickedNode: node
    });
  };

  computeTree = (dtRootNode = {}, collapsedDepth) => {
    const {
      selectedNodeId,
      links,
      minSvgHeight,
      minSvgWidth,
      nodeDescendantsArray,
      offsetX,
      hierarchy
    } = computeSvgSizeFromData(dtRootNode, collapsedDepth);

    // place correctly the tree in the svg with the minSvgWidth
    _.forEach(nodeDescendantsArray, (d) => {
      d.x = d.x + offsetX;
      d.y = d.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
    });

    return {
      links,
      minSvgHeight,
      minSvgWidth,
      nodeDescendantsArray,
      selectedNodeId,
      hierarchy
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

  translateTree = (deltaX, deltaY) => {
    const treeBbox = boxFromRect(
      d3Select('div.translated-tree')
        .node()
        .getBoundingClientRect()
    );

    const treeZoomedBbox = boxFromRect(
      d3Select('div.zoomed-tree')
        .node()
        .getBoundingClientRect()
    );

    d3Select('div.zoomed-tree')
      .call(
        this.zoom.transform,
        zoomIdentity
          .translate(
            treeBbox.origin.x -
            deltaX * this.state.scale -
            treeZoomedBbox.origin.x,
            treeBbox.origin.y -
            deltaY * this.state.scale -
            treeZoomedBbox.origin.y
          )
          .scale(this.state.scale)
      );
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
        this.setState({
          selectedEdgePath: this.state.nodeDescendantsArray[0].treeNodeIdPath
        });
      }
      else {
        const pathArray = this.props.selectedNode.split(NODE_PATH_SEPARATOR);
        // remove the first element of the path because it is the root path;
        const selectedPath = findSelectedNodeRecursion(
          _.tail(pathArray),
          this.state.nodeDescendantsArray[0]
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
      hierarchy,
      links,
      minSvgHeight,
      minSvgWidth,
      nodeDescendantsArray,
      clickedNode
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
            nodes={ nodeDescendantsArray }
            links={ links }
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
            edgeType={
              this.props.version == 1 ? 'constant' : this.props.edgeType
            }
            clickedNode={ clickedNode }
          />
        </div>
      </TreeCanvas>
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
