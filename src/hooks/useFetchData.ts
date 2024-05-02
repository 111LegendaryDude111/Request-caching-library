import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const useFetchData = <T>({
  fetchFunction,
}: {
  fetchFunction: () => Promise<T>;
}) => {
  const memoizedFn = useRef(fetchFunction);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setError] = useState<Error | null>(null);
  const [reload, setReload] = useState(false);

  useLayoutEffect(() => {
    memoizedFn.current = fetchFunction;
  }, [fetchFunction]);

  const reloadFetch = useCallback(() => {
    setReload((prev) => !prev);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    memoizedFn
      .current()
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(setError);
  }, [reload]);

  return { data, isLoading, errors, reloadFetch };
};
