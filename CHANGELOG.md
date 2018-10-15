# Changelog #

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.11...HEAD) ##

## Changed ##
- Now using [emotion](https://github.com/emotion-js/emotion) instead of glamor/glamorous for the basic styling of the components.

## [0.0.11](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.10...v0.0.11) - 2018-09-19 ##

## Changed ##
- Zoom level is increased in `react-craft-ai-decision-tree`.

## Fixed ##
- Panning and zooming on big decision trees is more responsive in `react-craft-ai-decision-tree`.

## [0.0.10](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.9...v0.0.10) - 2017-12-15 ##

## Fixed ##
- `d3` packages are now included in the `react-craft-ai-decision-tree` umd.

## [0.0.9](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.8...v0.0.9) - 2017-12-13 ##

## Added ##
- `react-craft-ai-decision-tree` is now packaged as a UMD module and available through [unpkg](https://unpkg.com/).

## [0.0.8](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.7...v0.0.8) - 2017-09-28 ##

## Changed ##
- Making the decision tree leaves confidence color scheme more neutral.

## [0.0.7](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.6...v0.0.7) - 2017-09-13 ##

## Fixed ##
- Infinite loop that was occurring when rendering the leaves tooltips.

## [0.0.6](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.5...v0.0.6) - 2017-08-23 ##

## Added ##
- Relevant keywords for the packages.

## [0.0.5](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.4...v0.0.5) - 2017-08-22 ##

## Added ##
- Component demo pages powered by [Storybook](https://storybook.js.org).

## Fixed ##
- Fix the way the popover schedules its `show` state changes.

## [0.0.4](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.3...v0.0.4) - 2017-08-22 ##

### Changed ###
- Slight refactor and reorganization of the code for improved consistency.

## Fixed ##
- Set `react`, `glamor` and `glamorous` as peer dependencies.
- Placement of the popover based on the height.

## [0.0.3](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.2...v0.0.3) - 2017-08-22 ##

### Fixed ###
- Export the correct entry point for `react-craft-ai-decision-tree`.
- Set the correct build target.

## [0.0.2](https://github.com/craft-ai/react-craft-ai-components/compare/v0.0.1...v0.0.2) - 2017-08-22 ##

Initial versions for `react-craft-ai-decision-tree`, `react-craft-ai-popover` and `react-craft-ai-tooltip`!
