import Link from "next/link";

export default function NotesNotFound() {
  return (
    <div className="hub-page">
      <h1 className="hub-brand">Notes not found</h1>
      <p className="hub-lede">That topic does not exist. Head back to the hub and pick a card.</p>
      <p className="links">
        <Link href="/">← Hub</Link>
      </p>
    </div>
  );
}
