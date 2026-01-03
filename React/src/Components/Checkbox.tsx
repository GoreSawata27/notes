import { useState } from "react";

const OPTIONS = ["React", "Vue", "Angular", "Svelte"];

export default function CheckboxGroup() {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleSubmit = () => {
    console.log(selected, "selected ");
  };

  return (
    <div>
      {OPTIONS.map((option) => (
        <label key={option} className="block">
          <input
            type="checkbox"
            value={option}
            checked={selected.includes(option)}
            onChange={() => handleChange(option)}
          />
          <span className="ml-2">{option}</span>
        </label>
      ))}

      <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Submit
      </button>
    </div>
  );
}
