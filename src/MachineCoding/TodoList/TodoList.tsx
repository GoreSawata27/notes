import { useState } from "react";

interface TodoType {
  id: number;
  todo: string;
}

export default function TodoList() {
  const [todo, setTodo] = useState<string>("");
  const [todoList, setTodoList] = useState<TodoType[]>([]);

  const handleAddTodo = () => {
    if (!todo) return alert("Please add a todo");

    const addTodo = {
      id: Date.now(),
      todo,
    };

    setTodoList((prev) => [addTodo, ...prev]);
    setTodo("");
  };

  return (
    <>
      <div className="flex gap-4">
        <input type="text" className="outline" value={todo} onChange={(e) => setTodo(e.target.value)} />
        <button onClick={handleAddTodo}>Add</button>
      </div>

      <ul>
        {todoList.map((data) => (
          <li key={data.id}>{data.todo}</li>
        ))}
      </ul>
    </>
  );
}
