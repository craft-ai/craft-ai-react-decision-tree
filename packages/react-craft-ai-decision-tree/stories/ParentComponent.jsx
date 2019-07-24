/* eslint-disable react/jsx-no-bind */
import DecisionTree from '../src';
import React, { useEffect, useState } from 'react';

const ParentComponent = ({ tree, withTimer }) => {
  const [savedNewPosZoom, setSavedNewPosZoom] = useState({ pos: [0., 0.], zoom: 1. });
  const [actualTree, setActualTree] = useState(undefined);
  const updatePosAndZoom = (pos, zoom) => {
    setSavedNewPosZoom({ pos, zoom });
  };

  useEffect(() => {
    if (withTimer) {
      setActualTree(undefined);
      const timer = setInterval(() => setActualTree(tree), 500);
      return () => {
        clearInterval(timer);
      };
    }
    else {
      setActualTree(tree);
    }
  }, [tree, withTimer]);

  return (
    <div>
      { actualTree != null ?
        <DecisionTree
          style={{
            width: 600,
            height: 400
          }}
          data={ actualTree }
          updatePositionAndZoom={ updatePosAndZoom }
          scale={ savedNewPosZoom.zoom }
          position={ savedNewPosZoom.pos } />
        : <span> LOADING ... </span>
      }
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
