import { useState } from "react";

const AccordionData = [
  { id: 1, title: "One", description: "One Info" },
  { id: 2, title: "Two", description: "Two Info" },
  { id: 3, title: "Three", description: "Three Info" },
  { id: 4, title: "Four", description: "Four Info" },
];

export default function Accordion() {
  const [currentId, setCurrentId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setCurrentId((prev) => (prev === id ? null : id));
  };

  return (
    <ul>
      {AccordionData.map((data) => (
        <li key={data.id} className="mb-2 border p-2 rounded">
          <div className="flex justify-between items-center">
            <span>{data.title}</span>
            <button onClick={() => toggle(data.id)} className="text-blue-600">
              {currentId === data.id ? "Close" : "Open"}
            </button>
          </div>
          {currentId === data.id && <p className="mt-2 text-gray-600">{data.description}</p>}
        </li>
      ))}
    </ul>
  );
}
