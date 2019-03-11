import DecisionTree from '../src';
import React from 'react';
import tree from './tree.json';

class TestComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saveNewPos: [0, 0],
      saveNewZoom: 1
    };
  }

  updatePosAndZoom = (pos, zoom) => {
    this.setState({
      saveNewZoom: zoom,
      saveNewPos: pos
    });
  };

  render() {
    return (
      <div>
        <DecisionTree
          width={ 600 }
          height={ 400 }
          data={ tree }
          updatePositionAndZoom={ this.updatePosAndZoom }
          scale={ this.state.saveNewZoom }
          position={ this.state.saveNewPos }
        />
        <div
          style={{
            backgroundColor: 'white',
            border: 'solid 2px, black'
          }}
        >
          <h4>Value of zoom and pan</h4>
          <p>Current zoom value: {this.state.saveNewZoom}</p>
          <p>
            Current position: [{this.state.saveNewPos[0]},
            {this.state.saveNewPos[1]}]
          </p>
        </div>
      </div>
    );
  }
}

export default TestComponent;
