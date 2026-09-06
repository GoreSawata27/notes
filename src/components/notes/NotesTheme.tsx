import { IBM_Plex_Mono, Outfit } from "next/font/google";
import "@/app/notes.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-notes-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-notes-mono",
});

export function NotesTheme({ children }: { children: React.ReactNode }) {
  return <div className={`notes-app ${outfit.variable} ${ibmPlexMono.variable} ${outfit.className}`}>{children}</div>;
}
