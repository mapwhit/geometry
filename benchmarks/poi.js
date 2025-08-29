import { bench, group, run } from 'mitata';
import { findPoleOfInaccessibility } from '../lib/poi.js';

/**
 * Generate a regular polygon with specified number of sides
 * @param {number} sides - Number of sides
 * @param {number} radius - Radius of polygon
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @returns {Array} Array of points
 */
function generateRegularPolygon(sides, radius, centerX = 0, centerY = 0) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }
  // Close the polygon
  points.push({ ...points[0] });
  return points;
}

/**
 * Generate a concave L-shaped polygon
 * @param {number} size - Size of the L shape
 * @returns {Array} Array of points
 */
function generateLShape(size = 10) {
  return [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size / 2 },
    { x: size / 2, y: size / 2 },
    { x: size / 2, y: size },
    { x: 0, y: size },
    { x: 0, y: 0 }
  ];
}

/**
 * Generate a polygon with a hole
 * @param {number} outerRadius - Outer polygon radius
 * @param {number} innerRadius - Inner hole radius
 * @returns {Array} Array with outer ring and hole
 */
function generatePolygonWithHole(outerRadius = 20, innerRadius = 8) {
  const outer = generateRegularPolygon(8, outerRadius);
  const inner = generateRegularPolygon(6, innerRadius);
  return [outer, inner];
}

/**
 * Generate a complex polygon with multiple holes
 * @returns {Array} Array with outer ring and multiple holes
 */
function generateComplexPolygonWithHoles() {
  const outer = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
    { x: 0, y: 0 }
  ];

  const hole1 = [
    { x: 10, y: 10 },
    { x: 30, y: 10 },
    { x: 30, y: 30 },
    { x: 10, y: 30 },
    { x: 10, y: 10 }
  ];

  const hole2 = [
    { x: 40, y: 40 },
    { x: 60, y: 40 },
    { x: 60, y: 60 },
    { x: 40, y: 60 },
    { x: 40, y: 40 }
  ];

  const hole3 = [
    { x: 70, y: 10 },
    { x: 90, y: 10 },
    { x: 90, y: 30 },
    { x: 70, y: 30 },
    { x: 70, y: 10 }
  ];

  return [outer, hole1, hole2, hole3];
}

/**
 * Generate a star-shaped polygon
 * @param {number} points - Number of star points
 * @param {number} outerRadius - Outer radius
 * @param {number} innerRadius - Inner radius
 * @returns {Array} Array of points
 */
function generateStarPolygon(points, outerRadius, innerRadius) {
  const vertices = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    vertices.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }
  vertices.push({ ...vertices[0] });
  return vertices;
}

// Test polygons
const simpleSquare = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
  { x: 0, y: 0 }
];

const smallTriangle = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 5, y: 10 },
  { x: 0, y: 0 }
];

const mediumHexagon = generateRegularPolygon(6, 20);
const largePolygon = generateRegularPolygon(50, 50);
const veryLargePolygon = generateRegularPolygon(200, 100);
const extremelyLargePolygon = generateRegularPolygon(1000, 200);

const concaveL = generateLShape(20);
const complexStar = generateStarPolygon(10, 30, 15);
const polygonWithHole = generatePolygonWithHole(30, 10);
const complexWithHoles = generateComplexPolygonWithHoles();

group('Polygon Types', () => {
  bench('Simple square', () => {
    findPoleOfInaccessibility([simpleSquare], 1);
  });

  bench('Small triangle', () => {
    findPoleOfInaccessibility([smallTriangle], 1);
  });

  bench('Medium hexagon (7 points)', () => {
    findPoleOfInaccessibility([mediumHexagon], 1);
  });

  bench('Large polygon (51 points)', () => {
    findPoleOfInaccessibility([largePolygon], 1);
  });

  bench('Very large polygon (201 points)', () => {
    findPoleOfInaccessibility([veryLargePolygon], 1);
  });

  bench('Extremely large polygon (1001 points)', () => {
    findPoleOfInaccessibility([extremelyLargePolygon], 1);
  });

  bench('Concave L-shape', () => {
    findPoleOfInaccessibility([concaveL], 1);
  });

  bench('Complex star polygon', () => {
    findPoleOfInaccessibility([complexStar], 1);
  });

  bench('Polygon with single hole', () => {
    findPoleOfInaccessibility(polygonWithHole, 1);
  });

  bench('Polygon with multiple holes', () => {
    findPoleOfInaccessibility(complexWithHoles, 1);
  });
});

group('Precision Levels', () => {
  const testPolygon = [mediumHexagon];

  bench('Precision = 0 (first iteration only)', () => {
    findPoleOfInaccessibility(testPolygon, 0);
  });

  bench('Precision = 10 (low precision)', () => {
    findPoleOfInaccessibility(testPolygon, 10);
  });

  bench('Precision = 1 (default)', () => {
    findPoleOfInaccessibility(testPolygon, 1);
  });

  bench('Precision = 0.1 (high precision)', () => {
    findPoleOfInaccessibility(testPolygon, 0.1);
  });

  bench('Precision = 0.01 (very high precision)', () => {
    findPoleOfInaccessibility(testPolygon, 0.01);
  });

  bench('Precision = 0.001 (extreme precision)', () => {
    findPoleOfInaccessibility(testPolygon, 0.001);
  });
});

group('Edge Cases', () => {
  bench('Single point polygon', () => {
    findPoleOfInaccessibility([[{ x: 5, y: 5 }]], 1);
  });

  bench('Two point polygon (line)', () => {
    findPoleOfInaccessibility(
      [
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 }
        ]
      ],
      1
    );
  });

  bench('Zero area polygon', () => {
    const zeroArea = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 }
    ];
    findPoleOfInaccessibility([zeroArea], 1);
  });

  bench('Very small polygon', () => {
    const tiny = [
      { x: 0, y: 0 },
      { x: 0.1, y: 0 },
      { x: 0.1, y: 0.1 },
      { x: 0, y: 0.1 },
      { x: 0, y: 0 }
    ];
    findPoleOfInaccessibility([tiny], 0.01);
  });
});

await run();
