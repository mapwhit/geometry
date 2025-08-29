import { bench, group, run } from 'mitata';
import { calculateSignedArea, isClosedPolygon, isCounterClockwise } from '../lib/util.js';

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
 * Generate random polygon
 * @param {number} numPoints - Number of points
 * @param {number} maxX - Maximum X coordinate
 * @param {number} maxY - Maximum Y coordinate
 * @returns {Array} Array of points
 */
function generateRandomPolygon(numPoints, maxX = 100, maxY = 100) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.random() * maxX,
      y: Math.random() * maxY
    });
  }
  points.push({ ...points[0] });
  return points;
}

/**
 * Generate random points for counter-clockwise testing
 * @returns {Array} Array of three random points
 */
function generateRandomPoints() {
  return [
    { x: Math.random() * 100, y: Math.random() * 100 },
    { x: Math.random() * 100, y: Math.random() * 100 },
    { x: Math.random() * 100, y: Math.random() * 100 }
  ];
}

// Test data generation
const smallTriangle = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 5, y: 10 },
  { x: 0, y: 0 }
];

const mediumPolygon = generateRegularPolygon(20, 50);
const largePolygon = generateRegularPolygon(100, 100);
const veryLargePolygon = generateRegularPolygon(1000, 200);
const complexPolygon = generateRandomPolygon(500);

group('isCounterClockwise', () => {
  bench('counter-clockwise points', () => {
    isCounterClockwise({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 });
  });

  bench('clockwise points', () => {
    isCounterClockwise({ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 0 });
  });

  bench('collinear points', () => {
    isCounterClockwise({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 });
  });

  bench('random points', () => {
    const [a, b, c] = generateRandomPoints();
    isCounterClockwise(a, b, c);
  });
});

group('calculateSignedArea', () => {
  bench('small triangle (4 points)', () => {
    calculateSignedArea(smallTriangle);
  });

  bench('medium polygon (21 points)', () => {
    calculateSignedArea(mediumPolygon);
  });

  bench('large polygon (101 points)', () => {
    calculateSignedArea(largePolygon);
  });

  bench('very large polygon (1001 points)', () => {
    calculateSignedArea(veryLargePolygon);
  });

  bench('complex random polygon (501 points)', () => {
    calculateSignedArea(complexPolygon);
  });

  bench('empty polygon', () => {
    calculateSignedArea([]);
  });

  bench('single point', () => {
    calculateSignedArea([{ x: 5, y: 5 }]);
  });
});

group('isClosedPolygon', () => {
  bench('valid closed polygon', () => {
    isClosedPolygon(mediumPolygon);
  });

  bench('too few points', () => {
    const tooFewPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ];
    isClosedPolygon(tooFewPoints);
  });

  bench('not closed polygon', () => {
    const notClosed = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 1, y: 1 } // Different last point
    ];
    isClosedPolygon(notClosed);
  });

  bench('zero area polygon', () => {
    const zeroArea = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 }
    ];
    isClosedPolygon(zeroArea);
  });

  bench('large closed polygon', () => {
    isClosedPolygon(largePolygon);
  });

  bench('very large closed polygon', () => {
    isClosedPolygon(veryLargePolygon);
  });
});

await run();
