import { useState } from "react";

interface ITodo {
  id: number;
  value: string;
}

export default function Traffic() {
  const [todo, setTodo] = useState("");
  const [todoList, setTodoList] = useState<ITodo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const addTodo = () => {
    if (!todo) return;

    const newTodo = {
      id: Math.random() * 10,
      value: todo,
    };

    setTodoList((prev) => [newTodo, ...prev]);
    setTodo("");
  };

  const deleteTodo = (id: number) => {
    const filter = todoList.filter((list) => list.id !== id);
    setTodoList(filter);
  };

  const editTodo = (id: number) => {
    setIsEditing(true);
    setEditId(id);

    const findTodo = todoList.find((list) => list.id === id);
    if (!findTodo) return;
    setTodo(findTodo.value);
  };

  const updateTodo = () => {
    if (!todo || editId === null) return;

    const updateList = todoList.map((list) => (list.id === editId ? { ...list, value: todo } : list));
    setTodoList(updateList);
    setTodo("");
    setEditId(null);
    setIsEditing(false);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Enter a todo"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <button onClick={isEditing ? updateTodo : addTodo}>{isEditing ? "Update" : "Add"} </button>
      </div>
      <h2>----------List------------- </h2>

      <ul>
        {todoList.map(({ id, value }) => (
          <li key={id}>
            <span>{value}</span>
            <button onClick={() => editTodo(id)}>Edit</button>
            <button onClick={() => deleteTodo(id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
