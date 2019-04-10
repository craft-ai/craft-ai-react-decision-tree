import _ from 'lodash';
import backgrounds from '@storybook/addon-backgrounds';
import bigTree from './bigTree.json';
import ParentComponent from './ParentComponent';
import PropTypes from 'prop-types';
import smallTree from './smallTree.json';
import { storiesOf } from '@storybook/react';
import tree from './tree.json';
import treeV2Classif from './treeV2.json';
import treeV2ClassifBinary from './treeV2-classif-binary.json';
import treeV2Reg from './treeV2-regression.json';
import { DecisionTree, DecisionTreeWithPanel, NodeInformation } from '../src/';
import { number, withKnobs } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import './test.css';

const sizeBoundOptions = {
  range: true,
  min: 60,
  max: 1000,
  step: 1
};

const confidenceBoundOptions = {
  range: true,
  min: 0,
  max: 1,
  step: 0.05
};

const CustomComponent = ({ tree, height, width }) => {
  const [selectedNode, setSelectedNode] = useState('');

  const updateSelectedNodeInput = (event) => {
    setSelectedNode(event.target.value);
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: 'white',
          padding: 5,
          marginBottom: 10
        }}
      >
        SelectedNode:&nbsp;<input type='text' onChange={ updateSelectedNodeInput } value={ selectedNode } />
      </div>
      <DecisionTree
        updateSelectedNode={ setSelectedNode }
        width={ width }
        height={ height }
        data={ tree }
        selectedNode={ selectedNode }
      />
    </div>
  );
};

CustomComponent.propTypes = {
  tree: PropTypes.object.isRequired,
  height: PropTypes.number,
  width: PropTypes.number
};

storiesOf('Tree displayed with fixed height', module)
  .addDecorator(withKnobs)
  .addDecorator(
    backgrounds([
      { name: 'craft', value: '#42348b', default: true },
      { name: 'pink', value: '#d54267' }
    ])
  )
  .add('only tree', () => (
    <DecisionTreeWithPanel
      width={ number('Width', 600, sizeBoundOptions) }
      height={ number('Height', 500, sizeBoundOptions) }
      data={ tree }
    />
  ))
  .add('fixed width', () => (
    <div
      style={{
        width: 600,
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ tree } />
    </div>
  ))
  .add('flexbox row', () => (
    <div
      style={{
        display: 'flex',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <div style={{ height: 'inherit', flexGrow: 1 }}>
        <DecisionTreeWithPanel data={ tree } />
      </div>
    </div>
  ))
  .add('width 100%', () => (
    <div
      style={{
        width: '100%',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ tree } />
    </div>
  ))
  .add('width css', () => (
    <div className='square'>
      <DecisionTreeWithPanel data={ tree } />
    </div>
  ))
  .add('display tree v2 regression', () => (
    <div
      style={{
        display: 'flex',
        height: '100%',
        border: 'solid 1px black'
      }}
    >
      <div style={{ height: 'inherit', flexGrow: 1 }}>
        <DecisionTreeWithPanel data={ treeV2Reg } />
      </div>
    </div>
  ))
  .add('display tree v2 classification', () => (
    <div
      style={{
        display: 'flex',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <div style={{ height: 'inherit', flexGrow: 1 }}>
        <DecisionTreeWithPanel data={ treeV2Classif } />
      </div>
    </div>
  ))
  .add('display tree v2 classification - binary', () => (
    <div
      style={{
        display: 'flex',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <div style={{ height: 'inherit', flexGrow: 1 }}>
        <DecisionTreeWithPanel data={ treeV2ClassifBinary } />
      </div>
    </div>
  ))
  .add('display tree v2 - absolute link thickness', () => (
    <div
      style={{
        display: 'flex',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <div style={{ height: 'inherit', flexGrow: 1 }}>
        <DecisionTreeWithPanel data={ treeV2Reg } edgeType='absolute' />
      </div>
    </div>
  ))
  .add('display tree v2 - relative link thickness', () => (
    <div
      style={{
        display: 'flex',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <div style={{ height: 'inherit', flexGrow: 1 }}>
        <DecisionTreeWithPanel data={ treeV2Reg } edgeType='relative' />
      </div>
    </div>
  ))
  .add('saving zoom and pan in parent component', () => <ParentComponent />)
  .add('with initial zoom tree', () => (
    <DecisionTreeWithPanel
      width={ number('Width', 600, sizeBoundOptions) }
      height={ number('Height', 500, sizeBoundOptions) }
      position={ [0, 0] }
      scale={ 0.25 }
      data={ tree }
    />
  ));

storiesOf('Tree displayed with fixed width', module)
  .add('fixed height', () => (
    <div
      style={{
        width: 800,
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ tree } />
    </div>
  ))
  .add('height 100%', () => (
    <div
      style={{
        height: '100vh',
        width: 800,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ tree } />
    </div>
  ));

storiesOf('Small tree', module)
  .addDecorator(withKnobs)
  .add('fixed width', () => (
    <div
      style={{
        width: 600,
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ smallTree } />
    </div>
  ))
  .add('flexbox row', () => {
    const parametrizedTree = _.cloneDeep(smallTree);
    parametrizedTree.trees.interest.children[0].confidence = number(
      'confidence',
      parametrizedTree.trees.interest.children[0].confidence,
      confidenceBoundOptions
    );
    return (
      <div
        style={{
          display: 'flex',
          height: 500,
          border: 'solid 1px black'
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <DecisionTreeWithPanel data={ parametrizedTree } />
        </div>
      </div>
    );
  })
  .add('width 100%', () => (
    <div
      style={{
        width: '100%',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ smallTree } />
    </div>
  ));

storiesOf('Big tree', module)
  .addDecorator(withKnobs)
  .add('fixed width', () => (
    <div
      style={{
        width: 600,
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ bigTree } />
    </div>
  ))
  .add('width 100%', () => (
    <div
      style={{
        width: '100%',
        height: 500,
        border: 'solid 1px black'
      }}
    >
      <DecisionTreeWithPanel data={ bigTree } />
    </div>
  ));

storiesOf('Tree in content', module)
  .add('between centered text', () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: 'cadetblue',
        margin: '0px 100px'
      }}
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget
        lectus lobortis, tempus lectus id, imperdiet erat. Nunc placerat cursus
        est sit amet ultrices. Donec turpis felis, tincidunt a neque sit amet,
        bibendum bibendum nulla. Phasellus et lectus sit amet tellus mattis
        interdum. Pellentesque fermentum sodales pulvinar. Cras at diam
        tristique, pulvinar quam vel, rutrum leo. Cras sapien libero, euismod
        nec lectus non, pellentesque congue lorem. Maecenas lacus ligula,
        accumsan vel erat et, consequat dapibus dui. Nullam massa sapien,
        venenatis ut massa non, efficitur pulvinar elit. Maecenas dapibus eros
        non odio bibendum, vel porta nibh iaculis. Integer blandit lorem id
        blandit placerat. Sed pharetra tristique mauris ut euismod. Vestibulum
        blandit pellentesque massa nec fermentum. Integer velit eros, malesuada
        ut tortor id, efficitur scelerisque nibh.
      </p>
      <DecisionTreeWithPanel data={ tree } height={ 300 } />
      <p>
        Phasellus gravida urna mi, luctus sagittis dolor scelerisque eu.
        Pellentesque aliquam justo non ultricies pretium. Vestibulum ante ipsum
        primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed at
        porttitor urna. Curabitur tincidunt felis vel eros auctor, sed
        ullamcorper justo rutrum. Sed in luctus neque, at pharetra sapien.
        Curabitur vitae erat mauris. Maecenas consectetur maximus egestas. Morbi
        euismod, turpis sit amet eleifend dictum, orci elit consectetur ante, ac
        ornare orci dui sed lectus. In purus ligula, cursus sit amet posuere
        quis, maximus eget quam. Nunc ornare metus augue, congue viverra ante
        gravida ac. Curabitur ultrices suscipit congue. Donec nec leo metus.
        Nulla ut ipsum malesuada, elementum sapien ac, auctor erat. Cras id sem
        lorem. Nullam leo leo, auctor in fringilla consectetur, pretium gravida
        ante.
      </p>
    </div>
  ))
  .add('bewteen centered text with height in parent div', () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: 'cadetblue',
        margin: '0px 100px',
        height: 600
      }}
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget
        lectus lobortis, tempus lectus id, imperdiet erat. Nunc placerat cursus
        est sit amet ultrices. Donec turpis felis, tincidunt a neque sit amet,
        bibendum bibendum nulla. Phasellus et lectus sit amet tellus mattis
        interdum. Pellentesque fermentum sodales pulvinar. Cras at diam
        tristique, pulvinar quam vel, rutrum leo. Cras sapien libero, euismod
        nec lectus non, pellentesque congue lorem. Maecenas lacus ligula,
        accumsan vel erat et, consequat dapibus dui. Nullam massa sapien,
        venenatis ut massa non, efficitur pulvinar elit. Maecenas dapibus eros
        non odio bibendum, vel porta nibh iaculis. Integer blandit lorem id
        blandit placerat. Sed pharetra tristique mauris ut euismod. Vestibulum
        blandit pellentesque massa nec fermentum. Integer velit eros, malesuada
        ut tortor id, efficitur scelerisque nibh.
      </p>
      <DecisionTreeWithPanel data={ tree } />
      <p>
        Phasellus gravida urna mi, luctus sagittis dolor scelerisque eu.
        Pellentesque aliquam justo non ultricies pretium. Vestibulum ante ipsum
        primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed at
        porttitor urna. Curabitur tincidunt felis vel eros auctor, sed
        ullamcorper justo rutrum. Sed in luctus neque, at pharetra sapien.
        Curabitur vitae erat mauris. Maecenas consectetur maximus egestas. Morbi
        euismod, turpis sit amet eleifend dictum, orci elit consectetur ante, ac
        ornare orci dui sed lectus. In purus ligula, cursus sit amet posuere
        quis, maximus eget quam. Nunc ornare metus augue, congue viverra ante
        gravida ac. Curabitur ultrices suscipit congue. Donec nec leo metus.
        Nulla ut ipsum malesuada, elementum sapien ac, auctor erat. Cras id sem
        lorem. Nullam leo leo, auctor in fringilla consectetur, pretium gravida
        ante.
      </p>
    </div>
  ));

storiesOf('Custom component for displaying nodes', module)
  .addDecorator(withKnobs)
  .addDecorator(
    backgrounds([
      { name: 'craft', value: '#42348b', default: true },
      { name: 'pink', value: '#d54267' }
    ])
  )
  .add('tree', () => (
    <CustomComponent
      width={ number('Width', 600, sizeBoundOptions) }
      height={ number('Height', 500, sizeBoundOptions) }
      tree={ tree }
    />
  ));

storiesOf('Using separate component', module)
  .addDecorator(withKnobs)
  .addDecorator(
    backgrounds([
      { name: 'craft', value: '#42348b', default: true },
      { name: 'pink', value: '#d54267' }
    ])
  )
  .add('tree', () => (
    <DecisionTree
      width={ number('Width', 600, sizeBoundOptions) }
      height={ number('Height', 500, sizeBoundOptions) }
      data={ tree }
    />
  ))
  .add('Tree v1 node information - root node', () => (
    <NodeInformation
      updateSelectedNode={ () => {} }
      tree={ tree }
      selectedNodePath='0'
    />
  ))
  .add('Tree v1 node information - internal node', () => (
    <NodeInformation
      updateSelectedNode={ () => {} }
      tree={ tree }
      selectedNodePath='0-0-1'
    />
  ))
  .add('Tree v1 node information - leaf node', () => (
    <NodeInformation
      updateSelectedNode={ () => {} }
      tree={ tree }
      selectedNodePath='0-0-1-1-1-0-1'
    />
  ))
  .add('Tree v2 node information - root node', () => (
    <NodeInformation
      updateSelectedNode={ () => {} }
      tree={ treeV2Reg }
      selectedNodePath='0'
    />
  ))
  .add('Tree v2 node information - internal node', () => (
    <NodeInformation
      updateSelectedNode={ () => {} }
      tree={ treeV2Reg }
      selectedNodePath='0-0-1'
    />
  ))
  .add('Tree v2 node information - leaf node', () => (
    <NodeInformation
      updateSelectedNode={ () => {} }
      tree={ treeV2Reg }
      selectedNodePath='0-0-1-0-0-0'
    />
  ));
