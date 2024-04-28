import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useFetchData } from "./hooks/useFetchData";

interface Todo {
  completed: false;
  id: number;
  title: string;
  userId: number;
}

function App() {
  const fetchFunction = () =>
    fetch("https://jsonplaceholder.typicode.com/todos/1").then((response) =>
      response.json()
    );

  const { data, reloadFetch } = useFetchData<Todo>({ fetchFunction });
  console.log(data);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={reloadFetch}>Reload</button>
      </div>
    </>
  );
}

export default App;
