import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Status } from "../types";

interface UseMutationProps<T, Response> {
  mutationFn: (newData: T) => Promise<Response>;
}

export const useMutation = <T, Response>({
  mutationFn,
}: UseMutationProps<T, Response>) => {
  const [data, setData] = useState<Response | null>(null);
  const [status, setStatus] = useState<Status>(Status.init);
  const [error, setError] = useState<undefined | Error>();

  const memoizedMutationFn = useRef(mutationFn);

  useLayoutEffect(() => {
    memoizedMutationFn.current = mutationFn;
  }, [mutationFn]);

  const mutate = useCallback((newData: T) => {
    setStatus(Status.loading);

    memoizedMutationFn
      .current(newData)
      .then((data) => {
        setStatus(Status.success);

        setData(data);
      })
      .catch((error?: Error) => {
        setError(error);
        setStatus(Status.error);
      });
  }, []);

  const isError = status === Status.error;
  const isPending = status === Status.loading;
  const isSuccess = status === Status.success;

  return { mutate, isSuccess, isError, isPending, data, error };
};
