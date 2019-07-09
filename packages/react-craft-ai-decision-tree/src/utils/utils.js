import _ from 'lodash';
import { mix } from 'polished';
import {
  COLOR_LEAVES_CONFIDENCE_0,
  COLOR_LEAVES_CONFIDENCE_1,
  COLOR_LEAVES_CONFIDENCE_UNDEFINED,
  NODE_PATH_SEPARATOR
} from './constants';

export function computeLeafColor(confidence) {
  if (confidence != null) {
    const blend = Math.pow(confidence, 3);
    return mix(blend, COLOR_LEAVES_CONFIDENCE_1, COLOR_LEAVES_CONFIDENCE_0);
  }
  return COLOR_LEAVES_CONFIDENCE_UNDEFINED;
}

export function findSelectedNode(path, tree) {
  let pathArray = path.split(NODE_PATH_SEPARATOR);
  // making the root node an exception
  if (path == '0') {
    return tree;
  }
  else {
    // remove the first element of the path because it is the root path;
    return findSelectedNodeRecursion(_.tail(pathArray), tree, {});
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
    const indexChild = parseInt(path[0]);
    return findSelectedNodeRecursion(
      _.tail(path),
      tree.children[indexChild],
      decisionRules
    );
  }
  else {
    tree.decisionRules = decisionRules;
    return tree;
  }
}

export const computeSamplesCount = _.memoize((dtNode) => {
  const selfCount = (dtNode.prediction && dtNode.prediction.nb_samples) || 0;
  const children = dtNode.children || [];
  return children.reduce(
    (count, child) => count + computeSamplesCount(child),
    selfCount
  );
});
