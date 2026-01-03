import { useState } from "react";

interface AccordionItem {
  id: number;
  title: string;
  description: string;
}

interface AccordionProps {
  list: AccordionItem[];
}

export default function Accordion({ list }: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    setActiveIndex((prev) => (prev === id ? null : id));
  };

  return (
    <ul className="flex flex-col w-90 rounded-md overflow-hidden shadow border border-gray-300 bg-white">
      {list.map((item) => {
        const isActive = activeIndex === item.id;
        return (
          <li key={item.id} className="border-b last:border-b-0  px-4">
            <button
              onClick={() => toggleAccordion(item.id)}
              className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-blue-100 transition-colors"
            >
              <span className="font-medium text-gray-800">{item.title}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  isActive ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isActive ? "max-h-40 opacity-100 py-2 px-4" : "max-h-0 opacity-0 px-4"
              } text-sm text-gray-600`}
            >
              {item.description}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
