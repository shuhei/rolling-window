# Changelog

## 1.0.0

### Changed

- Support `hdr-histogram-js@2`, which is [not compatible with `hdr-histogram-js@1`](https://github.com/HdrHistogram/HdrHistogramJS#migrating-from-v1-to-v2).

## 0.2.1

### Fixed

- Missing files in npm package (#20)

## 0.2.0

### Changed

- Removed the CommonJS module export and the ES module default export
- Exported the rolling window histogram class as `RollingWindowHistogram`.
- Made `rotate` method of `RollingWindowHistogram` private.
- Renamed `RollingWindowOptions` as `RollingWindowHistogramOptions`
