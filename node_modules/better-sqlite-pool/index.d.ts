import { EventEmitter } from "events";
import BetterSqlite3 = require("better-sqlite3");

export interface PoolConnection extends BetterSqlite3.Database {
    /** Wheter the connection is available and can be acquired. */
    readonly available: boolean;

    /** Releases the connection. */
    release(): void;
}

export interface PoolOptions extends BetterSqlite3.Options {
    /**
     * The number of milliseconds to wait when executing queries on a locked 
     * database, before throwing a SQLITE_BUSY error. Also, this option is used
     * to determine how long it'd be waited before throwing timeout error when 
     * acquiring the connection. (default: 5000).
     */
    timeout?: number;
    /**
     * A function that gets called with every SQL string executed by the 
     * database connection (default: `null`).
     */
    verbose?: (...args: any[]) => any;
    /** Max connections in the pool, default is `5`. */
    max?: number;
}

export class Pool extends EventEmitter implements PoolOptions {
    readonly path: string;
    readonly memory: boolean;
    readonly fileMustExist: boolean;
    readonly timeout: number;
    readonly verbose: Function;
    readonly max: number;
    protected connections: PoolConnection[];

    /**
     * Creates a new pool to store database connections.
     * 
     * @param path A SQLite database file path, can be set to 
     *  `:memory` to open a memory based database.
     * @param options If this argument is set to a boolean, it's equivalent to
     *  `readonly`, if set to a number, it's equivalent to `max`.
     * 
     * @see https://github.com/JoshuaWise/better-sqlite3/wiki/API#new-databasepath-options
     */
    constructor(path: string, options?: number | boolean | PoolOptions);

    /**
     * Acquires a connection from the pool.
     * @see https://github.com/JoshuaWise/better-sqlite3/wiki/API#class-database
     */
    acquire(): Promise<PoolConnection>;

    /**
     * Closes all connections in the pool.
     * @see https://github.com/JoshuaWise/better-sqlite3/wiki/API#close---this
     */
    close(): void;
}

export default Pool;
