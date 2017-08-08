import React from 'react';
import Tree from '../src/components/tree';
import { storiesOf } from '@storybook/react';

import configuration from './configuration.json';
import tree from './tree.json';

import '../lib/css/tree.css';

storiesOf('Tree', module)
  .add('basic display', () => (
    <div
      style={{
        width: 1200,
        height: 300,
        border: 'solid 1px black',
        overflow: 'auto'
      }}>
      <Tree
        width={ 1200 }
        height={ 300 }
        configuration={ configuration }
        treeData={ tree } />
    </div>
  ));
