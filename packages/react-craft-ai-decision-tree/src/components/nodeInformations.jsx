import _ from 'lodash';
import { interpreter } from 'craft-ai';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

const NodeInformationsContainer = styled('div')`
  width: 200;
  display: flex;
  flex-direction: column;
  float: left;
  z-index: 586;
  padding: 10px;
  position: relative;
  background-color: white;
  border-right: solid 1px;
`;

const NodePredictions = ({ node }) => {
  return (
    <div className='node-predictions '>
      <h2>Predictions</h2>
      <ul>
        <li>Value: {node.predicted_value}</li>
        <li>Confidence: {(node.confidence * 100).toFixed(2)}%</li>
        {!_.isUndefined(node.standard_deviation) ? (
          <li>Standard deviation: {node.standard_deviation.toFixed(2)}</li>
        ) : null}
      </ul>
    </div>
  );
};

NodePredictions.propTypes = {
  node: PropTypes.object.isRequired
};

class NodeDecisionRules extends React.Component {
  displayConditions = (key) => {
    const decisionRule = interpreter.reduceDecisionRules(
      this.props.node.decisionRules[key]
    );
    // Add the type to format properly the decision rule
    decisionRule[0].type = this.props.context[key].type;
    const text = interpreter.formatDecisionRules(decisionRule);
    return <li key={ key }>{`${key}: ${text}`}</li>;
  };

  render() {
    const decisionRulesKeys = this.props.node
      ? _.keys(this.props.node.decisionRules)
      : [];
    return (
      <div className='node-decision-rules'>
        <h2>Decision rules</h2>
        {!decisionRulesKeys.length ? (
          <p>This is the root node</p>
        ) : (
          <ul>{_.map(decisionRulesKeys, this.displayConditions)}</ul>
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
      return <li key={ key }>{`${child.decision_rule.property}: ${text}`}</li>;
    }
    catch (err) {
      return (
        <li style={{ color: 'red' }} key={ key }>
          {err.message}
        </li>
      );
    }
  };

  render() {
    return (
      <div className='node-split'>
        <h2>Split</h2>
        <ul>{_.map(this.props.node.children, this.displaySplit)}</ul>
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
        <NodeInformationsContainer className='node-informations'>
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
          {selectedNode.predicted_value ? ( // we are in a leaf
            <NodePredictions node={ selectedNode } /> // we are in a node
          ) : null}
          {selectedNode.predicted_value ? null : ( // we are in a leaf
            <NodeSplit
              context={ this.props.configuration.context }
              node={ selectedNode }
            /> // we are in a node
          )}
          <NodeDecisionRules
            context={ this.props.configuration.context }
            node={ selectedNode }
          />
        </NodeInformationsContainer>
      );
    }
    else {
      return <div className='node-informations' />;
    }
  }
}

NodeInformations.propTypes = {
  updateSelectedNode: PropTypes.func.isRequired,
  configuration: PropTypes.object.isRequired,
  treeData: PropTypes.object.isRequired,
  selectedNode: PropTypes.string.isRequired
};

export default NodeInformations;
