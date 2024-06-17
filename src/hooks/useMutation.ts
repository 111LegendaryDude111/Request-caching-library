import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CacheData, QueryType, Status } from "../types";
import { useRequestCache } from "./useRequestCache";

interface UseMutationProps<T, Response> {
  mutationFn: (newData: T) => Promise<Response>;
  invalidateQueryKey?: QueryType;
  onSuccess?: () => Promise<unknown> | void;
  onMutate?: () => void;
  onError?: (err?: Error) => void;
}

export const useMutation = <T, Response>({
  mutationFn,
  onSuccess,
  onMutate,
  onError,
  invalidateQueryKey,
}: UseMutationProps<T, Response>) => {
  const updateCacheOnSuccess = useUpdateCache();

  const [data, setData] = useState<Response | null>(null);
  const [status, setStatus] = useState<Status>(Status.init);
  const [error, setError] = useState<undefined | Error>();

  const memoizedMutationFn = useRef(mutationFn);

  const memoizedOnMutate = useRef(onMutate);
  const memoizedOnSuccess = useRef(onSuccess);
  const memoizedOnError = useRef(onError);

  useLayoutEffect(() => {
    //mutation fn
    memoizedMutationFn.current = mutationFn;
    // onSuccess
    memoizedOnSuccess.current = onSuccess;
    //onMutate
    memoizedOnMutate.current = onMutate;
    //onError
    memoizedOnError.current = onError;
  }, [mutationFn, onSuccess, onMutate, onError]);

  const mutate = useCallback(
    (newData: T) => {
      setStatus(Status.loading);

      //onMutate
      memoizedOnMutate.current?.();

      //mutation fn
      memoizedMutationFn
        .current(newData)
        .then(async (data) => {
          setStatus(Status.success);

          setData(data);

          if (invalidateQueryKey && invalidateQueryKey?.length > 0) {
            await updateCacheOnSuccess({ cacheKeys: invalidateQueryKey });
          }

          //for success fn
          await memoizedOnSuccess.current?.();
        })
        .catch((error?: Error) => {
          setError(error);
          setStatus(Status.error);

          memoizedOnError.current?.(error);
        });
    },
    [invalidateQueryKey, updateCacheOnSuccess]
  );

  const isError = status === Status.error;
  const isPending = status === Status.loading;
  const isSuccess = status === Status.success;

  return { mutate, isSuccess, isError, isPending, data, error };
};

interface UseUpdateCache {
  cacheKeys: QueryType;
}

function useUpdateCache() {
  const cache = useRequestCache();

  return useMemo(
    () =>
      async ({ cacheKeys }: UseUpdateCache) => {
        try {
          const cacheKey = JSON.stringify(cacheKeys);
          const dataFromCache: CacheData<unknown> = cache.get(cacheKey);
          if (!dataFromCache) return;

          const { fetchDataCallback, pageParams } = dataFromCache;
          const resp = await fetchDataCallback({ pageParams });

          cache.set(cacheKey, { ...dataFromCache, data: resp });
        } catch (err: unknown) {
          throw Error(err as string);
        }
      },
    [cache]
  );
}
