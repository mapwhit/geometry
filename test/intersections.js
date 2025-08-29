import test from 'node:test';
import {
  distToSegmentSquared,
  polygonIntersectsBox,
  polygonIntersectsBufferedMultiLine,
  polygonIntersectsBufferedPoint,
  polygonIntersectsMultiPolygon,
  polygonIntersectsPolygon
} from '../lib/intersections.js';

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

  await t.test('should return false for non-intersecting polygons', t => {
    const polygon1 = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 }
    ];

    const polygon2 = [
      { x: 10, y: 10 },
      { x: 15, y: 10 },
      { x: 15, y: 15 },
      { x: 10, y: 15 },
      { x: 10, y: 10 }
    ];

    t.assert.equal(polygonIntersectsPolygon(polygon1, polygon2), false);
  });

  await t.test('should return true when one polygon is inside another', t => {
    const outerPolygon = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
      { x: 0, y: 20 },
      { x: 0, y: 0 }
    ];

    const innerPolygon = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 15 },
      { x: 5, y: 15 },
      { x: 5, y: 5 }
    ];

    t.assert.equal(polygonIntersectsPolygon(outerPolygon, innerPolygon), true);
    t.assert.equal(polygonIntersectsPolygon(innerPolygon, outerPolygon), true);
  });

  await t.test('should return false for empty polygons', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 },
      { x: 0, y: 0 }
    ];

    t.assert.equal(polygonIntersectsPolygon(polygon, []), false);
    t.assert.equal(polygonIntersectsPolygon([], polygon), false);
    t.assert.equal(polygonIntersectsPolygon([], []), false);
  });
});

test('polygonIntersectsBufferedPoint', async t => {
  const polygon = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
    { x: 0, y: 0 }
  ];

  await t.test('should return true when point is inside polygon', t => {
    const point = { x: 5, y: 5 };
    t.assert.equal(polygonIntersectsBufferedPoint(polygon, point, 1), true);
  });

  await t.test('should return true when point is within buffer distance of polygon edge', t => {
    const point = { x: 12, y: 5 }; // 2 units away from right edge
    t.assert.equal(polygonIntersectsBufferedPoint(polygon, point, 3), true);
  });

  await t.test('should return false when point is outside buffer distance', t => {
    const point = { x: 15, y: 5 }; // 5 units away from right edge
    t.assert.equal(polygonIntersectsBufferedPoint(polygon, point, 3), false);
  });

  await t.test('should return true when point is exactly at buffer distance', t => {
    const point = { x: 13, y: 5 }; // 3 units away from right edge
    t.assert.equal(polygonIntersectsBufferedPoint(polygon, point, 3), false); // Should be false as distance is equal
  });
});

test('polygonIntersectsMultiPolygon', async t => {
  const polygon = [
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 15, y: 15 },
    { x: 5, y: 15 },
    { x: 5, y: 5 }
  ];

  await t.test('should return true when polygon intersects with one ring of multipolygon', t => {
    const multiPolygon = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 }
      ],
      [
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 30 },
        { x: 20, y: 30 },
        { x: 20, y: 20 }
      ]
    ];

    t.assert.equal(polygonIntersectsMultiPolygon(polygon, multiPolygon), true);
  });

  await t.test('should return false when polygon does not intersect multipolygon', t => {
    const multiPolygon = [
      [
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 30 },
        { x: 20, y: 30 },
        { x: 20, y: 20 }
      ],
      [
        { x: 40, y: 40 },
        { x: 50, y: 40 },
        { x: 50, y: 50 },
        { x: 40, y: 50 },
        { x: 40, y: 40 }
      ]
    ];

    t.assert.equal(polygonIntersectsMultiPolygon(polygon, multiPolygon), false);
  });

  await t.test('should handle single point polygon', t => {
    const pointPolygon = [{ x: 5, y: 5 }];
    const multiPolygon = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 0, y: 0 }
      ]
    ];

    t.assert.equal(polygonIntersectsMultiPolygon(pointPolygon, multiPolygon), true);
  });
});

test('polygonIntersectsBufferedMultiLine', async t => {
  const polygon = [
    { x: 5, y: 5 },
    { x: 15, y: 5 },
    { x: 15, y: 15 },
    { x: 5, y: 15 },
    { x: 5, y: 5 }
  ];

  await t.test('should return true when polygon intersects buffered multiline', t => {
    const multiLine = [
      [
        { x: 0, y: 10 },
        { x: 20, y: 10 }
      ],
      [
        { x: 10, y: 0 },
        { x: 10, y: 20 }
      ]
    ];

    t.assert.equal(polygonIntersectsBufferedMultiLine(polygon, multiLine, 1), true);
  });

  await t.test('should return true when line point is inside polygon', t => {
    const multiLine = [
      [
        { x: 7, y: 7 },
        { x: 25, y: 7 }
      ]
    ];

    t.assert.equal(polygonIntersectsBufferedMultiLine(polygon, multiLine, 1), true);
  });

  await t.test('should return false when multiline is outside buffer distance', t => {
    const multiLine = [
      [
        { x: 0, y: 0 },
        { x: 3, y: 0 }
      ]
    ];

    t.assert.equal(polygonIntersectsBufferedMultiLine(polygon, multiLine, 1), false);
  });

  await t.test('should return true when multiline is within buffer distance', t => {
    const multiLine = [
      [
        { x: 3, y: 5 },
        { x: 4, y: 5 }
      ]
    ];

    t.assert.equal(polygonIntersectsBufferedMultiLine(polygon, multiLine, 2), true);
  });
});

test('polygonIntersectsBox', async t => {
  await t.test('should return true when polygon point is inside box', t => {
    const polygon = [
      { x: 5, y: 5 },
      { x: 15, y: 5 },
      { x: 15, y: 15 },
      { x: 5, y: 15 },
      { x: 5, y: 5 }
    ];

    t.assert.equal(polygonIntersectsBox(polygon, 0, 0, 20, 20), true);
  });

  await t.test('should return true when box corner is inside polygon', t => {
    const polygon = [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 20 },
      { x: 0, y: 20 },
      { x: 0, y: 0 }
    ];

    t.assert.equal(polygonIntersectsBox(polygon, 5, 5, 15, 15), true);
  });

  await t.test('should return true when polygon edge intersects box', t => {
    const polygon = [
      { x: -5, y: 10 },
      { x: 25, y: 10 },
      { x: 25, y: 12 },
      { x: -5, y: 12 },
      { x: -5, y: 10 }
    ];

    t.assert.equal(polygonIntersectsBox(polygon, 0, 0, 20, 20), true);
  });

  await t.test('should return false when polygon and box do not intersect', t => {
    const polygon = [
      { x: 25, y: 25 },
      { x: 30, y: 25 },
      { x: 30, y: 30 },
      { x: 25, y: 30 },
      { x: 25, y: 25 }
    ];

    t.assert.equal(polygonIntersectsBox(polygon, 0, 0, 20, 20), false);
  });

  await t.test('should handle single point polygon', t => {
    const pointPolygon = [{ x: 10, y: 10 }];

    t.assert.equal(polygonIntersectsBox(pointPolygon, 5, 5, 15, 15), true);
    t.assert.equal(polygonIntersectsBox(pointPolygon, 0, 0, 5, 5), false);
  });

  await t.test('should handle two point polygon', t => {
    const linePolygon = [
      { x: 5, y: 10 },
      { x: 15, y: 10 }
    ];

    t.assert.equal(polygonIntersectsBox(linePolygon, 0, 5, 20, 15), true);
    t.assert.equal(polygonIntersectsBox(linePolygon, 0, 0, 5, 5), false);
  });
});

test('distToSegmentSquared', async t => {
  await t.test('should return correct distance when point projects onto segment', t => {
    const p = { x: 5, y: 3 };
    const v = { x: 0, y: 0 };
    const w = { x: 10, y: 0 };

    const expected = 9; // distance from (5,3) to (5,0) squared
    t.assert.equal(distToSegmentSquared(p, v, w), expected);
  });

  await t.test('should return distance to closest endpoint when point is beyond segment', t => {
    const p = { x: -2, y: 3 };
    const v = { x: 0, y: 0 };
    const w = { x: 10, y: 0 };

    const expected = 13; // distance from (-2,3) to (0,0) squared: 4 + 9 = 13
    t.assert.equal(distToSegmentSquared(p, v, w), expected);
  });

  await t.test('should return distance to other endpoint when point is beyond other end', t => {
    const p = { x: 12, y: 3 };
    const v = { x: 0, y: 0 };
    const w = { x: 10, y: 0 };

    const expected = 13; // distance from (12,3) to (10,0) squared: 4 + 9 = 13
    t.assert.equal(distToSegmentSquared(p, v, w), expected);
  });

  await t.test('should return distance to point when segment has zero length', t => {
    const p = { x: 3, y: 4 };
    const v = { x: 0, y: 0 };
    const w = { x: 0, y: 0 };

    const expected = 25; // distance from (3,4) to (0,0) squared: 9 + 16 = 25
    t.assert.equal(distToSegmentSquared(p, v, w), expected);
  });

  await t.test('should return 0 when point is exactly on segment', t => {
    const p = { x: 5, y: 0 };
    const v = { x: 0, y: 0 };
    const w = { x: 10, y: 0 };

    t.assert.equal(distToSegmentSquared(p, v, w), 0);
  });
});
