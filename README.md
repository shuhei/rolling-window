# rolling-window

[![Actions Status](https://github.com/shuhei/rolling-window/workflows/NodeCI/badge.svg)](https://github.com/shuhei/rolling-window/actions)
[![Codecov](https://codecov.io/gh/shuhei/rolling-window/branch/master/graph/badge.svg)](https://codecov.io/gh/shuhei/rolling-window)
[![npm version](https://badge.fury.io/js/%40shuhei%2Frolling-window.svg)](https://badge.fury.io/js/%40shuhei%2Frolling-window)

Implements "Reset reservoir periodically by chunks" strategy to use [hdr-histogram-js](https://github.com/HdrHistogram/HdrHistogramJS) for monitoring. Inspired by [vladimir-bukhtoyarov/rolling-metrics](https://github.com/vladimir-bukhtoyarov/rolling-metrics).

See [rolling-metrics' documentation](https://github.com/vladimir-bukhtoyarov/rolling-metrics/blob/master/histograms.md) for the background.

## Install

```sh
npm install -S hdr-histogram-js @shuhei/rolling-window
```

## Usage

```js
const { RollingWindowHistogram } = require("@shuhei/rolling-window");

// This configuration creates 7 internal histograms (6 + 1) and rotates them
// one by one in each 10 seconds. `getSnapshot()` returns a histogram of the
// last 60 to 70 seconds. These additional 0 to 10 seconds make sure that the
// rolling window can provide a fresh histogram without losing any records at
// any given time.
const rollingWindowHistogram = new RollingWindowHistogram({
  timeWindow: 1000 * 60,
  numChunks: 6
});

// Record a value
rollingWindowHistogram.recordValue(value);

// Get a snapshot
const snapshot = rollingWindowHistogram.getSnapshot();
const p99 = snapshot.getValueAtPercentile(99);
```

## API

### new RollingWindowHistogram([options])

- `options`
  - `timeWindow: number` The length of a time window in milliseconds. **Default: `60000`**
  - `numChunks: number` The number of chunks in the time window. **Default: `6`**
  - `buildHistogram: () => Histogram` A factory function to create a histogram. This will be called multiple times to prepare necessary histograms in the rolling window. Use this to provide custom options to histograms. **Default: `build` from `hdr-histogram-js`**

Creates a rolling window histogram with `numChunks + 1` histograms in it and starts rotating chunks with an interval of `timeWindow / numChunks`.

### rollingWindowHistogram.stop()

Stop the rotation timer. When you stop using a rolling window histogram, make sure to call this method to avoid memory leak.

### rollingWindowHistogram.recordValue(value)

- `value: number` A numerical value to record. It must not be negative.

### rollingWindowHistogram.getSnapshot([snapshot])

- `snapshot: Histogram` A histogram to accumulate histograms. It is reset before accumulating histograms. If this is not provided, a `Histogram` is created and kept for reuse.
- Returns: `Histogram`
