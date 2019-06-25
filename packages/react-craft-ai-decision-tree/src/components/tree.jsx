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

function computeHierarchy(rootDtNode) {
  const hierarchy = d3Hierarchy(rootDtNode, (treeNode) => treeNode.children);
  let index = 0;
  hierarchy.each((hNode) => {
    // Unique id based on index
    hNode.id = index;
    index += 1;

    // Deal with decision rules
    if (hNode.parent) {
      hNode.idPath = [...hNode.parent.idPath, hNode.id];
      const index = hNode.parent.children.findIndex((child) => child === hNode);
      hNode.path = `${hNode.parent.path}${NODE_PATH_SEPARATOR}${index}`;
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
      hNode.idPath = [hNode.id];
      hNode.path = '0';
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

const DEFAULT_PROPS = {
  scale: -1,
  updatePositionAndZoom: (position, scale) => {},
  foldedNodes: []
};

const Tree = ({
  interpreter,
  configuration,
  height,
  width,
  position,
  scale = DEFAULT_PROPS.scale,
  updatePositionAndZoom = DEFAULT_PROPS.updatePositionAndZoom,
  updateSelectedNode,
  edgeType,
  selectedNode,
  foldedNodes = DEFAULT_PROPS.foldedNodes
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

  const hierarchy = useMemo(() => computeHierarchy(interpreter.dt), [
    interpreter.dt
  ]);

  const [foldedNodesState, setFoldedNodesState] = useState(foldedNodes);
  const setFoldedNodes = useCallback(
    (foldedNodes, referenceHNode) => {
      // 'Save' the position of the reference node
      const previousPosX = referenceHNode.x;
      const previousPosY = referenceHNode.y;

      hierarchy.each((hNode) => {
        const folded = hNode.foldedChildren != null;
        const shouldBeFolded =
          foldedNodes.findIndex((path) => hNode.path === path) >= 0;
        const toFold = shouldBeFolded && !folded;
        const toUnfold = !shouldBeFolded && folded;
        if (toFold) {
          hNode.foldedChildren = hNode.children;
          hNode.children = null;

          // Unselect the previously selected node if a parent is collapsed
          if (
            selectedNode.startsWith(hNode.path) &&
            selectedNode !== hNode.path
          ) {
            updateSelectedNode('');
          }
        }
        if (toUnfold) {
          hNode.children = hNode.foldedChildren;
          hNode.foldedChildren = null;
        }
      });

      // Refresh the layout
      setLayout(({ version }) => {
        const layout = computeHierarchyLayout(hierarchy, version);
        // Update the zoom to compensate for the movement induced by the folding
        setInitialZoom({
          x:
            zoom.current.x - (referenceHNode.x - previousPosX) * zoom.current.k,
          y:
            zoom.current.y - (referenceHNode.y - previousPosY) * zoom.current.k,
          k: zoom.current.k
        });
        return layout;
      });

      setFoldedNodesState(foldedNodes);
    },
    [hierarchy, selectedNode, updateSelectedNode]
  );

  // When the foldedNodes change, reapply them, and keep the root of the hierarchy at the same location.
  useEffect(() => setFoldedNodes(foldedNodes, hierarchy), [
    hierarchy,
    foldedNodes
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

  const toggleSubtreeFold = useCallback(
    (hNode) => {
      const folded = hNode.foldedChildren != null;
      if (!folded) {
        setFoldedNodes([...foldedNodesState, hNode.path], hNode);
      }
      else {
        setFoldedNodes(
          foldedNodesState.filter((path) => path !== hNode.path),
          hNode
        );
      }
    },
    [foldedNodesState, setFoldedNodes]
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
          selectable={ !zooming }
          interpreter={ interpreter }
          configuration={ configuration }
          hierarchy={ hierarchy }
          updateSelectedNode={ updateSelectedNode }
          selectedNodePath={ selectedNode }
          onToggleSubtreeFold={ toggleSubtreeFold }
        />
        <Edges
          selectedNodeIdPath={ selectedHNode ? selectedHNode.idPath : [] }
          dt={ interpreter.dt }
          hierarchy={ hierarchy }
          width={ layout.canvasWidth }
          height={ layout.canvasHeight }
          edgeType={ interpreter.version == 1 ? 'constant' : edgeType }
        />
      </React.Fragment>
    </ZoomableCanvas>
  );
};

Tree.propTypes = {
  interpreter: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  position: PropTypes.array.isRequired,
  scale: PropTypes.number.isRequired,
  updatePositionAndZoom: PropTypes.func,
  updateSelectedNode: PropTypes.func.isRequired,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  foldedNodes: PropTypes.arrayOf(PropTypes.string)
};

export default Tree;
