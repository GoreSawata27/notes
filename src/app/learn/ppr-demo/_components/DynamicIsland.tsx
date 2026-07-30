async function DynamicIsland() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "no-store",
  });
  const todo = (await res.json()) as { id: number; title: string };
  return (
    <p className="text-sm">
      Dynamic island (fresh fetch): #{todo.id} — {todo.title}
    </p>
  );
}

export default DynamicIsland;
