import { storiesOf } from '@storybook/react';
import styled from 'react-emotion';
import ZoomableCanvas from '../src/components/ZoomableCanvas';
import { boolean, number, withKnobs } from '@storybook/addon-knobs';
import React, { useState } from 'react';

const Square = styled('div')`
  position: absolute;
  left: ${({ x = 0 }) => x}px;
  top: ${({ y = 0 }) => y}px;

  background-color: ${({ color = 'red' }) => color};
  width: ${({ size = 20 }) => size}px;
  height: ${({ size = 20 }) => size}px;
`;

const Infos = styled('div')`
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 200px;
  height: 90px;

  background-color: black;
  color: white;
`;

function translation(name, value = 0) {
  return number(name, value, {
    range: true,
    min: -300,
    max: 300,
    step: 1
  });
}

function scale(name, value = 1) {
  return number(name, value, {
    active: false,
    range: true,
    min: 0,
    max: 10,
    step: 0.01
  });
}

const TestZoomableCanvas = (props) => {
  // eslint-disable-next-line react/prop-types
  const [zooming, setZooming] = useState(false);
  const [zoom, setZoom] = useState();
  return (
    <React.Fragment>
      <ZoomableCanvas
        canvasWidth={ 2000 }
        canvasHeight={ 1000 }
        { ...props }
        onZooming={ setZooming }
        onZoomChange={ setZoom }
      >
        <Square color='red' x={ 50 } y={ 200 } size={ 200 } />
        <Square color='purple' x={ 678 } y={ 500 } size={ 350 } />
        <Square color='blue' x={ 0 } y={ 0 } size={ 50 } />
        <Square color='blue' x={ 0 } y={ 950 } size={ 50 } />
        <Square color='blue' x={ 1950 } y={ 950 } size={ 50 } />
        <Square color='blue' x={ 1950 } y={ 0 } size={ 50 } />
      </ZoomableCanvas>
      <Infos>
        <ul>
          <li>{`Scale: ${zoom ? zoom.k.toFixed(3) : 'N/A'}`}</li>
          <li>{`Translate: (${zoom ? zoom.x.toFixed(0) : 'N/A'}, ${
            zoom ? zoom.y.toFixed(0) : 'N/A'
          })`}</li>
          {zooming ? <li>Zooming</li> : <li>Not zooming</li>}
        </ul>
      </Infos>
    </React.Fragment>
  );
};

storiesOf('ZoomableCanvas', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <div
        style={{
          width: 800,
          height: 500,
          border: 'solid 1px black'
        }}
      >
        <TestZoomableCanvas disable={ boolean('disable', false) } />
      </div>
    );
  })
  .add('default, in div', () => {
    return (
      <div
        style={{
          width: '100%',
          height: 500,
          border: 'solid 1px black'
        }}
      >
        <TestZoomableCanvas
          disable={ boolean('disable', false) }
          initialZoom={ false }
        />
      </div>
    );
  })
  .add('initial zoom', () => {
    return (
      <div
        style={{
          display: 'flex',
          height: 300,
          border: 'solid 1px black'
        }}
      >
        <TestZoomableCanvas
          initialZoom={{
            x: translation('initialZoom.x', 10),
            y: translation('initialZoom.y', 20),
            k: scale('initialZoom.k', 0.3)
          }}
        />
      </div>
    );
  });
