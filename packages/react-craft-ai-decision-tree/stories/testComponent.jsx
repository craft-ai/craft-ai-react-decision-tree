import DecisionTree from '../src/';
import React from 'react';
import tree from './tree.json';

class Storage extends React.Component{
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
  }

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
        <text>Current zoom value {this.state.saveNewZoom}<br></br>
        Current position x :{this.state.saveNewPos[0]} y : {this.state.saveNewPos[1]}</text>
      </div>
    );
  }
}

export default Storage;
 