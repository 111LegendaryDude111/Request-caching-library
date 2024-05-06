import { useState } from "react";
import "./App.css";
import { useFetchData } from "./hooks/useFetchData";

interface Todo {
  completed: false;
  id: number;
  title: string;
  userId: number;
}

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState("");

  return (
    <>
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
    </>
  );
}

export default App;

function TodoView({ indexTodo }: { indexTodo: number }) {
  const fetchTodos = (init?: RequestInit) =>
    fetch(`https://jsonplaceholder.typicode.com/todos/${indexTodo}`, init).then(
      (response) => response.json()
    );

  const { data, reloadFetch, isLoading } = useFetchData<Todo>({
    fetchFunction: fetchTodos,
    nameForCache: "fetchTodos" + indexTodo,
  });
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
