# `react-craft-ai-operations-history`

`OperationHistory` is a React component aiming at displaying the context operations of a [craft ai](https://craft.ai) agent.

## Usage

A very basic usage looks like that

```js
<OperationsHistory
  agentConfiguration={myAgentConfiguration}
  initialOperations={myAgentOperations}
/>
```

Where `myAgentConfiguration` and `myAgentOperations`are data structures that can be retrieved from the [craft ai API](https://craft.ai/doc).

The component can be used with _load as you scroll_ strategy using the following props

```js
<OperationsHistory
  agentConfiguration={myAgentConfiguration}
  from={myAgent.firstTimestamp}
  to={myAgent.lastTimestamp}
  onRequestOperations={(requestedFrom, requestedTo, requestInitialState) => {
    /* ... */
    return {
      operations, // The retrieved operations
      from, // The first timestamp that was requested
      to, // The last timestamp that was requested
      initialState // If `requestInitialState` is true, the full state of the agent at `from`
    };
  }}
/>
```

## Props reference

### `agentConfiguration` (required)

The configuration of the agent.

### `onRequestOperations`

A function taking three parameters:

- `requestedFrom` the desired operations timestamp lower bound,
- `requestedTo` the desired operations timestamp upper bound,
- `requestInitialState` a boolean telling if the full state at `from` is needed.

This function can return a promise and returns an object having the following properties:

- `operations` the retrieved operations as an array,
- `from` the first timestamp that was requested (can be different from `requestedFrom`, because of page alignment for example),
- `to` the last timestamp that was requested (can be different from `requestedTo`, because of page alignment for example),
- `initialState`, if `requestInitialState` is true, the full state of the agent at `from`.

### `rowHeight` (default is 45)

The height, in pixels, of the rows.

### `height` (default is 600)

The height, in pixels, of the full table.

### `initialOperations`

Array of already loaded operations.

### `to`

The agent's operations timestamp upper bound.

### `from`

The agent's operations timestamp lower bound.

### `focus`

The timestamp that should be highlighted.
