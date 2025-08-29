// Optimization constants
const AREA_THRESHOLD = 0.01;

/**
 * Indicates if the provided Points are in a counter clockwise (true) or clockwise (false) order
 * @see:  http://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
 * @param {{x: number, y: number}} a - First point
 * @param {{x: number, y: number}} b - Second point
 * @param {{x: number, y: number}} c - Third point
 * @returns {boolean} True for a counter clockwise set of points, false for clockwise or collinear
 */
export function isCounterClockwise(a, b, c) {
  return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
}

/**
 * Returns the signed area for the polygon ring. Positive areas are exterior rings and
 * have a clockwise winding. Negative areas are interior rings and have a counter clockwise
 * ordering.
 *
 * @param {Array<{x: number, y: number}>} ring - Exterior or interior ring as array of points
 * @returns {number} Signed area of the polygon ring (positive for clockwise, negative for counter-clockwise)
 */
export function calculateSignedArea(ring) {
  let sum = 0;
  const len = ring.length;
  let p2 = ring[len - 1]; // last point
  for (const p1 of ring) {
    sum += (p2.x - p1.x) * (p1.y + p2.y);
    p2 = p1;
  }
  return sum;
}

/**
 * Detects closed polygons where first + last point are equal and area is above threshold
 *
 * @param {Array<{x: number, y: number}>} points - Array of points forming the polygon
 * @returns {boolean} True if the points form a closed polygon with sufficient area, false otherwise
 */
export function isClosedPolygon(points) {
  // If it is 2 points that are the same then it is a point
  // If it is 3 points with start and end the same then it is a line
  if (points.length < 4) {
    return false;
  }

  const p1 = points[0];
  const p2 = points[points.length - 1];

  if (Math.abs(p1.x - p2.x) > 0 || Math.abs(p1.y - p2.y) > 0) {
    return false;
  }

  // polygon simplification can produce polygons with zero area and more than 3 points
  return Math.abs(calculateSignedArea(points)) > AREA_THRESHOLD;
}

/**
 * Calculates bounding box for a polygon
 * @param {Array<{x: number, y: number}>} polygon - Polygon as array of points
 * @returns {{minX: number, minY: number, maxX: number, maxY: number}} Bounding box
 */
export function getBoundingBox(polygon) {
  if (polygon.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = polygon[0].x;
  let minY = polygon[0].y;
  let maxX = polygon[0].x;
  let maxY = polygon[0].y;

  for (let i = 1; i < polygon.length; i++) {
    const { x, y } = polygon[i];
    if (x < minX) {
      minX = x;
    } else if (x > maxX) {
      maxX = x;
    }
    if (y < minY) {
      minY = y;
    } else if (y > maxY) {
      maxY = y;
    }
  }

  return { minX, minY, maxX, maxY };
}
