# `react-craft-ai-components`

[![Build](https://img.shields.io/travis/craft-ai/react-craft-ai-components/master.svg?style=flat-square)](https://travis-ci.org/craft-ai/react-craft-ai-components) [![License](https://img.shields.io/badge/license-BSD--3--Clause-42358A.svg?style=flat-square)](https://github.com/craft-ai/react-craft-ai-components/blob/master/LICENSE)

## Packages

### [`react-craft-ai-decision-tree`](./packages/react-craft-ai-decision-tree) [![Version](https://img.shields.io/npm/v/react-craft-ai-decision-tree.svg?style=flat-square)](https://npmjs.org/package/react-craft-ai-decision-tree)

### [`react-craft-ai-operations-history`](./packages/react-craft-ai-operations-history) [![Version](https://img.shields.io/npm/v/react-craft-ai-operations-history.svg?style=flat-square)](https://npmjs.org/package/react-craft-ai-operations-history)

### [`react-craft-ai-popover`](./packages/react-craft-ai-popover) [![Version](https://img.shields.io/npm/v/react-craft-ai-popover.svg?style=flat-square)](https://npmjs.org/package/react-craft-ai-popover)

### [`react-craft-ai-tooltip`](./packages/react-craft-ai-tooltip) [![Version](https://img.shields.io/npm/v/react-craft-ai-tooltip.svg?style=flat-square)](https://npmjs.org/package/react-craft-ai-tooltip)

## Developers instructions

### Testing locally using [Storybook](https://storybook.js.org)

1. In the root directory, install dependencies by running `yarn install`,
2. In the root directory, make sure all the packages are built using `yarn build`,
3. Move the directory of package you want to test, e.g. `cd ./packages/react-craft-ai-decision-tree`,
4. Launch the Storybook server by running `yarn run storybook`,
5. Open the given URL in your favorite web browser,
6. Edit the sources as you want the Storybook will autoreload,
7. If you make some changes to an internal dependencies, e.g. if you update `react-craft-ai-tooltip` while you are testing `react-craft-ai-decision-tree`, re-run `yarn build` in the root directory.

### Releasing a new version (needs administrator rights)

1. Make sure the build of the master branch is [passing](https://travis-ci.org/craft-ai/react-craft-ai-components).
2. Checkout the master branch locally.

```console
$ git fetch
$ git checkout master
$ git reset --hard origin/master
```

4. Increment the version of all packages and move _Unreleased_ section
   of `CHANGELOG.md` to a newly created section for this version.

```console
$ ./scripts/update_version.sh patch
```

`./scripts/update_version.sh minor` and `./scripts/update_version.sh major` are
also available - see [semver](http://semver.org) for a guideline on when to
use which.

> This will create a git commit and a git tag.

5. Push everything.

```console
$ git push origin master --tags
```

> This will trigger the publishing of this new version of the packages by [travis](https://travis-ci.org/craft-ai/react-craft-ai-components).
