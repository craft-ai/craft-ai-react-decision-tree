import _ from 'lodash';
import { computeLeafColor } from '../utils/utils';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import { height } from 'window-size';

const NodeInformationsContainer = styled('div')`
  width: 200px;
  display: flex;
  flex-direction: column;
  float: left;
  z-index: 586;
  padding: 10px;
  position: relative;
  background-color: white;
  border-right: solid 1px;
`;

const NodePredictions = ({ node, treeVersion, configuration }) => {
  let confidence;
  let std;
  let value;
  if (treeVersion == '1') {
    confidence = node.confidence;
    std = node.standard_deviation;
    value = node.predicted_value;
  }
  else {
    if (node.prediction) {
      confidence = node.prediction.confidence;
      std = node.prediction.distribution
        ? node.prediction.distribution.standard_deviation
        : undefined;
      value = node.prediction.value;
    }
  }
  return (
    <div className="node-predictions">
      {value ? (
        <div
          style={{
            backgroundColor: computeLeafColor(confidence),
            padding: '10px',
            textAlign: 'center',
            marginTop: 10
          }}
        >
          <div style={{ fontSize: '1.3em', marginBottom: 5 }}>
            <code>{configuration.output[0]}</code> {value}
          </div>
          <div>Confidence {(confidence * 100).toFixed(2)}%</div>
          <div>Standard deviation {std.toFixed(2)}</div>
        </div>
      ) : null}
    </div>
  );
};

NodePredictions.propTypes = {
  node: PropTypes.object.isRequired,
  configuration: PropTypes.object.isRequired,
  treeVersion: PropTypes.string.isRequired
};

const NodeStatistics = ({ node }) => {
  if (node.nb_samples) {
    return (
      <div className="node-predictions">
        <h3 style={{ textAlign: 'center' }}>Statistics</h3>
        <ul style={{ listStyle: 'none', paddingInlineStart: 0 }}>
          <li>{node.nb_samples} samples</li>
        </ul>
      </div>
    );
  }
  return <div />;
};

NodeStatistics.propTypes = {
  node: PropTypes.object.isRequired
};

class NodeDecisionRules extends React.Component {
  displayConditions = (key, index) => {
    const decisionRule = interpreter.reduceDecisionRules(
      this.props.node.decisionRules[key]
    );
    // Add the type to format properly the decision rule
    decisionRule[0].type = this.props.context[key].type;
    const text = interpreter
      .formatDecisionRules(decisionRule)
      .replace(/ /g, '\u00a0');
    console.log('index', index);
    return (
      <tr key={ key }>
        <td
          style={{
            borderTop: index !== 0 ? 'solid 1px black' : 'none'
          }}
        >
          <code>{key}</code>
        </td>
        <td style={{ borderTop: index !== 0 ? 'solid 1px black' : 'none' }}>
          {text}
        </td>
      </tr>
    );
  };

  render() {
    const decisionRulesKeys = this.props.node
      ? _.keys(this.props.node.decisionRules)
      : [];
    return (
      <div className="node-decision-rules">
        <h3 style={{ textAlign: 'center' }}>Decision rules</h3>
        {!decisionRulesKeys.length ? (
          <div>N/A (root node)</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>{_.map(decisionRulesKeys, this.displayConditions)}</tbody>
          </table>
        )}
      </div>
    );
  }
}

NodeDecisionRules.propTypes = {
  context: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired
};

class NodeSplit extends React.Component {
  displaySplit = (child, key) => {
    try {
      const propertyType = this.props.context[child.decision_rule.property]
        .type;
      const text = interpreter.formatDecisionRules([
        {
          operand: child.decision_rule.operand,
          operator: child.decision_rule.operator,
          type: propertyType
        }
      ]);
      return (
        <tr key={ key }>
          <td style={{ borderTop: key !== 0 ? 'solid 1px black' : 'none' }}>
            {child.decision_rule.property}
          </td>
          <td style={{ borderTop: key !== 0 ? 'solid 1px black' : 'none' }}>
            {text}
          </td>
        </tr>
      );
    }
    catch (err) {
      return (
        <tr style={{ color: 'red' }} key={ key }>
          <td>{err.message}</td>
        </tr>
      );
    }
  };

  render() {
    return (
      <div className="node-split">
        <h3 style={{ textAlign: 'center' }}>Splits</h3>
        {!this.props.node.children ? (
          <p>N/A (leaf node)</p>
        ) : (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>{_.map(this.props.node.children, this.displaySplit)}</tbody>
          </table>
        )}
      </div>
    );
  }
}

NodeSplit.propTypes = {
  node: PropTypes.object.isRequired,
  context: PropTypes.object.isRequired
};

function findSelectedNode(path, tree) {
  // making the root node an exception
  if (path == '0') {
    return tree;
  }
  else {
    // remove the first element of the path because it is the root path;
    let childrenPath = path.substr(1);
    return findSelectedNodeRecursion(childrenPath, tree, {});
  }
}

function findSelectedNodeRecursion(path, tree, decisionRules) {
  // adding decision rules of the node
  if (tree.decision_rule) {
    if (decisionRules[tree.decision_rule.property]) {
      decisionRules[tree.decision_rule.property].push({
        operator: tree.decision_rule.operator,
        operand: tree.decision_rule.operand
      });
    }
    else {
      decisionRules[tree.decision_rule.property] = [
        {
          operator: tree.decision_rule.operator,
          operand: tree.decision_rule.operand
        }
      ];
    }
  }
  if (path.length !== 0) {
    const indexChild = parseInt(path.charAt(0));
    return findSelectedNodeRecursion(
      path.substr(1),
      tree.children[indexChild],
      decisionRules
    );
  }
  else {
    tree.decisionRules = decisionRules;
    return tree;
  }
}

class NodeInformations extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showNodeInformations: false
    };
  }

  closeNodeInformation = () => {
    this.props.updateSelectedNode();
  };

  render() {
    if (this.props.selectedNode) {
      const selectedNode = findSelectedNode(
        this.props.selectedNode,
        this.props.treeData
      );
      return (
        <NodeInformationsContainer
          className="node-informations"
          style={{ height: this.props.height }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <button
              style={{ cursor: 'pointer' }}
              onClick={ this.closeNodeInformation }
            >
              X
            </button>
          </div>
          <NodePredictions
            configuration={ this.props.configuration }
            node={ selectedNode }
            treeVersion={ this.props.treeVersion }
          />
          <NodeDecisionRules
            context={ this.props.configuration.context }
            node={ selectedNode }
          />
          <NodeSplit
            context={ this.props.configuration.context }
            node={ selectedNode }
          />
          <NodeStatistics node={ selectedNode } />
        </NodeInformationsContainer>
      );
    }
    else {
      return <div className="node-informations" />;
    }
  }
}

NodeInformations.propTypes = {
  updateSelectedNode: PropTypes.func.isRequired,
  configuration: PropTypes.object.isRequired,
  treeVersion: PropTypes.string.isRequired,
  treeData: PropTypes.object.isRequired,
  selectedNode: PropTypes.string.isRequired,
  height: PropTypes.number.isRequired
};

export default NodeInformations;
