import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import { homepage } from '../package.json';

setOptions({
  name: 'craft ai Decision Tree',
  url: homepage
});

function loadStories() {
  require('../stories/decisionTree.js');
}

configure(loadStories, module);
