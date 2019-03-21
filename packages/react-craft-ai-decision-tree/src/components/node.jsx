import { COLOR_NODES } from '../utils/constants';
import styled from '@emotion/styled';

const Node = styled('div')`
  position: relative;
  background-color: ${COLOR_NODES};
  text-align: center;
  line-height: 1.75;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100px;
  height: 30px;
  pointer-events: auto;
  cursor: pointer;
  box-sizing: content-box;
  ${({ empty = false }) =>
    empty
      ? `
    solid 2px #777;
    repeating-linear-gradient(-45deg, #ffffff, #ffffff 10px, #777 10px, #777 15px );
  `
      : `
  `}
`;

export default Node;
