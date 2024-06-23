import { useEffect, useState } from "react";
import "./App.css";
import { useFetchData } from "./hooks/useFetchData";
import { CacheProvider } from "./hooks/useCreateCache";
import { Status } from "./types";
import { useMutation } from "./hooks/useMutation";
import { QueryCache } from "./constants";
import { useRequestCache } from "./hooks/useRequestCache";

interface Todo {
  completed: false;
  id: number;
  title: string;
  userId: number;
}

const cache = new QueryCache();

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleDelete = (deleteEl: string) => {
    setTodos((prev) => prev.filter((el) => el !== deleteEl));
  };

  return (
    <CacheProvider cache={cache}>
      <div className="App">
        <h1>Vite + React</h1>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="card">
          <button
            onClick={() => {
              const indexValue = input
                ? input
                : `${Math.floor(Math.random() * 100)}`;

              setInput("");

              setTodos((prev) => [...prev, indexValue]);
            }}
          >
            Add New Todo
          </button>
          <div style={{ display: "flex", paddingTop: 50, gap: 10 }}>
            {todos.map((el, i) => {
              return (
                <TodoView
                  indexTodo={parseInt(el)}
                  key={el + i}
                  onDelete={() => handleDelete(el)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </CacheProvider>
  );
}

export default App;

interface TestData {
  userId: number;
  title: string;
  body: string;
}

function TodoView({
  indexTodo,
  onDelete,
}: {
  indexTodo: number;
  onDelete: VoidFunction;
}) {
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
    isError,
    isPending,
    isSuccess,
    error: mutationError,
    data: mutationData,
  } = useMutation<TestData, { ok: boolean }>({
    mutationFn: fetchMutation,
    invalidateQueryKey: ["fetchTodos", indexTodo],
  });

  // console.log("useMutation ======>", {
  //   mutate,
  //   isError,
  //   isPending,
  //   isSuccess,
  //   mutationError,
  //   mutationData,
  // });

  // Validation test

  const cache = useRequestCache();

  useEffect(() => {
    const unsubscribe = cache.onInvalidate(String(indexTodo), () => {
      console.log("test ===>");
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error: name:{error.name} message:{error.message}
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid lightgreen", padding: 10 }}>
      <div>
        Todo:
        <div>id: {data?.id}</div>
        <div>title: {data?.title}</div>
        <div>completed: {`${data?.completed}`}</div>
      </div>
      <div className="card" style={{ display: "flex", gap: 10 }}>
        <button onClick={reloadFetch}>Reload</button>
        <button onClick={fetchNextPage}>fetchNextPage</button>
        <button
          onClick={() => {
            mutate({
              userId: new Date().getSeconds() * (Math.random() * 100),
              title: `indexTodo ===> :${indexTodo}`,
              body: `indexTodo ===> :${indexTodo}`,
            });
          }}
        >
          MUTATION
        </button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
