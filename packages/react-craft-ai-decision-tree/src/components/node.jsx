import glamorous from 'glamorous';

const Node = glamorous.div({
  position: 'absolute',
  backgroundColor: '#bbb',
  textAlign: 'center',
  lineHeight: 1.75,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  width: 100,
  height: 30,
  pointerEvents: 'auto'
},
({ empty = false }) => ({
  boxSizing: empty ? 'border-box' : undefined,
  border: empty ? 'solid 2px #777' : undefined,
  background: empty ? 'repeating-linear-gradient(-45deg, #ffffff, #ffffff 10px, #777 10px, #777 15px )' : undefined,
}));

export default Node;
