import { NotesTheme } from "@/components/notes/NotesTheme";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <NotesTheme>{children}</NotesTheme>;
}
