import { COLOR_NODES } from '../utils/constants';
import styled from 'react-emotion';

const Node = styled('div')`
  position: absolute;
  background-color: ${COLOR_NODES};
  text-align: center;
  line-height: 1.75;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100px;
  height: 30px;
  pointerevents: auto;
  cursor: pointer;
  ${({ empty = false }) => `
    box-sizing: ${empty ? 'border-box' : undefined};
    border: ${empty ? 'solid 2px #777' : undefined};
    background: ${
      empty
        ? 'repeating-linear-gradient(-45deg, #ffffff, #ffffff 10px, #777 10px, #777 15px )'
        : undefined
    };
  `}
`;

export default Node;
