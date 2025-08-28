import test from 'node:test';
import { findPoleOfInaccessibility } from '../lib/poi.js';

test('polygon_poi', t => {
  const closedRing = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 10, y: 0 },
    { x: 0, y: 0 }
  ];
  const closedRingHole = [
    { x: 2, y: 1 },
    { x: 6, y: 6 },
    { x: 6, y: 1 },
    { x: 2, y: 1 }
  ];

  t.assert.deepEqual(findPoleOfInaccessibility([closedRing], 0.1), { x: 7.0703125, y: 2.9296875 });
  t.assert.deepEqual(findPoleOfInaccessibility([closedRing, closedRingHole], 0.1), { x: 7.96875, y: 2.03125 });
});
