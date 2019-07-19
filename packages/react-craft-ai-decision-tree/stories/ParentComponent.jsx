/* eslint-disable react/jsx-no-bind */
import DecisionTreeWithPanel from '../src';
import React, { useState } from 'react';

const ParentComponent = ({ tree }) => {
  const [savedNewPosZoom, setSavedNewPosZoom] = useState({pos: [0., 0.], zoom: 1.});

  const updatePosAndZoom = (pos, zoom) => {
    setSavedNewPosZoom({ pos, zoom });
  };

  return (
    <div>
      <DecisionTreeWithPanel
        style={{
          width: 600,
          height: 400
        }}
        data={ tree }
        updatePositionAndZoom={ updatePosAndZoom }
        scale={ savedNewPosZoom.zoom }
        position={ savedNewPosZoom.pos }
      />
      <div
        style={{
          backgroundColor: 'white',
          border: 'solid 2px, black'
        }}
      >
        <h4>Value of zoom and pan</h4>
        <p>Current zoom value: {savedNewPosZoom.zoom}</p>
        <p>
          Current position: [{savedNewPosZoom.pos[0]},{savedNewPosZoom.pos[1]}]
        </p>
      </div>
    </div>
  );
};

export default ParentComponent;
