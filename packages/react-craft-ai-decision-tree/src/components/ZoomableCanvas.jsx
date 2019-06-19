/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
  event as d3Event,
  select as d3Select,
  zoom as d3Zoom,
  zoomIdentity as transformIdentity
} from 'd3';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const Viewport = styled('div')`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
`;

const Canvas = styled('div')`
  position: absolute;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;

  transform-origin: top left;
  transform: ${({ transform }) =>
    `translate(${transform.x}px,${transform.y}px) scale(${transform.k})`};
`;

function createZoom(t) {
  if (!t) {
    return transformIdentity;
  }
  const { x = 0, y = 0, k = 1 } = t;
  return transformIdentity.translate(x, y)
    .scale(k);
}

function computeFitZoom({
  viewportWidth,
  viewportHeight,
  canvasHeight,
  canvasWidth,
  minZoomScale,
  maxZoomScale,
  margin
}) {
  const actualMargin = margin || Math.min(viewportWidth, viewportHeight) * 0.05; // 5% margin on the smallest viewport dimension
  const updatedScale = Math.max(
    minZoomScale,
    Math.min(
      (viewportWidth - actualMargin) / canvasWidth, // The scale along the x axis
      (viewportHeight - actualMargin) / canvasHeight, // The scale along the y axis
      maxZoomScale
    )
  );

  return createZoom({
    x: viewportWidth / 2 - (canvasWidth * updatedScale) / 2,
    y: viewportHeight / 2 - (canvasHeight * updatedScale) / 2,
    k: updatedScale
  });
}

const ZoomableCanvas = ({
  children,
  canvasHeight,
  canvasWidth,
  minZoomScale = 0.1,
  maxZoomScale = 10,
  initialZoom,
  onZooming = (isZooming) => {},
  onZoomChange = (transform) => {},
  disable = false,
  ...otherProps
}) => {
  const viewportRef = React.createRef();
  const [zoom, setZoomState] = useState(createZoom(initialZoom));

  // Create the zoom system only once.
  const zoomSystem = useMemo(
    () => d3Zoom()
      .scaleExtent([minZoomScale, maxZoomScale]),
    []
  );

  // Create the callback that can be used to properly change the zoom.
  const setZoom = useCallback(
    (zoom) => {
      d3Select(viewportRef.current)
        .call(zoomSystem.transform, zoom);
    },
    [viewportRef, zoomSystem]
  );

  // Fit to screen callback
  const fitToScreen = useCallback(
    () => {
      const viewportClientRect = viewportRef.current.getBoundingClientRect();
      const fitZoom = computeFitZoom({
        viewportWidth: viewportClientRect.right - viewportClientRect.left,
        viewportHeight: viewportClientRect.bottom - viewportClientRect.top,
        canvasHeight,
        canvasWidth,
        minZoomScale,
        maxZoomScale
      });

      setZoom(fitZoom);
    },
    [canvasHeight, canvasWidth, minZoomScale, maxZoomScale, viewportRef]
  );

  // Attach the zoom system
  useEffect(
    () => {
      if (disable) {
        d3Select(viewportRef.current)
          .on('.zoom', null);
      }
      else {
        d3Select(viewportRef.current)
          .call(
            zoomSystem
              .on('zoom', () => {
                onZoomChange({
                  x: d3Event.transform.x,
                  y: d3Event.transform.y,
                  k: d3Event.transform.k
                });
                setZoomState(d3Event.transform);
              })
              .on('start', () => onZooming(true))
              .on('end', () => onZooming(false))
          )
          .on('dblclick.zoom', null);
        return () => {
          d3Select(viewportRef.current)
            .on('.zoom', null);
        };
      }
    },
    [disable, minZoomScale, maxZoomScale, viewportRef]
  );

  useEffect(
    () => {
      if (!initialZoom) {
        fitToScreen();
      }
      else {
        setZoom(createZoom(initialZoom));
      }
    },
    [
      initialZoom,
      initialZoom && initialZoom.x,
      initialZoom && initialZoom.y,
      initialZoom && initialZoom.k
    ]
  );

  return (
    <Viewport
      { ...otherProps }
      ref={ viewportRef }
      onDoubleClick={ disable ? null : fitToScreen }
    >
      <Canvas transform={ zoom } height={ canvasHeight } width={ canvasWidth }>
        {children}
      </Canvas>
    </Viewport>
  );
};

ZoomableCanvas.propTypes = {
  canvasHeight: PropTypes.number.isRequired,
  canvasWidth: PropTypes.number.isRequired,
  canvasOffset: PropTypes.oneOfType([
    PropTypes.oneOf([false]),
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  ]),
  children: PropTypes.node.isRequired,
  disable: PropTypes.bool,
  minZoomScale: PropTypes.number,
  maxZoomScale: PropTypes.number,
  onZooming: PropTypes.func,
  initialZoom: PropTypes.oneOfType([
    PropTypes.oneOf([false]),
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
      k: PropTypes.number
    })
  ]),
  onZoomChange: PropTypes.func
};

export default ZoomableCanvas;
