import { QueryType } from "./types";

interface IQueryCache {
  cacheData: Map<string, unknown>;
  invalidateCallbacks: Map<string, (args: unknown) => void>;

  getEntry: (key: string) => unknown;
  setEntry: (key: string, value: unknown) => void;

  invalidate: (keys: QueryType[]) => void;

  onInvalidate: (key: string, cb: (args: unknown) => void) => void;
}

export class QueryCache implements IQueryCache {
  cacheData = new Map();
  invalidateCallbacks = new Map();

  getEntry(key: string) {
    return this.cacheData.get(key);
  }

  setEntry(key: string, value: unknown) {
    this.cacheData.set(key, value);
  }

  async invalidate(keys: QueryType) {
    const serializeKeys = JSON.stringify(keys);

    for (const iterator of this.invalidateCallbacks.entries()) {
      const [key, cb] = iterator;

      if (serializeKeys.includes(key)) {
        await cb();
      }
    }
  }
  onInvalidate(key: string, cb: (args: unknown) => void) {
    this.invalidateCallbacks.set(key, cb);

    return () => {
      this.invalidateCallbacks.delete(key);
    };
  }

  get queryCache() {
    return this.cacheData;
  }
}
