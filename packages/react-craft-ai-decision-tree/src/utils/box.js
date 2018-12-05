import _ from 'lodash';
import { Record } from 'immutable';

class Vector extends Record({
  x: 0,
  y: 0
}) {
  constructor(x = 0, y = 0) {
    super({
      x: x,
      y: y
    });
  }
}

export default class Box extends Record({
  origin: new Vector(),
  delta: new Vector()
}) {
  constructor(
    box = {
      origin: {
        x: 0,
        y: 0
      },
      delta: {
        x: 0,
        y: 0
      }
    }
  ) {
    super({
      origin: new Vector(
        (box.origin && box.origin.x) || box.left || 0,
        (box.origin && box.origin.y) || box.top || 0
      ),
      delta: new Vector(
        (box.delta && box.delta.x) ||
          (!_.isUndefined(box.right) &&
            !_.isUndefined(box.left) &&
            box.right - box.left) ||
          0,
        (box.delta && box.delta.y) ||
          (!_.isUndefined(box.bottom) &&
            !_.isUndefined(box.top) &&
            box.bottom - box.top) ||
          0
      )
    });
  }

  applyMargin(margin) {
    const m = _.defaults(margin || {}, {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    });
    return this.updateIn(['origin', 'x'], (x) => x + m.left)
      .updateIn(['origin', 'y'], (y) => y + m.top)
      .updateIn(['delta', 'x'], (x) => x - m.left - m.right)
      .updateIn(['delta', 'y'], (y) => y - m.top - m.bottom);
  }
}
