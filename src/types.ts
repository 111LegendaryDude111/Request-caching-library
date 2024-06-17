type QueryType = (
  | string
  | number
  | boolean
  | null
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Record<string, any>
)[];

enum Status {
  init = "init",
  loading = "loading",
  success = "success",
  error = "error",
}

interface CacheData<T> {
  data: T;
  fetchDataCallback: (args: unknown) => Promise<T>;
  pageParams: number;
}

export { Status };
export type { QueryType, CacheData };
