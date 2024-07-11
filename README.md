npm i

npm run dev

API

const cache = useRequestCache();

```jsx
  //Fetch fn
  const fetchTodos = (props: Pick<RequestInit, "signal">) => {
    return fetch(`https://jsonplaceholder.typicode.com/todos/${indexTodo}`, {
      signal: props.signal,
    }).then((response) => {
      if (response.status > 400) {
        throw new Error(`${response.status}`);
      }
      return response.json();
    });
  };

  //useFetchData

  const { data, reloadFetch, status, fetchNextPage, error } =
    useFetchData<Todo>({
      fetchFunction: fetchTodos,
      queryKey: ["fetchTodos", indexTodo],
      getNextPage: () => {
        return 2;
      },
      retry: 3,
      retryTimeout: 1_000,
    });

  const isLoading = status === Status.loading;

  //useMutation

  const fetchMutation = (data: TestData) => {
    return fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        data,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((response) => {
      if (response.status > 400) {
        throw new Error(String(response.status));
      }

      return response.json();
    });
  };

  const {
    mutate,
    // isError,
    // isPending,
    // isSuccess,
    // error: mutationError,
    // data: mutationData,
  } = useMutation<TestData, { ok: boolean }>({
    mutationFn: fetchMutation,
    onSuccess: () => {
      cache.invalidate(["fetchTodos", indexTodo]);
    },
  });
```
