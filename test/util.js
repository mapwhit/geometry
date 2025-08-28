import test from 'node:test';
import { isClosedPolygon, isCounterClockwise } from '../lib/util.js';

test('isCounterClockwise ', async t => {
  await t.test('counter clockwise', t => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 1, y: 1 };

    t.assert.equal(isCounterClockwise(a, b, c), true);
  });

  await t.test('clockwise', t => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 1, y: 1 };

    t.assert.equal(isCounterClockwise(c, b, a), false);
  });
});

test('isClosedPolygon', async t => {
  await t.test('not enough points', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ];

    t.assert.equal(isClosedPolygon(polygon), false);
  });

  await t.test('not equal first + last point', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ];

    t.assert.equal(isClosedPolygon(polygon), false);
  });

  await t.test('closed polygon', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 }
    ];

    t.assert.equal(isClosedPolygon(polygon), true);
  });
});
