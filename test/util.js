import test from 'node:test';
import { calculateSignedArea, isClosedPolygon, isCounterClockwise } from '../lib/util.js';

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

  await t.test('collinear points', t => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 2, y: 0 };

    t.assert.equal(isCounterClockwise(a, b, c), false);
  });

  await t.test('identical points', t => {
    const a = { x: 1, y: 1 };
    const b = { x: 1, y: 1 };
    const c = { x: 1, y: 1 };

    t.assert.equal(isCounterClockwise(a, b, c), false);
  });
});

test('calculateSignedArea', async t => {
  await t.test('clockwise square (positive area)', t => {
    const ring = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];

    const area = calculateSignedArea(ring);
    t.assert.equal(area > 0, true);
    t.assert.equal(area, 200); // 2 * 10 * 10
  });

  await t.test('counter-clockwise square (negative area)', t => {
    const ring = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
      { x: 0, y: 0 }
    ];

    const area = calculateSignedArea(ring);
    t.assert.equal(area < 0, true);
    t.assert.equal(area, -200); // -2 * 10 * 10
  });

  await t.test('triangle (clockwise)', t => {
    const ring = [
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 3, y: 4 },
      { x: 0, y: 0 }
    ];

    const area = calculateSignedArea(ring);
    t.assert.equal(area > 0, true);
    t.assert.equal(area, 24); // 2 * (1/2 * 6 * 4)
  });

  await t.test('empty ring', t => {
    const ring = [];
    const area = calculateSignedArea(ring);
    t.assert.equal(area, 0);
  });

  await t.test('single point', t => {
    const ring = [{ x: 5, y: 5 }];
    const area = calculateSignedArea(ring);
    t.assert.equal(area, 0);
  });

  await t.test('two points', t => {
    const ring = [
      { x: 0, y: 0 },
      { x: 5, y: 5 }
    ];
    const area = calculateSignedArea(ring);
    t.assert.equal(area, 0);
  });

  await t.test('zero area polygon (collapsed)', t => {
    const ring = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ];
    const area = calculateSignedArea(ring);
    t.assert.equal(area, 0);
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

  await t.test('closed but zero area polygon', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ];

    t.assert.equal(isClosedPolygon(polygon), false);
  });

  await t.test('closed but very small area polygon', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 0.1, y: 0 },
      { x: 0.1, y: 0.1 },
      { x: 0, y: 0.1 },
      { x: 0, y: 0 }
    ];

    // Area is 0.02, which is > 0.01 threshold
    t.assert.equal(isClosedPolygon(polygon), true);
  });

  await t.test('closed but tiny area polygon below threshold', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 0.05, y: 0 },
      { x: 0.05, y: 0.05 },
      { x: 0, y: 0.05 },
      { x: 0, y: 0 }
    ];

    // Area is 0.005, which is <= 0.01 threshold
    t.assert.equal(isClosedPolygon(polygon), false);
  });
});
