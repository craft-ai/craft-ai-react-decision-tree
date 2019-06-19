import { computeSamplesCount } from '../utils/utils';
import { css } from 'react-emotion';
import { select as d3Select } from 'd3';
import PropTypes from 'prop-types';
import {
  ADDITIONAL_SELECTED_STROKE_WIDTH,
  DEFAULT_COLOR_EDGES,
  DEFAULT_MINIMUM_STROKE_WIDTH,
  DEFAULT_STROKE_WIDTH_RATIO,
  NODE_HEIGHT,
  NODE_WIDTH,
  SELECTED_COLOR_EDGES
} from '../utils/constants';
import React, { useEffect } from 'react';

// make links css rules
const defaultLinksCssClass = css`
  position: relative;
  fill: none;
  stroke: ${DEFAULT_COLOR_EDGES};
`;

const selectedLinksCssClass = css`
  position: relative;
  fill: none;
  stroke: ${SELECTED_COLOR_EDGES};
`;

function diagonal(source, target) {
  return `M${source.x},${source.y}C${source.x},${(source.y + target.y) / 2} ${
    target.x
  },${(source.y + target.y) / 2} ${target.x},${target.y}`;
}

function drawNodes(domNode, { descendants }) {
  d3Select(domNode)
    .selectAll('g.node')
    .data(descendants, (d) => d.id)
    .join(
      (enter) =>
        enter.append('g')
          .attr('transform', (d) => {
            if (d.parent) {
              return `translate(${d.parent.x},${d.parent.y})`;
            }
            return `translate(${d.x},${d.y})`;
          }),
      (update) =>
        update
          .transition()
          .attr('transform', (d) => `translate(${d.x},${d.y})`),
      (exit) => exit.remove()
    )
    .classed('node', true)
    .append('rect')
    .attr('x', -NODE_WIDTH / 2)
    .attr('y', -NODE_HEIGHT / 2)
    .attr('width', NODE_WIDTH)
    .attr('height', NODE_HEIGHT)
    .attr('fill', 'none');
}

function drawLinks(domNode, { descendants, links, edgePath, edgeType }) {
  d3Select(domNode)
    .selectAll('path')
    .data(links, (d) => {
      d.linkClass = defaultLinksCssClass;
      if (edgePath.indexOf(d.target.id) !== -1) {
        d.linkClass = selectedLinksCssClass;
      }
      return d.target.id;
    })
    .join(
      (enter) => enter.append('path'),
      (update) => update,
      (exit) => exit.remove()
    )
    .attr('stroke-width', (d) => {
      if (edgeType == 'constant') {
        return d.linkClass == selectedLinksCssClass
          ? DEFAULT_MINIMUM_STROKE_WIDTH + ADDITIONAL_SELECTED_STROKE_WIDTH
          : DEFAULT_MINIMUM_STROKE_WIDTH;
      }
      else if (edgeType == 'absolute' || edgeType == 'relative') {
        let branchRatio;
        if (edgeType == 'absolute') {
          branchRatio =
            computeSamplesCount(d.target.data) /
            computeSamplesCount(descendants[0].data);
        }
        else {
          branchRatio =
            computeSamplesCount(d.target.data) /
            computeSamplesCount(d.source.data);
        }
        const strokeWidth =
          DEFAULT_STROKE_WIDTH_RATIO * branchRatio <
          DEFAULT_MINIMUM_STROKE_WIDTH
            ? DEFAULT_MINIMUM_STROKE_WIDTH
            : DEFAULT_STROKE_WIDTH_RATIO * branchRatio;
        if (d.linkClass == selectedLinksCssClass) {
          return strokeWidth + ADDITIONAL_SELECTED_STROKE_WIDTH;
        }
        return strokeWidth;
      }
      else {
        throw new Error(
          'Unexpected edgeType variable, only \'constant\', \'relative\' or \'absolute\' values are accepted.'
        );
      }
    })
    .attr('d', (d) => {
      const source = {
        x: d.source.x,
        y: d.source.y + NODE_HEIGHT / 2
      };
      const target = {
        x: d.target.x,
        y: d.target.y - NODE_HEIGHT / 3
      };
      return diagonal(source, target);
    })
    .attr('class', (d) => {
      return `${d.linkClass} ${
        d.linkClass == selectedLinksCssClass ? 'selected-link' : ''
      }`;
    });
}

const Edges = ({ edgePath, dt, hierarchy, width, height, edgeType }) => {
  const canvas = React.createRef();

  useEffect(
    () => {
      const descendants = hierarchy.descendants();
      const links = hierarchy.links();
      // ------------ NODES ------------
      drawNodes(canvas.current, { descendants });

      // ------------ LINKS ------------
      drawLinks(canvas.current, {
        links,
        edgePath,
        edgeType,
        descendants
      });
    },
    [canvas, hierarchy, edgePath, edgeType]
  );

  return <svg ref={ canvas } width={ width } height={ height } />;
};
Edges.propTypes = {
  edgePath: PropTypes.array.isRequired,
  dt: PropTypes.object.isRequired,
  hierarchy: PropTypes.object.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  edgeType: PropTypes.string
};

export default Edges;
