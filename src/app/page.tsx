import type { Metadata } from "next";
import { NotesHub } from "@/components/notes/NotesHub";
import { NotesTheme } from "@/components/notes/NotesTheme";
import { getHubData } from "@/lib/notes/load-notes";

export const metadata: Metadata = {
  title: {
    default: "Interview Notes",
    template: "%s | Interview Notes",
  },
  description: "Frontend interview Q&A, JS cheatsheets, and live practice",
};

export default function HomePage() {
  const data = getHubData();
  return (
    <NotesTheme>
      <NotesHub {...data} />
    </NotesTheme>
  );
}
