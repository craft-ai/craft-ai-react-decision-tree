import _ from 'lodash';

function boxFromRect({ left, top, right, bottom }) {
  return {
    origin: {
      x: left || 0,
      y: top || 0
    },
    delta: {
      x: right != null && left != null ? right - left : 0,
      y: top != null && bottom != null ? bottom - top : 0
    }
  };
}

function applyMarginToBox({ origin, delta }, margin) {
  const m = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    ...margin
  };
  return {
    origin: {
      x: origin.x + m.left,
      y: origin.y + m.top
    },
    delta: {
      x: delta.x - m.left - m.right,
      y: delta.y - m.top - m.bottom
    }
  };
}

function computeFitTransformation(
  treeBbox,
  canvasBbox,
  prevTransformation,
  scaleExtent
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

export { applyMarginToBox, computeFitTransformation, boxFromRect };
