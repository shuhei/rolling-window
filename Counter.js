const RollingWindow = require("./RollingWindow");

// Monotonically increasing counter
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count += 1;
  }

  getCount() {
    this.count;
  }

  reset() {
    this.count = 0;
  }
}

function buildCounter() {
  return new Counter();
}

// TODO: Measure the rate!
class RollingWindowCounter {
  constructor({ timeWindow, numChunks, buildCounter }) {
    this.rollingWindow = new RollingWindow({
      timeWindow,
      numChunks,
      buildChunk: buildCounter
    });
  }

  increment() {
    this.rollingWindow.getCurrent().increment();
  }

  getCount() {
    this.rollingWindow.reduce((acc, chunk) => {
      return acc + chunk.getCount();
    }, 0);
  }

  stop() {
    this.rollingWindow.stop();
  }
}

module.exports = RollingWindowCounter;
