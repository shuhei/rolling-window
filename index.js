const assert = require("assert");

class RollingWindow {
  constructor(buildChunk, {
    numChunks = 6,
    timeWindow = 1000 * 60,
  } = {}) {
    assert(numChunks > 0, "numChunks must be more than 0");
    assert(timeWindow > 0, "timeWindow must be more than 0");
    this.chunks = Array(numChunks + 1).fill().map(() => buildChunk());
    this.pos = 0;

    this.timeWindow = timeWindow;
    this.buildChunk = buildChunk;
    this.numChunks = numChunks;

    this.rotate = this.rotate.bind(this);
  }

  rotate() {
    this.pos = (this.pos + 1) % this.chunks.length;
    this.chunks[this.pos].reset();
  }

  recordValue(value) {
    this.chunks[this.pos].recordValue(value);
  }

  getSnapshot(givenSnapshot) {
    let snapshot;
    if (givenSnapshot) {
      snapshot = givenSnapshot;
    } else {
      // Create a snapshot on demand.
      if (!this.snapshot) {
        this.snapshot = this.buildChunk();
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
      this.timer.unref();
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

module.exports = RollingWindow;
