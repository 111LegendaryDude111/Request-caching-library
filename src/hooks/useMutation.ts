import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Status } from "../types";

interface UseMutationProps<T, Response> {
  mutationFn: (newData: T) => Promise<Response>;
  // queryKey?: QueryType;
  onSuccess?: () => Promise<unknown> | void;
  onMutate?: () => void;
  onError?: (err?: Error) => void;
}

export const useMutation = <T, Response>({
  mutationFn,
  onSuccess,
  onMutate,
  onError,
}: UseMutationProps<T, Response>) => {
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

  const mutate = useCallback((newData: T) => {
    setStatus(Status.loading);

    //onMutate
    memoizedOnMutate.current?.();

    //mutation fn
    memoizedMutationFn
      .current(newData)
      .then(async (data) => {
        setStatus(Status.success);

        setData(data);

        await memoizedOnSuccess.current?.();
      })
      .catch((error?: Error) => {
        setError(error);
        setStatus(Status.error);

        memoizedOnError.current?.(error);
      });
  }, []);

  const isError = status === Status.error;
  const isPending = status === Status.loading;
  const isSuccess = status === Status.success;

  return { mutate, isSuccess, isError, isPending, data, error };
};
