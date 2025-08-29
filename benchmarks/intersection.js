import { bench, group, run } from 'mitata';
import {
  distToSegmentSquared,
  polygonIntersectsBox,
  polygonIntersectsBufferedMultiLine,
  polygonIntersectsBufferedPoint,
  polygonIntersectsMultiPolygon,
  polygonIntersectsPolygon
} from '../lib/intersections.js';

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
 * Generate a complex star-shaped polygon
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
const smallSquare = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
  { x: 0, y: 0 }
];

const mediumHexagon = generateRegularPolygon(6, 20);
const largePolygon = generateRegularPolygon(100, 50);
const complexStar = generateStarPolygon(20, 30, 15);
const veryLargePolygon = generateRegularPolygon(1000, 100);

const intersectingSquare = [
  { x: 5, y: 5 },
  { x: 15, y: 5 },
  { x: 15, y: 15 },
  { x: 5, y: 15 },
  { x: 5, y: 5 }
];

const nonIntersectingSquare = [
  { x: 50, y: 50 },
  { x: 60, y: 50 },
  { x: 60, y: 60 },
  { x: 50, y: 60 },
  { x: 50, y: 50 }
];

group('polygonIntersectsPolygon', () => {
  bench('Small intersecting polygons', () => {
    polygonIntersectsPolygon(smallSquare, intersectingSquare);
  });

  bench('Small non-intersecting polygons', () => {
    polygonIntersectsPolygon(smallSquare, nonIntersectingSquare);
  });

  bench('Medium intersecting polygons', () => {
    polygonIntersectsPolygon(mediumHexagon, generateRegularPolygon(6, 20, 5, 5));
  });

  bench('Large intersecting polygons', () => {
    polygonIntersectsPolygon(largePolygon, generateRegularPolygon(100, 50, 10, 10));
  });

  bench('Complex star vs simple polygon', () => {
    polygonIntersectsPolygon(complexStar, smallSquare);
  });

  bench('Very large polygons', () => {
    polygonIntersectsPolygon(veryLargePolygon, generateRegularPolygon(1000, 100, 10, 10));
  });
});

group('Other intersection functions', () => {
  const testPoint = { x: 5, y: 5 };
  bench('polygonIntersectsBufferedPoint', () => {
    polygonIntersectsBufferedPoint(mediumHexagon, testPoint, 2);
  });

  bench('polygonIntersectsBox', () => {
    polygonIntersectsBox(mediumHexagon, 0, 0, 20, 20);
  });

  bench('distToSegmentSquared', () => {
    distToSegmentSquared(testPoint, { x: 0, y: 0 }, { x: 10, y: 10 });
  });

  const multiPolygon = [mediumHexagon, generateRegularPolygon(4, 10, 30, 30)];
  bench('polygonIntersectsMultiPolygon', () => {
    polygonIntersectsMultiPolygon(smallSquare, multiPolygon);
  });

  const multiLine = [
    [
      { x: 0, y: 5 },
      { x: 20, y: 5 }
    ],
    [
      { x: 10, y: 0 },
      { x: 10, y: 20 }
    ]
  ];
  bench('polygonIntersectsBufferedMultiLine', () => {
    polygonIntersectsBufferedMultiLine(mediumHexagon, multiLine, 2);
  });
});

await run();
