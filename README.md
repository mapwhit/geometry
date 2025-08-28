[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# geometry

2d cartesian geometry utils used by map.

## Install

```sh  
$ npm install --save @mapwhit/geometry
```  

## API

### `findPoleOfInaccessibility(polygonRings, precision = 1)`

Finds an approximation of a polygon's Pole Of Inaccessibility.

`polygonRings` `[[{x, y}]]` : First item in array is the outer ring followed optionally by the list of holes.  
`precision` `number` : Optional, default `1`. Specified in input coordinate units.  

Returns `{x, y}` - Pole of Inaccessibiliy.

### `distToSegmentSquared(p, v, w)`

Calculates the squared distance from a point to a line segment.

`p` `{x, y}` : Point to measure from.  
`v` `{x, y}` : Start point of line segment.  
`w` `{x, y}` : End point of line segment.  

Returns `number` - Squared distance from point to closest point on line segment.

### `polygonIntersectsPolygon(polygonA, polygonB)`

Tests if two polygons intersect by checking point containment and line intersections.

`polygonA` `[{x, y}]` : First polygon as array of points.  
`polygonB` `[{x, y}]` : Second polygon as array of points.  

Returns `boolean` - True if polygons intersect.

### `polygonIntersectsBufferedPoint(polygon, point, radius)`

Tests if a polygon intersects with a buffered point (point with radius).

`polygon` `[{x, y}]` : Polygon as array of points.  
`point` `{x, y}` : Point to test.  
`radius` `number` : Buffer radius around the point.  

Returns `boolean` - True if polygon intersects the buffered point.

### `polygonIntersectsMultiPolygon(polygon, multiPolygon)`

Tests if a polygon intersects with a multi-polygon (array of polygon rings).

`polygon` `[{x, y}]` : Polygon as array of points.  
`multiPolygon` `[[{x, y}]]` : Array of polygon rings.  

Returns `boolean` - True if polygon intersects any ring of the multi-polygon.

### `polygonIntersectsBufferedMultiLine(polygon, multiLine, radius)`

Tests if a polygon intersects with a buffered multi-line (multiple line strings with radius).

`polygon` `[{x, y}]` : Polygon as array of points.  
`multiLine` `[[{x, y}]]` : Array of line strings.  
`radius` `number` : Buffer radius around the lines.  

Returns `boolean` - True if polygon intersects the buffered multi-line.

### `polygonIntersectsBox(ring, boxX1, boxY1, boxX2, boxY2)`

Tests if a polygon intersects with a bounding box.

`ring` `[{x, y}]` : Polygon as array of points.  
`boxX1` `number` : Left edge of bounding box.  
`boxY1` `number` : Bottom edge of bounding box.  
`boxX2` `number` : Right edge of bounding box.  
`boxY2` `number` : Top edge of bounding box.  

Returns `boolean` - True if polygon intersects the bounding box.

### `isCounterClockwise(a, b, c)`

Indicates if the provided Points are in a counter clockwise (true) or clockwise (false) order.

`a` `{x, y}` : First point  
`b` `{x, y}` : Second point  
`c` `{x, y}` : Third point  

Returns `boolean` - True for a counter clockwise set of points, false for clockwise or collinear.

### `calculateSignedArea(ring)`

Returns the signed area for the polygon ring. Positive areas are exterior rings and have a clockwise winding. Negative areas are interior rings and have a counter clockwise ordering.

`ring` `[{x, y}]` : Exterior or interior ring as array of points  

Returns `number` - Signed area of the polygon ring.

### `isClosedPolygon(points)`

Detects closed polygons where first + last point are equal and area is above threshold.

`points` `[{x, y}]` : Array of points forming the polygon.  

Returns `boolean` - True if the points form a closed polygon with sufficient area.

## [License](LICENSE)

BSD-3-Clause © 2025 [Damian Krzeminski](https://pirxpilot.me)  
BSD-3-Clause © 2016 Mapbox

[npm-image]: https://img.shields.io/npm/v/@mapwhit/geometry
[npm-url]: https://npmjs.org/package/@mapwhit/geometry

[build-url]: https://github.com/mapwhit/geometry/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/mapwhit/geometry/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@mapwhit/geometry
[deps-url]: https://libraries.io/npm/@mapwhit%2Fgeometry
