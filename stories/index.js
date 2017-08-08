import React from 'react';
import Tree from '../src/components/treeComponent';
import { storiesOf } from '@storybook/react';

import tree from './tree.json';
import smallTree from './smallTree.json';

import '../lib/css/tree.css';

storiesOf('Tree displayed with fixed height', module)
  .add('fixed width', () => (
    <div
      style={{
        width: 600,
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ tree } />
    </div>
  ))
  .add('flexbox row', () => (
    <div
      style={{
        display: 'flex',
        flexGrow:'1',
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ tree } />
    </div>
  ))
  .add('width 100%', () => (
    <div
      style={{
        width: '100%',
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ tree } />
    </div>
  ));

storiesOf('Tree displayed with fixed width', module)
  .add('fixed height', () => (
    <div
      style={{
        width: 800,
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ tree } />
    </div>
  ))
  .add('flexbox column', () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow:'1',
        width: 800,
        border: 'solid 1px black'
      }}>
      <Tree data={ tree } />
    </div>
  ))
  .add('height 100%', () => (
    <div
      style={{
        height: '100vh',
        width: 800,
        border: 'solid 1px black'
      }}>
      <Tree data={ tree } />
    </div>
  ));


storiesOf('Small tree', module)
  .add('fixed width', () => (
    <div
      style={{
        width: 600,
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ smallTree } />
    </div>
  ))
  .add('flexbox row', () => (
    <div
      style={{
        display: 'flex',
        flexGrow:'1',
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ smallTree } />
    </div>
  ))
  .add('width 100%', () => (
    <div
      style={{
        width: '100%',
        height: 500,
        border: 'solid 1px black'
      }}>
      <Tree data={ smallTree } />
    </div>
  ));
