"use client";

import { useEffect, useState } from "react";

type Post = { id: number; title: string };

export default function CsrFetchDemo() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<Post[]>;
      })
      .then(setPosts)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">Client fetch failed: {error}</p>;
  if (!posts) return <p className="animate-pulse text-zinc-500">Loading on client…</p>;

  return (
    <ul className="list-inside list-disc text-sm">
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
