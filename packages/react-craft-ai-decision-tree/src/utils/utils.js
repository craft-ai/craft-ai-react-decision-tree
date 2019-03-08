import { mix } from 'polished';
import {
  COLOR_LEAVES_CONFIDENCE_0,
  COLOR_LEAVES_CONFIDENCE_1
} from './constants';

function computeLeafColor(confidence) {
  const blend = Math.pow(confidence, 3);
  return mix(blend, COLOR_LEAVES_CONFIDENCE_1, COLOR_LEAVES_CONFIDENCE_0);
}

export { computeLeafColor };
