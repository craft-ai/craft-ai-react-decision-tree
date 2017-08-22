import _ from 'lodash';
import Box from '../utils/box';
import classnames from 'classnames';
import Edges from './edges';
import glamorous from 'glamorous';
import Nodes from './nodes';
import PropTypes from 'prop-types';
import React from 'react';
import { event as d3Event, select as d3Select } from 'd3-selection';
import { hierarchy as d3Hierarchy, tree as d3Tree } from 'd3-hierarchy';
import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom';
import {
  MARGIN, NODE_DEPTH, NODE_HEIGHT,
  NODE_WIDTH, NODE_WIDTH_MARGIN, ZOOM_EXTENT
} from '../utils/constants';

function computeFitTransformation(treeBbox, canvasBbox, prevTransformation, scaleExtent = ZOOM_EXTENT) {
  // from https://developer.mozilla.org/en/docs/Web/SVG/Attribute/transform
  // worldX = localX * scaleX + translateX
  // <=>
  // localX = (worldX - translateX) / scaleX

  // 1 - Compute the scales to apply to have the tree match the canvas.
  const scaleX = canvasBbox.delta.x * prevTransformation.scale / treeBbox.delta.x;
  const scaleY = canvasBbox.delta.y * prevTransformation.scale / treeBbox.delta.y;
  const scale = Math.max(scaleExtent[0], Math.min(Math.min(scaleX, scaleY, scaleExtent[1])));

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
    canvasBbox.origin.x + canvasBbox.delta.x / 2 - (treeBbox.origin.x + treeBbox.delta.x / 2 - prevTransformation.newPos[0]) / prevTransformation.scale * scale,
    canvasBbox.origin.y + canvasBbox.delta.y / 2 - (treeBbox.origin.y + treeBbox.delta.y / 2 - prevTransformation.newPos[1]) / prevTransformation.scale * scale
  ];

  return {
    scale: scale,
    newPos: translate
  };
}

const CraftAiTree = glamorous.div({
  minWidth: 400,
  overflow: 'hidden',
  backgroundColor: 'white',
  position: 'absolute'
});

const TranslatedTree = glamorous.div({
  transformOrigin: 'left top 0px'
});


function computeSvgSizeFromData(root, width, height) {
  let tree = d3Tree().nodeSize([NODE_WIDTH + NODE_WIDTH_MARGIN, NODE_HEIGHT]);
  const nodes = d3Hierarchy(root, (d) => d.children);
  tree(nodes);
  const links = nodes.links();

  let dxMin;
  let dxMax;
  let maxTreeDepth = 0;
  let minSvgWidth;
  let minSvgHeight;

  // Compute the max tree depth(node which is the lowest leaf)
  _.forEach(nodes.descendants(), (d) => {
    if (d.parent) {
      if (d.parent.decisionRules) {
        d.decisionRules = _.cloneDeep(d.parent.decisionRules);
      }
      else {
        d.decisionRules = {};
      }
      if (d.decisionRules[d.data.decision_rule.property]) {
        d.decisionRules[d.data.decision_rule.property].push({
          operator: d.data.decision_rule.operator,
          operand: d.data.decision_rule.operand
        });
      }
      else {
        d.decisionRules[d.data.decision_rule.property] = [{
          operator: d.data.decision_rule.operator,
          operand: d.data.decision_rule.operand
        }];
      }
    }

    if (d.depth > maxTreeDepth) {
      maxTreeDepth = d.depth;
    }

    // Normalize for fixed-depth.
    d.y = d.depth * NODE_DEPTH;

    if (_.isUndefined(dxMin) || d.x < dxMin) {
      dxMin = d.x;
    }
    if (_.isUndefined(dxMax) || d.x > dxMax) {
      dxMax = d.x;
    }
  });

  minSvgHeight = (maxTreeDepth + 1) * NODE_DEPTH;
  minSvgWidth = Math.abs(dxMin) + Math.abs(dxMax) + NODE_WIDTH;

  return {
    minSvgWidth: minSvgWidth,
    minSvgHeight: minSvgHeight,
    nodes: nodes.descendants(),
    links: links,
    offsetX: Math.abs(dxMin) + NODE_WIDTH / 2
  };
}

class Tree extends React.Component {
  state = {
    isPanActivated: false,
    newPos: [0, 0],
    scale: 1,
    zoom: d3Zoom(),
    offsetX: 0
  }

  componentDidMount() {
    const selection = d3Select('div.zoomed-tree');
    selection.call(
      this.state.zoom
        .scaleExtent(ZOOM_EXTENT)
        .on('zoom', this.mouseWheel)
        .on('start', this.onPanningActivated)
        .on('end', this.onPanningDeactivated)
    ).on('dblclick.zoom', null);
    this.resetPosition();
  }

  componentWillUnmount() {
    clearTimeout(this.fitToScreenTimeout);
  }

  mouseWheel = () => {
    this.setState({
      scale: d3Event.transform.k,
      newPos: [d3Event.transform.x, d3Event.transform.y]
    });
  }

  doFitToScreen = () => {
    const canvasBbox = new Box(d3Select('div.zoomed-tree').node().getBoundingClientRect());
    const marginedCanvasBbox = canvasBbox.applyMargin(MARGIN);
    const treeBbox = new Box(d3Select('div.translated-tree').node().getBoundingClientRect());
    const { newPos, scale } = computeFitTransformation(treeBbox, marginedCanvasBbox, this.state);
    this.setState({ newPos: newPos, scale: scale });
    const selection = d3Select('div.zoomed-tree');
    selection.call(this.state.zoom.transform, zoomIdentity.translate(newPos[0], newPos[1]).scale(scale));
  }

  resetPosition = () => {
    this.doFitToScreen();
    this.fitToScreenTimeout = setTimeout(() => this.doFitToScreen(), 0);
  }

  onPanningActivated = () => {
    this.setState({ isPanActivated: true });
  }

  onPanningDeactivated = () => {
    this.setState({ isPanActivated: false });
  }

  render() {
    const margin = { top: 40, bottom: 20 };
    const width = this.props.width;
    const height = this.props.height - margin.top - margin.bottom;

    let root = this.props.treeData;
    root.x = 0;
    root.y = 0;

    const { links, minSvgHeight, minSvgWidth, nodes, offsetX  } = computeSvgSizeFromData(root, width, height);

    // place correctly the tree in the svg with the minSvgWidth
    _.forEach(nodes, (d) => {
      d.x = d.x + offsetX;
      d.y = d.y + NODE_HEIGHT / 3; // take in account the height of the node above the link
    });

    return (
      <CraftAiTree
        onDoubleClick={ this.resetPosition }
        className='tree zoomed-tree'
        style={{
          height: this.props.height,
          width: this.props.width
        }}>
        <TranslatedTree
          onDoubleClick={ this.resetPosition }
          className={ classnames('translated-tree', { unselectable: this.state.isPanActivated, selectable: !this.state.isPanActivated }) }
          style={{
            transform: `translate(${this.state.newPos[0]}px,${this.state.newPos[1]}px) scale(${this.state.scale})`,
            width: minSvgWidth,
            height: minSvgHeight
          }}>
          <Nodes
            height={ this.props.height }
            configuration={ this.props.configuration }
            nodes={ nodes }
            links={ links } />
          <Edges
            treeData={ this.props.treeData }
            nodes={ nodes }
            links={ links }
            width={ minSvgWidth }
            height={ minSvgHeight } />
        </TranslatedTree>
      </CraftAiTree>
    );
  }
}

Tree.propTypes = {
  treeData: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired
};

export default Tree;
