import { build, AbstractHistogram } from "hdr-histogram-js";
import * as assert from "assert";

export interface RollingWindowHistogramOptions {
  /**
   * The length of a time window in milliseconds.
   *
   * Default: 60000
   */
  timeWindow?: number;
  /**
   * The number of chunks in a time window.
   *
   * Default: 6
   */
  numChunks?: number;
  /**
   * The factory function to create a histogram. This will be called multiple times to prepare necessary histograms in the rolling window. Use this to provide custom options to histograms.
   *
   * Default: build from hdr-histogram-js
   */
  buildHistogram?: () => AbstractHistogram;
}

export class RollingWindowHistogram {
  private numChunks: number;
  private timeWindow: number;
  private buildHistogram: () => AbstractHistogram;

  private chunks: AbstractHistogram[];
  private pos: number;
  private snapshot?: AbstractHistogram;
  private timer: NodeJS.Timer | null = null;

  /**
   * Creates a rolling window with numChunks + 1 histograms in it and starts rotating chunks with an interval of timeWindow / numChunks.
   */
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

  /**
   * Rotate the rolling window positions.
   */
  rotate = (): void => {
    this.pos = (this.pos + 1) % this.chunks.length;
    this.chunks[this.pos].reset();
  };

  /**
   * Record a value in the current window.
   *
   * @param value A numerical value to record. It must not be negative.
   */
  recordValue(value: number): void {
    // `Math.floor()` for fixing an issue of min non-zero value aggregation.
    // https://github.com/shuhei/rolling-window/pull/6
    this.chunks[this.pos].recordValue(Math.floor(value));
  }

  /**
   * Get the histogram for the current window.
   *
   * @param givenSnapshot An optional histogram to accumulate histograms. It is reset before accumulating histograms. If this is not provided, a Histogram is created and kept for reuse.
   */
  getSnapshot(givenSnapshot?: AbstractHistogram): AbstractHistogram {
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

  /**
   * Start the rotation timer.
   */
  start(): void {
    if (!this.timer) {
      this.timer = setInterval(this.rotate, this.timeWindow / this.numChunks);
      if (this.timer && typeof this.timer.unref === "function") {
        this.timer.unref();
      }
    }
  }

  /**
   * Stop the rotation timer. When you stop using a rolling window, make sure to call this method to avoid memory leak.
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
