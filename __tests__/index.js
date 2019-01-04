const { build } = require("hdr-histogram-js");
const RollingWindow = require("..");

it("should keep (numChunks + 1) chunks", () => {
  const rolling = new RollingWindow(() => build(), {
    numChunks: 3
  });

  // The first two chunks should be cleared.
  rolling.recordValue(1);
  rolling.rotate();
  rolling.recordValue(2);
  rolling.rotate();
  rolling.recordValue(4);
  rolling.rotate();
  rolling.recordValue(8);
  rolling.rotate();
  rolling.recordValue(16);
  rolling.rotate();
  rolling.recordValue(32);

  const snapshot = rolling.getSnapshot();
  expect(snapshot.getTotalCount()).toBe(4);
  expect(snapshot.getValueAtPercentile(0)).toBe(4);
  expect(snapshot.getValueAtPercentile(30)).toBe(8);
  expect(snapshot.getValueAtPercentile(60)).toBe(16);
  expect(snapshot.getValueAtPercentile(100)).toBe(32);
});
