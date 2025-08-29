import { getBoundingBox, isCounterClockwise } from './util.js';

// Performance optimization constants (reserved for future use)
// const EPSILON = 1e-10;
// const BOUNDING_BOX_PADDING = 0;

/**
 * Tests if two bounding boxes intersect
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} boxA - First bounding box
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} boxB - Second bounding box
 * @returns {boolean} True if bounding boxes intersect
 */
export function boundingBoxesIntersect(boxA, boxB) {
  return !(boxA.maxX < boxB.minX || boxB.maxX < boxA.minX || boxA.maxY < boxB.minY || boxB.maxY < boxA.minY);
}

/**
 * Tests if two polygons intersect by checking point containment and line intersections
 * @param {Array<{x: number, y: number}>} polygonA - First polygon as array of points
 * @param {Array<{x: number, y: number}>} polygonB - Second polygon as array of points
 * @returns {boolean} True if polygons intersect, false otherwise
 */
export function polygonIntersectsPolygon(polygonA, polygonB) {
  // Early exit for empty polygons
  if (polygonA.length === 0 || polygonB.length === 0) {
    return false;
  }

  // Quick bounding box intersection test first
  const boxA = getBoundingBox(polygonA);
  const boxB = getBoundingBox(polygonB);

  if (!boundingBoxesIntersect(boxA, boxB)) {
    return false;
  }

  // Check if any point of A is in B
  for (const point of polygonA) {
    if (polygonContainsPoint(polygonB, point)) {
      return true;
    }
  }

  // Check if any point of B is in A
  for (const point of polygonB) {
    if (polygonContainsPoint(polygonA, point)) {
      return true;
    }
  }

  // Check if any edges intersect
  if (lineIntersectsLine(polygonA, polygonB)) {
    return true;
  }

  return false;
}

/**
 * Tests if a polygon intersects with a buffered point (point with radius)
 * @param {Array<{x: number, y: number}>} polygon - Polygon as array of points
 * @param {{x: number, y: number}} point - Point to test
 * @param {number} radius - Buffer radius around the point
 * @returns {boolean} True if polygon intersects the buffered point, false otherwise
 */
export function polygonIntersectsBufferedPoint(polygon, point, radius) {
  if (polygonContainsPoint(polygon, point)) {
    return true;
  }
  if (pointIntersectsBufferedLine(point, polygon, radius)) {
    return true;
  }
  return false;
}

/**
 * Tests if a polygon intersects with a multi-polygon (array of polygon rings)
 * @param {Array<{x: number, y: number}>} polygon - Polygon as array of points
 * @param {Array<Array<{x: number, y: number}>>} multiPolygon - Array of polygon rings
 * @returns {boolean} True if polygon intersects any ring of the multi-polygon, false otherwise
 */
export function polygonIntersectsMultiPolygon(polygon, multiPolygon) {
  if (polygon.length === 1) {
    return multiPolygonContainsPoint(multiPolygon, polygon[0]);
  }

  for (const ring of multiPolygon) {
    for (const point of ring) {
      if (polygonContainsPoint(polygon, point)) {
        return true;
      }
    }
  }

  for (const point of polygon) {
    if (multiPolygonContainsPoint(multiPolygon, point)) {
      return true;
    }
  }

  for (const line of multiPolygon) {
    if (lineIntersectsLine(polygon, line)) {
      return true;
    }
  }

  return false;
}

/**
 * Tests if a polygon intersects with a buffered multi-line (multiple line strings with radius)
 * @param {Array<{x: number, y: number}>} polygon - Polygon as array of points
 * @param {Array<Array<{x: number, y: number}>>} multiLine - Array of line strings
 * @param {number} radius - Buffer radius around the lines
 * @returns {boolean} True if polygon intersects the buffered multi-line, false otherwise
 */
export function polygonIntersectsBufferedMultiLine(polygon, multiLine, radius) {
  for (const line of multiLine) {
    if (polygon.length >= 3) {
      for (const point of line) {
        if (polygonContainsPoint(polygon, point)) {
          return true;
        }
      }
    }

    if (lineIntersectsBufferedLine(polygon, line, radius)) {
      return true;
    }
  }
  return false;
}

/**
 * Tests if two lines intersect when one has a buffer radius
 * @param {Array<{x: number, y: number}>} lineA - First line as array of points
 * @param {Array<{x: number, y: number}>} lineB - Second line as array of points
 * @param {number} radius - Buffer radius around the lines
 * @returns {boolean} True if lines intersect within buffer distance, false otherwise
 */
function lineIntersectsBufferedLine(lineA, lineB, radius) {
  if (lineA.length > 1) {
    if (lineIntersectsLine(lineA, lineB)) {
      return true;
    }

    // Check whether any point in either line is within radius of the other line
    for (const point of lineB) {
      if (pointIntersectsBufferedLine(point, lineA, radius)) {
        return true;
      }
    }
  }

  for (const point of lineA) {
    if (pointIntersectsBufferedLine(point, lineB, radius)) {
      return true;
    }
  }

  return false;
}

/**
 * Tests if two lines intersect by checking all line segment pairs
 * @param {Array<{x: number, y: number}>} lineA - First line as array of points
 * @param {Array<{x: number, y: number}>} lineB - Second line as array of points
 * @returns {boolean} True if any segments of the lines intersect, false otherwise
 */
function lineIntersectsLine(lineA, lineB) {
  if (lineA.length === 0 || lineB.length === 0) {
    return false;
  }
  let a0 = lineA[0];
  for (let i = 1; i < lineA.length; i++) {
    const a1 = lineA[i];
    let b0 = lineB[0];
    for (let j = 1; j < lineB.length; j++) {
      const b1 = lineB[j];
      if (lineSegmentIntersectsLineSegment(a0, a1, b0, b1)) {
        return true;
      }
      b0 = b1;
    }
    a0 = a1;
  }
  return false;
}

/**
 * Tests if two line segments intersect using counter-clockwise orientation
 * @param {{x: number, y: number}} a0 - Start point of first segment
 * @param {{x: number, y: number}} a1 - End point of first segment
 * @param {{x: number, y: number}} b0 - Start point of second segment
 * @param {{x: number, y: number}} b1 - End point of second segment
 * @returns {boolean} True if line segments intersect, false otherwise
 */
function lineSegmentIntersectsLineSegment(a0, a1, b0, b1) {
  return (
    isCounterClockwise(a0, b0, b1) !== isCounterClockwise(a1, b0, b1) &&
    isCounterClockwise(a0, a1, b0) !== isCounterClockwise(a0, a1, b1)
  );
}

/**
 * Tests if a point is within buffer distance of a line
 * @param {{x: number, y: number}} p - Point to test
 * @param {Array<{x: number, y: number}>} line - Line as array of points
 * @param {number} radius - Buffer radius around the line
 * @returns {boolean} True if point is within buffer distance of line, false otherwise
 */
function pointIntersectsBufferedLine(p, line, radius) {
  const radiusSquared = radius ** 2;

  if (line.length === 1) {
    return distSqr(p, line[0]) < radiusSquared;
  }

  let v = line[0];
  for (let i = 1; i < line.length; i++) {
    // Find line segments that have a distance <= radius^2 to p
    // In that case, we treat the line as "containing point p".
    const w = line[i];
    if (distToSegmentSquared(p, v, w) < radiusSquared) {
      return true;
    }
    v = w;
  }
  return false;
}

/**
 * Calculates the squared distance from a point to a line segment
 * Code from http://stackoverflow.com/a/1501725/331379.
 * @param {{x: number, y: number}} p - Point to measure from
 * @param {{x: number, y: number}} v - Start point of line segment
 * @param {{x: number, y: number}} w - End point of line segment
 * @returns {number} Squared distance from point to closest point on line segment
 */
export function distToSegmentSquared(p, v, w) {
  const l2 = distSqr(v, w);
  if (l2 === 0) {
    return distSqr(p, v);
  }
  const t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) {
    return distSqr(p, v);
  }
  if (t > 1) {
    return distSqr(p, w);
  }
  return distSqr(p, {
    x: (w.x - v.x) * t + v.x,
    y: (w.y - v.y) * t + v.y
  });
}

/**
 * Calculates squared distance between two points
 * @param {{x: number, y: number}} p - First point
 * @param {{x: number, y: number}} q - Second point
 * @returns {number} Squared distance between points
 */
function distSqr(p, q) {
  return (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
}

/**
 * Tests if a point is contained within a multi-polygon using ray casting algorithm
 * @param {Array<Array<{x: number, y: number}>>} rings - Array of polygon rings
 * @param {{x: number, y: number}} param1 - Point with x,y coordinates to test
 * @returns {boolean} True if point is inside multi-polygon, false otherwise
 */
export function multiPolygonContainsPoint(rings, { x, y }) {
  let c = false;

  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const p1 = ring[i];
      const p2 = ring[j];
      if (p1.y > y !== p2.y > y && x < ((p2.x - p1.x) * (y - p1.y)) / (p2.y - p1.y) + p1.x) {
        c = !c;
      }
    }
  }
  return c;
}

/**
 * Tests if a point is contained within a polygon using ray casting algorithm
 * @param {Array<{x: number, y: number}>} ring - Polygon ring as array of points
 * @param {{x: number, y: number}} param1 - Point with x,y coordinates to test
 * @returns {boolean} True if point is inside polygon, false otherwise
 */
export function polygonContainsPoint(ring, { x, y }) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const p1 = ring[i];
    const p2 = ring[j];
    if (p1.y > y !== p2.y > y && x < ((p2.x - p1.x) * (y - p1.y)) / (p2.y - p1.y) + p1.x) {
      c = !c;
    }
  }
  return c;
}

/**
 * Tests if a polygon intersects with a bounding box
 * @param {Array<{x: number, y: number}>} ring - Polygon as array of points
 * @param {number} boxX1 - Left edge of bounding box
 * @param {number} boxY1 - Bottom edge of bounding box
 * @param {number} boxX2 - Right edge of bounding box
 * @param {number} boxY2 - Top edge of bounding box
 * @returns {boolean} True if polygon intersects the bounding box, false otherwise
 */
export function polygonIntersectsBox(ring, boxX1, boxY1, boxX2, boxY2) {
  for (const { x, y } of ring) {
    if (boxX1 <= x && boxY1 <= y && boxX2 >= x && boxY2 >= y) {
      return true;
    }
  }

  const corners = [
    { x: boxX1, y: boxY1 },
    { x: boxX1, y: boxY2 },
    { x: boxX2, y: boxY2 },
    { x: boxX2, y: boxY1 }
  ];

  if (ring.length > 2) {
    for (const corner of corners) {
      if (polygonContainsPoint(ring, corner)) {
        return true;
      }
    }
  }

  let p1 = ring[0];
  for (let i = 1; i < ring.length; i++) {
    const p2 = ring[i];
    if (edgeIntersectsBox(p1, p2, corners)) {
      return true;
    }
    p1 = p2;
  }

  return false;
}

/**
 * Tests if a polygon edge intersects with a bounding box
 * @param {{x: number, y: number}} e1 - Start point of edge
 * @param {{x: number, y: number}} e2 - End point of edge
 * @param {Array<{x: number, y: number}>} corners - Array of box corner points
 * @returns {boolean} True if edge intersects the box, false otherwise
 */
function edgeIntersectsBox(e1, e2, corners) {
  const tl = corners[0];
  const br = corners[2];
  // the edge and box do not intersect in either the x or y dimensions
  if (
    (e1.x < tl.x && e2.x < tl.x) ||
    (e1.x > br.x && e2.x > br.x) ||
    (e1.y < tl.y && e2.y < tl.y) ||
    (e1.y > br.y && e2.y > br.y)
  ) {
    return false;
  }

  // check if all corners of the box are on the same side of the edge
  const dir = isCounterClockwise(e1, e2, corners[0]);
  return (
    dir !== isCounterClockwise(e1, e2, corners[1]) ||
    dir !== isCounterClockwise(e1, e2, corners[2]) ||
    dir !== isCounterClockwise(e1, e2, corners[3])
  );
}
