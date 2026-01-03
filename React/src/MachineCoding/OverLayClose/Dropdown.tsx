import { useRef, useState } from "react";

export default function Dropdown({ options = ["One", "Two", "Three"] }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  const handleWrapperClick = (e: React.MouseEvent) => {
    if (open && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  return (
    <div
      className="border h-screen w-screen flex justify-center items-center flex-col"
      onClick={handleWrapperClick}
    >
      <button onClick={() => setOpen((prev) => !prev)}>Choose an option</button>
      {open && (
        <ul ref={dropdownRef} className="border w-52 mt-1">
          {options.map((opt, idx) => (
            <li key={idx}>{opt}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
