# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.32...HEAD)

## [0.0.32](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.31...v0.0.32) - 2020-02-20

## Fixed

- Rename generator operation property from "agentName" to "agent_id".

## [0.0.31](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.30...v0.0.31) - 2020-02-13

## Fixed

- Fix horizontal scroll vizualisation.

## [0.0.30](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.29...v0.0.30) - 2020-02-12

## Fixed

- Fix the width of a row when its a generators.
- Fix the horizontal scoll between the header and the row.

## [0.0.29](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.28...v0.0.29) - 2020-02-10

## Added

- Add support for generator inside the operations widget component.
- Expose a parameter initial state to compute generated types on non dynamically loading operations.

## Fixed

- In the `DecisionTree` component, when double-clicking on a folding button, the tree does not fit to screen anymore.
- Fix propTypes warning.
- Fix issue when the `from` and the `to` where equals.
- Fix operations widget width issue.

## [0.0.28](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.27...v0.0.28) - 2020-01-28

## Fixed

- In the `DecisionTree` component, when selecting a node and changing the `data` prop, it unselects now the previous selected node.

## [0.0.27](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.26...v0.0.27) - 2019-12-12

## Fixed

- Fix the computed width of cells in the operation widget.

## [0.0.26](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.25...v0.0.26) - 2019-08-05

## Added

- `DecisionTree` accepts `updateFoldedNodes` function as a prop. This latter is called when a new node is folded and passes the current folded nodes.

## Fixed

- Boolean output leaves are properly rendered.

## [0.0.25](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.24...v0.0.25) - 2019-07-24

## Fixed

- The Decision tree now has a minimum height and weight to make sure it is always shown.
- `react-craft-ai-operations-history` has now a default estimated period between samples of 1.
- Position and zoom can now be correctly set in the DecisionTree props.
- Nodes button are not moving when they are selected.

## [0.0.24](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.23...v0.0.24) - 2019-07-10

## Added

- Introduce a Decision Tree props `foldedNodes` to set which nodes' subtrees will be folded.

## Changed

- `DecisionTreeWithPanel` can now be provided by an initial `selectedNode`.
- Decision Tree folded nodes now display the predicted values of the folded tree.
- `DecisionTreeWithPanel` & `DecisionTree` no longer require `width` and `height` to be dimensioned properly.
- The panel in `DecisionTreeWithPanel` now appears over the tree itself.

## Fixed

- Decision tree _fit-to-screen_ (when double clicking) now works with a single render and is therefore smoother.
- Decision tree selected node label offset is properly applied.
- Decision tree edges labels are now placed _more_ properly.
- Decision tree nodes that are not selectable no longer change the mouse pointer.
- Decision tree missing and optional branches are now well formatted.

## Removed

- `collapsedDepth` props is no longer supported, users need to migrate to the `foldedNodes` props.

## [0.0.23](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.22...v0.0.23) - 2019-06-18

## Added

- Trees are now foldable. The props `collapsedDepth` has been added to the `Tree` component setting the depth after which nodes are folded. A node can be expanded by clicking the `+` button under it and collapsed by clicking the `-` button.
- Display the major class (classification) or output value (regression) in any nodes.

## Fixed

- The decision tree no longer relies on 'immutable'.
- Fixing the versions for React peer dependencies.
- Explicitely setting the box sizing policy to 'content-box' for the decision tree 'Node' component.

## [0.0.22](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.21...v0.0.22) - 2019-04-29

## Fixed

- Edges toolTips properly close when the mouse goes out.
- Histogram bars have the right amount of samples they contain.
- Show prediction for '0' output value.
- Fix the nodepath regex to accept non-binary splits.

## Changed

- Histogram plots are 90° rotated.

## [0.0.21](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.20...v0.0.21) - 2019-04-10

## Added

- Add an information button on the boxplot to explain how to read it.
- Expose the style parameter in `NodeInformation`.

## Changed

- Minor update of the presentation of the node information.

## [0.0.20](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.19...v0.0.20) - 2019-04-09

## Added

- `react-craft-ai-operations-history` now supports horizontal scroll and has a `width` property.
- Expose the selectedNode parameter in `react-craft-ai-decision-tree`. Only available for the DecisionTree component.

## Fixed

- `react-craft-ai-operations-history` now throw an error if the given `onRequestOperations` does not behave properly.
- NodeInformation has now a vertical overflow.

## [0.0.19](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.18...v0.0.19) - 2019-03-22

## Added

- Display the number of samples on the leaves
- Add the possibility to import separate component:
  - DecisionTree with panel by default
  - DecisionTree alone
  - Component of the panel (NodeInformation, Split, DecisionRules, Prediction and Statistics)
- Edges width can be 'constant', 'absolute' or 'relative' with the parameter `edgeType`
- Add Histograms for Classification and Boxplots for Regression in the panel in every node.

## Changed

- Change the popover of the leaf to a panel
- Refactor the visualization of the data in all the nodes

## [0.0.18](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.17...v0.0.18) - 2019-02-28

## Added

- Expose the scale and the position of the tree.

## [0.0.17](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.16...v0.0.17) - 2019-01-03

## Fixed

- Fix warning with deprecated function to reduce the decision rules.
- Fix mouseover on the leafs that leads to an unopened popover.

## [0.0.16](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.15...v0.0.16) - 2018-12-18

## Added

- Demo page for `react-craft-ai-operations-history`.

## Fixed

- Fixing the build of the decision tree component.

## [0.0.15](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.14...v0.0.15) - 2018-12-05

## Added

- Introducing `react-craft-ai-operations-history`.

## [0.0.14](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.13...v0.0.14) - 2018-11-21

## Fixed

- Fixing the decision_rules display in the leaf popover and on links

## [0.0.13](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.12...v0.0.13) - 2018-11-20

## Fixed

- Fix the dependencies to `emotion` and `react-emotion`.

## [0.0.12](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.11...v0.0.12) - 2018-11-16

## Changed

- Update the version of the craft ai client
- Zoom level is increased in `react-craft-ai-decision-tree`.
- Now using `emotion` and `react-emotion` for styles instead of `glamor`/`glamorous`.

## Fixed

- Panning and zooming on big decision trees is more responsive in `react-craft-ai-decision-tree`.

## [0.0.10](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.9...v0.0.10) - 2017-12-15

## Fixed

- `d3` packages are now included in the `react-craft-ai-decision-tree` umd.

## [0.0.9](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.8...v0.0.9) - 2017-12-13

## Added

- `react-craft-ai-decision-tree` is now packaged as a UMD module and available through [unpkg](https://unpkg.com/).

## [0.0.8](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.7...v0.0.8) - 2017-09-28

## Changed

- Making the decision tree leaves confidence color scheme more neutral.

## [0.0.7](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.6...v0.0.7) - 2017-09-13

## Fixed

- Infinite loop that was occurring when rendering the leaves tooltips.

## [0.0.6](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.5...v0.0.6) - 2017-08-23

## Added

- Relevant keywords for the packages.

## [0.0.5](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.4...v0.0.5) - 2017-08-22

## Added

- Component demo pages powered by [Storybook](https://storybook.js.org).

## Fixed

- Fix the way the popover schedules its `show` state changes.

## [0.0.4](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.3...v0.0.4) - 2017-08-22

### Changed

- Slight refactor and reorganization of the code for improved consistency.

## Fixed

- Set `react`, `glamor` and `glamorous` as peer dependencies.
- Placement of the popover based on the height.

## [0.0.3](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.2...v0.0.3) - 2017-08-22

### Fixed

- Export the correct entry point for `react-craft-ai-decision-tree`.
- Set the correct build target.

## [0.0.2](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.1...v0.0.2) - 2017-08-22

Initial versions for `react-craft-ai-decision-tree`, `react-craft-ai-popover` and `react-craft-ai-tooltip`!
