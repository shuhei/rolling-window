# rolling-window

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

// Record a value
rollingWindow.recordValue(value);

// Get a snapshot
const snapshot = rollingWindow.getSnapshot();
const p99 = snapshot.getValueAtPercentile(99);
```
