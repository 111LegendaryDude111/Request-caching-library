export async function retryFetch<T>(
  attempts: number | undefined = 1,
  fn: () => Promise<T>,
  retryTimeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn()
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }

        if (attempts > 1) {
          //retryTimeout
          if (retryTimeout) {
            setTimeout(() => {
              retryFetch(attempts - 1, fn, retryTimeout);
            }, retryTimeout);
          } else {
            retryFetch(attempts - 1, fn, retryTimeout);
          }

          return;
        }

        reject(err);
      });
  });
}
