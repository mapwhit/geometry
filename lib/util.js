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
  return Math.abs(calculateSignedArea(points)) > 0.01;
}
