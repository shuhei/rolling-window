const assert = require("assert");

class RollingWindow {
  constructor({ numChunks = 6, timeWindow = 1000 * 60, buildChunk } = {}) {
    assert(numChunks > 0, "numChunks must be more than 0");
    assert(timeWindow > 0, "timeWindow must be more than 0");
    assert.equal(
      typeof buildChunk,
      "function",
      "buildChunk must be a function"
    );

    this.buildChunk = buildChunk;
    this.timeWindow = timeWindow;
    this.numChunks = numChunks;

    this.chunks = Array(numChunks + 1)
      .fill()
      .map(() => buildChunk());
    this.pos = 0;
    this.rotate = this.rotate.bind(this);

    this.start();
  }

  rotate() {
    this.pos = (this.pos + 1) % this.chunks.length;
    this.chunks[this.pos].reset();
  }

  getCurrent() {
    return this.chunks[this.pos];
  }

  reduce(callback, initialValue) {
    return this.chunks.reduce(callback, initialValue);
  }

  start() {
    if (!this.timer) {
      this.timer = setInterval(this.rotate, this.timeWindow / this.numChunks);
      if (typeof this.timer.unref === "function") {
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

module.exports = RollingWindow;
