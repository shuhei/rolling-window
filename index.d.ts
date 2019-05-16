type TimeWindow = number; // e.g. 60 * 1000

interface Snapshot {
    /**
     * Reset the snapshot
     */
    reset();

    /**
     * 
     * @param snapshot Append chunks of snapshot to the snapshot
     */
    add(snapshot: Snapshot);
}

export interface RollingWindowOptions {
    numChunks?: number;
    timeWindow?: TimeWindow;
    buildHistogram?: () => Snapshot;
}

export class RollingWindow {
    constructor(options?: RollingWindowOptions);

    /**
     * Rotate the rolling window positions
     */
    rotate();

    /**
     * Record value for the current window
     */
    recordValue(value: number);

    /**
     * Get the snapshot for the current window
     * @param snapshot Optional snapshot if provided
     */
    getSnapshot(snapshot: Snapshot): Snapshot;

    /**
     * Start the rolling window
     */
    start();

    /**
     * Stop the rolling window
     */
    stop();
}