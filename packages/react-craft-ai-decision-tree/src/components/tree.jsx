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
    }
    else {
      // root node
      hNode.idPath = [hNode.id];
      hNode.path = '0';
    }
  });

  return hierarchy;
}

function applyFolding(hierarchy, foldedNodes = []) {
  // Apply the folded node to the hierarchy
  hierarchy.each((hNode) => {
    const folded = hNode.foldedChildren != null;
    const shouldBeFolded =
      foldedNodes.findIndex((path) => hNode.path === path) >= 0;
    const toFold = shouldBeFolded && !folded;
    const toUnfold = !shouldBeFolded && folded;
    if (toFold) {
      hNode.foldedChildren = hNode.children;
      hNode.children = null;
    }
    if (toUnfold) {
      hNode.children = hNode.foldedChildren;
      hNode.foldedChildren = null;
    }
  });

  return hierarchy;
}

const d3ComputeHierarchyLayout = d3Tree()
  .nodeSize([
    NODE_WIDTH + NODE_WIDTH_MARGIN,
    NODE_HEIGHT
  ]);

function applyHierarchyLayout(hierarchy, version = 0) {
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

const Tree = React.memo(function Tree({
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
}) {
  const hierarchy = useMemo(
    () => applyFolding(computeHierarchy(interpreter.dt), foldedNodes),
    // No dependency on 'foldedNodes' because this should only occur on the hierarchy full recomputation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interpreter.dt]
  );

  const [zooming, setZooming] = useState(true);
  const [{ layout, initialZoom }, setLayoutAndInitialZoom] = useState({
    layout: applyHierarchyLayout(hierarchy),
    initialZoom: scale > 0 && {
      x: position[0],
      y: position[1],
      k: scale
    }
  });
  const zoom = useRef(layout.initialZoom);
  useEffect(
    () => {
      setLayoutAndInitialZoom(({ layout, initialZoom }) => ({
        layout: applyHierarchyLayout(hierarchy, layout.version),
        initialZoom
      }));
    },
    [hierarchy]
  );
  useEffect(
    () => {
      setLayoutAndInitialZoom(({ layout, initialZoom }) => ({
        layout,
        initialZoom: scale > 0 && {
          x: position[0],
          y: position[1],
          k: scale
        }
      }));
    },
    [position, scale]
  );
  const handleZoomChange = useCallback(
    (newZoom) => {
      zoom.current = newZoom;
      if (updatePositionAndZoom) {
        updatePositionAndZoom([newZoom.x, newZoom.y], newZoom.k);
      }
    },
    [updatePositionAndZoom]
  );

  const [foldedNodesState, setFoldedNodesState] = useState(foldedNodes);
  const setFoldedNodes = useCallback(
    (foldedNodes, referenceHNode) => {
      if (!_.isUndefined(referenceHNode)) {
        // 'Save' the position of the reference node
        const previousPosX = referenceHNode.x;
        const previousPosY = referenceHNode.y;

        applyFolding(hierarchy, foldedNodes);

        // Refresh the layout
        setLayoutAndInitialZoom(({ layout }) => {
          const updatedLayout = applyHierarchyLayout(hierarchy, layout.version);
          return {
            layout: updatedLayout,
            // Update the zoom to compensate for the movement induced by the folding
            initialZoom: {
              x:
                zoom.current.x -
                (referenceHNode.x - previousPosX) * zoom.current.k,
              y:
                zoom.current.y -
                (referenceHNode.y - previousPosY) * zoom.current.k,
              k: zoom.current.k
            }
          };
        });

        setFoldedNodesState(foldedNodes);
      }
    },
    [hierarchy]
  );

  // When the foldedNodes change, reapply them, and keep the root of the hierarchy at the same location.
  useEffect(() => setFoldedNodes(foldedNodes, hierarchy), [
    hierarchy,
    foldedNodes,
    setFoldedNodes
  ]);

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

  // Unselect the previously selected node if a parent were folded
  useEffect(
    () => {
      if (selectedNode && updateSelectedNode) {
        foldedNodesState.forEach((path) => {
          if (selectedNode.startsWith(path) && selectedNode !== path) {
            updateSelectedNode();
            return;
          }
        });
      }
    },
    [foldedNodesState, selectedNode, updateSelectedNode]
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
          selectedNodePath={ selectedNode || '' }
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
});

Tree.propTypes = {
  interpreter: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  position: PropTypes.array.isRequired,
  scale: PropTypes.number.isRequired,
  updatePositionAndZoom: PropTypes.func,
  updateSelectedNode: PropTypes.func,
  edgeType: PropTypes.string,
  selectedNode: PropTypes.string,
  foldedNodes: PropTypes.arrayOf(PropTypes.string)
};

export default Tree;
