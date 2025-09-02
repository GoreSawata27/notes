import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export default function TableSearch() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [statusSort, setStatusSort] = useState("");

  const getTodos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/todos");
      setTodos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    const value = query.toLowerCase();
    return todos.filter((todo) => todo.title.toLowerCase().includes(value));
  }, [todos, query]);

  const sortedTodos = useMemo(() => {
    if (statusSort === "") return filteredTodos;

    return filteredTodos.filter((todo) => String(todo.completed) === statusSort);
  }, [filteredTodos, statusSort]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search todos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <select id="filter-by-status" value={statusSort} onChange={(e) => setStatusSort(e.target.value)}>
        <option value="">All</option>
        <option value="true">Completed</option>
        <option value="false">Not Completed</option>
      </select>

      <h2>Todos</h2>

      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>userId</th>
            <th>completed</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3}>Loading...</td>
            </tr>
          ) : (
            sortedTodos.slice(0, 16).map(({ id, title, userId, completed }) => (
              <tr key={id}>
                <td>{title}</td>
                <td>{userId}</td>
                <td>{String(completed)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
