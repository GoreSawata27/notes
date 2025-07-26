import { useEffect, useState } from "react";

export default function Select() {
  const [val, setVal] = useState("");

  useEffect(() => {
    console.log(val, "Current selected value");
  }, [val]);

  return (
    <select value={val} onChange={(e) => setVal(e.target.value)} id="selectBox">
      <option value="" disabled>
        Select a option
      </option>
      <option value="one">One</option>
      <option value="two">Two</option>
      <option value="three">Three</option>
    </select>
  );
}
