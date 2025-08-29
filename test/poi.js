import test from 'node:test';
import { polygonContainsPoint } from '../lib/intersections.js';
import { findPoleOfInaccessibility } from '../lib/poi.js';

test('polygon_poi', async t => {
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

  await t.test('basic triangle without holes', t => {
    t.assert.deepEqual(findPoleOfInaccessibility([closedRing], 0.1), { x: 7.0703125, y: 2.9296875 });
  });

  await t.test('triangle with hole', t => {
    t.assert.deepEqual(findPoleOfInaccessibility([closedRing, closedRingHole], 0.1), { x: 7.96875, y: 2.03125 });
  });

  await t.test('simple square', t => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([square], 0.1);
    // For a square, pole should be near the center
    t.assert.ok(Math.abs(result.x - 5) < 1);
    t.assert.ok(Math.abs(result.y - 5) < 1);
  });

  await t.test('empty polygon array', t => {
    t.assert.throws(() => findPoleOfInaccessibility([]), Error);
  });

  await t.test('single point polygon', t => {
    const point = [{ x: 5, y: 5 }];
    const result = findPoleOfInaccessibility([point], 0.1);
    t.assert.equal(result.x, 5);
    t.assert.equal(result.y, 5);
  });

  await t.test('two point polygon (line)', t => {
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 }
    ];
    const result = findPoleOfInaccessibility([line], 0.1);
    t.assert.deepEqual(result, { x: 0, y: 0 });
  });

  await t.test('zero area collapsed polygon', t => {
    const collapsed = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 }
    ];
    const result = findPoleOfInaccessibility([collapsed], 0.1);
    t.assert.deepEqual(result, { x: 5, y: 5 });
  });

  await t.test('precision zero (first iteration only)', t => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([square], 0);
    t.assert.ok(typeof result.x === 'number');
    t.assert.ok(typeof result.y === 'number');
  });

  await t.test('high precision', t => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([square], 0.001);
    // Should be very close to center with high precision
    t.assert.ok(Math.abs(result.x - 5) < 0.1);
    t.assert.ok(Math.abs(result.y - 5) < 0.1);
  });

  await t.test('rectangle with multiple holes', t => {
    const outer = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const hole1 = [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 6 },
      { x: 2, y: 6 },
      { x: 2, y: 2 }
    ];
    const hole2 = [
      { x: 14, y: 2 },
      { x: 18, y: 2 },
      { x: 18, y: 6 },
      { x: 14, y: 6 },
      { x: 14, y: 2 }
    ];
    const result = findPoleOfInaccessibility([outer, hole1, hole2], 0.1);
    t.assert.ok(typeof result.x === 'number');
    t.assert.ok(typeof result.y === 'number');
    // Should be somewhere in the middle corridor
    t.assert.ok(result.x > 6 && result.x < 14);
  });

  await t.test('concave polygon', t => {
    const concave = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([concave], 0.1);
    t.assert.ok(typeof result.x === 'number');
    t.assert.ok(typeof result.y === 'number');
    // Should be inside the polygon
    t.assert.ok(result.x >= 0 && result.x <= 10);
    t.assert.ok(result.y >= 0 && result.y <= 10);
  });

  await t.test('very small polygon', t => {
    const tiny = [
      { x: 0, y: 0 },
      { x: 0.1, y: 0 },
      { x: 0.1, y: 0.1 },
      { x: 0, y: 0.1 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([tiny], 0.01);
    t.assert.ok(Math.abs(result.x - 0.05) < 0.05);
    t.assert.ok(Math.abs(result.y - 0.05) < 0.05);
  });

  await t.test('large coordinate values', t => {
    const large = [
      { x: 1000000, y: 1000000 },
      { x: 1000010, y: 1000000 },
      { x: 1000010, y: 1000010 },
      { x: 1000000, y: 1000010 },
      { x: 1000000, y: 1000000 }
    ];
    const result = findPoleOfInaccessibility([large], 0.1);
    t.assert.ok(Math.abs(result.x - 1000005) < 1);
    t.assert.ok(Math.abs(result.y - 1000005) < 1);
  });

  await t.test('polygon with hole close to boundary', t => {
    const outer = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const closeHole = [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
      { x: 9, y: 9 },
      { x: 1, y: 9 },
      { x: 1, y: 1 }
    ];
    const result = findPoleOfInaccessibility([outer, closeHole], 0.1);
    t.assert.ok(typeof result.x === 'number');
    t.assert.ok(typeof result.y === 'number');
    // Should find a spot in the thin border area
    t.assert.ok(result.x < 1 || result.x > 9 || result.y < 1 || result.y > 9);
  });

  await t.test('zero area polygon (line)', t => {
    const line = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([line], 0.1);
    t.assert.deepEqual(result, { x: 0, y: 0 });
  });

  await t.test('C-shaped polygon with outside centroid', t => {
    const cShape = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 9 },
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const result = findPoleOfInaccessibility([cShape], 0.1);
    // Centroid is outside, so it should find a pole inside the polygon
    t.assert.ok(polygonContainsPoint(cShape, result));
  });

  await t.test('polygon not centered at 0,0 with outside centroid', t => {
    const cShape = [
      { x: 100, y: 100 },
      { x: 110, y: 100 },
      { x: 110, y: 101 },
      { x: 101, y: 101 },
      { x: 101, y: 109 },
      { x: 110, y: 109 },
      { x: 110, y: 110 },
      { x: 100, y: 110 },
      { x: 100, y: 100 }
    ];
    const result = findPoleOfInaccessibility([cShape], 0.1);
    // Centroid is outside, so it should find a pole inside the polygon
    t.assert.ok(polygonContainsPoint(cShape, result));
  });

  await t.test('polygon with a hole that contains the centroid', t => {
    const outer = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];
    const hole = [
      { x: 4, y: 4 },
      { x: 6, y: 4 },
      { x: 6, y: 6 },
      { x: 4, y: 6 },
      { x: 4, y: 4 }
    ];
    const result = findPoleOfInaccessibility([outer, hole], 0.1);
    t.assert.ok(polygonContainsPoint(outer, result));
    t.assert.ok(!polygonContainsPoint(hole, result));
  });

  await t.test('collapsed polygon with all points the same', t => {
    const polygon = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 }
    ];
    const result = findPoleOfInaccessibility([polygon], 0.1);
    t.assert.deepEqual(result, { x: 5, y: 5 });
  });
});
