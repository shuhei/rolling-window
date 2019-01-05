# rolling-window

[![npm version](https://badge.fury.io/js/%40shuhei%2Frolling-window.svg)](https://badge.fury.io/js/%40shuhei%2Frolling-window)

Implements "Reset reservoir periodically by chunks" strategy for [hdr-histogram-js](https://github.com/HdrHistogram/HdrHistogramJS).

See [rolling-metrics' documentation](https://github.com/vladimir-bukhtoyarov/rolling-metrics/blob/master/histograms.md) for why it's necessary.

## Install

```sh
npm install -S hdr-histogram-js @shuhei/rolling-window
```

## Usage

```js
const { build } = require("hdr-histogram-js");
const RollingWindow = require("@shuhei/rolling-window");

const buildSnapshot = () => build({ /* Your favorite options */ });

const rollingWindow = new RollingWindow(buildSnapshot, {
  timeWindow: 1000 * 60,
  numChunks: 6
});
rollingWindow.start();

// Record a value
rollingWindow.recordValue(value);

// Get a snapshot
const snapshot = rollingWindow.getSnapshot();
const p99 = snapshot.getValueAtPercentile(99);
```

## API

### new RollingWindow(buildHistogram[, options])

- `buildHistogram: () => Histogram` A factory function to create a histogram. This will be called multiple times to prepare necessary histograms in the rolling window.
- `options`
  - `timeWindow: number` The length of a time window in milliseconds. **Default: `60000`**
  - `numChunks: number` The number of chunks in the time window. **Default: `6`**

Creates a rolling window with `numChunks + 1` histograms in it.

### rollingWindow.start()

Starts the rotation timer.

### rollingWindow.stop()

Stop the rotation timer. When you stop using a rolling window, make sure to call this method to avoid memory leak.

### rollingWindow.recordValue(value)

- `value: number` A numerical value to record. It must not be negative.

### rollingWindow.getSnapshot([snapshot])

- `snapshot: Histogram` A histogram to accumulate histograms. It is reset before accumulating histograms. If this is not provided, a `Histogram` is created and kept for reuse.
- Returns: `Histogram`
