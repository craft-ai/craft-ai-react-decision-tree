import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import { homepage } from '../package.json';

setOptions({
  name: 'craft ai Operations History',
  url: homepage
});

function loadStories() {
  require('../stories/operationsHistory.js');
  require('../stories/infiniteList.js');
}

configure(loadStories, module);
