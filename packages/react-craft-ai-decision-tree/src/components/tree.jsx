import _ from 'lodash';
import Edges from './edges';
import Nodes from './nodes';
import PropTypes from 'prop-types';
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

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

function computeHierarchyLayout(hierarchy, version = 0) {
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

  const canvasHeight = (treeDepth + 1) * NODE_DEPTH;
  const canvasWidth = Math.abs(dxMin) + Math.abs(dxMax) + NODE_WIDTH;
  const offsetX = Math.abs(dxMin) + NODE_WIDTH / 2;

  // place correctly the tree in the svg with the canvasWidth
  hierarchy.each((hNode) => {
    hNode.x = hNode.x + offsetX;
    hNode.y = hNode.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
  });

  return {
    canvasWidth,
    canvasHeight,
    version: version + 1
  };
}

function recursiveHNodeFromPath(nodePath, hNode) {
  if (nodePath.length !== 0) {
    const indexChild = parseInt(nodePath[0]);
    return recursiveHNodeFromPath(_.tail(nodePath), hNode.children[indexChild]);
  }
  return hNode;
}

function hNodeFromPath(nodePathStr, hierarchy) {
  if (!nodePathStr) {
    return null;
  }
  if (nodePathStr === '0') {
    return hierarchy;
  }
  // Check validity of the selectedNode
  if (!NODE_PATH_REGEXP.test(nodePathStr)) {
    throw new Error(`Given node path is not valid: ${nodePathStr}`);
  }

  const nodePath = nodePathStr.split(NODE_PATH_SEPARATOR);
  // remove the first element of the path because it is the root path;
  return recursiveHNodeFromPath(_.tail(nodePath), hierarchy);
}

const Tree = ({
  version,
  dt,
  configuration,
  height,
  width,
  position,
  scale = -1,
  updatePositionAndZoom = (position, scale) => {},
  updateSelectedNode,
  edgeType,
  selectedNode,
  collapsedDepth
}) => {
  const [zooming, setZooming] = useState(true);

  const [initialZoom, setInitialZoom] = useState(
    scale > 0 && {
      x: position[0],
      y: position[1],
      k: scale
    }
  );
  useEffect(
    () => {
      setInitialZoom(
        scale > 0 && {
          x: position[0],
          y: position[1],
          k: scale
        }
      );
    },
    [position, scale]
  );

  const zoom = useRef(initialZoom);
  const handleZoomChange = useCallback((newZoom) => {
    zoom.current = newZoom;
    if (updatePositionAndZoom) {
      updatePositionAndZoom([newZoom.x, newZoom.y], newZoom.k);
    }
  });

  const hierarchy = useMemo(() => computeHierarchy(dt, collapsedDepth), [
    dt,
    collapsedDepth
  ]);
  const [layout, setLayout] = useState(computeHierarchyLayout(hierarchy));
  useEffect(
    () => {
      setLayout(({ version }) => computeHierarchyLayout(hierarchy, version));
    },
    [hierarchy]
  );

  const selectedHNode = useMemo(() => hNodeFromPath(selectedNode, hierarchy), [
    selectedNode,
    hierarchy
  ]);

  const foldNode = useCallback(
    (node) => {
      if (node.children != null) {
        node.hidden_children = node.children;
        node.children = null;
      }
      else {
        node.children = node.hidden_children;
        node.hidden_children = null;
      }

      // Unselect the previously selected node if a parent is collapsed
      if (
        selectedNode.startsWith(node.treePath) &&
        selectedNode !== node.treePath
      ) {
        updateSelectedNode('');
      }

      // 'Save' the position of the folded node
      const previousClickedNodePosX = node.x;
      const previousClickedNodePosY = node.y;

      // Refresh the layout
      setLayout(({ version }) => {
        const layout = computeHierarchyLayout(hierarchy, version);
        // Update the zoom to compensate for the movement induced by the folding
        setInitialZoom({
          x:
            zoom.current.x -
            (node.x - previousClickedNodePosX) * zoom.current.k,
          y:
            zoom.current.y -
            (node.y - previousClickedNodePosY) * zoom.current.k,
          k: zoom.current.k
        });
        return layout;
      });
    },
    [selectedNode, updateSelectedNode]
  );
  return (
    <ZoomableCanvas
      initialZoom={ initialZoom }
      canvasWidth={ layout.canvasWidth }
      canvasHeight={ layout.canvasHeight }
      onZooming={ setZooming }
      onZoomChange={ handleZoomChange }
      minZoomScale={ ZOOM_EXTENT[0] }
      maxZoomScale={ ZOOM_EXTENT[1] }
      style={{ height, width, backgroundColor: 'white', minWidth: 400 }}
    >
      <React.Fragment key={ layout.version }>
        <Nodes
          version={ version }
          selectable={ !zooming }
          configuration={ configuration }
          hierarchy={ hierarchy }
          updateSelectedNode={ updateSelectedNode }
          selectedNode={ selectedNode }
          onClickNode={ foldNode }
        />
        <Edges
          edgePath={ selectedHNode ? selectedHNode.treeNodeIdPath : [] }
          dt={ dt }
          hierarchy={ hierarchy }
          width={ layout.canvasWidth }
          height={ layout.canvasHeight }
          edgeType={ version == 1 ? 'constant' : edgeType }
        />
      </React.Fragment>
    </ZoomableCanvas>
  );
};

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
