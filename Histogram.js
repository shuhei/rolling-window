const { build } = require("hdr-histogram-js");
const assert = require("assert");
const RollingWindow = require("./RollingWindow");

class RollingWindowHistogram {
  constructor({ numChunks, timeWindow, buildHistogram = build } = {}) {
    assert.equal(
      typeof buildHistogram,
      "function",
      "buildHistogram must be a function"
    );

    this.buildHistogram = buildHistogram;

    this.rollingWindow = new RollingWindow({
      numChunks,
      timeWindow,
      buildChunk: buildHistogram
    });
  }

  recordValue(value) {
    this.rollingWindow.getCurrent().recordValue(value);
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

    return this.rollingWindow.reduce((acc, chunk) => {
      acc.add(chunk);
      return acc;
    }, snapshot);
  }

  stop() {
    this.rollingWindow.stop();
  }
}

module.exports = RollingWindowHistogram;
