import _ from 'lodash';
import { interpreter } from 'craft-ai';
import { NODE_PATH_SEPARATOR } from './constants';
import semver from 'semver';

function createInterpreter(fullDt, outputProperty) {
  const version = semver.major(fullDt._version);
  const dt = fullDt.trees[outputProperty];

  const findNodeRecursion = (dtNodeParent, path = []) => {
    if (path.length > 0) {
      const [childIndex, ...pathTail] = path;
      const { dtNode, decisionRules } = findNodeRecursion(
        dtNodeParent.children[childIndex],
        pathTail
      );
      if (dtNodeParent.decision_rule) {
        const { property, operator, operand } = dtNodeParent.decision_rule;
        return {
          dtNode,
          decisionRules: {
            ...decisionRules,
            [property]: [
              {
                operator,
                operand
              },
              ...(decisionRules[property] || [])
            ]
          }
        };
      }
      else {
        return { dtNode, decisionRules };
      }
    }
    else {
      if (dtNodeParent.decision_rule) {
        const { property, operator, operand } = dtNodeParent.decision_rule;
        return {
          dtNode: dtNodeParent,
          decisionRules: {
            [property]: [
              {
                operator,
                operand
              }
            ]
          }
        };
      }
      else {
        return { dtNode: dtNodeParent, decisionRules: [] };
      }
    }
  };

  const findNode = (path) => {
    // making the root node an exception
    if (path == '0') {
      return { dtNode: dt, decisionRules: {} };
    }
    else {
      const [, ...pathTail] = path
        .split(NODE_PATH_SEPARATOR)
        .map((n) => parseInt(n));
      // remove the first element of the path because it is the root path;
      return findNodeRecursion(dt, pathTail);
    }
  };

  if (version == 1) {
    return {
      version,
      outputProperty,
      dt,
      ...interpreter,
      isLeaf: (dtNode) => dtNode.predicted_value != null,
      getPrediction: (dtNode) => ({
        confidence: dtNode.confidence,
        value: dtNode.predicted_value,
        distribution: {
          standard_deviation: dtNode.standard_deviation
        }
      }),
      findNode
    };
  }
  else {
    return {
      version,
      outputProperty,
      dt,
      ...interpreter,
      isLeaf: (dtNode) => dtNode.prediction != null,
      getPrediction: (dtNode) => {
        if (dtNode.prediction) {
          return dtNode.prediction;
        }
        else {
          const { value, ...distribution } = interpreter.distribution(dtNode);
          if (typeof value === 'number') {
            return {
              value,
              confidence: undefined,
              distribution
            };
          }
          else {
            const majClass = value
              .map((p, i) => ({
                value: dt.output_values[i],
                p
              }))
              .reduce(
                (majClass, { value, p }) =>
                  p > majClass.p ? { value, p } : majClass,
                { p: 0 }
              );
            return {
              value: majClass.value,
              confidence: undefined,
              distribution
            };
          }
        }
      },
      findNode
    };
  }
}

export default createInterpreter;
