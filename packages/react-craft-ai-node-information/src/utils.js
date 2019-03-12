export default function findSelectedNode(path, tree) {
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
