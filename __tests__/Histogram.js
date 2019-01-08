const { build } = require("hdr-histogram-js");
const Histogram = require("../Histogram");

let rolling;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  rolling.stop();
  jest.useRealTimers();
});

describe("rotation with timer", () => {
  it("should keep (numChunks + 1) chunks", () => {
    const numChunks = 3;
    const timeWindow = 1000 * 60;
    const chunkWindow = timeWindow / numChunks;
    rolling = new Histogram({
      numChunks,
      timeWindow
    });

    rolling.recordValue(1);
    jest.advanceTimersByTime(chunkWindow);
    rolling.recordValue(2);
    jest.advanceTimersByTime(chunkWindow);
    rolling.recordValue(4);
    jest.advanceTimersByTime(chunkWindow);
    rolling.recordValue(8);
    jest.advanceTimersByTime(chunkWindow);
    rolling.recordValue(16);
    jest.advanceTimersByTime(chunkWindow);
    rolling.recordValue(32);

    const snapshot = rolling.getSnapshot();
    expect(snapshot.getTotalCount()).toBe(4);
    expect(snapshot.getValueAtPercentile(0)).toBe(4);
    expect(snapshot.getValueAtPercentile(30)).toBe(8);
    expect(snapshot.getValueAtPercentile(60)).toBe(16);
    expect(snapshot.getValueAtPercentile(100)).toBe(32);
  });
});

describe("getSnapshot", () => {
  it("should reuse the same snapshot", () => {
    rolling = new Histogram();

    rolling.recordValue(1);
    jest.runOnlyPendingTimers();
    rolling.recordValue(10);
    jest.runOnlyPendingTimers();
    rolling.recordValue(100);

    const snapshot1 = rolling.getSnapshot();
    expect(snapshot1.getTotalCount()).toBe(3);

    rolling.recordValue(1000);

    const snapshot2 = rolling.getSnapshot();
    expect(snapshot2).toBe(snapshot1);
    expect(snapshot2.getTotalCount()).toBe(4);
  });

  it("should use the given snapshot", () => {
    rolling = new Histogram();

    rolling.recordValue(1);
    jest.runOnlyPendingTimers();
    rolling.recordValue(10);
    jest.runOnlyPendingTimers();
    rolling.recordValue(100);

    const snapshot = build();

    const snapshot1 = rolling.getSnapshot(snapshot);
    expect(snapshot1).toBe(snapshot);
    expect(snapshot1.getTotalCount()).toBe(3);

    rolling.recordValue(1000);

    const snapshot2 = rolling.getSnapshot(snapshot);
    expect(snapshot2).toBe(snapshot);
    expect(snapshot2.getTotalCount()).toBe(4);
  });
});
