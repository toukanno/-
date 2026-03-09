declare module 'better-sqlite3' {
  type RunResult = {
    changes: number;
    lastInsertRowid: number | bigint;
  };

  type Statement = {
    run: (...params: Array<string | number>) => RunResult;
    all: () => unknown[];
  };

  class Database {
    constructor(filename: string);
    exec(sql: string): this;
    prepare(sql: string): Statement;
    close(): void;
  }

  export = Database;
}
