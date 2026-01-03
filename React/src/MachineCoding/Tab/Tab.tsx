import { useState } from "react";

interface tabData {
  label: string;
  content: string;
}

interface tabProps {
  tabs: tabData[];
}

export default function Tab({ tabs }: tabProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <nav className="flex gap-4">
        {tabs?.map((tab, i) => (
          <li
            className={`border p-4 cursor-pointer ${activeIndex === i ? "text-amber-600" : ""} `}
            onClick={() => setActiveIndex(i)}
            key={i}
          >
            {tab.label}
          </li>
        ))}
      </nav>
      <p className="p-6">{tabs[activeIndex]?.content}</p>
    </>
  );
}
