import Queue from 'tinyqueue';
import { distToSegmentSquared } from './intersections.js';
import { getBoundingBox } from './util.js';

/**
 * Finds an approximation of a polygon's Pole Of Inaccessibiliy https://en.wikipedia.org/wiki/Pole_of_inaccessibility
 *
 * @param {Array<Array<{x: number, y: number}>>} polygonRings - First item in array is the outer ring followed optionally by the list of holes,
 *  should be an element of the result of util/classify_rings
 * @param {number} [precision=1] - Specified in input coordinate units. If 0 returns after first run,
 *  if > 0 repeatedly narrows the search space until the radius of the area searched for the best pole is less than precision
 * @returns {{x: number, y: number}} Pole of Inaccessibiliy.
 */
export function findPoleOfInaccessibility(polygonRings, precision = 1) {
  // find the bounding box of the outer ring
  const outerRing = polygonRings[0];
  if (!outerRing || outerRing.length === 0) {
    throw new Error('Invalid polygon: empty outer ring');
  }

  const { minX, minY, maxX, maxY } = getBoundingBox(outerRing);
  const width = maxX - minX;
  const height = maxY - minY;
  const cellSize = Math.min(width, height);

  // Handle degenerate cases early
  if (cellSize === 0) {
    return { x: minX, y: minY };
  }

  const h = cellSize / 2;

  // cover polygon with initial cells
  const cells = [];
  for (let x = minX; x < maxX; x += cellSize) {
    const xh = x + h;
    for (let y = minY; y < maxY; y += cellSize) {
      cells.push(makeCell(xh, y + h, h, polygonRings));
    }
  }

  // a priority queue of cells in order of their "potential" (max distance to polygon)
  const cellQueue = new Queue(cells, compareMax);

  // take centroid as the first best guess
  let bestCell = getCentroidCell(polygonRings);

  // If centroid is outside polygon (NaN distance), use bbox center as fallback
  if (bestCell.d < 0 || !Number.isFinite(bestCell.d)) {
    const bboxCenter = makeCell(minX + width / 2, minY + height / 2, 0, polygonRings);
    if (bboxCenter.d > bestCell.d || !Number.isFinite(bestCell.d)) {
      bestCell = bboxCenter;
    }
  }

  while (cellQueue.length > 0) {
    // pick the most promising cell from the queue
    const cell = cellQueue.pop();

    // update the best cell if we found a better one
    if (cell.d > bestCell.d || bestCell.d === 0) {
      bestCell = cell;
      //  debug('found best %d after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes);
    }

    // do not drill down further if there's no chance of a better solution
    if (cell.max - bestCell.d <= precision) {
      continue;
    }

    // split the cell into four cells
    const h = cell.h / 2;
    cellQueue.push(makeCell(cell.p.x - h, cell.p.y - h, h, polygonRings));
    cellQueue.push(makeCell(cell.p.x + h, cell.p.y - h, h, polygonRings));
    cellQueue.push(makeCell(cell.p.x - h, cell.p.y + h, h, polygonRings));
    cellQueue.push(makeCell(cell.p.x + h, cell.p.y + h, h, polygonRings));
  }

  // debug(`num probes: ${numProbes}`, `best distance: ${bestCell.d}`);

  return bestCell.p;
}

/**
 * Calculates signed distance from point to polygon outline (negative if point is outside)
 *
 * @param {{x: number, y: number}} p - Point to calculate distance from
 * @param {Array<Array<{x: number, y: number}>>} polygon - Polygon rings array
 * @returns {number} Signed distance from point to polygon outline (negative if point is outside)
 */
function pointToPolygonDist(p, polygon) {
  let inside = false;
  let minDistSq = Number.POSITIVE_INFINITY;

  const { x, y } = p;
  for (const ring of polygon) {
    for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
      const a = ring[i];
      const b = ring[j];

      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
        inside = !inside;
      }

      const distSq = distToSegmentSquared(p, a, b);
      if (distSq < minDistSq) {
        minDistSq = distSq;
      }
    }
  }

  const minDist = Math.sqrt(minDistSq);
  return inside ? minDist : -minDist;
}

/**
 * Finds polygon centroid using area-weighted calculation
 * @param {Array<Array<{x: number, y: number}>>} polygon - Polygon rings array
 * @returns {{p: {x: number, y: number}, h: number, d: number, max: number}} Centroid cell of the polygon
 */
function getCentroidCell(polygon) {
  let area = 0;
  let x = 0;
  let y = 0;
  const points = polygon[0];
  if (!points || points.length === 0) {
    return makeCell(0, 0, 0, polygon);
  }

  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    const a = points[i];
    const b = points[j];
    const f = a.x * b.y - b.x * a.y;
    x += (a.x + b.x) * f;
    y += (a.y + b.y) * f;
    area += f * 3;
  }

  // Handle degenerate polygon (zero area)
  if (Math.abs(area) < 1e-10) {
    return makeCell(points[0].x, points[0].y, 0, polygon);
  }

  return makeCell(x / area, y / area, 0, polygon);
}

/**
 * Comparison function for priority queue ordering by max potential
 * @param {{max: number}} a - First cell object
 * @param {{max: number}} b - Second cell object
 * @returns {number} Comparison result for sorting by max potential (descending)
 */
function compareMax(a, b) {
  return b.max - a.max;
}

/**
 * Creates a cell object for the grid search algorithm
 * @param {number} x - X coordinate of cell center
 * @param {number} y - Y coordinate of cell center
 * @param {number} h - Half of cell size
 * @param {Array<Array<{x: number, y: number}>>} polygon - Polygon rings array
 * @returns {{p: {x: number, y: number}, h: number, d: number, max: number}} Cell object with position, size, distance, and max potential
 */
function makeCell(x, y, h, polygon) {
  const p = { x, y };
  const d = pointToPolygonDist(p, polygon); // distance from cell center to polygon
  const max = d + h * Math.SQRT2; // max distance to polygon within a cell
  return {
    p,
    h,
    d,
    max
  };
}
