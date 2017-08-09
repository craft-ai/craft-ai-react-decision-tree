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

storiesOf('Tree in content', module)
  .add('bewteen centered text', () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      flex: '0 1 auto',
      paddingLeft: 15,
      paddingRight: 15,
      backgroundColor: 'cadetblue',
      margin: '0px 100px'
    }}>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget lectus lobortis, tempus lectus id, imperdiet erat. Nunc placerat cursus est sit amet ultrices. Donec turpis felis, tincidunt a neque sit amet, bibendum bibendum nulla. Phasellus et lectus sit amet tellus mattis interdum. Pellentesque fermentum sodales pulvinar. Cras at diam tristique, pulvinar quam vel, rutrum leo. Cras sapien libero, euismod nec lectus non, pellentesque congue lorem. Maecenas lacus ligula, accumsan vel erat et, consequat dapibus dui. Nullam massa sapien, venenatis ut massa non, efficitur pulvinar elit. Maecenas dapibus eros non odio bibendum, vel porta nibh iaculis. Integer blandit lorem id blandit placerat. Sed pharetra tristique mauris ut euismod. Vestibulum blandit pellentesque massa nec fermentum. Integer velit eros, malesuada ut tortor id, efficitur scelerisque nibh.</p>
      <div style={{ height: 500 }}>
        <Tree data={ tree } />
      </div>
      <p>Phasellus gravida urna mi, luctus sagittis dolor scelerisque eu. Pellentesque aliquam justo non ultricies pretium. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed at porttitor urna. Curabitur tincidunt felis vel eros auctor, sed ullamcorper justo rutrum. Sed in luctus neque, at pharetra sapien. Curabitur vitae erat mauris. Maecenas consectetur maximus egestas. Morbi euismod, turpis sit amet eleifend dictum, orci elit consectetur ante, ac ornare orci dui sed lectus. In purus ligula, cursus sit amet posuere quis, maximus eget quam. Nunc ornare metus augue, congue viverra ante gravida ac. Curabitur ultrices suscipit congue. Donec nec leo metus. Nulla ut ipsum malesuada, elementum sapien ac, auctor erat. Cras id sem lorem. Nullam leo leo, auctor in fringilla consectetur, pretium gravida ante.</p>
    </div>
  ));
