import test from 'node:test';
import { clipLine } from '../lib/clip.js';

test('clipLine', async t => {
  await t.test('should return empty array for empty input', t => {
    const lines = [];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.deepEqual(result, []);
  });

  await t.test('should return empty array for line completely outside box (left)', t => {
    const lines = [
      [
        { x: -5, y: 5 },
        { x: -2, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.deepEqual(result, []);
  });

  await t.test('should return empty array for line completely outside box (right)', t => {
    const lines = [
      [
        { x: 15, y: 5 },
        { x: 20, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.deepEqual(result, []);
  });

  await t.test('should return empty array for line completely outside box (top)', t => {
    const lines = [
      [
        { x: 5, y: -5 },
        { x: 5, y: -2 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.deepEqual(result, []);
  });

  await t.test('should return empty array for line completely outside box (bottom)', t => {
    const lines = [
      [
        { x: 5, y: 15 },
        { x: 5, y: 20 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.deepEqual(result, []);
  });

  await t.test('should return line unchanged when completely inside box', t => {
    const lines = [
      [
        { x: 2, y: 3 },
        { x: 7, y: 8 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 2, y: 3 });
    t.assert.deepEqual(result[0][1], { x: 7, y: 8 });
  });

  await t.test('should clip line crossing left edge', t => {
    const lines = [
      [
        { x: -5, y: 5 },
        { x: 5, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 5, y: 5 });
  });

  await t.test('should clip line crossing right edge', t => {
    const lines = [
      [
        { x: 5, y: 5 },
        { x: 15, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 5, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 10, y: 5 });
  });

  await t.test('should clip line crossing top edge', t => {
    const lines = [
      [
        { x: 5, y: -5 },
        { x: 5, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 5, y: 0 });
    t.assert.deepEqual(result[0][1], { x: 5, y: 5 });
  });

  await t.test('should clip line crossing bottom edge', t => {
    const lines = [
      [
        { x: 5, y: 5 },
        { x: 5, y: 15 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 5, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 5, y: 10 });
  });

  await t.test('should clip diagonal line crossing multiple edges', t => {
    const lines = [
      [
        { x: -5, y: -5 },
        { x: 15, y: 15 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 0 });
    t.assert.deepEqual(result[0][1], { x: 10, y: 10 });
  });

  await t.test('should handle line that enters and exits through same edge', t => {
    const lines = [
      [
        { x: -5, y: 5 },
        { x: 15, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 10, y: 5 });
  });

  await t.test('should handle line touching corner', t => {
    const lines = [
      [
        { x: -5, y: -5 },
        { x: 0, y: 0 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 0 });
    t.assert.deepEqual(result[0][1], { x: 0, y: 0 });
  });

  await t.test('should handle multi-segment line with some segments clipped', t => {
    const lines = [
      [
        { x: -5, y: 5 }, // outside
        { x: 5, y: 5 }, // inside
        { x: 8, y: 8 }, // inside
        { x: 15, y: 8 } // outside
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 4);
    t.assert.deepEqual(result[0][0], { x: 0, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 5, y: 5 });
    t.assert.deepEqual(result[0][2], { x: 8, y: 8 });
    t.assert.deepEqual(result[0][3], { x: 10, y: 8 });
  });

  await t.test('should handle multiple separate lines', t => {
    const lines = [
      [
        { x: 2, y: 2 },
        { x: 4, y: 4 }
      ],
      [
        { x: 6, y: 6 },
        { x: 8, y: 8 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 2);
    t.assert.equal(result[0].length, 2);
    t.assert.equal(result[1].length, 2);
    t.assert.deepEqual(result[0][0], { x: 2, y: 2 });
    t.assert.deepEqual(result[0][1], { x: 4, y: 4 });
    t.assert.deepEqual(result[1][0], { x: 6, y: 6 });
    t.assert.deepEqual(result[1][1], { x: 8, y: 8 });
  });

  await t.test('should handle line with gap that creates separate clipped segments', t => {
    const lines = [
      [
        { x: 2, y: 5 }, // inside
        { x: 15, y: 5 }, // crosses right edge
        { x: 20, y: 5 }, // outside
        { x: 25, y: 8 }, // outside
        { x: 8, y: 8 } // crosses right edge, ends inside
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 2);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 2, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 10, y: 5 });
    t.assert.equal(result[1].length, 2);
    t.assert.deepEqual(result[1][0], { x: 10, y: 8 });
    t.assert.deepEqual(result[1][1], { x: 8, y: 8 });
  });

  await t.test('should handle single point line (degenerate case)', t => {
    const lines = [[{ x: 5, y: 5 }]];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.deepEqual(result, []);
  });

  await t.test('should handle negative coordinates in clipping box', t => {
    const lines = [
      [
        { x: -15, y: 0 },
        { x: 5, y: 0 }
      ]
    ];
    const result = clipLine(lines, -10, -10, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: -10, y: 0 });
    t.assert.deepEqual(result[0][1], { x: 5, y: 0 });
  });

  await t.test('should handle zero-sized clipping box', t => {
    const lines = [
      [
        { x: -5, y: 0 },
        { x: 5, y: 0 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 0, 0);
    // For a zero-sized box, we expect empty results as nothing can be inside it
    t.assert.equal(result.length, 0);
  });

  await t.test('should handle fractional coordinates and clipping', t => {
    const lines = [
      [
        { x: -1.5, y: 2.5 },
        { x: 3.7, y: 2.5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 3, 3);
    // The round() function from @mapwhit/point-geometry rounds 2.5 up to 3
    // Since both points end up with y=3, they're excluded by the y >= y2 check
    t.assert.equal(result.length, 0);
  });

  await t.test('should handle fractional coordinates that remain inside the box', t => {
    const lines = [
      [
        { x: -1.5, y: 2.4 },
        { x: 3.7, y: 2.4 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 3, 3);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 2 });
    t.assert.deepEqual(result[0][1], { x: 3, y: 2 });
  });

  await t.test('should handle line that clips on all four edges', t => {
    const lines = [
      [
        { x: -5, y: -5 },
        { x: 15, y: 15 }
      ]
    ];
    const result = clipLine(lines, 2, 2, 8, 8);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 2, y: 2 });
    t.assert.deepEqual(result[0][1], { x: 8, y: 8 });
  });

  await t.test('should handle vertical line clipping', t => {
    const lines = [
      [
        { x: 5, y: -5 },
        { x: 5, y: 15 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 5, y: 0 });
    t.assert.deepEqual(result[0][1], { x: 5, y: 10 });
  });

  await t.test('should handle horizontal line clipping', t => {
    const lines = [
      [
        { x: -5, y: 5 },
        { x: 15, y: 5 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 10, y: 5 });
  });

  await t.test('should handle line segment at box boundary', t => {
    const lines = [
      [
        { x: 0, y: 5 },
        { x: 0, y: 8 }
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);
    t.assert.equal(result.length, 1);
    t.assert.equal(result[0].length, 2);
    t.assert.deepEqual(result[0][0], { x: 0, y: 5 });
    t.assert.deepEqual(result[0][1], { x: 0, y: 8 });
  });

  await t.test('should handle complex polyline with multiple clipping scenarios', t => {
    const lines = [
      [
        { x: -2, y: 5 }, // outside left
        { x: 3, y: 5 }, // inside
        { x: 7, y: 5 }, // inside
        { x: 12, y: 5 }, // outside right
        { x: 15, y: 8 }, // outside right
        { x: 8, y: 8 }, // inside
        { x: 5, y: 12 }, // outside bottom
        { x: 2, y: 15 } // outside bottom
      ]
    ];
    const result = clipLine(lines, 0, 0, 10, 10);

    // Should create multiple clipped segments
    t.assert.ok(result.length >= 1);

    // First segment should start at left edge
    t.assert.deepEqual(result[0][0], { x: 0, y: 5 });

    // Should contain the internal segments
    let foundInternalSegment = false;
    for (const line of result) {
      for (let i = 0; i < line.length - 1; i++) {
        if (line[i].x === 3 && line[i].y === 5 && line[i + 1].x === 7 && line[i + 1].y === 5) {
          foundInternalSegment = true;
          break;
        }
      }
    }
    t.assert.ok(foundInternalSegment);
  });
});
