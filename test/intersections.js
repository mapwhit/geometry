import test from 'node:test';
import { polygonIntersectsPolygon } from '../lib/intersections.js';

test('polygonIntersectsPolygon', async t => {
  await t.test('should return true for intersecting polygons', t => {
    const polygon1 = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 }
    ];

    const polygon2 = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 15 },
      { x: 5, y: 15 },
      { x: 5, y: 5 }
    ];

    t.assert.equal(polygonIntersectsPolygon(polygon1, polygon2), true);
  });
});
