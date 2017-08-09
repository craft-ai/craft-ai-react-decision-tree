// Zoom
export const ZOOM_EXTENT = [0.25, 1.1];

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

// Color of the leaf
export const NOT_RELIABLE_COLOR = {
  r: 249,
  g: 174,
  b: 89
};

export const RELIABLE_COLOR = {
  r: 162,
  g: 247,
  b: 89
};

export const NULL_COLOR = {
  r: 249,
  g: 94,
  b: 89
};

export const NOT_RELIABLE_LIMIT = 75;
export const RELIABLE_PERCENT = 100 / (100 - NOT_RELIABLE_LIMIT);
