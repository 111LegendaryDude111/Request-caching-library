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
      .catch(async (err) => {
        if (err instanceof DOMException) {
          return Promise.reject(err);
        }

        if (attempts < 1) {
          reject(err);
        }

        //retryTimeout
        if (retryTimeout) {
          setTimeout(async () => {
            try {
              await retryFetch(attempts - 1, fn, retryTimeout);
            } catch (err) {
              reject(err);
            }
          }, retryTimeout);

          return;
        } else {
          try {
            await retryFetch(attempts - 1, fn, retryTimeout);
          } catch (err) {
            reject(err);
          }
        }
      });
  });
}
