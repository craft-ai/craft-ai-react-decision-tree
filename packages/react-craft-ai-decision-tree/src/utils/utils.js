import _ from 'lodash';
import { mix } from 'polished';
import {
  COLOR_LEAVES_CONFIDENCE_0,
  COLOR_LEAVES_CONFIDENCE_1
} from './constants';

export function computeLeafColor(confidence) {
  const blend = Math.pow(confidence, 3);
  return mix(blend, COLOR_LEAVES_CONFIDENCE_1, COLOR_LEAVES_CONFIDENCE_0);
}

export function findSelectedNode(path, tree) {
  console.log('path', path);
  let pathArray = path.split(';');
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
