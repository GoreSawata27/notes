import { useState, type ChangeEvent } from "react";

const options = ["One", "Two", "Three", "Four"];

export default function Radiobox() {
  const [selected, setSelected] = useState<string>("");

  const handelChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.value);

    console.log(selected, "selected");
  };

  return (
    <div>
      {options.map((option) => (
        <label key={option} htmlFor={option} className="block">
          <input type="radio" name="numbers" id={option} value={option} onChange={handelChange} />
          <span className="ml-2">{option}</span>
        </label>
      ))}
    </div>
  );
}
