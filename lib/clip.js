/**
 * Returns the part of a multiline that intersects with the provided rectangular box.
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

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    let clippedLine;

    for (let i = 0; i < line.length - 1; i++) {
      let p0 = line[i];
      let p1 = line[i + 1];

      if (p0.x < x1 && p1.x < x1) {
        continue;
      }
      if (p0.x < x1) {
        p0 = round(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)));
      } else if (p1.x < x1) {
        p1 = round(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)));
      }

      if (p0.y < y1 && p1.y < y1) {
        continue;
      }
      if (p0.y < y1) {
        p0 = round(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1);
      } else if (p1.y < y1) {
        p1 = round(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1);
      }

      if (p0.x >= x2 && p1.x >= x2) {
        continue;
      }
      if (p0.x >= x2) {
        p0 = round(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)));
      } else if (p1.x >= x2) {
        p1 = round(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)));
      }

      if (p0.y >= y2 && p1.y >= y2) {
        continue;
      }
      if (p0.y >= y2) {
        p0 = round(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2);
      } else if (p1.y >= y2) {
        p1 = round(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2);
      }

      if (!endsWith(clippedLine, p0)) {
        clippedLine = [p0];
        clippedLines.push(clippedLine);
      }

      clippedLine.push(p1);
    }
  }

  return clippedLines;
}

/**
 * Creates a point with rounded coordinates.
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @returns {{x: number, y: number}} - Point with rounded coordinates
 */
function round(x, y) {
  return {
    x: Math.round(x),
    y: Math.round(y)
  };
}

function endsWith(line, p) {
  if (!line) {
    return false;
  }
  const end = line[line.length - 1];
  return end.x === p.x && end.y === p.y;
}
