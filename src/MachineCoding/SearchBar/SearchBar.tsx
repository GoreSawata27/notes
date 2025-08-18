import { useMemo, useState } from "react";

type option = {
  id: number;
  option: string;
};

interface searchBarProps {
  options: option[];
}
export default function SearchBar({ options }: searchBarProps) {
  const [query, setQuery] = useState<string>("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchVal = e.target.value;
    setQuery(searchVal);
  };

  const FilteredList = useMemo(() => {
    return options.filter(({ option }) => option.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} style={{ color: "red", fontWeight: "bold" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="border-2  p-3">
      <input type="text" className="border-2 " value={query} onChange={handleSearch} />
      <ul>
        {FilteredList.map(({ id, option }) => (
          <li key={id} className="border-b-2">
            {highlightMatch(option, query)}
          </li>
        ))}
      </ul>
    </div>
  );
}
