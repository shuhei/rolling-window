const { build } = require("hdr-histogram-js");
const RollingWindow = require("..");

let rolling;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  rolling.stop();
  jest.useRealTimers();
});

it("should keep (numChunks + 1) chunks", () => {
  const numChunks = 3;
  const timeWindow = 1000 * 60;
  const chunkWindow = timeWindow / numChunks;
  rolling = new RollingWindow(build, {
    numChunks,
    timeWindow
  });
  rolling.start();

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
});
