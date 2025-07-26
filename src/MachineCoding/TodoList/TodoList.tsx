import { useEffect, useState } from "react";

interface TodoType {
  id: number;
  todo: string;
}

export default function TodoList() {
  const [todo, setTodo] = useState<string>("");
  const [todoList, setTodoList] = useState<TodoType[]>(() => {
    const getStoredData = localStorage.getItem("todoList");
    return getStoredData ? JSON.parse(getStoredData) : [];
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleAddTodo = () => {
    if (!todo) return alert("Please add a todo");

    if (isEditing && editId !== null) {
      setTodoList((prev) => prev.map((item) => (item.id === editId ? { ...item, todo } : item)));
      setIsEditing(false);
      setEditId(null);
    } else {
      const addTodo = {
        id: Date.now(),
        todo,
      };

      setTodoList((prev) => [addTodo, ...prev]);
    }
    setTodo("");
  };

  const handelDelete = (id: number) => {
    const filterOutId = todoList.filter((todos) => todos.id !== id);
    setTodoList(filterOutId);
  };

  const handelEdit = (id: number) => {
    setIsEditing(true);
    const getData = todoList.find((todos) => todos.id === id);
    if (!getData) return;

    setEditId(id);
    setTodo(getData.todo);
  };

  useEffect(() => {
    localStorage.setItem("todoList", JSON.stringify(todoList));
  }, [todoList]);

  useEffect(() => {
    const getStoredData = localStorage.getItem("todoList");
    if (getStoredData) {
      try {
        const parsed = JSON.parse(getStoredData);
        if (Array.isArray(parsed)) {
          setTodoList(parsed);
        }
      } catch (err) {
        console.error("Failed to parse localStorage data:", err);
      }
    }
  }, []);

  return (
    <>
      <div className="flex gap-4">
        <input
          type="text"
          className="outline"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTodo();
          }}
          autoFocus
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <button onClick={handleAddTodo}>{isEditing ? "Update" : "Add"}</button>
      </div>

      <ul className="flex flex-col gap-4 ">
        {todoList.map((data) => (
          <li key={data.id} className="flex gap-10">
            <span>{data.todo}</span>
            <span className="px-5">
              <button className="p-2 outline" onClick={() => handelEdit(data.id)}>
                Edit
              </button>
              <button className="p-2 outline" onClick={() => handelDelete(data.id)}>
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
