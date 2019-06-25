import _ from 'lodash';
import EdgeLabel from './edgeLabel';
import Node from './node';
import PropTypes from 'prop-types';
import ToolTip from 'react-craft-ai-tooltip';
import React, { useCallback, useMemo, useState } from 'react';

const DT_UTILS_V1 = {
  isLeaf: (dtNode) => dtNode.predicted_value != null,
  getPrediction: (dtNode) => ({
    confidence: dtNode.confidence,
    value: dtNode.predicted_value
  })
};

const DT_UTILS_V2 = {
  isLeaf: (dtNode) => dtNode.prediction != null,
  getPrediction: (dtNode) => dtNode.prediction || {}
};

const NodesEdgesLabels = React.memo(function NodesEdgesLabels({
  links,
  configuration,
  onShowTooltip,
  onHideTooltip
}) {
  return (
    <React.Fragment>
      {links.map((hLink, index) => (
        <EdgeLabel
          key={ index }
          hLink={ hLink }
          configuration={ configuration }
          onShowTooltip={ onShowTooltip }
          onHideTooltip={ onHideTooltip }
        />
      ))}
    </React.Fragment>
  );
});

NodesEdgesLabels.propTypes = {
  configuration: PropTypes.object.isRequired,
  links: PropTypes.array.isRequired,
  onShowTooltip: PropTypes.func.isRequired,
  onHideTooltip: PropTypes.func.isRequired
};

const NodesNodes = React.memo(function NodesNodes({
  descendants,
  selectedNodePath,
  onSelectNode,
  onToggleSubtreeFold,
  onShowTooltip,
  onHideTooltip,
  dtUtils
}) {
  return (
    <React.Fragment>
      {descendants.map((hNode, index) => (
        <Node
          key={ index }
          hNode={ hNode }
          selected={ hNode.path === selectedNodePath }
          // eslint-disable-next-line react/jsx-no-bind
          onSelectNode={ () => onSelectNode(hNode.path) }
          // eslint-disable-next-line react/jsx-no-bind
          onToggleSubtreeFold={ () => onToggleSubtreeFold(hNode) }
          onShowTooltip={ onShowTooltip }
          onHideTooltip={ onHideTooltip }
          dtUtils={ dtUtils }
        />
      ))}
    </React.Fragment>
  );
});

NodesNodes.propTypes = {
  descendants: PropTypes.array.isRequired,
  selectedNodePath: PropTypes.string,
  onSelectNode: PropTypes.func.isRequired,
  onToggleSubtreeFold: PropTypes.func.isRequired,
  onShowTooltip: PropTypes.func.isRequired,
  onHideTooltip: PropTypes.func.isRequired,
  dtUtils: PropTypes.object.isRequired
};

const Nodes = ({
  version,
  hierarchy,
  selectedNodePath,
  selectable,
  updateSelectedNode,
  onToggleSubtreeFold,
  configuration
}) => {
  const dtUtils = version == 1 ? DT_UTILS_V1 : DT_UTILS_V2;

  const [tooltip, setTooltip] = useState({
    show: false,
    text: '',
    ref: null,
    placement: 'bottom'
  });

  const hideTooltip = useCallback(
    () =>
      setTooltip((tooltip) => ({
        ...tooltip,
        show: false,
        placement: 'bottom'
      })),
    []
  );

  const showTooltip = useCallback((ref, text) => {
    setTooltip((tooltip) => ({
      ...tooltip,
      show: true,
      text,
      ref
    }));
  }, []);

  const updateTooltipPlacement = useCallback((placeTooltipTop) => {
    const newPlacement = placeTooltipTop ? 'top' : 'bottom';
    setTooltip((tooltip) => {
      if (tooltip.placement !== newPlacement) {
        return {
          ...tooltip,
          placement: newPlacement
        };
      }
      return tooltip;
    });
  }, []);

  const selectNode = useCallback(
    (selectedNodeTreePath) => {
      if (updateSelectedNode) {
        updateSelectedNode(selectedNodeTreePath);
      }
    },
    [updateSelectedNode]
  );

  const toggleSubtreeFold = useCallback(
    (hNode) => {
      if (onToggleSubtreeFold) {
        onToggleSubtreeFold(hNode);
      }
    },
    [updateSelectedNode]
  );

  const descendants = useMemo(() => hierarchy.descendants(), [hierarchy]);
  const links = useMemo(() => hierarchy.links(), [hierarchy]);

  return (
    <div style={{ position: 'relative' }}>
      <NodesNodes
        descendants={ descendants }
        selectedNodePath={ selectedNodePath }
        onSelectNode={ selectNode }
        onToggleSubtreeFold={ toggleSubtreeFold }
        onShowTooltip={ showTooltip }
        onHideTooltip={ hideTooltip }
        dtUtils={ dtUtils }
      />
      <NodesEdgesLabels
        links={ links }
        configuration={ configuration }
        onShowTooltip={ showTooltip }
        onHideTooltip={ hideTooltip }
      />
      <ToolTip
        style={{
          pointerEvents: 'none'
        }} // disable click on tooltip
        show={ selectable && tooltip.show }
        placement={ tooltip.placement }
        target={ tooltip.ref }
        onPlacementUpdated={ updateTooltipPlacement }
      >
        {tooltip.text}
      </ToolTip>
    </div>
  );
};

Nodes.propTypes = {
  selectable: PropTypes.bool.isRequired,
  updateSelectedNode: PropTypes.func,
  configuration: PropTypes.object.isRequired,
  hierarchy: PropTypes.object.isRequired,
  version: PropTypes.number.isRequired,
  selectedNodePath: PropTypes.string,
  onToggleSubtreeFold: PropTypes.func.isRequired
};

export default Nodes;
