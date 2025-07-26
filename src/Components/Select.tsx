import { useState, type ChangeEvent } from "react";

export default function Select() {
  const [val, setVal] = useState("");

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setVal(e.target.value);
  };

  return (
    <select value={val} onChange={handleChange} id="selectBox">
      <option value="" disabled>
        Select an option
      </option>
      <option value="one">One</option>
      <option value="two">Two</option>
      <option value="three">Three</option>
    </select>
  );
}
