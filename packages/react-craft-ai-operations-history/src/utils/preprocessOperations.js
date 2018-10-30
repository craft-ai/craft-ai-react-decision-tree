import last from 'lodash.last';
import orderBy from 'lodash.orderby';
import { GENERATED_TIME_TYPES } from 'craft-ai/lib/constants';
import { Properties, Time } from 'craft-ai';

// ---
// Preprocess a chunk of operations
// - generates values for generated types,
// - feedforward the state.
// ---
function preprocessOperations(
  agentConfiguration,
  operations,
  initialState = {}
) {
  const properties = Object.keys(agentConfiguration.context);
  const tzProperty = properties.find(
    (property) =>
      agentConfiguration.context[property].type === Properties.TYPES.timezone
  );
  const generatedProperties = properties.filter((property) => {
    const propertyCfg = agentConfiguration.context[property];
    return (
      propertyCfg.isGenerated ||
      GENERATED_TIME_TYPES.find(
        (generatedType) => generatedType == propertyCfg.type
      )
    );
  });
  const ascOperations = orderBy(operations, ['timestamp'], ['asc']);
  const enrichedOperations = ascOperations.reduce(
    (enrichedOperations, { context, timestamp }) => {
      const previousState =
        (last(enrichedOperations) || {}).state || initialState;
      const state = {
        ...previousState,
        ...context
      };
      const operationTz = state[tzProperty];
      generatedProperties.forEach(
        (property) =>
          Time(timestamp, operationTz)[
            agentConfiguration.context[property].type
          ]
      );

      enrichedOperations.push({
        timestamp,
        state,
        operation: context
      });
      return enrichedOperations;
    },
    []
  );
  const descOperations = orderBy(enrichedOperations, ['timestamp'], ['desc']);
  return descOperations;
}

export default preprocessOperations;
