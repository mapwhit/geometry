# Geometry Library Benchmarks

This directory contains benchmarks for the geometry library functions.

## Quick Start

```bash
# Run all benchmarks
make bench

# Run specific benchmark suites
make bench-util          # Utility functions
make bench-intersection  # Intersection functions
make bench-pole         # Pole of inaccessibility
```

## Benchmark Suites

### 1. Utility Functions (`util.js`)

Tests the core utility functions:

- **`isCounterClockwise`** - Point orientation testing
- **`calculateSignedArea`** - Polygon area calculation
- **`isClosedPolygon`** - Polygon closure validation

**Key Metrics:**
- Tests polygon sizes from 4 to 1001 points
- Measures scaling performance with polygon complexity
- Tests edge cases (empty, single point, collinear points)

### 2. Intersection Functions (`intersection.js`)

Tests all polygon intersection algorithms:

- **`polygonIntersectsPolygon`** - Polygon-polygon intersection
- **`polygonIntersectsBufferedPoint`** - Point buffer intersection
- **`polygonIntersectsBox`** - Bounding box intersection
- **`distToSegmentSquared`** - Point-to-segment distance
- **`polygonIntersectsMultiPolygon`** - Multi-polygon intersection
- **`polygonIntersectsBufferedMultiLine`** - Multi-line buffer intersection

**Key Metrics:**
- Compares intersecting vs non-intersecting cases
- Tests bounding box optimization effectiveness
- Measures performance with polygon complexity (4 to 1000+ points)
- Tests various geometric shapes (squares, hexagons, stars)

### 3. Pole of Inaccessibility (`pole.js`)

Tests the pole of inaccessibility algorithm:

- Different polygon types (regular, concave, star-shaped)
- Polygons with holes (single and multiple)
- Various precision levels (0 to 0.001)
- Edge cases (single point, lines, zero area)

**Key Metrics:**
- Tests polygon sizes from 5 to 1001 points
- Measures precision vs performance trade-offs
- Tests complex geometries with holes
- Evaluates optimization effectiveness for degenerate cases

## Understanding Results

### Performance Metrics

- **Ops/sec** - Operations per second (higher = better)
- **Avg (ms)** - Average time per operation (lower = better)
- **Total (ms)** - Total benchmark time

### Expected Performance Patterns

#### Utility Functions
- `isCounterClockwise`: ~millions ops/sec (simple arithmetic)
- `calculateSignedArea`: Linear scaling with polygon size
- `isClosedPolygon`: Fast early exits for invalid cases

#### Intersection Functions
- **Non-intersecting polygons**: 10-100x faster due to bounding box optimization
- **Complex polygons**: Performance degrades with point count
- **Simple operations**: `distToSegmentSquared` should be fastest

#### Pole of Inaccessibility
- **Precision = 0**: Fastest (single iteration)
- **Higher precision**: Exponential performance cost
- **Degenerate cases**: Very fast due to optimizations
- **Polygons with holes**: Significantly slower

## Optimization Verification

The benchmarks help verify these optimizations:

### 1. Bounding Box Early Rejection
```javascript
// Should show major speedup for non-intersecting polygons
polygonIntersectsPolygon(smallSquare, distantSquare);
```

### 2. Degenerate Case Handling
```javascript
// Should be very fast, not crash with NaN
findPoleOfInaccessibility([[{x: 5, y: 5}]], 1);
```

### 3. Precision vs Performance Trade-offs
```javascript
// Precision = 0 should be 10-100x faster than precision = 0.001
```

## Performance Baseline

Here are expected performance ranges on modern hardware:

| Function | Simple Cases | Complex Cases | Edge Cases |
|----------|-------------|---------------|------------|
| `isCounterClockwise` | >1M ops/sec | >1M ops/sec | >1M ops/sec |
| `calculateSignedArea` | 100K+ ops/sec | 1K-10K ops/sec | 100K+ ops/sec |
| `polygonIntersectsPolygon` | 10K-100K ops/sec | 100-1K ops/sec | 100K+ ops/sec |
| `findPoleOfInaccessibility` | 1K-10K ops/sec | 10-100 ops/sec | 1K+ ops/sec |
