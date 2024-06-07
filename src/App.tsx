import { useState } from "react";
import "./App.css";
import { useFetchData } from "./hooks/useFetchData";
import { CacheProvider } from "./hooks/useCreateCache";
import { Status } from "./types";

interface Todo {
  completed: false;
  id: number;
  title: string;
  userId: number;
}

const cache = new Map();

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState("");

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
              return <TodoView indexTodo={parseInt(el)} key={el + i} />;
            })}
          </div>
        </div>
      </div>
    </CacheProvider>
  );
}

export default App;

function TodoView({ indexTodo }: { indexTodo: number }) {
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

  const { data, reloadFetch, status, fetchNextPage, error } =
    useFetchData<Todo>({
      fetchFunction: fetchTodos,
      queryKey: ["fetchTodos", indexTodo],
      getNextPage: () => {
        return 2;
      },
      retry: 3,
    });

  const isLoading = status === Status.loading;

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
      </div>
    </div>
  );
}
