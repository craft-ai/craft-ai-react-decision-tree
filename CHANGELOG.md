# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.21...HEAD) ##

## Fixed

- Edges toolTips properly close when the mouse goes out.
- Histogram bars have the right amount of samples they contain.
- Show prediction for '0' output value.
- Fix the nodepath regex to accept non-binary splits.

## Updated

- Histogram plots are 90° rotated.

## [0.0.21](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.20...v0.0.21) - 2019-04-10 ##

## Added

- Add an information button on the boxplot to explain how to read it.
- Expose the style parameter in `NodeInformation`.

## Updated

- Minor update of the presentation of the node information.

## [0.0.20](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.19...v0.0.20) - 2019-04-09 ##

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

## Updated

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
