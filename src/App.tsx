import { useState } from "react";
import "./App.css";
import { Status, useFetchData } from "./hooks/useFetchData";
import { CacheProvider } from "./hooks/useCreateCache";

interface Todo {
  completed: false;
  id: number;
  title: string;
  userId: number;
}

const cache = new Map();
// export const CacheProvider = createContext(cache);

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState("");

  return (
    <CacheProvider initialValue={cache}>
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
  const fetchTodos = (init?: AbortSignal | null) =>
    fetch(`https://jsonplaceholder.typicode.com/todos/${indexTodo}`, {
      signal: init,
    }).then((response) => response.json());

  const { data, reloadFetch, status } = useFetchData<Todo>({
    fetchFunction: fetchTodos,
    queryKey: ["fetchTodos", indexTodo],
  });

  const isLoading = status === Status.loading;

  // console.log(data);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ border: "1px solid lightgreen", padding: 10 }}>
      <div>
        Todo:
        <div>id: {data?.id}</div>
        <div>title: {data?.title}</div>
        <div>completed: {data?.completed}</div>
      </div>
      <div className="card">
        <button onClick={reloadFetch}>Reload</button>
      </div>
    </div>
  );
}
