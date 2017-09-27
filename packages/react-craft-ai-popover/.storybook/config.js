import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import { homepage } from '../package.json';

setOptions({
  name: 'craft ai Popover',
  url: homepage,
  showDownPanel: false
});

function loadStories() {
  require('../stories/index.js');
  // You can require as many stories as you need.
}

configure(loadStories, module);
