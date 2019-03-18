import DecisionTreeWithPanel from '../src';
import tree from './tree.json';
import React, { useState } from 'react';

const ParentComponent = () => {
  const [savedNewPos, setSavedNewPos] = useState([0, 0]);
  const [savedNewZoom, setSavedNewZoom] = useState(1);

  const updatePosAndZoom = (pos, zoom) => {
    setSavedNewPos(pos);
    setSavedNewZoom(zoom);
  };

  return (
    <div>
      <DecisionTreeWithPanel
        width={ 600 }
        height={ 400 }
        data={ tree }
        updatePositionAndZoom={ updatePosAndZoom }
        scale={ savedNewZoom }
        position={ savedNewPos }
      />
      <div
        style={{
          backgroundColor: 'white',
          border: 'solid 2px, black'
        }}
      >
        <h4>Value of zoom and pan</h4>
        <p>Current zoom value: {savedNewZoom}</p>
        <p>
          Current position: [{savedNewPos[0]},{savedNewPos[1]}]
        </p>
      </div>
    </div>
  );
};

export default ParentComponent;
