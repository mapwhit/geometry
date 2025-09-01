/**
 * Returns the part of a multiline that intersects with the provided rectangular box.
 * Uses Liang-Barsky algorithm for efficient line clipping against a rectangular boundary.
 *
 * @param {Array<Array<{x: number, y: number}>>} lines - Array of line strings, each consisting of points with x, y coordinates
 * @param {number} x1 - The left edge of the bounding box
 * @param {number} y1 - The top edge of the bounding box
 * @param {number} x2 - The right edge of the bounding box
 * @param {number} y2 - The bottom edge of the bounding box
 * @returns {Array<Array<{x: number, y: number}>>} - Array of clipped line strings that fall within the bounding box
 */
export function clipLine(lines, x1, y1, x2, y2) {
  const clippedLines = [];

  // Handle zero-sized clipping box
  if (x1 === x2 || y1 === y2) {
    return [];
  }

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    let clippedLine;

    for (let i = 0; i < line.length - 1; i++) {
      const p0 = line[i];
      const p1 = line[i + 1];

      // Use Liang-Barsky algorithm to clip the segment
      const segment = clipSegment(p0, p1, x1, y1, x2, y2);

      if (!segment) {
        continue;
      }

      // Start a new line if this is the first segment or if it doesn't connect to the previous one
      if (!clippedLine || !connected(clippedLine, segment)) {
        clippedLine = [segment[0]];
        clippedLines.push(clippedLine);
      }
      // Add the end point of the segment
      clippedLine.push(segment[1]);
    }
  }

  return clippedLines;
}

/**
 * Clips a single line segment using the Liang-Barsky algorithm.
 *
 * @param {{x: number, y: number}} p0 - Start point of the line segment
 * @param {{x: number, y: number}} p1 - End point of the line segment
 * @param {number} xmin - Left edge of the bounding box
 * @param {number} ymin - Top edge of the bounding box
 * @param {number} xmax - Right edge of the bounding box
 * @param {number} ymax - Bottom edge of the bounding box
 * @returns {Array<{x: number, y: number}>|null} - Array containing two points of the clipped segment, or null if outside
 */
function clipSegment(p0, p1, xmin, ymin, xmax, ymax) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;

  // Define the parameter values for the four boundaries
  const p = [-dx, dx, -dy, dy];
  const q = [
    p0.x - xmin, // left boundary
    xmax - p0.x, // right boundary
    p0.y - ymin, // top boundary
    ymax - p0.y // bottom boundary
  ];

  // Initialize with default parameter values
  let tMin = 0;
  let tMax = 1;

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      // Line is parallel to this boundary
      if (q[i] < 0) {
        // Line is outside this boundary
        return;
      }
      // Otherwise line is inside this boundary, continue checking others
    } else {
      const t = q[i] / p[i];

      if (p[i] < 0) {
        // Line is entering the boundary
        tMin = Math.max(tMin, t);
      } else {
        // Line is exiting the boundary
        tMax = Math.min(tMax, t);
      }

      // If line is completely outside or tMin has exceeded tMax, reject
      if (tMin > tMax) {
        return;
      }
    }
  }

  // Calculate the clipped points using the parameters
  const x1 = Math.round(p0.x + tMin * dx);
  const y1 = Math.round(p0.y + tMin * dy);
  const x2 = Math.round(p0.x + tMax * dx);
  const y2 = Math.round(p0.y + tMax * dy);

  // Check if the rounded points would be on or outside the clipping box boundaries
  if ((x1 >= xmin && x1 < xmax && y1 >= ymin && y1 < ymax) || (x2 >= xmin && x2 < xmax && y2 >= ymin && y2 < ymax)) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ];
  }
}

function connected(a, b) {
  const end = a[a.length - 1];
  const start = b[0];
  return end.x === start.x && end.y === start.y;
}
