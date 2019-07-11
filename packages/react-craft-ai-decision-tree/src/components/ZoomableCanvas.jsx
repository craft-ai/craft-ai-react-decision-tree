/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
  event as d3Event,
  select as d3Select,
  zoom as d3Zoom,
  zoomIdentity as transformIdentity
} from 'd3';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

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

const DEFAULT_PROPS = {
  minZoomScale: 0.1,
  maxZoomScale: 10,
  onZooming: (isZooming) => {},
  onZoomChange: (transform) => {},
  disable: false
};

const ZoomableCanvas = React.memo(
  ({
    children,
    canvasHeight,
    canvasWidth,
    minZoomScale = DEFAULT_PROPS.minZoomScale,
    maxZoomScale = DEFAULT_PROPS.maxZoomScale,
    initialZoom,
    onZooming = DEFAULT_PROPS.onZooming,
    onZoomChange = DEFAULT_PROPS.onZoomChange,
    disable = DEFAULT_PROPS.disable,
    ...otherProps
  }) => {
    const viewportRef = useRef();
    const [zoom, setZoomState] = useState(createZoom(initialZoom));

    // Create the zoom system only once.
    const zoomSystem = useMemo(
      () => d3Zoom()
        .scaleExtent([minZoomScale, maxZoomScale]),
      [maxZoomScale, minZoomScale]
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
    const fitToScreen = useCallback(() => {
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
    }, [canvasHeight, canvasWidth, minZoomScale, maxZoomScale, setZoom]);

    // Attach the zoom system
    useEffect(() => {
      const viewportDomNode = viewportRef.current;
      if (disable) {
        d3Select(viewportDomNode)
          .on('.zoom', null);
      }
      else {
        d3Select(viewportDomNode)
          .call(
            zoomSystem
              .on('zoom', () => {
                const zoom = d3Event.transform;
                const { x, y, k } = zoom;
                setZoomState((oldZoom) => {
                  if (x == oldZoom.x && y == oldZoom.y && k == oldZoom.k) {
                    return oldZoom;
                  }
                  onZoomChange({
                    x,
                    y,
                    k
                  });
                  return zoom;
                });
              })
              .on('start', () => onZooming(true))
              .on('end', () => onZooming(false))
          )
          .on('dblclick.zoom', null);
        return () => {
          d3Select(viewportDomNode)
            .on('.zoom', null);
        };
      }
    }, [
      disable,
      minZoomScale,
      maxZoomScale,
      zoomSystem,
      onZoomChange,
      onZooming
    ]);

    const initialZoomX = initialZoom && initialZoom.x;
    const initialZoomY = initialZoom && initialZoom.y;
    const initialZoomK = initialZoom && initialZoom.k;
    useEffect(() => {
      if (!initialZoomX) {
        fitToScreen();
      }
      else {
        setZoom(
          createZoom({ x: initialZoomX, y: initialZoomY, k: initialZoomK })
        );
      }
    }, [fitToScreen, setZoom, initialZoomX, initialZoomY, initialZoomK]);
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
  }
);

ZoomableCanvas.displayName = 'ZoomableCanvas';

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
