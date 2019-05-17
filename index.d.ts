import { AbstractHistogram } from "hdr-histogram-js";

type TimeWindow = number; // e.g. 60 * 1000

declare interface RollingWindowOptions {
    numChunks?: number;
    timeWindow?: TimeWindow;
    buildHistogram?: () => AbstractHistogram;
}

declare class RollingWindow {
    constructor(options?: RollingWindowOptions);

    /**
     * Rotate the rolling window positions
     */
    rotate(): void;

    /**
     * Record value for the current window
     */
    recordValue(value: number): void;

    /**
     * Get the histogram for the current window
     * @param histogram Optional histogram if provided
     */
    getSnapshot(histogram?: AbstractHistogram): AbstractHistogram;

    /**
     * Start the rolling window
     */
    start(): void;

    /**
     * Stop the rolling window
     */
    stop(): void;
}

export { RollingWindowOptions };
export default RollingWindow;
