// Zoom
export const ZOOM_EXTENT = [0.3, 1.5];

// Fit to screen
export const MARGIN = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10
};

// Nodes
export const NODE_WIDTH_MARGIN = 20; // margin between two nodes - needed by the layout
export const NODE_WIDTH = 100;
export const NODE_HEIGHT = 30;
export const NODE_DEPTH = 100;

// Color of the nodes and edges
export const SELECTED_COLOR_EDGES = '#FF7F00';
export const DEFAULT_COLOR_EDGES = '#ddd';
export const COLOR_NODES = '#ddd';
export const SELECTED_BORDER_WIDTH = 5;

// Color of the leaves
export const COLOR_LEAVES_CONFIDENCE_0 = '#FEF3C2';
export const COLOR_LEAVES_CONFIDENCE_1 = '#FFBC00';
export const COLOR_LEAVES_CONFIDENCE_UNDEFINED = '#ddd';

// Node path
export const NODE_PATH_SEPARATOR = '-';
export const NODE_PATH_REGEXP = new RegExp(`^0(${NODE_PATH_SEPARATOR}\\d*)*$`);

// Edges width
export const DEFAULT_STROKE_WIDTH_RATIO = 30;
export const ADDITIONAL_SELECTED_STROKE_WIDTH = 1;
export const DEFAULT_MINIMUM_STROKE_WIDTH = 1.5;
