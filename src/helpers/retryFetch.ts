export async function retryFetch<T>(
  attempts: number | undefined = 1,
  fn: () => Promise<T>,
  retryTimeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    fn()
      .then((resp) => {
        if (resp instanceof Error && resp.name === "AbortError") {
          return;
        }

        if (resp instanceof Error) {
          throw new Error(resp.message);
        }

        resolve(resp);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }

        console.log({ attempts });
        if (attempts > 1) {
          //retryTimeout
          if (retryTimeout) {
            setTimeout(() => {
              retryFetch(attempts - 1, fn, retryTimeout)
                .then((resp) => {
                  resolve(resp);
                })
                .catch((err) => reject(err));
            }, retryTimeout);
            return;
          } else {
            retryFetch(attempts - 1, fn, retryTimeout)
              .then((resp) => {
                resolve(resp);
              })
              .catch((err) => reject(err));
            return;
          }
        }

        reject(err);
      });
  });
}
