import { build, AbstractHistogram } from "hdr-histogram-js";
import * as assert from "assert";

export interface RollingWindowHistogramOptions {
  numChunks?: number;
  timeWindow?: number;
  buildHistogram?: () => AbstractHistogram;
}

export class RollingWindowHistogram {
  numChunks: number;
  timeWindow: number;
  buildHistogram: () => AbstractHistogram;

  chunks: AbstractHistogram[];
  pos: number;
  snapshot?: AbstractHistogram;
  timer: NodeJS.Timer | null = null;

  constructor({
    numChunks = 6,
    timeWindow = 1000 * 60,
    buildHistogram = build
  } = {}) {
    assert.ok(numChunks > 0, "numChunks must be more than 0");
    assert.ok(timeWindow > 0, "timeWindow must be more than 0");
    assert.equal(
      typeof buildHistogram,
      "function",
      "buildHistogram must be a function"
    );

    this.buildHistogram = buildHistogram;
    this.timeWindow = timeWindow;
    this.numChunks = numChunks;

    this.chunks = Array.from({ length: numChunks + 1 }, () => buildHistogram());
    this.pos = 0;

    this.start();
  }

  rotate = () => {
    this.pos = (this.pos + 1) % this.chunks.length;
    this.chunks[this.pos].reset();
  };

  recordValue(value: number) {
    // `Math.floor()` for fixing an issue of min non-zero value aggregation.
    // https://github.com/shuhei/rolling-window/pull/6
    this.chunks[this.pos].recordValue(Math.floor(value));
  }

  getSnapshot(givenSnapshot?: AbstractHistogram) {
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
      if (this.timer && typeof this.timer.unref === "function") {
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
