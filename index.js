const { build } = require("hdr-histogram-js");
const assert = require("assert");

class RollingWindow {
  constructor({
    numChunks = 6,
    timeWindow = 1000 * 60,
    buildHistogram = build
  } = {}) {
    assert(numChunks > 0, "numChunks must be more than 0");
    assert(timeWindow > 0, "timeWindow must be more than 0");
    assert.equal(typeof buildHistogram, "function", "buildHistogram must be a function");

    this.buildHistogram = buildHistogram;
    this.timeWindow = timeWindow;
    this.numChunks = numChunks;

    this.chunks = Array(numChunks + 1).fill().map(() => buildHistogram());
    this.pos = 0;
    this.rotate = this.rotate.bind(this);

    this.start();
  }

  rotate() {
    this.pos = (this.pos + 1) % this.chunks.length;
    this.chunks[this.pos].reset();
  }

  recordValue(value) {
    this.chunks[this.pos].recordValue(Math.floor(value));
  }

  getSnapshot(givenSnapshot) {
    let snapshot;
    if (givenSnapshot) {
      // Allow users to provide a snapshot. This is useful to save memory
      // by reusing one histogram when there are many `RollingWindow`s.
      snapshot = givenSnapshot;
    } else {
      // Create a snapshot on demand to save memory.
      if (!this.snapshot) {
        this.snapshot = this.buildHistogram();
      }
      snapshot = this.snapshot;
    }
    snapshot.reset();
    for (const chunk of this.chunks) {
      snapshot.add(chunk);
    }
    return snapshot;
  }

  start() {
    if (!this.timer) {
      this.timer = setInterval(this.rotate, this.timeWindow / this.numChunks);
      if (typeof this.timer.unref === 'function') {
        this.timer.unref();
      }
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Make TypeScript users believe that this package is an ES module with a default export
// regardless of `--esModuleInterop`.
// https://github.com/shuhei/rolling-window/issues/5
Object.defineProperty(RollingWindow, "__esModule", { value: true });
RollingWindow.default = RollingWindow;

module.exports = RollingWindow;
