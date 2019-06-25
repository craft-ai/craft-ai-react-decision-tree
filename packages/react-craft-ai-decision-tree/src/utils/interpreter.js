import { interpreter } from 'craft-ai';
import semver from 'semver';

function createInterpreter(fullDt, outputProperty) {
  const version = semver.major(fullDt._version);
  const dt = fullDt.trees[outputProperty];
  if (version == 1) {
    return {
      version,
      outputProperty,
      dt,
      ...interpreter,
      isLeaf: (dtNode) => dtNode.predicted_value != null,
      getPrediction: (dtNode) => ({
        confidence: dtNode.confidence,
        value: dtNode.predicted_value
      })
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
          const { value } = interpreter.distribution(dtNode);
          if (typeof value === 'number') {
            return {
              value,
              confidence: undefined
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
              confidence: undefined
            };
          }
        }
      }
    };
  }
}

export default createInterpreter;
