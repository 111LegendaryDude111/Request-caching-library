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
  // fetching = "fetching",
}

export { Status };
export type { QueryType };
