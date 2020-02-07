import { GENERATED_TIME_TYPES } from 'craft-ai/lib/constants';
import last from 'lodash.last';
import orderBy from 'lodash.orderby';
import { Properties, Time } from 'craft-ai';

// ---
// Preprocess a chunk of operations
// - generates values for generated types,
// - feedforward the state.
// ---
function preprocessOperations(
  entityConfiguration,
  operations,
  initialState = {}
) {
  const properties = Object.keys(entityConfiguration.context);
  const tzProperty = properties.find(
    (property) =>
      entityConfiguration.context[property].type === Properties.TYPES.timezone
  );
  const generatedProperties = properties.filter((property) => {
    const propertyCfg = entityConfiguration.context[property];
    return (
      propertyCfg.isGenerated ||
      GENERATED_TIME_TYPES.find(
        (generatedType) => generatedType == propertyCfg.type
      )
    );
  });
  const isGenerator = entityConfiguration.filter !== undefined ? true : false;
  const ascOperations = orderBy(operations, ['timestamp'], ['asc']);
  let previousState = {
    ...initialState
  };
  const enrichedOperations = ascOperations.reduce(
    (enrichedOperations, { context, agentName, timestamp }) => {
      let state;
      if (!isGenerator) {
        state = {
          ...previousState,
          ...context
        };
        // Update the previous state with the newly computed one
        previousState = state;
      }
      else {
        state = {
          ...previousState[agentName],
          ...context
        };
        // Update the previous state with the newly computed one
        previousState[agentName] = state;
      }
      const operationTz = state[tzProperty];
      const time = Time(timestamp, operationTz);
      generatedProperties.forEach((property) => {
        state[property] = time[entityConfiguration.context[property].type];
      });

      enrichedOperations.push({
        timestamp,
        state,
        agentName,
        operation: context
      });

      return enrichedOperations;
    },
    []
  );

  return enrichedOperations;
}

export default preprocessOperations;
