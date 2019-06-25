"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const EventEmitter = require("events").EventEmitter;
const BetterSqlite3 = require("better-sqlite3");
const pick = require("lodash/pick");

/**
 * A connection pool for the module `better-sqlite3`.
 * 
 * Using this module to open pools and acquire connections, and `release` the 
 * connection once it has done its work.
 */
class Pool extends EventEmitter {
    /**
     * Creates a new pool to store database connections.
     * 
     * @param {string} path A SQLite database file path, can be set to 
     *  `:memory` to open a memory based database.
     * @param {object|boolean|number} options May contain any of these:
     *  - `readonly` Default is `false`.
     *  - `memory` Default is `false`.
     *  - `fileMustExist` Default is `false`.
     *  - `max` Max connections in the pool, default is `5`.
     *  - `timeout`
     *  - `verbose`
     * 
     *  If this argument is set to a boolean, it's equivalent to `readonly`, 
     *  if set to a number, it's equivalent to `max`.
     * 
     * @see https://github.com/JoshuaWise/better-sqlite3/wiki/API#new-databasepath-options
     */
    constructor(path, options) {
        super();

        if (options === undefined || options === null) {
            options = {};
        } else if (typeof options === "boolean") {
            options = { readonly: options };
        } else if (typeof options === "number") {
            options = { max: options };
        }

        this.path = path;
        /** @type {BetterSqlite3.Database[]} */
        this.connections = [];
        Object.assign(this, {
            readonly: false,
            memory: path === ":memory",
            fileMustExist: false,
            timeout: 5000,
            verbose: null,
            max: 5
        }, options);
    }

    /**
     * Acquires a connection from the pool.
     * @see https://github.com/JoshuaWise/better-sqlite3/wiki/API#class-database
     * @returns {Promise<BetterSqlite3.Database>} 
     */
    acquire() {
        for (let conn of this.connections) {
            if (conn.available && conn.open) {
                conn.available = false;

                return Promise.resolve(conn);
            }
        }


        if (this.connections.length < this.max) {
            let conn = new BetterSqlite3(this.path, pick(this, [
                "memory",
                "readonly",
                "fileMustExist",
                "timeout",
                "verbose"
            ]));

            this.connections.push(conn);
            conn.available = false;
            conn.release = () => {
                if (conn.open && conn.inTransaction)
                    conn.exec("rollback");

                conn.available = conn.open && true;
                this.emit("release");
            };

            return Promise.resolve(conn);
        } else {
            return new Promise((resolve, reject) => {
                let handler = () => {
                    clearTimeout(timer);
                    resolve(this.acquire());
                };
                let timer = setTimeout(() => {
                    this.removeListener("release", handler);
                    reject(new Error("Timeout to acquire the connection."));
                }, this.timeout);

                this.once("release", handler);
            });
        }
    }

    /**
     * Closes all connections in the pool.
     * @see https://github.com/JoshuaWise/better-sqlite3/wiki/API#close---this
     */
    close() {
        for (let id in this.connections) {
            if (this.connections[id].open)
                this.connections[id].close();
        }
    }
}
exports.default = exports.Pool = Pool;
