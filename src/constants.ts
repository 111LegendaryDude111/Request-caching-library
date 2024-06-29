interface IQueryCache {
  cacheData: Map<string, unknown>;
  invalidateCallbacks: Map<string, (args: unknown) => void>;

  getEntry: (key: string) => unknown;
  setEntry: (key: string, value: unknown) => void;

  invalidate: (keys: string[]) => void;

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

  //   TODO
  async invalidate(keys: string[]) {
    for (const iterator of this.invalidateCallbacks.entries()) {
      const [key, cb] = iterator;

      if (keys.includes(key)) {
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
